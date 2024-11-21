import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ROUTES } from '../../common/constants';
import Sample from './Sample';

const SampleWrapper = () => (
  <Routes>
    <Route path={ROUTES?.SAMPLE} exact component={Sample} />
  </Routes>
);
export default SampleWrapper;
