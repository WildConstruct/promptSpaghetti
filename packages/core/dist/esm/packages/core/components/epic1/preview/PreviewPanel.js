import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * PreviewPanel - Displays execution results for Epic 1
 *
 * Shows multiple variations generated from different seeds with
 * loading states, error handling, and seed controls.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { PreviewState } from './PreviewEngine';
import { DiffEngine } from './DiffEngine';
import { DiffViewer, DiffIndicator, ChangeHighlight } from './DiffViewer';
import { CacheIndicator } from './CacheIndicator';
import { WorkerIndicator } from './WorkerIndicator';
import './PreviewPanel.css';
import { debugLogEpic1 } from '../../../utils/debug';
/**
 * PreviewPanel Component
 */
export const PreviewPanel = ({ previewEngine, className = '', onSeedChange, onClose }) => {
    const [previewUpdate, setPreviewUpdate] = useState(null);
    const [seeds, setSeeds] = useState([]);
    const [showSeedControls, setShowSeedControls] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    // Diff tracking
    const diffEngine = useRef(new DiffEngine());
    const [changeSet, setChangeSet] = useState(null);
    const previousResults = useRef([]);
    // Early return if no preview engine
    if (!previewEngine) {
        return (_jsx("div", { className: `preview-panel ${className}`, children: _jsx("div", { className: "preview-error", children: _jsx("p", { children: "Preview engine not initialized" }) }) }));
    }
    // Subscribe to preview engine updates
    useEffect(() => {
        const unsubscribe = previewEngine.subscribe((update) => {
            debugLogEpic1('[PreviewPanel] Received update:', {
                state: update.state,
                hasResults: !!update.results,
                resultCount: update.results?.length,
                results: update.results?.map(r => ({
                    success: r.success,
                    output: r.output,
                    hasOutput: !!r.output,
                    outputLength: r.output?.length || 0
                }))
            });
            // Log the actual output values for debugging
            if (update.results && update.state === PreviewState.IDLE) {
                update.results.forEach((result, idx) => {
                    debugLogEpic1(`[PreviewPanel] Result ${idx}: "${result.output || '(empty)'}"`, {
                        success: result.success,
                        hasStats: !!result.stats,
                        errors: result.stats?.errors?.length || 0
                    });
                });
            }
            setPreviewUpdate(update);
            // Track changes when we have results
            if (update.state === PreviewState.IDLE && update.results) {
                const currentOutputs = update.results.map(r => r.output || '');
                if (previousResults.current.length > 0) {
                    const changes = diffEngine.current.trackChanges(previousResults.current, currentOutputs);
                    setChangeSet(changes);
                    // Clear change highlights after animation
                    setTimeout(() => setChangeSet(null), 3000);
                }
                previousResults.current = currentOutputs;
            }
        });
        // Initialize seeds from engine
        const engineSeeds = previewEngine.getSeeds();
        setSeeds(engineSeeds.map(s => ({ value: s, isCustom: false })));
        return unsubscribe;
    }, [previewEngine]);
    // Handle seed changes
    const handleSeedChange = useCallback((index, value) => {
        const newSeeds = [...seeds];
        newSeeds[index] = { value: value || 1234, isCustom: true };
        setSeeds(newSeeds);
        const seedValues = newSeeds.map(s => s.value);
        previewEngine.setSeeds(seedValues);
        onSeedChange?.(seedValues);
    }, [seeds, previewEngine, onSeedChange]);
    // Add new seed
    const handleAddSeed = useCallback(() => {
        const newSeed = { value: Math.floor(Math.random() * 10000), isCustom: true };
        const newSeeds = [...seeds, newSeed];
        setSeeds(newSeeds);
        const seedValues = newSeeds.map(s => s.value);
        previewEngine.setSeeds(seedValues);
        onSeedChange?.(seedValues);
    }, [seeds, previewEngine, onSeedChange]);
    // Remove seed
    const handleRemoveSeed = useCallback((index) => {
        if (seeds.length <= 1)
            return; // Keep at least one seed
        const newSeeds = seeds.filter((_, i) => i !== index);
        setSeeds(newSeeds);
        const seedValues = newSeeds.map(s => s.value);
        previewEngine.setSeeds(seedValues);
        onSeedChange?.(seedValues);
    }, [seeds, previewEngine, onSeedChange]);
    // Copy result to clipboard
    const handleCopyResult = useCallback((text, index) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        });
    }, []);
    // Render loading state
    const renderLoading = () => (_jsxs("div", { className: "preview-loading", children: [_jsx("div", { className: "preview-spinner" }), _jsx("div", { className: "preview-loading-text", children: previewUpdate?.state === PreviewState.PENDING ? 'Waiting...' : 'Executing...' })] }));
    // Render error state
    const renderError = () => (_jsxs("div", { className: "preview-error", children: [_jsx("div", { className: "preview-error-icon", children: "\u26A0\uFE0F" }), _jsx("div", { className: "preview-error-message", children: previewUpdate?.error?.message || 'An error occurred during execution' })] }));
    // Render single result
    const renderResult = (result, index) => {
        const hasError = !result.success;
        const output = result.output || '';
        const seed = seeds[index]?.value || 'Unknown';
        // Check if this result has changes
        const isChanged = changeSet?.changedIndices.includes(index) || false;
        const diffData = changeSet?.diffs.find(d => d.index === index);
        return (_jsxs(ChangeHighlight, { isChanged: isChanged, className: `preview-result ${hasError ? 'has-error' : ''}`, children: [_jsxs("div", { className: "preview-result-header", children: [_jsxs("span", { className: "preview-seed", children: ["Seed: ", seed] }), diffData && (_jsx(DiffIndicator, { hasChanges: true, addedCount: diffData.diff.addedCount, removedCount: diffData.diff.removedCount })), _jsx("div", { className: "preview-result-actions", children: _jsx("button", { className: `preview-copy-btn ${copiedIndex === index ? 'copied' : ''}`, onClick: () => handleCopyResult(output, index), disabled: hasError, title: "Copy to clipboard", children: copiedIndex === index ? '✓' : '📋' }) })] }), _jsx("div", { className: "preview-result-content", children: hasError ? (_jsx("div", { className: "preview-result-error", children: result.stats.errors[0]?.error.message || 'Execution failed' })) : (_jsx(_Fragment, { children: diffData ? (_jsx(DiffViewer, { diff: diffData.diff, className: "preview-result-text" })) : (_jsx("div", { className: "preview-result-text", children: output })) })) }), result.stats.warnings.length > 0 && (_jsx("div", { className: "preview-result-warnings", children: result.stats.warnings.map((warning, i) => (_jsxs("div", { className: "preview-warning", children: ["\u26A0\uFE0F ", warning.message] }, i))) }))] }, index));
    };
    // Render results
    const renderResults = () => {
        if (!previewUpdate?.results || previewUpdate.results.length === 0) {
            return (_jsxs("div", { className: "preview-empty", children: [_jsx("div", { className: "preview-empty-icon", children: "\uD83D\uDD17" }), _jsx("div", { className: "preview-empty-text", children: "Connect an Output node to see results" }), _jsx("div", { className: "preview-empty-hint", children: "Drag an Output node from the palette and connect it to your graph" })] }));
        }
        return (_jsx("div", { className: "preview-results", children: previewUpdate.results.map((result, index) => renderResult(result, index)) }));
    };
    // Render seed controls
    const renderSeedControls = () => (_jsxs("div", { className: "preview-seed-controls", children: [_jsxs("div", { className: "preview-seed-header", children: [_jsx("h4", { children: "Seeds" }), _jsx("button", { className: "preview-seed-add", onClick: handleAddSeed, title: "Add seed", children: "+" })] }), _jsx("div", { className: "preview-seed-list", children: seeds.map((seed, index) => (_jsxs("div", { className: "preview-seed-item", children: [_jsx("input", { type: "text", value: seed.value, onChange: (e) => handleSeedChange(index, e.target.value), className: "preview-seed-input", placeholder: "Enter seed" }), seeds.length > 1 && (_jsx("button", { className: "preview-seed-remove", onClick: () => handleRemoveSeed(index), title: "Remove seed", children: "\u00D7" }))] }, index))) })] }));
    // Main render
    const isLoading = previewUpdate?.state === PreviewState.PENDING ||
        previewUpdate?.state === PreviewState.EXECUTING;
    const hasError = previewUpdate?.state === PreviewState.ERROR;
    return (_jsxs("div", { className: `preview-panel ${className}`, children: [_jsxs("div", { className: "preview-header", children: [_jsx("h3", { className: "preview-title", children: "Preview" }), _jsxs("div", { className: "preview-header-actions", children: [_jsx("button", { className: "preview-seed-toggle", onClick: () => setShowSeedControls(!showSeedControls), title: "Toggle seed controls", children: "\uD83C\uDFB2" }), onClose && (_jsx("button", { className: "preview-close", onClick: onClose, title: "Close preview", children: "\u00D7" }))] })] }), previewUpdate?.cacheStats && (_jsx(CacheIndicator, { cached: previewUpdate.cached || false, hitRate: previewUpdate.cacheStats.hitRate, size: previewUpdate.cacheStats.size, maxSize: 100, className: "preview-cache-indicator" })), _jsx(WorkerIndicator, { enabled: previewEngine?.isWebWorkerEnabled?.() || false, totalWorkers: previewUpdate?.workerStats?.totalWorkers, busyWorkers: previewUpdate?.workerStats?.busyWorkers, queuedTasks: previewUpdate?.workerStats?.queuedTasks, className: "preview-worker-indicator" }), showSeedControls && renderSeedControls(), _jsxs("div", { className: "preview-content", children: [isLoading && renderLoading(), hasError && !isLoading && renderError(), !isLoading && !hasError && renderResults()] }), previewUpdate && (_jsx("div", { className: "preview-footer", children: _jsx("div", { className: "preview-stats", children: previewUpdate.results && (_jsxs(_Fragment, { children: [_jsxs("span", { children: [previewUpdate.results.length, " variations"] }), previewUpdate.state === PreviewState.IDLE && (_jsxs("span", { className: "preview-timing", children: [Math.max(...previewUpdate.results.map(r => r.stats.totalDuration)), "ms"] })), changeSet && changeSet.changedIndices.length > 0 && (_jsx("span", { className: "preview-change-summary", children: diffEngine.current.summarizeChanges(changeSet) }))] })) }) }))] }));
};
