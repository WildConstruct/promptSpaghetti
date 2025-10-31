#!/usr/bin/env node

/**
 * Graph Execution Load Test
 *
 * Comprehensive load testing for graph execution endpoints including:
 * - Graph creation and validation
 * - Single graph execution
 * - Batch graph execution
 * - Graph preview with multiple seeds
 * - Graph export operations
 * - Graph performance monitoring
 *
 * Task: T-1752989144295-507 - Implement automated load test scripts for key user flows
 */

const { LoadTestRunner, LoadTestConfig } = require('./LoadTestFramework');
const crypto = require('crypto');

/**
 * Sample graph templates for testing
 */
const sampleGraphs = {
  simple: {
    nodes: [
      {
        id: 'start',
        type: 'Output',
        data: { text: 'Hello from load test {seed}!' },
        position: { x: 100, y: 100 }
      }
    ],
    edges: []
  },
  weighted: {
    nodes: [
      {
        id: 'choice',
        type: 'WeightedChoice',
        data: {
          choices: [
            { id: 'c1', text: 'Option A', weight: 50 },
            { id: 'c2', text: 'Option B', weight: 30 },
            { id: 'c3', text: 'Option C', weight: 20 }
          ]
        },
        position: { x: 100, y: 100 }
      },
      {
        id: 'output',
        type: 'Output',
        data: { text: 'Selected: {choice}' },
        position: { x: 300, y: 100 }
      }
    ],
    edges: [{ id: 'e1', source: 'choice', target: 'output' }]
  },
  complex: {
    nodes: [
      {
        id: 'var1',
        type: 'SetVariable',
        data: { name: 'topic', value: 'AI Technology' },
        position: { x: 50, y: 50 }
      },
      {
        id: 'choice1',
        type: 'WeightedChoice',
        data: {
          choices: [
            { id: 'tech', text: 'Technical', weight: 40 },
            { id: 'casual', text: 'Casual', weight: 60 }
          ]
        },
        position: { x: 200, y: 50 }
      },
      {
        id: 'concat1',
        type: 'Concat',
        data: {
          template: 'Write a {choice1} article about {topic}: ',
          separator: ' '
        },
        position: { x: 350, y: 50 }
      },
      {
        id: 'choice2',
        type: 'WeightedChoice',
        data: {
          choices: [
            { id: 'intro', text: 'Introduction and overview', weight: 30 },
            { id: 'details', text: 'Detailed analysis', weight: 40 },
            { id: 'conclusion', text: 'Summary and conclusions', weight: 30 }
          ]
        },
        position: { x: 500, y: 50 }
      },
      {
        id: 'output',
        type: 'Output',
        data: { text: '{concat1}{choice2}' },
        position: { x: 650, y: 50 }
      }
    ],
    edges: [
      { id: 'e1', source: 'var1', target: 'concat1' },
      { id: 'e2', source: 'choice1', target: 'concat1' },
      { id: 'e3', source: 'concat1', target: 'output' },
      { id: 'e4', source: 'choice2', target: 'output' }
    ]
  },
  advanced: {
    nodes: [
      {
        id: 'conditional',
        type: 'Conditional',
        data: {
          condition: 'getVariable("userLevel") === "expert"',
          trueValue: 'Advanced content for experts',
          falseValue: 'Basic content for beginners'
        },
        position: { x: 100, y: 100 }
      },
      {
        id: 'sequential',
        type: 'Sequential',
        data: {
          items: ['First step', 'Second step', 'Third step'],
          pattern: 'linear'
        },
        position: { x: 300, y: 100 }
      },
      {
        id: 'markov',
        type: 'Markov',
        data: {
          states: {
            start: { middle: 0.7, end: 0.3 },
            middle: { middle: 0.4, end: 0.6 },
            end: { end: 1.0 }
          },
          initialState: 'start',
          maxTransitions: 5
        },
        position: { x: 500, y: 100 }
      },
      {
        id: 'output',
        type: 'Output',
        data: { text: '{conditional} -> {sequential} -> {markov}' },
        position: { x: 700, y: 100 }
      }
    ],
    edges: [
      { id: 'e1', source: 'conditional', target: 'output' },
      { id: 'e2', source: 'sequential', target: 'output' },
      { id: 'e3', source: 'markov', target: 'output' }
    ]
  }
};

/**
 * Graph Execution Test Scenarios
 */
class GraphExecutionTests {
  /**
   * Simple Graph Execution Test
   */
  static async simpleGraphExecutionTest(user) {
    try {
      const testGraph = {
        ...sampleGraphs.simple,
        metadata: {
          name: `Load Test Graph ${user.id}`,
          description: `Test graph for load testing user ${user.id}`,
          createdAt: new Date().toISOString()
        }
      };

      // 1. Execute graph with single seed
      const executeResponse = await user.executeRequest(
        'POST',
        '/api/graphs/execute',
        {
          graph: testGraph,
          seed: user.id * 1000,
          variables: {}
        }
      );

      if (executeResponse.statusCode !== 200) {
        console.log(
          `⚠️  Graph execution failed for user ${user.id}: ${executeResponse.statusCode}`
        );
        return false;
      }

      await user.thinkTime();

      // 2. Validate execution result
      const result = executeResponse.data;
      if (!result || !result.output) {
        console.log(`⚠️  Invalid execution result for user ${user.id}`);
        return false;
      }

      // Store execution result for later use
      user.sessionData.lastExecutionResult = result;

      return true;
    } catch (error) {
      console.error(
        `❌ Simple graph execution error for user ${user.id}:`,
        error.message || error
      );
      return false;
    }
  }

  /**
   * Preview Graph Test (Multiple Seeds)
   */
  static async graphPreviewTest(user) {
    try {
      const testGraph = {
        ...sampleGraphs.weighted,
        metadata: {
          name: `Preview Test Graph ${user.id}`,
          description: `Preview test graph for user ${user.id}`
        }
      };

      // 1. Execute preview with multiple seeds
      const previewResponse = await user.executeRequest(
        'POST',
        '/api/graphs/preview',
        {
          graph: testGraph,
          seeds: [1, 2, 3, 4, 5],
          variables: {}
        }
      );

      if (previewResponse.statusCode !== 200) {
        console.log(
          `⚠️  Graph preview failed for user ${user.id}: ${previewResponse.statusCode}`
        );
        return false;
      }

      await user.thinkTime();

      // 2. Validate preview results
      const results = previewResponse.data?.results || [];
      if (results.length !== 5) {
        console.log(
          `⚠️  Expected 5 preview results, got ${results.length} for user ${user.id}`
        );
        return false;
      }

      // 3. Check each result has valid output
      let validResults = 0;
      results.forEach((result, index) => {
        if (result && result.output && result.seed === index + 1) {
          validResults++;
        }
      });

      if (validResults !== 5) {
        console.log(
          `⚠️  Only ${validResults}/5 valid preview results for user ${user.id}`
        );
        return false;
      }

      user.sessionData.previewResults = results;
      return true;
    } catch (error) {
      console.error(
        `❌ Graph preview error for user ${user.id}:`,
        error.message || error
      );
      return false;
    }
  }

  /**
   * Complex Graph Execution Test
   */
  static async complexGraphExecutionTest(user) {
    try {
      const testGraph = {
        ...sampleGraphs.complex,
        metadata: {
          name: `Complex Test Graph ${user.id}`,
          description: `Complex graph test for user ${user.id}`,
          tags: ['load-test', 'complex']
        }
      };

      // 1. Execute complex graph
      const executeResponse = await user.executeRequest(
        'POST',
        '/api/graphs/execute',
        {
          graph: testGraph,
          seed: user.id * 1337,
          variables: {
            topic: 'Machine Learning',
            userLevel: user.id % 2 === 0 ? 'expert' : 'beginner'
          }
        }
      );

      if (executeResponse.statusCode !== 200) {
        console.log(
          `⚠️  Complex graph execution failed for user ${user.id}: ${executeResponse.statusCode}`
        );
        return false;
      }

      await user.thinkTime();

      // 2. Validate execution time is reasonable
      const executionTime = executeResponse.responseTime || 0;
      if (executionTime > 5000) {
        // 5 seconds threshold
        console.log(
          `⚠️  Complex graph execution took ${executionTime}ms for user ${user.id} - performance issue`
        );
      }

      // 3. Validate result structure
      const result = executeResponse.data;
      if (!result || !result.output || !result.executionStats) {
        console.log(`⚠️  Invalid complex execution result for user ${user.id}`);
        return false;
      }

      user.sessionData.complexExecutionStats = result.executionStats;
      return true;
    } catch (error) {
      console.error(
        `❌ Complex graph execution error for user ${user.id}:`,
        error.message || error
      );
      return false;
    }
  }

  /**
   * Advanced Graph Execution Test (Epic 7 nodes)
   */
  static async advancedGraphExecutionTest(user) {
    try {
      const testGraph = {
        ...sampleGraphs.advanced,
        metadata: {
          name: `Advanced Test Graph ${user.id}`,
          description: `Advanced Epic 7 graph test for user ${user.id}`,
          tags: ['load-test', 'advanced', 'epic7']
        }
      };

      // 1. Execute advanced graph with Epic 7 nodes
      const executeResponse = await user.executeRequest(
        'POST',
        '/api/graphs/execute',
        {
          graph: testGraph,
          seed: user.id * 2024,
          variables: {
            userLevel: user.id % 3 === 0 ? 'expert' : 'beginner',
            complexity: 'high'
          }
        }
      );

      if (executeResponse.statusCode !== 200) {
        console.log(
          `⚠️  Advanced graph execution failed for user ${user.id}: ${executeResponse.statusCode}`
        );
        return false;
      }

      await user.thinkTime();

      // 2. Validate advanced node execution
      const result = executeResponse.data;
      if (!result || !result.output) {
        console.log(
          `⚠️  Invalid advanced execution result for user ${user.id}`
        );
        return false;
      }

      // 3. Check for advanced node state tracking
      if (result.nodeStates) {
        const stateCount = Object.keys(result.nodeStates).length;
        if (stateCount === 0) {
          console.log(
            `⚠️  No node states tracked for advanced execution user ${user.id}`
          );
        }
      }

      return true;
    } catch (error) {
      console.error(
        `❌ Advanced graph execution error for user ${user.id}:`,
        error.message || error
      );
      return false;
    }
  }

  /**
   * Batch Graph Execution Test
   */
  static async batchGraphExecutionTest(user) {
    try {
      // Create multiple graphs for batch execution
      const batchGraphs = [
        { ...sampleGraphs.simple, id: `batch_1_${user.id}` },
        { ...sampleGraphs.weighted, id: `batch_2_${user.id}` },
        { ...sampleGraphs.complex, id: `batch_3_${user.id}` }
      ];

      // 1. Execute batch of graphs
      const batchResponse = await user.executeRequest(
        'POST',
        '/api/graphs/batch-execute',
        {
          graphs: batchGraphs,
          baseVariables: {
            batchId: `batch_${user.id}_${Date.now()}`,
            userId: user.id
          },
          seedStart: user.id * 100
        }
      );

      if (batchResponse.statusCode !== 200) {
        console.log(
          `⚠️  Batch execution failed for user ${user.id}: ${batchResponse.statusCode}`
        );
        return false;
      }

      await user.thinkTime();

      // 2. Validate batch results
      const batchResults = batchResponse.data?.results || [];
      if (batchResults.length !== batchGraphs.length) {
        console.log(
          `⚠️  Expected ${batchGraphs.length} batch results, got ${batchResults.length} for user ${user.id}`
        );
        return false;
      }

      // 3. Check each batch result
      let successfulResults = 0;
      batchResults.forEach((result, index) => {
        if (result && result.success && result.output) {
          successfulResults++;
        }
      });

      if (successfulResults !== batchGraphs.length) {
        console.log(
          `⚠️  Only ${successfulResults}/${batchGraphs.length} successful batch results for user ${user.id}`
        );
        return false;
      }

      user.sessionData.batchResults = batchResults;
      return true;
    } catch (error) {
      console.error(
        `❌ Batch graph execution error for user ${user.id}:`,
        error.message || error
      );
      return false;
    }
  }

  /**
   * Graph Export and Validation Test
   */
  static async graphExportTest(user) {
    try {
      const testGraph = {
        ...sampleGraphs.weighted,
        metadata: {
          name: `Export Test Graph ${user.id}`,
          description: `Graph export test for user ${user.id}`
        }
      };

      // 1. Export graph to bundle format
      const exportResponse = await user.executeRequest(
        'POST',
        '/api/graphs/export',
        {
          graph: testGraph,
          format: 'bundle'
        }
      );

      if (exportResponse.statusCode !== 200) {
        console.log(
          `⚠️  Graph export failed for user ${user.id}: ${exportResponse.statusCode}`
        );
        return false;
      }

      await user.thinkTime();

      // 2. Validate exported bundle
      const bundle = exportResponse.data;
      if (!bundle || !bundle.generators || bundle.generators.length === 0) {
        console.log(`⚠️  Invalid export bundle for user ${user.id}`);
        return false;
      }

      // 3. Validate graph structure
      const validateResponse = await user.executeRequest(
        'POST',
        '/api/graphs/validate',
        {
          graph: testGraph
        }
      );

      if (validateResponse.statusCode !== 200) {
        console.log(
          `⚠️  Graph validation failed for user ${user.id}: ${validateResponse.statusCode}`
        );
        return false;
      }

      const validation = validateResponse.data;
      if (!validation.isValid) {
        console.log(
          `⚠️  Graph validation failed for user ${user.id}: ${validation.errors?.join(', ')}`
        );
        return false;
      }

      user.sessionData.exportedBundle = bundle;
      return true;
    } catch (error) {
      console.error(
        `❌ Graph export error for user ${user.id}:`,
        error.message || error
      );
      return false;
    }
  }

  /**
   * Graph Performance Monitoring Test
   */
  static async graphPerformanceTest(user) {
    try {
      const testGraph = {
        ...sampleGraphs.complex,
        metadata: {
          name: `Performance Test Graph ${user.id}`,
          description: `Performance monitoring test for user ${user.id}`
        }
      };

      // 1. Execute with performance monitoring
      const performanceResponse = await user.executeRequest(
        'POST',
        '/api/graphs/execute',
        {
          graph: testGraph,
          seed: user.id * 999,
          variables: {},
          enableProfiling: true,
          trackMetrics: true
        }
      );

      if (performanceResponse.statusCode !== 200) {
        console.log(
          `⚠️  Performance execution failed for user ${user.id}: ${performanceResponse.statusCode}`
        );
        return false;
      }

      await user.thinkTime();

      // 2. Validate performance metrics
      const result = performanceResponse.data;
      if (!result.performance || !result.executionStats) {
        console.log(`⚠️  No performance data for user ${user.id}`);
        return false;
      }

      // 3. Check performance thresholds
      const metrics = result.performance;
      if (metrics.totalExecutionTime > 10000) {
        // 10 seconds
        console.log(
          `⚠️  Execution time ${metrics.totalExecutionTime}ms exceeds threshold for user ${user.id}`
        );
      }

      if (metrics.memoryUsage && metrics.memoryUsage > 100 * 1024 * 1024) {
        // 100MB
        console.log(
          `⚠️  Memory usage ${metrics.memoryUsage} bytes exceeds threshold for user ${user.id}`
        );
      }

      user.sessionData.performanceMetrics = metrics;
      return true;
    } catch (error) {
      console.error(
        `❌ Graph performance test error for user ${user.id}:`,
        error.message || error
      );
      return false;
    }
  }

  /**
   * Comprehensive Graph Execution Flow Test
   */
  static async comprehensiveGraphTest(user) {
    const flowResults = {
      simple: false,
      preview: false,
      complex: false,
      advanced: false,
      batch: false,
      export: false,
      performance: false
    };

    try {
      // Test different flows based on user ID to distribute load
      const testPattern = user.id % 7;

      switch (testPattern) {
        case 0:
          // Simple + Preview flow
          flowResults.simple =
            await GraphExecutionTests.simpleGraphExecutionTest(user);
          await user.thinkTime();
          flowResults.preview =
            await GraphExecutionTests.graphPreviewTest(user);
          break;

        case 1:
          // Complex + Performance flow
          flowResults.complex =
            await GraphExecutionTests.complexGraphExecutionTest(user);
          await user.thinkTime();
          flowResults.performance =
            await GraphExecutionTests.graphPerformanceTest(user);
          break;

        case 2:
          // Advanced + Export flow
          flowResults.advanced =
            await GraphExecutionTests.advancedGraphExecutionTest(user);
          await user.thinkTime();
          flowResults.export = await GraphExecutionTests.graphExportTest(user);
          break;

        case 3:
          // Batch execution flow
          flowResults.batch =
            await GraphExecutionTests.batchGraphExecutionTest(user);
          await user.thinkTime();
          flowResults.simple =
            await GraphExecutionTests.simpleGraphExecutionTest(user);
          break;

        case 4:
          // Preview + Export flow
          flowResults.preview =
            await GraphExecutionTests.graphPreviewTest(user);
          await user.thinkTime();
          flowResults.export = await GraphExecutionTests.graphExportTest(user);
          break;

        case 5:
          // Performance + Advanced flow
          flowResults.performance =
            await GraphExecutionTests.graphPerformanceTest(user);
          await user.thinkTime();
          flowResults.advanced =
            await GraphExecutionTests.advancedGraphExecutionTest(user);
          break;

        case 6:
          // Full flow test
          flowResults.simple =
            await GraphExecutionTests.simpleGraphExecutionTest(user);
          await user.thinkTime();
          flowResults.complex =
            await GraphExecutionTests.complexGraphExecutionTest(user);
          await user.thinkTime();
          flowResults.preview =
            await GraphExecutionTests.graphPreviewTest(user);
          await user.thinkTime();
          flowResults.export = await GraphExecutionTests.graphExportTest(user);
          break;
      }

      // Store results for reporting
      user.sessionData.graphExecutionResults = flowResults;
      return true;
    } catch (error) {
      console.error(
        `❌ Comprehensive graph test error for user ${user.id}:`,
        error.message || error
      );
      return false;
    }
  }
}

/**
 * Run Graph Execution Load Tests
 */
async function runGraphExecutionLoadTests() {
  console.log('📊 Graph Execution Load Tests');
  console.log('=============================\n');

  // Test configurations
  const testConfigs = [
    {
      name: 'Simple Graph Execution - Light Load',
      config: new LoadTestConfig({
        baseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
        concurrency: 10,
        duration: 30000, // 30 seconds
        rampUpTime: 5000, // 5 seconds
        thinkTime: { min: 500, max: 1500 }
      }),
      scenario: GraphExecutionTests.simpleGraphExecutionTest
    },
    {
      name: 'Graph Preview - Medium Load',
      config: new LoadTestConfig({
        baseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
        concurrency: 8,
        duration: 45000, // 45 seconds
        rampUpTime: 10000, // 10 seconds
        thinkTime: { min: 1000, max: 2500 }
      }),
      scenario: GraphExecutionTests.graphPreviewTest
    },
    {
      name: 'Complex Graph Execution - Medium Load',
      config: new LoadTestConfig({
        baseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
        concurrency: 6,
        duration: 50000, // 50 seconds
        rampUpTime: 12000, // 12 seconds
        thinkTime: { min: 1500, max: 3000 }
      }),
      scenario: GraphExecutionTests.complexGraphExecutionTest
    },
    {
      name: 'Advanced Graph Execution - Epic 7',
      config: new LoadTestConfig({
        baseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
        concurrency: 4,
        duration: 60000, // 60 seconds
        rampUpTime: 15000, // 15 seconds
        thinkTime: { min: 2000, max: 4000 }
      }),
      scenario: GraphExecutionTests.advancedGraphExecutionTest
    },
    {
      name: 'Comprehensive Graph Execution - Heavy Load',
      config: new LoadTestConfig({
        baseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
        concurrency: 15,
        duration: 90000, // 90 seconds
        rampUpTime: 25000, // 25 seconds
        thinkTime: { min: 1000, max: 3000 },
        userPool: [
          { email: 'graphuser1@example.com', password: 'TestPass123!' },
          { email: 'graphuser2@example.com', password: 'TestPass123!' },
          { email: 'graphuser3@example.com', password: 'TestPass123!' },
          { email: 'graphdev@example.com', password: 'TestPass123!' },
          { email: 'graphadmin@example.com', password: 'TestPass123!' }
        ]
      }),
      scenario: GraphExecutionTests.comprehensiveGraphTest
    }
  ];

  const allResults = [];

  for (const testConfig of testConfigs) {
    console.log(`\n🎯 Running: ${testConfig.name}`);
    console.log('─'.repeat(50));

    const runner = new LoadTestRunner(testConfig.config);
    const results = await runner.runLoadTest(
      testConfig.scenario,
      testConfig.name
    );

    // Export results
    const filename = `graph-execution-load-test-${testConfig.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    runner.exportResults(results, filename);

    allResults.push({
      testName: testConfig.name,
      results,
      filename
    });

    // Pause between tests
    if (testConfig !== testConfigs[testConfigs.length - 1]) {
      console.log('\n⏸️  Pausing 15 seconds between tests...');
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
  }

  // Generate summary report
  console.log('\n📊 Graph Execution Load Test Summary');
  console.log('===================================');

  allResults.forEach((testResult, index) => {
    const { testName, results } = testResult;
    console.log(`\n${index + 1}. ${testName}:`);
    console.log(`   📈 Total Requests: ${results.global.totalRequests}`);
    console.log(
      `   ✅ Success Rate: ${results.global.successRate.toFixed(1)}%`
    );
    console.log(
      `   ⚡ Requests/sec: ${results.global.requestsPerSecond.toFixed(2)}`
    );
    console.log(
      `   ⏱️  Avg Response: ${results.global.averageResponseTime.toFixed(0)}ms`
    );
    console.log(`   📁 Report: ${testResult.filename}`);
  });

  console.log('\n✅ All Graph Execution Load Tests Complete!');
}

// Run tests if called directly
if (require.main === module) {
  runGraphExecutionLoadTests().catch(console.error);
}

module.exports = {
  GraphExecutionTests,
  runGraphExecutionLoadTests
};
