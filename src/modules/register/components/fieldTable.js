import React from 'react';
import { Table, Button } from 'antd';

const FieldsTable = ({ fields, onEdit, onDelete }) => {
  const columns = [
    { title: 'Field Name', dataIndex: 'fieldName', key: 'fieldName' },
    { title: 'Field Type', dataIndex: 'fieldType', key: 'fieldType' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, field) => (
        <>
          <Button type="link" onClick={() => onEdit(field)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => onDelete(field.id)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return <Table dataSource={fields} columns={columns} rowKey="id" />;
};

export default FieldsTable;
