// import React, { useEffect } from 'react';
// import { Modal, Form, Input, Select, DatePicker, Checkbox } from 'antd';

// const AddModal = ({ visible, onSave, onCancel, fieldData, initialValues }) => {
//   const [form] = Form.useForm();

//   useEffect(() => {
//     if (initialValues) {
//       form.setFieldsValue(initialValues); // Set initial form values if editing
//     } else {
//       form.resetFields(); // Clear form if adding a new entry
//     }
//   }, [initialValues, form]);

//   const handleOk = () => {
//     form
//       .validateFields()
//       .then((values) => {
//         onSave(values);
//         form.resetFields();
//       })
//       .catch((info) => {
//         // eslint-disable-next-line no-console
//         console.log('Validation Failed:', info);
//       });
//   };

//   return (
//     <Modal title={initialValues ? 'Edit Entry' : 'Add Entry'} visible={visible} onOk={handleOk} onCancel={onCancel}>
//       <Form form={form} layout="vertical">
//         {fieldData.map((field) => {
//           switch (field.fieldType) {
//             case 'TEXT':
//               return (
//                 <Form.Item key={field.id} name={field.id} label={field.fieldName}>
//                   <Input maxLength={field.maxLength} />
//                 </Form.Item>
//               );
//             case 'NUMERIC':
//               return (
//                 <Form.Item key={field.id} name={field.id} label={field.fieldName}>
//                   <Input />
//                 </Form.Item>
//               );
//             case 'OPTIONS':
//               return (
//                 <Form.Item key={field.id} name={field.id} label={field.fieldName}>
//                   <Select>
//                     {field.options.map((option, index) => (
//                       // eslint-disable-next-line react/no-array-index-key
//                       <Select.Option key={index} value={option}>
//                         {option}
//                       </Select.Option>
//                     ))}
//                   </Select>
//                 </Form.Item>
//               );
//             case 'CHECKBOXES':
//               return (
//                 <Form.Item key={field.id} name={field.id} label={field.fieldName} valuePropName="checked">
//                   <Checkbox>{field.fieldName}</Checkbox>
//                 </Form.Item>
//               );
//             case 'DATE_PICKER':
//               return (
//                 <Form.Item key={field.id} name={field.id} label={field.fieldName}>
//                   <DatePicker format="DD/MM/YYYY" />
//                 </Form.Item>
//               );
//             default:
//               return null;
//           }
//         })}
//       </Form>
//     </Modal>
//   );
// };

// export default AddModal;
import { Checkbox, Form, Input, Modal, Select } from 'antd';
import React, { useEffect } from 'react';

const AddModal = ({ visible, onSave, onCancel, fieldData, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      // Prepare initial values in the correct format for Ant Design form
      const formattedValues = {};
      Object.keys(initialValues).forEach((key) => {
        const field = initialValues[key];

        // If field type is CHECKBOXES and value is a comma-separated string, split it into an array
        if (field.value && field.fieldType === 'CHECKBOXES') {
          formattedValues[key] = field.value.split(','); // Convert to array of checked values
        } else if (field.value) {
          formattedValues[key] = field.value;
        }
      });

      form.setFieldsValue(formattedValues); // Set initial form values
    } else {
      form.resetFields(); // Clear form if adding a new entry
    }
  }, [initialValues, form]);
// eslint-disable-next-line no-console


  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        // Prepare data to save
        const dataToSave = {};
        const rowNumber = initialValues ? initialValues.rowNumber : undefined; // Keep the rowNumber if editing

        Object.keys(values).forEach((key) => {
          // eslint-disable-next-line no-shadow
          const field = fieldData.find((field) => field.id === key); // Get field data by field id
          const currentResponseId = initialValues ? initialValues[key]?.responseId : null; // Get the current responseId (from initial values)

          // If it's a new row (initialValues is undefined), set responseId to null for all fields
          if (!initialValues) {
            // New entry logic: Set responseId to null as it's a new entry
            dataToSave[key] = {
              value: values[key], // Store the value from the form
              responseId: null, // New row doesn't have responseId yet
            };
          } else {
            // Existing row logic
            // eslint-disable-next-line no-lonely-if
            if (values[key] && !initialValues[key]?.value) {
              // Newly populated field in an existing row
              dataToSave[key] = {
                value: values[key], // Store the value from the form
                responseId: null, // Newly populated field in an existing row should have responseId as null
              };
            } else {
              // Preserve the responseId for existing fields
              dataToSave[key] = {
                value: values[key], // Store the value from the form
                responseId: currentResponseId !== null ? currentResponseId : undefined, // Keep responseId for existing rows, null for new ones
              };
            }
          }
        });

        // Handle rowNumber for new entries
        if (rowNumber) {
          dataToSave.rowNumber = rowNumber;
        }

        // If it's a new entry (no initial values), don't add rowNumber yet.
        // Send the formatted data to onSave
        onSave(dataToSave);

        // Reset fields after saving
        form.resetFields();
      })
      .catch((info) => {
        // eslint-disable-next-line no-console
        console.log('Validation Failed:', info);
      });
  };
  return (
    <Modal
      title={initialValues ? 'Edit Entry' : 'Add Entry'}
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        {fieldData.map((field) => {
          const fieldProps = {
            key: field.id,
            name: field.id,
            label: field.fieldName,
          };

          // Define validation rules based on field type
          const rules = [
            { required: field.isRequired, message: `${field.fieldName} is required` },
            ...(field.fieldType === 'NUMERIC'
              ? [
                  {
                    validator: (_, value) => {
                      // eslint-disable-next-line no-restricted-globals
                      if (value && isNaN(value)) {
                        // If value is not a number, reject validation
                        // eslint-disable-next-line prefer-promise-reject-errors
                        return Promise.reject(`${field.fieldName} must be a valid number`);
                      }
                      return Promise.resolve();
                    },
                  },
                ]
              : []),
            ...(field.fieldType === 'DATE'
              ? [{ type: 'date', message: `${field.fieldName} must be a valid date` }]
              : []),
          ];

          switch (field.fieldType) {
            case 'TEXT':
              return (
                <Form.Item {...fieldProps} rules={rules}>
                  <Input maxLength={field.maxLength} />
                </Form.Item>
              );
            case 'NUMERIC':
              return (
                <Form.Item {...fieldProps} rules={rules}>
                  <Input maxLength={field.maxLength} />
                </Form.Item>
              );
            case 'OPTIONS':
              return (
                <Form.Item {...fieldProps} rules={rules}>
                  <Select>
                    {field.options.map((option, index) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <Select.Option key={index} value={option}>
                        {option}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              );
             case 'CHECKBOXES':
              return (
                <Form.Item {...fieldProps} valuePropName="checked" rules={rules}>
                  <Checkbox.Group style={{ width: '100%' }}>
                    {field.options.map((option) => (
                      <Checkbox key={option} value={option}>
                        {option}
                      </Checkbox>
                    ))}
                  </Checkbox.Group>
                </Form.Item>
              );
            case 'DATE':
              return (
                <Form.Item {...fieldProps} rules={rules}>
               <Input
        type="date"
        style={{ width: '100%' }}
        placeholder={`Select ${field.fieldName}`}
      />
                </Form.Item>
              );
            default:
              return null;
          }
        })}
      </Form>
    </Modal>
  );
};

export default AddModal;
