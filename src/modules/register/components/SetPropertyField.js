import React, { useEffect, useRef } from 'react';
import { Input, Select, Checkbox, Form, Dropdown, Button, Space } from 'antd';

const { TextArea } = Input;

const inputStyle = {
  width: '100%',
  maxWidth: '500px',
  padding: '8px',
  height: '30px',
  border: '1px solid #d9d9d9',
  boxSizing: 'border-box',
};

// padding: '2px',
// borderRadius: '4px',

const SetPropertyField = ({
  propertyType,
  propertyName,
  propertiesData,
  setPropertiesData,
  validateProperties,
  propertyErrors,
  selectRef,
  setOpenedIndex,
  openedIndex,
  data,
}) => {
  const errorMessage = propertyErrors[propertyName];
  const hasError = !!errorMessage;
  const handleOpenChange = (open) => {
    if (open) {
      setOpenedIndex(`0-${propertyName}`);
    } else {
      setOpenedIndex(false);
    }
  };
  const renderField = () => {
    switch (propertyType) {
      case 'TEXT':
        return (
          <Input
            style={inputStyle}
            value={propertiesData[propertyName] || ''}
            onChange={(e) => {
              const { value } = e.target;
              setPropertiesData((prev) => ({
                ...prev,
                [propertyName]: value,
              }));
              validateProperties(propertyName, value);
            }}
            placeholder='Input text'
          />
        );
      case 'MULTI_LINE_TEXT':
        return (
          <TextArea
            style={{ ...inputStyle, height: 'auto' }}
            rows={4}
            value={propertiesData[propertyName] || ''}
            onChange={(e) => {
              const { value } = e.target;
              setPropertiesData((prev) => ({
                ...prev,
                [propertyName]: value,
              }));
              validateProperties(propertyName, value);
            }}
            placeholder='Input multi line text'
          />
        );
      case 'OPTIONS':
        return (
          <Select
            style={{ ...inputStyle, borderRadius: '0px', border: 'none',boxSizing: 'unset',marginLeft: '0px'}}
            ref={selectRef}
            placeholder="Select options"
            value={propertiesData[propertyName]|| undefined}
            onChange={(value) => {
              setPropertiesData((prev) => ({
                ...prev,
                [propertyName]: value,
              }));
              validateProperties(propertyName, value);
              setOpenedIndex(false);
            }}
            open={openedIndex === `0-${propertyName}`}
            onFocus={() => setOpenedIndex(`0-${propertyName}`)}
            onBlur={() => setOpenedIndex(false)}
            onDropdownVisibleChange={handleOpenChange}
          >
            {data?.getTemplateById?.properties
              .find((p) => p.propertyName === propertyName)
              ?.options.map((option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}
          </Select>
        );
      case 'NUMERIC':
        return (
          <Input
            style={inputStyle}
            value={propertiesData[propertyName] || ''}
            placeholder='Input number'
            onChange={(e) => {
              const { value } = e.target;
              setPropertiesData((prev) => ({
                ...prev,
                [propertyName]: value,
              }));
              validateProperties(propertyName, value);
            }}
          />
        );
  case 'CHECKBOXES': {
    return (
      <div>
        <Select
          mode="multiple"
          style={{ ...inputStyle, borderRadius: '4px', border: 'none',boxSizing: 'unset',
            height: 'auto',
            overflow: 'auto'}}
          placeholder="Select Multiple options"
          value={
            Array.isArray(propertiesData[propertyName])
              ? propertiesData[propertyName]
              : (propertiesData[propertyName] || "").split(",").filter(Boolean)
          }
          onChange={(selectedOptions) => {
            setPropertiesData((prev) => ({
              ...prev,
              [propertyName]: selectedOptions,
            }));
            validateProperties(propertyName, selectedOptions.length > 0);
          }}
          open={openedIndex === `0-${propertyName}`}
          onFocus={() => setOpenedIndex(`0-${propertyName}`)}
          onBlur={() => setOpenedIndex(false)}
        >
          {data?.getTemplateById?.properties
            .find((p) => p.propertyName === propertyName)
            ?.options.map((option, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Select.Option key={index} value={option}>
                {option}
              </Select.Option>
            ))}
        </Select>
      </div>
    );
  }
        case 'DATE':
        return (
          <Input
            style={inputStyle}
            type="date"
            value={propertiesData[propertyName] || ''}
            onChange={(e) => {
              const { value } = e.target;
              setPropertiesData((prev) => ({
                ...prev,
                [propertyName]: value,
              }));

              validateProperties(propertyName, value);
            }}
            onClick={(e) => e.target.showPicker()}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Form.Item
      validateStatus={hasError ? 'error' : ''}
      help={hasError ? errorMessage : null}
    >
      {renderField()}
    </Form.Item>
  );
};

export default SetPropertyField;
