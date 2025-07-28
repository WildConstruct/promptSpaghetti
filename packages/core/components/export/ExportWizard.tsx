import React, { useState, useEffect } from 'react';
import { VFXExportPreview } from './VFXExportPreview';
import { 
  ExportTemplate, 
  ExportFormat, 
  ExportType, 
  CreateExportJob,
  ExportFormatDefinition,
  CommonExportOptions,
  JsonExportOptions,
  YamlExportOptions,
  XmlExportOptions,
  CsvExportOptions,
  MarkdownExportOptions,
  PdfExportOptions,
  HtmlExportOptions,
  ZipExportOptions,
  VFXExportOptions,
  validateExportOptions
} from '../../types/export';
import { useExport } from '../../hooks/useExport';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiX, 
  FiFile, 
  FiSettings, 
  FiFilter, 
  FiCheck,
  FiDownload,
  FiInfo
} from 'react-icons/fi';
interface ExportWizardProps {
  projectId: string;
  template?: ExportTemplate | null;
  onComplete: (exportData: CreateExportJob) => void;,
  onCancel: () => void;
  type WizardStep = 'format' | 'options' | 'filters' | 'review';
  const EXPORT_FORMATS: Array<{,
  value: ExportFormat;,
  label: string;
  description: string;,
  icon: string;
}> = [
  { value: 'vfx', label: 'VFX Pipeline', description: 'Wild Construct VFX export for film production', icon: '🎬' },
  { value: 'json', label: 'JSON', description: 'JavaScript Object Notation - structured data', icon: '{}' },
  { value: 'yaml', label: 'YAML', description: 'Human-readable data serialization', icon: '📄' },
  { value: 'xml', label: 'XML', description: 'Extensible Markup Language', icon: '</>' },
  { value: 'csv', label: 'CSV', description: 'Comma-separated values - spreadsheet format', icon: '📊' },
  { value: 'markdown', label: 'Markdown', description: 'Human-readable markup format', icon: '📝' },
  { value: 'pdf', label: 'PDF', description: 'Portable Document Format', icon: '📋' },
  { value: 'html', label: 'HTML', description: 'Web page format', icon: '🌐' },
  { value: 'zip', label: 'ZIP', description: 'Compressed archive', icon: '📦' }
];
const EXPORT_TYPES: Array<{,
  value: ExportType;
  label: string;,
  description: string;
}> = [
  { value: 'version', label: 'Version Snapshot', description: 'Export a specific version of the project' },
  { value: 'branch', label: 'Branch Data', description: 'Export data from a specific branch' },
  { value: 'comparison', label: 'Version Comparison', description: 'Export differences between versions' },
  { value: 'full_project', label: 'Full Project', description: 'Export entire project with all data' }
];

export const ExportWizard: React.FC<ExportWizardProps> = ({)
  projectId,
  template,
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('format');
  const [exportData, setExportData] = useState<Partial<CreateExportJob>>({)
  export_format: template?.export_format || 'json',
    export_type: 'full_project',
    export_scope: {},
    export_options: {},
    custom_filters: {}
  });
  const [formatDefinitions, setFormatDefinitions] = useState<ExportFormatDefinition>([]);
  const [validationErrors, setValidationErrors] = useState<string>([]);
  const { createExportJob, loading } = useExport(projectId);
  useEffect(() => {
    // Load format definitions
    const loadFormats = async () => {
      try {
        const response = await fetch('/api/export/formats');
        const data = await response.json();
        if (data.success) {
          setFormatDefinitions(data.data);
      } catch (error) {
  console.error('Failed to load format definitions:', error);
};
    loadFormats();
  }, []);
  useEffect(() => {
    if (template) {
      setExportData({)
  export_format: template.export_format,
        export_type: 'full_project',
        export_scope: {},
        export_options: template.format_options || {},
        custom_filters: template.filter_options || {}
      });
  }, [template]);
  const handleNext = () => {
  if (validateCurrentStep()) {
  const steps: WizardStep = ['format', 'options', 'filters', 'review'];
  const currentIndex = steps.indexOf(currentStep);
  if (currentIndex < steps.length - 1) {
  setCurrentStep(steps[currentIndex + 1]);
};
  const handlePrevious = () => {
  const steps: WizardStep = ['format', 'options', 'filters', 'review'];
  const currentIndex = steps.indexOf(currentStep);
  if (currentIndex > 0) {
  setCurrentStep(steps[currentIndex - 1]);
};
  const validateCurrentStep = (): boolean => {
  const errors: string = [];
  switch (currentStep) {
  case 'format':,
  if (!exportData.export_format) {
  errors.push('Please select an export format');
  if (!exportData.export_type) {
  errors.push('Please select an export type');
  break;
  case 'options':,
  if (exportData.export_format && exportData.export_options) {
  const validation = validateExportOptions(exportData.export_format, exportData.export_options);
  if (!validation.success) {
  errors.push(...validation.error.errors.map(e => e.message));
  break;
  setValidationErrors(errors);
  return errors.length === 0;
};
  const handleComplete = async () => {
  if (!validateCurrentStep()) return;
  try {
  const completeExportData = {
  ...exportData,
  template_id: template?.id,
} as CreateExportJob;
      await createExportJob(completeExportData);
      onComplete(completeExportData);
    } catch (error) {
  console.error('Failed to create export job:', error);
};
  const renderFormatStep = () => (;);
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Choose Export Format
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXPORT_FORMATS.map((format) => ()
            <button
              key={format.value}
              onClick={() => setExportData(prev => ({ ...prev, export_format: format.value }))}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
  exportData.export_format === format.value
  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{format.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{format.label}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{format.description}</p>
                  </div>
                </div>
                {exportData.export_format === format.value && ()
                  <FiCheck className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Export Type
        </h3>
        <div className="space-y-3">
          {EXPORT_TYPES.map((type) => ()
            <button
              key={type.value}
              onClick={() => setExportData(prev => ({ ...prev, export_type: type.value }))}
              className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
  exportData.export_type === type.value
  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{type.label}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{type.description}</p>
                </div>
                {exportData.export_type === type.value && ()
                  <FiCheck className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  const renderOptionsStep = () => {
    const _____currentFormat = formatDefinitions.find(f => f.format_name === exportData.export_format);
    return;
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Export Options
          </h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <FiInfo className="w-5 h-5 text-blue-600 mr-2" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Configure format-specific options for {exportData.export_format?.toUpperCase()} export
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Common Options */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Content Options</h4>
            {[
              { key: 'include_metadata', label: 'Include Metadata', description: 'Export metadata and timestamps' },
              { key: 'include_attribution', label: 'Include Attribution', description: 'Export author and contribution data' },
              { key: 'include_history', label: 'Include History', description: 'Export version history' },
              { key: 'include_branching', label: 'Include Branching', description: 'Export branch information' },
              { key: 'include_comments', label: 'Include Comments', description: 'Export comments and annotations' },
              { key: 'include_attachments', label: 'Include Attachments', description: 'Export file attachments' }
            ].map((option) => ()
              <label key={option.key} className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={exportData.export_options?.[option.key] || false}
                  onChange={(e) => setExportData(prev => ({)
  ...prev,
  export_options: {,
  ...prev.export_options,
  [option.key]: e.target.checked,
}))}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
          {/* Format-Specific Options */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Format Options</h4>
            {exportData.export_format === 'json' && ()
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportData.export_options?.pretty || false}
                    onChange={(e) => setExportData(prev => ({)
  ...prev,
  export_options: {,
  ...prev.export_options,
  pretty: e.target.checked,
}))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-900 dark:text-white">Pretty Print JSON</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportData.export_options?.include_schema || false}
                    onChange={(e) => setExportData(prev => ({)
  ...prev,
  export_options: {,
  ...prev.export_options,
  include_schema: e.target.checked,
}))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-900 dark:text-white">Include JSON Schema</span>
                </label>
              </div>
            )}
            {exportData.export_format === 'csv' && ()
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Delimiter
                  </label>
                  <select
                    value={exportData.export_options?.delimiter || ','}
                    onChange={(e) => setExportData(prev => ({)
  ...prev,
  export_options: {,
  ...prev.export_options,
  delimiter: e.target.value,
}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value=",">Comma ()</option>
                    <option value=";">Semicolon (;)</option>
                    <option value="\t">Tab</option>
                    <option value="|">Pipe (|)</option>
                  </select>
                </div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportData.export_options?.include_headers || false}
                    onChange={(e) => setExportData(prev => ({)
  ...prev,
  export_options: {,
  ...prev.export_options,
  include_headers: e.target.checked,
}))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-900 dark:text-white">Include Headers</span>
                </label>
              </div>
            )}
            {exportData.export_format === 'pdf' && ()
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Page Size
                  </label>
                  <select
                    value={exportData.export_options?.page_size || 'A4'}
                    onChange={(e) => setExportData(prev => ({)
  ...prev,
  export_options: {,
  ...prev.export_options,
  page_size: e.target.value,
}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="A4">A4</option>
                    <option value="A3">A3</option>
                    <option value="Letter">Letter</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportData.export_options?.include_images || false}
                    onChange={(e) => setExportData(prev => ({)
  ...prev,
  export_options: {,
  ...prev.export_options,
  include_images: e.target.checked,
}))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-900 dark:text-white">Include Images</span>
                </label>
              </div>
            )}
            {exportData.export_format === 'vfx' && ()
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Export Quality
                  </label>
                  <select
                    value={exportData.export_options?.quality || 'production'}
                    onChange={(e) => setExportData(prev => ({)
  ...prev,
  export_options: {,
  ...prev.export_options,
  quality: e.target.value,
}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="production">Production</option>
                    <option value="preview">Preview</option>
                    <option value="debug">Debug</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-900 dark:text-white">VFX Features</h5>
                  {[
                    { key: 'include_debug_info', label: 'Include Debug Info', description: 'Add debugging information for troubleshooting' },
                    { key: 'include_performance_data', label: 'Include Performance Data', description: 'Export execution timing and metrics' },
                    { key: 'include_variant_data', label: 'Include Variant Data', description: 'Export multiple prompt variations' },
                    { key: 'enable_controlnet_support', label: 'Enable ControlNet Support', description: 'Include ControlNet-compatible parameters' },
                    { key: 'enable_animation_framework', label: 'Enable Animation Framework', description: 'Include animation sequence support' }
                  ].map((option) => ()
                    <label key={option.key} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={exportData.export_options?.[option.key] ?? true}
                        onChange={(e) => setExportData(prev => ({)
  ...prev,
  export_options: {,
  ...prev.export_options,
  [option.key]: e.target.checked,
}))}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-900 dark:text-white">Rendering Data</h5>
                  {[
                    { key: 'include_rendering_data', label: 'Include Rendering Data', description: 'Export render quality and style settings' },
                    { key: 'include_camera_data', label: 'Include Camera Data', description: 'Export camera parameters and positioning' },
                    { key: 'include_lighting_data', label: 'Include Lighting Data', description: 'Export lighting conditions and setup' }
                  ].map((option) => ()
                    <label key={option.key} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={exportData.export_options?.[option.key] ?? true}
                        onChange={(e) => setExportData(prev => ({)
  ...prev,
  export_options: {,
  ...prev.export_options,
  [option.key]: e.target.checked,
}))}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-900 dark:text-white">Reproducibility</h5>
                  {[
                    { key: 'include_reproducibility_data', label: 'Include Reproducibility Data', description: 'Export data needed for exact reproduction' },
                    { key: 'exact_reproduction', label: 'Exact Reproduction', description: 'Enable bit-perfect result reproduction' },
                    { key: 'preserve_node_configuration', label: 'Preserve Node Configuration', description: 'Save complete node settings' },
                    { key: 'include_rng_states', label: 'Include RNG States', description: 'Export random number generator states' }
                  ].map((option) => ()
                    <label key={option.key} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={exportData.export_options?.[option.key] ?? true}
                        onChange={(e) => setExportData(prev => ({)
  ...prev,
  export_options: {,
  ...prev.export_options,
  [option.key]: e.target.checked,
}))}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  const renderFiltersStep = () => (;);
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Content Filters
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Apply filters to customize what data is included in your export
        </p>
      </div>
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Date Range</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={exportData.custom_filters?.date_range?.start || ''}
                onChange={(e) => setExportData(prev => ({)
  ...prev,
  custom_filters: {,
  ...prev.custom_filters,
  date_range: {,
  ...prev.custom_filters?.date_range,
  start: e.target.value,
}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={exportData.custom_filters?.date_range?.end || ''}
                onChange={(e) => setExportData(prev => ({)
  ...prev,
  custom_filters: {,
  ...prev.custom_filters,
  date_range: {,
  ...prev.custom_filters?.date_range,
  end: e.target.value,
}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Output Options</h4>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={exportData.custom_filters?.compress_output || false}
                onChange={(e) => setExportData(prev => ({)
  ...prev,
  custom_filters: {,
  ...prev.custom_filters,
  compress_output: e.target.checked,
}))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-900 dark:text-white">Compress Output</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={exportData.custom_filters?.encrypt_output || false}
                onChange={(e) => setExportData(prev => ({)
  ...prev,
  custom_filters: {,
  ...prev.custom_filters,
  encrypt_output: e.target.checked,
}))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-900 dark:text-white">Encrypt Output</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
  const renderReviewStep = () => {
    if (exportData.export_format === 'vfx') {
      return;
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              VFX Export Review & Validation
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Review your VFX export configuration and validate compatibility
            </p>
          </div>
          <VFXExportPreview 
            exportData={exportData as CreateExportJob}
            onValidationComplete={(isValid, results) => {
              // Update validation errors based on VFX validation
              if (!isValid && results) {
                setValidationErrors(results.errors);
              } else {
                setValidationErrors([]);
            }}
          />
        </div>
      );
    return;
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Review Export Configuration
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            Review your export settings before starting the export process
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Export Format</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {EXPORT_FORMATS.find(f => f.value === exportData.export_format)?.label} - {EXPORT_FORMATS.find(f => f.value === exportData.export_format)?.description}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Export Type</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {EXPORT_TYPES.find(t => t.value === exportData.export_type)?.label} - {EXPORT_TYPES.find(t => t.value === exportData.export_type)?.description}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Content Options</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(exportData.export_options || {}).map(([key, value]) => ()
                value && ()
                  <div key={key} className="flex items-center space-x-2">
                    <FiCheck className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
              ))}
            </div>
          </div>
          {exportData.custom_filters?.date_range && ()
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Date Range</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {exportData.custom_filters.date_range.start || 'No start date'} to {exportData.custom_filters.date_range.end || 'No end date'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };
  const renderStepContent = () => {
  switch (currentStep) {
  case 'format':,
  return renderFormatStep();
  case 'options':,
  return renderOptionsStep();
  case 'filters':,
  return renderFiltersStep();
  case 'review':,
  return renderReviewStep();
  default:,
  return null;
};
  const getStepIcon = (step: WizardStep) => {
  switch (step) {
  case 'format':,
  return FiFile;
  case 'options':,
  return FiSettings;
  case 'filters':,
  return FiFilter;
  case 'review':,
  return FiCheck;
  default:,
  return FiFile;
};
  const steps = [;
    { id: 'format', label: 'Format' },
    { id: 'options', label: 'Options' },
    { id: 'filters', label: 'Filters' },
    { id: 'review', label: 'Review' }
  ];
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  return;
    <div className="export-wizard">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {template ? 'Export with Template' : 'New Export'}
          </h2>
          {template && ()
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Using template: {template.name}
            </p>
          )}
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <FiX className="w-6 h-6" />
        </button>
      </div>
      {/* Progress Steps */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = getStepIcon(step.id as WizardStep);
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;
            return;
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
  isActive
  ? 'bg-blue-600 text-white'
  : isCompleted,
  ? 'bg-green-600 text-white'
  : 'bg-gray-300 text-gray-600',
}`}>
                  {isCompleted ? ()
                    <FiCheck className="w-4 h-4" />
                  ) : ()
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span className={`ml-2 text-sm ${
  isActive
  ? 'text-blue-600 font-medium'
  : isCompleted,
  ? 'text-green-600'
  : 'text-gray-500',
}`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && ()
                  <div className={`flex-1 h-0.5 mx-4 ${
  isCompleted ? 'bg-green-600' : 'bg-gray-300',
}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Content */}
      <div className="p-6 max-h-96 overflow-y-auto">
        {validationErrors.length > 0 && ()
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
              Please fix the following errors:
            </h4>
            <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
              {validationErrors.map((error, index) => ()
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        {renderStepContent()}
      </div>
      {/* Actions */}
      <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 'format'}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
          >
            Cancel
          </button>
          {currentStep === 'review' ? ()
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiDownload className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Start Export'}</span>
            </button>
          ) : ()
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              <span>Next</span>
              <FiChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportWizard;