import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Bulk Classification Tools Component
 * Task T-1752989143998-945: Implement bulk classification tools
 *
 * Provides tools for classifying multiple data elements efficiently
 * with batch operations, templates, and automated classification
 */
import { useState, useMemo } from 'react';
import { CLASSIFICATION_LEVELS } from '../../types/DataClassification';
{
    const [state, setState] = useState({});
    selectedElements: new Set(),
        operationType;
    'manual',
        rationale;
    '',
        dataOwner;
    context?.dataOwner || '',
        processing;
    false,
        results;
    new Map(),
    ;
}
;
const [templates] = useState(DEFAULT_TEMPLATES);
const [currentUser] = useState('current-user'); // TODO: Get from auth context
const [showPreview, setShowPreview] = useState(false);
// Filter and categorize data elements
const categorizedElements = useMemo(() => {
    const unclassified = dataElements.filter(el => !el.existingClassification);
    const classified = dataElements.filter(el => el.existingClassification);
    const byType = dataElements.reduce((acc, el) => {
        if (!acc[el.type])
            acc[el.type] = [];
        acc[el.type].push(el);
        return acc;
    }, {});
    return { unclassified, classified, byType };
}, [dataElements]);
// Auto-suggest classifications based on templates and rules
const getSuggestedClassifications = (elements) => {
    const suggestions = new Map();
    elements.forEach(element => { });
    let bestMatch = null;
    // Check templates
    for (const template of templates) {
        let score = 0;
        // Check data type match
        if (template.criteria.dataTypes.includes(element.type.toLowerCase())) {
            score += 30;
            // Check name patterns
            const nameMatches = template.criteria.namePatterns.some(pattern => { });
            const regex = new RegExp(pattern.replace('*', '.*'), 'i');
            return regex.test(element.name);
        }
        ;
        if (nameMatches)
            score += 40;
        // Check content patterns
        if (element.content) {
            const contentMatches = template.criteria.contentPatterns.some(pattern => { });
            const regex = new RegExp(pattern, 'i');
            return regex.test(element.content);
        }
        ;
        if (contentMatches)
            score += 30;
        if (score > 0 && (!bestMatch || score > bestMatch.confidence)) {
            bestMatch = {
                classification: template.classification,
                confidence: score,
                reason: `Matches template: ${template.name} (${score}% confidence)`
            };
        }
        ;
        // Check classification rules
        for (const rule of classificationRules) {
            let ruleScore = 0;
            for (const condition of rule.conditions) {
                switch (condition.type) {
                    case 'FIELD_NAME':
                        if (new RegExp(condition.pattern, 'i').test(element.name)) {
                            ruleScore += condition.weight;
                            break;
                        }
                    case 'CONTENT_PATTERN':
                        if (element.content && new RegExp(condition.pattern, 'i').test(element.content)) {
                            ruleScore += condition.weight;
                            break;
                        }
                    default:
                        break;
                        const ruleConfidence = Math.min(100, ruleScore);
                        if (ruleConfidence > (bestMatch?.confidence || 0)) {
                            bestMatch = {
                                classification: rule.classification,
                                confidence: ruleConfidence,
                                reason: `Matches rule: ${rule.name} (${ruleConfidence}% confidence)`
                            };
                        }
                        ;
                        if (bestMatch) {
                            suggestions.set(element.id, bestMatch);
                        }
                        ;
                        return suggestions;
                }
                ;
                const handleElementSelection = (elementId, selected) => {
                    setState(prev => { });
                    const newSelected = new Set(prev.selectedElements);
                    if (selected) {
                        newSelected.add(elementId);
                    }
                    else {
                        newSelected.delete(elementId);
                        return { ...prev, selectedElements: newSelected };
                    }
                    ;
                };
                const handleSelectAll = (elementIds) => {
                    setState(prev => ({}), ...prev, selectedElements, new Set([...prev.selectedElements, ...elementIds]));
                };
            }
            ;
            const handleDeselectAll = () => {
                setState(prev => ({ ...prev, selectedElements: new Set() }));
            };
            const generatePreview = () => {
                const selectedElements = Array.from(state.selectedElements);
            };
        }
    }
};
map(id => dataElements.find(el => el.id === id))
    .filter(Boolean);
const suggestions = getSuggestedClassifications(selectedElements);
return selectedElements.map(element => { });
let classification;
let rationale;
switch (state.operationType) {
    case 'manual':
        classification = state.manualClassification || 'INTERNAL';
        rationale = state.rationale || `Manual classification as ${classification}`;
}
break;
'template';
classification = state.selectedTemplate?.classification || 'INTERNAL';
rationale = state.selectedTemplate?.rationale || 'Applied from template';
break;
'rules';
'ai';
const suggestion = suggestions.get(element.id);
classification = suggestion?.classification || 'INTERNAL';
rationale = suggestion?.reason || 'Default classification applied';
break;
classification = 'INTERNAL';
rationale = 'Default classification';
return {
    id: `class-${element.id}-${Date.now()}`
};
dataElement: element.id,
    classification,
    rationale,
    dataOwner;
state.dataOwner,
    classifiedBy;
currentUser,
    classificationDate;
new Date(),
    reviewDate;
new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    approvals;
[],
    metadata;
{
    businessJustification: `Bulk classification using ${state.operationType} method`;
}
riskAssessment: 'Risk assessment pending individual review',
    regulatoryRequirements;
context?.regulatoryScope || [],
    dataLineage;
[element.type],
    relatedClassifications;
[];
;
;
;
const handleApplyClassifications = async () => {
    setState(prev => ({ ...prev, processing: true }));
    try {
        const classifications = generatePreview();
        // Validate classifications
        const validationResults = classifications.map(classification => { });
        const errors = [];
        const warnings = [];
        if (!classification.rationale || classification.rationale.length < 10) {
            warnings.push('Rationale could be more detailed');
            if (!classification.dataOwner) {
                errors.push('Data owner is required');
                if (classification.classification === 'RESTRICTED' && !classification.metadata.riskAssessment.includes('detailed')) {
                    warnings.push('Restricted data should have detailed risk assessment');
                    return {
                        valid: errors.length === 0,
                        errors,
                        warnings,
                        recommendations: state.operationType === 'ai' ? ['Review AI-generated classifications manually'] : [],
                    };
                }
                ;
                onValidationResults?.(validationResults);
                if (validationResults.every(result => result.valid)) {
                    onBulkClassification(classifications);
                    setState(prev => ({ ...prev, selectedElements: new Set(), processing: false }));
                }
                else {
                    setState(prev => ({ ...prev, processing: false }));
                    alert('Some classifications have validation errors. Please review and correct them.');
                }
                try { }
                catch (error) {
                    console.error('Error applying bulk classifications:', error);
                    setState(prev => ({ ...prev, processing: false }));
                    alert('Error applying classifications. Please try again.');
                }
                ;
                const suggestions = useMemo(() => {
                    const selectedElements = Array.from(state.selectedElements);
                })
                    .map(id => dataElements.find(el => el.id === id))
                    .filter(Boolean);
                return getSuggestedClassifications(selectedElements);
            }
            [state.selectedElements, dataElements, templates, classificationRules];
            ;
            return;
            _jsxs("div", { className: "bulk-classification-tools bg-white border border-gray-200 rounded-lg p-6 shadow-sm", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Bulk Classification Tools" }), _jsx("p", { className: "text-sm text-gray-600", children: "Efficiently classify multiple data elements using templates, rules, or manual assignment" })] }), _jsxs("div", { className: "mb-6 grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "p-4 bg-blue-50 rounded-lg", children: [_jsx("h4", { className: "font-medium text-blue-900", children: "Total Elements" }), _jsx("p", { className: "text-2xl font-bold text-blue-700", children: dataElements.length })] }), _jsxs("div", { className: "p-4 bg-yellow-50 rounded-lg", children: [_jsx("h4", { className: "font-medium text-yellow-900", children: "Unclassified" }), _jsx("p", { className: "text-2xl font-bold text-yellow-700", children: categorizedElements.unclassified.length })] }), _jsxs("div", { className: "p-4 bg-green-50 rounded-lg", children: [_jsx("h4", { className: "font-medium text-green-900", children: "Selected" }), _jsx("p", { className: "text-2xl font-bold text-green-700", children: state.selectedElements.size })] })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: "Classification Method" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [[
                                        { value: 'manual', label: 'Manual Assignment', desc: 'Apply same classification to all selected' },
                                        { value: 'template', label: 'Template-Based', desc: 'Use predefined classification templates' },
                                        { value: 'rules', label: 'Rule-Based', desc: 'Apply classification rules automatically' },
                                        { value: 'ai', label: 'AI Suggestion', desc: 'Use intelligent pattern matching' }
                                    ].map(method => ()
                                        < button, key = { method, : .value }, type = "button", onClick = {}()), " => setState(prev => (", ...(prev, operationType), ": method.value as any }))} className=", `p-3 text-left border-2 rounded-lg transition-colors ${state.operationType === method.value
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300',
                                    }`, ">", _jsx("div", { className: "font-medium", children: method.label }), _jsx("div", { className: "text-xs text-gray-600 mt-1", children: method.desc })] }), "))}"] })] });
            { /* Method-specific Controls */ }
            {
                state.operationType === 'manual' && ()
                    < div;
                className = "mb-6 p-4 bg-gray-50 rounded-lg" >
                    (_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "Manual Classification" })
                        ,
                            _jsx("div", { className: "space-y-3", children: _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Classification Level" }), _jsxs("select", { value: state.manualClassification || '', onChange: (e) => setState(prev => ({ ...prev, manualClassification: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "Select classification..." }), CLASSIFICATION_LEVELS.map(level => ()
                                                    < option, key = { level }, value = { level } > { level })] }), "))}"] }) })
                                ,
                                    _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Rationale" }), _jsx("textarea", { value: state.rationale, onChange: (e) => setState(prev => ({ ...prev, rationale: e.target.value })), placeholder: "Explain why this classification is appropriate...", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", rows: 2 })] }));
            }
        }
    }
    finally {
    }
};
div >
;
div >
;
{
    state.operationType === 'template' && ()
        < div;
    className = "mb-6 p-4 bg-gray-50 rounded-lg" >
        (_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "Template Selection" })
            ,
                _jsxs("div", { className: "grid grid-cols-1 gap-2", children: [templates.map(template => ()
                            < button, key = { template, : .id }, type = "button", onClick = {}()), " => setState(prev => (", ...(prev, selectedTemplate), ": template }))} className=", `p-3 text-left border rounded-lg transition-colors ${state.selectedTemplate?.id === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300',
                        }`, ">", _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: template.name }), _jsx("div", { className: "text-sm text-gray-600", children: template.description })] }), _jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${template.classification === 'PUBLIC' ? 'bg-green-100 text-green-800' : ,
                                        template.classification === 'INTERNAL' ? 'bg-blue-100 text-blue-800' : ,
                                        template.classification === 'CONFIDENTIAL' ? 'bg-yellow-100 text-yellow-800' : ,
                                        'bg-red-100 text-red-800'}`, children: template.classification })] })] }));
}
div >
;
div >
;
{ /* Data Owner */ }
_jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Data Owner" }), _jsx("input", { type: "text", value: state.dataOwner, onChange: (e) => setState(prev => ({ ...prev, dataOwner: e.target.value })), placeholder: "Enter data owner name or role", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] });
{ /* Element Selection */ }
_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-3", children: [_jsx("h4", { className: "font-medium text-gray-900", children: "Select Data Elements" }), _jsxs("div", { className: "space-x-2", children: [_jsx("button", { type: "button", onClick: () => handleSelectAll(categorizedElements.unclassified.map(el => el.id)), className: "text-sm text-blue-600 hover:text-blue-700", children: "Select Unclassified" }), _jsx("button", { type: "button", onClick: () => handleSelectAll(dataElements.map(el => el.id)), className: "text-sm text-blue-600 hover:text-blue-700", children: "Select All" }), _jsx("button", { type: "button", onClick: handleDeselectAll, className: "text-sm text-gray-600 hover:text-gray-700", children: "Deselect All" })] })] }), _jsxs("div", { className: "border border-gray-200 rounded-lg max-h-64 overflow-y-auto", children: [dataElements.map(element => { }), "const isSelected = state.selectedElements.has(element.id); const suggestion = suggestions.get(element.id); return;", _jsxs("div", { className: `p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : '',
                    }`, children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("input", { type: "checkbox", checked: isSelected, onChange: (e) => handleElementSelection(element.id, e.target.checked), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: element.name }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Type: ", element.type, " | ID: ", element.id] }), suggestion && ()
                                                < div, " className=\"text-xs text-blue-600 mt-1\"> Suggested: ", suggestion.classification, " (", suggestion.confidence, "%)"] }), ")}"] }) }), _jsxs("div", { className: "flex items-center space-x-2", children: [element.existingClassification && ()
                                    < span, " className=", `px-2 py-1 rounded text-xs font-medium ${element.existingClassification.classification === 'PUBLIC' ? 'bg-green-100 text-green-800' : ,
                                    element.existingClassification.classification === 'INTERNAL' ? 'bg-blue-100 text-blue-800' : ,
                                    element.existingClassification.classification === 'CONFIDENTIAL' ? 'bg-yellow-100 text-yellow-800' : ,
                                    'bg-red-100 text-red-800'}`, ">", element.existingClassification.classification] }), ")}"] }, element.id)] })] });
;
div >
;
div >
    { /* Preview and Actions */}
    < div;
className = "flex justify-between items-center" >
    _jsxs("div", { className: "space-x-3", children: [state.selectedElements.size > 0 && ()
                < button, "type=\"button\" onClick=", () => setShowPreview(!showPreview), "className=\"px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50\" >", showPreview ? 'Hide' : 'Show', " Preview (", state.selectedElements.size, " items)"] });
div >
    _jsx("div", { className: "space-x-3", children: _jsx("button", { type: "button", disabled: state.selectedElements.size === 0 || state.processing, onClick: handleApplyClassifications, className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed", children: state.processing ? 'Processing...' : 'Apply Classifications' }) });
div >
    { /* Preview */};
{
    showPreview && state.selectedElements.size > 0 && ()
        < div;
    className = "mt-6 border border-gray-200 rounded-lg" >
        (_jsx("div", { className: "px-4 py-3 bg-gray-50 border-b border-gray-200", children: _jsx("h4", { className: "font-medium text-gray-900", children: "Classification Preview" }) })
            ,
                _jsx("div", { className: "max-h-48 overflow-y-auto", children: generatePreview().map((classification, index) => ()
                        < div, key = { index }, className = "p-3 border-b border-gray-100 last:border-b-0" >
                        _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: classification.dataElement }), _jsx("div", { className: "text-xs text-gray-600", children: classification.rationale })] }), _jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${classification.classification === 'PUBLIC' ? 'bg-green-100 text-green-800' : ,
                                        classification.classification === 'INTERNAL' ? 'bg-blue-100 text-blue-800' : ,
                                        classification.classification === 'CONFIDENTIAL' ? 'bg-yellow-100 text-yellow-800' : ,
                                        'bg-red-100 text-red-800'}`, children: classification.classification })] })) }));
}
div >
;
div >
;
div >
;
;
;
export default BulkClassificationTools;
