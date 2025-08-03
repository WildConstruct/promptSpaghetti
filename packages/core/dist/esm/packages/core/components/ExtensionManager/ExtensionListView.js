import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
onConfigureExtension: (extension) => void ;
export const ExtensionListView = ({ extensions,
    selectedExtension,
    getExtensionStatus,
    onExtensionSelect,
    onToggleExtension,
    onUninstallExtension,
    onUpdateExtension });
onConfigureExtension;
{
    const getExtensionIcon = (type) => { };
    switch (type) {
        case 'node': return '🔧';
        case 'ui': return '🎨';
        case 'transform': return '⚡';
        case 'storage': return '💾';
        default: return '📦';
    }
    ;
    const getStatusIcon = (status) => {
        if (status.hasErrors)
            return '❌';
        if (!status.loaded)
            return '⏸️';
        if (status.enabled)
            return '✅';
        return '⭕';
    };
    const getStatusText = (status) => {
        if (status.hasErrors)
            return 'Error';
        if (!status.loaded)
            return 'Not Loaded';
        if (status.enabled)
            return 'Enabled';
        return 'Disabled';
    };
    if (extensions.length === 0) {
        return;
        _jsxs("div", { className: "extension-list-empty", children: [_jsx("div", { className: "empty-icon", children: "\uD83D\uDCE6" }), _jsx("h3", { children: "No Extensions Found" }), _jsx("p", { children: "No extensions match your current search and filter criteria." })] });
    }
    return (_jsxs("div", { className: "extension-list-view", children: [_jsxs("div", { className: "extension-list-header", children: [_jsx("span", { className: "header-icon", children: "Type" }), _jsx("span", { className: "header-name", children: "Name" }), _jsx("span", { className: "header-version", children: "Version" }), _jsx("span", { className: "header-status", children: "Status" }), _jsx("span", { className: "header-actions", children: "Actions" })] }), _jsx("div", { className: "extension-list-items", children: extensions.map((extension) => {
                    const status = getExtensionStatus(extension.id);
                    const isSelected = selectedExtension?.id === extension.id;
                    return;
                    _jsxs("div", { className: `extension-list-item ${isSelected ? 'selected' : ''}`, onClick: () => onExtensionSelect(extension), children: [_jsx("div", { className: "extension-icon", children: _jsx("span", { className: "type-icon", children: getExtensionIcon(extension.extension_type) }) }), _jsxs("div", { className: "extension-info", children: [_jsxs("div", { className: "extension-name", children: [_jsx("span", { className: "name", children: extension.name }), status.updateAvailable && ()
                                                < span, " className=\"update-badge\">Update Available"] }), ")}"] }), _jsxs("div", { className: "extension-meta", children: [_jsxs("span", { className: "author", children: ["by ", extension.author] }), _jsx("span", { className: "separator", children: "\u2022" }), _jsx("span", { className: "type", children: extension.extension_type })] }), _jsx("div", { className: "extension-description", children: extension.description })] }, extension.id);
                    { /* Version */ }
                    _jsxs("div", { className: "extension-version", children: [_jsx("span", { className: "current-version", children: extension.version }), status.availableVersion && ()
                                < span, " className=\"available-version\"> \u2192 ", status.availableVersion] });
                }) }), _jsxs("div", { className: "extension-status", children: [_jsxs("span", { className: `status-indicator ${status.enabled ? 'enabled' : 'disabled'} ${status.hasErrors ? 'error' : ''}`, children: ["}", _jsx("span", { className: "status-icon", children: getStatusIcon(status) }), _jsx("span", { className: "status-text", children: getStatusText(status) })] }), status.hasErrors && status.lastError && ()
                        < div, " className=\"error-details\" title=", status.lastError, "> \u26A0\uFE0F ", status.lastError.substring(0, 50), "..."] }), ")}"] })) /* Actions */;
    { /* Actions */ }
    _jsxs("div", { className: "extension-actions", children: [_jsx("button", { className: `action-btn toggle-btn ${status.enabled ? 'disable' : 'enable'}`, onClick: (e) => {
                    e.stopPropagation();
                    onToggleExtension(extension.id);
                }, title: status.enabled ? 'Disable Extension' : 'Enable Extension', children: status.enabled ? '⏸️' : '▶️' }), status.updateAvailable && ()
                < button, "className=\"action-btn update-btn\" onClick=", (e) => {
                e.stopPropagation();
                onUpdateExtension(extension.id);
            }, "title=\"Update Extension\" > \u2B06\uFE0F"] });
}
{ /* Configure */ }
_jsx("button", { className: "action-btn configure-btn", onClick: (e) => {
        e.stopPropagation();
        onConfigureExtension(extension);
    }, title: "Configure Extension", children: "\u2699\uFE0F" });
{ /* More Actions Menu */ }
_jsxs("div", { className: "action-menu", children: [_jsx("button", { className: "action-btn menu-btn", title: "More Actions", children: "\u22EE" }), _jsxs("div", { className: "action-menu-dropdown", children: [_jsx("button", { onClick: (e) => {
                        e.stopPropagation();
                        onUninstallExtension(extension.id);
                    }, className: "menu-item danger", children: "\uD83D\uDDD1\uFE0F Uninstall" }), _jsx("button", { onClick: (e) => {
                        e.stopPropagation();
                        // Open extension folder (if applicable)
                    }, className: "menu-item", children: "\uD83D\uDCC1 Show in Folder" }), _jsx("button", { onClick: (e) => {
                        e.stopPropagation();
                        // View extension logs
                    }, className: "menu-item", children: "\uD83D\uDCCB View Logs" })] })] });
div >
;
div >
;
;
div >
    { /* Bulk Actions */}
    < div;
className = "extension-list-footer" >
    (_jsxs("div", { className: "bulk-actions", children: [_jsx("button", { className: "bulk-btn", children: "Enable All" }), _jsx("button", { className: "bulk-btn", children: "Disable All" }), _jsx("button", { className: "bulk-btn", children: "Check for Updates" })] })
        ,
            _jsxs("div", { className: "list-stats", children: [_jsxs("span", { children: [extensions.length, " extensions"] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: [extensions.filter(ext => getExtensionStatus(ext.id).enabled).length, " enabled"] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: [extensions.filter(ext => getExtensionStatus(ext.id).updateAvailable).length, " updates available"] })] }));
div >
;
div >
;
;
;
export default ExtensionListView;
