/**
 * Comprehensive testing framework for adaptor compliance and performance
 */
export class AdaptorTestFramework {
  constructor(logger, metrics) {
    this.logger = logger;
    this.metrics = metrics;
    this.testResults = {
      compliance: {
        interfaceCompliance: false,
        lifecycleCompliance: false,
        validationCompliance: false,
        transformationCompliance: false,
        errors: [],
      },
      performance: {
        validationTime: 0,
        transformationTime: 0,
        memoryUsage: 0,
        cacheEfficiency: 0,
        errors: [],
      },
      functionality: {
        basicFunctionality: false,
        errorHandling: false,
        edgeCases: false,
        qualityScoring: false,
        errors: [],
      },
      overall: {
        passed: false,
        score: 0,
        summary: '',
      },
    };
  }
  /**
   * Run comprehensive test suite for an adaptor
   */
  async testAdaptor(adaptor, context, options = {}) {
    this.logger.info('Starting adaptor test suite', {
      adaptorId: adaptor.id,
      platform: adaptor.platform,
    });
    try {
      // Reset test results
      this.resetTestResults();
      // Run test categories
      await this.testCompliance(adaptor, context, options);
      await this.testPerformance(adaptor, context, options);
      await this.testFunctionality(adaptor, context, options);
      // Calculate overall results
      this.calculateOverallResults();
      this.logger.info('Adaptor test suite completed', {
        adaptorId: adaptor.id,
        passed: this.testResults.overall.passed,
        score: this.testResults.overall.score,
      });
      return this.testResults;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Adaptor test suite failed', {
        adaptorId: adaptor.id,
        error: errorMessage,
      });
      this.testResults.overall.passed = false;
      this.testResults.overall.summary = `Test suite failed: ${errorMessage}`;
      return this.testResults;
    }
  }
  /**
   * Test adaptor compliance with interfaces and specifications
   */
  async testCompliance(adaptor, context, options) {
    this.logger.debug('Testing compliance', { adaptorId: adaptor.id });
    try {
      // Test interface compliance
      await this.testInterfaceCompliance(adaptor);
      this.testResults.compliance.interfaceCompliance = true;
      // Test lifecycle compliance
      await this.testLifecycleCompliance(adaptor, context);
      this.testResults.compliance.lifecycleCompliance = true;
      // Test validation compliance
      await this.testValidationCompliance(adaptor);
      this.testResults.compliance.validationCompliance = true;
      // Test transformation compliance
      await this.testTransformationCompliance(adaptor);
      this.testResults.compliance.transformationCompliance = true;
    } catch (error) {
      this.testResults.compliance.errors.push({
        test: 'compliance',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });
    }
  }
  /**
   * Test interface compliance
   */
  async testInterfaceCompliance(adaptor) {
    // Check required properties
    if (!adaptor.id) throw new Error('Missing required property: id');
    if (!adaptor.version) throw new Error('Missing required property: version');
    if (!adaptor.platform) throw new Error('Missing required property: platform');
    // Check required methods
    if (typeof adaptor.capabilities !== 'function') {
      throw new Error('Missing required method: capabilities');
    }
    if (typeof adaptor.validate !== 'function') {
      throw new Error('Missing required method: validate');
    }
    if (typeof adaptor.transform !== 'function') {
      throw new Error('Missing required method: transform');
    }
    if (typeof adaptor.estimateQuality !== 'function') {
      throw new Error('Missing required method: estimateQuality');
    }
    // Test capabilities method
    const capabilities = await adaptor.capabilities();
    if (!capabilities) throw new Error('capabilities() returned null/undefined');
    if (!Array.isArray(capabilities.supportedNodeTypes)) {
      throw new Error('capabilities.supportedNodeTypes must be an array');
    }
    if (!Array.isArray(capabilities.parameters)) {
      throw new Error('capabilities.parameters must be an array');
    }
  }
  /**
   * Test lifecycle compliance
   */
  async testLifecycleCompliance(adaptor, context) {
    // Test initialization
    await adaptor.initialize(context);
    // Test health check
    const health = await adaptor.healthCheck();
    if (!health) throw new Error('healthCheck() returned null/undefined');
    if (typeof health.healthy !== 'boolean') {
      throw new Error('health.healthy must be boolean');
    }
    // Test destruction (will re-initialize for other tests)
    await adaptor.destroy();
    await adaptor.initialize(context);
  }
  /**
   * Test validation compliance
   */
  async testValidationCompliance(adaptor) {
    const testGraph = this.createTestGraph();
    // Test basic validation
    const results = await adaptor.validate(testGraph);
    if (!Array.isArray(results)) {
      throw new Error('validate() must return an array');
    }
    // Validate result structure
    for (const result of results) {
      if (!result.id) throw new Error('ValidationResult missing id');
      if (!['error', 'warning', 'info'].includes(result.type)) {
        throw new Error('ValidationResult.type must be error/warning/info');
      }
      if (!['critical', 'high', 'medium', 'low'].includes(result.severity)) {
        throw new Error('ValidationResult.severity must be critical/high/medium/low');
      }
    }
  }
  /**
   * Test transformation compliance
   */
  async testTransformationCompliance(adaptor) {
    const testGraph = this.createTestGraph();
    // Test basic transformation
    const result = await adaptor.transform(testGraph);
    if (!result) throw new Error('transform() returned null/undefined');
    // Validate result structure
    if (!result.platform) throw new Error('TargetPrompt missing platform');
    if (!result.content) throw new Error('TargetPrompt missing content');
    if (!result.format) throw new Error('TargetPrompt missing format');
    if (!result.metadata) throw new Error('TargetPrompt missing metadata');
    // Test quality estimation
    const quality = await adaptor.estimateQuality(testGraph);
    if (!quality) throw new Error('estimateQuality() returned null/undefined');
    if (typeof quality.overall !== 'number') {
      throw new Error('QualityScore.overall must be number');
    }
  }
  /**
   * Test adaptor performance characteristics
   */
  async testPerformance(adaptor, context, options) {
    this.logger.debug('Testing performance', { adaptorId: adaptor.id });
    try {
      const iterations = options.performanceIterations || 10;
      const testGraphs = this.generateTestGraphs(iterations);
      // Test validation performance
      await this.testValidationPerformance(adaptor, testGraphs);
      // Test transformation performance
      await this.testTransformationPerformance(adaptor, testGraphs);
      // Test memory usage
      await this.testMemoryUsage(adaptor, testGraphs);
      // Test cache efficiency
      await this.testCacheEfficiency(adaptor, testGraphs);
    } catch (error) {
      this.testResults.performance.errors.push({
        test: 'performance',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });
    }
  }
  /**
   * Test validation performance
   */
  async testValidationPerformance(adaptor, testGraphs) {
    const times = [];
    for (const graph of testGraphs) {
      const start = performance.now();
      await adaptor.validate(graph);
      const duration = performance.now() - start;
      times.push(duration);
    }
    this.testResults.performance.validationTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    // Validation should complete within 200ms on average
    if (this.testResults.performance.validationTime > 200) {
      this.testResults.performance.errors.push({
        test: 'validation_performance',
        error: `Average validation time ${this.testResults.performance.validationTime}ms exceeds 200ms threshold`,
        timestamp: new Date(),
      });
    }
  }
  /**
   * Test transformation performance
   */
  async testTransformationPerformance(adaptor, testGraphs) {
    const times = [];
    for (const graph of testGraphs) {
      const start = performance.now();
      await adaptor.transform(graph);
      const duration = performance.now() - start;
      times.push(duration);
    }
    this.testResults.performance.transformationTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    // Transformation should complete within 500ms on average
    if (this.testResults.performance.transformationTime > 500) {
      this.testResults.performance.errors.push({
        test: 'transformation_performance',
        error: `Average transformation time ${this.testResults.performance.transformationTime}ms exceeds 500ms threshold`,
        timestamp: new Date(),
      });
    }
  }
  /**
   * Test memory usage patterns
   */
  async testMemoryUsage(adaptor, testGraphs) {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    const initialMemory = process.memoryUsage();
    // Run multiple operations
    for (const graph of testGraphs) {
      await adaptor.validate(graph);
      await adaptor.transform(graph);
    }
    // Force garbage collection again
    if (global.gc) {
      global.gc();
    }
    const finalMemory = process.memoryUsage();
    this.testResults.performance.memoryUsage = finalMemory.heapUsed - initialMemory.heapUsed;
    // Memory growth should be reasonable (less than 50MB)
    if (this.testResults.performance.memoryUsage > 50 * 1024 * 1024) {
      this.testResults.performance.errors.push({
        test: 'memory_usage',
        error: `Memory growth ${Math.round(this.testResults.performance.memoryUsage / 1024 / 1024)}MB exceeds 50MB threshold`,
        timestamp: new Date(),
      });
    }
  }
  /**
   * Test cache efficiency
   */
  async testCacheEfficiency(adaptor, testGraphs) {
    // Warm up cache
    const testGraph = testGraphs[0];
    await adaptor.transform(testGraph);
    // Test cache hits
    const times = [];
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      await adaptor.transform(testGraph);
      const duration = performance.now() - start;
      times.push(duration);
    }
    const avgCacheTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    // Cache hits should be significantly faster
    this.testResults.performance.cacheEfficiency = Math.max(
      0,
      100 - (avgCacheTime / this.testResults.performance.transformationTime) * 100
    );
    if (this.testResults.performance.cacheEfficiency < 50) {
      this.testResults.performance.errors.push({
        test: 'cache_efficiency',
        error: `Cache efficiency ${this.testResults.performance.cacheEfficiency}% below 50% threshold`,
        timestamp: new Date(),
      });
    }
  }
  /**
   * Test functional capabilities
   */
  async testFunctionality(adaptor, context, options) {
    this.logger.debug('Testing functionality', { adaptorId: adaptor.id });
    try {
      // Test basic functionality
      await this.testBasicFunctionality(adaptor);
      this.testResults.functionality.basicFunctionality = true;
      // Test error handling
      await this.testErrorHandling(adaptor);
      this.testResults.functionality.errorHandling = true;
      // Test edge cases
      await this.testEdgeCases(adaptor);
      this.testResults.functionality.edgeCases = true;
      // Test quality scoring
      await this.testQualityScoring(adaptor);
      this.testResults.functionality.qualityScoring = true;
    } catch (error) {
      this.testResults.functionality.errors.push({
        test: 'functionality',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });
    }
  }
  /**
   * Test basic functionality
   */
  async testBasicFunctionality(adaptor) {
    const graphs = [this.createSimpleTextGraph(), this.createMultiNodeGraph(), this.createComplexGraph()];
    for (const graph of graphs) {
      // Test validation
      const validationResults = await adaptor.validate(graph);
      // Test transformation (if validation passes)
      const errors = validationResults.filter(r => r.type === 'error');
      if (errors.length === 0) {
        const transformResult = await adaptor.transform(graph);
        if (!transformResult.content) {
          throw new Error('Transform result missing content');
        }
      }
      // Test quality estimation
      const quality = await adaptor.estimateQuality(graph);
      if (quality.overall < 0 || quality.overall > 100) {
        throw new Error('Quality score must be between 0 and 100');
      }
    }
  }
  /**
   * Test error handling
   */
  async testErrorHandling(adaptor) {
    // Test with invalid graphs
    const invalidGraphs = [this.createEmptyGraph(), this.createInvalidGraph(), this.createCyclicGraph()];
    for (const graph of invalidGraphs) {
      try {
        const results = await adaptor.validate(graph);
        // Should have validation errors
        const errors = results.filter(r => r.type === 'error');
        if (errors.length === 0) {
          throw new Error('Expected validation errors for invalid graph');
        }
      } catch (error) {
        // Errors are acceptable for invalid graphs
      }
    }
  }
  /**
   * Test edge cases
   */
  async testEdgeCases(adaptor) {
    const edgeCaseGraphs = [this.createLargeGraph(), this.createDeepGraph(), this.createDisconnectedGraph()];
    for (const graph of edgeCaseGraphs) {
      await adaptor.validate(graph);
      // Transform only if validation passes
    }
  }
  /**
   * Test quality scoring accuracy
   */
  async testQualityScoring(adaptor) {
    const goodGraph = this.createOptimalGraph();
    const badGraph = this.createProblematicGraph();
    const goodQuality = await adaptor.estimateQuality(goodGraph);
    const badQuality = await adaptor.estimateQuality(badGraph);
    // Good graph should score higher than bad graph
    if (goodQuality.overall <= badQuality.overall) {
      throw new Error('Quality scoring appears inaccurate');
    }
  }
  /**
   * Calculate overall test results
   */
  calculateOverallResults() {
    const complianceScore =
      [
        this.testResults.compliance.interfaceCompliance,
        this.testResults.compliance.lifecycleCompliance,
        this.testResults.compliance.validationCompliance,
        this.testResults.compliance.transformationCompliance,
      ].filter(Boolean).length * 25;
    const performanceScore = Math.max(0, 100 - this.testResults.performance.errors.length * 20);
    const functionalityScore =
      [
        this.testResults.functionality.basicFunctionality,
        this.testResults.functionality.errorHandling,
        this.testResults.functionality.edgeCases,
        this.testResults.functionality.qualityScoring,
      ].filter(Boolean).length * 25;
    this.testResults.overall.score = Math.round((complianceScore + performanceScore + functionalityScore) / 3);
    this.testResults.overall.passed = this.testResults.overall.score >= 80;
    this.testResults.overall.summary = this.generateSummary();
  }
  /**
   * Generate test summary
   */
  generateSummary() {
    const totalErrors =
      this.testResults.compliance.errors.length +
      this.testResults.performance.errors.length +
      this.testResults.functionality.errors.length;
    if (this.testResults.overall.passed) {
      return `Adaptor passed all tests with score ${this.testResults.overall.score}/100`;
    } else {
      return `Adaptor failed with ${totalErrors} errors and score ${this.testResults.overall.score}/100`;
    }
  }
  /**
   * Reset test results
   */
  resetTestResults() {
    this.testResults = {
      compliance: {
        interfaceCompliance: false,
        lifecycleCompliance: false,
        validationCompliance: false,
        transformationCompliance: false,
        errors: [],
      },
      performance: {
        validationTime: 0,
        transformationTime: 0,
        memoryUsage: 0,
        cacheEfficiency: 0,
        errors: [],
      },
      functionality: {
        basicFunctionality: false,
        errorHandling: false,
        edgeCases: false,
        qualityScoring: false,
        errors: [],
      },
      overall: {
        passed: false,
        score: 0,
        summary: '',
      },
    };
  }
  // Helper methods for creating test graphs
  createTestGraph() {
    return this.createSimpleTextGraph();
  }
  generateTestGraphs(count) {
    const graphs = [];
    for (let i = 0; i < count; i++) {
      graphs.push({
        id: `test-graph-${i}`,
        version: '1.0',
        nodes: [
          {
            id: `node-${i}`,
            type: 'text',
            data: { content: `Test content ${i}` },
            position: { x: 0, y: 0 },
          },
        ],
        edges: [],
        metadata: {
          created: new Date(),
          modified: new Date(),
          version: '1.0',
        },
      });
    }
    return graphs;
  }
  createSimpleTextGraph() {
    return {
      id: 'simple-text',
      version: '1.0',
      nodes: [
        {
          id: 'text-node',
          type: 'text',
          data: { content: 'Simple text content' },
          position: { x: 0, y: 0 },
        },
      ],
      edges: [],
      metadata: {
        created: new Date(),
        modified: new Date(),
        version: '1.0',
      },
    };
  }
  createMultiNodeGraph() {
    return {
      id: 'multi-node',
      version: '1.0',
      nodes: [
        {
          id: 'node1',
          type: 'text',
          data: { content: 'First node' },
          position: { x: 0, y: 0 },
        },
        {
          id: 'node2',
          type: 'text',
          data: { content: 'Second node' },
          position: { x: 100, y: 0 },
        },
        {
          id: 'concat',
          type: 'concat',
          data: {},
          position: { x: 200, y: 0 },
        },
      ],
      edges: [
        { id: 'e1', source: 'node1', target: 'concat' },
        { id: 'e2', source: 'node2', target: 'concat' },
      ],
      metadata: {
        created: new Date(),
        modified: new Date(),
        version: '1.0',
      },
    };
  }
  createComplexGraph() {
    return {
      id: 'complex',
      version: '1.0',
      nodes: Array.from({ length: 10 }, (_, i) => ({
        id: `node-${i}`,
        type: i % 2 === 0 ? 'text' : 'concat',
        data: { content: `Node ${i} content` },
        position: { x: i * 50, y: 0 },
      })),
      edges: Array.from({ length: 9 }, (_, i) => ({
        id: `edge-${i}`,
        source: `node-${i}`,
        target: `node-${i + 1}`,
      })),
      metadata: {
        created: new Date(),
        modified: new Date(),
        version: '1.0',
      },
    };
  }
  createEmptyGraph() {
    return {
      id: 'empty',
      version: '1.0',
      nodes: [],
      edges: [],
      metadata: {
        created: new Date(),
        modified: new Date(),
        version: '1.0',
      },
    };
  }
  createInvalidGraph() {
    return {
      id: 'invalid',
      version: '1.0',
      nodes: [
        {
          id: 'node1',
          type: 'text',
          data: { content: 'Valid node' },
          position: { x: 0, y: 0 },
        },
      ],
      edges: [{ id: 'invalid-edge', source: 'node1', target: 'nonexistent' }],
      metadata: {
        created: new Date(),
        modified: new Date(),
        version: '1.0',
      },
    };
  }
  createCyclicGraph() {
    return {
      id: 'cyclic',
      version: '1.0',
      nodes: [
        {
          id: 'node1',
          type: 'text',
          data: { content: 'Node 1' },
          position: { x: 0, y: 0 },
        },
        {
          id: 'node2',
          type: 'text',
          data: { content: 'Node 2' },
          position: { x: 100, y: 0 },
        },
      ],
      edges: [
        { id: 'e1', source: 'node1', target: 'node2' },
        { id: 'e2', source: 'node2', target: 'node1' }, // Creates cycle
      ],
      metadata: {
        created: new Date(),
        modified: new Date(),
        version: '1.0',
      },
    };
  }
  createLargeGraph() {
    return {
      id: 'large',
      version: '1.0',
      nodes: Array.from({ length: 50 }, (_, i) => ({
        id: `node-${i}`,
        type: 'text',
        data: { content: `Large graph node ${i}` },
        position: { x: i * 20, y: 0 },
      })),
      edges: Array.from({ length: 49 }, (_, i) => ({
        id: `edge-${i}`,
        source: `node-${i}`,
        target: `node-${i + 1}`,
      })),
      metadata: {
        created: new Date(),
        modified: new Date(),
        version: '1.0',
      },
    };
  }
  createDeepGraph() {
    const depth = 20;
    return {
      id: 'deep',
      version: '1.0',
      nodes: Array.from({ length: depth }, (_, i) => ({
        id: `level-${i}`,
        type: 'text',
        data: { content: `Deep level ${i}` },
        position: { x: 0, y: i * 50 },
      })),
      edges: Array.from({ length: depth - 1 }, (_, i) => ({
        id: `deep-edge-${i}`,
        source: `level-${i}`,
        target: `level-${i + 1}`,
      })),
      metadata: {
        created: new Date(),
        modified: new Date(),
        version: '1.0',
      },
    };
  }
  createDisconnectedGraph() {
    return {
      id: 'disconnected',
      version: '1.0',
      nodes: [
        {
          id: 'connected1',
          type: 'text',
          data: { content: 'Connected 1' },
          position: { x: 0, y: 0 },
        },
        {
          id: 'connected2',
          type: 'text',
          data: { content: 'Connected 2' },
          position: { x: 100, y: 0 },
        },
        {
          id: 'isolated',
          type: 'text',
          data: { content: 'Isolated node' },
          position: { x: 300, y: 0 },
        },
      ],
      edges: [{ id: 'conn-edge', source: 'connected1', target: 'connected2' }],
      metadata: {
        created: new Date(),
        modified: new Date(),
        version: '1.0',
      },
    };
  }
  createOptimalGraph() {
    return {
      id: 'optimal',
      version: '1.0',
      nodes: [
        {
          id: 'well-formed',
          type: 'text',
          data: {
            content: 'Well-formed content with proper structure',
            parameters: { temperature: 0.7 },
          },
          position: { x: 0, y: 0 },
        },
      ],
      edges: [],
      metadata: {
        created: new Date(),
        modified: new Date(),
        version: '1.0',
      },
    };
  }
  createProblematicGraph() {
    return {
      id: 'problematic',
      version: '1.0',
      nodes: [
        {
          id: 'problematic-node',
          type: 'unsupported-type',
          data: {
            content: '', // Empty content
            parameters: { invalid_param: 'bad_value' },
          },
          position: { x: 0, y: 0 },
        },
      ],
      edges: [],
      metadata: {
        created: new Date(),
        modified: new Date(),
        version: '1.0',
      },
    };
  }
}
