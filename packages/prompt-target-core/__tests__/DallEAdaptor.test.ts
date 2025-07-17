import { DallEAdaptor } from '../src/adaptors/DallEAdaptor.js';
describe('DallEAdaptor', () => {
    let adaptor;
    let mockContext;
    beforeEach(() => {
        mockContext = {
            logger: {
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn()
            },
            metrics: {
                counter: jest.fn(),
                gauge: jest.fn(),
                histogram: jest.fn(),
                timer: jest.fn(() => ({ end: jest.fn() }))
            },
            cache: {
                get: jest.fn().mockResolvedValue(null),
                set: jest.fn().mockResolvedValue(undefined),
                del: jest.fn().mockResolvedValue(undefined),
                exists: jest.fn().mockResolvedValue(false)
            },
            config: {}
        };
        adaptor = new DallEAdaptor(mockContext);
    });
    describe('initialization', () => {
        it('should initialize with correct properties', () => {
            expect(adaptor.id).toBe('dall-e');
            expect(adaptor.version).toBe('1.0.0');
            expect(adaptor.platform).toBe('openai-dalle');
            expect(adaptor.name).toBe('DALL-E Image Generator');
            expect(adaptor.description).toBe('Adaptor for OpenAI DALL-E text-to-image generation');
        });
    });
    describe('capabilities', () => {
        it('should return comprehensive capabilities', async () => {
            const capabilities = await adaptor.capabilities();
            expect(capabilities.supportedNodeTypes).toContain('text');
            expect(capabilities.supportedNodeTypes).toContain('image');
            expect(capabilities.supportedNodeTypes).toContain('style');
            expect(capabilities.maxPromptLength).toBe(4000);
            expect(capabilities.supportedFormats).toContain('openai_dalle_prompt');
            // Check parameters
            const modelParam = capabilities.parameters.find(p => p.name === 'model');
            expect(modelParam).toBeDefined();
            expect(modelParam?.options).toContain('dall-e-3');
            expect(modelParam?.options).toContain('dall-e-2');
            const sizeParam = capabilities.parameters.find(p => p.name === 'size');
            expect(sizeParam).toBeDefined();
            expect(sizeParam?.options).toContain('1024x1024');
            expect(sizeParam?.options).toContain('1792x1024');
            // Check features
            expect(capabilities.features.some(f => f.name === 'high_resolution')).toBe(true);
            expect(capabilities.features.some(f => f.name === 'style_control')).toBe(true);
        });
    });
    describe('validation', () => {
        it('should validate prompt length', async () => {
            const longContent = 'A'.repeat(5000); // Exceeds 4000 char limit
            const graph = createTestGraph([
                { id: 'node1', type: 'text', data: { content: longContent } }
            ]);
            const results = await adaptor.validate(graph);
            const lengthError = results.find(r => r.id === 'prompt-too-long');
            expect(lengthError).toBeDefined();
            expect(lengthError?.type).toBe('error');
        });
        it('should validate DALL-E 3 specific constraints', async () => {
            const graph = createTestGraph([
                {
                    id: 'node1',
                    type: 'text',
                    data: {
                        content: 'A test prompt',
                        parameters: {
                            model: 'dall-e-3',
                            n: 4 // Invalid for DALL-E 3
                        }
                    }
                }
            ]);
            const results = await adaptor.validate(graph);
            const multiImageError = results.find(r => r.id === 'dalle3-multiple-images');
            expect(multiImageError).toBeDefined();
            expect(multiImageError?.type).toBe('error');
        });
        it('should validate DALL-E 2 specific constraints', async () => {
            const graph = createTestGraph([
                {
                    id: 'node1',
                    type: 'text',
                    data: {
                        content: 'A test prompt',
                        parameters: {
                            model: 'dall-e-2',
                            quality: 'hd' // Not supported in DALL-E 2
                        }
                    }
                }
            ]);
            const results = await adaptor.validate(graph);
            const qualityWarning = results.find(r => r.id === 'dalle2-quality-not-supported');
            expect(qualityWarning).toBeDefined();
            expect(qualityWarning?.type).toBe('warning');
        });
        it('should detect content policy issues', async () => {
            const graph = createTestGraph([
                {
                    id: 'node1',
                    type: 'text',
                    data: { content: 'violent scene with weapons and blood' }
                }
            ]);
            const results = await adaptor.validate(graph);
            const policyWarning = results.find(r => r.id?.startsWith('content-policy'));
            expect(policyWarning).toBeDefined();
            expect(policyWarning?.type).toBe('warning');
        });
        it('should validate parameter types and ranges', async () => {
            const graph = createTestGraph([
                {
                    id: 'node1',
                    type: 'text',
                    data: {
                        content: 'Test prompt',
                        parameters: {
                            n: 'invalid', // Should be number
                            size: 'invalid-size' // Should be valid enum
                        }
                    }
                }
            ]);
            const results = await adaptor.validate(graph);
            expect(results.some(r => r.id === 'invalid-param-n')).toBe(true);
            expect(results.some(r => r.id === 'invalid-enum-size')).toBe(true);
        });
    });
    describe('transformation', () => {
        it('should transform simple text prompt', async () => {
            const graph = createTestGraph([
                { id: 'node1', type: 'text', data: { content: 'A beautiful sunset over mountains' } }
            ]);
            const result = await adaptor.transform(graph);
            expect(result.platform).toBe('openai-dalle');
            expect(result.content).toBe('A beautiful sunset over mountains');
            expect(result.format).toBe('openai_dalle_prompt');
            expect(result.parameters.model).toBe('dall-e-3'); // Default
            expect(result.parameters.size).toBe('1024x1024'); // Default
        });
        it('should transform with custom parameters', async () => {
            const graph = createTestGraph([
                {
                    id: 'node1',
                    type: 'text',
                    data: {
                        content: 'A robot in a cyberpunk city',
                        parameters: {
                            model: 'dall-e-3',
                            size: '1792x1024',
                            quality: 'hd',
                            style: 'vivid'
                        }
                    }
                }
            ]);
            const result = await adaptor.transform(graph);
            expect(result.parameters.model).toBe('dall-e-3');
            expect(result.parameters.size).toBe('1792x1024');
            expect(result.parameters.quality).toBe('hd');
            expect(result.parameters.style).toBe('vivid');
            // Check API parameters exclude unsupported combinations
            const apiParams = result.metadata?.apiParameters;
            expect(apiParams).toBeDefined();
            expect(apiParams.model).toBe('dall-e-3');
            expect(apiParams.quality).toBe('hd');
            expect(apiParams.style).toBe('vivid');
        });
        it('should handle style nodes correctly', async () => {
            const graph = createTestGraph([
                { id: 'text1', type: 'text', data: { content: 'A portrait of a woman' } },
                { id: 'style1', type: 'style', data: { style: 'renaissance painting' } }
            ], [
                { id: 'edge1', source: 'text1', target: 'style1' }
            ]);
            const result = await adaptor.transform(graph);
            expect(result.content).toContain('portrait of a woman');
            expect(result.content).toContain('renaissance painting style');
        });
        it('should handle weighted choices', async () => {
            const graph = createTestGraph([
                {
                    id: 'weighted1',
                    type: 'weighted',
                    data: {
                        options: [
                            { text: 'sunny day', weight: 0.7 },
                            { text: 'rainy evening', weight: 0.3 }
                        ]
                    }
                }
            ]);
            const result = await adaptor.transform(graph);
            // Should select first option (simplified implementation)
            expect(result.content).toContain('sunny day');
        });
        it('should handle conditional nodes', async () => {
            const graph = createTestGraph([
                {
                    id: 'conditional1',
                    type: 'conditional',
                    data: {
                        condition: 'true',
                        trueBranch: 'bright colors',
                        falseBranch: 'muted tones'
                    }
                }
            ]);
            const result = await adaptor.transform(graph);
            expect(result.content).toContain('bright colors');
        });
        it('should enhance simple prompts', async () => {
            const graph = createTestGraph([
                { id: 'node1', type: 'text', data: { content: 'cat' } } // Very simple
            ]);
            const result = await adaptor.transform(graph);
            expect(result.content).toContain('A detailed image of cat');
        });
        it('should add quality descriptors for HD mode', async () => {
            const graph = createTestGraph([
                {
                    id: 'node1',
                    type: 'text',
                    data: {
                        content: 'A landscape scene',
                        parameters: { quality: 'hd' }
                    }
                }
            ]);
            const result = await adaptor.transform(graph);
            expect(result.content).toContain('highly detailed and sharp');
        });
        it('should add color descriptors for vivid style', async () => {
            const graph = createTestGraph([
                {
                    id: 'node1',
                    type: 'text',
                    data: {
                        content: 'A flower garden',
                        parameters: { style: 'vivid' }
                    }
                }
            ]);
            const result = await adaptor.transform(graph);
            expect(result.content).toContain('with vibrant colors');
        });
        it('should truncate overly long prompts', async () => {
            const longContent = 'A very long prompt that exceeds the maximum length limit for DALL-E. '.repeat(200);
            const graph = createTestGraph([
                { id: 'node1', type: 'text', data: { content: longContent } }
            ]);
            const result = await adaptor.transform(graph);
            expect(result.content.length).toBeLessThanOrEqual(4000);
            expect(result.content).toMatch(/\.\.\.$/); // ends with ...
            // Should have transformation log entry
            const truncateLog = result.metadata?.transformations?.find(t => t.step === 'truncate_prompt');
            expect(truncateLog).toBeDefined();
        });
        it('should handle DALL-E 2 parameter constraints', async () => {
            const graph = createTestGraph([
                {
                    id: 'node1',
                    type: 'text',
                    data: {
                        content: 'A test image',
                        parameters: {
                            model: 'dall-e-2',
                            n: 3, // Valid for DALL-E 2
                            quality: 'hd', // Should be ignored
                            style: 'natural' // Should be ignored
                        }
                    }
                }
            ]);
            const result = await adaptor.transform(graph);
            const apiParams = result.metadata?.apiParameters;
            expect(apiParams?.model).toBe('dall-e-2');
            expect(apiParams?.n).toBe(3);
            expect(apiParams?.quality).toBeUndefined(); // Should be filtered out
            expect(apiParams?.style).toBeUndefined(); // Should be filtered out
        });
        it('should generate proper metadata', async () => {
            const graph = createTestGraph([
                {
                    id: 'node1',
                    type: 'text',
                    data: { content: 'Test prompt' }
                }
            ]);
            const result = await adaptor.transform(graph);
            expect(result.metadata).toBeDefined();
            expect(result.metadata?.originalGraphId).toBe(graph.id);
            expect(result.metadata?.translationId).toMatch(/^dall-e-/);
            expect(result.metadata?.timestamp).toBeInstanceOf(Date);
            expect(result.metadata?.adaptorVersion).toBe('1.0.0');
            expect(result.metadata?.quality).toBeDefined();
            expect(result.metadata?.transformations).toBeDefined();
            expect(result.metadata?.apiParameters).toBeDefined();
        });
    });
    describe('quality estimation', () => {
        it('should calculate quality score based on graph complexity', async () => {
            const simpleGraph = createTestGraph([
                { id: 'node1', type: 'text', data: { content: 'cat' } }
            ]);
            const complexGraph = createTestGraph([
                { id: 'text1', type: 'text', data: { content: 'A majestic mountain landscape' } },
                { id: 'style1', type: 'style', data: { style: 'photorealistic' } },
                { id: 'output1', type: 'output', data: {} }
            ], [
                { id: 'edge1', source: 'text1', target: 'style1' },
                { id: 'edge2', source: 'style1', target: 'output1' }
            ]);
            const simpleQuality = await adaptor.estimateQuality(simpleGraph);
            const complexQuality = await adaptor.estimateQuality(complexGraph);
            expect(typeof simpleQuality.overall).toBe('number');
            expect(simpleQuality.overall).toBeGreaterThan(0);
            expect(simpleQuality.overall).toBeLessThanOrEqual(1);
            // Complex graph might have higher quality due to better structure
            expect(complexQuality.overall).toBeGreaterThanOrEqual(simpleQuality.overall);
        });
    });
    describe('error handling', () => {
        it('should handle missing graph nodes gracefully', async () => {
            const emptyGraph = createTestGraph([]);
            const result = await adaptor.transform(emptyGraph);
            expect(result.content).toBe('');
            expect(result.parameters.model).toBe('dall-e-3'); // Should have defaults
        });
        it('should handle invalid parameter values', async () => {
            const graph = createTestGraph([
                {
                    id: 'node1',
                    type: 'text',
                    data: {
                        content: 'Test prompt',
                        parameters: {
                            size: 'invalid-size',
                            quality: 'invalid-quality',
                            n: -1
                        }
                    }
                }
            ]);
            // Should not throw, but normalize invalid values
            const result = await adaptor.transform(graph);
            expect(result.parameters.size).toBe('1024x1024'); // Default
            expect(result.parameters.quality).toBe('standard'); // Default
            expect(result.parameters.n).toBe(1); // Default
        });
    });
    // Helper function to create test graphs
    function createTestGraph(nodes, edges = []) {
        return {
            id: 'test-graph',
            nodes: nodes.map((node, index) => ({
                id: node.id || `node${index}`,
                type: node.type || 'text',
                data: node.data || {},
                position: { x: 0, y: 0 },
                ...node
            })),
            edges: edges.map((edge, index) => ({
                id: edge.id || `edge${index}`,
                source: edge.source || '',
                target: edge.target || '',
                ...edge
            })),
            metadata: {
                name: 'Test Graph',
                created: new Date(),
                modified: new Date(),
                version: '1.0.0'
            },
            version: '1.0.0'
        };
    }
});
