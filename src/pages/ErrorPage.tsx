import React from 'react';
import './ErrorPage.css';

interface ErrorPageProps {
  code?: number;
  message?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ code = 403, message = 'У Вас недостаточно прав для просмотра этой страницы' }) => (
  <div className="error-page-container">
    <div className="error-page-code">{code}</div>
    <div className="error-page-title">Произошла ошибка</div>
    <div className="error-page-message">{message}</div>
  </div>
);

export default ErrorPage;

