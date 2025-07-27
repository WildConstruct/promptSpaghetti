/**
 * Advanced Security Pattern Detection
 * ML-based pattern recognition for emerging threats
 *
 * Enhances Epic 18 security framework with predictive threat detection
 */
/**
 * Advanced Security Analyzer with ML-inspired threat detection
 */
export declare class AdvancedSecurityAnalyzer {
    private readonly learningEngine;
    private readonly patternCache;
    /**
     * Analyze input using advanced pattern detection
     */
    analyzeInput(input: string): SecurityAnalysisResult;
    /**
     * Enhanced validation combining traditional and ML approaches
     */
    validateAdvancedSecurity(input: string): boolean;
    /**
     * Train the system with feedback
     */
    provideFeedback(input: string, wasActualThreat: boolean): void;
    /**
     * Get detailed security metrics
     */
    getSecurityMetrics(): SecurityMetrics;
    private calculateRiskScore;
    private getCacheKey;
    private buildResult;
    private calculateConfidence;
}
export interface SecurityAnalysisResult {
    isSecure: boolean;
    riskScore: number;
    threatsDetected: string[];
    confidence: number;
}
export interface SecurityMetrics {
    patternsAnalyzed: number;
    cacheSize: number;
    learningDataPoints: number;
    version: string;
    lastUpdated: Date;
}
export declare const advancedSecurityAnalyzer: AdvancedSecurityAnalyzer;
//# sourceMappingURL=advanced-security.d.ts.map