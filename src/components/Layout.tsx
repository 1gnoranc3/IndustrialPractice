import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import classNames from 'classnames';
import phoneInfo from '../../public/assets/phone_info.json';
import { UserData } from '../types/user';
import './styles.css';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  userData: UserData;
}

const Layout: React.FC<LayoutProps> = ({ children, userData }) => {
  const location = useLocation();
  const isAddressBook = location.pathname === '/addressBook';

  return (
    <div className="layout-root">
      <Header userData={userData} />
      <Sidebar />
      <main className="main">
        {children}
      </main>
    </div>
  );
};

export default Layout;

