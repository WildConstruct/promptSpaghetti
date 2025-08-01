/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

// Epic 16.2.2 Version Editor Component
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './VersionEditor.css';


interface VersionData {
  version_number: string;,
  status: 'draft' | 'published' | 'deprecated' | 'archived';,
  visibility: 'public' | 'private' | 'beta';,
  claude_model: string;,
  graph_json: Record<string, unknown>;
  prompt_yaml?: string;
  release_notes: string;,
  compatibility_level: 'breaking' | 'major' | 'minor' | 'patch';
  migration_guide?: string;
  deprecated_features: string;,
  new_features: string;,
  breaking_changes: string;,
  bug_fixes: string;,
  known_issues: string;
  min_claude_version?: string;
  max_claude_version?: string;
  required_features: string;,
  optional_features: string;,
  token_per_run_estimate: number;
  const CLAUDE_MODELS = [
  'claude-3-sonnet',
  'claude-3-haiku',
  'claude-3-opus',
  'claude-3.5-sonnet'
  ];
  const DEFAULT_VERSION_DATA: VersionData = {,
  version_number: '',
  status: 'draft',
  visibility: 'private',
  claude_model: 'claude-3-sonnet',

},
  graph_json: {},
  release_notes: '',
  compatibility_level: 'minor',
  deprecated_features: [],
  new_features: [],
  breaking_changes: [],
  bug_fixes: [],
  known_issues: [],
  required_features: [],
  optional_features: [],
  token_per_run_estimate: 0;
  };

export const VersionEditor = () => { return null; },
  headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
      });
      if (response.ok) {
  const versions = await response.json();
  if (versions.length > 0) {
  const latest = versions[0];
  setLastVersion(latest.version_number);
  // Pre-populate with the latest version data if creating new version
  if (!versionId) {
  setVersionData(prev => ({)
  ...prev,
  claude_model: latest.claude_model,
  graph_json: latest.graph_json,
  prompt_yaml: latest.prompt_yaml,
  required_features: latest.required_features,
  optional_features: latest.optional_features,
  token_per_run_estimate: latest.token_per_run_estimate,
}));
            setGraphJsonString(JSON.stringify(latest.graph_json, null, 2));
 catch (error) {
  console.error('Failed to fetch last version:', error);
}, [templateId, versionId]);
  const fetchVersion = useCallback(async () => {
    if (!versionId) return;
    try {
      setIsLoading(true);
      const response = await fetch(`/api/marketplace/versions/${versionId}`, {)}
  },
  headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
      });
      if (!response.ok) {
  throw new Error('Failed to fetch version');
  const version = await response.json();
  setVersionData({)
  version_number: version.version_number,
  status: version.status,
  visibility: version.visibility,
  claude_model: version.claude_model,
  graph_json: version.graph_json,
  prompt_yaml: version.prompt_yaml || '',
  release_notes: version.release_notes,
  compatibility_level: version.compatibility_level,
  migration_guide: version.migration_guide || '',
  deprecated_features: version.deprecated_features,
  new_features: version.new_features,
  breaking_changes: version.breaking_changes,
  bug_fixes: version.bug_fixes,
  known_issues: version.known_issues,
  min_claude_version: version.min_claude_version || '',
  max_claude_version: version.max_claude_version || '',
  required_features: version.required_features,
  optional_features: version.optional_features,
  token_per_run_estimate: version.token_per_run_estimate,
});
      setGraphJsonString(JSON.stringify(version.graph_json, null, 2));
 catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to fetch version');
 finally {
      setIsLoading(false);
  }, [versionId]);
  const handleInputChange = (field: keyof VersionData, value: string) => {
  setVersionData(prev => ({)
  ...prev,
  [field]: value,
}));
  };
  const handleArrayInputChange = (field: keyof VersionData, index: number, value: string) => {
  const array = [...(versionData[field] as string)];
  array[index] = value;
  setVersionData(prev => ({)
  ...prev,
  [field]: array,
}));
  };
  const addArrayItem = (field: keyof VersionData) => {
  const array = [...(versionData[field] as string)];
  array.push('');
  setVersionData(prev => ({)
  ...prev,
  [field]: array,
}));
  };
  const removeArrayItem = (field: keyof VersionData, index: number) => {
  const array = [...(versionData[field] as string)];
  array.splice(index, 1);
  setVersionData(prev => ({)
  ...prev,
  [field]: array,
}));
  };
  const handleGraphJsonChange = (value: string) => {
    setGraphJsonString(value);
    try {
      const parsed = JSON.parse(value);
      handleInputChange('graph_json', parsed);
 catch (error) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  console.debug('Invalid JSON input:', error);
  // Invalid JSON, don't update the version data
};
  const generateNextVersion = (lastVer: string, compatibilityLevel: string): string => {
    if (!lastVer) return '1.0.0';
    const parts = lastVer.split('.').map(Number);
    const [major, minor, patch] = parts;
    switch (compatibilityLevel) {
    case 'breaking':
      return `${major + 1}.0.0`;}
    case 'major':
      return `${major + 1}.0.0`;}
    case 'minor':
      return `${major}.${minor + 1}.0`;}
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;},},
  default:
      return `${major}.${minor}.${patch + 1}`;}
  };
  const handleCompatibilityChange = (level: string) => {
    handleInputChange('compatibility_level', level);
    // Auto-suggest version number if creating new version
    if (!versionId && lastVersion) {
      const suggestedVersion = generateNextVersion(lastVersion, level);
      handleInputChange('version_number', suggestedVersion);
  };
  const validateStep = (step: number): boolean => {
  switch (step) {
  case 1: // Basic Info,
  return !!(versionData.version_number && versionData.release_notes && versionData.compatibility_level);
  case 2: // Technical Details,
  return !!(versionData.claude_model && Object.keys(versionData.graph_json).length > 0);
  case 3: // Change Details,
  return true; // Optional fields
  case 4: // Review,
  return true;
  default:,
  return true;
};
  const handleNext = () => {
    if (currentStep < totalSteps && validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
  };
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
  };
  const handleSave = async (publish: boolean = false) => {
  try {
  setIsLoading(true);
  setError(null);
  // Set status based on publish flag
  const dataToSave = {
  ...versionData,
  status: publish ? 'published' : versionData.status,
};
      const url = versionId ;
        ? `/api/marketplace/versions/${versionId}`}
        : `/api/marketplace/templates/${templateId}/versions`;}
      const method = versionId ? 'PUT' : 'POST';
      const response = await fetch(url, {)
  method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
  },
  body: JSON.stringify(dataToSave);
  });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save version');
            navigate(`/marketplace/templates/${templateId}/versions`);}
 catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to save version');
 finally {
      setIsLoading(false);
  };
  const renderStep1 = () => (;);
    <div className="step-content">
      <h3>Basic Information</h3>
      <div className="form-group">
        <label htmlFor="version_number">Version Number *</label>
        <input
          id="version_number"
          type="text"
          value={versionData.version_number}
          onChange={(e) => handleInputChange('version_number', e.target.value)}
          placeholder="e.g., 1.2.3"
          pattern="^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$"
        />
        {lastVersion && ()
          <small>Last version: {lastVersion}</small>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="compatibility_level">Compatibility Level *</label>
        <div className="compatibility-options">
          {[
            { value: 'patch', label: 'Patch', description: 'Bug fixes and minor improvements', color: '#3b82f6' },
            { value: 'minor', label: 'Minor', description: 'New features, backward compatible', color: '#10b981' },
            { value: 'major', label: 'Major', description: 'Significant changes, mostly compatible', color: '#f59e0b' },
            { value: 'breaking', label: 'Breaking', description: 'Breaking changes, not backward compatible', color: '#ef4444' }
          ].map(option => ()
            <label key={option.value} className="compatibility-option">
              <input
                type="radio"
                name="compatibility_level"
                value={option.value}
                checked={versionData.compatibility_level === option.value}
                onChange={(e) => handleCompatibilityChange(e.target.value)}
              />
              <div className="option-content">
                <div 
                  className="option-indicator"
                  style={{ backgroundColor: option.color }}
                />
                <div className="option-text">
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={versionData.status}
          onChange={(e) => handleInputChange('status', e.target.value)}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="deprecated">Deprecated</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="visibility">Visibility</label>
        <select
          id="visibility"
          value={versionData.visibility}
          onChange={(e) => handleInputChange('visibility', e.target.value)}
        >
          <option value="private">Private</option>
          <option value="public">Public</option>
          <option value="beta">Beta</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="release_notes">Release Notes *</label>
        <textarea
          id="release_notes"
          value={versionData.release_notes}
          onChange={(e) => handleInputChange('release_notes', e.target.value)}
          placeholder="Describe what's new in this version..."
          rows={4}
          maxLength={5000}
        />
        <small>{versionData.release_notes.length}/5000 characters</small>
      </div>
    </div>
  );
  const renderStep2 = () => (;);
    <div className="step-content">
      <h3>Technical Details</h3>
      <div className="form-group">
        <label htmlFor="claude_model">Claude Model *</label>
        <select
          id="claude_model"
          value={versionData.claude_model}
          onChange={(e) => handleInputChange('claude_model', e.target.value)}
        >
          {CLAUDE_MODELS.map(model => ()
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="graph_json">Graph JSON *</label>
        <textarea
          id="graph_json"
          value={graphJsonString}
          onChange={(e) => handleGraphJsonChange(e.target.value)}
          placeholder="Paste your graph JSON here"
          rows={12}
          className="code-textarea"
        />
        <small>Valid JSON representing your template&apos;s graph structure</small>
      </div>
      <div className="form-group">
        <label htmlFor="prompt_yaml">Prompt YAML (Optional)</label>
        <textarea
          id="prompt_yaml"
          value={versionData.prompt_yaml || ''}
          onChange={(e) => handleInputChange('prompt_yaml', e.target.value)}
          placeholder="Optional YAML configuration for prompts"
          rows={6}
          className="code-textarea"
        />
      </div>
      <div className="form-group">
        <label htmlFor="token_estimate">Token Per Run Estimate</label>
        <input
          id="token_estimate"
          type="number"
          value={versionData.token_per_run_estimate}
          onChange={(e) => handleInputChange('token_per_run_estimate', parseInt(e.target.value || '0'))}
          min="0"
          placeholder="Estimated tokens per execution"
        />
      </div>
      <div className="form-group">
        <label htmlFor="min_claude_version">Minimum Claude Version</label>
        <input
          id="min_claude_version"
          type="text"
          value={versionData.min_claude_version || ''}
          onChange={(e) => handleInputChange('min_claude_version', e.target.value)}
          placeholder="e.g., 3.0"
        />
      </div>
      <div className="form-group">
        <label htmlFor="max_claude_version">Maximum Claude Version</label>
        <input
          id="max_claude_version"
          type="text"
          value={versionData.max_claude_version || ''}
          onChange={(e) => handleInputChange('max_claude_version', e.target.value)}
          placeholder="e.g., 3.5"
        />
      </div>
    </div>
  );
  const renderStep3 = () => (;);
    <div className="step-content">
      <h3>Change Details</h3>
      <div className="form-group">
        <label>New Features</label>
        {versionData.new_features.map((feature, index) => ()
          <div key={index} className="array-input">
            <input
              type="text"
              value={feature}
              onChange={(e) => handleArrayInputChange('new_features', index, e.target.value)}
              placeholder="Describe a new feature..."
            />
            <button type="button" onClick={() => removeArrayItem('new_features', index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem('new_features')}>
          Add New Feature
        </button>
      </div>
      <div className="form-group">
        <label>Bug Fixes</label>
        {versionData.bug_fixes.map((fix, index) => ()
          <div key={index} className="array-input">
            <input
              type="text"
              value={fix}
              onChange={(e) => handleArrayInputChange('bug_fixes', index, e.target.value)}
              placeholder="Describe a bug fix..."
            />
            <button type="button" onClick={() => removeArrayItem('bug_fixes', index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem('bug_fixes')}>
          Add Bug Fix
        </button>
      </div>
      <div className="form-group">
        <label>Breaking Changes</label>
        {versionData.breaking_changes.map((change, index) => ()
          <div key={index} className="array-input">
            <input
              type="text"
              value={change}
              onChange={(e) => handleArrayInputChange('breaking_changes', index, e.target.value)}
              placeholder="Describe a breaking change..."
            />
            <button type="button" onClick={() => removeArrayItem('breaking_changes', index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem('breaking_changes')}>
          Add Breaking Change
        </button>
      </div>
      <div className="form-group">
        <label>Deprecated Features</label>
        {versionData.deprecated_features.map((feature, index) => ()
          <div key={index} className="array-input">
            <input
              type="text"
              value={feature}
              onChange={(e) => handleArrayInputChange('deprecated_features', index, e.target.value)}
              placeholder="Describe a deprecated feature..."
            />
            <button type="button" onClick={() => removeArrayItem('deprecated_features', index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem('deprecated_features')}>
          Add Deprecated Feature
        </button>
      </div>
      <div className="form-group">
        <label>Known Issues</label>
        {versionData.known_issues.map((issue, index) => ()
          <div key={index} className="array-input">
            <input
              type="text"
              value={issue}
              onChange={(e) => handleArrayInputChange('known_issues', index, e.target.value)}
              placeholder="Describe a known issue..."
            />
            <button type="button" onClick={() => removeArrayItem('known_issues', index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem('known_issues')}>
          Add Known Issue
        </button>
      </div>
      <div className="form-group">
        <label htmlFor="migration_guide">Migration Guide</label>
        <textarea
          id="migration_guide"
          value={versionData.migration_guide || ''}
          onChange={(e) => handleInputChange('migration_guide', e.target.value)}
          placeholder="Provide guidance for migrating from previous versions..."
          rows={4}
        />
      </div>
    </div>
  );
  const renderStep4 = () => (;);
    <div className="step-content">
      <h3>Review & Publish</h3>
      <div className="version-summary">
        <h4>Version Summary</h4>
        <div className="summary-grid">
          <div className="summary-item">
            <strong>Version:</strong> {versionData.version_number}
          </div>
          <div className="summary-item">
            <strong>Type:</strong> {versionData.compatibility_level}
          </div>
          <div className="summary-item">
            <strong>Status:</strong> {versionData.status}
          </div>
          <div className="summary-item">
            <strong>Visibility:</strong> {versionData.visibility}
          </div>
          <div className="summary-item">
            <strong>Claude Model:</strong> {versionData.claude_model}
          </div>
          <div className="summary-item">
            <strong>Token Estimate:</strong> {versionData.token_per_run_estimate.toLocaleString()}
          </div>
        </div>
        <div className="release-notes-summary">
          <strong>Release Notes:</strong>
          <p>{versionData.release_notes}</p>
        </div>
        <div className="changes-summary">
          {versionData.new_features.length > 0 && ()
            <div className="change-group">
              <strong>✨ New Features ({versionData.new_features.length})</strong>
            </div>
          )}
          {versionData.bug_fixes.length > 0 && ()
            <div className="change-group">
              <strong>🔧 Bug Fixes ({versionData.bug_fixes.length})</strong>
            </div>
          )}
          {versionData.breaking_changes.length > 0 && ()
            <div className="change-group breaking">
              <strong>💥 Breaking Changes ({versionData.breaking_changes.length})</strong>
            </div>
          )}
          {versionData.deprecated_features.length > 0 && ()
            <div className="change-group deprecated">
              <strong>⚠️ Deprecated Features ({versionData.deprecated_features.length})</strong>
            </div>
          )}
          {versionData.known_issues.length > 0 && ()
            <div className="change-group issues">
              <strong>🐛 Known Issues ({versionData.known_issues.length})</strong>
            </div>
          )}
        </div>
      </div>
      {error && ()
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
  if (isLoading && !versionData.version_number) {
    return;
      <div className="version-editor loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  return;
    <div className="version-editor">
      <div className="editor-header">
        <h2>{versionId ? 'Edit Version' : 'Create New Version'}</h2>
        <div className="step-indicator">
          Step {currentStep} of {totalSteps}
        </div>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      <div className="form-container">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>
      <div className="form-actions">
        {currentStep > 1 && ()
          <button type="button" onClick={handlePrevious} className="btn-secondary">
            Previous
          </button>
        )}
        {currentStep < totalSteps ? ()
          <button 
            type="button" 
            onClick={handleNext}
            className="btn-primary"
            disabled={!validateStep(currentStep)}
          >
            Next
          </button>
        ) : ()
          <div className="final-actions">
            <button 
              type="button" 
              onClick={() => handleSave(false)}
              className="btn-outline"
              disabled={isLoading}
            >
              Save as Draft
            </button>
            <button 
              type="button" 
              onClick={() => handleSave(true)}
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Publishing...' : 'Publish Version'}
            </button>
          </div>
        )}
        <button 
          type="button" 
          onClick={() => navigate(`/marketplace/templates/${templateId}/versions`)}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default VersionEditor;