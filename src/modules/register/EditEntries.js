/* eslint-disable no-undef */
/* eslint-disable no-alert */
/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import { Table, Button, Card, Space, Popconfirm, Pagination ,Dropdown,Menu} from 'antd';
import { EditOutlined, DeleteOutlined,ExportOutlined,DownOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import { GET_TEMPLATE_BY_ID, GET_ALL_RESPONSES_FOR_SET } from './graphql/Queries';
import { EDIT_RESPONSE_MUTATION } from './graphql/Mutation';
import './register.less';
import './headerButton.less';
import AddModal from './components/AddModal';
import PropertiesModal from './components/EditPropertyModal';
import { ROUTES } from '../../common/constants';
import 'jspdf-autotable';

const EditEntry = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPropertiesModalVisible, setIsPropertiesModalVisible] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [propertiesData, setPropertiesData] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [pageSize, setPageSize] = useState(10); // State to store page size
  const [currentPage, setCurrentPage] = useState(1);
  const [initialValues, setInitialValues] = useState(null);
  const navigate=useNavigate();

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

  useEffect(() => {
    if (templateData) {
      setTableData([]);
      const initialProperties = {};
      templateData.getTemplateById?.properties.forEach((property) => {
        initialProperties[property.propertyName] = '';
      });
      setPropertiesData(initialProperties);
    }

    if (responseData) {
      const flattenedFieldResponses = responseData.getAllResponsesForSet.fieldResponses.flat();
      console.log("flatr",flattenedFieldResponses);
      const existingData = flattenedFieldResponses.reduce((acc, response) => {
        const row = acc.find(r => r.rowNumber === response.rowNumber);
        if (row) {
          console.log("here:",response);
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
        console.log("property REsponse:",propertyResponse);
        const propertyName=getPropertyById(propertyResponse.propertyId,templateData.getTemplateById?.properties);
        existingProperties[propertyName] = propertyResponse.value;
      });
      setPropertiesData(existingProperties);
    }
  }, [templateData, responseData]);

  const handleAddEntry = () => {
    setEditingIndex(null);
    setIsModalVisible(true);
  };


  const handleSaveEntry = (entry) => {
    // console.log("entry: ",entry);
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

    // Prepare the table data with property names and values
    const exportData = tableData.map((row) => {
      const rowData = {};


      rowData['Register Name'] = templateName;
      rowData['Project ID'] = projectId;


      // Add property names and values to the row
      Object.entries(properties).forEach(([propertyName, propertyValue]) => {
        rowData[propertyName] = propertyValue;
      });


      templateData?.getTemplateById?.fields.forEach((field) => {
        const fieldId = field.id;
        rowData[field.fieldName] = row[fieldId]?.value || '-';
      });
      return rowData;
    });

    // Convert the data to a worksheet
    const ws = utils.json_to_sheet(exportData);

    // Convert the worksheet to a workbook
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Template Data');

    // Export the CSV file
    writeFile(wb, 'template_data_export.csv');
  };

  const handlePdfExport = () => {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();
    const templateName = templateData?.getTemplateById?.name || 'Unknown Template';
    const projectId = templateData?.getTemplateById?.projectId || 'Unknown Project';
    const properties = propertiesData;
    const headerLogo = 'https://digiqc-staging-public.s3.ap-south-1.amazonaws.com/digiqc-logos/digiqc-log0-192x64.png';
    const footerLogo = 'https://digiqc-staging-public.s3.ap-south-1.amazonaws.com/digiqc-logos/digiqc-log0-192x64.png';
    const footerText = 'Digitize.Monitor.Improve';

    const leftLogoWidth = 30;
    const leftLogoHeight = 10;
    doc.addImage(headerLogo, 'PNG', 10, 5, leftLogoWidth, leftLogoHeight);

    const rightLogoWidth = 30;
    const rightLogoHeight = 10;
    doc.addImage(headerLogo, 'PNG', doc.internal.pageSize.width - 40, 5, rightLogoWidth, rightLogoHeight);

    const headerHeight = 20;
    const spacingAfterHeader = 10;

    // Add header content
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${projectId}`, doc.internal.pageSize.width / 2, 20, { align: 'center' });

    // Add additional content
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const additionalContent = `
      Template Name: ${templateName}
      ${Object.entries(properties).map(([key, value]) => `${key}: ${value}`).join('\n')}
    `;
    const startY = 30; // Position below the header
    const contentLines = doc.splitTextToSize(additionalContent, doc.internal.pageSize.width - 20);
    doc.text(contentLines, 10, startY);

    // Prepare table data
    const tableDatas = tableData.map((row) =>
      templateData?.getTemplateById?.fields.map((field) => {
        const fieldId = field.id;
        return row[fieldId]?.value || '-'; // Ensure data is formatted properly
      }),
    );

    const columns = templateData?.getTemplateById?.fields.map((field) => ({
      title: field.fieldName,
      dataKey: field.fieldName,
    }));
    const headers = columns.map((col) => col.title);

    // Add table
    doc.autoTable({
      head: [headers], // This will only show the titles in the header
      body: tableDatas, // This is the actual data for the rows
      startY: startY + contentLines.length * 5 , // Ensure space below the content
      theme: 'striped',
      margin: { bottom: 50 },
      pageBreak: 'auto',
      didDrawPage: (data) => {
        const currentPageHeight = doc.internal.pageSize.height;
        const footerY = currentPageHeight - 8;
        const footerLogoWidth = 30;
        const footerLogoHeight = 10;

        // Footer
        doc.addImage(footerLogo, 'PNG', 10, footerY - footerLogoHeight, footerLogoWidth, footerLogoHeight);
        const textWidth = doc.getTextWidth(footerText);
        doc.text(footerText, (doc.internal.pageSize.width - textWidth) / 2, footerY - 5);
        const pageCount = doc.internal.pages.length;
        doc.text(`Page ${data.pageNumber}/${pageCount - 1}`, doc.internal.pageSize.width - 10, footerY - 5, { align: 'right' });
      },
    });

    doc.save('template_data_export.pdf');
  };


  const handleViewChangeLog = () => {
    const changeLogUrl = ROUTES.VIEW_SET_CHANGE_LOG.replace(':setId', setId);
    navigate(changeLogUrl);

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
  const paginatedData = tableData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
console.log("tablemDtata",tableData);
  console.log("propertiess sata :",propertiesData);
  return (
    <div>
        <div className="header">
        <Dropdown overlay={exportMenu} trigger={['click']}>
            <Button type="primary" icon={<ExportOutlined />} style={{ backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' }}>
              Export <DownOutlined />
            </Button>
          </Dropdown>
        <Button onClick={handleViewChangeLog}>
          View Change Log
        </Button>
      </div>
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
           Edit Property
        </Button>
      </Card>



      <div className="table-container">
        <Table
          dataSource={paginatedData}
          columns={columns}
          rowKey={(record, index) => index}
          locale={{ emptyText: 'No data available' }}
          pagination={false}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <Button type="primary" onClick={handleAddEntry} style={{ position: 'relative', left: 1 }}>
            + Add Entry
          </Button>
          <Button type="primary" onClick={handleSave}>
            Save Response
          </Button>
        </div>
      </div>

      <AddModal
        visible={isModalVisible}
        onSave={handleSaveEntry}
        // eslint-disable-next-line no-sequences
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
      <div className="pagination-footer">
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
