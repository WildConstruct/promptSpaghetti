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
}
export declare class CrossModelTester {
    testAllModels(baseRequest: any): Promise<CrossModelTestResult>;
    private calculateComparison;
    private calculateConsistencyScore;
    private calculateGraphSimilarity;
}
export declare const testCases: {
    simpleGreeting: {
        purpose: string;
        complexity: "simple";
        nodeCount: number;
        nodeTypes: string[];
        specificRequirements: string[];
        style: "creative";
        domain: string;
    };
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
export declare function generateTestReport(results: {
    testResults: Record<string, CrossModelTestResult>;
    summary: any;
}): string;
//# sourceMappingURL=cross-model-examples.d.ts.map