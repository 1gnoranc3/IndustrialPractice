import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames';
import './styles.css';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const isAddressBook = location.pathname === '/addressBook';

  return (
    <nav className="sidebar">
      <div className={classNames('menu-item', { active: isAddressBook })}>
        <img src="/assets/images/contact_icon.svg" alt="Contact Icon" className="menu-icon" />
        <Link to="/addressBook" className="menu-link">
          Адресная книга
        </Link>
      </div>
    </nav>
  );
};

export default Sidebar;

