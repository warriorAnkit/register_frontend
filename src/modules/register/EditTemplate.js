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
  notification,
} from 'antd';
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams} from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_TEMPLATE_BY_ID } from './graphql/Queries';
import { UPDATE_TEMPLATE,CHANGE_TEMPLATE_STATUS } from './graphql/Mutation';

import './register.less';
import FieldIcon from './components/FieldIcon';
import { ROUTES } from '../../common/constants';
import Header from './components/Header';

const { Title, Text } = Typography;



const TemplateView = () => {
  const { templateId } = useParams();

  const { loading, error, data } = useQuery(GET_TEMPLATE_BY_ID, {
    variables: { id: templateId },
    fetchPolicy: 'cache-and-network',
  });

  const [updateTemplate] = useMutation(UPDATE_TEMPLATE);
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
    const handleBeforeUnload = (e) => {
      if (isEditing) {
        console.log("beforeunload event triggered - Unsaved changes warning");
        e.preventDefault();
        e.returnValue = ''; // Required for the confirmation dialog to appear
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
      console.log("Cleaning up - Removing event listeners");
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
      id: templateId,
       name:templateName, // Optionally update the name
      fields,
      properties,
    };
    // eslint-disable-next-line no-console
    console.log(allData);
    try {
      const response = await updateTemplate({ variables: allData });
      // eslint-disable-next-line no-console
      console.log(response.data.updateTemplate.message); // Show success message or handle accordingly
      setIsEditing(false);
      if(response.data.updateTemplate.message){
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
        // eslint-disable-next-line no-console
        console.log(propertyName);
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
    // Determine the new status based on current status
    let newStatus;
    if (data.getTemplateById.status === 'LIVE') {
      newStatus = 'ARCHIVED';
    } else if (data.getTemplateById.status === 'ARCHIVED' || data.getTemplateById.status === 'DRAFT') {
      newStatus = 'LIVE';
    }

    try {
      await changeTemplateStatus({
        variables: {
          id: templateId,
          newStatus,
        },
      });
      console.log("STSTUS");

      notification.success({
        message: 'Status Updated',
        description: `The status is now ${newStatus}`,
      });
    // eslint-disable-next-line no-shadow
    } catch (error) {
      console.error('Error changing status:', error.message);
    }
  };
  const handleViewChangeLog = () => {
    const changeLogUrl = ROUTES.VIEW_TEMPLATE_CHANGE_LOG.replace(':templateId', templateId);
    navigate(changeLogUrl);
    console.log("hii");
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
    placeholder="Template Name"
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


<Space style={{ marginTop: '16px', float: 'right' }}>
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
          {isEditing ? 'Cancel Edit' : 'Edit'}
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
                    value={option}
                    onChange={(e) =>
                      handleFieldOptionChange(e.target.value, index)
                    }
                    placeholder={`Option ${index + 1}`}
                    style={{ marginBottom: '8px' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddFieldOption(); // Trigger adding an option on Enter key press
                      }
                    }}
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddPropertyOption();
                      }
                    }}
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
    </div>
  );
};

export default TemplateView;
