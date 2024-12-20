import React, { useState, useEffect } from 'react';
import { Table, Typography, Empty, Pagination } from 'antd';
import { useQuery } from '@apollo/client';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { GET_TEMPLATE_ACTIVITY_LOGS_BY_TEMPLATE_ID } from './graphql/Queries';
import '../Dashboard/dashboard.less';
import Header from './components/Header';

const { Title } = Typography;

const ChangeLogOfTemplatePage = () => {
  const { templateId } = useParams();
  const { loading, error, data } = useQuery(GET_TEMPLATE_ACTIVITY_LOGS_BY_TEMPLATE_ID, {
    variables: { templateId },
    fetchPolicy: 'cache-and-network',
  });

  const [logs, setLogs] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);


  useEffect(() => {
    if (data?.getTemplateActivityLogsBytemplateId) {
      const filteredLogs = data.getTemplateActivityLogsBytemplateId.filter(
        (log) => log.actionType !== 'CREATE_TEMPLATE',
      );
      setLogs(filteredLogs);
      if (filteredLogs.length > 0) {
        setTemplateName(filteredLogs[0].templateName || 'Unknown Template');
      }
    }
  }, [data]);
  const renderValue = (record, type) => {
    const value = record.changes?.[`${type}Value`] || 'N/A';
    if (record.actionType === 'UPDATE_TEMPLATE') {
      return (
        <>
          <div><strong>{type === 'previous' ? 'Old' : 'New'}  Name: </strong>{value.fieldName ||value.propertyName ||'N/A'}</div>
          <div><strong>{type === 'previous' ? 'Old' : 'New'}  Type: </strong>{value.fieldType ||value.propertyFieldType||'N/A'}</div>
        </>
      );
    }
    return JSON.stringify(value);
  };
  // Define table columns
  const columns = [
    {
      title: 'Index',
      key: 'index',
      render: (text, record, index) => index + 1,
      width: '10%',
    },
    {
      title: 'Action Type',
      dataIndex: 'actionType',
      key: 'actionType',
      width: '15%', // Min width as percentage
    },
    {
      title: 'Entity Type',
      dataIndex: 'entityType',
      key: 'entityType',
      width: '13%', // Min width as percentage
    },
    {
      title: 'Entity ID',
      dataIndex: 'entityId',
      key: 'entityId',
      width: '10%', // Min width as percentage
    },
    {
      title: 'Previous Value',
      key: 'previousValue',
      render: (record) => renderValue(record, 'previous'),
      width: '25%', // Min width as percentage
    },
    {
      title: 'Updated Value',
      key: 'updatedValue',
      render: (record) => renderValue(record, 'new'),
      width: '20%', // Min width as percentage
    },
    {
      title: 'Template Name',
      dataIndex: 'templateName',
      key: 'templateName',
      width: '15%', // Min width as percentage
    },
    {
      title: 'Edited By',
      dataIndex: 'editedBy',
      key: 'editedBy',
      width: '15%', // Min width as percentage
    },
    {
      title: 'Updated At',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a, b) => {
        const dateA = moment(a.timestamp);
        const dateB = moment(b.timestamp);
        return dateA.isBefore(dateB) ? -1 : 1;
      },
      render: (timestamp) => moment(parseInt(timestamp, 10)).format('DD/MM/YYYY HH:mm:ss'),
      width: '10%', // Min width as percentage
    },
  ];

  const tableStyle = {
    tableLayout: 'auto', // This enables auto width adjustment based on content
    // width: '100%',
  };

  const paginatedLogs = logs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      <Header name={templateName} templateId={templateId} templateLogs/>
    <div style={{ padding: '10px' }}>
      <Title level={2}style={{ margin: '5px 0' }}>Change Log</Title>
      {error && <p>Error loading logs</p>}
      {logs.length === 0 ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70vh',
            textAlign: 'center',
          }}
        >
          <Empty description="No Change Logs" />
        </div>
      ) : (
        <>
            <div style={{ maxHeight: 'calc(100vh - 175px)', overflowY: 'auto' }}>
            <Table
              columns={columns}
              dataSource={paginatedLogs}
              rowKey={(record) => record.id}
              pagination={false}
               sticky
               style={tableStyle}

            />
          </div>

          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={logs.length}
            showSizeChanger
            pageSizeOptions={['10', '16', '25', '50']}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            style={{
              position: 'fixed',
              bottom: 0,
              width: '100%',
              backgroundColor: '#fff',
              padding: '10px 0',
              boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.15)',
              zIndex: 10,
              justifyContent: 'center',
              display: 'flex',
            }}
          />
        </>
      )}
    </div>
    </div>
  );
};

export default ChangeLogOfTemplatePage;
