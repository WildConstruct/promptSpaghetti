/**
 * Epic 14 Story 14.1 - Experiment Design System
 * Visual Experiment Builder Component
 */
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Alert, AlertDescription } from '../ui/Alert';
import { Progress } from '../ui/Progress';
import { 
  Plus, 
  X, 
  Save, 
  Play, 
  Pause, 
  Settings, 
  BarChart, 
  Users, 
  Target, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Copy,
  Shuffle
} from 'lucide-react';
import {
  Experiment,
  ExperimentVariant,
  ExperimentMetric,
  ExperimentType,
  TrafficAllocation,
  ExperimentSchedule,
  ExperimentStatus
} from '../../types/experiment';

export interface ExperimentBuilderProps {
  experiment?: Experiment;
  onSave: (experiment: Partial<Experiment>) => Promise<void>;
  onPreview: (variant: ExperimentVariant) => Promise<{ cost: number; tokens: number; latency: number }>;
  onStart: (experimentId: string) => Promise<void>;
  onPause: (experimentId: string) => Promise<void>;
  className?: string;
interface BuilderState {
  experiment: Partial<Experiment>;
  activeTab: string;
  validationErrors: string;
  previewResults: Record<string, { cost: number; tokens: number; latency: number }>;
  saving: boolean;
  estimatedSampleSize: number;
  estimatedDuration: number;
}
export const ExperimentBuilder: React.FC<ExperimentBuilderProps> = ({)
  experiment,
  onSave,
  onPreview,
  onStart,
  onPause,
  className = ''
}) => {
  const [state, setState] = useState<BuilderState>({)
  experiment: experiment || {,
  name: '',
      type: 'prompt' as ExperimentType,
      hypothesis: '',
      description: '',
      variants: [,
        { id: 'control', name: 'Control', description: 'Original version' },
        { id: 'variant-1', name: 'Variant 1', description: 'Test version' }
      ],
      trafficAllocation: { 'control': 50, 'variant-1': 50 },
      metrics: [],
      status: 'draft' as ExperimentStatus,
      schedule: {},
      tags: [];
  },
  activeTab: 'setup',
    validationErrors: [],
    previewResults: {},
    saving: false,
    estimatedSampleSize: 0,
    estimatedDuration: 0;
  });
  /**
   * Update experiment field
   */
  const updateExperiment = useCallback((field: string, value: unknown) => {
  setState(prev => ({)
  ...prev,
  experiment: {
  ...prev.experiment,
  [field]: value,
}));
  }, []);
  /**
   * Add a new variant
   */
  const addVariant = useCallback(() => {
    const newVariantId = `variant-${Date.now()}`;}
    const newVariant: ExperimentVariant = {,
  id: newVariantId,
      name: `Variant ${state.experiment.variants?.length || 1}`}
},
  description: '';
  };
    const updatedVariants = [...(state.experiment.variants || []), newVariant];
    const updatedAllocation = { ...state.experiment.trafficAllocation };
    // Redistribute traffic equally
    const equalShare = Math.floor(100 / updatedVariants.length);
    updatedVariants.forEach(variant => {)
  updatedAllocation[variant.id] = equalShare;
    });
    // Handle remainder
    const remainder = 100 - (equalShare * updatedVariants.length);
    if (remainder > 0) {
  updatedAllocation[updatedVariants[0].id] += remainder;
  setState(prev => ({)
  ...prev,
  experiment: {
  ...prev.experiment,
  variants: updatedVariants,
  trafficAllocation: updatedAllocation,
}));
  }, [state.experiment.variants, state.experiment.trafficAllocation]);
  /**
   * Remove a variant
   */
  const removeVariant = useCallback((variantId: string) => {
    const updatedVariants = state.experiment.variants?.filter(v => v.id !== variantId) || [];
    const updatedAllocation = { ...state.experiment.trafficAllocation };
    delete updatedAllocation[variantId];
    // Redistribute traffic equally among remaining variants
    if (updatedVariants.length > 0) {
      const equalShare = Math.floor(100 / updatedVariants.length);
      updatedVariants.forEach(variant => {)
  updatedAllocation[variant.id] = equalShare;
      });
      const remainder = 100 - (equalShare * updatedVariants.length);
      if (remainder > 0) {
  updatedAllocation[updatedVariants[0].id] += remainder;
  setState(prev => ({)
  ...prev,
  experiment: {
  ...prev.experiment,
  variants: updatedVariants,
  trafficAllocation: updatedAllocation,
}));
  }, [state.experiment.variants, state.experiment.trafficAllocation]);
  /**
   * Update variant
   */
  const updateVariant = useCallback((variantId: string, field: string, value: unknown) => {
    const updatedVariants = state.experiment.variants?.map(variant => ;);
      variant.id === variantId 
        ? { ...variant, [field]: value }
        : variant
    ) || [];
    setState(prev => ({)
  ...prev,
  experiment: {
  ...prev.experiment,
  variants: updatedVariants,
}));
  }, [state.experiment.variants]);
  /**
   * Update traffic allocation
   */
  const updateAllocation = useCallback((variantId: string, percentage: number) => {
  const updatedAllocation = {
  ...state.experiment.trafficAllocation,
  [variantId]: percentage,
};
    setState(prev => ({)
  ...prev,
  experiment: {
  ...prev.experiment,
  trafficAllocation: updatedAllocation,
}));
  }, [state.experiment.trafficAllocation]);
  /**
   * Add metric
   */
  const addMetric = useCallback(() => {
    const newMetric: ExperimentMetric = {,
  id: `metric-${Date.now()}`}
},
  name: '',
      type: 'conversion',
      isPrimary: state.experiment.metrics?.length === 0,
      isGuardrail: false,
      expectedDirection: 'increase'
  };
    const updatedMetrics = [...(state.experiment.metrics || []), newMetric];
    setState(prev => ({)
  ...prev,
  experiment: {
  ...prev.experiment,
  metrics: updatedMetrics,
}));
  }, [state.experiment.metrics]);
  /**
   * Update metric
   */
  const updateMetric = useCallback((metricId: string, field: string, value: unknown) => {
    const updatedMetrics = state.experiment.metrics?.map(metric => ;);
      metric.id === metricId 
        ? { ...metric, [field]: value }
        : metric
    ) || [];
    setState(prev => ({)
  ...prev,
  experiment: {
  ...prev.experiment,
  metrics: updatedMetrics,
}));
  }, [state.experiment.metrics]);
  /**
   * Preview variant
   */
  const previewVariant = useCallback(async (variant: ExperimentVariant) => {
  try {
  const result = await onPreview(variant);
  setState(prev => ({)
  ...prev,
  previewResults: {
  ...prev.previewResults,
  [variant.id]: result,
}));
    } catch (error) {
  console.error('Preview failed:', error);
}, [onPreview]);
  /**
   * Validate experiment
   */
  const validateExperiment = useCallback(() => {
    const errors: string = [];
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
  }, [state.experiment]);
  /**
   * Save experiment
   */
  const handleSave = useCallback(async () => {
    if (!validateExperiment()) return;
    setState(prev => ({ ...prev, saving: true }));
    try {
      await onSave(state.experiment);
    } catch (error) {
  console.error('Save failed:', error);
} finally {
      setState(prev => ({ ...prev, saving: false }));
  }, [state.experiment, validateExperiment, onSave]);
  /**
   * Start experiment
   */
  const handleStart = useCallback(async () => {
    if (!validateExperiment() || !state.experiment.id) return;
    try {
      await onStart(state.experiment.id);
      setState(prev => ({)
  ...prev,
        experiment: { ...prev.experiment, status: 'running' as ExperimentStatus }
      }));
    } catch (error) {
  console.error('Start failed:', error);
}, [state.experiment, validateExperiment, onStart]);
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
  const sampleSize = Math.ceil(;);
  2 * Math.pow(1.96 + 0.84, 2) * baselineRate * (1 - baselineRate) / Math.pow(mde, 2)
  );
  setState(prev => ({)
  ...prev,
  estimatedSampleSize: sampleSize,
  estimatedDuration: Math.ceil(sampleSize / 100) // Assume 100 users/hour,
}));
  }, [state.experiment.metrics]);
  return;
    <div className={`experiment-builder ${className}`}>}
      {/* Header */}
      <div className="builder-header">
        <div className="header-info">
          <h1 className="text-2xl font-bold">
            {state.experiment.id ? 'Edit Experiment' : 'Create Experiment'}
          </h1>
          <Badge variant={state.experiment.status === 'running' ? 'default' : 'secondary'}>
            {state.experiment.status || 'Draft'}
          </Badge>
        </div>
        <div className="header-actions">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={state.saving}
            className="mr-2"
          >
            <Save className="w-4 h-4 mr-2" />
            {state.saving ? 'Saving...' : 'Save'}
          </Button>
          {state.experiment.status === 'draft' && ()
            <Button onClick={handleStart} disabled={state.validationErrors.length > 0}>
              <Play className="w-4 h-4 mr-2" />
              Start Experiment
            </Button>
          )}
          {state.experiment.status === 'running' && ()
            <Button 
              variant="outline" 
              onClick={() => state.experiment.id && onPause(state.experiment.id)}
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
        </div>
      </div>
      {/* Validation Errors */}
      {state.validationErrors.length > 0 && ()
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {state.validationErrors.map((error, index) => ()
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      {/* Main Content */}
      <Tabs value={state.activeTab} onValueChange={(tab) => setState(prev => ({ ...prev, activeTab: tab }))}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>
        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Experiment Name</label>
                <Input
                  value={state.experiment.name || ''}
                  onChange={(e) => updateExperiment('name', e.target.value)}
                  placeholder="Enter experiment name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <Select 
                  value={state.experiment.type} 
                  onValueChange={(value) => updateExperiment('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prompt">Prompt Testing</SelectItem>
                    <SelectItem value="graph">Graph Testing</SelectItem>
                    <SelectItem value="feature_flag">Feature Flag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hypothesis</label>
                <Textarea
                  value={state.experiment.hypothesis || ''}
                  onChange={(e) => updateExperiment('hypothesis', e.target.value)}
                  placeholder="Describe what you expect to happen and why"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <Textarea
                  value={state.experiment.description || ''}
                  onChange={(e) => updateExperiment('description', e.target.value)}
                  placeholder="Additional context or notes"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
          {/* Sample Size Estimation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="w-5 h-5 mr-2" />
                Sample Size Estimation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold">{state.estimatedSampleSize.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Required Sample Size</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{state.estimatedDuration}h</div>
                  <div className="text-sm text-gray-600">Estimated Duration</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Variants Tab */}
        <TabsContent value="variants" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Experiment Variants</h3>
            <Button onClick={addVariant} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Variant
            </Button>
          </div>
          <div className="space-y-4">
            {state.experiment.variants?.map((variant, index) => ()
              <Card key={variant.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">
                      {index === 0 ? ()
                        <Badge variant="secondary" className="mr-2">Control</Badge>
                      ) : ()
                        <Badge variant="outline" className="mr-2">Test</Badge>
                      )}
                      {variant.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => previewVariant(variant)}
                      >
                        Preview
                      </Button>
                      {state.experiment.variants!.length > 2 && ()
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeVariant(variant.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <Input
                        value={variant.name}
                        onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                        placeholder="Variant name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Traffic Allocation (%)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={state.experiment.trafficAllocation?.[variant.id] || 0}
                        onChange={(e) => updateAllocation(variant.id, parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Input
                      value={variant.description || ''}
                      onChange={(e) => updateVariant(variant.id, 'description', e.target.value)}
                      placeholder="Describe this variant"
                    />
                  </div>
                  {state.experiment.type === 'prompt' && ()
                    <div>
                      <label className="block text-sm font-medium mb-1">Prompt</label>
                      <Textarea
                        value={variant.prompt || ''}
                        onChange={(e) => updateVariant(variant.id, 'prompt', e.target.value)}
                        placeholder="Enter prompt text"
                        rows={3}
                      />
                    </div>
                  )}
                  {/* Preview Results */}
                  {state.previewResults[variant.id] && ()
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm font-medium mb-2">Preview Results:</div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Cost</div>
                          <div>${state.previewResults[variant.id].cost.toFixed(4)}</div>}
                        </div>
                        <div>
                          <div className="font-medium">Tokens</div>
                          <div>{state.previewResults[variant.id].tokens}</div>
                        </div>
                        <div>
                          <div className="font-medium">Latency</div>
                          <div>{state.previewResults[variant.id].latency}ms</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Traffic Allocation Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {state.experiment.variants?.map((variant) => {
                  const percentage = state.experiment.trafficAllocation?.[variant.id] || 0;
                  return;
                    <div key={variant.id} className="flex items-center space-x-3">
                      <div className="w-24 text-sm font-medium">{variant.name}:</div>
                      <Progress value={percentage} className="flex-1" />
                      <div className="w-12 text-sm text-right">{percentage}%</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Success Metrics</h3>
            <Button onClick={addMetric} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Metric
            </Button>
          </div>
          <div className="space-y-4">
            {state.experiment.metrics?.map((metric) => ()
              <Card key={metric.id}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Metric Name</label>
                      <Input
                        value={metric.name}
                        onChange={(e) => updateMetric(metric.id, 'name', e.target.value)}
                        placeholder="e.g., Conversion Rate"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <Select 
                        value={metric.type}
                        onValueChange={(value) => updateMetric(metric.id, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conversion">Conversion Rate</SelectItem>
                          <SelectItem value="latency">Latency</SelectItem>
                          <SelectItem value="cost">Cost</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={metric.isPrimary}
                        onChange={(e) => updateMetric(metric.id, 'isPrimary', e.target.checked)}
                        className="mr-2"
                      />
                      Primary Metric
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={metric.isGuardrail}
                        onChange={(e) => updateMetric(metric.id, 'isGuardrail', e.target.checked)}
                        className="mr-2"
                      />
                      Guardrail Metric
                    </label>
                  </div>
                  {metric.isPrimary && ()
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Expected Direction
                        </label>
                        <Select 
                          value={metric.expectedDirection}
                          onValueChange={(value) => updateMetric(metric.id, 'expectedDirection', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="increase">Increase (↑)</SelectItem>
                            <SelectItem value="decrease">Decrease (↓)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Minimum Detectable Effect (%)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={metric.minimumDetectableEffect || ''}
                          onChange={(e) => updateMetric(metric.id, 'minimumDetectableEffect', parseFloat(e.target.value) || 0)}
                          placeholder="2.0"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date (Optional)</label>
                  <Input
                    type="datetime-local"
                    value={state.experiment.schedule?.startAt?.toISOString().slice(0, 16) || ''}
                    onChange={(e) => updateExperiment('schedule', {)
  ...state.experiment.schedule,
  startAt: e.target.value ? new Date(e.target.value) : undefined,
})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date (Optional)</label>
                  <Input
                    type="datetime-local"
                    value={state.experiment.schedule?.endAt?.toISOString().slice(0, 16) || ''}
                    onChange={(e) => updateExperiment('schedule', {)
  ...state.experiment.schedule,
  endAt: e.target.value ? new Date(e.target.value) : undefined,
})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Auto-Stop Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Minimum Sample Size
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={state.experiment.schedule?.autoStop?.minSampleSize || ''}
                    onChange={(e) => updateExperiment('schedule', {)
  ...state.experiment.schedule,
  autoStop: {
  ...state.experiment.schedule?.autoStop,
  minSampleSize: parseInt(e.target.value) || undefined,
})}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max P-Value
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={state.experiment.schedule?.autoStop?.maxPValue || ''}
                    onChange={(e) => updateExperiment('schedule', {)
  ...state.experiment.schedule,
  autoStop: {
  ...state.experiment.schedule?.autoStop,
  maxPValue: parseFloat(e.target.value) || undefined,
})}
                    placeholder="0.05"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExperimentBuilder;