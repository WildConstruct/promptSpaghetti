import { State } from './types';
/**
 * Create an empty initial state
 */
export declare function emptyState(): State;
/**
 * Save state to disk
 */
export declare function saveState(s: State): void;
/**
 * Load state from disk
 */
export declare function loadState(): State;
/**
 * Create a hash of the state for integrity checking
 */
export declare function hashState(s: State): string;
/**
 * Create a backup of the current state
 */
export declare function backupState(): void;
/**
 * Get state statistics
 */
export declare function getStateStats(s: State): {
  totalTasks: number;
  tasksByState: Record<string, number>;
  assignmentsByDev: Record<string, number>;
  storiesByStatus: Record<string, number>;
};
//# sourceMappingURL=state.d.ts.map
