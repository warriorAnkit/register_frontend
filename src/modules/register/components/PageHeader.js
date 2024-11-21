// HeaderComponent.js
import React from 'react';
import { Layout, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import './HeaderComponent.less'; // Import the .less file
import { ROUTES } from '../../../common/constants';

const { Header } = Layout;

const PageHeader = ({ templateName }) => (
  <Header className="page-header">
    <Breadcrumb separator={<span className="breadcrumb-separator"> &gt; </span>}>
      <Breadcrumb.Item href={ROUTES.MAIN}>
        <HomeOutlined className="home-icon" />
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <span className="template-name">{templateName}</span>
      </Breadcrumb.Item>
    </Breadcrumb>
  </Header>
);

export default PageHeader;
