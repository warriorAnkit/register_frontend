
/* eslint-disable no-console */
/* eslint-disable react/no-array-index-key */
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Form, Input, Select, notification, Modal, Button, Table } from 'antd';
import { DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { evaluate } from 'mathjs'; // Ensure the mathjs library is installed
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import ImageUpload from './AttachmentUpload';
import { FIELD_RESPONSE_SUBMIT } from '../graphql/Mutation';
import { ROUTES } from '../../../common/constants';
import './Component.less';
// import ImageUpload from './ImageUpload'; // Import your custom image upload component

const TableFieldComponent =forwardRef(({
  templateData,
  tableData,
  templateId,
  setTableData,
  tableHeight,
  templateError,
  responseError,
  setId,
  filling,
  setIsAllRowsComplete,
},ref) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [openedIndex, setOpenedIndex] = useState(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState(null);
  const navigate = useNavigate();
  const [editResponse] = useMutation(FIELD_RESPONSE_SUBMIT);
  const [attachmentUpdated, setAttachmentUpdated] = useState(null);
  const [rowCompletionStatus, setRowCompletionStatus] = useState([]); // Track row completion status




  // Function to check if all rows are complete
  const checkRowCompletionStatus = () => {
    let allRowsComplete = true; // Assume all rows are complete initially
    const eachRowCompletionStatus = []; // Array to track completion status of each row

    // Iterate over each row to check if it's incomplete
    tableData.forEach((row, rowIndex) => {
      if (rowIndex === tableData.length - 1) {
        eachRowCompletionStatus[rowIndex] = true; // Assume the last row is complete
        return; // Skip further checks for the last row
      }
      const isRowComplete = templateData.getTemplateById?.fields
      .filter((field) => field.isRequired) // Check only required fields
      .every((field) => {
        const value = row[field.id]?.value;
        return value !== null && value !== undefined && value !== '';
      });
      // If the row is blank, mark it as incomplete
      if (!isRowComplete) {
        eachRowCompletionStatus[rowIndex] = false; // Mark as incomplete
        allRowsComplete = false; // At least one row is incomplete
      } else {
        eachRowCompletionStatus[rowIndex] = true; // Row is complete
      }
    });
    setRowCompletionStatus(eachRowCompletionStatus);
    setIsAllRowsComplete(allRowsComplete); // Set the flag for all rows completion status
  };
  useEffect(() => {
    checkRowCompletionStatus(); // Check row completion status on tableData changes
  }, [tableData]);
  const handleRowCompletion = async (rowIndex) => {
    const row = tableData[rowIndex];
     const rowErrors = Object.keys(fieldErrors).filter((key) => {
      const [,rowNumber] = key.split('-');
      return rowNumber === String(rowIndex);
    });

    // If there are errors for the current row, prevent completion
    if (rowErrors.length > 0) {
      console.log('Row has field errors:', rowErrors);
      return; // Exit if there are field errors
    }
    // Focus on the row before checking completion
    const isRowComplete = templateData.getTemplateById?.fields
    .filter((field) => field.isRequired) // Check only required fields
    .every((field) => {
      const value = row[field.id]?.value;
      return value !== null && value !== undefined && value !== '';
    });

    if (isRowComplete) {
      try {



        // Prepare data for API
        const rowEntries = Object.entries(row)
          .map(([fieldId, { value, responseId }]) => ({
            fieldId,
            value: String(value),
            responseId: responseId !== undefined ? responseId : null,
            rowNumber: row.rowNumber,
            isNewRow: row.isNewRow||false,
          }))
          .filter((entry) => entry.fieldId !== 'rowNumber' && entry.fieldId !== 'id'&&entry.fieldId !== 'isNewRow');

 const rowEntries2D = [rowEntries];

        const response = await editResponse({
          variables: {
            setId,
            tableEntries: rowEntries2D,
            filling,
          },
        });

        if (response.data.fieldResponseSubmit.success) {
          const updatedResponses = response.data.fieldResponseSubmit.updatedOrCreatedResponses;

          // Update `tableData` with new response IDs and row numbers
          setTableData((prevData) => {
            const updatedData = [...prevData];
            updatedResponses.forEach((res) => {
              const field = updatedData[rowIndex][res.fieldId];
              updatedData[rowIndex].rowNumber = res.rowNumber;
              if (field) {
                field.responseId = res.responseId; // Update responseId
              }
            });
            return updatedData;
          });


        }

//         } else {
//           notification.error({
//             message: 'Save Error',
//             description: response.data.editResponse.message,
//           });
//         }
      } catch (error) {
        console.error('Error saving row:', error);
        // notification.error({
        //   message: 'Save Error',
        //   description: 'An error occurred while saving the row.',
        // });
      }
    }
    else{
      console.log('row not completed');
    }
  };

  const handleBlur = (index) => {
    handleRowCompletion(index);
  };

  useEffect(() => {
    if (attachmentUpdated !== null) {
      handleBlur(attachmentUpdated);
      setAttachmentUpdated(null);
    }
  }, [tableData,attachmentUpdated]);
  const handleInputChange = (index, fieldName, value,fieldType) => {

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
            updatedData.push({isNewRow: true});
          }
          return updatedData;
        });

        if (fieldType === 'ATTACHMENT') {
          setAttachmentUpdated(index);  // Store the row index
        } else {
          setAttachmentUpdated(null);  // Reset if it's not an attachment
        }
      };
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
      // console.log(`Row ${rowIndex} is blank:`, isRowBlank);
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
          // eslint-disable-next-line no-restricted-globals
          (value === undefined || value === null || isNaN(Number(value)))
        ) {
          errors[`${field.id}-${rowIndex}`] = 'Value must be a valid number.';

        const numericRegex = /^\d{1,15}(\.\d{1,2})?$/; // Matches up to 15 digits before the decimal and up to 2 digits after

        if (!numericRegex.test(value)) {
          errors[`${field.id}-${rowIndex}`] = 'Value must be a valid number with up to 15 digits before the decimal and up to 2 digits after.';
        }
      }
      });
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
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
        // eslint-disable-next-line no-restricted-globals
        if (isNaN(value)) {
          errors[errorKey] = 'Value must be a valid number';
        } else {
          delete errors[errorKey];
        }

      const numericRegex = /^\d{1,15}(\.\d{1,2})?$/; // Matches up to 15 digits before the decimal and up to 2 digits after

      if (!numericRegex.test(value)) {
        errors[errorKey] = 'Value must be a valid number with up to 15 digits before the decimal and up to 2 digits after.';
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
    const fieldValue =
      tableData && tableData[rowIndex][fieldName]
        ? tableData[rowIndex][fieldName].value
        : '';
        // console.log('fieldValue:', fieldValue);
    const calculateFieldValue = () => {
      const fieldData = tableData[rowIndex];
      const fieldOptions = templateData.getTemplateById?.fields.find(
        (f) => f.id === fieldName,
      )?.options;
      if (!fieldOptions || fieldOptions.length === 0) return '';
      const formula = fieldOptions[0];
      // console.log(formula);
      if (!formula) return '';
      try {
        const formulaWithValues = formula.replace(/\b\d+\b/g, (match) => {
          const values = fieldData[match].value;
          // console.log(values);
          return values !== undefined ? values : 0;
        });

        // console.log(formulaWithValues);

        const result = evaluate(formulaWithValues);
        // tableData[rowIndex][fieldName].value=result;

        if (rowIndex < tableData.length - 1) {
          // eslint-disable-next-line no-restricted-globals
          if (result !== undefined && !isNaN(result) && fieldValue !== result) {
            // console.log('ff');
            handleInputChange(rowIndex, fieldName, result); // Update value only if it's different
          }
        }
        return result;
      } catch (error) {
        return '';
      }
    };


    if (templateError || responseError) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Error loading data. Please try again later.</p>
        </div>
      );
    }
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
            placeholder='Input text'
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '8px',
              height: '30px',
              border: '1px solid #d9d9d9',
              boxSizing: 'border-box',
            }}
            onBlur={() => handleBlur(rowIndex)}

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
            placeholder='Input Multi Line Text'
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              boxSizing: 'border-box',
            }}
            onBlur={() => handleBlur(rowIndex)}
          />
        )}

        {fieldType === 'OPTIONS' && (
          <Select
          className="custom-select"
           placeholder="Select an option"
           suffixIcon={<DownOutlined style={{ fontSize: '14px' }} />}
            value={fieldValue}
            onChange={(value) => {
              handleInputChange(rowIndex, fieldName, value);
              validateFields(fieldName, rowIndex, value);
              setOpenedIndex(null);
              // eslint-disable-next-line no-undef
              document.activeElement.blur();
            }}
            style={{
              width: '100%',
              maxWidth: '500px',
               borderRadius: '4px',
              height: '30px',
             boxSizing: 'border-box', // Ensure box-sizing is consistent
            }}
            // onClick={() => setOpenedIndex(`${rowIndex}-${fieldName}`)} // Open dropdown for this index
            onFocus={() => setOpenedIndex(`${rowIndex}-${fieldName}`)} // Open dropdown for this index
            onBlur={() => {
              setOpenedIndex(null); // Close dropdown when focus is lost
              handleBlur(rowIndex);
            }}
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
            onBlur={() => {
              handleBlur(rowIndex);
            }}
            placeholder="input number"
          />
        )}
{fieldType === 'CHECKBOXES' && (
  <div style={{ marginTop: 8 }}>
    <Select
      mode="multiple"
      placeholder="Select multiple options"
      suffixIcon={<DownOutlined style={{ fontSize: '14px' }} />}
      value={
        Array.isArray(tableData[rowIndex][fieldName]?.value)
          ? tableData[rowIndex][fieldName]?.value
          : (tableData[rowIndex][fieldName]?.value || "").split(",").filter(Boolean)
      }
      onChange={(selectedValues) => {
        setTableData((prevData) => {
          const updatedTableData = [...prevData];
          if (!updatedTableData[rowIndex]) {
            updatedTableData[rowIndex] = {};
          }
          if (!updatedTableData[rowIndex][fieldName]) {
            updatedTableData[rowIndex][fieldName] = { value: [] };
          }
          const updatedRow = updatedTableData[rowIndex] || {};

          updatedTableData[rowIndex] = {
            ...updatedRow,
            [fieldName]: { value: selectedValues }, // Update the selected values
          };

          if (
            rowIndex === prevData.length - 1 &&
            Object.values(updatedTableData[rowIndex]).every((val) => val !== '')
          ) {
            updatedTableData.push({}); // Add a new empty row if the last row is filled
          }

          return updatedTableData;
        });

        validateFields(fieldName, rowIndex, selectedValues);
      }}
      onBlur={() => {
        handleBlur(rowIndex);
      }}
      style={{ width: '100%' }}
    >
      {templateData.getTemplateById?.fields
        .find((f) => f.id === fieldName)
        ?.options.map((option, index) => (
          <Select.Option key={index} value={option}>
            {option}
          </Select.Option>
        ))}

    </Select>
  </div>
)}


        {fieldType === 'ATTACHMENT' && (
  <ImageUpload
    onUploadSuccess={(url) => {
      handleInputChange(rowIndex, fieldName, url,fieldType);
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
              boxSizing: 'border-box',
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
            onClick={(e) => e.target.showPicker()}
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              boxSizing: 'border-box', // Ensure box-sizing is consistent
            }}
            onBlur={() => {
              handleBlur(rowIndex);
            }}
          />
        )}
      </Form.Item>
    );
  };
  const handleDeleteRow = (rowIndex) => {
    const row = tableData[rowIndex];

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
      onOk: async () => {
        try {
          if (row.rowNumber) {


            const response = await editResponse({
              variables: {
                rowNumberDelete: row.rowNumber,
                setId,
              },
            });

            if (response.data.fieldResponseSubmit.success) {
              notification.success({
                message: 'Row Deleted',
                description: `Row ${row.rowNumber} deleted successfully!`,
              });
            } else {
              notification.error({
                message: 'Delete Error',
                description: response.data.deleteRow.message,
              });
              return;
            }
          }

          // Remove the row locally in both cases
          const newData = [...tableData];
          newData.splice(rowIndex, 1);
          setTableData(newData);
        } catch (error) {
          console.error('Error deleting row:', error);
          notification.error({
            message: 'Delete Error',
            description: 'An error occurred while deleting the row.',
          });
        }
      },
    });
  };
  const columns = [
    {
      title: 'Index',
      key: 'index',
      render: (text, record, index) => index + 1,
       width: 70,
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

   const isFieldValid = finalValidateFields();

    if (!isFieldValid) {
      // eslint-disable-next-line no-undef
      notification.error({
        message: 'Validation Error',
        description: 'Please fix the errors before submitting.',
      });
      return;
    }
    try {

    notification.success({
      message: 'Success',
      description: 'Your response has been successfully submitted!',
    });

    // Navigate to another page after successful submission

    navigate(ROUTES.VIEW_ENTRIES.replace(':templateId', templateId));
    } catch (error) {
      console.error('Error submitting response:', error);
      notification.error({
        message: 'Submission Error',
        description: 'An error occurred while submitting the response.',
      });
    }
  };
  useImperativeHandle(ref, () => ({
    handleSave,
  }));
  return (
    <>
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
    {/* <div
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
  </div> */}
  </>
  );
});

export default TableFieldComponent;
