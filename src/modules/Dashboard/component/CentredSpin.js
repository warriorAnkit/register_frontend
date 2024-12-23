import React from 'react';
import { Spin } from 'antd';

const CenteredSpin = () => (
  <Spin
    size="large"
    style={{
      position: 'absolute',
      top: '50%', // Position it vertically in the center
      left: '50%', // Position it horizontally in the center
      transform: 'translate(-50%, -50%)',
    }}
  />
);

export default CenteredSpin;