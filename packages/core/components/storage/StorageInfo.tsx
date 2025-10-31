/**
 * Storage information display component
 */

import React, { useEffect, useState } from 'react';
import {
  getStorageInfo,
  exportBackup,
  clearPersistedState
} from '../../utils/stateRestoration';
import { getPersistedStateInfo } from '../../utils/persistenceUtils';
import './StorageInfo.css';

interface StorageInfoProps {
  position?: 'inline' | 'fixed';
  showActions?: boolean;
  onReset?: () => void;
  className?: string;
}

export function StorageInfo({
  position = 'inline',
  showActions = true,
  onReset,
  className = ''
}: StorageInfoProps) {
  const [storageInfo, setStorageInfo] = useState<
    Awaited<ReturnType<typeof getStorageInfo>> | null
  >(null);
  const [stateInfo, setStateInfo] = useState<
    ReturnType<typeof getPersistedStateInfo>
  >(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Update storage information
  useEffect(() => {
    const updateInfo = async () => {
      const storage = await getStorageInfo();
      setStorageInfo(storage);
      setStateInfo(getPersistedStateInfo());
    };

    updateInfo();

    // Update periodically
    const interval = setInterval(updateInfo, 30000); // Every 30 seconds

    // Listen for storage events
    const handleStorageChange = () => updateInfo();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('state-cleared', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('state-cleared', handleStorageChange);
    };
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      exportBackup();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Export failed:', error);
      setExportError('Failed to export backup. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = async () => {
    // Export backup first
    try {
      exportBackup();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Backup export failed:', error);
    }

    // Clear state
    clearPersistedState();
    setShowResetConfirm(false);

    // Notify parent
    onReset?.();

    // Reload to get fresh state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  // Format last modified time
  const formatLastModified = () => {
    if (!stateInfo?.timestamp) {
      return 'Never';
    }

    const date = new Date(stateInfo.timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
    return 'Just now';
  }
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  }

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }

  return date.toLocaleDateString();
};

  if (!storageInfo) {
    return null;
  }

  return (
    <>
      <div className={`storage-info ${position === 'fixed' ? 'fixed' : ''} ${className}`}>
        <h4 className="storage-title">
          💾 Storage Info
        </h4>

        <div className="storage-subtitle">
          {/* Last Modified */}
          <div className="storage-metric">
            <span className="storage-metric-label">Last saved:</span>
            <span className="storage-metric-value">
              {formatLastModified()}
            </span>
          </div>

          {/* Storage Size */}
          <div className="storage-metric">
            <span className="storage-metric-label">Storage used:</span>
            <span className="storage-metric-value">
              {storageInfo.formattedUsed}
            </span>
          </div>

          {/* Available Space */}
          {storageInfo.formattedAvailable && (
            <div className="storage-metric">
              <span className="storage-metric-label">Available:</span>
              <span className="storage-metric-value">
                {storageInfo.formattedAvailable}
              </span>
            </div>
          )}

          {/* Storage Bar */}
          {storageInfo.quota && (
            <div className="storage-usage-section">
              <div className="storage-usage-header">
                <span>Usage</span>
                <span className="storage-usage-percentage">
                  {Math.round(storageInfo.percentage)}%
                </span>
              </div>
              <div className="storage-usage-bar">
                <div
                  className="storage-usage-fill"
                  style={{
                    width: `${Math.min(100, storageInfo.percentage)}%`,
                    backgroundColor:
                      storageInfo.percentage > 90
                        ? '#dc3545'
                        : storageInfo.percentage > 75
                          ? '#ffc107'
                          : '#28a745'
                  }}
                />
              </div>
            </div>
          )}

          {/* Compression Status */}
          {stateInfo?.compressed && (
            <div className="storage-compression-status">
              🗜️ Data compressed (
              {stateInfo.size
                ? `${Math.round(stateInfo.size / 1024)} KB`
                : 'size unknown'}
              )
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="storage-actions">
            <button
              className="storage-button storage-button-primary"
              onClick={handleExport}
              disabled={isExporting || !stateInfo?.exists}
            >
              {isExporting ? 'Exporting...' : 'Export Backup'}
            </button>
            <button
              className="storage-button storage-button-danger"
              onClick={handleReset}
            >
              Reset Storage
            </button>
          </div>
        )}

        {/* Data Info */}
        {stateInfo?.compressed && (
          <div className="storage-data-info">
            🗜️ Data compressed (
            {stateInfo.size
              ? `${Math.round(stateInfo.size / 1024)} KB`
              : 'size unknown'}
            )
          </div>
        )}

        {/* Error Display */}
        {exportError && (
          <div className="storage-error">
            {exportError}
          </div>
        )}
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <ResetConfirmDialog onConfirm={confirmReset} onCancel={cancelReset} />
      )}
    </>
  );
}

/**
 * Reset confirmation dialog
 */
function ResetConfirmDialog({
  onConfirm,
  onCancel
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="storage-confirm-dialog"
      role="dialog"
      aria-labelledby="reset-title"
      aria-describedby="reset-description"
    >
      <div className="storage-confirm-content">
        <h3 id="reset-title" className="storage-confirm-title">
          <span>⚠️</span>
          Reset Storage?
        </h3>

        <p id="reset-description" className="storage-confirm-message">
          This will <strong>permanently delete</strong> all your saved work and
          cannot be undone. A backup will be automatically exported before
          resetting.
        </p>

        <div className="storage-confirm-note">
          <strong>Note:</strong> Your current work will be exported as a backup
          file before resetting. You can re-import it later if needed.
        </div>

        <div className="storage-confirm-actions">
          <button
            className="storage-confirm-button storage-confirm-button-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="storage-confirm-button storage-confirm-button-confirm"
            onClick={onConfirm}
          >
            Reset Storage
          </button>
        </div>
      </div>
    </div>
  );
}
