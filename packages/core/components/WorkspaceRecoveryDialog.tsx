import React from 'react';
import { WorkspaceRecovery } from '../services/WorkspaceRecovery';
import './WorkspaceRecoveryDialog.css';

interface WorkspaceRecoveryDialogProps {
  onRecover: () => void;
  onStartFresh: () => void;
  onDismiss?: () => void;
}

export const WorkspaceRecoveryDialog: React.FC<
  WorkspaceRecoveryDialogProps
> = ({ onRecover, onStartFresh, onDismiss }) => {
  const info = WorkspaceRecovery.getRecoverableInfo();

  if (!info || !info.hasWorkspace) {
    return null;
  }

  const handleRecover = () => {
    onRecover();
  };

  const handleStartFresh = () => {
    WorkspaceRecovery.clearWorkspace();
    onStartFresh();
  };

  const handleDismiss = () => {
    WorkspaceRecovery.dismissRecovery();
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div className="workspace-recovery-overlay">
      <div className="workspace-recovery-dialog">
        <div className="recovery-header">
          <h2>Recover Previous Session?</h2>
          <button
            className="recovery-close-btn"
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>

        <div className="recovery-body">
          <div className="recovery-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                fill="currentColor"
              />
              <path
                d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"
                fill="currentColor"
              />
            </svg>
          </div>

          <p className="recovery-message">
            We found an unsaved workspace from{' '}
            <strong>{info.timeSinceLastSave}</strong>
          </p>

          <div className="recovery-stats">
            <div className="stat-item">
              <span className="stat-label">Nodes:</span>
              <span className="stat-value">{info.nodeCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Connections:</span>
              <span className="stat-value">{info.edgeCount}</span>
            </div>
          </div>

          <p className="recovery-question">
            Would you like to continue where you left off?
          </p>
        </div>

        <div className="recovery-actions">
          <button
            className="recovery-btn recovery-btn-primary"
            onClick={handleRecover}
          >
            Restore Workspace
          </button>
          <button
            className="recovery-btn recovery-btn-secondary"
            onClick={handleStartFresh}
          >
            Start Fresh
          </button>
        </div>

        <div className="recovery-footer">
          <label className="recovery-checkbox">
            <input
              type="checkbox"
              onChange={e => {
                if (e.target.checked) {
                  localStorage.setItem('workspace-recovery:auto', 'true');
                } else {
                  localStorage.removeItem('workspace-recovery:auto');
                }
              }}
            />
            <span>Always restore automatically</span>
          </label>
        </div>
      </div>
    </div>
  );
};
