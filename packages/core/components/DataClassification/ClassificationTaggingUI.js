import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Classification Tagging UI Component
 * Task T-1752989143998-36: Build classification tagging UI
 *
 * Provides an intuitive interface for applying data classification tags
 * to data elements with validation, approval workflow, and audit trail
 */
import { useState, useEffect } from 'react';
import { CLASSIFICATION_LEVELS, DEFAULT_HANDLING_REQUIREMENTS } from '../../types/DataClassification';
export const ClassificationTaggingUI = ({ _____dataElement, dataId, existingClassification, context, onClassificationChange, onValidationChange, readonly = false, showHandlingRequirements = true }) => {
    const [formData, setFormData] = useState({
        classification: existingClassification?.classification || '',
        rationale: existingClassification?.rationale || '',
        dataOwner: existingClassification?.dataOwner || context?.dataOwner || '',
        businessJustification: existingClassification?.metadata.businessJustification || '',
        riskAssessment: existingClassification?.metadata.riskAssessment || '',
        regulatoryRequirements: existingClassification?.metadata.regulatoryRequirements || [],
        dataLineage: existingClassification?.metadata.dataLineage || []
    });
    const [validation, setValidation] = useState({
        valid: true,
        errors: [],
        warnings: [],
        recommendations: []
    });
    const [showRequirements, setShowRequirements] = useState(false);
    const [currentUser] = useState('current-user'); // TODO: Get from auth context
    // Validate form data
    useEffect(() => {
        const errors = [];
        const warnings = [];
        const recommendations = [];
        if (!formData.classification) {
            errors.push('Classification level is required');
        }
        if (!formData.rationale.trim()) {
            errors.push('Classification rationale is required');
        }
        else if (formData.rationale.length < 20) {
            warnings.push('Rationale should be more detailed (minimum 20 characters)');
        }
        if (!formData.dataOwner.trim()) {
            errors.push('Data owner must be specified');
        }
        if (!formData.businessJustification.trim() && formData.classification !== 'PUBLIC') {
            warnings.push('Business justification is recommended for non-public data');
        }
        if (!formData.riskAssessment.trim() && ['CONFIDENTIAL', 'RESTRICTED'].includes(formData.classification)) {
            errors.push('Risk assessment is required for confidential and restricted data');
        }
        if (formData.classification === 'RESTRICTED' && formData.regulatoryRequirements.length === 0) {
            warnings.push('Regulatory requirements should be specified for restricted data');
        }
        // Classification-specific recommendations
        if (formData.classification === 'CONFIDENTIAL' || formData.classification === 'RESTRICTED') {
            recommendations.push('Consider implementing additional access controls');
            recommendations.push('Ensure appropriate audit logging is enabled');
        }
        const newValidation = {
            valid: errors.length === 0,
            errors,
            warnings,
            recommendations
        };
        setValidation(newValidation);
        onValidationChange?.(newValidation);
    }, [formData, onValidationChange]);
    const handleFieldChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const handleArrayFieldChange = (field, value) => {
        const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
        handleFieldChange(field, items);
    };
    const handleSubmit = () => {
        if (!validation.valid || !formData.classification)
            return;
        const classification = {
            id: existingClassification?.id || `class-${dataId}-${Date.now()}`,
            dataElement: dataId,
            classification: formData.classification,
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
                relatedClassifications: []
            }
        };
        onClassificationChange(classification);
    };
    const getClassificationColor = (level) => {
        const colors = {
            PUBLIC: 'bg-green-100 text-green-800 border-green-300',
            INTERNAL: 'bg-blue-100 text-blue-800 border-blue-300',
            CONFIDENTIAL: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            RESTRICTED: 'bg-red-100 text-red-800 border-red-300'
        };
        return colors[level];
    };
    const getHandlingRequirements = () => {
        if (!formData.classification)
            return null;
        return DEFAULT_HANDLING_REQUIREMENTS[formData.classification];
    };
    return (_jsxs("div", { className: "classification-tagging-ui bg-white border border-gray-200 rounded-lg p-6 shadow-sm", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Data Classification" }), _jsx("p", { className: "text-sm text-gray-600", children: "Classify this data element according to its sensitivity and handling requirements" })] }), _jsxs("div", { className: "mb-6 p-4 bg-gray-50 rounded-lg", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Data Element" }), _jsxs("p", { className: "text-sm text-gray-700", children: ["ID: ", dataId] }), context && (_jsxs("div", { className: "mt-2 text-sm text-gray-600", children: [_jsxs("p", { children: ["Type: ", context.dataType] }), _jsxs("p", { children: ["Business Context: ", context.businessContext] }), _jsxs("p", { children: ["Risk Level: ", _jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${context.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                            context.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                                context.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'}`, children: context.riskLevel })] })] }))] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Classification Level *" }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: CLASSIFICATION_LEVELS.map(level => (_jsxs("button", { type: "button", disabled: readonly, onClick: () => handleFieldChange('classification', level), className: `p-3 text-left border-2 rounded-lg transition-colors ${formData.classification === level
                                ? `${getClassificationColor(level)} border-opacity-100`
                                : 'bg-white border-gray-200 hover:border-gray-300'} ${readonly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`, children: [_jsx("div", { className: "font-medium", children: level }), _jsxs("div", { className: "text-xs text-gray-600 mt-1", children: [level === 'PUBLIC' && 'No restrictions', level === 'INTERNAL' && 'Internal use only', level === 'CONFIDENTIAL' && 'Limited access required', level === 'RESTRICTED' && 'Highest protection level'] })] }, level))) })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Classification Rationale *" }), _jsx("textarea", { value: formData.rationale, onChange: (e) => handleFieldChange('rationale', e.target.value), placeholder: "Explain why this classification level is appropriate...", disabled: readonly, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100", rows: 3 })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Data Owner *" }), _jsx("input", { type: "text", value: formData.dataOwner, onChange: (e) => handleFieldChange('dataOwner', e.target.value), placeholder: "Enter data owner name or role", disabled: readonly, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100" })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Business Justification" }), _jsx("textarea", { value: formData.businessJustification, onChange: (e) => handleFieldChange('businessJustification', e.target.value), placeholder: "Describe the business need for this data and classification", disabled: readonly, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100", rows: 2 })] }), (['CONFIDENTIAL', 'RESTRICTED'].includes(formData.classification)) && (_jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Risk Assessment *" }), _jsx("textarea", { value: formData.riskAssessment, onChange: (e) => handleFieldChange('riskAssessment', e.target.value), placeholder: "Assess potential risks of data exposure or misuse", disabled: readonly, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100", rows: 2 })] })), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Regulatory Requirements" }), _jsx("input", { type: "text", value: formData.regulatoryRequirements.join(', '), onChange: (e) => handleArrayFieldChange('regulatoryRequirements', e.target.value), placeholder: "e.g., GDPR, HIPAA, SOX (comma-separated)", disabled: readonly, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100" })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Data Lineage" }), _jsx("input", { type: "text", value: formData.dataLineage.join(', '), onChange: (e) => handleArrayFieldChange('dataLineage', e.target.value), placeholder: "e.g., source-system, transformation-process (comma-separated)", disabled: readonly, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100" })] }), (validation.errors.length > 0 || validation.warnings.length > 0 || validation.recommendations.length > 0) && (_jsxs("div", { className: "mb-6 space-y-2", children: [validation.errors.map((error, index) => (_jsxs("div", { className: "flex items-center text-red-600 text-sm", children: [_jsx("svg", { className: "w-4 h-4 mr-2", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }), error] }, index))), validation.warnings.map((warning, index) => (_jsxs("div", { className: "flex items-center text-yellow-600 text-sm", children: [_jsx("svg", { className: "w-4 h-4 mr-2", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }), warning] }, index))), validation.recommendations.map((recommendation, index) => (_jsxs("div", { className: "flex items-center text-blue-600 text-sm", children: [_jsx("svg", { className: "w-4 h-4 mr-2", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" }) }), recommendation] }, index)))] })), showHandlingRequirements && formData.classification && (_jsxs("div", { className: "mb-6", children: [_jsxs("button", { type: "button", onClick: () => setShowRequirements(!showRequirements), className: "flex items-center text-sm font-medium text-gray-700 hover:text-gray-900", children: [_jsx("svg", { className: `w-4 h-4 mr-2 transform transition-transform ${showRequirements ? 'rotate-90' : ''}`, fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z", clipRule: "evenodd" }) }), "View Handling Requirements for ", formData.classification] }), showRequirements && (_jsx("div", { className: "mt-3 p-4 bg-gray-50 rounded-lg", children: (() => {
                            const requirements = getHandlingRequirements();
                            if (!requirements)
                                return null;
                            return (_jsxs("div", { className: "space-y-3 text-sm", children: [_jsxs("div", { children: [_jsx("h5", { className: "font-medium text-gray-900", children: "Storage" }), _jsxs("ul", { className: "text-gray-600 list-disc list-inside", children: [_jsxs("li", { children: ["Encryption: ", requirements.storage.encryptionRequired ? 'Required' : 'Not required'] }), _jsxs("li", { children: ["Key Rotation: ", requirements.storage.keyRotationDays, " days"] }), _jsxs("li", { children: ["Retention: ", requirements.storage.retentionDays, " days"] })] })] }), _jsxs("div", { children: [_jsx("h5", { className: "font-medium text-gray-900", children: "Access" }), _jsxs("ul", { className: "text-gray-600 list-disc list-inside", children: [_jsxs("li", { children: ["Authentication: ", requirements.access.authenticationLevel] }), _jsxs("li", { children: ["Authorization: ", requirements.access.authorizationRequired ? 'Required' : 'Not required'] }), _jsxs("li", { children: ["Audit Logging: ", requirements.access.auditLogging] })] })] }), _jsxs("div", { children: [_jsx("h5", { className: "font-medium text-gray-900", children: "Monitoring" }), _jsxs("ul", { className: "text-gray-600 list-disc list-inside", children: [_jsxs("li", { children: ["Alerting: ", requirements.monitoring.alertingEnabled ? 'Enabled' : 'Disabled'] }), _jsxs("li", { children: ["Anomaly Detection: ", requirements.monitoring.anomalyDetection ? 'Enabled' : 'Disabled'] }), _jsxs("li", { children: ["Real-time Monitoring: ", requirements.monitoring.realtimeMonitoring ? 'Required' : 'Not required'] })] })] })] }));
                        })() }))] })), !readonly && (_jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx("button", { type: "button", className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: "Cancel" }), _jsx("button", { type: "button", onClick: handleSubmit, disabled: !validation.valid || !formData.classification, className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed", children: "Apply Classification" })] })), readonly && existingClassification && (_jsxs("div", { className: "border-t pt-4", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Classification Details" }), _jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [_jsxs("p", { children: ["Classified by: ", existingClassification.classifiedBy] }), _jsxs("p", { children: ["Date: ", existingClassification.classificationDate.toLocaleDateString()] }), _jsxs("p", { children: ["Review Date: ", existingClassification.reviewDate.toLocaleDateString()] })] })] }))] }));
};
export default ClassificationTaggingUI;
