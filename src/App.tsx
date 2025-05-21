// App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { checkAccess } from './authUtils';
import { UserData } from './types';

// Импортируйте нужного пользователя (меняйте путь при необходимости)
import userData from "../public/assets/operator_no_read.json";

const AddressBookPage = () => <div>Address Book</div>;
const ErrorPage = () => <div>Access Denied</div>;

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
    </Routes>
  );
};