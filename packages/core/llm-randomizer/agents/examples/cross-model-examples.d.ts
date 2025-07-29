export interface CrossModelTestResult {
    openai?: any;
    claude?: any;
    gemini?: any;
    comparison: {
        allSucceeded: boolean;
        successCount: number;
        totalAttempts: number;
        averageGenerationTime: number;
        consistencyScore: number;
    };

export declare class CrossModelTester {
    /**
     * Test all three models with the same request
     */
    testAllModels(baseRequest: any): Promise<CrossModelTestResult>;
    /**
     * Calculate comparison metrics
     */
    private calculateComparison;
    /**
     * Calculate consistency score between successful results
     */
    private calculateConsistencyScore;
    /**
     * Calculate similarity between two graphs (basic implementation)
     */
    private calculateGraphSimilarity;
/**
 * Predefined test cases for cross-model comparison
 */
export declare const testCases: {
    /**
     * Simple test case
     */
    simpleGreeting: {
        purpose: string;
        complexity: "simple";
        nodeCount: number;
        nodeTypes: string[];
        specificRequirements: string[];
        style: "creative";
        domain: string;
    };
    /**
     * Moderate complexity test case
     */
    contentGenerator: {
        purpose: string;
        complexity: "moderate";
        nodeCount: number;
        nodeTypes: string[];
        specificRequirements: string[];
        focusAreas: string[];
        style: "balanced";
        domain: string;
    };
    /**
     * Complex test case with advanced features
     */
    intelligentTutor: {
        purpose: string;
        complexity: "complex";
        nodeCount: number;
        nodeTypes: string[];
        specificRequirements: string[];
        focusAreas: string[];
        style: "logical";
        domain: string;
        constraints: string[];
    };
    /**
     * Creative writing assistant
     */
    storyGenerator: {
        purpose: string;
        complexity: "moderate";
        nodeCount: number;
        nodeTypes: string[];
        specificRequirements: string[];
        focusAreas: string[];
        style: "creative";
        domain: string;
        examples: string[];
    };
    /**
     * Data processing pipeline
     */
    dataProcessor: {
        purpose: string;
        complexity: "complex";
        nodeCount: number;
        nodeTypes: string[];
        specificRequirements: string[];
        focusAreas: string[];
        style: "logical";
        domain: string;
    };
};
/**
 * Run comprehensive cross-model tests
 */
export declare function runCrossModelTests(): Promise<{
    testResults: Record<string, CrossModelTestResult>;
    summary: {
        totalTests: number;
        successfulTests: number;
        averageConsistency: number;
        modelPerformance: {
            openai: {
                successRate: number;
                avgTime: number;
            };
            claude: {
                successRate: number;
                avgTime: number;
            };
            gemini: {
                successRate: number;
                avgTime: number;
            };
        };
    };
}>;
/**
 * Generate a comparative report
 */
export declare function generateTestReport(results: {)
    testResults: Record<string, CrossModelTestResult>;
    summary: any;
}): string;
//# sourceMappingURL=cross-model-examples.d.ts.map