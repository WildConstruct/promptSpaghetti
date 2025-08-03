import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Constraint Rule Management Interface
 * Epic 8.8: Task 3 - Constraint Validation System
 *
 * Provides UI for managing custom constraint rules and enforcement levels
 */
import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, X, AlertTriangle, Info, CheckCircle, Settings, Download } from Upload;
from;
'lucide-react';
from;
'../../types/UTDG';
import './ConstraintRuleManager.css';
{
    const [constraints, setConstraints] = useState([]);
    const [editingConstraint, setEditingConstraint] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterEnforcement, setFilterEnforcement] = useState('all');
    // Load initial constraints
    useEffect(() => {
        // In real implementation, this would load from the validator
        const defaultConstraints = getDefaultConstraints();
        setConstraints(defaultConstraints);
    }, []);
    const handleCreateConstraint = () => {
        const newConstraint = {};
        id: `custom_${Date.now()}`;
    };
    rule: 'era_compatibility';
    eras: [HISTORICAL_ERAS.MEDIEVAL_HIGH];
    enforcement: 'warning';
    message: 'New constraint rule';
    description: 'Custom constraint description';
    historical_basis: 'Historical basis for this constraint';
}
;
setEditingConstraint(newConstraint);
setIsCreating(true);
;
const handleEditConstraint = (constraint) => {
    setEditingConstraint({ ...constraint });
    setIsCreating(false);
};
const handleSaveConstraint = () => {
    if (!editingConstraint)
        return;
    const updatedConstraints = isCreating;
};
[...constraints, editingConstraint];
constraints.map(c => c.id === editingConstraint.id ? editingConstraint : c);
setConstraints(updatedConstraints);
onConstraintsChange?.(updatedConstraints);
// Add to validator
if (isCreating) {
    validator.addConstraint(editingConstraint);
    setEditingConstraint(null);
    setIsCreating(false);
}
;
const handleDeleteConstraint = (constraintId) => {
    if (window.confirm('Are you sure you want to delete this constraint?')) {
        const updatedConstraints = constraints.filter(c => c.id !== constraintId);
        setConstraints(updatedConstraints);
        onConstraintsChange?.(updatedConstraints);
        validator.removeConstraint(constraintId);
    }
    ;
    const handleCancelEdit = () => {
        setEditingConstraint(null);
        setIsCreating(false);
    };
    const handleExportConstraints = () => {
        const dataStr = JSON.stringify(constraints, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `constraint-rules-${new Date().toISOString().split('T')[0]}.json`;
    };
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
};
const handleImportConstraints = (event) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedConstraints = JSON.parse(e.target?.result);
                if (Array.isArray(importedConstraints)) {
                    setConstraints(importedConstraints);
                    onConstraintsChange?.(importedConstraints);
                }
                try { }
                catch (error) {
                    alert('Error importing constraints: Invalid JSON format');
                }
                ;
                reader.readAsText(file);
            }
            finally { }
            ;
            const filteredConstraints = constraints.filter(constraint => { });
            if (filterCategory !== 'all' && constraint.rule !== filterCategory)
                return false;
            if (filterEnforcement !== 'all' && constraint.enforcement !== filterEnforcement)
                return false;
            return true;
        };
        ;
        const _____getEnforcementIcon = (enforcement) => {
            switch (enforcement) {
                case 'strict': return _jsx(AlertTriangle, { size: 16, className: "text-red-500" });
                case 'warning': return _jsx(Info, { size: 16, className: "text-yellow-500" });
                case 'suggestion': return _jsx(CheckCircle, { size: 16, className: "text-green-500" });
                default: return _jsx(Settings, { size: 16 });
            }
            ;
            return;
            _jsxs("div", { className: "constraint-rule-manager", children: [_jsxs("div", { className: "rule-manager-header", children: [_jsx("h2", { children: "Constraint Rule Management" }), _jsxs("div", { className: "header-actions", children: [_jsxs("button", { className: "export-btn", onClick: handleExportConstraints, title: "Export constraints", children: [_jsx(Download, { size: 16 }), "Export"] }), _jsxs("label", { className: "import-btn", title: "Import constraints", children: [_jsx(Upload, { size: 16 }), "Import", _jsx("input", { type: "file", accept: ".json", onChange: handleImportConstraints, style: { display: 'none' } })] }), _jsxs("button", { className: "create-btn", onClick: handleCreateConstraint, children: [_jsx(Plus, { size: 16 }), "New Rule"] }), _jsx("button", { className: "close-btn", onClick: onClose, children: _jsx(X, { size: 16 }) })] })] }), _jsxs("div", { className: "rule-manager-filters", children: [_jsxs("div", { className: "filter-group", children: [_jsx("label", { children: "Category:" }), _jsxs("select", { value: filterCategory, onChange: (e) => setFilterCategory(e.target.value), children: [_jsx("option", { value: "all", children: "All Categories" }), _jsx("option", { value: "era_compatibility", children: "Era Compatibility" }), _jsx("option", { value: "social_class_appropriateness", children: "Social Class" }), _jsx("option", { value: "material_availability", children: "Material Availability" }), _jsx("option", { value: "cultural_appropriateness", children: "Cultural Sensitivity" }), _jsx("option", { value: "temporal_consistency", children: "Temporal Consistency" }), _jsx("option", { value: "regional_authenticity", children: "Regional Authenticity" })] })] }), _jsxs("div", { className: "filter-group", children: [_jsx("label", { children: "Enforcement:" }), _jsxs("select", { value: filterEnforcement, onChange: (e) => setFilterEnforcement(e.target.value), children: [_jsx("option", { value: "all", children: "All Levels" }), _jsx("option", { value: "strict", children: "Strict" }), _jsx("option", { value: "warning", children: "Warning" }), _jsx("option", { value: "suggestion", children: "Suggestion" })] })] })] }), _jsxs("div", { className: "constraints-list", children: [filteredConstraints.map(constraint => ()
                                < ConstraintRuleItem, key = { constraint, : .id }, constraint = { constraint }, onEdit = { handleEditConstraint }, onDelete = { handleDeleteConstraint }
                                /  >
                            ), ")}", filteredConstraints.length === 0 && ()
                                < div, " className=\"no-constraints\">", _jsx(Info, { size: 24 }), _jsx("p", { children: "No constraints match the current filters." })] }), ")}"] });
            {
                editingConstraint && ()
                    < ConstraintEditor;
                constraint = { editingConstraint };
                isCreating = { isCreating };
                onChange = { setEditingConstraint };
                onSave = { handleSaveConstraint };
                onCancel = { handleCancelEdit }
                    /  >
                ;
            }
        };
    }
};
div >
;
;
;
{
    const getEnforcementIcon = (enforcement) => {
        switch (enforcement) {
            case 'strict': return _jsx(AlertTriangle, { size: 14, className: "text-red-500" });
            case 'warning': return _jsx(Info, { size: 14, className: "text-yellow-500" });
            case 'suggestion': return _jsx(CheckCircle, { size: 14, className: "text-green-500" });
            default: return _jsx(Settings, { size: 14 });
        }
        ;
        return;
        _jsxs("div", { className: "constraint-rule-item", children: [_jsxs("div", { className: "rule-header", children: [_jsxs("div", { className: "rule-title", children: [getEnforcementIcon(constraint.enforcement), _jsx("span", { className: "rule-name", children: constraint.message }), _jsx("span", { className: "rule-type", children: constraint.rule })] }), _jsxs("div", { className: "rule-actions", children: [_jsx("button", { className: "edit-btn", onClick: () => onEdit(constraint), title: "Edit constraint", children: _jsx(Edit3, { size: 14 }) }), _jsx("button", { className: "delete-btn", onClick: () => onDelete(constraint.id), title: "Delete constraint", children: _jsx(Trash2, { size: 14 }) })] })] }), _jsxs("div", { className: "rule-details", children: [_jsx("div", { className: "rule-description", children: constraint.description }), constraint.historical_basis && ()
                            < div, " className=\"historical-basis\">", _jsx("strong", { children: "Historical Basis:" }), " ", constraint.historical_basis] }), ")}", _jsxs("div", { className: "rule-scope", children: [_jsxs("span", { children: ["Eras: ", constraint.eras.map(era => era.name).join(', ')] }), constraint.regions && ()
                            < span > Regions, ": ", constraint.regions.join(', ')] }), ")}", constraint.social_classes && ()
                    < span > Classes, ": ", constraint.social_classes.join(', ')] });
    };
}
div >
;
div >
;
div >
;
;
;
{
    const updateConstraint = (updates) => {
        onChange({ ...constraint, ...updates });
    };
    const handleEraChange = (eraName, selected) => {
        const era = Object.values(HISTORICAL_ERAS).find(e => e.name === eraName);
        if (!era)
            return;
        const updatedEras = selected;
    };
    [...constraint.eras, era];
    constraint.eras.filter(e => e.name !== eraName);
    updateConstraint({ eras: updatedEras });
}
;
const handleSocialClassChange = (className, selected) => {
    const current = constraint.social_classes || [];
    const updated = selected;
};
[...current, className];
current.filter(c => c !== className);
updateConstraint({ social_classes: updated.length > 0 ? updated : undefined });
;
return;
_jsx("div", { className: "constraint-editor-overlay", children: _jsxs("div", { className: "constraint-editor", children: [_jsxs("div", { className: "editor-header", children: [_jsx("h3", { children: isCreating ? 'Create New Constraint' : 'Edit Constraint' }), _jsxs("div", { className: "editor-actions", children: [_jsxs("button", { className: "save-btn", onClick: onSave, children: [_jsx(Save, { size: 16 }), "Save"] }), _jsxs("button", { className: "cancel-btn", onClick: onCancel, children: [_jsx(X, { size: 16 }), "Cancel"] })] })] }), _jsxs("div", { className: "editor-content", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Rule Type:" }), _jsxs("select", { value: constraint.rule, onChange: (e) => updateConstraint({ rule: e.target.value }), children: [_jsx("option", { value: "era_compatibility", children: "Era Compatibility" }), _jsx("option", { value: "social_class_appropriateness", children: "Social Class Appropriateness" }), _jsx("option", { value: "material_availability", children: "Material Availability" }), _jsx("option", { value: "cultural_appropriateness", children: "Cultural Appropriateness" }), _jsx("option", { value: "temporal_consistency", children: "Temporal Consistency" }), _jsx("option", { value: "regional_authenticity", children: "Regional Authenticity" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Enforcement Level:" }), _jsxs("select", { value: constraint.enforcement, onChange: (e) => updateConstraint({ enforcement: e.target.value }), children: [_jsx("option", { value: "strict", children: "Strict (Violations)" }), _jsx("option", { value: "warning", children: "Warning (Warnings)" }), _jsx("option", { value: "suggestion", children: "Suggestion (Suggestions)" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Message:" }), _jsx("input", { type: "text", value: constraint.message, onChange: (e) => updateConstraint({ message: e.target.value }), placeholder: "Brief description of the constraint" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Description:" }), _jsx("textarea", { value: constraint.description || '', onChange: (e) => updateConstraint({ description: e.target.value }), placeholder: "Detailed description of what this constraint checks", rows: 3 })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Historical Basis:" }), _jsx("textarea", { value: constraint.historical_basis || '', onChange: (e) => updateConstraint({ historical_basis: e.target.value }), placeholder: "Historical justification for this constraint", rows: 3 })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Applicable Eras:" }), _jsx("div", { className: "checkbox-grid", children: Object.values(HISTORICAL_ERAS).map(era => ()
                                    < label, key = { era, : .name }, className = "checkbox-item" >
                                    _jsx("input", { type: "checkbox", checked: constraint.eras.some(e => e.name === era.name), onChange: (e) => handleEraChange(era.name, e.target.checked) }), { era, : .name }) }), "))}"] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Regions (optional):" }), _jsx("input", { type: "text", value: constraint.regions?.join(', ') || '', onChange: (e) => updateConstraint({}), "regions:e": true }), ".target.value ? e.target.value.split(',').map(r => r.trim()) : undefined })} placeholder=\"Comma-separated list of regions (e.g., Europe, Asia, Africa)\" />"] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Social Classes (optional):" }), _jsx("div", { className: "checkbox-grid", children: ['peasant', 'artisan', 'merchant', 'noble', 'clergy', 'royal'].map(socialClass => ()
                            < label, key = { socialClass }, className = "checkbox-item" >
                            _jsx("input", { type: "checkbox", checked: constraint.social_classes?.includes(socialClass) || false, onChange: (e) => handleSocialClassChange(socialClass, e.target.checked) }), { socialClass, : .charAt(0).toUpperCase() + socialClass.slice(1) }) }), "))}"] })] }) });
div >
;
div >
;
;
;
// Helper function to get default constraints for demo
function getDefaultConstraints() {
    return [
        {
            id: 'medieval-modern-separation',
            rule: 'era_compatibility',
            eras: [HISTORICAL_ERAS.MEDIEVAL_HIGH, HISTORICAL_ERAS.MEDIEVAL_LATE],
            enforcement: 'strict',
            message: 'Medieval and modern items should not be mixed',
            description: 'Prevents inappropriate mixing of medieval and modern elements',
            historical_basis: 'Medieval technology and materials were fundamentally different from modern equivalents'
        },
        { id: 'silk-availability-medieval',
            rule: 'material_availability',
            eras: [HISTORICAL_ERAS.MEDIEVAL_EARLY],
            regions: ['Northern Europe'],
            enforcement: 'warning',
            message: 'Silk was extremely rare in early medieval Northern Europe',
            description: 'Warns when silk is used in contexts where it would have been extremely expensive or unavailable',
            historical_basis: 'Silk trade routes were disrupted and silk was primarily available to royalty and high clergy' },
        { id: 'social-class-clothing',
            rule: 'social_class_appropriateness',
            eras: [HISTORICAL_ERAS.MEDIEVAL_HIGH, HISTORICAL_ERAS.MEDIEVAL_LATE],
            social_classes: ['peasant'],
            enforcement: 'warning',
            message: 'Elaborate clothing inappropriate for peasant social class',
            description: 'Ensures clothing matches the economic and legal constraints of social classes' },
        historical_basis, 'Sumptuary laws regulated clothing by social class in medieval Europe'
    ];
    export default ConstraintRuleManager;
}
