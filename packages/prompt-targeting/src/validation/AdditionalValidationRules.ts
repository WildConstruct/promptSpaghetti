/**
 * Additional validation rules for enhanced validation capabilities
 * Epic 10.2.3 - Validation Rules System Extensions
 */

import { ValidationRule, ValidationRuleResult, ValidationContext, ValidationCategory, ValidationSeverity } from './ValidationRulesEngine';

/**
 * Validates that all nodes have valid and required properties
 */
export class MissingRequiredPropertiesRule implements ValidationRule {
  id = 'missing-required-properties';
  name = 'Missing Required Properties Check';
  description = 'Validates that nodes have required properties';
  category = ValidationCategory.STRUCTURE;
  severity = ValidationSeverity.ERROR;
  enabled = true;

  private readonly requiredPropertiesByType: Record<string, string[]> = {
    'output': ['text', 'content'],
    'input': ['name'],
    'transform': ['template', 'content'],
    'conditional': ['condition'],
    'loop': ['iterations'],
    'variable': ['name', 'value']
  };

  applies() { return true; }

  async validate(context: ValidationContext): Promise<ValidationRuleResult> {
    const { graph } = context;
    
    if (!graph.nodes || graph.nodes.length === 0) {
      return {
        passed: true,
        message: 'No nodes to validate'
      };
    }

    const missingPropsNodes: Array<{nodeId: string, missing: string[]}> = [];

    for (const node of graph.nodes) {
      const nodeType = (node.type || node.data?.type || '').toLowerCase();
      const nodeData = node.data || {};
      const requiredProps = this.requiredPropertiesByType[nodeType] || [];

      if (requiredProps.length > 0) {
        const missingProps: string[] = [];

        for (const prop of requiredProps) {
          // Check if at least one required property exists and has content
          const hasProperty = requiredProps.some(p => {
            const value = nodeData[p];
            return value !== undefined && value !== null && String(value).trim().length > 0;
          });

          if (!hasProperty && !missingProps.length) {
            missingProps.push(...requiredProps.filter(p => !nodeData[p] || String(nodeData[p]).trim().length === 0));
          }
        }

        if (missingProps.length > 0) {
          missingPropsNodes.push({ nodeId: node.id, missing: missingProps });
        }
      }
    }

    if (missingPropsNodes.length > 0) {
      const affectedNodes = missingPropsNodes.map(n => n.nodeId);
      const totalMissing = missingPropsNodes.reduce((sum, n) => sum + n.missing.length, 0);

      return {
        passed: false,
        message: `${missingPropsNodes.length} node(s) missing required properties (${totalMissing} total)`,
        details: {
          affectedNodeCount: missingPropsNodes.length,
          totalMissingProperties: totalMissing,
          missingByNode: missingPropsNodes
        },
        affectedNodes
      };
    }

    return {
      passed: true,
      message: 'All nodes have required properties',
      details: { nodesChecked: graph.nodes.length }
    };
  }

  getSuggestion(): string {
    return 'Add missing required properties to nodes or provide default values';
  }

  async autoFix(context: ValidationContext): Promise<{ fixed: boolean; changes: any[] }> {
    const changes: any[] = [];
    let fixed = false;

    if (context.graph.nodes) {
      for (const node of context.graph.nodes) {
        const nodeType = (node.type || node.data?.type || '').toLowerCase();
        const nodeData = node.data || {};
        const requiredProps = this.requiredPropertiesByType[nodeType] || [];

        for (const prop of requiredProps) {
          if (!nodeData[prop] || String(nodeData[prop]).trim().length === 0) {
            // Add default value based on property type
            const defaultValue = this.getDefaultValue(prop, nodeType);
            nodeData[prop] = defaultValue;
            
            fixed = true;
            changes.push({
              nodeId: node.id,
              type: 'property_added',
              property: prop,
              value: defaultValue
            });
          }
        }
      }
    }

    return { fixed, changes };
  }

  private getDefaultValue(property: string, nodeType: string): string {
    const defaults: Record<string, string> = {
      text: `[${nodeType} content]`,
      content: `[${nodeType} content]`,
      template: `[${nodeType} template]`,
      name: `${nodeType}_${Date.now()}`,
      condition: 'true',
      iterations: '1',
      value: ''
    };

    return defaults[property] || `[${property}]`;
  }
}

/**
 * Detects duplicate content across nodes
 */
export class DuplicateContentRule implements ValidationRule {
  id = 'duplicate-content';
  name = 'Duplicate Content Check';
  description = 'Detects duplicate content in the graph';
  category = ValidationCategory.CONTENT;
  severity = ValidationSeverity.WARNING;
  enabled = true;

  applies() { return true; }

  async validate(context: ValidationContext): Promise<ValidationRuleResult> {
    const { graph } = context;
    
    if (!graph.nodes || graph.nodes.length < 2) {
      return {
        passed: true,
        message: 'Insufficient nodes for duplicate detection'
      };
    }

    const contentMap = new Map<string, string[]>(); // content -> nodeIds[]
    const contentFields = ['text', 'content', 'prompt', 'template'];

    // Extract and normalize content from all nodes
    for (const node of graph.nodes) {
      const nodeData = node.data || {};
      
      for (const field of contentFields) {
        if (nodeData[field]) {
          const content = String(nodeData[field]).trim().toLowerCase();
          
          if (content.length > 10) { // Only check substantial content
            if (!contentMap.has(content)) {
              contentMap.set(content, []);
            }
            contentMap.get(content)!.push(node.id);
          }
        }
      }
    }

    // Find duplicates
    const duplicates = Array.from(contentMap.entries())
      .filter(([_, nodeIds]) => nodeIds.length > 1);

    if (duplicates.length > 0) {
      const totalDuplicateNodes = duplicates.reduce((sum, [_, nodeIds]) => sum + nodeIds.length, 0);
      const affectedNodes = duplicates.flatMap(([_, nodeIds]) => nodeIds);

      return {
        passed: false,
        message: `Found ${duplicates.length} duplicate content pattern(s) affecting ${totalDuplicateNodes} node(s)`,
        details: {
          duplicatePatterns: duplicates.length,
          affectedNodeCount: totalDuplicateNodes,
          duplicates: duplicates.map(([content, nodeIds]) => ({
            content: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
            nodeIds,
            duplicateCount: nodeIds.length
          }))
        },
        affectedNodes
      };
    }

    return {
      passed: true,
      message: 'No duplicate content detected',
      details: { contentPatternsChecked: contentMap.size }
    };
  }

  getSuggestion(): string {
    return 'Review and modify duplicate content to ensure variation and uniqueness';
  }
}

/**
 * Validates language consistency across content
 */
export class LanguageConsistencyRule implements ValidationRule {
  id = 'language-consistency';
  name = 'Language Consistency Check';
  description = 'Validates language consistency across content';
  category = ValidationCategory.CONTENT;
  severity = ValidationSeverity.INFO;
  enabled = true;

  private readonly languagePatterns: Record<string, RegExp[]> = {
    english: [
      /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/gi,
      /\b(this|that|these|those|here|there)\b/gi
    ],
    spanish: [
      /\b(el|la|los|las|y|o|pero|en|de|con|por|para)\b/gi,
      /\b(este|esta|estos|estas|aquí|allí)\b/gi
    ],
    french: [
      /\b(le|la|les|et|ou|mais|dans|de|avec|par|pour)\b/gi,
      /\b(ce|cette|ces|ici|là)\b/gi
    ],
    german: [
      /\b(der|die|das|und|oder|aber|in|auf|mit|von|für)\b/gi,
      /\b(dieser|diese|dieses|hier|dort)\b/gi
    ]
  };

  applies() { return true; }

  async validate(context: ValidationContext): Promise<ValidationRuleResult> {
    const { graph } = context;
    
    if (!graph.nodes || graph.nodes.length === 0) {
      return {
        passed: true,
        message: 'No content to analyze for language consistency'
      };
    }

    const contentTexts: Array<{nodeId: string, content: string}> = [];
    const contentFields = ['text', 'content', 'prompt', 'template'];

    // Extract content from all nodes
    for (const node of graph.nodes) {
      const nodeData = node.data || {};
      
      for (const field of contentFields) {
        if (nodeData[field]) {
          const content = String(nodeData[field]).trim();
          if (content.length > 20) { // Only analyze substantial content
            contentTexts.push({ nodeId: node.id, content });
          }
        }
      }
    }

    if (contentTexts.length < 2) {
      return {
        passed: true,
        message: 'Insufficient content for language consistency analysis'
      };
    }

    // Detect languages for each content piece
    const languageDetections = contentTexts.map(({ nodeId, content }) => ({
      nodeId,
      content,
      languages: this.detectLanguages(content)
    }));

    // Find language inconsistencies
    const languageCounts = new Map<string, number>();
    for (const detection of languageDetections) {
      for (const lang of detection.languages) {
        languageCounts.set(lang, (languageCounts.get(lang) || 0) + 1);
      }
    }

    const primaryLanguage = Array.from(languageCounts.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    if (!primaryLanguage) {
      return {
        passed: true,
        message: 'Unable to determine primary language'
      };
    }

    const inconsistentNodes = languageDetections
      .filter(detection => !detection.languages.includes(primaryLanguage))
      .map(detection => detection.nodeId);

    if (inconsistentNodes.length > 0) {
      const consistencyScore = ((languageDetections.length - inconsistentNodes.length) / languageDetections.length) * 100;

      return {
        passed: consistencyScore >= 80,
        message: `Language inconsistency detected (${Math.round(consistencyScore)}% consistency)`,
        details: {
          primaryLanguage,
          consistencyScore: Math.round(consistencyScore),
          inconsistentNodeCount: inconsistentNodes.length,
          totalContentNodes: languageDetections.length,
          languageDistribution: Object.fromEntries(languageCounts)
        },
        affectedNodes: inconsistentNodes,
        metrics: { consistencyScore: consistencyScore / 100 }
      };
    }

    return {
      passed: true,
      message: `Language consistency is good (primary: ${primaryLanguage})`,
      details: {
        primaryLanguage,
        consistencyScore: 100,
        contentNodesAnalyzed: languageDetections.length
      },
      metrics: { consistencyScore: 1 }
    };
  }

  private detectLanguages(content: string): string[] {
    const detectedLanguages: string[] = [];
    
    for (const [language, patterns] of Object.entries(this.languagePatterns)) {
      let matchCount = 0;
      
      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) {
          matchCount += matches.length;
        }
      }
      
      // If we found enough matches, consider this language present
      const wordCount = content.split(/\s+/).length;
      const matchRatio = matchCount / wordCount;
      
      if (matchRatio > 0.05) { // At least 5% of words match language patterns
        detectedLanguages.push(language);
      }
    }
    
    return detectedLanguages.length > 0 ? detectedLanguages : ['unknown'];
  }

  getSuggestion(): string {
    return 'Ensure consistent language usage across all content or clearly separate multilingual sections';
  }
}

/**
 * Detects potentially sensitive or inappropriate content
 */
export class SensitiveContentRule implements ValidationRule {
  id = 'sensitive-content';
  name = 'Sensitive Content Check';
  description = 'Detects potentially sensitive or inappropriate content';
  category = ValidationCategory.SECURITY;
  severity = ValidationSeverity.WARNING;
  enabled = true;

  private readonly sensitivePatterns = [
    // Personal Information
    /\b\d{3}-\d{2}-\d{4}\b/g, // SSN pattern
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card pattern
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email pattern
    
    // Potentially harmful content
    /\b(password|secret|confidential|classified)\b/gi,
    /\b(violence|harm|hate|discrimination)\b/gi,
    /\b(illegal|fraud|scam|phishing)\b/gi,
    
    // Inappropriate content indicators
    /\b(explicit|nsfw|adult|mature)\b/gi
  ];

  private readonly sensitiveCategories = [
    'Personal Information',
    'Confidential Data',
    'Potentially Harmful',
    'Inappropriate Content'
  ];

  applies() { return true; }

  async validate(context: ValidationContext): Promise<ValidationRuleResult> {
    const { graph } = context;
    
    if (!graph.nodes || graph.nodes.length === 0) {
      return {
        passed: true,
        message: 'No content to scan for sensitive information'
      };
    }

    const sensitiveFindings: Array<{
      nodeId: string;
      category: string;
      pattern: string;
      matches: number;
    }> = [];

    const contentFields = ['text', 'content', 'prompt', 'template'];

    for (const node of graph.nodes) {
      const nodeData = node.data || {};
      
      for (const field of contentFields) {
        if (nodeData[field]) {
          const content = String(nodeData[field]);
          
          for (let i = 0; i < this.sensitivePatterns.length; i++) {
            const pattern = this.sensitivePatterns[i];
            const matches = content.match(pattern);
            
            if (matches && matches.length > 0) {
              sensitiveFindings.push({
                nodeId: node.id,
                category: this.sensitiveCategories[Math.floor(i / 2)] || 'Unknown',
                pattern: pattern.source,
                matches: matches.length
              });
            }
          }
        }
      }
    }

    if (sensitiveFindings.length > 0) {
      const affectedNodes = [...new Set(sensitiveFindings.map(f => f.nodeId))];
      const totalMatches = sensitiveFindings.reduce((sum, f) => sum + f.matches, 0);

      return {
        passed: false,
        message: `Potentially sensitive content detected in ${affectedNodes.length} node(s) (${totalMatches} pattern matches)`,
        details: {
          findingCount: sensitiveFindings.length,
          affectedNodeCount: affectedNodes.length,
          totalMatches,
          categories: [...new Set(sensitiveFindings.map(f => f.category))],
          findings: sensitiveFindings.slice(0, 10) // Limit to first 10 findings
        },
        affectedNodes
      };
    }

    return {
      passed: true,
      message: 'No sensitive content patterns detected',
      details: { 
        patternsChecked: this.sensitivePatterns.length,
        nodesScanned: graph.nodes.length
      }
    };
  }

  getSuggestion(): string {
    return 'Review and remove or sanitize sensitive information before deployment';
  }

  async autoFix(context: ValidationContext): Promise<{ fixed: boolean; changes: any[] }> {
    const changes: any[] = [];
    let fixed = false;

    if (context.graph.nodes) {
      for (const node of context.graph.nodes) {
        const nodeData = node.data || {};
        const contentFields = ['text', 'content', 'prompt', 'template'];

        for (const field of contentFields) {
          if (nodeData[field]) {
            const originalContent = String(nodeData[field]);
            let sanitizedContent = originalContent;

            // Sanitize sensitive patterns
            for (const pattern of this.sensitivePatterns) {
              if (pattern.test(sanitizedContent)) {
                sanitizedContent = sanitizedContent.replace(pattern, '[REDACTED]');
                fixed = true;
              }
            }

            if (sanitizedContent !== originalContent) {
              nodeData[field] = sanitizedContent;
              changes.push({
                nodeId: node.id,
                type: 'content_sanitized',
                field,
                original: originalContent.substring(0, 100),
                sanitized: sanitizedContent.substring(0, 100)
              });
            }
          }
        }
      }
    }

    return { fixed, changes };
  }
}

/**
 * Estimates and validates processing time for the graph
 */
export class ProcessingTimeRule implements ValidationRule {
  id = 'processing-time';
  name = 'Processing Time Check';
  description = 'Estimates processing time for the graph';
  category = ValidationCategory.PERFORMANCE;
  severity = ValidationSeverity.WARNING;
  enabled = true;

  private readonly nodeProcessingTimes: Record<string, number> = {
    'output': 0.1,
    'input': 0.05,
    'transform': 0.5,
    'conditional': 0.2,
    'loop': 1.0,
    'variable': 0.05,
    'api-call': 2.0,
    'ai-generation': 5.0
  };

  applies() { return true; }

  async validate(context: ValidationContext): Promise<ValidationRuleResult> {
    const { graph, metadata } = context;
    
    if (!graph.nodes || graph.nodes.length === 0) {
      return {
        passed: true,
        message: 'No nodes to estimate processing time',
        metrics: { estimatedTime: 0 }
      };
    }

    let totalEstimatedTime = 0;
    let complexityMultiplier = 1;

    // Calculate base processing time
    for (const node of graph.nodes) {
      const nodeType = (node.type || node.data?.type || 'output').toLowerCase();
      const baseTime = this.nodeProcessingTimes[nodeType] || 0.1;
      
      // Factor in content complexity
      const content = this.extractContent(node.data || {});
      const contentComplexity = Math.min(5, content.length / 1000); // Max 5x multiplier
      
      totalEstimatedTime += baseTime * (1 + contentComplexity);
    }

    // Factor in graph complexity
    const nodeCount = graph.nodes.length;
    const edgeCount = graph.edges?.length || 0;
    
    if (nodeCount > 20) {
      complexityMultiplier *= 1 + ((nodeCount - 20) * 0.1);
    }
    
    if (edgeCount > nodeCount) {
      complexityMultiplier *= 1 + ((edgeCount - nodeCount) * 0.05);
    }

    totalEstimatedTime *= complexityMultiplier;

    // Apply metadata if available
    if (metadata?.estimatedTokens) {
      // Add time for token processing (rough estimate)
      totalEstimatedTime += metadata.estimatedTokens * 0.001;
    }

    // Determine if processing time is acceptable
    const warningThreshold = 30; // 30 seconds
    const errorThreshold = 120; // 2 minutes

    let passed = true;
    let message = `Estimated processing time: ${totalEstimatedTime.toFixed(1)} seconds`;

    if (totalEstimatedTime > errorThreshold) {
      passed = false;
      message = `Processing time may be excessive (${totalEstimatedTime.toFixed(1)}s > ${errorThreshold}s)`;
    } else if (totalEstimatedTime > warningThreshold) {
      passed = false;
      message = `Processing time is elevated (${totalEstimatedTime.toFixed(1)}s > ${warningThreshold}s)`;
    }

    return {
      passed,
      message,
      details: {
        estimatedTime: Math.round(totalEstimatedTime * 100) / 100,
        complexityMultiplier: Math.round(complexityMultiplier * 100) / 100,
        nodeCount,
        edgeCount,
        warningThreshold,
        errorThreshold
      },
      metrics: {
        estimatedTime: totalEstimatedTime,
        complexity: complexityMultiplier
      }
    };
  }

  private extractContent(nodeData: any): string {
    const contentFields = ['text', 'content', 'prompt', 'template'];
    
    for (const field of contentFields) {
      if (nodeData[field] && typeof nodeData[field] === 'string') {
        return nodeData[field].trim();
      }
    }
    
    return '';
  }

  getSuggestion(): string {
    return 'Consider simplifying the graph or breaking it into smaller components to reduce processing time';
  }
}

/**
 * Estimates memory usage for graph processing
 */
export class MemoryUsageRule implements ValidationRule {
  id = 'memory-usage';
  name = 'Memory Usage Check';
  description = 'Estimates memory usage for graph processing';
  category = ValidationCategory.PERFORMANCE;
  severity = ValidationSeverity.INFO;
  enabled = true;

  private readonly nodeMemoryUsage: Record<string, number> = {
    'output': 1, // 1KB base
    'input': 0.5,
    'transform': 2,
    'conditional': 1,
    'loop': 5,
    'variable': 0.5,
    'api-call': 10,
    'ai-generation': 50
  };

  applies() { return true; }

  async validate(context: ValidationContext): Promise<ValidationRuleResult> {
    const { graph } = context;
    
    if (!graph.nodes || graph.nodes.length === 0) {
      return {
        passed: true,
        message: 'No nodes to estimate memory usage',
        metrics: { estimatedMemoryKB: 0 }
      };
    }

    let totalMemoryKB = 0;

    // Calculate memory usage for each node
    for (const node of graph.nodes) {
      const nodeType = (node.type || node.data?.type || 'output').toLowerCase();
      const baseMemory = this.nodeMemoryUsage[nodeType] || 1;
      
      // Factor in content size
      const content = this.extractContent(node.data || {});
      const contentMemoryKB = content.length / 1024; // Rough estimate
      
      totalMemoryKB += baseMemory + contentMemoryKB;
    }

    // Add overhead for graph structure
    const graphOverheadKB = (graph.nodes.length * 0.1) + ((graph.edges?.length || 0) * 0.05);
    totalMemoryKB += graphOverheadKB;

    // Determine if memory usage is acceptable
    const warningThresholdMB = 100; // 100MB
    const errorThresholdMB = 500; // 500MB
    
    const totalMemoryMB = totalMemoryKB / 1024;

    let passed = true;
    let message = `Estimated memory usage: ${totalMemoryMB.toFixed(1)} MB`;

    if (totalMemoryMB > errorThresholdMB) {
      passed = false;
      message = `Memory usage may be excessive (${totalMemoryMB.toFixed(1)}MB > ${errorThresholdMB}MB)`;
    } else if (totalMemoryMB > warningThresholdMB) {
      passed = true; // Warning level, not failure
      message = `Memory usage is elevated (${totalMemoryMB.toFixed(1)}MB > ${warningThresholdMB}MB)`;
    }

    return {
      passed,
      message,
      details: {
        estimatedMemoryKB: Math.round(totalMemoryKB),
        estimatedMemoryMB: Math.round(totalMemoryMB * 100) / 100,
        nodeCount: graph.nodes.length,
        edgeCount: graph.edges?.length || 0,
        warningThresholdMB,
        errorThresholdMB
      },
      metrics: {
        memoryKB: totalMemoryKB,
        memoryMB: totalMemoryMB
      }
    };
  }

  private extractContent(nodeData: any): string {
    const contentFields = ['text', 'content', 'prompt', 'template'];
    
    for (const field of contentFields) {
      if (nodeData[field] && typeof nodeData[field] === 'string') {
        return nodeData[field];
      }
    }
    
    return '';
  }

  getSuggestion(): string {
    return 'Consider reducing content size or breaking the graph into smaller components to reduce memory usage';
  }
}