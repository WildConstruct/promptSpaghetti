import React, { useEffect, useMemo, useState } from 'react';
import {
  ApiLocalImageClient,
  LOCAL_IMAGE_PINNED_CHECKPOINT,
  type LocalImageBatchResponse,
  type LocalImageRuntimeStatus
} from '@promptscape/core/services/localImage';
import type { DerivedSandboxRequest } from '../localSandboxPromptDerivation';

interface LocalSandboxGenerationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  runtimeStatus: LocalImageRuntimeStatus | null;
  derivedRequest: DerivedSandboxRequest;
  onCaptureBatch?: (result: LocalImageBatchResponse) => void;
  onOpenSceneAssets?: () => void;
}

export const LocalSandboxGenerationDialog: React.FC<
  LocalSandboxGenerationDialogProps
> = ({
  isOpen,
  onClose,
  runtimeStatus,
  derivedRequest,
  onCaptureBatch,
  onOpenSceneAssets
}) => {
  const [status, setStatus] = useState<LocalImageRuntimeStatus | null>(
    runtimeStatus
  );
  const [prompt, setPrompt] = useState(derivedRequest.prompt);
  const [negativePrompt, setNegativePrompt] = useState(
    derivedRequest.negativePrompt
  );
  const [count, setCount] = useState(String(derivedRequest.count));
  const [startSeed, setStartSeed] = useState(String(derivedRequest.startSeed));
  const [labelPrefix, setLabelPrefix] = useState(derivedRequest.labelPrefix);
  const [result, setResult] = useState<LocalImageBatchResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [hasCapturedBatch, setHasCapturedBatch] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStatus(runtimeStatus);
  }, [runtimeStatus]);

  useEffect(() => {
    if (!isOpen) {
      setResult(null);
      setError(null);
      setIsGenerating(false);
      setIsRefreshingStatus(false);
      setHasCapturedBatch(false);
      return;
    }

    setPrompt(derivedRequest.prompt);
    setNegativePrompt(derivedRequest.negativePrompt);
    setCount(String(derivedRequest.count));
    setStartSeed(String(derivedRequest.startSeed));
    setLabelPrefix(derivedRequest.labelPrefix);
    setResult(null);
    setError(null);
    setHasCapturedBatch(false);
  }, [derivedRequest, isOpen]);

  const availabilityLabel = useMemo(() => {
    if (status?.available) {
      return 'Local sandbox generation available';
    }

    return 'Local sandbox generation unavailable';
  }, [status?.available]);

  const readinessMessage = useMemo(() => {
    if (!status) {
      return 'Checking local sandbox runtime...';
    }

    if (status.available) {
      return 'Ready: the pinned Flux Schnell FP8 checkpoint and local Comfy runtime are available for graph-aware tree batches.';
    }

    if (status.reason) {
      return status.reason;
    }

    if (status.runtimeReachable === false) {
      return 'Local Comfy runtime is unreachable.';
    }

    if (status.checkpointStatus === 'mismatch') {
      return 'Pinned checkpoint mismatch: the local runtime is up, but the supported tree-demo checkpoint is not available.';
    }

    if (status.checkpointStatus === 'missing') {
      return 'Pinned checkpoint missing from the local Comfy runtime.';
    }

    return 'Local sandbox generation needs the supported runtime setup.';
  }, [status]);

  const derivationTone = useMemo(() => {
    switch (derivedRequest.status) {
      case 'ready':
        return styles.successNote;
      case 'partial':
        return styles.warning;
      default:
        return styles.note;
    }
  }, [derivedRequest.status]);

  const derivationMessage = useMemo(() => {
    if (derivedRequest.status === 'ready') {
      return `${derivedRequest.sourceLabel}: ${derivedRequest.sourceDescription}`;
    }

    if (derivedRequest.status === 'partial') {
      return `${derivedRequest.sourceLabel}: review the derived prompt before generating. ${derivedRequest.missingReasons.join(
        ' '
      )}`;
    }

    return `${derivedRequest.sourceLabel}: ${derivedRequest.sourceDescription}`;
  }, [derivedRequest]);

  if (!isOpen) {
    return null;
  }

  const canGenerate = Boolean(status?.available) && !isGenerating;
  const isCanonicalTreeDemo =
    derivedRequest.isCanonicalTreeFlow &&
    prompt.trim() === derivedRequest.prompt &&
    Number(count) === derivedRequest.count &&
    Number(startSeed || '0') === derivedRequest.startSeed;

  const seedsUsed = result?.items.map(item => item.seed).join(', ') || null;

  const handleRefreshStatus = async () => {
    setIsRefreshingStatus(true);
    setError(null);

    try {
      const client = new ApiLocalImageClient();
      const nextStatus = await client.getStatus();
      setStatus(nextStatus);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Failed to refresh local sandbox runtime status'
      );
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  const handleGenerate = async () => {
    if (!status?.available) {
      setError(
        status?.reason ||
          'Local sandbox generation requires a local Comfy-compatible runtime.'
      );
      return;
    }

    setIsGenerating(true);
    setError(null);
    setHasCapturedBatch(false);

    try {
      const client = new ApiLocalImageClient();
      const nextResult = await client.generateBatch({
        prompt,
        negativePrompt: negativePrompt.trim() || undefined,
        count: Number(count),
        startSeed: startSeed.trim() ? Number(startSeed) : undefined,
        labelPrefix: labelPrefix.trim() || undefined
      });
      setResult(nextResult);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Failed to generate local sandbox images'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCaptureBatch = () => {
    if (!result || !onCaptureBatch) {
      return;
    }

    onCaptureBatch(result);
    setHasCapturedBatch(true);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.dialog} onClick={event => event.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Local Sandbox Generation</h2>
            <p style={styles.subtitle}>
              Local Only. Requires a local Comfy/runtime and keeps outputs on
              this machine.
            </p>
          </div>
          <div style={styles.headerActions}>
            <button
              onClick={handleRefreshStatus}
              style={styles.secondaryButton}
              disabled={isRefreshingStatus}
            >
              {isRefreshingStatus ? 'Refreshing...' : 'Refresh readiness'}
            </button>
            <button onClick={onClose} style={styles.closeButton}>
              Close
            </button>
          </div>
        </div>

        <div style={styles.badgeRow}>
          <span
            style={{
              ...styles.badge,
              ...(status?.available ? styles.badgeGood : styles.badgeMuted)
            }}
          >
            {availabilityLabel}
          </span>
          <span style={{ ...styles.badge, ...styles.badgeMuted }}>
            Provider: {status?.provider || 'comfy-local'}
          </span>
          <span style={{ ...styles.badge, ...styles.badgeMuted }}>
            Demo target: 20 different trees
          </span>
          <span style={{ ...styles.badge, ...styles.badgeMuted }}>
            Graph source: {derivedRequest.sourceLabel}
          </span>
        </div>

        <div style={status?.available ? styles.note : styles.warning}>
          {readinessMessage}
        </div>

        <div style={derivationTone}>{derivationMessage}</div>

        <div style={styles.note}>
          This lane is a local demo capability, not a hosted MVP promise. Use it
          to generate a deterministic batch such as twenty related trees that
          share family DNA but vary by seed, then capture the results into PSG
          Scene Assets.
        </div>

        <div style={styles.metaCard}>
          <div>
            <strong>Pinned checkpoint</strong>
            <div style={styles.resultMeta}>
              {status?.checkpoint || LOCAL_IMAGE_PINNED_CHECKPOINT}
            </div>
          </div>
          <div>
            <strong>Checkpoint status</strong>
            <div style={styles.resultMeta}>
              {status?.checkpointStatus || 'unknown'}
            </div>
          </div>
          <div>
            <strong>Runtime reachable</strong>
            <div style={styles.resultMeta}>
              {typeof status?.runtimeReachable === 'boolean'
                ? String(status.runtimeReachable)
                : 'unknown'}
            </div>
          </div>
          <div>
            <strong>API URL</strong>
            <div style={styles.resultMeta}>
              {status?.apiUrl || 'not configured'}
            </div>
          </div>
        </div>

        <div style={styles.sourceCard}>
          <div style={styles.sourceSummary}>
            <div>
              <strong>Graph-derived family DNA</strong>
              <div style={styles.resultMeta}>
                {derivedRequest.basePrompt || 'No connected base prompt found.'}
              </div>
            </div>
            <div>
              <strong>Seed plan</strong>
              <div style={styles.resultMeta}>
                {derivedRequest.startSeed} through{' '}
                {derivedRequest.startSeed + derivedRequest.count - 1}
              </div>
            </div>
          </div>
          <div>
            <strong>Bounded variation axes</strong>
            {derivedRequest.variationSummaries.length > 0 ? (
              <ul style={styles.variationList}>
                {derivedRequest.variationSummaries.map(summary => (
                  <li key={summary} style={styles.variationItem}>
                    {summary}
                  </li>
                ))}
              </ul>
            ) : (
              <div style={styles.resultMeta}>
                The current graph does not expose variation axes yet, so the
                prompt field below is acting as a manual override.
              </div>
            )}
          </div>
        </div>

        <div style={styles.grid}>
          <label style={{ ...styles.field, gridColumn: '1 / -1' }}>
            <span>Final prompt</span>
            <textarea
              value={prompt}
              onChange={event => setPrompt(event.target.value)}
              style={styles.textarea}
            />
          </label>
          <label style={styles.field}>
            <span>Batch count</span>
            <input
              value={count}
              onChange={event => setCount(event.target.value)}
              style={styles.input}
            />
          </label>
          <label style={styles.field}>
            <span>Start seed</span>
            <input
              value={startSeed}
              onChange={event => setStartSeed(event.target.value)}
              style={styles.input}
            />
          </label>
          <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
            <span>Manual overrides</span>
            <div style={styles.resultMeta}>
              The graph-derived tree request is prefilled above. Adjust only if
              this graph needs a different local sandbox run.
            </div>
          </div>
          <label style={{ ...styles.field, gridColumn: '1 / -1' }}>
            <span>Negative prompt</span>
            <textarea
              value={negativePrompt}
              onChange={event => setNegativePrompt(event.target.value)}
              style={styles.textarea}
            />
          </label>
          <label style={{ ...styles.field, gridColumn: '1 / -1' }}>
            <span>Label prefix</span>
            <input
              value={labelPrefix}
              onChange={event => setLabelPrefix(event.target.value)}
              style={styles.input}
            />
          </label>
        </div>

        <div style={styles.meta}>
          <div>
            Seed progression is deterministic: each image increments from the
            chosen start seed.
          </div>
          <div>
            Output folder: {status?.outputDir || 'local runtime not configured'}
          </div>
          {status?.lastError && (
            <div>Last runtime error: {status.lastError}</div>
          )}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {result && (
          <div style={styles.resultsWrap}>
            <div style={styles.resultsSummary}>
              <strong>{result.count} local images generated</strong>
              <span>{result.outputDir}</span>
              <span style={styles.resultMeta}>
                Manifest: {result.manifestPath}
              </span>
              {seedsUsed && (
                <span style={styles.resultMeta}>Seeds: {seedsUsed}</span>
              )}
            </div>
            {hasCapturedBatch && (
              <div style={styles.successNote}>
                Captured this run into the PSG Scene Assets sidecar draft. You
                can keep generating locally, then review or export the batch
                through the existing scene-assets flow.
              </div>
            )}
            <div style={styles.resultsActions}>
              {onCaptureBatch && (
                <button
                  onClick={handleCaptureBatch}
                  style={styles.secondaryButton}
                  disabled={hasCapturedBatch}
                >
                  {hasCapturedBatch
                    ? 'Captured To Scene Assets'
                    : 'Capture To Scene Assets'}
                </button>
              )}
              {onOpenSceneAssets && (
                <button
                  onClick={onOpenSceneAssets}
                  style={styles.secondaryButton}
                >
                  Open Scene Assets
                </button>
              )}
            </div>
            <div style={styles.resultsGrid}>
              {result.items.map(item => (
                <div key={item.filename} style={styles.resultCard}>
                  <img
                    src={item.downloadUrl}
                    alt={`Generated sandbox result ${item.index + 1}`}
                    style={styles.preview}
                  />
                  <strong>
                    #{item.index + 1} seed {item.seed}
                  </strong>
                  <div style={styles.resultMeta}>{item.filename}</div>
                  <div style={styles.resultMeta}>{item.outputPath}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.secondaryButton}>
            Close
          </button>
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            style={styles.primaryButton}
          >
            {isGenerating
              ? 'Generating...'
              : isCanonicalTreeDemo
                ? 'Generate 20 Trees'
                : 'Generate Local Batch'}
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
    background: 'rgba(10, 12, 16, 0.68)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1450,
    padding: '24px'
  },
  dialog: {
    width: 'min(980px, 100%)',
    maxHeight: '90vh',
    overflow: 'auto',
    background: '#fcfaf5',
    borderRadius: '22px',
    padding: '22px',
    boxShadow: '0 28px 80px rgba(0, 0, 0, 0.32)',
    display: 'grid',
    gap: '16px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px'
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start'
  },
  title: { margin: 0 },
  subtitle: { margin: '8px 0 0', color: '#6b7280' },
  closeButton: {
    border: '1px solid #d6d3d1',
    background: '#fff',
    borderRadius: '999px',
    padding: '10px 16px',
    cursor: 'pointer'
  },
  badgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  badge: {
    borderRadius: '999px',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: 700
  },
  badgeGood: {
    background: '#dcfce7',
    color: '#166534'
  },
  badgeMuted: {
    background: '#e5e7eb',
    color: '#4b5563'
  },
  note: {
    background: '#eef6ff',
    color: '#25425f',
    borderRadius: '14px',
    padding: '14px'
  },
  successNote: {
    background: '#ecfdf3',
    color: '#166534',
    borderRadius: '14px',
    padding: '14px'
  },
  warning: {
    background: '#fff7ed',
    color: '#9a3412',
    borderRadius: '14px',
    padding: '14px'
  },
  sourceCard: {
    display: 'grid',
    gap: '12px',
    background: '#fff',
    border: '1px solid #e7e5e4',
    borderRadius: '14px',
    padding: '14px'
  },
  sourceSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px'
  },
  variationList: {
    margin: '8px 0 0',
    paddingLeft: '18px',
    display: 'grid',
    gap: '6px'
  },
  variationItem: {
    color: '#374151'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  field: {
    display: 'grid',
    gap: '6px'
  },
  metaCard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    background: '#fff',
    border: '1px solid #e7e5e4',
    borderRadius: '14px',
    padding: '14px'
  },
  input: {
    border: '1px solid #d6d3d1',
    borderRadius: '12px',
    padding: '10px 12px'
  },
  textarea: {
    minHeight: '88px',
    border: '1px solid #d6d3d1',
    borderRadius: '12px',
    padding: '10px 12px'
  },
  meta: {
    display: 'grid',
    gap: '6px',
    color: '#4b5563',
    fontSize: '0.92rem'
  },
  error: {
    background: '#fff1f2',
    color: '#9f1239',
    borderRadius: '12px',
    padding: '12px'
  },
  resultsWrap: {
    display: 'grid',
    gap: '12px'
  },
  resultsSummary: {
    display: 'grid',
    gap: '4px',
    color: '#374151'
  },
  resultsActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px'
  },
  resultCard: {
    background: '#fff',
    border: '1px solid #e7e5e4',
    borderRadius: '14px',
    padding: '12px',
    display: 'grid',
    gap: '8px'
  },
  preview: {
    width: '100%',
    aspectRatio: '1 / 1',
    objectFit: 'cover',
    borderRadius: '10px',
    background: '#e5e7eb'
  },
  resultMeta: {
    color: '#6b7280',
    fontSize: '0.82rem',
    wordBreak: 'break-word'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },
  secondaryButton: {
    border: '1px solid #d6d3d1',
    background: '#fff',
    borderRadius: '999px',
    padding: '10px 16px',
    cursor: 'pointer'
  },
  primaryButton: {
    border: 0,
    background: '#1d4ed8',
    color: '#fff',
    borderRadius: '999px',
    padding: '10px 16px',
    cursor: 'pointer'
  }
};

export default LocalSandboxGenerationDialog;
