/**
 * Epic 9.3.3 - Version Restore Dialog Component
 * UI for version restoration with conflict resolution, preview, and progress tracking
 */

import React, { useState, useEffect } from 'react';
import { 
  VersionRestoreManager, 
  RestoreOptions, 
  RestorePreview, 
  RestoreConflict, 
  RestoreState, 
  RestoreResult 
} from '../../version-history/VersionRestoreManager';
import { VersionSnapshot } from '../../version-history/VersionHistoryManager';

interface VersionRestoreDialogProps {
  snapshot: VersionSnapshot;
  currentGraphData: unknown;
  restoreManager: VersionRestoreManager;
  isOpen: boolean;
  onClose: () => void;
  onRestoreComplete: (result: RestoreResult) => void;
  className?: string;
}

type DialogStep = 'options' | 'preview' | 'conflicts' | 'progress' | 'result';

export const VersionRestoreDialog: React.FC<VersionRestoreDialogProps> = ({
  snapshot,
  currentGraphData,
  restoreManager,
  isOpen,
  onClose,
  onRestoreComplete,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState<DialogStep>('options');
  const [restoreOptions, setRestoreOptions] = useState<RestoreOptions>({
    create_backup: true,
    backup_title: `Pre-restore backup ${new Date().toLocaleDateString()}`,
    restore_mode: 'merge',
    conflict_resolution: 'prompt',
    preserve_current_changes: true,
    restore_metadata: true,
    restore_workflow_state: false,
    notify_collaborators: true
  });
  const [preview, setPreview] = useState<RestorePreview | null>(null);
  const [conflicts, setConflicts] = useState<RestoreConflict[]>([]);
  const [conflictResolutions, setConflictResolutions] = useState<Record<string, string>>({});
  const [restoreState, setRestoreState] = useState<RestoreState | null>(null);
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      resetDialog();
    }
  }, [isOpen]);

  useEffect(() => {
    // Poll for restore state updates when restore is in progress
    let interval: NodeJS.Timeout;
    
    if (restoreState?.id && restoreState.status === 'in_progress') {
      interval = setInterval(async () => {
        const updatedState = restoreManager.getRestoreState(restoreState.id);
        if (updatedState) {
          setRestoreState(updatedState);
          
          if (updatedState.status === 'completed' || updatedState.status === 'failed') {
            clearInterval(interval);
            if (updatedState.status === 'completed') {
              setCurrentStep('result');
            }
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [restoreState?.id, restoreState?.status]);

  const resetDialog = () => {
    setCurrentStep('options');
    setPreview(null);
    setConflicts([]);
    setConflictResolutions({});
    setRestoreState(null);
    setRestoreResult(null);
    setError('');
  };

  const handleOptionsNext = async () => {
    try {
      setLoading(true);
      setError('');
      
      const previewData = await restoreManager.createRestorePreview(
        snapshot.id,
        currentGraphData,
        restoreOptions
      );
      
      setPreview(previewData);
      setConflicts(previewData.conflicts);
      
      if (previewData.conflicts.length > 0) {
        // Initialize conflict resolutions with suggested resolutions
        const initialResolutions: Record<string, string> = {};
        previewData.conflicts.forEach(conflict => {
          initialResolutions[conflict.id] = conflict.suggested_resolution;
        });
        setConflictResolutions(initialResolutions);
        setCurrentStep('conflicts');
      } else {
        setCurrentStep('preview');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create restore preview');
    } finally {
      setLoading(false);
    }
  };

  const handleConflictsNext = () => {
    // Validate that all conflicts have resolutions
    const unresolvedConflicts = conflicts.filter(c => 
      !conflictResolutions[c.id] || conflictResolutions[c.id] === 'manual'
    );
    
    if (unresolvedConflicts.length > 0) {
      setError(`Please resolve all conflicts before proceeding. ${unresolvedConflicts.length} conflicts remaining.`);
      return;
    }
    
    setCurrentStep('preview');
  };

  const handleExecuteRestore = async () => {
    try {
      setLoading(true);
      setError('');
      setCurrentStep('progress');
      
      const { restoreId, result } = await restoreManager.executeRestore(
        snapshot.id,
        restoreOptions,
        conflictResolutions
      );
      
      // Set initial restore state
      setRestoreState({
        id: restoreId,
        status: 'in_progress',
        progress: 0,
        current_step: 'Starting restore...',
        total_steps: 8,
        completed_steps: 0,
        started_at: new Date().toISOString()
      });
      
      // Wait for result
      try {
        const finalResult = await result;
        setRestoreResult(finalResult);
        onRestoreComplete(finalResult);
        setCurrentStep('result');
      } catch (restoreError) {
        setError(restoreError instanceof Error ? restoreError.message : 'Restore failed');
        setCurrentStep('result');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start restore');
    } finally {
      setLoading(false);
    }
  };

  const handleConflictResolutionChange = (conflictId: string, resolution: string) => {
    setConflictResolutions(prev => ({
      ...prev,
      [conflictId]: resolution
    }));
  };

  const getRiskLevelColor = (level: string): string => {
    switch (level) {
    case 'low': return 'text-green-600 bg-green-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'high': return 'text-orange-600 bg-orange-100';
    case 'critical': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
    case 'low': return 'text-green-600';
    case 'medium': return 'text-yellow-600';
    case 'high': return 'text-orange-600';
    case 'critical': return 'text-red-600';
    default: return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`version-restore-dialog ${className} fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4`}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Restore Version</h2>
              <p className="text-sm text-gray-600 mt-1">
                Restoring to: {snapshot.title || `Version ${snapshot.version_number}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mt-4 space-x-4">
            {[
              { key: 'options', label: 'Options' },
              { key: 'conflicts', label: 'Conflicts' },
              { key: 'preview', label: 'Preview' },
              { key: 'progress', label: 'Progress' },
              { key: 'result', label: 'Result' }
            ].map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step.key
                    ? 'bg-blue-500 text-white'
                    : ['options', 'conflicts', 'preview'].indexOf(currentStep) > ['options', 'conflicts', 'preview'].indexOf(step.key)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm ${
                  currentStep === step.key ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
                {index < 4 && <div className="w-8 h-0.5 bg-gray-200 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'options' && (
            <RestoreOptionsStep
              options={restoreOptions}
              onChange={setRestoreOptions}
              snapshot={snapshot}
            />
          )}

          {currentStep === 'conflicts' && (
            <ConflictResolutionStep
              conflicts={conflicts}
              resolutions={conflictResolutions}
              onResolutionChange={handleConflictResolutionChange}
              getSeverityColor={getSeverityColor}
            />
          )}

          {currentStep === 'preview' && preview && (
            <RestorePreviewStep
              preview={preview}
              options={restoreOptions}
              conflicts={conflicts}
              getRiskLevelColor={getRiskLevelColor}
            />
          )}

          {currentStep === 'progress' && restoreState && (
            <RestoreProgressStep
              restoreState={restoreState}
              onCancel={() => restoreManager.cancelRestore(restoreState.id)}
            />
          )}

          {currentStep === 'result' && restoreResult && (
            <RestoreResultStep
              result={restoreResult}
              onClose={onClose}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <div className="flex space-x-3">
            {currentStep === 'options' && (
              <button
                onClick={handleOptionsNext}
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Next'}
              </button>
            )}

            {currentStep === 'conflicts' && (
              <button
                onClick={handleConflictsNext}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Continue
              </button>
            )}

            {currentStep === 'preview' && (
              <button
                onClick={handleExecuteRestore}
                disabled={loading}
                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Starting...' : 'Execute Restore'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components

interface RestoreOptionsStepProps {
  options: RestoreOptions;
  onChange: (options: RestoreOptions) => void;
  snapshot: VersionSnapshot;
}

const RestoreOptionsStep: React.FC<RestoreOptionsStepProps> = ({ options, onChange, snapshot }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Restore Options</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure how the version should be restored. These settings will affect how conflicts are handled and what data is restored.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Options */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Backup</h4>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.create_backup}
              onChange={(e) => onChange({ ...options, create_backup: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Create backup before restore</span>
          </label>

          {options.create_backup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Backup title
              </label>
              <input
                type="text"
                value={options.backup_title || ''}
                onChange={(e) => onChange({ ...options, backup_title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Pre-restore backup"
              />
            </div>
          )}
        </div>

        {/* Restore Mode */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Restore Mode</h4>
          
          <div className="space-y-2">
            {[
              { value: 'merge', label: 'Merge', description: 'Intelligently merge changes' },
              { value: 'full', label: 'Full Replace', description: 'Replace current version completely' },
              { value: 'selective', label: 'Selective', description: 'Choose specific elements to restore' }
            ].map(mode => (
              <label key={mode.value} className="flex items-start">
                <input
                  type="radio"
                  name="restore_mode"
                  value={mode.value}
                  checked={options.restore_mode === mode.value}
                  onChange={(e) => onChange({ ...options, restore_mode: e.target.value as any })}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-2">
                  <span className="text-sm font-medium text-gray-900">{mode.label}</span>
                  <p className="text-xs text-gray-600">{mode.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Conflict Resolution */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Conflict Resolution</h4>
          
          <div className="space-y-2">
            {[
              { value: 'prompt', label: 'Prompt for each conflict', description: 'Ask how to resolve each conflict' },
              { value: 'overwrite', label: 'Overwrite current', description: 'Use restored version for all conflicts' },
              { value: 'merge', label: 'Auto-merge', description: 'Automatically merge when possible' },
              { value: 'abort', label: 'Abort on conflict', description: 'Stop restore if conflicts are found' }
            ].map(resolution => (
              <label key={resolution.value} className="flex items-start">
                <input
                  type="radio"
                  name="conflict_resolution"
                  value={resolution.value}
                  checked={options.conflict_resolution === resolution.value}
                  onChange={(e) => onChange({ ...options, conflict_resolution: e.target.value as any })}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-2">
                  <span className="text-sm font-medium text-gray-900">{resolution.label}</span>
                  <p className="text-xs text-gray-600">{resolution.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Additional Options</h4>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.preserve_current_changes}
                onChange={(e) => onChange({ ...options, preserve_current_changes: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Preserve current changes when possible</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.restore_metadata}
                onChange={(e) => onChange({ ...options, restore_metadata: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Restore metadata and properties</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.restore_workflow_state}
                onChange={(e) => onChange({ ...options, restore_workflow_state: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Restore workflow state</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.notify_collaborators}
                onChange={(e) => onChange({ ...options, notify_collaborators: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Notify collaborators of restore</span>
            </label>
          </div>
        </div>
      </div>

      {/* Snapshot Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Snapshot Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Created:</span>
            <span className="ml-2 text-gray-900">{new Date(snapshot.created_at).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-600">By:</span>
            <span className="ml-2 text-gray-900">{snapshot.created_by}</span>
          </div>
          <div>
            <span className="text-gray-600">Nodes:</span>
            <span className="ml-2 text-gray-900">{snapshot.node_count}</span>
          </div>
          <div>
            <span className="text-gray-600">Size:</span>
            <span className="ml-2 text-gray-900">{Math.round(snapshot.size_bytes / 1024)} KB</span>
          </div>
        </div>
        {snapshot.description && (
          <div className="mt-2">
            <span className="text-gray-600">Description:</span>
            <p className="text-gray-900 mt-1">{snapshot.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface ConflictResolutionStepProps {
  conflicts: RestoreConflict[];
  resolutions: Record<string, string>;
  onResolutionChange: (conflictId: string, resolution: string) => void;
  getSeverityColor: (severity: string) => string;
}

const ConflictResolutionStep: React.FC<ConflictResolutionStepProps> = ({
  conflicts,
  resolutions,
  onResolutionChange,
  getSeverityColor
}) => {
  const conflictsByType = conflicts.reduce((acc, conflict) => {
    if (!acc[conflict.type]) acc[conflict.type] = [];
    acc[conflict.type].push(conflict);
    return acc;
  }, {} as Record<string, RestoreConflict[]>);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Resolve Conflicts</h3>
        <p className="text-sm text-gray-600">
          {conflicts.length} conflicts were found. Please choose how to resolve each one.
        </p>
      </div>

      {Object.entries(conflictsByType).map(([type, typeConflicts]) => (
        <div key={type} className="space-y-4">
          <h4 className="font-medium text-gray-900 capitalize">
            {type.replace('_', ' ')} Conflicts ({typeConflicts.length})
          </h4>
          
          <div className="space-y-3">
            {typeConflicts.map(conflict => (
              <div key={conflict.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-medium text-gray-900">{conflict.element_id}</h5>
                      <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(conflict.severity)}`}>
                        {conflict.severity}
                      </span>
                      {conflict.auto_resolvable && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Auto-resolvable
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{conflict.description}</p>
                  </div>
                </div>

                {/* Show current vs restore values */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <h6 className="font-medium text-gray-700 mb-1">Current Value</h6>
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <pre className="text-xs text-red-800 whitespace-pre-wrap">
                        {JSON.stringify(conflict.current_value, null, 2).slice(0, 200)}
                      </pre>
                    </div>
                  </div>
                  <div>
                    <h6 className="font-medium text-gray-700 mb-1">Restore Value</h6>
                    <div className="bg-green-50 border border-green-200 rounded p-2">
                      <pre className="text-xs text-green-800 whitespace-pre-wrap">
                        {JSON.stringify(conflict.restore_value, null, 2).slice(0, 200)}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Resolution options */}
                <div>
                  <h6 className="font-medium text-gray-700 mb-2">Resolution</h6>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'keep_current', label: 'Keep Current', description: 'Keep the current value' },
                      { value: 'use_restore', label: 'Use Restore', description: 'Use the restored value' },
                      { value: 'merge', label: 'Merge', description: 'Attempt to merge both values', disabled: !conflict.auto_resolvable },
                      { value: 'manual', label: 'Manual', description: 'Resolve manually later' }
                    ].map(option => (
                      <label key={option.value} className={`flex items-start p-2 border rounded ${
                        resolutions[conflict.id] === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      } ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                          type="radio"
                          name={`conflict-${conflict.id}`}
                          value={option.value}
                          checked={resolutions[conflict.id] === option.value}
                          onChange={(e) => onResolutionChange(conflict.id, e.target.value)}
                          disabled={option.disabled}
                          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="ml-2">
                          <span className="text-sm font-medium text-gray-900">{option.label}</span>
                          <p className="text-xs text-gray-600">{option.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

interface RestorePreviewStepProps {
  preview: RestorePreview;
  options: RestoreOptions;
  conflicts: RestoreConflict[];
  getRiskLevelColor: (level: string) => string;
}

const RestorePreviewStep: React.FC<RestorePreviewStepProps> = ({
  preview,
  options,
  conflicts,
  getRiskLevelColor
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Restore Preview</h3>
        <p className="text-sm text-gray-600">
          Review the changes that will be made during the restore operation.
        </p>
      </div>

      {/* Risk Assessment */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Risk Assessment</h4>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(preview.risk_level)}`}>
            {preview.risk_level.toUpperCase()} RISK
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Estimated Duration:</span>
            <span className="ml-2 text-gray-900">{preview.estimated_duration}s</span>
          </div>
          <div>
            <span className="text-gray-600">Backup Required:</span>
            <span className="ml-2 text-gray-900">{preview.backup_required ? 'Yes' : 'No'}</span>
          </div>
          <div>
            <span className="text-gray-600">Conflicts:</span>
            <span className="ml-2 text-gray-900">{conflicts.length}</span>
          </div>
        </div>
      </div>

      {/* Changes Summary */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Changes Summary</h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Nodes to Add', value: preview.changes_summary.nodes_to_add, color: 'text-green-600' },
            { label: 'Nodes to Remove', value: preview.changes_summary.nodes_to_remove, color: 'text-red-600' },
            { label: 'Nodes to Modify', value: preview.changes_summary.nodes_to_modify, color: 'text-orange-600' },
            { label: 'Edges to Add', value: preview.changes_summary.edges_to_add, color: 'text-green-600' },
            { label: 'Edges to Remove', value: preview.changes_summary.edges_to_remove, color: 'text-red-600' },
            { label: 'Edges to Modify', value: preview.changes_summary.edges_to_modify, color: 'text-orange-600' },
            { label: 'Properties to Change', value: preview.changes_summary.properties_to_change, color: 'text-blue-600' }
          ].map(item => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className={`text-sm font-medium ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Collaborator Impact */}
      {preview.collaborator_impact.active_users.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Collaborator Impact</h4>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Active Users:</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {preview.collaborator_impact.active_users.map(user => (
                  <span key={user} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {user}
                  </span>
                ))}
              </div>
            </div>
            
            {preview.collaborator_impact.recommended_actions.length > 0 && (
              <div>
                <span className="text-sm text-gray-600">Recommended Actions:</span>
                <ul className="mt-1 text-sm text-gray-700 list-disc list-inside">
                  {preview.collaborator_impact.recommended_actions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Final Warning */}
      {preview.risk_level === 'high' || preview.risk_level === 'critical' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">High Risk Operation</h3>
              <p className="text-sm text-yellow-700 mt-1">
                This restore operation carries significant risk. Please ensure you have a backup and all collaborators are notified.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface RestoreProgressStepProps {
  restoreState: RestoreState;
  onCancel: () => void;
}

const RestoreProgressStep: React.FC<RestoreProgressStepProps> = ({ restoreState, onCancel }) => {
  return (
    <div className="space-y-6 text-center">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Restore in Progress</h3>
        <p className="text-sm text-gray-600">
          Please wait while the version is being restored. This process cannot be undone.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm text-gray-900">{restoreState.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${restoreState.progress}%` }}
          />
        </div>
      </div>

      {/* Current Step */}
      <div>
        <h4 className="font-medium text-gray-900 mb-2">{restoreState.current_step}</h4>
        <p className="text-sm text-gray-600">
          Step {restoreState.completed_steps} of {restoreState.total_steps}
        </p>
      </div>

      {/* Cancel Button */}
      {restoreState.status === 'in_progress' && (
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
        >
          Cancel Restore
        </button>
      )}
    </div>
  );
};

interface RestoreResultStepProps {
  result: RestoreResult;
  onClose: () => void;
}

const RestoreResultStep: React.FC<RestoreResultStepProps> = ({ result, onClose }) => {
  return (
    <div className="space-y-6 text-center">
      <div>
        {result.success ? (
          <div className="text-green-600 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        ) : (
          <div className="text-red-600 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {result.success ? 'Restore Completed' : 'Restore Failed'}
        </h3>
        <p className="text-sm text-gray-600">
          {result.success 
            ? 'The version has been successfully restored to your project.'
            : 'The restore operation failed. Your project remains unchanged.'
          }
        </p>
      </div>

      {/* Result Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Duration:</span>
            <span className="ml-2 text-gray-900">{(result.duration_ms / 1000).toFixed(1)}s</span>
          </div>
          <div>
            <span className="text-gray-600">Conflicts Resolved:</span>
            <span className="ml-2 text-gray-900">{result.conflicts_resolved}</span>
          </div>
          <div>
            <span className="text-gray-600">Nodes Changed:</span>
            <span className="ml-2 text-gray-900">
              {result.changes_applied.nodes_added + result.changes_applied.nodes_removed + result.changes_applied.nodes_modified}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Edges Changed:</span>
            <span className="ml-2 text-gray-900">
              {result.changes_applied.edges_added + result.changes_applied.edges_removed + result.changes_applied.edges_modified}
            </span>
          </div>
        </div>
        
        {result.backup_snapshot_id && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <span className="text-gray-600">Backup Created:</span>
            <span className="ml-2 text-gray-900 font-mono text-xs">{result.backup_snapshot_id}</span>
          </div>
        )}
      </div>

      {/* Warnings and Errors */}
      {(result.warnings.length > 0 || result.errors.length > 0) && (
        <div className="space-y-3">
          {result.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left">
              <h5 className="font-medium text-yellow-800 mb-2">Warnings</h5>
              <ul className="text-sm text-yellow-700 list-disc list-inside">
                {result.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
          
          {result.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-left">
              <h5 className="font-medium text-red-800 mb-2">Errors</h5>
              <ul className="text-sm text-red-700 list-disc list-inside">
                {result.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <button
        onClick={onClose}
        className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Close
      </button>
    </div>
  );
};