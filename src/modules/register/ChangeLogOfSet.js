/* eslint-disable no-undef */
import { useQuery } from '@apollo/client';
import { Empty, Pagination, Table, Typography } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import CenteredSpin from '../Dashboard/component/CentredSpin';
import Header from './components/Header';
import { GET_ACTIVITY_LOGS_BY_SET_ID } from './graphql/Queries';


const { Title } = Typography;


const ChangeLogOfSetPage = () => {
const {setId}=useParams();
const location = useLocation();
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(10);
const { templateName, templateId } = location.state || {};
  const { loading, error, data , refetch } = useQuery(GET_ACTIVITY_LOGS_BY_SET_ID, {
    variables: { setId, page: currentPage,
      pageSize },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {

    refetch({
      page: currentPage,
      pageSize,
    });
  }, [ pageSize, currentPage, refetch]);

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (data && data.getActivityLogsBySetId.logs) {
      setLogs(data.getActivityLogsBySetId.logs);
    }
  }, [data]);
// eslint-disable-next-line no-console
console.log("logs",logs);


 const [tableHeight, setTableHeight] = useState('100vh'); // Default height

useEffect(() => {
  const updateTableHeight = () => {
    const availableHeight = window.innerHeight - 250;
    setTableHeight(availableHeight);
  };


  updateTableHeight();

  // Update height on screen resize
  window.addEventListener('resize', updateTableHeight);

  return () => {
    window.removeEventListener('resize', updateTableHeight);
  };
}, []);
  // Table columns configuration
  const columns = [
    {
      title: 'Index',
      key: 'index',
      render: (text, record, index) => index + 1,  // Add 1 to the index to start from 1
      width: 70,
      fixed: 'left',
    },
    {
      title: 'Action Type',
      dataIndex: 'actionType',
      key: 'actionType',
      width: 150,
    },
    {
      title: 'Entity Type',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 150,
    },
    {
    title:'Entity Name',
    dataIndex:'entityName',
    key:'entityName',
    },
    {
      title: 'Previous Value',
      key: 'previousValue',
      render: (record) => record.changes?.previousValue || '-',
      width: 200,
    },
    {
      title: 'Updated Value',
      key: 'updatedValue',
      render: (record) => record.changes?.newValue || '-',
      width: 200,
    },
    {
      title:'Row Number',
      dataIndex: 'rowNumber',
      key: 'rowNumber',
      width: 150,
    },
    {
      title: 'Template Name',
      dataIndex: 'templateName',
      key: 'templateName',
      width: 150,
    },
    {
      title: 'Edited By',
      dataIndex: 'editedBy',
      key: 'editedBy',
      width: 150,
    },
    {
      title: 'Updated By',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a, b) => {
        const dateA = moment(a.timestamp);
        const dateB = moment(b.timestamp);
        return dateA.isBefore(dateB) ? -1 : 1;
      },
      render: (timestamp) =>
        moment(parseInt(timestamp, 10)).format('DD/MM/YYYY HH:mm:ss'),
      width: 200,
    },
  ];


  return (
    <div>
      <Header name={templateName} templateId={templateId} setId={setId} responseLogs/>
    <div style={{ padding: '20px' ,marginTop: '40px'}}>
      <Title level={2}>Change Log</Title>
      {error && <p>Error loading logs</p>}
      {loading && <CenteredSpin/>}
      {!loading && (
        <>
      {logs.length === 0 ? (
       <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '70vh',
        textAlign: 'center',
      }}>
        <Empty description="No Change Logs" />
      </div>
      ) : (
        <>
         <div style={{ maxHeight: 'calc(100vh - 150px)', overflow: 'auto' }}>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey={(record) => record.id}
          pagination={false}
          scroll={{y:tableHeight,x: 'max-content' }}
        />
        </div>
        <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={data.getActivityLogsBySetId.totalItems}
            showSizeChanger
            pageSizeOptions={['10', '15', '25', '50']}
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
      </>
      )}
    </div>
    </div>
  );
};

export default ChangeLogOfSetPage;
