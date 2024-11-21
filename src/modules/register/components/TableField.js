// TableField.js
import React, { useState } from 'react';
import { Button, Form, Input, Select } from 'antd';

const { Option } = Select;

const TableField = ({ onAddField }) => {
  const [columns, setColumns] = useState([]);

  const handleAddColumn = (values) => {
    setColumns([...columns, values]);
  };

  const handleSubmit = () => {
    onAddField({ type: 'table', columns });
    setColumns([]); // Reset columns after adding
  };

  return (
    <div>
      <h3>Configure Table Field</h3>
      <Form onFinish={handleAddColumn}>
        <Form.Item name="columnName" label="Column Name" rules={[{ required: true }]}>
          <Input placeholder="Enter column name" />
        </Form.Item>

        <Form.Item name="columnType" label="Column Type" rules={[{ required: true }]}>
          <Select placeholder="Select column type">
            <Option value="text">Text</Option>
            <Option value="numeric">Numeric</Option>
            <Option value="date">Date</Option>
            <Option value="options">Options</Option>
            <Option value="checkboxes">Checkboxes</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Add Column
          </Button>
        </Form.Item>
      </Form>

      <Button type="primary" onClick={handleSubmit} style={{ marginTop: '20px' }}>
        Save Table Field
      </Button>

      {/* Display configured columns */}
      <div>
        <h4>Configured Columns</h4>
        {columns.map((col, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index}>
            {col.columnName} - {col.columnType}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableField;
