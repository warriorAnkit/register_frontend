/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable react/no-array-index-key */
import {
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
} from 'antd';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { ROUTES } from '../../common/constants';
import { GET_PROJECT_ID_FOR_USER } from '../Dashboard/graphql/Queries';
import FieldIcon from './components/FieldIcon';
import Header from './components/Header';
import {
  CHANGE_TEMPLATE_STATUS,
  CREATE_GLOBAL_TEMPLATE_MUTATION,
  CREATE_TEMPLATE,
} from './graphql/Mutation';
import './register.less';

const { Title, Text } = Typography;
const CreateRegisterPage = () => {
  const [isFieldModalVisible, setIsFieldModalVisible] = useState(false);
  const [isPropertyModalVisible, setIsPropertyModalVisible] = useState(false);
  const [fields, setFields] = useState([]);
  const [properties, setProperties] = useState([]); // State to manage properties
  const [currentField, setCurrentField] = useState(null);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [createTemplate] = useMutation(CREATE_TEMPLATE);
  const [createGlobalTemplate] = useMutation(CREATE_GLOBAL_TEMPLATE_MUTATION);
  const [changeTemplateStatus] = useMutation(CHANGE_TEMPLATE_STATUS);
  const navigate=useNavigate();
  const location=useLocation();

  const transformedData = location.state?.transformedData;
  console.log(transformedData);
  useEffect(() => {
    if (transformedData) {
      setFields(transformedData.fields || []); // Ensure it's an array
      setProperties(transformedData.properties || []); // Ensure it's an array
    }
  }, [transformedData]);

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

  const {registerName}=useParams();

  const {
    loading: loadingProject,
    error: errorProject,
    data: dataProject,
  } = useQuery(GET_PROJECT_ID_FOR_USER);

  const projectId = dataProject ? dataProject.getProjectIdForUser : null;
  const showFieldEditModal = (field = null) => {
    console.log("f",field);
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
      console.log("Editing existing field:", currentField);

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
    } else {
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
    setFieldData({ ...fieldData, options: [...fieldData.options, ''] });
  };
  const handleAddPropertyOption = () => {
    setPropertyData({
      ...propertyData,
      options: [...propertyData.options, ''],
    });
  };


  const handleSave = async () => {

    const formattedFields = fields.map((field) => ({
      fieldName: field.fieldName,
      fieldType:  field.fieldType,
      isRequired: field.isRequired,
      options: field.options,
    }));

    const formattedProperties = properties.map((property) => ({
      propertyName: property.propertyName,
      propertyFieldType: property.propertyFieldType,
      isRequired: property.isRequired,
      options: property.options,
    }));

    try {
      // eslint-disable-next-line eqeqeq
      if (projectId === '60') {
       const response= await createGlobalTemplate({
          variables: {
            name: registerName,
            templateType: 'GLOBAL',
            fields: formattedFields,
            properties: formattedProperties,
          },
        });
        if (response.data.createTemplate.message==='Template Created succesfully') {
          navigate(ROUTES.MAIN); // Navigate to the main route after success
        }
      } else {
        // For other projectIds, create a scratch template
    const response= await createTemplate({
          variables: {
            name: registerName,
            projectId,
            templateType: 'SCRATCH',
            fields: formattedFields,
            properties: formattedProperties,
          },
        });

        if (response.data.createTemplate.message==='Template Created succesfully') {
          navigate(ROUTES.MAIN); // Navigate to the main route after success
        }
      }
    } catch (error) {
      notification.error({
        message: 'Failed to Publish',
        description: 'An error occurred while creating the template.',
        duration: 3, // The notification will auto-close after 3 seconds
      });
      console.error(error);
    }
  };
  const handlePublish = async () => {
    const formattedFields = fields.map((field) => ({
      fieldName: field.fieldName,
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      options: field.options,
    }));

    const formattedProperties = properties.map((property) => ({
      propertyName: property.propertyName,
      propertyFieldType: property.propertyFieldType,
      isRequired: property.isRequired,
      options: property.options,
    }));

    try {
      // eslint-disable-next-line eqeqeq
      if (projectId === '60') {
      const response=  await createGlobalTemplate({
          variables: {
            name: registerName,
            templateType: 'GLOBAL',
            fields: formattedFields,
            properties: formattedProperties,
          },
        });
        if (response.data.createTemplate.message==='Template Created succesfully') {
          navigate(ROUTES.MAIN); // Navigate to the main route after success
        }
      } else {
        // For other projectIds, create a scratch template
        const response = await createTemplate({
          variables: {
            name: registerName,
            projectId,
            templateType: 'SCRATCH',
            fields: formattedFields,
            properties: formattedProperties,
          },
        });

      const newTemplateId = response.data.createTemplate.data.id;
      const newStatus = 'LIVE';
      const response2= await changeTemplateStatus({
        variables: {
          id: newTemplateId,
          newStatus,
        },
      });
      if (response2.data.changeTemplateStatus) {
        navigate(ROUTES.MAIN);
      }

      }

    } catch (error) {
      notification.error({
        message: 'Failed to Publish',
        description: 'An error occurred while creating the template.',
        duration: 3,
      });
      console.error(error);
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
    } else {
      const newProperty = {
        tempId: uuidv4(),
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
console.log(fields);
  const columns = [
    ...fields.map((field) => ({
      title: (
        <span>
              <FieldIcon fieldType={field.fieldType} />

          <span style={{ marginLeft: '4px' }}>{field.fieldName} </span>
          {field.isRequired && <span style={{ color: 'red' }}>*</span>}

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
    ...( [
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
      ),
  ];




  return (
    <div >
       <Header name={registerName}/>
    <div style={{ padding: '15px' }}>


      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>


  <Title level={4} style={{ textAlign: 'center', fontSize: '1.25rem' }}>
    Create Your new Register : {registerName}
  </Title>

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

            </span>
          </div>
        ))}

          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={() => showPropertyEditModal()}
            style={{ color: 'red' }}
          >
            Add Property
          </Button>

      </div>

      <Divider />

      <Title level={4}>Table</Title>
      <Table
        columns={columns}
        dataSource={[{}]}
        pagination={false}
        bordered
        scroll={{ x: 'max-content', y: 400 }} // Vertical scroll with fixed header
        style={{ marginTop: '16px' }}
      />


<Space style={{ marginTop: '16px', float: 'right' }}>


          <Button
            type="primary"
            style={{ backgroundColor: 'red' }}
            onClick={handleSave}
          >
            Save
          </Button>
          <Button
            type="primary"
            style={{ backgroundColor: 'red' }}
            onClick={handlePublish}
          >
            Publish
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
          {/* <Select.Option value="ATTACHMENT">Attachment</Select.Option> */}
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
                        handleAddPropertyOption(); // Trigger adding an option on Enter key press
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

export default CreateRegisterPage;
