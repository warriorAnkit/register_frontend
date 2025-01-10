/* eslint-disable no-alert */
/* eslint-disable react/no-this-in-sfc */
/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable react/no-array-index-key */
import { CloseOutlined,DeleteOutlined,EditOutlined,PlusOutlined} from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';
import { Button, Divider, Input, List, message, Modal, notification,Select,Space,Switch,Table,Typography} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import {  useLocation, useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Jexl from 'jexl';
import ReactDragListView from "react-drag-listview";
import { ROUTES } from '../../common/constants';
import { GET_PROJECT_ID_FOR_USER } from '../Dashboard/graphql/Queries';
import FieldIcon from './components/FieldIcon';
import Header from './components/Header';
import {CHANGE_TEMPLATE_STATUS,CREATE_GLOBAL_TEMPLATE_MUTATION,CREATE_TEMPLATE} from './graphql/Mutation';
import './register.less';
import CenteredSpin from '../Dashboard/component/CentredSpin';
import NavigationGuard from './components/NavigationGuard';

const { Title, Text } = Typography;
const CreateRegisterPage = () => {
  const {registerName}=useParams();
  const [isFieldModalVisible, setIsFieldModalVisible] = useState(false);
  const [isPropertyModalVisible, setIsPropertyModalVisible] = useState(false);
  const [fields, setFields] = useState([]);
  const [numericFields, setNumericFields] = useState([]);
  const [properties, setProperties] = useState([]); // State to manage properties
  const [currentField, setCurrentField] = useState(null);
  const [regName,setRegName]=useState(registerName);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [createTemplate] = useMutation(CREATE_TEMPLATE);
  const [createGlobalTemplate] = useMutation(CREATE_GLOBAL_TEMPLATE_MUTATION);
  const [changeTemplateStatus] = useMutation(CHANGE_TEMPLATE_STATUS);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const navigate=useNavigate();
  const location=useLocation();
  const transformedData = location.state?.transformedData;
  useEffect(() => {
    if (transformedData) {
      setFields(transformedData.fields || []); // Ensure it's an array
      setProperties(transformedData.properties || []); // Ensure it's an array
    }
  }, [transformedData]);
  useEffect(() => {
    const filteredFields = fields.filter((field) => field.fieldType === 'NUMERIC');
    setNumericFields(filteredFields);
  }, [fields]);
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





  const {
    loading: loadingProject,
    error: errorProject,
    data: dataProject,
  } = useQuery(GET_PROJECT_ID_FOR_USER);

  const projectId = dataProject ? dataProject.getProjectIdForUser : null;
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

  const inputRefs = useRef([]);
  useEffect(() => {
    if (fieldData.options.length > 0) {
      const fieldName = fieldData.tempId;
      const lastIndex = fieldData.options.length - 1;
      const lastInput = inputRefs.current[fieldName]?.[lastIndex];
      if (lastInput) {
        lastInput.focus();
      }
    }
  }, [fieldData.options]);
  useEffect(() => {
    if (propertyData.options.length > 0) {
      const fieldName = propertyData.tempId;
      const lastIndex = propertyData.options.length - 1;
      const lastInput = inputRefs.current[fieldName]?.[lastIndex];
      if (lastInput) {
        lastInput.focus();
      }
    }
  }, [propertyData.options]);

  const validateFormula = async (formula) => {
    try {
      await Jexl.compile(formula);
      return true;
    } catch (e) {
      return false;
    }
  };
  const handleFieldSave = async() => {
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
        (f) => f.fieldName === fieldData.name && f.tempId !== currentField?.tempId,
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
        description: 'All options must be filled. Blank options are not allowed.',
        duration: 3,
      });
      return;
    }
    if (fieldData.type === 'OPTIONS' || fieldData.type === 'CHECKBOXES'){
      const trimmedOptions = fieldData.options.map((option) => option.trim().toUpperCase());

    if (new Set(trimmedOptions).size !== trimmedOptions.length) {
      message.error('Duplicate options are not allowed.');
      return;
    }
  }
    if (fieldData.type === 'CALCULATION') {
      console.log(fields);
      console.log(fieldData);
if(fieldData.required){
      const referencedFields = fieldData.options
    .match(/"([^"]+)"/g)
    ?.map((field) => field.replace(/"/g, "")) || [];

  const unrequiredFields = referencedFields.filter((fieldName) => {
    const field = fields.find((f) => f.fieldName === fieldName);
    return field && !field.isRequired;
  });

  if (unrequiredFields.length > 0) {
    notification.error({
      message: 'Invalid Formula',
      description: `The calculation field includes non-required fields: ${unrequiredFields.join(
        ", ",
      )}. Please mark them as required or make this field not required.`,
      duration: 3,
    });
    return;
  }
}
      const isValid = await validateFormula(fieldData.options);
      if (!isValid||fieldData.options.length===0) {
        notification.error({
          message: 'Invalid Formula',
          description: 'The formula syntax is invalid. Please correct it.',
          duration: 3,
        });
        return;
      }
    }

    if (currentField) {

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
    if (fieldData.options.length >= 20) {
      message.warning('You can only add up to 20 options.');
      return;
    }
    if (fieldData.options.length > 0 && fieldData.options[fieldData.options.length - 1].trim() === '') {
      message.error('Please fill the previous option before adding a new one.');
      return;
    }
    const trimmedOptions = fieldData.options.map((option) => option.trim().toUpperCase());
  if (new Set(trimmedOptions).size !== trimmedOptions.length) {
    message.error('Duplicate options are not allowed.');
    return;
  }
  const fieldName = fieldData.tempId;
  console.log("fnmae",fieldName);
  if (!inputRefs.current[fieldName]) {
    inputRefs.current[fieldName] = []; // Initialize the sub-array for the field
  }
  inputRefs.current[fieldName].push(null); // Add a ref for the new option
    setFieldData({ ...fieldData, options: [...fieldData.options, ''] });
  };
  const handleRemoveFieldOption = (indexToRemove) => {
    if (fieldData.options.length > 1) {
      const updatedOptions = fieldData.options.filter(
        (_, index) => index !== indexToRemove,
      );
      setFieldData({ ...fieldData, options: updatedOptions });

      const fieldName =fieldData.tempId; // Assuming 'name' is unique for the field

      if (inputRefs.current[fieldName]) {
        // Remove the ref for the selected option
        inputRefs.current[fieldName].splice(indexToRemove, 1);
      }


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
    const trimmedOptions = propertyData.options.map((option) => option.trim().toUpperCase());
    console.log(trimmedOptions);
  if (new Set(trimmedOptions).size !== trimmedOptions.length) {
    message.error('Duplicate options are not allowed.');
    return;
  }
  const propertyName = propertyData.tempId;
  console.log("pname",propertyName);
  if (!inputRefs.current[propertyName]) {
    inputRefs.current[propertyName] = []; // Initialize the sub-array for the field
  }
  inputRefs.current[propertyName].push(null); // Add a ref for the new option
    setPropertyData({
      ...propertyData,
      options: [...propertyData.options, ''],
    });

  };
  const handleRemovePropertyOption = (indexToRemove) => {
    if (propertyData.options.length > 1) {
      const updatedOptions = propertyData.options.filter(
        (_, index) => index !== indexToRemove,
      );
      setPropertyData({ ...propertyData, options: updatedOptions });
      const fieldName = propertyData.tempId; // Assuming 'name' is unique for the field

      if (inputRefs.current[fieldName]) {
        // Remove the ref for the selected option
        inputRefs.current[fieldName].splice(indexToRemove, 1);
      }


    }
  };

  const handleSave = async () => {
setIsConfirmModalOpen(false);
    const formattedFields = fields.map((field,index) => ({
      sequence: index,
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
            name: regName,
            templateType: 'GLOBAL',
            fields: formattedFields,
            properties: formattedProperties,
          },
        });

        if (response.data.createTemplate.message==='Register Created succesfully') {
          navigate(ROUTES.MAIN); // Navigate to the main route after success
        }
      } else {
        // For other projectIds, create a scratch template
    const response= await createTemplate({
          variables: {
            name: regName,
            projectId,
            templateType: 'SCRATCH',
            fields: formattedFields,
            properties: formattedProperties,
          },
        });

        if (response.data.createTemplate.message==='Register Created succesfully') {
          navigate(ROUTES.MAIN); // Navigate to the main route after success
        }
      }
    } catch (error) {
      // notification.error({
      //   message: 'Failed to Save',
      //   description: 'An error occurred while creating the template.',
      //   duration: 3, // The notification will auto-close after 3 seconds
      // });
      console.error(error);
    }
  };
  const confirmSave = () => {
    if (isConfirmModalOpen) {
      return;
    }

    setIsConfirmModalOpen(true);
    Modal.confirm({
      title: 'Are you sure?',
      content: 'Are you sure you want to save the register as Draft?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: handleSave,
      onCancel: () => {
        setIsConfirmModalOpen(false);
        // console.log('Save canceled.');
      },
    });
  };

  const handlePublish = async () => {
    if (!fields || fields.length === 0) {
      notification.warning({
        message: 'No Fields Added',
        description: 'Please add at least one field before publishing the template.',
        duration: 3,
      });
      return;
    }
    if (!properties || properties.length === 0) {
      notification.warning({
        message: 'No property Added',
        description: 'Please add at least one property before publishing the template.',
        duration: 3,
      });
      return;
    }
    if (isConfirmModalOpen) {
      return;
    }

    setIsConfirmModalOpen(true);
    // Show confirmation modal
    Modal.confirm({
      title: 'Are you sure you want to publish this Register?',
      content: 'Once published, the template will be live',
      okText: 'Yes, Publish',
      cancelText: 'No, Cancel',
      onOk: async () => {
        const formattedFields = fields.map((field,index) => ({
          sequence: index,
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
        setIsConfirmModalOpen(false);
        try {
          // eslint-disable-next-line eqeqeq
          if (projectId === '60') {
            const response = await createGlobalTemplate({
              variables: {
                name: regName,
                templateType: 'GLOBAL',
                fields: formattedFields,
                properties: formattedProperties,
              },
            });
            if (response.data.createTemplate.message === 'Template Created successfully') {
              navigate(ROUTES.MAIN); // Navigate to the main route after success
            }
          } else {
            // For other projectIds, create a scratch template
            const response = await createTemplate({
              variables: {
                name: regName,
                projectId,
                templateType: 'SCRATCH',
                fields: formattedFields,
                properties: formattedProperties,
              },
            });

            const newTemplateId = response.data.createTemplate.data.id;
            const newStatus = 'LIVE';
            const response2 = await changeTemplateStatus({
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
      },
      onCancel() {
        setIsConfirmModalOpen(false);
        console.log('Publishing canceled.');
      },
    });
  };
  const handleFieldOptionChange = (value, index) => {
    const newOptions = [...fieldData.options];
    newOptions[index] = value;
    setFieldData({ ...fieldData, options: newOptions });
  };
  const handleFieldDelete = (fieldName,fieldtype) => {
    if (isConfirmModalOpen) {
      return; // Prevent multiple modals
    }
    setIsConfirmModalOpen(true);
    console.log("type:",fieldName,fieldtype);
    if (fieldtype === 'NUMERIC') {
      // Check if any CALCULATION field references this numeric field in its options
     const isReferencedInCalculation = fields.some((field) => {
  console.log('field options:', field.options); // Log the options of the current field being checked
  return field.fieldType === 'CALCULATION' && field.options && field.options.includes(fieldName);
});
      console.log(isReferencedInCalculation);

      if (isReferencedInCalculation) {
        // Show a message and prevent deletion
        Modal.error({
          title: 'Cannot delete this field',
          content: `This field is being used in a calculation and cannot be deleted.`,
        });
        setIsConfirmModalOpen(false);
        return;
      }
    }
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
        setIsConfirmModalOpen(false);
      },
      onCancel: () => {
        setIsConfirmModalOpen(false);
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
    if (!propertyData.name || propertyData.name.trim() === '') {
      message.error('Property Name is required.');
      return;
    }
    if (propertyData.name.length > 100) {
      message.error('property Name cannot exceed 100 characters.');
      return;
    }

    if (
      properties.some((p) => p.propertyName === propertyData.name && p.tempId !== currentProperty?.tempId)
    ) {
      notification.error({
        message: 'Duplicate property Name',
        description: `The property name "${propertyData.name}" already exists as a property.`,
        duration: 3,
      });
      return;
    }
    if (propertyData.type === 'OPTIONS' || propertyData.type === 'CHECKBOXES'){
    const trimmedOptions = propertyData.options.map((option) => option.trim().toUpperCase());
    console.log(trimmedOptions);
  if (new Set(trimmedOptions).size !== trimmedOptions.length) {
    message.error('Duplicate options are not allowed.');
    return;
  }
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
    if (isConfirmModalOpen) {
      return;
    }

    setIsConfirmModalOpen(true);
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
        setIsConfirmModalOpen(false);
      },
      onCancel: () => {
        setIsConfirmModalOpen(false);
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

            <>
              <EditOutlined
                style={{ marginLeft: '8px', cursor: 'pointer' }}
                onClick={() => showFieldEditModal(field)}
              />
              <DeleteOutlined
                style={{ marginLeft: '8px', cursor: 'pointer' }}
                onClick={() => handleFieldDelete(field.fieldName,field.fieldType)}
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

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {

      e.preventDefault();
      handleAddFieldOption();
    }
  };
  const dragProps = {
    onDragEnd: (fromIndex, toIndex) => {

      if (columns[fromIndex]?.key === 'addField' || columns[toIndex]?.key === 'addField') {
        return;
      }
      const newFields = [...fields];
      const fieldItem = newFields.splice(fromIndex, 1)[0];
      newFields.splice(toIndex, 0, fieldItem);

      setFields(newFields);

    },
    nodeSelector: "th", // Dragging happens on <th> elements
  };

  // Render each column with drag-and-drop functionality
  if (loadingProject) {
    return <CenteredSpin />;
  }

  if (errorProject) {
    return <p>Error loading project data</p>;
  }
  return (
    <NavigationGuard
    confirmationMessage="You have unsaved changes. Are you sure you want to leave this page?"
    isAllRowsComplete={false}
  >
    <div >
       <Header name={regName} location={window.location.href} />
    <div style={{ padding: '15px',marginTop: '40px'}}>


      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>


  <Title level={4} style={{ textAlign: 'center', fontSize: '1.25rem' }}>
    Create Your new Register :  <Input
            value={regName}
            onChange={(e) => setRegName(e.target.value)}
            style={{ width: '300px', textAlign: 'center' }}
            maxLength={100}

          />
  </Title>

</div>
<Space style={{ marginTop: '16px', float: 'right' }}>
          <Button
            type="primary"
            style={{ backgroundColor: 'red' }}
            onClick={confirmSave}
          >
            Save as Draft
          </Button>
          <Button
            type="primary"
            style={{ backgroundColor: 'red' }}
            onClick={handlePublish}
          >
            Publish
          </Button>
      </Space>
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
      <ReactDragListView.DragColumn {...dragProps}>
      <Table
        columns={columns}
        dataSource={[{}]}
        pagination={false}
        bordered
        scroll={{ x: 'max-content',  y:"80px"}} // Vertical scroll with fixed header
        style={{ marginTop: '16px' }}
      />
   </ReactDragListView.DragColumn>
      {/* Field Modal */}
      <Modal
        title={currentField ? 'Edit Field' : 'Add Field'}
        closable={false}
        visible={isFieldModalVisible}
        onOk={handleFieldSave}
        onCancel={handleFieldCancel}
        okText="Save"
      >
        <Input
          placeholder="Field Name"
          value={fieldData.name}
          onChange={(e) => setFieldData({ ...fieldData, name: e.target.value })}
          maxLength={50}
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
                  id={`field-${fieldData.fieldName}-${index}`}
                   // eslint-disable-next-line no-return-assign
                   ref={(el) => {
                    const fieldName = fieldData.tempId;
                    inputRefs.current[fieldName][index] = el; // Set ref dynamically
                  }}
                    value={option}
                    onChange={(e) =>
                      handleFieldOptionChange(e.target.value, index)
                    }
                    placeholder={`Option ${index + 1}`}
                    style={{ marginBottom: '8px' }}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    maxLength={50}
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

    {/* Formula Input */}
    <Input
      placeholder="Enter formula (e.g., x + y)"
      value={fieldData.options}
      onChange={(e) => setFieldData({ ...fieldData, options: e.target.value })}
      onKeyDown={(e) => {
        const allowedKeys = ['Backspace', 'Delete'];

    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
        if (e.key === 'Backspace' || e.key === 'Delete') {
          const updatedFormula = fieldData.options.trim();
          const segments = updatedFormula.split(' ');
          const lastSegment = segments[segments.length - 1];

          if (lastSegment.startsWith('"') && lastSegment.endsWith('"')) {
            const newFormula = updatedFormula.slice(0, updatedFormula.lastIndexOf(lastSegment));
            setFieldData({ ...fieldData, options: newFormula });
            e.preventDefault();
          } else {
            const newFormula = updatedFormula.slice(0, updatedFormula.lastIndexOf(lastSegment));
            setFieldData({ ...fieldData, options: newFormula });
            e.preventDefault();
          }
        }}}
      style={{ marginBottom: '16px' }}
    />

    <div style={{ color: 'gray', fontSize: '12px' }}>
      Enter a valid formula using field names (e.g., 'field1 + field2').
    </div>

    <div style={{ marginTop: '16px' }}>
      <div>
      {numericFields.length > 0 ? (
    numericFields.map((field) => (
      <Button
        key={field.id}
        onClick={() =>
          setFieldData({
            ...fieldData,
            options: `${fieldData.options ? fieldData.options : ''}"${field.fieldName}"`,
          })
        }
        style={{ marginRight: '8px' }}
      >
        {field.fieldName}
      </Button>
    ))
  ) : (

    <p style={{ color: 'red' }}>Please add numeric fields to set the formula.</p>
  )}
      </div>

      <div style={{ marginTop: '8px' }}>
        {/* Operator Buttons */}
        {['+', '-', '*', '/', '(', ')'].map((operator) => (
          <Button
            key={operator}
            onClick={() => setFieldData({
              ...fieldData,
              options: `${fieldData.options} ${operator} `,
            })}
            style={{ marginRight: '8px' }}
          >
            {operator}
          </Button>
        ))}
      </div>

      <div style={{ marginTop: '16px' }}>
        {/* Clear Button */}
        <Button
          type="default"
          danger
          onClick={() =>
            setFieldData((prev) => {
              const segments = (prev.options || '').trim().split(' ');
              if (segments.length > 0) {
                if (segments[segments.length - 1].startsWith('"')) {
                  segments.pop();
                } else {
                  segments.pop();
                }
              }
              return { ...prev, options: segments.join(' ') };
            })
          }
        >
          Clear Last
        </Button>
        <Button
    type="default"
    onClick={() => {
      // Clear all options (reset to default or empty value)
      setFieldData({ ...fieldData, options: '' });
    }}
    style={{ marginLeft: '8px' }} // Optional, to add space between the buttons
  >
    Clear All
  </Button>
      </div>

    </div>
  </div>
)}


      </Modal>

      <Modal
        title={currentProperty ? 'Edit Property' : 'Add Property'}
        closable={false}
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
          maxLength={100}
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
                    // eslint-disable-next-line no-return-assign
                    ref={(el) => {
                      const propertyName = propertyData.tempId;
                      inputRefs.current[propertyName][index] = el; // Set ref dynamically
                    }}
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
                    maxLength={50}
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
    </NavigationGuard>
  );
};

export default CreateRegisterPage;
