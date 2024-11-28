
import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Input, Tabs, Menu, Row, Col } from 'antd';
import {  DownOutlined, SearchOutlined, ExportOutlined } from '@ant-design/icons';
import { jsPDF } from 'jspdf';
import { parse } from 'json2csv'; // Used to convert JSON to CSV
import moment from 'moment';

const { TabPane } = Tabs;

const LogHeaderComponent = ({
  projectId,
  handleTabChange,
  setSearchText,
  logs,
  userNames,
}) => {
  const [currentTab, setCurrentTab] = useState('log');

  const exportCSV = () => {
    try {
      const mappedLogs = logs.map(log => ({
        ProjectID:projectId,
        TemplateName: log.templateName || 'N/A',
        SetID: log.setId || 'N/A',
        Created_By : userNames[log.userId] || 'Unknown User',
        updated_By : userNames[log.updatedBy],
         Created_At: moment(log.createdAt, 'x').isValid()
        ? moment(log.createdAt, 'x').format('YYYY-MM-DD')
        : 'Invalid Date',
        updated_At: moment(log.updatedAt, 'x').isValid()
        ? moment(log.updatedAt, 'x').format('YYYY-MM-DD')
        : 'Invalid Date',
      }));
      const csv = parse(mappedLogs); // Convert JSON to CSV
      // eslint-disable-next-line no-undef
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); // Create a blob from CSV string
      const url = URL.createObjectURL(blob);

      // eslint-disable-next-line no-undef
      const link = document.createElement('a');
      link.href = url;
      const filename=`All_logs-${projectId}.csv`
      link.setAttribute('download', filename);
      link.click(); // Save the file as 'logs.csv'
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error exporting CSV:", error);
    }
  };


  const handleCurrentTab = (key) => {
    setCurrentTab(key);
  };

  useEffect(() => {
    handleTabChange(currentTab);
  }, [currentTab]);

  // Dropdown menu for export options
  const exportMenu = (
    <Menu>
      <Menu.Item key="csv" icon={<ExportOutlined />} onClick={exportCSV}>
        Export as CSV
      </Menu.Item>
    </Menu>
  );

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
          <Dropdown overlay={exportMenu} trigger={['click']}>
            <Button type="primary" icon={<ExportOutlined />} style={{ backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' }}>
              Export <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      </div>

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
            <Input
              placeholder="Search..."
              prefix={<SearchOutlined style={{ color: '#FF6B6B' }} />}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200, height: 33 }}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default LogHeaderComponent;
