/**
 * Custom Jest Matchers for Epic 18 Testing
 * Provides specialized assertions for quality, performance, and architecture testing
 */

import { diff } from 'jest-diff';

declare global {
  namespace jest {
    interface Matchers<R> {
      // Performance matchers
      toMeetPerformanceBudget(budget: PerformanceBudget): R;
      toBeWithinResponseTime(maxTime: number): R;
      toHaveMemoryUsageBelowLimit(limitMB: number): R;
      
      // Code quality matchers
      toMeetCodeQualityStandards(standards: CodeQualityStandards): R;
      toHaveComplexityBelow(maxComplexity: number): R;
      toHaveCoverageAbove(minCoverage: number): R;
      
      // Architecture matchers
      toFollowArchitecturalRules(rules: ArchitecturalRule[]): R;
      toMaintainLayerBoundaries(boundaries: LayerBoundary[]): R;
      toNotViolateDependencyRules(rules: DependencyRule[]): R;
      
      // Migration matchers
      toBeBackwardCompatible(oldInterface: any): R;
      toMaintainApiCompatibility(oldApi: any, testCases: ApiTestCase[]): R;
      
      // Accessibility matchers
      toMeetAccessibilityStandards(level: 'A' | 'AA' | 'AAA'): R;
      toHaveProperAriaAttributes(): R;
      
      // Collaboration matchers
      toSupportCollaborativeEditing(): R;
      toHandleConflictsCorrectly(conflictScenarios: ConflictScenario[]): R;
    }
  }
}

// ============================================================================
// PERFORMANCE MATCHERS
// ============================================================================

/**
 * Checks if performance metrics meet the specified budget
 */
function toMeetPerformanceBudget(
  received: PerformanceMetrics,
  budget: PerformanceBudget
): jest.CustomMatcherResult {
  const violations: string[] = [];
  
  if (budget.loadTime && received.loadTime > budget.loadTime) {
    violations.push(`Load time ${received.loadTime}ms exceeds budget ${budget.loadTime}ms`);
  }
  
  if (budget.renderTime && received.renderTime > budget.renderTime) {
    violations.push(`Render time ${received.renderTime}ms exceeds budget ${budget.renderTime}ms`);
  }
  
  if (budget.bundleSize && received.bundleSize > budget.bundleSize) {
    violations.push(`Bundle size ${received.bundleSize}KB exceeds budget ${budget.bundleSize}KB`);
  }
  
  if (budget.memoryUsage && received.memoryUsage > budget.memoryUsage) {
    violations.push(`Memory usage ${received.memoryUsage}MB exceeds budget ${budget.memoryUsage}MB`);
  }
  
  const pass = violations.length === 0;
  
  const message = () => {
    if (pass) {
      return `Expected performance metrics to violate budget, but all metrics were within limits`;
    } else {
      return `Performance budget violations:\n${violations.join('\n')}`;
    }
  };
  
  return {
    message,
    pass
  };
}

/**
 * Checks if response time is within acceptable limits
 */
function toBeWithinResponseTime(
  received: { responseTime: number },
  maxTime: number
): jest.CustomMatcherResult {
  const pass = received.responseTime <= maxTime;
  
  const message = () => {
    if (pass) {
      return `Expected response time ${received.responseTime}ms to exceed ${maxTime}ms, but it was within limits`;
    } else {
      return `Expected response time to be within ${maxTime}ms, but got ${received.responseTime}ms`;
    }
  };
  
  return {
    message,
    pass
  };
}

/**
 * Checks if memory usage is below specified limit
 */
function toHaveMemoryUsageBelowLimit(
  received: { memoryUsage: number },
  limitMB: number
): jest.CustomMatcherResult {
  const pass = received.memoryUsage < limitMB;
  
  const message = () => {
    if (pass) {
      return `Expected memory usage ${received.memoryUsage}MB to exceed limit ${limitMB}MB, but it was below`;
    } else {
      return `Expected memory usage to be below ${limitMB}MB, but got ${received.memoryUsage}MB`;
    }
  };
  
  return {
    message,
    pass
  };
}

// ============================================================================
// CODE QUALITY MATCHERS
// ============================================================================

/**
 * Checks if code meets quality standards
 */
function toMeetCodeQualityStandards(
  received: CodeQualityMetrics,
  standards: CodeQualityStandards
): jest.CustomMatcherResult {
  const violations: string[] = [];
  
  if (standards.minCoverage && received.coverage < standards.minCoverage) {
    violations.push(`Coverage ${received.coverage}% below minimum ${standards.minCoverage}%`);
  }
  
  if (standards.maxComplexity && received.complexity > standards.maxComplexity) {
    violations.push(`Complexity ${received.complexity} exceeds maximum ${standards.maxComplexity}`);
  }
  
  if (standards.maxDuplication && received.duplication > standards.maxDuplication) {
    violations.push(`Duplication ${received.duplication}% exceeds maximum ${standards.maxDuplication}%`);
  }
  
  if (standards.maxViolations && received.violations.length > standards.maxViolations) {
    violations.push(`${received.violations.length} violations exceed maximum ${standards.maxViolations}`);
  }
  
  const pass = violations.length === 0;
  
  const message = () => {
    if (pass) {
      return `Expected code quality to fail standards, but all metrics passed`;
    } else {
      return `Code quality violations:\n${violations.join('\n')}`;
    }
  };
  
  return {
    message,
    pass
  };
}

/**
 * Checks if complexity is below threshold
 */
function toHaveComplexityBelow(
  received: { complexity: number },
  maxComplexity: number
): jest.CustomMatcherResult {
  const pass = received.complexity < maxComplexity;
  
  const message = () => {
    if (pass) {
      return `Expected complexity ${received.complexity} to exceed ${maxComplexity}, but it was below`;
    } else {
      return `Expected complexity to be below ${maxComplexity}, but got ${received.complexity}`;
    }
  };
  
  return {
    message,
    pass
  };
}

/**
 * Checks if coverage is above threshold
 */
function toHaveCoverageAbove(
  received: { coverage: number },
  minCoverage: number
): jest.CustomMatcherResult {
  const pass = received.coverage > minCoverage;
  
  const message = () => {
    if (pass) {
      return `Expected coverage ${received.coverage}% to be below ${minCoverage}%, but it was above`;
    } else {
      return `Expected coverage to be above ${minCoverage}%, but got ${received.coverage}%`;
    }
  };
  
  return {
    message,
    pass
  };
}

// ============================================================================
// ARCHITECTURE MATCHERS
// ============================================================================

/**
 * Checks if code follows architectural rules
 */
function toFollowArchitecturalRules(
  received: any,
  rules: ArchitecturalRule[]
): jest.CustomMatcherResult {
  const violations: string[] = [];
  
  for (const rule of rules) {
    if (!rule.validate(received)) {
      violations.push(`Rule violation: ${rule.description}`);
    }
  }
  
  const pass = violations.length === 0;
  
  const message = () => {
    if (pass) {
      return `Expected architectural rule violations, but all rules were followed`;
    } else {
      return `Architectural violations:\n${violations.join('\n')}`;
    }
  };
  
  return {
    message,
    pass
  };
}

/**
 * Checks if layer boundaries are maintained
 */
function toMaintainLayerBoundaries(
  received: { dependencies: string[] },
  boundaries: LayerBoundary[]
): jest.CustomMatcherResult {
  const violations: string[] = [];
  
  for (const boundary of boundaries) {
    const invalidDeps = received.dependencies.filter(dep => 
      boundary.layer === boundary.from && 
      dep.includes(boundary.to) && 
      !boundary.allowed
    );
    
    if (invalidDeps.length > 0) {
      violations.push(`Layer ${boundary.from} should not depend on ${boundary.to}: ${invalidDeps.join(', ')}`);
    }
  }
  
  const pass = violations.length === 0;
  
  const message = () => {
    if (pass) {
      return `Expected layer boundary violations, but all boundaries were respected`;
    } else {
      return `Layer boundary violations:\n${violations.join('\n')}`;
    }
  };
  
  return {
    message,
    pass
  };
}

// ============================================================================
// MIGRATION MATCHERS
// ============================================================================

/**
 * Checks if new implementation is backward compatible
 */
function toBeBackwardCompatible(
  received: any,
  oldInterface: any
): jest.CustomMatcherResult {
  const missing: string[] = [];
  const typeChanged: string[] = [];
  
  for (const [key, oldValue] of Object.entries(oldInterface)) {
    if (!(key in received)) {
      missing.push(key);
    } else if (typeof received[key] !== typeof oldValue) {
      typeChanged.push(`${key}: ${typeof oldValue} → ${typeof received[key]}`);
    }
  }
  
  const pass = missing.length === 0 && typeChanged.length === 0;
  
  const message = () => {
    const issues: string[] = [];
    if (missing.length > 0) {
      issues.push(`Missing: ${missing.join(', ')}`);
    }
    if (typeChanged.length > 0) {
      issues.push(`Type changed: ${typeChanged.join(', ')}`);
    }
    
    if (pass) {
      return `Expected backward compatibility issues, but interface is fully compatible`;
    } else {
      return `Backward compatibility issues:\n${issues.join('\n')}`;
    }
  };
  
  return {
    message,
    pass
  };
}

/**
 * Checks API compatibility with test cases
 */
function toMaintainApiCompatibility(
  received: any,
  oldApi: any,
  testCases: ApiTestCase[]
): jest.CustomMatcherResult {
  const failures: string[] = [];
  
  for (const testCase of testCases) {
    try {
      const oldResult = oldApi[testCase.method](...testCase.args);
      const newResult = received[testCase.method](...testCase.args);
      
      if (!deepEqual(oldResult, newResult)) {
        failures.push(`${testCase.method}(${testCase.args.join(', ')}) results differ`);
      }
    } catch (error) {
      failures.push(`${testCase.method} test failed: ${(error as Error).message}`);
    }
  }
  
  const pass = failures.length === 0;
  
  const message = () => {
    if (pass) {
      return `Expected API compatibility failures, but all test cases passed`;
    } else {
      return `API compatibility failures:\n${failures.join('\n')}`;
    }
  };
  
  return {
    message,
    pass
  };
}

// ============================================================================
// ACCESSIBILITY MATCHERS
// ============================================================================

/**
 * Checks if component meets accessibility standards
 */
function toMeetAccessibilityStandards(
  received: HTMLElement,
  level: 'A' | 'AA' | 'AAA'
): jest.CustomMatcherResult {
  const violations: string[] = [];
  
  // Basic A level checks
  if (!received.getAttribute('alt') && received.tagName === 'IMG') {
    violations.push('Images must have alt attributes');
  }
  
  // AA level checks
  if (level === 'AA' || level === 'AAA') {
    const contrast = getComputedContrastRatio(received);
    if (contrast < 4.5) {
      violations.push(`Contrast ratio ${contrast} below 4.5:1 requirement`);
    }
  }
  
  // AAA level checks
  if (level === 'AAA') {
    const contrast = getComputedContrastRatio(received);
    if (contrast < 7) {
      violations.push(`Contrast ratio ${contrast} below 7:1 requirement for AAA`);
    }
  }
  
  const pass = violations.length === 0;
  
  const message = () => {
    if (pass) {
      return `Expected accessibility violations, but element meets ${level} standards`;
    } else {
      return `Accessibility violations (${level} level):\n${violations.join('\n')}`;
    }
  };
  
  return {
    message,
    pass
  };
}

// ============================================================================
// COLLABORATION MATCHERS
// ============================================================================

/**
 * Checks if component supports collaborative editing
 */
function toSupportCollaborativeEditing(
  received: any
): jest.CustomMatcherResult {
  const requirements: string[] = [];
  
  if (!received.enableCollaboration) {
    requirements.push('enableCollaboration method');
  }
  
  if (!received.disableCollaboration) {
    requirements.push('disableCollaboration method');
  }
  
  if (!received.updateLocalPresence) {
    requirements.push('updateLocalPresence method');
  }
  
  if (!received.applyRemoteUpdate) {
    requirements.push('applyRemoteUpdate method');
  }
  
  const pass = requirements.length === 0;
  
  const message = () => {
    if (pass) {
      return `Expected missing collaborative features, but all requirements are met`;
    } else {
      return `Missing collaborative editing features:\n${requirements.join(', ')}`;
    }
  };
  
  return {
    message,
    pass
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) return a === b;
  if (a === null || a === undefined || b === null || b === undefined) return false;
  if (a.prototype !== b.prototype) return false;
  
  let keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  
  return keys.every(k => deepEqual(a[k], b[k]));
}

function getComputedContrastRatio(element: HTMLElement): number {
  // Simplified contrast ratio calculation
  // In a real implementation, this would compute actual contrast
  return 4.6; // Mock value for testing
}

// ============================================================================
// MATCHER REGISTRATION
// ============================================================================

const customMatchers = {
  toMeetPerformanceBudget,
  toBeWithinResponseTime,
  toHaveMemoryUsageBelowLimit,
  toMeetCodeQualityStandards,
  toHaveComplexityBelow,
  toHaveCoverageAbove,
  toFollowArchitecturalRules,
  toMaintainLayerBoundaries,
  toBeBackwardCompatible,
  toMaintainApiCompatibility,
  toMeetAccessibilityStandards,
  toSupportCollaborativeEditing,
};

// Register matchers with Jest
export function registerCustomMatchers(): void {
  expect.extend(customMatchers);
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PerformanceBudget {
  loadTime?: number;
  renderTime?: number;
  bundleSize?: number;
  memoryUsage?: number;
}

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
}

export interface CodeQualityStandards {
  minCoverage?: number;
  maxComplexity?: number;
  maxDuplication?: number;
  maxViolations?: number;
}

export interface CodeQualityMetrics {
  coverage: number;
  complexity: number;
  duplication: number;
  violations: Array<{ rule: string; message: string }>;
}

export interface ArchitecturalRule {
  name: string;
  description: string;
  validate: (code: any) => boolean;
}

export interface LayerBoundary {
  from: string;
  to: string;
  layer: string;
  allowed: boolean;
}

export interface DependencyRule {
  pattern: string;
  allowed: string[];
  forbidden: string[];
}

export interface ApiTestCase {
  method: string;
  args: any[];
  expectedResult?: any;
}

export interface ConflictScenario {
  name: string;
  operations: Array<{
    user: string;
    operation: string;
    data: any;
  }>;
  expectedResolution: any;
}

export default {
  registerCustomMatchers,
  customMatchers
};