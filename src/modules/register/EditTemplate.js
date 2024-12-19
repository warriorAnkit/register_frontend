/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable react/no-array-index-key */
import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';
import {
  Button,
  Divider,
  Input,
  List,
  Modal,
  notification,
  Select,
  Space,
  Switch,
  Table,
  Typography,
  message,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { ROUTES } from '../../common/constants';
import FieldIcon from './components/FieldIcon';
import Header from './components/Header';
import { CHANGE_TEMPLATE_STATUS, UPDATE_TEMPLATE } from './graphql/Mutation';
import { GET_TEMPLATE_BY_ID } from './graphql/Queries';
import './register.less';

const { Title, Text } = Typography;



const TemplateView = () => {
  const { templateId } = useParams();

  const { loading, error, data } = useQuery(GET_TEMPLATE_BY_ID, {
    variables: { id: templateId },
    fetchPolicy: 'cache-and-network',
  });

  const [updateTemplate] = useMutation(UPDATE_TEMPLATE);
  const [changeTemplateStatus] = useMutation(CHANGE_TEMPLATE_STATUS);

  const [isEditing, setIsEditing] = useState(true);
  const [isFieldModalVisible, setIsFieldModalVisible] = useState(false);
  const [isPropertyModalVisible, setIsPropertyModalVisible] = useState(false);
  const [fields, setFields] = useState([]);
  const [numericFields, setNumericFields] = useState([]);
  const [properties, setProperties] = useState([]); // State to manage properties
  const [currentField, setCurrentField] = useState(null);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [templateStatus, setTemplateStatus] = useState('');
  const navigate=useNavigate();
  const [fieldData, setFieldData] = useState({
    name: '',
    type: 'TEXT',
    required: true,
    options: [],
  });
  const [propertyData, setPropertyData] = useState({
    name: '',
    type: 'TEXT',
    required: true,
    options: [],
  });
  const inputRefs = useRef([]);
  useEffect(() => {
    if (data) {
      setTemplateName(data.getTemplateById.name);
      setTemplateStatus(data.getTemplateById.status);
      const cleanData = (obj) => {
        const { __typename, deletedAt, ...rest } = obj;
        return rest;
      };

      setFields(
        data.getTemplateById.fields
          .filter((field) => !field.deletedAt)
          .map(cleanData),
      );
      setProperties(
        data.getTemplateById.properties.map(cleanData),
      );
    }
  }, [data]);
  useEffect(() => {
    const filteredFields = fields.filter((field) => field.fieldType === 'NUMERIC');
    setNumericFields(filteredFields);
  }, [fields]);
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isEditing) {

        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handlePopState = () => {
      if (isEditing) {
        // eslint-disable-next-line no-alert
        const userConfirmed = window.confirm("You have unsaved changes. Are you sure you want to leave?");
        if (userConfirmed) {
          // Allow navigation by not pushing any state
          return;
        }
          // Push the state again to prevent navigating back
           window.history.pushState(null, "", window.location.href);

      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);


    return () => {

      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isEditing]);


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const toggleEditMode = () => {
    if (isEditing) {
      Modal.confirm({
        title: 'Are you sure you want to discard unsaved changes?',
        content: 'All newly added properties and fields will be removed.',
        okText: 'Yes, discard',
        cancelText: 'No, keep editing',
        onOk: () => {

          setProperties((prevProperties) => prevProperties.filter((property) => property.id));
          setFields((prevFields) => prevFields.filter((field) => field.id));
          setIsEditing(false);
        },
      });
    } else {
      setIsEditing(true);
    }
  };

  const showFieldEditModal = (field = null) => {
    setCurrentField(field);
    setFieldData(
      field
        ? {
            name: field.fieldName,
            type: field.fieldType,
            required: field.isRequired,
            options: field.options || [],
          }
        : { name: '', type: 'TEXT', required: true, options: [] },
    );
    setIsFieldModalVisible(true);
  };


  const focusLastInput = () => {
    if (inputRefs.current.length > 0) {
      const lastInput = inputRefs.current[inputRefs.current.length - 1];
      lastInput?.focus();
    }
  };
  const handleFieldSave = () => {
    if (!fieldData.name || fieldData.name.trim() === '') {
      message.error('Field Name is required.');
      return;
    }
    if (fieldData.name.length > 50) {
      message.error('Field Name cannot exceed 50 characters.');
      return;
    }
    if (
      fields.some(
        (f) => f.fieldName === fieldData.name && (f.tempId !== currentField?.tempId||f.id !== currentField?.id),
      )
    )
     {
      notification.error({
        message: 'Duplicate Field Name',
        description: `The field name "${fieldData.name}" already exists as a field.`,
        duration: 3,
      });
      return;
    }
    if (
      (fieldData.type === 'OPTIONS' || fieldData.type === 'CHECKBOXES') &&
      fieldData.options.length === 0
    ) {

      notification.error({
        message: 'Failed to add',
        description: 'Please add at least one option.',
        duration: 3,
      });
      return; // Prevent further action if no options are provided
    }
    if (
      (fieldData.type === 'OPTIONS' || fieldData.type === 'CHECKBOXES') &&
      fieldData.options.some((option) => !option.trim())
    ) {
      notification.error({
        message: 'Invalid Options',
        description: 'Blank options are not allowed.',
        duration: 3,
      });
      return;
    }
    if (currentField) {
      if (currentField.id) {
        setFields((prevFields) =>
          prevFields.map((f) =>
            f.id === currentField.id
              ? {
                  ...f,
                  fieldName: fieldData.name,
                  fieldType: fieldData.type,
                  isRequired: fieldData.required,
                  options: fieldData.options,
                }
              : f,
          ),
        );
      }

      else if (currentField.tempId) {
        setFields((prevFields) =>
          prevFields.map((f) =>
            f.tempId === currentField.tempId
              ? {
                  ...f,
                  fieldName: fieldData.name,
                  fieldType: fieldData.type,
                  isRequired: fieldData.required,
                  options: fieldData.options,
                }
              : f,
          ),
        );
      }
    } else {
      // If there's no currentField (new field), create a new one with a tempId
      const newField = {
        tempId: uuidv4(),
        fieldName: fieldData.name,
        fieldType: fieldData.type,
        isRequired: fieldData.required,
        options: fieldData.options,
      };
      setFields((prevFields) => [...prevFields, newField]);
    }

    setIsFieldModalVisible(false);
    setFieldData({ name: '', type: 'TEXT', required: false, options: [] });
  };

  const handleFieldCancel = () => {
    setIsFieldModalVisible(false);
  };

  const handleFieldTypeChange = (type) => {
    setFieldData({
      ...fieldData,
      type,
      options:
        type === 'OPTIONS' || type === 'CHECKBOXES' ? [] : fieldData.options,
    });
  };

  const handleAddFieldOption = () => {
    if (fieldData.options.length >= 20) {
      message.warning('You can only add up to 20 options.');
      return;
    }
    if (fieldData.options.length > 0 && fieldData.options[fieldData.options.length - 1].trim() === '') {
      message.error('Please fill the previous option before adding a new one.');
      return;
    }
    const trimmedOptions = fieldData.options.map((option) => option.trim());
  if (new Set(trimmedOptions).size !== trimmedOptions.length) {
    message.error('Duplicate options are not allowed.');
    return;
  }

    setFieldData({ ...fieldData, options: [...fieldData.options, ''] });
    setTimeout(() => focusLastInput(), 0);
  };
  const handleRemoveFieldOption = (indexToRemove) => {
    if (fieldData.options.length > 1) {
      const updatedOptions = fieldData.options.filter(
        (_, index) => index !== indexToRemove,
      );
      setFieldData({ ...fieldData, options: updatedOptions });

      // Update input refs to keep them in sync
      inputRefs.current.splice(indexToRemove, 1);

      // Focus on the last input after removing an option
      setTimeout(() => focusLastInput(), 0);
    }
  };
  const handleAddPropertyOption = () => {
    if (propertyData.options.length >= 20) {
      message.warning('You can only add up to 20 options.');
      return;
    }
    if (propertyData.options.length > 0 && propertyData.options[propertyData.options.length - 1].trim() === '') {
      message.error('Please fill the previous option before adding a new one.');
      return;
    }
    const trimmedOptions = propertyData.options.map((option) => option.trim());
  if (new Set(trimmedOptions).size !== trimmedOptions.length) {
    message.error('Duplicate options are not allowed.');
    return;
  }
    setPropertyData({
      ...propertyData,
      options: [...propertyData.options, ''],
    });
    setTimeout(() => focusLastInput(), 0);
  };
  const handleRemovePropertyOption = (indexToRemove) => {
    if (propertyData.options.length > 1) {
      const updatedOptions = propertyData.options.filter(
        (_, index) => index !== indexToRemove,
      );
      setPropertyData({ ...propertyData, options: updatedOptions });
      inputRefs.current.splice(indexToRemove, 1);
      setTimeout(() => focusLastInput(), 0);
    }
  };
  const confirmSave = () => {
    Modal.confirm({
      title: 'Are you sure?',
      content: 'Are you sure you want to save the changes of register?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: handleSaveAll,
      onCancel: () => {
        console.log('Save canceled');
      },
    });
  };
  const handleSaveAll = async () => {
    const invalidCalculationFields = fields.filter(
      (field) =>
        field.fieldType === 'CALCULATION' &&
        !validateFormulaFields(field.options, fields).isValid,
    );

    if (invalidCalculationFields.length > 0) {
      notification.error({
        message: 'Validation Error',
        description: `Invalid formula in the following fields: ${invalidCalculationFields
          .map((field) => field.fieldName)
          .join(', ')}`,
      });
      return;
    }

    const updatedFields = fields.map((field) => {
      if (field.fieldType === 'CALCULATION') {
        const { isValid, convertedFormula } = validateFormulaFields(field.options, fields);
        if (isValid) {
          return { ...field, options: convertedFormula };
        }

        return field; // Otherwise, return the field as it is
      }
      return field; // Return non-calculation fields as they are
    });

    const transformedfields = updatedFields.map(item => {

      if (item.tempId) {
          const { tempId, ...rest } = item;
          return rest;
      }
      return item; // Return the original item if no tempId
  });
  const transformedProperties = properties.map(item => {

    if (item.tempId) {
        const { tempId, ...rest } = item;
        return rest;
    }
    return item; // Return the original item if no tempId
});
    const allData = {
      id: templateId,
      name:templateName,
      fields:transformedfields,
      properties:transformedProperties,
    };

    try {
      const response = await updateTemplate({ variables: allData });

      setIsEditing(false);
      if(response.data.updateTemplate.message){
        notification.success({
          message: 'Register updated',
          description: `The  Register is now updated and saved`,
        });
      }
      // eslint-disable-next-line no-shadow
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating template:', error.message);
    }
  };
  const handleFieldOptionChange = (value, index) => {


    const newOptions = [...fieldData.options];
    newOptions[index] = value;
    setFieldData({ ...fieldData, options: newOptions });
  };
  const handleFieldDelete = (fieldName) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this field?',
      content: `This will permanently delete the field "${fieldName}".`,
      okText: 'Yes, delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        setFields((prevFields) =>
          prevFields.filter((field) => field.fieldName !== fieldName),
        );
      },
    });
  };
  const handlePropertyOptionChange = (value, index) => {
    const newOptions = [...propertyData.options]; // Create a copy of the current options
    newOptions[index] = value; // Update the specific option at the provided index
    setPropertyData({ ...propertyData, options: newOptions }); // Update the state with the new options array
  };

  // Property Modal Functions
  const showPropertyEditModal = (property = null) => {
    setCurrentProperty(property);
    setPropertyData(
      property
        ? {
            name: property.propertyName,
            type: property.propertyFieldType,
            required: property.isRequired,
            options: property.options || [],
          }
        : { name: '', type: 'TEXT', required: true, options: [] }, // Default required: true
    );
    setIsPropertyModalVisible(true);
  };

  const handlePropertySave = () => {
    if (!propertyData.name || propertyData.name.trim() === '') {
      message.error('Property Name is required.');
      return;
    }
    if (propertyData.name.length > 100) {
      message.error('Property Name cannot exceed 100 characters.');
      return;
    }
    if (
      properties.some((p) => p.propertyName === propertyData.name && ( p.tempId !== currentProperty?.tempId||p.id !== currentProperty?.id))
    ) {
      notification.error({
        message: 'Duplicate property Name',
        description: `The property name "${propertyData.name}" already exists as a property.`,
        duration: 3,
      });
      return;
    }
    if (
      (propertyData.type === 'OPTIONS' || propertyData.type === 'CHECKBOXES') &&
      propertyData.options.length === 0
    ) {
      notification.error({
        message: 'Failed to add',
        description: 'Please add at least one option.',
        duration: 3,
      });
      return; // Prevent further action if no options are provided
    }
    if (
      (propertyData.type === 'OPTIONS' || propertyData.type === 'CHECKBOXES') &&
      propertyData.options.some((option) => !option.trim())
    ) {
      notification.error({
        message: 'Invalid Options',
        description: 'Blank options are not allowed.',
        duration: 3,
      });
      return;
    }
    if(currentProperty){
    if (currentProperty.id) {
      setProperties((prevProperties) =>
        prevProperties.map((p) =>
          p.id === currentProperty.id
            ? {
                ...p,
                propertyName: propertyData.name,
                propertyFieldType: propertyData.type,
                isRequired: propertyData.required,
                options: propertyData.options,
              }
            : p,
        ),
      );
    }
   else  if (currentProperty.tempId) {
      setProperties((prevProperties) =>
        prevProperties.map((p) =>
          p.tempId === currentProperty.tempId
            ? {
                ...p,
                propertyName: propertyData.name,
                propertyFieldType: propertyData.type,
                isRequired: propertyData.required,
                options: propertyData.options,
              }
            : p,
        ),
      );
    }
  }
  else {
      const newProperty = {
        tempId:uuidv4(),
        propertyName: propertyData.name,
        propertyFieldType: propertyData.type,
        isRequired: propertyData.required,
        options: propertyData.options,
      };
      setProperties((prevProperties) => [...prevProperties, newProperty]);
    }

    setIsPropertyModalVisible(false);
    setPropertyData({ name: '', type: 'TEXT', options: [], isRequired: true });
  };

  const handlePropertyCancel = () => {
    setIsPropertyModalVisible(false);
  };

  // const replaceFieldIdsWithNames = (formula, numericFields) => {
  //   return formula.replace(/\b\d+\b/g, (fieldId) => {
  //     const field = numericFields.find((f) => f.id === parseInt(fieldId, 10));
  //     return field ? `"${field.fieldName}"` : fieldId;
  //   });
  // };
  const validateFormulaFields = (formula) => {
    // Convert field IDs to field names
    const convertedFormula = replaceFieldIdsWithNames(formula);

    console.log("Converted Formula:", convertedFormula);

    // Extract any remaining numbers in the formula (these represent unconverted IDs)
    // const remainingIds = convertedFormula.match(/\b\d+\b/g);
    const unconvertedIds = convertedFormula.replace(/"([^"]*)"/g, ''); // Remove strings inside quotes
    const remainingIds = unconvertedIds.match(/\b\d+\b/g);
console.log(remainingIds);
    if (remainingIds && remainingIds.length > 0) {
      return {
        isValid: false,
        errorMessage: `The formula contains invalid or unconverted field IDs: ${remainingIds.join(', ')}`,
      };
    }

    // Extract field names from the converted formula
    const fieldNamesInFormula = convertedFormula.match(/"([^"]*)"/g)?.map((name) => name.replace(/"/g, '')) || [];
console.log(fieldNamesInFormula);
    // Check if the extracted field names exist in numericFields
    const invalidFields = fieldNamesInFormula.filter(
      (fieldName) => !numericFields.some((field) => field.fieldName === fieldName),
    );

    if (invalidFields.length > 0) {
      return {
        isValid: false,
        errorMessage: `The following fields are invalid or deleted: ${invalidFields.join(', ')}`,
      };
    }

    return { isValid: true, convertedFormula };
  };
  const handlePropertyTypeChange = (type) => {
    setPropertyData({ ...propertyData, type });
  };
  const handlePropertyDelete = (propertyName) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this property?',
      content: `This will permanently delete the property "${propertyName}".`,
      okText: 'Yes, delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {

        setProperties((prevProperties) =>
          prevProperties.filter((property) => property.propertyName !== propertyName),
        );
      },
    });
  };
  const replaceFieldIdsWithNames = (formula) => {
    if (!formula) return '';
    let updatedFormula = String(formula);

    numericFields.forEach((field) => {
      const regex = new RegExp(`\\b${field.id}\\b`, 'g');  // Match exact field ID
      updatedFormula = updatedFormula.replace(regex, `"${field.fieldName}"`);  // Replace ID with field name
    });

    return updatedFormula;
  };

  const columns = [
    ...fields.map((field) => ({
      title: (
        <span>
              <FieldIcon fieldType={field.fieldType} />

          <span style={{ marginLeft: '4px' }}>{field.fieldName} </span>
          {field.isRequired && <span style={{ color: 'red' }}>*</span>}
          {isEditing && (
            <>
              <EditOutlined
                style={{ marginLeft: '8px', cursor: 'pointer' }}
                onClick={() => showFieldEditModal(field)}
              />
              <DeleteOutlined
                style={{ marginLeft: '8px', cursor: 'pointer' }}
                onClick={() => handleFieldDelete(field.fieldName)}
              />
            </>
          )}
        </span>
      ),
      dataIndex: field.fieldName.replace(/\s+/g, '').toLowerCase(),
      key: field.id,
      render: (text) => text || <Text type="secondary">No data</Text>,
      onCell: () => ({
        style: {
          minWidth: 150,
        },
      }),
    })),
    ...(isEditing
      ? [
          {
            title: (
              <Button
                type="link"
                icon={<PlusOutlined />}
                style={{ color: 'red' }}
                onClick={() => showFieldEditModal()}
              >
                Add Field
              </Button>
            ),
            dataIndex: 'addField',
            key: 'addField',
            render: () => null,
            onCell: () => ({
              style: {
                minWidth: 150, // Minimum width for the Add Field column
              },
            }),
          },
        ]
      : []),
  ];

  const handleStatusChange = async () => {
    let newStatus;
    const oldStatus = data.getTemplateById.status;

    if (oldStatus === 'LIVE') {
      newStatus = 'ARCHIVED';
    } else if (oldStatus === 'ARCHIVED' || oldStatus === 'DRAFT') {
      newStatus = 'LIVE';
    }
    if (!fields || fields.length === 0) {
      notification.warning({
        message: 'No Fields Added',
        description: 'Please add at least one field before making the Register Live.',
        duration: 3,
      });
      return;
    }
    Modal.confirm({
      title: 'Confirm Status Change',
      content: `Are you sure you want to save the changes of register and change the status from "${oldStatus}" to "${newStatus}"?`,
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        try {
          const saveResult = await handleSaveAll();

          if (!saveResult) {
            return;
          }
          await changeTemplateStatus({
            variables: {
              id: templateId,
              newStatus,
            },
          });
          notification.success({
            message: 'Status Updated',
            description: `The status is now ${newStatus}`,
          });
        // eslint-disable-next-line no-shadow
        } catch (error) {
          console.error('Error changing status:', error.message);
          notification.error({
            message: 'Error',
            description: 'There was an issue updating the status. Please try again.',
          });
        }
      },
      onCancel: () => {
        console.log('Status change canceled.');
      },
    });
  };
  const handleViewChangeLog = () => {
    const changeLogUrl = ROUTES.VIEW_TEMPLATE_CHANGE_LOG.replace(':templateId', templateId);
    navigate(changeLogUrl);

  };
  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFieldOption();
    }
  };


  return (
    <div >
       <Header name={templateName}/>

    <div style={{ padding: '24px' }}>

      <div className='header'>


      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
    {isEditing ? (
  <Input
    value={templateName}
    onChange={(e) => setTemplateName(e.target.value)}
    style={{
      marginBottom: '16px',
      maxWidth: '100%',
      width: 'auto',
      textAlign: 'center',
      fontSize: '1.25rem',
      lineHeight: '1.5',
    }}
    placeholder="Register Name"
    maxLength={50}
  />
) : (
  <Title level={4} style={{ textAlign: 'center', fontSize: '1.25rem' }}>
    {templateName}
  </Title>
)}
</div>
<Button onClick={handleViewChangeLog}>
          View Change Log
        </Button>
</div>
<div style={{ marginTop: '16px' }}>
        <Space
          style={{
            marginTop: '16px',
            float: 'right',
            flexWrap: 'wrap', // Allow buttons to wrap on small screens
            justifyContent: 'center', // Center buttons horizontally
            gap: '10px',
          }}
          className="button-group"
        >
          <Button
            type="primary"
            style={{ backgroundColor: 'red' }}
            onClick={handleStatusChange}
          >
            {templateStatus === 'LIVE' ? 'Archive' : 'Live'}
          </Button>
          <Button
            type="primary"
            style={{ backgroundColor: 'red' }}
            onClick={toggleEditMode}
          >
            {isEditing ? 'Discard' : 'Edit'}
          </Button>
          {isEditing && (
            <Button
              type="primary"
              style={{ backgroundColor: 'red' }}
              onClick={confirmSave}
            >
              Save
            </Button>
          )}
        </Space>
        <div style={{ marginTop: '16px', textAlign: 'left' }}>
          <Text strong>Register Status: </Text>
          <Text style={{ color: templateStatus === 'LIVE' ? 'green' : 'gray' }}>
            {templateStatus}
          </Text>
        </div>
      </div>
      <Title level={4}>Properties</Title>
      <div style={{ marginBottom: '24px' }}>
        {properties.map((property) => (
          <div key={property.id} style={{ marginBottom: '8px' }}>
            <span>

            <FieldIcon fieldType={property.propertyFieldType} />{' '}
              {/* Add the property type icon here */}
              <Text strong>{property.propertyName}</Text>
              {property.isRequired && <span style={{ color: 'red' }}> *</span>}
              {isEditing && (
                <>
                  <EditOutlined
                    style={{ marginLeft: '8px', cursor: 'pointer' }}
                    onClick={() => showPropertyEditModal(property)}
                  />
                  <DeleteOutlined
                    style={{ marginLeft: '8px', cursor: 'pointer' }}
                    onClick={() => handlePropertyDelete(property.propertyName)}
                  />
                </>
              )}
            </span>
          </div>
        ))}
        {isEditing && (
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={() => showPropertyEditModal()}
            style={{ color: 'red' }}
          >
            Add Property
          </Button>
        )}
      </div>

      <Divider />

      <Title level={4}>Table</Title>
      <Table
        columns={columns}
        dataSource={[{}]}
        pagination={false}
        bordered
        scroll={{ x: 'max-content' }}
        style={{ marginTop: '16px' }}
      />


{/* <Space style={{ marginTop: '16px', float: 'right' }}>
        <Button
          type="primary"
          style={{ backgroundColor: 'red' }}
           onClick={handleStatusChange}
        >
          {templateStatus === 'LIVE' ? 'Archive' : 'Live'}
        </Button>
        <Button
          type="primary"
          style={{ backgroundColor: 'red' }}
          onClick={toggleEditMode}
        >
          {isEditing ? 'Discard' : 'Edit'}
        </Button>
        {isEditing && (
          <Button
            type="primary"
            style={{ backgroundColor: 'red' }}
            onClick={handleSaveAll}
          >
            Save
          </Button>
        )}
      </Space> */}
      {/* Field Modal */}
      <Modal
        title={currentField ? 'Edit Field' : 'Add Field'}
        visible={isFieldModalVisible}
        onOk={handleFieldSave}
        onCancel={handleFieldCancel}
        okText="Save"
      >
        <Input
          placeholder="Field Name"
          value={fieldData.name}
          onChange={(e) => setFieldData({ ...fieldData, name: e.target.value })}
          style={{ marginBottom: '16px' }}
        />
        <Select
          value={fieldData.type}
          onChange={handleFieldTypeChange}
          style={{ width: '100%', marginBottom: '16px' }}
        >
          <Select.Option value="TEXT">Text</Select.Option>
          <Select.Option value="MULTI_LINE_TEXT">Multi-Line Text</Select.Option>
          <Select.Option value="OPTIONS">Options</Select.Option>
          <Select.Option value="CHECKBOXES">Checkboxes</Select.Option>
          <Select.Option value="NUMERIC">Numeric</Select.Option>
          <Select.Option value="DATE">Date</Select.Option>
          <Select.Option value="ATTACHMENT">Attachment</Select.Option>
          <Select.Option value="CALCULATION">Calculation</Select.Option>
        </Select>
          <div style={{ marginBottom: '16px' }}>
          <span>Required: </span>
          <Switch
            checked={fieldData.required}
            onChange={(checked) =>
              setFieldData({ ...fieldData, required: checked })
            }
          />
        </div>
        {(fieldData.type === 'OPTIONS' || fieldData.type === 'CHECKBOXES') && (
          <div style={{ marginTop: '16px' }}>
            <Title level={5}>Options</Title>
            <List
              dataSource={fieldData.options}
              renderItem={(option, index) => (
                <List.Item>
                <Input
                 // eslint-disable-next-line no-return-assign
                 ref={(el) => (inputRefs.current[index] = el)}
                  value={option}
                  onChange={(e) =>
                    handleFieldOptionChange(e.target.value, index)
                  }
                  placeholder={`Option ${index + 1}`}
                  style={{ marginBottom: '8px' }}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
                <Button
      type="text"
      icon={<CloseOutlined />}
      onClick={() => handleRemoveFieldOption(index)}
      style={{ marginLeft: '8px' }}
    />
              </List.Item>
              )}
            />
            {fieldData.options.length >= 20 && (
        <div style={{ color: 'red', marginTop: '8px' }}>
          You can add a maximum of 20 options.
        </div>
      )}
            <Button
              type="dashed"
              onClick={handleAddFieldOption}
              icon={<PlusOutlined />}
              style={{ width: '100%' }}
            >
              Add Option
            </Button>
          </div>
        )}
          {fieldData.type === 'CALCULATION' && (
  <div style={{ marginTop: '16px' }}>
    <Title level={5}>Formula</Title>
    <Input
      placeholder="Enter formula (e.g., x + y)"
      value={replaceFieldIdsWithNames(fieldData.options, numericFields)}
      onChange={(e) => setFieldData({ ...fieldData, options: e.target.value })}
      style={{ marginBottom: '16px' }}
    />

    <div style={{ color: 'gray', fontSize: '12px' }}>
      Enter a valid formula using field names (e.g., 'field1 + field2').
    </div>

    <div style={{ marginTop: '16px' }}>
      <div>
        {/* Display numeric fields as buttons */}
        {numericFields.map((field) => (
          <Button
            key={field.id}
            onClick={() => setFieldData({
              ...fieldData,
               options: `${fieldData.options ? fieldData.options : ''}"${field.fieldName}" `, // Add '|' separator here
            })}
            style={{ marginRight: '8px' }}
          >
            {field.fieldName}
          </Button>
        ))}
      </div>

      <div style={{ marginTop: '8px' }}>
        {/* Operator Buttons */}
        {['+', '-', '*', '/', '(', ')'].map((operator) => (
          <Button
            key={operator}
            onClick={() => setFieldData({
              ...fieldData,
              options: `${fieldData.options}${operator}`,  // Add '|' separator here
            })}
            style={{ marginRight: '8px' }}
          >
            {operator}
          </Button>
        ))}
      </div>
    </div>
  </div>
)}
      </Modal>

      <Modal
        title={currentProperty ? 'Edit Property' : 'Add Property'}
        visible={isPropertyModalVisible}
        onOk={handlePropertySave}
        onCancel={handlePropertyCancel}
        okText="Save"
      >
        <Input
          placeholder="Property Name"
          value={propertyData.name}
          onChange={(e) =>
            setPropertyData({ ...propertyData, name: e.target.value })
          }
          style={{ marginBottom: '16px' }}
        />

        <Select
          value={propertyData.type}
          onChange={handlePropertyTypeChange}
          style={{ width: '100%', marginBottom: '16px' }}
        >
          <Select.Option value="TEXT">Text</Select.Option>
          <Select.Option value="MULTI_LINE_TEXT">Multi-Line Text</Select.Option>
          <Select.Option value="OPTIONS">Options</Select.Option>
          <Select.Option value="CHECKBOXES">Checkboxes</Select.Option>
          <Select.Option value="NUMERIC">Numeric</Select.Option>
          <Select.Option value="DATE">Date</Select.Option>

        </Select>


        <div style={{ marginBottom: '16px' }}>
          <span>Required: </span>
          <Switch
            checked={propertyData.required}
            onChange={(checked) =>
              setPropertyData({ ...propertyData, required: checked })
            }
          />
        </div>

        {(propertyData.type === 'OPTIONS' ||
          propertyData.type === 'CHECKBOXES') && (
          <div style={{ marginTop: '16px' }}>
            <Title level={5}>Options</Title>
            <List
              dataSource={propertyData.options}
              renderItem={(option, index) => (
                <List.Item>
                  <Input
                    // eslint-disable-next-line no-return-assign
                    ref={(el) => (inputRefs.current[index] = el)}
                    value={option}
                    onChange={(e) =>
                      handlePropertyOptionChange(e.target.value, index)
                    }
                    placeholder={`Option ${index + 1}`}
                    style={{ marginBottom: '8px' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddPropertyOption(); // Trigger adding an option on Enter key press
                      }
                    }}
                  />
                   <Button
        type="text"
        icon={<CloseOutlined />}
        onClick={() => handleRemovePropertyOption(index)}
        style={{ marginLeft: '8px' }}
      />
                </List.Item>
              )}
            />
            {propertyData.options.length >= 20 && (
        <div style={{ color: 'red', marginTop: '8px' }}>
          You can add a maximum of 20 options.
        </div>
      )}
            <Button
              type="dashed"
              onClick={handleAddPropertyOption}
              icon={<PlusOutlined />}
              style={{ width: '100%' }}
            >
              Add Option
            </Button>
          </div>
        )}
      </Modal>
</div>
    </div>
  );
};

export default TemplateView;
