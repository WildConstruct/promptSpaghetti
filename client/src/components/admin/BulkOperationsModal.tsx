// Epic 17.1.3 - Bulk Operations Modal Component

import React, { useState } from 'react';
import { X, Play, Pause, Archive, AlertTriangle, CheckCircle } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ValidationMessage } from '../common/ValidationMessage';

interface BulkOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedToggleIds: string[];
  onComplete: () => void;
}

type BulkOperation = 'enable' | 'disable' | 'archive';

export const BulkOperationsModal: React.FC<BulkOperationsModalProps> = ({
  isOpen,
  onClose,
  selectedToggleIds,
  onComplete
}) => {
  const [operation, setOperation] = useState<BulkOperation>('enable');
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<{
    success: string[];
    failed: Array<{ id: string; error: string }>;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const operationConfig = {
    enable: {
      title: 'Enable Toggles',
      description: 'Enable the selected feature toggles',
      icon: <Play size={16} />,
      color: 'green',
      confirmPhrase: 'ENABLE TOGGLES',
      warning: 'This will immediately activate these toggles for users.'
    },
    disable: {
      title: 'Disable Toggles',
      description: 'Disable the selected feature toggles',
      icon: <Pause size={16} />,
      color: 'orange',
      confirmPhrase: 'DISABLE TOGGLES',
      warning: 'This will immediately deactivate these toggles for users.'
    },
    archive: {
      title: 'Archive Toggles',
      description: 'Archive the selected feature toggles (cannot be undone)',
      icon: <Archive size={16} />,
      color: 'red',
      confirmPhrase: 'ARCHIVE TOGGLES',
      warning: 'Archived toggles cannot be restored and will be permanently disabled.'
    }
  };

  const config = operationConfig[operation];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!reason.trim()) {
      newErrors.reason = 'Reason is required for bulk operations';
    }

    if (confirmText !== config.confirmPhrase) {
      newErrors.confirm = `Please type "${config.confirmPhrase}" to confirm`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const executeBulkOperation = async () => {
    if (!validateForm()) {
      return;
    }

    setProcessing(true);
    setResults(null);

    const success: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    // Process toggles sequentially to avoid overwhelming the server
    for (const toggleId of selectedToggleIds) {
      try {
        const endpoint = operation === 'enable' 
          ? `/api/feature-toggles/toggles/${toggleId}/activate`
          : `/api/feature-toggles/toggles/${toggleId}`;

        const method = operation === 'enable' ? 'POST' : operation === 'archive' ? 'DELETE' : 'PUT';
        
        const body = operation === 'enable' 
          ? { reason }
          : operation === 'disable'
            ? { enabled: false, reason }
            : undefined;

        const response = await fetch(endpoint, {
          method,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: body ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `HTTP ${response.status}`);
        }

        success.push(toggleId);
      } catch (error) {
        failed.push({
          id: toggleId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    setResults({ success, failed });
    setProcessing(false);
  };

  const handleComplete = () => {
    onComplete();
    onClose();
    // Reset form
    setOperation('enable');
    setReason('');
    setConfirmText('');
    setResults(null);
    setErrors({});
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content bulk-operations-modal">
        <div className="modal-header">
          <div className="header-left">
            <h2>{config.title}</h2>
            <div className="header-meta">
              <span>{selectedToggleIds.length} toggles selected</span>
            </div>
          </div>
          
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {!results ? (
            <>
              {/* Operation Selection */}
              <div className="operation-selector">
                <h3>Select Operation</h3>
                <div className="operation-options">
                  {Object.entries(operationConfig).map(([key, op]) => (
                    <label key={key} className="operation-option">
                      <input
                        type="radio"
                        name="operation"
                        value={key}
                        checked={operation === key}
                        onChange={(e) => setOperation(e.target.value as BulkOperation)}
                      />
                      <div className={`option-content ${operation === key ? 'selected' : ''}`}>
                        <div className="option-header">
                          {op.icon}
                          <span>{op.title}</span>
                        </div>
                        <p>{op.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div className={`operation-warning ${config.color}`}>
                <AlertTriangle size={16} />
                <div>
                  <strong>Warning:</strong> {config.warning}
                </div>
              </div>

              {/* Reason */}
              <div className="form-group">
                <label>Reason for Bulk Operation *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you're performing this bulk operation..."
                  rows={3}
                  className={errors.reason ? 'error' : ''}
                />
                {errors.reason && <ValidationMessage type="error" message={errors.reason} />}
              </div>

              {/* Confirmation */}
              <div className="form-group">
                <label>Confirmation *</label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={`Type "${config.confirmPhrase}" to confirm`}
                  className={errors.confirm ? 'error' : ''}
                />
                {errors.confirm && <ValidationMessage type="error" message={errors.confirm} />}
                <div className="form-help">
                  This confirmation is required for security
                </div>
              </div>

              {/* Toggle List Preview */}
              <div className="selected-toggles-preview">
                <h4>Affected Toggles ({selectedToggleIds.length})</h4>
                <div className="toggle-ids-list">
                  {selectedToggleIds.slice(0, 10).map(id => (
                    <code key={id} className="toggle-id">{id}</code>
                  ))}
                  {selectedToggleIds.length > 10 && (
                    <span className="more-indicator">
                      ... and {selectedToggleIds.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Results Display */
            <div className="results-display">
              <div className="results-summary">
                <h3>Operation Complete</h3>
                <div className="summary-stats">
                  <div className="stat success">
                    <CheckCircle size={20} />
                    <span>{results.success.length} Successful</span>
                  </div>
                  {results.failed.length > 0 && (
                    <div className="stat failed">
                      <AlertTriangle size={20} />
                      <span>{results.failed.length} Failed</span>
                    </div>
                  )}
                </div>
              </div>

              {results.failed.length > 0 && (
                <div className="failed-operations">
                  <h4>Failed Operations</h4>
                  <div className="failed-list">
                    {results.failed.map(({ id, error }) => (
                      <div key={id} className="failed-item">
                        <code className="failed-id">{id}</code>
                        <span className="error-message">{error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="operation-details">
                <div className="detail-item">
                  <label>Operation</label>
                  <span>{config.title}</span>
                </div>
                <div className="detail-item">
                  <label>Reason</label>
                  <span>{reason}</span>
                </div>
                <div className="detail-item">
                  <label>Completed At</label>
                  <span>{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {processing && (
            <div className="processing-overlay">
              <LoadingSpinner />
              <p>Processing {operation} operation...</p>
              <div className="processing-status">
                This may take a few moments for large selections
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {!results ? (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn-${config.color}`}
                onClick={executeBulkOperation}
                disabled={processing}
              >
                {config.icon}
                {processing ? 'Processing...' : `${config.title}`}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleComplete}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};