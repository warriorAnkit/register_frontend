
import React, { useState, useEffect } from 'react';
import { useQuery, useLazyQuery  } from '@apollo/client';
import { Table, Pagination, Alert, Typography } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { GET_ALL_SETS_FOR_ALL_TEMPLATES } from './graphql/Queries'; // Updated query import
import { ROUTES } from '../../common/constants';
import LogHeaderComponent from '../Dashboard/component/logHeader';
import { GET_PROJECT_ID_FOR_USER } from '../Dashboard/graphql/Queries';
import { GET_USER_BY_ID } from '../auth/graphql/Queries';

const { Title, Text } = Typography;


const LogsPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(16);
  const [userNames, setUserNames] = useState({});
  const [searchText, setSearchText] = useState('');

  const [getUserById] = useLazyQuery(GET_USER_BY_ID);

  const fetchUserNames = async (userIds) => {
    const fetchedNames = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const userId of userIds) {
      if (!userNames[userId]) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const { data } = await getUserById({ variables: { userId } });
          if (data && data.getUserById) {
            fetchedNames[userId] = `${data.getUserById.firstName} ${data.getUserById.lastName}`;
          }
        } catch (err) {
          fetchedNames[userId] = 'Unknown User';
        }
      }
    }
    setUserNames((prev) => ({ ...prev, ...fetchedNames }));
  };

  const { data: allTemplatesData, loading, error } = useQuery(GET_ALL_SETS_FOR_ALL_TEMPLATES, {
    fetchPolicy: 'cache-and-network',
  });
  const { data: projectData } = useQuery(GET_PROJECT_ID_FOR_USER);
     const projectId = projectData ? projectData.getProjectIdForUser : null;

  useEffect(() => {
    if (allTemplatesData && allTemplatesData.getAllSetsForAllTemplates) {
      const sets = allTemplatesData.getAllSetsForAllTemplates.map((template) => ({
        templateName: template.templateName,
        setId: template.setId,
        createdAt: template.createdAt,
        userId: template.userId,
      }));
      setLogs(sets);
      const userIds = sets.map((log) => log.userId);
      fetchUserNames(userIds);
    }
  }, [allTemplatesData]);
  const handleTabChange = (key) => {
        if (key === 'template') {
          navigate(ROUTES.MAIN); // Switch to Template page
        } else if (key === 'log') {
          navigate(ROUTES.LOGS); // Stay on Log page
        }
      };
  const filteredLogs = logs.filter((log) =>
    log.templateName.toLowerCase().includes(searchText.toLowerCase()),
  );

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const columns = [
    {
      title: '#',
      dataIndex: 'key',
      render: (_, __, index) => <span>{index + 1}</span>,
      width: '5%',
    },
    {
      title: 'Template Name',
      dataIndex: 'templateName',
      width: '25%',
    },
    {
      title: 'Set ID',
      dataIndex: 'setId',
      width: '20%',
    },
    {
      title: 'User',
      dataIndex: 'userId',
      render: (userId) => userNames[userId] || 'Loading...',
      width: '25%',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      render: (text) =>
        moment(text, 'x').isValid()
          ? moment(text, 'x').format('YYYY-MM-DD HH:mm:ss')
          : 'Invalid Date',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <ExportOutlined
          onClick={() => navigate(`${ROUTES.LOGS}/${record.setId}`)}
          style={{ cursor: 'pointer', fontSize: 16 }}
        />
      ),
      width: '10%',
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <LogHeaderComponent
        projectId={projectId}
        handleTabChange={handleTabChange}
        setSearchText={setSearchText}
        logs={filteredLogs}
        userNames={userNames}
      />
      <Title level={3}>Logs</Title>
      <div style={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
      <Table
        columns={columns}
        dataSource={paginatedLogs}
        rowKey="setId"
        pagination={false}
        bordered
        style={{ marginTop: '100px' }}
        onRow={(record) => ({
          onClick: () => navigate(`/register/edit-entries/${record.templateId}/${record.setId}`),
        })}
      />
      </div>
      {filteredLogs.length === 0 && (
        <Alert message="No logs found" type="warning" style={{ marginTop: '20px' }} />
      )}
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={filteredLogs.length}
        onChange={(page) => setCurrentPage(page)}
        onShowSizeChange={(current, size) => setPageSize(size)}
        showSizeChanger
        showTotal={(total) => `Total ${total} logs`}
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
    </div>
  );
};
export default LogsPage;