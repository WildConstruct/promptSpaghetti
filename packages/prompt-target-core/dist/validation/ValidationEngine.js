/**
 * Comprehensive validation engine for prompt graphs
 */
export class ValidationEngine {
  constructor(logger, metrics) {
    this.customRules = [];
    this.logger = logger;
    this.metrics = metrics;
  }
  /**
   * Validate a graph against multiple adaptors
   */
  async validateGraph(graph, adaptors, options = {}) {
    const startTime = Date.now();
    this.logger.info('Starting graph validation', {
      graphId: graph.id,
      adaptorCount: adaptors.length,
    });
    const report = {
      graphId: graph.id,
      timestamp: new Date(),
      overallValid: true,
      totalIssues: 0,
      platformResults: new Map(),
      summary: {
        criticalErrors: 0,
        highErrors: 0,
        mediumWarnings: 0,
        lowInfos: 0,
      },
      autoFixSuggestions: [],
      crossPlatformIssues: [],
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
      report.crossPlatformIssues = this.analyzeCrossPlatformCompatibility(Array.from(report.platformResults.values()));
      // Add structural and custom results to each platform result
      report.platformResults.forEach((platformResult, platform) => {
        platformResult.results.unshift(...structuralResults, ...customResults);
      });
      // Aggregate results
      this.aggregateResults(report, structuralResults, customResults);
      // Generate auto-fix suggestions
      report.autoFixSuggestions = this.generateAutoFixSuggestions(report);
      const duration = Date.now() - startTime;
      this.logger.info('Graph validation completed', {
        graphId: graph.id,
        overallValid: report.overallValid,
        totalIssues: report.totalIssues,
        duration,
      });
      this.metrics.histogram('validation.duration', duration);
      this.metrics.counter('validation.completed', 1, {
        valid: report.overallValid.toString(),
      });
      return report;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Graph validation failed', {
        graphId: graph.id,
        error: errorMessage,
      });
      this.metrics.counter('validation.failed', 1);
      throw error;
    }
  }
  /**
   * Validate graph structure (platform-agnostic)
   */
  async validateStructure(graph) {
    const results = [];
    // Check for empty graph
    if (!graph.nodes || graph.nodes.length === 0) {
      results.push({
        id: 'empty-graph',
        type: 'error',
        severity: 'critical',
        message: 'Graph is empty',
        description: 'The prompt graph contains no nodes',
        autoFixable: false,
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
        suggestions: [
          {
            type: 'fix',
            description: 'Remove one edge to break the cycle',
            action: {
              type: 'edge_remove',
              targetId: `${cycle[cycle.length - 1]}-${cycle[0]}`,
              changes: {},
            },
          },
        ],
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
        suggestions: [
          {
            type: 'fix',
            description: 'Connect disconnected components or remove isolated nodes',
            action: {
              type: 'node_modify',
              targetId: 'disconnected-components',
              changes: {},
            },
          },
        ],
      });
    }
    // Check for orphaned nodes
    const connectedNodeIds = new Set();
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
          suggestions: [
            {
              type: 'fix',
              description: 'Remove orphaned node or connect it to the graph',
              action: {
                type: 'node_remove',
                targetId: node.id,
                changes: {},
              },
            },
          ],
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
          suggestions: [
            {
              type: 'fix',
              description: 'Add default data object to node',
            },
          ],
        });
      }
    });
    return results;
  }
  /**
   * Validate against custom rules
   */
  async validateCustomRules(graph) {
    const results = [];
    for (const rule of this.customRules) {
      try {
        const ruleResults = await rule.validate(graph);
        results.push(...ruleResults);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.warn('Custom rule validation failed', {
          ruleId: rule.id,
          error: errorMessage,
        });
      }
    }
    return results;
  }
  /**
   * Validate graph for specific platform
   */
  async validateForPlatform(graph, adaptor) {
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
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Platform validation failed', {
        platform: adaptor.platform,
        adaptorId: adaptor.id,
        error: errorMessage,
      });
      return {
        platform: adaptor.platform,
        adaptorId: adaptor.id,
        adaptorVersion: adaptor.version,
        results: [
          {
            id: 'validation-failed',
            type: 'error',
            severity: 'critical',
            message: 'Platform validation failed',
            description: errorMessage,
            autoFixable: false,
          },
        ],
        capabilities: {
          supportedNodeTypes: [],
          parameters: [],
          limitations: [],
          features: [],
          supportedFormats: [],
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
            syntaxValidity: 0,
          },
        },
        compatible: false,
        duration: Date.now() - startTime,
      };
    }
  }
  /**
   * Analyze cross-platform compatibility issues
   */
  analyzeCrossPlatformCompatibility(platformResults) {
    const issues = [];
    // Find features supported by some but not all platforms
    const allFeatures = new Set();
    const platformFeatures = new Map();
    platformResults.forEach(result => {
      const features = new Set(result.capabilities.features.filter(f => f.supported).map(f => f.name));
      platformFeatures.set(result.platform, features);
      features.forEach(f => allFeatures.add(f));
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
          unsupportedPlatforms: platformResults.map(r => r.platform).filter(p => !supportingPlatforms.includes(p)),
          description: `Feature "${feature}" is not supported across all platforms`,
          impact: 'Reduced functionality on some platforms',
        });
      }
    });
    // Find node types with compatibility issues
    const nodeTypeSupport = new Map();
    platformResults.forEach(result => {
      result.capabilities.supportedNodeTypes.forEach(nodeType => {
        if (!nodeTypeSupport.has(nodeType)) {
          nodeTypeSupport.set(nodeType, []);
        }
        nodeTypeSupport.get(nodeType).push(result.platform);
      });
    });
    // TODO: Add more cross-platform analysis
    return issues;
  }
  /**
   * Aggregate validation results
   */
  aggregateResults(report, structuralResults, customResults) {
    const allResults = [
      ...structuralResults,
      ...customResults,
      ...Array.from(report.platformResults.values()).flatMap(pr => pr.results),
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
  generateAutoFixSuggestions(report) {
    const suggestions = [];
    // Collect all auto-fixable issues from all platform results
    const autoFixableIssues = [];
    report.platformResults.forEach(platformResult => {
      const fixableResults = platformResult.results.filter(r => r.autoFixable);
      autoFixableIssues.push(...fixableResults);
    });
    // Group by issue type and create suggestions
    const fixGroups = new Map();
    autoFixableIssues.forEach(issue => {
      if (issue.suggestions && issue.suggestions.length > 0) {
        issue.suggestions.forEach(suggestion => {
          let key;
          if (suggestion.action && suggestion.action.targetId) {
            key = `${suggestion.action.type}:${suggestion.action.targetId}`;
          } else {
            // Fallback grouping by issue type for suggestions without actions
            key = `${issue.type}:${issue.severity}:${suggestion.type}`;
          }
          if (!fixGroups.has(key)) {
            fixGroups.set(key, []);
          }
          fixGroups.get(key).push(issue);
        });
      } else {
        // Create default suggestion for auto-fixable issues without explicit suggestions
        const key = `${issue.type}:${issue.severity}:default`;
        if (!fixGroups.has(key)) {
          fixGroups.set(key, []);
        }
        fixGroups.get(key).push(issue);
      }
    });
    // Generate suggestions from groups
    fixGroups.forEach((issues, key) => {
      const firstIssue = issues[0];
      let suggestion;
      if (firstIssue.suggestions && firstIssue.suggestions.length > 0) {
        suggestion = firstIssue.suggestions[0];
      } else {
        // Create default suggestion
        suggestion = {
          type: 'fix',
          description: `Fix ${issues.length} ${firstIssue.type}${issues.length > 1 ? 's' : ''}`,
          action: {
            type: 'node_modify',
            targetId: firstIssue.nodeId || firstIssue.edgeId || 'unknown',
            changes: {},
          },
        };
      }
      suggestions.push({
        id: `autofix-${key.replace(/:/g, '-')}`,
        type: suggestion.type || 'fix',
        description: suggestion.description,
        action: suggestion.action || {
          type: 'node_modify',
          targetId: 'unknown',
          changes: {},
        },
        affectedIssues: issues.map(i => i.id),
        confidence: this.calculateFixConfidence(issues),
        impact: this.assessFixImpact(issues),
      });
    });
    return suggestions;
  }
  /**
   * Detect cycles in the graph
   */
  detectCycles(graph) {
    const cycles = [];
    const visited = new Set();
    const recursionStack = new Set();
    const path = [];
    const adjacencyList = new Map();
    // Build adjacency list
    graph.nodes.forEach(node => {
      adjacencyList.set(node.id, []);
    });
    graph.edges?.forEach(edge => {
      const targets = adjacencyList.get(edge.source) || [];
      targets.push(edge.target);
      adjacencyList.set(edge.source, targets);
    });
    const dfs = nodeId => {
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
  findConnectedComponents(graph) {
    const visited = new Set();
    const components = [];
    const adjacencyList = new Map();
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
    const dfs = (nodeId, component) => {
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
        const component = [];
        dfs(node.id, component);
        components.push(component);
      }
    });
    return components;
  }
  /**
   * Calculate confidence for an auto-fix suggestion
   */
  calculateFixConfidence(issues) {
    // Simple heuristic: more severe issues = lower confidence for auto-fix
    const severityWeights = { critical: 0.1, high: 0.3, medium: 0.7, low: 0.9 };
    const avgConfidence =
      issues.reduce((sum, issue) => {
        return sum + (severityWeights[issue.severity] || 0.5);
      }, 0) / issues.length;
    return Math.round(avgConfidence * 100);
  }
  /**
   * Assess impact of an auto-fix
   */
  assessFixImpact(issues) {
    const hasHighSeverity = issues.some(i => i.severity === 'critical' || i.severity === 'high');
    if (hasHighSeverity) return 'high';
    if (issues.length > 3) return 'medium';
    return 'low';
  }
  /**
   * Add custom validation rule
   */
  addCustomRule(rule) {
    this.customRules.push(rule);
    this.logger.info('Custom validation rule added', { ruleId: rule.id });
  }
  /**
   * Remove custom validation rule
   */
  removeCustomRule(ruleId) {
    const index = this.customRules.findIndex(rule => rule.id === ruleId);
    if (index >= 0) {
      this.customRules.splice(index, 1);
      this.logger.info('Custom validation rule removed', { ruleId });
    }
  }
}
