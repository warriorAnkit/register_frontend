/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationGuard = ({
  children,
  confirmationMessage = 'Are you sure you want to leave this page? Unsaved changes may be lost!',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isLeaving) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLeaving]);

  const handleConfirm = () => {
    setIsLeaving(false);
    navigate(location.pathname);
  };

  const handleCancel = () => {
    setIsLeaving(false);
  };

  return (
    <>
      {children}
      <Modal
        title="Confirm Navigation"
        visible={isLeaving}
        onOk={handleConfirm}
        onCancel={handleCancel}
      >
        {confirmationMessage}
      </Modal>
    </>
  );
};

export default NavigationGuard;