import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { injectUsingPortal, isPortalIdExists } from '../common/utils';

const Portal = ({ children, portalId }) => {
  const [portalExist, setPortalExist] = useState(false);
  useEffect(() => {
    if (isPortalIdExists(portalId)) {
      setPortalExist(true);
    } else {
      setPortalExist(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      {portalExist &&
        ReactDOM.createPortal(children, injectUsingPortal(portalId))}
    </>
  );
};

export default Portal;
