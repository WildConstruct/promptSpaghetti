/**
 * Bulk Classification Tools Component
 * Task T-1752989143998-945: Implement bulk classification tools
 * 
 * Provides tools for classifying multiple data elements efficiently
 * with batch operations, templates, and automated classification
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  DataClassification,
  DataClassificationLevel,
  ClassificationContext,
  ClassificationRule,
  ValidationResult,
  CLASSIFICATION_LEVELS,
  ClassificationCondition
} from '../../types/DataClassification';

interface DataElement {
  id: string;
  name: string;
  type: string;
  content?: string;
  metadata?: Record<string, any>;
  existingClassification?: DataClassification;
}

interface BulkClassificationToolsProps {
  dataElements: DataElement[];
  classificationRules?: ClassificationRule[];
  onBulkClassification: (classifications: DataClassification[]) => void;
  onValidationResults?: (results: ValidationResult[]) => void;
  context?: ClassificationContext;
}

interface ClassificationTemplate {
  id: string;
  name: string;
  description: string;
  classification: DataClassificationLevel;
  rationale: string;
  criteria: {
    dataTypes: string[];
    namePatterns: string[];
    contentPatterns: string[];
  };
}

interface BulkOperationState {
  selectedElements: Set<string>;
  operationType: 'manual' | 'template' | 'rules' | 'ai';
  selectedTemplate?: ClassificationTemplate;
  manualClassification?: DataClassificationLevel;
  rationale: string;
  dataOwner: string;
  processing: boolean;
  results: Map<string, DataClassification | string>; // string for errors
}

const DEFAULT_TEMPLATES: ClassificationTemplate[] = [
  {
    id: 'pii-template',
    name: 'Personal Information',
    description: 'For data containing personal identifiable information',
    classification: 'CONFIDENTIAL',
    rationale: 'Contains personal information requiring protection',
    criteria: {
      dataTypes: ['personal', 'customer', 'employee'],
      namePatterns: ['*email*', '*phone*', '*ssn*', '*name*', '*address*'],
      contentPatterns: ['\\b\\d{3}-\\d{2}-\\d{4}\\b', '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b']
    }
  },
  {
    id: 'financial-template',
    name: 'Financial Information',
    description: 'For financial and payment data',
    classification: 'RESTRICTED',
    rationale: 'Financial data requires highest protection level',
    criteria: {
      dataTypes: ['financial', 'payment', 'banking'],
      namePatterns: ['*account*', '*card*', '*payment*', '*bank*', '*credit*'],
      contentPatterns: ['\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b']
    }
  },
  {
    id: 'public-template',
    name: 'Public Information',
    description: 'For publicly available information',
    classification: 'PUBLIC',
    rationale: 'Information intended for public consumption',
    criteria: {
      dataTypes: ['public', 'marketing', 'documentation'],
      namePatterns: ['*public*', '*marketing*', '*docs*', '*help*'],
      contentPatterns: []
    }
  },
  {
    id: 'internal-template',
    name: 'Internal Business',
    description: 'For internal business information',
    classification: 'INTERNAL',
    rationale: 'Internal business information for employee use',
    criteria: {
      dataTypes: ['internal', 'business', 'operational'],
      namePatterns: ['*internal*', '*business*', '*operational*', '*metrics*'],
      contentPatterns: []
    }
  }
];

export const BulkClassificationTools: React.FC<BulkClassificationToolsProps> = ({
  dataElements,
  classificationRules = [],
  onBulkClassification,
  onValidationResults,
  context
}) => {
  const [state, setState] = useState<BulkOperationState>({
    selectedElements: new Set(),
    operationType: 'manual',
    rationale: '',
    dataOwner: context?.dataOwner || '',
    processing: false,
    results: new Map()
  });

  const [templates] = useState<ClassificationTemplate[]>(DEFAULT_TEMPLATES);
  const [currentUser] = useState('current-user'); // TODO: Get from auth context
  const [showPreview, setShowPreview] = useState(false);

  // Filter and categorize data elements
  const categorizedElements = useMemo(() => {
    const unclassified = dataElements.filter(el => !el.existingClassification);
    const classified = dataElements.filter(el => el.existingClassification);
    const byType = dataElements.reduce((acc, el) => {
      if (!acc[el.type]) acc[el.type] = [];
      acc[el.type].push(el);
      return acc;
    }, {} as Record<string, DataElement[]>);

    return { unclassified, classified, byType };
  }, [dataElements]);

  // Auto-suggest classifications based on templates and rules
  const getSuggestedClassifications = (elements: DataElement[]) => {
    const suggestions = new Map<string, { classification: DataClassificationLevel; confidence: number; reason: string }>();

    elements.forEach(element => {
      let bestMatch: { classification: DataClassificationLevel; confidence: number; reason: string } | null = null;

      // Check templates
      for (const template of templates) {
        let score = 0;
        
        // Check data type match
        if (template.criteria.dataTypes.includes(element.type.toLowerCase())) {
          score += 30;
        }

        // Check name patterns
        const nameMatches = template.criteria.namePatterns.some(pattern => {
          const regex = new RegExp(pattern.replace('*', '.*'), 'i');
          return regex.test(element.name);
        });
        if (nameMatches) score += 40;

        // Check content patterns
        if (element.content) {
          const contentMatches = template.criteria.contentPatterns.some(pattern => {
            const regex = new RegExp(pattern, 'i');
            return regex.test(element.content!);
          });
          if (contentMatches) score += 30;
        }

        if (score > 0 && (!bestMatch || score > bestMatch.confidence)) {
          bestMatch = {
            classification: template.classification,
            confidence: score,
            reason: `Matches template: ${template.name} (${score}% confidence)`
          };
        }
      }

      // Check classification rules
      for (const rule of classificationRules) {
        let ruleScore = 0;
        
        for (const condition of rule.conditions) {
          switch (condition.type) {
          case 'FIELD_NAME':
            if (new RegExp(condition.pattern, 'i').test(element.name)) {
              ruleScore += condition.weight;
            }
            break;
          case 'CONTENT_PATTERN':
            if (element.content && new RegExp(condition.pattern, 'i').test(element.content)) {
              ruleScore += condition.weight;
            }
            break;
          default:
            break;
          }
        }

        const ruleConfidence = Math.min(100, ruleScore);
        if (ruleConfidence > (bestMatch?.confidence || 0)) {
          bestMatch = {
            classification: rule.classification,
            confidence: ruleConfidence,
            reason: `Matches rule: ${rule.name} (${ruleConfidence}% confidence)`
          };
        }
      }

      if (bestMatch) {
        suggestions.set(element.id, bestMatch);
      }
    });

    return suggestions;
  };

  const handleElementSelection = (elementId: string, selected: boolean) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedElements);
      if (selected) {
        newSelected.add(elementId);
      } else {
        newSelected.delete(elementId);
      }
      return { ...prev, selectedElements: newSelected };
    });
  };

  const handleSelectAll = (elementIds: string[]) => {
    setState(prev => ({
      ...prev,
      selectedElements: new Set([...prev.selectedElements, ...elementIds])
    }));
  };

  const handleDeselectAll = () => {
    setState(prev => ({ ...prev, selectedElements: new Set() }));
  };

  const generatePreview = (): DataClassification[] => {
    const selectedElements = Array.from(state.selectedElements)
      .map(id => dataElements.find(el => el.id === id))
      .filter(Boolean) as DataElement[];

    const suggestions = getSuggestedClassifications(selectedElements);
    
    return selectedElements.map(element => {
      let classification: DataClassificationLevel;
      let rationale: string;

      switch (state.operationType) {
      case 'manual':
        classification = state.manualClassification || 'INTERNAL';
        rationale = state.rationale || `Manual classification as ${classification}`;
        break;
      case 'template':
        classification = state.selectedTemplate?.classification || 'INTERNAL';
        rationale = state.selectedTemplate?.rationale || 'Applied from template';
        break;
      case 'rules':
      case 'ai':
        const suggestion = suggestions.get(element.id);
        classification = suggestion?.classification || 'INTERNAL';
        rationale = suggestion?.reason || 'Default classification applied';
        break;
      default:
        classification = 'INTERNAL';
        rationale = 'Default classification';
      }

      return {
        id: `class-${element.id}-${Date.now()}`,
        dataElement: element.id,
        classification,
        rationale,
        dataOwner: state.dataOwner,
        classifiedBy: currentUser,
        classificationDate: new Date(),
        reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        approvals: [],
        metadata: {
          businessJustification: `Bulk classification using ${state.operationType} method`,
          riskAssessment: 'Risk assessment pending individual review',
          regulatoryRequirements: context?.regulatoryScope || [],
          dataLineage: [element.type],
          relatedClassifications: []
        }
      };
    });
  };

  const handleApplyClassifications = async () => {
    setState(prev => ({ ...prev, processing: true }));

    try {
      const classifications = generatePreview();
      
      // Validate classifications
      const validationResults: ValidationResult[] = classifications.map(classification => {
        const errors: string[] = [];
        const warnings: string[] = [];
        
        if (!classification.rationale || classification.rationale.length < 10) {
          warnings.push('Rationale could be more detailed');
        }
        
        if (!classification.dataOwner) {
          errors.push('Data owner is required');
        }

        if (classification.classification === 'RESTRICTED' && !classification.metadata.riskAssessment.includes('detailed')) {
          warnings.push('Restricted data should have detailed risk assessment');
        }

        return {
          valid: errors.length === 0,
          errors,
          warnings,
          recommendations: state.operationType === 'ai' ? ['Review AI-generated classifications manually'] : []
        };
      });

      onValidationResults?.(validationResults);
      
      if (validationResults.every(result => result.valid)) {
        onBulkClassification(classifications);
        setState(prev => ({ ...prev, selectedElements: new Set(), processing: false }));
      } else {
        setState(prev => ({ ...prev, processing: false }));
        alert('Some classifications have validation errors. Please review and correct them.');
      }
    } catch (error) {
      console.error('Error applying bulk classifications:', error);
      setState(prev => ({ ...prev, processing: false }));
      alert('Error applying classifications. Please try again.');
    }
  };

  const suggestions = useMemo(() => {
    const selectedElements = Array.from(state.selectedElements)
      .map(id => dataElements.find(el => el.id === id))
      .filter(Boolean) as DataElement[];
    return getSuggestedClassifications(selectedElements);
  }, [state.selectedElements, dataElements, templates, classificationRules]);

  return (
    <div className="bulk-classification-tools bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Bulk Classification Tools</h3>
        <p className="text-sm text-gray-600">
          Efficiently classify multiple data elements using templates, rules, or manual assignment
        </p>
      </div>

      {/* Data Overview */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900">Total Elements</h4>
          <p className="text-2xl font-bold text-blue-700">{dataElements.length}</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium text-yellow-900">Unclassified</h4>
          <p className="text-2xl font-bold text-yellow-700">{categorizedElements.unclassified.length}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900">Selected</h4>
          <p className="text-2xl font-bold text-green-700">{state.selectedElements.size}</p>
        </div>
      </div>

      {/* Operation Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Classification Method</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'manual', label: 'Manual Assignment', desc: 'Apply same classification to all selected' },
            { value: 'template', label: 'Template-Based', desc: 'Use predefined classification templates' },
            { value: 'rules', label: 'Rule-Based', desc: 'Apply classification rules automatically' },
            { value: 'ai', label: 'AI Suggestion', desc: 'Use intelligent pattern matching' }
          ].map(method => (
            <button
              key={method.value}
              type="button"
              onClick={() => setState(prev => ({ ...prev, operationType: method.value as any }))}
              className={`p-3 text-left border-2 rounded-lg transition-colors ${
                state.operationType === method.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{method.label}</div>
              <div className="text-xs text-gray-600 mt-1">{method.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Method-specific Controls */}
      {state.operationType === 'manual' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Manual Classification</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Classification Level</label>
              <select
                value={state.manualClassification || ''}
                onChange={(e) => setState(prev => ({ ...prev, manualClassification: e.target.value as DataClassificationLevel }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select classification...</option>
                {CLASSIFICATION_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rationale</label>
              <textarea
                value={state.rationale}
                onChange={(e) => setState(prev => ({ ...prev, rationale: e.target.value }))}
                placeholder="Explain why this classification is appropriate..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
          </div>
        </div>
      )}

      {state.operationType === 'template' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Template Selection</h4>
          <div className="grid grid-cols-1 gap-2">
            {templates.map(template => (
              <button
                key={template.id}
                type="button"
                onClick={() => setState(prev => ({ ...prev, selectedTemplate: template }))}
                className={`p-3 text-left border rounded-lg transition-colors ${
                  state.selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.description}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    template.classification === 'PUBLIC' ? 'bg-green-100 text-green-800' :
                      template.classification === 'INTERNAL' ? 'bg-blue-100 text-blue-800' :
                        template.classification === 'CONFIDENTIAL' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                  }`}>
                    {template.classification}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Data Owner */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Data Owner</label>
        <input
          type="text"
          value={state.dataOwner}
          onChange={(e) => setState(prev => ({ ...prev, dataOwner: e.target.value }))}
          placeholder="Enter data owner name or role"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Element Selection */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-900">Select Data Elements</h4>
          <div className="space-x-2">
            <button
              type="button"
              onClick={() => handleSelectAll(categorizedElements.unclassified.map(el => el.id))}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Select Unclassified
            </button>
            <button
              type="button"
              onClick={() => handleSelectAll(dataElements.map(el => el.id))}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              Deselect All
            </button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
          {dataElements.map(element => {
            const isSelected = state.selectedElements.has(element.id);
            const suggestion = suggestions.get(element.id);
            
            return (
              <div
                key={element.id}
                className={`p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                  isSelected ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleElementSelection(element.id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <div className="font-medium text-sm">{element.name}</div>
                      <div className="text-xs text-gray-500">
                        Type: {element.type} | ID: {element.id}
                      </div>
                      {suggestion && (
                        <div className="text-xs text-blue-600 mt-1">
                          Suggested: {suggestion.classification} ({suggestion.confidence}%)
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {element.existingClassification && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        element.existingClassification.classification === 'PUBLIC' ? 'bg-green-100 text-green-800' :
                          element.existingClassification.classification === 'INTERNAL' ? 'bg-blue-100 text-blue-800' :
                            element.existingClassification.classification === 'CONFIDENTIAL' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                      }`}>
                        {element.existingClassification.classification}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview and Actions */}
      <div className="flex justify-between items-center">
        <div className="space-x-3">
          {state.selectedElements.size > 0 && (
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {showPreview ? 'Hide' : 'Show'} Preview ({state.selectedElements.size} items)
            </button>
          )}
        </div>

        <div className="space-x-3">
          <button
            type="button"
            disabled={state.selectedElements.size === 0 || state.processing}
            onClick={handleApplyClassifications}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {state.processing ? 'Processing...' : 'Apply Classifications'}
          </button>
        </div>
      </div>

      {/* Preview */}
      {showPreview && state.selectedElements.size > 0 && (
        <div className="mt-6 border border-gray-200 rounded-lg">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">Classification Preview</h4>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {generatePreview().map((classification, index) => (
              <div key={index} className="p-3 border-b border-gray-100 last:border-b-0">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">{classification.dataElement}</div>
                    <div className="text-xs text-gray-600">{classification.rationale}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    classification.classification === 'PUBLIC' ? 'bg-green-100 text-green-800' :
                      classification.classification === 'INTERNAL' ? 'bg-blue-100 text-blue-800' :
                        classification.classification === 'CONFIDENTIAL' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                  }`}>
                    {classification.classification}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkClassificationTools;