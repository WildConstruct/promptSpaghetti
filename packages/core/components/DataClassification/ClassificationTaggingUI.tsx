/**
 * Classification Tagging UI Component
 * Task T-1752989143998-36: Build classification tagging UI
 * 
 * Provides an intuitive interface for applying data classification tags
 * to data elements with validation, approval workflow, and audit trail
 */
import React, { useState, useEffect } from 'react';
import { 
  DataClassification, 
  DataClassificationLevel, 
  ClassificationContext,
  ClassificationMetadata,
  ValidationResult,
  CLASSIFICATION_LEVELS,
  DEFAULT_HANDLING_REQUIREMENTS
} from '../../types/DataClassification';
}
interface ClassificationTaggingUIProps {
  dataElement: unknown;
  dataId: string;
  existingClassification?: DataClassification;
  context?: ClassificationContext;
  onClassificationChange: (classification: DataClassification) => void;
  onValidationChange?: (validation: ValidationResult) => void;
  readonly?: boolean;
  showHandlingRequirements?: boolean;
  interface ClassificationFormData {
  classification: DataClassificationLevel | '';
  rationale: string;
  dataOwner: string;
  businessJustification: string;
  riskAssessment: string;
  regulatoryRequirements: string;
  dataLineage: string;
  export const ClassificationTaggingUI: React.FC<ClassificationTaggingUIProps> = ({,)
  dataElement,
  dataId,
  existingClassification,
  context,
  onClassificationChange,
  onValidationChange,
  readonly = false,
  showHandlingRequirements = true
}
}) => {
  const [formData, setFormData] = useState<ClassificationFormData>({)
  classification: existingClassification?.classification || '',
  rationale: existingClassification?.rationale || '',
  dataOwner: existingClassification?.dataOwner || context?.dataOwner || '',
  businessJustification: existingClassification?.metadata.businessJustification || '',
  riskAssessment: existingClassification?.metadata.riskAssessment || '',
  regulatoryRequirements: existingClassification?.metadata.regulatoryRequirements || [],
  dataLineage: existingClassification?.metadata.dataLineage || [],
});
  const [validation, setValidation] = useState<ValidationResult>({)
  valid: true,
  errors: [],
  warnings: [],
  recommendations: [],
});
  const [showRequirements, setShowRequirements] = useState(false);
  const [currentUser] = useState('current-user'); // TODO: Get from auth context
  // Validate form data
  useEffect(() => {
  const errors: string = [];
  const warnings: string = [];
  const recommendations: string = [];
  if (!formData.classification) {
  errors.push('Classification level is required');
  if (!formData.rationale.trim()) {
  errors.push('Classification rationale is required');
} else if (formData.rationale.length < 20) {
  warnings.push('Rationale should be more detailed (minimum 20 characters)');
  if (!formData.dataOwner.trim()) {
  errors.push('Data owner must be specified');
  if (!formData.businessJustification.trim() && formData.classification !== 'PUBLIC') {
  warnings.push('Business justification is recommended for non-public data');
  if (!formData.riskAssessment.trim() && ['CONFIDENTIAL', 'RESTRICTED'].includes(formData.classification)) {
  errors.push('Risk assessment is required for confidential and restricted data');
  if (formData.classification === 'RESTRICTED' && formData.regulatoryRequirements.length === 0) {
  warnings.push('Regulatory requirements should be specified for restricted data');
  // Classification-specific recommendations
  if (formData.classification === 'CONFIDENTIAL' || formData.classification === 'RESTRICTED') {
  recommendations.push('Consider implementing additional access controls');
  recommendations.push('Ensure appropriate audit logging is enabled');
  const newValidation: ValidationResult = {,
  valid: errors.length === 0,
  errors,
  warnings,
  recommendations
};
    setValidation(newValidation);
    onValidationChange?.(newValidation);
  }, [formData, onValidationChange]);
  const handleFieldChange = (field: keyof ClassificationFormData, value: Error) => {
  setFormData(prev => ({)
  ...prev,
  [field]: value,
}));
  };
  const handleArrayFieldChange = (field: 'regulatoryRequirements' | 'dataLineage', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    handleFieldChange(field, items);
  };
  const handleSubmit = () => {
    if (!validation.valid || !formData.classification) return;
    const classification: DataClassification = {,
  id: existingClassification?.id || `class-${dataId}-${Date.now()}`}
},
  dataElement: dataId,
      classification: formData.classification as DataClassificationLevel,
      rationale: formData.rationale,
      dataOwner: formData.dataOwner,
      classifiedBy: currentUser,
      classificationDate: new Date(),
      reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      approvals: [], // Will be populated by approval workflow
      metadata: {
  businessJustification: formData.businessJustification,
  riskAssessment: formData.riskAssessment,
  regulatoryRequirements: formData.regulatoryRequirements,
  dataLineage: formData.dataLineage,
  relatedClassifications: [],
};
    onClassificationChange(classification);
  };
  const getClassificationColor = (level: DataClassificationLevel): string => {
  const colors = {
  PUBLIC: 'bg-green-100 text-green-800 border-green-300',
  INTERNAL: 'bg-blue-100 text-blue-800 border-blue-300',
  CONFIDENTIAL: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  RESTRICTED: 'bg-red-100 text-red-800 border-red-300',
};
    return colors[level];
  };
  const getHandlingRequirements = () => {
    if (!formData.classification) return null;
    return DEFAULT_HANDLING_REQUIREMENTS[formData.classification as DataClassificationLevel];
  };
  return;
    <div className="classification-tagging-ui bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Classification</h3>
        <p className="text-sm text-gray-600">
          Classify this data element according to its sensitivity and handling requirements
        </p>
      </div>
      {/* Data Element Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Data Element</h4>
        <p className="text-sm text-gray-700">ID: {dataId}</p>
        {context && ()
          <div className="mt-2 text-sm text-gray-600">
            <p>Type: {context.dataType}</p>
            <p>Business Context: {context.businessContext}</p>
            <p>Risk Level: <span className={`px-2 py-1 rounded text-xs font-medium ${
  context.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' :,
  context.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :,
  context.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :,
  'bg-green-100 text-green-800'
}`}>{context.riskLevel}</span></p>
          </div>
        )}
      </div>
      {/* Classification Level Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Classification Level *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {CLASSIFICATION_LEVELS.map(level => ()
            <button
              key={level}
              type="button"
              disabled={readonly}
              onClick={() => handleFieldChange('classification', level)}
              className={`p-3 text-left border-2 rounded-lg transition-colors ${
                formData.classification === level
                  ? `${getClassificationColor(level)} border-opacity-100`}
                  : 'bg-white border-gray-200 hover:border-gray-300';
  } ${readonly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
              <div className="font-medium">{level}</div>
              <div className="text-xs text-gray-600 mt-1">
                {level === 'PUBLIC' && 'No restrictions'}
                {level === 'INTERNAL' && 'Internal use only'}
                {level === 'CONFIDENTIAL' && 'Limited access required'}
                {level === 'RESTRICTED' && 'Highest protection level'}
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Rationale */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Classification Rationale *
        </label>
        <textarea
          value={formData.rationale}
          onChange={(e) => handleFieldChange('rationale', e.target.value)}
          placeholder="Explain why this classification level is appropriate..."
          disabled={readonly}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          rows={3}
        />
      </div>
      {/* Data Owner */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data Owner *
        </label>
        <input
          type="text"
          value={formData.dataOwner}
          onChange={(e) => handleFieldChange('dataOwner', e.target.value)}
          placeholder="Enter data owner name or role"
          disabled={readonly}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />
      </div>
      {/* Business Justification */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Justification
        </label>
        <textarea
          value={formData.businessJustification}
          onChange={(e) => handleFieldChange('businessJustification', e.target.value)}
          placeholder="Describe the business need for this data and classification"
          disabled={readonly}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          rows={2}
        />
      </div>
      {/* Risk Assessment (required for sensitive data) */}
      {(['CONFIDENTIAL', 'RESTRICTED'].includes(formData.classification)) && ()
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Risk Assessment *
          </label>
          <textarea
            value={formData.riskAssessment}
            onChange={(e) => handleFieldChange('riskAssessment', e.target.value)}
            placeholder="Assess potential risks of data exposure or misuse"
            disabled={readonly}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            rows={2}
          />
        </div>
      )}
      {/* Regulatory Requirements */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Regulatory Requirements
        </label>
        <input
          type="text"
          value={formData.regulatoryRequirements.join(', ')}
          onChange={(e) => handleArrayFieldChange('regulatoryRequirements', e.target.value)}
          placeholder="e.g., GDPR, HIPAA, SOX (comma-separated)"
          disabled={readonly}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />
      </div>
      {/* Data Lineage */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data Lineage
        </label>
        <input
          type="text"
          value={formData.dataLineage.join(', ')}
          onChange={(e) => handleArrayFieldChange('dataLineage', e.target.value)}
          placeholder="e.g., source-system, transformation-process (comma-separated)"
          disabled={readonly}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />
      </div>
      {/* Validation Messages */}
      {(validation.errors.length > 0 || validation.warnings.length > 0 || validation.recommendations.length > 0) && ()
        <div className="mb-6 space-y-2">
          {validation.errors.map((error, index) => ()
            <div key={index} className="flex items-center text-red-600 text-sm">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          ))}
          {validation.warnings.map((warning, index) => ()
            <div key={index} className="flex items-center text-yellow-600 text-sm">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {warning}
            </div>
          ))}
          {validation.recommendations.map((recommendation, index) => ()
            <div key={index} className="flex items-center text-blue-600 text-sm">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {recommendation}
            </div>
          ))}
        </div>
      )}
      {/* Handling Requirements */}
      {showHandlingRequirements && formData.classification && ()
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowRequirements(!showRequirements)}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <svg className={`w-4 h-4 mr-2 transform transition-transform ${showRequirements ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">}
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            View Handling Requirements for {formData.classification}
          </button>
          {showRequirements && ()
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              {(() => {
                const requirements = getHandlingRequirements();
                if (!requirements) return null;
                return;
                  <div className="space-y-3 text-sm">
                    <div>
                      <h5 className="font-medium text-gray-900">Storage</h5>
                      <ul className="text-gray-600 list-disc list-inside">
                        <li>Encryption: {requirements.storage.encryptionRequired ? 'Required' : 'Not required'}</li>
                        <li>Key Rotation: {requirements.storage.keyRotationDays} days</li>
                        <li>Retention: {requirements.storage.retentionDays} days</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">Access</h5>
                      <ul className="text-gray-600 list-disc list-inside">
                        <li>Authentication: {requirements.access.authenticationLevel}</li>
                        <li>Authorization: {requirements.access.authorizationRequired ? 'Required' : 'Not required'}</li>
                        <li>Audit Logging: {requirements.access.auditLogging}</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">Monitoring</h5>
                      <ul className="text-gray-600 list-disc list-inside">
                        <li>Alerting: {requirements.monitoring.alertingEnabled ? 'Enabled' : 'Disabled'}</li>
                        <li>Anomaly Detection: {requirements.monitoring.anomalyDetection ? 'Enabled' : 'Disabled'}</li>
                        <li>Real-time Monitoring: {requirements.monitoring.realtimeMonitoring ? 'Required' : 'Not required'}</li>
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
      {/* Action Buttons */}
      {!readonly && ()
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!validation.valid || !formData.classification}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Apply Classification
          </button>
        </div>
      )}
      {/* Existing Classification Display */}
      {readonly && existingClassification && ()
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-2">Classification Details</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Classified by: {existingClassification.classifiedBy}</p>
            <p>Date: {existingClassification.classificationDate.toLocaleDateString()}</p>
            <p>Review Date: {existingClassification.reviewDate.toLocaleDateString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassificationTaggingUI;