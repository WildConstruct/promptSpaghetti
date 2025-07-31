import { ValidationReport } from '../validation/ValidationEngine.js';
import { ValidationResult } from '../types/index.js';
import { Platform } from '../types/index.js';
/**
 * Inline validation indicators and detailed issue viewer
 */
export declare class ValidationIndicators {
  private indicators;
  private listeners;
  /**
   * Create validation indicator for a graph element
   */
  createIndicator(
    elementId: string,
    elementType: 'node' | 'edge' | 'graph',
    results: ValidationResult[]
  ): ValidationIndicator;
  /**
   * Update indicator with new validation results
   */
  updateIndicator(elementId: string, results: ValidationResult[]): void;
  /**
   * Remove indicator for an element
   */
  removeIndicator(elementId: string): void;
  /**
   * Get indicator for specific element
   */
  getIndicator(elementId: string): ValidationIndicator | undefined;
  /**
   * Get all indicators with optional filtering
   */
  getIndicators(filter?: IndicatorFilter): ValidationIndicator[];
  /**
   * Create detailed issue view for validation results
   */
  createDetailView(results: ValidationResult[]): ValidationDetailView;
  /**
   * Create platform comparison view
   */
  createPlatformComparisonView(validationReport: ValidationReport): PlatformComparisonView;
  /**
   * Generate auto-fix preview
   */
  generateAutoFixPreview(suggestion: any, currentResults: ValidationResult[]): AutoFixPreview;
  /**
   * Add validation indicator listener
   */
  addListener(listener: ValidationIndicatorListener): void;
  /**
   * Remove validation indicator listener
   */
  removeListener(listener: ValidationIndicatorListener): void;
  private calculateOverallSeverity;
  private getIndicatorStyle;
  private generateTooltip;
  private groupResultsBySeverity;
  private createDetailSections;
  private createDetailFilters;
  private createDetailActions;
  private generatePlatformRecommendations;
  private calculateOverallCompatibility;
  private identifyBestPlatform;
  private calculatePlatformScore;
  private generateCrossPlatformRecommendations;
  private predictAutoFixChanges;
  private assessAutoFixRisks;
  private generatePreviewDescription;
  private generateAutoFixWarnings;
  private notifyListeners;
}
export interface ValidationIndicator {
  id: string;
  elementId: string;
  elementType: 'node' | 'edge' | 'graph';
  results: ValidationResult[];
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  visible: boolean;
  position: {
    x: number;
    y: number;
  };
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
