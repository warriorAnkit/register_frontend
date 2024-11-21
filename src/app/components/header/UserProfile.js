import { DownOutlined, IdcardOutlined, LoginOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Space } from 'antd';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../../AppContext';
import { ROUTES } from '../../../common/constants';
import useRouter from '../../../hooks/useRouter';

const UserProfile = () => {
  const { getCurrentUser } = useContext(AppContext);
  const {
    location: { pathname },
  } = useRouter();
  const { firstName = '', lastName = '' } = getCurrentUser() || {};
  const items = [
    {
      key: 'profile',
      label: <Link to={ROUTES?.PROFILE}>My Profile</Link>,
      icon: <IdcardOutlined />,
    },
    {
      key: 'logout',
      label: <Link to={ROUTES?.LOGOUT}>Logout</Link>,
      icon: <LoginOutlined />,
    },
  ];

  return (
    <Dropdown
      menu={{ items, selectedKeys: [`${pathname?.split('/')?.[1]}`] }}
      trigger={['click']}
    >
      <Space className="pointer d-flex align-center gap-4" size="small">
        <Avatar alt="Avatar">{`${firstName?.[0]}${lastName?.[0]}`}</Avatar>
        <span className="m-hide">{`${firstName} ${lastName && lastName}`}</span>
        <DownOutlined />
      </Space>
    </Dropdown>
  );
};

export default UserProfile;
