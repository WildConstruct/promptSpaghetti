import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Template Import/Export Dialog
 * Advanced UI for importing and exporting templates with versioning support
 */
import { useState, useCallback, useRef } from 'react';
import { FiUpload, FiDownload, FiGitBranch, FiPackage, FiCheck, FiAlert, FiX, FiFile, FiGlobe, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
;
export const TemplateImportExportDialog = ({
    isOpen,
    onClose,
    mode,
    template,
    onImportComplete,
    onExportComplete,
    className = ''
});
{
    // Import state
    const [importSource, setImportSource] = useState('file');
    const [importStep, setImportStep] = useState('source');
    const [importFile, setImportFile] = useState(null);
    const [importUrl, setImportUrl] = useState('');
    const [gitConfig, setGitConfig] = useState({});
    url: '',
        branch;
    'main',
        username;
    '',
        token;
    '',
    ;
}
;
// Export state
const [_____exportStep, setExportStep] = useState('format');
const [_____exportFormat, _____setExportFormat] = useState('json');
const [selectedVersionId, setSelectedVersionId] = useState('');
// Common state
const [loading, setLoading] = useState(false);
const [validation, setValidation] = useState(null);
const [errors, setErrors] = useState([]);
const [warnings, setWarnings] = useState([]);
const [importOptions, setImportOptions] = useState({});
format: 'json',
    source;
'',
    merge_strategy;
'replace',
    resolve_conflicts;
'auto',
    update_dependencies;
true,
    create_backup;
true,
    validate_schema;
true,
    validate_dependencies;
true,
    validate_compatibility;
true,
;
;
const [exportOptions, setExportOptions] = useState({});
format: 'json',
    include_version_history;
false,
    include_dependencies;
true,
    include_analytics;
false,
    bundle_dependencies;
true,
    compress;
true,
;
;
const fileInputRef = useRef(null);
// Import handlers
const handleFileSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
        setImportFile(file);
        setImportOptions(prev => ({}), ...prev, source, file, format, file.name.endsWith('.yaml') || file.name.endsWith('.yml') ? 'yaml' : , file.name.endsWith('.zip') ? 'zip' : , file.name.endsWith('.bundle') ? 'template_bundle' : 'json');
    }
});
[];
;
const handleValidateTemplate = async () => {
    setLoading(true);
    setErrors([]);
    setWarnings([]);
    try {
        // Validate input source
        if (!importFile && !importUrl && !gitConfig.url) {
            throw new Error('Please select a template source');
            if (importSource === 'file' && !importFile) {
                throw new Error('Please select a file to import');
                if (importSource === 'url' && !importUrl) {
                    throw new Error('Please enter a valid URL');
                    if (importSource === 'git' && !gitConfig.url) {
                        throw new Error('Please enter a valid Git repository URL');
                        // Validate file type for file imports
                        if (importFile) {
                            const allowedExtensions = ['.json', '.yaml', '.yml', '.zip', '.bundle'];
                            const hasValidExtension = allowedExtensions.some(ext => );
                            ;
                            importFile.name.toLowerCase().endsWith(ext);
                        }
                    }
                }
            }
        }
    }
    finally {
    }
};
;
if (!hasValidExtension) {
    throw new Error('Invalid file type. Supported formats: JSON, YAML, ZIP, Bundle');
    // Check file size (max 50MB)
    if (importFile.size > 50 * 1024 * 1024) {
        throw new Error('File size exceeds maximum limit of 50MB');
        // Validate URL format
        if (importSource === 'url' && importUrl) {
            try {
                new URL(importUrl);
            }
            catch {
                throw new Error('Invalid URL format');
                // Mock validation - in real implementation, would validate the template
                const mockValidation = {
                    valid: true,
                    warnings: ['Template uses deprecated node type "LegacyTransform"'],
                    errors: [],
                    templateInfo: {
                        name: 'Sample Workflow Template',
                        version: '2.1.0',
                        author: 'Template Creator',
                        dependencies: 2,
                    },
                    setWarnings(mockValidation) { }, : .warnings };
                if (mockValidation.valid) {
                    setImportStep('preview');
                }
                try { }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Validation failed';
                    console.error('Validation failed:', error);
                    setErrors([errorMessage]);
                    setValidation({});
                    valid: false,
                        warnings;
                    [],
                        errors;
                    [errorMessage],
                    ;
                }
                ;
            }
            finally {
                setLoading(false);
            }
            ;
            const handleImportTemplate = async () => {
                setLoading(true);
                setImportStep('import');
                setErrors([]);
                setWarnings([]);
                try {
                    // Additional validation before import
                    if (!validation?.valid) {
                        throw new Error('Template validation must pass before import');
                        // Check for conflicts in merge strategy
                        if (importOptions.merge_strategy === 'manual' && importOptions.resolve_conflicts === 'auto') {
                            setWarnings(prev => [...prev, 'Manual merge strategy with auto conflict resolution may cause issues']);
                            // Mock import result - in real implementation, would call TemplateVersionManager
                            const mockResult = {
                                success: true,
                                imported_version: {
                                    id: 'version-123',
                                    version_number: '2.1.0',
                                    template_id: 'template-456',
                                },
                                warnings: ['Some customization points were updated'],
                                errors: [],
                                original_version: '2.0.0',
                                new_version: '2.1.0',
                                changes_detected: 5,
                                conflicts_resolved: 1,
                                dependencies_updated: 2,
                                migration_applied: false,
                                backup_version_id: 'backup-789',
                                can_rollback: true };
                            // Simulate network delay
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            setImportStep('complete');
                            setWarnings(prev => [...prev, ...mockResult.warnings]);
                            onImportComplete?.(mockResult);
                        }
                        try { }
                        catch (error) {
                            const errorMessage = error instanceof Error ? error.message : 'Import failed';
                            console.error('Import failed:', error);
                            setErrors([errorMessage]);
                            // Reset to previous step on error
                            setImportStep('preview');
                        }
                        finally {
                            setLoading(false);
                        }
                        ;
                        // Export handlers
                        const handleExportTemplate = async () => {
                            setLoading(true);
                            setExportStep('export');
                            setErrors([]);
                            setWarnings([]);
                            try {
                                // Validate template exists
                                if (!template) {
                                    throw new Error('No template selected for export');
                                    // Validate export options
                                    if (exportOptions.include_version_history && !exportOptions.include_dependencies) {
                                        setWarnings(prev => [...prev, 'Exporting version history without dependencies may cause import issues']);
                                        // Mock export - in real implementation, would call TemplateVersionManager
                                        const mockResult = {
                                            download_url: 'https://example.com/download/template-export.json',
                                            filename: 'workflow-template-v1.0.0.json',
                                            size: 245760,
                                            checksum: 'abc123def456',
                                        };
                                        // Simulate processing time
                                        await new Promise(resolve => setTimeout(resolve, 1500));
                                        setExportStep('complete');
                                        onExportComplete?.(mockResult);
                                    }
                                    try { }
                                    catch (error) {
                                        const errorMessage = error instanceof Error ? error.message : 'Export failed';
                                        console.error('Export failed:', error);
                                        setErrors([errorMessage]);
                                        // Reset to format selection on error
                                        setExportStep('format');
                                    }
                                    finally {
                                        setLoading(false);
                                    }
                                    ;
                                    // Render helpers
                                    const renderImportStepIndicator = () => ();
                                    ;
                                    _jsx("div", { className: "flex items-center justify-center mb-6 space-x-2", children: ['source', 'options', 'validation', 'preview', 'import', 'complete'].map((step, index) => ()
                                            < div, key = { step }, className = "flex items-center" >
                                            _jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${importStep === step ? 'bg-blue-600 text-white' : ,
                                                    ['source', 'options', 'validation', 'preview'].indexOf(importStep) > index ? 'bg-green-600 text-white' : ,
                                                    'bg-gray-300 text-gray-600'}`, children: ['source', 'options', 'validation', 'preview'].indexOf(importStep) > index ? _jsx(FiCheck, {}) : index + 1 }), { 5:  && _jsx(FiArrowRight, { className: "mx-2 text-gray-400" }) }) });
                                }
                            }
                            finally {
                            }
                        };
                    }
                }
                finally {
                }
            };
        }
        div >
        ;
        ;
        const renderSourceSelection = () => ();
        ;
        _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Select Import Source" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("button", { onClick: () => setImportSource('file'), className: `p-4 border-2 rounded-lg text-left transition-colors ${importSource === 'file' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
                            }`, children: [_jsx(FiFile, { className: "text-2xl mb-2 text-blue-600" }), _jsx("div", { className: "font-semibold", children: "Local File" }), _jsx("div", { className: "text-sm text-gray-600", children: "Upload JSON, YAML, or ZIP file" })] }), _jsxs("button", { onClick: () => setImportSource('git'), className: `p-4 border-2 rounded-lg text-left transition-colors ${importSource === 'git' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
                            }`, children: [_jsx(FiGitBranch, { className: "text-2xl mb-2 text-green-600" }), _jsx("div", { className: "font-semibold", children: "Git Repository" }), _jsx("div", { className: "text-sm text-gray-600", children: "Import from GitHub, GitLab, etc." })] }), _jsxs("button", { onClick: () => setImportSource('url'), className: `p-4 border-2 rounded-lg text-left transition-colors ${importSource === 'url' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
                            }`, children: [_jsx(FiGlobe, { className: "text-2xl mb-2 text-purple-600" }), _jsx("div", { className: "font-semibold", children: "URL" }), _jsx("div", { className: "text-sm text-gray-600", children: "Download from web URL" })] }), _jsxs("button", { onClick: () => setImportSource('marketplace'), className: `p-4 border-2 rounded-lg text-left transition-colors ${importSource === 'marketplace' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
                            }`, children: [_jsx(FiPackage, { className: "text-2xl mb-2 text-orange-600" }), _jsx("div", { className: "font-semibold", children: "Marketplace" }), _jsx("div", { className: "text-sm text-gray-600", children: "Browse public templates" })] })] }), importSource === 'file' && ()
                    < div, " className=\"mt-4\">", _jsx("input", { ref: fileInputRef, type: "file", accept: ".json,.yaml,.yml,.zip,.bundle", onChange: handleFileSelect, className: "hidden" }), _jsxs("button", { onClick: () => fileInputRef.current?.click(), className: "w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 transition-colors", children: [_jsx(FiUpload, { className: "mx-auto text-3xl text-gray-400 mb-2" }), _jsx("div", { className: "text-gray-600", children: importFile ? importFile.name : 'Click to select file or drag and drop' })] })] });
    }
    {
        importSource === 'git' && ()
            < div;
        className = "mt-4 space-y-3" >
            (_jsx("input", { type: "url", placeholder: "Git repository URL", value: gitConfig.url, onChange: (e) => setGitConfig(prev => ({ ...prev, url: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" })
                ,
                    _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx("input", { type: "text", placeholder: "Branch (default: main)", value: gitConfig.branch, onChange: (e) => setGitConfig(prev => ({ ...prev, branch: e.target.value })), className: "px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" }), _jsx("input", { type: "text", placeholder: "Username (optional)", value: gitConfig.username, onChange: (e) => setGitConfig(prev => ({ ...prev, username: e.target.value })), className: "px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" })] })
                        ,
                            _jsx("input", { type: "password", placeholder: "Access token (optional)", value: gitConfig.token, onChange: (e) => setGitConfig(prev => ({ ...prev, token: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" }));
        div >
        ;
    }
    {
        importSource === 'url' && ()
            < div;
        className = "mt-4" >
            _jsx("input", { type: "url", placeholder: "Template URL", value: importUrl, onChange: (e) => setImportUrl(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" });
        div >
        ;
    }
    div >
    ;
    ;
    const renderImportOptions = () => ();
    ;
    _jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Import Options" }), _jsxs("div", { className: "grid grid-cols-2 gap-6", children: [_jsx("div", { className: "space-y-4", children: _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Merge Strategy" }), _jsx("select", { value: importOptions.merge_strategy, onChange: (e) => setImportOptions(prev => ({}), ...prev, merge_strategy) }), ": e.target.value as 'replace' | 'merge' | 'keep_both'; }))} className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600\" >", _jsx("option", { value: "replace", children: "Replace existing" }), _jsx("option", { value: "merge", children: "Merge with existing" }), _jsx("option", { value: "keep_both", children: "Keep both versions" })] }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Conflict Resolution" }), _jsx("select", { value: importOptions.resolve_conflicts, onChange: (e) => setImportOptions(prev => ({}), ...prev, resolve_conflicts) }), ": e.target.value as 'auto' | 'manual' | 'skip'; }))} className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600\" >", _jsx("option", { value: "auto", children: "Auto resolve" }), _jsx("option", { value: "manual", children: "Manual resolution" }), _jsx("option", { value: "skip", children: "Skip conflicts" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Version Handling" }), _jsx("select", { value: importOptions.version_bump || 'patch', onChange: (e) => setImportOptions(prev => ({}), ...prev, version_bump) }), ": e.target.value as 'patch' | 'minor' | 'major' | 'custom'; }))} className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600\" >", _jsx("option", { value: "patch", children: "Patch (1.0.1)" }), _jsx("option", { value: "minor", children: "Minor (1.1.0)" }), _jsx("option", { value: "major", children: "Major (2.0.0)" }), _jsx("option", { value: "custom", children: "Custom version" })] })] });
    div >
        _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-medium text-gray-700", children: "Validation" }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: importOptions.validate_schema, onChange: (e) => setImportOptions(prev => ({}), ...prev, validate_schema) }), ": e.target.checked ; }))} className=\"mr-2\" />", _jsx("span", { className: "text-sm", children: "Validate template schema" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: importOptions.validate_dependencies, onChange: (e) => setImportOptions(prev => ({}), ...prev, validate_dependencies) }), ": e.target.checked ; }))} className=\"mr-2\" />", _jsx("span", { className: "text-sm", children: "Check dependencies" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: importOptions.validate_compatibility, onChange: (e) => setImportOptions(prev => ({}), ...prev, validate_compatibility) }), ": e.target.checked ; }))} className=\"mr-2\" />", _jsx("span", { className: "text-sm", children: "Validate compatibility" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-medium text-gray-700", children: "Safety" }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: importOptions.create_backup, onChange: (e) => setImportOptions(prev => ({}), ...prev, create_backup) }), ": e.target.checked ; }))} className=\"mr-2\" />", _jsx("span", { className: "text-sm", children: "Create backup before import" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: importOptions.update_dependencies, onChange: (e) => setImportOptions(prev => ({}), ...prev, update_dependencies) }), ": e.target.checked ; }))} className=\"mr-2\" />", _jsx("span", { className: "text-sm", children: "Update dependencies" })] })] })] });
    div >
    ;
    div >
    ;
    ;
    const renderValidationResults = () => ();
    ;
    _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Validation Results" }), validation && ()
                < div, " className=", `p-4 rounded-lg border-2 ${validation.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50',
            }`, ">", _jsxs("div", { className: "flex items-center mb-3", children: [validation.valid ? ()
                        < FiCheck : , " className=\"text-green-600 text-xl mr-2\" /> ) : ()", _jsx(FiX, { className: "text-red-600 text-xl mr-2" }), ")}", _jsx("span", { className: `font-semibold ${validation.valid ? 'text-green-800' : 'text-red-800',
                        }`, children: validation.valid ? 'Template is valid' : 'Template has issues' })] }), validation.templateInfo && ()
                < div, " className=\"bg-white p-3 rounded-lg mb-3\">", _jsx("h4", { className: "font-medium mb-2", children: "Template Information" }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Name:" }), " ", validation.templateInfo.name] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Version:" }), " ", validation.templateInfo.version] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Author:" }), " ", validation.templateInfo.author] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Dependencies:" }), " ", validation.templateInfo.dependencies] })] })] });
}
{
    validation.warnings.length > 0 && ()
        < div;
    className = "mb-3" >
        (_jsxs("h4", { className: "font-medium text-yellow-800 mb-1 flex items-center", children: [_jsx(FiAlert, { className: "mr-1" }), " Warnings"] })
            ,
                _jsx("ul", { className: "text-sm text-yellow-700 space-y-1", children: validation.warnings.map((warning, index) => ()
                        < li, key = { index }, className = "flex items-start" >
                        (_jsx("span", { className: "mr-2", children: "\u2022" })
                            ,
                                _jsx("span", { children: warning }))) }));
}
ul >
;
div >
;
{
    validation.errors.length > 0 && ()
        < div >
        (_jsxs("h4", { className: "font-medium text-red-800 mb-1 flex items-center", children: [_jsx(FiX, { className: "mr-1" }), " Errors"] })
            ,
                _jsx("ul", { className: "text-sm text-red-700 space-y-1", children: validation.errors.map((error, index) => ()
                        < li, key = { index }, className = "flex items-start" >
                        (_jsx("span", { className: "mr-2", children: "\u2022" })
                            ,
                                _jsx("span", { children: error }))) }));
}
ul >
;
div >
;
div >
;
div >
;
;
const renderExportOptions = () => ();
;
_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Export Configuration" }), _jsxs("div", { className: "grid grid-cols-2 gap-6", children: [_jsx("div", { className: "space-y-4", children: _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Export Format" }), _jsx("select", { value: exportOptions.format, onChange: (e) => setExportOptions(prev => ({}), ...prev, format) }), ": e.target.value as 'json' | 'yaml' | 'zip' | 'template_bundle'; }))} className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600\" >", _jsx("option", { value: "json", children: "JSON Format" }), _jsx("option", { value: "yaml", children: "YAML Format" }), _jsx("option", { value: "zip", children: "ZIP Archive" }), _jsx("option", { value: "template_bundle", children: "Template Bundle" })] }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Template Version" }), _jsxs("select", { value: selectedVersionId, onChange: (e) => setSelectedVersionId(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600", children: [_jsx("option", { value: "", children: "Latest version" }), _jsx("option", { value: "v2.1.0", children: "v2.1.0 (Current)" }), _jsx("option", { value: "v2.0.0", children: "v2.0.0" }), _jsx("option", { value: "v1.9.1", children: "v1.9.1" })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-medium text-gray-700", children: "Include" }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: exportOptions.include_version_history, onChange: (e) => setExportOptions(prev => ({}), ...prev, include_version_history) }), ": e.target.checked ; }))} className=\"mr-2\" />", _jsx("span", { className: "text-sm", children: "Version history" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: exportOptions.include_dependencies, onChange: (e) => setExportOptions(prev => ({}), ...prev, include_dependencies) }), ": e.target.checked ; }))} className=\"mr-2\" />", _jsx("span", { className: "text-sm", children: "Dependencies" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: exportOptions.include_analytics, onChange: (e) => setExportOptions(prev => ({}), ...prev, include_analytics) }), ": e.target.checked ; }))} className=\"mr-2\" />", _jsx("span", { className: "text-sm", children: "Usage analytics" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-medium text-gray-700", children: "Bundle Options" }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: exportOptions.bundle_dependencies, onChange: (e) => setExportOptions(prev => ({}), ...prev, bundle_dependencies) }), ": e.target.checked ; }))} className=\"mr-2\" />", _jsx("span", { className: "text-sm", children: "Bundle dependencies" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: exportOptions.compress, onChange: (e) => setExportOptions(prev => ({}), ...prev, compress) }), ": e.target.checked ; }))} className=\"mr-2\" />", _jsx("span", { className: "text-sm", children: "Compress output" })] })] })] })] });
div >
;
;
if (!isOpen)
    return null;
return;
_jsxs("div", { className: `fixed inset-0 z-50 overflow-y-auto ${className}`, children: ["}", _jsxs("div", { className: "flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center", children: [_jsx("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity", onClick: onClose }), _jsxs("div", { className: "inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [mode === 'import' ? _jsx(FiUpload, { className: "mr-2" }) : _jsx(FiDownload, { className: "mr-2" }), mode === 'import' ? 'Import Template' : 'Export Template'] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 transition-colors", children: _jsx(FiX, { size: 24 }) })] }), mode === 'import' ? ()
                            :
                        , renderImportStepIndicator(), errors.length > 0 && ()
                            < div, " className=\"mb-4 p-4 bg-red-50 border border-red-200 rounded-lg\">", _jsxs("div", { className: "flex items-center text-red-800 text-sm font-medium mb-2", children: [_jsx(FiX, { className: "mr-2" }), errors.length === 1 ? 'Error:' : 'Errors:'] }), _jsx("ul", { className: "text-red-700 text-sm space-y-1", children: errors.map((error, index) => ()
                                < li, key = { index }, className = "flex items-start" >
                                (_jsx("span", { className: "mr-2", children: "\u2022" })
                                    ,
                                        _jsx("span", { children: error }))) }), "))}"] })] }), ")}", _jsxs("div", { className: "min-h-[400px]", children: [importStep === 'source' && renderSourceSelection(), importStep === 'options' && renderImportOptions(), importStep === 'validation' && renderValidationResults(), importStep === 'preview' && ()
                    < div, " className=\"text-center py-8\">", _jsx("div", { className: "text-lg mb-4", children: "Ready to import template" }), _jsx("div", { className: "text-sm text-gray-600 mb-6", children: "The template has been validated and is ready to import." })] }), ")}", importStep === 'import' && ()
            < div, " className=\"text-center py-8\">", _jsx(FiRefreshCw, { className: "animate-spin text-4xl text-blue-600 mx-auto mb-4" }), _jsx("div", { className: "text-lg mb-2", children: "Importing template..." }), _jsx("div", { className: "text-sm text-gray-600", children: "This may take a few moments depending on the template size." }), warnings.length > 0 && ()
            < div, " className=\"mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg\">", _jsxs("div", { className: "flex items-center text-yellow-800 text-sm", children: [_jsx(FiAlert, { className: "mr-2" }), "Processing with ", warnings.length, " warning", warnings.length > 1 ? 's' : ''] })] });
div >
;
{
    importStep === 'complete' && ()
        < div;
    className = "text-center py-8" >
        (_jsx(FiCheck, { className: "text-6xl text-green-600 mx-auto mb-4" })
            ,
                _jsx("div", { className: "text-xl font-semibold mb-2", children: "Import Complete!" })
                    ,
                        _jsx("div", { className: "text-gray-600 mb-4", children: "Your template has been successfully imported and is ready to use." }));
    { /* Show any final warnings */ }
    {
        warnings.length > 0 && ()
            < div;
        className = "p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-left" >
            (_jsxs("div", { className: "flex items-center text-yellow-800 text-sm font-medium mb-2", children: [_jsx(FiAlert, { className: "mr-2" }), "Import completed with warnings:"] })
                ,
                    _jsx("ul", { className: "text-yellow-700 text-sm space-y-1", children: warnings.map((warning, index) => ()
                            < li, key = { index }, className = "flex items-start" >
                            (_jsx("span", { className: "mr-2", children: "\u2022" })
                                ,
                                    _jsx("span", { children: warning }))) }));
    }
    ul >
    ;
    div >
    ;
}
div >
;
div >
    { /* Import Actions */}
    < div;
className = "flex justify-between pt-6 border-t" >
    (_jsx("button", { onClick: onClose, className: "px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors", disabled: loading, children: importStep === 'complete' ? 'Close' : 'Cancel' })
        ,
            _jsxs("div", { className: "space-x-3", children: [importStep !== 'source' && importStep !== 'complete' && ()
                        < button, "onClick=", () => {
                        const steps = ['source', 'options', 'validation', 'preview', 'import', 'complete'];
                        const currentIndex = steps.indexOf(importStep);
                        if (currentIndex > 0) {
                            setImportStep(steps[currentIndex - 1]);
                        }
                    }, "className=\"px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors\" disabled=", loading, "> Back"] }));
{
    importStep === 'source' && (importFile || importUrl || gitConfig.url) && ()
        < button;
    onClick = {}();
    setImportStep('options');
}
className = "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
        Continue;
button >
;
{
    importStep === 'options' && ()
        < button;
    onClick = {}();
    setImportStep('validation');
}
className = "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
        Validate;
button >
;
{
    importStep === 'validation' && ()
        < button;
    onClick = { handleValidateTemplate };
    className = "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors";
    disabled = { loading }
        >
            { loading, 'Validating...': 'Validate Template' };
    button >
    ;
}
{
    importStep === 'preview' && validation?.valid && ()
        < button;
    onClick = { handleImportTemplate };
    className = "px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors";
    disabled = { loading }
        >
            Import;
    Template;
    button >
    ;
}
div >
;
div >
;
 >
;
();
{ /* Export UI */ }
{ /* Error Display for Export */ }
{
    errors.length > 0 && ()
        < div;
    className = "mb-4 p-4 bg-red-50 border border-red-200 rounded-lg" >
        (_jsxs("div", { className: "flex items-center text-red-800 text-sm font-medium mb-2", children: [_jsx(FiX, { className: "mr-2" }), "Export Error:"] })
            ,
                _jsx("div", { className: "text-red-700 text-sm", children: errors[0] }));
    div >
    ;
}
_jsx("div", { className: "min-h-[400px]", children: renderExportOptions() })
    ,
        _jsxs("div", { className: "flex justify-between pt-6 border-t", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors", disabled: loading, children: "Cancel" }), _jsx("button", { onClick: handleExportTemplate, className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", disabled: loading, children: loading ? 'Exporting...' : 'Export Template' })] });
 >
;
div >
;
div >
;
div >
;
;
;
