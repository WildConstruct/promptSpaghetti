import { Node, Edge } from 'reactflow';

export interface WorkspaceSnapshot {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
  sessionId?: string;
  metadata?: {
    title?: string;
    lastModified?: number;
    nodeCount?: number;
    edgeCount?: number;
  };
}

export interface RecoveryOptions {
  autoRecover?: boolean;
  showPrompt?: boolean;
  maxAge?: number; // Max age in milliseconds before considering stale
}

const WORKSPACE_KEY = 'prompt-spaghetti:workspace';
const AUTOSAVE_KEY = 'prompt-spaghetti:autosave';
const SESSION_KEY = 'prompt-spaghetti:session';
const RECOVERY_DISMISSED_KEY = 'prompt-spaghetti:recovery-dismissed';

export class WorkspaceRecovery {
  private static sessionId: string = Date.now().toString(36);

  /**
   * Initialize workspace recovery system
   */
  static initialize(): void {
    // Set current session ID
    sessionStorage.setItem(SESSION_KEY, this.sessionId);

    // Clear recovery dismissed flag on new session
    sessionStorage.removeItem(RECOVERY_DISMISSED_KEY);
  }

  /**
   * Check if there's a recoverable workspace
   */
  static hasRecoverableWorkspace(): boolean {
    try {
      const workspace = localStorage.getItem(WORKSPACE_KEY);
      const autosave = localStorage.getItem(AUTOSAVE_KEY);

      if (!workspace && !autosave) return false;

      // Check if recovery was already dismissed this session
      if (sessionStorage.getItem(RECOVERY_DISMISSED_KEY) === 'true') {
        return false;
      }

      // Parse and check if workspace has content
      const data = workspace ? JSON.parse(workspace) : JSON.parse(autosave!);
      return data.nodes && data.nodes.length > 0;
    } catch (error) {
      console.error(
        'WorkspaceRecovery: Error checking for recoverable workspace',
        error
      );
      return false;
    }
  }

  /**
   * Get recoverable workspace info
   */
  static getRecoverableInfo(): {
    hasWorkspace: boolean;
    timestamp?: number;
    nodeCount?: number;
    edgeCount?: number;
    timeSinceLastSave?: string;
  } | null {
    try {
      const workspace = localStorage.getItem(WORKSPACE_KEY);
      const autosave = localStorage.getItem(AUTOSAVE_KEY);

      if (!workspace && !autosave) return null;

      const data = workspace ? JSON.parse(workspace) : JSON.parse(autosave!);

      if (!data.nodes || data.nodes.length === 0) {
        return { hasWorkspace: false };
      }

      const timeSince = this.getTimeSince(data.timestamp);

      return {
        hasWorkspace: true,
        timestamp: data.timestamp,
        nodeCount: data.nodes?.length || 0,
        edgeCount: data.edges?.length || 0,
        timeSinceLastSave: timeSince
      };
    } catch (error) {
      console.error('WorkspaceRecovery: Error getting recoverable info', error);
      return null;
    }
  }

  /**
   * Save current workspace
   */
  static saveWorkspace(nodes: Node[], edges: Edge[], metadata?: any): boolean {
    try {
      const snapshot: WorkspaceSnapshot = {
        nodes,
        edges,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        metadata: {
          ...metadata,
          lastModified: Date.now(),
          nodeCount: nodes.length,
          edgeCount: edges.length
        }
      };

      localStorage.setItem(WORKSPACE_KEY, JSON.stringify(snapshot));
      return true;
    } catch (error) {
      console.error('WorkspaceRecovery: Failed to save workspace', error);
      return false;
    }
  }

  /**
   * Auto-save workspace (separate from manual save)
   */
  static autoSave(nodes: Node[], edges: Edge[]): void {
    try {
      const snapshot: WorkspaceSnapshot = {
        nodes,
        edges,
        timestamp: Date.now(),
        sessionId: this.sessionId
      };

      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(snapshot));
    } catch (error) {
      console.error('WorkspaceRecovery: Autosave failed', error);
    }
  }

  /**
   * Recover workspace
   */
  static recoverWorkspace(): WorkspaceSnapshot | null {
    try {
      // Try workspace first, then autosave
      const workspace = localStorage.getItem(WORKSPACE_KEY);
      const autosave = localStorage.getItem(AUTOSAVE_KEY);

      let data: WorkspaceSnapshot | null = null;

      if (workspace) {
        data = JSON.parse(workspace);
      } else if (autosave) {
        data = JSON.parse(autosave);
      }

      return data;
    } catch (error) {
      console.error('WorkspaceRecovery: Failed to recover workspace', error);
      return null;
    }
  }

  /**
   * Clear workspace (user chose to start fresh)
   */
  static clearWorkspace(): void {
    localStorage.removeItem(WORKSPACE_KEY);
    localStorage.removeItem(AUTOSAVE_KEY);
    // Also clear legacy keys
    localStorage.removeItem('epic1-graph');
    localStorage.removeItem('epic1-graph-autosave');
    localStorage.removeItem('promptgraph:state:v1');
  }

  /**
   * Dismiss recovery for this session
   */
  static dismissRecovery(): void {
    sessionStorage.setItem(RECOVERY_DISMISSED_KEY, 'true');
  }

  /**
   * Check if workspace is stale (older than maxAge)
   */
  static isWorkspaceStale(maxAgeMs: number = 24 * 60 * 60 * 1000): boolean {
    try {
      const workspace = localStorage.getItem(WORKSPACE_KEY);
      if (!workspace) return true;

      const data = JSON.parse(workspace);
      const age = Date.now() - data.timestamp;

      return age > maxAgeMs;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get human-readable time since timestamp
   */
  private static getTimeSince(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }

  /**
   * Export workspace to file
   */
  static exportToFile(nodes: Node[], edges: Edge[], filename?: string): void {
    const snapshot: WorkspaceSnapshot = {
      nodes,
      edges,
      timestamp: Date.now(),
      metadata: {
        nodeCount: nodes.length,
        edgeCount: edges.length
      }
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `workspace-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import workspace from file
   */
  static async importFromFile(file: File): Promise<WorkspaceSnapshot | null> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate basic structure
      if (!data.nodes || !Array.isArray(data.nodes)) {
        throw new Error('Invalid workspace file: missing nodes');
      }

      return data as WorkspaceSnapshot;
    } catch (error) {
      console.error('WorkspaceRecovery: Failed to import workspace', error);
      return null;
    }
  }
}
