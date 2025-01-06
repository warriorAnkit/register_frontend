/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationGuard = ({
  children,
  confirmationMessage = 'Are you sure you want to leave this page? Unsaved changes may be lost!',
  isAllRowsComplete,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLeaving, setIsLeaving] = useState(false);
// eslint-disable-next-line no-console
console.log(isAllRowsComplete)
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if(!isAllRowsComplete){
      if (!isLeaving) {
        event.preventDefault();
        event.returnValue = '';
      }
    }
    };
    const handlePopState = (event) => {
      if(isAllRowsComplete){
      // eslint-disable-next-line no-alert
      const confirmLeave = window.confirm("You have unsaved changes. Are you sure you want to go back?");
      if (confirmLeave) {

        window.history.back();  // Manually trigger the back navigation
      } else {
        // Prevent the navigation if user cancels
        event.preventDefault();
      }
    }
    };

    // Add event listeners
    window.history.pushState(null, document.title);
    window.addEventListener('popstate', handlePopState);

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
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