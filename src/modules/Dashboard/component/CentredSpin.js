import React from 'react';
import { Spin } from 'antd';
import '../dashboard.less'

const CenteredSpin = () => (
  <Spin size="large" className="centered-spinner" />
);

export default CenteredSpin;
