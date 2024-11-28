import React, { useState,useEffect } from 'react';
import { Button, Dropdown, Input, Modal, Tabs, Menu, Row, Col } from 'antd';
import { FilterOutlined, PlusOutlined, DownOutlined, SearchOutlined ,CloseOutlined} from '@ant-design/icons';

const { TabPane } = Tabs;

const HeaderComponent = ({
  projectId,
  createMenu,
  activeFilter,
  modalVisible,
  setModalVisible,
  registerName,
  setRegisterName,
  handleOk,
  handleTabChange,
  setSearchText,
  handleFilterChange,
  userRole,
  // setSelectedFilter,
  // selectedFilter,
  searchText,
}) => {
  const [currentTab, setCurrentTab] = useState('template');
  const [selectedFilter, setSelectedFilter] = useState(activeFilter);
  const onFilterSelect = (filter) => {
    setSelectedFilter(filter);
    handleFilterChange(filter);
  };
// eslint-disable-next-line no-console
    console.log(selectedFilter)
  const filterMenu = (
    <Menu onClick={(e) => onFilterSelect(e.key)}>
      <Menu.Item key="all">All</Menu.Item>
      <Menu.Item key="live">Live</Menu.Item>
      <Menu.Item key="draft">Draft</Menu.Item>
      <Menu.Item key="archived">Archived</Menu.Item>
    </Menu>
  );


  const handleCurrentTab = (key) => {


      if (key !== currentTab) {
        setCurrentTab(key);
      }

  };
  const clearSearch = () => {
    setSearchText('');
  };
  useEffect(() => {

    handleTabChange(currentTab);
  }, [currentTab]);
  return (
    <div>
      <div style={{
          position: 'fixed', top: '0', left: '0', right: '0', backgroundColor: '#fff',
          zIndex: 10, padding: '20px 10px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap',
        }}
      >
        <Button>Project ID: {projectId}</Button>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        {userRole !== 'USER' && (
          <Dropdown overlay={createMenu} trigger={['click']}>
            <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' }}>
              Create New <DownOutlined />
            </Button>
          </Dropdown>
        )}
        </div>
      </div>

      <Modal
        title="Register Name"
        visible={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
      >
        <Input
          type="text"
          value={registerName}
          onChange={(e) => setRegisterName(e.target.value)}
          placeholder="Register Name"
        />
      </Modal>

      <div style={{
          position: 'fixed', top: '72px', left: '0', right: '0', backgroundColor: '#fff', zIndex: 999,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', flexWrap: 'wrap',
        }}
      >
        <Row style={{ width: '100%' }} gutter={[16, 16]}>
          <Col xs={24} sm={16} md={12}>
          <Tabs activeKey={currentTab} onChange={handleCurrentTab}>
  <TabPane tab="Register" key="template" />
  <TabPane tab="Log" key="log" />
</Tabs>

          </Col>

          <Col xs={24} sm={8} md={12} style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {userRole !== 'USER' && (
            <Dropdown overlay={filterMenu} trigger={['click']}>
              <Button icon={<FilterOutlined />}>
                {selectedFilter ? `Filter: ${activeFilter}` : 'Select Filter'} <DownOutlined />
              </Button>
            </Dropdown>
          )}
           <Input
      placeholder="Search..."
      value={searchText}
      prefix={<SearchOutlined style={{ color: '#FF6B6B' }} />}
      suffix={
        searchText && (
          <CloseOutlined
            onClick={clearSearch}
            style={{ color: '#FF6B6B', cursor: 'pointer' }}
          />
        )
      }
      onChange={(e) => setSearchText(e.target.value)}
      style={{ width: 200, height: 33, minWidth: '100px' }}
    />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default HeaderComponent;
