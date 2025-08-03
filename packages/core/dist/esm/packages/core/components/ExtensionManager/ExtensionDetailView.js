import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Extension Detail View - Epic 8.4 Story 8.4.5
 * Detailed view component for individual extensions
 */
import { useState } from 'react';
export const ExtensionDetailView = ({ extension,
    status,
    viewMode,
    onToggle,
    onUninstall,
    onUpdate,
    onConfigure,
    onInstall });
onClose;
{
    const [activeTab, setActiveTab] = useState('overview');
    const getExtensionIcon = (type) => { };
    switch (type) {
        case 'node': return '🔧';
        case 'ui': return '🎨';
        case 'transform': return '⚡';
        case 'storage': return '💾';
        default: return '📦';
    }
    ;
    const formatFileSize = (bytes) => {
        if (bytes < 1024)
            return `${bytes} B`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };
    const isInstalled = viewMode === 'installed';
    const canToggle = isInstalled && onToggle;
    const canUninstall = isInstalled && onUninstall;
    const canUpdate = isInstalled && status.updateAvailable && onUpdate;
    const canConfigure = isInstalled && onConfigure;
    const canInstall = !isInstalled && onInstall;
    return;
    _jsxs("div", { className: "extension-detail-view", children: [_jsxs("div", { className: "extension-detail-header", children: [_jsx("button", { className: "back-btn", onClick: onClose, children: "\u2190 Back" }), _jsxs("div", { className: "header-actions", children: [canInstall && ()
                                < button, " className=\"primary-btn install-btn\" onClick=", onInstall, "> Install Extension"] }), ")}", canUpdate && ()
                        < button, " className=\"primary-btn update-btn\" onClick=", onUpdate, "> Update to ", status.availableVersion] }), ")}", canToggle && ()
                < button, "className=", `toggle-btn ${status.enabled ? 'enabled' : 'disabled'}`, "onClick=", onToggle, ">", status.enabled ? 'Disable' : 'Enable'] });
}
div >
;
div >
    { /* Extension Info */}
    < div;
className = "extension-info-section" >
    _jsxs("div", { className: "extension-header", children: [_jsx("div", { className: "extension-icon-large", children: getExtensionIcon(extension.extension_type) }), _jsxs("div", { className: "extension-details", children: [_jsx("h1", { className: "extension-name", children: extension.name }), _jsxs("div", { className: "extension-meta", children: [_jsxs("span", { className: "author", children: ["by ", extension.author] }), _jsx("span", { className: "separator", children: "\u2022" }), _jsxs("span", { className: "version", children: ["v", extension.version] }), _jsx("span", { className: "separator", children: "\u2022" }), _jsxs("span", { className: "type", children: [extension.extension_type, " extension"] })] }), _jsx("p", { className: "extension-description", children: extension.description }), isInstalled && ()
                        < div, " className=\"extension-status-info\">", _jsxs("span", { className: `status-badge ${status.enabled ? 'enabled' : 'disabled'}`, children: ["}", status.enabled ? '✅ Enabled' : '⭕ Disabled'] }), status.hasErrors && ()
                        < span, " className=\"status-badge error\"> \u274C Error: ", status.lastError] }), ")}", status.updateAvailable && ()
                < span, " className=\"status-badge update\"> \u2B06\uFE0F Update Available"] });
div >
;
div >
;
div >
    { /* Quick Stats */}
    < div;
className = "extension-stats" >
    (_jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Version" }), _jsx("span", { className: "stat-value", children: extension.version })] })
        ,
            _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Type" }), _jsx("span", { className: "stat-value", children: extension.extension_type })] })
                ,
                    _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Size" }), _jsx("span", { className: "stat-value", children: formatFileSize(Math.random() * 1024 * 1024) })] })
                        ,
                            _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Downloads" }), _jsx("span", { className: "stat-value", children: Math.floor(Math.random() * 10000).toLocaleString() })] }));
div >
;
div >
    { /* Tabs */}
    < div;
className = "extension-detail-tabs" >
    (_jsx("button", { className: activeTab === 'overview' ? 'active' : '', onClick: () => setActiveTab('overview'), children: "Overview" })
        ,
            _jsx("button", { className: activeTab === 'permissions' ? 'active' : '', onClick: () => setActiveTab('permissions'), children: "Permissions" })
                ,
                    _jsx("button", { className: activeTab === 'dependencies' ? 'active' : '', onClick: () => setActiveTab('dependencies'), children: "Dependencies" }));
{
    isInstalled && ()
        < button;
    className = { activeTab } === 'configuration' ? 'active' : '';
}
onClick = {}();
setActiveTab('configuration');
    >
        Configuration;
button >
;
div >
    { /* Tab Content */}
    < div;
className = "extension-detail-content" >
    { activeTab } === 'overview' && ()
    < div;
className = "overview-tab" >
    (_jsxs("section", { className: "detail-section", children: [_jsx("h3", { children: "Description" }), _jsx("p", { children: extension.description })] })
        ,
            _jsxs("section", { className: "detail-section", children: [_jsx("h3", { children: "Capabilities" }), _jsx("div", { className: "capabilities-grid", children: _jsxs("div", { className: "capability-group", children: [_jsx("h4", { children: "Provides" }), _jsx("ul", { children: extension.capabilities?.provides?.map((capability, index) => ()
                                        < li, key = { index } > { capability }) }), ")) || ", _jsx("li", { children: "No capabilities specified" }), "}"] }) }), _jsxs("div", { className: "capability-group", children: [_jsx("h4", { children: "Requires" }), _jsx("ul", { children: extension.capabilities?.requires?.map((requirement, index) => ()
                                    < li, key = { index } > { requirement }) }), ")) || ", _jsx("li", { children: "No requirements specified" }), "}"] })] }));
div >
;
section >
    { extension, : .runtime && ()
            < section, className = "detail-section" >
            (_jsx("h3", { children: "Runtime Information" })
                ,
                    _jsxs("div", { className: "runtime-info", children: [_jsxs("div", { className: "info-item", children: [_jsx("span", { className: "label", children: "Entry Point:" }), _jsx("span", { className: "value", children: extension.runtime.entry_point })] }), extension.runtime.node_types && ()
                                < div, " className=\"info-item\">", _jsx("span", { className: "label", children: "Node Types:" }), _jsx("span", { className: "value", children: extension.runtime.node_types.join(', ') })] }))
    };
{
    extension.runtime.storage_providers && ()
        < div;
    className = "info-item" >
        (_jsx("span", { className: "label", children: "Storage Providers:" })
            ,
                _jsx("span", { className: "value", children: extension.runtime.storage_providers.join(', ') }));
    div >
    ;
}
div >
;
section >
;
{
    extension.ui && ()
        < section;
    className = "detail-section" >
        (_jsx("h3", { children: "UI Components" })
            ,
                _jsxs("div", { className: "ui-info", children: [extension.ui.themes && ()
                            < div, " className=\"info-item\">", _jsx("span", { className: "label", children: "Themes:" }), _jsx("span", { className: "value", children: extension.ui.themes.join(', ') })] }));
}
{
    extension.ui.components && ()
        < div;
    className = "info-item" >
        (_jsx("span", { className: "label", children: "Components:" })
            ,
                _jsx("span", { className: "value", children: extension.ui.components.join(', ') }));
    div >
    ;
}
div >
;
section >
;
div >
;
{
    activeTab === 'permissions' && ()
        < div;
    className = "permissions-tab" >
        _jsxs("section", { className: "detail-section", children: [_jsx("h3", { children: "Required Permissions" }), extension.permissions && extension.permissions.length > 0 ? ()
                    < div : , " className=\"permissions-list\">", extension.permissions.map((permission, index) => ()
                    < div, key = { index }, className = "permission-item" >
                    (_jsx("span", { className: "permission-name", children: permission })
                        ,
                            _jsx("span", { className: "permission-description", children: getPermissionDescription(permission) })))] });
}
div >
;
()
    < p > This;
extension;
does;
not;
request;
any;
special;
permissions.;
p >
;
section >
    { extension, : .security && ()
            < section, className = "detail-section" >
            (_jsx("h3", { children: "Security Configuration" })
                ,
                    _jsxs("div", { className: "security-info", children: [extension.security.sandbox && ()
                                < div, " className=\"info-item\">", _jsx("span", { className: "label", children: "Sandboxed:" }), _jsx("span", { className: "value", children: extension.security.sandbox.enabled ? 'Yes' : 'No' })] }))
    };
{
    extension.security.content_security_policy && ()
        < div;
    className = "info-item" >
        (_jsx("span", { className: "label", children: "CSP:" })
            ,
                _jsx("span", { className: "value", children: extension.security.content_security_policy }));
    div >
    ;
}
{
    extension.security.trusted_domains && ()
        < div;
    className = "info-item" >
        (_jsx("span", { className: "label", children: "Trusted Domains:" })
            ,
                _jsx("span", { className: "value", children: extension.security.trusted_domains.join(', ') }));
    div >
    ;
}
div >
;
section >
;
div >
;
{
    activeTab === 'dependencies' && ()
        < div;
    className = "dependencies-tab" >
        _jsxs("section", { className: "detail-section", children: [_jsx("h3", { children: "System Dependencies" }), _jsxs("div", { className: "dependency-item", children: [_jsx("span", { className: "dependency-name", children: "System Version" }), _jsx("span", { className: "dependency-version", children: extension.dependencies?.system_version || 'Any' }), _jsx("span", { className: "dependency-status satisfied", children: "\u2705" })] })] });
    {
        extension.dependencies?.extensions && Object.keys(extension.dependencies.extensions).length > 0 && ()
            < section;
        className = "detail-section" >
            (_jsx("h3", { children: "Extension Dependencies" })
                ,
                    _jsx("div", { className: "dependencies-list", children: Object.entries(extension.dependencies.extensions).map(([depId, version], index) => ()
                            < div, key = { index }, className = "dependency-item" >
                            (_jsx("span", { className: "dependency-name", children: depId })
                                ,
                                    _jsx("span", { className: "dependency-version", children: version })
                                        ,
                                            _jsx("span", { className: "dependency-status satisfied", children: "\u2705" }))) }));
    }
    div >
    ;
    section >
    ;
}
{
    extension.compatibility && ()
        < section;
    className = "detail-section" >
        (_jsx("h3", { children: "Compatibility" })
            ,
                _jsxs("div", { className: "compatibility-info", children: [extension.compatibility.min_system_version && ()
                            < div, " className=\"info-item\">", _jsx("span", { className: "label", children: "Minimum System Version:" }), _jsx("span", { className: "value", children: extension.compatibility.min_system_version })] }));
}
{
    extension.compatibility.platforms && ()
        < div;
    className = "info-item" >
        (_jsx("span", { className: "label", children: "Supported Platforms:" })
            ,
                _jsx("span", { className: "value", children: extension.compatibility.platforms.join(', ') }));
    div >
    ;
}
{
    extension.compatibility.browsers && ()
        < div;
    className = "info-item" >
        (_jsx("span", { className: "label", children: "Browser Requirements:" })
            ,
                _jsx("div", { className: "browser-list", children: Object.entries(extension.compatibility.browsers).map(([browser, version]) => ()
                        < span, key = { browser }, className = "browser-item" >
                        { browser }, { version }) }));
}
div >
;
div >
;
div >
;
section >
;
div >
;
{
    activeTab === 'configuration' && isInstalled && ()
        < div;
    className = "configuration-tab" >
        (_jsxs("section", { className: "detail-section", children: [_jsx("h3", { children: "Extension Configuration" }), _jsxs("div", { className: "config-actions", children: [canConfigure && ()
                            < button, " className=\"config-btn\" onClick=", onConfigure, "> \u2699\uFE0F Open Configuration"] }), ")}", _jsx("button", { className: "config-btn", children: "\uD83D\uDCE4 Export Settings" }), _jsx("button", { className: "config-btn", children: "\uD83D\uDCE5 Import Settings" })] })
            ,
                _jsxs("div", { className: "config-info", children: [_jsx("p", { children: "Extension configuration allows you to customize behavior and settings specific to this extension." }), status.hasErrors && ()
                            < div, " className=\"config-warning\">", _jsx("span", { className: "warning-icon", children: "\u26A0\uFE0F" }), _jsx("span", { children: "This extension has configuration errors that need to be resolved." })] }));
}
div >
;
section >
;
div >
;
div >
    { /* Footer Actions */}
    < div;
className = "extension-detail-footer" >
    _jsxs("div", { className: "footer-left", children: [canUninstall && ()
                < button, " className=\"danger-btn\" onClick=", onUninstall, "> \uD83D\uDDD1\uFE0F Uninstall Extension"] });
div >
    _jsxs("div", { className: "footer-right", children: [_jsx("button", { className: "secondary-btn", children: "\uD83D\uDCCB Report Issue" }), _jsx("button", { className: "secondary-btn", children: "\u2B50 Rate Extension" })] });
div >
;
div >
;
;
;
// Helper function to get permission descriptions
function getPermissionDescription(permission) {
    const descriptions = {
        'data-processing': 'Access and process data within the application',
        'file-system-read': 'Read files from the local file system',
        'file-system-write': 'Write files to the local file system',
        'network': 'Make network requests to external services',
        'ui-components': 'Add or modify user interface components',
        'extensions-api': 'Interact with other extensions',
        'system-info': 'Access system information and statistics',
        'data-storage': 'Store and retrieve persistent data'
    };
}
;
return descriptions[permission] || 'Access to system functionality';
export default ExtensionDetailView;
