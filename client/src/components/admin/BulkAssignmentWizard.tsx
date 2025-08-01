/**
 * Bulk Assignment Wizard
 * 
 * Multi-step wizard for creating bulk policy assignments with validation,
 * conflict analysis, and execution options
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  PolicyAssignment, 
  BulkPolicyAssignment,
  AssignmentTargetType,
  ConflictResolutionStrategy,
  InheritanceType,
  RiskLevel,
  PolicyConflict,
  BulkAssignmentStrategy
 from '../../types/PolicyAssignmentTypes';
import './BulkAssignmentWizard.css';


interface BulkAssignmentWizardProps {
  onSubmit: (data: Partial<BulkPolicyAssignment>) => Promise<void>;,
  onCancel: () => void;
  interface WizardStep {
  id: string;,
  title: string,
  description: string;,
  isValid: boolean;
  interface BulkFormData {
  title: string;,
  description: string,
  assignments: Partial<PolicyAssignment>[];,
  strategy: BulkAssignmentStrategy;



const INITIAL_STRATEGY: BulkAssignmentStrategy = {,
  conflictResolution: ConflictResolutionStrategy.MOST_RESTRICTIVE,
  inheritanceHandling: 'PRESERVE_EXISTING',
  approvalRequired: false,
  dryRun: false,
  executionMode: 'IMMEDIATE',
  rollbackOnError: true;

};
const INITIAL_FORM_DATA: BulkFormData = {,
  title: '',
  description: '',
  assignments: [],
  strategy: INITIAL_STRATEGY;
  };

export const BulkAssignmentWizard: React.FC<BulkAssignmentWizardProps> = ({
  onSubmit,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<BulkFormData>(INITIAL_FORM_DATA);
  const [conflicts, setConflicts] = useState<PolicyConflict[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csvData, setCsvData] = useState<string>('');
  const steps: WizardStep = [
  {
  id: 'basic',
  title: 'Basic Information',
  description: 'Define the bulk assignment details',
  isValid: formData.title.trim().length > 0

    {
  id: 'assignments',
  title: 'Policy Assignments',
  description: 'Add individual policy assignments',
  isValid: formData.assignments.length > 0

    {
  id: 'strategy',
  title: 'Execution Strategy',
  description: 'Configure how assignments are processed',
  isValid: true

    {
  id: 'conflicts',
  title: 'Conflict Analysis',
  description: 'Review and resolve potential conflicts',
  isValid: true

    {
  id: 'review',
  title: 'Review & Submit',
  description: 'Final review before execution',
  isValid: true];
  useEffect(() => {
  if (currentStep === 3 && formData.assignments.length > 0) {
  analyzeConflicts();
}, [currentStep, analyzeConflicts, formData.assignments.length]);
  const analyzeConflicts = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/policy-assignments/assignments/analyze-conflicts', {
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments: formData.assignments })
      });
      const data = await response.json();
      if (data.success) {
        setConflicts(data.data.conflicts || []);
 catch (error) {
  console.error('Error analyzing conflicts:', error);
 finally {
      setIsAnalyzing(false);
  }, [formData.assignments]);
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
  };
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
  };
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
 finally {
      setIsSubmitting(false);
  };
  const addAssignment = () => {
  const newAssignment: Partial<PolicyAssignment> = {,
  policyId: '',
  policyType: '',
  policyVersion: '1.0',
  targetType: AssignmentTargetType.USER,
  targetId: '',
  targetDisplayName: '',
  effectiveDate: new Date(),
  priority: 100,
  conditions: [],
  inheritance: {
  type: InheritanceType.NONE,
  inheritanceDepth: 0,
  blockInheritance: false
},
  metadata: {
  reason: '',
  businessJustification: '',
  riskLevel: RiskLevel.MEDIUM,
  reviewRequired: false,
  tags: [],
  complianceFrameworks: []
};
    setFormData(prev => ({
  ...prev,
  assignments: [...prev.assignments, newAssignment]
}));
  };
  const updateAssignment = (index: number, field: string, value: Error) => {
    setFormData(prev => ({
  ...prev,
      assignments: prev.assignments.map((assignment, i) =>
        i === index ? { ...assignment, [field]: value } : assignment
    }));
  };
  const removeAssignment = (index: number) => {
  setFormData(prev => ({
  ...prev,
  assignments: prev.assignments.filter((_, i) => i !== index)
}));
  };
  const parseCsvData = () => {
  if (!csvData.trim()) return;
  try {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const assignments: Partial<PolicyAssignment>[] = [];
  for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(',').map(v => v.trim());
  if (values.length !== headers.length) continue;
  const assignment: Partial<PolicyAssignment> = {,
  policyId: values[headers.indexOf('policyId')] || '',
  policyType: values[headers.indexOf('policyType')] || '',
  targetType: (values[headers.indexOf('targetType')] as AssignmentTargetType) || AssignmentTargetType.USER,
  targetId: values[headers.indexOf('targetId')] || '',
  targetDisplayName: values[headers.indexOf('targetDisplayName')] || '',
  priority: parseInt(values[headers.indexOf('priority')]) || 100,
  effectiveDate: new Date(),
  conditions: [],
  inheritance: {
  type: InheritanceType.NONE,
  inheritanceDepth: 0,
  blockInheritance: false
},
  metadata: {
  reason: values[headers.indexOf('reason')] || '',
  businessJustification: values[headers.indexOf('businessJustification')] || '',
  riskLevel: (values[headers.indexOf('riskLevel')] as RiskLevel) || RiskLevel.MEDIUM,
  reviewRequired: values[headers.indexOf('reviewRequired')] === 'true',
  tags: [],
  complianceFrameworks: []
};
        assignments.push(assignment);
      setFormData(prev => ({
  ...prev,
        assignments
      }));
      setCsvData('');
 catch (error) {
  console.error('Error parsing CSV:', error);
};
  const renderBasicStep = () => (;);
    <div className="wizard-step">
      <div className="form-group">
        <label htmlFor="bulkTitle">Title *</label>
        <input
          id="bulkTitle"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="Enter bulk assignment title"
        />
      </div>
      <div className="form-group">
        <label htmlFor="bulkDescription">Description</label>
        <textarea
          id="bulkDescription"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Describe the purpose of this bulk assignment"
          rows={4}
        />
      </div>
    </div>
  );
  const renderAssignmentsStep = () => (;);
    <div className="wizard-step">
      <div className="assignments-header">
        <h3>Policy Assignments ({formData.assignments.length})</h3>
        <div className="assignment-actions">
          <button type="button" onClick={addAssignment} className="btn btn-secondary">
            Add Assignment
          </button>
        </div>
      </div>
      <div className="csv-import">
        <h4>Bulk Import from CSV</h4>
        <textarea
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          placeholder="Paste CSV data here ()
            policyId,
            policyType,
            targetType,
            targetId,
            targetDisplayName,
            priority,
            reason,
            businessJustification,
            riskLevel,
            reviewRequired
          )"
          rows={4}
        />
        <button type="button" onClick={parseCsvData} className="btn btn-outline">
          Import CSV
        </button>
      </div>
      <div className="assignments-list">
        {formData.assignments.map((assignment, index) => (
          <div key={index} className="assignment-card">
            <div className="assignment-header">
              <span>Assignment {index + 1}</span>
              <button
                type="button"
                onClick={() => removeAssignment(index)}
                className="btn btn-sm btn-danger"
              >
                Remove
              </button>
            </div>
            <div className="assignment-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Policy ID</label>
                  <input
                    type="text"
                    value={assignment.policyId || ''}
                    onChange={(e) => updateAssignment(index, 'policyId', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Policy Type</label>
                  <input
                    type="text"
                    value={assignment.policyType || ''}
                    onChange={(e) => updateAssignment(index, 'policyType', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Target Type</label>
                  <select
                    value={assignment.targetType || AssignmentTargetType.USER}
                    onChange={(e) => updateAssignment(index, 'targetType', e.target.value)}
                  >
                    <option value={AssignmentTargetType.USER}>User</option>
                    <option value={AssignmentTargetType.ROLE}>Role</option>
                    <option value={AssignmentTargetType.TEAM}>Team</option>
                    <option value={AssignmentTargetType.ORG_UNIT}>Org Unit</option>
                    <option value={AssignmentTargetType.DEPARTMENT}>Department</option>
                    <option value={AssignmentTargetType.LOCATION}>Location</option>
                    <option value={AssignmentTargetType.DATA_TYPE}>Data Type</option>
                    <option value={AssignmentTargetType.SYSTEM}>System</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Target ID</label>
                  <input
                    type="text"
                    value={assignment.targetId || ''}
                    onChange={(e) => updateAssignment(index, 'targetId', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Business Justification</label>
                <input
                  type="text"
                  value={assignment.metadata?.businessJustification || ''}
                  onChange={(e) => updateAssignment(index, 'metadata', {
  ...assignment.metadata,
  businessJustification: e.target.value
})}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  const renderStrategyStep = () => (;);
    <div className="wizard-step">
      <div className="strategy-section">
        <h3>Execution Strategy</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Conflict Resolution</label>
            <select
              value={formData.strategy.conflictResolution}
              onChange={(e) => setFormData({
  ...formData,
  strategy: {
  ...formData.strategy,
  conflictResolution: e.target.value as ConflictResolutionStrategy
})}
            >
              <option value={ConflictResolutionStrategy.MOST_RESTRICTIVE}>Most Restrictive</option>
              <option value={ConflictResolutionStrategy.LEAST_RESTRICTIVE}>Least Restrictive</option>
              <option value={ConflictResolutionStrategy.HIGHEST_PRIORITY}>Highest Priority</option>
              <option value={ConflictResolutionStrategy.EXPLICIT_OVERRIDE}>Explicit Override</option>
              <option value={ConflictResolutionStrategy.MANUAL_REVIEW}>Manual Review</option>
            </select>
          </div>
          <div className="form-group">
            <label>Execution Mode</label>
            <select
              value={formData.strategy.executionMode}
              onChange={(e) => setFormData({
  ...formData,
  strategy: {
  ...formData.strategy,
  executionMode: e.target.value
})}
            >
              <option value="IMMEDIATE">Immediate</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="STAGED">Staged</option>
              <option value="MANUAL_TRIGGER">Manual Trigger</option>
            </select>
          </div>
        </div>
        <div className="strategy-options">
          <label>
            <input
              type="checkbox"
              checked={formData.strategy.approvalRequired}
              onChange={(e) => setFormData({
  ...formData,
  strategy: {
  ...formData.strategy,
  approvalRequired: e.target.checked
})}
            />
            Require Approval
          </label>
          <label>
            <input
              type="checkbox"
              checked={formData.strategy.dryRun}
              onChange={(e) => setFormData({
  ...formData,
  strategy: {
  ...formData.strategy,
  dryRun: e.target.checked
})}
            />
            Dry Run (Test Mode)
          </label>
          <label>
            <input
              type="checkbox"
              checked={formData.strategy.rollbackOnError}
              onChange={(e) => setFormData({
  ...formData,
  strategy: {
  ...formData.strategy,
  rollbackOnError: e.target.checked
})}
            />
            Rollback on Error
          </label>
        </div>
      </div>
    </div>
  );
  const renderConflictsStep = () => (;);
    <div className="wizard-step">
      <div className="conflicts-section">
        <h3>Conflict Analysis</h3>
        {isAnalyzing ? ()
          <div className="analyzing">
            <div className="spinner" />
            <p>Analyzing conflicts...</p>
          </div>
        ) : ()
          <>
            {conflicts.length === 0 ? ()
              <div className="no-conflicts">
                <p>✅ No conflicts detected. All assignments can be processed safely.</p>
              </div>
            ) : ()
              <div className="conflicts-list">
                <p>⚠️ {conflicts.length} potential conflicts detected:</p>
                {conflicts.map((conflict, index) => (
                  <div key={index} className={`conflict-card severity-${conflict.severity.toLowerCase()}`}>}
                    <div className="conflict-header">
                      <span className="conflict-type">{conflict.type}</span>
                      <span className="conflict-severity">{conflict.severity}</span>
                    </div>
                    <p className="conflict-description">{conflict.description}</p>
                    <div className="conflict-assignments">
                      <strong>Affected assignments:</strong>
                      {conflict.conflictingAssignments.map(id => (
                        <span key={id} className="assignment-ref">{id}</span>
                      ))}
                    </div>
                    {conflict.resolutionSuggestion && ()
                      <div className="resolution-suggestion">
                        <strong>Suggested resolution:</strong> {conflict.resolutionSuggestion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        <button type="button" onClick={analyzeConflicts} className="btn btn-outline">
          Re-analyze Conflicts
        </button>
      </div>
    </div>
  );
  const renderReviewStep = () => (;);
    <div className="wizard-step">
      <div className="review-section">
        <h3>Review & Submit</h3>
        <div className="review-summary">
          <div className="summary-item">
            <strong>Title:</strong> {formData.title}
          </div>
          <div className="summary-item">
            <strong>Description:</strong> {formData.description || 'None'}
          </div>
          <div className="summary-item">
            <strong>Assignments:</strong> {formData.assignments.length}
          </div>
          <div className="summary-item">
            <strong>Conflicts:</strong> {conflicts.length}
          </div>
          <div className="summary-item">
            <strong>Execution Mode:</strong> {formData.strategy.executionMode}
          </div>
          <div className="summary-item">
            <strong>Dry Run:</strong> {formData.strategy.dryRun ? 'Yes' : 'No'}
          </div>
        </div>
        {conflicts.length > 0 && ()
          <div className="review-warning">
            ⚠️ This bulk assignment has {conflicts.length} conflicts that will be resolved using the &quot;{formData.strategy.conflictResolution}&quot; strategy.
          </div>
        )}
      </div>
    </div>
  );
  return;
    <div className="modal-overlay">
      <div className="bulk-assignment-wizard">
        <div className="wizard-header">
          <h2>Bulk Policy Assignment</h2>
          <button type="button" onClick={onCancel} className="close-button">
            ×
          </button>
        </div>
        <div className="wizard-progress">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`progress-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-info">
                <div className="step-title">{step.title}</div>
                <div className="step-description">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="wizard-content">
          {currentStep === 0 && renderBasicStep()}
          {currentStep === 1 && renderAssignmentsStep()}
          {currentStep === 2 && renderStrategyStep()}
          {currentStep === 3 && renderConflictsStep()}
          {currentStep === 4 && renderReviewStep()}
        </div>
        <div className="wizard-footer">
          <button 
            type="button" 
            onClick={onCancel} 
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <div className="wizard-navigation">
            <button 
              type="button" 
              onClick={handlePrevious} 
              disabled={currentStep === 0}
              className="btn btn-outline"
            >
              Previous
            </button>
            {currentStep < steps.length - 1 ? ()
              <button 
                type="button" 
                onClick={handleNext}
                disabled={!steps[currentStep].isValid}
                className="btn btn-primary"
              >
                Next
              </button>
            ) : ()
              <button 
                type="button" 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? 'Creating...' : 'Create Bulk Assignment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};