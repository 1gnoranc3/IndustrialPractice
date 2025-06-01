import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { checkAccess } from './authUtils';
import { UserData } from './types/user';
import Layout from './components/Layout';

import AddressBookPage from './pages/AddressBookPage';
import ErrorPage from './pages/ErrorPage';

export const App = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/assets/admin.json')
      .then((res) => res.json())
      .then((data) => {
        setUserData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!userData) return <ErrorPage code={500} message="Не удалось загрузить данные пользователя" />;

  const hasAccess = checkAccess(userData as UserData);

  return (
    <Routes>
      <Route path="/" element={<Layout userData={userData} />}>
        <Route
          path="addressBook"
          element={
            <ProtectedRoute hasAccess={hasAccess} redirectPath="/error">
              <AddressBookPage />
            </ProtectedRoute>
          }
        />
        <Route path="somethingElse" element={<div>тестики тестики</div>} /> //строка для проверки работы роутинга
        <Route index element={<Navigate to={hasAccess ? '/addressBook' : '/error'} replace />} />
      </Route>
      <Route path="error" element={<ErrorPage code={403} message="У Вас недостаточно прав для просмотра этой страницы" />} />
      <Route path="*" element={<ErrorPage code={404} message="Страница не найдена" />} />
    </Routes>
  );
};

