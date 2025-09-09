# Technical Design: Autosave System Architecture

## Overview

This document details the technical design for the autosave system that provides automatic, non-intrusive saving of graph state with visual feedback and conflict resolution.

## System Architecture

### 1. Autosave Manager

```typescript
// packages/core/autosave/AutosaveManager.ts
interface AutosaveManager {
  // Lifecycle
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;

  // Operations
  triggerSave(): Promise<void>;
  forceSave(): Promise<void>;
  cancelPending(): void;

  // Status
  getStatus(): AutosaveStatus;
  getLastSaved(): Date | null;
  getPendingChanges(): boolean;

  // Events
  on(event: AutosaveEvent, handler: Handler): () => void;
}

type AutosaveStatus =
  | 'idle'
  | 'pending'
  | 'saving'
  | 'saved'
  | 'error'
  | 'paused';

type AutosaveEvent =
  | 'save-started'
  | 'save-completed'
  | 'save-failed'
  | 'status-changed'
  | 'conflict-detected';
```

### 2. Change Detection System

```typescript
// packages/core/autosave/ChangeDetector.ts
interface ChangeDetector {
  track<T>(value: T): void;
  hasChanges(): boolean;
  getChanges(): ChangeSet;
  reset(): void;
}

interface ChangeSet {
  timestamp: number;
  changes: Change[];
  significance: 'minor' | 'major' | 'critical';
}

interface Change {
  path: string[];
  type: 'add' | 'update' | 'delete';
  oldValue?: unknown;
  newValue?: unknown;
  timestamp: number;
}

export class DeepChangeDetector implements ChangeDetector {
  private baseline: unknown = null;
  private changes: Change[] = [];
  private lastCheck: number = Date.now();

  track<T>(value: T): void {
    if (!this.baseline) {
      this.baseline = this.deepClone(value);
      return;
    }

    const newChanges = this.detectChanges(this.baseline, value);
    this.changes.push(...newChanges);
    this.baseline = this.deepClone(value);
    this.lastCheck = Date.now();
  }

  private detectChanges(old: unknown, current: unknown): Change[] {
    const changes: Change[] = [];

    // Deep diff algorithm
    const diff = (a: any, b: any, path: string[] = []) => {
      if (a === b) return;

      if (typeof a !== typeof b) {
        changes.push({
          path,
          type: 'update',
          oldValue: a,
          newValue: b,
          timestamp: Date.now()
        });
        return;
      }

      if (typeof a === 'object' && a !== null && b !== null) {
        const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

        for (const key of keys) {
          if (!(key in a)) {
            changes.push({
              path: [...path, key],
              type: 'add',
              newValue: b[key],
              timestamp: Date.now()
            });
          } else if (!(key in b)) {
            changes.push({
              path: [...path, key],
              type: 'delete',
              oldValue: a[key],
              timestamp: Date.now()
            });
          } else {
            diff(a[key], b[key], [...path, key]);
          }
        }
      } else if (a !== b) {
        changes.push({
          path,
          type: 'update',
          oldValue: a,
          newValue: b,
          timestamp: Date.now()
        });
      }
    };

    diff(old, current);
    return changes;
  }

  getSignificance(changes: Change[]): 'minor' | 'major' | 'critical' {
    // Structural changes are critical
    if (changes.some(c => c.type === 'delete' && c.path.length === 1)) {
      return 'critical';
    }

    // Many changes are major
    if (changes.length > 10) {
      return 'major';
    }

    // Node/edge changes are major
    if (changes.some(c => c.path[0] === 'nodes' || c.path[0] === 'edges')) {
      return 'major';
    }

    return 'minor';
  }
}
```

### 3. Save Queue System

```typescript
// packages/core/autosave/SaveQueue.ts
interface SaveQueue {
  enqueue(task: SaveTask): void;
  process(): Promise<void>;
  clear(): void;
  getPending(): SaveTask[];
  setPriority(taskId: string, priority: number): void;
}

interface SaveTask {
  id: string;
  data: GraphState;
  priority: number;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

export class PrioritySaveQueue implements SaveQueue {
  private queue: SaveTask[] = [];
  private processing = false;
  private maxConcurrent = 1;

  enqueue(task: SaveTask): void {
    // Remove older saves of same data
    this.queue = this.queue.filter(t => t.id !== task.id);

    // Add new task
    this.queue.push(task);

    // Sort by priority
    this.queue.sort((a, b) => b.priority - a.priority);

    // Process if not already processing
    if (!this.processing) {
      this.process();
    }
  }

  async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift()!;

      try {
        await this.executeSave(task);
      } catch (error) {
        if (task.retries < task.maxRetries) {
          task.retries++;
          task.priority = Math.max(0, task.priority - 10);
          this.enqueue(task);
        } else {
          console.error('Save task failed after retries:', error);
          this.onTaskFailed(task, error);
        }
      }
    }

    this.processing = false;
  }

  private async executeSave(task: SaveTask): Promise<void> {
    // Actual save implementation
    const start = performance.now();

    await persistenceManager.save(task.data);

    const duration = performance.now() - start;
    this.onTaskCompleted(task, duration);
  }
}
```

### 4. Debounce Strategy

```typescript
// packages/core/autosave/DebouncedAutosave.ts
export class DebouncedAutosave {
  private timer: NodeJS.Timeout | null = null;
  private pendingChanges = false;
  private lastSave = Date.now();

  constructor(
    private saveFunction: () => Promise<void>,
    private config: {
      delay: number;
      maxWait: number;
      immediate: boolean;
    }
  ) {}

  trigger(): void {
    this.pendingChanges = true;

    // Clear existing timer
    if (this.timer) {
      clearTimeout(this.timer);
    }

    // Immediate save if configured
    if (this.config.immediate && !this.timer) {
      this.executeSave();
      return;
    }

    // Check if max wait exceeded
    const timeSinceLastSave = Date.now() - this.lastSave;
    if (timeSinceLastSave > this.config.maxWait) {
      this.executeSave();
      return;
    }

    // Schedule debounced save
    this.timer = setTimeout(() => {
      this.executeSave();
    }, this.config.delay);
  }

  private async executeSave(): Promise<void> {
    if (!this.pendingChanges) return;

    this.pendingChanges = false;
    this.timer = null;
    this.lastSave = Date.now();

    try {
      await this.saveFunction();
    } catch (error) {
      console.error('Autosave failed:', error);
      // Re-trigger save after error
      this.pendingChanges = true;
      this.trigger();
    }
  }

  cancel(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.pendingChanges = false;
  }

  async flush(): Promise<void> {
    this.cancel();
    if (this.pendingChanges) {
      await this.executeSave();
    }
  }
}
```

### 5. Visual Feedback Component

```typescript
// packages/core/components/AutosaveIndicator.tsx
import React, { useState, useEffect } from 'react'
import { useAutosave } from '../hooks/useAutosave'
import { formatRelativeTime } from '../utils/time'

interface AutosaveIndicatorProps {
  className?: string
  showDetails?: boolean
  position?: 'inline' | 'fixed' | 'absolute'
}

export const AutosaveIndicator: React.FC<AutosaveIndicatorProps> = ({
  className,
  showDetails = false,
  position = 'inline'
}) => {
  const { status, lastSaved, pendingChanges, error } = useAutosave()
  const [relativeTime, setRelativeTime] = useState<string>('')

  // Update relative time every second
  useEffect(() => {
    if (!lastSaved) return

    const updateTime = () => {
      setRelativeTime(formatRelativeTime(lastSaved))
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [lastSaved])

  const getStatusIcon = () => {
    switch (status) {
      case 'saved':
        return '✓'
      case 'saving':
        return '⟳'
      case 'pending':
        return '•'
      case 'error':
        return '⚠'
      default:
        return ''
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'saved':
        return 'text-green-600'
      case 'saving':
        return 'text-yellow-600 animate-spin'
      case 'pending':
        return 'text-orange-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'saved':
        return lastSaved ? `Saved ${relativeTime}` : 'All changes saved'
      case 'saving':
        return 'Saving...'
      case 'pending':
        return 'Unsaved changes'
      case 'error':
        return error?.message || 'Save failed'
      default:
        return ''
    }
  }

  return (
    <div
      className={`autosave-indicator ${position} ${className}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className={`status-icon ${getStatusColor()}`}>
        {getStatusIcon()}
      </span>
      <span className="status-text">
        {getStatusText()}
      </span>

      {showDetails && pendingChanges && (
        <span className="pending-count">
          ({pendingChanges} changes)
        </span>
      )}

      {status === 'error' && (
        <button
          onClick={() => autosaveManager.forceSave()}
          className="retry-button"
          aria-label="Retry save"
        >
          Retry
        </button>
      )}
    </div>
  )
}

// CSS
const styles = `
.autosave-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.autosave-indicator.fixed {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.status-icon {
  display: inline-flex;
  width: 1rem;
  height: 1rem;
  align-items: center;
  justify-content: center;
}

.status-icon.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.retry-button {
  margin-left: 0.5rem;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  background: #ef4444;
  color: white;
  border-radius: 0.25rem;
  cursor: pointer;
}

.retry-button:hover {
  background: #dc2626;
}
`
```

### 6. Conflict Resolution System

```typescript
// packages/core/autosave/ConflictManager.ts
interface ConflictManager {
  detectConflict(local: GraphState, remote: GraphState): Conflict | null;
  resolveConflict(conflict: Conflict, strategy: Strategy): GraphState;
  showConflictUI(conflict: Conflict): Promise<Strategy>;
}

interface Conflict {
  id: string;
  localVersion: VersionInfo;
  remoteVersion: VersionInfo;
  differences: Difference[];
  severity: 'low' | 'medium' | 'high';
}

interface VersionInfo {
  timestamp: number;
  author?: string;
  changeCount: number;
  checksum: string;
}

type Strategy = 'keep-mine' | 'use-theirs' | 'merge' | 'manual';

export class SmartConflictManager implements ConflictManager {
  detectConflict(local: GraphState, remote: GraphState): Conflict | null {
    // Quick check - same checksum means no conflict
    if (this.checksum(local) === this.checksum(remote)) {
      return null;
    }

    // Version-based check
    if (local.version === remote.version) {
      return null;
    }

    // Find actual differences
    const differences = this.findDifferences(local, remote);

    if (differences.length === 0) {
      return null;
    }

    return {
      id: crypto.randomUUID(),
      localVersion: this.getVersionInfo(local),
      remoteVersion: this.getVersionInfo(remote),
      differences,
      severity: this.calculateSeverity(differences)
    };
  }

  private calculateSeverity(
    differences: Difference[]
  ): 'low' | 'medium' | 'high' {
    // High severity: structural changes
    if (differences.some(d => d.path[0] === 'nodes' && d.type === 'delete')) {
      return 'high';
    }

    // Medium severity: multiple changes
    if (differences.length > 5) {
      return 'medium';
    }

    // Low severity: minor property changes
    return 'low';
  }

  async resolveConflict(
    conflict: Conflict,
    strategy: Strategy
  ): Promise<GraphState> {
    switch (strategy) {
      case 'keep-mine':
        return this.local;

      case 'use-theirs':
        return this.remote;

      case 'merge':
        return this.autoMerge(conflict);

      case 'manual':
        return await this.manualMerge(conflict);
    }
  }

  private autoMerge(conflict: Conflict): GraphState {
    // Three-way merge algorithm
    const merged = { ...this.local };

    for (const diff of conflict.differences) {
      // Apply non-conflicting changes
      if (this.isNonConflicting(diff)) {
        this.applyChange(merged, diff);
      } else {
        // For conflicts, use most recent
        if (
          conflict.remoteVersion.timestamp > conflict.localVersion.timestamp
        ) {
          this.applyChange(merged, diff);
        }
      }
    }

    return merged;
  }
}
```

## React Hook Implementation

```typescript
// packages/core/hooks/useAutosave.ts
interface UseAutosaveOptions {
  enabled?: boolean;
  delay?: number;
  maxWait?: number;
  onSave?: () => Promise<void>;
  onError?: (error: Error) => void;
  onConflict?: (conflict: Conflict) => void;
}

export function useAutosave(options: UseAutosaveOptions = {}) {
  const {
    enabled = true,
    delay = 30000, // 30 seconds
    maxWait = 60000, // 1 minute max
    onSave,
    onError,
    onConflict
  } = options;

  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [pendingChanges, setPendingChanges] = useState(0);

  const store = useGraphStore();
  const previousState = useRef(store.getState());

  // Initialize autosave manager
  const manager = useMemo(() => {
    return new AutosaveManager({
      saveFunction: async () => {
        setStatus('saving');
        try {
          if (onSave) {
            await onSave();
          } else {
            await persistenceManager.save(store.getState());
          }
          setStatus('saved');
          setLastSaved(new Date());
          setError(null);
          setPendingChanges(0);
        } catch (err) {
          setStatus('error');
          setError(err as Error);
          onError?.(err as Error);
        }
      },
      delay,
      maxWait
    });
  }, [delay, maxWait, onSave, onError]);

  // Track changes
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = store.subscribe(state => {
      const changes = detectChanges(previousState.current, state);

      if (changes.length > 0) {
        setPendingChanges(prev => prev + changes.length);
        setStatus('pending');
        manager.trigger();
        previousState.current = state;
      }
    });

    return () => {
      unsubscribe();
      manager.stop();
    };
  }, [enabled, manager, store]);

  // Handle tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Save immediately when tab becomes hidden
        manager.flush();
      } else {
        // Check for conflicts when tab becomes visible
        manager.checkConflicts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [manager]);

  // Handle before unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingChanges > 0) {
        e.preventDefault();
        e.returnValue =
          'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pendingChanges]);

  return {
    status,
    lastSaved,
    error,
    pendingChanges,
    forceSave: () => manager.forceSave(),
    pause: () => manager.pause(),
    resume: () => manager.resume()
  };
}
```

## Performance Optimization

### 1. RequestIdleCallback for Large Graphs

```typescript
class IdleAutosave {
  private handle: number | null = null;

  scheduleSave(data: GraphState, callback: () => void): void {
    if (this.handle) {
      cancelIdleCallback(this.handle);
    }

    this.handle = requestIdleCallback(
      async deadline => {
        // Check if we have enough time
        if (deadline.timeRemaining() > 10) {
          await this.performSave(data);
          callback();
        } else {
          // Reschedule if not enough time
          this.scheduleSave(data, callback);
        }
      },
      { timeout: 5000 } // Max 5 seconds wait
    );
  }

  private async performSave(data: GraphState): Promise<void> {
    const start = performance.now();

    // Break save into chunks for large graphs
    if (data.nodes.length > 1000) {
      await this.chunkedSave(data);
    } else {
      await persistenceManager.save(data);
    }

    const duration = performance.now() - start;
    console.debug(`Autosave completed in ${duration}ms`);
  }

  private async chunkedSave(data: GraphState): Promise<void> {
    // Save in chunks to avoid blocking
    const chunks = this.chunkData(data, 100);

    for (const chunk of chunks) {
      await new Promise(resolve => {
        requestIdleCallback(() => {
          persistenceManager.saveChunk(chunk);
          resolve(undefined);
        });
      });
    }
  }
}
```

### 2. Performance Monitoring

```typescript
class AutosavePerformanceMonitor {
  private metrics: PerformanceMetric[] = [];

  recordSave(duration: number, size: number): void {
    this.metrics.push({
      timestamp: Date.now(),
      duration,
      size,
      type: 'save'
    });

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }

    // Warn if performance degrading
    if (this.isPerformanceDegrading()) {
      console.warn('Autosave performance degrading', this.getStats());
    }
  }

  getStats(): PerformanceStats {
    const recent = this.metrics.slice(-10);

    return {
      averageDuration: average(recent.map(m => m.duration)),
      maxDuration: Math.max(...recent.map(m => m.duration)),
      minDuration: Math.min(...recent.map(m => m.duration)),
      averageSize: average(recent.map(m => m.size)),
      savesPerMinute: this.getSavesPerMinute()
    };
  }

  private isPerformanceDegrading(): boolean {
    if (this.metrics.length < 10) return false;

    const recent = this.metrics.slice(-5);
    const previous = this.metrics.slice(-10, -5);

    const recentAvg = average(recent.map(m => m.duration));
    const previousAvg = average(previous.map(m => m.duration));

    // Performance degraded if recent is 50% slower
    return recentAvg > previousAvg * 1.5;
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
describe('AutosaveManager', () => {
  it('should debounce rapid changes', async () => {
    const save = jest.fn();
    const manager = new AutosaveManager({ save, delay: 100 });

    // Trigger multiple times rapidly
    manager.trigger();
    manager.trigger();
    manager.trigger();

    // Should only save once
    await wait(150);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('should force save after maxWait', async () => {
    const save = jest.fn();
    const manager = new AutosaveManager({
      save,
      delay: 1000,
      maxWait: 100
    });

    manager.trigger();
    await wait(50);
    manager.trigger(); // Should force save due to maxWait

    await wait(10);
    expect(save).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests

```typescript
describe('Autosave Integration', () => {
  it('should persist changes across page reload', async () => {
    const { result } = renderHook(() => useAutosave());

    // Make changes
    act(() => {
      graphStore.addNode({ id: 'test', type: 'Output' });
    });

    // Wait for autosave
    await waitFor(() => {
      expect(result.current.status).toBe('saved');
    });

    // Simulate reload
    const stored = localStorage.getItem('promptgraph:state:v1');
    expect(stored).toContain('test');
  });
});
```

## Implementation Checklist

- [ ] Core autosave manager implementation
- [ ] Change detection system
- [ ] Debounce mechanism with maxWait
- [ ] Save queue with retry logic
- [ ] Visual indicator component
- [ ] Conflict detection and resolution
- [ ] Multi-tab synchronization
- [ ] Performance optimizations
- [ ] Comprehensive test suite
- [ ] Documentation and examples
