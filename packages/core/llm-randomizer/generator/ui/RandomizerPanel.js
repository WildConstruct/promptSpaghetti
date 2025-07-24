import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Epic 12 - LLM Agent Randomizer System
// Story 12.4 - Randomizer Generator Implementation
// Main randomizer panel with responsive design
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ParameterManager } from '../parameters/parameter-manager.js';
import { RandomizerWorkflow } from '../workflow/randomizer-workflow.js';
/**
 * Main randomizer panel component
 */
export const RandomizerPanel = ({ onGraphGenerated, onError, className = '', initialParameters = {} }) => {
    // State management
    const [parameters, setParameters] = useState(initialParameters);
    const [validation, setValidation] = useState({ isValid: true, errors: [], warnings: [] });
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState('');
    const [selectedPreset, setSelectedPreset] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showPresets, setShowPresets] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    // Managers
    const parameterManager = useMemo(() => new ParameterManager(), []);
    const workflow = useMemo(() => new RandomizerWorkflow(), []);
    // Get presets and history
    const presets = useMemo(() => parameterManager.getPresets(), [parameterManager]);
    const presetsByCategory = useMemo(() => parameterManager.getPresetsByCategory(), [parameterManager]);
    const history = useMemo(() => parameterManager.getHistory(), [parameterManager]);
    const historyStats = useMemo(() => parameterManager.getHistoryStats(), [parameterManager]);
    // Validate parameters on change
    useEffect(() => {
        const result = parameterManager.validateParameters(parameters);
        setValidation(result);
    }, [parameters, parameterManager]);
    // Handle parameter changes
    const updateParameter = useCallback((key, value) => {
        setParameters(prev => ({ ...prev, [key]: value }));
    }, []);
    // Handle preset selection
    const selectPreset = useCallback((presetId) => {
        const preset = parameterManager.getPreset(presetId);
        if (preset) {
            setParameters(preset.parameters);
            setSelectedPreset(presetId);
        }
    }, [parameterManager]);
    // Handle generation
    const handleGenerate = useCallback(async () => {
        if (!validation.isValid)
            return;
        try {
            setIsGenerating(true);
            setGenerationProgress('Preparing generation...');
            const completeParameters = parameterManager.createCompleteParameters(parameters);
            setGenerationProgress('Generating with LLM...');
            const result = await workflow.generateGraph(completeParameters, {
                onProgress: (message) => setGenerationProgress(message)
            });
            if (result.success && result.graph) {
                // Add to history
                parameterManager.addToHistory(completeParameters, true, result.metadata?.generationTime, result.errors?.length || 0);
                onGraphGenerated?.(result.graph);
                setGenerationProgress('Generation complete!');
                setTimeout(() => setGenerationProgress(''), 2000);
            }
            else {
                throw new Error(result.errors?.[0]?.message || 'Generation failed');
            }
        }
        catch (error) {
            console.error('Generation error:', error);
            // Add failed attempt to history
            if (parameters.purpose) {
                const completeParameters = parameterManager.createCompleteParameters(parameters);
                parameterManager.addToHistory(completeParameters, false);
            }
            onError?.(error instanceof Error ? error : new Error('Unknown error'));
            setGenerationProgress('Generation failed');
            setTimeout(() => setGenerationProgress(''), 3000);
        }
        finally {
            setIsGenerating(false);
        }
    }, [parameters, validation, parameterManager, workflow, onGraphGenerated, onError]);
    // Get suggestions
    const suggestions = useMemo(() => {
        return parameterManager.getSuggestions(parameters);
    }, [parameters, parameterManager]);
    return (_jsxs("div", { className: `randomizer-panel ${className}`, children: [_jsxs("div", { className: "randomizer-header", children: [_jsx("h2", { children: "LLM Graph Randomizer" }), _jsxs("div", { className: "header-controls", children: [_jsxs("button", { onClick: () => setShowPresets(!showPresets), className: `preset-btn ${showPresets ? 'active' : ''}`, children: ["Presets (", presets.length, ")"] }), _jsxs("button", { onClick: () => setShowHistory(!showHistory), className: `history-btn ${showHistory ? 'active' : ''}`, children: ["History (", history.length, ")"] }), _jsx("button", { onClick: () => setShowAdvanced(!showAdvanced), className: `advanced-btn ${showAdvanced ? 'active' : ''}`, children: "Advanced" })] })] }), showPresets && (_jsxs("div", { className: "presets-panel", children: [_jsx("h3", { children: "Parameter Presets" }), Object.entries(presetsByCategory).map(([category, categoryPresets]) => (_jsxs("div", { className: "preset-category", children: [_jsx("h4", { children: category }), _jsx("div", { className: "preset-grid", children: categoryPresets.map(preset => (_jsxs("div", { className: `preset-card ${selectedPreset === preset.id ? 'selected' : ''}`, onClick: () => selectPreset(preset.id), children: [_jsx("div", { className: "preset-name", children: preset.name }), _jsx("div", { className: "preset-description", children: preset.description }), _jsx("div", { className: "preset-tags", children: preset.tags.map(tag => (_jsx("span", { className: "preset-tag", children: tag }, tag))) })] }, preset.id))) })] }, category)))] })), showHistory && (_jsxs("div", { className: "history-panel", children: [_jsx("h3", { children: "Generation History" }), _jsxs("div", { className: "history-stats", children: [_jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-label", children: "Total:" }), _jsx("span", { className: "stat-value", children: historyStats.totalGenerations })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-label", children: "Success Rate:" }), _jsxs("span", { className: "stat-value", children: [(historyStats.successRate * 100).toFixed(1), "%"] })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-label", children: "Avg Time:" }), _jsxs("span", { className: "stat-value", children: [historyStats.averageGenerationTime.toFixed(0), "ms"] })] })] }), _jsx("div", { className: "history-list", children: history.slice(0, 10).map(entry => (_jsxs("div", { className: `history-entry ${entry.success ? 'success' : 'failed'}`, onClick: () => setParameters(entry.parameters), children: [_jsxs("div", { className: "history-purpose", children: [entry.parameters.purpose.substring(0, 60), "..."] }), _jsxs("div", { className: "history-meta", children: [_jsx("span", { children: entry.parameters.complexity }), _jsxs("span", { children: [entry.parameters.nodeCount, " nodes"] }), _jsx("span", { children: new Date(entry.timestamp).toLocaleDateString() })] })] }, entry.id))) })] })), _jsxs("div", { className: "parameters-form", children: [_jsxs("div", { className: "parameter-section", children: [_jsx("h3", { children: "Core Parameters" }), _jsxs("div", { className: "parameter-group", children: [_jsx("label", { htmlFor: "purpose", children: "Purpose *" }), _jsx("textarea", { id: "purpose", value: parameters.purpose || '', onChange: (e) => updateParameter('purpose', e.target.value), placeholder: "Describe what your graph should accomplish...", rows: 3, className: validation.errors.some(e => e.field === 'purpose') ? 'error' : '' }), suggestions.focusAreas && (_jsxs("div", { className: "suggestions", children: ["Suggested focus areas: ", suggestions.focusAreas.join(', ')] }))] }), _jsxs("div", { className: "parameter-row", children: [_jsxs("div", { className: "parameter-group", children: [_jsx("label", { htmlFor: "complexity", children: "Complexity" }), _jsxs("select", { id: "complexity", value: parameters.complexity || 'moderate', onChange: (e) => updateParameter('complexity', e.target.value), children: [_jsx("option", { value: "simple", children: "Simple (3-8 nodes)" }), _jsx("option", { value: "moderate", children: "Moderate (8-20 nodes)" }), _jsx("option", { value: "complex", children: "Complex (20-50 nodes)" })] })] }), _jsxs("div", { className: "parameter-group", children: [_jsx("label", { htmlFor: "nodeCount", children: "Node Count" }), _jsx("input", { type: "number", id: "nodeCount", min: "3", max: "100", value: parameters.nodeCount || suggestions.nodeCount || 12, onChange: (e) => updateParameter('nodeCount', parseInt(e.target.value)) })] }), _jsxs("div", { className: "parameter-group", children: [_jsx("label", { htmlFor: "style", children: "Style" }), _jsxs("select", { id: "style", value: parameters.style || 'balanced', onChange: (e) => updateParameter('style', e.target.value), children: [_jsx("option", { value: "creative", children: "Creative" }), _jsx("option", { value: "logical", children: "Logical" }), _jsx("option", { value: "balanced", children: "Balanced" })] })] })] }), _jsxs("div", { className: "parameter-group", children: [_jsx("label", { htmlFor: "domain", children: "Domain (Optional)" }), _jsx("input", { type: "text", id: "domain", value: parameters.domain || '', onChange: (e) => updateParameter('domain', e.target.value), placeholder: "e.g., education, entertainment, business" })] })] }), _jsxs("div", { className: "parameter-section", children: [_jsx("h3", { children: "LLM Configuration" }), _jsxs("div", { className: "parameter-row", children: [_jsxs("div", { className: "parameter-group", children: [_jsx("label", { htmlFor: "provider", children: "Provider" }), _jsxs("select", { id: "provider", value: parameters.provider || 'openai', onChange: (e) => updateParameter('provider', e.target.value), children: [_jsx("option", { value: "openai", children: "OpenAI (GPT-4)" }), _jsx("option", { value: "claude", children: "Anthropic (Claude)" }), _jsx("option", { value: "gemini", children: "Google (Gemini)" })] })] }), _jsxs("div", { className: "parameter-group", children: [_jsx("label", { htmlFor: "temperature", children: "Temperature" }), _jsx("input", { type: "number", id: "temperature", min: "0", max: "2", step: "0.1", value: parameters.temperature || suggestions.temperature || 0.7, onChange: (e) => updateParameter('temperature', parseFloat(e.target.value)) })] }), _jsxs("div", { className: "parameter-group", children: [_jsx("label", { htmlFor: "maxRetries", children: "Max Retries" }), _jsx("input", { type: "number", id: "maxRetries", min: "1", max: "10", value: parameters.maxRetries || 3, onChange: (e) => updateParameter('maxRetries', parseInt(e.target.value)) })] })] })] }), showAdvanced && (_jsxs("div", { className: "parameter-section", children: [_jsx("h3", { children: "Advanced Options" }), _jsxs("div", { className: "parameter-group", children: [_jsx("label", { htmlFor: "specificRequirements", children: "Specific Requirements" }), _jsx("textarea", { id: "specificRequirements", value: (parameters.specificRequirements || []).join('\n'), onChange: (e) => updateParameter('specificRequirements', e.target.value.split('\n').filter(Boolean)), placeholder: "Enter each requirement on a new line...", rows: 3 })] }), _jsxs("div", { className: "parameter-group", children: [_jsx("label", { htmlFor: "constraints", children: "Constraints" }), _jsx("textarea", { id: "constraints", value: (parameters.constraints || []).join('\n'), onChange: (e) => updateParameter('constraints', e.target.value.split('\n').filter(Boolean)), placeholder: "Enter each constraint on a new line...", rows: 3 })] }), _jsxs("div", { className: "parameter-row", children: [_jsxs("div", { className: "parameter-group", children: [_jsx("label", { htmlFor: "qualityLevel", children: "Quality Level" }), _jsxs("select", { id: "qualityLevel", value: parameters.qualityLevel || 'standard', onChange: (e) => updateParameter('qualityLevel', e.target.value), children: [_jsx("option", { value: "draft", children: "Draft" }), _jsx("option", { value: "standard", children: "Standard" }), _jsx("option", { value: "high", children: "High" })] })] }), _jsxs("div", { className: "parameter-group", children: [_jsx("label", { htmlFor: "diversityScore", children: "Diversity" }), _jsx("input", { type: "range", id: "diversityScore", min: "0", max: "1", step: "0.1", value: parameters.diversityScore || 0.5, onChange: (e) => updateParameter('diversityScore', parseFloat(e.target.value)) }), _jsxs("span", { className: "range-value", children: [((parameters.diversityScore || 0.5) * 100).toFixed(0), "%"] })] })] }), _jsxs("div", { className: "parameter-checkboxes", children: [_jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: parameters.includeMetadata !== false, onChange: (e) => updateParameter('includeMetadata', e.target.checked) }), "Include Metadata"] }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: parameters.validateOutput !== false, onChange: (e) => updateParameter('validateOutput', e.target.checked) }), "Validate Output"] }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: parameters.includeExplanation || false, onChange: (e) => updateParameter('includeExplanation', e.target.checked) }), "Include Explanation"] })] })] })), validation.errors.length > 0 && (_jsxs("div", { className: "validation-errors", children: [_jsx("h4", { children: "Errors:" }), _jsx("ul", { children: validation.errors.map((error, index) => (_jsxs("li", { className: "error-item", children: [_jsxs("strong", { children: [error.field, ":"] }), " ", error.message] }, index))) })] })), validation.warnings.length > 0 && (_jsxs("div", { className: "validation-warnings", children: [_jsx("h4", { children: "Warnings:" }), _jsx("ul", { children: validation.warnings.map((warning, index) => (_jsxs("li", { className: "warning-item", children: [_jsxs("strong", { children: [warning.field, ":"] }), " ", warning.message, warning.suggestion && _jsxs("em", { children: [" \u2014 ", warning.suggestion] })] }, index))) })] }))] }), _jsxs("div", { className: "generation-controls", children: [_jsx("button", { onClick: handleGenerate, disabled: !validation.isValid || isGenerating || !parameters.purpose, className: "generate-btn primary", children: isGenerating ? 'Generating...' : 'Generate Graph' }), generationProgress && (_jsx("div", { className: "generation-progress", children: generationProgress }))] })] }));
};
