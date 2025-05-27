import React from 'react';
import Layout from '../components/Layout';
import userData from '../../public/assets/admin.json';
import { UserData } from '../types/user';

const NotFoundPage: React.FC = () => (
  <Layout userData={userData as UserData}>
    <div>404 - Page Not Found</div>
  </Layout>
);

export default NotFoundPage;

