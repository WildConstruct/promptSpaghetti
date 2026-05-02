import React, { useEffect, useMemo, useState } from 'react';
import type { Edge, Node } from 'reactflow';
import type { PsgComfyWorkflow } from '@promptscape/core/services/psg';

type BuildComfyBridge = (
  nodes: Node[],
  edges: Edge[],
  options?: {
    name?: string;
    description?: string;
    tags?: string[];
  }
) => Promise<{ workflow: PsgComfyWorkflow }>;

interface ComfyExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (workflow: PsgComfyWorkflow, filenameBase?: string) => void;
  buildComfyBridge: BuildComfyBridge;
  currentNodes: Node[];
  currentEdges: Edge[];
  runtimeMode: 'local' | 'cloud';
  psgAccessMode: 'offline' | 'local' | 'cloud';
  subscriptionState: 'unknown' | 'inactive' | 'active';
  psgCloudAvailable: boolean;
  psgLocalAvailable: boolean;
  localOperations: string[];
  hostedUpgradeOperations: string[];
  sceneAssetSummary?: {
    totalAssets: number;
    derivedAssets: number;
    placements: number;
    crowdMembers: number;
  };
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(10, 12, 16, 0.68)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '24px'
  },
  dialog: {
    width: 'min(920px, 100%)',
    maxHeight: '90vh',
    overflow: 'auto' as const,
    borderRadius: '16px',
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(246,248,251,0.98) 100%)',
    boxShadow: '0 28px 80px rgba(0, 0, 0, 0.32)',
    border: '1px solid rgba(148, 163, 184, 0.28)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb'
  },
  titleWrap: {
    display: 'grid',
    gap: '4px'
  },
  title: {
    margin: 0,
    fontSize: '22px',
    color: '#111827'
  },
  subtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#6b7280'
  },
  closeButton: {
    border: 'none',
    background: 'transparent',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280'
  },
  body: {
    padding: '24px',
    display: 'grid',
    gap: '20px'
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px'
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '14px'
  },
  cardLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '6px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em'
  },
  cardValue: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#111827'
  },
  chipRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const
  },
  chip: {
    padding: '6px 10px',
    borderRadius: '999px',
    background: '#e0f2fe',
    color: '#075985',
    fontSize: '12px',
    fontWeight: 700
  },
  panel: {
    background: '#0f172a',
    color: '#e5eefb',
    borderRadius: '14px',
    padding: '16px',
    overflow: 'auto' as const
  },
  code: {
    margin: 0,
    fontSize: '12px',
    lineHeight: 1.55,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    fontFamily:
      '"SFMono-Regular", "SF Mono", ui-monospace, Menlo, Consolas, monospace'
  },
  note: {
    padding: '14px',
    borderRadius: '12px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#475569',
    fontSize: '13px',
    lineHeight: 1.5
  },
  routeBadgeRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const
  },
  routeBadge: {
    padding: '8px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 700
  },
  routeBadgeActive: {
    background: '#dcfce7',
    color: '#166534'
  },
  routeBadgeMuted: {
    background: '#e5e7eb',
    color: '#4b5563'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '20px 24px',
    borderTop: '1px solid #e5e7eb'
  },
  secondaryButton: {
    padding: '10px 16px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#111827',
    cursor: 'pointer',
    fontWeight: 600
  },
  primaryButton: {
    padding: '10px 16px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 700
  },
  loading: {
    fontSize: '14px',
    color: '#475569'
  },
  error: {
    padding: '12px 14px',
    borderRadius: '12px',
    background: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    fontSize: '13px'
  }
};

export const ComfyExportDialog: React.FC<ComfyExportDialogProps> = ({
  isOpen,
  onClose,
  onDownload,
  buildComfyBridge,
  currentNodes,
  currentEdges,
  runtimeMode,
  psgAccessMode,
  subscriptionState,
  psgCloudAvailable,
  psgLocalAvailable,
  localOperations,
  hostedUpgradeOperations,
  sceneAssetSummary
}) => {
  const [workflow, setWorkflow] = useState<PsgComfyWorkflow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setWorkflow(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    buildComfyBridge(currentNodes, currentEdges, {
      name: 'Prompt Spaghetti Graph'
    })
      .then(result => {
        if (!cancelled) {
          setWorkflow(result.workflow);
          setIsLoading(false);
        }
      })
      .catch(nextError => {
        if (!cancelled) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : 'Failed to generate Comfy bridge preview'
          );
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [buildComfyBridge, currentEdges, currentNodes, isOpen]);

  const previewJson = useMemo(
    () => (workflow ? JSON.stringify(workflow, null, 2) : ''),
    [workflow]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.dialog} onClick={event => event.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.titleWrap}>
            <h2 style={styles.title}>Export Comfy Bridge</h2>
            <p style={styles.subtitle}>
              Review the generated bridge payload before downloading it.
            </p>
          </div>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.body}>
          <div style={styles.cards}>
            <div style={styles.card}>
              <span style={styles.cardLabel}>Runtime Mode</span>
              <span style={styles.cardValue}>{runtimeMode}</span>
            </div>
            <div style={styles.card}>
              <span style={styles.cardLabel}>PSG Access</span>
              <span style={styles.cardValue}>{psgAccessMode}</span>
            </div>
            <div style={styles.card}>
              <span style={styles.cardLabel}>Graph Size</span>
              <span style={styles.cardValue}>
                {currentNodes.length} nodes, {currentEdges.length} edges
              </span>
            </div>
            <div style={styles.card}>
              <span style={styles.cardLabel}>Export Target</span>
              <span style={styles.cardValue}>Comfy bridge JSON</span>
            </div>
            <div style={styles.card}>
              <span style={styles.cardLabel}>Scene Assets</span>
              <span style={styles.cardValue}>
                {sceneAssetSummary
                  ? `${sceneAssetSummary.totalAssets} assets`
                  : 'No scene assets attached'}
              </span>
            </div>
            <div style={styles.card}>
              <span style={styles.cardLabel}>Lineage / Placement</span>
              <span style={styles.cardValue}>
                {sceneAssetSummary
                  ? `${sceneAssetSummary.derivedAssets} derived, ${sceneAssetSummary.placements} placements`
                  : '0 derived, 0 placements'}
              </span>
            </div>
            <div style={styles.card}>
              <span style={styles.cardLabel}>Crowd Members</span>
              <span style={styles.cardValue}>
                {sceneAssetSummary
                  ? `${sceneAssetSummary.crowdMembers} members`
                  : '0 members'}
              </span>
            </div>
          </div>

          <div style={styles.routeBadgeRow}>
            <span
              style={{
                ...styles.routeBadge,
                ...(psgLocalAvailable
                  ? styles.routeBadgeActive
                  : styles.routeBadgeMuted)
              }}
            >
              {psgLocalAvailable
                ? 'Local PSG export ready'
                : 'Local PSG export unavailable'}
            </span>
            <span
              style={{
                ...styles.routeBadge,
                ...(psgCloudAvailable
                  ? styles.routeBadgeActive
                  : styles.routeBadgeMuted)
              }}
            >
              {psgCloudAvailable
                ? 'Hosted PSG helpers ready'
                : 'Hosted PSG helpers unavailable'}
            </span>
            <span
              style={{
                ...styles.routeBadge,
                ...(subscriptionState === 'active'
                  ? styles.routeBadgeActive
                  : styles.routeBadgeMuted)
              }}
            >
              Subscription: {subscriptionState}
            </span>
          </div>

          <div style={styles.note}>
            {psgAccessMode === 'cloud'
              ? 'This Comfy bridge is being generated through the hosted PSG helper path.'
              : psgAccessMode === 'local'
                ? 'This Comfy bridge is being generated from local PSG data. Hosted PSG remains optional for upgrade-only helpers like crowd expansion.'
                : 'Comfy bridge export is unavailable in this runtime mode. Base PSG authoring/export should remain the portable default.'}{' '}
            This bridge format is intentionally stable and inspectable, not a
            claim of full Comfy node parity.
          </div>

          {sceneAssetSummary && sceneAssetSummary.totalAssets > 0 && (
            <div style={styles.note}>
              This export includes PSG sidecar context: {sceneAssetSummary.totalAssets}{' '}
              asset refs, {sceneAssetSummary.derivedAssets} derived assets, and{' '}
              {sceneAssetSummary.placements} scene placements. Crowd expansion
              state currently tracks {sceneAssetSummary.crowdMembers} structured
              members in the same sidecar lane. The base `.psg` remains flat;
              this metadata rides alongside the bridge/export layer.
            </div>
          )}

          <div style={styles.cards}>
            <div style={styles.card}>
              <span style={styles.cardLabel}>Local PSG Operations</span>
              <span style={styles.cardValue}>
                {localOperations.length > 0
                  ? localOperations.join(', ')
                  : 'No local PSG operations'}
              </span>
            </div>
            <div style={styles.card}>
              <span style={styles.cardLabel}>Hosted PSG Helpers</span>
              <span style={styles.cardValue}>
                {hostedUpgradeOperations.length > 0
                  ? hostedUpgradeOperations.join(', ')
                  : 'No hosted-only PSG operations'}
              </span>
            </div>
          </div>

          {workflow && (
            <div style={styles.chipRow}>
              <span style={styles.chip}>{workflow.metadata.sourceKind}</span>
              {workflow.outputNodeIds.map(outputId => (
                <span key={outputId} style={styles.chip}>
                  output:{outputId}
                </span>
              ))}
            </div>
          )}

          {isLoading && (
            <div style={styles.loading}>Generating Comfy bridge preview...</div>
          )}

          {error && <div style={styles.error}>{error}</div>}

          {workflow && (
            <div style={styles.panel}>
              <pre style={styles.code}>{previewJson}</pre>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <button style={styles.secondaryButton} onClick={onClose}>
            Close
          </button>
          <button
            style={styles.primaryButton}
            disabled={!workflow || isLoading || psgAccessMode === 'offline'}
            onClick={() => {
              if (workflow) {
                onDownload(workflow, workflow.metadata.name);
                onClose();
              }
            }}
          >
            {psgAccessMode === 'offline' ? 'Unavailable' : 'Download JSON'}
          </button>
        </div>
      </div>
    </div>
  );
};
