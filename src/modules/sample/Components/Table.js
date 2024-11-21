import { Col, Divider, Row } from 'antd';
import React from 'react';
import DraggableTable from './Table/DraggableTable';

const Table = () => (
  <Row gutter={[16, 16]}>
    <Col xs={24} lg={12}>
      <Divider plain>Drag sorting with handler</Divider>
      <DraggableTable />
    </Col>
  </Row>
);
export default Table;
