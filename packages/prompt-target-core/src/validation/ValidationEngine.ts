import {
  PromptGraph,
  ValidationResult,
  Platform,
  ModelAdaptor,
  AutoFixAction,
  Logger,
  MetricsInterface
} from '../types/index.js';

/**
 * Comprehensive validation engine for prompt graphs
 */
export class ValidationEngine {
  private logger: Logger;
  private metrics: MetricsInterface;
  private customRules: ValidationRule[] = [];

  constructor(logger: Logger, metrics: MetricsInterface) {
    this.logger = logger;
    this.metrics = metrics;
  }

  /**
   * Validate a graph against multiple adaptors
   */
  async validateGraph(
    graph: PromptGraph,
    adaptors: ModelAdaptor[],
    options: ValidationOptions = {}
  ): Promise<ValidationReport> {
    const startTime = Date.now();
    
    this.logger.info('Starting graph validation', {
      graphId: graph.id,
      adaptorCount: adaptors.length
    });

    const report: ValidationReport = {
      graphId: graph.id,
      timestamp: new Date(),
      overallValid: true,
      totalIssues: 0,
      platformResults: new Map(),
      summary: {
        criticalErrors: 0,
        highErrors: 0,
        mediumWarnings: 0,
        lowInfos: 0
      },
      autoFixSuggestions: [],
      crossPlatformIssues: []
    };

    try {
      // Structural validation (platform-agnostic)
      const structuralResults = await this.validateStructure(graph);
      
      // Custom rule validation
      const customResults = await this.validateCustomRules(graph);
      
      // Platform-specific validation
      for (const adaptor of adaptors) {
        const platformResults = await this.validateForPlatform(graph, adaptor);
        report.platformResults.set(adaptor.platform, platformResults);
      }

      // Cross-platform analysis
      report.crossPlatformIssues = this.analyzeCrossPlatformCompatibility(
        Array.from(report.platformResults.values())
      );

      // Aggregate results
      this.aggregateResults(report, structuralResults, customResults);
      
      // Generate auto-fix suggestions
      report.autoFixSuggestions = this.generateAutoFixSuggestions(report);

      const duration = Date.now() - startTime;
      
      this.logger.info('Graph validation completed', {
        graphId: graph.id,
        overallValid: report.overallValid,
        totalIssues: report.totalIssues,
        duration
      });

      this.metrics.histogram('validation.duration', duration);
      this.metrics.counter('validation.completed', 1, {
        valid: report.overallValid.toString()
      });

      return report;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Graph validation failed', {
        graphId: graph.id,
        error: errorMessage
      });

      this.metrics.counter('validation.failed', 1);
      throw error;
    }
  }

  /**
   * Validate graph structure (platform-agnostic)
   */
  private async validateStructure(graph: PromptGraph): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Check for empty graph
    if (!graph.nodes || graph.nodes.length === 0) {
      results.push({
        id: 'empty-graph',
        type: 'error',
        severity: 'critical',
        message: 'Graph is empty',
        description: 'The prompt graph contains no nodes',
        autoFixable: false
      });
      return results;
    }

    // Check for cycles
    const cycles = this.detectCycles(graph);
    cycles.forEach((cycle, index) => {
      results.push({
        id: `cycle-${index}`,
        type: 'error',
        severity: 'high',
        message: 'Circular dependency detected',
        description: `Cycle involves nodes: ${cycle.join(' → ')}`,
        autoFixable: true,
        suggestions: [{
          type: 'fix',
          description: 'Remove one edge to break the cycle',
          action: {
            type: 'edge_remove',
            targetId: `${cycle[cycle.length - 1]}-${cycle[0]}`,
            changes: {}
          }
        }]
      });
    });

    // Check for disconnected components
    const components = this.findConnectedComponents(graph);
    if (components.length > 1) {
      results.push({
        id: 'disconnected-components',
        type: 'warning',
        severity: 'medium',
        message: 'Graph has disconnected components',
        description: `Found ${components.length} separate components`,
        autoFixable: true,
        suggestions: [{
          type: 'fix',
          description: 'Connect components or remove isolated nodes'
        }]
      });
    }

    // Check for orphaned nodes
    const connectedNodeIds = new Set<string>();
    graph.edges?.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    graph.nodes.forEach(node => {
      if (!connectedNodeIds.has(node.id) && graph.nodes.length > 1) {
        results.push({
          id: `orphaned-node-${node.id}`,
          type: 'warning',
          severity: 'low',
          message: 'Orphaned node detected',
          description: `Node "${node.data.label || node.id}" is not connected`,
          nodeId: node.id,
          autoFixable: true,
          suggestions: [{
            type: 'fix',
            description: 'Connect node to graph or remove it',
            action: {
              type: 'node_remove',
              targetId: node.id,
              changes: {}
            }
          }]
        });
      }
    });

    // Check for missing required data
    graph.nodes.forEach(node => {
      if (!node.data) {
        results.push({
          id: `missing-data-${node.id}`,
          type: 'error',
          severity: 'high',
          message: 'Node missing data',
          description: `Node "${node.id}" has no data object`,
          nodeId: node.id,
          autoFixable: true,
          suggestions: [{
            type: 'fix',
            description: 'Add default data object to node'
          }]
        });
      }
    });

    return results;
  }

  /**
   * Validate against custom rules
   */
  private async validateCustomRules(graph: PromptGraph): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const rule of this.customRules) {
      try {
        const ruleResults = await rule.validate(graph);
        results.push(...ruleResults);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.warn('Custom rule validation failed', {
          ruleId: rule.id,
          error: errorMessage
        });
      }
    }

    return results;
  }

  /**
   * Validate graph for specific platform
   */
  private async validateForPlatform(
    graph: PromptGraph,
    adaptor: ModelAdaptor
  ): Promise<PlatformValidationResult> {
    const startTime = Date.now();
    
    try {
      const results = await adaptor.validate(graph);
      const capabilities = await adaptor.capabilities();
      const quality = await adaptor.estimateQuality(graph);

      return {
        platform: adaptor.platform,
        adaptorId: adaptor.id,
        adaptorVersion: adaptor.version,
        results,
        capabilities,
        quality,
        compatible: results.filter(r => r.type === 'error').length === 0,
        duration: Date.now() - startTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Platform validation failed', {
        platform: adaptor.platform,
        adaptorId: adaptor.id,
        error: errorMessage
      });

      return {
        platform: adaptor.platform,
        adaptorId: adaptor.id,
        adaptorVersion: adaptor.version,
        results: [{
          id: 'validation-failed',
          type: 'error',
          severity: 'critical',
          message: 'Platform validation failed',
          description: errorMessage,
          autoFixable: false
        }],
        capabilities: {
          supportedNodeTypes: [],
          parameters: [],
          limitations: [],
          features: [],
          supportedFormats: []
        },
        quality: {
          overall: 0,
          fidelity: 0,
          compatibility: 0,
          performance: 0,
          completeness: 0,
          breakdown: {
            nodeTranslation: 0,
            parameterMapping: 0,
            featureSupport: 0,
            semanticPreservation: 0,
            syntaxValidity: 0
          }
        },
        compatible: false,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Analyze cross-platform compatibility issues
   */
  private analyzeCrossPlatformCompatibility(
    platformResults: PlatformValidationResult[]
  ): CrossPlatformIssue[] {
    const issues: CrossPlatformIssue[] = [];

    // Find features supported by some but not all platforms
    const allFeatures = new Set<string>();
    const platformFeatures = new Map<Platform, Set<string>>();

    platformResults.forEach(result => {
      const features = new Set<string>(
        result.capabilities.features
          .filter((f: any) => f.supported)
          .map((f: any) => f.name)
      );
      
      platformFeatures.set(result.platform, features);
      features.forEach((f: string) => allFeatures.add(f));
    });

    allFeatures.forEach(feature => {
      const supportingPlatforms = Array.from(platformFeatures.entries())
        .filter(([_, features]) => features.has(feature))
        .map(([platform, _]) => platform);

      if (supportingPlatforms.length > 0 && supportingPlatforms.length < platformResults.length) {
        issues.push({
          type: 'feature_support',
          severity: 'medium',
          feature,
          supportingPlatforms,
          unsupportedPlatforms: platformResults
            .map(r => r.platform)
            .filter(p => !supportingPlatforms.includes(p)),
          description: `Feature "${feature}" is not supported across all platforms`,
          impact: 'Reduced functionality on some platforms'
        });
      }
    });

    // Find node types with compatibility issues
    const nodeTypeSupport = new Map<string, Platform[]>();
    
    platformResults.forEach(result => {
      result.capabilities.supportedNodeTypes.forEach((nodeType: any) => {
        if (!nodeTypeSupport.has(nodeType)) {
          nodeTypeSupport.set(nodeType, []);
        }
        nodeTypeSupport.get(nodeType)!.push(result.platform);
      });
    });

    // TODO: Add more cross-platform analysis

    return issues;
  }

  /**
   * Aggregate validation results
   */
  private aggregateResults(
    report: ValidationReport,
    structuralResults: ValidationResult[],
    customResults: ValidationResult[]
  ): void {
    const allResults = [
      ...structuralResults,
      ...customResults,
      ...Array.from(report.platformResults.values())
        .flatMap(pr => pr.results)
    ];

    allResults.forEach(result => {
      report.totalIssues++;
      
      if (result.type === 'error') {
        report.overallValid = false;
        
        if (result.severity === 'critical') {
          report.summary.criticalErrors++;
        } else {
          report.summary.highErrors++;
        }
      } else if (result.type === 'warning') {
        report.summary.mediumWarnings++;
      } else {
        report.summary.lowInfos++;
      }
    });
  }

  /**
   * Generate auto-fix suggestions
   */
  private generateAutoFixSuggestions(report: ValidationReport): AutoFixSuggestion[] {
    const suggestions: AutoFixSuggestion[] = [];

    // Collect all auto-fixable issues
    const autoFixableIssues: ValidationResult[] = [];
    
    report.platformResults.forEach(platformResult => {
      autoFixableIssues.push(
        ...platformResult.results.filter(r => r.autoFixable && r.suggestions)
      );
    });

    // Group by fix type and create suggestions
    const fixGroups = new Map<string, ValidationResult[]>();
    
    autoFixableIssues.forEach(issue => {
      issue.suggestions?.forEach(suggestion => {
        if (suggestion.action) {
          const key = `${suggestion.action.type}:${suggestion.action.targetId}`;
          if (!fixGroups.has(key)) {
            fixGroups.set(key, []);
          }
          fixGroups.get(key)!.push(issue);
        }
      });
    });

    fixGroups.forEach((issues, key) => {
      const firstIssue = issues[0];
      const firstSuggestion = firstIssue.suggestions?.[0];
      
      if (firstSuggestion?.action) {
        suggestions.push({
          id: `autofix-${key}`,
          type: firstSuggestion.type,
          description: firstSuggestion.description,
          action: firstSuggestion.action,
          affectedIssues: issues.map(i => i.id),
          confidence: this.calculateFixConfidence(issues),
          impact: this.assessFixImpact(issues)
        });
      }
    });

    return suggestions;
  }

  /**
   * Detect cycles in the graph
   */
  private detectCycles(graph: PromptGraph): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    const adjacencyList = new Map<string, string[]>();
    
    // Build adjacency list
    graph.nodes.forEach(node => {
      adjacencyList.set(node.id, []);
    });
    
    graph.edges?.forEach(edge => {
      const targets = adjacencyList.get(edge.source) || [];
      targets.push(edge.target);
      adjacencyList.set(edge.source, targets);
    });

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      const neighbors = adjacencyList.get(nodeId) || [];
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          // Found cycle
          const cycleStart = path.indexOf(neighbor);
          cycles.push([...path.slice(cycleStart), neighbor]);
          return true;
        }
      }

      recursionStack.delete(nodeId);
      path.pop();
      return false;
    };

    graph.nodes.forEach(node => {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    });

    return cycles;
  }

  /**
   * Find connected components in the graph
   */
  private findConnectedComponents(graph: PromptGraph): string[][] {
    const visited = new Set<string>();
    const components: string[][] = [];

    const adjacencyList = new Map<string, string[]>();
    
    // Build undirected adjacency list
    graph.nodes.forEach(node => {
      adjacencyList.set(node.id, []);
    });
    
    graph.edges?.forEach(edge => {
      const sourceTargets = adjacencyList.get(edge.source) || [];
      const targetTargets = adjacencyList.get(edge.target) || [];
      
      sourceTargets.push(edge.target);
      targetTargets.push(edge.source);
      
      adjacencyList.set(edge.source, sourceTargets);
      adjacencyList.set(edge.target, targetTargets);
    });

    const dfs = (nodeId: string, component: string[]): void => {
      visited.add(nodeId);
      component.push(nodeId);

      const neighbors = adjacencyList.get(nodeId) || [];
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          dfs(neighbor, component);
        }
      });
    };

    graph.nodes.forEach(node => {
      if (!visited.has(node.id)) {
        const component: string[] = [];
        dfs(node.id, component);
        components.push(component);
      }
    });

    return components;
  }

  /**
   * Calculate confidence for an auto-fix suggestion
   */
  private calculateFixConfidence(issues: ValidationResult[]): number {
    // Simple heuristic: more severe issues = lower confidence for auto-fix
    const severityWeights = { critical: 0.1, high: 0.3, medium: 0.7, low: 0.9 };
    
    const avgConfidence = issues.reduce((sum, issue) => {
      return sum + (severityWeights[issue.severity] || 0.5);
    }, 0) / issues.length;

    return Math.round(avgConfidence * 100);
  }

  /**
   * Assess impact of an auto-fix
   */
  private assessFixImpact(issues: ValidationResult[]): 'low' | 'medium' | 'high' {
    const hasHighSeverity = issues.some(i => 
      i.severity === 'critical' || i.severity === 'high'
    );
    
    if (hasHighSeverity) return 'high';
    if (issues.length > 3) return 'medium';
    return 'low';
  }

  /**
   * Add custom validation rule
   */
  addCustomRule(rule: ValidationRule): void {
    this.customRules.push(rule);
    this.logger.info('Custom validation rule added', { ruleId: rule.id });
  }

  /**
   * Remove custom validation rule
   */
  removeCustomRule(ruleId: string): void {
    const index = this.customRules.findIndex(rule => rule.id === ruleId);
    if (index >= 0) {
      this.customRules.splice(index, 1);
      this.logger.info('Custom validation rule removed', { ruleId });
    }
  }
}

// Supporting interfaces and types
export interface ValidationOptions {
  includeWarnings?: boolean;
  includeLowSeverity?: boolean;
  customRules?: boolean;
}

export interface ValidationReport {
  graphId: string;
  timestamp: Date;
  overallValid: boolean;
  totalIssues: number;
  platformResults: Map<Platform, PlatformValidationResult>;
  summary: ValidationSummary;
  autoFixSuggestions: AutoFixSuggestion[];
  crossPlatformIssues: CrossPlatformIssue[];
}

export interface PlatformValidationResult {
  platform: Platform;
  adaptorId: string;
  adaptorVersion: string;
  results: ValidationResult[];
  capabilities: any;
  quality: any;
  compatible: boolean;
  duration: number;
}

export interface ValidationSummary {
  criticalErrors: number;
  highErrors: number;
  mediumWarnings: number;
  lowInfos: number;
}

export interface AutoFixSuggestion {
  id: string;
  type: 'fix' | 'alternative' | 'workaround';
  description: string;
  action: AutoFixAction;
  affectedIssues: string[];
  confidence: number; // 0-100
  impact: 'low' | 'medium' | 'high';
}

export interface CrossPlatformIssue {
  type: 'feature_support' | 'node_type' | 'parameter';
  severity: 'low' | 'medium' | 'high';
  feature?: string;
  supportingPlatforms: Platform[];
  unsupportedPlatforms: Platform[];
  description: string;
  impact: string;
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  validate(graph: PromptGraph): Promise<ValidationResult[]>;
}