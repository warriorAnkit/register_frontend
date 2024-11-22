/* eslint-disable no-restricted-globals */


// import React from 'react';
// import { Modal, Form, Input, DatePicker, Select, InputNumber, Button, Upload, Checkbox } from 'antd';
// import { UploadOutlined } from '@ant-design/icons';

// const AddEntryModal = ({ visible, onCancel, onSubmit, fields }) => {
//   const [form] = Form.useForm();

//   const handleOk = () => {
//     form.validateFields()
//       .then(values => {
//         onSubmit(values);
//         form.resetFields(); // Only reset fields if validation succeeds
//       })
//       .catch(info => {
//         // eslint-disable-next-line no-console
//         console.log('Validation Failed:', info);
//       });
//   };

//   const handleNumericChange = (value, fieldName) => {
//     if (value && isNaN(value)) {
//       form.setFields([
//         {
//           name: fieldName,
//           errors: [`${fieldName} must be a valid number`],
//         },
//       ]);
//     } else {
//       form.setFields([
//         {
//           name: fieldName,
//           errors: [], // Clear errors if the input is valid
//         },
//       ]);
//     }
//   };

//   return (
//     <Modal
//       title="Add Entry"
//       visible={visible}
//       onCancel={() => {
//         form.resetFields();
//         onCancel();
//       }}
//       footer={[
//         <Button key="cancel" onClick={() => {
//           form.resetFields();
//           onCancel();
//         }}>
//           Cancel
//         </Button>,
//         <Button key="submit" type="primary" onClick={handleOk}>
//           Save
//         </Button>,
//       ]}
//     >
//       <Form form={form} layout="vertical">
//         {fields.map(field => (
//           <Form.Item
//             key={field.id}
//             label={field.fieldName}
//             name={field.fieldName}
//             rules={[
//               { required: field.isRequired, message: `${field.fieldName} is required` },
//               ...(field.fieldType === 'NUMERIC'
//                 ? [{
//                     validator: (_, value) => {
//                       if (value && isNaN(value)) {
//                         // eslint-disable-next-line prefer-promise-reject-errors
//                         return Promise.reject(`${field.fieldName} must be a valid number`);
//                       }
//                       return Promise.resolve();
//                     },
//                   }]
//                 : []),
//               ...(field.fieldType === 'DATE_PICKER'
//                 ? [{ type: 'date', message: `${field.fieldName} must be a valid date` }]
//                 : []),
//             ]}
//           >
//             {field.fieldType === 'TEXT' && <Input maxLength={field.maxLength} />}
//             {field.fieldType === 'MULTI_LINE_TEXT' && <Input.TextArea maxLength={field.maxLength} />}
//             {field.fieldType === 'NUMERIC' && (
//               <Input
//                 style={{ width: '100%' }}
//                 min={0}
//                 value={form.getFieldValue(field.fieldName)} // Keep the value synced with form
//                 onBlur={(e) => handleNumericChange(e.target.value, field.fieldName)} // Use onBlur to trigger validation
//                 // onChange={(value) => handleNumericChange(value, field.fieldName)} // Optionally use onChange if you want to handle live validation
//               />
//             )}
//             {field.fieldType === 'OPTIONS' && (
//               <Select>
//                 {field.options.map(option => (
//                   <Select.Option key={option} value={option}>{option}</Select.Option>
//                 ))}
//               </Select>
//             )}
//             {field.fieldType === 'DATE_PICKER' && <DatePicker style={{ width: '100%' }} />}
//             {field.fieldType === 'CHECKBOXES' && (
//               <Checkbox.Group style={{ width: '100%' }}>
//                 {field.options.map(option => (
//                   <Checkbox key={option} value={option}>
//                     {option}
//                   </Checkbox>
//                 ))}
//               </Checkbox.Group>
//             )}
//             {field.fieldType === 'ATTACHMENT' && (
//               <Upload
//                 multiple
//                 showUploadList={false}
//                 beforeUpload={() => false}
//               >
//                 <Button icon={<UploadOutlined />}>Upload Files</Button>
//               </Upload>
//             )}
//             {field.fieldType === 'CALCULATION' && (
//               <InputNumber
//                 style={{ width: '100%' }}
//                 value={field.calculationValue}
//                 disabled
//               />
//             )}
//           </Form.Item>
//         ))}
//       </Form>
//     </Modal>
//   );
// };

// export default AddEntryModal;
import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, InputNumber, Button, Upload, Checkbox } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const AddEntryModal = ({ visible, onCancel, onSubmit, fields, initialValues }) => {
  const [form] = Form.useForm();

  // Use initial values to set fields when editing
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields(); // Reset form if adding a new entry
    }
  }, [initialValues, form]);

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        onSubmit(values);
        form.resetFields(); // Only reset fields if validation succeeds
      })
      .catch(info => {
        // eslint-disable-next-line no-console
        console.log('Validation Failed:', info);
      });
  };

  const handleNumericChange = (value, fieldName) => {
    if (value && isNaN(value)) {
      form.setFields([
        {
          name: fieldName,
          errors: [`${fieldName} must be a valid number`],
        },
      ]);
    } else {
      form.setFields([
        {
          name: fieldName,
          errors: [], // Clear errors if the input is valid
        },
      ]);
    }
  };

  return (
    <Modal
      title={initialValues ? "Edit Entry" : "Add Entry"}
      visible={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={[
        <Button key="cancel" onClick={() => {
          form.resetFields();
          onCancel();
        }}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          Save
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        {fields.map(field => (
          <Form.Item
            key={field.id}
            label={field.fieldName}
            name={field.fieldName}
            rules={[
              { required: field.isRequired, message: `${field.fieldName} is required` },
              ...(field.fieldType === 'NUMERIC'
                ? [{
                    validator: (_, value) => {
                      if (value && isNaN(value)) {
                        // eslint-disable-next-line prefer-promise-reject-errors
                        return Promise.reject(`${field.fieldName} must be a valid number`);
                      }
                      return Promise.resolve();
                    },
                  }]
                : []),
              ...(field.fieldType === 'DATE'
                ? [{ type: 'date', message: `${field.fieldName} must be a valid date` }]
                : []),
            ]}
          >
            {field.fieldType === 'TEXT' && <Input maxLength={field.maxLength} />}
            {field.fieldType === 'MULTI_LINE_TEXT' && <Input.TextArea maxLength={field.maxLength} />}
            {field.fieldType === 'NUMERIC' && (
              <Input
                style={{ width: '100%' }}
                min={0}
                value={form.getFieldValue(field.fieldName)}
                onBlur={(e) => handleNumericChange(e.target.value, field.fieldName)}
              />
            )}
            {field.fieldType === 'OPTIONS' && (
              <Select>
                {field.options.map(option => (
                  <Select.Option key={option} value={option}>{option}</Select.Option>
                ))}
              </Select>
            )}
            {field.fieldType === 'DATE' && <Input type="date" /> }
            {field.fieldType === 'CHECKBOXES' && (
              <Checkbox.Group style={{ width: '100%' }}>
                {field.options.map(option => (
                  <Checkbox key={option} value={option}>
                    {option}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            )}
            {field.fieldType === 'ATTACHMENT' && (
              <Upload
                multiple
                showUploadList={false}
                beforeUpload={() => false}
              >
                <Button icon={<UploadOutlined />}>Upload Files</Button>
              </Upload>
            )}
            {field.fieldType === 'CALCULATION' && (
              <InputNumber
                style={{ width: '100%' }}
                value={field.calculationValue}
                disabled
              />
            )}
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
};

export default AddEntryModal;
