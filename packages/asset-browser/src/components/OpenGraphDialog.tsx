import React from 'react';
import { deriveEnableSupabaseProp } from '@promptscape/core/utils/supabaseFeature';
import { useUserId } from '../user/UserProvider';
import {
  loadServerGraphs,
  type GraphEntry
} from '../services/GraphManifestLoader';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';

export type OpenGraphDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenGraph: (graph: unknown) => void; // Graph type unknown until codec is integrated
  userId?: string; // For Supabase tab gating (Story 1.12)
  enableSupabase?: boolean; // When true and helpers provided, show Supabase tab
  supabaseList?: (
    userId: string
  ) => Promise<
    | { ok: true; data: { name: string }[] }
    | { ok: false; error: { message: string } }
  >;
  supabaseGet?: (
    userId: string,
    name: string
  ) => Promise<
    { ok: true; data: string } | { ok: false; error: { message: string } }
  >;
};

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download graph (${res.status})`);
  return res.json();
}

function Spinner() {
  return (
    <span aria-label="loading" role="status">
      Loading…
    </span>
  );
}

export function OpenGraphDialog({
  isOpen,
  onClose,
  onOpenGraph,
  userId,
  enableSupabase,
  supabaseList,
  supabaseGet
}: OpenGraphDialogProps): JSX.Element | null {
  const [tab, setTab] = React.useState<'server' | 'local' | 'supabase'>(
    'server'
  );
  const { userId: ctxUserId } = useUserId();
  const effectiveUserId = userId ?? ctxUserId ?? null;
  const supabaseEnabled = enableSupabase ?? deriveEnableSupabaseProp();
  const showSupabase =
    !!effectiveUserId && !!supabaseList && !!supabaseGet && supabaseEnabled;

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Open Graph"
      style={styles.backdrop}
    >
      <div style={styles.dialog}>
        <header style={styles.header}>
          <h2 style={{ margin: 0 }}>Open</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Open Dialog"
          >
            ✕
          </button>
        </header>
        <nav aria-label="Open Tabs" style={styles.tabs}>
          <button
            type="button"
            aria-selected={tab === 'server'}
            onClick={() => setTab('server')}
          >
            Server
          </button>
          {showSupabase && (
            <button
              type="button"
              aria-selected={tab === 'supabase'}
              onClick={() => setTab('supabase')}
            >
              Supabase
            </button>
          )}
          <button
            type="button"
            aria-selected={tab === 'local'}
            onClick={() => setTab('local')}
          >
            Local
          </button>
        </nav>
        <section style={{ padding: 12 }}>
          {tab === 'server' ? (
            <ServerPane onOpenGraph={onOpenGraph} />
          ) : tab === 'local' ? (
            <LocalPane onOpenGraph={onOpenGraph} />
          ) : // tab === 'supabase'
          showSupabase ? (
            <SupabasePane
              userId={effectiveUserId!}
              onOpenGraph={onOpenGraph}
              listFn={supabaseList!}
              getFn={supabaseGet!}
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}

function SupabasePane({
  userId,
  onOpenGraph,
  listFn,
  getFn
}: {
  userId: string;
  onOpenGraph: (g: unknown) => void;
  listFn: (
    u: string
  ) => Promise<
    | { ok: true; data: { name: string }[] }
    | { ok: false; error: { message: string } }
  >;
  getFn: (
    u: string,
    name: string
  ) => Promise<
    { ok: true; data: string } | { ok: false; error: { message: string } }
  >;
}) {
  const [status, setStatus] = React.useState<
    'idle' | 'loading' | 'done' | 'error'
  >('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<{ name: string }[]>([]);
  const [opening, setOpening] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<number>(0);

  const load = React.useCallback(async () => {
    setStatus('loading');
    setError(null);
    const res = await listFn(userId);
    if (!res.ok) {
      setError(res.error.message || 'Failed to list graphs');
      setStatus('error');
      return;
    }
    setItems(res.data);
    setSelected(0);
    setStatus('done');
  }, [userId, listFn]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function handleOpen(name: string) {
    setOpening(name);
    const res = await getFn(userId, name);
    if (!res.ok) {
      setError(res.error.message || 'Failed to open graph');
      setOpening(null);
      return;
    }
    try {
      const json = JSON.parse(res.data);
      onOpenGraph(json);
    } catch {
      setError('Invalid graph JSON');
    } finally {
      setOpening(null);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    if (items.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(i => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const g = items[selected];
      if (g) void handleOpen(g.name);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="button" onClick={load} disabled={status === 'loading'}>
          {status === 'loading' ? 'Loading…' : 'Retry'}
        </button>
        {status === 'loading' && <Spinner />}
      </div>
      {error && <ErrorState message={error} onRetry={load} />}
      {status === 'done' && items.length === 0 && (
        <EmptyState message="No Supabase graphs available." />
      )}
      {status === 'done' && items.length > 0 && (
        <ul
          aria-label="Supabase Graphs"
          role="listbox"
          tabIndex={0}
          onKeyDown={onKeyDown}
          style={{ marginTop: 8, outline: 'none' }}
        >
          {items.map((g, idx) => (
            <li
              key={g.name}
              role="option"
              aria-selected={selected === idx}
              style={{
                background: selected === idx ? '#eef' : undefined,
                padding: 6,
                borderRadius: 4
              }}
              onMouseEnter={() => setSelected(idx)}
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <strong>{g.name}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpen(g.name)}
                  disabled={!!opening}
                >
                  {opening === g.name ? 'Opening…' : 'Open'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ServerPane({ onOpenGraph }: { onOpenGraph: (g: unknown) => void }) {
  const [status, setStatus] = React.useState<
    'idle' | 'loading' | 'done' | 'error'
  >('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [graphs, setGraphs] = React.useState<GraphEntry[]>([]);
  const [opening, setOpening] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<number>(0);

  const load = React.useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const list = await loadServerGraphs('');
      setGraphs(list);
      setStatus('done');
      setSelected(0);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to load graph manifest';
      if (/404/.test(String(msg))) {
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

  async function handleOpen(filename: string) {
    setOpening(filename);
    try {
      const data = await fetchJson(`/graphs/${filename}`);
      // Placeholder for codec: pass raw JSON through for now
      onOpenGraph(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to open graph';
      setError(msg);
    } finally {
      setOpening(null);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    if (graphs.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(i => Math.min(i + 1, graphs.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const g = graphs[selected];
      if (g) void handleOpen(g.filename);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="button" onClick={load} disabled={status === 'loading'}>
          {status === 'loading' ? 'Loading…' : 'Retry'}
        </button>
        {status === 'loading' && <Spinner />}
      </div>
      {error && <ErrorState message={error} onRetry={load} />}
      {status === 'done' && graphs.length === 0 && (
        <EmptyState message="No server graphs available." />
      )}
      {status === 'done' && graphs.length > 0 && (
        <ul
          aria-label="Server Graphs"
          role="listbox"
          tabIndex={0}
          onKeyDown={onKeyDown}
          style={{ marginTop: 8, outline: 'none' }}
        >
          {graphs.map((g, idx) => (
            <li
              key={g.filename}
              role="option"
              aria-selected={selected === idx}
              style={{
                background: selected === idx ? '#eef' : undefined,
                padding: 6,
                borderRadius: 4
              }}
              onMouseEnter={() => setSelected(idx)}
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <strong>{g.title}</strong>
                  <div style={{ fontSize: 12, color: '#555' }}>
                    {g.filename} • {new Date(g.updatedAt).toLocaleString()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpen(g.filename)}
                  disabled={!!opening}
                >
                  {opening === g.filename ? 'Opening…' : 'Open'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LocalPane({ onOpenGraph }: { onOpenGraph: (g: unknown) => void }) {
  const [error, setError] = React.useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    const reader = new FileReader();
    reader.onerror = () => setError('Failed to read file');
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        const json = JSON.parse(text);
        if (name.endsWith('.graph.json')) {
          // Placeholder migration until fromLegacyGraph is available
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const migrated = json; // fromLegacyGraph(json)
          onOpenGraph(migrated);
        } else if (name.endsWith('.psg')) {
          // Placeholder codec read until available
          onOpenGraph(json);
        } else {
          setError('Unsupported file type');
        }
      } catch {
        setError('Invalid file');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div>
      <label>
        <span style={{ display: 'block', marginBottom: 4 }}>
          Choose a .psg or .graph.json file
        </span>
        <input
          aria-label="Local Graph File"
          type="file"
          accept=".psg,.graph.json,application/json"
          onChange={onChange}
        />
      </label>
      {error && <ErrorState message={error} />}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dialog: {
    background: '#fff',
    width: 560,
    maxWidth: '95vw',
    borderRadius: 8,
    boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: 12,
    borderBottom: '1px solid #eee'
  },
  tabs: { display: 'flex', gap: 8, borderBottom: '1px solid #eee', padding: 8 }
};
