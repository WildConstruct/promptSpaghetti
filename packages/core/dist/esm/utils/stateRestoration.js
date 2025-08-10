/**
 * State restoration and recovery utilities
 */
import { getPersistedStateInfo, validatePersistedState, persistenceStorage, STORAGE_KEY } from './persistenceUtils';
/**
 * Attempt to recover valid portions of corrupted state
 */
export function attemptRecovery(corrupted) {
    const report = {
        recoverable: {
            nodes: 0,
            edges: 0,
            viewport: false,
            selection: false
        },
        corrupted: {
            nodes: [],
            edges: [],
            errors: []
        },
        recommendation: 'reset',
        details: ''
    };
    try {
        if (typeof corrupted !== 'object' || corrupted === null) {
            report.errors.push('State is not an object');
            report.details = 'The saved state appears to be completely corrupted.';
            return report;
        }
        const state = corrupted;
        // Try to recover nodes
        if (Array.isArray(state.nodes)) {
            for (const node of state.nodes) {
                try {
                    // Validate individual node
                    if (node && typeof node === 'object' && node.id && node.type) {
                        report.recoverable.nodes++;
                    }
                    else {
                        report.corrupted.nodes.push(node?.id || 'unknown');
                    }
                }
                catch (error) {
                    report.corrupted.nodes.push(node?.id || 'unknown');
                }
            }
        }
        // Try to recover edges
        if (Array.isArray(state.edges)) {
            for (const edge of state.edges) {
                try {
                    // Validate individual edge
                    if (edge && typeof edge === 'object' && edge.id && edge.source && edge.target) {
                        report.recoverable.edges++;
                    }
                    else {
                        report.corrupted.edges.push(edge?.id || 'unknown');
                    }
                }
                catch (error) {
                    report.corrupted.edges.push(edge?.id || 'unknown');
                }
            }
        }
        // Check viewport
        if (state.viewport && typeof state.viewport === 'object') {
            if (typeof state.viewport.x === 'number' &&
                typeof state.viewport.y === 'number' &&
                typeof state.viewport.zoom === 'number') {
                report.recoverable.viewport = true;
            }
        }
        // Check selection state
        if (Array.isArray(state.selectedNodes) || Array.isArray(state.selectedEdges)) {
            report.recoverable.selection = true;
        }
        // Determine recommendation
        const totalNodes = report.recoverable.nodes + report.corrupted.nodes.length;
        const totalEdges = report.recoverable.edges + report.corrupted.edges.length;
        if (report.recoverable.nodes === 0 && report.recoverable.edges === 0) {
            report.recommendation = 'reset';
            report.details = 'No recoverable data found. Starting fresh is recommended.';
        }
        else if (report.corrupted.nodes.length === 0 && report.corrupted.edges.length === 0) {
            report.recommendation = 'full';
            report.details = 'All data can be recovered successfully.';
        }
        else {
            const recoveryRate = (report.recoverable.nodes + report.recoverable.edges) /
                (totalNodes + totalEdges);
            if (recoveryRate > 0.8) {
                report.recommendation = 'partial';
                report.details = `${Math.round(recoveryRate * 100)}% of your data can be recovered.`;
            }
            else {
                report.recommendation = 'reset';
                report.details = `Only ${Math.round(recoveryRate * 100)}% of data is recoverable. Consider starting fresh.`;
            }
        }
    }
    catch (error) {
        report.errors.push(error instanceof Error ? error.message : 'Unknown error');
        report.details = 'An unexpected error occurred during recovery analysis.';
    }
    return report;
}
/**
 * Build recovered state from corrupted data
 */
export function buildRecoveredState(corrupted, report) {
    const recovered = {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 }
    };
    // Recover nodes
    if (Array.isArray(corrupted.nodes)) {
        for (const node of corrupted.nodes) {
            if (node && typeof node === 'object' &&
                node.id && node.type &&
                !report.corrupted.nodes.includes(node.id)) {
                recovered.nodes.push(node);
            }
        }
    }
    // Recover edges (only if both source and target nodes exist)
    const nodeIds = new Set(recovered.nodes.map((n) => n.id));
    if (Array.isArray(corrupted.edges)) {
        for (const edge of corrupted.edges) {
            if (edge && typeof edge === 'object' &&
                edge.id && edge.source && edge.target &&
                nodeIds.has(edge.source) && nodeIds.has(edge.target) &&
                !report.corrupted.edges.includes(edge.id)) {
                recovered.edges.push(edge);
            }
        }
    }
    // Recover viewport if valid
    if (report.recoverable.viewport && corrupted.viewport) {
        recovered.viewport = corrupted.viewport;
    }
    // Recover selection if valid
    if (report.recoverable.selection) {
        if (Array.isArray(corrupted.selectedNodes)) {
            recovered.selectedNodes = corrupted.selectedNodes.filter((id) => nodeIds.has(id));
        }
        if (Array.isArray(corrupted.selectedEdges)) {
            const edgeIds = new Set(recovered.edges.map((e) => e.id));
            recovered.selectedEdges = corrupted.selectedEdges.filter((id) => edgeIds.has(id));
        }
    }
    recovered.lastModified = new Date().toISOString();
    return recovered;
}
/**
 * Restore state from localStorage
 */
export async function restoreState() {
    try {
        // Check if persistence is available
        const stateInfo = getPersistedStateInfo();
        if (!stateInfo || !stateInfo.exists) {
            return {
                success: false,
                recovered: false,
                error: 'No saved state found'
            };
        }
        // Get persisted state
        const persistedString = persistenceStorage.getItem(STORAGE_KEY);
        if (!persistedString) {
            return {
                success: false,
                recovered: false,
                error: 'Unable to read saved state'
            };
        }
        // Parse state
        let parsedState;
        try {
            parsedState = JSON.parse(persistedString);
        }
        catch (error) {
            // State is corrupted, attempt recovery
            const report = attemptRecovery(persistedString);
            return {
                success: false,
                recovered: true,
                report,
                error: 'State is corrupted'
            };
        }
        // Validate state
        const validatedState = validatePersistedState(parsedState);
        if (validatedState) {
            return {
                success: true,
                recovered: false,
                state: validatedState
            };
        }
        // Validation failed, attempt recovery
        const report = attemptRecovery(parsedState);
        if (report.recommendation !== 'reset') {
            const recoveredState = buildRecoveredState(parsedState, report);
            return {
                success: false,
                recovered: true,
                report,
                state: recoveredState
            };
        }
        return {
            success: false,
            recovered: true,
            report,
            error: 'State validation failed'
        };
    }
    catch (error) {
        return {
            success: false,
            recovered: false,
            error: error instanceof Error ? error.message : 'Unknown restoration error'
        };
    }
}
/**
 * Calculate storage usage information
 */
export async function getStorageInfo() {
    const info = {
        used: 0,
        available: 0,
        percentage: 0,
        formattedUsed: '0 KB',
        formattedAvailable: 'Unknown',
        quota: undefined
    };
    try {
        // Calculate current usage
        let totalSize = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                const value = localStorage.getItem(key);
                if (value) {
                    totalSize += key.length + value.length;
                }
            }
        }
        info.used = totalSize * 2; // UTF-16 uses 2 bytes per character
        // Get storage quota if available
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            if (estimate.quota) {
                info.quota = estimate.quota;
                info.available = estimate.quota - (estimate.usage || info.used);
                info.percentage = ((estimate.usage || info.used) / estimate.quota) * 100;
            }
        }
        else {
            // Fallback: assume 5MB localStorage limit
            const assumedQuota = 5 * 1024 * 1024; // 5MB
            info.quota = assumedQuota;
            info.available = Math.max(0, assumedQuota - info.used);
            info.percentage = (info.used / assumedQuota) * 100;
        }
        // Format sizes
        info.formattedUsed = formatBytes(info.used);
        info.formattedAvailable = formatBytes(info.available);
    }
    catch (error) {
        console.error('Error calculating storage info:', error);
    }
    return info;
}
/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
/**
 * Export current state as backup
 */
export function exportBackup() {
    try {
        const state = persistenceStorage.getItem(STORAGE_KEY);
        if (!state) {
            throw new Error('No state to export');
        }
        const blob = new Blob([state], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `promptgraph-backup-${timestamp}.json`;
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    catch (error) {
        console.error('Error exporting backup:', error);
        throw error;
    }
}
/**
 * Clear all persisted state
 */
export function clearPersistedState() {
    try {
        // Remove main state
        persistenceStorage.removeItem(STORAGE_KEY);
        // Clear any other app-related keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('promptgraph:')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('state-cleared'));
    }
    catch (error) {
        console.error('Error clearing state:', error);
        throw error;
    }
}
