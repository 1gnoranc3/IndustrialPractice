import React from 'react';
import './contacts-list.css';

interface SyncButtonProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  onSync: () => void;
}

const SyncStatusIcon: React.FC<{ status: SyncButtonProps['status'] }> = ({ status }) => {
  if (status === 'loading')
    return (
      <span className="sync-status-icon">
        <svg className="sync-status-spinner" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" stroke="#888" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
          </circle>
        </svg>
      </span>
    );
  if (status === 'success')
    return <span className="sync-status-icon sync-status-success" title="Синхронизировано">✔️</span>;
  if (status === 'error')
    return <span className="sync-status-icon sync-status-error" title="Ошибка синхронизации">❌</span>;
  return null;
};

const SyncButton: React.FC<SyncButtonProps> = ({ status, onSync }) => (
  <div className="sync-button-wrapper">
    <button
      className="sync-button"
      onClick={onSync}
      disabled={status === 'loading'}
    >
      Синхронизация
    </button>
    <SyncStatusIcon status={status} />
  </div>
);

export default SyncButton;

