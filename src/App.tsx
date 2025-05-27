import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { checkAccess } from './authUtils';
import { UserData } from './types/user';
import Layout from './components/Layout';

// Импортируйте нужного пользователя (меняйте путь при необходимости)
import userData from "../public/assets/admin.json";

import AddressBookPage from './pages/AddressBookPage';
import ErrorPage from './pages/ErrorPage';
import NotFoundPage from './pages/NotFoundPage';

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

