import React, { useState, useEffect } from 'react';
import { 
  ExportTemplate, 
  ExportJob, 
  ExportFormat, 
  ExportType, 
  ExportJobStatus,
  ExportStatistics,
  CreateExportJob,
  CreateExportTemplate
} from '../../types/export';
import { useExport } from '../../hooks/useExport';
import { ExportTemplateList } from './ExportTemplateList';
import { ExportJobList } from './ExportJobList';
import { ExportWizard } from './ExportWizard';
import { ExportStatsDashboard } from './ExportStatsDashboard';
import { ShareManager } from './ShareManager';
import { ShareDialog } from './ShareDialog';
import { ImportDialog } from './ImportDialog';
import { 
  FiDownload, 
  FiFile, 
  FiClock, 
  FiBarChart3, 
  FiPlus,
  FiRefreshCw,
  FiSettings,
  FiShare2,
  FiUpload
} from 'react-icons/fi';
}
interface ExportManagerProps {
  projectId: string;
  className?: string;
  type ActiveTab = 'templates' | 'jobs' | 'statistics' | 'shares' | 'wizard';
  export const ExportManager: React.FC<ExportManagerProps> = ({,)
  projectId,
  className = ''
}
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('templates');
  const [showWizard, setShowWizard] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timer | null>(null);
  const [shareDialogJob, setShareDialogJob] = useState<ExportJob | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const {
    templates,
    jobs,
    statistics,
    loading,
    error,
    fetchTemplates,
    fetchJobs,
    fetchStatistics,
    createExportJob,
    cancelExportJob,
    refetch
  } = useExport(projectId);
  useEffect(() => {
    // Initial data fetch
    fetchTemplates();
    fetchJobs();
    fetchStatistics();
    // Set up auto-refresh for active jobs
    const interval = setInterval(() => {
      if (jobs.some(job => job.status === 'pending' || job.status === 'processing')) {
        fetchJobs();
    }, 5000);
    setRefreshInterval(interval);
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
    };
  }, [projectId]);
  const handleQuickExport = async (format: ExportFormat, type: ExportType) => {
    try {
      const exportData: CreateExportJob = {,
  export_format: format,
        export_type: type,
        export_scope: {},
        export_options: {},
        custom_filters: {}
      };
      await createExportJob(exportData);
      setActiveTab('jobs');
    } catch (error) {
  console.error('Quick export failed:', error);
};
  const handleTemplateSelect = (template: ExportTemplate) => {
    setSelectedTemplate(template);
    setShowWizard(true);
  };
  const handleWizardComplete = (_____exportData: CreateExportJob) => {
    setShowWizard(false);
    setSelectedTemplate(null);
    setActiveTab('jobs');
  };
  const handleWizardCancel = () => {
    setShowWizard(false);
    setSelectedTemplate(null);
  };
  const handleShareExport = (job: ExportJob) => {
    if (job.status !== 'completed') {
      alert('Only completed exports can be shared');
      return;
    setShareDialogJob(job);
  };
  const handleShareDialogClose = () => {
    setShareDialogJob(null);
  };
  const handleShareCreated = (_____share: Error) => {
    // Refresh data after creating a share
    fetchJobs();
    fetchStatistics();
  };
  const handleImportComplete = (_____result: Record<string, unknown>) => {
    // Refresh data after import
    fetchTemplates();
    fetchJobs();
    fetchStatistics();
    setShowImportDialog(false);
  };
  const renderTabContent = () => {
    switch (activeTab) {
    case 'templates':
      return;
        <ExportTemplateList
          templates={templates}
          onTemplateSelect={handleTemplateSelect}
          onQuickExport={handleQuickExport}
          loading={loading}
          error={error}
        />
      );
    case 'jobs':
      return;
        <ExportJobList
          jobs={jobs}
          onCancel={cancelExportJob}
          onRefresh={fetchJobs}
          onShare={handleShareExport}
          loading={loading}
          error={error}
        />
      );
    case 'statistics':
      return;
        <ExportStatsDashboard
          statistics={statistics}
          loading={loading}
          error={error}
        />
      );
    case 'shares':
      return;
        <ShareManager
          projectId={projectId}
        />
      );
    default:
      return null;
  };
  const getActiveJobsCount = () => {
    return jobs.filter(job => job.status === 'pending' || job.status === 'processing').length;
  };
  const getRecentJobsCount = () => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return jobs.filter(job => new Date(job.started_at) > oneDayAgo).length;
  };
  return;
    <div className={`export-manager ${className}`}>}
      {/* Header */}
      <div className="export-manager-header">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Export Manager
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Manage export templates and download project data
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowWizard(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              <span>New Export</span>
            </button>
            <button
              onClick={() => setShowImportDialog(true)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiUpload className="w-4 h-4" />
              <span>Import</span>
            </button>
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
              <span>Refresh</span>
            </button>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <FiFile className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Templates</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {templates.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <FiClock className="w-5 h-5 text-orange-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Active Jobs</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {getActiveJobsCount()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <FiDownload className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Recent Exports</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {getRecentJobsCount()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <FiBarChart3 className="w-5 h-5 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Success Rate</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {statistics ? `${statistics.success_rate.toFixed(1)}%` : '0%'}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {[
              { id: 'templates', label: 'Templates', icon: FiFile },
              { id: 'jobs', label: 'Export Jobs', icon: FiDownload },
              { id: 'shares', label: 'Shares', icon: FiShare2 },
              { id: 'statistics', label: 'Statistics', icon: FiBarChart3 }
            ].map((tab) => ()
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
  activeTab === tab.id
  ? 'border-blue-500 text-blue-600 dark:text-blue-400',
  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
}`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      {/* Main Content */}
      <div className="export-manager-content">
        {error && ()
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}
        {renderTabContent()}
      </div>
      {/* Export Wizard Modal */}
      {showWizard && ()
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <ExportWizard
              projectId={projectId}
              template={selectedTemplate}
              onComplete={handleWizardComplete}
              onCancel={handleWizardCancel}
            />
          </div>
        </div>
      )}
      {/* Share Dialog Modal */}
      {shareDialogJob && ()
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4 p-6">
            <ShareDialog
              exportJob={shareDialogJob}
              onClose={handleShareDialogClose}
              onShareCreated={handleShareCreated}
            />
          </div>
        </div>
      )}
      {/* Import Dialog Modal */}
      {showImportDialog && ()
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4 p-6">
            <ImportDialog
              onClose={() => setShowImportDialog(false)}
              onImportComplete={handleImportComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportManager;