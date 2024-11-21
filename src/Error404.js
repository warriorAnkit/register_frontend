import { Button, Result } from 'antd';
import React from 'react';
import { ROUTES } from './common/constants';

const Error404 = () => (
  <Result
    status="404"
    title="404"
    subTitle="Sorry, the page you visited does not exist."
    extra={
      <Button type="primary" href={ROUTES?.MAIN}>
        Back Home
      </Button>
    }
  />
);

export default Error404;
