import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

// Step identifiers for boot milestones
export type BootStepId = 'supabase' | 'presets' | 'graphs';

export type BootStep = {
  id: BootStepId;
  label: string;
  status: 'pending' | 'in-progress' | 'done' | 'error';
  error?: string;
};

export type BootResults = {
  presets?: unknown;
  graphs?: unknown;
};

export type BootProgressState = {
  steps: BootStep[];
  total: number;
  completed: number;
  percent: number; // 0..1
  results: BootResults;
  complete: boolean;
  start: () => void;
};

const BootProgressContext = createContext<BootProgressState | undefined>(
  undefined
);

function useIsMounted() {
  const ref = useRef(true);
  useEffect(() => {
    ref.current = true;
    return () => {
      ref.current = false;
    };
  }, []);
  return ref;
}

async function fetchFirstJson(urls: string[]): Promise<unknown> {
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      // try next
    }
  }
  throw new Error('All sources failed');
}

export const BootProgressProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [steps, setSteps] = useState<BootStep[]>([
    {
      id: 'supabase',
      label: 'Checking Supabase configuration',
      status: 'pending'
    },
    { id: 'presets', label: 'Loading preset manifest', status: 'pending' },
    { id: 'graphs', label: 'Loading graph manifest', status: 'pending' }
  ]);
  const [results, setResults] = useState<BootResults>({});
  const [started, setStarted] = useState(false);
  const isMounted = useIsMounted();

  const updateStep = useCallback((id: BootStepId, patch: Partial<BootStep>) => {
    setSteps(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const run = useCallback(async () => {
    // Supabase: determine if enabled and lazily init client if so
    try {
      updateStep('supabase', { status: 'in-progress' });
      const core = await import('@promptscape/core');
      const cfg =
        typeof core.getSupabaseConfig === 'function'
          ? core.getSupabaseConfig()
          : { enabled: false };
      if ((cfg as { enabled?: boolean }).enabled) {
        // Ensure client is initialized (side effect on import)
        await import('@promptscape/core');
        // Access exported supabase to ensure tree-shake doesn't drop side-effect
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        (core as Record<string, unknown>)['supabase'];
      }
      updateStep('supabase', { status: 'done' });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      updateStep('supabase', { status: 'error', error: msg });
    }

    // Presets manifest
    try {
      updateStep('presets', { status: 'in-progress' });
      const presets = await fetchFirstJson([
        // Try likely paths used elsewhere in the app
        '/presets/manifest.json',
        '/asset-browser/presets/manifest.json'
      ]);
      if (isMounted.current) {
        setResults(prev => ({ ...prev, presets }));
      }
      updateStep('presets', { status: 'done' });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      updateStep('presets', { status: 'error', error: msg });
    }

    // Graphs manifest (optional in local dev; tolerate failure)
    try {
      updateStep('graphs', { status: 'in-progress' });
      const graphs = await fetchFirstJson([
        '/graphs/manifest.json',
        '/asset-browser/graphs/manifest.json'
      ]);
      if (isMounted.current) {
        setResults(prev => ({ ...prev, graphs }));
      }
      updateStep('graphs', { status: 'done' });
    } catch (e: unknown) {
      // Non-fatal: app can still run without server graphs
      const msg = e instanceof Error ? e.message : String(e);
      updateStep('graphs', { status: 'error', error: msg });
    }
  }, [isMounted, updateStep]);

  const start = useCallback(() => {
    if (!started) {
      setStarted(true);
      void run();
    }
  }, [run, started]);

  useEffect(() => {
    // Auto-start on mount
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completed = useMemo(
    () => steps.filter(s => s.status === 'done' || s.status === 'error').length,
    [steps]
  );
  const total = steps.length;
  const percent = total > 0 ? completed / total : 1;
  const complete = completed >= total;

  const value = useMemo<BootProgressState>(
    () => ({
      steps,
      total,
      completed,
      percent,
      results,
      complete,
      start
    }),
    [completed, complete, percent, results, start, steps, total]
  );

  return (
    <BootProgressContext.Provider value={value}>
      {children}
    </BootProgressContext.Provider>
  );
};

export function useBootProgress(): BootProgressState {
  const ctx = useContext(BootProgressContext);
  if (!ctx)
    throw new Error('useBootProgress must be used within BootProgressProvider');
  return ctx;
}
