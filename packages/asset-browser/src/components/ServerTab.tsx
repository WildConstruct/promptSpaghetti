import React from 'react';
import {
  loadServerGraphs,
  type GraphEntry
} from '../services/GraphManifestLoader';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';
import { retryWithBackoff } from '../utils/retry';

function formatGraphEntryMeta(graph: GraphEntry): string {
  if (!graph.updatedAt) {
    return graph.filename;
  }

  return `${graph.filename} • ${new Date(graph.updatedAt).toLocaleString()}`;
}

export function ServerTab(): JSX.Element {
  const [status, setStatus] = React.useState<
    'idle' | 'loading' | 'done' | 'error'
  >('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [missing, setMissing] = React.useState<boolean>(false);
  const [graphs, setGraphs] = React.useState<GraphEntry[]>([]);

  const load = React.useCallback(async () => {
    setStatus('loading');
    setError(null);
    setMissing(false);
    try {
      const list = await loadServerGraphs('');
      setGraphs(list);
      setStatus('done');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : String(err ?? 'Failed to load graph manifest');
      // Treat 404 as Empty state with guidance (Story 1.15 A1)
      if (typeof msg === 'string' && /404/.test(msg)) {
        setMissing(true);
        setGraphs([]);
        setStatus('done');
      } else {
        setError(msg);
        setStatus('error');
      }
    }
  }, []);

  const onRetry = React.useCallback(async () => {
    setStatus('loading');
    setError(null);
    setMissing(false);
    try {
      const list = await retryWithBackoff(() => loadServerGraphs(''), {
        retries: 2,
        isRetryable: err => {
          const msg = err instanceof Error ? err.message : String(err ?? '');
          // avoid retrying on 404 which is mapped to Empty state guidance
          return !/404/.test(msg);
        }
      });
      setGraphs(list);
      setStatus('done');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : String(err ?? 'Failed to load graph manifest');
      if (/404/.test(msg)) {
        setMissing(true);
        setGraphs([]);
        setStatus('done');
      } else {
        setError(msg);
        setStatus('error');
      }
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <section aria-label="Server PSG Assets" style={{ padding: 12 }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h2 style={{ margin: 0 }}>Server</h2>
        <button type="button" onClick={onRetry} disabled={status === 'loading'}>
          {status === 'loading' ? 'Loading…' : 'Retry'}
        </button>
      </header>
      {status === 'error' && (
        <ErrorState
          message={error || 'Failed to load graph manifest'}
          onRetry={onRetry}
        />
      )}
      {status === 'done' && graphs.length === 0 ? (
        <EmptyState
          title={missing ? 'No server manifest found' : 'No server .psg assets'}
          message={
            missing
              ? 'No server asset manifest is available in this build.'
              : 'No server .psg assets are currently available.'
          }
          helpUrl={undefined}
          actionLabel={missing ? 'Retry' : undefined}
          onAction={missing ? onRetry : undefined}
        />
      ) : null}
      {status === 'done' && graphs.length > 0 && (
        <ul aria-label="Server PSG Asset List" style={{ marginTop: 8 }}>
          {graphs.map(g => (
            <li key={g.filename}>
              <strong>{g.title}</strong>
              <div style={{ fontSize: 12, color: '#555' }}>
                {formatGraphEntryMeta(g)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
