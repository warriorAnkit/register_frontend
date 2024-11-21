import React from 'react';
import { Modal, Input, Select, Switch, Button, Space } from 'antd';

const PropertyModal = ({ visible, onSave, onCancel, propertyData, onPropertyDataChange, onAddOption }) => (
    <Modal
      title={propertyData.name ? 'Edit Property' : 'Add Property'}
      visible={visible}
      onOk={onSave}
      onCancel={onCancel}
      okText="Save"
      cancelText="Cancel"
    >
      <Input
        value={propertyData.name}
        onChange={(e) => onPropertyDataChange({ ...propertyData, name: e.target.value })}
        placeholder="Property Name"
      />
      <Select
        value={propertyData.type}
        onChange={(value) => onPropertyDataChange({ ...propertyData, type: value })}
        style={{ width: '100%', marginTop: '16px' }}
      >
        <Select.Option value="TEXT">Text</Select.Option>
        <Select.Option value="MULTI_LINE_TEXT">Multi-line Text</Select.Option>
        <Select.Option value="OPTIONS">Options</Select.Option>
        <Select.Option value="CHECKBOXES">Checkboxes</Select.Option>
        <Select.Option value="NUMERIC">Numeric</Select.Option>
        <Select.Option value="DATE_PICKER">Date Picker</Select.Option>
        <Select.Option value="ATTACHMENT">Attachment</Select.Option>
      </Select>

      {propertyData.type === 'OPTIONS' || propertyData.type === 'CHECKBOXES' ? (
        <>
          <div style={{ marginTop: '16px' }}>
            <strong>Options</strong>
            {propertyData.options.map((option, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Space key={index} style={{ display: 'flex', marginBottom: '8px' }}>
                <Input
                  value={option}
                  onChange={(e) =>
                    onPropertyDataChange({
                      ...propertyData,
                      options: propertyData.options.map((opt, idx) =>
                        idx === index ? e.target.value : opt,
                      ),
                    })
                  }
                  placeholder={`Option ${index + 1}`}
                />
              </Space>
            ))}
            <Button type="link" onClick={onAddOption}>
              Add Option
            </Button>
          </div>
        </>
      ) : null}

      <div style={{ marginTop: '16px' }}>
        <strong>Required</strong>
        <Switch
          checked={propertyData.required}
          onChange={(checked) => onPropertyDataChange({ ...propertyData, required: checked })}
        />
      </div>
    </Modal>
  );

export default PropertyModal;
