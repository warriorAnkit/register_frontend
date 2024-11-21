// PropertyField.js
import React, { useState } from 'react';
import { Button, Form, Input, Select, Tag } from 'antd';

const { Option } = Select;

const PropertyField = ({ onAddField }) => {
  const [options, setOptions] = useState([]);
  const [inputOption, setInputOption] = useState('');

  const handleAddField = (values) => {
    const fieldWithOptions = { ...values, options: values.fieldType === 'options' ? options : undefined };
    onAddField(fieldWithOptions);
    setOptions([]);
  };

  const handleAddOption = () => {
    if (inputOption && !options.includes(inputOption)) {
      setOptions([...options, inputOption]);
      setInputOption('');
    }
  };

  const handleRemoveOption = (option) => {
    setOptions(options.filter((opt) => opt !== option));
  };

  return (
    <Form onFinish={handleAddField}>
      <Form.Item name="fieldName" label="Field Name" rules={[{ required: true }]}>
        <Input placeholder="Enter field name" />
      </Form.Item>

      <Form.Item name="fieldType" label="Field Type" rules={[{ required: true }]}>
        <Select placeholder="Select field type">
          <Option value="text">Text</Option>
          <Option value="multiLineText">Multi-line Text</Option>
          <Option value="options">Options (Radio Buttons)</Option>
          <Option value="checkboxes">Checkboxes</Option>
          <Option value="numeric">Numeric</Option>
          <Option value="date">Date Picker</Option>
          <Option value="attachment">Attachment</Option>
          <Option value="calculation">Calculation</Option>
        </Select>
      </Form.Item>

      {/* Options input */}
      {(options.length > 0 || options.length < 20) && (
        <>
          <Form.Item label="Options">
            <Input
              value={inputOption}
              onChange={(e) => setInputOption(e.target.value)}
              placeholder="Enter an option"
              style={{ width: '70%', marginRight: '10px' }}
            />
            <Button type="primary" onClick={handleAddOption} disabled={options.length >= 20}>
              Add Option
            </Button>
          </Form.Item>
          <div>
            {options.map((option, index) => (
              <Tag
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                closable
                onClose={() => handleRemoveOption(option)}
                style={{ marginRight: '5px' }}
              >
                {option}
              </Tag>
            ))}
          </div>
        </>
      )}
    </Form>
  );
};

export default PropertyField;
