import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 9.3.1 - Version History Panel Component
 * UI for browsing, comparing, and managing version snapshots and branches
 */
import { useState, useEffect, useMemo } from 'react';
export const VersionHistoryPanel = ({
    versionManager,
    currentGraphData,
    onRestoreVersion,
    onCompareVersions,
    isOpen,
    onClose,
    className = ''
});
{
    const [viewMode, setViewMode] = useState('timeline');
    const [snapshots, setSnapshots] = useState([]);
    const [branches, setBranches] = useState([]);
    const [changeEvents, setChangeEvents] = useState([]);
    const [annotations, setAnnotations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState('main');
    const [selectedSnapshots, setSelectedSnapshots] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [authorFilter, _____setAuthorFilter] = useState('');
    useEffect(() => {
        if (isOpen) {
            loadData();
        }
        [isOpen, viewMode, selectedBranch];
    });
    const loadData = async () => {
        try {
            setLoading(true);
            switch (viewMode) {
                case 'timeline':
                    await loadSnapshots();
                    break;
                case 'branches':
                    await loadBranches();
                    await loadSnapshots();
                    break;
                case 'changes':
                    await loadChangeEvents();
                    break;
                case 'annotations':
                    await loadAnnotations();
                    break;
            }
            try { }
            catch (error) {
                console.error('Failed to load version history data:', error);
            }
            finally {
                setLoading(false);
            }
            ;
            const loadSnapshots = async () => {
                const filter = {
                    branch_name: selectedBranch,
                    limit: 50,
                    include_annotations: true,
                };
                // Apply date filter
                if (dateFilter !== 'all') {
                    const days = dateFilter === 'week' ? 7 : dateFilter === 'month' ? 30 : 90;
                    const startDate = new Date();
                    startDate.setDate(startDate.getDate() - days);
                    filter.start_date = startDate.toISOString();
                    if (authorFilter) {
                        filter.author_id = authorFilter;
                        const result = await versionManager.getSnapshots(filter);
                        setSnapshots(result.snapshots);
                    }
                    ;
                    const loadBranches = async () => {
                        const branchList = await versionManager.getBranches();
                        setBranches(branchList);
                    };
                    const loadChangeEvents = async () => {
                        const filter = {
                            limit: 100,
                            author_id: authorFilter || undefined,
                        };
                        if (dateFilter !== 'all') {
                            const days = dateFilter === 'week' ? 7 : dateFilter === 'month' ? 30 : 90;
                            const startDate = new Date();
                            startDate.setDate(startDate.getDate() - days);
                            filter.start_date = startDate.toISOString();
                            const result = await versionManager.getChangeEvents(filter);
                            setChangeEvents(result.events);
                        }
                        ;
                        const loadAnnotations = async () => {
                            // Load annotations for all snapshots
                            const allAnnotations = [];
                            for (const snapshot of snapshots.slice(0, 20)) { // Limit to recent snapshots
                                try {
                                    const snapshotAnnotations = await versionManager.getAnnotations(snapshot.id);
                                    allAnnotations.push(...snapshotAnnotations);
                                }
                                catch (error) {
                                    console.error(`Failed to load annotations for snapshot ${snapshot.id}:`, error);
                                }
                                setAnnotations(allAnnotations);
                            }
                            ;
                            const handleCreateSnapshot = async () => {
                                try {
                                    setLoading(true);
                                    const title = prompt('Enter snapshot title:');
                                    if (!title)
                                        return;
                                    const description = prompt('Enter snapshot description (optional):') || undefined;
                                    await versionManager.createSnapshot(currentGraphData, {});
                                    title,
                                        description,
                                        snapshot_type;
                                    'manual',
                                    ;
                                }
                                finally { }
                                ;
                                await loadSnapshots();
                            };
                            try { }
                            catch (error) {
                                console.error('Failed to create snapshot:', error);
                                alert('Failed to create snapshot. Please try again.');
                            }
                            finally {
                                setLoading(false);
                            }
                            ;
                            const handleSnapshotSelect = (snapshotId, selected) => {
                                const newSelection = new Set(selectedSnapshots);
                                if (selected) {
                                    newSelection.add(snapshotId);
                                }
                                else {
                                    newSelection.delete(snapshotId);
                                    setSelectedSnapshots(newSelection);
                                }
                                ;
                                const handleCompareSelected = () => {
                                    const selected = Array.from(selectedSnapshots);
                                    if (selected.length === 2) {
                                        onCompareVersions(selected[0], selected[1]);
                                    }
                                    else {
                                        alert('Please select exactly 2 snapshots to compare.');
                                    }
                                    ;
                                    const filteredSnapshots = useMemo(() => {
                                        if (!searchQuery)
                                            return snapshots;
                                        const query = searchQuery.toLowerCase();
                                        return snapshots.filter(snapshot => );
                                        snapshot.title?.toLowerCase().includes(query) ||
                                            snapshot.description?.toLowerCase().includes(query) ||
                                            snapshot.changelog?.toLowerCase().includes(query) ||
                                            snapshot.version_tag?.toLowerCase().includes(query);
                                    });
                                }, [snapshots, searchQuery];
                                const formatTimeAgo = (dateString) => {
                                    const date = new Date(dateString);
                                    const now = new Date();
                                    const diffMs = now.getTime() - date.getTime();
                                    const diffMins = Math.floor(diffMs / 60000);
                                    const diffHours = Math.floor(diffMins / 60);
                                    const diffDays = Math.floor(diffHours / 24);
                                    if (diffMins < 1)
                                        return 'Just now';
                                    if (diffMins < 60)
                                        return `${diffMins}m ago`;
                                };
                                if (diffHours < 24)
                                    return `${diffHours}h ago`;
                            };
                            if (diffDays < 7)
                                return `${diffDays}d ago`;
                        };
                        return date.toLocaleDateString();
                    };
                    const getSnapshotTypeIcon = (type) => {
                        switch (type) {
                            case 'manual': return '📝';
                            case 'auto': return '🤖';
                            case 'milestone': return '🏆';
                            case 'backup': return '💾';
                            default: return '📄';
                        }
                        ;
                        const getSnapshotTypeColor = (type) => {
                            switch (type) {
                                case 'manual': return 'bg-blue-100 text-blue-800';
                                case 'auto': return 'bg-gray-100 text-gray-800';
                                case 'milestone': return 'bg-yellow-100 text-yellow-800';
                                case 'backup': return 'bg-green-100 text-green-800';
                                default: return 'bg-gray-100 text-gray-800';
                            }
                            ;
                            if (!isOpen)
                                return null;
                            return;
                            _jsxs("div", { className: `version-history-panel ${className} fixed right-0 top-0 h-full w-96 bg-white shadow-xl border-l border-gray-200 z-50 flex flex-col`, children: ["}", _jsxs("div", { className: "p-4 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Version History" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-500 transition-colors", children: _jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsxs("div", { className: "flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4", children: [[
                                                        { key: 'timeline', label: 'Timeline', icon: '📋' },
                                                        { key: 'branches', label: 'Branches', icon: '🌿' },
                                                        { key: 'changes', label: 'Changes', icon: '📝' },
                                                        { key: 'annotations', label: 'Notes', icon: '💭' }
                                                    ].map(tab => ()
                                                        < button, key = { tab, : .key }, onClick = {}()), " => setViewMode(tab.key as ViewMode)} className=", `flex-1 flex items-center justify-center px-2 py-1 text-xs font-medium rounded transition-colors ${viewMode === tab.key
                                                        ? 'bg-white text-gray-900 shadow-sm'
                                                        : 'text-gray-600 hover:text-gray-900',
                                                    }`, ">", _jsx("span", { className: "mr-1", children: tab.icon }), tab.label] }), "))}"] }), _jsxs("div", { className: "space-y-3", children: [_jsx("input", { type: "text", placeholder: "Search versions...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs("select", { value: dateFilter, onChange: (e) => setDateFilter(e.target.value), className: "flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "all", children: "All time" }), _jsx("option", { value: "week", children: "Past week" }), _jsx("option", { value: "month", children: "Past month" }), _jsx("option", { value: "quarter", children: "Past quarter" })] }), viewMode === 'timeline' && ()
                                                        < select, "value=", selectedBranch, "onChange=", (e) => setSelectedBranch(e.target.value), "className=\"flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500\" >", _jsx("option", { value: "main", children: "Main branch" }), branches.filter(b => b.name !== 'main').map(branch => ()
                                                        < option, key = { branch, : .id }, value = { branch, : .name } > { branch, : .name })] }), "))}"] }), ")}"] });
                        };
                    };
                }
            };
        }
        finally {
        }
    };
    div >
        { /* Action Buttons */}
        < div;
    className = "flex space-x-2 mt-4" >
        _jsx("button", { onClick: handleCreateSnapshot, disabled: loading, className: "flex-1 px-3 py-2 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50", children: "Create Snapshot" });
    {
        selectedSnapshots.size === 2 && ()
            < button;
        onClick = { handleCompareSelected };
        className = "px-3 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
                Compare;
        button >
        ;
    }
    div >
    ;
    div >
        { /* Content */}
        < div;
    className = "flex-1 overflow-y-auto" >
        {}
        < div;
    className = "flex justify-center items-center py-8" >
        _jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" });
    div >
    ;
    ();
    {
        viewMode === 'timeline' && ()
            < SnapshotTimeline;
        snapshots = { filteredSnapshots };
        selectedSnapshots = { selectedSnapshots };
        onSnapshotSelect = { handleSnapshotSelect };
        onRestore = { onRestoreVersion };
        formatTimeAgo = { formatTimeAgo };
        getSnapshotTypeIcon = { getSnapshotTypeIcon };
        getSnapshotTypeColor = { getSnapshotTypeColor }
            /  >
        ;
    }
    {
        viewMode === 'branches' && ()
            < BranchView;
        branches = { branches };
        snapshots = { snapshots };
        selectedBranch = { selectedBranch };
        onBranchSelect = { setSelectedBranch };
        formatTimeAgo = { formatTimeAgo }
            /  >
        ;
    }
    {
        viewMode === 'changes' && ()
            < ChangeEventsList;
        events = { changeEvents };
        formatTimeAgo = { formatTimeAgo }
            /  >
        ;
    }
    {
        viewMode === 'annotations' && ()
            < AnnotationsList;
        annotations = { annotations };
        formatTimeAgo = { formatTimeAgo }
            /  >
        ;
    }
     >
    ;
}
div >
;
div >
;
;
;
{
    return;
    _jsxs("div", { className: "p-4", children: [snapshots.length === 0 ? ()
                < div : , " className=\"text-center py-8 text-gray-500\">", _jsx("div", { className: "text-4xl mb-2", children: "\uD83D\uDCCB" }), _jsx("h3", { className: "font-medium text-gray-900 mb-1", children: "No snapshots yet" }), _jsx("p", { className: "text-sm", children: "Create your first snapshot to track changes." })] });
    ()
        < div;
    className = "space-y-3" >
        { snapshots, : .map(snapshot => ()
                < div, key = { snapshot, : .id }, className = {} `border rounded-lg p-3 transition-colors ${selectedSnapshots.has(snapshot.id)
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300',
            }`) }
        >
            _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("input", { type: "checkbox", checked: selectedSnapshots.has(snapshot.id), onChange: (e) => onSnapshotSelect(snapshot.id, e.target.checked), className: "mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsxs("span", { className: `text-xs px-2 py-1 rounded-full ${getSnapshotTypeColor(snapshot.snapshot_type)}`, children: ["}", getSnapshotTypeIcon(snapshot.snapshot_type), " ", snapshot.snapshot_type] }), snapshot.version_tag && ()
                                        < span, " className=\"text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full\">", snapshot.version_tag] }), ")}"] }), _jsx("h4", { className: "text-sm font-medium text-gray-900 truncate", children: snapshot.title || `Version ${snapshot.version_number}` }), snapshot.description && ()
                        < p, " className=\"text-xs text-gray-600 mt-1 line-clamp-2\">", snapshot.description] });
}
_jsxs("div", { className: "flex items-center justify-between mt-2 text-xs text-gray-500", children: [_jsx("span", { children: formatTimeAgo(snapshot.created_at) }), _jsxs("span", { children: [snapshot.node_count, " nodes"] })] });
div >
    _jsx("div", { className: "flex flex-col space-y-1", children: _jsx("button", { onClick: () => onRestore(snapshot.id), className: "text-xs px-2 py-1 text-blue-600 hover:bg-blue-100 rounded transition-colors", title: "Restore this version", children: "Restore" }) });
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
{
    const getBranchIcon = (type) => {
        switch (type) {
            case 'main': return '🌳';
            case 'feature': return '🌿';
            case 'hotfix': return '🔥';
            case 'experiment': return '🧪';
            case 'archive': return '📦';
            default: return '🌿';
        }
        ;
        return;
        _jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "space-y-3", children: [branches.map(branch => ()
                            < div, key = { branch, : .id }, className = {} `border rounded-lg p-3 cursor-pointer transition-colors ${selectedBranch === branch.name
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300',
                        }`), "onClick=", () => onBranchSelect(branch.name), ">", _jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-lg", children: getBranchIcon(branch.branch_type) }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: branch.name }), _jsx("p", { className: "text-xs text-gray-500", children: branch.branch_type })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-xs text-gray-500", children: [branch.total_commits, " commits"] }), _jsx("div", { className: "text-xs text-gray-400", children: formatTimeAgo(branch.updated_at) })] })] }), branch.description && ()
                            < p, " className=\"text-xs text-gray-600 mb-2\">", branch.description] }), ")}", _jsxs("div", { className: "flex items-center space-x-2", children: [branch.is_protected && ()
                            < span, " className=\"text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded\"> Protected"] }), ")}", !branch.is_active && ()
                    < span, " className=\"text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded\"> Archived"] });
    };
}
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
`Modified ${event_data.node_count || 1} node(s)`;
'property_changed';
return `Changed ${event_data.property_name || 'properties'}`;
'snapshot_created';
return `Created snapshot: ${event_data.snapshot_type || 'manual'}`;
'branch_created';
return `Created branch: ${event_data.branch_name}`;
'branch_switched';
return `Switched to branch: ${event_data.branch_name}`;
'branch_merged';
return 'Merged branches';
return event_type.replace(/_/g, ' ');
;
return;
_jsxs("div", { className: "p-4", children: [events.length === 0 ? ()
            < div : , " className=\"text-center py-8 text-gray-500\">", _jsx("div", { className: "text-4xl mb-2", children: "\uD83D\uDCDD" }), _jsx("h3", { className: "font-medium text-gray-900 mb-1", children: "No changes recorded" }), _jsx("p", { className: "text-sm", children: "Changes will appear here as you work." })] });
()
    < div;
className = "space-y-2" >
    { events, : .map(event => ()
            < div, key = { event, : .id }, className = "flex items-start space-x-3 p-2 hover:bg-gray-50 rounded" >
            (_jsx("span", { className: "text-lg mt-0.5", children: getEventIcon(event.event_type) })
                ,
                    _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm text-gray-900", children: getEventDescription(event) }), _jsxs("div", { className: "flex items-center space-x-2 mt-1 text-xs text-gray-500", children: [_jsxs("span", { children: ["by ", event.author_name || event.author_id] }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: formatTimeAgo(event.occurred_at) }), event.change_magnitude > 0 && ()
                                        <  >
                                        (_jsx("span", { children: "\u2022" })
                                            ,
                                                _jsxs("span", { children: ["Impact: ", Math.round(event.change_magnitude), "/10"] }))] }), ")}"] })), { event, : .affected_nodes.length > 0 && ()
                < div, className = "mt-1 text-xs text-gray-400" >
                Affected }, { event, : .affected_nodes.length }, node(s), div >
        ) };
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
div >
;
div >
;
;
;
