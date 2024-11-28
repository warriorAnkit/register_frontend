/* eslint-disable no-console */

/* eslint-disable new-cap */
/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Dropdown, Menu, Space, Tabs, DatePicker,Pagination } from 'antd';
import { SearchOutlined, ExportOutlined, DownOutlined } from '@ant-design/icons';
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

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const ViewEntries = () => {
  const [activeTab, setActiveTab] = useState('set');
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [entriesFilteredData, setEntriesFilterData] = useState([]);
  const [dateRange, setDateRange] = useState(null)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // eslint-disable-next-line no-shadow
  const handlePageChange = (page,pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };;
  const { templateId } = useParams();

  const { data: templateData } = useQuery(GET_TEMPLATE_BY_ID, {
    variables: { id: templateId },
    fetchPolicy: 'cache-and-network',
  });

  const { data: responseData } = useQuery(GET_ALL_PROPERTY_RESPONSES_FOR_TEMPLATE, {
    variables: { templateId },
    fetchPolicy: 'cache-and-network',
  });

  const { data: entryResponseData } = useQuery(GET_ALL_RESPONSES_FOR_TEMPLATE, {
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
    }
  }, [entryResponseData, templateData]);

  const handleDateChange = (dates) => {
    setDateRange(dates);
    if (dates) {
      const [startDate, endDate] = dates;
      const filteredSets = responseData.getAllPropertyResponsesForTemplate.propertyResponses.filter((row) => {
        const createdAt = moment(row.createdAt);
        return createdAt.isBetween(startDate, endDate, 'day', '[]');
      });
      setFilteredData(filteredSets);
      const filteredEntries = entryResponseData.getAllResponsesForTemplate.responses.filter((set) => {
        const createdAt = moment(set.propertyResponses[0]?.createdAt);
        return createdAt.isBetween(startDate, endDate, 'day', '[]');
      });
      setEntriesFilterData(filteredEntries);
    } else {
      setFilteredData(responseData.getAllPropertyResponsesForTemplate.propertyResponses);
      setEntriesFilterData(entryResponseData.getAllResponsesForTemplate.responses);
    }
  };


  const columns = [
    {
      title: '#',
      dataIndex: 'key',
      width: '5%',
      render: (_, __, index) => <span>{index + 1}</span>,
      fixed: 'left',
    },
    {
      title: 'Set ID',
      dataIndex: 'setId',
      width: '11%',
      fixed: 'left',
    },
    ...(templateData?.getTemplateById?.properties.map((property) => ({
      title: property.propertyName,
      dataIndex: property.id,
      width: '15%',
      render: (text) => text || '-',
    })) || []),
    {
      title: 'Created By',
      dataIndex: 'createdById',
      width: '15%',
       render: (createdById) => <FullNameById userId={createdById} />,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      width: '20%',
      render: (text) => moment(text).isValid()
          ? moment(text).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss') // Convert to IST
          : 'Invalid Date',
    },

    {
      title: 'Edit',
      dataIndex: 'edit',
      render: () => <Button type="link" icon={<ExportOutlined />} />,
    },
  ];

  const EntriesColumns = [
    {
      title: '#',
      dataIndex: 'key',
      width: '5%',
      render: (_, __, index) => <span>{index + 1}</span>,
      fixed: 'left',
    },
    {
      title: 'Set ID',
      dataIndex: 'setId',
      width: '11%',
      fixed: 'left',
    },
    ...(templateData?.getTemplateById?.properties.map((property) => ({
      title: property.propertyName,
      dataIndex: property.id,
      width: '15%',
      render: (text) => text || '-',

    })) || []),
    ...(templateData?.getTemplateById?.fields.map((field) => ({
      title: field.fieldName,
      dataIndex: field.id,
      width: '15%',
      render: (text) => text || '-',

    })) || []),
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      width: '20%',
      render: (text) => moment(Number(text)).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
    },

    {
      title: 'Edit',
      dataIndex: 'edit',
      render: () => <Button type="link" icon={<ExportOutlined />} />,
    },
  ];

  const templateName = templateData?.getTemplateById?.name;
  const projectId  = templateData?.getTemplateById?.projectId;

   const exportCSV = (column, data, fileName) => {
    try {
      // Create headers excluding 'Edit' and without adding '#'
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
                ? moment(row.createdAt, 'x').format('YYYY-MM-DD')
                : 'Invalid Date';
              return time;
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
    const headerLogo = 'https://i.imgur.com/ag6OZGW.png';
    const footerLogo = 'https://i.imgur.com/ag6OZGW.png';
    const footerText = 'Digitize.Monitor.Improve'; // Center footer text

    const filteredColumns = column.filter(col => col.title !== 'Edit');
    const headers = filteredColumns.map(col => col.title);

    const body = await Promise.all(data.map(async (row, rowIndex) => {
      const rowData = await Promise.all(filteredColumns.map(async (col) => {
        if (col.title === '#') {
          return rowIndex + 1;
        }
        if (col.title === 'Created At') {
          const time = moment(row.createdAt, 'x').isValid()
            ? moment(row.createdAt, 'x').format('YYYY-MM-DD HH:mm:ss')
            : 'Invalid Date';
          return time;
        }
        if (col.title === 'Created By') {
          const fullName = await getFullNameById(row.createdById, client);
          return fullName;
        }
        return row[col.dataIndex] || '';
      }));
      return rowData;
    }));

    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
    });


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
  const paginatedData = filteredData.slice(startIndex, endIndex);
  const entriesPaginatedData=entriesFilteredData.slice(startIndex,endIndex);
  const [tableHeight, setTableHeight] = useState('100vh'); // Default height

useEffect(() => {
  const updateTableHeight = () => {
    const availableHeight = window.innerHeight - 360;
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
              <RangePicker onChange={handleDateChange} />
              <Dropdown overlay={exportMenu}>
                <Button icon={<ExportOutlined />} onClick={(e) => e.preventDefault()}>
                  Export <DownOutlined />
                </Button>
              </Dropdown>
            </Space>

            {/* <div className="table-container" style={{ overflowX: 'auto' }}>
              <Table
                columns={columns.map((col) => ({
                  ...col,
                  onHeaderCell: (column) => ({
                    style: {
                      minWidth: column.minWidth || '150px', // Set the default min-width or use a dynamic value
                    },
                  }),
                }))}
                dataSource={paginatedData}
                pagination={false}
                onRow={(record) => ({
                  onClick: () =>
                    navigate(`/register/edit-entries/${templateId}/${record.setId}`),
                })}
                scroll={{ y: tableHeight, x: 'max-content' }} // Enable horizontal scroll
                style={{ tableLayout: 'fixed' }} // Ensure fixed table layout
              />
            </div> */}
  <div className="table-container" style={{ overflowX: 'auto' }}>
              <Table
                columns={columns.map((col) => ({
                  ...col,
                  onHeaderCell: (column) => ({
                    style: {
                      minWidth: column.minWidth || '150px', // Set the default min-width or use a dynamic value
                    },
                  }),
                }))}
                dataSource={paginatedData}
                pagination={false}
                onRow={(record) => ({
                  onClick: () =>
                    navigate(`/register/edit-entries/${templateId}/${record.setId}`),
                })}
                scroll={{ y: tableHeight, x: 'max-content' }} // Enable horizontal scroll
                style={{ tableLayout: 'fixed' }} // Ensure fixed table layout
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
          </div>
        </TabPane>

        <TabPane tab="Entries" key="entries">
          <div className="table-section">
            <Space direction="horizontal" className="tab-actions">
              <RangePicker onChange={handleDateChange} />
              <Dropdown overlay={exportMenu}>
                <Button icon={<ExportOutlined />} onClick={(e) => e.preventDefault()}>
                  Export <DownOutlined />
                </Button>
              </Dropdown>
            </Space>

            <div className="table-container" style={{ overflowX: 'auto' }}>
              <Table
                columns={EntriesColumns.map((col) => ({
                  ...col,
                  onHeaderCell: (column) => ({
                    style: {
                      minWidth: column.minWidth || '150px', // Set the default min-width or use a dynamic value
                    },
                  }),
                }))}
                dataSource={entriesPaginatedData}
                pagination={false}
                onRow={(record) => ({
                  onClick: () =>
                    navigate(`/register/edit-entries/${templateId}/${record.setId}`),
                })}
                scroll={{ y: tableHeight, x: 'max-content' }} // Enable horizontal scroll
                style={{ tableLayout: 'fixed' }} // Ensure fixed table layout
              />
            </div>

            <div className="pagination-container">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={entriesFilteredData.length}
                onChange={handlePageChange}
                showSizeChanger
                pageSizeOptions={[10, 16, 25, 50]}
              />
            </div>
          </div>
        </TabPane>
      </Tabs>
    </div>
  </div>
);

};

export default ViewEntries;
