import { Spin } from 'antd';
import React from 'react';

const LoaderComponent = (props) => {
  const {
    spinning = true,
    size = 'large',
    children,
    setHeight = 100,
    ...rest
  } = props;
  return (
    <Spin
      spinning={spinning}
      size={size}
      className="d-flex justify-center align-center flex-vertical"
      style={{
        height: `${setHeight}vh`,
      }}
      {...rest}
    >
      {children}
    </Spin>
  );
};
export default LoaderComponent;
