import {
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Button, Layout } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { BREAKPOINTS, ROUTES } from '../common/constants';
import MobileLogoComponent from '../components/MobileLogoComponent';
import './App.css';
import AppHeader from './components/header/AppHeader';
import UserProfile from './components/header/UserProfile';
import Sidebar from './components/sidebar/Sidebar';

const { Content, Footer, Sider } = Layout;
const App = () => {
  const [isDesktop, setDesktop] = useState(
    // eslint-disable-next-line no-undef
    window.innerWidth > BREAKPOINTS.tablet,
  );
  const [isActive, setActive] = useState(false);

  const handleOverlay = () => {
    setActive(!isActive);
  };

  useEffect(() => {
    const updateMedia = () => {
      // eslint-disable-next-line no-undef
      if (window.innerWidth > BREAKPOINTS.tablet) {
        setDesktop(true);
      } else {
        setDesktop(false);
      }
    };
    // eslint-disable-next-line no-undef
    window.addEventListener('resize', updateMedia);
    // eslint-disable-next-line no-undef
    return () => window.removeEventListener('resize', updateMedia);
  });

  const [collapsed, setCollapsed] = useState(false);
  return (
    <Layout hasSider>
      {!isDesktop && (
        <span
          className={isActive ? 'active overlay-responsive' : 'overlay-disable'}
          onClick={handleOverlay}
        />
      )}
      <Sider
        theme="light"
        collapsed={isDesktop ? collapsed : false}
        className={isActive ? 'close' : null}
        breakpoint="md"
      >
        <Link id="logo" to={ROUTES?.MAIN}>
          {collapsed ? (
            <MobileLogoComponent className="mr-0" />
          ) : (
            <>
              <MobileLogoComponent className="mr-8" />
              LOGICWIN
            </>
          )}
        </Link>
        <Sidebar />
      </Sider>
      <Layout className="site-layout">
        <AppHeader>
          <div className="header-wrapper">
            {isDesktop ? (
              <>
                {collapsed ? (
                  <MenuUnfoldOutlined
                    className="trigger"
                    onClick={() => setCollapsed(!collapsed)}
                  />
                ) : (
                  <MenuFoldOutlined
                    className="trigger"
                    onClick={() => setCollapsed(!collapsed)}
                  />
                )}
              </>
            ) : (
              <>
                <Button
                  className="trigger"
                  type="text"
                  onClick={handleOverlay}
                  icon={<MenuOutlined />}
                  size="middle"
                />
                <div className="responsive-logo text-center">
                  <MobileLogoComponent />
                </div>
              </>
            )}
            <UserProfile />
          </div>
        </AppHeader>
        <Content className="wrapper">
          <Outlet />
        </Content>
        <Footer>
          <div className="text-center">
            Logicwind hhhh© {new Date().getFullYear()}
          </div>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;
