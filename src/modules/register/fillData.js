/* eslint-disable no-console */
/* eslint-disable no-shadow */

/* eslint-disable no-alert */

import { DeleteOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';
import { Button, Card, Checkbox, Form, Input, Pagination, Select, Table, notification } from 'antd';
import React, { useEffect, useState,useRef } from 'react';
import { useParams } from 'react-router-dom';
import { evaluate } from 'mathjs';
import Header from './components/Header';
import { SUBMIT_RESPONSE } from './graphql/Mutation';
import { GET_TEMPLATE_BY_ID } from './graphql/Queries';
import './register.less';
import ImageUpload from './components/AttachmentUpload';

const { TextArea } = Input;

const FillTable = () => {

  const { templateId } = useParams();
  const [tableData, setTableData] = useState([{}]);
  const [propertiesData, setPropertiesData] = useState({});
  const [openedIndex,setOpenedIndex]=useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [fieldErrors, setFieldErrors] = useState({});
  const [propertyErrors, setPropertyErrors] = useState({});
  const selectRef = useRef(null);
  const { data, loading, error } = useQuery(GET_TEMPLATE_BY_ID, {
    variables: { id: templateId },
    fetchPolicy: 'cache-and-network',
  });

  const [submitResponse] = useMutation(SUBMIT_RESPONSE);

  useEffect(() => {
    if (data) {
      const initialProperties = {};
      data?.getTemplateById?.properties.forEach((property) => {
        initialProperties[property.propertyName] = '';
      });
      setPropertiesData(initialProperties);
    }
  }, [data]);

  const handleInputChange = (index, fieldName, value) => {
    console.log(fieldName + value);
    setTableData((prevData) => {
      const updatedData = prevData.map((row, i) =>
        i === index ? { ...row, [fieldName]: value } : row,
      );
      if (index === prevData.length - 1 && Object.values(updatedData[index]).every(val => val !== '')) {
        updatedData.push({});
        if (updatedData.length > (currentPage * pageSize)) {
          setCurrentPage(currentPage + 1);
        }
      }
      return updatedData;
    });
  };

  const finalValidateFields = () => {
    const errors = {};
    tableData.forEach((row, rowIndex) => {
      const isRowBlank = data.getTemplateById?.fields.every(
        (field) => !row[field.fieldName] || row[field.fieldName].trim() === '',
      );

      if (isRowBlank) return;
      data.getTemplateById?.fields.forEach((field) => {
        const value = row[field.fieldName];

        // Check for required fields
        if (field.isRequired &&
          (!value ||
           (typeof value === 'string' && value.trim() === '') ||
           (Array.isArray(value) && value.length === 0))
        ) {
          errors[`${field.fieldName}-${rowIndex}`] = 'This field is required.';
        }

        if (field.fieldType === 'TEXT' && value?.length > 100) {
          errors[`${field.fieldName}-${rowIndex}`] = 'Text must be less than 100 characters.';
        }

        // eslint-disable-next-line no-restricted-globals
        if (field.fieldType === 'NUMERIC' && isNaN(value)) {
          errors[`${field.fieldName}-${rowIndex}`] = 'Value must be a valid number.';
        }
      });
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };
  const finalValidateProperties = () => {
    const errors = {};
    data?.getTemplateById?.properties.forEach((property) => {
      const value = propertiesData[property.propertyName];

      if (property.isRequired &&
        (!value ||
         (typeof value === 'string' && value.trim() === '') ||
         (Array.isArray(value) && value.length === 0))
      ) {
        errors[property.propertyName] = 'This field is required.';
      }

      if (property.propertyFieldType === 'TEXT' && value?.length > 100) {
        errors[property.propertyName] = 'Text must be less than 100 characters';
      }

      if (property.propertyFieldType === 'MULTI_LINE_TEXT' && value?.length > 750) {
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
  const handleSave = async () => {
    const isPropertyValid = finalValidateProperties();
 const isFieldValid= finalValidateFields();

    // If there are errors, prevent form submission
    if (!isPropertyValid ||!isFieldValid ) {
      // eslint-disable-next-line no-undef
      alert('Please fix the errors before submitting.');
      return;
    }
    try {
      const tableEntries = tableData.map((row) =>
        Object.entries(row).map(([fieldName, value]) => {
          const fieldId = data?.getTemplateById?.fields.find(
            (f) => f.fieldName === fieldName,
          )?.id;
          return { fieldId, value: String(value) };
        }),
      );
      const propertyValues = Object.keys(propertiesData).map((propertyName) => ({
        propertyId: data?.getTemplateById.properties.find(
          (prop) => prop.propertyName === propertyName,
        )?.id,
        value: String(propertiesData[propertyName]),
      }));

      const response = await submitResponse({
        variables: { templateId, tableEntries, propertyValues },
      });

      if (response.data.submitResponse.success) {
        // eslint-disable-next-line no-undef
        alert('Response submitted successfully!');
      } else {
        // eslint-disable-next-line no-undef
        alert(`Error: ${response.data.submitResponse.message}`);
      }
    } catch (error) {

      // eslint-disable-next-line no-undef
      alert('An error occurred while submitting the response.');
    }
  };




  const validateProperties = (propertyName,value) => {
    const errors = {...propertyErrors};
    const property = data.getTemplateById?.properties.find(f => f.propertyName === propertyName);

      // const value = propertiesData[property.propertyName];
// eslint-disable-next-line no-console
console.log(property);
      if ( (property.isRequired &&
        (!value ||
         (typeof value === 'string' && value.trim() === '') ||
         (Array.isArray(value) && value.length === 0))
      )) {
        // errors[property.propertyName] = `${property.propertyName} is required`;
      } else {
        // Remove error if the required field is now filled
        delete errors[property.propertyName];
      }

      if (property.propertyFieldType === 'TEXT' && value?.length > 100) {
        errors[property.propertyName] = 'Text must be less than 100 characters';
      }

     else if (property.propertyFieldType === 'MULTI_LINE_TEXT' && value?.length > 750) {
        errors[property.propertyName] = 'Text must be less than 750 characters';
      }

      // eslint-disable-next-line no-restricted-globals
    else  if (property.propertyFieldType === 'NUMERIC' && isNaN(value)) {
        errors[property.propertyName] = 'Value must be a valid number';
      }

// eslint-disable-next-line no-console
console.log(errors);
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
              validateProperties( propertyName,e.target.value); // Validate on change
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
                validateProperties( propertyName,e.target.value); // Validate on change
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
            ref={selectRef}
            value={propertiesData[propertyName] || '-'}
            onChange={(value) =>{
              setPropertiesData((prev) => ({
                ...prev,
                [propertyName]: value,
              }))
            validateProperties(propertyName,value);
              setOpenedIndex(`0-${propertyName}`);
              setOpenedIndex(null);
              selectRef.current.blur();
            }
          }
          onFocus={() => setOpenedIndex(`0-${propertyName}`)}  // Open dropdown for this index
          onBlur={() => setOpenedIndex(null)}    // Close dropdown when focus is lost
          open={openedIndex === `0-${propertyName}`}
            style={{
              width: '100%',
              maxWidth: '500px',
              // padding: '2px',
              borderRadius: '4px',
              height:'30px',
            }}
          >
            {data?.getTemplateById.properties
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
      const {value} = e.target;

      // Allow only numbers and optional decimal points

        setPropertiesData((prev) => ({
          ...prev,
          [propertyName]: value,
        }));
        validateProperties( propertyName,e.target.value); // Call validation function

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
            {data?.getTemplateById.properties
              .find((p) => p.propertyName === propertyName)
              ?.options.map((option, index) => (
                <Checkbox
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  checked={propertiesData[propertyName]?.includes(option)}
                  onChange={(e) => {
                    const { checked } = e.target;
                    setPropertiesData((prev) => {
                      const newValues = checked
                        ? [...(prev[propertyName] || []), option]
                        : prev[propertyName]?.filter((item) => item !== option);
                      return { ...prev, [propertyName]: newValues };
                    });
                    validateProperties(propertyName,checked);
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
            onChange={(e) =>{
              setPropertiesData((prev) => ({
                ...prev,
                [propertyName]: e.target.value,
              }))
              validateProperties(propertyName, e.target.value);
            }
            }

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
  const validateFields = (fieldName, rowIndex,value) => {
    const errors = { ...fieldErrors };
    // const row = tableData[rowIndex];
    const field = data.getTemplateById?.fields.find(f => f.fieldName === fieldName);

// eslint-disable-next-line no-param-reassign
value=String(value);

    if (field) {
      // const value = row[fieldName];
      const errorKey = `${fieldName}-${rowIndex}`;

      // Required field validation
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
        // eslint-disable-next-line no-restricted-globals
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


  const renderField = (fieldType, fieldName, rowIndex) => {
    const errorMessage = fieldErrors[`${fieldName}-${rowIndex}`];
    const hasError = !!errorMessage;

    const calculateFieldValue = (fieldName, rowIndex) => {
      const fieldData = tableData[rowIndex];
      const fieldOptions = data.getTemplateById?.fields.find(f => f.fieldName === fieldName)?.options;
      if (!fieldOptions || fieldOptions.length === 0) return '';
      const formula = fieldOptions[0];
      console.log(formula);
      if (!formula) return '';
      try {
        const formulaWithValues = formula.replace(/\b\d+\b/g, (match) => {
         const fMatch= data.getTemplateById?.fields.find(f => f.id === match)?.fieldName;
          const value = fieldData[fMatch];
          return value !== undefined ? value : 0;
        });

         const res=formulaWithValues;
        const result = evaluate(formulaWithValues);
        // eslint-disable-next-line use-isnan, no-restricted-globals
        if (result !== undefined && !isNaN(result) && tableData[rowIndex][fieldName] !== result) {
          handleInputChange(rowIndex, fieldName, result);  // Update value only if it's different
        }
        return result;
      }  catch (error) {

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
            value={tableData[rowIndex][fieldName] || ''}
            onChange={(e) => {
              const { value } = e.target;
              handleInputChange(rowIndex, fieldName, value);
              validateFields(fieldName, rowIndex,value);
            }}

            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '8px',
              height: '30px',
              border: '1px solid #d9d9d9',
              boxSizing: 'border-box', // Ensure box-sizing is consistent
            }}
          />
        )}

        {fieldType === 'MULTI_LINE_TEXT' && (
          <Input.TextArea
            rows={1}
            value={tableData[rowIndex][fieldName] || ''}
            onChange={(e) => {
              const { value } = e.target;

                handleInputChange(rowIndex, fieldName, value);
                validateFields(fieldName, rowIndex,value);

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
{fieldType === 'CALCULATION' && (
        <Input
        value={rowIndex < tableData.length - 1 ? calculateFieldValue(fieldName, rowIndex) : ''}
          disabled // Prevent manual input

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
        {fieldType === 'OPTIONS' && (
          <Select
         ref={selectRef}
            value={tableData[rowIndex][fieldName] || undefined}
            onChange={(value) => {
              handleInputChange(rowIndex, fieldName, value);
              validateFields(fieldName, rowIndex,value);
              setOpenedIndex(null);
              selectRef.current.blur();
            }}
            style={{
              width: '100%',
              maxWidth: '500px',
              borderRadius: '4px',
              height: '30px',
              boxSizing: 'border-box', // Ensure box-sizing is consistent
            }}
            onFocus={() => setOpenedIndex(`${rowIndex}-${fieldName}`)}  // Open dropdown for this index
            onBlur={() => setOpenedIndex(null)}    // Close dropdown when focus is lost
            open={openedIndex === `${rowIndex}-${fieldName}`}
          >
            {data.getTemplateById?.fields
              .find((f) => f.fieldName === fieldName)
              ?.options.map((option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}
          </Select>
        )}

        {fieldType === 'NUMERIC' && (
          <Input
            value={tableData[rowIndex][fieldName] || ''}
            onChange={(e) => {
              const { value } = e.target;
              handleInputChange(rowIndex, fieldName, value);
              validateFields(fieldName, rowIndex,value);
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
            {data.getTemplateById?.fields
              .find((f) => f.fieldName === fieldName)
              ?.options.map((option, index) => (
                <Checkbox
  // eslint-disable-next-line react/no-array-index-key
  key={index}
  checked={tableData[rowIndex][fieldName]?.includes(option)} // Checks if the value is in the array
  onChange={(e) => {
    const { checked } = e.target;
    setTableData((prevData) => {
      const updatedRow = prevData[rowIndex];
      const newValues = checked
        ? [...(updatedRow[fieldName] || []), option] // Add the value if checked
        : updatedRow[fieldName]?.filter((item) => item !== option); // Remove the value if unchecked
      const updatedTableData = [...prevData];
      updatedTableData[rowIndex] = { ...updatedRow, [fieldName]: newValues };
      return updatedTableData;
    });
    validateFields(fieldName, rowIndex, checked);
  }}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      // Prevent the default action and toggle the checkbox on Enter press
      e.preventDefault();
      const checked = !tableData[rowIndex][fieldName]?.includes(option);
      setTableData((prevData) => {
        const updatedRow = prevData[rowIndex];
        const newValues = checked
          ? [...(updatedRow[fieldName] || []), option]
          : updatedRow[fieldName]?.filter((item) => item !== option);
        const updatedTableData = [...prevData];
        updatedTableData[rowIndex] = { ...updatedRow, [fieldName]: newValues };
        return updatedTableData;
      });
      validateFields(fieldName, rowIndex, checked);
    }
  }}
  style={{ marginRight: 12 }}>
  {option}
  </Checkbox>
              ))}
          </div>
        )}
 {fieldType === 'ATTACHMENT' && (
        <ImageUpload
          onUploadSuccess={(url) => handleInputChange(rowIndex, fieldName, url)}
          errorMessage={errorMessage}
        />
      )}
        {fieldType === 'DATE' && (
          <Input
            type="date"
            value={tableData[rowIndex][fieldName] || ''}
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
    if (rowIndex === tableData.length - 1) {

      notification.error({
        message: "Cannot Delete Last Row",
        description: "You cannot delete the last row. Please add a new row before deleting.",
      });   return;
    }
    const newData = [...tableData];
    newData.splice(rowIndex, 1); // Delete the row at the specified index
    setTableData(newData);
  };
  const columns = [
    {
      title: 'Index',
      key: 'index',
      render: (text, record, index) => {
        const globalIndex = (currentPage - 1) * pageSize + index + 1;
        return globalIndex;
      },
      width: 15, // Set a fixed width for the index column
    },
    ...(Array.isArray(data?.getTemplateById?.fields) ? data?.getTemplateById?.fields.map((field) => ({
      title: (
        <span>
          {field.fieldName} {field.isRequired && <span style={{ color: 'red' }}>*</span>}
        </span>
      ),
      dataIndex: field.fieldName,
      key: field.id,
      render: (text, record, index) => renderField(field.fieldType, field.fieldName, index),
      width: 150, // Set to a fixed width for all columns
    })) : []),
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
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'scroll',
      }}
    >
      <Header name={data?.getTemplateById?.name} />

      <Card title="Properties" style={{ marginBottom: 16, flexShrink: 0 }}>
        {Object.keys(propertiesData).length > 0 ? (
          Object.entries(propertiesData).map(([propertyName, value]) => {
            const property = data?.getTemplateById.properties.find(
              (p) => p.propertyName === propertyName,
            );
            const isRequired = property?.isRequired;
            return (
              <div key={propertyName} style={{ marginBottom: 8 }}>
                <strong>
                  {propertyName}
                  {isRequired && <span style={{ color: 'red' }}> *</span>}
                </strong>
                {renderPropertyField(property.propertyFieldType, propertyName)}
              </div>
            );
          })
        ) : (
          <p>No properties data available.</p>
        )}
      </Card>

      <div
        style={{


          padding: '0 16px',
          marginBottom: 16,
        }}
      >
        <Table
          dataSource={tableData}
          columns={columns}
          rowKey="id"
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </div>

      <div
        style={{
          marginBottom: 5,
          marginTop: 16,
          display: 'flex',
          justifyContent: 'space-between',
          padding: '10px',
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
          position: 'sticky',
          bottom: 0,
          zIndex: 1,
        }}
      >
        <Button type="primary" onClick={handleSave}>
          Save Response
        </Button>
      </div>
    </div>
  );


};

export default FillTable;
