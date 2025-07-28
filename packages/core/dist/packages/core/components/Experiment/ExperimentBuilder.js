import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 14 Story 14.1 - Experiment Design System
 * Visual Experiment Builder Component
 */
import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Alert, AlertDescription } from '../ui/Alert';
import { Progress } from '../ui/Progress';
import { Plus, X, Save, Play, Pause, BarChart, Target, Clock, AlertTriangle } from 'lucide-react';
export const ExperimentBuilder = ({
    experiment,
    onSave,
    onPreview,
    onStart,
    onPause,
    className = ''
});
{
    const [state, setState] = useState({});
    experiment: experiment || {
        name: '',
        type: 'prompt',
        hypothesis: '',
        description: '',
        variants: [,
            { id: 'control', name: 'Control', description: 'Original version' },
            { id: 'variant-1', name: 'Variant 1', description: 'Test version' }
        ],
        trafficAllocation: { 'control': 50, 'variant-1': 50 },
        metrics: [],
        status: 'draft',
        schedule: {},
        tags: [] },
        activeTab;
    'setup',
        validationErrors;
    [],
        previewResults;
    { }
    saving: false,
        estimatedSampleSize;
    0,
        estimatedDuration;
    0;
}
;
/**
 * Update experiment field
 */
const updateExperiment = useCallback((field, value) => {
    setState(prev => ({}), ...prev, experiment, {
        ...prev.experiment,
        [field]: value,
    });
});
[];
;
/**
 * Add a new variant
 */
const addVariant = useCallback(() => {
    const newVariantId = `variant-${Date.now()}`;
});
const newVariant = {
    id: newVariantId,
    name: `Variant ${state.experiment.variants?.length || 1}` };
description: '';
;
const updatedVariants = [...(state.experiment.variants || []), newVariant];
const updatedAllocation = { ...state.experiment.trafficAllocation };
// Redistribute traffic equally
const equalShare = Math.floor(100 / updatedVariants.length);
updatedVariants.forEach(variant => { });
updatedAllocation[variant.id] = equalShare;
;
// Handle remainder
const remainder = 100 - (equalShare * updatedVariants.length);
if (remainder > 0) {
    updatedAllocation[updatedVariants[0].id] += remainder;
    setState(prev => ({}), ...prev, experiment, {
        ...prev.experiment,
        variants: updatedVariants,
        trafficAllocation: updatedAllocation,
    });
    ;
}
[state.experiment.variants, state.experiment.trafficAllocation];
;
/**
 * Remove a variant
 */
const removeVariant = useCallback((variantId) => {
    const updatedVariants = state.experiment.variants?.filter(v => v.id !== variantId) || [];
    const updatedAllocation = { ...state.experiment.trafficAllocation };
    delete updatedAllocation[variantId];
    // Redistribute traffic equally among remaining variants
    if (updatedVariants.length > 0) {
        const equalShare = Math.floor(100 / updatedVariants.length);
        updatedVariants.forEach(variant => { });
        updatedAllocation[variant.id] = equalShare;
    }
});
const remainder = 100 - (equalShare * updatedVariants.length);
if (remainder > 0) {
    updatedAllocation[updatedVariants[0].id] += remainder;
    setState(prev => ({}), ...prev, experiment, {
        ...prev.experiment,
        variants: updatedVariants,
        trafficAllocation: updatedAllocation,
    });
    ;
}
[state.experiment.variants, state.experiment.trafficAllocation];
;
/**
 * Update variant
 */
const updateVariant = useCallback((variantId, field, value) => {
    const updatedVariants = state.experiment.variants?.map(variant => );
});
variant.id === variantId
    ? { ...variant, [field]: value }
    : variant;
 || [];
setState(prev => ({}), ...prev, experiment, {
    ...prev.experiment,
    variants: updatedVariants,
});
;
[state.experiment.variants];
;
/**
 * Update traffic allocation
 */
const updateAllocation = useCallback((variantId, percentage) => {
    const updatedAllocation = {
        ...state.experiment.trafficAllocation,
        [variantId]: percentage,
    };
    setState(prev => ({}), ...prev, experiment, {
        ...prev.experiment,
        trafficAllocation: updatedAllocation,
    });
});
[state.experiment.trafficAllocation];
;
/**
 * Add metric
 */
const addMetric = useCallback(() => {
    const newMetric = {
        id: `metric-${Date.now()}` };
}, name, '', type, 'conversion', isPrimary, state.experiment.metrics?.length === 0, isGuardrail, false, expectedDirection, 'increase');
;
const updatedMetrics = [...(state.experiment.metrics || []), newMetric];
setState(prev => ({}), ...prev, experiment, {
    ...prev.experiment,
    metrics: updatedMetrics,
});
;
[state.experiment.metrics];
;
/**
 * Update metric
 */
const updateMetric = useCallback((metricId, field, value) => {
    const updatedMetrics = state.experiment.metrics?.map(metric => );
});
metric.id === metricId
    ? { ...metric, [field]: value }
    : metric;
 || [];
setState(prev => ({}), ...prev, experiment, {
    ...prev.experiment,
    metrics: updatedMetrics,
});
;
[state.experiment.metrics];
;
/**
 * Preview variant
 */
const previewVariant = useCallback(async (variant) => {
    try {
        const result = await onPreview(variant);
        setState(prev => ({}), ...prev, previewResults, {
            ...prev.previewResults,
            [variant.id]: result,
        });
    }
    finally { }
});
try { }
catch (error) {
    console.error('Preview failed:', error);
}
[onPreview];
;
/**
 * Validate experiment
 */
const validateExperiment = useCallback(() => {
    const errors = [];
    if (!state.experiment.name?.trim()) {
        errors.push('Experiment name is required');
        if (!state.experiment.hypothesis?.trim()) {
            errors.push('Hypothesis is required');
            if (!state.experiment.variants || state.experiment.variants.length < 2) {
                errors.push('At least 2 variants are required');
                if (state.experiment.variants && state.experiment.variants.length > 12) {
                    errors.push('Maximum 12 variants allowed');
                    // Validate traffic allocation
                    if (state.experiment.trafficAllocation) {
                        const total = Object.values(state.experiment.trafficAllocation).reduce((sum, pct) => sum + pct, 0);
                        if (Math.abs(total - 100) > 0.1) {
                            errors.push('Traffic allocation must sum to 100%');
                            // Validate metrics
                            if (!state.experiment.metrics || state.experiment.metrics.length === 0) {
                                errors.push('At least one success metric is required');
                                const primaryMetrics = state.experiment.metrics?.filter(m => m.isPrimary) || [];
                                if (primaryMetrics.length !== 1) {
                                    errors.push('Exactly one primary metric is required');
                                    setState(prev => ({ ...prev, validationErrors: errors }));
                                    return errors.length === 0;
                                }
                                [state.experiment];
                            }
                        }
                    }
                }
            }
        }
    }
});
/**
 * Save experiment
 */
const handleSave = useCallback(async () => {
    if (!validateExperiment())
        return;
    setState(prev => ({ ...prev, saving: true }));
    try {
        await onSave(state.experiment);
    }
    catch (error) {
        console.error('Save failed:', error);
    }
    finally {
        setState(prev => ({ ...prev, saving: false }));
    }
    [state.experiment, validateExperiment, onSave];
});
/**
 * Start experiment
 */
const handleStart = useCallback(async () => {
    if (!validateExperiment() || !state.experiment.id)
        return;
    try {
        await onStart(state.experiment.id);
        setState(prev => ({}), ...prev, experiment, { ...prev.experiment, status: 'running' });
    }
    finally { }
});
try { }
catch (error) {
    console.error('Start failed:', error);
}
[state.experiment, validateExperiment, onStart];
;
/**
 * Calculate sample size estimation (simplified)
 */
useEffect(() => {
    const primaryMetric = state.experiment.metrics?.find(m => m.isPrimary);
    if (primaryMetric && primaryMetric.minimumDetectableEffect) {
        // Simplified sample size calculation
        const baselineRate = 0.1; // 10% baseline assumption;
        const mde = primaryMetric.minimumDetectableEffect;
        // Basic formula for proportions
        const sampleSize = Math.ceil();
    }
});
2 * Math.pow(1.96 + 0.84, 2) * baselineRate * (1 - baselineRate) / Math.pow(mde, 2);
;
setState(prev => ({}), ...prev, estimatedSampleSize, sampleSize, estimatedDuration, Math.ceil(sampleSize / 100) // Assume 100 users/hour,
);
;
[state.experiment.metrics];
;
return;
_jsxs("div", { className: `experiment-builder ${className}`, children: ["}", _jsxs("div", { className: "builder-header", children: [_jsxs("div", { className: "header-info", children: [_jsx("h1", { className: "text-2xl font-bold", children: state.experiment.id ? 'Edit Experiment' : 'Create Experiment' }), _jsx(Badge, { variant: state.experiment.status === 'running' ? 'default' : 'secondary', children: state.experiment.status || 'Draft' })] }), _jsxs("div", { className: "header-actions", children: [_jsxs(Button, { variant: "outline", onClick: handleSave, disabled: state.saving, className: "mr-2", children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), state.saving ? 'Saving...' : 'Save'] }), state.experiment.status === 'draft' && ()
                            < Button, " onClick=", handleStart, " disabled=", state.validationErrors.length > 0, ">", _jsx(Play, { className: "w-4 h-4 mr-2" }), "Start Experiment"] }), ")}", state.experiment.status === 'running' && ()
                    < Button, "variant=\"outline\" onClick=", () => state.experiment.id && onPause(state.experiment.id), ">", _jsx(Pause, { className: "w-4 h-4 mr-2" }), "Pause"] }), ")}"] });
div >
    { /* Validation Errors */};
{
    state.validationErrors.length > 0 && ()
        < Alert;
    variant = "destructive";
    className = "mb-4" >
        (_jsx(AlertTriangle, { className: "h-4 w-4" })
            ,
                _jsxs(AlertDescription, { children: [_jsx("ul", { className: "list-disc list-inside", children: state.validationErrors.map((error, index) => ()
                                < li, key = { index } > { error }) }), "))}"] }));
    AlertDescription >
    ;
    Alert >
    ;
}
{ /* Main Content */ }
_jsxs(Tabs, { value: state.activeTab, onValueChange: (tab) => setState(prev => ({ ...prev, activeTab: tab })), children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "setup", children: "Setup" }), _jsx(TabsTrigger, { value: "variants", children: "Variants" }), _jsx(TabsTrigger, { value: "metrics", children: "Metrics" }), _jsx(TabsTrigger, { value: "configuration", children: "Configuration" })] }), _jsxs(TabsContent, { value: "setup", className: "space-y-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Basic Information" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Experiment Name" }), _jsx(Input, { value: state.experiment.name || '', onChange: (e) => updateExperiment('name', e.target.value), placeholder: "Enter experiment name" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Type" }), _jsxs(Select, { value: state.experiment.type, onValueChange: (value) => updateExperiment('type', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "prompt", children: "Prompt Testing" }), _jsx(SelectItem, { value: "graph", children: "Graph Testing" }), _jsx(SelectItem, { value: "feature_flag", children: "Feature Flag" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Hypothesis" }), _jsx(Textarea, { value: state.experiment.hypothesis || '', onChange: (e) => updateExperiment('hypothesis', e.target.value), placeholder: "Describe what you expect to happen and why", rows: 3 })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Description (Optional)" }), _jsx(Textarea, { value: state.experiment.description || '', onChange: (e) => updateExperiment('description', e.target.value), placeholder: "Additional context or notes", rows: 2 })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(BarChart, { className: "w-5 h-5 mr-2" }), "Sample Size Estimation"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold", children: state.estimatedSampleSize.toLocaleString() }), _jsx("div", { className: "text-sm text-gray-600", children: "Required Sample Size" })] }), _jsxs("div", { children: [_jsxs("div", { className: "text-2xl font-bold", children: [state.estimatedDuration, "h"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Estimated Duration" })] })] }) })] })] }), _jsxs(TabsContent, { value: "variants", className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Experiment Variants" }), _jsxs(Button, { onClick: addVariant, variant: "outline", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Variant"] })] }), _jsx("div", { className: "space-y-4", children: state.experiment.variants?.map((variant, index) => ()
                        < Card, key = { variant, : .id } >
                        _jsxs(CardHeader, { className: "pb-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs(CardTitle, { className: "text-base", children: [index === 0 ? ()
                                                    < Badge : , " variant=\"secondary\" className=\"mr-2\">Control"] }), ") : ()", _jsx(Badge, { variant: "outline", className: "mr-2", children: "Test" }), ")}", variant.name] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => previewVariant(variant), children: "Preview" }), state.experiment.variants.length > 2 && ()
                                            < Button, "variant=\"outline\" size=\"sm\" onClick=", () => removeVariant(variant.id), ">", _jsx(X, { className: "w-4 h-4" })] }), ")}"] })) })] }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Name" }), _jsx(Input, { value: variant.name, onChange: (e) => updateVariant(variant.id, 'name', e.target.value), placeholder: "Variant name" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Traffic Allocation (%)" }), _jsx(Input, { type: "number", min: "0", max: "100", value: state.experiment.trafficAllocation?.[variant.id] || 0, onChange: (e) => updateAllocation(variant.id, parseInt(e.target.value) || 0) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Description" }), _jsx(Input, { value: variant.description || '', onChange: (e) => updateVariant(variant.id, 'description', e.target.value), placeholder: "Describe this variant" })] }), state.experiment.type === 'prompt' && ()
                    < div >
                    (_jsx("label", { className: "block text-sm font-medium mb-1", children: "Prompt" })
                        ,
                            _jsx(Textarea, { value: variant.prompt || '', onChange: (e) => updateVariant(variant.id, 'prompt', e.target.value), placeholder: "Enter prompt text", rows: 3 }))] }), ")}", state.previewResults[variant.id] && ()
            < div, " className=\"bg-gray-50 p-3 rounded-lg\">", _jsx("div", { className: "text-sm font-medium mb-2", children: "Preview Results:" }), _jsxs("div", { className: "grid grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "Cost" }), _jsxs("div", { children: ["$", state.previewResults[variant.id].cost.toFixed(4)] }), "}"] }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "Tokens" }), _jsx("div", { children: state.previewResults[variant.id].tokens })] }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "Latency" }), _jsxs("div", { children: [state.previewResults[variant.id].latency, "ms"] })] })] })] });
CardContent >
;
Card >
;
div >
    { /* Traffic Allocation Visualization */}
    < Card >
    (_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Traffic Allocation" }) })
        ,
            _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [state.experiment.variants?.map((variant) => {
                            const percentage = state.experiment.trafficAllocation?.[variant.id] || 0;
                            return;
                            _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "w-24 text-sm font-medium", children: [variant.name, ":"] }), _jsx(Progress, { value: percentage, className: "flex-1" }), _jsxs("div", { className: "w-12 text-sm text-right", children: [percentage, "%"] })] }, variant.id);
                        }), "; })}"] }) }));
Card >
;
TabsContent >
    { /* Metrics Tab */}
    < TabsContent;
value = "metrics";
className = "space-y-4" >
    (_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Success Metrics" }), _jsxs(Button, { onClick: addMetric, variant: "outline", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Metric"] })] })
        ,
            _jsx("div", { className: "space-y-4", children: state.experiment.metrics?.map((metric) => ()
                    < Card, key = { metric, : .id } >
                    _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Metric Name" }), _jsx(Input, { value: metric.name, onChange: (e) => updateMetric(metric.id, 'name', e.target.value), placeholder: "e.g., Conversion Rate" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Type" }), _jsxs(Select, { value: metric.type, onValueChange: (value) => updateMetric(metric.id, 'type', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "conversion", children: "Conversion Rate" }), _jsx(SelectItem, { value: "latency", children: "Latency" }), _jsx(SelectItem, { value: "cost", children: "Cost" }), _jsx(SelectItem, { value: "custom", children: "Custom" })] })] })] })] }), _jsxs("div", { className: "mt-4 flex items-center space-x-4", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: metric.isPrimary, onChange: (e) => updateMetric(metric.id, 'isPrimary', e.target.checked), className: "mr-2" }), "Primary Metric"] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: metric.isGuardrail, onChange: (e) => updateMetric(metric.id, 'isGuardrail', e.target.checked), className: "mr-2" }), "Guardrail Metric"] })] }), metric.isPrimary && ()
                                < div, " className=\"mt-4 grid grid-cols-2 gap-4\">", _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Expected Direction" }), _jsxs(Select, { value: metric.expectedDirection, onValueChange: (value) => updateMetric(metric.id, 'expectedDirection', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "increase", children: "Increase (\u2191)" }), _jsx(SelectItem, { value: "decrease", children: "Decrease (\u2193)" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Minimum Detectable Effect (%)" }), _jsx(Input, { type: "number", min: "0", step: "0.1", value: metric.minimumDetectableEffect || '', onChange: (e) => updateMetric(metric.id, 'minimumDetectableEffect', parseFloat(e.target.value) || 0), placeholder: "2.0" })] })] })) }));
Card >
;
div >
;
TabsContent >
    { /* Configuration Tab */}
    < TabsContent;
value = "configuration";
className = "space-y-4" >
    (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Clock, { className: "w-5 h-5 mr-2" }), "Scheduling"] }) }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Start Date (Optional)" }), _jsx(Input, { type: "datetime-local", value: state.experiment.schedule?.startAt?.toISOString().slice(0, 16) || '', onChange: (e) => updateExperiment('schedule', {}) }), "...state.experiment.schedule, startAt: e.target.value ? new Date(e.target.value) : undefined, })} />"] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "End Date (Optional)" }), _jsx(Input, { type: "datetime-local", value: state.experiment.schedule?.endAt?.toISOString().slice(0, 16) || '', onChange: (e) => updateExperiment('schedule', {}) }), "...state.experiment.schedule, endAt: e.target.value ? new Date(e.target.value) : undefined, })} />"] })] }) })] })
        ,
            _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Target, { className: "w-5 h-5 mr-2" }), "Auto-Stop Conditions"] }) }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Minimum Sample Size" }), _jsx(Input, { type: "number", min: "0", value: state.experiment.schedule?.autoStop?.minSampleSize || '', onChange: (e) => updateExperiment('schedule', {}) }), "...state.experiment.schedule, autoStop: ", (,
                                        ), "...state.experiment.schedule?.autoStop, minSampleSize: parseInt(e.target.value) || undefined, })} placeholder=\"1000\" />"] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Max P-Value" }), _jsx(Input, { type: "number", min: "0", max: "1", step: "0.01", value: state.experiment.schedule?.autoStop?.maxPValue || '', onChange: (e) => updateExperiment('schedule', {}) }), "...state.experiment.schedule, autoStop: ", (,
                                        ), "...state.experiment.schedule?.autoStop, maxPValue: parseFloat(e.target.value) || undefined, })} placeholder=\"0.05\" />"] })] }) })] }));
TabsContent >
;
Tabs >
;
div >
;
;
;
export default ExperimentBuilder;
