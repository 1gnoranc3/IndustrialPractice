import React from 'react';
import phoneInfo from '../../public/assets/phone_info.json';
import { UserData } from '../types/user';
import './styles.css';

interface HeaderProps {
  userData: UserData;
}

const Header: React.FC<HeaderProps> = ({ userData }) => (
  <header className="header">
    <img src="/assets/images/company_logo.svg" alt="Company Logo" className="company-logo" />
    <div className="profile">
      <span className="address">{phoneInfo.address_info}</span>
      <span className="login">{userData.user.login}</span>
    </div>
  </header>
);

export default Header;

