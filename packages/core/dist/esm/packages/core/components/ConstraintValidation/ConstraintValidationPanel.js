import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Constraint Validation Panel Component
 * Epic 8.8: Task 3 - Visual feedback for constraint violations
 *
 * Provides real-time constraint validation feedback in the graph editor
 */
import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, CheckCircle, Info, X, Eye, EyeOff, Settings } from 'lucide-react';
import { ConstraintValidator } from '../../historical/ConstraintValidator';
import { HISTORICAL_ERAS } from '../../types/UTDG';
import './ConstraintValidationPanel.css';
{
    const [validator] = useState(() => new ConstraintValidator());
    const [validationResult, setValidationResult] = useState(null);
    const [selectedEra, setSelectedEra] = useState(targetEra);
    const [showSettings, setShowSettings] = useState(false);
    const [enforcementLevels, setEnforcementLevels] = useState(['strict', 'warning', 'suggestion']);
    // Convert regular nodes to UTDG nodes for validation
    const convertedNodes = useMemo(() => {
        const converted = [...utdgNodes];
        // Convert regular nodes to basic UTDG nodes for validation
        nodes.forEach(node => { });
        if (!utdgNodes.find(un => un.id === node.id)) {
            const utdgNode = {
                id: node.id,
                type: 'style', // Default type for regular nodes,
                content: getNodeContent(node),
                metadata: {
                    era: selectedEra ? [selectedEra] : [HISTORICAL_ERAS.MODERN_EARLY],
                    authenticity: 0.5,
                    source: 'graph_editor',
                    tags: extractTags(node),
                    social_class: extractSocialClass(node),
                    daily_use: true,
                },
                relationships: {
                    compatible: node.inputs || [],
                    incompatible: [],
                    variations: [],
                },
                constraints: []
            };
            converted.push(utdgNode);
        }
    });
    return converted;
}
[nodes, utdgNodes, selectedEra];
;
// Run validation when nodes or era changes
useEffect(() => {
    if (convertedNodes.length > 0) {
        validator.setEnforcement(enforcementLevels);
        const result = selectedEra;
        validator.validateForEra(convertedNodes, selectedEra);
        validator.validateNodes(convertedNodes);
        setValidationResult(result);
    }
    [convertedNodes, selectedEra, validator, enforcementLevels];
});
const handleNodeClick = (nodeIds) => {
    onNodeHighlight?.(nodeIds);
};
const handleConstraintOverride = (constraintId) => {
    onConstraintOverride?.(constraintId);
    // Re-run validation after override
    if (convertedNodes.length > 0) {
        const result = selectedEra;
    }
};
validator.validateForEra(convertedNodes, selectedEra);
validator.validateNodes(convertedNodes);
setValidationResult(result);
;
const handleEnforcementChange = (level, enabled) => {
    const newLevels = enabled;
};
[...enforcementLevels, level];
enforcementLevels.filter(l => l !== level);
setEnforcementLevels(newLevels);
;
if (!visible) {
    return;
    _jsx("div", { className: "constraint-validation-collapsed", children: _jsx("button", { onClick: onToggleVisibility, className: "constraint-toggle-btn", title: "Show constraint validation", children: _jsx(Eye, { size: 16 }) }) });
    ;
    return;
    _jsxs("div", { className: "constraint-validation-panel", children: [_jsxs("div", { className: "constraint-panel-header", children: [_jsx("h3", { children: "Historical Constraints" }), _jsxs("div", { className: "constraint-panel-controls", children: [_jsx("button", { onClick: () => setShowSettings(!showSettings), className: "constraint-settings-btn", title: "Constraint settings", children: _jsx(Settings, { size: 16 }) }), _jsx("button", { onClick: onToggleVisibility, className: "constraint-close-btn", title: "Hide constraint validation", children: _jsx(EyeOff, { size: 16 }) })] })] }), showSettings && ()
                < div, " className=\"constraint-settings\">", _jsxs("div", { className: "era-selector", children: [_jsx("label", { children: "Target Era:" }), _jsxs("select", { value: selectedEra?.name || '', onChange: (e) => {
                            const era = Object.values(HISTORICAL_ERAS).find(era => era.name === e.target.value);
                            setSelectedEra(era);
                        }, children: [_jsx("option", { value: "", children: "All Eras" }), Object.values(HISTORICAL_ERAS).map(era => ()
                                < option, key = { era, : .name }, value = { era, : .name } > { era, : .name })] }), "))}"] })] })
        ,
            _jsxs("div", { className: "enforcement-settings", children: [_jsx("label", { children: "Enforcement Levels:" }), ['strict', 'warning', 'suggestion'].map(level => ()
                        < label, key = { level }, className = "enforcement-checkbox" >
                        _jsx("input", { type: "checkbox", checked: enforcementLevels.includes(level), onChange: (e) => handleEnforcementChange(level, e.target.checked) }), { level, : .charAt(0).toUpperCase() + level.slice(1) })] });
}
div >
;
div >
;
_jsxs("div", { className: "constraint-validation-content", children: [validationResult ? ()
            <  >
            _jsxs("div", { className: "validation-summary", children: [validationResult.valid ? ()
                        < div : , " className=\"validation-status valid\">", _jsx(CheckCircle, { size: 16 }), _jsx("span", { children: "All constraints satisfied" })] })
            :
        , ") : ()", _jsxs("div", { className: "validation-status invalid", children: [_jsx(AlertTriangle, { size: 16 }), _jsxs("span", { children: [validationResult.violations.length, " violation", validationResult.violations.length !== 1 ? 's' : '', ",", validationResult.warnings.length, " warning", validationResult.warnings.length !== 1 ? 's' : ''] })] }), ")}"] });
{ /* Violations */ }
{
    validationResult.violations.length > 0 && ()
        < div;
    className = "constraint-section violations" >
        _jsxs("h4", { children: [_jsx(AlertTriangle, { size: 16 }), "Constraint Violations"] });
    {
        validationResult.violations.map((violation, index) => ()
            < ConstraintItem, key = {} `violation-${index}`);
    }
    type = "violation";
    constraint = { violation };
    onNodeClick = { handleNodeClick };
    onOverride = { handleConstraintOverride }
        /  >
    ;
}
div >
;
{ /* Warnings */ }
{
    validationResult.warnings.length > 0 && ()
        < div;
    className = "constraint-section warnings" >
        _jsxs("h4", { children: [_jsx(Info, { size: 16 }), "Historical Warnings"] });
    {
        validationResult.warnings.map((warning, index) => ()
            < ConstraintItem, key = {} `warning-${index}`);
    }
    type = "warning";
    constraint = { warning };
    onNodeClick = { handleNodeClick };
    onOverride = { handleConstraintOverride }
        /  >
    ;
}
div >
;
{ /* Suggestions */ }
{
    validationResult.suggestions.length > 0 && ()
        < div;
    className = "constraint-section suggestions" >
        _jsxs("h4", { children: [_jsx(Info, { size: 16 }), "Improvement Suggestions"] });
    {
        validationResult.suggestions.map((suggestion, index) => ()
            < ConstraintItem, key = {} `suggestion-${index}`);
    }
    type = "suggestion";
    constraint = { suggestion };
    onNodeClick = { handleNodeClick };
    onOverride = { handleConstraintOverride }
        /  >
    ;
}
div >
;
 >
;
()
    < div;
className = "validation-placeholder" >
    (_jsx(Info, { size: 16 })
        ,
            _jsx("span", { children: "Add nodes to validate historical constraints" }));
div >
;
div >
;
div >
;
;
;
{
    const getIcon = () => {
        switch (type) {
            case 'violation': return _jsx(AlertTriangle, { size: 14 });
            case 'warning': return _jsx(Info, { size: 14 });
            case 'suggestion': return _jsx(CheckCircle, { size: 14 });
        }
        ;
        const getSeverityClass = () => {
            if (type === 'violation')
                return 'severity-high';
            if (type === 'warning')
                return 'severity-medium';
            return 'severity-low';
        };
        return;
        _jsxs("div", { className: `constraint-item ${type} ${getSeverityClass()}`, children: ["}", _jsxs("div", { className: "constraint-item-header", children: [getIcon(), _jsx("span", { className: "constraint-message", children: constraint.message }), type === 'violation' && onOverride && ()
                            < button, "className=\"constraint-override-btn\" onClick=", () => onOverride(constraint.constraint_id), "title=\"Override this constraint\" >", _jsx(X, { size: 12 })] }), ")}"] })
            ,
                _jsxs("div", { className: "constraint-item-details", children: [constraint.node_ids.length > 0 && ()
                            < div, " className=\"affected-nodes\">", _jsx("span", { children: "Affects: " }), constraint.node_ids.map((nodeId, index) => ()
                            < button, key = { nodeId }, className = "node-reference", onClick = {}()), " => onNodeClick?.([nodeId])} >", nodeId, index < constraint.node_ids.length - 1 && ', '] });
    };
}
div >
;
{
    'historical_context' in constraint && constraint.historical_context && ()
        < div;
    className = "historical-context" >
        _jsx("strong", { children: "Historical Context:" });
    {
        constraint.historical_context;
    }
    div >
    ;
}
{
    'suggested_alternatives' in constraint && constraint.suggested_alternatives && ()
        < div;
    className = "suggested-alternatives" >
        (_jsx("strong", { children: "Suggestions:" })
            ,
                _jsx("ul", { children: constraint.suggested_alternatives.map((alt, index) => ()
                        < li, key = { index } > { alt }) }));
}
ul >
;
div >
;
div >
;
div >
;
;
;
// Helper functions for node conversion
function getNodeContent(node) {
    if (node.type === 'WeightedChoice' && node.choices) {
        return node.choices.map(c => typeof c === 'string' ? c : c.value).join(', ');
        if (node.type === 'SetVariable') {
            return `${node.key} = ${node.value}`;
        }
        return node.type;
        function extractTags(node) {
            const tags = [node.type.toLowerCase()];
            if (node.type === 'SetVariable' && node.key) {
                const key = node.key.toLowerCase();
                if (key.includes('medieval'))
                    tags.push('medieval');
                if (key.includes('clothing'))
                    tags.push('clothing');
                if (key.includes('material'))
                    tags.push('material');
                if (key.includes('noble'))
                    tags.push('noble');
                if (key.includes('peasant'))
                    tags.push('peasant');
                return tags;
                function extractSocialClass(node) {
                    if (node.type === 'SetVariable' && node.key) {
                        const key = node.key.toLowerCase();
                        if (key.includes('noble'))
                            return ['noble'];
                        if (key.includes('peasant'))
                            return ['peasant'];
                        if (key.includes('merchant'))
                            return ['merchant'];
                        if (key.includes('clergy'))
                            return ['clergy'];
                        if (key.includes('royal'))
                            return ['royal'];
                        return undefined;
                        export default ConstraintValidationPanel;
                    }
                }
            }
        }
    }
}
