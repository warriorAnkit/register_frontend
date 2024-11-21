import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ROUTES } from '../../common/constants';
import Dashboard from './Dashboard';

const DashboardWrapper = () => (
  <Routes>
    <Route exact path={ROUTES?.MAIN} component={Dashboard} />
  </Routes>
);

export default DashboardWrapper;
