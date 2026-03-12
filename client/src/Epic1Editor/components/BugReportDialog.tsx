import React, { useMemo, useState } from 'react';

interface BugReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyReport: (options: {
    title: string;
    details: string;
    includePsg: boolean;
  }) => Promise<boolean>;
  onOpenIssue: (options: {
    title: string;
    details: string;
    includePsg: boolean;
  }) => Promise<void>;
}

export const BugReportDialog: React.FC<BugReportDialogProps> = ({
  isOpen,
  onClose,
  onCopyReport,
  onOpenIssue
}) => {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [includePsg, setIncludePsg] = useState(true);

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

  if (!isOpen) {
    return null;
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.dialog} onClick={event => event.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Report a Bug</h2>
            <p style={styles.subtitle}>
              Copy a report payload, then open the issue form. You can include the
              current PSG graph with it.
            </p>
          </div>
          <button style={styles.closeButton} onClick={onClose} aria-label="Close bug report dialog">
            ×
          </button>
        </div>

        <label style={styles.label}>
          Short title
          <input
            style={styles.input}
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder="Example: Branch output handles reconnect incorrectly"
          />
        </label>

        <label style={styles.label}>
          Details
          <textarea
            style={styles.textarea}
            value={details}
            onChange={event => setDetails(event.target.value)}
            placeholder="What did you do? What did you expect? What actually happened?"
          />
        </label>

        <label style={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={includePsg}
            onChange={event => setIncludePsg(event.target.checked)}
          />
          <span>Include current PSG graph in the copied report payload</span>
        </label>

        <div style={styles.hintBox}>
          Use <strong>Copy Report</strong> first. If PSG is included, paste the copied
          payload directly into the GitHub issue body.
        </div>

        <div style={styles.actions}>
          <button
            style={styles.secondaryButton}
            onClick={() => void onCopyReport({ title, details, includePsg })}
            disabled={!canSubmit}
          >
            Copy Report
          </button>
          <button
            style={styles.primaryButton}
            onClick={() => void onOpenIssue({ title, details, includePsg })}
            disabled={!canSubmit}
          >
            Open GitHub Issue
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(6, 9, 14, 0.7)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 7000,
    padding: 24
  },
  dialog: {
    width: 'min(680px, 100%)',
    borderRadius: 18,
    border: '1px solid rgba(126, 165, 211, 0.24)',
    background: '#10161d',
    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45)',
    color: '#ebf2f8',
    padding: 24
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
    marginBottom: 16
  },
  title: {
    margin: 0,
    fontSize: 24
  },
  subtitle: {
    margin: '6px 0 0',
    color: '#aebfd0',
    fontSize: 14,
    lineHeight: 1.5
  },
  closeButton: {
    border: 0,
    background: 'transparent',
    color: '#aebfd0',
    fontSize: 28,
    lineHeight: 1,
    cursor: 'pointer'
  },
  label: {
    display: 'block',
    marginBottom: 14,
    fontSize: 13,
    fontWeight: 600,
    color: '#dde7f0'
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    marginTop: 8,
    borderRadius: 10,
    border: '1px solid rgba(126, 165, 211, 0.3)',
    background: '#0b1016',
    color: '#ebf2f8',
    padding: '10px 12px',
    fontSize: 14
  },
  textarea: {
    width: '100%',
    minHeight: 150,
    boxSizing: 'border-box',
    marginTop: 8,
    resize: 'vertical',
    borderRadius: 12,
    border: '1px solid rgba(126, 165, 211, 0.3)',
    background: '#0b1016',
    color: '#ebf2f8',
    padding: '12px 12px',
    fontSize: 14
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    color: '#dde7f0',
    fontSize: 14,
    marginBottom: 16
  },
  hintBox: {
    borderRadius: 12,
    background: 'rgba(55, 93, 133, 0.18)',
    border: '1px solid rgba(95, 140, 194, 0.22)',
    color: '#c8d7e6',
    padding: '12px 14px',
    fontSize: 13,
    lineHeight: 1.5
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20
  },
  secondaryButton: {
    borderRadius: 10,
    border: '1px solid rgba(126, 165, 211, 0.3)',
    background: '#131c26',
    color: '#ebf2f8',
    padding: '10px 14px',
    cursor: 'pointer'
  },
  primaryButton: {
    borderRadius: 10,
    border: 0,
    background: '#2f7dd1',
    color: '#fff',
    padding: '10px 14px',
    cursor: 'pointer'
  }
};

export default BugReportDialog;
