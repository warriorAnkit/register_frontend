import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ROUTES } from '../../common/constants';
import Profile from './Profile';

const ProfileWrapper = () => (
  <Routes>
    <Route path={ROUTES?.PROFILE} exact component={Profile} />
  </Routes>
);

export default ProfileWrapper;
