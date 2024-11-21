/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
import { useQuery } from '@apollo/client';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Menu,
  Pagination,
  Row,
  Spin,
  Tooltip,
  Typography,
} from 'antd';

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { ROUTES } from '../../common/constants';
import {
  GET_PROJECT_ID_FOR_USER,
  LIST_ARCHIVED_TEMPLATES_BY_PROJECT,
  LIST_DRAFT_TEMPLATES_BY_PROJECT,
  LIST_LIVE_TEMPLATES_BY_PROJECT,
} from './graphql/Queries';
import HeaderComponent from './component/Header';
import { GET_CURRENT_USER } from '../auth/graphql/Queries';
import GlobalTemplateModal from '../register/components/GlobalTemplateModal';
import FileUploadModal from '../register/components/FileUploadModal';

const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [templates, setTemplates] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(16);
  const [searchText, setSearchText] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [isGlobalModalVisible, setGlobalModalVisible] = useState(false);
  const [isUploadModalVisible, setUploadModalVisible] = useState(false);

  const handleImportClick = () => {
    setUploadModalVisible(true); // Show the upload modal
  };

  const handleCloseUploadModal = () => {
    setUploadModalVisible(false); // Close the modal after upload or cancel
  };
  // eslint-disable-next-line no-unused-vars
  const {
    // eslint-disable-next-line no-unused-vars
    loading: loadingProject,
    // eslint-disable-next-line no-unused-vars
    error: errorProject,
    data: dataProject,
  } = useQuery(GET_PROJECT_ID_FOR_USER);
  const projectId = dataProject ? dataProject.getProjectIdForUser : null;
  console.log('id:,', projectId);
  const { loading: loadingLive, error: errorLive, data: dataLive } = useQuery(
    LIST_LIVE_TEMPLATES_BY_PROJECT,

    {
      variables: { projectId },
      skip: !projectId,
      fetchPolicy: 'cache-and-network',
    },
  );
  const {
    loading: loadingDraft,
    error: errorDraft,
    data: dataDraft,
  } = useQuery(LIST_DRAFT_TEMPLATES_BY_PROJECT, {
    variables: { projectId },
    skip: !projectId,
    fetchPolicy: 'cache-and-network',
  });
  const {
    loading: loadingArchived,
    error: errorArchived,
    data: dataArchived,
  } = useQuery(LIST_ARCHIVED_TEMPLATES_BY_PROJECT, {
    variables: { projectId },
    skip: !projectId,
    fetchPolicy: 'cache-and-network',
  });

  const { data: currentUserData } = useQuery(GET_CURRENT_USER);
  const handleGlobalClick = () => {
    setGlobalModalVisible(true); // Open the global template modal
  };

  const handleCloseGlobalModal = () => {
    setGlobalModalVisible(false); // Close the global template modal
  };
  useEffect(() => {
    if (currentUserData) {
      setUserRole(currentUserData.getCurrentUser.role); // Set the role from the user data
    }
  }, [currentUserData]);
  useEffect(() => {
    if (dataLive && dataDraft && dataArchived) {
      setTemplates([
        ...dataLive.getLiveTemplatesByProject.map((template) => ({
          ...template,
          status: 'Live',
        })),
        ...dataDraft.getDraftTemplatesByProject.map((template) => ({
          ...template,
          status: 'Draft',
        })),
        ...dataArchived.getArchiveTemplatesByProject.map((template) => ({
          ...template,
          status: 'Archived',
        })),
      ]);
    }
  }, [dataLive, dataDraft, dataArchived]);
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);
  // const filteredTemplates = templates
  //   .filter(
  //     (template) =>
  //       activeFilter === 'all' ||
  //       template.status.toLowerCase() === activeFilter,
  //   )
  //   .filter((template) =>
  //     template.name.toLowerCase().includes(searchText.toLowerCase()),
  //   );
  const filteredTemplates = templates
  .filter((template) =>
     userRole === 'USER'
      ? template.status === 'Live'
      : activeFilter === 'all' || template.status.toLowerCase() === activeFilter,
  )
  .filter((template) =>
    template.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Filter dropdown menu

  const handleTabChange = (key) => {
    // eslint-disable-next-line no-console
    console.log(key, '1');
    if (key === 'template') {
      console.log('hiii ankit');
      navigate(ROUTES.MAIN);
    } else if (key === 'log') {
      // eslint-disable-next-line no-console
      console.log('2 i am called');
      navigate(ROUTES.LOGS);
    }
  };
  const createMenu = (
    <Menu>
      <Menu.Item key="scratch" onClick={() => setModalVisible(true)}>
        {' '}
        {/* Show modal on click */}
        Scratch
      </Menu.Item>
      <Menu.Item key="global" onClick={handleGlobalClick}>
        Global
      </Menu.Item>
      <Menu.Item key="import" onClick={handleImportClick}>
        Import
      </Menu.Item>
    </Menu>
  );

  const handleOk = () => {
    if (registerName) {
      navigate(`${ROUTES.NEW_REGISTER.replace(':registerName', registerName)}`);
      setModalVisible(false);
      setRegisterName('');
    } else {
      // eslint-disable-next-line no-undef
      setErrorMessage('Please enter a register name!');
    }
  };

  const handleCardClick = (templateId) => {
    navigate(`/register/template-view/${templateId}`);
  };

  const handleFillEntryButtonClick = (templateId) => {
    navigate(`/register/fill-template/${templateId}`);
  };
  const handleViewEntryButtonClick = (templateId) => {
    navigate(`/register/view-entries/${templateId}`);
  };
  const handleFilterChange = (newFilter) => {
    setActiveFilter(newFilter); // Update activeFilter state
    setCurrentPage(1); // Reset page to the first one on filter change
  };


  return (
    <div style={{ padding: '20px' }}>
      <HeaderComponent
        projectId={projectId}
        createMenu={createMenu}
        activeFilter={activeFilter}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        registerName={registerName}
        setRegisterName={setRegisterName}
        handleOk={handleOk}
        handleTabChange={handleTabChange}
        setSearchText={setSearchText}
        searchText={searchText}
        handleFilterChange={handleFilterChange}
        userRole={userRole}
      />
      <div
        style={{
          flex: 1,
          overflowY: 'auto', // This makes the templates area scrollable
          paddingTop: '140px', // Space for the fixed header
          paddingBottom: '60px',
          marginTop: '40px',
        }}
      >
        {(loadingLive || loadingDraft || loadingArchived) && (
          <Spin size="large" />
        )}
        {(errorLive || errorDraft || errorArchived) && (
          <Alert
            message="Error"
            description={(errorLive || errorDraft || errorArchived).message}
            type="error"
            showIcon
          />
        )}

        <Row gutter={[16, 16]}>
          {paginatedTemplates.length > 0 ? (
            paginatedTemplates.map((template) => (
              <Col key={template.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    textAlign: 'left',
                  }}
                >
                  <Badge.Ribbon
                    text={template.status}
                    color={
                      template.status === 'Live'
                        ? 'green'
                        : template.status === 'Draft'
                        ? 'blue'
                        : 'gray'
                    }
                  >
                    <Tooltip title={template.name}>
                      <Title
                        ellipsis
                        level={5}
                        style={{
                          marginBottom: '8px',
                          maxWidth: 'calc(100% - 50px)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {template.name}
                      </Title>
                    </Tooltip>
                  </Badge.Ribbon>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '4px',
                        height: '50px',
                        borderRadius: '25px',
                        background: '#D9D9D9',
                        marginRight: '16px',
                      }}
                    />
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <Text strong>Sets:</Text>
                        <Text style={{ marginLeft: '8px' }}>
                          {template.numberOfSets}
                        </Text>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: '4px',
                        }}
                      >
                        <Text strong>Entries:</Text>
                        <Text style={{ marginLeft: '8px' }}>
                          {template.numberOfEntries}
                        </Text>
                      </div>
                    </div>
                  </div>

                  {/* Add buttons here with event propagation handling */}
                  <div
                    style={{
                      marginTop: '16px',
                      display: 'flex',
                      justifyContent: template.status === 'Draft' ? 'center' : 'space-between',
                    }}
                  >
                    {userRole !== 'USER' && (
                      <Button
                        onClick={() => {
                          handleCardClick(template.id);
                        }}
                        type="primary"
                        size="small"
                      >
                        Edit
                      </Button>
                    )}
                    {template.status !== 'Draft' && (
                      <Button
                        onClick={() => {
                          handleViewEntryButtonClick(template.id);
                        }}
                        type="default"
                        size="small"
                      >
                        View Entries
                      </Button>
                    )}
                    {template.status === 'Live' && (
                      <Button
                        onClick={() => {
                          handleFillEntryButtonClick(template.id);
                        }}
                        type="dashed"
                        size="small"
                      >
                        Fill Entries
                      </Button>
                    )}
                  </div>
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <Alert
                message={`No ${activeFilter} templates found.`}
                type="info"
              />
            </Col>
          )}
        </Row>
      </div>
      <div
        style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
      >
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredTemplates.length}
          showSizeChanger
          pageSizeOptions={['10', '16', '25', '50']}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
          style={{
            position: 'fixed',
            bottom: '0',
            left: '0',
            right: '0',
            padding: '10px',
            background: '#fff',
            zIndex: 999,
            borderTop: '1px solid #f0f0f0',
            justifyContent: 'center',
            display: 'flex',
          }}
        />
      </div>
      <GlobalTemplateModal
        visible={isGlobalModalVisible}
        onClose={handleCloseGlobalModal}
      />

      <FileUploadModal
        visible={isUploadModalVisible}
        onClose={handleCloseUploadModal}
      />
    </div>
  );
};

export default Dashboard;
