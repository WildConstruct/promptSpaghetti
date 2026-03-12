import React from 'react';
import type { LLMStatusResponse } from '../../services/llm';
import { useRuntimeMode } from '../../hooks/useRuntimeMode';

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  dialog: {
    background: '#fff',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666'
  },
  body: {
    padding: '20px'
  },
  section: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#333'
  },
  small: {
    display: 'block',
    marginTop: '4px',
    fontSize: '12px',
    color: '#888'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '20px',
    borderTop: '1px solid #e0e0e0'
  },
  btnPrimary: {
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    fontWeight: '500',
    cursor: 'pointer'
  },
  btnSecondary: {
    padding: '10px 20px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    background: '#fff',
    color: '#333',
    fontWeight: '500',
    cursor: 'pointer'
  },
  costInfo: {
    background: '#f8f9fa',
    padding: '12px',
    borderRadius: '6px'
  },
  costItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px'
  },
  costValue: {
    fontWeight: '600',
    color: '#667eea'
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: '600'
  },
  statusBadgeAvailable: {
    background: '#dcfce7',
    color: '#166534'
  },
  statusBadgeUnavailable: {
    background: '#fef3c7',
    color: '#92400e'
  },
  detailList: {
    display: 'grid',
    gap: '12px'
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    fontSize: '14px'
  },
  detailLabel: {
    color: '#666',
    fontWeight: '500'
  },
  detailValue: {
    color: '#111827',
    textAlign: 'right' as const
  },
  capabilityList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px'
  },
  capabilityChip: {
    padding: '6px 10px',
    borderRadius: '999px',
    background: '#eef2ff',
    color: '#4338ca',
    fontSize: '12px',
    fontWeight: '600'
  },
  loadingState: {
    fontSize: '14px',
    color: '#666'
  },
  noteCard: {
    background: '#f8f9fa',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  routeRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
    marginTop: '12px'
  },
  routeBadge: {
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700'
  },
  routeBadgeActive: {
    background: '#dcfce7',
    color: '#166534'
  },
  routeBadgeMuted: {
    background: '#e5e7eb',
    color: '#4b5563'
  }
};

export interface LLMConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (status: LLMStatusResponse | null) => void;
}

export const LLMConfigDialog: React.FC<LLMConfigDialogProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const runtime = useRuntimeMode();
  const status = runtime.llmStatus;
  const isLoading = isOpen && runtime.loading;

  if (!isOpen) {
    return null;
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.dialog} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>AI Parser Status</h2>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.body}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Runtime Mode</h3>
            {isLoading ? (
              <div style={styles.loadingState}>Checking runtime capabilities...</div>
            ) : (
              <div
                style={{
                  ...styles.statusBadge,
                  ...(runtime.llm.available || runtime.psg.available
                    ? styles.statusBadgeAvailable
                    : styles.statusBadgeUnavailable)
                }}
              >
                <span>
                  {runtime.mode === 'cloud' ? 'Cloud mode' : 'Local mode'}
                </span>
                <span>
                  {runtime.mode === 'cloud'
                    ? 'Hosted capabilities available'
                    : 'BYO/local-first workflow'}
                </span>
              </div>
            )}
            <small style={styles.small}>
              Browser SaaS cannot read a local `.env`; local keys only work in self-hosted or local runtime flows.
            </small>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>AI Runtime</h3>
            <div style={styles.detailList}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Access mode</span>
                <span style={styles.detailValue}>{runtime.llm.accessMode}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Provider</span>
                <span style={styles.detailValue}>{status?.provider ?? 'Unavailable'}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Default model</span>
                <span style={styles.detailValue}>{status?.defaultModel ?? 'Unavailable'}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Mode</span>
                <span style={styles.detailValue}>{status?.mode ?? 'heuristic'}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Proxy routing</span>
                <span style={styles.detailValue}>
                  {runtime.llm.usesProxy ? 'Server-routed' : 'Local/offline'}
                </span>
              </div>
            </div>
            <small style={styles.small}>
              AI provider keys and routing are configured on the server, not in your browser.
            </small>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>AI Capabilities</h3>
            <div style={styles.capabilityList}>
              {(status?.capabilities ?? []).length > 0 ? (
                (status?.capabilities ?? []).map(capability => (
                  <span key={capability} style={styles.capabilityChip}>
                    {capability}
                  </span>
                ))
              ) : (
                <span style={styles.loadingState}>No live AI capabilities reported.</span>
              )}
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>PSG Runtime</h3>
            <div style={styles.detailList}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Access mode</span>
                <span style={styles.detailValue}>{runtime.psg.accessMode}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Available operations</span>
                <span style={styles.detailValue}>
                  {runtime.psg.operations.length > 0
                    ? runtime.psg.operations.join(', ')
                    : 'None reported'}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Export targets</span>
                <span style={styles.detailValue}>
                  {runtime.psg.exportTargets.length > 0
                    ? runtime.psg.exportTargets.join(', ')
                    : 'None reported'}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Included locally</span>
                <span style={styles.detailValue}>
                  {runtime.psg.localOperations.length > 0
                    ? runtime.psg.localOperations.join(', ')
                    : 'Unavailable'}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Hosted upgrade path</span>
                <span style={styles.detailValue}>
                  {runtime.psg.hostedUpgradeOperations.length > 0
                    ? runtime.psg.hostedUpgradeOperations.join(', ')
                    : 'No hosted-only PSG operations reported'}
                </span>
              </div>
            </div>
            <div style={styles.capabilityList}>
              {runtime.psg.supportedKinds.map(kind => (
                <span key={kind} style={styles.capabilityChip}>
                  {kind}
                </span>
              ))}
              {runtime.psg.exportTargets.map(target => (
                <span key={target} style={styles.capabilityChip}>
                  export:{target}
                </span>
              ))}
            </div>
            <div style={styles.routeRow}>
              <span
                style={{
                  ...styles.routeBadge,
                  ...(runtime.psg.localAvailable
                    ? styles.routeBadgeActive
                    : styles.routeBadgeMuted)
                }}
              >
                {runtime.psg.localAvailable
                  ? 'Local PSG available'
                  : 'Local PSG unavailable'}
              </span>
              <span
                style={{
                  ...styles.routeBadge,
                  ...(runtime.psg.cloudAvailable
                    ? styles.routeBadgeActive
                    : styles.routeBadgeMuted)
                }}
              >
                {runtime.psg.cloudAvailable
                  ? 'Hosted PSG available'
                  : 'Hosted PSG unavailable'}
              </span>
              <span
                style={{
                  ...styles.routeBadge,
                  ...(runtime.subscription.state === 'active'
                    ? styles.routeBadgeActive
                    : styles.routeBadgeMuted)
                }}
              >
                Subscription: {runtime.subscription.state}
              </span>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Usage Notes</h3>
            <div style={styles.costInfo}>
              <div style={styles.costItem}>
                <span>Local authoring</span>
                <span style={styles.costValue}>PSG files + BYO workflow</span>
              </div>
              <div style={styles.costItem}>
                <span>Hosted subscription path</span>
                <span style={styles.costValue}>Supabase + routed AI/PSG</span>
              </div>
              <div style={{ ...styles.costItem, marginBottom: 0 }}>
                <span>Comfy bridge</span>
                <span style={styles.costValue}>
                  {runtime.psg.exportTargets.includes('comfy')
                    ? 'Available'
                    : 'Unavailable'}
                </span>
              </div>
            </div>
            <div style={{ ...styles.noteCard, marginTop: 12 }}>
              <small style={{ ...styles.small, marginTop: 0 }}>
                Local users should still be able to validate, normalize, and
                export PSG documents. Hosted subscriptions should unlock
                higher-value workflow operations such as crowd expansion and
                future batch orchestration.
              </small>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.btnSecondary} onClick={onClose}>
            Close
          </button>
          <button
            style={styles.btnPrimary}
            onClick={() => {
              onSave?.(status);
              onClose();
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default LLMConfigDialog;
