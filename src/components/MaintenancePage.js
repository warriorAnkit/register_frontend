import { Result } from 'antd';
import React from 'react';

const MaintenancePage = () => (
  <div className="empty-data d-flex justify-center align-center full-height">
    <Result
      status="500"
      title={<h1>Sorry! We are under maintenance currently!!</h1>}
      subTitle={<h2>We're preparing to serve you better.</h2>}
    />
  </div>
);
export default MaintenancePage;
