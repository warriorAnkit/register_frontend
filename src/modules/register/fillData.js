/* eslint-disable no-shadow */
/* eslint-disable no-undef */
/* eslint-disable no-alert */
// /* eslint-disable no-undef */
// /* eslint-disable no-alert */
// import React, { useEffect, useState } from 'react';
// import { useQuery, useMutation } from '@apollo/client';
// import { useParams } from 'react-router-dom';
// import { Table, Button, Card, Space, Popconfirm, Pagination } from 'antd';
// import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
// import { GET_TEMPLATE_BY_ID } from './graphql/Queries';
// import { SUBMIT_RESPONSE } from './graphql/Mutation';
// import './register.less';
// import AddEntryModal from './components/AddEntryModal';
// import PropertiesModal from './components/FillPropertyModal';
// import Header from './components/Header';

// const FillTable = () => {
//   const { templateId } = useParams();
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [isPropertiesModalVisible, setIsPropertiesModalVisible] = useState(
//     false,
//   );
//   const [tableData, setTableData] = useState([]);
//   const [propertiesData, setPropertiesData] = useState({});
//   const [isPropertiesAdded, setIsPropertiesAdded] = useState(false);
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [pageSize, setPageSize] = useState(10); // State to store page size
//   const [currentPage, setCurrentPage] = useState(1);

//   const { data, loading, error } = useQuery(GET_TEMPLATE_BY_ID, {
//     variables: { id: templateId },
//     fetchPolicy: 'cache-and-network',
//   });

//   const [submitResponse] = useMutation(SUBMIT_RESPONSE);

//   useEffect(() => {
//     if (data) {
//       setTableData([]);
//       const initialProperties = {};
//       data.getTemplateById?.properties.forEach((property) => {
//         initialProperties[property.propertyName] = ''; // Default value is empty
//       });
//       setPropertiesData(initialProperties);
//     }
//   }, [data]);

//   const handleAddEntry = () => {
//     setEditingIndex(null);
//     setIsModalVisible(true);
//   };

//   const handleEditEntry = (index) => {
//     setEditingIndex(index);
//     setIsModalVisible(true);
//   };

//   const handleDeleteEntry = (index) => {
//     setTableData((prevData) => prevData.filter((_, i) => i !== index));
//   };

//   const handleSaveProperties = (updatedProperties) => {
//     updatedProperties.forEach((property) => {
//       setPropertiesData((prevState) => ({
//         ...prevState,
//         [property.propertyName]: property.value,
//       }));
//     });
//     setIsPropertiesAdded(true);
//     setIsPropertiesModalVisible(false);
//   };

//   const columns = [
//     ...(data?.getTemplateById?.fields.map((field) => ({
//       title: field.fieldName,
//       dataIndex: field.fieldName,
//       key: field.id,
//       render: (text) => <span>{text || '-'}</span>,
//     })) || []),
//     {
//       title: 'Actions',
//       key: 'actions',
//       render: (_, record, index) => (
//         <Space size="middle">
//           <EditOutlined
//             onClick={() => handleEditEntry(index)}
//             style={{ color: 'blue', cursor: 'pointer' }}
//           />
//           <Popconfirm
//             title="Are you sure to delete this entry?"
//             onConfirm={() => handleDeleteEntry(index)}
//             okText="Yes"
//             cancelText="No"
//           >
//             <DeleteOutlined style={{ color: 'red', cursor: 'pointer' }} />
//           </Popconfirm>
//         </Space>
//       ),
//       onCell: () => ({
//         style: {
//           minWidth: 150, // Minimum width for the Add Field column
//         },
//       }),
//     },
//   ];
//   const getFieldIdByName = (fieldName) => {
//     const field = data?.getTemplateById?.fields.find(
//       (f) => f.fieldName === fieldName,
//     );
//     return field ? field.id : null;
//   };
//   const getFieldTypeByFieldId = (fieldId) => {
//     const field = data?.getTemplateById?.fields.find((f) => f.id === fieldId);
//     return field ? field.fieldType : null;
//   };

//   const getTableEntries = () =>
//     tableData.map((row) =>
//       Object.entries(row).map(([fieldName, value]) => {
//         const fieldId = getFieldIdByName(fieldName);
//         const fieldType = getFieldTypeByFieldId(fieldId);

//         let finalValue = String(value);

//         if (fieldType === 'OPTIONS') {
//           if (Array.isArray(value)) {
//             finalValue = value.join(',');
//           }
//         }

//         if (fieldType === 'CHECKBOXES') {
//           if (Array.isArray(value)) {
//             finalValue = value.join(',');
//           }
//         }

//         return {
//           fieldId,
//           value: finalValue,
//         };
//       }),
//     );

//   const getPropertyValues = () =>
//     Object.keys(propertiesData).map((propertyName) => ({
//       propertyId: data.getTemplateById.properties.find(
//         (prop) => prop.propertyName === propertyName,
//       )?.id, // Find the propertyId from the property name
//       value: String(propertiesData[propertyName]),
//     }));

//   const handleSave = async () => {
//     try {
//       const tableEntries = getTableEntries();
//       const propertyValues = getPropertyValues();
// // eslint-disable-next-line no-console
// // console.log(tableEntries);
//       const response = await submitResponse({
//         variables: {
//           templateId,
//           tableEntries,
//           propertyValues,
//         },
//       });

//       if (response.data.submitResponse.success) {
//         alert('Response submitted successfully!');
//       } else {
//         alert(`Error: ${response.data.submitResponse.message}`);
//       }
//       // eslint-disable-next-line no-shadow
//     } catch (error) {
//       // eslint-disable-next-line no-console
//       console.error('Error submitting response:', error);
//       alert('An error occurred while submitting the response.');
//     }
//   };
//   const paginatedData = tableData.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize,
//   );

//   return (
//     <div>
//       <Header name={data.getTemplateById?.name}/>
//       <Card title="Properties" style={{ marginBottom: 16 }}>
//         {Object.keys(propertiesData).length > 0 ? (
//           Object.entries(propertiesData).map(([propertyName, value]) => (
//             <div key={propertyName} style={{ marginBottom: 8 }}>
//               <strong>{propertyName}: </strong>
//               <span>{value}</span>
//             </div>
//           ))
//         ) : (
//           <p>No properties data available.</p>
//         )}
//         <Button
//           type="link"
//           onClick={() => setIsPropertiesModalVisible(true)}
//           style={{ marginTop: 8, float: 'right' }}
//         >
//           {isPropertiesAdded ? 'Edit Property' : 'Add Property'}
//         </Button>
//       </Card>

//       <div
//         style={{
//           display: 'flex',
//           justifyContent: 'flex-end',
//           marginBottom: 16,
//         }}
//       >
//         <Button type="primary" onClick={handleAddEntry}>
//           + Add entry
//         </Button>
//       </div>
// <div className='table-container'>
//       <Table
//         dataSource={paginatedData}
//         columns={columns}
//         rowKey={(record, index) => index}
//         locale={{ emptyText: 'No data available' }}
//         pagination={false}
//         scroll={{ x: 'max-content' }}
//       />
//       <div
//   style={{
//     display: 'flex',
//     justifyContent: 'space-between',
//     marginTop: 16,

//   }}
// >

//   <Button
//     type="primary"
//     onClick={handleAddEntry}
//     style={{ position: 'relative', left: 1 }}
//   >
//     + Add Entry
//   </Button>
//   <Button type="primary" onClick={handleSave}>
//     Save Response
//   </Button>
// </div>
//       </div>


//       {/* Custom footer for pagination */}
//       <div className="pagination-footer">
//         <div className="pagination-controls">
//           <Pagination
//             current={currentPage}
//             pageSize={pageSize}
//             total={tableData.length}
//             showSizeChanger
//             pageSizeOptions={['5', '10', '25', '50']}
//             onChange={(page, size) => {
//               setCurrentPage(page);
//               setPageSize(size);
//             }}
//           />
//         </div>
//       </div>
//       <AddEntryModal
//   visible={isModalVisible}
//   onCancel={() => setIsModalVisible(false)}
//   onSubmit={(newEntry) => {
//     const updatedData = editingIndex !== null
//       ? tableData.map((entry, i) => (i === editingIndex ? newEntry : entry))
//       : [...tableData, newEntry];

//     setTableData(updatedData);

//     // If it’s a new entry, calculate the last page and set it as the current page
//     if (editingIndex === null) {
//       const totalEntries = updatedData.length;
//       const newPageCount = Math.ceil(totalEntries / pageSize);
//       setCurrentPage(newPageCount);
//     }

//     setIsModalVisible(false);
//     setEditingIndex(null); // Reset editing index after editing
//   }}
//   fields={data?.getTemplateById?.fields || []}
//   initialValues={editingIndex !== null ? tableData[editingIndex] : null} // Pass initial values when editing
// />

//       <PropertiesModal
//         visible={isPropertiesModalVisible}
//         onCancel={() => setIsPropertiesModalVisible(false)}
//         onSubmit={handleSaveProperties}
//         properties={data?.getTemplateById?.properties || []}
//       />
//     </div>
//   );
// };

// export default FillTable;

import { useMutation, useQuery } from '@apollo/client';
import { Button, Card, Checkbox, Form, Input, InputNumber, Pagination, Select, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from './components/Header';
import { SUBMIT_RESPONSE } from './graphql/Mutation';
import { GET_TEMPLATE_BY_ID } from './graphql/Queries';
import './register.less';

const { TextArea } = Input;

const FillTable = () => {
  const { templateId } = useParams();
  const [tableData, setTableData] = useState([]);
  const [propertiesData, setPropertiesData] = useState({});
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [fieldErrors, setFieldErrors] = useState({});
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
    setTableData((prevData) =>
      prevData.map((row, i) =>
        i === index ? { ...row, [fieldName]: value } : row,
      ),
    );
  };

  const handleAddRow = () => {
    const requiredFieldsFilled = tableData.every(row =>
      data?.getTemplateById?.fields.every(field =>
        !field.isRequired || row[field.fieldName],
      ),
    );

    if (!requiredFieldsFilled) {
      alert('Please fill all required fields before adding a new row.');
      return;
    }

    setTableData((prevData) => [...prevData, {}]);
    const newPageCount = Math.ceil((tableData.length + 1) / pageSize);
    setCurrentPage(newPageCount);
  };
  const handleSave = async () => {
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
        alert('Response submitted successfully!');
      } else {
        alert(`Error: ${response.data.submitResponse.message}`);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error submitting response:', error);
      alert('An error occurred while submitting the response.');
    }
  };
  const [propertyErrors, setPropertyErrors] = useState({});
  const requiredValidateProperties = () => {
    // eslint-disable-next-line no-console
    console.log("blurr");
    const errors = {};
    data?.getTemplateById?.properties.forEach((property) => {
      const value = propertiesData[property.propertyName];

      // Validation for required fields
      if (property.isRequired && !value) {
        errors[property.propertyName] = 'This field is required';
      }
    })
    setPropertyErrors(errors);
  }

  const validateProperties = () => {
    const errors = {};
    data?.getTemplateById?.properties.forEach((property) => {
      const value = propertiesData[property.propertyName];
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
            onBlur={requiredValidateProperties}
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
          onBlur={requiredValidateProperties}
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
    onBlur={requiredValidateProperties}
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
                  onBlur={requiredValidateProperties}
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
            onBlur={requiredValidateProperties}
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
    const errors = {};
    tableData.forEach((row, rowIndex) => {
      data.getTemplateById?.fields.forEach((field) => {
        const value = row[field.fieldName];
        if (field.fieldType === 'TEXT' && value?.length > 100) {
          errors[`${field.fieldName}-${rowIndex}`] = 'Text must be less than 100 characters';
        }
        if (field.fieldType === 'MULTI_LINE_TEXT' && value?.length > 750) {
          errors[`${field.fieldName}-${rowIndex}`] = 'Text must be less than 100 characters';
        }
        // eslint-disable-next-line no-restricted-globals
        if (field.fieldType === 'NUMERIC' && isNaN(value)) {
          errors[`${field.fieldName}-${rowIndex}`] = 'Value must be a valid number';
        }
      });
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0; // Return whether there are no errors
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
  const columns = data?.getTemplateById?.fields.map((field) => ({
    title: field.fieldName,
    dataIndex: field.fieldName,
    key: field.id,
    render: (_, record, index) =>
      renderField(field.fieldType, index, field.fieldName, record[field.fieldName]),
  })) || [];

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
          Object.entries(propertiesData).map(([propertyName, value]) => (
            <div key={propertyName} style={{ marginBottom: 8 }}>
              <strong>{propertyName}: </strong>
              {renderPropertyField(
                data?.getTemplateById.properties.find((p) => p.propertyName === propertyName).propertyFieldType,
                propertyName,
              )}
            </div>
          ))
        ) : (
          <p>No properties data available.</p>
        )}
      </Card>
      <div>

      <Table
        dataSource={paginatedData}
        columns={data?.getTemplateById?.fields.map((field) => ({
          title: field.fieldName,
          dataIndex: field.fieldName,
          render: (text, record, index) => renderField(field.fieldType, field.fieldName, index),
        }))}
        rowKey="id"
        pagination={false}

      />
    </div>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' ,padding:'10px'}}>
      <Button onClick={handleAddRow}>Add Row</Button>
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
