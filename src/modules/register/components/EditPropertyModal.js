/* eslint-disable import/no-extraneous-dependencies */
import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Form, Checkbox, InputNumber, DatePicker,Select } from 'antd';
import moment from 'moment';

const PropertiesModal = ({ visible, onCancel, onSubmit, properties, fieldData }) => {
  const [form] = Form.useForm();
  const [updatedProperties, setUpdatedProperties] = useState([]);

  useEffect(() => {
    // Initialize form with current property data
    const initialValues = Object.entries(properties).map(([propertyName, value]) => ({
      propertyName,
      value,
    }));
    setUpdatedProperties(initialValues);
  }, [properties]);

  const handleChange = (value, propertyName) => {
    setUpdatedProperties((prevState) =>
      prevState.map((property) =>
        property.propertyName === propertyName ? { ...property, value } : property,
      ),
    );
  };

  const handleSubmit = () => {
    // Convert the updated properties to the expected format and submit
    const updatedPropertiesList = updatedProperties.map((property) => ({
      propertyName: property.propertyName,
      value: property.value,
    }));
    onSubmit(updatedPropertiesList);
  };

  const renderInput = (propertyFieldType, value, propertyName, options) => {
    switch (propertyFieldType) {
      case 'TEXT':
        return <Input value={value} onChange={(e) => handleChange(e.target.value, propertyName)} />;
      case 'MULTI_LINE_TEXT':
        return <Input.TextArea value={value} onChange={(e) => handleChange(e.target.value, propertyName)} />;
      case 'NUMERIC':
        return (
          <InputNumber
            value={value}
            // eslint-disable-next-line no-shadow
            onChange={(value) => handleChange(value, propertyName)}
            min={0}
            max={999999999999999}
            style={{ width: '100%' }}
          />
        );
      case 'CHECKBOXES':
        return (
          <Checkbox.Group
            value={value}
            onChange={(checkedValues) => handleChange(checkedValues, propertyName)}
          >
            {(options || []).map((option) => (
              <Checkbox key={option} value={option}>
                {option}
              </Checkbox>
            ))}
          </Checkbox.Group>
        );


case 'DATE':
  return (
    <Input
      type="date"
      value={value || ''}
      onChange={(e) => handleChange(e.target.value, propertyName)}
    />
  );

        case 'OPTIONS':
        return (
          <Select
            value={value}
            // eslint-disable-next-line no-shadow
            onChange={(value) => handleChange(value, propertyName)}
            style={{ width: '100%' }}
          >
            {(options || []).map((option) => (
              <Select.Option key={option} value={option}>
                {option}
              </Select.Option>
            ))}
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      title="Edit Properties"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Save
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        {updatedProperties.map((property) => {
          // Find the corresponding field data for the property
          // eslint-disable-next-line no-shadow
          const field = fieldData?.find((field) => field.propertyName === property.propertyName);
          const propertyFieldType = field ? field.propertyFieldType : null; // Get the propertyFieldType from fieldData
          const options = field ? field.options : []; // Get options if available

          return (
            <Form.Item
              key={property.propertyName}
              label={property.propertyName}
              name={property.propertyName}
              initialValue={property.value}
            >
              {renderInput(propertyFieldType, property.value, property.propertyName, options)}
            </Form.Item>
          );
        })}
      </Form>
    </Modal>
  );
};

export default PropertiesModal;
