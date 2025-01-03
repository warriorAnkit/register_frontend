/* eslint-disable no-console */

/* eslint-disable new-cap */
/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { Table,  Button, Dropdown, Menu, Space, Tabs, DatePicker,Pagination, message } from 'antd';
import {  ExportOutlined, DownOutlined,UploadOutlined ,FileImageOutlined,FilePdfOutlined} from '@ant-design/icons';
import { useQuery, useApolloClient} from '@apollo/client';
import './ViewEntry.less';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment-timezone';


import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { GET_ALL_PROPERTY_RESPONSES_FOR_TEMPLATE, GET_ALL_RESPONSES_FOR_TEMPLATE, GET_TEMPLATE_BY_ID } from './graphql/Queries';
import { GET_USER_BY_ID } from '../auth/graphql/Queries';
import FullNameById from './components/userFullName';
import Header from './components/Header';
import CenteredSpin from '../Dashboard/component/CentredSpin';
import { ROUTES } from '../../common/constants';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const ViewEntries = () => {
  const [activeTab, setActiveTab] = useState('set');
  const [filteredData, setFilteredData] = useState([]);
  const [dateFilteredData, setDateFilteredData] = useState([]);
  const [entriesFilteredData, setEntriesFilterData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [entriesCurrentPage, setEntriesCurrentPage] = useState(1);
  const [entriesPageSize, setEntriesPageSize] = useState(10);
  const [entriesFilteredDatabyDate, setEntriesFilterDataByDate] = useState([]);
  // eslint-disable-next-line no-shadow
  const handlePageChange = (page,pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };
// console.log(entriesFilteredDatabyDate);
  // eslint-disable-next-line no-shadow
  const handleEntriesPageChange = (page,pageSize) => {
    setEntriesCurrentPage(page);
    setEntriesPageSize(pageSize);
  };

  const disabledDate = (current) => current && current > Date.now();
  const { templateId } = useParams();

  const { loading: templateLoading, data: templateData } = useQuery(GET_TEMPLATE_BY_ID, {
    variables: { id: templateId },
    fetchPolicy: 'cache-and-network',
  });
  const { loading: responseLoading, data: responseData } = useQuery(GET_ALL_PROPERTY_RESPONSES_FOR_TEMPLATE, {
    variables: { templateId },
    fetchPolicy: 'cache-and-network',
  });

  const { loading: entryResponseLoading, data: entryResponseData } = useQuery(GET_ALL_RESPONSES_FOR_TEMPLATE, {
    variables: { templateId },
    fetchPolicy: 'cache-and-network',
  });



  useEffect(() => {
    if (responseData && templateData) {
      const { properties } = templateData.getTemplateById;

      const rows = responseData.getAllPropertyResponsesForTemplate.propertyResponses.map((set) => {
        const row = {
          setId: set.setId,
          createdAt: set.propertyResponses[0]?.createdAt,
          createdById:set.propertyResponses[0]?.createdById,
        };

        set.propertyResponses.forEach((response) => {
          row[response.propertyId] = response.value;
        });

        return row;
      });

      setFilteredData(rows);
      setDateFilteredData(rows);
    }
  }, [responseData, templateData]);
  useEffect(() => {
    if (entryResponseData && templateData) {
      const rows = entryResponseData?.getAllResponsesForTemplate?.responses?.map((set) => set.fieldResponses.map((fieldRow) => {
        const row = {
          setId: set.setId,
          createdAt: set.propertyResponses[0]?.createdAt,
        };
        set.propertyResponses.forEach((response) => {
          row[response.propertyId] = response.value;
        });
        fieldRow.forEach((fieldResponse) => {
          row[fieldResponse.fieldId] = fieldResponse.value;
        });
        return row;
      }));
      setEntriesFilterData(rows.flat());
      setEntriesFilterDataByDate(rows.flat());
    }
  }, [entryResponseData, templateData]);
  const handleDateChange = (dates) => {
    setCurrentPage(1);
    if (dates) {
      const istDates = dates.map(dateString => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      });
      const startDate = istDates[0];
      const endDate = istDates[1];
      const filteredSets = filteredData.filter((row) => {
        const createdAt =moment(row.createdAt);
        return createdAt.isBetween(startDate, endDate, 'day', '[]');
      });
      setDateFilteredData(filteredSets);
    } else {
      setDateFilteredData(filteredData);
    }
  };
  const handleEntriesDateChange = (dates) => {
    setEntriesCurrentPage(1);
    if (dates) {
      const istDates = dates.map(dateString => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      });
      const startDate = istDates[0];
      const endDate = istDates[1];
      const filteredEntries = entriesFilteredData.filter((row) => {

        const createdAt =moment(parseInt(row.createdAt, 10));

        return createdAt.isBetween(startDate, endDate, 'day', '[]');
      });
      setEntriesFilterDataByDate(filteredEntries);
    } else {
      setEntriesFilterDataByDate(entriesFilteredData);

    }
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'key',
      width:50,
      render: (_, __, index) => <span>{index + 1}</span>,
      fixed: 'left',
    },
    {
      title: 'Set ID',
      dataIndex: 'setId',
      width: 70,
      fixed: 'left',
    },
    ...(templateData?.getTemplateById?.properties.map((property) => ({
      title: property.propertyName,
      dataIndex: property.id,
      width: 120,
      render: (text) => text || '-',
    })) || []),
    {
      title: 'Created By',
      dataIndex: 'createdById',
      width: 120,
      render: (createdById) => <FullNameById userId={createdById} />,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      width: 120,
      sorter: (a, b) => {
        const dateA = moment(a.createdAt);
        const dateB = moment(b.createdAt);
        return dateA.isBefore(dateB) ? -1 : 1;
      },
      render: (text) => moment(text).isValid()
        ? moment(text).tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss') // Convert to IST
        : 'Invalid Date',
    },
    {
      title: 'Edit',
      dataIndex: 'edit',
      width: 120,
      render: () => <Button type="link" icon={<ExportOutlined />} />,
    },
  ];

  const EntriesColumns = [
    {
      title: '#',
      dataIndex: 'key',
      width: 50,
      render: (_, __, index) => <span>{index + 1}</span>,
      fixed: 'left',

    },
    {
      title: 'Set ID',
      dataIndex: 'setId',
      width: 70,
      fixed: 'left',

    },
    ...(templateData?.getTemplateById?.properties.map((property) => ({
      title: property.propertyName,
      dataIndex: property.id,
      width: 120,

      render: (text) => text || '-',
    })) || []),
    ...(templateData?.getTemplateById?.fields.map((field) => ({
      title: field.fieldName,
      fieldType:field.fieldType,
      dataIndex: field.id,
      width: 120,
      render: (text) => {
        if (field.fieldType === 'ATTACHMENT') {
          return text ? (
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              {text.split(',').map((fileName, index) => {
                const fileUrl = `https://storage.googleapis.com/digiqc_register/${fileName}`;
                const isPdf = fileName.toLowerCase().endsWith('.pdf');
                return (
                  <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    style={{ position: 'relative', display: 'inline-block', margin: '8px' }}
                  >
                    {isPdf ? (
              <FilePdfOutlined style={{ fontSize: 48, color:'#ff4d4f' }} />
            ) : (
              <FileImageOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            )}
                    <div>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none', color: 'inherit', pointerEvents: 'auto' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Open File
                    </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            '-'
          );
        }
        return text || '-';
      },
    })) || []),

    {
      title: 'Created At',
      dataIndex: 'createdAt',
      width: 120,
      sorter: (a, b) => {
        const dateA = moment(Number(a));
        const dateB = moment(Number(b));
        return dateA.isBefore(dateB) ? -1 : 1;
      },
      render: (text) => moment(Number(text)).tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss'),
    },
    {
      title: 'Edit',
      dataIndex: 'edit',
      width: 120,
      render: () => <Button type="link" icon={<ExportOutlined />} />,
    },
  ];

  const templateName = templateData?.getTemplateById?.name;
  const projectId  = templateData?.getTemplateById?.projectId;

   const exportCSV = (column, data, fileName) => {
    try {
      // Create headers excluding 'Edit' and without adding '#'
      if(data.length === 0) {
        message.error('No data to export');
        return;
      }
      const headers = column
        .filter(col => col.title !== 'Edit' && col.title !== '#') // Exclude '#'
        .map(col => col.title);

      // Map data to rows
      const mappedData = data.map((row, rowIndex) => {
        const rowData = column
          .filter(col => col.title !== 'Edit' && col.title !== '#') // Exclude '#'
          .map(col => {
            if (col.title === 'Created At') {
              const time = moment(row.createdAt, 'x').isValid()
                ? moment(row.createdAt, 'x').format('DD-MM-YYYY')
                : 'Invalid Date';
              return time;
            }
            if(col.fieldType === 'ATTACHMENT' && row[col.dataIndex]) {
              const constantValue = 'https://storage.googleapis.com/digiqc_register/';
              let value = row[col.dataIndex];

        value = value
          .split(',')
          .map((item) => `${constantValue}${item.trim()}`)
          .join(', ');

          value = `"${value}"`;
          return value;
            }
            return row[col.dataIndex] || '';
          });

        // Return row data with '#', Template Name, Project ID, and other row data
        return [
          rowIndex + 1,   // Adds the row index as the '#'
          templateName,   // Adds the Template Name
          projectId,      // Adds the Project ID
          ...rowData,      // Add other row data
        ];
      });

      // Create the CSV string
      const csvString = [
        ['#', 'Template Name', 'Project ID', ...headers],  // Headers include '#', Template Name, Project ID, and other columns
        ...mappedData,  // Data rows
      ]
        .map(row => row.join(","))
        .join("\n");

      // Create and download the CSV
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileName}.csv`);
      link.click();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error exporting CSV:', error);
    }
  };



const navigate=useNavigate();

const getFullNameById = async (userId, client) => {
  try {
    const { data } = await client.query({
      query: GET_USER_BY_ID,
      variables: { userId },
    });

    if (data && data.getUserById) {
      return `${data.getUserById.firstName} ${data.getUserById.lastName}`;
    }
      return 'Unknown User'; // Fallback in case of missing data

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching full name:', error);
    return 'Error fetching name';
  }
};
const client = useApolloClient();

const exportPDF = async (column, data, fileName) => {
  try {
    const tableData = data;
    if(data.length === 0) {
      message.error('No data to export');
      return;
    }
    const headerLogo = 'https://i.imgur.com/ag6OZGW.png';
    const footerLogo = 'https://i.imgur.com/ag6OZGW.png';
    const footerText = 'Digitize.Monitor.Improve'; // Center footer text

    const filteredColumns = column.filter(col => col.title !== 'Edit');
    const headers = filteredColumns.map(col => col.title);
    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
    });
    const body = await Promise.all(data.map(async (row, rowIndex) => {
      const rowData = await Promise.all(filteredColumns.map(async (col) => {
        if (col.title === '#') {
          return rowIndex + 1;
        }
        if (col.title === 'Created At') {
          const time = moment(row.createdAt, 'x').isValid()
            ? moment(row.createdAt, 'x').format('DD-MM-YYYY HH:mm:ss')
            : 'Invalid Date';
          return time;
        }
        if (col.title === 'Created By') {
          const fullName = await getFullNameById(row.createdById, client);
          return fullName;
        }

        return row[col.dataIndex] || '-';
      }));
      return rowData;
    }));




    const leftLogoWidth = 30;
    const leftLogoHeight = 10;
    doc.addImage(headerLogo, 'PNG', 10, 5, leftLogoWidth, leftLogoHeight);


    const rightLogoWidth = 30;
    const rightLogoHeight = 10;
    doc.addImage(headerLogo, 'PNG', doc.internal.pageSize.width - 40, 5, rightLogoWidth, rightLogoHeight);

    const headerHeight = 20;
    const spacingAfterHeader = 10;
    const textYPosition = headerHeight + spacingAfterHeader;
    const fontSize = 14;
    const projectIdFontSize = 12;

    doc.setFontSize(fontSize);
    doc.text(`Register Name: ${templateName}`, 10, textYPosition);


    const projectIdWidth = doc.getTextWidth(`Project ID: ${projectId}`);
    doc.setFontSize(projectIdFontSize);
    doc.text(`Project ID: ${projectId}`, doc.internal.pageSize.width - projectIdWidth - 10, textYPosition);

    doc.autoTable({
      head: [headers],
      body,
      startY: textYPosition + 10,
      styles: {
        fontSize: 10,
        cellPadding: 1,
        overflow: 'linebreak',
      },
      margin: { bottom: 50 },
      pageBreak: 'auto',
      // eslint-disable-next-line no-shadow
      didParseCell: (data) => {
        const columnIndex = data.column.index;
        const field = column[columnIndex];

        if (field?.fieldType === 'ATTACHMENT' && data.row.section === 'body') {
          // eslint-disable-next-line no-param-reassign
          data.cell.text = [];
        }
      },
      // eslint-disable-next-line no-shadow
      didDrawCell: (data) => {
        const columnIndex = data.column.index;
        const rowIndex = data.row.index;

        const field = column[columnIndex];

       const fieldValue = data.table.body[rowIndex].raw[columnIndex];

        if (data.row.section === 'head') {
          return data.cell.text; // Exit if it's a header cell
        }
       // Check if the field type is ATTACHMENT and fieldValue exists
        if (field?.fieldType === 'ATTACHMENT' && fieldValue) {
          const fileLinks = fieldValue.split(',').map((imageName) => {
            const fileUrl = `https://storage.googleapis.com/digiqc_register/${imageName.trim()}`;
            return fileUrl;
          });
          // eslint-disable-next-line no-param-reassign
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
      // eslint-disable-next-line no-shadow
      didDrawPage: (data) => {
          const currentPageHeight = doc.internal.pageSize.height;
          const footerY = currentPageHeight - 8;
          const footerLogoWidth = 30;
          const footerLogoHeight = 10;
          doc.addImage(footerLogo, 'PNG', 10, footerY - footerLogoHeight, footerLogoWidth, footerLogoHeight);
          const textWidth = doc.getTextWidth(footerText);
          doc.text(footerText, (doc.internal.pageSize.width - textWidth) / 2, footerY - 5);
          const pageCount = doc.internal.pages.length;
          doc.text(`Page ${data.pageNumber}/${pageCount-1}`, doc.internal.pageSize.width - 10, footerY - 5, { align: 'right' });
      },
    });

    // Save the document
    doc.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error exporting PDF:', error);
  }
};

  const handleExport = (type) => {
    const dataToExport = activeTab === 'set' ? filteredData : entriesFilteredData;
    const column = activeTab === 'set' ? columns : EntriesColumns;

    if (type === 'csv') {
      exportCSV(column,dataToExport, `${activeTab}-data`);
    } else if (type === 'pdf') {
      exportPDF(column, dataToExport,`${activeTab}-data`);
    }
  };

  const exportMenu = (
    <Menu>
      <Menu.Item onClick={() => handleExport('csv')}>Export as CSV</Menu.Item>
      <Menu.Item onClick={() => handleExport('pdf')}>Export as PDF</Menu.Item>
    </Menu>
  );
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const entriesStartIndex = (entriesCurrentPage - 1) * entriesPageSize;
  const entriesEndIndex = entriesStartIndex + entriesPageSize;
  const paginatedData = dateFilteredData.slice(startIndex, endIndex);
  const entriesPaginatedData=entriesFilteredDatabyDate.slice(entriesStartIndex,entriesEndIndex);
  const [tableHeight, setTableHeight] = useState('100vh'); // Default height

useEffect(() => {
  const updateTableHeight = () => {
    const availableHeight = window.innerHeight - 340;
    setTableHeight(availableHeight);
  };


  updateTableHeight();

  // Update height on screen resize
  window.addEventListener('resize', updateTableHeight);

  return () => {
    window.removeEventListener('resize', updateTableHeight);
  };
}, []);

return (
  <div className="tabs-page-container">
    <div className="header-container">
        <Header name={templateName} />
    </div>
    {responseLoading && <CenteredSpin/> }
    {entryResponseLoading && <CenteredSpin/> }
    <div className="tabs-container" style={{ padding: '20px' }}>
      {/* Tabs Section */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="tabs-container"
      >




        <TabPane tab="Sets" key="set">
          <div className="table-section">
            <Space direction="horizontal" className="tab-actions">
              <RangePicker onChange={handleDateChange}  disabledDate={disabledDate}
                  // defaultValue={[moment().startOf('month'), moment()]}
                  />


              <Dropdown overlay={exportMenu}>
                <Button icon={<UploadOutlined/>} onClick={(e) => e.preventDefault()}>
                  Export <DownOutlined />
                </Button>
              </Dropdown>
            </Space>



{!responseLoading && (
  <>
  <div className="table-container" style={{ overflowX: 'auto' }}>
              <Table
                columns={columns}
                dataSource={paginatedData}
                pagination={false}
                onRow={(record) => ({
                  onClick: () =>
                    navigate(ROUTES.FILL_TABLE.replace(':templateId', templateId).replace(':setId', record.setId)),
                })}
                scroll={{ y: tableHeight, x: 'max-content' }} // Enable horizontal scroll
                style={{ tableLayout: 'auto' }}
               tableLayout='auto'
              />
            </div>

            <div className="pagination-container">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredData.length}
                onChange={handlePageChange}
                showSizeChanger
                pageSizeOptions={[10, 16, 25, 50]}
              />
            </div>
            </>
)}
          </div>


        </TabPane>

        <TabPane tab="Entries" key="entries">
          <div className="table-section">
            <Space direction="horizontal" className="tab-actions">
              <RangePicker onChange={handleEntriesDateChange}  disabledDate={disabledDate}/>
              <Dropdown overlay={exportMenu}>
                <Button icon={<UploadOutlined/>} onClick={(e) => e.preventDefault()}>
                  Export <DownOutlined />
                </Button>
              </Dropdown>
            </Space>

{!entryResponseLoading && (
  <>
            <div className="table-container" style={{ overflowX: 'auto' }}>
              <Table
                columns={EntriesColumns}
                dataSource={entriesPaginatedData}
                pagination={false}
                onRow={(record) => ({
                  onClick: () =>

                    navigate( ROUTES.FILL_TABLE.replace(':templateId', templateId).replace(':setId', record.setId)),
                })}
                scroll={{ y: tableHeight, x: 'max-content' }} // Enable horizontal scroll
                style={{ tableLayout: 'auto' }}
                // sticky
                // tableLayout="fixed"
              />
            </div>

            <div className="pagination-container">
              <Pagination

                current={entriesCurrentPage}
                pageSize={entriesPageSize}
                total={entriesFilteredDatabyDate.length}
                onChange={handleEntriesPageChange}

                showSizeChanger
                pageSizeOptions={[10, 16, 25, 50]}
              />
            </div>
            </>
)}
          </div>
        </TabPane>
      </Tabs>
    </div>
  </div>
);
};

export default ViewEntries;
