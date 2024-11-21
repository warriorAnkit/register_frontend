import { Card } from 'antd';
import React, { useState } from 'react';
import FormWrapper from './Components/Form';
import TableWrapper from './Components/Table';

const tabList = [
  {
    key: 'form',
    tab: 'Forms',
  },
  {
    key: 'table',
    tab: 'Table',
  },
];
const contentList = {
  form: <FormWrapper />,
  table: <TableWrapper />,
};
const Sample = () => {
  const [activeTabKey1, setActiveTabKey1] = useState('form');
  const onTab1Change = (key) => {
    setActiveTabKey1(key);
  };
  return (
    <Card
      className="full-width"
      title="Sample Antd Component"
      tabList={tabList}
      activeTabKey={activeTabKey1}
      onTabChange={(key) => {
        onTab1Change(key);
      }}
    >
      {contentList?.[activeTabKey1]}
    </Card>
  );
};
export default Sample;
