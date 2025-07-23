import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from 'react';
import { useWeightControlIntegration } from '../WeightControlSlider';
import { useRealTimePreview } from '../../../hooks/useRealTimePreview';
import { useUISettingsStore } from '../../../stores/uiSettingsStore';
import { useGraphStore } from '../../../graphStore';
export const WeightedChoiceEditor = ({ nodeData, onChange, errors, onGlobalPreviewRequest }) => {
    // WeightedChoice specific fields
    const choices = nodeData.choices || [];
    const weights = nodeData.weights || [];
    const name = nodeData.name || nodeData.label || 'WeightedChoice';
    // UI settings
    const { complexityLevel, shouldShowTechnicalFields } = useUISettingsStore();
    // Global graph state for triggering full preview
    const { nodes, edges } = useGraphStore();
    // Convert choices and weights to WeightControlOptions
    const weightOptions = choices.map((choice, index) => ({
        id: `choice_${index}`,
        text: choice,
        weight: weights[index] || 1
    }));
    // Real-time preview integration
    const { variants, isGenerating, performance, error, requestPreview, forcePreview, refreshVariant, clearVariants, getPerformanceInsights } = useRealTimePreview(name || 'WeightedChoice Result: {weighted_choice}', {}, {
        maxVariants: 5,
        debounceMs: 300,
        enablePerformanceTracking: complexityLevel !== 'basic'
    });
    // Weight control integration with global preview support
    const handleGlobalPreviewRequest = useCallback((weightOptions) => {
        console.log('[Epic 8.5-5] Weight change triggering global preview with', weightOptions.length, 'options');
        // Update the node data first
        const newChoices = weightOptions.map(option => option.text);
        const newWeights = weightOptions.map(option => option.weight);
        onChange({
            choices: newChoices,
            weights: newWeights
        });
        // Trigger global preview with updated graph after a short delay
        setTimeout(() => {
            onGlobalPreviewRequest?.();
        }, 50); // Short delay to ensure state updates
        // Keep local preview for immediate feedback
        requestPreview(weightOptions);
    }, [onChange, onGlobalPreviewRequest, requestPreview]);
    // Weight control integration
    const { handleOptionsChange } = useWeightControlIntegration(weightOptions, handleGlobalPreviewRequest);
    const handleChoicesChange = (newChoices) => {
        onChange({
            choices: newChoices,
            // Ensure weights array matches choices length
            weights: newChoices.map((_, index) => weights[index] || 1)
        });
    };
    newWeights[index] = Math.max(0, weight); // Ensure non-negative weights
    onChange({ weights: newWeights });
};
const handleNameChange = (value) => {
    onChange({ name: value, label: value });
};
return (_jsxs("div", { className: "weighted-choice-editor", children: [_jsx(ProgressiveDisclosureSection, { title: "Essential Settings", level: "basic", description: "Core node configuration for weighted choices", defaultExpanded: true, priority: "critical", fieldName: "name", children: _jsx(TextFieldEditor, { label: "Choice Name", value: name, fieldKey: "name", zodType: null, onChange: handleNameChange, placeholder: "Enter a name for this weighted choice node..." }) }), _jsx(ProgressiveDisclosureSection, { title: "Choice Options", level: "basic", description: "Add and manage the available choices for random selection", defaultExpanded: true, priority: "critical", fieldName: "choices", children: _jsxs("div", { style: { marginBottom: 12 }, children: [_jsx("label", { style: {
                            display: 'block',
                            fontWeight: 500,
                            marginBottom: 8,
                            color: '#e2e8f0',
                            fontSize: 12
                        }, children: "Available Choices" }), _jsx(VariationList, { nodeId: nodeData.id, variations: choices, onAdd: (choice) => handleChoicesChange([...choices, choice]), onRemove: (index) => {
                            const newChoices = choices.filter((_, i) => i !== index);
                            handleChoicesChange(newChoices);
                        }, onUpdate: (index, newValue) => {
                            const newChoices = [...choices];
                            newChoices[index] = newValue;
                            handleChoicesChange(newChoices);
                        }, onReorder: (fromIndex, toIndex) => {
                            const newChoices = [...choices];
                            const [movedItem] = newChoices.splice(fromIndex, 1);
                            newChoices.splice(toIndex, 0, movedItem);
                            handleChoicesChange(newChoices);
                        }, placeholder: "Enter choice option...", maxVariations: 20, allowQuickEntry: true })] }) }), choices.length > 0 && (_jsxs(ProgressiveDisclosureSection, { title: "Weight Controls", level: "advanced", description: "Fine-tune the probability of each choice being selected", defaultExpanded: false, priority: "important", fieldName: "weights", children: [_jsx(WeightControlSlider, { options: weightOptions, onOptionsChange: handleOptionsChange, onPreviewRequest: handleGlobalPreviewRequest, showPreview: true, previewDebounceMs: 300, showPresets: true, allowCustomPresets: complexityLevel !== 'basic' }), complexityLevel !== 'basic' && (_jsxs("div", { style: {
                        marginTop: 12,
                        padding: 8,
                        background: 'rgba(77, 124, 255, 0.1)',
                        border: '1px solid rgba(77, 124, 255, 0.2)',
                        borderRadius: 4,
                        fontSize: 11,
                        color: '#4d7cff'
                    }, children: ["\uD83C\uDFAC ", _jsx("strong", { children: "Epic 8.5 Real-Time Integration:" }), " Weight changes automatically trigger 5-seed preview generation for film industry demo quality."] }))] })), choices.length > 0 && weightOptions.length > 0 && (_jsx(ProgressiveDisclosureSection, { title: "Weight Distribution Visualization", level: "advanced", description: "Visual representation of choice probabilities and statistics", defaultExpanded: false, priority: "standard", fieldName: "visualization", children: _jsx(WeightVisualizationPanel, { options: weightOptions, title: "Weight Distribution", defaultChartType: "pie", showChartControls: true, showStatistics: true, collapsed: false, onCollapseChange: () => { }, onOptionHover: (option) => {
                    // Optional: Could highlight the option in the weight controls
                    console.log('Hovered option:', option?.text);
                }, onOptionClick: (option) => {
                    // Optional: Could focus the weight slider for this option
                    console.log('Clicked option:', option.text);
                }, style: { marginBottom: 16 } }) })), variants.length > 0 && (_jsx(ProgressiveDisclosureSection, { title: "Real-Time Preview", level: "advanced", description: "Live preview of weighted choice results with performance metrics", defaultExpanded: false, priority: "standard", fieldName: "preview", children: _jsxs("div", { style: { marginBottom: 12 }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 8
                        }, children: [_jsxs("div", { style: { fontSize: 12, fontWeight: 500, color: '#e2e8f0' }, children: ["Live Results ", isGenerating && '⚡'] }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { onClick: () => forcePreview(weightOptions), disabled: isGenerating, style: {
                                            padding: '2px 6px',
                                            fontSize: 10,
                                            background: '#4a5568',
                                            border: 'none',
                                            borderRadius: 2,
                                            color: '#e2e8f0',
                                            cursor: isGenerating ? 'wait' : 'pointer',
                                            opacity: isGenerating ? 0.6 : 1
                                        }, children: "\uD83D\uDD04 Refresh" }), _jsx("button", { onClick: clearVariants, style: {
                                            padding: '2px 6px',
                                            fontSize: 10,
                                            background: '#4a5568',
                                            border: 'none',
                                            borderRadius: 2,
                                            color: '#e2e8f0',
                                            cursor: 'pointer'
                                        }, children: "\uD83D\uDDD1\uFE0F Clear" })] })] }), error && (_jsxs("div", { style: {
                            padding: 8,
                            background: '#fed7d7',
                            color: '#c53030',
                            borderRadius: 4,
                            fontSize: 12,
                            marginBottom: 8
                        }, children: ["Error: ", error] })), _jsx("div", { style: {
                            background: '#1a202c',
                            border: '1px solid #4a5568',
                            borderRadius: 6,
                            padding: 12
                        }, children: variants.map((variant, index) => (_jsxs("div", { style: {
                                marginBottom: index < variants.length - 1 ? 12 : 0,
                                padding: 8,
                                background: '#2d3748',
                                borderRadius: 4
                            }, children: [_jsxs("div", { style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 4
                                    }, children: [_jsxs("div", { style: {
                                                fontSize: 10,
                                                color: '#a0aec0'
                                            }, children: ["Variant ", index + 1, " \u2022 Seed ", variant.seed] }), _jsx("button", { onClick: () => refreshVariant(variant.id), style: {
                                                padding: '1px 4px',
                                                fontSize: 9,
                                                background: 'none',
                                                border: '1px solid #4a5568',
                                                borderRadius: 2,
                                                color: '#a0aec0',
                                                cursor: 'pointer'
                                            }, children: "\uD83D\uDD04" })] }), _jsxs("div", { style: {
                                        color: '#e2e8f0',
                                        fontSize: 12,
                                        lineHeight: 1.4
                                    }, children: ["\"", variant.result, "\""] })] }, variant.id))) }), shouldShowTechnicalFields() && (_jsxs("div", { style: {
                            marginTop: 12,
                            padding: 8,
                            background: '#2d3748',
                            borderRadius: 4,
                            fontSize: 10,
                            color: '#a0aec0'
                        }, children: [_jsx("div", { style: { marginBottom: 4, fontWeight: 500 }, children: "Performance:" }), _jsxs("div", { children: ["Avg. time: ", performance.averageExecutionTime.toFixed(0), "ms"] }), _jsxs("div", { children: ["Generations: ", performance.totalGenerations] }), _jsxs("div", { children: ["Success rate: ", performance.successRate.toFixed(1), "%"] }), getPerformanceInsights().length > 0 && (_jsx("div", { style: { marginTop: 4 }, children: getPerformanceInsights().join(' • ') }))] }))] }) })), complexityLevel === 'basic' && variants.length === 0 && (_jsx(ProgressiveDisclosureSection, { title: "Choice Preview", level: "basic", description: "Preview of how weighted choices will behave", defaultExpanded: false, priority: "standard", fieldName: "basicPreview", children: _jsx("div", { style: {
                    background: '#1a202c',
                    border: '1px solid #4a5568',
                    borderRadius: 4,
                    padding: 12,
                    fontSize: 12,
                    color: '#e2e8f0'
                }, children: choices.length === 0 ? (_jsx("div", { style: { color: '#a0aec0', fontStyle: 'italic' }, children: "Add choices to see preview" })) : (_jsxs("div", { children: [_jsx("div", { style: { marginBottom: 8, fontWeight: 500 }, children: "This node will randomly select one of:" }), choices.map((choice, index) => {
                            const weight = weights[index] || 1;
                            const percentage = weights.length > 0
                                ? Math.round((weight / weights.reduce((sum, w) => sum + w, 0)) * 100)
                                : Math.round(100 / choices.length);
                            return (_jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: 4,
                                    padding: '2px 4px',
                                    background: 'rgba(66, 153, 225, 0.1)',
                                    borderRadius: 2
                                }, children: [_jsxs("span", { children: ["\"", choice, "\""] }), _jsxs("span", { style: { color: '#a0aec0' }, children: [percentage, "% chance"] })] }, index));
                        })] })) }) }))] }));
;
export default WeightedChoiceEditor;
