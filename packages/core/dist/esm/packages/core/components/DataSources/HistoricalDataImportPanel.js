import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/core/components/DataSources/HistoricalDataImportPanel.tsx
// Epic 8.8 Task 1: Historical Data Import Interface
import { useState, useCallback, useEffect } from 'react';
import { useExternalDataImport, useHistoricalQueryBuilder, useDataSourceCache } from '../../hooks/useExternalDataImport';
const ERA_OPTIONS = [];
{
    value: 'ancient', label;
    'Ancient (3000 BC - 500 AD)';
}
{
    value: 'early-medieval', label;
    'Early Medieval (500-1000)';
}
{
    value: 'high-medieval', label;
    'High Medieval (1000-1300)';
}
{
    value: 'late-medieval', label;
    'Late Medieval (1300-1500)';
}
{
    value: 'renaissance', label;
    'Renaissance (1300-1600)';
}
{
    value: 'early-modern', label;
    'Early Modern (1450-1800)';
}
{
    value: 'modern', label;
    'Modern (1800-1950)';
}
{
    value: 'contemporary', label;
    'Contemporary (1950+)';
}
;
const CATEGORY_OPTIONS = [];
{
    value: 'clothing', label;
    'Clothing & Fashion';
}
{
    value: 'architecture', label;
    'Architecture';
}
{
    value: 'art', label;
    'Art & Sculpture';
}
{
    value: 'literature', label;
    'Literature & Texts';
}
{
    value: 'warfare', label;
    'Warfare & Military';
}
{
    value: 'trade', label;
    'Trade & Commerce';
}
{
    value: 'religion', label;
    'Religion & Spirituality';
}
{
    value: 'daily-life', label;
    'Daily Life & Culture';
}
{
    value: 'technology', label;
    'Technology & Tools';
}
{
    value: 'materials', label;
    'Materials & Crafts';
}
;
const REGION_OPTIONS = [];
{
    value: 'europe', label;
    'Europe';
}
{
    value: 'england', label;
    'England';
}
{
    value: 'france', label;
    'France';
}
{
    value: 'germany', label;
    'Germany';
}
{
    value: 'italy', label;
    'Italy';
}
{
    value: 'spain', label;
    'Spain';
}
{
    value: 'asia', label;
    'Asia';
}
{
    value: 'middle-east', label;
    'Middle East';
}
{
    value: 'africa', label;
    'Africa';
}
{
    value: 'americas', label;
    'Americas';
}
;
export const HistoricalDataImportPanel = ({
    visible,
    onClose,
    onDataImported,
    onError
});
{
    const [selectedSources, setSelectedSources] = useState([]);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [importResults, setImportResults] = useState(null);
    const { state: dataState, queryData, refreshData, clearCache, validateQuery, getQuerySuggestions, exportResults } = useExternalDataImport({});
    autoRefresh: false,
        cacheStrategy;
    'conservative',
        onSuccess;
    (results) => {
        setImportResults(results);
        if (onDataImported) {
            onDataImported(results);
        }
        onError;
    };
    ;
    const { query, isValid, validationErrors, updateQuery, resetQuery, buildQuery } = useHistoricalQueryBuilder();
    const { _____cacheStats, clearCache: clearCacheStats } = useDataSourceCache();
    const suggestions = getQuerySuggestions(query);
    const availableSources = dataState.availableDataSources.filter(s => s.enabled);
    useEffect(() => {
        // Auto-select all enabled sources by default
        if (availableSources.length > 0 && selectedSources.length === 0) {
            setSelectedSources(availableSources.map(s => s.id));
        }
        [availableSources.length, selectedSources.length];
    });
    const handleImportData = useCallback(async () => {
        const finalQuery = buildQuery();
        if (!finalQuery)
            return;
        const sourcesToUse = selectedSources.length > 0 ? selectedSources : undefined;
        await queryData(finalQuery, sourcesToUse);
    }, [buildQuery, queryData, selectedSources]);
    const handleClearAll = useCallback(() => {
        resetQuery();
        setImportResults(null);
        clearCache();
        clearCacheStats();
    }, [resetQuery, clearCache, clearCacheStats]);
    const handleSourceToggle = useCallback((sourceId) => {
        setSelectedSources(prev => );
        prev.includes(sourceId)
            ? prev.filter(id => id !== sourceId)
            : [...prev, sourceId];
    });
}
[];
;
const handleExport = useCallback((format) => {
    const data = exportResults(format);
    const blob = new Blob([data], {});
    type: format === 'json' ? 'application/json' : 'text/csv',
    ;
});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `historical-data-${Date.now()}.${format}`;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
[exportResults];
;
if (!visible)
    return null;
return;
_jsxs("div", { style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2001,
    }, children: [_jsxs("div", { style: {
                background: '#2d3748',
                border: '1px solid #4a5568',
                borderRadius: 8,
                width: '90vw',
                maxWidth: 1400,
                maxHeight: '90vh',
                display: 'flex',
                overflow: 'hidden',
            }, children: [_jsxs("div", { style: {
                        width: 400,
                        background: '#1a202c',
                        borderRight: '1px solid #4a5568',
                        display: 'flex',
                        flexDirection: 'column',
                    }, children: [_jsxs("div", { style: {
                                padding: 16,
                                borderBottom: '1px solid #4a5568',
                            }, children: [_jsx("h3", { style: { color: '#e2e8f0', margin: 0, fontSize: 16 }, children: "Historical Data Import" }), _jsx("div", { style: { color: '#a0aec0', fontSize: 12, marginTop: 4 }, children: "Query historical databases for UTDG content" })] }), _jsx("div", { style: { flex: 1, overflowY: 'auto', padding: 16 }, children: _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            color: '#e2e8f0',
                                            fontSize: 12,
                                            marginBottom: 6,
                                            fontWeight: 500,
                                        }, children: "Historical Era *" }), _jsxs("select", { value: Array.isArray(query.era) ? query.era[0] : query.era || '', onChange: (e) => updateQuery({ era: e.target.value }), style: {
                                            width: '100%',
                                            padding: 8,
                                            background: '#2d3748',
                                            border: '1px solid #4a5568',
                                            borderRadius: 4,
                                            color: '#e2e8f0',
                                            fontSize: 14,
                                        }, children: [_jsx("option", { value: "", children: "Select era..." }), ERA_OPTIONS.map(era => ()
                                                < option, key = { era, : .value }, value = { era, : .value } >
                                                { era, : .label })] }), "))}"] }) }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: {
                                        display: 'block',
                                        color: '#e2e8f0',
                                        fontSize: 12,
                                        marginBottom: 6,
                                        fontWeight: 500,
                                    }, children: "Category *" }), _jsxs("select", { value: query.category || '', onChange: (e) => updateQuery({ category: e.target.value }), style: {
                                        width: '100%',
                                        padding: 8,
                                        background: '#2d3748',
                                        border: '1px solid #4a5568',
                                        borderRadius: 4,
                                        color: '#e2e8f0',
                                        fontSize: 14,
                                    }, children: [_jsx("option", { value: "", children: "Select category..." }), CATEGORY_OPTIONS.map(category => ()
                                            < option, key = { category, : .value }, value = { category, : .value } >
                                            { category, : .label })] }), "))}"] })] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: {
                                display: 'block',
                                color: '#e2e8f0',
                                fontSize: 12,
                                marginBottom: 6,
                                fontWeight: 500,
                            }, children: "Region" }), _jsxs("select", { value: Array.isArray(query.region) ? query.region[0] : query.region || '', onChange: (e) => updateQuery({ region: e.target.value || undefined }), style: {
                                width: '100%',
                                padding: 8,
                                background: '#2d3748',
                                border: '1px solid #4a5568',
                                borderRadius: 4,
                                color: '#e2e8f0',
                                fontSize: 14,
                            }, children: [_jsx("option", { value: "", children: "Any region..." }), REGION_OPTIONS.map(region => ()
                                    < option, key = { region, : .value }, value = { region, : .value } >
                                    { region, : .label })] }), "))}"] })] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: {
                        display: 'block',
                        color: '#e2e8f0',
                        fontSize: 12,
                        marginBottom: 6,
                        fontWeight: 500,
                    }, children: "Keywords (optional)" }), _jsx("input", { type: "text", value: query.keywords?.join(', ') || '', onChange: (e) => updateQuery({}), "keywords:e": true }), ".target.value.split(',').map(k => k.trim()).filter(k => k) })} placeholder=\"wool, silk, embroidery...\" style=", {
                    width: '100%',
                    padding: 8,
                    background: '#2d3748',
                    border: '1px solid #4a5568',
                    borderRadius: 4,
                    color: '#e2e8f0',
                    fontSize: 14,
                }, "/>"] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsxs("button", { onClick: () => setShowAdvanced(!showAdvanced), style: {
                        background: 'none',
                        border: 'none',
                        color: '#4299e1',
                        fontSize: 12,
                        cursor: 'pointer',
                        padding: 0,
                        marginBottom: 8,
                    }, children: [showAdvanced ? '▼' : '▶', " Advanced Options"] }), showAdvanced && ()
                    < div >
                    (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }, children: [_jsxs("div", { children: [_jsx("label", { style: {
                                            display: 'block',
                                            color: '#a0aec0',
                                            fontSize: 11,
                                            marginBottom: 4,
                                        }, children: "Limit" }), _jsx("input", { type: "number", min: "1", max: "1000", value: query.limit || 50, onChange: (e) => updateQuery({ limit: parseInt(e.target.value) }), style: {
                                            width: '100%',
                                            padding: 6,
                                            background: '#2d3748',
                                            border: '1px solid #4a5568',
                                            borderRadius: 4,
                                            color: '#e2e8f0',
                                            fontSize: 12,
                                        } })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                            display: 'block',
                                            color: '#a0aec0',
                                            fontSize: 11,
                                            marginBottom: 4,
                                        }, children: "Offset" }), _jsx("input", { type: "number", min: "0", value: query.offset || 0, onChange: (e) => updateQuery({ offset: parseInt(e.target.value) }), style: {
                                            width: '100%',
                                            padding: 6,
                                            background: '#2d3748',
                                            border: '1px solid #4a5568',
                                            borderRadius: 4,
                                            color: '#e2e8f0',
                                            fontSize: 12,
                                        } })] })] })
                        ,
                            _jsxs("div", { children: [_jsx("label", { style: {
                                            display: 'block',
                                            color: '#a0aec0',
                                            fontSize: 11,
                                            marginBottom: 4,
                                        }, children: "Subcategory" }), _jsx("input", { type: "text", value: query.subcategory || '', onChange: (e) => updateQuery({ subcategory: e.target.value || undefined }), placeholder: "nobility, peasant, clergy...", style: {
                                            width: '100%',
                                            padding: 6,
                                            background: '#2d3748',
                                            border: '1px solid #4a5568',
                                            borderRadius: 4,
                                            color: '#e2e8f0',
                                            fontSize: 12,
                                        } })] }))] }), ")}"] });
{ /* Validation Errors */ }
{
    validationErrors.length > 0 && ()
        < div;
    style = {};
    {
        background: 'rgba(245, 101, 101, 0.1)',
            border;
        '1px solid #f56565',
            borderRadius;
        4,
            padding;
        8,
            marginBottom;
        16,
        ;
    }
}
 >
    { validationErrors, : .map((error, index) => ()
            < div, key = { index }, style = {}, { color: '#f56565', fontSize: 12 }) } >
;
{
    error;
}
div >
;
div >
;
{ /* Query Suggestions */ }
{
    suggestions.length > 0 && ()
        < div;
    style = {};
    {
        background: 'rgba(66, 153, 225, 0.1)',
            border;
        '1px solid #4299e1',
            borderRadius;
        4,
            padding;
        8,
            marginBottom;
        16,
        ;
    }
}
 >
    _jsx("div", { style: { color: '#4299e1', fontSize: 11, marginBottom: 4, fontWeight: 500 }, children: "\uD83D\uDCA1 Suggestions:" });
{
    suggestions.map((suggestion, index) => ()
        < div, key = { index }, style = {}, { color: '#4299e1', fontSize: 11, marginBottom: 2 });
}
 >
;
{
    suggestion;
}
div >
;
div >
;
{ /* Data Sources */ }
_jsxs("div", { style: { marginBottom: 16 }, children: [_jsxs("label", { style: {
                display: 'block',
                color: '#e2e8f0',
                fontSize: 12,
                marginBottom: 8,
                fontWeight: 500,
            }, children: ["Data Sources (", selectedSources.length, "/", availableSources.length, " selected)"] }), _jsxs("div", { style: { maxHeight: 120, overflowY: 'auto', background: '#2d3748', borderRadius: 4, padding: 8 }, children: [availableSources.map(source => ()
                    < label, key = { source, : .id }, style = {}, {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 0',
                    color: '#e2e8f0',
                    fontSize: 12,
                    cursor: 'pointer',
                }), ">", _jsx("input", { type: "checkbox", checked: selectedSources.includes(source.id), onChange: () => handleSourceToggle(source.id), style: { margin: 0 } }), _jsxs("div", { children: [_jsx("div", { children: source.name }), _jsxs("div", { style: { color: '#a0aec0', fontSize: 10 }, children: [source.metadata.category, " \u2022 ", source.metadata.tags.slice(0, 2).join(', ')] })] })] }), "))}"] });
div >
    { /* Actions */}
    < div;
style = {};
{
    display: 'flex', gap;
    8;
}
 >
    (_jsx("button", { onClick: handleImportData, disabled: !isValid || dataState.isLoading, style: {
            flex: 1,
            padding: '10px 16px',
            background: isValid && !dataState.isLoading ? '#48bb78' : '#4a5568',
            border: 'none',
            borderRadius: 4,
            color: 'white',
            fontSize: 14,
            cursor: isValid && !dataState.isLoading ? 'pointer' : 'not-allowed',
        }, children: dataState.isLoading ? 'Importing...' : 'Import Data' })
        ,
            _jsx("button", { onClick: handleClearAll, style: {
                    padding: '10px 12px',
                    background: '#4a5568',
                    border: 'none',
                    borderRadius: 4,
                    color: 'white',
                    fontSize: 14,
                    cursor: 'pointer',
                }, children: "Clear" }));
div >
;
div >
;
div >
    { /* Results Panel */}
    < div;
style = {};
{
    flex: 1, display;
    'flex', flexDirection;
    'column';
}
 >
    { /* Results Header */}
    < div;
style = {};
{
    padding: 16,
        borderBottom;
    '1px solid #4a5568',
        display;
    'flex',
        justifyContent;
    'space-between',
        alignItems;
    'center',
    ;
}
 >
    _jsxs("div", { children: [_jsx("h3", { style: { color: '#e2e8f0', margin: 0, fontSize: 16 }, children: "Import Results" }), importResults && ()
                < div, " style=", { color: '#a0aec0', fontSize: 12, marginTop: 4 }, ">", importResults.reduce((total, result) => total + result.data.length, 0), " items from ", importResults.length, " sources \u2022 Cache hit rate: ", dataState.cacheHitRate, "%"] });
div >
    _jsx("div", { style: { display: 'flex', gap: 8, alignItems: 'center' }, children: importResults && importResults.some(r => r.data.length > 0) && ()
            <  >
            (_jsx("button", { onClick: () => handleExport('json'), style: {
                    padding: '6px 12px',
                    background: '#4299e1',
                    border: 'none',
                    borderRadius: 4,
                    color: 'white',
                    fontSize: 12,
                    cursor: 'pointer',
                }, children: "Export JSON" })
                ,
                    _jsx("button", { onClick: () => handleExport('csv'), style: {
                            padding: '6px 12px',
                            background: '#9f7aea',
                            border: 'none',
                            borderRadius: 4,
                            color: 'white',
                            fontSize: 12,
                            cursor: 'pointer',
                        }, children: "Export CSV" })) });
_jsx("button", { onClick: onClose, style: {
        padding: '6px 12px',
        background: '#4a5568',
        border: 'none',
        borderRadius: 4,
        color: 'white',
        fontSize: 12,
        cursor: 'pointer',
    }, children: "Close" });
div >
;
div >
    { /* Results Content */}
    < div;
style = {};
{
    flex: 1, overflow;
    'hidden';
}
 >
    { dataState, : .isLoading ? ()
            < div : , style = {} };
{
    display: 'flex',
        alignItems;
    'center',
        justifyContent;
    'center',
        height;
    '100%',
        flexDirection;
    'column',
        gap;
    16,
    ;
}
 >
    (_jsx("div", { style: { color: '#4299e1', fontSize: 16 }, children: "Importing historical data..." })
        ,
            _jsxs("div", { style: { color: '#a0aec0', fontSize: 14 }, children: ["Querying ", selectedSources.length, " data sources"] }));
div >
;
dataState.hasError ? ()
    < div : ;
style = {};
{
    display: 'flex',
        alignItems;
    'center',
        justifyContent;
    'center',
        height;
    '100%',
        flexDirection;
    'column',
        gap;
    16,
    ;
}
 >
    (_jsx("div", { style: { color: '#f56565', fontSize: 16 }, children: "Import Error" })
        ,
            _jsx("div", { style: { color: '#a0aec0', fontSize: 14, textAlign: 'center', maxWidth: 400 }, children: dataState.error?.message || 'An unexpected error occurred while importing data' }));
div >
;
importResults ? ()
    < HistoricalDataResults : ;
results = { importResults } /  >
;
()
    < div;
style = {};
{
    display: 'flex',
        alignItems;
    'center',
        justifyContent;
    'center',
        height;
    '100%',
        flexDirection;
    'column',
        gap;
    16,
        color;
    '#a0aec0',
    ;
}
 >
    (_jsx("div", { style: { fontSize: 48 }, children: "\uD83D\uDCDA" })
        ,
            _jsx("div", { style: { fontSize: 16 }, children: "Configure your query and click \"Import Data\"" })
                ,
                    _jsxs("div", { style: { fontSize: 14 }, children: [availableSources.length, " data sources available"] }));
div >
;
div >
;
div >
;
div >
;
div >
;
;
;
// Results display component
const HistoricalDataResults = ({ results }) => {
    const [selectedSource, setSelectedSource] = useState(null);
    const [expandedItems, setExpandedItems] = useState(new Set());
    const toggleExpanded = useCallback((itemId) => {
        setExpandedItems(prev => { });
        const next = new Set(prev);
        if (next.has(itemId)) {
            next.delete(itemId);
        }
        else {
            next.add(itemId);
            return next;
        }
    });
}, [];
const filteredResults = selectedSource;
results.filter(r => r.metadata.source === selectedSource);
results;
const allItems = filteredResults.flatMap(result => );
;
result.data.map(item => ({ ...item, _source: result.metadata.source }));
;
return;
_jsxs("div", { style: { height: '100%', display: 'flex' }, children: [_jsxs("div", { style: {
                width: 200,
                background: '#1a202c',
                borderRight: '1px solid #4a5568',
                overflowY: 'auto',
            }, children: [_jsxs("div", { style: { padding: 12 }, children: [_jsx("div", { style: { color: '#e2e8f0', fontSize: 12, marginBottom: 8, fontWeight: 500 }, children: "Sources" }), _jsxs("div", { style: {
                                padding: '6px 8px',
                                background: !selectedSource ? '#2d3748' : 'transparent',
                                borderRadius: 4,
                                cursor: 'pointer',
                                marginBottom: 4,
                            }, onClick: () => setSelectedSource(null), children: [_jsx("div", { style: { color: '#e2e8f0', fontSize: 12 }, children: "All Sources" }), _jsxs("div", { style: { color: '#a0aec0', fontSize: 10 }, children: [allItems.length, " items"] })] }), results.map(result => ()
                            < div, key = { result, : .metadata.source }, style = {}, {
                            padding: '6px 8px',
                            background: selectedSource === result.metadata.source ? '#2d3748' : 'transparent',
                            borderRadius: 4,
                            cursor: 'pointer',
                            marginBottom: 4,
                        }), "onClick=", () => setSelectedSource(result.metadata.source), ">", _jsx("div", { style: { color: '#e2e8f0', fontSize: 12 }, children: result.metadata.source.replace('-', ' ').split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') }), _jsxs("div", { style: { color: '#a0aec0', fontSize: 10 }, children: [result.data.length, " items \u2022 ", Math.round(result.metadata.executionTime), "ms"] }), result.metadata.cached && ()
                            < div, " style=", { color: '#4299e1', fontSize: 9 }, ">\u2022 Cached"] }), ")}"] }), "))}"] });
div >
    { /* Items List */}
    < div;
style = {};
{
    flex: 1, overflowY;
    'auto', padding;
    16;
}
 >
    { allItems, : .length === 0 ? ()
            < div : , style = {} };
{
    textAlign: 'center', color;
    '#a0aec0', marginTop;
    48;
}
 >
    No;
data;
found;
for (the; current; query)
    ;
div >
;
()
    < div;
style = {};
{
    display: 'grid', gap;
    12;
}
 >
    { allItems, : .map((item, index) => ()
            < div, key = {} `${item._source}-${index}`) };
style = {};
{
    background: '#1a202c',
        border;
    '1px solid #4a5568',
        borderRadius;
    6,
        padding;
    16,
        cursor;
    'pointer',
    ;
}
onClick = {}();
toggleExpanded(`${item._source}-${index}`);
    >
        (_jsxs("div", { style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 8,
            }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { color: '#e2e8f0', fontSize: 14, fontWeight: 500, marginBottom: 4 }, children: item.name || item.title || 'Unnamed Item' }), item.description && ()
                            < div, " style=", { color: '#a0aec0', fontSize: 12, marginBottom: 4 }, ">", item.description.length > 100 && !expandedItems.has(`${item._source}-${index}`), "? `$", item.description.substring(0, 100), "...`} : item.description}"] }), ")}"] })
            ,
                _jsx("div", { style: { color: '#4299e1', fontSize: 12 }, children: expandedItems.has(`${item._source}-${index}`) ? '▼' : '▶' }));
div >
    { expandedItems, : .has(`${item._source}-${index}`) && () }
    < div;
style = {};
{
    borderTop: '1px solid #4a5568', paddingTop;
    12;
}
 >
    _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }, children: Object.entries(item).filter(([key]) => !key.startsWith('_') && key !== 'description').map(([key, value]) => ()
            < div, key = { key } >
            (_jsx("div", { style: { color: '#a0aec0', fontSize: 10, marginBottom: 2 }, children: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1') })
                ,
                    _jsx("div", { style: { color: '#e2e8f0', fontSize: 12 }, children: Array.isArray(value)
                            ? value.join(', ')
                            : typeof value === 'object'
                                ? JSON.stringify(value)
                                : String(value) }))) });
div >
;
div >
;
_jsxs("div", { style: {
        marginTop: 8,
        paddingTop: 8,
        borderTop: '1px solid #4a5568',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    }, children: [_jsxs("div", { style: { color: '#a0aec0', fontSize: 10 }, children: ["Source: ", item._source] }), item.authenticity && ()
            < div, " style=", { color: '#48bb78', fontSize: 10 }, "> Authenticity: ", Math.round(item.authenticity * 100), "%"] });
div >
;
div >
;
div >
;
div >
;
div >
;
;
;
