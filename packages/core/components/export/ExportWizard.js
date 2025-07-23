import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { validateExportOptions } from '../../types/export';
import { useExport } from '../../hooks/useExport';
import { FiChevronLeft, FiChevronRight, FiX, FiFile, FiSettings, FiFilter, FiCheck, FiDownload, FiInfo } from 'react-icons/fi';
const EXPORT_FORMATS = [
    { value: 'json', label: 'JSON', description: 'JavaScript Object Notation - structured data', icon: '{}' },
    { value: 'yaml', label: 'YAML', description: 'Human-readable data serialization', icon: '📄' },
    { value: 'xml', label: 'XML', description: 'Extensible Markup Language', icon: '</>' },
    { value: 'csv', label: 'CSV', description: 'Comma-separated values - spreadsheet format', icon: '📊' },
    { value: 'markdown', label: 'Markdown', description: 'Human-readable markup format', icon: '📝' },
    { value: 'pdf', label: 'PDF', description: 'Portable Document Format', icon: '📋' },
    { value: 'html', label: 'HTML', description: 'Web page format', icon: '🌐' },
    { value: 'zip', label: 'ZIP', description: 'Compressed archive', icon: '📦' }
];
const EXPORT_TYPES = [
    { value: 'version', label: 'Version Snapshot', description: 'Export a specific version of the project' },
    { value: 'branch', label: 'Branch Data', description: 'Export data from a specific branch' },
    { value: 'comparison', label: 'Version Comparison', description: 'Export differences between versions' },
    { value: 'full_project', label: 'Full Project', description: 'Export entire project with all data' }
];
export const ExportWizard = ({ projectId, template, onComplete, onCancel }) => {
    const [currentStep, setCurrentStep] = useState('format');
    const [exportData, setExportData] = useState({
        export_format: template?.export_format || 'json',
        export_type: 'full_project',
        export_scope: {},
        export_options: {},
        custom_filters: {}
    });
    const [formatDefinitions, setFormatDefinitions] = useState([]);
    const [validationErrors, setValidationErrors] = useState([]);
    const { createExportJob, loading } = useExport(projectId);
    useEffect(() => {
        // Load format definitions
        const loadFormats = async () => {
            try {
                const response = await fetch('/api/export/formats');
                const data = await response.json();
                if (data.success) {
                    setFormatDefinitions(data.data);
                }
            }
            catch (error) {
                console.error('Failed to load format definitions:', error);
            }
        };
        loadFormats();
    }, []);
    useEffect(() => {
        if (template) {
            setExportData({
                export_format: template.export_format,
                export_type: 'full_project',
                export_scope: {},
                export_options: template.format_options || {},
                custom_filters: template.filter_options || {}
            });
        }
    }, [template]);
    const handleNext = () => {
        if (validateCurrentStep()) {
            const steps = ['format', 'options', 'filters', 'review'];
            const currentIndex = steps.indexOf(currentStep);
            if (currentIndex < steps.length - 1) {
                setCurrentStep(steps[currentIndex + 1]);
            }
        }
    };
    const handlePrevious = () => {
        const steps = ['format', 'options', 'filters', 'review'];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
        }
    };
    const validateCurrentStep = () => {
        const errors = [];
        switch (currentStep) {
            case 'format':
                if (!exportData.export_format) {
                    errors.push('Please select an export format');
                }
                if (!exportData.export_type) {
                    errors.push('Please select an export type');
                }
                break;
            case 'options':
                if (exportData.export_format && exportData.export_options) {
                    const validation = validateExportOptions(exportData.export_format, exportData.export_options);
                    if (!validation.success) {
                        errors.push(...validation.error.errors.map(e => e.message));
                    }
                }
                break;
        }
        setValidationErrors(errors);
        return errors.length === 0;
    };
    const handleComplete = async () => {
        if (!validateCurrentStep())
            return;
        try {
            const completeExportData = {
                ...exportData,
                template_id: template?.id
            };
            await createExportJob(completeExportData);
            onComplete(completeExportData);
        }
        catch (error) {
            console.error('Failed to create export job:', error);
        }
    };
    const renderFormatStep = () => (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Choose Export Format" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: EXPORT_FORMATS.map((format) => (_jsx("button", { onClick: () => setExportData(prev => ({ ...prev, export_format: format.value })), className: `p-4 rounded-lg border-2 text-left transition-colors ${exportData.export_format === format.value
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "text-2xl mr-3", children: format.icon }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900 dark:text-white", children: format.label }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: format.description })] })] }), exportData.export_format === format.value && (_jsx(FiCheck, { className: "w-5 h-5 text-blue-600" }))] }) }, format.value))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Export Type" }), _jsx("div", { className: "space-y-3", children: EXPORT_TYPES.map((type) => (_jsx("button", { onClick: () => setExportData(prev => ({ ...prev, export_type: type.value })), className: `w-full p-4 rounded-lg border-2 text-left transition-colors ${exportData.export_type === type.value
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900 dark:text-white", children: type.label }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: type.description })] }), exportData.export_type === type.value && (_jsx(FiCheck, { className: "w-5 h-5 text-blue-600" }))] }) }, type.value))) })] })] }));
    const renderOptionsStep = () => {
        const currentFormat = formatDefinitions.find(f => f.format_name === exportData.export_format);
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Export Options" }), _jsx("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx(FiInfo, { className: "w-5 h-5 text-blue-600 mr-2" }), _jsxs("p", { className: "text-sm text-blue-800 dark:text-blue-200", children: ["Configure format-specific options for ", exportData.export_format?.toUpperCase(), " export"] })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-gray-900 dark:text-white", children: "Content Options" }), [
                                    { key: 'include_metadata', label: 'Include Metadata', description: 'Export metadata and timestamps' },
                                    { key: 'include_attribution', label: 'Include Attribution', description: 'Export author and contribution data' },
                                    { key: 'include_history', label: 'Include History', description: 'Export version history' },
                                    { key: 'include_branching', label: 'Include Branching', description: 'Export branch information' },
                                    { key: 'include_comments', label: 'Include Comments', description: 'Export comments and annotations' },
                                    { key: 'include_attachments', label: 'Include Attachments', description: 'Export file attachments' }
                                ].map((option) => (_jsxs("label", { className: "flex items-start space-x-3", children: [_jsx("input", { type: "checkbox", checked: exportData.export_options?.[option.key] || false, onChange: (e) => setExportData(prev => ({
                                                ...prev,
                                                export_options: {
                                                    ...prev.export_options,
                                                    [option.key]: e.target.checked
                                                }
                                            })), className: "mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900 dark:text-white", children: option.label }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: option.description })] })] }, option.key)))] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-gray-900 dark:text-white", children: "Format Options" }), exportData.export_format === 'json' && (_jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "flex items-center space-x-3", children: [_jsx("input", { type: "checkbox", checked: exportData.export_options?.pretty || false, onChange: (e) => setExportData(prev => ({
                                                        ...prev,
                                                        export_options: {
                                                            ...prev.export_options,
                                                            pretty: e.target.checked
                                                        }
                                                    })), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "text-gray-900 dark:text-white", children: "Pretty Print JSON" })] }), _jsxs("label", { className: "flex items-center space-x-3", children: [_jsx("input", { type: "checkbox", checked: exportData.export_options?.include_schema || false, onChange: (e) => setExportData(prev => ({
                                                        ...prev,
                                                        export_options: {
                                                            ...prev.export_options,
                                                            include_schema: e.target.checked
                                                        }
                                                    })), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "text-gray-900 dark:text-white", children: "Include JSON Schema" })] })] })), exportData.export_format === 'csv' && (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Delimiter" }), _jsxs("select", { value: exportData.export_options?.delimiter || ',', onChange: (e) => setExportData(prev => ({
                                                        ...prev,
                                                        export_options: {
                                                            ...prev.export_options,
                                                            delimiter: e.target.value
                                                        }
                                                    })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: ",", children: "Comma (,)" }), _jsx("option", { value: ";", children: "Semicolon (;)" }), _jsx("option", { value: "\\t", children: "Tab" }), _jsx("option", { value: "|", children: "Pipe (|)" })] })] }), _jsxs("label", { className: "flex items-center space-x-3", children: [_jsx("input", { type: "checkbox", checked: exportData.export_options?.include_headers || false, onChange: (e) => setExportData(prev => ({
                                                        ...prev,
                                                        export_options: {
                                                            ...prev.export_options,
                                                            include_headers: e.target.checked
                                                        }
                                                    })), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "text-gray-900 dark:text-white", children: "Include Headers" })] })] })), exportData.export_format === 'pdf' && (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Page Size" }), _jsxs("select", { value: exportData.export_options?.page_size || 'A4', onChange: (e) => setExportData(prev => ({
                                                        ...prev,
                                                        export_options: {
                                                            ...prev.export_options,
                                                            page_size: e.target.value
                                                        }
                                                    })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "A4", children: "A4" }), _jsx("option", { value: "A3", children: "A3" }), _jsx("option", { value: "Letter", children: "Letter" }), _jsx("option", { value: "Legal", children: "Legal" })] })] }), _jsxs("label", { className: "flex items-center space-x-3", children: [_jsx("input", { type: "checkbox", checked: exportData.export_options?.include_images || false, onChange: (e) => setExportData(prev => ({
                                                        ...prev,
                                                        export_options: {
                                                            ...prev.export_options,
                                                            include_images: e.target.checked
                                                        }
                                                    })), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "text-gray-900 dark:text-white", children: "Include Images" })] })] }))] })] })] }));
    };
    const renderFiltersStep = () => (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Content Filters" }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300 mb-6", children: "Apply filters to customize what data is included in your export" })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 dark:text-white mb-3", children: "Date Range" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Start Date" }), _jsx("input", { type: "date", value: exportData.custom_filters?.date_range?.start || '', onChange: (e) => setExportData(prev => ({
                                                    ...prev,
                                                    custom_filters: {
                                                        ...prev.custom_filters,
                                                        date_range: {
                                                            ...prev.custom_filters?.date_range,
                                                            start: e.target.value
                                                        }
                                                    }
                                                })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "End Date" }), _jsx("input", { type: "date", value: exportData.custom_filters?.date_range?.end || '', onChange: (e) => setExportData(prev => ({
                                                    ...prev,
                                                    custom_filters: {
                                                        ...prev.custom_filters,
                                                        date_range: {
                                                            ...prev.custom_filters?.date_range,
                                                            end: e.target.value
                                                        }
                                                    }
                                                })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 dark:text-white mb-3", children: "Output Options" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "flex items-center space-x-3", children: [_jsx("input", { type: "checkbox", checked: exportData.custom_filters?.compress_output || false, onChange: (e) => setExportData(prev => ({
                                                    ...prev,
                                                    custom_filters: {
                                                        ...prev.custom_filters,
                                                        compress_output: e.target.checked
                                                    }
                                                })), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "text-gray-900 dark:text-white", children: "Compress Output" })] }), _jsxs("label", { className: "flex items-center space-x-3", children: [_jsx("input", { type: "checkbox", checked: exportData.custom_filters?.encrypt_output || false, onChange: (e) => setExportData(prev => ({
                                                    ...prev,
                                                    custom_filters: {
                                                        ...prev.custom_filters,
                                                        encrypt_output: e.target.checked
                                                    }
                                                })), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "text-gray-900 dark:text-white", children: "Encrypt Output" })] })] })] })] })] }));
    const renderReviewStep = () => (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Review Export Configuration" }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300 mb-6", children: "Review your export settings before starting the export process" })] }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-800 rounded-lg p-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 dark:text-white mb-3", children: "Export Format" }), _jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: [EXPORT_FORMATS.find(f => f.value === exportData.export_format)?.label, " - ", EXPORT_FORMATS.find(f => f.value === exportData.export_format)?.description] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 dark:text-white mb-3", children: "Export Type" }), _jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: [EXPORT_TYPES.find(t => t.value === exportData.export_type)?.label, " - ", EXPORT_TYPES.find(t => t.value === exportData.export_type)?.description] })] })] }), _jsxs("div", { className: "mt-6", children: [_jsx("h4", { className: "font-medium text-gray-900 dark:text-white mb-3", children: "Content Options" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2", children: Object.entries(exportData.export_options || {}).map(([key, value]) => (value && (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(FiCheck, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm text-gray-600 dark:text-gray-300", children: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })] }, key)))) })] }), exportData.custom_filters?.date_range && (_jsxs("div", { className: "mt-6", children: [_jsx("h4", { className: "font-medium text-gray-900 dark:text-white mb-3", children: "Date Range" }), _jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: [exportData.custom_filters.date_range.start || 'No start date', " to ", exportData.custom_filters.date_range.end || 'No end date'] })] }))] })] }));
    const renderStepContent = () => {
        switch (currentStep) {
            case 'format':
                return renderFormatStep();
            case 'options':
                return renderOptionsStep();
            case 'filters':
                return renderFiltersStep();
            case 'review':
                return renderReviewStep();
            default:
                return null;
        }
    };
    const getStepIcon = (step) => {
        switch (step) {
            case 'format':
                return FiFile;
            case 'options':
                return FiSettings;
            case 'filters':
                return FiFilter;
            case 'review':
                return FiCheck;
            default:
                return FiFile;
        }
    };
    const steps = [
        { id: 'format', label: 'Format' },
        { id: 'options', label: 'Options' },
        { id: 'filters', label: 'Filters' },
        { id: 'review', label: 'Review' }
    ];
    const currentStepIndex = steps.findIndex(s => s.id === currentStep);
    return (_jsxs("div", { className: "export-wizard", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: template ? 'Export with Template' : 'New Export' }), template && (_jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: ["Using template: ", template.name] }))] }), _jsx("button", { onClick: onCancel, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: _jsx(FiX, { className: "w-6 h-6" }) })] }), _jsx("div", { className: "px-6 py-4 border-b border-gray-200 dark:border-gray-700", children: _jsx("div", { className: "flex items-center justify-between", children: steps.map((step, index) => {
                        const Icon = getStepIcon(step.id);
                        const isActive = step.id === currentStep;
                        const isCompleted = index < currentStepIndex;
                        return (_jsxs("div", { className: `flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`, children: [_jsx("div", { className: `flex items-center justify-center w-8 h-8 rounded-full ${isActive
                                        ? 'bg-blue-600 text-white'
                                        : isCompleted
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-300 text-gray-600'}`, children: isCompleted ? (_jsx(FiCheck, { className: "w-4 h-4" })) : (_jsx(Icon, { className: "w-4 h-4" })) }), _jsx("span", { className: `ml-2 text-sm ${isActive
                                        ? 'text-blue-600 font-medium'
                                        : isCompleted
                                            ? 'text-green-600'
                                            : 'text-gray-500'}`, children: step.label }), index < steps.length - 1 && (_jsx("div", { className: `flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}` }))] }, step.id));
                    }) }) }), _jsxs("div", { className: "p-6 max-h-96 overflow-y-auto", children: [validationErrors.length > 0 && (_jsxs("div", { className: "mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg", children: [_jsx("h4", { className: "font-medium text-red-800 dark:text-red-200 mb-2", children: "Please fix the following errors:" }), _jsx("ul", { className: "list-disc list-inside text-sm text-red-700 dark:text-red-300", children: validationErrors.map((error, index) => (_jsx("li", { children: error }, index))) })] })), renderStepContent()] }), _jsxs("div", { className: "flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700", children: [_jsxs("button", { onClick: handlePrevious, disabled: currentStep === 'format', className: "flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(FiChevronLeft, { className: "w-4 h-4" }), _jsx("span", { children: "Previous" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("button", { onClick: onCancel, className: "px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100", children: "Cancel" }), currentStep === 'review' ? (_jsxs("button", { onClick: handleComplete, disabled: loading, className: "flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(FiDownload, { className: "w-4 h-4" }), _jsx("span", { children: loading ? 'Creating...' : 'Start Export' })] })) : (_jsxs("button", { onClick: handleNext, className: "flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700", children: [_jsx("span", { children: "Next" }), _jsx(FiChevronRight, { className: "w-4 h-4" })] }))] })] })] }));
};
export default ExportWizard;
