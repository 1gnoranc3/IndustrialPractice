import React, { useState } from 'react';
import FiltersSection from '../components/Filter';
import SearchInput from '../components/SearchInput';
import SyncButton from '../components/SyncButton';
import ContactsList from '../components/ContactsList';
import { useOutletContext } from 'react-router-dom';
import { UserData } from '../types/user';
import { filterContacts, FilterParams } from '../api/filterContacts';

const AddressBookPage: React.FC = () => {
  const [contactType, setContactType] = useState<'all' | 'local' | 'network'>('all');
  const [messaging, setMessaging] = useState<'all' | 'allowed' | 'forbidden'>('all');
  const [groupView, setGroupView] = useState(true);
  const [search, setSearch] = useState('');
  const { userData } = useOutletContext<{ userData: UserData }>();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [rawData, setRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    import('../api/contacts').then(({ fetchContacts }) => {
      fetchContacts()
        .then((res) => {
          setRawData(res);
          setError(null);
        })
        .catch(() => setError('Ошибка загрузки данных'))
        .finally(() => setLoading(false));
    });
  }, []);

  const filteredData = React.useMemo(() => {
    return filterContacts(rawData, { contactType, messaging, groupView, search });
  }, [rawData, contactType, messaging, groupView, search]);

  function handleSync() {
    setSyncStatus('loading');
    import('../api/contacts').then(({ fetchContacts }) => {
      fetchContacts()
        .then((res) => {
          // Сбросить локальные порядки
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('contacts_root_order_v1');
            window.localStorage.removeItem('contacts_flat_order_v1');
          }
          setRawData(res);
          setSyncStatus('success');
          setError(null);
          setTimeout(() => setSyncStatus('idle'), 2000);
        })
        .catch(() => {
          setSyncStatus('error');
          setTimeout(() => setSyncStatus('idle'), 2000);
        });
    });
  }

  return (
    <main className="main">
      <SyncButton status={syncStatus} onSync={handleSync} />
      <div className="address-book-content">
        <FiltersSection
          contactType={contactType}
          onContactTypeChange={setContactType}
          messaging={messaging}
          onMessagingChange={setMessaging}
          groupView={groupView}
          onGroupViewChange={setGroupView}
        />
        <SearchInput value={search} onChange={setSearch} />
        <div className="contacts-list-wrapper">
          <ContactsList key={syncStatus} data={filteredData} loading={loading} error={error} groupView={groupView} userData={userData} />
        </div>
      </div>
    </main>
  );
}

export default AddressBookPage;
