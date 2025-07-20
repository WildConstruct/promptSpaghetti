import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 9.2.1 - Workspace List Component
 * Displays list of user's workspaces with search and filtering
 */
import { useState, useMemo } from 'react';
export const WorkspaceList = ({ workspaces, selectedWorkspace, onWorkspaceSelect, loading = false, }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const filteredWorkspaces = useMemo(() => {
        let filtered = workspaces;
        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(workspace => workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                workspace.description?.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        // Apply role filter
        if (filterBy !== 'all') {
            filtered = filtered.filter(workspace => {
                if (filterBy === 'owner') {
                    return workspace.owner_id === workspace.membership?.user_id;
                }
                else if (filterBy === 'member') {
                    return workspace.owner_id !== workspace.membership?.user_id;
                }
                return true;
            });
        }
        // Sort by name
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }, [workspaces, searchTerm, filterBy]);
    if (loading) {
        return (_jsxs("div", { className: "workspace-list workspace-list--loading", children: [_jsx("div", { className: "workspace-list__header", children: _jsx("h3", { children: "Loading workspaces..." }) }), _jsx("div", { className: "workspace-list__skeleton", children: [1, 2, 3].map(i => (_jsxs("div", { className: "workspace-item workspace-item--skeleton", children: [_jsx("div", { className: "workspace-item__avatar" }), _jsxs("div", { className: "workspace-item__content", children: [_jsx("div", { className: "workspace-item__name" }), _jsx("div", { className: "workspace-item__description" })] })] }, i))) })] }));
    }
    return (_jsxs("div", { className: "workspace-list", children: [_jsxs("div", { className: "workspace-list__header", children: [_jsxs("h3", { children: ["Your Workspaces (", workspaces.length, ")"] }), _jsx("div", { className: "workspace-list__search", children: _jsx("input", { type: "text", placeholder: "Search workspaces...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "search-input" }) }), _jsx("div", { className: "workspace-list__filters", children: _jsxs("select", { value: filterBy, onChange: (e) => setFilterBy(e.target.value), className: "filter-select", children: [_jsx("option", { value: "all", children: "All workspaces" }), _jsx("option", { value: "owner", children: "Owned by me" }), _jsx("option", { value: "member", children: "Member of" })] }) })] }), _jsx("div", { className: "workspace-list__items", children: filteredWorkspaces.length === 0 ? (_jsx("div", { className: "workspace-list__empty", children: searchTerm || filterBy !== 'all' ? (_jsx("p", { children: "No workspaces match your filters." })) : (_jsx("p", { children: "You don't have any workspaces yet. Create one to get started!" })) })) : (filteredWorkspaces.map(workspace => (_jsx(WorkspaceItem, { workspace: workspace, isSelected: selectedWorkspace?.id === workspace.id, onSelect: () => onWorkspaceSelect(workspace) }, workspace.id)))) })] }));
};
const WorkspaceItem = ({ workspace, isSelected, onSelect, }) => {
    const isOwner = workspace.owner_id === workspace.membership?.user_id;
    const memberCount = 1; // TODO: Get actual member count from API
    return (_jsxs("div", { className: `workspace-item ${isSelected ? 'workspace-item--selected' : ''}`, onClick: onSelect, children: [_jsx("div", { className: "workspace-item__avatar", children: workspace.name.charAt(0).toUpperCase() }), _jsxs("div", { className: "workspace-item__content", children: [_jsxs("div", { className: "workspace-item__header", children: [_jsx("h4", { className: "workspace-item__name", children: workspace.name }), _jsx("div", { className: "workspace-item__badges", children: isOwner && (_jsx("span", { className: "badge badge--owner", children: "Owner" })) })] }), workspace.description && (_jsx("p", { className: "workspace-item__description", children: workspace.description.length > 60
                            ? `${workspace.description.substring(0, 60)}...`
                            : workspace.description })), _jsxs("div", { className: "workspace-item__meta", children: [_jsxs("span", { className: "workspace-item__members", children: [memberCount, " member", memberCount !== 1 ? 's' : ''] }), _jsxs("span", { className: "workspace-item__activity", children: ["Updated ", new Date(workspace.updated_at).toLocaleDateString()] })] })] })] }));
};
export default WorkspaceList;
