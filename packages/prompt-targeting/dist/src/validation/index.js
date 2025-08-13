/**
 * Validation system index file
 * Epic 10.2.3 - Validation Rules System with Severity Levels
 */
// Import types needed for factory function
import { ValidationRulesEngine, ValidationSeverity, ValidationCategory } from './ValidationRulesEngine';
// Export main validation engine
export { ValidationRulesEngine, ValidationSeverity, ValidationCategory } from './ValidationRulesEngine';
// Export additional validation rules
export { MissingRequiredPropertiesRule, DuplicateContentRule, LanguageConsistencyRule, SensitiveContentRule, ProcessingTimeRule, MemoryUsageRule } from './AdditionalValidationRules';
/**
 * Factory function to create a validation engine with recommended configuration
 */
export function createValidationEngine(config) {
    const defaultConfig = {
        enabledCategories: Object.values(ValidationCategory),
        minSeverity: ValidationSeverity.INFO,
        enableAutoFix: false,
        maxExecutionTime: 10000,
        parallelExecution: true,
        enableMetrics: true
    };
    return new ValidationRulesEngine({ ...defaultConfig, ...config });
    /**
     * Factory function to create a strict validation engine for production
     */
    export function createStrictValidationEngine() {
        return new ValidationRulesEngine({
            enabledCategories: Object.values(ValidationCategory),
            minSeverity: ValidationSeverity.WARNING,
            enableAutoFix: false,
            maxExecutionTime: 15000,
            parallelExecution: true,
            enableMetrics: true
        });
        /**
         * Factory function to create a development validation engine with auto-fix
         */
        export function createDevelopmentValidationEngine() {
            return new ValidationRulesEngine({
                enabledCategories: Object.values(ValidationCategory),
                minSeverity: ValidationSeverity.INFO,
                enableAutoFix: true,
                maxExecutionTime: 30000,
                parallelExecution: false, // Sequential for better debugging
                enableMetrics: true
            });
            /**
             * Factory function to create a security-focused validation engine
             */
            export function createSecurityValidationEngine() {
                return new ValidationRulesEngine({
                    enabledCategories: [ValidationCategory.SECURITY, ValidationCategory.CONTENT],
                    minSeverity: ValidationSeverity.INFO,
                    enableAutoFix: true,
                    maxExecutionTime: 20000,
                    parallelExecution: true,
                    enableMetrics: true
                });
                /**
                 * Factory function to create a performance-focused validation engine
                 */
                export function createPerformanceValidationEngine() {
                    return new ValidationRulesEngine({
                        enabledCategories: [ValidationCategory.PERFORMANCE, ValidationCategory.STRUCTURE],
                        minSeverity: ValidationSeverity.INFO,
                        enableAutoFix: false,
                        maxExecutionTime: 5000,
                        parallelExecution: true,
                        enableMetrics: true
                    });
                    /**
                     * Utility function to validate a graph with automatic platform detection
                     */
                    export async function validateGraph(graph, targetPlatform, capabilities, config) {
                        const engine = createValidationEngine(config);
                        // Auto-detect platform if not provided
                        const detectedPlatform = targetPlatform || detectPlatformFromGraph(graph) || 'generic';
                        // Auto-generate basic capabilities if not provided
                        const detectedCapabilities = capabilities || generateBasicCapabilities(detectedPlatform);
                        const context = {
                            graph,
                            targetPlatform: detectedPlatform,
                            capabilities: detectedCapabilities,
                            metadata: {
                                nodeCount: graph.nodes?.length || 0,
                                edgeCount: graph.edges?.length || 0,
                                complexity: calculateBasicComplexity(graph),
                                estimatedTokens: estimateTokenCount(graph)
                            },
                            return: engine.validate(context),
                            /**
                             * Utility function to validate and auto-fix a graph
                             */
                            function: validateAndFixGraph(graph, any, targetPlatform ?  : string, capabilities ?  : any), Promise() {
                                report: ValidationReport;
                                fixes: Array;
                                modifiedGraph: any;
                                    > {
                                        const: engine = createDevelopmentValidationEngine(),
                                        const: detectedPlatform = targetPlatform || detectPlatformFromGraph(graph) || 'generic',
                                        const: detectedCapabilities = capabilities || generateBasicCapabilities(detectedPlatform),
                                        const: context, ValidationContext = {
                                            graph: JSON.parse(JSON.stringify(graph)), // Deep copy to avoid modifying original
                                            targetPlatform: detectedPlatform,
                                            capabilities: detectedCapabilities,
                                            metadata: {
                                                nodeCount: graph.nodes?.length || 0,
                                                edgeCount: graph.edges?.length || 0,
                                                complexity: calculateBasicComplexity(graph),
                                                estimatedTokens: estimateTokenCount(graph)
                                            },
                                            const: { report, fixes } = await engine.validateAndFix(context),
                                            return: {
                                                report,
                                                fixes,
                                                modifiedGraph: context.graph
                                            },
                                            /**
                                             * Auto-detect platform from graph structure/content
                                             */
                                            function: detectPlatformFromGraph(graph, any), string
                                        } | null
                                    };
                                {
                                    if (!graph.nodes)
                                        return null;
                                    for (const node of graph.nodes) {
                                        const nodeData = node.data || {};
                                        // Check for platform-specific indicators
                                        if (nodeData.model) {
                                            const model = String(nodeData.model).toLowerCase();
                                            if (model.includes('gpt') || model.includes('openai'))
                                                return 'openai';
                                            if (model.includes('claude'))
                                                return 'anthropic';
                                            if (model.includes('gemini'))
                                                return 'google';
                                            if (nodeData.platform) {
                                                return String(nodeData.platform).toLowerCase();
                                                // Check content for platform hints
                                                const content = nodeData.text || nodeData.content || nodeData.prompt || '';
                                                if (content.includes('--ar ') || content.includes('--style '))
                                                    return 'midjourney';
                                                if (content.includes('DALL-E') || content.includes('dalle'))
                                                    return 'dalle';
                                                return null;
                                                /**
                                                 * Generate basic capabilities for a platform
                                                 */
                                                function generateBasicCapabilities(platform) {
                                                    const capabilities = {
                                                        openai: {
                                                            maxTokens: 4000,
                                                            maxContentLength: 8000,
                                                            supportedNodeTypes: ['output', 'input', 'transform', 'conditional', 'variable'],
                                                            parameterLimits: {
                                                                temperature: { min: 0, max: 2 },
                                                                max_tokens: { min: 1, max: 4000 },
                                                                top_p: { min: 0, max: 1 }
                                                            },
                                                            anthropic: {
                                                                maxTokens: 8000,
                                                                maxContentLength: 16000,
                                                                supportedNodeTypes: ['output', 'input', 'transform', 'conditional', 'variable'],
                                                                parameterLimits: {
                                                                    temperature: { min: 0, max: 1 },
                                                                    max_tokens: { min: 1, max: 8000 }
                                                                },
                                                                midjourney: {
                                                                    maxTokens: 1000,
                                                                    maxContentLength: 4000,
                                                                    supportedNodeTypes: ['output', 'input', 'transform'],
                                                                    unsupportedParameters: ['temperature', 'top_p']
                                                                },
                                                                dalle: {
                                                                    maxTokens: 250,
                                                                    maxContentLength: 1000,
                                                                    supportedNodeTypes: ['output', 'input'],
                                                                    unsupportedParameters: ['temperature', 'top_p', 'max_tokens']
                                                                },
                                                                generic: {
                                                                    maxTokens: 2000,
                                                                    maxContentLength: 4000,
                                                                    supportedNodeTypes: ['output', 'input', 'transform', 'conditional']
                                                                },
                                                                return: capabilities[platform] || capabilities.generic,
                                                                /**
                                                                 * Calculate basic complexity score for a graph
                                                                 */
                                                                function: calculateBasicComplexity(graph, any), number
                                                            }
                                                        }
                                                    }, { const: nodeCount = graph.nodes?.length || 0 };
                                                    const edgeCount = graph.edges?.length || 0;
                                                    // Basic cyclomatic complexity
                                                    return Math.max(0, edgeCount - nodeCount + 2);
                                                    /**
                                                     * Estimate token count for a graph
                                                     */
                                                    function estimateTokenCount(graph) {
                                                        if (!graph.nodes)
                                                            return 0;
                                                        let totalLength = 0;
                                                        const contentFields = ['text', 'content', 'prompt', 'template'];
                                                        for (const node of graph.nodes) {
                                                            const nodeData = node.data || {};
                                                            for (const field of contentFields) {
                                                                if (nodeData[field] && typeof nodeData[field] === 'string') {
                                                                    totalLength += nodeData[field].length;
                                                                    // Rough estimation: 1 token ≈ 4 characters
                                                                    return Math.ceil(totalLength / 4);
                                                                    /**
                                                                     * Validation utility functions
                                                                     */
                                                                }
                                                                /**
                                                                 * Validation utility functions
                                                                 */
                                                            }
                                                            /**
                                                             * Validation utility functions
                                                             */
                                                        }
                                                        /**
                                                         * Validation utility functions
                                                         */
                                                    }
                                                    /**
                                                     * Validation utility functions
                                                     */
                                                }
                                                /**
                                                 * Validation utility functions
                                                 */
                                            }
                                            /**
                                             * Validation utility functions
                                             */
                                        }
                                        /**
                                         * Validation utility functions
                                         */
                                    }
                                    /**
                                     * Validation utility functions
                                     */
                                }
                                /**
                                 * Validation utility functions
                                 */
                            }
                            /**
                             * Validation utility functions
                             */
                            ,
                            /**
                             * Validation utility functions
                             */
                            export: 
                        }, 
                        /**
                         * Get the most critical issues from a validation report
                         */
                        getCriticalIssues;
                        (report) => {
                            return report.results
                                .filter(r => !r.result.passed && (r.severity === ValidationSeverity.CRITICAL || r.severity === ValidationSeverity.ERROR))
                                .map(r => r.result.message);
                        },
                            /**
                             * Generate a summary string from a validation report
                             */
                            generateSummary(report, ValidationReport);
                        string;
                        {
                            const { summary, score, rulesExecuted } = report;
                            const issues = summary.critical + summary.errors + summary.warnings + summary.info;
                            if (issues === 0) {
                                return `✅ All ${rulesExecuted} validation rules passed (Score: ${score}/100)`;
                                const parts = [];
                                if (summary.critical > 0)
                                    parts.push(`${summary.critical} critical`);
                                if (summary.errors > 0)
                                    parts.push(`${summary.errors} errors`);
                                if (summary.warnings > 0)
                                    parts.push(`${summary.warnings} warnings`);
                                if (summary.info > 0)
                                    parts.push(`${summary.info} info`);
                                return `⚠️ Found ${parts.join(', ')} (Score: ${score}/100)`;
                            }
                            ;
                        }
                    }
                }
            }
        }
    }
}
//# sourceMappingURL=index.js.map