import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import React from 'react';

import FieldIcon from './FieldIcon';

const PropertiesList = ({ properties, isEditing, onEdit, onDelete }) => (
    <div>
      {properties.map((property) => (
        <div key={property.id}>
            <FieldIcon fieldType={property.propertyFieldType} />
            <span>{property.propertyName}</span>
          {property.isRequired && <span>*</span>}
          {isEditing && (
            <>
              <EditOutlined onClick={() => onEdit(property)} />
              <DeleteOutlined onClick={() => onDelete(property.propertyName)} />
            </>
          )}
        </div>
      ))}
    </div>
  );

export default PropertiesList;
