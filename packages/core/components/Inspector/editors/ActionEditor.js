import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TextFieldEditor } from '../TextFieldEditor.js';
import { SelectEditor } from '../SelectEditor.js';
import { VariationList } from '../VariationList.js';
import { ProgressiveDisclosureSection } from '../ProgressiveDisclosureSection.js';
import { TemplateEditor } from '../TemplateEditor.js';
const VERB_TENSES = [
    { value: 'present', label: 'Present (walk, walks)' },
    { value: 'past', label: 'Past (walked)' },
    { value: 'future', label: 'Future (will walk)' },
    { value: 'present_continuous', label: 'Present Continuous (walking)' },
    { value: 'past_continuous', label: 'Past Continuous (was walking)' },
    { value: 'present_perfect', label: 'Present Perfect (has walked)' },
    { value: 'any', label: 'Any tense' }
];
const VERB_MOODS = [
    { value: 'indicative', label: 'Indicative (statement)' },
    { value: 'imperative', label: 'Imperative (command)' },
    { value: 'subjunctive', label: 'Subjunctive (wish/hypothetical)' },
    { value: 'conditional', label: 'Conditional (would/could)' },
    { value: 'any', label: 'Any mood' }
];
const ACTION_TYPES = [
    { value: 'physical', label: 'Physical Action', group: 'Action Types' },
    { value: 'mental', label: 'Mental Action', group: 'Action Types' },
    { value: 'verbal', label: 'Verbal Action', group: 'Action Types' },
    { value: 'emotional', label: 'Emotional Action', group: 'Action Types' },
    { value: 'social', label: 'Social Action', group: 'Action Types' },
    { value: 'creative', label: 'Creative Action', group: 'Action Types' },
    { value: 'transitive', label: 'Transitive (requires object)', group: 'Grammar' },
    { value: 'intransitive', label: 'Intransitive (no object)', group: 'Grammar' },
    { value: 'linking', label: 'Linking Verb (is, seems)', group: 'Grammar' }
];
export const ActionEditor = ({ _____nodeId, nodeData, onChange }) => {
    // Action specific fields
    const label = nodeData.label || '';
    const template = nodeData.template || '';
    const variations = nodeData.variations || [];
    const baseForm = nodeData.baseForm || '';
    const tense = nodeData.tense || 'present';
    const mood = nodeData.mood || 'indicative';
    const actionType = nodeData.actionType || 'physical';
    const intensity = nodeData.intensity || 5;
    const requiresObject = nodeData.requiresObject ?? false;
    const adverbVariations = nodeData.adverbVariations || [];
    const contextHints = nodeData.contextHints || [];
    // No state needed - ProgressiveDisclosureSection handles collapse state automatically
    const handleFieldChange = (field, value) => {
        onChange({ [field]: value });
    };
    const handleVariationsChange = (newVariations) => {
        handleFieldChange('variations', newVariations);
    };
    const handleAdverbVariationsChange = (newAdverbs) => {
        handleFieldChange('adverbVariations', newAdverbs);
    };
    const handleContextHintsChange = (newHints) => {
        handleFieldChange('contextHints', newHints);
    };
    // Auto-generate verb forms based on base form
    const generateVerbForms = () => {
        if (!baseForm.trim())
            return;
        const base = baseForm.trim().toLowerCase();
        const generated = [base];
        // Add basic conjugations (simplified)
        if (base.endsWith('e')) {
            generated.push(base + 'd'); // past: love -> loved
            generated.push(base.slice(0, -1) + 'ing'); // present continuous: love -> loving
        }
        else if (base.endsWith('y') && base.length > 1) {
            const consonantY = !'aeiou'.includes(base[base.length - 2]);
            if (consonantY) {
                generated.push(base.slice(0, -1) + 'ied'); // past: cry -> cried
                generated.push(base.slice(0, -1) + 'ies'); // 3rd person: cry -> cries
            }
            else {
                generated.push(base + 'ed'); // past: play -> played
            }
            generated.push(base + 'ing'); // present continuous
        }
        else {
            generated.push(base + 'ed'); // past: walk -> walked
            generated.push(base + 's'); // 3rd person: walk -> walks
            generated.push(base + 'ing'); // present continuous: walk -> walking
        }
        // Remove duplicates and update variations
        handleVariationsChange([...new Set([...variations, ...generated])]);
    };
    return (_jsxs("div", { className: "action-editor", children: [_jsxs(ProgressiveDisclosureSection, { title: "Essential Settings", level: "basic", description: "Core action configuration and verb type", defaultExpanded: true, priority: "critical", fieldName: "label", children: [_jsx(TextFieldEditor, { label: "Action Name", value: label, fieldKey: "label", zodType: null, onChange: (value) => handleFieldChange('label', value), placeholder: "Enter a name for this action node..." }), _jsxs("div", { style: { display: 'flex', gap: 8, alignItems: 'flex-end' }, children: [_jsx("div", { style: { flex: 1 }, children: _jsx(TextFieldEditor, { label: "Base Form", value: baseForm, fieldKey: "baseForm", zodType: null, onChange: (value) => handleFieldChange('baseForm', value), placeholder: "Enter base verb form (e.g., 'walk', 'run', 'think')..." }) }), _jsx("button", { onClick: generateVerbForms, disabled: !baseForm.trim(), style: {
                                    padding: '8px 12px',
                                    fontSize: 11,
                                    background: baseForm.trim() ? '#4299e1' : '#4a5568',
                                    border: 'none',
                                    borderRadius: 4,
                                    color: 'white',
                                    cursor: baseForm.trim() ? 'pointer' : 'not-allowed',
                                    marginBottom: 16,
                                    whiteSpace: 'nowrap'
                                }, children: "Generate Forms" })] }), _jsx(SelectEditor, { label: "Action Type", value: actionType, fieldKey: "actionType", options: ACTION_TYPES, zodType: null, onChange: (value) => handleFieldChange('actionType', value) })] }), _jsx(ProgressiveDisclosureSection, { title: "Action Template", level: "basic", description: "Natural language template for dynamic action generation", defaultExpanded: true, priority: "critical", fieldName: "template", children: _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: {
                                display: 'block',
                                fontSize: 12,
                                fontWeight: 500,
                                color: '#e2e8f0',
                                marginBottom: 6
                            }, children: "Action Template (optional)" }), _jsx(TemplateEditor, { value: template, onChange: (value) => handleFieldChange('template', value), onVariablesChange: (variables, extractedVariables) => {
                                // Store extracted variables for potential use in graph execution
                                handleFieldChange('extractedVariables', extractedVariables || []);
                            }, placeholder: "Enter action template like '{verb} {adverb} through the {location}' or use the verb forms below...", showPreview: true, showRealTimePreview: false, autoComplete: true, nodeType: "action" }), _jsxs("div", { style: {
                                fontSize: 10,
                                color: '#a0aec0',
                                marginTop: 4,
                                lineHeight: 1.4
                            }, children: ["Use ", '{variable}', " syntax for dynamic actions. Variables will appear as connection ports.", _jsx("br", {}), "Examples: \"", verb, " ", adverb, "\", \"", character, " ", action, " ", object, "\", \"suddenly ", movement, "\""] })] }) }), _jsx(ProgressiveDisclosureSection, { title: "Verb Forms", level: "basic", description: "Different forms and conjugations of the verb", defaultExpanded: false, priority: "important", fieldName: "variations", children: _jsxs("div", { style: { marginBottom: 12 }, children: [_jsx("label", { style: {
                                display: 'block',
                                fontWeight: 500,
                                marginBottom: 8,
                                color: '#e2e8f0',
                                fontSize: 12
                            }, children: "Verb Variations" }), _jsx(VariationList, { nodeId: nodeData.id, variations: variations, onAdd: (variation) => handleVariationsChange([...variations, variation]), onRemove: (index) => {
                                const newVariations = variations.filter((_, i) => i !== index);
                                handleVariationsChange(newVariations);
                            }, onUpdate: (index, newValue) => {
                                const newVariations = [...variations];
                                newVariations[index] = newValue;
                                handleVariationsChange(newVariations);
                            }, onReorder: (fromIndex, toIndex) => {
                                const newVariations = [...variations];
                                const [movedItem] = newVariations.splice(fromIndex, 1);
                                newVariations.splice(toIndex, 0, movedItem);
                                handleVariationsChange(newVariations);
                            }, placeholder: "Enter verb form (e.g., 'walks', 'walked', 'walking')...", maxVariations: 25, allowQuickEntry: true }), _jsx("div", { style: {
                                fontSize: 10,
                                color: '#a0aec0',
                                marginTop: 4,
                                lineHeight: 1.4
                            }, children: "Include different tenses, persons, and numbers: walk, walks, walked, walking, etc." })] }) }), _jsxs(ProgressiveDisclosureSection, { title: "Grammatical Properties", level: "advanced", description: "Control verb tense, mood, and grammatical properties", defaultExpanded: false, priority: "important", fieldName: "tense", children: [_jsx(SelectEditor, { label: "Primary Tense", value: tense, fieldKey: "tense", options: VERB_TENSES, zodType: null, onChange: (value) => handleFieldChange('tense', value) }), _jsx(SelectEditor, { label: "Mood", value: mood, fieldKey: "mood", options: VERB_MOODS, zodType: null, onChange: (value) => handleFieldChange('mood', value) }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsxs("label", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    fontSize: 12,
                                    color: '#e2e8f0',
                                    cursor: 'pointer'
                                }, children: [_jsx("input", { type: "checkbox", checked: requiresObject, onChange: (e) => handleFieldChange('requiresObject', e.target.checked), style: {
                                            width: 14,
                                            height: 14,
                                            cursor: 'pointer'
                                        } }), "Requires direct object (transitive)"] }), _jsx("div", { style: {
                                    fontSize: 10,
                                    color: '#a0aec0',
                                    marginTop: 2,
                                    marginLeft: 22
                                }, children: "E.g., \"eat\" requires an object (\"eat food\"), while \"sleep\" doesn't" })] })] }), _jsxs(ProgressiveDisclosureSection, { title: "Intensity & Modifiers", level: "advanced", description: "Control action intensity and adverb modifiers", defaultExpanded: false, priority: "standard", fieldName: "intensity", children: [_jsxs("div", { style: { marginBottom: 16 }, children: [_jsxs("label", { style: {
                                    display: 'block',
                                    fontWeight: 500,
                                    marginBottom: 8,
                                    color: '#e2e8f0',
                                    fontSize: 12
                                }, children: ["Intensity Level: ", intensity, "/10"] }), _jsx("input", { type: "range", min: "1", max: "10", value: intensity, onChange: (e) => handleFieldChange('intensity', parseInt(e.target.value)), style: {
                                    width: '100%',
                                    marginBottom: 4
                                } }), _jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: 10,
                                    color: '#a0aec0'
                                }, children: [_jsx("span", { children: "Gentle" }), _jsx("span", { children: "Moderate" }), _jsx("span", { children: "Intense" })] })] }), _jsxs("div", { style: { marginBottom: 12 }, children: [_jsx("label", { style: {
                                    display: 'block',
                                    fontWeight: 500,
                                    marginBottom: 8,
                                    color: '#e2e8f0',
                                    fontSize: 12
                                }, children: "Adverb Modifiers" }), _jsx(VariationList, { nodeId: `${nodeData.id}-adverbs`, variations: adverbVariations, onAdd: (adverb) => handleAdverbVariationsChange([...adverbVariations, adverb]), onRemove: (index) => {
                                    const newAdverbs = adverbVariations.filter((_, i) => i !== index);
                                    handleAdverbVariationsChange(newAdverbs);
                                }, onUpdate: (index, newValue) => {
                                    const newAdverbs = [...adverbVariations];
                                    newAdverbs[index] = newValue;
                                    handleAdverbVariationsChange(newAdverbs);
                                }, onReorder: (fromIndex, toIndex) => {
                                    const newAdverbs = [...adverbVariations];
                                    const [movedItem] = newAdverbs.splice(fromIndex, 1);
                                    newAdverbs.splice(toIndex, 0, movedItem);
                                    handleAdverbVariationsChange(newAdverbs);
                                }, placeholder: "Enter adverb (e.g., 'quickly', 'carefully', 'loudly')...", maxVariations: 20, allowQuickEntry: true }), _jsx("div", { style: {
                                    fontSize: 10,
                                    color: '#a0aec0',
                                    marginTop: 4,
                                    lineHeight: 1.4
                                }, children: "Adverbs that can be randomly selected to modify this action" })] })] }), _jsx(ProgressiveDisclosureSection, { title: "Context Hints", level: "advanced", description: "Semantic hints for context understanding and action requirements", defaultExpanded: false, priority: "standard", fieldName: "contextHints", children: _jsxs("div", { style: { marginBottom: 12 }, children: [_jsx("label", { style: {
                                display: 'block',
                                fontWeight: 500,
                                marginBottom: 8,
                                color: '#e2e8f0',
                                fontSize: 12
                            }, children: "Context Hints" }), _jsx(VariationList, { nodeId: `${nodeData.id}-context`, variations: contextHints, onAdd: (hint) => handleContextHintsChange([...contextHints, hint]), onRemove: (index) => {
                                const newHints = contextHints.filter((_, i) => i !== index);
                                handleContextHintsChange(newHints);
                            }, onUpdate: (index, newValue) => {
                                const newHints = [...contextHints];
                                newHints[index] = newValue;
                                handleContextHintsChange(newHints);
                            }, onReorder: (fromIndex, toIndex) => {
                                const newHints = [...contextHints];
                                const [movedItem] = newHints.splice(fromIndex, 1);
                                newHints.splice(toIndex, 0, movedItem);
                                handleContextHintsChange(newHints);
                            }, placeholder: "Enter context hint (e.g., 'outdoor', 'requires skill', 'quiet')...", maxVariations: 15, allowQuickEntry: true }), _jsx("div", { style: {
                                fontSize: 10,
                                color: '#a0aec0',
                                marginTop: 4,
                                lineHeight: 1.4
                            }, children: "Hints help other nodes understand the context and requirements of this action" })] }) }), _jsx(ProgressiveDisclosureSection, { title: "Configuration Preview", level: "debug", description: "Preview of action configuration and debugging information", defaultExpanded: false, priority: "standard", fieldName: "preview", children: _jsxs("div", { style: {
                        background: '#1a202c',
                        border: '1px solid #4a5568',
                        borderRadius: 4,
                        padding: 12,
                        fontSize: 12,
                        color: '#e2e8f0'
                    }, children: [_jsx("div", { style: { marginBottom: 8, fontWeight: 500 }, children: "Action Configuration:" }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: '#a0aec0' }, children: "Type:" }), " ", ACTION_TYPES.find(t => t.value === actionType)?.label] }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: '#a0aec0' }, children: "Tense:" }), " ", VERB_TENSES.find(t => t.value === tense)?.label] }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: '#a0aec0' }, children: "Mood:" }), " ", VERB_MOODS.find(m => m.value === mood)?.label] }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: '#a0aec0' }, children: "Intensity:" }), " ", intensity, "/10"] }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: '#a0aec0' }, children: "Requires Object:" }), " ", requiresObject ? 'Yes' : 'No'] }), variations.length > 0 && (_jsxs("div", { style: {
                                marginTop: 8,
                                padding: 8,
                                background: 'rgba(66, 153, 225, 0.1)',
                                borderRadius: 2
                            }, children: [_jsxs("div", { style: { color: '#a0aec0', fontSize: 10, marginBottom: 4 }, children: ["Verb forms (", variations.length, "):"] }), _jsxs("div", { style: { fontSize: 11 }, children: [variations.slice(0, 4).map((variation, index) => (_jsxs("span", { children: ["\"", variation, "\"", index < Math.min(3, variations.length - 1) ? ', ' : ''] }, index))), variations.length > 4 && (_jsxs("span", { style: { color: '#a0aec0', fontStyle: 'italic' }, children: ["... +", variations.length - 4, " more"] }))] })] })), adverbVariations.length > 0 && (_jsxs("div", { style: {
                                marginTop: 8,
                                padding: 8,
                                background: 'rgba(34, 197, 94, 0.1)',
                                borderRadius: 2
                            }, children: [_jsx("div", { style: { color: '#a0aec0', fontSize: 10, marginBottom: 4 }, children: "Available adverbs:" }), _jsxs("div", { style: { fontSize: 11 }, children: [adverbVariations.slice(0, 5).join(', '), adverbVariations.length > 5 && ` ... +${adverbVariations.length - 5} more`] })] }))] }) })] }));
};
export default ActionEditor;
