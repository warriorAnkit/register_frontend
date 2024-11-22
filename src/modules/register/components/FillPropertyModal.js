/* eslint-disable react/no-array-index-key */

import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Form, Select, Checkbox, InputNumber } from 'antd';

const { TextArea } = Input;

const PropertiesModal = ({ visible, onCancel, onSubmit, properties }) => {
  const [form] = Form.useForm();
// eslint-disable-next-line no-console

  // Initialize form values when the modal opens
  useEffect(() => {
    if (visible && properties && properties.length > 0) {
      const initialData = properties.reduce((acc, property) => {
        acc[property.propertyName] = ''; // Initialize properties with blank values
        return acc;
      }, {});
      form.setFieldsValue(initialData); // Set initial form values
    }
  }, [visible, properties, form]);

  const handleSave = () => {
    form.validateFields().then(values => {
      // Collect all form values and pass them to onSubmit
      const updatedProperties = Object.keys(values).map((key) => ({
        propertyName: key,
        value: values[key], // Save value for the property
      }));
      onSubmit(updatedProperties); // Call onSubmit to save the updated properties
    });
  };

  // Render input fields based on property type
  const renderInputField = (propertyType, propertyName) => {
    switch (propertyType) {
      case 'TEXT':
        return <Input />;
      case 'MULTI_LINE_TEXT':
        return <TextArea rows={4} />;
      case 'OPTIONS':
        return (
          <Select>
            {properties.find(prop => prop.propertyName === propertyName)?.options?.map((option, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Select.Option key={index} value={option}>
                {option}
              </Select.Option>
            ))}
          </Select>
        );
      case 'CHECKBOXES':
        return properties.find(prop => prop.propertyName === propertyName)?.options?.map((option, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Checkbox key={index} value={option}>
            {option}
          </Checkbox>
        ));
      case 'NUMERIC':
        return <InputNumber min={0} />;
      case 'DATE':
        return <Input type="date" />;
      case 'CALCULATION':
        return <Input   defaultValue="*" />;
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      title="Manage Property"
      onCancel={onCancel}
      onOk={handleSave}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSave}>
          Save
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        {properties?.map((property) => (
          <Form.Item
            key={property.id}
            name={property.propertyName}
            label={property.propertyName}
            initialValue=""
            rules={[
              { required: property.isRequired, message: `${property.propertyName} is required` },
            ]}
          >
            {renderInputField(property.propertyFieldType, property.propertyName)}
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
};

export default PropertiesModal;
