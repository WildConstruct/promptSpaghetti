import { useState, useEffect, useCallback, useRef } from 'react';
import { WeightControlOption } from '../components/Inspector/WeightControlSlider';
import { substituteVariables } from '../utils/templateParser';

export interface PreviewVariant {
  id: string;,
  seed: number;
  result: string;,
  timestamp: number;
  executionTime: number;,
  weightSnapshot: WeightControlOption;
  variables: Record<string, string>;
}
export interface PreviewPerformance {
  averageExecutionTime: number;,
  totalGenerations: number;
  successRate: number;,
  lastUpdate: number;
}
export interface RealTimePreviewConfig {
  maxVariants: number;,
  debounceMs: number;
  maxExecutionTime: number;,
  enablePerformanceTracking: boolean;
  autoRefresh: boolean;
  const DEFAULT_CONFIG: RealTimePreviewConfig = {,
  maxVariants: 3,
  debounceMs: 300,
  maxExecutionTime: 2000,
  enablePerformanceTracking: true,
  autoRefresh: true,
};
}
export const useRealTimePreview = (graph: GraphData, seedConfig: SeedConfig = {}) => {
  // State
  const [variants, setVariants] = useState<PreviewVariant>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [performance, setPerformance] = useState<PreviewPerformance>({)
  averageExecutionTime: 0,
  totalGenerations: 0,
  successRate: 100,
  lastUpdate: Date.now(),
});
  const [error, setError] = useState<string | null>(null);
  // Refs for managing async operations
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const generationCounterRef = useRef(0);
  // Generate preview variants based on current weights and template
  const generatePreview = useCallback(async (;);
    weights: WeightControlOption,
    force: boolean = false): Promise<void> => {,
    if (!template.trim() || (!force && isGenerating)) {
      return;
    // Cancel any existing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setIsGenerating(true);
    setError(null);
    const startTime = performance.now();
    const generationId = ++generationCounterRef.current;
    try {
      // Simulate weighted selection and generation
      const newVariants = await Promise.all(;);
        Array.from({ length: fullConfig.maxVariants }, async (_, index) => {
          const seed = Math.floor(Math.random() * 1000000);
          // Perform weighted selection based on weights
          const selectedOptions = performWeightedSelection(weights, seed);
          // Substitute variables in template
          const substitutedTemplate = substituteVariables(template, {)
  ...variables,
            ...selectedOptions
          });
          // Simulate generation delay (would be actual AI generation)
          await new Promise(resolve => )
            setTimeout(resolve, Math.random() * 200 + 50)
          );
          // Check if generation was aborted
          if (abortController.signal.aborted) {
            throw new Error('Generation aborted');
          return {
            id: `variant_${generationId}_${index}`}
}
            seed,
            result: substitutedTemplate,
            timestamp: Date.now(),
            executionTime: performance.now() - startTime,
            weightSnapshot: weights.map(w => ({ ...w })), // Deep copy
            variables: { ...variables, ...selectedOptions }
          };
  }
      );
      // Update variants if this is still the current generation
      if (!abortController.signal.aborted && generationId === generationCounterRef.current) {
  setVariants(newVariants);
  // Update performance metrics
  if (fullConfig.enablePerformanceTracking) {
  const executionTime = performance.now() - startTime;
  setPerformance(prev => ({)
  averageExecutionTime: (prev.averageExecutionTime * prev.totalGenerations + executionTime) / (prev.totalGenerations + 1),
  totalGenerations: prev.totalGenerations + 1,
  successRate: ((prev.successRate * prev.totalGenerations + 100) / (prev.totalGenerations + 1)),
  lastUpdate: Date.now(),
}));
    } catch (err) {
  if (!abortController.signal.aborted) {
  const errorMessage = err instanceof Error ? err.message : 'Unknown error';
  setError(errorMessage);
  // Update performance metrics for failed generation
  if (fullConfig.enablePerformanceTracking) {
  setPerformance(prev => ({)
  ...prev,
  successRate: (prev.successRate * prev.totalGenerations) / (prev.totalGenerations + 1),
  totalGenerations: prev.totalGenerations + 1,
  lastUpdate: Date.now(),
}));
    } finally {
      if (!abortController.signal.aborted && generationId === generationCounterRef.current) {
        setIsGenerating(false);
  }, [template, variables, fullConfig, isGenerating]);
  // Debounced preview update for weight changes
  const requestPreview = useCallback((weights: WeightControlOption) => {
    if (!fullConfig.autoRefresh) return;
    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    // Set new debounced timeout
    debounceTimeoutRef.current = setTimeout(() => {
      generatePreview(weights);
    }, fullConfig.debounceMs);
  }, [generatePreview, fullConfig]);
  // Force immediate preview generation
  const forcePreview = useCallback((weights: WeightControlOption) => {
    // Clear any pending debounced calls
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    generatePreview(weights, true);
  }, [generatePreview]);
  // Refresh single variant
  const refreshVariant = useCallback(async (variantId: string): Promise<void> => {
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return;
    setIsGenerating(true);
    try {
      const startTime = performance.now();
      const selectedOptions = performWeightedSelection(variant.weightSnapshot, variant.seed + 1);
      const substitutedTemplate = substituteVariables(template, {)
  ...variables,
        ...selectedOptions
      });
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate generation
      const updatedVariant: PreviewVariant = {
        ...variant,
        result: substitutedTemplate,
        timestamp: Date.now(),
        executionTime: performance.now() - startTime,
        variables: { ...variables, ...selectedOptions }
      };
      setVariants(prev => prev.map(v => v.id === variantId ? updatedVariant : v));
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to refresh variant');
} finally {
      setIsGenerating(false);
  }, [variants, template, variables]);
  // Get variant by ID
  const getVariant = useCallback((variantId: string) => {
    return variants.find(v => v.id === variantId);
  }, [variants]);
  // Get performance insights
  const getPerformanceInsights = useCallback(() => {
  const insights: string = [];
  if (performance.averageExecutionTime > 1000) {
  insights.push('⚠️ Slow generation times detected');
} else if (performance.averageExecutionTime < 200) {
      insights.push('⚡ Fast generation performance');
    if (performance.successRate < 95) {
      insights.push('❌ High error rate detected');
    } else if (performance.successRate === 100) {
      insights.push('✅ Perfect success rate');
    if (performance.totalGenerations > 50) {
      insights.push('📊 Extensive testing performed');
    return insights;
  }, [performance]);
  // Export variants for VFX pipeline
  const exportVariants = useCallback(() => {
  return {
  template,
  variables,
  variants: variants.map(v => ({,)
  seed: v.seed,
  result: v.result,
  weights: v.weightSnapshot,
  variables: v.variables,
  timestamp: v.timestamp,
  executionTime: v.executionTime,
})),
      performance,
      exportTimestamp: Date.now();
  };
  }, [template, variables, variants, performance]);
  // Clear all variants
  const clearVariants = useCallback(() => {
  setVariants([]);
  setError(null);
  setPerformance({)
  averageExecutionTime: 0,
  totalGenerations: 0,
  successRate: 100,
  lastUpdate: Date.now(),
});
  }, []);
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    };
  }, []);
  return {
  variants,
  isGenerating,
  performance,
  error,
  // Actions
  requestPreview,
  forcePreview,
  refreshVariant,
  getVariant,
  clearVariants,
  // Utilities
  getPerformanceInsights,
  exportVariants,
  // Config
  config: fullConfig,
};
};

// Helper function for weighted selection
const performWeightedSelection = (;);
  weights: WeightControlOption,
  seed: number): Record<string, string> => {
  if (weights.length === 0) return {};
  // Create deterministic random number generator from seed
  const rng = createSeededRandom(seed);
  // Calculate total weight
  const totalWeight = weights.reduce((sum, option) => sum + option.weight, 0);
  if (totalWeight === 0) return {};
  // Perform weighted selection
  const randomValue = rng() * totalWeight;
  let currentWeight = 0;
  for (const option of weights) {
    currentWeight += option.weight;
    if (randomValue <= currentWeight) {
      return { weighted_choice: option.text };
  // Fallback to last option
  return { weighted_choice: weights[weights.length - 1].text };
};

// Simple seeded random number generator
const createSeededRandom = (seed: number) => {
  let x = seed;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
};

// Export types for use in other components
export type { PreviewVariant, PreviewPerformance, RealTimePreviewConfig };