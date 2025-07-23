/**
 * Template Import/Export Dialog
 * Advanced UI for importing and exporting templates with versioning support
 */

import React, { useState, useCallback, useRef } from 'react';
import { 
  TemplateImportOptions, 
  TemplateExportOptions, 
  TemplateImportResult,
  TemplateVersion,
  TemplateBundle
} from '../../templates/TemplateVersionManager';
import { ProjectTemplate } from '../../templates/ProjectTemplateManager';
import {
  FiUpload,
  FiDownload,
  FiGitBranch,
  FiPackage,
  FiSettings,
  FiCheck,
  FiAlert,
  FiX,
  FiFile,
  FiGlobe,
  FiShield,
  FiClock,
  FiTag,
  FiArrowRight,
  FiRefreshCw
} from 'react-icons/fi';

interface TemplateImportExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'import' | 'export';
  template?: ProjectTemplate;
  onImportComplete?: (result: TemplateImportResult) => void;
  onExportComplete?: (result: any) => void;
  className?: string;
}

type ImportSource = 'file' | 'url' | 'git' | 'marketplace';
type ImportStep = 'source' | 'options' | 'validation' | 'preview' | 'import' | 'complete';
type ExportStep = 'format' | 'options' | 'bundle' | 'export' | 'complete';

interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
  templateInfo?: {
    name: string;
    version: string;
    author: string;
    dependencies: number;
  };
}

export const TemplateImportExportDialog: React.FC<TemplateImportExportDialogProps> = ({
  isOpen,
  onClose,
  mode,
  template,
  onImportComplete,
  onExportComplete,
  className = ''
}) => {
  // Import state
  const [importSource, setImportSource] = useState<ImportSource>('file');
  const [importStep, setImportStep] = useState<ImportStep>('source');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importUrl, setImportUrl] = useState('');
  const [gitConfig, setGitConfig] = useState({
    url: '',
    branch: 'main',
    username: '',
    token: ''
  });
  
  // Export state
  const [exportStep, setExportStep] = useState<ExportStep>('format');
  const [exportFormat, setExportFormat] = useState<'json' | 'yaml' | 'zip' | 'template_bundle'>('json');
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  
  // Common state
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [importOptions, setImportOptions] = useState<TemplateImportOptions>({
    format: 'json',
    source: '',
    merge_strategy: 'replace',
    resolve_conflicts: 'auto',
    update_dependencies: true,
    create_backup: true,
    validate_schema: true,
    validate_dependencies: true,
    validate_compatibility: true
  });
  const [exportOptions, setExportOptions] = useState<TemplateExportOptions>({
    format: 'json',
    include_version_history: false,
    include_dependencies: true,
    include_analytics: false,
    bundle_dependencies: true,
    compress: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import handlers
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportOptions(prev => ({
        ...prev,
        source: file,
        format: file.name.endsWith('.yaml') || file.name.endsWith('.yml') ? 'yaml' :
          file.name.endsWith('.zip') ? 'zip' :
            file.name.endsWith('.bundle') ? 'template_bundle' : 'json'
      }));
    }
  }, []);

  const handleValidateTemplate = async (): Promise<void> => {
    setLoading(true);
    setErrors([]);
    setWarnings([]);
    
    try {
      // Validate input source
      if (!importFile && !importUrl && !gitConfig.url) {
        throw new Error('Please select a template source');
      }
      
      if (importSource === 'file' && !importFile) {
        throw new Error('Please select a file to import');
      }
      
      if (importSource === 'url' && !importUrl) {
        throw new Error('Please enter a valid URL');
      }
      
      if (importSource === 'git' && !gitConfig.url) {
        throw new Error('Please enter a valid Git repository URL');
      }
      
      // Validate file type for file imports
      if (importFile) {
        const allowedExtensions = ['.json', '.yaml', '.yml', '.zip', '.bundle'];
        const hasValidExtension = allowedExtensions.some(ext => 
          importFile.name.toLowerCase().endsWith(ext)
        );
        
        if (!hasValidExtension) {
          throw new Error('Invalid file type. Supported formats: JSON, YAML, ZIP, Bundle');
        }
        
        // Check file size (max 50MB)
        if (importFile.size > 50 * 1024 * 1024) {
          throw new Error('File size exceeds maximum limit of 50MB');
        }
      }
      
      // Validate URL format
      if (importSource === 'url' && importUrl) {
        try {
          new URL(importUrl);
        } catch {
          throw new Error('Invalid URL format');
        }
      }
      
      // Mock validation - in real implementation, would validate the template
      const mockValidation: ValidationResult = {
        valid: true,
        warnings: ['Template uses deprecated node type "LegacyTransform"'],
        errors: [],
        templateInfo: {
          name: 'Sample Workflow Template',
          version: '2.1.0',
          author: 'Template Creator',
          dependencies: 2
        }
      };
      
      setValidation(mockValidation);
      setWarnings(mockValidation.warnings);
      
      if (mockValidation.valid) {
        setImportStep('preview');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      console.error('Validation failed:', error);
      setErrors([errorMessage]);
      setValidation({
        valid: false,
        warnings: [],
        errors: [errorMessage]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportTemplate = async (): Promise<void> => {
    setLoading(true);
    setImportStep('import');
    setErrors([]);
    setWarnings([]);
    
    try {
      // Additional validation before import
      if (!validation?.valid) {
        throw new Error('Template validation must pass before import');
      }
      
      // Check for conflicts in merge strategy
      if (importOptions.merge_strategy === 'manual' && importOptions.resolve_conflicts === 'auto') {
        setWarnings(prev => [...prev, 'Manual merge strategy with auto conflict resolution may cause issues']);
      }
      
      // Mock import result - in real implementation, would call TemplateVersionManager
      const mockResult: TemplateImportResult = {
        success: true,
        imported_version: {
          id: 'version-123',
          version_number: '2.1.0',
          template_id: 'template-456'
        } as TemplateVersion,
        warnings: ['Some customization points were updated'],
        errors: [],
        original_version: '2.0.0',
        new_version: '2.1.0',
        changes_detected: 5,
        conflicts_resolved: 1,
        dependencies_updated: 2,
        migration_applied: false,
        backup_version_id: 'backup-789',
        can_rollback: true
      };
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setImportStep('complete');
      setWarnings(prev => [...prev, ...mockResult.warnings]);
      onImportComplete?.(mockResult);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      console.error('Import failed:', error);
      setErrors([errorMessage]);
      
      // Reset to previous step on error
      setImportStep('preview');
    } finally {
      setLoading(false);
    }
  };

  // Export handlers
  const handleExportTemplate = async (): Promise<void> => {
    setLoading(true);
    setExportStep('export');
    setErrors([]);
    setWarnings([]);
    
    try {
      // Validate template exists
      if (!template) {
        throw new Error('No template selected for export');
      }
      
      // Validate export options
      if (exportOptions.include_version_history && !exportOptions.include_dependencies) {
        setWarnings(prev => [...prev, 'Exporting version history without dependencies may cause import issues']);
      }
      
      // Mock export - in real implementation, would call TemplateVersionManager
      const mockResult = {
        download_url: 'https://example.com/download/template-export.json',
        filename: 'workflow-template-v1.0.0.json',
        size: 245760,
        checksum: 'abc123def456'
      };
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setExportStep('complete');
      onExportComplete?.(mockResult);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      console.error('Export failed:', error);
      setErrors([errorMessage]);
      
      // Reset to format selection on error
      setExportStep('format');
    } finally {
      setLoading(false);
    }
  };

  // Render helpers
  const renderImportStepIndicator = (): JSX.Element => (
    <div className="flex items-center justify-center mb-6 space-x-2">
      {['source', 'options', 'validation', 'preview', 'import', 'complete'].map((step, index) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            importStep === step ? 'bg-blue-600 text-white' :
              ['source', 'options', 'validation', 'preview'].indexOf(importStep) > index ? 'bg-green-600 text-white' :
                'bg-gray-300 text-gray-600'
          }`}>
            {['source', 'options', 'validation', 'preview'].indexOf(importStep) > index ? <FiCheck /> : index + 1}
          </div>
          {index < 5 && <FiArrowRight className="mx-2 text-gray-400" />}
        </div>
      ))}
    </div>
  );

  const renderSourceSelection = (): JSX.Element => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Select Import Source</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setImportSource('file')}
          className={`p-4 border-2 rounded-lg text-left transition-colors ${
            importSource === 'file' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <FiFile className="text-2xl mb-2 text-blue-600" />
          <div className="font-semibold">Local File</div>
          <div className="text-sm text-gray-600">Upload JSON, YAML, or ZIP file</div>
        </button>

        <button
          onClick={() => setImportSource('git')}
          className={`p-4 border-2 rounded-lg text-left transition-colors ${
            importSource === 'git' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <FiGitBranch className="text-2xl mb-2 text-green-600" />
          <div className="font-semibold">Git Repository</div>
          <div className="text-sm text-gray-600">Import from GitHub, GitLab, etc.</div>
        </button>

        <button
          onClick={() => setImportSource('url')}
          className={`p-4 border-2 rounded-lg text-left transition-colors ${
            importSource === 'url' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <FiGlobe className="text-2xl mb-2 text-purple-600" />
          <div className="font-semibold">URL</div>
          <div className="text-sm text-gray-600">Download from web URL</div>
        </button>

        <button
          onClick={() => setImportSource('marketplace')}
          className={`p-4 border-2 rounded-lg text-left transition-colors ${
            importSource === 'marketplace' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <FiPackage className="text-2xl mb-2 text-orange-600" />
          <div className="font-semibold">Marketplace</div>
          <div className="text-sm text-gray-600">Browse public templates</div>
        </button>
      </div>

      {/* Source-specific inputs */}
      {importSource === 'file' && (
        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.yaml,.yml,.zip,.bundle"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 transition-colors"
          >
            <FiUpload className="mx-auto text-3xl text-gray-400 mb-2" />
            <div className="text-gray-600">
              {importFile ? importFile.name : 'Click to select file or drag and drop'}
            </div>
          </button>
        </div>
      )}

      {importSource === 'git' && (
        <div className="mt-4 space-y-3">
          <input
            type="url"
            placeholder="Git repository URL"
            value={gitConfig.url}
            onChange={(e) => setGitConfig(prev => ({ ...prev, url: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Branch (default: main)"
              value={gitConfig.branch}
              onChange={(e) => setGitConfig(prev => ({ ...prev, branch: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Username (optional)"
              value={gitConfig.username}
              onChange={(e) => setGitConfig(prev => ({ ...prev, username: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
          <input
            type="password"
            placeholder="Access token (optional)"
            value={gitConfig.token}
            onChange={(e) => setGitConfig(prev => ({ ...prev, token: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
      )}

      {importSource === 'url' && (
        <div className="mt-4">
          <input
            type="url"
            placeholder="Template URL"
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
      )}
    </div>
  );

  const renderImportOptions = (): JSX.Element => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Import Options</h3>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Merge Strategy
            </label>
            <select
              value={importOptions.merge_strategy}
              onChange={(e) => setImportOptions(prev => ({ 
                ...prev, 
                merge_strategy: e.target.value as 'replace' | 'merge' | 'keep_both'
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="replace">Replace existing</option>
              <option value="merge">Merge with existing</option>
              <option value="keep_both">Keep both versions</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conflict Resolution
            </label>
            <select
              value={importOptions.resolve_conflicts}
              onChange={(e) => setImportOptions(prev => ({ 
                ...prev, 
                resolve_conflicts: e.target.value as 'auto' | 'manual' | 'skip'
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="auto">Auto resolve</option>
              <option value="manual">Manual resolution</option>
              <option value="skip">Skip conflicts</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Version Handling
            </label>
            <select
              value={importOptions.version_bump || 'patch'}
              onChange={(e) => setImportOptions(prev => ({ 
                ...prev, 
                version_bump: e.target.value as 'patch' | 'minor' | 'major' | 'custom'
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="patch">Patch (1.0.1)</option>
              <option value="minor">Minor (1.1.0)</option>
              <option value="major">Major (2.0.0)</option>
              <option value="custom">Custom version</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Validation</h4>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={importOptions.validate_schema}
                onChange={(e) => setImportOptions(prev => ({ 
                  ...prev, 
                  validate_schema: e.target.checked 
                }))}
                className="mr-2"
              />
              <span className="text-sm">Validate template schema</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={importOptions.validate_dependencies}
                onChange={(e) => setImportOptions(prev => ({ 
                  ...prev, 
                  validate_dependencies: e.target.checked 
                }))}
                className="mr-2"
              />
              <span className="text-sm">Check dependencies</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={importOptions.validate_compatibility}
                onChange={(e) => setImportOptions(prev => ({ 
                  ...prev, 
                  validate_compatibility: e.target.checked 
                }))}
                className="mr-2"
              />
              <span className="text-sm">Validate compatibility</span>
            </label>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Safety</h4>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={importOptions.create_backup}
                onChange={(e) => setImportOptions(prev => ({ 
                  ...prev, 
                  create_backup: e.target.checked 
                }))}
                className="mr-2"
              />
              <span className="text-sm">Create backup before import</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={importOptions.update_dependencies}
                onChange={(e) => setImportOptions(prev => ({ 
                  ...prev, 
                  update_dependencies: e.target.checked 
                }))}
                className="mr-2"
              />
              <span className="text-sm">Update dependencies</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderValidationResults = (): JSX.Element => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Validation Results</h3>
      
      {validation && (
        <div className={`p-4 rounded-lg border-2 ${
          validation.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-center mb-3">
            {validation.valid ? (
              <FiCheck className="text-green-600 text-xl mr-2" />
            ) : (
              <FiX className="text-red-600 text-xl mr-2" />
            )}
            <span className={`font-semibold ${
              validation.valid ? 'text-green-800' : 'text-red-800'
            }`}>
              {validation.valid ? 'Template is valid' : 'Template has issues'}
            </span>
          </div>

          {validation.templateInfo && (
            <div className="bg-white p-3 rounded-lg mb-3">
              <h4 className="font-medium mb-2">Template Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Name:</span> {validation.templateInfo.name}</div>
                <div><span className="font-medium">Version:</span> {validation.templateInfo.version}</div>
                <div><span className="font-medium">Author:</span> {validation.templateInfo.author}</div>
                <div><span className="font-medium">Dependencies:</span> {validation.templateInfo.dependencies}</div>
              </div>
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium text-yellow-800 mb-1 flex items-center">
                <FiAlert className="mr-1" /> Warnings
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validation.errors.length > 0 && (
            <div>
              <h4 className="font-medium text-red-800 mb-1 flex items-center">
                <FiX className="mr-1" /> Errors
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderExportOptions = (): JSX.Element => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Export Configuration</h3>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <select
              value={exportOptions.format}
              onChange={(e) => setExportOptions(prev => ({ 
                ...prev, 
                format: e.target.value as 'json' | 'yaml' | 'zip' | 'template_bundle'
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="json">JSON Format</option>
              <option value="yaml">YAML Format</option>
              <option value="zip">ZIP Archive</option>
              <option value="template_bundle">Template Bundle</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Version
            </label>
            <select
              value={selectedVersionId}
              onChange={(e) => setSelectedVersionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Latest version</option>
              <option value="v2.1.0">v2.1.0 (Current)</option>
              <option value="v2.0.0">v2.0.0</option>
              <option value="v1.9.1">v1.9.1</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Include</h4>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.include_version_history}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  include_version_history: e.target.checked 
                }))}
                className="mr-2"
              />
              <span className="text-sm">Version history</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.include_dependencies}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  include_dependencies: e.target.checked 
                }))}
                className="mr-2"
              />
              <span className="text-sm">Dependencies</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.include_analytics}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  include_analytics: e.target.checked 
                }))}
                className="mr-2"
              />
              <span className="text-sm">Usage analytics</span>
            </label>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Bundle Options</h4>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.bundle_dependencies}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  bundle_dependencies: e.target.checked 
                }))}
                className="mr-2"
              />
              <span className="text-sm">Bundle dependencies</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.compress}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  compress: e.target.checked 
                }))}
                className="mr-2"
              />
              <span className="text-sm">Compress output</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${className}`}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              {mode === 'import' ? <FiUpload className="mr-2" /> : <FiDownload className="mr-2" />}
              {mode === 'import' ? 'Import Template' : 'Export Template'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          {mode === 'import' ? (
            <>
              {renderImportStepIndicator()}
              
              {/* Error Display */}
              {errors.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-800 text-sm font-medium mb-2">
                    <FiX className="mr-2" />
                    {errors.length === 1 ? 'Error:' : 'Errors:'}
                  </div>
                  <ul className="text-red-700 text-sm space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="min-h-[400px]">
                {importStep === 'source' && renderSourceSelection()}
                {importStep === 'options' && renderImportOptions()}
                {importStep === 'validation' && renderValidationResults()}
                {importStep === 'preview' && (
                  <div className="text-center py-8">
                    <div className="text-lg mb-4">Ready to import template</div>
                    <div className="text-sm text-gray-600 mb-6">
                      The template has been validated and is ready to import.
                    </div>
                  </div>
                )}
                {importStep === 'import' && (
                  <div className="text-center py-8">
                    <FiRefreshCw className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                    <div className="text-lg mb-2">Importing template...</div>
                    <div className="text-sm text-gray-600">
                      This may take a few moments depending on the template size.
                    </div>
                    
                    {/* Show warnings during import */}
                    {warnings.length > 0 && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center text-yellow-800 text-sm">
                          <FiAlert className="mr-2" />
                          Processing with {warnings.length} warning{warnings.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {importStep === 'complete' && (
                  <div className="text-center py-8">
                    <FiCheck className="text-6xl text-green-600 mx-auto mb-4" />
                    <div className="text-xl font-semibold mb-2">Import Complete!</div>
                    <div className="text-gray-600 mb-4">
                      Your template has been successfully imported and is ready to use.
                    </div>
                    
                    {/* Show any final warnings */}
                    {warnings.length > 0 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                        <div className="flex items-center text-yellow-800 text-sm font-medium mb-2">
                          <FiAlert className="mr-2" />
                          Import completed with warnings:
                        </div>
                        <ul className="text-yellow-700 text-sm space-y-1">
                          {warnings.map((warning, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Import Actions */}
              <div className="flex justify-between pt-6 border-t">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={loading}
                >
                  {importStep === 'complete' ? 'Close' : 'Cancel'}
                </button>
                
                <div className="space-x-3">
                  {importStep !== 'source' && importStep !== 'complete' && (
                    <button
                      onClick={() => {
                        const steps: ImportStep[] = ['source', 'options', 'validation', 'preview', 'import', 'complete'];
                        const currentIndex = steps.indexOf(importStep);
                        if (currentIndex > 0) {
                          setImportStep(steps[currentIndex - 1]);
                        }
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={loading}
                    >
                      Back
                    </button>
                  )}
                  
                  {importStep === 'source' && (importFile || importUrl || gitConfig.url) && (
                    <button
                      onClick={() => setImportStep('options')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Continue
                    </button>
                  )}
                  
                  {importStep === 'options' && (
                    <button
                      onClick={() => setImportStep('validation')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Validate
                    </button>
                  )}
                  
                  {importStep === 'validation' && (
                    <button
                      onClick={handleValidateTemplate}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      disabled={loading}
                    >
                      {loading ? 'Validating...' : 'Validate Template'}
                    </button>
                  )}
                  
                  {importStep === 'preview' && validation?.valid && (
                    <button
                      onClick={handleImportTemplate}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      disabled={loading}
                    >
                      Import Template
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Export UI */}
              {/* Error Display for Export */}
              {errors.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-800 text-sm font-medium mb-2">
                    <FiX className="mr-2" />
                    Export Error:
                  </div>
                  <div className="text-red-700 text-sm">{errors[0]}</div>
                </div>
              )}
              
              <div className="min-h-[400px]">
                {renderExportOptions()}
              </div>

              <div className="flex justify-between pt-6 border-t">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleExportTemplate}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Exporting...' : 'Export Template'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};