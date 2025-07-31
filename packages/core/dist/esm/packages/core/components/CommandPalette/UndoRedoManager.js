import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Professional Undo/Redo System for Graph Editor
 * Phase 2: Critical Professional Features Implementation
 *
 * Cinema 4D-inspired undo/redo functionality with visual feedback
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
export class UndoRedoSystem {
    history = [];
    currentIndex = -1;
    maxSize;
    listeners = new Set();
    constructor(maxSize = 50) {
        this.maxSize = maxSize;
    }
    // Add a new state to history
    addState(nodes, edges, description) {
        const state = {
            nodes: JSON.parse(JSON.stringify(nodes)), // Deep clone
            edges: JSON.parse(JSON.stringify(edges)), // Deep clone
            timestamp: Date.now(),
            description,
            id: `state_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        // Remove any states after current index (we're creating a new branch)
        this.history = this.history.slice(0, this.currentIndex + 1);
        // Add new state
        this.history.push(state);
        this.currentIndex = this.history.length - 1;
        // Maintain max size
        if (this.history.length > this.maxSize) {
            this.history.shift();
            this.currentIndex--;
        }
        this.notifyListeners();
    }
    // Undo to previous state
    undo() {
        if (!this.canUndo())
            return null;
        this.currentIndex--;
        const state = this.history[this.currentIndex];
        this.notifyListeners();
        return state;
    }
    // Redo to next state
    redo() {
        if (!this.canRedo())
            return null;
        this.currentIndex++;
        const state = this.history[this.currentIndex];
        this.notifyListeners();
        return state;
    }
    // Check if undo is possible
    canUndo() {
        return this.currentIndex > 0;
    }
    // Check if redo is possible
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }
    // Get current state
    getCurrentState() {
        return this.currentIndex >= 0 ? this.history[this.currentIndex] : null;
    }
    // Get history for visualization
    getHistory() {
        return [...this.history];
    }
    // Get current position in history
    getCurrentIndex() {
        return this.currentIndex;
    }
    // Subscribe to state changes
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }
    notifyListeners() {
        const canUndo = this.canUndo();
        const canRedo = this.canRedo();
        const current = this.getCurrentState();
        this.listeners.forEach(listener => {
            listener(canUndo, canRedo, current);
        });
    }
    // Clear all history
    clear() {
        this.history = [];
        this.currentIndex = -1;
        this.notifyListeners();
    }
}
// Professional Undo/Redo UI Component
export const UndoRedoManager = ({ onStateChange, maxHistorySize = 50, theme = 'cinema', }) => {
    const [undoSystem] = useState(() => new UndoRedoSystem(maxHistorySize));
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [currentState, setCurrentState] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const historyRef = useRef(null);
    // Subscribe to undo system changes
    useEffect(() => {
        const unsubscribe = undoSystem.subscribe((undo, redo, current) => {
            setCanUndo(undo);
            setCanRedo(redo);
            setCurrentState(current);
        });
        return unsubscribe;
    }, [undoSystem]);
    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.metaKey || e.ctrlKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    handleUndo();
                }
                else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
                    e.preventDefault();
                    handleRedo();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);
    const handleUndo = useCallback(() => {
        const state = undoSystem.undo();
        if (state) {
            onStateChange(state);
        }
    }, [undoSystem, onStateChange]);
    const handleRedo = useCallback(() => {
        const state = undoSystem.redo();
        if (state) {
            onStateChange(state);
        }
    }, [undoSystem, onStateChange]);
    const handleHistorySelect = useCallback((index) => {
        // Navigate directly to a specific state in history
        while (undoSystem.getCurrentIndex() > index && undoSystem.canUndo()) {
            undoSystem.undo();
        }
        while (undoSystem.getCurrentIndex() < index && undoSystem.canRedo()) {
            undoSystem.redo();
        }
        const state = undoSystem.getCurrentState();
        if (state) {
            onStateChange(state);
        }
        setShowHistory(false);
    }, [undoSystem, onStateChange]);
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
                hover: '#f3f4f6',
                disabled: '#d1d5db',
            },
            dark: {
                background: '#1f2937',
                secondary: '#111827',
                border: '#4b5563',
                text: '#f9fafb',
                textSecondary: '#9ca3af',
                accent: '#60a5fa',
                hover: '#374151',
                disabled: '#6b7280',
            },
            cinema: {
                background: 'var(--color-bg-secondary)',
                secondary: 'var(--color-bg-tertiary)',
                border: 'var(--color-ui-border)',
                text: 'var(--color-text-primary)',
                textSecondary: 'var(--color-text-secondary)',
                accent: 'var(--color-accent-orange)',
                hover: 'var(--color-ui-hover)',
                disabled: 'var(--color-text-disabled)',
            },
        };
        return themes[theme];
    };
    const styles = getThemeStyles();
    // Expose the undo system for external use
    React.useImperativeHandle(ref => ({
        addState: (nodes, edges, description) => {
            undoSystem.addState(nodes, edges, description);
        },
        undo: handleUndo,
        redo: handleRedo,
        canUndo: () => canUndo,
        canRedo: () => canRedo,
        clear: () => undoSystem.clear(),
    }), [undoSystem, handleUndo, handleRedo, canUndo, canRedo]);
    return (_jsxs("div", { style: { position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsxs("button", { onClick: handleUndo, disabled: !canUndo, title: "Undo (\u2318Z)", style: {
                    padding: '8px 12px',
                    background: styles.background,
                    border: `1px solid ${styles.border}`,
                    borderRadius: '6px',
                    color: canUndo ? styles.text : styles.disabled,
                    cursor: canUndo ? 'pointer' : 'not-allowed',
                    opacity: canUndo ? 1 : 0.5,
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all var(--transition-normal)',
                    fontFamily: 'var(--font-family-primary)',
                }, children: [_jsx("span", { style: { fontSize: '16px' }, children: "\u21B6" }), "Undo"] }), _jsxs("button", { onClick: handleRedo, disabled: !canRedo, title: "Redo (\u2318\u21E7Z)", style: {
                    padding: '8px 12px',
                    background: styles.background,
                    border: `1px solid ${styles.border}`,
                    borderRadius: '6px',
                    color: canRedo ? styles.text : styles.disabled,
                    cursor: canRedo ? 'pointer' : 'not-allowed',
                    opacity: canRedo ? 1 : 0.5,
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all var(--transition-normal)',
                    fontFamily: 'var(--font-family-primary)',
                }, children: [_jsx("span", { style: { fontSize: '16px' }, children: "\u21B7" }), "Redo"] }), _jsx("button", { onClick: () => setShowHistory(!showHistory), title: "View History", style: {
                    padding: '8px',
                    background: styles.background,
                    border: `1px solid ${styles.border}`,
                    borderRadius: '6px',
                    color: styles.text,
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all var(--transition-normal)',
                    fontFamily: 'var(--font-family-primary)',
                }, children: _jsx("span", { style: { fontSize: '16px' }, children: "\uD83D\uDCCB" }) }), showHistory && (_jsxs("div", { ref: historyRef, style: {
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    width: '320px',
                    maxHeight: '400px',
                    background: styles.background,
                    border: `1px solid ${styles.border}`,
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-lg)',
                    overflow: 'hidden',
                    zIndex: 1000,
                }, children: [_jsxs("div", { style: {
                            padding: '12px 16px',
                            borderBottom: `1px solid ${styles.border}`,
                            background: styles.secondary,
                            fontSize: '14px',
                            fontWeight: '600',
                            color: styles.text,
                        }, children: ["History (", undoSystem.getHistory().length, " states)"] }), _jsx("div", { style: { maxHeight: '300px', overflow: 'auto' }, children: undoSystem.getHistory().map((state, index) => {
                            const isCurrent = index === undoSystem.getCurrentIndex();
                            const relativeTime = new Date(state.timestamp).toLocaleTimeString();
                            return (_jsxs("div", { onClick: () => handleHistorySelect(index), style: {
                                    padding: '12px 16px',
                                    cursor: 'pointer',
                                    background: isCurrent ? styles.accent + '20' : 'transparent',
                                    borderLeft: isCurrent ? `4px solid ${styles.accent}` : '4px solid transparent',
                                    borderBottom: `1px solid ${styles.border}`,
                                    transition: 'all var(--transition-fast)',
                                }, children: [_jsx("div", { style: {
                                            fontSize: '13px',
                                            fontWeight: isCurrent ? '600' : '500',
                                            color: isCurrent ? styles.accent : styles.text,
                                            marginBottom: '4px',
                                        }, children: state.description }), _jsxs("div", { style: {
                                            fontSize: '11px',
                                            color: styles.textSecondary,
                                        }, children: [relativeTime, " \u2022 ", state.nodes.length, " nodes, ", state.edges.length, " edges"] })] }, state.id));
                        }) }), _jsx("div", { style: {
                            padding: '8px 16px',
                            borderTop: `1px solid ${styles.border}`,
                            background: styles.secondary,
                            fontSize: '11px',
                            color: styles.textSecondary,
                            textAlign: 'center',
                        }, children: "Click any state to jump to it" })] })), showHistory && (_jsx("div", { style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 999,
                }, onClick: () => setShowHistory(false) }))] }));
};
export default UndoRedoManager;
