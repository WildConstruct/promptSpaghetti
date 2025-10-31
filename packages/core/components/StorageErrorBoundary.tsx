import React, { useEffect, useState } from 'react';
import {
  clearPersistedState,
  getPersistedStateInfo,
  checkStorageQuota
} from '../utils/persistenceUtils';

interface StorageErrorBoundaryProps {
  children: React.ReactNode;
}

interface StorageErrorState {
  hasError: boolean;
  errorType: 'quota' | 'corruption' | null;
  errorMessage: string;
  storageInfo: ReturnType<typeof getPersistedStateInfo> | null;
  quotaInfo: ReturnType<typeof checkStorageQuota>;
}

export function StorageErrorBoundary({ children }: StorageErrorBoundaryProps) {
  const [errorState, setErrorState] = useState<StorageErrorState>({
    hasError: false,
    errorType: null,
    errorMessage: '',
    storageInfo: null,
    quotaInfo: { used: 0, available: true, percentage: 0 }
  });

  useEffect(() => {
    // Listen for storage quota exceeded events
    const handleQuotaExceeded = () => {
      setErrorState({
        hasError: true,
        errorType: 'quota',
        errorMessage: 'Storage quota exceeded. Your work cannot be auto-saved.',
        storageInfo: getPersistedStateInfo(),
        quotaInfo: checkStorageQuota()
      });
    };

    // Listen for corruption events
    const handleCorruption = () => {
      setErrorState({
        hasError: true,
        errorType: 'corruption',
        errorMessage: 'Saved data appears to be corrupted.',
        storageInfo: getPersistedStateInfo(),
        quotaInfo: checkStorageQuota()
      });
    };

    window.addEventListener(
      'storage-quota-exceeded',
      handleQuotaExceeded as EventListener
    );
    window.addEventListener(
      'storage-corruption',
      handleCorruption as EventListener
    );

    return () => {
      window.removeEventListener(
        'storage-quota-exceeded',
        handleQuotaExceeded as EventListener
      );
      window.removeEventListener(
        'storage-corruption',
        handleCorruption as EventListener
      );
    };
  }, []);

  const handleClearStorage = () => {
    clearPersistedState();
    setErrorState({
      hasError: false,
      errorType: null,
      errorMessage: '',
      storageInfo: null,
      quotaInfo: { used: 0, available: true, percentage: 0 }
    });
    // Reload to get fresh state
    window.location.reload();
  };

  const handleDismiss = () => {
    setErrorState(prev => ({ ...prev, hasError: false }));
  };

  if (!errorState.hasError) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <div
        role="alert"
        aria-live="assertive"
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          maxWidth: 400,
          background: '#fff',
          border: '1px solid #d73a49',
          borderRadius: 8,
          padding: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <strong style={{ color: '#d73a49' }}>
            {errorState.errorType === 'quota'
              ? '⚠️ Storage Full'
              : '⚠️ Storage Error'}
          </strong>
        </div>

        <div style={{ marginBottom: 12, fontSize: 14, color: '#586069' }}>
          {errorState.errorMessage}
        </div>

        {errorState.errorType === 'quota' && errorState.quotaInfo && (
          <div style={{ marginBottom: 12, fontSize: 12, color: '#6a737d' }}>
            Storage used: {Math.round(errorState.quotaInfo.percentage)}% (
            {(errorState.quotaInfo.used / 1024).toFixed(1)} KB)
          </div>
        )}

        {errorState.storageInfo?.exists && (
          <div style={{ marginBottom: 12, fontSize: 12, color: '#6a737d' }}>
            Last saved:{' '}
            {errorState.storageInfo.timestamp
              ? new Date(errorState.storageInfo.timestamp).toLocaleString()
              : 'Unknown'}
            {errorState.storageInfo.compressed && ' (compressed)'}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleClearStorage}
            style={{
              padding: '6px 12px',
              background: '#d73a49',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            Clear Storage
          </button>
          <button
            onClick={handleDismiss}
            style={{
              padding: '6px 12px',
              background: '#f6f8fa',
              color: '#24292e',
              border: '1px solid #d1d5da',
              borderRadius: 4,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            Dismiss
          </button>
        </div>

        {errorState.errorType === 'quota' && (
          <div style={{ marginTop: 12, fontSize: 12, color: '#6a737d' }}>
            Tip: Save your work manually or clear old data to free up space.
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Storage status indicator component
 */
export function StorageStatusIndicator() {
  const [storageInfo, setStorageInfo] =
    useState<ReturnType<typeof getPersistedStateInfo>>(null);
  const [quotaInfo, setQuotaInfo] = useState<
    ReturnType<typeof checkStorageQuota>
  >({
    used: 0,
    available: true,
    percentage: 0
  });

  useEffect(() => {
    const updateInfo = () => {
      setStorageInfo(getPersistedStateInfo());
      setQuotaInfo(checkStorageQuota());
    };

    updateInfo();

    // Update on storage events
    const handleStorage = () => updateInfo();
    window.addEventListener('storage', handleStorage);

    // Update periodically
    const interval = setInterval(updateInfo, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  if (!storageInfo?.exists) {
    return null;
  }

  const isWarning = quotaInfo.percentage > 80;
  const isDanger = quotaInfo.percentage > 90;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 10,
        left: 10,
        padding: '4px 8px',
        background: isDanger ? '#ffeef0' : isWarning ? '#fff8dc' : '#f0f9ff',
        border: `1px solid ${isDanger ? '#d73a49' : isWarning ? '#f0ad4e' : '#79b8ff'}`,
        borderRadius: 4,
        fontSize: 11,
        color: isDanger ? '#d73a49' : isWarning ? '#856404' : '#0366d6',
        opacity: 0.8,
        zIndex: 1000
      }}
      title={`Storage: ${Math.round(quotaInfo.percentage)}% used`}
    >
      💾 {storageInfo.compressed && '🗜️'} Auto-saved
    </div>
  );
}
