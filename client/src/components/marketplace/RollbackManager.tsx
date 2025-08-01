// Epic 16.2.2 Rollback Manager Component
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RollbackManager.css';


interface TemplateVersion {
  id: string;,
  version_number: string;,
  status: 'draft' | 'published' | 'deprecated' | 'archived';,
  visibility: 'public' | 'private' | 'beta';,
  compatibility_level: 'breaking' | 'major' | 'minor' | 'patch';,
  release_notes: string;,
  created_at: string;
  published_at?: string;
  download_count: number;,
  new_features: string;,
  bug_fixes: string;,
  breaking_changes: string;,
  known_issues: string;
  interface RollbackData {
  to_version_id: string;,
  rollback_reason: string;,
  rollback_type: 'emergency' | 'planned' | 'issue_resolution';,
  impact_assessment: string;,
  rollback_plan: string;,
  verification_steps: string;
  interface RollbackResult {
  id: string;,
  template_id: string;,
  from_version_id: string;,
  to_version_id: string;,
  rollback_type: string;,
  rollback_reason: string;,
  initiated_by: string;,
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';,
  created_at: string;
  completed_at?: string;
  error_message?: string;
  const ROLLBACK_TYPES = [
  {
  value: 'emergency',
  label: 'Emergency Rollback',
  description: 'Critical issues requiring immediate rollback',
  icon: '🚨',
  color: '#ef4444',



  {
  value: 'planned',
  label: 'Planned Rollback',
  description: 'Scheduled rollback for testing or maintenance',
  icon: '📅',
  color: '#3b82f6',

  {
  value: 'issue_resolution',
  label: 'Issue Resolution',
  description: 'Rollback to resolve specific bugs or problems',
  icon: '🔧',
  color: '#f59e0b'];
  const DEFAULT_ROLLBACK_DATA: RollbackData = {,
  to_version_id: '',
  rollback_reason: '',
  rollback_type: 'planned',
  impact_assessment: '',
  rollback_plan: '',
  verification_steps: [''],
};

export const RollbackManager = () => { return null; },
  headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
      });
      if (!response.ok) {
  throw new Error('Failed to fetch versions');
  const data = await response.json();
  const publishedVersions = data.filter((v: TemplateVersion) => v.status === 'published');
  setVersions(publishedVersions);
  // Find current version (most recent published)
  if (publishedVersions.length > 0) {
  setCurrentVersion(publishedVersions[0]);
 catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to fetch versions');
 finally {
      setIsLoading(false);
  }, [templateId]);
  useEffect(() => {
    if (templateId) {
      fetchVersions();
  }, [templateId, fetchVersions]);
  const handleInputChange = (field: keyof RollbackData, value: string) => {
  setRollbackData(prev => ({)
  ...prev,
  [field]: value,
}));
  };
  const handleVerificationStepChange = (index: number, value: string) => {
  const steps = [...rollbackData.verification_steps];
  steps[index] = value;
  setRollbackData(prev => ({)
  ...prev,
  verification_steps: steps,
}));
  };
  const addVerificationStep = () => {
  setRollbackData(prev => ({)
  ...prev,
  verification_steps: [...prev.verification_steps, ''],
}));
  };
  const removeVerificationStep = (index: number) => {
  const steps = [...rollbackData.verification_steps];
  steps.splice(index, 1);
  setRollbackData(prev => ({)
  ...prev,
  verification_steps: steps,
}));
  };
  const handleVersionSelect = (version: TemplateVersion) => {
  setSelectedVersion(version);
  setRollbackData(prev => ({)
  ...prev,
  to_version_id: version.id,
}));
  };
  const validateStep = (step: number): boolean => {
  switch (step) {
  case 1: // Version Selection,
  return !!rollbackData.to_version_id;
  case 2: // Rollback Details,
  return !!(rollbackData.rollback_reason && rollbackData.rollback_type);
  case 3: // Impact Assessment,
  return !!(rollbackData.impact_assessment && rollbackData.rollback_plan);
  case 4: // Verification Steps,
  return rollbackData.verification_steps.some(step => step.trim().length > 0);
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
  const executeRollback = async () => {
  try {
  setIsLoading(true);
  setError(null);
  const rollbackRequest = {
  ...rollbackData,
  verification_steps: rollbackData.verification_steps.filter(step => step.trim().length > 0),
};
      const response = await fetch(`/api/marketplace/templates/${templateId}/rollback`, {)}
  },
  method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
  },
  body: JSON.stringify(rollbackRequest);
  });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to execute rollback');
      const result = await response.json();
      setRollbackResult(result);
      setShowConfirmation(false);
      // Refresh versions to show updated state
      await fetchVersions();
 catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to execute rollback');
 finally {
      setIsLoading(false);
  };
  const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {)
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
  };
  const getRollbackType = (type: string) => {
    return ROLLBACK_TYPES.find(t => t.value === type) || ROLLBACK_TYPES[0];
  };
  const getVersionDiff = () => {
    if (!currentVersion || !selectedVersion) return null;
    const currentParts = currentVersion.version_number.split('.').map(Number);
    const selectedParts = selectedVersion.version_number.split('.').map(Number);
    const [currentMajor, currentMinor, currentPatch] = currentParts;
    const [selectedMajor, selectedMinor, selectedPatch] = selectedParts;
    if (currentMajor > selectedMajor) return 'major-downgrade';
    if (currentMinor > selectedMinor) return 'minor-downgrade';
    if (currentPatch > selectedPatch) return 'patch-downgrade';
    return 'same-version';
  };
  const renderStep1 = () => (;);
    <div className="step-content">
      <h3>Select Target Version</h3>
      <p className="step-description">
        Choose the version you want to rollback to. Only published versions are available for rollback.
      </p>
      {currentVersion && ()
        <div className="current-version-info">
          <h4>Current Version</h4>
          <div className="version-card current">
            <div className="version-header">
              <span className="version-number">v{currentVersion.version_number}</span>
              <span className="version-status">Current</span>
            </div>
            <div className="version-meta">
              <span>Published: {formatDate(currentVersion.published_at || currentVersion.created_at)}</span>
              <span>{currentVersion.download_count} downloads</span>
            </div>
            <p className="release-notes">{currentVersion.release_notes}</p>
          </div>
        </div>
      )}
      <div className="version-selection">
        <h4>Available Versions</h4>
        <div className="version-list">
          {versions.filter(v => v.id !== currentVersion?.id).map(version => ()
            <div 
              key={version.id}
              className={`version-card selectable ${selectedVersion?.id === version.id ? 'selected' : ''}`}
              onClick={() => handleVersionSelect(version)}
            >
              <div className="version-header">
                <span className="version-number">v{version.version_number}</span>
                <span className="compatibility-badge" style={{
  backgroundColor: version.compatibility_level === 'breaking' ? '#ef4444' : ,
  version.compatibility_level === 'major' ? '#f59e0b' :,
  version.compatibility_level === 'minor' ? '#10b981' : '#3b82f6',
}>
                  {version.compatibility_level}
                </span>
              </div>
              <div className="version-meta">
                <span>Published: {formatDate(version.published_at || version.created_at)}</span>
                <span>{version.download_count} downloads</span>
              </div>
              <p className="release-notes">{version.release_notes}</p>
              {version.breaking_changes.length > 0 && ()
                <div className="warning-notice">
                  ⚠️ This version has {version.breaking_changes.length} breaking change(s)
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {selectedVersion && getVersionDiff() && ()
        <div className="rollback-impact">
          <h4>Rollback Impact</h4>
          <div className={`impact-warning ${getVersionDiff()}`}>}
            {getVersionDiff() === 'major-downgrade' && ()
              <>🔴 Major version downgrade - Significant functionality changes expected</>
            )}
            {getVersionDiff() === 'minor-downgrade' && ()
              <>🟡 Minor version downgrade - Some features may be unavailable</>
            )}
            {getVersionDiff() === 'patch-downgrade' && ()
              <>🟢 Patch version downgrade - Minimal impact expected</>
            )}
          </div>
        </div>
      )}
    </div>
  );
  const renderStep2 = () => (;);
    <div className="step-content">
      <h3>Rollback Details</h3>
      <p className="step-description">
        Provide the reason and type of rollback to help track and manage the process.
      </p>
      <div className="form-group">
        <label htmlFor="rollback_type">Rollback Type *</label>
        <div className="rollback-type-options">
          {ROLLBACK_TYPES.map(type => ()
            <label key={type.value} className="rollback-type-option">
              <input
                type="radio"
                name="rollback_type"
                value={type.value}
                checked={rollbackData.rollback_type === type.value}
                onChange={(e) => handleInputChange('rollback_type', e.target.value)}
              />
              <div className="option-content">
                <div className="option-indicator" style={{ backgroundColor: type.color }}>
                  {type.icon}
                </div>
                <div className="option-text">
                  <strong>{type.label}</strong>
                  <small>{type.description}</small>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="rollback_reason">Rollback Reason *</label>
        <textarea
          id="rollback_reason"
          value={rollbackData.rollback_reason}
          onChange={(e) => handleInputChange('rollback_reason', e.target.value)}
          placeholder="Explain why this rollback is necessary..."
          rows={4}
          maxLength={1000}
        />
        <small>{rollbackData.rollback_reason.length}/1000 characters</small>
      </div>
      {selectedVersion && ()
        <div className="rollback-summary">
          <h4>Rollback Summary</h4>
          <div className="summary-item">
            <strong>From:</strong> v{currentVersion?.version_number} → <strong>To:</strong> v{selectedVersion.version_number}
          </div>
          <div className="summary-item">
            <strong>Type:</strong> {getRollbackType(rollbackData.rollback_type).label}
          </div>
          <div className="summary-item">
            <strong>Impact:</strong> {getVersionDiff()?.replace('-', ' ')}
          </div>
        </div>
      )}
    </div>
  );
  const renderStep3 = () => (;);
    <div className="step-content">
      <h3>Impact Assessment & Plan</h3>
      <p className="step-description">
        Assess the impact of this rollback and provide a detailed plan for execution.
      </p>
      <div className="form-group">
        <label htmlFor="impact_assessment">Impact Assessment *</label>
        <textarea
          id="impact_assessment"
          value={rollbackData.impact_assessment}
          onChange={(e) => handleInputChange('impact_assessment', e.target.value)}
          placeholder="Describe the expected impact on users, systems, and workflows..."
          rows={6}
          maxLength={2000}
        />
        <small>{rollbackData.impact_assessment.length}/2000 characters</small>
      </div>
      <div className="form-group">
        <label htmlFor="rollback_plan">Rollback Plan *</label>
        <textarea
          id="rollback_plan"
          value={rollbackData.rollback_plan}
          onChange={(e) => handleInputChange('rollback_plan', e.target.value)}
          placeholder="Outline the step-by-step process for executing this rollback..."
          rows={6}
          maxLength={2000}
        />
        <small>{rollbackData.rollback_plan.length}/2000 characters</small>
      </div>
      {selectedVersion && ()
        <div className="version-details">
          <h4>Target Version Details</h4>
          <div className="details-grid">
            <div className="detail-item">
              <strong>Version:</strong> v{selectedVersion.version_number}
            </div>
            <div className="detail-item">
              <strong>Published:</strong> {formatDate(selectedVersion.published_at || selectedVersion.created_at)}
            </div>
            <div className="detail-item">
              <strong>Downloads:</strong> {selectedVersion.download_count}
            </div>
            <div className="detail-item">
              <strong>Type:</strong> {selectedVersion.compatibility_level}
            </div>
          </div>
          {selectedVersion.known_issues.length > 0 && ()
            <div className="known-issues-warning">
              <h5>⚠️ Known Issues in Target Version</h5>
              <ul>
                {selectedVersion.known_issues.map((issue, index) => ()
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
  const renderStep4 = () => (;);
    <div className="step-content">
      <h3>Verification Steps</h3>
      <p className="step-description">
        Define the steps that will be used to verify the rollback was successful.
      </p>
      <div className="form-group">
        <label>Verification Steps *</label>
        {rollbackData.verification_steps.map((step, index) => ()
          <div key={index} className="array-input">
            <input
              type="text"
              value={step}
              onChange={(e) => handleVerificationStepChange(index, e.target.value)}
              placeholder={`Verification step ${index + 1}...`}
            />
            {rollbackData.verification_steps.length > 1 && ()
              <button type="button" onClick={() => removeVerificationStep(index)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addVerificationStep}>
          Add Verification Step
        </button>
      </div>
      <div className="rollback-final-summary">
        <h4>Final Rollback Summary</h4>
        <div className="summary-grid">
          <div className="summary-item">
            <strong>Target Version:</strong> v{selectedVersion?.version_number}
          </div>
          <div className="summary-item">
            <strong>Rollback Type:</strong> {getRollbackType(rollbackData.rollback_type).label}
          </div>
          <div className="summary-item">
            <strong>Verification Steps:</strong> {rollbackData.verification_steps.filter(s => s.trim()).length}
          </div>
        </div>
        <div className="risk-assessment">
          <h5>Risk Assessment</h5>
          <div className={`risk-level ${rollbackData.rollback_type}`}>}
            {getRollbackType(rollbackData.rollback_type).icon} {getRollbackType(rollbackData.rollback_type).label}
          </div>
        </div>
      </div>
      {error && ()
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
  if (isLoading && !versions.length) {
    return;
      <div className="rollback-manager loading">
        <div className="loading-spinner">Loading rollback manager...</div>
      </div>
    );
  if (rollbackResult) {
    return;
      <div className="rollback-manager">
        <div className="rollback-result">
          <div className="result-header">
            <h2>Rollback {rollbackResult.status === 'completed' ? 'Completed' : 'Initiated'}</h2>
          </div>
          <div className="result-content">
            <div className="result-summary">
              <div className="summary-item">
                <strong>Rollback ID:</strong> {rollbackResult.id}
              </div>
              <div className="summary-item">
                <strong>Status:</strong> 
                <span className={`status-badge ${rollbackResult.status}`}>}
                  {rollbackResult.status}
                </span>
              </div>
              <div className="summary-item">
                <strong>Target Version:</strong> v{selectedVersion?.version_number}
              </div>
              <div className="summary-item">
                <strong>Type:</strong> {getRollbackType(rollbackData.rollback_type).label}
              </div>
              {rollbackResult.completed_at && ()
                <div className="summary-item">
                  <strong>Completed:</strong> {formatDate(rollbackResult.completed_at)}
                </div>
              )}
            </div>
            {rollbackResult.error_message && ()
              <div className="error-message">
                <strong>Error:</strong> {rollbackResult.error_message}
              </div>
            )}
            <div className="result-actions">
              <button 
                className="btn-primary"
                onClick={() => navigate(`/marketplace/templates/${templateId}/versions`)}
              >
                Return to Version History
              </button>
              <button 
                className="btn-secondary"
                onClick={() => {
                  setRollbackResult(null);
                  setRollbackData(DEFAULT_ROLLBACK_DATA);
                  setSelectedVersion(null);
                  setCurrentStep(1);
}
              >
                Start New Rollback
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  return;
    <div className="rollback-manager">
      <div className="rollback-header">
        <h2>Version Rollback</h2>
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
          <button 
            type="button" 
            onClick={() => setShowConfirmation(true)}
            className="btn-primary"
            disabled={!validateStep(currentStep) || isLoading}
          >
            Execute Rollback
          </button>
        )}
        <button 
          type="button" 
          onClick={() => navigate(`/marketplace/templates/${templateId}/versions`)}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
      {showConfirmation && ()
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <div className="confirmation-header">
              <h3>Confirm Rollback</h3>
            </div>
            <div className="confirmation-warning">
              ⚠️ This action will rollback the template to version v{selectedVersion?.version_number}. 
              This action cannot be undone automatically.
            </div>
            <div className="confirmation-details">
              <p><strong>Rollback Type:</strong> {getRollbackType(rollbackData.rollback_type).label}</p>
              <p><strong>Reason:</strong> {rollbackData.rollback_reason}</p>
              <p><strong>Verification Steps:</strong> {rollbackData.verification_steps.filter(s => s.trim()).length} defined</p>
            </div>
            <div className="confirmation-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowConfirmation(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className="btn-primary danger"
                onClick={executeRollback}
                disabled={isLoading}
              >
                {isLoading ? 'Executing...' : 'Confirm Rollback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RollbackManager;