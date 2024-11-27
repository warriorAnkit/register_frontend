/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import { Table, Typography, Button, Space, Divider, Popover, Checkbox, Dropdown, Menu, notification } from 'antd';
import { useLocation } from 'react-router-dom';
import { useMutation,useQuery } from '@apollo/client';
import FieldIcon from './components/FieldIcon';
import { CREATE_GLOBAL_TEMPLATE_MUTATION, CREATE_TEMPLATE } from './graphql/Mutation';
import { GET_PROJECT_ID_FOR_USER } from '../Dashboard/graphql/Queries';

const { Title, Text } = Typography;

const PreviewPage = () => {
  const location = useLocation();
  const transformedData = location.state?.transformedData;
  const name=location.state?.name;
  const [popoverVisible, setPopoverVisible] = useState({}); // Store visibility of popover for each field
  const [popoverContent, setPopoverContent] = useState(<div>Static Popover Content</div>);  // Store content for the popover
  const [createTemplate] = useMutation(CREATE_TEMPLATE);
  const [createGlobalTemplate]=useMutation(CREATE_GLOBAL_TEMPLATE_MUTATION);

  const {

    loading: loadingProject,
    error: errorProject,
    data: dataProject,

  } = useQuery(GET_PROJECT_ID_FOR_USER);

  const projectId = dataProject ? dataProject.getProjectIdForUser : null;

  const handleMouseEnter = (field) => {

    const newPopoverContent = (
      <div style={{ maxWidth: 200 }}>
        {field.options?.map((option) => (
          <div key={option} style={{ padding: '4px 8px' }}>
            {option}
          </div>
        ))}
      </div>
    );
    setPopoverContent(newPopoverContent); // Update content based on field options
    setPopoverVisible((prevState) => ({
      ...prevState,
      [field.fieldName]: true, // Show popover for the specific field
    }));
  };

  const handleMouseLeave = (field) => {

    setPopoverVisible((prevState) => ({
      ...prevState,
      [field.fieldName]: false, // Hide popover for the specific field
    }));
  };

  const createCheckboxMenu = (field) => (
    <Menu>
      {field.options?.map((option) => (
        <Menu.Item key={option}>
          <Checkbox value={option}>{option}</Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  const columns = transformedData.fields.map((field) => ({
    title: (
      <span
        onMouseEnter={() => handleMouseEnter(field)} // Trigger hover effect on field name
        onMouseLeave={() => handleMouseLeave(field)} // Remove hover effect
        style={{ cursor: 'pointer' }}
      >
        <FieldIcon fieldType={field.fieldType} style={{ marginRight: 8 }} />
        {field.fieldName} {field.isRequired && <span style={{ color: 'red' }}>*</span>}
      </span>
    ),
    dataIndex: field.fieldName.replace(/\s+/g, '').toLowerCase(),
    key: field.fieldName,
    render: (text, record) => {


      if (field.fieldType === 'OPTIONS') {
        return (
          <div>
            <Popover
              content={popoverContent}
              visible={popoverVisible[field.fieldName]} // Show popover only for the current field
              trigger="hover" // Use hover as trigger for the popover
              title="Options"
              placement="bottomLeft"
              overlayStyle={{ maxWidth: 200 }}
            >
              <Text>{text || 'Select an option'}</Text>
            </Popover>
          </div>
        );
      }

      if (field.fieldType === 'CHECKBOXES') {
        return (
          <Dropdown
            overlay={createCheckboxMenu(field)}
            trigger={['hover']}
            placement="bottomLeft"
            visible={popoverVisible[field.fieldName]} // Show dropdown only for the current field
          >
            <Text>{text || 'Select options'}</Text>
          </Dropdown>
        );
      }

      return text || <Text type="secondary">No data</Text>;
    },
  }));

  const handlePublish = async () => {
    const formattedFields = transformedData.fields.map(field => ({
      fieldName: field.fieldName,
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      options: field.options,
    }));
    const formattedProperties = transformedData.properties.map(property => ({
      propertyName: property.propertyName,
      propertyFieldType: property.propertyFieldType,
      isRequired: property.isRequired,
      options: property.options,
    }));

    try {
      // eslint-disable-next-line eqeqeq
      if (projectId === '60') {
        await createGlobalTemplate({
          variables: {

            name: transformedData.name||name ,
            templateType: 'IMPORTED',
            fields: formattedFields,
            properties: formattedProperties,
          },
        });
      } else {

        await createTemplate({
          variables: {
            name: transformedData.name||name,
            projectId,
            templateType: 'IMPORTED',
            fields: formattedFields,
            properties: formattedProperties,
          },
        });
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

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3}>Preview of {transformedData.name||name}</Title>
        <Button type="primary" onClick={handlePublish}>Export Preview</Button>
      </div>

      <Divider />

      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={4}>Properties</Title>
        {transformedData.properties.map((property, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>
              <FieldIcon fieldType={property.propertyFieldType} />
              <Text strong>{property.propertyName}{property.isRequired && <span style={{ color: 'red' }}>*</span>}</Text>
            </span>
          </div>
        ))}
      </Space>

      <Divider />

      <Title level={4}>Fields</Title>
      <Table
        columns={columns}
        pagination={false}
        rowKey={(record) => record.id || record.key}
      />
    </div>
  );
};

export default PreviewPage;
