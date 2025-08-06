import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { useStore } from 'reactflow';
import { connectionValidator } from './validation/ConnectionValidator';
import './ConnectionFeedback.css';
/**
 * Visual feedback component for connection validation
 * Shows valid/invalid drop zones while dragging connections
 */
export const ConnectionFeedback = ({ nodes, edges }) => {
    const [connectingNodeId, setConnectingNodeId] = useState(null);
    const [validTargets, setValidTargets] = useState(new Set());
    const [errorMessage, setErrorMessage] = useState('');
    // Subscribe to React Flow connection state
    const connectionNodeId = useStore((state) => state.connectionNodeId);
    const connectionHandleType = useStore((state) => state.connectionHandleType);
    useEffect(() => {
        if (connectionNodeId && connectionHandleType === 'source') {
            // User is dragging from a source handle
            const sourceNode = nodes.find(n => n.id === connectionNodeId);
            if (sourceNode) {
                setConnectingNodeId(connectionNodeId);
                // Get valid target types
                const validTargetTypes = connectionValidator.getValidTargets(sourceNode);
                // Find all nodes that are valid targets
                const validTargetIds = new Set();
                nodes.forEach(node => {
                    if (node.id !== connectionNodeId && node.type && validTargetTypes.includes(node.type)) {
                        // Additional validation
                        const result = connectionValidator.validateConnection({ source: connectionNodeId, target: node.id }, nodes, edges);
                        if (result.isValid) {
                            validTargetIds.add(node.id);
                        }
                    }
                });
                setValidTargets(validTargetIds);
                // Set error message if source cannot connect to anything
                if (validTargetIds.size === 0) {
                    const sourceType = sourceNode.type || 'default';
                    if (sourceType === 'output') {
                        setErrorMessage('Output nodes cannot have outgoing connections');
                    }
                    else {
                        setErrorMessage('No valid targets available');
                    }
                }
            }
        }
        else {
            // Not connecting, clear state
            setConnectingNodeId(null);
            setValidTargets(new Set());
            setErrorMessage('');
        }
    }, [connectionNodeId, connectionHandleType, nodes, edges]);
    // DISABLED: Direct DOM manipulation to prevent node jumping
    // The visual feedback is now handled through React state and CSS without direct DOM queries
    useEffect(() => {
        // This effect has been disabled to prevent DOM manipulation that causes node position jumping
        // The connection validation still works through the isValidConnection callback
        // Original functionality commented out:
        // - Was adding/removing CSS classes directly to DOM elements
        // - This caused React Flow to recalculate positions leading to node jumping
        // - Visual feedback can be achieved through other means if needed
        return () => {
            // Cleanup is also disabled
        };
    }, [connectingNodeId, validTargets, nodes]);
    // Show error message if needed
    if (errorMessage && connectingNodeId) {
        return (_jsx("div", { className: "epic1-connection-error", children: _jsxs("div", { className: "epic1-connection-error-message", children: [_jsx("span", { className: "epic1-error-icon", children: "\u26A0\uFE0F" }), errorMessage] }) }));
    }
    return null;
};
/**
 * Hook to validate connections in real-time
 */
export const useConnectionValidation = (nodes, edges, onError) => {
    const isValidConnection = React.useCallback((connection) => {
        const result = connectionValidator.validateConnection(connection, nodes, edges);
        // Show error toast if invalid
        if (!result.isValid && result.error) {
            onError?.(result.error);
        }
        return result.isValid;
    }, [nodes, edges, onError]);
    return { isValidConnection };
};
