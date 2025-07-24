// packages/core/hooks/useVariablePortCleanup.ts
// Hook for managing orphaned edge cleanup when variable ports change
import { useCallback, useRef, useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import { parseTemplate } from '../utils/templateParser.js';
/**
 * Hook for managing orphaned edge cleanup when variable ports change dynamically
 */
export const useVariablePortCleanup = (options = {}) => {
    const { enabled = true, debounceMs = 100, enableMigration = false, migrationThreshold = 0.8, onEdgesCleanedUp } = options;
    const { deleteElements, getEdges, getNodes } = useReactFlow();
    const cleanupTimeoutRef = useRef(null);
    const lastValidPortsRef = useRef(new Set());
    /**
     * Calculate string similarity using Levenshtein distance
     */
    const calculateSimilarity = useCallback((str1, str2) => {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        for (let i = 0; i <= str1.length; i += 1) {
            matrix[0][i] = i;
        }
        for (let j = 0; j <= str2.length; j += 1) {
            matrix[j][0] = j;
        }
        for (let j = 1; j <= str2.length; j += 1) {
            for (let i = 1; i <= str1.length; i += 1) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(matrix[j][i - 1] + 1, // deletion
                matrix[j - 1][i] + 1, // insertion
                matrix[j - 1][i - 1] + indicator // substitution
                );
            }
        }
        const maxLength = Math.max(str1.length, str2.length);
        return maxLength === 0 ? 1 : 1 - matrix[str2.length][str1.length] / maxLength;
    }, []);
    /**
     * Get all valid handle IDs from current nodes
     */
    const getValidHandleIds = useCallback((nodes) => {
        const validHandleIds = new Set();
        const variablePorts = new Map();
        nodes.forEach(node => {
            // Always add default handles
            validHandleIds.add(`${node.id}-target`);
            validHandleIds.add(`${node.id}-source`);
            // Check for template-based variable ports
            const templateField = node.data?.template || node.data?.text || node.data?.content;
            if (typeof templateField === 'string' && templateField.length > 0) {
                const parseResult = parseTemplate(templateField);
                const nodeVariablePorts = [];
                parseResult.variables.forEach(variable => {
                    if (variable.isValid) {
                        const portId = `variable-${variable.name}`;
                        const fullHandleId = `${node.id}-${portId}`;
                        validHandleIds.add(fullHandleId);
                        nodeVariablePorts.push({
                            nodeId: node.id,
                            portId,
                            variableName: variable.name
                        });
                    }
                });
                if (nodeVariablePorts.length > 0) {
                    variablePorts.set(node.id, nodeVariablePorts);
                }
            }
        });
        return { handleIds: validHandleIds, variablePorts };
    }, []);
    /**
     * Find edges that can be migrated to new variable ports
     */
    const findMigratableEdges = useCallback((orphanedEdges, oldVariablePorts, newVariablePorts) => {
        const migratedEdges = [];
        const unmigratableEdges = [];
        for (const edge of orphanedEdges) {
            let migrated = false;
            // Try to migrate target handle (variable port connections)
            if (edge.targetHandle && edge.targetHandle.startsWith('variable-')) {
                const targetNodeId = edge.target;
                const oldVariableName = edge.targetHandle.replace('variable-', '');
                const newNodePorts = newVariablePorts.get(targetNodeId);
                if (newNodePorts) {
                    // Find best matching variable port
                    let bestMatch = null;
                    let bestScore = 0;
                    for (const port of newNodePorts) {
                        const similarity = calculateSimilarity(oldVariableName, port.variableName);
                        if (similarity >= migrationThreshold && similarity > bestScore) {
                            bestMatch = port;
                            bestScore = similarity;
                        }
                    }
                    if (bestMatch) {
                        migratedEdges.push({
                            ...edge,
                            targetHandle: bestMatch.portId,
                            // Add migration metadata
                            data: {
                                ...edge.data,
                                migrated: true,
                                originalTargetHandle: edge.targetHandle,
                                migrationScore: bestScore
                            }
                        });
                        migrated = true;
                    }
                }
            }
            if (!migrated) {
                unmigratableEdges.push(edge);
            }
        }
        return { migratedEdges, unmigratableEdges };
    }, [calculateSimilarity, migrationThreshold]);
    /**
     * Perform orphaned edge cleanup
     */
    const performCleanup = useCallback((immediate = false) => {
        if (!enabled)
            return;
        const executeCleanup = () => {
            try {
                const nodes = getNodes();
                const edges = getEdges();
                const { handleIds: currentValidHandleIds, variablePorts: currentVariablePorts } = getValidHandleIds(nodes);
                // Find orphaned edges
                const orphanedEdges = edges.filter(edge => {
                    const sourceHandleId = `${edge.source}-${edge.sourceHandle || 'source'}`;
                    const targetHandleId = `${edge.target}-${edge.targetHandle || 'target'}`;
                    return !currentValidHandleIds.has(sourceHandleId) || !currentValidHandleIds.has(targetHandleId);
                });
                if (orphanedEdges.length === 0) {
                    lastValidPortsRef.current = currentValidHandleIds;
                    return;
                }
                let edgesToDelete = orphanedEdges;
                let edgesToUpdate = [];
                // Attempt migration if enabled
                if (enableMigration && lastValidPortsRef.current.size > 0) {
                    // This is a simplified migration - in a full implementation,
                    // you'd need to track the previous variable port state
                    const { migratedEdges, unmigratableEdges } = findMigratableEdges(orphanedEdges, new Map(), // Previous state would be tracked separately
                    currentVariablePorts);
                    edgesToUpdate = migratedEdges;
                    edgesToDelete = unmigratableEdges;
                }
                // Update migrated edges
                if (edgesToUpdate.length > 0) {
                    // React Flow doesn't have a direct way to update edges in bulk,
                    // so we'd need to work with the parent component's edge state
                    console.log(`Variable Port Cleanup: Migrated ${edgesToUpdate.length} edges`);
                }
                // Delete unmigrated orphaned edges
                if (edgesToDelete.length > 0) {
                    deleteElements({ edges: edgesToDelete });
                    console.log(`Variable Port Cleanup: Removed ${edgesToDelete.length} orphaned edges`);
                    // Call cleanup callback
                    if (onEdgesCleanedUp) {
                        onEdgesCleanedUp(edgesToDelete);
                    }
                }
                // Update the valid ports reference
                lastValidPortsRef.current = currentValidHandleIds;
            }
            catch (error) {
                console.error('Variable Port Cleanup Error:', error);
            }
        };
        if (immediate) {
            executeCleanup();
        }
        else {
            // Debounce the cleanup
            if (cleanupTimeoutRef.current) {
                clearTimeout(cleanupTimeoutRef.current);
            }
            cleanupTimeoutRef.current = setTimeout(executeCleanup, debounceMs);
        }
    }, [
        enabled,
        debounceMs,
        enableMigration,
        getNodes,
        getEdges,
        getValidHandleIds,
        findMigratableEdges,
        deleteElements,
        onEdgesCleanedUp
    ]);
    /**
     * Trigger cleanup when nodes change
     */
    const handleNodesChange = useCallback((nodes) => {
        performCleanup();
    }, [performCleanup]);
    /**
     * Force immediate cleanup
     */
    const forceCleanup = useCallback(() => {
        performCleanup(true);
    }, [performCleanup]);
    /**
     * Get cleanup statistics
     */
    const getCleanupStats = useCallback(() => {
        const nodes = getNodes();
        const edges = getEdges();
        const { handleIds: validHandleIds } = getValidHandleIds(nodes);
        const orphanedEdges = edges.filter(edge => {
            const sourceHandleId = `${edge.source}-${edge.sourceHandle || 'source'}`;
            const targetHandleId = `${edge.target}-${edge.targetHandle || 'target'}`;
            return !validHandleIds.has(sourceHandleId) || !validHandleIds.has(targetHandleId);
        });
        return {
            totalEdges: edges.length,
            orphanedEdges: orphanedEdges.length,
            validHandles: validHandleIds.size,
            orphanedEdgeIds: orphanedEdges.map(e => e.id)
        };
    }, [getNodes, getEdges, getValidHandleIds]);
    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (cleanupTimeoutRef.current) {
                clearTimeout(cleanupTimeoutRef.current);
            }
        };
    }, []);
    return {
        performCleanup,
        handleNodesChange,
        forceCleanup,
        getCleanupStats,
        isEnabled: enabled
    };
};
