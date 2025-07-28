// packages/core/hooks/useTemplatePreview.ts
// Real-time preview system specifically designed for template-based nodes
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  parseTemplate, 
  substituteVariables, 
  getPreviewWithSamples,
  generateSmartDefaults,
  getContextualDefaults,
  ExtractedVariable 
} from '../utils/templateParser';

export interface TemplatePreviewVariant {
  id: string;
  seed: number;
  result: string;
  timestamp: number;
  executionTime: number;
  substitutions: Record<string, string>;
  variablesUsed: string[];
  hasErrors: boolean;
  errorMessage?: string;
}

export interface TemplatePreviewPerformance {
  averageExecutionTime: number;
  totalGenerations: number;
  successRate: number;
  lastUpdate: number;
  templatesProcessed: number;
}

export interface TemplatePreviewConfig {
  maxVariants: number;
  debounceMs: number;
  enablePerformanceTracking: boolean;
  autoRefresh: boolean;
  showVariableSubstitution: boolean;
  errorOnUndefinedVariables: boolean;
}
const DEFAULT_CONFIG: TemplatePreviewConfig = {
  maxVariants: 5,
  debounceMs: 300,
  enablePerformanceTracking: true,
  autoRefresh: true,
  showVariableSubstitution: true,
  errorOnUndefinedVariables: false,
};

export const useTemplatePreview = ()
  template: string,
  variableValues: Record<string, string> = {},
  customConfig: Partial<TemplatePreviewConfig> = {}
) => {
  const config = { ...DEFAULT_CONFIG, ...customConfig };
  // Core state
  const [variants, setVariants] = useState<TemplatePreviewVariant[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [performance, setPerformance] = useState<TemplatePreviewPerformance>({)
    averageExecutionTime: 0,
    totalGenerations: 0,
    successRate: 100,
    lastUpdate: Date.now(),
    templatesProcessed: 0,
  });
  const [error, setError] = useState<string | null>(null);
  // Template parsing results
  const parseResult = useMemo(() => parseTemplate(template), [template]);
  const extractedVariables = useMemo(() => ;
    parseResult.variables.filter(v => v.isValid), 
  [parseResult.variables]
  );
  // Refs for async operations
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const generationCounterRef = useRef(0);
  // Generate sample values for undefined variables
  const generateSampleValues = useCallback((variables: ExtractedVariable[]): Record<string, string> => {
    const samples: Record<string, string> = {};
    for (const variable of variables) {
      if (!variableValues[variable.name]) {
        // First try to use the inferred default value from type inference
        if (variable.defaultValue) {
          samples[variable.name] = variable.defaultValue;
        } else {
          // Use contextual defaults based on node type and template
          const contextualDefault = getContextualDefaults(variable.name, template, undefined);
          samples[variable.name] = contextualDefault;
        }
      }
    }
    return samples;
  }, [variableValues, template]);
  // Generate intelligent sample values based on variable names
  const generateSmartSample = (variableName: string): string => {
    // Use our enhanced contextual defaults
    return getContextualDefaults(variableName, template, undefined);
  };
  // Generate preview variants
  const generatePreviews = useCallback(async (forceGeneration: boolean = false): Promise<void> => {
    if (!template.trim() || (!forceGeneration && isGenerating)) {
      return;
    }
    // Cancel any existing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setIsGenerating(true);
    setError(null);
    const startTime = performance.now();
    const generationId = ++generationCounterRef.current;
    try {
      // Check for template errors first
      if (!parseResult.isValid) {
        throw new Error(`Template error: ${parseResult.errors.map(e => e.message).join(', ')}`);}
      }
      // Generate sample values for missing variables
      const sampleValues = generateSampleValues(extractedVariables);
      const allValues = { ...sampleValues, ...variableValues };
      // Check for undefined variables if error mode is enabled
      if (config.errorOnUndefinedVariables) {
        const missingVars = extractedVariables;
          .map(v => v.name)
          .filter(name => !allValues[name]);
        if (missingVars.length > 0) {
          throw new Error(`Undefined variables: ${missingVars.join(', ')}`);}
        }
      }
      // Generate multiple variants with different seeds
      const newVariants = await Promise.all(;)
        Array.from({ length: config.maxVariants }, async (_, index) => {
          const seed = Math.floor(Math.random() * 1000000);
          // Add some randomness to sample values for variety
          const variantValues = { ...allValues };
          if (index > 0) {
            for (const variable of extractedVariables) {
              if (!variableValues[variable.name]) {
                // Generate slight variations for different seeds
                variantValues[variable.name] = generateSmartSample(variable.name);
              }
            }
          }
          // Substitute variables in template
          const result = substituteVariables(template, variantValues);
          // Simulate generation delay for realism
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 25));
          // Check if generation was aborted
          if (abortController.signal.aborted) {
            throw new Error('Generation aborted');
          }
          return {
            id: `template_variant_${generationId}_${index}`,}
            seed,
            result,
            timestamp: Date.now(),
            executionTime: performance.now() - startTime,
            substitutions: variantValues,
            variablesUsed: extractedVariables.map(v => v.name),
            hasErrors: false,
          };
        })
      );
      // Update variants if this is still the current generation
      if (!abortController.signal.aborted && generationId === generationCounterRef.current) {
        setVariants(newVariants);
        // Update performance metrics
        if (config.enablePerformanceTracking) {
          const executionTime = performance.now() - startTime;
          setPerformance(prev => ({)
            averageExecutionTime: (prev.averageExecutionTime * prev.totalGenerations + executionTime) / (prev.totalGenerations + 1),
            totalGenerations: prev.totalGenerations + 1,
            successRate: ((prev.successRate * prev.totalGenerations + 100) / (prev.totalGenerations + 1)),
            lastUpdate: Date.now(),
            templatesProcessed: prev.templatesProcessed + 1
          }));
        }
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        // Create error variant
        const errorVariant: TemplatePreviewVariant = {
          id: `error_${generationId}`,}
          seed: 0,
          result: '',
          timestamp: Date.now(),
          executionTime: performance.now() - startTime,
          substitutions: {},
          variablesUsed: [],
          hasErrors: true,
          errorMessage
        };
        setVariants([errorVariant]);
        // Update performance metrics for failed generation
        if (config.enablePerformanceTracking) {
          setPerformance(prev => ({)
            ...prev,
            successRate: (prev.successRate * prev.totalGenerations) / (prev.totalGenerations + 1),
            totalGenerations: prev.totalGenerations + 1,
            lastUpdate: Date.now(),
          }));
        }
      }
    } finally {
      if (!abortController.signal.aborted && generationId === generationCounterRef.current) {
        setIsGenerating(false);
      }
    }
  }, [template, variableValues, extractedVariables, parseResult, config, isGenerating, generateSampleValues]);
  // Debounced preview update
  const requestPreview = useCallback(() => {
    if (!config.autoRefresh) return;
    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    // Set new debounced timeout
    debounceTimeoutRef.current = setTimeout(() => {
      generatePreviews();
    }, config.debounceMs);
  }, [generatePreviews, config]);
  // Force immediate preview generation
  const forcePreview = useCallback(() => {
    // Clear any pending debounced calls
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    generatePreviews(true);
  }, [generatePreviews]);
  // Refresh single variant with new seed
  const refreshVariant = useCallback(async (variantId: string): Promise<void> => {
    const variant = variants.find(v => v.id === variantId);
    if (!variant || variant.hasErrors) return;
    const newSeed = variant.seed + Math.floor(Math.random() * 1000);
    const sampleValues = generateSampleValues(extractedVariables);
    const allValues = { ...sampleValues, ...variableValues };
    // Generate new variation
    for (const variable of extractedVariables) {
      if (!variableValues[variable.name]) {
        allValues[variable.name] = generateSmartSample(variable.name);
      }
    }
    const result = substituteVariables(template, allValues);
    const updatedVariant: TemplatePreviewVariant = {
      ...variant,
      seed: newSeed,
      result,
      timestamp: Date.now(),
      substitutions: allValues,
    };
    setVariants(prev => prev.map(v => v.id === variantId ? updatedVariant : v));
  }, [variants, extractedVariables, variableValues, template, generateSampleValues]);
  // Clear all variants
  const clearVariants = useCallback(() => {
    setVariants([]);
    setError(null);
  }, []);
  // Get performance insights
  const getPerformanceInsights = useCallback(() => {
    return {
      isPerformanceGood: performance.averageExecutionTime < 200,
      insights: [,
        `Processed ${performance.templatesProcessed} templates`,}
        `Average generation time: ${Math.round(performance.averageExecutionTime)}ms`,}
        `Success rate: ${Math.round(performance.successRate)}%`}
      ]
    };
  }, [performance]);
  // Auto-refresh when template or variables change
  useEffect(() => {
    if (template.trim()) {
      requestPreview();
    } else {
      clearVariants();
    }
    // Cleanup on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [template, variableValues, requestPreview, clearVariants]);
  return {
    // Core state
    variants,
    isGenerating,
    error,
    performance,
    // Template info
    extractedVariables: extractedVariables.map(v => v.name),
    hasTemplateErrors: !parseResult.isValid,
    templateErrors: parseResult.errors,
    // Actions
    requestPreview,
    forcePreview,
    refreshVariant,
    clearVariants,
    getPerformanceInsights
  };
};