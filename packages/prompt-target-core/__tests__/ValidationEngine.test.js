import { ValidationEngine } from '../src/validation/ValidationEngine.js';
import { OpenAIGPTAdaptor } from '../src/adaptors/OpenAIGPTAdaptor.js';
import { MidjourneyAdaptor } from '../src/adaptors/MidjourneyAdaptor.js';
import { ConsoleLogger, MemoryMetrics } from '../src/utils/index.js';
describe('ValidationEngine', () => {
    let validator;
    let gptAdaptor;
    let midjourneyAdaptor;
    let logger;
    let metrics;
    beforeEach(() => {
        logger = new ConsoleLogger('Test');
        metrics = new MemoryMetrics();
        validator = new ValidationEngine(logger, metrics);
        const context = {
            logger,
            cache: {
                get: jest.fn(),
                set: jest.fn(),
                del: jest.fn(),
                exists: jest.fn()
            },
            metrics,
            config: {}
        };
        gptAdaptor = new OpenAIGPTAdaptor(context);
        midjourneyAdaptor = new MidjourneyAdaptor(context);
    });
    describe('structural validation', () => {
        it('should detect empty graphs', async () => {
            const emptyGraph = {
                id: 'empty',
                version: '1.0',
                nodes: [],
                edges: [],
                metadata: {
                    created: new Date(),
                    modified: new Date(),
                    version: '1.0'
                }
            };
            const report = await validator.validateGraph(emptyGraph, [gptAdaptor]);
            expect(report.overallValid).toBe(false);
            expect(report.summary.criticalErrors).toBeGreaterThan(0);
            const emptyGraphError = Array.from(report.platformResults.values())
                .flatMap(r => r.results)
                .find(r => r.id === 'empty-graph');
            expect(emptyGraphError).toBeDefined();
            expect(emptyGraphError?.type).toBe('error');
            expect(emptyGraphError?.severity).toBe('critical');
        });
        it('should detect disconnected nodes', async () => {
            const disconnectedGraph = {
                id: 'disconnected',
                version: '1.0',
                nodes: [
                    {
                        id: 'node1',
                        type: 'text',
                        data: { content: 'Connected node' },
                        position: { x: 0, y: 0 }
                    },
                    {
                        id: 'node2',
                        type: 'text',
                        data: { content: 'Another connected node' },
                        position: { x: 100, y: 0 }
                    },
                    {
                        id: 'orphan',
                        type: 'text',
                        data: { content: 'Orphaned node' },
                        position: { x: 200, y: 0 }
                    }
                ],
                edges: [
                    { id: 'e1', source: 'node1', target: 'node2' }
                ],
                metadata: {
                    created: new Date(),
                    modified: new Date(),
                    version: '1.0'
                }
            };
            const report = await validator.validateGraph(disconnectedGraph, [gptAdaptor]);
            const orphanWarning = Array.from(report.platformResults.values())
                .flatMap(r => r.results)
                .find(r => r.id === 'orphaned-node-orphan');
            expect(orphanWarning).toBeDefined();
            expect(orphanWarning?.type).toBe('warning');
            expect(orphanWarning?.nodeId).toBe('orphan');
        });
        it('should detect invalid edges', async () => {
            const invalidEdgeGraph = {
                id: 'invalid-edges',
                version: '1.0',
                nodes: [
                    {
                        id: 'node1',
                        type: 'text',
                        data: { content: 'Valid node' },
                        position: { x: 0, y: 0 }
                    }
                ],
                edges: [
                    { id: 'e1', source: 'node1', target: 'nonexistent' },
                    { id: 'e2', source: 'missing', target: 'node1' }
                ],
                metadata: {
                    created: new Date(),
                    modified: new Date(),
                    version: '1.0'
                }
            };
            const report = await validator.validateGraph(invalidEdgeGraph, [gptAdaptor]);
            expect(report.overallValid).toBe(false);
            const invalidEdgeErrors = Array.from(report.platformResults.values())
                .flatMap(r => r.results)
                .filter(r => r.message.includes('Invalid edge'));
            expect(invalidEdgeErrors.length).toBe(2);
        });
    });
    describe('platform-specific validation', () => {
        it('should validate OpenAI GPT compatibility', async () => {
            const gptCompatibleGraph = {
                id: 'gpt-compatible',
                version: '1.0',
                nodes: [
                    {
                        id: 'text-node',
                        type: 'text',
                        data: {
                            content: 'Write a story about AI',
                            parameters: {
                                temperature: 0.7,
                                max_tokens: 500
                            }
                        },
                        position: { x: 0, y: 0 }
                    }
                ],
                edges: [],
                metadata: {
                    created: new Date(),
                    modified: new Date(),
                    version: '1.0'
                }
            };
            const report = await validator.validateGraph(gptCompatibleGraph, [gptAdaptor]);
            const gptResult = report.platformResults.get('openai-gpt');
            expect(gptResult).toBeDefined();
            expect(gptResult?.compatible).toBe(true);
            expect(gptResult?.quality.overall).toBeGreaterThan(80);
        });
        it('should detect OpenAI GPT incompatibilities', async () => {
            const gptIncompatibleGraph = {
                id: 'gpt-incompatible',
                version: '1.0',
                nodes: [
                    {
                        id: 'image-node',
                        type: 'image',
                        data: {
                            url: 'https://example.com/image.jpg',
                            description: 'An example image'
                        },
                        position: { x: 0, y: 0 }
                    }
                ],
                edges: [],
                metadata: {
                    created: new Date(),
                    modified: new Date(),
                    version: '1.0'
                }
            };
            const report = await validator.validateGraph(gptIncompatibleGraph, [gptAdaptor]);
            const gptResult = report.platformResults.get('openai-gpt');
            expect(gptResult).toBeDefined();
            const imageWarnings = gptResult?.results.filter(r => r.message.includes('Image node not supported'));
            expect(imageWarnings?.length).toBeGreaterThan(0);
        });
        it('should validate Midjourney compatibility', async () => {
            const midjourneyCompatibleGraph = {
                id: 'midjourney-compatible',
                version: '1.0',
                nodes: [
                    {
                        id: 'subject',
                        type: 'text',
                        data: { content: 'A mystical forest' },
                        position: { x: 0, y: 0 }
                    },
                    {
                        id: 'style',
                        type: 'style',
                        data: { style: 'fantasy art, highly detailed' },
                        position: { x: 100, y: 0 }
                    },
                    {
                        id: 'output',
                        type: 'output',
                        data: {
                            parameters: {
                                aspect_ratio: '16:9',
                                stylize: 250
                            }
                        },
                        position: { x: 200, y: 0 }
                    }
                ],
                edges: [
                    { id: 'e1', source: 'subject', target: 'output' },
                    { id: 'e2', source: 'style', target: 'output' }
                ],
                metadata: {
                    created: new Date(),
                    modified: new Date(),
                    version: '1.0'
                }
            };
            const report = await validator.validateGraph(midjourneyCompatibleGraph, [midjourneyAdaptor]);
            const midjourneyResult = report.platformResults.get('midjourney');
            expect(midjourneyResult).toBeDefined();
            expect(midjourneyResult?.compatible).toBe(true);
            expect(midjourneyResult?.quality.overall).toBeGreaterThan(70);
        });
    });
    describe('cross-platform validation', () => {
        it('should analyze cross-platform compatibility', async () => {
            const mixedGraph = {
                id: 'mixed-platform',
                version: '1.0',
                nodes: [
                    {
                        id: 'text-node',
                        type: 'text',
                        data: { content: 'Generate an image of a sunset' },
                        position: { x: 0, y: 0 }
                    },
                    {
                        id: 'image-node',
                        type: 'image',
                        data: {
                            url: 'https://example.com/reference.jpg',
                            description: 'Reference image'
                        },
                        position: { x: 100, y: 0 }
                    }
                ],
                edges: [
                    { id: 'e1', source: 'text-node', target: 'image-node' }
                ],
                metadata: {
                    created: new Date(),
                    modified: new Date(),
                    version: '1.0'
                }
            };
            const report = await validator.validateGraph(mixedGraph, [gptAdaptor, midjourneyAdaptor]);
            expect(report.platformResults.size).toBe(2);
            const gptResult = report.platformResults.get('openai-gpt');
            const midjourneyResult = report.platformResults.get('midjourney');
            expect(gptResult).toBeDefined();
            expect(midjourneyResult).toBeDefined();
            // GPT should have warnings about image nodes
            const gptImageWarnings = gptResult?.results.filter(r => r.message.includes('Image node not supported'));
            expect(gptImageWarnings?.length).toBeGreaterThan(0);
            // Midjourney should handle image nodes better
            expect(midjourneyResult?.compatible).toBe(true);
        });
        it('should identify cross-platform feature gaps', async () => {
            const report = await validator.validateGraph({
                id: 'feature-test',
                version: '1.0',
                nodes: [{
                        id: 'test',
                        type: 'text',
                        data: { content: 'test' },
                        position: { x: 0, y: 0 }
                    }],
                edges: [],
                metadata: {
                    created: new Date(),
                    modified: new Date(),
                    version: '1.0'
                }
            }, [gptAdaptor, midjourneyAdaptor]);
            // Should identify features supported by one platform but not others
            expect(report.crossPlatformIssues).toBeDefined();
            // Look for specific feature gaps
            const featureIssues = report.crossPlatformIssues.filter(issue => issue.type === 'feature_support');
            // We expect some feature differences between GPT and Midjourney
            expect(featureIssues.length).toBeGreaterThan(0);
        });
    });
    describe('auto-fix suggestions', () => {
        it('should generate auto-fix suggestions for common issues', async () => {
            const problematicGraph = {
                id: 'auto-fix-test',
                version: '1.0',
                nodes: [
                    {
                        id: 'main-node',
                        type: 'text',
                        data: { content: 'Main content' },
                        position: { x: 0, y: 0 }
                    },
                    {
                        id: 'orphan-node',
                        type: 'text',
                        data: { content: 'Disconnected content' },
                        position: { x: 200, y: 0 }
                    }
                ],
                edges: [],
                metadata: {
                    created: new Date(),
                    modified: new Date(),
                    version: '1.0'
                }
            };
            const report = await validator.validateGraph(problematicGraph, [gptAdaptor]);
            expect(report.autoFixSuggestions).toBeDefined();
            expect(report.autoFixSuggestions.length).toBeGreaterThan(0);
            // Should have suggestions for orphaned nodes
            const orphanFixes = report.autoFixSuggestions.filter(suggestion => suggestion.description.toLowerCase().includes('orphan') ||
                suggestion.description.toLowerCase().includes('disconnect'));
            expect(orphanFixes.length).toBeGreaterThan(0);
            // Check fix confidence and impact
            orphanFixes.forEach(fix => {
                expect(fix.confidence).toBeGreaterThanOrEqual(0);
                expect(fix.confidence).toBeLessThanOrEqual(100);
                expect(['low', 'medium', 'high']).toContain(fix.impact);
            });
        });
    });
    describe('performance', () => {
        it('should complete validation within reasonable time', async () => {
            const largeGraph = {
                id: 'performance-test',
                version: '1.0',
                nodes: Array.from({ length: 20 }, (_, i) => ({
                    id: `node-${i}`,
                    type: 'text',
                    data: { content: `Content for node ${i}` },
                    position: { x: i * 50, y: 0 }
                })),
                edges: Array.from({ length: 19 }, (_, i) => ({
                    id: `edge-${i}`,
                    source: `node-${i}`,
                    target: `node-${i + 1}`
                })),
                metadata: {
                    created: new Date(),
                    modified: new Date(),
                    version: '1.0'
                }
            };
            const startTime = Date.now();
            const report = await validator.validateGraph(largeGraph, [gptAdaptor, midjourneyAdaptor]);
            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
            expect(report).toBeDefined();
            expect(report.platformResults.size).toBe(2);
        });
    });
});
