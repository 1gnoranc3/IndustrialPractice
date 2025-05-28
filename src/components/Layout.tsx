import React from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';
import classNames from 'classnames';
import phoneInfo from '../../public/assets/phone_info.json';
import { UserData } from '../types/user';
import './styles.css';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  userData: UserData;
}

const Layout: React.FC<LayoutProps> = ({ userData }) => {
  const location = useLocation();
  const isAddressBook = location.pathname === '/addressBook';

  return (
    <div className="layout-root">
      <Header userData={userData} />
      <div className="content">
        <Sidebar />
        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

