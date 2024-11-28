import React, { useState, useEffect } from 'react';
import { Table, Typography,Empty,Pagination } from 'antd';
import { useQuery } from '@apollo/client';
import moment from 'moment';
import { useLocation, useParams } from 'react-router-dom';
import { GET_ACTIVITY_LOGS_BY_SET_ID } from './graphql/Queries';
import Header from './components/Header';

const { Title } = Typography;

// GraphQL query


const ChangeLogOfSetPage = () => {
const {setId}=useParams();
const location = useLocation();
const { templateName, templateId } = location.state || {};
  const { loading, error, data } = useQuery(GET_ACTIVITY_LOGS_BY_SET_ID, {
    variables: { setId },
    fetchPolicy:'cache-and-network',
  });

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (data && data.getActivityLogsBySetId) {
      setLogs(data.getActivityLogsBySetId);
    }
  }, [data]);


 const [currentPage, setCurrentPage] = useState(1);
 const [pageSize, setPageSize] = useState(10);
  // Table columns configuration
  const columns = [
    {
      title: 'Index',
      key: 'index',
      render: (text, record, index) => index + 1,  // Add 1 to the index to start from 1
    },
    {
      title: 'Action Type',
      dataIndex: 'actionType',
      key: 'actionType',
    },
    {
      title: 'Entity Type',
      dataIndex: 'entityType',
      key: 'entityType',
    },
    // {
    //   title: 'Entity ID',
    //   dataIndex: 'entityId',
    //   key: 'entityId',
    // },
    {
      title: 'Previous Value',
      key: 'previousValue',
      render: (record) => record.changes?.previousValue || '-',
    },
    {
      title: 'Updated Value',
      key: 'updatedValue',
      render: (record) => record.changes?.newValue || '-',
    },
    {
      title:'Row Number',
      dataIndex: 'rowNumber',
      key: 'rowNumber',
    },
    {
      title: 'Template Name',
      dataIndex: 'templateName',
      key: 'templateName',
    },
    {
      title: 'Edited By',
      dataIndex: 'editedBy',
      key: 'editedBy',
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) =>
        moment(parseInt(timestamp, 10)).format('DD/MM/YYYY HH:mm:ss'),
    },
  ];

  const paginatedLogs = logs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      <Header name={templateName} templateId={templateId} setId={setId} responseLogs/>
    <div style={{ padding: '20px' }}>
      <Title level={2}>Change Log</Title>
      {error && <p>Error loading logs</p>}
      {logs.length === 0 ? (
       <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '70vh', // Adjust this for vertical centering
        textAlign: 'center',
      }}>
        <Empty description="No Change Logs" />
      </div>
      ) : (
        <>
         <div style={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
        <Table
          columns={columns}
          dataSource={paginatedLogs}
          rowKey={(record) => record.id}
          pagination
          ={false}
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

export default ChangeLogOfSetPage;
