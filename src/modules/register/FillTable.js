/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-undef */
/* eslint-disable no-alert */
/* eslint-disable no-console */
import {
  DeleteOutlined,
  DownOutlined,
  UploadOutlined,
  FileImageOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';
import {
  Button,
  Card,
  Checkbox,
  Dropdown,
  Form,
  Input,
  Menu,
  Modal,
  notification,
  Select,
  Table,
} from 'antd';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { evaluate } from 'mathjs';
import { utils, writeFile } from 'xlsx';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../common/constants';
import useFetchUserFullName from '../../hooks/useFetchUserNames';
import Header from './components/Header';
import {
  GET_ALL_RESPONSES_FOR_SET,
  GET_TEMPLATE_BY_ID,
} from './graphql/Queries';
import './headerButton.less';
import './register.less';
import CenteredSpin from '../Dashboard/component/CentredSpin';
import SetDetailsCard from './components/SetDetailsCard';
import ShowPropertyComponent from './components/ShowPropertyComponent';
import TableFieldComponent from './components/TableFieldComponent';
import NavigationGuard from './components/NavigationGuard';

const FillTableResponse = () => {
  const [tableData, setTableData] = useState([]);
  const [setData, setSetData] = useState({});
  const [propertiesData, setPropertiesData] = useState({});
  const tableFieldRef = useRef(null);
  const navigate = useNavigate();
  const [tableHeight, setTableHeight] = useState('100vh');
  const [initialPropertiesData, setInitialPropertiesData] = useState({});
  const [isAllRowsComplete, setIsAllRowsComplete] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    const updateTableHeight = () => {
      const offset = 300;
      const availableHeight = window.innerHeight - offset;
      setTableHeight(availableHeight > 0 ? availableHeight : 0);
    };
    updateTableHeight();
    window.addEventListener('resize', updateTableHeight); // Recalculate on resize
    return () => {
      window.removeEventListener('resize', updateTableHeight); // Cleanup listener
    };
  }, []);

  const fetchUserNames = useFetchUserFullName();
  const { templateId, setId } = useParams();
  const location = useLocation();
  const filling = location.state?.filling ?? false;
  // console.log("giik",filling);

  const {
    data: templateData,
    loading: templateLoading,
    error: templateError,
  } = useQuery(GET_TEMPLATE_BY_ID, {
    variables: { id: templateId },
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: responseData,
    loading: responseLoading,
    error: responseError,
  } = useQuery(GET_ALL_RESPONSES_FOR_SET, {
    variables: { setId },
    fetchPolicy: 'cache-and-network',
  });

  const getPropertyById = (propertyId, properties) => {
    const property = properties.find((prop) => prop.id === propertyId);
    return property ? property.propertyName : null;
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
      const { setDetails } = responseData.getAllResponsesForSet;
      const fetchCreatedByName = async () => {
        if (setDetails?.createdBy) {
          const fullName = await fetchUserNames(setDetails.createdBy); // Fetch the full name by ID
          const updatedName = await fetchUserNames(setDetails.updatedBy);
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
      };
      fetchCreatedByName();
      const flattenedFieldResponses = responseData.getAllResponsesForSet.fieldResponses.flat();
      const existingData = flattenedFieldResponses.reduce((acc, response) => {
        const row = acc.find((r) => r.rowNumber === response.rowNumber);
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
      existingData.push({isNewRow: true});
      setTableData(existingData);

      const existingProperties = {};
      responseData.getAllResponsesForSet.propertyResponses?.forEach(
        (propertyResponse) => {
          const propertyName = getPropertyById(
            propertyResponse.propertyId,
            templateData.getTemplateById?.properties,
          );
          existingProperties[propertyName] = propertyResponse.value;
        },
      );

      templateData.getTemplateById?.properties.forEach((property) => {
        if (!(property.propertyName in existingProperties)) {
          existingProperties[property.propertyName] = ''; // Assign default value if no response exists
        }
      });

      setPropertiesData(existingProperties);
      setInitialPropertiesData(existingProperties);
    }
  }, [templateData, responseData]);
  const handleViewChangeLog = () => {
    const changeLogUrl = ROUTES.VIEW_SET_CHANGE_LOG.replace(':setId', setId);
    navigate(changeLogUrl, {
      state: {
        templateName: templateData?.getTemplateById?.name,
        templateId,
      },
    });
  };

  const handleSaveClick = () => {
    if (isEditing) {
      notification.warning({
        message: 'Warning',
        description: 'First Save the Properties and then save the table.',
      });
      return;
    }
    if (tableFieldRef.current) {
      tableFieldRef.current.handleSave();
    }
  };

  const handleCsvExport = () => {
    // Prepare the data for export
    const templateName =
      templateData?.getTemplateById?.name || 'Unknown Template';
    const projectId =
      templateData?.getTemplateById?.projectId || 'Unknown Project';
    const properties = propertiesData;

    // Get additional details like created and updated information
    const setCreatedBy = setData?.createdBy || 'Unknown User';
    const setCreatedAt = setData?.createdAt
      ? moment(Number(setData.createdAt))
          .tz('Asia/Kolkata')
          .format('DD/MM/YYYY HH:mm')
      : 'N/A';
    const setUpdatedBy = setData?.updatedBy || 'N/A';
    const setUpdatedAt = setData?.updatedAt
      ? moment(Number(setData.updatedAt))
          .tz('Asia/Kolkata')
          .format('DD/MM/YYYY HH:mm')
      : 'N/A';

    // Prepare the table data with property names and values
    const exportData = tableData.slice(0, -1).map((row) => {
      const rowData = {};

      rowData['Register Name'] = templateName;
      rowData['Project ID'] = projectId;

      // Add additional information

      // Add property names and values to the row
      Object.entries(properties).forEach(([propertyName, propertyValue]) => {
        rowData[propertyName] = propertyValue;
      });

      // Add field names and values to the row
      templateData?.getTemplateById?.fields
      .forEach((field) => {
        const fieldId = field.id;
        let fieldValue = row[fieldId]?.value || '-';
      console.log("fieldType",field.fieldType);
      if (field.fieldType === 'ATTACHMENT' && fieldValue !== '-') {
        const constantValue = 'https://storage.googleapis.com/digiqc_register/';
        fieldValue = fieldValue
          .split(',')
          .map((item) => `${constantValue}${item.trim()}`)
          .join(', ');
      }

        rowData[field.fieldName] = fieldValue;
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
    const filename = `${templateName}_${projectId}_${setCreatedAt}.csv`;
    writeFile(wb, filename);
  };

  const handlePdfExport = () => {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();
    const templateName =
      templateData?.getTemplateById?.name || 'Unknown Template';
    const projectId =
      templateData?.getTemplateById?.projectId || 'Unknown Project';
    const properties = propertiesData;

    // Set details
    const setCreatedBy = setData?.createdBy || 'Unknown User';
    const setCreatedAt = setData?.createdAt
      ? moment(Number(setData.createdAt))
          .tz('Asia/Kolkata')
          .format('DD/MM/YYYY HH:mm')
      : 'N/A';
    const setUpdatedBy = setData?.updatedBy || 'N/A';
    const setUpdatedAt = setData?.updatedAt
      ? moment(Number(setData.updatedAt))
          .tz('Asia/Kolkata')
          .format('DD/MM/YYYY HH:mm')
      : 'N/A';

    // Header logos
    const headerLogo = 'https://i.imgur.com/ag6OZGW.png'; // Replace with actual logo URL if necessary
    const footerLogo = 'https://i.imgur.com/ag6OZGW.png'; // Replace with actual logo URL if necessary
    const footerText = 'Digitize.Monitor.Improve';

    // Add header logos
    doc.addImage(headerLogo, 'PNG', 10, 5, 30, 10); // Left logo
    doc.addImage(
      headerLogo,
      'PNG',
      doc.internal.pageSize.width - 40,
      5,
      30,
      10,
    ); // Right logo

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
      ${Object.entries(properties)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')}
    `;

    const startY = 30; // Position below the header
    const contentLines = doc.splitTextToSize(
      `${setDetailsContent}\n     Properties:${propertiesContent}`,
      doc.internal.pageSize.width - 20,
    );
    doc.text(contentLines, 10, startY);

    // Prepare table data
    const tableDatas = tableData.slice(0, -1).map((row) =>
      templateData?.getTemplateById?.fields.map((field) => {
        const fieldId = field.id;
        const fieldValue = row[fieldId]?.value;
        return fieldValue || '-';
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
      didParseCell: (data) => {
        const columnIndex = data.column.index;
        const field = templateData?.getTemplateById?.fields[columnIndex];
        if (field?.fieldType === 'ATTACHMENT' && data.row.section === 'body') {
          // Clear cell text to prevent displaying placeholder or empty string
          data.cell.text = [];
        }
      },
      didDrawCell: (data) => {
        const columnIndex = data.column.index;
        const rowIndex = data.row.index;
        const field = templateData?.getTemplateById?.fields[columnIndex];
        const fieldValue = tableDatas[rowIndex][columnIndex];
        // eslint-disable-next-line no-param-reassign
        console.log("data",data);
        if (data.row.section === 'head') {
          return data.cell.text; // Exit if it's a header cell
        }
        // Check if the field type is ATTACHMENT and fieldValue exists
        if (field?.fieldType === 'ATTACHMENT' && fieldValue) {
          const fileLinks = fieldValue.split(',').map((fileName) => {
            const fileUrl = `https://storage.googleapis.com/digiqc_register/${fileName.trim()}`;
            return fileUrl;
          });
          data.cell.text = [];
          // const linkX = data.cell.x + 2; // Padding inside the cell
          // const linkY = data.cell.y + data.cell.height / 2; // Center the link vertically

          const iconSize = 5;
          fileLinks.forEach((fileUrl, index) => {
            // const linkX = data.cell.x + 2 + index *19; // Adjust horizontal spacing (50 is just an example, you can change it)
            // const linkY = data.cell.y + data.cell.height / 2; // Center vertically
            const linkX = data.cell.x + 2 + index * 10; // Adjust horizontal spacing
            const linkY = data.cell.y + (data.cell.height - iconSize) / 2; // Center vertically

            // Add the image icon in the cell
            // doc.addImage(fileUrl, 'PNG', linkX, linkY, iconSize, iconSize);
            // doc.addImage(, 'PNG', linkX, linkY, 10, 10);
            // doc.imageWithLink(fileUrl, linkX, linkY, iconSize, iconSize, {    url: fileUrl});
            // doc.textWithLink(
            //   ``, // Display text
            //   linkX,
            //   linkY, // Add spacing for multiple links
            //   { url: fileUrl },
            // );
            doc.addImage(fileUrl, 'PNG', linkX, linkY, iconSize, iconSize);

            // Create a clickable link over the image area
            doc.link(linkX, linkY, iconSize, iconSize, { url: fileUrl });
          });

          // Clear the default content in the cell
          // eslint-disable-next-line no-param-reassign

        }
      },
      didDrawPage: (data) => {
        const currentPageHeight = doc.internal.pageSize.height;
        const footerY = currentPageHeight - 8;

        // Footer logos and text
        doc.addImage(footerLogo, 'PNG', 10, footerY - 10, 30, 10);
        const textWidth = doc.getTextWidth(footerText);
        doc.text(
          footerText,
          (doc.internal.pageSize.width - textWidth) / 2,
          footerY - 5,
        );

        // Page number
        const pageCount = doc.internal.pages.length;
        doc.text(
          `Page ${data.pageNumber}/${pageCount - 1}`,
          doc.internal.pageSize.width - 10,
          footerY - 5,
          { align: 'right' },
        );
      },
    });
    const filename = `${templateName}_${projectId}_${setCreatedAt}.pdf`;
    doc.save(filename);
  };



  const exportMenu = (
    <Menu>
      <Menu.Item key="csv" icon={<UploadOutlined /> }onClick={handleCsvExport} >
        Export as CSV
      </Menu.Item>
      <Menu.Item key="pdf" icon={<UploadOutlined />}onClick={handlePdfExport} >
        Export as Pdf
      </Menu.Item>
    </Menu>
  );

  // if (templateLoading && responseLoading) {
  //   return (
  //     <CenteredSpin/>
  //   );
  // }

  return (
   <NavigationGuard
    confirmationMessage="You have unsaved changes. Are you sure you want to leave this page?"
  >
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        name={templateData?.getTemplateById?.name}
        setId={setId}
        templateId={templateId}
        location={window.location.href}
        setData={setData}
        isAllRowsComplete={isAllRowsComplete}
      />
      {(templateLoading||responseLoading)&&
      <CenteredSpin/>}
{(!templateLoading || !responseLoading)&& ( <>
      <div className="header" style={{ padding: '16px',marginTop: '55px' }}>
{!filling && (
  <>
    <Dropdown overlay={exportMenu} trigger={['click']}>
      <Button
        type="primary"
        icon={<UploadOutlined />}
        style={{ backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' }}
      >
        Export <DownOutlined />
      </Button>
    </Dropdown>
    <Button onClick={handleViewChangeLog}>View Change Log</Button>
  </>
)}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>


    <ShowPropertyComponent setPropertiesData={setPropertiesData}  propertiesData={propertiesData} templateData={templateData} responseData={responseData}  initialPropertiesData={initialPropertiesData} isEditing={isEditing} setIsEditing={setIsEditing} setId={setId}/>

        <div style={{ marginBottom: 16 }}>
<TableFieldComponent ref={tableFieldRef} templateId={templateId} tableData={tableData} setTableData={setTableData} templateData={templateData} tableHeight={tableHeight} templateError={templateError} responseError={responseError} setId={setId} filling={filling} setIsAllRowsComplete={setIsAllRowsComplete}/>
        </div>

      </div>
      <div
    style={{
      marginBottom: 5,
      marginTop: 16,
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px',
      background: '#fff',
      borderTop: '1px solid #f0f0f0',
      position: 'sticky',
      bottom: 0,
      zIndex: 1,
    }}
  >
    <Button type="primary" onClick={handleSaveClick} >
      Save Response
    </Button>
  </div>
  </>)}
    </div>

  </NavigationGuard>
  );
};

export default FillTableResponse;
