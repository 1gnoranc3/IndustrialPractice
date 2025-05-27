import React from 'react';
import './ErrorPage.css';

const ErrorPage: React.FC = () => (
  <div className="error-page-container">
    <div>Access Denied</div>
    <div className="error-page-message">У вас нет прав для просмотра этой страницы</div>
  </div>
);

export default ErrorPage;

