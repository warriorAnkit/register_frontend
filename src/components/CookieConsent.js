import { Button, Modal, Space, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

export default function CookieConsent() {
  const [openModal, setOpenModal] = useState(false);
  const getCookie = (cookieName) => {
    const name = `${cookieName}=`;
    let returnCookie = '';
    // eslint-disable-next-line no-undef
    const decodedCookie = decodeURIComponent(document?.cookie);
    const cookieArray = decodedCookie?.split(';');
    if (cookieArray?.length > 0) {
      // eslint-disable-next-line array-callback-return
      cookieArray?.map((item) => {
        let cookie = item;
        while (cookie?.charAt(0) === ' ') {
          cookie = cookie?.substring(1);
        }
        if (cookie?.indexOf(name) === 0) {
          returnCookie = cookie?.substring(name?.length, cookie?.length);
        }
      });
      return returnCookie;
    }
  };

  const handleOkBtn = () => {
    // eslint-disable-next-line no-undef
    document.cookie = 'cookieConsent=true;';
    setOpenModal(false);
  };

  useEffect(() => {
    const cookieConsent = getCookie('cookieConsent');
    if (!cookieConsent) {
      setOpenModal(true);
    }
  }, []);

  return (
    <Modal
      centered
      open={openModal}
      footer={null}
      closable={false}
      width="unset"
      // Adding inline style as this will be a common component
      style={{
        verticalAlign: 'bottom',
        marginBottom: '30px',
      }}
    >
      <Space wrap>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="2em"
          height="2em"
          fill="#000000"
          viewBox="0 0 256 256"
        >
          <rect width="256" height="256" fill="none" />
          <path
            d="M224,127.4a95.6,95.6,0,0,1-28.2,68.5c-36.9,36.9-97.3,37.3-134.7.9A96,96,0,0,1,128.6,32a8.1,8.1,0,0,1,7.8,9.8,32,32,0,0,0,30.8,39,8,8,0,0,1,8,8,32,32,0,0,0,39,30.8A8.1,8.1,0,0,1,224,127.4Z"
            fill="none"
            stroke="#000000"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="16"
          />
          <circle cx="156" cy="172" r="12" />
          <circle cx="92" cy="164" r="12" />
          <circle cx="84" cy="108" r="12" />
          <circle cx="136" cy="124" r="12" />
        </svg>
        <Typography.Paragraph style={{ margin: '0' }}>
          {/* Adding inline style as this will be a common component */}
          This website uses cookies to enhance the user experience.
        </Typography.Paragraph>
        <Button type="primary" onClick={handleOkBtn}>
          Okay
        </Button>
      </Space>
    </Modal>
  );
}
