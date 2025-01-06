/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
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
  const [isBlocking, setIsBlocking] = useState(false);
  const [nextPath, setNextPath] = useState(null);

  const isComplete = isAllRowsComplete ?? false;

  const handleNavigate =async (path) => {
console.log("g",window.history.back());
   window.history.back();

    setIsBlocking(false);
    // navigate(path); // Navigate to the specified path
  };

  const handleCancel = () => {
    setIsBlocking(false);
    setNextPath(null);
  };

  useEffect(() => {
    // Handle beforeunload event to prevent page unload
    const handleBeforeUnload = (event) => {
      if (!isComplete) {
        event.preventDefault();
        event.returnValue = ''; // Display a default confirmation message
      }
    };

    // Handle popstate event to block back navigation (back/forward button)
    const handlePopState = (event) => {
      if (!isComplete) {
        setIsBlocking(true);
        setNextPath(location.pathname); // Store the current path
        event.preventDefault(); // Prevent the default popstate action
      }
      else{
        console.log("backl");
        window.history.back();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Push a new history state to ensure popstate is triggered
    window.history.pushState(null, document.title, location.pathname);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isComplete, location.pathname]);

  return (
    <>
      {children}
      <Modal
        title="Confirm Navigation"
        visible={isBlocking}
        onOk={() => handleNavigate(nextPath)}
        onCancel={handleCancel}
        closable={false}
      >
        {confirmationMessage}
      </Modal>
    </>
  );
};

export default NavigationGuard;
