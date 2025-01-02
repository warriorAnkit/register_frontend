import {
  HomeOutlined,
  TeamOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import React from 'react';
import { MODULES, ROUTES } from '../../../common/constants';
import useRouter from '../../../hooks/useRouter';

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const menuItems = [
  getItem(MODULES?.DASHBOARD, ROUTES?.MAIN, <HomeOutlined />),
  // getItem(MODULES?.MOVIES, ROUTES?.MOVIES, <VideoCameraOutlined />),
  // getItem(MODULES?.SAMPLE, ROUTES?.SAMPLE, <TeamOutlined />),
];

function Sidebar() {
  const {
    navigate,
    location: { pathname },
  } = useRouter();
  const onMenuSelect = (e) => {
    navigate(e?.key);
  };

  return (
    <div className="side-bar">
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[`/${pathname?.split('/')?.[1]}`]}
        defaultSelectedKeys={[ROUTES?.MAIN]}
        onSelect={onMenuSelect}
        onClick={onMenuSelect}
        items={menuItems}
      />
    </div>
  );
}

export default Sidebar;
