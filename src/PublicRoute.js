import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AppContext } from './AppContext';
import { ROUTES } from './common/constants';

function PublicRoute() {
  const { getToken } = useContext(AppContext);
  const idToken = getToken();

  return idToken ? <Navigate to={ROUTES?.MAIN} /> : <Outlet />;
}

export default PublicRoute;
