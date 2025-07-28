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
    /**
    * Test all three models with the same request
    */
    testAllModels(baseRequest: any): Promise<CrossModelTestResult>;
}
//# sourceMappingURL=cross-model-examples.d.ts.map