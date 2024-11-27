/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect } from 'react';
import {
  Table,
  Typography,
  Button,
  Space,
  Divider,
  Modal,
  Input,
  Select,
  Switch,
  List,
} from 'antd';
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useParams} from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_GLOBAL_TEMPLATE_BY_ID } from './graphql/Queries';
import { CHANGE_TEMPLATE_STATUS, CREATE_TEMPLATE } from './graphql/Mutation';

import './register.less';
import FieldIcon from './components/FieldIcon';
import { GET_PROJECT_ID_FOR_USER } from '../Dashboard/graphql/Queries';
import { ROUTES } from '../../common/constants';
// import FieldModal from './components/FieldModal';
// import PropertiesModal from './components/FillPropertyModal';
// import PropertyModal from './components/PropertyModal';

const { Title, Text } = Typography;



const GlobalTemplateView = () => {
  const { globalTemplateId } = useParams();

  const { loading, error, data } = useQuery(GET_GLOBAL_TEMPLATE_BY_ID, {
    variables: { id: globalTemplateId },
    fetchPolicy: 'cache-and-network',
  });
  const {

    loading: loadingProject,
    error: errorProject,
    data: dataProject,

  } = useQuery(GET_PROJECT_ID_FOR_USER);

  const [createTemplate] = useMutation(CREATE_TEMPLATE);
  const [changeTemplateStatus] = useMutation(CHANGE_TEMPLATE_STATUS);

  const [isEditing, setIsEditing] = useState(false);
  const [isFieldModalVisible, setIsFieldModalVisible] = useState(false);
  const [isPropertyModalVisible, setIsPropertyModalVisible] = useState(false);
  const [fields, setFields] = useState([]);
  const [properties, setProperties] = useState([]); // State to manage properties
  const [currentField, setCurrentField] = useState(null);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [templateStatus, setTemplateStatus] = useState('');

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


  useEffect(() => {
    if (data) {
      setTemplateName(data.getGlobalTemplateById.name);
      setTemplateStatus(data.getGlobalTemplateById.status);
      const cleanData = (obj) => {
        const { __typename, deletedAt, ...rest } = obj; // Destructure to exclude __typename and deletedAt
        return rest; // Return the object without __typename and deletedAt
      };

      setFields(
        data.getGlobalTemplateById.fields
          .filter((field) => !field.deletedAt) // Keep fields where deletedAt is falsy
          .map(cleanData), // Apply cleanData to fields
      );
      setProperties(
        data.getGlobalTemplateById.properties.map(cleanData), // Apply cleanData to properties
      );
    }
  }, [data]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isEditing) {

        e.preventDefault();
        e.returnValue = ''; // Required for the confirmation dialog to appear
      }
    };

    // const handlePopState = () => {
    //   if (isEditing) {
    //     // eslint-disable-next-line no-alert
    //     const userConfirmed = window.confirm("You have unsaved changes. Are you sure you want to leave?");
    //     if (userConfirmed) {
    //       // Allow navigation by not pushing any state
    //       return;
    //     }
    //       // Push the state again to prevent navigating back
    //        window.history.pushState(null, "", window.location.href);

    //   }
    // };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);


    return () => {

      window.removeEventListener('beforeunload', handleBeforeUnload);
      // window.removeEventListener('popstate', handlePopState);
    };
  }, [isEditing]);


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;



  const projectId = dataProject ? dataProject.getProjectIdForUser : null;

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

  // Field Modal Functions
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

  const handleFieldSave = () => {
    if (currentField) {
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
    } else {
      const newField = {
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
    setFieldData({ ...fieldData, options: [...fieldData.options, ''] });
  };
  const handleAddPropertyOption = () => {
    setPropertyData({
      ...propertyData,
      options: [...propertyData.options, ''],
    });
  };
  const handleSaveAll = async () => {
    const allData = {
      name: templateName,
      projectId,
      templateType: 'GLOBAL',
      fields: fields.map(({ id, ...rest }) => rest),
       properties: properties.map(({ id, ...rest }) => rest),
    };

    try {
      const response = await createTemplate({ variables: allData });
      setIsEditing(false);
      if (response.data.createTemplate.message==='Template Created succesfully') {
        navigate(ROUTES.MAIN);
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
            required: property.isRequired, // This will pull the current required value if editing
            options: property.options || [],
          }
        : { name: '', type: 'TEXT', required: true, options: [] }, // Default required: true
    );
    setIsPropertyModalVisible(true);
  };

  const handlePropertySave = () => {
    if (currentProperty) {
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
    } else {
      const newProperty = {
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
          },
        ]
      : []),
  ];

  const handleStatusChange = async () => {
    const allData = {
      name: templateName,
      projectId,
      templateType: 'GLOBAL',
      fields: fields.map(({ id, ...rest }) => rest),
      properties: properties.map(({ id, ...rest }) => rest),
    };

    try {
      // Create the template first
      const response = await createTemplate({ variables: allData });

      const newTemplateId = response.data.createTemplate.data.id;

      // After creating the template, change its status to 'LIVE'
      const newStatus = 'LIVE';
     const response2= await changeTemplateStatus({
        variables: {
          id: newTemplateId, // Use the newly created template's ID
          newStatus,
        },
      });

      // Optional: set editing state to false after saving
      setIsEditing(false);
      if (response2.data.changeTemplateStatus) {
        navigate(ROUTES.MAIN);
      }
    // eslint-disable-next-line no-shadow
    } catch (error) {
      console.error('Error saving template or changing status:', error.message);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
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
    placeholder="Template Name"
  />
) : (
  <Title level={4} style={{ textAlign: 'center', fontSize: '1.25rem' }}>
    {templateName}
  </Title>
)}
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
        dataSource={[{}]} // You may want to populate this correctly
        pagination={false}
        bordered
        style={{ marginTop: '16px' }}
      />


<Space style={{ marginTop: '16px', float: 'right' }}>
        <Button
          type="primary"
          style={{ backgroundColor: 'red' }}
           onClick={handleStatusChange}
        >
          Publish
        </Button>
        <Button
          type="primary"
          style={{ backgroundColor: 'red' }}
          onClick={toggleEditMode}
        >
          {isEditing ? 'Cancel Edit' : 'Edit'}
        </Button>

          <Button
            type="primary"
            style={{ backgroundColor: 'red' }}
            onClick={handleSaveAll}
          >
            Save
          </Button>

      </Space>
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
        </Select>
        <Switch
          checked={fieldData.required}
          onChange={(checked) =>
            setFieldData({ ...fieldData, required: checked })
          }
          checkedChildren="Required"
          unCheckedChildren="Optional"
        />
        {(fieldData.type === 'OPTIONS' || fieldData.type === 'CHECKBOXES') && (
          <div style={{ marginTop: '16px' }}>
            <Title level={5}>Options</Title>
            <List
              dataSource={fieldData.options}
              renderItem={(option, index) => (
                <List.Item>
                  <Input
                    value={option}
                    onChange={(e) =>
                      handleFieldOptionChange(e.target.value, index)
                    }
                    placeholder={`Option ${index + 1}`}
                    style={{ marginBottom: '8px' }}
                  />
                </List.Item>
              )}
            />
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
          <Select.Option value="ATTACHMENT">Attachment</Select.Option>
          <Select.Option value="BOOLEAN">Boolean</Select.Option>
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
                    value={option}
                    onChange={(e) =>
                      handlePropertyOptionChange(e.target.value, index)
                    }
                    placeholder={`Option ${index + 1}`}
                    style={{ marginBottom: '8px' }}
                  />
                </List.Item>
              )}
            />
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
  );
};

export default GlobalTemplateView;
