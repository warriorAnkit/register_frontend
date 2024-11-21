import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import React from 'react';
import FieldIcon from './FieldIcon';



const TableColumn = ({ field, isEditing, onEdit, onDelete }) => (
    <div>
      <FieldIcon fieldType={field.propertyFieldType} />

      <span>{field.fieldName}</span>
      {field.isRequired && <span>*</span>}
      {isEditing && (
        <>
          <EditOutlined onClick={() => onEdit(field)} />
          <DeleteOutlined onClick={() => onDelete(field.fieldName)} />
        </>
      )}
    </div>
  );

export default TableColumn;
