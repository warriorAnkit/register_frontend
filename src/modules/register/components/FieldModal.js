import React from 'react';
import { Modal, Input, Select, Switch, Button, Space } from 'antd';

const FieldModal = ({ visible, onSave, onCancel, fieldData, onFieldDataChange, onAddOption }) => (
    <Modal
      title={fieldData.name ? 'Edit Field' : 'Add Field'}
      visible={visible}
      onOk={onSave}
      onCancel={onCancel}
      okText="Save"
      cancelText="Cancel"
    >
      <Input
        value={fieldData.name}
        onChange={(e) => onFieldDataChange({ ...fieldData, name: e.target.value })}
        placeholder="Field Name"
      />
      <Select
        value={fieldData.type}
        onChange={(value) => onFieldDataChange({ ...fieldData, type: value })}
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

      {fieldData.type === 'OPTIONS' || fieldData.type === 'CHECKBOXES' ? (
        <>
          <div style={{ marginTop: '16px' }}>
            <strong>Options</strong>
            {fieldData.options.map((option, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Space key={index} style={{ display: 'flex', marginBottom: '8px' }}>
                <Input
                  value={option}
                  onChange={(e) =>
                    onFieldDataChange({
                      ...fieldData,
                      options: fieldData.options.map((opt, idx) =>
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
          checked={fieldData.required}
          onChange={(checked) => onFieldDataChange({ ...fieldData, required: checked })}

        />
      </div>
    </Modal>
  );

export default FieldModal;
