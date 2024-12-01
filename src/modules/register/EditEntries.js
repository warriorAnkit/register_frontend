/* eslint-disable no-nested-ternary */
/* eslint-disable no-undef */
/* eslint-disable no-alert */
/* eslint-disable no-console */
import { DeleteOutlined, DownOutlined, EditOutlined, ExportOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';
import { Button, Card, Dropdown, Menu, Pagination, Popconfirm, Space, Table } from 'antd';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { utils, writeFile } from 'xlsx';
import { ROUTES } from '../../common/constants';
import useFetchUserFullName from '../../hooks/useFetchUserNames';
import AddModal from './components/AddModal';
import PropertiesModal from './components/EditPropertyModal';
import Header from './components/Header';
import { EDIT_RESPONSE_MUTATION } from './graphql/Mutation';
import { GET_ALL_RESPONSES_FOR_SET, GET_TEMPLATE_BY_ID } from './graphql/Queries';
import './headerButton.less';
import './register.less';

const EditEntry = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPropertiesModalVisible, setIsPropertiesModalVisible] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [setData,setSetData]=useState({});
  const [propertiesData, setPropertiesData] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [pageSize, setPageSize] = useState(10); // State to store page size
  const [currentPage, setCurrentPage] = useState(1);
  const [initialValues, setInitialValues] = useState(null);
  const navigate=useNavigate();

  const fetchUserNames=useFetchUserFullName();
  const { templateId, setId } = useParams();

  const { data: templateData, loading: templateLoading, error: templateError } = useQuery(GET_TEMPLATE_BY_ID, {
    variables: { id: templateId },
    fetchPolicy:"cache-and-network",
  });

  const { data: responseData, loading: responseLoading, error: responseError } = useQuery(GET_ALL_RESPONSES_FOR_SET, {
    variables: { setId },
    fetchPolicy:"cache-and-network",
  });

  const [editResponse] = useMutation(EDIT_RESPONSE_MUTATION);

  const getPropertyById = (propertyId, properties) => {
    const property = properties.find(prop => prop.id === propertyId);
    return property ? property.propertyName : null; // Return property name if found, otherwise null
  };

  // useEffect(() => {
  //   if (templateData) {
  //     setTableData([]);
  //     const initialProperties = {};
  //     templateData.getTemplateById?.properties.forEach((property) => {
  //       initialProperties[property.propertyName] = '';
  //     });
  //     setPropertiesData(initialProperties);
  //   }

  //   if (responseData) {
  //     const { setDetails } = responseData.getAllResponsesForSet;

  //     // Set the set data including createdBy ID
  //     const fetchCreatedByName = async () => {
  //       if (setDetails?.createdBy) {
  //         const fullName = await fetchUserNames(setDetails.createdBy); // Fetch the full name by ID
  //         const updatedName=await fetchUserNames(setDetails.updatedBy)
  //         // Directly set the createdBy with the fetched name
  //         setSetData((prevState) => ({
  //           ...prevState,
  //           createdBy: fullName || 'Unknown User',
  //           createdById: setDetails.createdBy, // Optionally store the ID
  //           createdAt: setDetails?.createdAt,
  //           updatedBy: updatedName,
  //           updatedAt: setDetails?.updatedAt,
  //           id: setDetails?.id,
  //         }));
  //       }
  //     }
  //     fetchCreatedByName();
  //     const flattenedFieldResponses = responseData.getAllResponsesForSet.fieldResponses.flat();

  //     const existingData = flattenedFieldResponses.reduce((acc, response) => {
  //       const row = acc.find(r => r.rowNumber === response.rowNumber);
  //       if (row) {

  //         row[response.fieldId] = {
  //           value: response.value,
  //           responseId: response.id,
  //         };
  //       } else {
  //         acc.push({
  //           rowNumber: response.rowNumber,
  //           [response.fieldId]: {
  //             value: response.value,
  //             responseId: response.id,
  //           },
  //         });
  //       }
  //       return acc;
  //     }, []);
  //     setTableData(existingData);





  //     const existingProperties = {};
  //     responseData.getAllResponsesForSet.propertyResponses?.forEach((propertyResponse) => {

  //       const propertyName=getPropertyById(propertyResponse.propertyId,templateData.getTemplateById?.properties);
  //       existingProperties[propertyName] = propertyResponse.value;
  //     });
  //     setPropertiesData(existingProperties);
  //   }
  // }, [templateData, responseData]);

  // console.log("SET DETAILS",setData);
  useEffect(() => {
    if (templateData) {
      setTableData([]);
      const initialProperties = {};

      // Initialize all properties with an empty string or '-' if no response is available
      templateData.getTemplateById?.properties.forEach((property) => {
        initialProperties[property.propertyName] = ''; // Default value for properties without a response
      });

      setPropertiesData(initialProperties);
    }

    if (responseData) {
      const { setDetails } = responseData.getAllResponsesForSet;

      // Set the set data including createdBy ID
      const fetchCreatedByName = async () => {
        if (setDetails?.createdBy) {
          const fullName = await fetchUserNames(setDetails.createdBy); // Fetch the full name by ID
          const updatedName = await fetchUserNames(setDetails.updatedBy);
          // Directly set the createdBy with the fetched name
          setSetData((prevState) => ({
            ...prevState,
            createdBy: fullName || 'Unknown User',
            createdById: setDetails.createdBy, // Optionally store the ID
            createdAt: setDetails?.createdAt,
            updatedBy: updatedName,
            updatedAt: setDetails?.updatedAt,
            id: setDetails?.id,
          }));
        }
      }
      fetchCreatedByName();

      const flattenedFieldResponses = responseData.getAllResponsesForSet.fieldResponses.flat();

      const existingData = flattenedFieldResponses.reduce((acc, response) => {
        const row = acc.find(r => r.rowNumber === response.rowNumber);
        if (row) {
          row[response.fieldId] = {
            value: response.value,
            responseId: response.id,
          };
        } else {
          acc.push({
            rowNumber: response.rowNumber,
            [response.fieldId]: {
              value: response.value,
              responseId: response.id,
            },
          });
        }
        return acc;
      }, []);
      setTableData(existingData);

      const existingProperties = {};
      responseData.getAllResponsesForSet.propertyResponses?.forEach((propertyResponse) => {
        const propertyName = getPropertyById(propertyResponse.propertyId, templateData.getTemplateById?.properties);
        existingProperties[propertyName] = propertyResponse.value;
      });

      // Ensure that all properties are accounted for, even if no response is found
      templateData.getTemplateById?.properties.forEach((property) => {
        if (!(property.propertyName in existingProperties)) {
          existingProperties[property.propertyName] = ''; // Assign default value if no response exists
        }
      });

      setPropertiesData(existingProperties);
    }
  }, [templateData, responseData]);
  const handleAddEntry = () => {
    setEditingIndex(null);
    setIsModalVisible(true);
  };


  const handleSaveEntry = (entry) => {

    if (editingIndex !== null) {
      setTableData((prevData) =>
        prevData.map((row, index) => (index === editingIndex ? { ...row, ...entry } : row)),
      );
    } else {
      const newEntry = { id: Date.now(), ...entry };
      setTableData((prevData) => [...prevData, newEntry]);
    }
    setIsModalVisible(false);
  };
  const handleEditEntry = (index) => {
    setEditingIndex(index);
    setInitialValues(tableData[index]);
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

    setIsPropertiesModalVisible(false);
  };
  const handleCsvExport = () => {
    // Prepare the data for export
    const templateName = templateData?.getTemplateById?.name || 'Unknown Template';
    const projectId = templateData?.getTemplateById?.projectId || 'Unknown Project';
    const properties = propertiesData;

    // Get additional details like created and updated information
    const setCreatedBy = setData?.createdBy || 'Unknown User';
    const setCreatedAt = setData?.createdAt
      ? moment(Number(setData.createdAt)).tz('Asia/Kolkata').format('DD/MM/YYYY HH:mm')
      : 'N/A';
    const setUpdatedBy = setData?.updatedBy || 'N/A';
    const setUpdatedAt = setData?.updatedAt
      ? moment(Number(setData.updatedAt)).tz('Asia/Kolkata').format('DD/MM/YYYY HH:mm')
      : 'N/A';

    // Prepare the table data with property names and values
    const exportData = tableData.map((row) => {
      const rowData = {};

      rowData['Register Name'] = templateName;
      rowData['Project ID'] = projectId;

      // Add additional information

      // Add property names and values to the row
      Object.entries(properties).forEach(([propertyName, propertyValue]) => {
        rowData[propertyName] = propertyValue;
      });

      // Add field names and values to the row
      templateData?.getTemplateById?.fields.forEach((field) => {
        const fieldId = field.id;
        rowData[field.fieldName] = row[fieldId]?.value || '-';
      });
      rowData['Created By'] = setCreatedBy;
      rowData['Created At'] = setCreatedAt;
      rowData['Last Updated By'] = setUpdatedBy;
      rowData['Last Updated At'] = setUpdatedAt;

      return rowData;
    });

    // Convert the data to a worksheet
    const ws = utils.json_to_sheet(exportData);

    // Convert the worksheet to a workbook
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Template Data');

    // Export the CSV file
    const filename = `${templateName}_${projectId}_${setCreatedAt}.csv`
    writeFile(wb, filename);
  };

  const handlePdfExport = () => {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();
    const templateName = templateData?.getTemplateById?.name || 'Unknown Template';
    const projectId = templateData?.getTemplateById?.projectId || 'Unknown Project';
    const properties = propertiesData;

    // Set details
    const setCreatedBy = setData?.createdBy || 'Unknown User';
    const setCreatedAt = setData?.createdAt
    ? moment(Number(setData.createdAt)).tz('Asia/Kolkata').format('DD/MM/YYYY HH:mm')
    : 'N/A';
    const setUpdatedBy = setData?.updatedBy || 'N/A';
    const setUpdatedAt = setData?.updatedAt
    ? moment(Number(setData.updatedAt)).tz('Asia/Kolkata').format('DD/MM/YYYY HH:mm')
    : 'N/A';

    // Header logos
    const headerLogo = 'https://i.imgur.com/ag6OZGW.png'; // Replace with actual logo URL if necessary
    const footerLogo = 'https://i.imgur.com/ag6OZGW.png'; // Replace with actual logo URL if necessary
    const footerText = 'Digitize.Monitor.Improve';

    // Add header logos
    doc.addImage(headerLogo, 'PNG', 10, 5, 30, 10); // Left logo
    doc.addImage(headerLogo, 'PNG', doc.internal.pageSize.width - 40, 5, 30, 10); // Right logo

    // Header content
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    // doc.text(`${projectId}`, doc.internal.pageSize.width / 2, 20, { align: 'center' });

    // Add set details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const setDetailsContent = `
      ProjectId:${projectId}
      Template Name: ${templateName}
      Created By: ${setCreatedBy}
      Created At: ${setCreatedAt}
      Updated By: ${setUpdatedBy}
      Updated At: ${setUpdatedAt}
    `;

    const propertiesContent = `
      ${Object.entries(properties).map(([key, value]) => `${key}: ${value}`).join('\n')}
    `;

    const startY = 30; // Position below the header
    const contentLines = doc.splitTextToSize(`${setDetailsContent}\n${propertiesContent}`, doc.internal.pageSize.width - 20);
    doc.text(contentLines, 10, startY);

    // Prepare table data
    const tableDatas = tableData.map((row) =>
      templateData?.getTemplateById?.fields.map((field) => {
        const fieldId = field.id;
        return row[fieldId]?.value || '-';
      }),
    );

    // Table columns
    const columns = templateData?.getTemplateById?.fields.map((field) => ({
      title: field.fieldName,
      dataKey: field.fieldName,
    }));
    const headers = columns.map((col) => col.title);

    // Add table
    doc.autoTable({
      head: [headers],
      body: tableDatas,
      startY: startY + contentLines.length * 5,
      theme: 'striped',
      margin: { bottom: 50 },
      pageBreak: 'auto',
      didDrawPage: (data) => {
        const currentPageHeight = doc.internal.pageSize.height;
        const footerY = currentPageHeight - 8;

        // Footer logos and text
        doc.addImage(footerLogo, 'PNG', 10, footerY - 10, 30, 10);
        const textWidth = doc.getTextWidth(footerText);
        doc.text(footerText, (doc.internal.pageSize.width - textWidth) / 2, footerY - 5);

        // Page number
        const pageCount = doc.internal.pages.length;
        doc.text(`Page ${data.pageNumber}/${pageCount - 1}`, doc.internal.pageSize.width - 10, footerY - 5, { align: 'right' });
      },
    });
  const filename = `${templateName}_${projectId}_${setCreatedAt}.pdf`
    doc.save(filename);
  };


  const handleViewChangeLog = () => {
    const changeLogUrl = ROUTES.VIEW_SET_CHANGE_LOG.replace(':setId', setId);
    navigate(changeLogUrl, {
      state: {
       templateName: templateData?.getTemplateById?.name,
        templateId,
      },
    });

  };



  const columns = [
    ...(templateData?.getTemplateById?.fields.map((field) => ({
      title: field.fieldName,
      dataIndex: field.id,
      key: field.id,
      render: (text) => <span>{text?.value|| '-'}</span>,
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
    },
  ];

  const handleSave = async () => {
    try {

      const propertyValues = Object.keys(propertiesData).map((propertyName) => {

        const propertyId = templateData.getTemplateById.properties.find(
          (prop) => prop.propertyName === propertyName,
        )?.id;


        const responseId = responseData.getAllResponsesForSet.propertyResponses?.find(
          (propResponse) => propResponse.propertyId === propertyId,
        )?.id;



        return {
          propertyId,
          value: String(propertiesData[propertyName]),
          responseId: responseId || null,
        };
      });

const tableEntries = tableData.map(row =>
  Object.entries(row)
    .map(([fieldId, { value, responseId }]) => {
      if (fieldId !== "rowNumber" && fieldId !== "id") {
        return {
          fieldId,  // field ID
          value: String(value),  // field value
          responseId: responseId !== undefined ? responseId : null,  // responseId
          rowNumber: row.rowNumber, // Include rowNumber
        };
      }
      return null;
    })
    .filter(entry => entry !== null), // Filter out null entries
);

      const response = await editResponse({
        variables: {
          setId,
          tableEntries,
           propertyValues,
        },
      });
      if (response.data.editResponse.success) {
        alert('Response submitted successfully!');
        navigate(ROUTES.VIEW_ENTRIES.replace(':templateId', templateId));
        // VIEW_ENTRIES:'/register/view-entries/:templateId',
      } else {
        alert(`Error: ${response.data.submitResponse.message}`);
      }

    } catch (error) {
      console.error('Error submitting response:', error);
      alert('An error occurred while submitting the response.');
    }
  };
  const exportMenu = (
    <Menu>
      <Menu.Item key="csv" icon={<ExportOutlined />} onClick={handleCsvExport}>
        Export as CSV
      </Menu.Item>
      <Menu.Item key="pdf" icon={<ExportOutlined />} onClick={handlePdfExport}>
        Export as Pdf
      </Menu.Item>
    </Menu>
  );
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Slice the data for the current page, starting from the correct index
  const paginatedData = tableData.slice(startIndex, endIndex);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header name={templateData?.getTemplateById?.name} setId={setId} templateId={templateId} />
      <div className="header" style={{ padding: '16px' }}>
        <Dropdown overlay={exportMenu} trigger={['click']}>
          <Button type="primary" icon={<ExportOutlined />} style={{ backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' }}>
            Export <DownOutlined />
          </Button>
        </Dropdown>
        <Button onClick={handleViewChangeLog}>View Change Log</Button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <Card>
          <div style={{ marginBottom: 8 }}>
            <strong>Created By: </strong>
            <span>{setData.createdBy || 'N/A'}</span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Created At: </strong>
            <span>
              {setData.createdAt
                ? moment(setData.createdAt, 'x').isValid()
                  ? moment(setData.createdAt, 'x').format('YYYY-MM-DD HH:mm:ss')
                  : 'Invalid Date'
                : '-'}
            </span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Updated By: </strong>
            <span>{setData.updatedBy || '-'}</span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Updated At: </strong>
            {setData.createdAt
              ? moment(setData.updatedAt, 'x').isValid()
                ? moment(setData.updatedAt, 'x').format('YYYY-MM-DD HH:mm:ss')
                : 'Invalid Date'
              : '-'}
          </div>
        </Card>

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
            style={{ marginTop: 8, float: 'left' }}
          >
            Edit Property
          </Button>
        </Card>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <Button type="primary" onClick={handleAddEntry} style={{ position: 'relative', left: 1 }}>
              + Add Entry
            </Button>
            <Button type="primary" onClick={handleSave}>
              Save Response
            </Button>
          </div>

          <div style={{ minHeight: '300px', overflowY: 'auto' }}>
          <Table
            dataSource={paginatedData}
            columns={columns}
            rowKey={(record, index) => index}
            locale={{ emptyText: 'No data available' }}
            scroll={{ x: 'max-content'}}
            pagination={false}
          />
        </div>
        </div>

        <AddModal
          visible={isModalVisible}
          onSave={handleSaveEntry}
          onCancel={() => {
            setIsModalVisible(false);
            setInitialValues(null);
          }}
          fieldData={templateData?.getTemplateById?.fields || []}
          initialValues={initialValues}
        />
        <PropertiesModal
          visible={isPropertiesModalVisible}
          onCancel={() => setIsPropertiesModalVisible(false)}
          onSubmit={handleSaveProperties}
          properties={propertiesData}
          fieldData={templateData?.getTemplateById?.properties || []}
        />
      </div>

      <div className="pagination-footer" style={{ padding: '16px' }}>
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
  );
};

export default EditEntry;
