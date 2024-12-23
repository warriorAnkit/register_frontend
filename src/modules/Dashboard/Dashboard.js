/* eslint-disable no-undef */
/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
import { useMutation, useQuery } from '@apollo/client';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Menu,
  Modal,
  notification,
  Pagination,
  Row,
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

import { GET_CURRENT_USER } from '../auth/graphql/Queries';
import FileUploadModal from '../register/components/FileUploadModal';
import GlobalTemplateModal from '../register/components/GlobalTemplateModal';
import { DELETE_TEMPLATE } from '../register/graphql/Mutation';
import CenteredSpin from './component/CentredSpin';
import HeaderComponent from './component/Header';

const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const isBrowser = typeof window !== 'undefined';
  const [activeFilter, setActiveFilter] = useState(
    isBrowser ? sessionStorage.getItem('selectedFilter') || 'all' : 'all',
  );
  const [searchText, setSearchText] = useState(
    isBrowser ? sessionStorage.getItem('searchText') || '' : '',
  );
  const [templates, setTemplates] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [userRole, setUserRole] = useState(null);
  const [isGlobalModalVisible, setGlobalModalVisible] = useState(false);
  const [isUploadModalVisible, setUploadModalVisible] = useState(false);

  const handleImportClick = () => {
    setUploadModalVisible(true); // Show the upload modal
  };
  const [deleteTemplate, { loading, error }] = useMutation(DELETE_TEMPLATE);
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
    setGlobalModalVisible(true);
  };

  const handleCloseGlobalModal = () => {
    setGlobalModalVisible(false);
  };
  useEffect(() => {
    if (currentUserData) {
      setUserRole(currentUserData.getCurrentUser.role);
    }
  }, [currentUserData]);
  useEffect(() => {
    if (dataLive && dataDraft && dataArchived) {
      const allTemplates = [
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
      ];
      allTemplates.forEach((a) => console.log(a));
      // Sort templates by 'createdAt' in descending order
      const sortedTemplates = allTemplates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Update the state with sorted templates
      setTemplates(sortedTemplates);
    }
  }, [dataLive, dataDraft, dataArchived]);
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

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
  useEffect(() => {
    if (isBrowser) {
      sessionStorage.setItem('selectedFilter', activeFilter);
      sessionStorage.setItem('searchText', searchText);
      console.log(searchText,"ghd");
    }
  }, [activeFilter, searchText]);

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
  const handleDeleteButtonClick = async (templateId) => {
    // Show confirmation dialog
    const isConfirmed = await new Promise((resolve) => {
      Modal.confirm({
        title: 'Are you sure you want to delete this template?',
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });

    if (isConfirmed) {
      try {

        await deleteTemplate({
          variables: { id: templateId },
        });
        setTemplates((prevTemplates) =>
          prevTemplates.filter((template) => template.id !== templateId),
        );

        notification.success({
          message: 'Template Deleted',
          description: 'The template has been deleted successfully.',
          placement: 'topRight',
        });

        console.log('Template deleted successfully');
      } catch (err) {
        console.error('Error deleting template:', err.message);
      }
    }
  };
  const handleFilterChange = (newFilter) => {
    setActiveFilter(newFilter); // Update activeFilter state
    setCurrentPage(1); // Reset page to the first one on filter change
  };
if((loadingLive || loadingDraft || loadingArchived)){
  return <CenteredSpin />;
}

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
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
          overflowY: 'auto',
          paddingTop: '140px',
          paddingBottom: '60px',
          marginTop: '40px',
          filter: (loadingLive || loadingDraft || loadingArchived) ? 'blur(4px)' : 'none',
        }}
      >
        {/* {(loadingLive || loadingDraft || loadingArchived) ? <CenteredSpin /> : null} */}
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
                  bodyStyle={{ padding: '24px' }}
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
                          marginTop: '0px',
                          marginBottom: '8px',
                          maxWidth: 'calc(100% - 61px)',
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
                        height: '30px',
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

                  <div
                    style={{
                      marginTop: '10px',
                      display: 'flex',
                      justifyContent: template.status === 'Draft' ? 'space-between' : 'space-between',
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
                    {template.status === 'Draft' && (
                      <Button
                        onClick={() => {
                          handleDeleteButtonClick(template.id);
                        }}
                        type="default"
                        size="small"
                      >
                        Delete Template
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
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                {(loadingLive || loadingDraft || loadingArchived) && (
                  <Empty description="No templates found." />
                )}
              </div>
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
          pageSizeOptions={['10', '15', '25', '50']}
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
