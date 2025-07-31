/**
 * k6 Load Test: Graph Execution Performance
 *
 * Tests the primary performance bottleneck - the /preview endpoint
 * which executes PromptScape graphs and generates deterministic outputs.
 *
 * This test simulates realistic graph execution patterns with varying
 * complexity and concurrent load to validate Epic 20 scaling requirements.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics for PromptScape-specific monitoring
const graphExecutionErrors = new Counter('graph_execution_errors');
const graphExecutionDuration = new Trend('graph_execution_duration');
const deterministicValidation = new Rate('deterministic_validation_rate');

// Test configuration based on Epic 20 requirements
export const options = {
  stages: [
    // Ramp-up: Gradually increase load to test scaling
    { duration: '2m', target: 20 }, // Start with 20 concurrent users
    { duration: '5m', target: 50 }, // Scale to moderate load
    { duration: '8m', target: 100 }, // Peak load testing
    { duration: '5m', target: 200 }, // Stress testing toward Epic 20 targets
    { duration: '2m', target: 0 }, // Ramp-down
  ],

  // Performance thresholds based on PromptScape requirements
  thresholds: {
    // Core performance requirements
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.05'], // Less than 5% failure rate

    // PromptScape-specific thresholds
    graph_execution_duration: ['p(90)<1000'], // 90% of graph executions under 1s
    deterministic_validation_rate: ['rate>0.98'], // 98% deterministic consistency
    graph_execution_errors: ['count<10'], // Less than 10 execution errors total
  },

  // Additional configuration
  userAgent: 'k6-promptscape-load-test/1.0',
  insecureSkipTLSVerify: true, // For local testing
};

// Sample graph configurations for testing
const testGraphs = {
  simple: {
    nodes: [
      {
        id: 'start',
        type: 'WeightedChoice',
        data: {
          choices: [
            { text: 'Hello', weight: 0.5 },
            { text: 'Hi', weight: 0.3 },
            { text: 'Hey', weight: 0.2 },
          ],
        },
      },
      {
        id: 'end',
        type: 'Output',
        data: { template: '{{start}} world!' },
      },
    ],
    edges: [{ source: 'start', target: 'end' }],
  },

  complex: {
    nodes: [
      {
        id: 'subject',
        type: 'WeightedChoice',
        data: {
          choices: [
            { text: 'The brave knight', weight: 0.3 },
            { text: 'A wise wizard', weight: 0.3 },
            { text: 'The cunning rogue', weight: 0.4 },
          ],
        },
      },
      {
        id: 'action',
        type: 'Conditional',
        data: {
          condition: 'subject.includes("knight")',
          trueValue: 'charges into battle',
          falseValue: 'uses cunning and wit',
        },
      },
      {
        id: 'outcome',
        type: 'Sequential',
        data: {
          pattern: 'linear',
          items: [
            'and emerges victorious',
            'but faces unexpected challenges',
            'and discovers hidden treasures',
            'while making unlikely allies',
          ],
        },
      },
      {
        id: 'final',
        type: 'Output',
        data: { template: '{{subject}} {{action}} {{outcome}}.' },
      },
    ],
    edges: [
      { source: 'subject', target: 'action' },
      { source: 'action', target: 'outcome' },
      { source: 'outcome', target: 'final' },
    ],
  },

  advanced: {
    nodes: [
      {
        id: 'mood',
        type: 'Markov',
        data: {
          states: ['happy', 'contemplative', 'adventurous'],
          transitions: {
            happy: { contemplative: 0.4, adventurous: 0.6 },
            contemplative: { happy: 0.3, adventurous: 0.7 },
            adventurous: { happy: 0.5, contemplative: 0.5 },
          },
          initialState: 'happy',
        },
      },
      {
        id: 'character',
        type: 'WeightedAdvanced',
        data: {
          distribution: 'exponential',
          choices: [
            { text: 'protagonist', weight: 0.4 },
            { text: 'mentor', weight: 0.3 },
            { text: 'challenger', weight: 0.3 },
          ],
        },
      },
      {
        id: 'story',
        type: 'Output',
        data: { template: 'The {{mood}} {{character}} begins their journey...' },
      },
    ],
    edges: [
      { source: 'mood', target: 'story' },
      { source: 'character', target: 'story' },
    ],
  },
};

// Deterministic validation: Same seed should produce identical results
function validateDeterministicExecution(graph, seed) {
  const results = [];

  // Execute the same graph with the same seed multiple times
  for (let i = 0; i < 3; i++) {
    const response = http.post(
      'http://localhost:8000/preview',
      JSON.stringify({
        graph: graph,
        seeds: [seed],
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: '10s',
      }
    );

    if (response.status === 200) {
      const result = JSON.parse(response.body);
      results.push(result.outputs?.[0]?.result);
    }
  }

  // All results should be identical for deterministic execution
  const isConsistent = results.length === 3 && results.every(result => result === results[0]);

  deterministicValidation.add(isConsistent);
  return isConsistent;
}

// Main test function
export default function () {
  // Select graph type based on load pattern
  const userId = __VU; // Virtual User ID
  let selectedGraph;

  if (userId % 3 === 0) {
    selectedGraph = testGraphs.advanced; // 33% advanced graphs
  } else if (userId % 3 === 1) {
    selectedGraph = testGraphs.complex; // 33% complex graphs
  } else {
    selectedGraph = testGraphs.simple; // 33% simple graphs
  }

  // Generate multiple seeds for varied output testing
  const seeds = [
    Math.floor(Math.random() * 10000),
    Math.floor(Math.random() * 10000),
    Math.floor(Math.random() * 10000),
    Math.floor(Math.random() * 10000),
    Math.floor(Math.random() * 10000),
  ];

  const startTime = Date.now();

  // Execute graph with multiple seeds
  const response = http.post(
    'http://localhost:8000/preview',
    JSON.stringify({
      graph: selectedGraph,
      seeds: seeds,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'k6-load-test',
      },
      timeout: '30s', // Allow time for complex graph execution
      tags: {
        graph_type:
          selectedGraph === testGraphs.simple
            ? 'simple'
            : selectedGraph === testGraphs.complex
              ? 'complex'
              : 'advanced',
      },
    }
  );

  const executionTime = Date.now() - startTime;
  graphExecutionDuration.add(executionTime);

  // Validate response
  const validExecution = check(response, {
    'status is 200': r => r.status === 200,
    'response time < 5s': r => r.timings.duration < 5000,
    'has valid JSON body': r => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
    'contains expected output structure': r => {
      try {
        const result = JSON.parse(r.body);
        return result.outputs && Array.isArray(result.outputs) && result.outputs.length === seeds.length;
      } catch {
        return false;
      }
    },
  });

  if (!validExecution) {
    graphExecutionErrors.add(1);
    console.log(`Graph execution failed for VU ${__VU}: ${response.status} - ${response.body}`);
  }

  // Periodically validate deterministic execution (every 10th user)
  if (userId % 10 === 0) {
    validateDeterministicExecution(testGraphs.simple, 12345);
  }

  // Health check endpoint validation
  if (userId % 20 === 0) {
    const healthResponse = http.get('http://localhost:8000/health', {
      timeout: '5s',
    });

    check(healthResponse, {
      'health check successful': r => r.status === 200,
      'health check responds quickly': r => r.timings.duration < 1000,
    });
  }

  // Realistic user behavior: Brief pause between requests
  sleep(Math.random() * 2 + 1); // 1-3 second pause
}

// Setup function (runs once at the beginning)
export function setup() {
  console.log('🚀 Starting PromptScape Graph Execution Load Test');
  console.log('📊 Target: 200 concurrent users with mixed graph complexity');
  console.log('🎯 Thresholds: <2s response time, <5% error rate, deterministic execution');

  // Verify server is accessible
  const healthCheck = http.get('http://localhost:8000/health');
  if (healthCheck.status !== 200) {
    console.error('❌ Server health check failed. Is the server running?');
    throw new Error('Server not accessible');
  }

  console.log('✅ Server health check passed');
  return { startTime: Date.now() };
}

// Teardown function (runs once at the end)
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`🏁 Load test completed in ${duration} seconds`);
  console.log('📈 Check metrics above for performance analysis');
}
