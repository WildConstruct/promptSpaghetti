import React from 'react';
import { exportGraphToPSG } from '@promptscape/core';
import { deriveEnableSupabaseProp } from '@promptscape/core/utils/supabaseFeature';
import { useUserId } from '../user/UserProvider';

export type SaveGraphDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  graph: unknown; // replace with concrete graph type when codec available
  // Optional test hook: receive the blob and filename that would be saved
  onSaveBlob?: (blob: Blob, filename: string) => void;
  // Supabase save (gated)
  userId?: string;
  enableSupabase?: boolean;
  supabasePut?: (
    userId: string,
    name: string,
    content: string
  ) => Promise<
    | { ok: true; data: { path: string } }
    | { ok: false; error: { message: string } }
  >;
  // Callback to let parent refresh the Open dialog Supabase tab, etc.
  onSupabaseSaved?: (name: string, path?: string) => void;
};

function Spinner() {
  return (
    <span aria-label="saving" role="status">
      Saving…
    </span>
  );
}

const DEFAULT_NAME = 'graph';

function sanitizeBase(name: string): string {
  const trimmed = name.trim();
  // allow letters, numbers, dash, underscore, dot, and spaces turned to dashes
  const replaced = trimmed.replace(/\s+/g, '-');
  return replaced.replace(/[^a-zA-Z0-9._-]/g, '');
}

function ensurePsg(name: string): string {
  return name.toLowerCase().endsWith('.psg') ? name : `${name}.psg`;
}

function looksLikeGraphBatch(
  graph: unknown
): graph is { nodes: unknown[]; edges: unknown[] } {
  return Boolean(
    graph &&
      typeof graph === 'object' &&
      Array.isArray((graph as { nodes?: unknown[] }).nodes) &&
      Array.isArray((graph as { edges?: unknown[] }).edges)
  );
}

function toPsgText(graph: unknown, filename: string): string {
  if (!looksLikeGraphBatch(graph)) {
    throw new Error('This graph cannot be exported as a .psg file');
  }

  const baseName = filename.replace(/\.psg$/i, '') || DEFAULT_NAME;
  const psg = exportGraphToPSG(graph.nodes as any[], graph.edges as any[], {
    name: baseName
  });
  return JSON.stringify(psg, null, 2);
}

export function SaveGraphDialog({
  isOpen,
  onClose,
  graph,
  onSaveBlob,
  enableSupabase,
  userId,
  supabasePut,
  onSupabaseSaved
}: SaveGraphDialogProps): JSX.Element | null {
  const { userId: ctxUserId } = useUserId();
  const [name, setName] = React.useState<string>(DEFAULT_NAME);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [savingSupabase, setSavingSupabase] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setName(DEFAULT_NAME);
      setError(null);
      setSaving(false);
      setSavingSupabase(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const base = sanitizeBase(name);
  // Enforce max 64 chars before extension per Story 1.13
  const base64 = base.slice(0, 64);
  const finalName = ensurePsg(base64 || DEFAULT_NAME);
  const isValid =
    Boolean(base64) && !base64.startsWith('.') && !base64.endsWith('.');
  const canExportPsg = looksLikeGraphBatch(graph);
  const effectiveUserId = userId ?? ctxUserId ?? null;
  const supabaseEnabled = enableSupabase ?? deriveEnableSupabaseProp();
  const canSaveToSupabase = Boolean(
    supabaseEnabled && effectiveUserId && supabasePut
  );

  async function handleSaveSupabase() {
    if (!isValid || !canSaveToSupabase || !canExportPsg) {
      setError(
        canExportPsg
          ? 'Please enter a valid name'
          : 'This graph cannot be exported as a .psg file'
      );
      return;
    }

    setSavingSupabase(true);
    setError(null);
    try {
      const json = toPsgText(graph, finalName);
      const res = await supabasePut!(effectiveUserId!, finalName, json);
      if (res.ok) {
        onSupabaseSaved?.(finalName, res.data.path);
        onClose();
      } else {
        setError(`Failed to upload: ${res.error.message}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      setError(`Failed to upload: ${msg}`);
    } finally {
      setSavingSupabase(false);
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
    setError(null);
  }

  async function handleSave() {
    if (!isValid || !canExportPsg) {
      setError(
        canExportPsg
          ? 'Please enter a valid name'
          : 'This graph cannot be exported as a .psg file'
      );
      return;
    }
    setSaving(true);
    try {
      const json = toPsgText(graph, finalName);
      const blob = new Blob([json], {
        type: 'application/x-promptspaghetti-graph'
      });

      onSaveBlob?.(blob, finalName);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = finalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      onClose();
    } catch {
      setError('Failed to save file');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Save Graph"
      style={styles.backdrop}
    >
      <div style={styles.dialog}>
        <header style={styles.header}>
          <h2 style={{ margin: 0 }}>Save</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Save Dialog"
          >
            ✕
          </button>
        </header>
        <section style={{ padding: 12, display: 'grid', gap: 8 }}>
          <label style={{ display: 'grid', gap: 4 }}>
            <span>File name</span>
            <input
              aria-label="File name"
              type="text"
              value={name}
              onChange={onChange}
              placeholder="graph"
            />
            <div aria-live="polite" style={{ fontSize: 12, color: '#555' }}>
              Will save as: <code>{finalName}</code>
            </div>
            <div style={{ fontSize: 12, color: '#555' }}>
              Exports the current graph as a flat <code>.psg</code> file using
              the current MVP contract.
            </div>
            {!canExportPsg && (
              <div
                role="status"
                aria-live="polite"
                style={{ fontSize: 12, color: '#b00' }}
              >
                Only node/edge graph batches can be exported from this dialog.
              </div>
            )}
          </label>
          {error && (
            <div role="alert" aria-live="assertive" style={{ color: '#b00' }}>
              {error}
            </div>
          )}
        </section>
        <footer style={styles.footer}>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!isValid || saving || !canExportPsg}
            onClick={handleSave}
          >
            {saving ? <Spinner /> : 'Save'}
          </button>
          {canSaveToSupabase && (
            <button
              type="button"
              aria-label="Save to Supabase"
              disabled={savingSupabase || !canExportPsg}
              onClick={handleSaveSupabase}
            >
              {savingSupabase ? <Spinner /> : 'Save .psg to Supabase'}
            </button>
          )}
        </footer>
      </div>
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
    width: 520,
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
  footer: {
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end',
    padding: 12,
    borderTop: '1px solid #eee'
  }
};
