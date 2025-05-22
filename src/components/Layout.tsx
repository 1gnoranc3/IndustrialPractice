import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import phoneInfo from '../../public/assets/phone_info.json';
import { UserData } from '../types/user';
import './styles.css';

interface LayoutProps {
  children: React.ReactNode;
  userData: UserData;
}

const Layout: React.FC<LayoutProps> = ({ children, userData }) => {
  const location = useLocation();
  const isAddressBook = location.pathname === '/addressBook';

  return (
    <div className="layout-mockup-root">
      {/* Шапка */}
      <header className="layout-mockup-header">
        <img src="/assets/images/company_logo.svg" alt="Company Logo" className="company-logo" />
        <div className="layout-mockup-profile">
          <span className="layout-mockup-address">{phoneInfo.address_info}</span>
          <span className="layout-mockup-login">{userData.user.login}</span>
        </div>
      </header>
      {/* Сайдбар */}
      <nav className="layout-mockup-sidebar">
        <div className={`layout-mockup-menu-item${isAddressBook ? ' active' : ''}`}>
          <img src="/assets/images/contact_icon.svg" alt="Contact Icon" className="layout-mockup-menu-icon" />
          <Link to="/addressBook" className="layout-mockup-menu-link">
            Адресная книга
          </Link>
        </div>
      </nav>
      {/* Основная рабочая область */}
      <main className="layout-mockup-main">
        {children}
      </main>
    </div>
  );
};

export default Layout;

