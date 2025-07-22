import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const GRAMMATICAL_NUMBERS = [
    { value: 'singular', label: 'Singular' },
    { value: 'plural', label: 'Plural' },
    { value: 'both', label: 'Both (auto-detect)' }
];
const GRAMMATICAL_PERSONS = [
    { value: 'first', label: 'First person (I, we)' },
    { value: 'second', label: 'Second person (you)' },
    { value: 'third', label: 'Third person (he, she, it, they)' },
    { value: 'any', label: 'Any person' }
];
const SUBJECT_CATEGORIES = [
    { value: 'person', label: 'Person/People', group: 'Animate' },
    { value: 'animal', label: 'Animal', group: 'Animate' },
    { value: 'character', label: 'Character/Role', group: 'Animate' },
    { value: 'object', label: 'Object/Thing', group: 'Inanimate' },
    { value: 'concept', label: 'Concept/Idea', group: 'Abstract' },
    { value: 'place', label: 'Place/Location', group: 'Abstract' },
    { value: 'organization', label: 'Organization', group: 'Abstract' },
    { value: 'other', label: 'Other', group: 'Misc' }
];
export 
// Subject specific fields
const label = nodeData.label || '';
const template = nodeData.template || '';
const variations = nodeData.variations || [];
const grammaticalNumber = nodeData.grammaticalNumber || 'both';
const grammaticalPerson = nodeData.grammaticalPerson || 'any';
const category = nodeData.category || 'person';
const allowPronouns = nodeData.allowPronouns ?? true;
const pronouns = nodeData.pronouns || [];
const contextHints = nodeData.contextHints || [];
// No state needed - ProgressiveDisclosureSection handles collapse state automatically
const handleFieldChange = (field, value) => {
    onChange({ [field]: value });
};
const handleVariationsChange = (newVariations) => {
    handleFieldChange('variations', newVariations);
};
const handlePronounsChange = (newPronouns) => {
    handleFieldChange('pronouns', newPronouns);
};
const handleContextHintsChange = (newHints) => {
    handleFieldChange('contextHints', newHints);
};
// Auto-generate pronouns based on category and person
const generatePronouns = () => {
    const generated = [];
    if (grammaticalPerson === 'first' || grammaticalPerson === 'any') {
        generated.push('I', 'me', 'my', 'mine');
        if (grammaticalNumber === 'plural' || grammaticalNumber === 'both') {
            generated.push('we', 'us', 'our', 'ours');
        }
    }
    if (grammaticalPerson === 'second' || grammaticalPerson === 'any') {
        generated.push('you', 'your', 'yours');
    }
    if (grammaticalPerson === 'third' || grammaticalPerson === 'any') {
        if (category === 'person') {
            generated.push('he', 'him', 'his', 'she', 'her', 'hers');
        }
        if (category === 'object' || category === 'concept' || category === 'place') {
            generated.push('it', 'its');
        }
        if (grammaticalNumber === 'plural' || grammaticalNumber === 'both') {
            generated.push('they', 'them', 'their', 'theirs');
        }
    }
    handlePronounsChange([...new Set(generated)]);
};
return (_jsxs("div", { className: "subject-editor", children: [_jsxs(ProgressiveDisclosureSection, { title: "Essential Settings", level: "basic", description: "Core subject configuration and categorization", defaultExpanded: true, priority: "critical", fieldName: "label", children: [_jsx(TextFieldEditor, { label: "Subject Name", value: label, fieldKey: "label", zodType: null, onChange: (value) => handleFieldChange('label', value), placeholder: "Enter a name for this subject node..." }), _jsx(SelectEditor, { label: "Subject Category", value: category, fieldKey: "category", options: SUBJECT_CATEGORIES, zodType: null, onChange: (value) => handleFieldChange('category', value) })] }), _jsx(ProgressiveDisclosureSection, { title: "Subject Template", level: "basic", description: "Natural language template for dynamic subject generation", defaultExpanded: true, priority: "critical", fieldName: "template", children: _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: {
                            display: 'block',
                            fontSize: 12,
                            fontWeight: 500,
                            color: '#e2e8f0',
                            marginBottom: 6
                        }, children: "Subject Template (optional)" }), _jsx(TemplateEditor, { value: template, onChange: (value) => handleFieldChange('template', value), onVariablesChange: (variables, extractedVariables) => {
                            // Store extracted variables for potential use in graph execution
                            handleFieldChange('extractedVariables', extractedVariables || []);
                        }, placeholder: "Enter natural language template like 'A {creature} in the {setting}' or use the variations list below...", showPreview: true, showRealTimePreview: false, autoComplete: true, nodeType: "subject" }), _jsxs("div", { style: {
                            fontSize: 10,
                            color: '#a0aec0',
                            marginTop: 4,
                            lineHeight: 1.4
                        }, children: ["Use ", '{variable}', " syntax for dynamic subjects. Variables will appear as connection ports.", _jsx("br", {}), "Examples: \"A ", creature, " in the ", setting, "\", \"The ", character, " who ", description, "\", \"", adjective, " ", noun, "\""] })] }) }), _jsx(ProgressiveDisclosureSection, { title: "Subject Variations", level: "basic", description: "Add different forms and variations of the subject", defaultExpanded: false, priority: "important", fieldName: "variations", children: _jsxs("div", { style: { marginBottom: 12 }, children: [_jsx("label", { style: {
                            display: 'block',
                            fontWeight: 500,
                            marginBottom: 8,
                            color: '#e2e8f0',
                            fontSize: 12
                        }, children: "Subject Forms" }), _jsx(VariationList, { nodeId: nodeData.id, variations: variations, onAdd: (variation) => handleVariationsChange([...variations, variation]), onRemove: (index) => {
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
                        }, placeholder: "Enter subject form (e.g., 'the cat', 'John', 'my friend')...", maxVariations: 30, allowQuickEntry: true }), _jsx("div", { style: {
                            fontSize: 10,
                            color: '#a0aec0',
                            marginTop: 4,
                            lineHeight: 1.4
                        }, children: "Include different forms: definite (\"the cat\"), indefinite (\"a cat\"), proper nouns (\"Fluffy\"), etc." })] }) }), _jsxs(ProgressiveDisclosureSection, { title: "Grammatical Properties", level: "advanced", description: "Control grammatical number and person for subject-verb agreement", defaultExpanded: false, priority: "important", fieldName: "grammaticalNumber", children: [_jsx(SelectEditor, { label: "Grammatical Number", value: grammaticalNumber, fieldKey: "grammaticalNumber", options: GRAMMATICAL_NUMBERS, zodType: null, onChange: (value) => handleFieldChange('grammaticalNumber', value) }), _jsx(SelectEditor, { label: "Grammatical Person", value: grammaticalPerson, fieldKey: "grammaticalPerson", options: GRAMMATICAL_PERSONS, zodType: null, onChange: (value) => handleFieldChange('grammaticalPerson', value) })] }), _jsx(ProgressiveDisclosureSection, { title: "Pronouns", level: "advanced", description: "Configure pronoun substitution and available pronoun forms", defaultExpanded: false, priority: "standard", fieldName: "pronouns", children: _jsxs("div", { style: { marginBottom: 16 }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 8
                        }, children: [_jsxs("label", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    fontSize: 12,
                                    color: '#e2e8f0',
                                    cursor: 'pointer'
                                }, children: [_jsx("input", { type: "checkbox", checked: allowPronouns, onChange: (e) => handleFieldChange('allowPronouns', e.target.checked), style: {
                                            width: 14,
                                            height: 14,
                                            cursor: 'pointer'
                                        } }), "Allow pronoun substitution"] }), _jsx("button", { onClick: generatePronouns, disabled: !allowPronouns, style: {
                                    padding: '4px 8px',
                                    fontSize: 10,
                                    background: allowPronouns ? '#4299e1' : '#4a5568',
                                    border: 'none',
                                    borderRadius: 2,
                                    color: 'white',
                                    cursor: allowPronouns ? 'pointer' : 'not-allowed'
                                }, children: "Auto-Generate" })] }), allowPronouns && (_jsx(VariationList, { nodeId: `${nodeData.id}-pronouns`, variations: pronouns, onAdd: (pronoun) => handlePronounsChange([...pronouns, pronoun]), onRemove: (index) => {
                            const newPronouns = pronouns.filter((_, i) => i !== index);
                            handlePronounsChange(newPronouns);
                        }, onUpdate: (index, newValue) => {
                            const newPronouns = [...pronouns];
                            newPronouns[index] = newValue;
                            handlePronounsChange(newPronouns);
                        }, onReorder: (fromIndex, toIndex) => {
                            const newPronouns = [...pronouns];
                            const [movedItem] = newPronouns.splice(fromIndex, 1);
                            newPronouns.splice(toIndex, 0, movedItem);
                            handlePronounsChange(newPronouns);
                        }, placeholder: "Enter pronoun (e.g., 'he', 'she', 'it', 'they')...", maxVariations: 10, allowQuickEntry: true }))] }) }), _jsx(ProgressiveDisclosureSection, { title: "Context Hints", level: "advanced", description: "Semantic hints to help with grammatical agreement and context understanding", defaultExpanded: false, priority: "standard", fieldName: "contextHints", children: _jsxs("div", { style: { marginBottom: 12 }, children: [_jsx("label", { style: {
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
                        }, placeholder: "Enter context hint (e.g., 'animal', 'friendly', 'small')...", maxVariations: 15, allowQuickEntry: true }), _jsx("div", { style: {
                            fontSize: 10,
                            color: '#a0aec0',
                            marginTop: 4,
                            lineHeight: 1.4
                        }, children: "Hints help other nodes determine correct verb forms, adjective agreement, etc." })] }) }), _jsx(ProgressiveDisclosureSection, { title: "Configuration Preview", level: "debug", description: "Preview of subject configuration and debugging information", defaultExpanded: false, priority: "standard", fieldName: "preview", children: _jsxs("div", { style: {
                    background: '#1a202c',
                    border: '1px solid #4a5568',
                    borderRadius: 4,
                    padding: 12,
                    fontSize: 12,
                    color: '#e2e8f0'
                }, children: [_jsx("div", { style: { marginBottom: 8, fontWeight: 500 }, children: "Subject Configuration:" }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: '#a0aec0' }, children: "Category:" }), " ", SUBJECT_CATEGORIES.find(c => c.value === category)?.label] }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: '#a0aec0' }, children: "Number:" }), " ", GRAMMATICAL_NUMBERS.find(n => n.value === grammaticalNumber)?.label] }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: '#a0aec0' }, children: "Person:" }), " ", GRAMMATICAL_PERSONS.find(p => p.value === grammaticalPerson)?.label] }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: '#a0aec0' }, children: "Pronouns:" }), " ", allowPronouns ? 'Enabled' : 'Disabled'] }), variations.length > 0 && (_jsxs("div", { style: {
                            marginTop: 8,
                            padding: 8,
                            background: 'rgba(66, 153, 225, 0.1)',
                            borderRadius: 2
                        }, children: [_jsxs("div", { style: { color: '#a0aec0', fontSize: 10, marginBottom: 4 }, children: ["Subject forms (", variations.length, "):"] }), _jsxs("div", { style: { fontSize: 11 }, children: [variations.slice(0, 3).map((variation, index) => (_jsxs("div", { style: { marginBottom: 2 }, children: ["\"", variation, "\""] }, index))), variations.length > 3 && (_jsxs("div", { style: { color: '#a0aec0', fontStyle: 'italic' }, children: ["... and ", variations.length - 3, " more"] }))] })] })), allowPronouns && pronouns.length > 0 && (_jsxs("div", { style: {
                            marginTop: 8,
                            padding: 8,
                            background: 'rgba(34, 197, 94, 0.1)',
                            borderRadius: 2
                        }, children: [_jsx("div", { style: { color: '#a0aec0', fontSize: 10, marginBottom: 4 }, children: "Available pronouns:" }), _jsx("div", { style: { fontSize: 11 }, children: pronouns.join(', ') })] }))] }) })] }));
;
