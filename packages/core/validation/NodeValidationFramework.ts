/**
 * Node Validation Framework
 * Epic 18 - Add Node Validation (E18-1753114562073-6B8498)
 * 
 * Comprehensive validation framework for runtime nodes with security, type safety, and performance validation
 */
import { z } from 'zod';
import { ValidationResult, ValidationHelpers, AdvancedNodeData, AdvancedNodeConfig } from '../runtime/advanced';
import { IOPortDefinition, IOConstraints } from '../runtime/io-system';


export interface NodeValidationConfig { /** Enable strict type checking */
  strictTypeValidation: boolean;
  /** Enable security validation (injection attacks, dangerous operations) */
  securityValidation: boolean;
  /** Enable performance validation (memory, execution time) */
  performanceValidation: boolean;
  /** Enable schema validation against node configuration */
  schemaValidation: boolean;
  /** Maximum execution depth to prevent infinite recursion */
  maxExecutionDepth: number;
  /** Maximum memory usage per node (bytes) */
  maxMemoryUsage: number;
  /** Maximum execution time per node (milliseconds) */
  maxExecutionTime: number }



export interface NodeValidationResult extends ValidationResult { /** Security-specific validation results */
  security: {,
  passed: boolean;
  threats: SecurityThreat;
  riskLevel: 'low' | 'medium' | 'high' | 'critical' }
};
  /** Performance-specific validation results */
  performance: { ,
  passed: boolean;
  issues: PerformanceIssue;
  estimatedMemoryUsage: number;
  estimatedExecutionTime: number };
  /** Type safety validation results */
  typeSafety: { ,
  passed: boolean;
  typeErrors: TypeError;
  compatibility: 'full' | 'partial' | 'incompatible' }
};
  /** Schema validation results */
  schema: { ,
  passed: boolean;
  schemaErrors: string };


export interface SecurityThreat { type: 'injection' | 'eval' | 'prototype_pollution' | 'xss' | 'unsafe_function' | 'dangerous_import' }
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  recommendation: string;




export interface PerformanceIssue { type: 'memory' | 'execution_time' | 'infinite_loop' | 'inefficient_algorithm' }
  severity: 'low' | 'medium' | 'high';
  description: string;
  impact: string;
  suggestion: string;




export interface TypeError {
  expected: string;
  actual: string;
  field: string;
  description: string;
  /**
  * Core Node Validation Framework
  * Provides comprehensive validation for runtime nodes
  */


export class NodeValidationFramework {
  private config: NodeValidationConfig;
  private securityPatterns: Map<string, RegExp>;
  constructor(config: Partial<NodeValidationConfig> = {}) { this.config = {
  strictTypeValidation: true
  securityValidation: true
  performanceValidation: true
  schemaValidation: true
  maxExecutionDepth: 100
  maxMemoryUsage: 50 * 1024 * 1024, // 50MB
  maxExecutionTime: 10000, // 10 seconds }
  ...config
};
    this.initializeSecurityPatterns();
  /**
   * Initialize security threat detection patterns
   */
  private initializeSecurityPatterns(): void { this.securityPatterns = new Map([)
      // JavaScript injection patterns
      ['eval_usage', /\beval\s*\(/gi])
      ['function_constructor', /new\s+Function\s*\(/gi])
      ['dangerous_globals', /\b(window|document|global|process)\b/gi]
      // Prototype pollution
      ['prototype_pollution', /__proto__|constructor\.prototype|Object\.prototype/gi] }
      // Code injection via template literals
      ['template_injection', /\$\{.*\}/g]
      // Import/require injection
      ['dynamic_import', /import\s*\(\s*[^)]*\$\{ |require\s*\(\s*[^)]*\$\{/gi]
      // Dangerous functions
      ['dangerous_functions', /\b(setTimeout|setInterval|execSync|spawn|exec)\s*\(/gi])
    ]);
  /**
   * Comprehensive node validation
   */
  validateNode(nodeData: AdvancedNodeData): NodeValidationResult {
  const result: NodeValidationResult = {
  valid: true
  errors: []
  warnings: []
  security: {
  passed: true
  threats: []
  riskLevel: 'low' }

  performance: { 
  passed: true
  issues: []
  estimatedMemoryUsage: 0
  estimatedExecutionTime: 0 }

  typeSafety: { 
  passed: true
  typeErrors: []
  compatibility: 'full' }

  schema: { 
  passed: true
  schemaErrors: [] }
};
    // Run all validation checks
    if (this.config.securityValidation) {
      this.validateSecurity(nodeData, result);
    if (this.config.performanceValidation) {
      this.validatePerformance(nodeData, result);
    if (this.config.strictTypeValidation) {
      this.validateTypeSafety(nodeData, result);
    if (this.config.schemaValidation) {
      this.validateSchema(nodeData, result);
    // Update overall validation status
    result.valid = result.security.passed && 
                  result.performance.passed && 
                  result.typeSafety.passed && 
                  result.schema.passed;
    return result;
  /**
   * Security validation - detect injection attacks and dangerous operations
   */
  private validateSecurity(nodeData: AdvancedNodeData, result: NodeValidationResult): void {
    const threats: SecurityThreat = [];
    // Check all string values in node data for security threats
    this.scanForThreats(nodeData.data, threats, 'data');
    // Check node configuration
    if (nodeData.config) {
      this.scanForThreats(nodeData.config as any, threats, 'config');
    // Specific checks for different node types
    this.validateNodeTypeSpecificSecurity(nodeData, threats);
    result.security.threats = threats;
    result.security.passed = threats.length === 0 || threats.every(t => t.severity === 'low');
    result.security.riskLevel = this.calculateRiskLevel(threats);
    if (!result.security.passed) {
      result.errors.push(`Security validation failed: ${threats.length} threat(s) detected`);}
  /**
   * Recursively scan object for security threats
   */
  private scanForThreats(obj: any, threats: SecurityThreat, location: string): void { if (typeof obj === 'string') {
      this.scanStringForThreats(obj, threats, location) } else if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        this.scanForThreats(value, threats, `${location}.${key}`);}
 else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        this.scanForThreats(item, threats, `${location}[${index}]`);}
      });
  /**
   * Scan individual string for security patterns
   */
  private scanStringForThreats(text: string, threats: SecurityThreat, location: string): void { for (const [threatType, pattern] of this.securityPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        threats.push({)
  type: this.getSecurityThreatType(threatType)
          severity: this.getSecurityThreatSeverity(threatType) }
          description: `Detected ${threatType}: ${matches[0]}`}

          location
          recommendation: this.getSecurityRecommendation(threatType);
  });
  /**
   * Node type-specific security validation
   */
  private validateNodeTypeSpecificSecurity(nodeData: AdvancedNodeData, threats: SecurityThreat): void { switch (nodeData.type) {
  case 'Conditional':
  this.validateConditionalSecurity(nodeData, threats);
  break;
  case 'PythonTransform':
  this.validatePythonTransformSecurity(nodeData, threats);
  break;
  // Add more node type-specific validations as needed
  /**
  * Validate Conditional node security (expression evaluation)
  */
  private validateConditionalSecurity(nodeData: AdvancedNodeData, threats: SecurityThreat): void {
  const expression = nodeData.data.condition;
  if (typeof expression === 'string') {
  // Check for dangerous expression patterns
  if (/\beval\b|\bFunction\b|\bexec\b/.test(expression)) {
  threats.push({)
  type: 'eval'
  severity: 'critical'
  description: 'Conditional expression contains dangerous evaluation functions'
  location: 'data.condition'
  recommendation: 'Use safe expression evaluator instead of eval()' }
});
  /**
   * Validate Python transform node security
   */
  private validatePythonTransformSecurity(nodeData: AdvancedNodeData, threats: SecurityThreat): void { const code = nodeData.data.code;
  if (typeof code === 'string') {
  // Check for dangerous Python patterns
  if (/\b(exec|eval|__import__|compile|globals|locals)\b/.test(code)) {
  threats.push({)
  type: 'injection'
  severity: 'high'
  description: 'Python code contains potentially dangerous functions'
  location: 'data.code'
  recommendation: 'Use restricted execution environment or whitelist safe functions' }
});
  /**
   * Performance validation - memory usage, execution time, infinite loops
   */
  private validatePerformance(nodeData: AdvancedNodeData, result: NodeValidationResult): void { const issues: PerformanceIssue = [];
    // Check for potential infinite loops
    this.validateInfiniteLoops(nodeData, issues);
    // Estimate memory usage
    const estimatedMemory = this.estimateMemoryUsage(nodeData);
    result.performance.estimatedMemoryUsage = estimatedMemory;
    if (estimatedMemory > this.config.maxMemoryUsage) {
      issues.push({)
  type: 'memory'
        severity: 'high' }
        description: `Estimated memory usage (${Math.round(estimatedMemory / 1024)}KB) exceeds limit`}

  impact: 'May cause out of memory errors'
        suggestion: 'Reduce data size or implement streaming';
  });
    // Estimate execution time
    const estimatedTime = this.estimateExecutionTime(nodeData);
    result.performance.estimatedExecutionTime = estimatedTime;
    if (estimatedTime > this.config.maxExecutionTime) { issues.push({)
  type: 'execution_time'
        severity: 'high' }
        description: `Estimated execution time (${estimatedTime}ms) exceeds limit`}

  impact: 'May cause UI blocking or timeouts'
        suggestion: 'Optimize algorithm or use worker thread';
  });
    result.performance.issues = issues;
    result.performance.passed = issues.every(issue => issue.severity === 'low');
    if (!result.performance.passed) {
      result.warnings.push(`Performance validation found ${issues.length} issue(s)`);}
  /**
   * Detect potential infinite loops
   */
  private validateInfiniteLoops(nodeData: AdvancedNodeData, issues: PerformanceIssue): void { // Check for recursive patterns in node configuration
  if (nodeData.type === 'Sequential' && nodeData.data.pattern === 'cyclical') {
  const items = nodeData.data.items || [];
  if (items.length === 0) {
  issues.push({)
  type: 'infinite_loop'
  severity: 'high'
  description: 'Cyclical Sequential node with no items will loop infinitely'
  impact: 'Will freeze application'
  suggestion: 'Add termination condition or default items' }
});
    if (nodeData.type === 'Markov' && nodeData.data.transitionMatrix) { // Check for states with no exit conditions
      const matrix = nodeData.data.transitionMatrix;
      for (const [state, transitions] of Object.entries(matrix)) {
        const totalWeight = Object.values(;);
          transitions as Record<string
          number>
        ).reduce((sum, weight) => sum + weight, 0);
        if (totalWeight === 0) {
          issues.push({)
  type: 'infinite_loop'
            severity: 'medium' }
            description: `Markov state '${state}' has no valid transitions`}

  impact: 'May get stuck in infinite loop'
            suggestion: 'Add transition weights or termination condition';
  });
  /**
   * Type safety validation
   */
  private validateTypeSafety(nodeData: AdvancedNodeData, result: NodeValidationResult): void {
    const typeErrors: TypeError = [];
    // Validate node data types against expected schema
    this.validateNodeDataTypes(nodeData, typeErrors);
    // Validate I/O port compatibility
    this.validateIOPortTypes(nodeData, typeErrors);
    result.typeSafety.typeErrors = typeErrors;
    result.typeSafety.passed = typeErrors.length === 0;
    result.typeSafety.compatibility = typeErrors.length === 0 ? 'full' : 
      typeErrors.some(e => e.field.includes('required')) ? 'incompatible' : 'partial';
    if (!result.typeSafety.passed) {
      result.errors.push(`Type safety validation failed: ${typeErrors.length} type error(s)`);}
  /**
   * Schema validation against node configuration
   */
  private validateSchema(nodeData: AdvancedNodeData, result: NodeValidationResult): void { const schemaErrors: string = [];
  try {
  // Validate basic node structure
  const nodeSchema = z.object({)
  id: z.string().min(1)
  type: z.string().min(1)
  config: z.object({)
  deterministic: z.boolean()
  cacheable: z.boolean()
  stateful: z.boolean() }
})
        data: z.record(z.any());
  });
      const validation = nodeSchema.safeParse(nodeData);
      if (!validation.success) {
        validation.error.errors.forEach(error => {)
  schemaErrors.push(`Schema error: ${error.path.join('.')} - ${error.message}`);}
        });
 catch (error) {
      schemaErrors.push(`Schema validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);}
    result.schema.schemaErrors = schemaErrors;
    result.schema.passed = schemaErrors.length === 0;
    if (!result.schema.passed) {
      result.errors.push(`Schema validation failed: ${schemaErrors.length} error(s)`);}
  // Helper methods for validation
  private validateNodeDataTypes(nodeData: AdvancedNodeData, typeErrors: TypeError): void { // Implementation for type validation based on node type
  // This would be expanded based on specific node type requirements
  private validateIOPortTypes(nodeData: AdvancedNodeData, typeErrors: TypeError): void {
  // Implementation for I/O port type validation
  // This would validate input/output port compatibility
  private estimateMemoryUsage(nodeData: AdvancedNodeData): number {
  // Simple heuristic - in real implementation this would be more sophisticated
  const dataSize = JSON.stringify(nodeData).length * 2; // Unicode overhead;
  const multiplier = this.getNodeTypeMemoryMultiplier(nodeData.type);
  return dataSize * multiplier;
  private estimateExecutionTime(nodeData: AdvancedNodeData): number {
  // Simple heuristic - in real implementation this would use profiling data
  const baseTime = 10; // 10ms base;
  const multiplier = this.getNodeTypeTimeMultiplier(nodeData.type);
  const dataComplexity = this.calculateDataComplexity(nodeData);
  return baseTime * multiplier * dataComplexity;
  private getNodeTypeMemoryMultiplier(nodeType: string): number {
  const multipliers: Record<string, number> = {
  'WeightedChoice': 1.0
  'Sequential': 1.5
  'Markov': 2.0
  'PythonTransform': 3.0
  'default': 1.0 }
};
    return multipliers[nodeType] || multipliers.default;
  private getNodeTypeTimeMultiplier(nodeType: string): number { const multipliers: Record<string, number> = {
  'WeightedChoice': 1.0
  'Conditional': 1.2
  'Sequential': 1.5
  'Markov': 2.0
  'PythonTransform': 5.0
  'default': 1.0 }
};
    return multipliers[nodeType] || multipliers.default;
  private calculateDataComplexity(nodeData: AdvancedNodeData): number { // Simple complexity based on data size and structure depth
  const str = JSON.stringify(nodeData.data);
  const size = str.length;
  const depth = this.getObjectDepth(nodeData.data);
  return Math.max(1, Math.log10(size) * depth / 10);
  private getObjectDepth(obj: any, depth = 0): number {
  if (typeof obj !== 'object' || obj === null) return depth;
  const depths = Object.values(obj).map(value => this.getObjectDepth(value, depth + 1));
  return Math.max(depth, ...depths);
  private calculateRiskLevel(threats: SecurityThreat): 'low' | 'medium' | 'high' | 'critical' {
  if (threats.some(t => t.severity === 'critical')) return 'critical';
  if (threats.some(t => t.severity === 'high')) return 'high';
  if (threats.some(t => t.severity === 'medium')) return 'medium';
  return 'low';
  private getSecurityThreatType(threatType: string): SecurityThreat['type'] {
  const typeMap: Record<string, SecurityThreat['type']> = {
  'eval_usage': 'eval'
  'function_constructor': 'eval'
  'dangerous_globals': 'unsafe_function'
  'prototype_pollution': 'prototype_pollution'
  'template_injection': 'injection'
  'dynamic_import': 'dangerous_import'
  'dangerous_functions': 'unsafe_function' }
};
    return typeMap[threatType] || 'injection';
  private getSecurityThreatSeverity(threatType: string): SecurityThreat['severity'] { const severityMap: Record<string, SecurityThreat['severity']> = {
  'eval_usage': 'critical'
  'function_constructor': 'critical'
  'dangerous_globals': 'high'
  'prototype_pollution': 'high'
  'template_injection': 'medium'
  'dynamic_import': 'high'
  'dangerous_functions': 'medium' }
};
    return severityMap[threatType] || 'medium';
  private getSecurityRecommendation(threatType: string): string { const recommendations: Record<string, string> = {
  'eval_usage': 'Use safe expression evaluator or AST-based evaluation'
  'function_constructor': 'Use predefined functions or safe evaluation methods'
  'dangerous_globals': 'Avoid accessing global objects, use sandbox environment'
  'prototype_pollution': 'Validate and sanitize object properties'
  'template_injection': 'Use parameterized templates with input validation'
  'dynamic_import': 'Use static imports or whitelist allowed modules'
  'dangerous_functions': 'Use safe alternatives or implement timeouts' }
};
    return recommendations[threatType] || 'Review and sanitize input data';
/**
 * Validation utilities for common validation scenarios
 */
export class NodeValidationUtils {
  /**
   * Quick security check for user input
   */
  static validateUserInput(input: string): SecurityThreat {
    const framework = new NodeValidationFramework({ securityValidation: true });
    const threats: SecurityThreat = [];
    framework['scanStringForThreats'](input, threats, 'user_input');
    return threats;
  /**
   * Quick performance estimate
   */
  static estimateNodePerformance(nodeData: AdvancedNodeData): { memory: number; time: number } {
    const framework = new NodeValidationFramework({ performanceValidation: true });
    return { memory: framework['estimateMemoryUsage'](nodeData)
  time: framework['estimateExecutionTime'](nodeData) }
};
  /**
   * Batch validate multiple nodes
   */
  static validateNodeBatch(nodes: AdvancedNodeData): NodeValidationResult {
    const framework = new NodeValidationFramework();
    return nodes.map(node => framework.validateNode(node));

export default NodeValidationFramework;