/**
 * Professional Autosave System for Graph Editor
 * Phase 2: Critical Professional Features Implementation
 * 
 * Cinema 4D-inspired autosave with conflict resolution and recovery
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Node, Edge } from 'reactflow';

export interface AutosaveState {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
  version: number;
  checksum: string;
  metadata: {
    nodeCount: number;
    edgeCount: number;
    lastModified: string;
    sessionId: string;
};
}
export interface AutosaveManagerProps {
  nodes: Node[];
  edges: Edge[];
  interval?: number; // Autosave interval in milliseconds
  maxVersions?: number; // Maximum number of autosave versions to keep
  onRestore?: (state: AutosaveState) => void;
  onConflict?: (current: AutosaveState, saved: AutosaveState) => void;
  theme?: 'light' | 'dark' | 'cinema';
  disabled?: boolean;
}
export class AutosaveSystem {
  private sessionId: string;
  private storageKey: string;
  private maxVersions: number;
  private listeners: Set<(status: AutosaveStatus) => void> = new Set();
  constructor(projectId: string = 'default', maxVersions: number = 10) {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.storageKey = `autosave_${projectId}`;
    this.maxVersions = maxVersions;
  }

  // Generate checksum for data integrity
  private generateChecksum(nodes: Node[], edges: Edge[]): string {
    const data = JSON.stringify({ nodes, edges });
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  // Save current state
  save(nodes: Node[], edges: Edge[]): AutosaveState {
  const timestamp = Date.now();
  const checksum = this.generateChecksum(nodes, edges);
    const state: AutosaveState = {
      nodes: JSON.parse(JSON.stringify(nodes)), // Deep clone
      edges: JSON.parse(JSON.stringify(edges)), // Deep clone
      timestamp,
      version: this.getNextVersion(),
      checksum,
      metadata: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        lastModified: new Date().toISOString(),
        sessionId: this.sessionId,
      }
    };
    // Get existing autosaves
    const existingData = this.getStoredData();
    existingData.push(state);
    // Limit number of versions
    if (existingData.length > this.maxVersions) {
      existingData.splice(0, existingData.length - this.maxVersions);
    }
    // Save to localStorage
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(existingData));
      this.notifyListeners({ type: 'saved', timestamp, version: state.version });
    } catch (error) {
      console.error('Failed to save autosave data:', error);
      this.notifyListeners({ type: 'error', error: 'Failed to save' });
    }
    return state;
  }

  // Get all stored autosave states
  getStoredData(): AutosaveState[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load autosave data:', error);
      return [];
    }
  }

  // Get the latest autosave
  getLatest(): AutosaveState | null {
    const data = this.getStoredData();
    return data.length > 0 ? data[data.length - 1] : null;
  }

  // Check if there's a conflict (different session modified the data)
  hasConflict(): boolean {
    const latest = this.getLatest();
    return latest ? latest.metadata.sessionId !== this.sessionId : false;
  }

  // Restore from autosave
  restore(version?: number): AutosaveState | null {
    const data = this.getStoredData();
    if (version !== undefined) {
      const state = data.find(s => s.version === version);
      if (state) {
        this.notifyListeners({ type: 'restored', version });
        return state;
      }
    }
    // Return latest if no specific version requested
    const latest = this.getLatest();
    if (latest) {
      this.notifyListeners({ type: 'restored', version: latest.version });
    }
    return latest;
  }
  // Clear all autosaves
  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
      this.notifyListeners({ type: 'cleared' });
    } catch (error) {
      console.error('Failed to clear autosave data:', error);
    }
  }

  // Get next version number
  private getNextVersion(): number {
    const data = this.getStoredData();
    return data.length > 0 ? Math.max(...data.map(s => s.version)) + 1 : 1;
  }

  // Subscribe to autosave events
  subscribe(callback: (status: AutosaveStatus) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(status: AutosaveStatus): void {
    this.listeners.forEach(listener => listener(status));
  }

  // Validate data integrity
  validateChecksum(state: AutosaveState): boolean {
    const currentChecksum = this.generateChecksum(state.nodes, state.edges);
    return currentChecksum === state.checksum;
  }
}
  export interface AutosaveStatus {
  type: 'saved' | 'restored' | 'cleared' | 'error';
  timestamp?: number;
  version?: number;
  error?: string;
}

export const AutosaveManager: React.FC<AutosaveManagerProps> = ({
  nodes,
  edges,
  interval = 30000, // 30 seconds default
  maxVersions = 10,
  onRestore,
  onConflict,
  theme = 'cinema',
  disabled = false
}) => {
  const [autosaveSystem] = useState(() => new AutosaveSystem('graph-editor', maxVersions));
  const [lastSave, setLastSave] = useState<number | null>(null);
  const [status, setStatus] = useState<AutosaveStatus | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const [availableVersions, setAvailableVersions] = useState<AutosaveState[]>([]);
  const lastDataRef = useRef<string>('');
  const intervalRef = useRef<NodeJS.Timeout>();
  // Subscribe to autosave events
  useEffect(() => {
    const unsubscribe = autosaveSystem.subscribe((newStatus) => {
      setStatus(newStatus);
      if (newStatus.type === 'saved') {
        setLastSave(Date.now());
      }
    });
    return unsubscribe;
  }, [autosaveSystem]);
  // Check for existing autosaves on mount
  useEffect(() => {
    const versions = autosaveSystem.getStoredData();
    setAvailableVersions(versions);
    // Check for conflicts
    if (autosaveSystem.hasConflict() && versions.length > 0) {
      setShowRecovery(true);
    }
  }, [autosaveSystem]);
  // Autosave logic
  useEffect(() => {
    if (disabled) return;
    const saveIfChanged = () => {
      const currentData = JSON.stringify({ nodes, edges });
      // Only save if data has changed
      if (currentData !== lastDataRef.current && nodes.length > 0) {
        autosaveSystem.save(nodes, edges);
        lastDataRef.current = currentData;
        setAvailableVersions(autosaveSystem.getStoredData());
      }
    };
    // Initial save
    saveIfChanged();
    // Set up interval
    intervalRef.current = setInterval(saveIfChanged, interval);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [nodes, edges, interval, disabled, autosaveSystem]);
  // Manual save
  const handleManualSave = useCallback(() => {
    autosaveSystem.save(nodes, edges);
    setAvailableVersions(autosaveSystem.getStoredData());
  }, [nodes, edges, autosaveSystem]);
  // Restore from version
  const handleRestore = useCallback((version?: number) => {
    const state = autosaveSystem.restore(version);
    if (state && onRestore) {
      onRestore(state);
      setShowRecovery(false);
    }
  }, [autosaveSystem, onRestore]);
  // Clear autosaves
  const handleClear = useCallback(() => {
    if (confirm('Clear all autosave data? This cannot be undone.')) {
      autosaveSystem.clear();
      setAvailableVersions([]);
      setShowRecovery(false);
    }
  }, [autosaveSystem]);
  // Theme styles
  const getThemeStyles = () => {
    const themes = {
      light: {
        background: '#ffffff',
        secondary: '#f8fafc',
        border: '#e5e7eb',
        text: '#374151',
        textSecondary: '#6b7280',
        accent: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      dark: {
        background: '#1f2937',
        secondary: '#111827',
        border: '#4b5563',
        text: '#f9fafb',
        textSecondary: '#9ca3af',
        accent: '#60a5fa',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
      },
      cinema: {
        background: 'var(--color-bg-secondary)',
        secondary: 'var(--color-bg-tertiary)',
        border: 'var(--color-ui-border)',
        text: 'var(--color-text-primary)',
        textSecondary: 'var(--color-text-secondary)',
        accent: 'var(--color-accent-orange)',
        success: 'var(--color-accent-green)',
        warning: 'var(--color-accent-orange)',
        error: 'var(--color-accent-red)',
      }
    };
    return themes[theme];
  };
  const styles = getThemeStyles();
  const getStatusColor = () => {
    if (!status) return styles.textSecondary;
    switch (status.type) {
      case 'saved': return styles.success;
      case 'error': return styles.error;
      default: return styles.textSecondary;
    }
  };
  const getStatusText = () => {
    if (!status) return 'Ready';
    switch (status.type) {
      case 'saved': return 'Saved';
      case 'error': return 'Error';
      case 'restored': return 'Restored';
      case 'cleared': return 'Cleared';
      default: return 'Ready';
    }
  };
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };
  return (
    <>
      {/* Autosave Status Indicator */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: styles.background,
          border: `1px solid ${styles.border}`,
          borderRadius: '6px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          fontFamily: 'var(--font-family-primary)',
          boxShadow: 'var(--shadow-sm)',
          zIndex: 1000
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: getStatusColor(),
            transition: 'background var(--transition-fast)'
          }}
        />
        <span style={{ color: styles.text, fontWeight: '500' }}>
          {getStatusText()}
        </span>
        {lastSave && (
          <span style={{ color: styles.textSecondary }}>
            {formatTime(lastSave)}
          </span>
        )}
        {/* Actions */}
        <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
          <button
            onClick={() => setShowRecovery(!showRecovery)}
            title="View Autosave History"
            style={{
  background: 'transparent',
  border: 'none',
  color: styles.textSecondary,
  cursor: 'pointer',
  fontSize: '14px',
  padding: '2px 4px',
}}
          >
            📋
          </button>
          <button
            onClick={handleManualSave}
            title="Manual Save"
            style={{
  background: 'transparent',
  border: 'none',
  color: styles.textSecondary,
  cursor: 'pointer',
  fontSize: '14px',
  padding: '2px 4px',
}}
          >
            💾
          </button>
        </div>
      </div>
      {/* Recovery Panel */}
      {showRecovery && ()
        <div
          style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
}}
          onClick={() => setShowRecovery(false)}
        >
          <div
            style={{
              background: styles.background,
              border: `1px solid ${styles.border}`}
},
  borderRadius: '12px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '80%',
              overflow: 'hidden',
              fontFamily: 'var(--font-family-primary)',
              boxShadow: 'var(--shadow-xl)';
  }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px',
                borderBottom: `1px solid ${styles.border}`}
},
  background: styles.secondary;
  }}
            >
              <div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}}>
                <h2 style={{
  margin: 0,
  fontSize: '18px',
  fontWeight: '600',
  color: styles.text,
}}>
                  💾 Autosave Recovery
                </h2>
                <button
                  onClick={() => setShowRecovery(false)}
                  style={{
  background: 'transparent',
  border: 'none',
  color: styles.textSecondary,
  fontSize: '24px',
  cursor: 'pointer',
}}
                >
                  ×
                </button>
              </div>
              <p style={{
  margin: '8px 0 0 0',
  color: styles.textSecondary,
  fontSize: '14px',
}}>
                Restore your graph from an autosaved version. Recent changes are automatically saved.
              </p>
            </div>
            {/* Version List */}
            <div style={{
  padding: '20px',
  maxHeight: '400px',
  overflowY: 'auto',
}}>
              {availableVersions.length === 0 ? ()
                <div style={{
  textAlign: 'center',
  padding: '40px',
  color: styles.textSecondary,
}}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                  <div>No autosaved versions available</div>
                </div>
              ) : ()
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {availableVersions.slice().reverse().map((version, index) => {
                    const isLatest = index === 0;
                    return;
                      <div
                        key={version.version}
                        style={{
                          background: isLatest ? styles.accent + '10' : styles.secondary,
                          border: `1px solid ${isLatest ? styles.accent : styles.border}`}
},
  borderRadius: '8px',
                          padding: '16px',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)';
  }}
                        onClick={() => handleRestore(version.version)}
                      >
                        <div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '8px',
}}>
                          <div style={{
  color: styles.text,
  fontSize: '14px',
  fontWeight: '600',
}}>
                            Version {version.version} {isLatest && '(Latest)'}
                          </div>
                          <div style={{
  color: styles.textSecondary,
  fontSize: '12px',
}}>
                            {formatTime(version.timestamp)}
                          </div>
                        </div>
                        <div style={{
  display: 'flex',
  gap: '16px',
  color: styles.textSecondary,
  fontSize: '12px',
}}>
                          <span>{version.metadata.nodeCount} nodes</span>
                          <span>{version.metadata.edgeCount} edges</span>
                          <span>Modified: {new Date(version.metadata.lastModified).toLocaleString()}</span>
                        </div>
                        {version.metadata.sessionId !== autosaveSystem['sessionId'] && ()
                          <div style={{
                            marginTop: '8px',
                            padding: '6px 8px',
                            background: styles.warning + '20',
                            border: `1px solid ${styles.warning}`}
},
  borderRadius: '4px',
                            color: styles.warning,
                            fontSize: '11px';
  }}>
                            ⚠️ Modified in different session
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Footer */}
            <div style={{
              padding: '16px 20px',
              borderTop: `1px solid ${styles.border}`}
},
  background: styles.secondary,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center';
  }}>
              <div style={{
  fontSize: '12px',
  color: styles.textSecondary,
}}>
                Autosaves every {Math.floor(interval / 1000)}s • Max {maxVersions} versions
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleClear}
                  style={{
                    padding: '8px 12px',
                    background: 'transparent',
                    border: `1px solid ${styles.border}`}
},
  borderRadius: '4px',
                    color: styles.text,
                    fontSize: '12px',
                    cursor: 'pointer';
  }}
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowRecovery(false)}
                  style={{
  padding: '8px 12px',
  background: styles.accent,
  border: 'none',
  borderRadius: '4px',
  color: styles.background,
  fontSize: '12px',
  fontWeight: '500',
  cursor: 'pointer',
}}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AutosaveManager;