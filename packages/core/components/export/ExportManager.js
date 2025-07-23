import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useExport } from '../../hooks/useExport';
import { ExportTemplateList } from './ExportTemplateList';
import { ExportJobList } from './ExportJobList';
import { ExportWizard } from './ExportWizard';
import { ExportStatsDashboard } from './ExportStatsDashboard';
import { ShareManager } from './ShareManager';
import { ShareDialog } from './ShareDialog';
import { ImportDialog } from './ImportDialog';
import { FiDownload, FiFile, FiClock, FiBarChart3, FiPlus, FiRefreshCw, FiShare2, FiUpload } from 'react-icons/fi';
export const ExportManager = ({ projectId, className = '' }) => {
    const [activeTab, setActiveTab] = useState('templates');
    const [showWizard, setShowWizard] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [refreshInterval, setRefreshInterval] = useState(null);
    const [shareDialogJob, setShareDialogJob] = useState(null);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const { templates, jobs, statistics, loading, error, fetchTemplates, fetchJobs, fetchStatistics, createExportJob, cancelExportJob, refetch } = useExport(projectId);
    useEffect(() => {
        // Initial data fetch
        fetchTemplates();
        fetchJobs();
        fetchStatistics();
        // Set up auto-refresh for active jobs
        const interval = setInterval(() => {
            if (jobs.some(job => job.status === 'pending' || job.status === 'processing')) {
                fetchJobs();
            }
        }, 5000);
        setRefreshInterval(interval);
        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, [projectId]);
    const handleQuickExport = async (format, type) => {
        try {
            const exportData = {
                export_format: format,
                export_type: type,
                export_scope: {},
                export_options: {},
                custom_filters: {}
            };
            await createExportJob(exportData);
            setActiveTab('jobs');
        }
        catch (error) {
            console.error('Quick export failed:', error);
        }
    };
    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        setShowWizard(true);
    };
    const handleWizardComplete = (_____exportData) => {
        setShowWizard(false);
        setSelectedTemplate(null);
        setActiveTab('jobs');
    };
    const handleWizardCancel = () => {
        setShowWizard(false);
        setSelectedTemplate(null);
    };
    const handleShareExport = (job) => {
        if (job.status !== 'completed') {
            alert('Only completed exports can be shared');
            return;
        }
        setShareDialogJob(job);
    };
    const handleShareDialogClose = () => {
        setShareDialogJob(null);
    };
    const handleShareCreated = (_____share) => {
        // Refresh data after creating a share
        fetchJobs();
        fetchStatistics();
    };
    const handleImportComplete = (_____result) => {
        // Refresh data after import
        fetchTemplates();
        fetchJobs();
        fetchStatistics();
        setShowImportDialog(false);
    };
    const renderTabContent = () => {
        switch (activeTab) {
            case 'templates':
                return (_jsx(ExportTemplateList, { templates: templates, onTemplateSelect: handleTemplateSelect, onQuickExport: handleQuickExport, loading: loading, error: error }));
            case 'jobs':
                return (_jsx(ExportJobList, { jobs: jobs, onCancel: cancelExportJob, onRefresh: fetchJobs, onShare: handleShareExport, loading: loading, error: error }));
            case 'statistics':
                return (_jsx(ExportStatsDashboard, { statistics: statistics, loading: loading, error: error }));
            case 'shares':
                return (_jsx(ShareManager, { projectId: projectId }));
            default:
                return null;
        }
    };
    const getActiveJobsCount = () => {
        return jobs.filter(job => job.status === 'pending' || job.status === 'processing').length;
    };
    const getRecentJobsCount = () => {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        return jobs.filter(job => new Date(job.started_at) > oneDayAgo).length;
    };
    return (_jsxs("div", { className: `export-manager ${className}`, children: [_jsxs("div", { className: "export-manager-header", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Export Manager" }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: "Manage export templates and download project data" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("button", { onClick: () => setShowWizard(true), className: "flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors", children: [_jsx(FiPlus, { className: "w-4 h-4" }), _jsx("span", { children: "New Export" })] }), _jsxs("button", { onClick: () => setShowImportDialog(true), className: "flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors", children: [_jsx(FiUpload, { className: "w-4 h-4" }), _jsx("span", { children: "Import" })] }), _jsxs("button", { onClick: refetch, disabled: loading, className: "flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50", children: [_jsx(FiRefreshCw, { className: `w-4 h-4 ${loading ? 'animate-spin' : ''}` }), _jsx("span", { children: "Refresh" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm", children: _jsxs("div", { className: "flex items-center", children: [_jsx(FiFile, { className: "w-5 h-5 text-blue-600 mr-2" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: "Templates" }), _jsx("p", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: templates.length })] })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm", children: _jsxs("div", { className: "flex items-center", children: [_jsx(FiClock, { className: "w-5 h-5 text-orange-600 mr-2" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: "Active Jobs" }), _jsx("p", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: getActiveJobsCount() })] })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm", children: _jsxs("div", { className: "flex items-center", children: [_jsx(FiDownload, { className: "w-5 h-5 text-green-600 mr-2" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: "Recent Exports" }), _jsx("p", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: getRecentJobsCount() })] })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm", children: _jsxs("div", { className: "flex items-center", children: [_jsx(FiBarChart3, { className: "w-5 h-5 text-purple-600 mr-2" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: "Success Rate" }), _jsx("p", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: statistics ? `${statistics.success_rate.toFixed(1)}%` : '0%' })] })] }) })] }), _jsx("div", { className: "border-b border-gray-200 dark:border-gray-700", children: _jsx("nav", { className: "flex space-x-8", children: [
                                { id: 'templates', label: 'Templates', icon: FiFile },
                                { id: 'jobs', label: 'Export Jobs', icon: FiDownload },
                                { id: 'shares', label: 'Shares', icon: FiShare2 },
                                { id: 'statistics', label: 'Statistics', icon: FiBarChart3 }
                            ].map((tab) => (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`, children: [_jsx(tab.icon, { className: "w-4 h-4" }), _jsx("span", { children: tab.label })] }, tab.id))) }) })] }), _jsxs("div", { className: "export-manager-content", children: [error && (_jsx("div", { className: "mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "w-5 h-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm text-red-800 dark:text-red-200", children: error }) })] }) })), renderTabContent()] }), showWizard && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4", children: _jsx(ExportWizard, { projectId: projectId, template: selectedTemplate, onComplete: handleWizardComplete, onCancel: handleWizardCancel }) }) })), shareDialogJob && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4 p-6", children: _jsx(ShareDialog, { exportJob: shareDialogJob, onClose: handleShareDialogClose, onShareCreated: handleShareCreated }) }) })), showImportDialog && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4 p-6", children: _jsx(ImportDialog, { onClose: () => setShowImportDialog(false), onImportComplete: handleImportComplete }) }) }))] }));
};
export default ExportManager;
