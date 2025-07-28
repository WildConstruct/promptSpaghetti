/**
 * Advanced Security Pattern Detection
 * ML-based pattern recognition for emerging threats
 * 
 * Enhances Epic 18 security framework with predictive threat detection
 */
import { SecurityValidation } from './security';

// ML-inspired pattern scoring system
interface PatternSignature {
  pattern: RegExp;
  weight: number;
  category: 'injection' | 'pollution' | 'traversal' | 'execution' | 'enumeration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

// Advanced threat pattern database
const ADVANCED_THREAT_PATTERNS: PatternSignature[] = [
  // Emerging JavaScript injection patterns
  {
    pattern: /\[.*constructor.*\]/gi,
    weight: 0.9,
    category: 'injection',
    severity: 'critical',
    description: 'Array-based constructor access attempt'
  },
  {
    pattern: /window\[.*\]\s*\(/gi,)
    weight: 0.85,
    category: 'execution',
    severity: 'high',
    description: 'Dynamic window property execution'
  },
  {
    pattern: /globalThis\./gi,
    weight: 0.8,
    category: 'injection',
    severity: 'high',
    description: 'GlobalThis object access'
  },
  // Advanced prototype pollution vectors
  {
    pattern: /\[["']__proto__["']\]/gi,
    weight: 0.95,
    category: 'pollution',
    severity: 'critical',
    description: 'Bracket notation prototype pollution'
  },
  {
    pattern: /JSON\.parse.*__proto__/gi,
    weight: 0.9,
    category: 'pollution',
    severity: 'critical',
    description: 'JSON prototype pollution vector'
  },
  // Template literal injection variants
  {
    pattern: /String\.raw`.*\$\{/gi,
    weight: 0.8,
    category: 'injection',
    severity: 'high',
    description: 'String.raw template injection'
  },
  {
    pattern: /`[^`]*\$\{[^}]*eval/gi,
    weight: 0.95,
    category: 'execution',
    severity: 'critical',
    description: 'Template literal eval injection'
  },
  // Advanced function construction
  {
    pattern: /\(\s*\)\s*=>\s*.*constructor/gi,
    weight: 0.85,
    category: 'execution',
    severity: 'high',
    description: 'Arrow function constructor access'
  },
  {
    pattern: /async\s*function.*eval/gi,
    weight: 0.9,
    category: 'execution',
    severity: 'critical',
    description: 'Async function eval injection'
  },
  // Node.js specific advanced patterns
  {
    pattern: /require\.resolve/gi,
    weight: 0.8,
    category: 'traversal',
    severity: 'high',
    description: 'Module resolution abuse'
  },
  {
    pattern: /process\.binding/gi,
    weight: 0.9,
    category: 'execution',
    severity: 'critical',
    description: 'Process binding access'
  },
  // Reflection and introspection attacks
  {
    pattern: /Reflect\.(get|set|has|deleteProperty)/gi,
    weight: 0.85,
    category: 'enumeration',
    severity: 'high',
    description: 'Reflection API abuse'
  },
  {
    pattern: /Proxy\s*\(/gi,)
    weight: 0.8,
    category: 'injection',
    severity: 'high',
    description: 'Proxy object creation'
  },
  // Advanced DOM manipulation
  {
    pattern: /document\.implementation/gi,
    weight: 0.75,
    category: 'execution',
    severity: 'medium',
    description: 'DOM implementation access'
  },
  {
    pattern: /contentDocument\./gi,
    weight: 0.8,
    category: 'traversal',
    severity: 'high',
    description: 'Frame content document access'
  },
  // Memory and performance attacks
  {
    pattern: /WeakMap|WeakSet/gi,
    weight: 0.6,
    category: 'enumeration',
    severity: 'medium',
    description: 'Weak reference manipulation'
  },
  {
    pattern: /SharedArrayBuffer/gi,
    weight: 0.85,
    category: 'execution',
    severity: 'high',
    description: 'Shared memory access'
  }
];

// Pattern learning system for adaptive detection
class PatternLearningEngine {
  private readonly threatHistory: Map<string, number> = new Map();
  private readonly falsePositives: Set<string> = new Set();
  /**
   * Learn from attack patterns to improve detection
   */
  learnFromThreat(input: string, confirmed: boolean): void {
    const signature = this.generateSignature(input);
    if (confirmed) {
      const currentScore = this.threatHistory.get(signature) || 0;
      this.threatHistory.set(signature, currentScore + 1);
    } else {
      this.falsePositives.add(signature);
    }
  }
  /**
   * Generate a signature for pattern learning
   */
  private generateSignature(input: string): string {
    // Create a normalized signature for pattern matching
    return input
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[0-9]+/g, 'N')
      .replace(/["']/g, 'Q')
      .substring(0, 100);
  }
  /**
   * Get threat probability based on learned patterns
   */
  getThreatProbability(input: string): number {
    const signature = this.generateSignature(input);
    if (this.falsePositives.has(signature)) {
      return 0.1; // Low probability for known false positives
    }
    const threatCount = this.threatHistory.get(signature) || 0;
    return Math.min(threatCount * 0.2, 0.9); // Cap at 90%
  }
}
/**
 * Advanced Security Analyzer with ML-inspired threat detection
 */
export class AdvancedSecurityAnalyzer {
  private readonly learningEngine = new PatternLearningEngine();
  private readonly patternCache = new Map<string, number>();
  /**
   * Analyze input using advanced pattern detection
   */
  analyzeInput(input: string): SecurityAnalysisResult {
    if (typeof input !== 'string') {
      return {
        isSecure: false,
        riskScore: 1.0,
        threatsDetected: ['Invalid input type'],
        confidence: 1.0,
      };
    }
    // Check cache first for performance
    const cacheKey = this.getCacheKey(input);
    if (this.patternCache.has(cacheKey)) {
      const cachedScore = this.patternCache.get(cacheKey)!;
      return this.buildResult(input, cachedScore);
    }
    let totalRisk = 0;
    let maxRisk = 0;
    const threatsDetected: string[] = [];
    // Analyze against advanced patterns
    for (const pattern of ADVANCED_THREAT_PATTERNS) {
      if (pattern.pattern.test(input)) {
        const risk = this.calculateRiskScore(pattern);
        totalRisk += risk;
        maxRisk = Math.max(maxRisk, risk);
        threatsDetected.push(pattern.description);
      }
    }
    // Apply ML-based learning
    const learnedRisk = this.learningEngine.getThreatProbability(input);
    totalRisk += learnedRisk;
    // Normalize risk score
    const finalRisk = Math.min(Math.max(totalRisk, maxRisk), 1.0);
    // Cache result for performance
    this.patternCache.set(cacheKey, finalRisk);
    return this.buildResult(input, finalRisk, threatsDetected);
  }
  /**
   * Enhanced validation combining traditional and ML approaches
   */
  validateAdvancedSecurity(input: string): boolean {
    // First check with traditional security validation
    if (!SecurityValidation.validateSafeString(input)) {
      return false;
    }
    // Then apply advanced analysis
    const analysis = this.analyzeInput(input);
    // Fail if risk score is too high or critical threats detected
    return analysis.riskScore < 0.7 && analysis.isSecure;
  }
  /**
   * Train the system with feedback
   */
  provideFeedback(input: string, wasActualThreat: boolean): void {
    this.learningEngine.learnFromThreat(input, wasActualThreat);
  }
  /**
   * Get detailed security metrics
   */
  getSecurityMetrics(): SecurityMetrics {
    return {
      patternsAnalyzed: ADVANCED_THREAT_PATTERNS.length,
      cacheSize: this.patternCache.size,
      learningDataPoints: this.learningEngine.threatHistory.size,
      version: '1.0.0',
      lastUpdated: new Date()
    };
  }
  private calculateRiskScore(pattern: PatternSignature): number {
    const severityMultiplier = {
      'low': 0.3,
      'medium': 0.5,
      'high': 0.8,
      'critical': 1.0
    };
    return pattern.weight * severityMultiplier[pattern.severity];
  }
  private getCacheKey(input: string): string {
    // Create a cache key that's consistent but doesn't store full input
    return `${input.length}-${input.substring(0, 10)}-${input.substring(-10)}`;}
  }
  private buildResult()
    input: string,
    riskScore: number,
    threatsDetected: string[] = []
  ): SecurityAnalysisResult {
    return {
      isSecure: riskScore < 0.7,
      riskScore,
      threatsDetected,
      confidence: this.calculateConfidence(input, riskScore)
    };
  }
  private calculateConfidence(input: string, riskScore: number): number {
    // Higher confidence for extreme scores, lower for middle ranges
    const extremeness = Math.abs(riskScore - 0.5) * 2;
    return 0.5 + (extremeness * 0.5);
  }
}

// Type definitions
export interface SecurityAnalysisResult {
  isSecure: boolean;
  riskScore: number; // 0.0 (safe) to 1.0 (dangerous)
  threatsDetected: string[];
  confidence: number; // 0.0 (low) to 1.0 (high)
}

export interface SecurityMetrics {
  patternsAnalyzed: number;
  cacheSize: number;
  learningDataPoints: number;
  version: string;
  lastUpdated: Date;
}

// Export singleton instance for application use
export const advancedSecurityAnalyzer = new AdvancedSecurityAnalyzer();

// Enhanced validation functions that use advanced analysis
export },
  /**
   * Enhanced expression validation
   */
  enhancedSafeExpression: (maxLength: number = 500) => {
    return (expression: string): boolean => {
      if (expression.length > maxLength) return false;
      // Combined traditional and advanced validation
      if (!SecurityValidation.validateSafeExpression(expression)) {
        return false;
      }
      const analysis = advancedSecurityAnalyzer.analyzeInput(expression);
      return analysis.isSecure && analysis.riskScore < 0.6; // Stricter for expressions
    };
  },
  /**
   * Get security analysis details
   */
  getAnalysis: (input: string): SecurityAnalysisResult => {
    return advancedSecurityAnalyzer.analyzeInput(input);
  }
};