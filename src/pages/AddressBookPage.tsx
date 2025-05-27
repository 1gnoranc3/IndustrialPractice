import React from 'react';
import Layout from '../components/Layout';
import userData from '../../public/assets/admin.json';
import { UserData } from '../types/user';

const AddressBookPage: React.FC = () => (
  <Layout userData={userData as UserData}>
    <div></div>
  </Layout>
);

export default AddressBookPage;

