import React, { useState } from 'react';
import { Card, Input, Select, Checkbox, Form, Button, DatePicker } from 'antd';
import { useMutation } from '@apollo/client';
import { format } from 'date-fns';
import moment from 'moment';
import { EDIT_SET } from '../graphql/Mutation';

const { TextArea } = Input;
const ShowPropertyComponent = ({ templateData, propertiesData, setPropertiesData,initialPropertiesData,isEditing,setIsEditing,setId ,responseData}) => {

  const [isExpanded, setIsExpanded] = useState(false);
  const [openedIndex, setOpenedIndex] = useState(false);
  const [propertyErrors, setPropertyErrors] = useState({});
  const [editSet] = useMutation(EDIT_SET);

  const handleExpandClick = () => {
    setIsExpanded((prev) => !prev);
  };
  const handleDiscardClick = () => {
    setPropertiesData(initialPropertiesData);
    setIsEditing(false);
    setPropertyErrors({});
  };
  const validateProperties = (propertyName, value) => {
    const errors = { ...propertyErrors };
    const property = templateData.getTemplateById?.properties.find(
      (f) => f.propertyName === propertyName,
    );

    if (
      property.isRequired &&
      (value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0))
    ) {
      /* empty */
    } else {
      delete errors[property.propertyName];
    }
    if (property.propertyFieldType === 'TEXT' && value?.length > 100) {
      errors[property.propertyName] = 'Text must be less than 100 characters';
    }
    else {
      delete errors[property.propertyName];
    }
    if (
      property.propertyFieldType === 'MULTI_LINE_TEXT' &&
      value?.length > 750
    ) {
      errors[property.propertyName] = 'Text must be less than 750 characters';
    }
    else {
      delete errors[property.propertyName];
    }
    // eslint-disable-next-line no-restricted-globals
    if (property.propertyFieldType === 'NUMERIC' && isNaN(value)) {
      errors[property.propertyName] = 'Value must be a valid number';
    }
    else {
      delete errors[property.propertyName];
    }
    if (property.propertyFieldType === 'NUMERIC') {
      const numericRegex = /^\d{1,15}(\.\d{1,2})?$/; // Matches up to 15 digits before the decimal and up to 2 digits after
// eslint-disable-next-line no-console

      if (!numericRegex.test(value)) {
        errors[property.propertyName] = 'Value must be a valid number with up to 15 digits before the decimal and up to 2 digits after.';
      } else {
        delete errors[property.propertyName];
      }
    }
    setPropertyErrors(errors);
    return Object.keys(errors).length === 0; // Return whether there are no errors
  };

  const finalValidateProperties = () => {
    const errors = {};
    templateData?.getTemplateById?.properties.forEach((property) => {
      const value = propertiesData[property.propertyName];

      if (
        property.isRequired &&
        (value === undefined ||
          value === null ||
          (typeof value === 'string' && value.trim() === '') ||
          (Array.isArray(value) && value.length === 0))
      ){
        errors[property.propertyName] = 'This field is required.';
      }

      if (property.isRequired && property.propertyFieldType === 'TEXT' && value?.length > 100) {
        errors[property.propertyName] = 'Text must be less than 100 characters';
      }

      if (property.isRequired &&
        property.propertyFieldType === 'MULTI_LINE_TEXT' &&
        value?.length > 750
      ) {
        errors[property.propertyName] = 'Text must be less than 750 characters';
      }

      // eslint-disable-next-line no-restricted-globals
      if (property.isRequired && property.propertyFieldType === 'NUMERIC' && isNaN(value)) {
        errors[property.propertyName] = 'Value must be a valid number';
      }
      if (property.isRequired && property.propertyFieldType === 'NUMERIC') {
        const numericRegex = /^\d{1,15}(\.\d{1,2})?$/; // Matches up to 15 digits before the decimal and up to 2 digits after
        if (!numericRegex.test(value)) {
          errors[property.propertyName] = 'Value must be a valid number with up to 15 digits before the decimal and up to 2 digits after.';
        }
      }
    });

    setPropertyErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };
  const handleEditClick = () => {
    if (isEditing) {
      const isValid = finalValidateProperties();
      if (isValid) {
        const propertyValues = Object.keys(propertiesData).map((propertyName) => {
          const propertyId = templateData.getTemplateById.properties.find(
            (prop) => prop.propertyName === propertyName,
          )?.id;
        if(!propertyId){
          return;
           }
          const responseId = responseData.getAllResponsesForSet.propertyResponses?.find(
            (propResponse) => propResponse.propertyId === propertyId,
          )?.id;

          return {
            propertyId,
            value: String(propertiesData[propertyName]),
            responseId: responseId || null,
          };
        })
        .filter(Boolean);
// eslint-disable-next-line no-console
console.log(propertyValues);

        const response = editSet({
          variables: {
            setId,
            propertyValues,
        },
      });

        setIsEditing((prev) => !prev);
      } else {
        // eslint-disable-next-line no-console
        console.log("Validation failed! Please correct the errors.");
      }
    } else {
      setIsEditing((prev) => !prev);
    }
  };
  const renderPropertyField = (propertyType, propertyName) => {
    const errorMessage = propertyErrors[propertyName];
    const hasError = !!errorMessage;

    return (
      <Form.Item
        validateStatus={hasError ? 'error' : ''}
        help={hasError ? errorMessage : null}
        style={{ marginBottom: 16 }}
      >
        {propertyType === 'TEXT' && !isEditing && (
          <span>{propertiesData[propertyName] || '-'}</span>
        )}
        {propertyType === 'TEXT' && isEditing && (
          <Input
            value={propertiesData[propertyName] || ''}
            onChange={(e) => {
              const { value } = e.target;
              setPropertiesData((prev) => ({
                ...prev,
                [propertyName]: value,
              }));
              validateProperties(propertyName, value);
            }}
            style={{ width: '100%', maxWidth: '500px', padding: '8px', height: '30px' }}
            placeholder='input text'
          />
        )}

        {propertyType === 'MULTI_LINE_TEXT' && !isEditing && (
          <span>{propertiesData[propertyName] || '-'}</span>
        )}
        {propertyType === 'MULTI_LINE_TEXT' && isEditing && (
          <TextArea
            rows={4}
            value={propertiesData[propertyName] || ''}
            onChange={(e) => {
              const { value } = e.target;
              if (value.length <= 750) {
                setPropertiesData((prev) => ({
                  ...prev,
                  [propertyName]: value,
                }));
                validateProperties(propertyName, value);
              }
            }}
            placeholder='input multiline text'
            style={{ width: '100%', maxWidth: '500px', padding: '8px', borderRadius: '4px' }}
          />
        )}

        {propertyType === 'OPTIONS' && !isEditing && (
          <span>{propertiesData[propertyName] || '-'}</span>
        )}
        {propertyType === 'OPTIONS' && isEditing && (
          <Select
            value={propertiesData[propertyName] || undefined}
            onChange={(value) => {
              setPropertiesData((prev) => ({
                ...prev,
                [propertyName]: value,
              }));
              validateProperties(propertyName, value);
              setOpenedIndex(false);
            }}
            style={{
              width: '100%',
              maxWidth: '500px',
              height: '28px', // Match the height
              borderRadius: '4px', // Add border radius for consistency
              boxSizing: 'border-box', // Match box sizing
            }}
            open={openedIndex === `0-${propertyName}`}
            onFocus={() => setOpenedIndex(`0-${propertyName}`)}
            onBlur={() => setOpenedIndex(false)}
          placeholder='select an option'
          showSearch
          filterOption={(input, option) =>
            option?.children.toLowerCase().includes(input.toLowerCase()) // Custom filter logic
           }
          >
            {templateData?.getTemplateById.properties
              .find((p) => p.propertyName === propertyName)
              ?.options.map((option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}

          </Select>
        )}

        {propertyType === 'NUMERIC' && !isEditing && (
          <span>{propertiesData[propertyName] || '-'}</span>
        )}
        {propertyType === 'NUMERIC' && isEditing && (
          <Input
            value={propertiesData[propertyName] || ''}
            onChange={(e) => {
              const { value } = e.target;
              setPropertiesData((prev) => ({
                ...prev,
                [propertyName]: value,
              }));
              validateProperties(propertyName, value);
            }}
            style={{ width: '100%', maxWidth: '500px', padding: '8px', height: '30px' }}
            placeholder='input number'
          />
        )}

        {propertyType === 'CHECKBOXES' && !isEditing && (
          <span>
          {Array.isArray(propertiesData[propertyName])
            ? propertiesData[propertyName].join(", ")
            : propertiesData[propertyName] || '-'}
        </span>
        )}
      {propertyType === 'CHECKBOXES' && isEditing && (
  <div>
    <Select
      mode="multiple"
      style={{
        borderRadius: '4px',
        border: 'none',
        boxSizing: 'unset',
        height: 'auto',
        overflow: 'auto',
      }}
      placeholder="Select options"
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
      {templateData?.getTemplateById.properties
        .find((p) => p.propertyName === propertyName)
        ?.options.map((option, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Select.Option key={index} value={option}>
            {option}
          </Select.Option>
        ))}
    </Select>
  </div>
)}


{propertyType === 'DATE' && !isEditing && (
  <span>{moment(propertiesData[propertyName]).format('DD/MM/YYYY')}</span>
)}
{propertyType === 'DATE' && isEditing && (
  <Input
    style={{ width: '100%', maxWidth: '500px', padding: '8px', height: '30px' }}
    type="date"
    value={propertiesData[propertyName] || ''}
    onClick={(e) => e.target.showPicker()}
    onChange={(e) => {
      const { value } = e.target;
      setPropertiesData((prev) => ({
        ...prev,
        [propertyName]: value,
      }));
      validateProperties(propertyName, value);
    }}
  />
)}
      </Form.Item>
    );
  };

  return (
    <Card title="Properties" style={{ marginBottom: 16, flexShrink: 0 }}>
      {Object.keys(propertiesData).length > 0 ? (
        <>
          {Object.entries(propertiesData)
            .slice(0, isExpanded ? propertiesData.length : 3)
            .map(([propertyName, value]) => {
              const property = templateData?.getTemplateById.properties.find(
                (p) => p.propertyName === propertyName,
              );
              const isRequired = property?.isRequired;
              return (
                <div key={propertyName} style={{ marginBottom: 8 }}>
                  {property && (<>
                  <strong>
                    {propertyName}
                    {isRequired && <span style={{ color: 'red' }}> *</span>}
                  </strong>
                  { renderPropertyField(
                    property.propertyFieldType,
                    propertyName,
                  )}
                  </>)}
                </div>
              );
            })}
         {Object.keys(propertiesData).length > 3 && !isExpanded && (
          <Button type="default" onClick={handleExpandClick}>
            More
          </Button>
        )}
        {isExpanded && (
          <Button type="default" onClick={handleExpandClick}>
            Less
          </Button>
        )}
        </>
      ) : (
        <p>No properties data available.</p>
      )}
      <Button type="primary" onClick={handleEditClick} style={{ marginTop: 16 ,marginLeft:8}}>
        {isEditing ? 'Save' : 'Edit'}

      </Button>
      {isEditing && (
          <Button onClick={handleDiscardClick} style={{ marginBottom: 16, marginLeft: 8 }}>
            Discard
          </Button>
        )}
    </Card>
  );
};

export default ShowPropertyComponent;
