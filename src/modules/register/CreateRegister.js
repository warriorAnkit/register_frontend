/* eslint-disable no-alert */
/* eslint-disable no-undef */
/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-use-before-define */
import React, { useState } from 'react';
import {
  Button,
  Table,
  Input,
  Layout,
  Typography,
  Select,
  Space,
  Checkbox,
  notification,
} from 'antd';
import 'antd/dist/reset.css';
import { useMutation, useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CHANGE_TEMPLATE_STATUS,
  CREATE_GLOBAL_TEMPLATE_MUTATION,
  CREATE_TEMPLATE,
} from './graphql/Mutation';
import PageHeader from './components/PageHeader';
import { GET_PROJECT_ID_FOR_USER } from '../Dashboard/graphql/Queries';
import { ROUTES } from '../../common/constants';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const CreateRegisterPage = () => {
  const [properties, setProperties] = useState([]);
  const [fields, setFields] = useState([]);
  const [createTemplate] = useMutation(CREATE_TEMPLATE);
  const [createGlobalTemplate] = useMutation(CREATE_GLOBAL_TEMPLATE_MUTATION);
  const [changeTemplateStatus] = useMutation(CHANGE_TEMPLATE_STATUS);
  const typeMapping = {
    text: 'TEXT',
    multiLineText: 'MULTI_LINE_TEXT',
    options: 'OPTIONS',
    checkboxes: 'CHECKBOXES',
    numeric: 'NUMERIC',
    datePicker: 'DATE',
    attachment: 'ATTACHMENT',
  };
  // Define all available types
  const fieldTypes = [
    { label: 'Text', value: 'text' },
    { label: 'Multi-line text', value: 'multiLineText' },
    { label: 'Options', value: 'options' },
    { label: 'Checkboxes', value: 'checkboxes' },
    { label: 'Numeric', value: 'numeric' },
    { label: 'Date picker', value: 'datePicker' },
    { label: 'Attachment', value: 'attachment' },

  ];

  // Columns for both tables
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index, section) => (
        <Input
          placeholder="Enter name"
          value={text}
          onChange={(e) =>
            handleInputChange(e.target.value, index, 'name', section)
          }
        />
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text, record, index, section) => (
        <Select
          placeholder="Select type"
          value={text}
          onChange={(value) => handleInputChange(value, index, 'type', section)}
          style={{ width: '100%' }}
          dropdownStyle={{ minWidth: '150px' }}
        >
          {fieldTypes.map((type) => (
            <Option key={type.value} value={type.value}>
              {type.label}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Input',
      key: 'input',
      render: (_, record, index, section) =>
        renderInputField(record, index, section),
    },
    {
      title: 'Is Required',
      dataIndex: 'isRequired',
      key: 'isRequired',
      render: (isRequired, record, index, section) => (
        <Checkbox
          checked={isRequired}
          onChange={(e) =>
            handleIsRequiredChange(e.target.checked, index, section)
          }
        >
          Required
        </Checkbox>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record, index, section) => (
        <Button
          onClick={() => handleDeleteRow(index, section)}
          type="link"
          danger
        >
          Delete
        </Button>
      ),
    },
  ];
  const {
    loading: loadingProject,
    error: errorProject,
    data: dataProject,
  } = useQuery(GET_PROJECT_ID_FOR_USER);

  const projectId = dataProject ? dataProject.getProjectIdForUser : null;
  console.log('id: is,', typeof projectId);
  const handleInputChange = (value, index, key, section) => {
    const data = section === 'properties' ? [...properties] : [...fields];
    data[index][key] = value;
    if (key === 'type' && (value === 'options' || value === 'checkboxes')) {
      data[index].options = [''];
    } else if (key === 'type') {
      delete data[index].options;
    }
    section === 'properties' ? setProperties(data) : setFields(data);
  };

  const handleIsRequiredChange = (checked, index, section) => {
    const data = section === 'properties' ? [...properties] : [...fields];
    data[index].isRequired = checked;
    section === 'properties' ? setProperties(data) : setFields(data);
  };

  const renderInputField = (record, index, section) => {
    if (record.type === 'options' || record.type === 'checkboxes') {
      return (
        <div>
          {record.options?.map((option, optionIndex) => (
            <Input
              // eslint-disable-next-line react/no-array-index-key
              key={optionIndex}
              placeholder={`Option ${optionIndex + 1}`}
              value={option}
              onChange={(e) =>
                handleOptionChange(e.target.value, index, optionIndex, section)
              }
              style={{ marginBottom: 8 }}
            />
          ))}
          <Button
            type="dashed"
            onClick={() => addOption(index, section)}
            style={{ width: '100%' }}
          >
            + Add Option
          </Button>
        </div>
      );
    }
    return null; // No input field for other types
  };

  const handleOptionChange = (value, fieldIndex, optionIndex, section) => {
    const data = section === 'properties' ? [...properties] : [...fields];
    data[fieldIndex].options[optionIndex] = value;
    section === 'properties' ? setProperties(data) : setFields(data);
  };

  const addOption = (fieldIndex, section) => {
    const data = section === 'properties' ? [...properties] : [...fields];
    data[fieldIndex].options.push('');
    section === 'properties' ? setProperties(data) : setFields(data);
  };

  const addPropertyRow = () => {
    if (properties.some((property) => !property.name || !property.type)) {
      notification.error({
        message: 'Missing Information',
        description: 'Please fill out all fields before adding a new row.',
        duration: 3,
      });
      return;
    }
    setProperties([
      ...properties,
      { key: properties.length, name: '', type: '', isRequired: true },
    ]);
  };

  const addFieldRow = () => {
    if (fields.some((field) => !field.name || !field.type)) {
      notification.error({
        message: 'Missing Information',
        description: 'Please fill out all fields before adding a new row.',
        duration: 3,
      });
      return;
    }
    setFields([
      ...fields,
      { key: fields.length, name: '', type: '', isRequired: true },
    ]);
  };

  const handleDeleteRow = (index, section) => {
    const data = section === 'properties' ? [...properties] : [...fields];
    data.splice(index, 1);
    section === 'properties' ? setProperties(data) : setFields(data);
  };
  const { registerName } = useParams();
  console.log('id:,', projectId);
  const navigate = useNavigate();
  const handleSave = async () => {
    const hasBlankField = fields.some((field) => !field.name || !field.type);
    const hasBlankProperty = properties.some(
      (property) => !property.name || !property.type,
    );

    if (hasBlankField || hasBlankProperty) {
      notification.error({
        message: 'Missing Information',
        description: 'Please fill out all required fields before submitting.',
        duration: 3,
      });
      return; // Prevent publishing if any fields are blank
    }
    const formattedFields = fields.map((field) => ({
      fieldName: field.name,
      fieldType: typeMapping[field.type] || field.type,
      isRequired: field.isRequired,
      options: field.options,
    }));

    const formattedProperties = properties.map((property) => ({
      propertyName: property.name,
      propertyFieldType: typeMapping[property.type] || property.type,
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
    const response=    await createTemplate({
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
    const hasBlankField = fields.some((field) => !field.name || !field.type);
    const hasBlankProperty = properties.some(
      (property) => !property.name || !property.type,
    );

    if (hasBlankField || hasBlankProperty) {
      notification.error({
        message: 'Missing Information',
        description: 'Please fill out all required fields before submitting.',
        duration: 3,
      });
      return; // Prevent publishing if any fields are blank
    }
    const formattedFields = fields.map((field) => ({
      fieldName: field.name,
      fieldType: typeMapping[field.type] || field.type,
      isRequired: field.isRequired,
      options: field.options,
    }));

    const formattedProperties = properties.map((property) => ({
      propertyName: property.name,
      propertyFieldType: typeMapping[property.type] || property.type,
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
      // console.log(response2.data.changeTemplateStatus.success);
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
  const handlePreview = () => {
    const hasBlankField = fields.some((field) => !field.name || !field.type);
    const hasBlankProperty = properties.some(
      (property) => !property.name || !property.type,
    );

    if (hasBlankField || hasBlankProperty) {
      notification.error({
        message: 'Missing Information',
        description: 'Please fill out all required fields before submitting.',
        duration: 3,
      });
      return; // Prevent publishing if any fields are blank
    }
    const transformedData = {
      name:registerName,
      fields: fields.map((field) => ({
        fieldName: field.name,
        fieldType: typeMapping[field.type] || field.type,
        isRequired: field.isRequired,
        options: field.options || [],
      })),
      properties: properties.map((property) => ({
        propertyName: property.name,
        propertyFieldType: typeMapping[property.type] || property.type,
        isRequired: property.isRequired,
        options: property.options || [],
      })),
    };

    navigate(ROUTES.PREVIEW_REGISTER, { state: { transformedData } });
  };
  return (
    <Layout
      style={{
        minHeight: '100vh',
        padding: '24px',
        backgroundColor: '#f4f4f9',
      }}
    >
      <PageHeader templateName={registerName} />
      <Content
        style={{ maxWidth: '800px', margin: '20px auto', width: '100%' }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Properties Section */}
          <div
            style={{
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '8px',
            }}
          >
            <Title level={4}>Properties</Title>
            <Table
              columns={columns.map((col) => ({
                ...col,
                render: (...args) => col.render(...args, 'properties'),
              }))}
              dataSource={properties}
              pagination={false}
              bordered
              footer={() => (
                <Button
                  type="dashed"
                  onClick={addPropertyRow}
                  style={{ width: '100%' }}
                >
                  + Add Property
                </Button>
              )}
            />
          </div>

          {/* Fields Section */}
          <div
            style={{
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '8px',
            }}
          >
            <Title level={4}>Fields</Title>
            <Table
              columns={columns.map((col) => ({
                ...col,
                render: (...args) => col.render(...args, 'fields'),
              }))}
              dataSource={fields}
              pagination={false}
              bordered
              footer={() => (
                <Button
                  type="dashed"
                  onClick={addFieldRow}
                  style={{ width: '100%' }}
                >
                  + Add Field
                </Button>
              )}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >

            <Button
              type="primary"
              onClick={handlePreview}
              style={{
                width: '32%',
                padding: '10px',
                textAlign: 'center',
                lineHeight: 'normal',
              }}
            >
              Preview
            </Button>
            <Button
              type="primary"
              onClick={handleSave}
              style={{
                width: '32%',
                padding: '10px',
                textAlign: 'center',
                lineHeight: 'normal',
              }}
            >
              Save
            </Button>
            <Button
              type="primary"
              onClick={handlePublish}
              style={{
                width: '32%',
                padding: '10px',
                textAlign: 'center',
                lineHeight: 'normal',
              }}
            >
              Publish
            </Button>
          </div>
        </Space>
      </Content>
      {/* <Footer style={{ textAlign: 'center' }}>Created with Ant Design ©2024</Footer> */}
    </Layout>
  );
};

export default CreateRegisterPage;
