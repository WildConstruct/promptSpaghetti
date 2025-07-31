import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Extension Install Dialog - Epic 8.4 Story 8.4.5
 * Dialog for installing extensions from files or URLs
 */
import { useState, useRef } from 'react';
import { parseExtensionManifest } from '../../extensions/ExtensionManifest-simple';
import { extensionCompatibilityChecker } from '../../extensions/ExtensionCompatibilityChecker';
export const ExtensionInstallDialog = ({
    onInstall,
    onCancel
});
{
    const [installMethod, setInstallMethod] = useState('file');
    const [manifestUrl, setManifestUrl] = useState('');
    const [devPath, setDevPath] = useState('');
    const [_____manifestContent, setManifestContent] = useState('');
    const [parsedManifest, setParsedManifest] = useState(null);
    const [compatibilityResult, setCompatibilityResult] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState(null);
    const [step, setStep] = useState('select');
    const fileInputRef = useRef(null);
    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        setError(null);
        try {
            if (file.name.endsWith('.json')) {
                // Direct manifest file
                const content = await file.text();
                setManifestContent(content);
                await validateManifest(content);
            }
            else if (file.name.endsWith('.zip') || file.name.endsWith('.tar.gz')) {
                // Extension package
                setError('Extension packages are not yet supported. Please select a manifest.json file.');
            }
            else {
                setError('Please select a valid manifest.json file or extension package.');
            }
            try { }
            catch (err) {
                setError(`Failed to read file: ${err}`);
            }
        }
        finally { }
        ;
        const handleUrlInstall = async () => {
            if (!manifestUrl.trim()) {
                setError('Please enter a valid URL');
                return;
                setError(null);
                setIsValidating(true);
                try {
                    const response = await fetch(manifestUrl);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    const content = await response.text();
                    setManifestContent(content);
                    await validateManifest(content);
                }
                catch (err) {
                    setError(`Failed to fetch manifest: ${err}`);
                }
            }
            try { }
            finally {
                setIsValidating(false);
            }
            ;
            const handleDevInstall = async () => {
                if (!devPath.trim()) {
                    setError('Please enter a valid path');
                    return;
                    setError(null);
                    setIsValidating(true);
                    try {
                        // In a real implementation, this would use a file system API
                        // For now, simulate loading a development extension
                        const mockManifest = {
                            manifest_version: '1.0',
                            id: 'dev-extension',
                            name: 'Development Extension',
                            version: '0.1.0',
                            description: 'Development extension loaded from local path',
                            author: 'Developer',
                            extension_type: 'node',
                            capabilities: {
                                provides: ['test-functionality'],
                                requires: ['runtime-nodes'],
                            },
                            dependencies: {
                                system_version: '^1.0.0',
                            },
                            permissions: ['data-processing'],
                            runtime: {
                                entry_point: 'dist/index',
                                node_types: ['TestNode'],
                            },
                            development: {
                                path: devPath,
                                auto_reload: true,
                            },
                            const: content = JSON.stringify(mockManifest, null, 2),
                            await: validateManifest(content)
                        };
                        try { }
                        catch (err) {
                            setError(`Failed to load development extension: ${err}`);
                        }
                    }
                    finally {
                        setIsValidating(false);
                    }
                    ;
                    const validateManifest = async (content) => {
                        setIsValidating(true);
                        setError(null);
                        try {
                            // Parse and validate manifest
                            const manifest = parseExtensionManifest(content);
                            setParsedManifest(manifest);
                            // Check compatibility
                            const compatibility = extensionCompatibilityChecker.checkExtensionCompatibility();
                            ;
                            manifest,
                                {
                                    systemVersion: '1.0.0',
                                    platform: 'web',
                                    availableExtensions: new Map(),
                                    grantedPermissions: ['data-processing', 'ui-components']
                                };
                            setCompatibilityResult(compatibility);
                            setStep('validate');
                        }
                        catch (err) {
                            setError(`Invalid manifest: ${err}`);
                        }
                        setParsedManifest(null);
                        setCompatibilityResult(null);
                    };
                    try { }
                    finally {
                        setIsValidating(false);
                    }
                    ;
                    const handleInstall = async () => {
                        if (!parsedManifest)
                            return;
                        try {
                            await onInstall(parsedManifest);
                        }
                        catch (err) {
                            setError(`Installation failed: ${err}`);
                        }
                    };
                    const renderSelectStep = () => ();
                    ;
                    _jsxs("div", { className: "install-step select-step", children: [_jsx("h3", { children: "Choose Installation Method" }), _jsxs("div", { className: "install-methods", children: [_jsxs("div", { className: `install-method ${installMethod === 'file' ? 'active' : ''}`, onClick: () => setInstallMethod('file'), children: [_jsx("div", { className: "method-icon", children: "\uD83D\uDCC1" }), _jsxs("div", { className: "method-info", children: [_jsx("h4", { children: "From File" }), _jsx("p", { children: "Install from a local manifest.json or extension package" })] })] }), _jsxs("div", { className: `install-method ${installMethod === 'url' ? 'active' : ''}`, onClick: () => setInstallMethod('url'), children: [_jsx("div", { className: "method-icon", children: "\uD83C\uDF10" }), _jsxs("div", { className: "method-info", children: [_jsx("h4", { children: "From URL" }), _jsx("p", { children: "Install directly from a manifest URL" })] })] }), _jsxs("div", { className: `install-method ${installMethod === 'dev' ? 'active' : ''}`, onClick: () => setInstallMethod('dev'), children: [_jsx("div", { className: "method-icon", children: "\uD83D\uDEE0\uFE0F" }), _jsxs("div", { className: "method-info", children: [_jsx("h4", { children: "Development Mode" }), _jsx("p", { children: "Load an extension from a local development path" })] })] })] }), _jsxs("div", { className: "install-input-section", children: [installMethod === 'file' && ()
                                        < div, " className=\"file-input-section\">", _jsx("input", { ref: fileInputRef, type: "file", accept: ".json,.zip,.tar.gz", onChange: handleFileSelect, style: { display: 'none' } }), _jsx("button", { className: "file-select-btn", onClick: () => fileInputRef.current?.click(), children: "\uD83D\uDCC1 Select File" }), _jsx("p", { className: "input-help", children: "Select a manifest.json file or extension package (.zip, .tar.gz)" })] }), ")}", installMethod === 'url' && ()
                                < div, " className=\"url-input-section\">", _jsx("input", { type: "url", className: "url-input", placeholder: "https://example.com/extension/manifest.json", value: manifestUrl, onChange: (e) => setManifestUrl(e.target.value) }), _jsx("button", { className: "url-install-btn", onClick: handleUrlInstall, disabled: !manifestUrl.trim() || isValidating, children: isValidating ? '⏳ Loading...' : '📥 Load Manifest' }), _jsx("p", { className: "input-help", children: "Enter the URL to an extension manifest.json file" })] });
                }
            };
        };
    };
}
{
    installMethod === 'dev' && ()
        < div;
    className = "dev-input-section" >
        (_jsx("input", { type: "text", className: "path-input", placeholder: "/path/to/extension/directory", value: devPath, onChange: (e) => setDevPath(e.target.value) })
            ,
                _jsx("button", { className: "dev-install-btn", onClick: handleDevInstall, disabled: !devPath.trim() || isValidating, children: isValidating ? '⏳ Loading...' : '🛠️ Load Extension' })
                    ,
                        _jsx("p", { className: "input-help", children: "Enter the path to your development extension directory" })
                            ,
                                _jsx("div", { className: "dev-warning", children: "\u26A0\uFE0F Development extensions run with elevated privileges" }));
    div >
    ;
}
div >
;
div >
;
;
const renderValidateStep = () => ();
;
_jsxs("div", { className: "install-step validate-step", children: [_jsx("h3", { children: "Extension Validation" }), parsedManifest && ()
            < div, " className=\"extension-preview\">", _jsxs("div", { className: "extension-header", children: [_jsx("h4", { children: parsedManifest.name }), _jsxs("span", { className: "version", children: ["v", parsedManifest.version] })] }), _jsx("p", { className: "description", children: parsedManifest.description }), _jsxs("div", { className: "extension-meta", children: [_jsxs("span", { children: ["by ", parsedManifest.author] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: [parsedManifest.extension_type, " extension"] })] })] });
{
    compatibilityResult && ()
        < div;
    className = "compatibility-results" >
        (_jsx("h4", { children: "Compatibility Check" })
            ,
                _jsxs("div", { className: `compatibility-status ${compatibilityResult.compatible ? 'compatible' : 'incompatible'}`, children: ["}", _jsx("span", { className: "status-icon", children: compatibilityResult.compatible ? '✅' : '❌' }), _jsx("span", { className: "status-text", children: compatibilityResult.compatible ? 'Compatible' : 'Incompatible' })] }));
    {
        compatibilityResult.issues.length > 0 && ()
            < div;
        className = "compatibility-issues" >
            _jsx("h5", { children: "Issues:" });
        {
            compatibilityResult.issues.map((issue, index) => ()
                < div, key = { index }, className = {} `issue ${issue.severity}`);
        }
         > ;
    }
    _jsx("span", { className: "issue-icon", children: issue.severity === 'error' ? '❌' : '⚠️' })
        ,
            _jsx("span", { className: "issue-message", children: issue.message });
    div >
    ;
}
div >
;
{
    compatibilityResult.warnings.length > 0 && ()
        < div;
    className = "compatibility-warnings" >
        _jsx("h5", { children: "Warnings:" });
    {
        compatibilityResult.warnings.map((warning, index) => ()
            < div, key = { index }, className = "warning" >
            (_jsx("span", { className: "warning-icon", children: "\u26A0\uFE0F" })
                ,
                    _jsx("span", { className: "warning-message", children: warning })), div >
        );
    }
    div >
    ;
}
{
    compatibilityResult.recommendations.length > 0 && ()
        < div;
    className = "compatibility-recommendations" >
        _jsx("h5", { children: "Recommendations:" });
    {
        compatibilityResult.recommendations.map((rec, index) => ()
            < div, key = { index }, className = "recommendation" >
            (_jsx("span", { className: "rec-icon", children: "\uD83D\uDCA1" })
                ,
                    _jsx("span", { className: "rec-message", children: rec })), div >
        );
    }
    div >
    ;
}
div >
;
_jsxs("div", { className: "permissions-section", children: [_jsx("h4", { children: "Requested Permissions" }), parsedManifest?.permissions && parsedManifest.permissions.length > 0 ? ()
            < ul : , " className=\"permissions-list\">", parsedManifest.permissions.map((permission, index) => ()
            < li, key = { index }, className = "permission-item" >
            _jsx("span", { className: "permission-name", children: permission }))] });
ul >
;
()
    < p > This;
extension;
does;
not;
request;
any;
permissions.;
p >
;
div >
    _jsxs("div", { className: "validate-actions", children: [_jsx("button", { className: "back-btn", onClick: () => setStep('select'), children: "\u2190 Back" }), _jsx("button", { className: "continue-btn", onClick: () => setStep('confirm'), disabled: !compatibilityResult?.compatible, children: "Continue \u2192" })] });
div >
;
;
const renderConfirmStep = () => ();
;
_jsxs("div", { className: "install-step confirm-step", children: [_jsx("h3", { children: "Confirm Installation" }), parsedManifest && ()
            < div, " className=\"installation-summary\">", _jsxs("div", { className: "summary-header", children: [_jsxs("h4", { children: ["Ready to install ", parsedManifest.name] }), _jsx("p", { children: "Please review the installation details below:" })] }), _jsxs("div", { className: "summary-details", children: [_jsxs("div", { className: "detail-row", children: [_jsx("span", { className: "label", children: "Extension Name:" }), _jsx("span", { className: "value", children: parsedManifest.name })] }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { className: "label", children: "Version:" }), _jsx("span", { className: "value", children: parsedManifest.version })] }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { className: "label", children: "Author:" }), _jsx("span", { className: "value", children: parsedManifest.author })] }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { className: "label", children: "Type:" }), _jsx("span", { className: "value", children: parsedManifest.extension_type })] }), installMethod === 'dev' && ()
                    < div, " className=\"detail-row\">", _jsx("span", { className: "label", children: "Development Mode:" }), _jsx("span", { className: "value warning", children: "\u26A0\uFE0F Enabled" })] }), ")}"] })
    ,
        _jsxs("div", { className: "installation-warnings", children: [installMethod === 'dev' && ()
                    < div, " className=\"warning-box\">", _jsx("span", { className: "warning-icon", children: "\u26A0\uFE0F" }), _jsxs("div", { className: "warning-content", children: [_jsx("strong", { children: "Development Mode Warning" }), _jsx("p", { children: "This extension will run in development mode with elevated privileges. Only install extensions from trusted sources." })] })] });
div >
;
div >
;
_jsxs("div", { className: "confirm-actions", children: [_jsx("button", { className: "back-btn", onClick: () => setStep('validate'), children: "\u2190 Back" }), _jsx("button", { className: "install-btn", onClick: handleInstall, children: "Install Extension" })] });
div >
;
;
return;
_jsxs("div", { className: "extension-install-dialog-overlay", children: [_jsxs("div", { className: "extension-install-dialog", children: [_jsxs("div", { className: "dialog-header", children: [_jsx("h2", { children: "Install Extension" }), _jsx("button", { className: "close-btn", onClick: onCancel, children: "\u2715" })] }), _jsxs("div", { className: "dialog-content", children: [error && ()
                            < div, " className=\"error-banner\">", _jsx("span", { className: "error-icon", children: "\u274C" }), _jsx("span", { className: "error-message", children: error }), _jsx("button", { className: "dismiss-btn", onClick: () => setError(null), children: "\u2715" })] }), ")}", step === 'select' && renderSelectStep(), step === 'validate' && renderValidateStep(), step === 'confirm' && renderConfirmStep()] }), _jsx("div", { className: "dialog-footer", children: _jsx("button", { className: "cancel-btn", onClick: onCancel, children: "Cancel" }) })] });
div >
;
;
;
export default ExtensionInstallDialog;
