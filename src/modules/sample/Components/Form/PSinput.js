import { UserOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import React from 'react';

const PSinput = () => (
  <>
    <Input size="large" placeholder="Large size" prefix={<UserOutlined />} />
    <br />
    <br />
    <Input placeholder="Default size" suffix={<UserOutlined />} />
    <br />
    <br />
    <Input size="small" placeholder="Small size" prefix={<UserOutlined />} />
  </>
);
export default PSinput;
