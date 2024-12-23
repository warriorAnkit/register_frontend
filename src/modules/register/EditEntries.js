/* eslint-disable no-restricted-globals */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-undef */
/* eslint-disable no-alert */
/* eslint-disable no-console */
import {
  DeleteOutlined,
  DownOutlined,
  UploadOutlined,
  FileImageOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';
import {
  Button,
  Card,
  Checkbox,
  Dropdown,
  Form,
  Input,
  Menu,
  Modal,
  notification,
  Select,
  Table,
} from 'antd';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { evaluate } from 'mathjs';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { utils, writeFile } from 'xlsx';
import { ROUTES } from '../../common/constants';
import useFetchUserFullName from '../../hooks/useFetchUserNames';
import ImageUpload from './components/AttachmentUpload';
import Header from './components/Header';
import { EDIT_RESPONSE_MUTATION } from './graphql/Mutation';
import {
  GET_ALL_RESPONSES_FOR_SET,
  GET_TEMPLATE_BY_ID,
} from './graphql/Queries';
import './headerButton.less';
import './register.less';

const { TextArea } = Input;

const EditEntry = () => {
  const [tableData, setTableData] = useState([]);
  const [setData, setSetData] = useState({});
  const [openedIndex, setOpenedIndex] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [propertyErrors, setPropertyErrors] = useState({});
  const [propertiesData, setPropertiesData] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const navigate = useNavigate();
  const [tableHeight, setTableHeight] = useState('100vh'); // Default height

  useEffect(() => {
    const updateTableHeight = () => {
      const offset = 300; // Adjust based on header, padding, or other elements
      const availableHeight = window.innerHeight - offset;
      setTableHeight(availableHeight > 0 ? availableHeight : 0); // Ensure non-negative height
    };

    updateTableHeight(); // Initial calculation
    window.addEventListener('resize', updateTableHeight); // Recalculate on resize

    return () => {
      window.removeEventListener('resize', updateTableHeight); // Cleanup listener
    };
  }, []);
  const fetchUserNames = useFetchUserFullName();
  const { templateId, setId } = useParams();

  const {
    data: templateData,
    loading: templateLoading,
    error: templateError,
  } = useQuery(GET_TEMPLATE_BY_ID, {
    variables: { id: templateId },
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: responseData,
    loading: responseLoading,
    error: responseError,
  } = useQuery(GET_ALL_RESPONSES_FOR_SET, {
    variables: { setId },
    fetchPolicy: 'cache-and-network',
  });

  const [editResponse] = useMutation(EDIT_RESPONSE_MUTATION);

  const getPropertyById = (propertyId, properties) => {
    const property = properties.find((prop) => prop.id === propertyId);
    return property ? property.propertyName : null;
  };
  useEffect(() => {
    if (templateData) {
      setTableData([]);
      const initialProperties = {};

      // Initialize all properties with an empty string or '-' if no response is available
      templateData.getTemplateById?.properties.forEach((property) => {
        initialProperties[property.propertyName] = ''; // Default value for properties without a response
      });

      setPropertiesData(initialProperties);
    }

    if (responseData) {
      const { setDetails } = responseData.getAllResponsesForSet;

      // Set the set data including createdBy ID
      const fetchCreatedByName = async () => {
        if (setDetails?.createdBy) {
          const fullName = await fetchUserNames(setDetails.createdBy); // Fetch the full name by ID
          const updatedName = await fetchUserNames(setDetails.updatedBy);
          // Directly set the createdBy with the fetched name
          setSetData((prevState) => ({
            ...prevState,
            createdBy: fullName || 'Unknown User',
            createdById: setDetails.createdBy, // Optionally store the ID
            createdAt: setDetails?.createdAt,
            updatedBy: updatedName,
            updatedAt: setDetails?.updatedAt,
            id: setDetails?.id,
          }));
        }
      };
      fetchCreatedByName();

      const flattenedFieldResponses = responseData.getAllResponsesForSet.fieldResponses.flat();

      const existingData = flattenedFieldResponses.reduce((acc, response) => {
        const row = acc.find((r) => r.rowNumber === response.rowNumber);
        if (row) {
          row[response.fieldId] = {
            value: response.value,
            responseId: response.id,
          };
        } else {
          acc.push({
            rowNumber: response.rowNumber,
            [response.fieldId]: {
              value: response.value,
              responseId: response.id,
            },
          });
        }
        return acc;
      }, []);
      existingData.push({});
      setTableData(existingData);

      const existingProperties = {};
      responseData.getAllResponsesForSet.propertyResponses?.forEach(
        (propertyResponse) => {
          const propertyName = getPropertyById(
            propertyResponse.propertyId,
            templateData.getTemplateById?.properties,
          );
          existingProperties[propertyName] = propertyResponse.value;
        },
      );

      // Ensure that all properties are accounted for, even if no response is found
      templateData.getTemplateById?.properties.forEach((property) => {
        if (!(property.propertyName in existingProperties)) {
          existingProperties[property.propertyName] = ''; // Assign default value if no response exists
        }
      });

      setPropertiesData(existingProperties);
    }
  }, [templateData, responseData]);

  const finalValidateFields = () => {
    const errors = {};
    tableData.forEach((row, rowIndex) => {
      const isLastRow = rowIndex === tableData.length - 1;
      // const isRowBlank = templateData.getTemplateById?.fields.every(
      //   (field) => !row[field.id]?.value || row[field.id].value.trim() === '',
      // );
      const isRowBlank =templateData.getTemplateById?.fields.every((field) => {
        const value = row[field.fieldName];
        return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
      });
      console.log(`Row ${rowIndex} is blank:`, isRowBlank);
      if (isLastRow && isRowBlank) return;

      templateData.getTemplateById?.fields.forEach((field) => {
        const { value } = row[field.id] || {};
        if (
          field.isRequired &&
          (!value ||
            (typeof value === 'string' && value.trim() === '') ||
            (Array.isArray(value) && value.length === 0))
        ) {
          errors[`${field.id}-${rowIndex}`] = 'This field is required.';
        }

        if (field.fieldType === 'TEXT' && value?.length > 100) {
          errors[`${field.id}-${rowIndex}`] =
            'Text must be less than 100 characters.';
        }
        // eslint-disable-next-line no-restricted-globals
        if (
          field.fieldType === 'NUMERIC' &&
          (value === undefined || value === null || isNaN(Number(value)))
        ) {
          errors[`${field.id}-${rowIndex}`] = 'Value must be a valid number.';
        }
      });
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };
  const finalValidateProperties = () => {
    const errors = {};
    templateData?.getTemplateById?.properties.forEach((property) => {
      const value = propertiesData[property.propertyName];

      if (
        property.isRequired &&
        (!value ||
          (typeof value === 'string' && value.trim() === '') ||
          (Array.isArray(value) && value.length === 0))
      ) {
        errors[property.propertyName] = 'This field is required.';
      }

      if (property.propertyFieldType === 'TEXT' && value?.length > 100) {
        errors[property.propertyName] = 'Text must be less than 100 characters';
      }

      if (
        property.propertyFieldType === 'MULTI_LINE_TEXT' &&
        value?.length > 750
      ) {
        errors[property.propertyName] = 'Text must be less than 750 characters';
      }

      // eslint-disable-next-line no-restricted-globals
      if (property.propertyFieldType === 'NUMERIC' && isNaN(value)) {
        errors[property.propertyName] = 'Value must be a valid number';
      }
    });

    setPropertyErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };
  const handleCsvExport = () => {
    // Prepare the data for export
    const templateName =
      templateData?.getTemplateById?.name || 'Unknown Template';
    const projectId =
      templateData?.getTemplateById?.projectId || 'Unknown Project';
    const properties = propertiesData;

    // Get additional details like created and updated information
    const setCreatedBy = setData?.createdBy || 'Unknown User';
    const setCreatedAt = setData?.createdAt
      ? moment(Number(setData.createdAt))
          .tz('Asia/Kolkata')
          .format('DD/MM/YYYY HH:mm')
      : 'N/A';
    const setUpdatedBy = setData?.updatedBy || 'N/A';
    const setUpdatedAt = setData?.updatedAt
      ? moment(Number(setData.updatedAt))
          .tz('Asia/Kolkata')
          .format('DD/MM/YYYY HH:mm')
      : 'N/A';

    // Prepare the table data with property names and values
    const exportData = tableData.map((row) => {
      const rowData = {};

      rowData['Register Name'] = templateName;
      rowData['Project ID'] = projectId;

      // Add additional information

      // Add property names and values to the row
      Object.entries(properties).forEach(([propertyName, propertyValue]) => {
        rowData[propertyName] = propertyValue;
      });

      // Add field names and values to the row
      templateData?.getTemplateById?.fields.forEach((field) => {
        const fieldId = field.id;
        rowData[field.fieldName] = row[fieldId]?.value || '-';
      });
      rowData['Created By'] = setCreatedBy;
      rowData['Created At'] = setCreatedAt;
      rowData['Last Updated By'] = setUpdatedBy;
      rowData['Last Updated At'] = setUpdatedAt;

      return rowData;
    });

    // Convert the data to a worksheet
    const ws = utils.json_to_sheet(exportData);

    // Convert the worksheet to a workbook
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Template Data');

    // Export the CSV file
    const filename = `${templateName}_${projectId}_${setCreatedAt}.csv`;
    writeFile(wb, filename);
  };

  const handlePdfExport = () => {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();
    const templateName =
      templateData?.getTemplateById?.name || 'Unknown Template';
    const projectId =
      templateData?.getTemplateById?.projectId || 'Unknown Project';
    const properties = propertiesData;

    // Set details
    const setCreatedBy = setData?.createdBy || 'Unknown User';
    const setCreatedAt = setData?.createdAt
      ? moment(Number(setData.createdAt))
          .tz('Asia/Kolkata')
          .format('DD/MM/YYYY HH:mm')
      : 'N/A';
    const setUpdatedBy = setData?.updatedBy || 'N/A';
    const setUpdatedAt = setData?.updatedAt
      ? moment(Number(setData.updatedAt))
          .tz('Asia/Kolkata')
          .format('DD/MM/YYYY HH:mm')
      : 'N/A';

    // Header logos
    const headerLogo = 'https://i.imgur.com/ag6OZGW.png'; // Replace with actual logo URL if necessary
    const footerLogo = 'https://i.imgur.com/ag6OZGW.png'; // Replace with actual logo URL if necessary
    const footerText = 'Digitize.Monitor.Improve';

    // Add header logos
    doc.addImage(headerLogo, 'PNG', 10, 5, 30, 10); // Left logo
    doc.addImage(
      headerLogo,
      'PNG',
      doc.internal.pageSize.width - 40,
      5,
      30,
      10,
    ); // Right logo

    // Header content
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    // doc.text(`${projectId}`, doc.internal.pageSize.width / 2, 20, { align: 'center' });

    // Add set details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const setDetailsContent = `
      ProjectId:${projectId}
      Template Name: ${templateName}
      Created By: ${setCreatedBy}
      Created At: ${setCreatedAt}
      Updated By: ${setUpdatedBy}
      Updated At: ${setUpdatedAt}
    `;

    const propertiesContent = `
      ${Object.entries(properties)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')}
    `;

    const startY = 30; // Position below the header
    const contentLines = doc.splitTextToSize(
      `${setDetailsContent}\n${propertiesContent}`,
      doc.internal.pageSize.width - 20,
    );
    doc.text(contentLines, 10, startY);

    // Prepare table data
    const tableDatas = tableData.map((row) =>
      templateData?.getTemplateById?.fields.map((field) => {
        const fieldId = field.id;
        const fieldValue = row[fieldId]?.value;

        // if (field.fieldType === 'ATTACHMENT') {
        //   return fieldValue
        //     ? fieldValue.split(',').map((fileName) => {
        //         const fileUrl = `https://storage.googleapis.com/digiqc_register/${fileName}`;
        //         return (
        //           <div
        //             key={fileName}
        //             style={{ position: 'relative', display: 'inline-block', margin: '8px' }}
        //           >
        //             <FileImageOutlined style={{ fontSize: 16, color: '#1890ff' }} />
        //             <div>
        //               <a
        //                 href={fileUrl}
        //                 target="_blank"
        //                 rel="noopener noreferrer"
        //                 style={{ textDecoration: 'none', color: 'inherit' }}
        //               >
        //                 Open File
        //               </a>
        //             </div>
        //           </div>
        //         );
        //       })
        //     : '-';
        // }
        return fieldValue || '-';
      }),
    );

    // Table columns
    const columns = templateData?.getTemplateById?.fields.map((field) => ({
      title: field.fieldName,
      dataKey: field.fieldName,
    }));
    const headers = columns.map((col) => col.title);

    // Add table
    doc.autoTable({
      head: [headers],
      body: tableDatas,
      startY: startY + contentLines.length * 5,
      theme: 'striped',
      margin: { bottom: 50 },
      pageBreak: 'auto',
      didDrawPage: (data) => {
        const currentPageHeight = doc.internal.pageSize.height;
        const footerY = currentPageHeight - 8;

        // Footer logos and text
        doc.addImage(footerLogo, 'PNG', 10, footerY - 10, 30, 10);
        const textWidth = doc.getTextWidth(footerText);
        doc.text(
          footerText,
          (doc.internal.pageSize.width - textWidth) / 2,
          footerY - 5,
        );

        // Page number
        const pageCount = doc.internal.pages.length;
        doc.text(
          `Page ${data.pageNumber}/${pageCount - 1}`,
          doc.internal.pageSize.width - 10,
          footerY - 5,
          { align: 'right' },
        );
      },
    });
    const filename = `${templateName}_${projectId}_${setCreatedAt}.pdf`;
    doc.save(filename);
  };

  const handleViewChangeLog = () => {
    const changeLogUrl = ROUTES.VIEW_SET_CHANGE_LOG.replace(':setId', setId);
    navigate(changeLogUrl, {
      state: {
        templateName: templateData?.getTemplateById?.name,
        templateId,
      },
    });
  };

  const validateProperties = (propertyName, value) => {
    const errors = { ...propertyErrors };
    const property = templateData.getTemplateById?.properties.find(
      (f) => f.propertyName === propertyName,
    );
    console.log(property);
    if (
      property.isRequired &&
      (!value ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0))
    ) {
      /* empty */
    } else {
      delete errors[property.propertyName];
    }
    if (property.propertyFieldType === 'TEXT' && value?.length > 100) {
      errors[property.propertyName] = 'Text must be less than 100 characters';
    }

    if (
      property.propertyFieldType === 'MULTI_LINE_TEXT' &&
      value?.length > 750
    ) {
      errors[property.propertyName] = 'Text must be less than 750 characters';
    }
    // eslint-disable-next-line no-restricted-globals
    if (property.propertyFieldType === 'NUMERIC' && isNaN(value)) {
      errors[property.propertyName] = 'Value must be a valid number';
    }

    setPropertyErrors(errors);
    return Object.keys(errors).length === 0; // Return whether there are no errors
  };

  const renderPropertyField = (propertyType, propertyName) => {
    const errorMessage = propertyErrors[propertyName]; // Fetch the error for the property
    const hasError = !!errorMessage; // Check if there's an error
    return (
      <Form.Item
        validateStatus={hasError ? 'error' : ''}
        help={hasError ? errorMessage : null}
        style={{ marginBottom: 16 }}
      >
        {propertyType === 'TEXT' && (
          <Input
            value={propertiesData[propertyName] || ''}
            onChange={(e) => {
              const { value } = e.target;
              setPropertiesData((prev) => ({
                ...prev,
                [propertyName]: value,
              }));
              validateProperties(propertyName, e.target.value); // Validate on change
            }}
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '8px',
              height: '30px',
              border: '1px solid #d9d9d9',
              boxSizing: 'border-box',
            }}
          />
        )}

        {propertyType === 'MULTI_LINE_TEXT' && (
          <TextArea
            rows={4}
            value={propertiesData[propertyName] || ''}
            onChange={(e) => {
              const { value } = e.target;
              if (value.length <= 750) {
                setPropertiesData((prev) => ({
                  ...prev,
                  [propertyName]: value,
                }));
                validateProperties(propertyName, e.target.value); // Validate on change
              }
            }}
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              boxSizing: 'border-box',
            }}
          />
        )}
        {propertyType === 'OPTIONS' && (
          <Select
            value={propertiesData[propertyName] || undefined}
            onChange={(value) => {
              setPropertiesData((prev) => ({
                ...prev,
                [propertyName]: value,
              }));

              validateProperties(propertyName, value);
              setOpenedIndex(null);
            }}
            onFocus={() => setOpenedIndex(`${propertyName}`)} // Open dropdown for this index
            onBlur={() => setOpenedIndex(null)} // Close dropdown when focus is lost
            open={openedIndex === `${propertyName}`}
            style={{
              width: '100%',
              maxWidth: '500px',
              // padding: '2px',
              borderRadius: '4px',
              height: '30px',
            }}
          >
            {templateData?.getTemplateById.properties
              .find((p) => p.propertyName === propertyName)
              ?.options.map((option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}
          </Select>
        )}

        {propertyType === 'NUMERIC' && (
          <Input
            value={propertiesData[propertyName] || ''}
            onChange={(e) => {
              const { value } = e.target;

              // Allow only numbers and optional decimal points

              setPropertiesData((prev) => ({
                ...prev,
                [propertyName]: value,
              }));
              validateProperties(propertyName, e.target.value); // Call validation function
            }}
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '8px',
              height: '30px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
            }}
          />
        )}

        {propertyType === 'CHECKBOXES' && (
          <div style={{ marginTop: 8 }}>
            {templateData?.getTemplateById.properties
              .find((p) => p.propertyName === propertyName)
              ?.options.map((option, index) => (
                <Checkbox
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  checked={propertiesData[propertyName]?.includes(option)}
                  onChange={(e) => {
                    const { checked } = e.target;
                    setPropertiesData((prev) => {

                      const updatedState = { ...prev };

                      const currentValues = Array.isArray(updatedState[propertyName])
                      ? updatedState[propertyName]
                      : typeof updatedState[propertyName] === 'string'
                      ? updatedState[propertyName].split(',')
                      : [];
                      const newValues = checked
                        ? [...new Set([...currentValues, option])]
                        : currentValues.filter((item) => item !== option);
                      updatedState[propertyName] = newValues;

                      return updatedState;
                    });
                    validateProperties(propertyName, checked);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const isChecked = propertiesData[propertyName]?.includes(option);
                      const newChecked = !isChecked;

                      setPropertiesData((prev) => {
                        const updatedState = { ...prev };

                        const currentValues = Array.isArray(updatedState[propertyName])
                          ? updatedState[propertyName]
                          : typeof updatedState[propertyName] === 'string'
                          ? updatedState[propertyName].split(',')
                          : [];
                        const newValues = newChecked
                          ? [...new Set([...currentValues, option])]
                          : currentValues.filter((item) => item !== option);
                        updatedState[propertyName] = newValues;

                        return updatedState;
                      });

                      validateProperties(propertyName, newChecked);
                    }
                  }}
                  style={{ marginRight: 12 }}
                >
                  {option}
                </Checkbox>
              ))}
          </div>
        )}

        {propertyType === 'DATE' && (
          <Input
            type="date"
            value={propertiesData[propertyName] || ''}
            onChange={(e) => {
              setPropertiesData((prev) => ({
                ...prev,
                [propertyName]: e.target.value,
              }));
              validateProperties(propertyName, e.target.value);
            }}
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
            }}
          />
        )}
      </Form.Item>
    );
  };
  const validateFields = (fieldName, rowIndex, value) => {
    const errors = { ...fieldErrors };
    // const row = tableData[rowIndex];
    const field = templateData.getTemplateById?.fields.find(
      (f) => f.id === fieldName,
    );

    // eslint-disable-next-line no-param-reassign
    value = String(value);

    if (field) {
      const errorKey = `${fieldName}-${rowIndex}`;
      if (field.isRequired && (!value || value.trim() === '')) {
        // errors[errorKey] = `${field.fieldName} is required`;
      } else {
        // eslint-disable-next-line no-console

        delete errors[errorKey];
      }

      // TEXT field validation
      if (field.fieldType === 'TEXT') {
        if (value?.length > 100) {
          errors[errorKey] = 'Text must be less than 100 characters';
        } else {
          delete errors[errorKey];
        }
      }

      // MULTI_LINE_TEXT field validation
      if (field.fieldType === 'MULTI_LINE_TEXT') {
        if (value?.length > 750) {
          errors[errorKey] = 'Text must be less than 750 characters';
        } else {
          delete errors[errorKey];
        }
      }

      // NUMERIC field validation
      if (field.fieldType === 'NUMERIC') {

        if (isNaN(value)) {
          errors[errorKey] = 'Value must be a valid number';
        } else {
          delete errors[errorKey];
        }
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0; // Return true if there are no errors
  };

  const handleInputChange = (index, fieldName, value) => {
    console.log(value);
    setTableData((prevData) => {
      const updatedData = prevData.map((row, i) =>
        i === index
          ? {
              ...row,
              [fieldName]: { ...row[fieldName], value }, // Update the value property
            }
          : row,
      );
      if (
        index === prevData.length - 1 &&
        Object.values(updatedData[index]).every((val) => val !== '')
      ) {
        updatedData.push({});
      }
      return updatedData;
    });
  };
  const renderField = (fieldType, fieldName, rowIndex) => {
    const errorMessage = fieldErrors[`${fieldName}-${rowIndex}`];
    const hasError = !!errorMessage;
    const fieldValue =
      tableData && tableData[rowIndex][fieldName]
        ? tableData[rowIndex][fieldName].value
        : '';
        console.log('fieldValue:', fieldValue);
    const calculateFieldValue = () => {
      const fieldData = tableData[rowIndex];
      const fieldOptions = templateData.getTemplateById?.fields.find(
        (f) => f.id === fieldName,
      )?.options;
      if (!fieldOptions || fieldOptions.length === 0) return '';
      const formula = fieldOptions[0];
      console.log(formula);
      if (!formula) return '';
      try {
        const formulaWithValues = formula.replace(/\b\d+\b/g, (match) => {
          const values = fieldData[match].value;
          console.log(values);
          return values !== undefined ? values : 0;
        });

        console.log(formulaWithValues);

        const result = evaluate(formulaWithValues);
        // tableData[rowIndex][fieldName].value=result;

        if (rowIndex < tableData.length - 1) {
          // eslint-disable-next-line no-restricted-globals
          if (result !== undefined && !isNaN(result) && fieldValue !== result) {
            console.log('ff');
            handleInputChange(rowIndex, fieldName, result); // Update value only if it's different
          }
        }
        return result;
      } catch (error) {
        return '';
      }
    };
    return (
      <Form.Item
        validateStatus={hasError ? 'error' : ''}
        help={hasError ? errorMessage : null}
        style={{ marginBottom: 16 }}
      >
        {fieldType === 'TEXT' && (
          <Input
            value={fieldValue || ''}
            onChange={(e) => {
              const { value } = e.target;
              handleInputChange(rowIndex, fieldName, value);
              validateFields(fieldName, rowIndex, value);
            }}
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '8px',
              height: '30px',
              border: '1px solid #d9d9d9',
              boxSizing: 'border-box',
            }}
          />
        )}

        {fieldType === 'MULTI_LINE_TEXT' && (
          <Input.TextArea
            rows={1}
            value={fieldValue || ''}
            onChange={(e) => {
              const { value } = e.target;

              handleInputChange(rowIndex, fieldName, value);
              validateFields(fieldName, rowIndex, value);
            }}
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              boxSizing: 'border-box',
            }}
          />
        )}

        {fieldType === 'OPTIONS' && (
          <Select
            value={fieldValue}
            onChange={(value) => {
              handleInputChange(rowIndex, fieldName, value);
              validateFields(fieldName, rowIndex, value);
              setOpenedIndex(null);
            }}
            style={{
              width: '100%',
              maxWidth: '500px',
              borderRadius: '4px',
              height: '30px',
              boxSizing: 'border-box', // Ensure box-sizing is consistent
            }}
            onFocus={() => setOpenedIndex(`${rowIndex}-${fieldName}`)} // Open dropdown for this index
            onBlur={() => setOpenedIndex(null)} // Close dropdown when focus is lost
            open={openedIndex === `${rowIndex}-${fieldName}`}
          >
            {templateData.getTemplateById?.fields
              .find((f) => f.id === fieldName)
              ?.options.map((option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}
          </Select>
        )}

        {fieldType === 'NUMERIC' && (
          <Input
            value={fieldValue}
            onChange={(e) => {
              const { value } = e.target;
              handleInputChange(rowIndex, fieldName, value);
              validateFields(fieldName, rowIndex, value);
            }}
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '8px',
              height: '30px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              boxSizing: 'border-box', // Ensure box-sizing is consistent
            }}
          />
        )}


        {fieldType === 'CHECKBOXES' && (
          <div style={{ marginTop: 8 }}>
            {templateData.getTemplateById?.fields
              .find((f) => f.id === fieldName)
              ?.options.map((option, index) => (

                <Checkbox
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}

                  checked={
                    tableData[rowIndex][fieldName]?.value?.includes(option) ||
                    false
                  } // Safely access value
                  onChange={(e) => {
                    const { checked } = e.target;
                    setTableData((prevData) => {
                      const updatedTableData = [...prevData];
                      if (!updatedTableData[rowIndex]) {
                        updatedTableData[rowIndex] = {};
                      }
                      if (!updatedTableData[rowIndex][fieldName]) {
                        updatedTableData[rowIndex][fieldName] = { value: [] };
                      }
                      const updatedRow = updatedTableData[rowIndex] || {};
                      // console.log(":jkii",updatedRow[fieldName]);
                      const currentValues = Array.isArray(updatedRow[fieldName].value)
                      ? updatedRow[fieldName].value
                      : typeof updatedRow[fieldName].value === 'string'
                      ? updatedRow[fieldName].value.split(',')
                      : [];

                      const newValues = checked
                        ? [...currentValues, option] // Add option if checked
                        : currentValues.filter((item) => item !== option); // Remove option if unchecked


                      updatedTableData[rowIndex] = {
                        ...updatedRow,
                        [fieldName]: { value: newValues }, // Ensure structure consistency
                      };
                      if (
                        rowIndex === prevData.length - 1 &&
                        Object.values(updatedTableData[rowIndex]).every(
                          (val) => val !== '',
                        )
                      ) {
                        updatedTableData.push({}); // Add a new empty row
                      }
                      return updatedTableData;
                    });

                    validateFields(fieldName, rowIndex, checked);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      // Prevent default action and toggle the checkbox on Enter
                      e.preventDefault();
                      const isChecked = tableData[rowIndex][
                        fieldName
                      ]?.value?.includes(option);
                      const newChecked = !isChecked;

                      setTableData((prevData) => {
                        const updatedTableData = [...prevData];
                        if (!updatedTableData[rowIndex]) {
                          updatedTableData[rowIndex] = {};
                        }
                        if (!updatedTableData[rowIndex][fieldName]) {
                          updatedTableData[rowIndex][fieldName] = { value: [] };
                        }
                        const updatedRow = updatedTableData[rowIndex] || {};

                        const currentValues = Array.isArray(updatedRow[fieldName].value)
                          ? updatedRow[fieldName].value
                          : typeof updatedRow[fieldName].value === 'string'
                          ? updatedRow[fieldName].value.split(',')
                          : [];

                        const newValues = newChecked
                          ? [...currentValues, option]
                          : currentValues.filter((item) => item !== option);

                        updatedTableData[rowIndex] = {
                          ...updatedRow,
                          [fieldName]: { value: newValues },
                        };
                        if (
                          rowIndex === prevData.length - 1 &&
                          Object.values(updatedTableData[rowIndex]).every(
                            (val) => val !== '',
                          )
                        ) {
                          updatedTableData.push({}); // Add a new empty row
                        }
                        return updatedTableData;
                      });

                      validateFields(fieldName, rowIndex, newChecked);
                    }
                  }}
                  style={{ marginRight: 12 }}
                >
                  {option}
                </Checkbox>
              ))}
          </div>
        )}
        {fieldType === 'ATTACHMENT' && (
  <ImageUpload
    onUploadSuccess={(url) => {
      handleInputChange(rowIndex, fieldName, url);
    }}
    errorMessage={errorMessage}
    existingFileUrls={fieldValue||''}
  />
)}
        {fieldType === 'CALCULATION' && (
          <Input
            value={rowIndex < tableData.length - 1 ? calculateFieldValue() : ''}
            disabled
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '8px',
              height: '30px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              boxSizing: 'border-box', // Ensure box-sizing is consistent
            }}
          />
        )}
        {fieldType === 'DATE' && (
          <Input
            type="date"
            value={fieldValue || ''}
            onChange={(e) => {
              handleInputChange(rowIndex, fieldName, e.target.value);
              validateFields(fieldName, rowIndex);
            }}
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              boxSizing: 'border-box', // Ensure box-sizing is consistent
            }}
          />
        )}
      </Form.Item>
    );
  };
  const handleDeleteRow = (rowIndex) => {
    // Check if the row to be deleted is the last one
    if (rowIndex === tableData.length - 1) {
      notification.error({
        message: 'Cannot Delete Last Row',
        description:
          'You cannot delete the last row. Please add a new row before deleting.',
      });
      return;
    }

    Modal.confirm({
      title: 'Are you sure you want to delete this row?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      cancelText: 'No',
      okType: 'danger',
      icon: <DeleteOutlined style={{ color: 'red' }} />,
      onOk: () => {
        const newData = [...tableData];
        newData.splice(rowIndex, 1);
        setTableData(newData);
      },
    });
  };
  const columns = [
    {
      title: 'Index',
      key: 'index',
      render: (text, record, index) => index + 1,
      width: 15,
    },
    ...(Array.isArray(templateData?.getTemplateById?.fields)
      ? templateData?.getTemplateById?.fields.map((field) => ({
          title: (
            <span>
              {field.fieldName}{' '}
              {field.isRequired && <span style={{ color: 'red' }}>*</span>}
            </span>
          ),
          dataIndex: field.id,
          key: field.id,
          render: (text, record, index) =>
            renderField(field.fieldType, field.id, index),
          width: 150, // Set to a fixed width for all columns
        }))
      : []),
    {
      title: 'Action',
      key: 'action',
      render: (text, record, index) => (
        <Button
          type="link"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteRow(index)} // Function to handle the delete action
          style={{ color: 'red' }}
        />
      ),
      width: 100, // Set a fixed width for the action column
    },
  ];

  const handleSave = async () => {
    const isPropertyValid = finalValidateProperties();
    const isFieldValid = finalValidateFields();

    if (!isPropertyValid || !isFieldValid) {
      // eslint-disable-next-line no-undef
      alert('Please fix the errors before submitting.');
      return;
    }
    try {
      console.log(propertiesData);
      const propertyValues = Object.keys(propertiesData).map((propertyName) => {
        const propertyId = templateData.getTemplateById.properties.find(
          (prop) => prop.propertyName === propertyName,
        )?.id;

        const responseId = responseData.getAllResponsesForSet.propertyResponses?.find(
          (propResponse) => propResponse.propertyId === propertyId,
        )?.id;

        return {
          propertyId,
          value: String(propertiesData[propertyName]),
          responseId: responseId || null,
        };
      });
      console.log('prop vla', propertyValues);
      const tableEntries = tableData.map(
        (row) =>
          Object.entries(row)
            .map(([fieldId, { value, responseId }]) => {
              if (fieldId !== 'rowNumber' && fieldId !== 'id') {
                return {
                  fieldId, // field ID
                  value: String(value), // field value
                  responseId: responseId !== undefined ? responseId : null, // responseId
                  rowNumber: row.rowNumber, // Include rowNumber
                };
              }
              return null;
            })
            .filter((entry) => entry !== null), // Filter out null entries
      );

      const response = await editResponse({
        variables: {
          setId,
          tableEntries,
          propertyValues,
        },
      });
      if (response.data.editResponse.success) {
        alert('Response submitted successfully!');
        navigate(ROUTES.VIEW_ENTRIES.replace(':templateId', templateId));
        // VIEW_ENTRIES:'/register/view-entries/:templateId',
      } else {
        alert(`Error: ${response.data.submitResponse.message}`);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('An error occurred while submitting the response.');
    }
  };
  const exportMenu = (
    <Menu>
      <Menu.Item key="csv" icon={<UploadOutlined />} onClick={handleCsvExport}>
        Export as CSV
      </Menu.Item>
      <Menu.Item key="pdf" icon={<UploadOutlined />} onClick={handlePdfExport}>
        Export as Pdf
      </Menu.Item>
    </Menu>
  );
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        name={templateData?.getTemplateById?.name}
        setId={setId}
        templateId={templateId}
      />
      <div className="header" style={{ padding: '16px',marginTop: '60px' }}>
        <Dropdown overlay={exportMenu} trigger={['click']}>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            style={{ backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' }}
          >
            Export <DownOutlined />
          </Button>
        </Dropdown>
        <Button onClick={handleViewChangeLog}>View Change Log</Button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <Card>
          <div style={{ marginBottom: 8 }}>
            <strong>Created By: </strong>
            <span>{setData.createdBy || 'N/A'}</span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Created At: </strong>
            <span>
              {setData.createdAt
                ? moment(setData.createdAt, 'x').isValid()
                  ? moment(setData.createdAt, 'x').format('YYYY-MM-DD HH:mm:ss')
                  : 'Invalid Date'
                : '-'}
            </span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Updated By: </strong>
            <span>{setData.updatedBy || '-'}</span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Updated At: </strong>
            {setData.createdAt
              ? moment(setData.updatedAt, 'x').isValid()
                ? moment(setData.updatedAt, 'x').format('YYYY-MM-DD HH:mm:ss')
                : 'Invalid Date'
              : '-'}
          </div>
        </Card>

        <Card title="Properties" style={{ marginBottom: 16, flexShrink: 0 }}>
          {Object.keys(propertiesData).length > 0 ? (
            Object.entries(propertiesData).map(([propertyName, value]) => {
              const property = templateData?.getTemplateById.properties.find(
                (p) => p.propertyName === propertyName,
              );
              const isRequired = property?.isRequired;
              return (
                <div key={propertyName} style={{ marginBottom: 8 }}>
                  <strong>
                    {propertyName}
                    {isRequired && <span style={{ color: 'red' }}> *</span>}
                  </strong>
                  {renderPropertyField(
                    property.propertyFieldType,
                    propertyName,
                  )}
                </div>
              );
            })
          ) : (
            <p>No properties data available.</p>
          )}
        </Card>

        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 16,
            }}
          >
            <Button type="primary" onClick={handleSave}>
              Save Response
            </Button>
          </div>

          <div style={{ minHeight: '300px', overflowY: 'auto' }}>
            <Table
              dataSource={tableData}
              columns={columns}
              rowKey={(record, index) => index}
              locale={{ emptyText: 'No data available' }}
              scroll={{ x: 'max-content', y: tableHeight }} // Adjust `y` to your desired height
              sticky
              pagination={false}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default EditEntry;
