"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testCases = exports.CrossModelTester = void 0;
exports.runCrossModelTests = runCrossModelTests;
exports.generateTestReport = generateTestReport;
const openai_agent_1 = require("../scripts/openai-agent");
const anthropic_agent_1 = require("../scripts/anthropic-agent");
const gemini_agent_1 = require("../scripts/gemini-agent");
class CrossModelTester {
    async testAllModels(baseRequest) {
        const startTime = Date.now();
        const openAIRequest = {
            purpose: baseRequest.purpose,
            complexity: baseRequest.complexity,
            nodeCount: baseRequest.nodeCount,
            nodeTypes: baseRequest.nodeTypes || [],
            specificRequirements: baseRequest.specificRequirements,
            focusAreas: baseRequest.focusAreas,
            style: baseRequest.style,
            domain: baseRequest.domain
        };
        const claudeRequest = {
            ...openAIRequest,
            userContext: baseRequest.context
        };
        const geminiRequest = {
            ...openAIRequest,
            constraints: baseRequest.constraints,
            examples: baseRequest.examples
        };
        const [openaiResult, claudeResult, geminiResult] = await Promise.allSettled([
            (0, openai_agent_1.generateGraphWithOpenAI)(openAIRequest),
            (0, anthropic_agent_1.generateGraphWithClaude)(claudeRequest),
            (0, gemini_agent_1.generateGraphWithGemini)(geminiRequest)
        ]);
        const results = {
            openai: openaiResult.status === 'fulfilled' ? openaiResult.value : { success: false, error: openaiResult.reason },
            claude: claudeResult.status === 'fulfilled' ? claudeResult.value : { success: false, error: claudeResult.reason },
            gemini: geminiResult.status === 'fulfilled' ? geminiResult.value : { success: false, error: geminiResult.reason },
            comparison: this.calculateComparison([
                openaiResult.status === 'fulfilled' ? openaiResult.value : null,
                claudeResult.status === 'fulfilled' ? claudeResult.value : null,
                geminiResult.status === 'fulfilled' ? geminiResult.value : null
            ])
        };
        return results;
    }
    calculateComparison(results) {
        const validResults = results.filter(r => r && r.success);
        const successCount = validResults.length;
        const totalAttempts = results.reduce((sum, r) => sum + (r?.attempts || 0), 0);
        const totalTime = validResults.reduce((sum, r) => sum + (r?.metadata?.generationTime || 0), 0);
        return {
            allSucceeded: successCount === 3,
            successCount,
            totalAttempts,
            averageGenerationTime: validResults.length > 0 ? totalTime / validResults.length : 0,
            consistencyScore: this.calculateConsistencyScore(validResults)
        };
    }
    calculateConsistencyScore(results) {
        if (results.length < 2)
            return results.length > 0 ? 1.0 : 0.0;
        const graphs = results.map(r => r.graph).filter(Boolean);
        if (graphs.length < 2)
            return 0.5;
        let similarities = 0;
        let comparisons = 0;
        for (let i = 0; i < graphs.length; i++) {
            for (let j = i + 1; j < graphs.length; j++) {
                similarities += this.calculateGraphSimilarity(graphs[i], graphs[j]);
                comparisons++;
            }
        }
        return comparisons > 0 ? similarities / comparisons : 0.0;
    }
    calculateGraphSimilarity(graph1, graph2) {
        const patterns = [
            /type:\s*(\w+)/g,
            /---NODES---/,
            /---EDGES---/,
            /---END---/,
            /version:\s*[\d.]+/
        ];
        let matches = 0;
        let total = 0;
        patterns.forEach(pattern => {
            const matches1 = (graph1.match(pattern) || []).length;
            const matches2 = (graph2.match(pattern) || []).length;
            matches += Math.min(matches1, matches2);
            total += Math.max(matches1, matches2);
        });
        return total > 0 ? matches / total : 0.0;
    }
}
exports.CrossModelTester = CrossModelTester;
exports.testCases = {
    simpleGreeting: {
        purpose: "Generate personalized greetings",
        complexity: "simple",
        nodeCount: 5,
        nodeTypes: ["WeightedChoice", "GetVariable", "Concat", "Output"],
        specificRequirements: [
            "Include user's name from variable",
            "Multiple greeting options",
            "Friendly and welcoming tone"
        ],
        style: "creative",
        domain: "social interaction"
    },
    contentGenerator: {
        purpose: "Create adaptive content based on user preferences",
        complexity: "moderate",
        nodeCount: 15,
        nodeTypes: ["WeightedChoice", "Conditional", "Sequential", "Concat", "Output"],
        specificRequirements: [
            "Adapt to user's experience level",
            "Include conditional branching",
            "Support multiple content types"
        ],
        focusAreas: ["personalization", "content quality", "user experience"],
        style: "balanced",
        domain: "educational content"
    },
    intelligentTutor: {
        purpose: "Build an adaptive tutoring system that adjusts to student responses",
        complexity: "complex",
        nodeCount: 30,
        nodeTypes: ["WeightedAdvanced", "Conditional", "Sequential", "Markov", "PythonTransform", "Output"],
        specificRequirements: [
            "Track student progress dynamically",
            "Provide personalized feedback",
            "Adapt difficulty based on performance",
            "Include assessment and remediation paths"
        ],
        focusAreas: ["adaptive learning", "feedback loops", "performance tracking"],
        style: "logical",
        domain: "education technology",
        constraints: [
            "No inappropriate content",
            "Educational focus required",
            "Clear learning objectives"
        ]
    },
    storyGenerator: {
        purpose: "Generate interactive story scenarios with branching narratives",
        complexity: "moderate",
        nodeCount: 20,
        nodeTypes: ["WeightedChoice", "Conditional", "Sequential", "Markov", "Output"],
        specificRequirements: [
            "Multiple story paths",
            "Character development options",
            "Genre-appropriate content"
        ],
        focusAreas: ["narrative structure", "character development", "plot progression"],
        style: "creative",
        domain: "creative writing",
        examples: [
            "Choose-your-own-adventure style",
            "Character-driven narratives",
            "Multiple endings possible"
        ]
    },
    dataProcessor: {
        purpose: "Create a data transformation and analysis pipeline",
        complexity: "complex",
        nodeCount: 25,
        nodeTypes: ["PythonTransform", "Conditional", "Sequential", "WeightedChoice", "Output"],
        specificRequirements: [
            "Input validation and cleaning",
            "Multiple analysis methods",
            "Conditional processing based on data characteristics",
            "Output formatting options"
        ],
        focusAreas: ["data quality", "analysis accuracy", "performance optimization"],
        style: "logical",
        domain: "data science"
    }
};
async function runCrossModelTests() {
    const tester = new CrossModelTester();
    const testResults = {};
    for (const [testName, testCase] of Object.entries(exports.testCases)) {
        console.log(`Running test: ${testName}`);
        try {
            testResults[testName] = await tester.testAllModels(testCase);
        }
        catch (error) {
            console.error(`Test ${testName} failed:`, error);
            testResults[testName] = {
                comparison: {
                    allSucceeded: false,
                    successCount: 0,
                    totalAttempts: 0,
                    averageGenerationTime: 0,
                    consistencyScore: 0
                }
            };
        }
    }
    const summary = calculateSummaryStats(testResults);
    return { testResults, summary };
}
function calculateSummaryStats(testResults) {
    const tests = Object.values(testResults);
    const totalTests = tests.length;
    const successfulTests = tests.filter(t => t.comparison.allSucceeded).length;
    const consistencyScores = tests.map(t => t.comparison.consistencyScore);
    const averageConsistency = consistencyScores.reduce((sum, score) => sum + score, 0) / consistencyScores.length;
    const openaiResults = tests.map(t => t.openai).filter(Boolean);
    const claudeResults = tests.map(t => t.claude).filter(Boolean);
    const geminiResults = tests.map(t => t.gemini).filter(Boolean);
    const modelPerformance = {
        openai: {
            successRate: openaiResults.filter(r => r.success).length / Math.max(openaiResults.length, 1),
            avgTime: openaiResults.reduce((sum, r) => sum + (r.metadata?.generationTime || 0), 0) / Math.max(openaiResults.length, 1)
        },
        claude: {
            successRate: claudeResults.filter(r => r.success).length / Math.max(claudeResults.length, 1),
            avgTime: claudeResults.reduce((sum, r) => sum + (r.metadata?.generationTime || 0), 0) / Math.max(claudeResults.length, 1)
        },
        gemini: {
            successRate: geminiResults.filter(r => r.success).length / Math.max(geminiResults.length, 1),
            avgTime: geminiResults.reduce((sum, r) => sum + (r.metadata?.generationTime || 0), 0) / Math.max(geminiResults.length, 1)
        }
    };
    return {
        totalTests,
        successfulTests,
        averageConsistency,
        modelPerformance
    };
}
function generateTestReport(results) {
    const { testResults, summary } = results;
    let report = `# Cross-Model LLM Agent Test Report\n\n`;
    report += `**Generated**: ${new Date().toISOString()}\n\n`;
    report += `## Summary\n`;
    report += `- **Total Tests**: ${summary.totalTests}\n`;
    report += `- **Successful Tests**: ${summary.successfulTests} (${((summary.successfulTests / summary.totalTests) * 100).toFixed(1)}%)\n`;
    report += `- **Average Consistency**: ${(summary.averageConsistency * 100).toFixed(1)}%\n\n`;
    report += `## Model Performance\n`;
    Object.entries(summary.modelPerformance).forEach(([model, perf]) => {
        report += `- **${model.toUpperCase()}**: ${(perf.successRate * 100).toFixed(1)}% success, ${perf.avgTime.toFixed(0)}ms avg\n`;
    });
    report += `\n## Detailed Results\n\n`;
    Object.entries(testResults).forEach(([testName, result]) => {
        report += `### ${testName}\n`;
        report += `- **Success Count**: ${result.comparison.successCount}/3\n`;
        report += `- **Consistency**: ${(result.comparison.consistencyScore * 100).toFixed(1)}%\n`;
        report += `- **Avg Generation Time**: ${result.comparison.averageGenerationTime.toFixed(0)}ms\n\n`;
    });
    return report;
}
//# sourceMappingURL=cross-model-examples.js.map