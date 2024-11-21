import { Modal } from 'antd';
import React from 'react';

export default function RouterPrompt(props) {
  const {
    title = 'Leave this page',
    description = 'It looks like you have been editing something. If you leave before saving, your changes will be lost.',
    okText = 'Confirm',
    cancelText = 'Cancel',
    handleOK,
    handleCancel,
    isPrompt,
  } = props;

  return isPrompt ? (
    <Modal
      title={title}
      open={isPrompt}
      onOk={handleOK}
      okText={okText}
      onCancel={handleCancel}
      cancelText={cancelText}
    >
      {description}
    </Modal>
  ) : null;
}
