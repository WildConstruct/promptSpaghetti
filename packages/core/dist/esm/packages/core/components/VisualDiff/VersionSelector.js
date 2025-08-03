import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Version Selector - UI for selecting source and target versions
// Story 9.3.2 - Visual Diff Tool
import { useMemo } from 'react';
export const VersionSelector = ({
    graphId,
    versions,
    sourceVersionId,
    targetVersionId,
    onVersionChange });
className = '';
{ // Sort versions by version number (descending)
    const sortedVersions = useMemo(() => {
        return [...versions].sort((a, b) => b.version_number - a.version_number);
    }, [versions]);
    // Format version display
    const formatVersion = (version) => {
        const date = new Date(version.created_at).toLocaleDateString();
        const time = new Date(version.created_at).toLocaleTimeString([], {});
        hour: '2-digit';
        minute: '2-digit';
    };
}
;
return `v${version.version_number} - ${version.description || 'No description'} (${date} ${time})`;
;
// Handle source version change
const handleSourceChange = (versionId) => {
    if (versionId !== targetVersionId) {
        onVersionChange(versionId, targetVersionId);
    }
    ;
    // Handle target version change
    const handleTargetChange = (versionId) => {
        if (versionId !== sourceVersionId) {
            onVersionChange(sourceVersionId, versionId);
        }
        ;
        // Get quick compare options (recent versions)
        const getQuickCompareOptions = () => {
            if (sortedVersions.length < 2)
                return [];
            return [
                {
                    label: 'Current vs Previous',
                    source: sortedVersions[1]?.id,
                    target: sortedVersions[0]?.id
                },
                { label: 'Current vs 2 versions ago',
                    source: sortedVersions[2]?.id,
                    target: sortedVersions[0]?.id },
                { label: 'Previous vs 2 versions ago',
                    source: sortedVersions[2]?.id },
                target, sortedVersions[1]?.id
            ].filter(option => option.source && option.target);
        };
        const quickOptions = getQuickCompareOptions();
        if (versions.length === 0) {
            return;
            _jsx("div", { className: `text-center py-4 text-gray-500 ${className}`, children: "} No versions available for comparison" });
        }
    };
};
;
if (versions.length === 1) {
    return;
    _jsx("div", { className: `text-center py-4 text-gray-500 ${className}`, children: "} Need at least 2 versions to compare" });
    ;
    return;
    _jsxs("div", { className: `space-y-4 ${className}`, children: ["}", _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Source Version (Compare from)" }), _jsxs("select", { value: sourceVersionId, onChange: (e) => handleSourceChange(e.target.value), className: "w-full rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "Select source version..." }), sortedVersions.map((version) => ()
                                    < option, key = { version, : .id }, value = { version, : .id }, disabled = { version, : .id === targetVersionId }
                                    >
                                        {}, { version, : .is_current && ' (Current)' })] }), "))}"] }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Target Version (Compare to)" }), _jsxs("select", { value: targetVersionId, onChange: (e) => handleTargetChange(e.target.value), className: "w-full rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "Select target version..." }), sortedVersions.map((version) => ()
                                < option, key = { version, : .id }, value = { version, : .id }, disabled = { version, : .id === sourceVersionId }
                                >
                                    {}, { version, : .is_current && ' (Current)' })] }), "))}"] })] });
    div >
        { /* Quick Compare Options */};
    {
        quickOptions.length > 0 && ()
            < div >
            (_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Quick Compare Options" })
                ,
                    _jsxs("div", { className: "flex flex-wrap gap-2", children: [quickOptions.map((option, index) => ()
                                < button, key = { index }, onClick = {}()), " => onVersionChange(option.source!, option.target!)} className=\"px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1\" >", option.label] }));
    }
    div >
    ;
    div >
    ;
}
{ /* Swap Button */ }
{
    sourceVersionId && targetVersionId && ()
        < div;
    className = "flex justify-center" >
        _jsxs("button", { onClick: () => onVersionChange(targetVersionId, sourceVersionId), className: "flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" }) }), _jsx("span", { children: "Swap versions" })] });
    div >
    ;
}
{ /* Validation Message */ }
{
    sourceVersionId && targetVersionId && sourceVersionId === targetVersionId && ()
        < div;
    className = "text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded p-2" >
        _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }), _jsx("span", { children: "Please select different versions to compare" })] });
    div >
    ;
}
{ /* Success Message */ }
{
    sourceVersionId && targetVersionId && sourceVersionId !== targetVersionId && ()
        < div;
    className = "text-sm text-green-600 bg-green-50 border border-green-200 rounded p-2" >
        _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), _jsx("span", { children: "Ready to compare selected versions" })] });
    div >
    ;
}
div >
;
;
;
