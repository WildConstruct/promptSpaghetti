import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Epic 8.5 - Enhanced Preview Modal for Film Industry Professionals
 *
 * Professional-grade preview system with individual result management,
 * designed for the Wild Construct film industry demo.
 *
 * Features:
 * - Individual result selection and management
 * - Professional UI suitable for cinema professionals
 * - Result persistence and organization
 * - Export integration
 */
import { useState, useCallback, useMemo } from 'react';
import { ErrorFactory } from '../../errors/ErrorFactory.js';
import { CreativeVarianceAnalyzer } from '../VarianceAnalysis/CreativeVarianceAnalyzer.js';
import { VarianceVisualization } from '../VarianceAnalysis/VarianceVisualization.js';
export const EnhancedPreviewModal = ({ open, loading, error, results, varianceAnalysis, onClose, onCancel, onResultHover, onResultSelect, onResultSave, onResultExport, onResultRate, onResultTag, onResultNote, enableSelection = true, enableRating = true, enableNotes = true, enableExport = true, maxResults = 50 }) => {
    const [selectedResults, setSelectedResults] = useState(new Set());
    const [activeTab, setActiveTab] = useState('results');
    const [expandedResult, setExpandedResult] = useState(null);
    const [ratingInProgress, setRatingInProgress] = useState(null);
    const [noteEditing, setNoteEditing] = useState(null);
    const [tempNote, setTempNote] = useState('');
    // Enhanced result statistics
    const resultStats = useMemo(() => {
        if (!results.length)
            return null;
        const validResults = results.filter(r => !r.error);
        const totalWords = validResults.reduce((sum, r) => sum + (r.metadata?.wordCount || 0), 0);
        const avgReadingTime = validResults.reduce((sum, r) => sum + (r.metadata?.estimatedReadingTime || 0), 0) / validResults.length;
        const avgRating = validResults.reduce((sum, r) => sum + (r.metadata?.rating || 0), 0) / validResults.length;
        return {
            totalResults: results.length,
            validResults: validResults.length,
            errorResults: results.length - validResults.length,
            totalWords,
            avgReadingTime: Math.round(avgReadingTime * 10) / 10,
            avgRating: Math.round(avgRating * 10) / 10,
            selectedCount: selectedResults.size,
            savedCount: results.filter(r => r.saved).length
        };
    }, [results, selectedResults.size]);
    const handleResultSelect = useCallback((resultId, selected) => {
        const newSelected = new Set(selectedResults);
        if (selected) {
            newSelected.add(resultId);
        }
        else {
            newSelected.delete(resultId);
        }
        setSelectedResults(newSelected);
        onResultSelect?.(resultId, selected);
    }, [selectedResults, onResultSelect]);
    const handleSelectAll = useCallback(() => {
        const allResultIds = new Set(results.map(r => r.id));
        setSelectedResults(allResultIds);
        results.forEach(r => onResultSelect?.(r.id, true));
    }, [results, onResultSelect]);
    const handleClearSelection = useCallback(() => {
        selectedResults.forEach(id => onResultSelect?.(id, false));
        setSelectedResults(new Set());
    }, [selectedResults, onResultSelect]);
    const handleBatchExport = useCallback(async () => {
        if (selectedResults.size === 0)
            return;
        try {
            await onResultExport?.(Array.from(selectedResults));
        }
        catch (error) {
            throw ErrorFactory.createGraphExecutionError('Failed to export selected results', error, { operation: 'batch_export' });
        }
    }, [selectedResults, onResultExport]);
    const handleRating = useCallback((resultId, rating) => {
        setRatingInProgress(resultId);
        onResultRate?.(resultId, rating);
        setTimeout(() => setRatingInProgress(null), 500);
    }, [onResultRate]);
    const handleNoteSave = useCallback((resultId) => {
        onResultNote?.(resultId, tempNote);
        setNoteEditing(null);
        setTempNote('');
    }, [tempNote, onResultNote]);
    const getContentTypeIcon = (contentType) => {
        switch (contentType) {
            case 'dialogue': return '💬';
            case 'action': return '🎬';
            case 'description': return '📝';
            default: return '📄';
        }
    };
    const formatExecutionTime = (timeMs) => {
        if (!timeMs)
            return 'N/A';
        return timeMs < 1000 ? `${timeMs}ms` : `${(timeMs / 1000).toFixed(1)}s`;
    };
    if (!open)
        return null;
    return (_jsxs("div", { role: "dialog", "aria-modal": "true", className: "preview-modal-backdrop", style: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
        }, children: [_jsxs("div", { className: "preview-modal-content", style: {
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                    borderRadius: 16,
                    padding: 32,
                    minWidth: 900,
                    maxWidth: 1200,
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    color: '#ffffff',
                    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)'
                }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }, children: [_jsxs("div", { children: [_jsx("h2", { style: {
                                            margin: 0,
                                            fontSize: 24,
                                            fontWeight: 600,
                                            background: 'linear-gradient(135deg, #ffffff 0%, #b0b0b0 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }, children: "\uD83C\uDFAC Preview Results" }), resultStats && (_jsxs("div", { style: {
                                            marginTop: 8,
                                            fontSize: 14,
                                            color: '#b0b0b0',
                                            display: 'flex',
                                            gap: 16
                                        }, children: [_jsxs("span", { children: ["\uD83D\uDCCA ", resultStats.validResults, "/", resultStats.totalResults, " results"] }), _jsxs("span", { children: ["\u23F1\uFE0F Avg: ", resultStats.avgReadingTime, "s read time"] }), resultStats.avgRating > 0 && _jsxs("span", { children: ["\u2B50 ", resultStats.avgRating, "/5"] }), resultStats.selectedCount > 0 && _jsxs("span", { children: ["\u2705 ", resultStats.selectedCount, " selected"] })] }))] }), _jsx("button", { onClick: onClose, style: {
                                    background: 'transparent',
                                    border: '2px solid #666',
                                    color: '#ffffff',
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    transition: 'all 0.2s',
                                    ':hover': {
                                        borderColor: '#ffffff',
                                        background: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }, children: "\u2715 Close" })] }), _jsx("div", { style: {
                            display: 'flex',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            marginBottom: 20
                        }, children: [
                            { id: 'results', label: '📋 Results', icon: '📋' },
                            { id: 'analysis', label: '📊 Creative Analysis', icon: '📊' },
                            { id: 'visualization', label: '📈 Visualization', icon: '📈' }
                        ].map(tab => (_jsxs("button", { onClick: () => setActiveTab(tab.id), style: {
                                flex: 1,
                                padding: '12px 16px',
                                border: 'none',
                                background: activeTab === tab.id
                                    ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                                    : 'transparent',
                                color: activeTab === tab.id ? '#ffffff' : '#b0b0b0',
                                fontSize: 14,
                                fontWeight: 500,
                                cursor: 'pointer',
                                borderRadius: '8px 8px 0 0',
                                transition: 'all 0.2s',
                                position: 'relative'
                            }, children: [tab.label, activeTab === tab.id && (_jsx("div", { style: {
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: 2,
                                        background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                                        borderRadius: '2px 2px 0 0'
                                    } }))] }, tab.id))) }), enableSelection && (_jsxs("div", { style: {
                            display: 'flex',
                            gap: 12,
                            marginBottom: 20,
                            padding: 16,
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 8,
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }, children: [_jsx("button", { onClick: handleSelectAll, style: {
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                    border: 'none',
                                    color: '#ffffff',
                                    padding: '8px 16px',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    transition: 'transform 0.2s'
                                }, children: "Select All" }), _jsxs("button", { onClick: handleClearSelection, disabled: selectedResults.size === 0, style: {
                                    background: selectedResults.size === 0 ? '#666' : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                    border: 'none',
                                    color: '#ffffff',
                                    padding: '8px 16px',
                                    borderRadius: 6,
                                    cursor: selectedResults.size === 0 ? 'not-allowed' : 'pointer',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    opacity: selectedResults.size === 0 ? 0.5 : 1
                                }, children: ["Clear (", selectedResults.size, ")"] }), enableExport && (_jsx("button", { onClick: handleBatchExport, disabled: selectedResults.size === 0, style: {
                                    background: selectedResults.size === 0 ? '#666' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                    border: 'none',
                                    color: '#ffffff',
                                    padding: '8px 16px',
                                    borderRadius: 6,
                                    cursor: selectedResults.size === 0 ? 'not-allowed' : 'pointer',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    opacity: selectedResults.size === 0 ? 0.5 : 1
                                }, children: "\uD83D\uDCE4 Export Selected" }))] })), activeTab === 'results' && (_jsxs(_Fragment, { children: [loading && (_jsxs("div", { style: {
                                    textAlign: 'center',
                                    padding: 40,
                                    color: '#b0b0b0',
                                    fontSize: 16
                                }, children: [_jsx("div", { style: { marginBottom: 12 }, children: "\u26A1 Generating professional results..." }), _jsx("div", { style: {
                                            width: 200,
                                            height: 4,
                                            background: '#333',
                                            borderRadius: 2,
                                            margin: '0 auto',
                                            overflow: 'hidden'
                                        }, children: _jsx("div", { style: {
                                                width: '100%',
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #4f46e5)',
                                                animation: 'loading 2s linear infinite',
                                                backgroundSize: '200% 100%'
                                            } }) })] })), error && (_jsxs("div", { style: {
                                    color: '#ef4444',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    padding: 16,
                                    borderRadius: 8,
                                    marginBottom: 20
                                }, children: ["\u26A0\uFE0F Error: ", error] })), !loading && !error && (_jsx("div", { style: {
                                    flex: 1,
                                    overflowY: 'auto',
                                    paddingRight: 8
                                }, children: _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: results.slice(0, maxResults).map((result, index) => (_jsxs("div", { onMouseEnter: () => onResultHover?.(index), style: {
                                            background: selectedResults.has(result.id)
                                                ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)'
                                                : 'rgba(255, 255, 255, 0.05)',
                                            border: `1px solid ${selectedResults.has(result.id) ? '#4f46e5' : 'rgba(255, 255, 255, 0.1)'}`,
                                            borderRadius: 12,
                                            padding: 20,
                                            position: 'relative',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            ':hover': {
                                                background: 'rgba(255, 255, 255, 0.08)',
                                                borderColor: 'rgba(255, 255, 255, 0.2)'
                                            }
                                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12 }, children: [enableSelection && (_jsx("input", { type: "checkbox", checked: selectedResults.has(result.id), onChange: (e) => handleResultSelect(result.id, e.target.checked), style: {
                                                                    width: 16,
                                                                    height: 16,
                                                                    accentColor: '#4f46e5'
                                                                } })), _jsxs("span", { style: {
                                                                    background: result.error ?
                                                                        'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' :
                                                                        'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                                                    color: '#fff',
                                                                    fontSize: 11,
                                                                    padding: '4px 10px',
                                                                    borderRadius: 12,
                                                                    fontWeight: 600
                                                                }, children: ["\uD83C\uDFB2 ", result.seed] }), result.metadata?.contentType && (_jsx("span", { style: { fontSize: 16 }, children: getContentTypeIcon(result.metadata.contentType) }))] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("span", { style: { fontSize: 11, color: '#999' }, children: formatExecutionTime(result.executionTimeMs) }), result.saved && _jsx("span", { style: { fontSize: 12 }, children: "\uD83D\uDCBE" }), result.exported && _jsx("span", { style: { fontSize: 12 }, children: "\uD83D\uDCE4" })] })] }), result.error ? (_jsx("div", { style: { color: '#ef4444', fontFamily: 'monospace', fontSize: 14 }, children: result.error })) : (_jsxs("div", { style: {
                                                    fontFamily: '\'Georgia\', \'Times New Roman\', serif',
                                                    fontSize: 15,
                                                    lineHeight: 1.6,
                                                    whiteSpace: 'pre-wrap',
                                                    color: '#e5e5e5',
                                                    maxHeight: expandedResult === result.id ? 'none' : 150,
                                                    overflow: 'hidden',
                                                    position: 'relative'
                                                }, children: [result.output, result.output && result.output.length > 300 && expandedResult !== result.id && (_jsx("div", { style: {
                                                            position: 'absolute',
                                                            bottom: 0,
                                                            left: 0,
                                                            right: 0,
                                                            height: 40,
                                                            background: 'linear-gradient(transparent, rgba(45, 45, 45, 0.9))',
                                                            display: 'flex',
                                                            alignItems: 'end',
                                                            justifyContent: 'center'
                                                        }, children: _jsx("button", { onClick: () => setExpandedResult(result.id), style: {
                                                                background: 'transparent',
                                                                border: '1px solid #666',
                                                                color: '#b0b0b0',
                                                                padding: '4px 12px',
                                                                borderRadius: 4,
                                                                cursor: 'pointer',
                                                                fontSize: 12
                                                            }, children: "Show More" }) })), expandedResult === result.id && (_jsx("button", { onClick: () => setExpandedResult(null), style: {
                                                            background: 'transparent',
                                                            border: '1px solid #666',
                                                            color: '#b0b0b0',
                                                            padding: '4px 12px',
                                                            borderRadius: 4,
                                                            cursor: 'pointer',
                                                            fontSize: 12,
                                                            marginTop: 12
                                                        }, children: "Show Less" }))] })), result.metadata && (_jsxs("div", { style: {
                                                    marginTop: 16,
                                                    display: 'flex',
                                                    gap: 16,
                                                    fontSize: 12,
                                                    color: '#999'
                                                }, children: [result.metadata.wordCount && (_jsxs("span", { children: ["\uD83D\uDCDD ", result.metadata.wordCount, " words"] })), result.metadata.estimatedReadingTime && (_jsxs("span", { children: ["\u23F1\uFE0F ", result.metadata.estimatedReadingTime, "s read"] })), result.metadata.tags?.length && (_jsxs("span", { children: ["\uD83C\uDFF7\uFE0F ", result.metadata.tags.join(', ')] }))] })), enableRating && !result.error && (_jsxs("div", { style: { marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("span", { style: { fontSize: 12, color: '#b0b0b0' }, children: "Rate:" }), [1, 2, 3, 4, 5].map(star => (_jsx("button", { onClick: () => handleRating(result.id, star), style: {
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: (result.metadata?.rating || 0) >= star ? '#fbbf24' : '#666',
                                                            cursor: 'pointer',
                                                            fontSize: 16,
                                                            padding: 2
                                                        }, children: "\u2B50" }, star))), ratingInProgress === result.id && (_jsx("span", { style: { fontSize: 12, color: '#4f46e5' }, children: "\u2713" }))] })), enableNotes && !result.error && (_jsx("div", { style: { marginTop: 12 }, children: noteEditing === result.id ? (_jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("input", { type: "text", value: tempNote, onChange: (e) => setTempNote(e.target.value), placeholder: "Add a note...", style: {
                                                                flex: 1,
                                                                background: 'rgba(255, 255, 255, 0.1)',
                                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                                color: '#ffffff',
                                                                padding: '6px 12px',
                                                                borderRadius: 4,
                                                                fontSize: 12
                                                            }, autoFocus: true }), _jsx("button", { onClick: () => handleNoteSave(result.id), style: {
                                                                background: '#4f46e5',
                                                                border: 'none',
                                                                color: '#ffffff',
                                                                padding: '6px 12px',
                                                                borderRadius: 4,
                                                                cursor: 'pointer',
                                                                fontSize: 12
                                                            }, children: "Save" }), _jsx("button", { onClick: () => {
                                                                setNoteEditing(null);
                                                                setTempNote('');
                                                            }, style: {
                                                                background: '#666',
                                                                border: 'none',
                                                                color: '#ffffff',
                                                                padding: '6px 12px',
                                                                borderRadius: 4,
                                                                cursor: 'pointer',
                                                                fontSize: 12
                                                            }, children: "Cancel" })] })) : (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("div", { style: { fontSize: 12, color: '#b0b0b0', fontStyle: 'italic' }, children: result.metadata?.notes || 'No notes' }), _jsxs("button", { onClick: () => {
                                                                setNoteEditing(result.id);
                                                                setTempNote(result.metadata?.notes || '');
                                                            }, style: {
                                                                background: 'transparent',
                                                                border: '1px solid #666',
                                                                color: '#b0b0b0',
                                                                padding: '4px 8px',
                                                                borderRadius: 4,
                                                                cursor: 'pointer',
                                                                fontSize: 11
                                                            }, children: ["\uD83D\uDCDD ", result.metadata?.notes ? 'Edit' : 'Add', " Note"] })] })) }))] }, result.id))) }) }))] })), activeTab === 'analysis' && (_jsx("div", { style: {
                            flex: 1,
                            overflowY: 'auto',
                            paddingRight: 8
                        }, children: _jsx(CreativeVarianceAnalyzer, { results: results, varianceAnalysis: varianceAnalysis, className: "" }) })), activeTab === 'visualization' && (_jsx("div", { style: {
                            flex: 1,
                            overflowY: 'auto',
                            paddingRight: 8
                        }, children: _jsx(VarianceVisualization, { results: results, varianceAnalysis: varianceAnalysis, className: "" }) }))] }), _jsx("style", { children: `
          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        ` })] }));
};
