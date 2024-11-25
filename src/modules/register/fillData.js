/* eslint-disable no-undef */
/* eslint-disable no-alert */
import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { Table, Button, Card, Space, Popconfirm, Pagination } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { GET_TEMPLATE_BY_ID } from './graphql/Queries';
import { SUBMIT_RESPONSE } from './graphql/Mutation';
import './register.less';
import AddEntryModal from './components/AddEntryModal';
import PropertiesModal from './components/FillPropertyModal';
import Header from './components/Header';

const FillTable = () => {
  const { templateId } = useParams();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPropertiesModalVisible, setIsPropertiesModalVisible] = useState(
    false,
  );
  const [tableData, setTableData] = useState([]);
  const [propertiesData, setPropertiesData] = useState({});
  const [isPropertiesAdded, setIsPropertiesAdded] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [pageSize, setPageSize] = useState(10); // State to store page size
  const [currentPage, setCurrentPage] = useState(1);

  const { data, loading, error } = useQuery(GET_TEMPLATE_BY_ID, {
    variables: { id: templateId },
    fetchPolicy: 'cache-and-network',
  });

  const [submitResponse] = useMutation(SUBMIT_RESPONSE);

  useEffect(() => {
    if (data) {
      setTableData([]);
      const initialProperties = {};
      data.getTemplateById?.properties.forEach((property) => {
        initialProperties[property.propertyName] = ''; // Default value is empty
      });
      setPropertiesData(initialProperties);
    }
  }, [data]);

  const handleAddEntry = () => {
    setEditingIndex(null);
    setIsModalVisible(true);
  };

  const handleEditEntry = (index) => {
    setEditingIndex(index);
    setIsModalVisible(true);
  };

  const handleDeleteEntry = (index) => {
    setTableData((prevData) => prevData.filter((_, i) => i !== index));
  };

  const handleSaveProperties = (updatedProperties) => {
    updatedProperties.forEach((property) => {
      setPropertiesData((prevState) => ({
        ...prevState,
        [property.propertyName]: property.value,
      }));
    });
    setIsPropertiesAdded(true);
    setIsPropertiesModalVisible(false);
  };

  const columns = [
    ...(data?.getTemplateById?.fields.map((field) => ({
      title: field.fieldName,
      dataIndex: field.fieldName,
      key: field.id,
      render: (text) => <span>{text || '-'}</span>,
    })) || []),
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record, index) => (
        <Space size="middle">
          <EditOutlined
            onClick={() => handleEditEntry(index)}
            style={{ color: 'blue', cursor: 'pointer' }}
          />
          <Popconfirm
            title="Are you sure to delete this entry?"
            onConfirm={() => handleDeleteEntry(index)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined style={{ color: 'red', cursor: 'pointer' }} />
          </Popconfirm>
        </Space>
      ),
      onCell: () => ({
        style: {
          minWidth: 150, // Minimum width for the Add Field column
        },
      }),
    },
  ];
  const getFieldIdByName = (fieldName) => {
    const field = data?.getTemplateById?.fields.find(
      (f) => f.fieldName === fieldName,
    );
    return field ? field.id : null;
  };
  const getFieldTypeByFieldId = (fieldId) => {
    const field = data?.getTemplateById?.fields.find((f) => f.id === fieldId);
    return field ? field.fieldType : null;
  };

  const getTableEntries = () =>
    tableData.map((row) =>
      Object.entries(row).map(([fieldName, value]) => {
        const fieldId = getFieldIdByName(fieldName);
        const fieldType = getFieldTypeByFieldId(fieldId);

        let finalValue = String(value);

        if (fieldType === 'OPTIONS') {
          if (Array.isArray(value)) {
            finalValue = value.join(',');
          }
        }

        if (fieldType === 'CHECKBOXES') {
          if (Array.isArray(value)) {
            finalValue = value.join(',');
          }
        }

        return {
          fieldId,
          value: finalValue,
        };
      }),
    );

  const getPropertyValues = () =>
    Object.keys(propertiesData).map((propertyName) => ({
      propertyId: data.getTemplateById.properties.find(
        (prop) => prop.propertyName === propertyName,
      )?.id, // Find the propertyId from the property name
      value: String(propertiesData[propertyName]),
    }));

  const handleSave = async () => {
    try {
      const tableEntries = getTableEntries();
      const propertyValues = getPropertyValues();
// eslint-disable-next-line no-console
// console.log(tableEntries);
      const response = await submitResponse({
        variables: {
          templateId,
          tableEntries,
          propertyValues,
        },
      });

      if (response.data.submitResponse.success) {
        alert('Response submitted successfully!');
      } else {
        alert(`Error: ${response.data.submitResponse.message}`);
      }
      // eslint-disable-next-line no-shadow
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error submitting response:', error);
      alert('An error occurred while submitting the response.');
    }
  };
  const paginatedData = tableData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div>
      <Header name={data.getTemplateById?.name}/>
      <Card title="Properties" style={{ marginBottom: 16 }}>
        {Object.keys(propertiesData).length > 0 ? (
          Object.entries(propertiesData).map(([propertyName, value]) => (
            <div key={propertyName} style={{ marginBottom: 8 }}>
              <strong>{propertyName}: </strong>
              <span>{value}</span>
            </div>
          ))
        ) : (
          <p>No properties data available.</p>
        )}
        <Button
          type="link"
          onClick={() => setIsPropertiesModalVisible(true)}
          style={{ marginTop: 8, float: 'right' }}
        >
          {isPropertiesAdded ? 'Edit Property' : 'Add Property'}
        </Button>
      </Card>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 16,
        }}
      >
        <Button type="primary" onClick={handleAddEntry}>
          + Add entry
        </Button>
      </div>
<div className='table-container'>
      <Table
        dataSource={paginatedData}
        columns={columns}
        rowKey={(record, index) => index}
        locale={{ emptyText: 'No data available' }}
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
      <div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 16,

  }}
>

  <Button
    type="primary"
    onClick={handleAddEntry}
    style={{ position: 'relative', left: 1 }}
  >
    + Add Entry
  </Button>
  <Button type="primary" onClick={handleSave}>
    Save Response
  </Button>
</div>
      </div>


      {/* Custom footer for pagination */}
      <div className="pagination-footer">
        <div className="pagination-controls">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={tableData.length}
            showSizeChanger
            pageSizeOptions={['5', '10', '25', '50']}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
          />
        </div>
      </div>
      <AddEntryModal
  visible={isModalVisible}
  onCancel={() => setIsModalVisible(false)}
  onSubmit={(newEntry) => {
    const updatedData = editingIndex !== null
      ? tableData.map((entry, i) => (i === editingIndex ? newEntry : entry))
      : [...tableData, newEntry];

    setTableData(updatedData);

    // If it’s a new entry, calculate the last page and set it as the current page
    if (editingIndex === null) {
      const totalEntries = updatedData.length;
      const newPageCount = Math.ceil(totalEntries / pageSize);
      setCurrentPage(newPageCount);
    }

    setIsModalVisible(false);
    setEditingIndex(null); // Reset editing index after editing
  }}
  fields={data?.getTemplateById?.fields || []}
  initialValues={editingIndex !== null ? tableData[editingIndex] : null} // Pass initial values when editing
/>

      <PropertiesModal
        visible={isPropertiesModalVisible}
        onCancel={() => setIsPropertiesModalVisible(false)}
        onSubmit={handleSaveProperties}
        properties={data?.getTemplateById?.properties || []}
      />
    </div>
  );
};

export default FillTable;
