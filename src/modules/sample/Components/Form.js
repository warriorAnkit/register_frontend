import { Col, Divider, Row } from 'antd';
import React from 'react';
import ConditionForm from './Form/ConditionForm';
import DraggableDynamicForm from './Form/DraggableDynamicForm';
import DynamicForm from './Form/DynamicForm';
import PSinput from './Form/PSinput';

const Form = () => (
  <Row gutter={[16, 16]}>
    <Col xs={24} lg={12}>
      <Divider plain>Conditional Form</Divider>
      <ConditionForm />
    </Col>
    <Col xs={24} lg={12}>
      <Divider plain>Dynamic Form</Divider>
      <DynamicForm />
    </Col>
    <Col xs={24} lg={12}>
      <Divider plain>Prefix & Suffix Input</Divider>
      <PSinput />
    </Col>
    <Col xs={24} lg={12}>
      <Divider plain>Dynamic Form with Draggable</Divider>
      <DraggableDynamicForm />
    </Col>
  </Row>
);
export default Form;
