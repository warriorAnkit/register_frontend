/* eslint-disable no-undef */

import React, { useState, useEffect } from 'react';
import { useQuery, useLazyQuery  } from '@apollo/client';
import { Table, Pagination, Alert, Typography } from 'antd';
import { ExportOutlined,UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { GET_ALL_SETS_FOR_ALL_TEMPLATES } from './graphql/Queries'; // Updated query import
import { ROUTES } from '../../common/constants';
import LogHeaderComponent from '../Dashboard/component/logHeader';
import { GET_PROJECT_ID_FOR_USER } from '../Dashboard/graphql/Queries';
import { GET_USER_BY_ID } from '../auth/graphql/Queries';
import CenteredSpin from '../Dashboard/component/CentredSpin';

const { Title, Text } = Typography;


const LogsPage = () => {
  const navigate = useNavigate();
  const isBrowser = typeof window !== 'undefined';
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [userNames, setUserNames] = useState({});
  const [searchText, setSearchText] = useState(
    isBrowser ? sessionStorage.getItem('searchLogText') || '' : '',
  );
 const [count,setcount]=useState(0);
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
  const { data: projectData } = useQuery(GET_PROJECT_ID_FOR_USER);
  const projectId = projectData ? projectData.getProjectIdForUser : null;

  const { data: allTemplatesData, loading, error ,refetch} = useQuery(GET_ALL_SETS_FOR_ALL_TEMPLATES, {
    variables: { projectId,
      page:currentPage,
      pageSize,
      search:searchText,
    },
    fetchPolicy: 'cache-and-network',
    skip: !projectId,
  });


  useEffect(() => {
    if (allTemplatesData && allTemplatesData.getAllSetsForAllTemplates) {
      // eslint-disable-next-line no-console

      const sets = allTemplatesData.getAllSetsForAllTemplates.sets.map((template) => ({
        templateName: template.templateName,
        setId: template.setId,
        createdAt: template.createdAt,
        userId: template.userId,
        updatedAt:template.updatedAt,
        templateId:template.templateId,
        updatedBy:template.updatedBy,
      }));
      setLogs(sets);
      const userIds = sets.map((log) => log.userId);
      fetchUserNames(userIds);
      const {totalCount} = allTemplatesData.getAllSetsForAllTemplates;
      // eslint-disable-next-line no-console
      // console.log(totalCount.totalCount);
     setcount(totalCount);
    }
  }, [allTemplatesData]);

  useEffect(() => {
    if(projectId){
    refetch({
      page: currentPage,
      pageSize,
      search: searchText,
    });
  }
  }, [searchText,  pageSize, currentPage, refetch]);

  useEffect(() => {
    if (isBrowser) {
      sessionStorage.setItem('searchLogText', searchText);
      // console.log(searchText,"ghd");
    }
    setCurrentPage(1);
  }, [ searchText]);
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


  // if (loading) {
  //   return <CenteredSpin/>;
  // }

  if (error) {
    return <div>
       <LogHeaderComponent
        projectId={projectId}
        handleTabChange={handleTabChange}
        searchText={searchText}
        setSearchText={setSearchText}
        logs={filteredLogs}
        userNames={userNames}
      />
     {error.message}</div>;
  }

  const columns = [
    {
      title: '#',
      dataIndex: 'key',
      render: (_, __, index) => <span>{index + 1}</span>,
      width: '5%',
      fixed: 'left',
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
      title: 'Created By',
      dataIndex: 'userId',
      render: (userId) => userNames[userId] || 'Loading...',
      width: '15%',
    },
    {
      title: 'updated By',
      dataIndex: 'updatedBy',
      render: (userId) => userNames[userId] || 'Loading...',
      width: '15%',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      width: '10%',
      sorter: (a, b) => {
        const dateA = moment(a.createdAt);
        const dateB = moment(b.createdAt);
        return dateA.isBefore(dateB) ? -1 : 1; // Ascending order by default
      },
      render: (text) =>
        moment(text, 'x').isValid()
          ? moment(text, 'x').format('YYYY-MM-DD HH:mm:ss')
          : 'Invalid Date',
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      width: '10%',
      sorter: (a, b) => {
        const dateA = moment(a.updatedAt);
        const dateB = moment(b.updatedAt);
        return dateA.isBefore(dateB) ? -1 : 1; // Ascending order by default
      },
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
      // width: '10%',
    },
  ];

  return (
    <div style={{ padding: '15px' }}>
      <LogHeaderComponent
        projectId={projectId}
        handleTabChange={handleTabChange}
        setSearchText={setSearchText}
        logs={filteredLogs}
        searchText={searchText}
        userNames={userNames}
      />
      <Title level={3}>Logs</Title>
      {loading && <CenteredSpin/>}

      {!loading&&  (
        <>
      <div style={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto',overflowX:'auto' ,scrollbarWidth: 'thin', // This applies to both but affects X in Firefox
    scrollbarColor: '#888 transparent' }}>
      <Table
        columns={columns}
        dataSource={logs}
        rowKey="setId"
        pagination={false}
        bordered
        style={{ marginTop: '120px' }}
        onRow={(record) => ({
          onClick: () => navigate(ROUTES.FILL_TABLE.replace(':templateId', record.templateId).replace(':setId', record.setId)),
        })}

      />
      </div>
      {/* {filteredLogs.length === 0 && (
        <Alert message="No logs found" type="warning" style={{ marginTop: '20px' }} />
      )} */}
      <Pagination
        current={currentPage}
        pageSize={pageSize}
       total={count}
        onChange={(page) => setCurrentPage(page)}
        onShowSizeChange={(current, size) => setPageSize(size)}
        showSizeChanger
        pageSizeOptions={['10', '15', '25', '50']}
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
  );
};
export default LogsPage;
