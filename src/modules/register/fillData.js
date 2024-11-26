/* eslint-disable no-shadow */

/* eslint-disable no-alert */

import { useMutation, useQuery } from '@apollo/client';
import { Button, Card, Checkbox, Form, Input, Pagination, Select, Table } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from './components/Header';
import { SUBMIT_RESPONSE } from './graphql/Mutation';
import { GET_TEMPLATE_BY_ID } from './graphql/Queries';
import './register.less';


const { TextArea } = Input;

const FillTable = () => {

  const { templateId } = useParams();
  const [tableData, setTableData] = useState([{}]);
  const [propertiesData, setPropertiesData] = useState({});
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [fieldErrors, setFieldErrors] = useState({});
  const [propertyErrors, setPropertyErrors] = useState({});
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
  // const validateFieldsOnBlur = (fieldName, fieldValue, rowIndex) => {
  //   // Get the current row count
  //   const totalRows = tableData.length;

  //   // Validate the field that triggered the blur
  //   const fieldMeta = data.getTemplateById?.fields.find((f) => f.fieldName === fieldName);
  //   const isRequired = fieldMeta?.isRequired;

  //   if (isRequired && (!fieldValue || fieldValue.trim() === '')) {
  //     setFieldErrors((prevErrors) => ({
  //       ...prevErrors,
  //       [`${fieldName}-${rowIndex}`]: `${fieldMeta.fieldLabel || 'Field'} is required.`,
  //     }));
  //   } else {
  //     setFieldErrors((prevErrors) => {
  //       const newErrors = { ...prevErrors };
  //       delete newErrors[`${fieldName}-${rowIndex}`];
  //       return newErrors;
  //     });
  //   }

  //   // Check all rows except the last row for required fields
  //   tableData.forEach((row, index) => {
  //     if (index < totalRows - 1) {
  //       Object.keys(row).forEach((key) => {
  //         const field = data.getTemplateById?.fields.find((f) => f.fieldName === key);
  //         if (field?.isRequired && (!row[key] || row[key].trim() === '')) {
  //           setFieldErrors((prevErrors) => ({
  //             ...prevErrors,
  //             [`${key}-${index}`]: `${field.fieldLabel || 'Field'} is required.`,
  //           }));
  //         }
  //       });
  //     }
  //   });
  // };
  const handleInputChange = (index, fieldName, value) => {
    setTableData((prevData) => {
      const updatedData = prevData.map((row, i) =>
        i === index ? { ...row, [fieldName]: value } : row,
      );
      if (index === prevData.length - 1) {
        updatedData.push({});
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
        if (field.isRequired && (!value || value.trim() === '')) {
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

      if (property.isRequired && (!value || value.trim() === '')) {
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
      // eslint-disable-next-line no-console
      console.error('Error submitting response:', error);
      // eslint-disable-next-line no-undef
      alert('An error occurred while submitting the response.');
    }
  };




  const validateProperties = () => {
    const errors = {...propertyErrors};
    data?.getTemplateById?.properties.forEach((property) => {
      const value = propertiesData[property.propertyName];
      if (property.isRequired && (!value || value.trim() === '')) {
        errors[property.propertyName] = `${property.propertyName} is required`;
      } else if (property.isRequired) {
        // Remove error if the required field is now filled
        delete errors[property.propertyName];
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
              validateProperties(); // Validate on change
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
                validateProperties(); // Validate on change
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
            onChange={(value) =>{
              setPropertiesData((prev) => ({
                ...prev,
                [propertyName]: value,
              }))

            validateProperties();
            }
          }

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
        validateProperties(); // Call validation function

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
                    validateProperties();
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
              validateProperties();
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
  const validateFields = () => {
    const errors = { ...fieldErrors };

    tableData.forEach((row, rowIndex) => {
      data.getTemplateById?.fields.forEach((field) => {
        const value = row[field.fieldName];
        const errorKey = `${field.fieldName}-${rowIndex}`;

        // Required field validation
        if (field.isRequired && (!value || value.trim() === '')) {
          errors[errorKey] = `${field.fieldName} is required`;
        } else {
          // Remove error if the required field is now filled
          delete errors[errorKey];
        }

        // TEXT field validation
        if (field.fieldType === 'TEXT') {
          if (value?.length > 100) {
            errors[errorKey] = 'Text must be less than 100 characters';
          } else {
            delete errors[errorKey]; // Remove error if value is valid
          }
        }

        // MULTI_LINE_TEXT field validation
        if (field.fieldType === 'MULTI_LINE_TEXT') {
          if (value?.length > 750) {
            errors[errorKey] = 'Text must be less than 750 characters';
          } else {
            delete errors[errorKey]; // Remove error if value is valid
          }
        }

        // NUMERIC field validation
        if (field.fieldType === 'NUMERIC') {
          // eslint-disable-next-line no-restricted-globals
          if (isNaN(value)) {
            errors[errorKey] = 'Value must be a valid number';
          } else {
            delete errors[errorKey]; // Remove error if value is valid
          }
        }
      });
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0; // Return true if there are no errors
  };


  const renderField = (fieldType, fieldName, rowIndex) => {
    const errorMessage = fieldErrors[`${fieldName}-${rowIndex}`];
    const hasError = !!errorMessage;

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
              validateFields();
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
            rows={4}
            value={tableData[rowIndex][fieldName] || ''}
            onChange={(e) => {
              const { value } = e.target;

                handleInputChange(rowIndex, fieldName, value);
                validateFields();

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

        {fieldType === 'OPTIONS' && (
          <Select
            value={tableData[rowIndex][fieldName] || undefined}
            onChange={(value) => {
              handleInputChange(rowIndex, fieldName, value);
              validateFields();
            }}
            style={{
              width: '100%',
              maxWidth: '500px',
              borderRadius: '4px',
              height: '30px',
              boxSizing: 'border-box', // Ensure box-sizing is consistent
            }}

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
              validateFields();
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
                  checked={tableData[rowIndex][fieldName]?.includes(option)}
                  onChange={(e) => {
                    const { checked } = e.target;
                    setTableData((prevData) => {
                      const updatedRow = prevData[rowIndex];
                      const newValues = checked
                        ? [...(updatedRow[fieldName] || []), option]
                        : updatedRow[fieldName]?.filter((item) => item !== option);
                      const updatedTableData = [...prevData];
                      updatedTableData[rowIndex] = { ...updatedRow, [fieldName]: newValues };
                      return updatedTableData;
                    });
                    validateFields();
                  }}
                  style={{ marginRight: 12 }}

                >
                  {option}
                </Checkbox>
              ))}
          </div>
        )}

        {fieldType === 'DATE_PICKER' && (
          <Input
            type="date"
            value={tableData[rowIndex][fieldName] || ''}
            onChange={(e) => {
              handleInputChange(rowIndex, fieldName, e.target.value);
              validateFields();
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
    const newData = [...tableData];
    newData.splice(rowIndex, 1); // Delete the row at the specified index
    setTableData(newData);
  };

  const columns = data?.getTemplateById?.fields.map((field) => ({
    title: (
      <span>
        {field.fieldName} {field.isRequired && <span style={{ color: 'red' }}>*</span>}
      </span>
    ),
    dataIndex: field.fieldName,
    key: field.id,
    render: (text, record, index) => renderField(field.fieldType, field.fieldName, index),
    // Ensure each column has the same width
    width: 150, // Set to a fixed width for all columns
  })).concat([
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
  ]);





  const paginatedData = tableData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
// eslint-disable-next-line no-console
console.log(data);
  return (
    <div>
      <Header name={data?.getTemplateById?.name} />
      <Card title="Properties" style={{ marginBottom: 16 }}>
  {Object.keys(propertiesData).length > 0 ? (
    Object.entries(propertiesData).map(([propertyName, value]) => {
      const property = data?.getTemplateById.properties.find((p) => p.propertyName === propertyName);
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
      <div>

      <Table
        dataSource={paginatedData}
        columns={columns}
        rowKey="id"
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
    </div>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' ,padding:'10px'}}>

      <Button type="primary" onClick={handleSave}>
          Save Response
        </Button>
      </div>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={tableData.length}
          showSizeChanger
          pageSizeOptions={['5', '10', '25', '50']}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
          style={{
            position: 'fixed',
            bottom: '0',
            left: '0',
            right: '0',
            padding: '10px',
            background: '#fff',
            zIndex: 999,
            borderTop: '1px solid #f0f0f0',
            justifyContent: 'center',
            display: 'flex',
          }}
        />

    </div>
  );
};

export default FillTable;
