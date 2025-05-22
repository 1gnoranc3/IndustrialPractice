import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { checkAccess } from './authUtils';
import { UserData } from './types/user';
import Layout from './components/Layout';

// Импортируйте нужного пользователя (меняйте путь при необходимости)
import userData from "../public/assets/admin.json";

const AddressBookPage = () => (
  <Layout userData={userData as UserData}>
    <div></div>
  </Layout>
);
const ErrorPage = () => (
  <div style={{
    width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', fontFamily: 'Roboto, sans-serif', fontSize: 32, color: '#121C2B', flexDirection: 'column'
  }}>
    <div>Access Denied</div>
    <div style={{fontSize: 18, marginTop: 16, color: '#5D9AF4'}}>У вас нет прав для просмотра этой страницы</div>
  </div>
);
const NotFoundPage = () => (
  <Layout userData={userData as UserData}>
    <div>404 - Page Not Found</div>
  </Layout>
);

export const App = () => {
  const hasAccess = checkAccess(userData as UserData);

  return (
    <Routes>
      <Route
        path="/addressBook"
        element={
          <ProtectedRoute hasAccess={hasAccess} redirectPath="/error">
            <AddressBookPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/error"
        element={
          <ProtectedRoute hasAccess={!hasAccess} redirectPath="/addressBook">
            <ErrorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={<Navigate to={hasAccess ? '/addressBook' : '/error'} replace />}
      />
      <Route
        path="*"
        element={<NotFoundPage />} />
    </Routes>
  );
};

