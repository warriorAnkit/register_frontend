import { Empty, Result } from 'antd';
import React from 'react';

const EmptyStatePage = () => (
  <div className="empty-data d-flex justify-center align-center">
    <Result
      icon={<Empty description={false} />}
      title="Sorry! No data found!!"
    />
  </div>
);
export default EmptyStatePage;
