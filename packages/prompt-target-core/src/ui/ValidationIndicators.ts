import {
  ValidationReport,
  PlatformValidationResult
} from '../validation/ValidationEngine.js';
import { ValidationResult } from '../types/index.js';
import { Platform } from '../types/index.js';

/**
 * Inline validation indicators and detailed issue viewer
 */
export class ValidationIndicators {
  private indicators = new Map<string, ValidationIndicator>();
  private listeners = new Set<ValidationIndicatorListener>();

  /**
   * Create validation indicator for a graph element
   */
  createIndicator(
    elementId: string,
    elementType: 'node' | 'edge' | 'graph',
    results: ValidationResult[]
  ): ValidationIndicator {
    const indicator: ValidationIndicator = {
      id: `indicator-${elementId}`,
      elementId,
      elementType,
      results,
      severity: this.calculateOverallSeverity(results),
      visible: results.length > 0,
      position: { x: 0, y: 0 },
      style: this.getIndicatorStyle(results),
      tooltip: this.generateTooltip(results),
      timestamp: new Date()
    };

    this.indicators.set(elementId, indicator);
    this.notifyListeners('indicator_created', indicator);

    return indicator;
  }

  /**
   * Update indicator with new validation results
   */
  updateIndicator(elementId: string, results: ValidationResult[]): void {
    const indicator = this.indicators.get(elementId);
    if (indicator) {
      indicator.results = results;
      indicator.severity = this.calculateOverallSeverity(results);
      indicator.visible = results.length > 0;
      indicator.style = this.getIndicatorStyle(results);
      indicator.tooltip = this.generateTooltip(results);
      indicator.timestamp = new Date();

      this.notifyListeners('indicator_updated', indicator);
    }
  }

  /**
   * Remove indicator for an element
   */
  removeIndicator(elementId: string): void {
    const indicator = this.indicators.get(elementId);
    if (indicator) {
      this.indicators.delete(elementId);
      this.notifyListeners('indicator_removed', indicator);
    }
  }

  /**
   * Get indicator for specific element
   */
  getIndicator(elementId: string): ValidationIndicator | undefined {
    return this.indicators.get(elementId);
  }

  /**
   * Get all indicators with optional filtering
   */
  getIndicators(filter: IndicatorFilter = {}): ValidationIndicator[] {
    let filtered = Array.from(this.indicators.values());

    if (filter.elementType) {
      filtered = filtered.filter(i => i.elementType === filter.elementType);
    }

    if (filter.severity) {
      filtered = filtered.filter(i => i.severity === filter.severity);
    }

    if (filter.visible !== undefined) {
      filtered = filtered.filter(i => i.visible === filter.visible);
    }

    return filtered;
  }

  /**
   * Create detailed issue view for validation results
   */
  createDetailView(results: ValidationResult[]): ValidationDetailView {
    const groupedResults = this.groupResultsBySeverity(results);
    
    return {
      id: `detail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      results,
      groupedResults,
      summary: {
        total: results.length,
        errors: results.filter(r => r.type === 'error').length,
        warnings: results.filter(r => r.type === 'warning').length,
        infos: results.filter(r => r.type === 'info').length,
        autoFixable: results.filter(r => r.autoFixable).length
      },
      sections: this.createDetailSections(groupedResults),
      filters: this.createDetailFilters(results),
      actions: this.createDetailActions(results)
    };
  }

  /**
   * Create platform comparison view
   */
  createPlatformComparisonView(
    validationReport: ValidationReport
  ): PlatformComparisonView {
    const platforms = Array.from(validationReport.platformResults.keys());
    const comparison: PlatformComparison[] = [];

    platforms.forEach(platform => {
      const result = validationReport.platformResults.get(platform);
      if (result) {
        comparison.push({
          platform,
          compatible: result.compatible,
          quality: result.quality?.overall || 0,
          errors: result.results.filter(r => r.type === 'error').length,
          warnings: result.results.filter(r => r.type === 'warning').length,
          capabilities: {
            supportedNodeTypes: result.capabilities.supportedNodeTypes?.length || 0,
            totalFeatures: result.capabilities.features?.length || 0,
            supportedFeatures: result.capabilities.features?.filter((f: any) => f.supported).length || 0
          },
          performance: result.duration,
          recommendations: this.generatePlatformRecommendations(result)
        });
      }
    });

    return {
      id: `comparison-${validationReport.graphId}`,
      graphId: validationReport.graphId,
      timestamp: validationReport.timestamp,
      platforms: comparison,
      crossPlatformIssues: validationReport.crossPlatformIssues,
      overallCompatibility: this.calculateOverallCompatibility(comparison),
      bestPlatform: this.identifyBestPlatform(comparison),
      recommendations: this.generateCrossPlatformRecommendations(comparison)
    };
  }

  /**
   * Generate auto-fix preview
   */
  generateAutoFixPreview(
    suggestion: any,
    currentResults: ValidationResult[]
  ): AutoFixPreview {
    return {
      id: `preview-${suggestion.id}`,
      suggestion,
      currentIssues: currentResults.filter(r => 
        suggestion.affectedIssues.includes(r.id)
      ),
      expectedChanges: this.predictAutoFixChanges(suggestion),
      risks: this.assessAutoFixRisks(suggestion),
      confidence: suggestion.confidence,
      impact: suggestion.impact,
      preview: this.generatePreviewDescription(suggestion),
      warnings: this.generateAutoFixWarnings(suggestion)
    };
  }

  /**
   * Add validation indicator listener
   */
  addListener(listener: ValidationIndicatorListener): void {
    this.listeners.add(listener);
  }

  /**
   * Remove validation indicator listener
   */
  removeListener(listener: ValidationIndicatorListener): void {
    this.listeners.delete(listener);
  }

  // Private helper methods

  private calculateOverallSeverity(results: ValidationResult[]): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    if (results.length === 0) return 'none';

    const severityPriority = { critical: 4, high: 3, medium: 2, low: 1 };
    let maxSeverity = 0;

    results.forEach(result => {
      const priority = severityPriority[result.severity as keyof typeof severityPriority] || 0;
      maxSeverity = Math.max(maxSeverity, priority);
    });

    const severityMap = { 4: 'critical', 3: 'high', 2: 'medium', 1: 'low' };
    return (severityMap[maxSeverity as keyof typeof severityMap] as any) || 'low';
  }

  private getIndicatorStyle(results: ValidationResult[]): IndicatorStyle {
    const severity = this.calculateOverallSeverity(results);
    const hasAutoFix = results.some(r => r.autoFixable);

    const baseStyle: IndicatorStyle = {
      color: severity === 'critical' ? '#ef4444' : severity === 'high' ? '#f59e0b' : severity === 'medium' ? '#eab308' : '#6b7280',
      border: severity === 'critical' ? '2px solid #ef4444' : '1px solid #d1d5db',
      size: results.length > 3 ? 'large' : results.length > 1 ? 'medium' : 'small',
      shape: hasAutoFix ? 'circle-with-fix' : 'circle',
      animation: severity === 'critical' ? 'pulse' : 'none',
      badge: results.length > 1 ? results.length.toString() : undefined
    };

    switch (severity) {
    case 'critical':
      return { ...baseStyle, color: '#d32f2f', border: '2px solid #f44336' };
    case 'high':
      return { ...baseStyle, color: '#f57c00', border: '2px solid #ff9800' };
    case 'medium':
      return { ...baseStyle, color: '#fbc02d', border: '2px solid #ffeb3b' };
    case 'low':
      return { ...baseStyle, color: '#1976d2', border: '2px solid #2196f3' };
    default:
      return { ...baseStyle, color: '#9e9e9e', border: '1px solid #bdbdbd' };
    }
  }

  private generateTooltip(results: ValidationResult[]): string {
    if (results.length === 0) return '';

    const summary = results.reduce((acc, result) => {
      acc[result.type] = (acc[result.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const parts = [];
    if (summary.error) parts.push(`${summary.error} error${summary.error > 1 ? 's' : ''}`);
    if (summary.warning) parts.push(`${summary.warning} warning${summary.warning > 1 ? 's' : ''}`);
    if (summary.info) parts.push(`${summary.info} info${summary.info > 1 ? 's' : ''}`);

    return parts.join(', ');
  }

  private groupResultsBySeverity(results: ValidationResult[]): GroupedValidationResults {
    return {
      critical: results.filter(r => r.severity === 'critical'),
      high: results.filter(r => r.severity === 'high'),
      medium: results.filter(r => r.severity === 'medium'),
      low: results.filter(r => r.severity === 'low')
    };
  }

  private createDetailSections(groupedResults: GroupedValidationResults): DetailSection[] {
    const sections: DetailSection[] = [];

    if (groupedResults.critical.length > 0) {
      sections.push({
        title: 'Critical Issues',
        severity: 'critical',
        items: groupedResults.critical,
        collapsed: false,
        icon: 'error'
      });
    }

    if (groupedResults.high.length > 0) {
      sections.push({
        title: 'High Priority Issues',
        severity: 'high',
        items: groupedResults.high,
        collapsed: false,
        icon: 'warning'
      });
    }

    if (groupedResults.medium.length > 0) {
      sections.push({
        title: 'Warnings',
        severity: 'medium',
        items: groupedResults.medium,
        collapsed: true,
        icon: 'caution'
      });
    }

    if (groupedResults.low.length > 0) {
      sections.push({
        title: 'Information',
        severity: 'low',
        items: groupedResults.low,
        collapsed: true,
        icon: 'info'
      });
    }

    return sections;
  }

  private createDetailFilters(results: ValidationResult[]): DetailFilter[] {
    return [
      {
        id: 'type',
        label: 'Type',
        options: [...new Set(results.map(r => r.type))].map(type => ({
          value: type,
          label: type.charAt(0).toUpperCase() + type.slice(1),
          count: results.filter(r => r.type === type).length
        }))
      },
      {
        id: 'severity',
        label: 'Severity',
        options: [...new Set(results.map(r => r.severity))].map(severity => ({
          value: severity,
          label: severity.charAt(0).toUpperCase() + severity.slice(1),
          count: results.filter(r => r.severity === severity).length
        }))
      },
      {
        id: 'autoFixable',
        label: 'Auto-fixable',
        options: [
          {
            value: 'true',
            label: 'Auto-fixable',
            count: results.filter(r => r.autoFixable).length
          },
          {
            value: 'false',
            label: 'Manual fix required',
            count: results.filter(r => !r.autoFixable).length
          }
        ]
      }
    ];
  }

  private createDetailActions(results: ValidationResult[]): DetailAction[] {
    const actions: DetailAction[] = [];

    const autoFixableCount = results.filter(r => r.autoFixable).length;
    if (autoFixableCount > 0) {
      actions.push({
        id: 'auto-fix-all',
        label: `Auto-fix ${autoFixableCount} issue${autoFixableCount > 1 ? 's' : ''}`,
        type: 'primary',
        icon: 'auto-fix',
        enabled: true
      });
    }

    actions.push(
      {
        id: 'export-issues',
        label: 'Export Issues',
        type: 'secondary',
        icon: 'download',
        enabled: true
      },
      {
        id: 'refresh-validation',
        label: 'Re-validate',
        type: 'secondary',
        icon: 'refresh',
        enabled: true
      }
    );

    return actions;
  }

  private generatePlatformRecommendations(result: PlatformValidationResult): string[] {
    const recommendations: string[] = [];

    if (!result.compatible) {
      recommendations.push('Address validation errors before using this platform');
    }

    if (result.quality && result.quality.overall < 60) {
      recommendations.push('Consider simplifying the graph for better quality on this platform');
    }

    if (result.capabilities.limitations && result.capabilities.limitations.length > 0) {
      recommendations.push('Review platform limitations and adjust graph accordingly');
    }

    return recommendations;
  }

  private calculateOverallCompatibility(comparison: PlatformComparison[]): number {
    if (comparison.length === 0) return 0;
    
    const compatibleCount = comparison.filter(p => p.compatible).length;
    return Math.round((compatibleCount / comparison.length) * 100);
  }

  private identifyBestPlatform(comparison: PlatformComparison[]): Platform | null {
    if (comparison.length === 0) return null;

    let bestPlatform = comparison[0];
    let bestScore = this.calculatePlatformScore(bestPlatform);

    comparison.forEach(platform => {
      const score = this.calculatePlatformScore(platform);
      if (score > bestScore) {
        bestScore = score;
        bestPlatform = platform;
      }
    });

    return bestPlatform.platform;
  }

  private calculatePlatformScore(platform: PlatformComparison): number {
    let score = 0;
    
    if (platform.compatible) score += 40;
    score += (platform.quality / 100) * 30;
    score += Math.max(0, 20 - platform.errors) * 1;
    score += Math.max(0, 10 - platform.warnings) * 0.5;
    score += (platform.capabilities.supportedFeatures / Math.max(1, platform.capabilities.totalFeatures)) * 10;
    
    return Math.round(score);
  }

  private generateCrossPlatformRecommendations(comparison: PlatformComparison[]): string[] {
    const recommendations: string[] = [];

    const allCompatible = comparison.every(p => p.compatible);
    if (!allCompatible) {
      recommendations.push('Not all platforms are compatible - consider creating platform-specific variations');
    }

    const avgQuality = comparison.reduce((sum, p) => sum + p.quality, 0) / comparison.length;
    if (avgQuality < 70) {
      recommendations.push('Overall quality is below recommended threshold - consider graph optimization');
    }

    return recommendations;
  }

  private predictAutoFixChanges(suggestion: any): string[] {
    const changes: string[] = [];

    switch (suggestion.action.type) {
    case 'node_remove':
      changes.push(`Remove node: ${suggestion.action.targetId}`);
      break;
    case 'edge_remove':
      changes.push(`Remove edge: ${suggestion.action.targetId}`);
      break;
    case 'node_update':
      changes.push(`Update node: ${suggestion.action.targetId}`);
      break;
    default:
      changes.push('Apply suggested fix');
    }

    return changes;
  }

  private assessAutoFixRisks(suggestion: any): string[] {
    const risks: string[] = [];

    if (suggestion.impact === 'high') {
      risks.push('High impact change - may significantly alter graph behavior');
    }

    if (suggestion.confidence < 80) {
      risks.push('Low confidence fix - manual review recommended');
    }

    return risks;
  }

  private generatePreviewDescription(suggestion: any): string {
    return `This will ${suggestion.description.toLowerCase()}. Confidence: ${suggestion.confidence}%`;
  }

  private generateAutoFixWarnings(suggestion: any): string[] {
    const warnings: string[] = [];

    if (suggestion.affectedIssues.length > 5) {
      warnings.push('This fix affects multiple issues');
    }

    if (suggestion.impact === 'high') {
      warnings.push('This is a high-impact change');
    }

    return warnings;
  }

  private notifyListeners(event: string, data: any): void {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Validation indicator listener failed:', error);
      }
    });
  }
}

// Type definitions

export interface ValidationIndicator {
  id: string;
  elementId: string;
  elementType: 'node' | 'edge' | 'graph';
  results: ValidationResult[];
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  visible: boolean;
  position: { x: number; y: number };
  style: IndicatorStyle;
  tooltip: string;
  timestamp: Date;
}

export interface IndicatorStyle {
  color: string;
  border: string;
  size: 'small' | 'medium' | 'large';
  shape: 'circle' | 'square' | 'triangle' | 'circle-with-fix';
  animation: 'none' | 'pulse' | 'blink';
  badge?: string;
}

export interface IndicatorFilter {
  elementType?: 'node' | 'edge' | 'graph';
  severity?: 'none' | 'low' | 'medium' | 'high' | 'critical';
  visible?: boolean;
}

export interface ValidationDetailView {
  id: string;
  results: ValidationResult[];
  groupedResults: GroupedValidationResults;
  summary: {
    total: number;
    errors: number;
    warnings: number;
    infos: number;
    autoFixable: number;
  };
  sections: DetailSection[];
  filters: DetailFilter[];
  actions: DetailAction[];
}

export interface GroupedValidationResults {
  critical: ValidationResult[];
  high: ValidationResult[];
  medium: ValidationResult[];
  low: ValidationResult[];
}

export interface DetailSection {
  title: string;
  severity: string;
  items: ValidationResult[];
  collapsed: boolean;
  icon: string;
}

export interface DetailFilter {
  id: string;
  label: string;
  options: Array<{
    value: string;
    label: string;
    count: number;
  }>;
}

export interface DetailAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  icon: string;
  enabled: boolean;
}

export interface PlatformComparisonView {
  id: string;
  graphId: string;
  timestamp: Date;
  platforms: PlatformComparison[];
  crossPlatformIssues: any[];
  overallCompatibility: number;
  bestPlatform: Platform | null;
  recommendations: string[];
}

export interface PlatformComparison {
  platform: Platform;
  compatible: boolean;
  quality: number;
  errors: number;
  warnings: number;
  capabilities: {
    supportedNodeTypes: number;
    totalFeatures: number;
    supportedFeatures: number;
  };
  performance: number;
  recommendations: string[];
}

export interface AutoFixPreview {
  id: string;
  suggestion: any;
  currentIssues: ValidationResult[];
  expectedChanges: string[];
  risks: string[];
  confidence: number;
  impact: string;
  preview: string;
  warnings: string[];
}

export type ValidationIndicatorListener = (event: string, data: any) => void;