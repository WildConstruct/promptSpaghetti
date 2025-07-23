/**
 * Comprehensive Edge Case Test Suite
 * 
 * Defines systematic edge case and error condition testing for all critical
 * components of the PromptSpaghetti application. This suite ensures robust
 * handling of boundary conditions, malformed inputs, and error scenarios.
 */

import { testDataGenerator, TestScenario } from '../utils/TestDataGenerator';
import { testReliability, retry, waitFor } from '../utils/TestReliabilityFramework';

export interface EdgeCaseTest {
  name: string;
  category: EdgeCaseCategory;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  testFn: () => Promise<void>;
  expectedBehavior: string;
}

export enum EdgeCaseCategory {
  GRAPH_STRUCTURE = 'graph-structure',
  AUTHENTICATION = 'authentication',
  API_VALIDATION = 'api-validation',
  RUNTIME_EXECUTION = 'runtime-execution',
  DATA_VALIDATION = 'data-validation',
  PERFORMANCE_LIMITS = 'performance-limits',
  SECURITY_BOUNDARIES = 'security-boundaries',
  NETWORK_CONDITIONS = 'network-conditions',
  MEMORY_LIMITS = 'memory-limits',
  CONCURRENT_ACCESS = 'concurrent-access'
}

export class EdgeCaseTestSuite {
  private edgeCases: Map<EdgeCaseCategory, EdgeCaseTest[]> = new Map();

  constructor() {
    this.initializeEdgeCases();
  }

  private initializeEdgeCases(): void {
    this.addGraphStructureEdgeCases();
    this.addAuthenticationEdgeCases();
    this.addAPIValidationEdgeCases();
    this.addRuntimeExecutionEdgeCases();
    this.addDataValidationEdgeCases();
    this.addPerformanceLimitEdgeCases();
    this.addSecurityBoundaryEdgeCases();
    this.addNetworkConditionEdgeCases();
    this.addMemoryLimitEdgeCases();
    this.addConcurrentAccessEdgeCases();
  }

  /**
   * Graph Structure Edge Cases
   */
  private addGraphStructureEdgeCases(): void {
    const graphEdgeCases: EdgeCaseTest[] = [
      {
        name: 'Empty Graph Execution',
        category: EdgeCaseCategory.GRAPH_STRUCTURE,
        severity: 'high',
        description: 'Test execution of completely empty graph',
        expectedBehavior: 'Should return empty result or appropriate error without crashing',
        testFn: async () => {
          const emptyGraph = testDataGenerator.generateGraph({
            nodeCount: 0,
            seed: 123,
            scenario: TestScenario.SIMPLE_LINEAR,
            complexity: 'simple',
            includeAdvancedNodes: false
          });
          
          // Test should handle empty graph gracefully
          await retry.test(async () => {
            const executeGraph = await import('../../server/src/engine');
            const result = await executeGraph.executeGraph(emptyGraph as any);
            expect(result).toBeDefined();
          }, 'empty-graph-execution');
        }
      },

      {
        name: 'Circular Dependency Detection',
        category: EdgeCaseCategory.GRAPH_STRUCTURE,
        severity: 'critical',
        description: 'Test detection and handling of circular dependencies in graph',
        expectedBehavior: 'Should detect circular dependency and prevent infinite loops',
        testFn: async () => {
          const circularGraph = testDataGenerator.generateGraph({
            nodeCount: 5,
            seed: 456,
            scenario: TestScenario.CIRCULAR_DEPENDENCY,
            complexity: 'moderate',
            includeAdvancedNodes: false
          });
          
          await retry.test(async () => {
            const executeGraph = await import('../../server/src/engine');
            
            // Should either detect cycle or timeout gracefully
            const startTime = Date.now();
            try {
              await executeGraph.executeGraph(circularGraph as any);
            } catch (error) {
              const duration = Date.now() - startTime;
              expect(duration).toBeLessThan(5000); // Should not hang indefinitely
              expect(error.message).toMatch(/circular|cycle|dependency/i);
            }
          }, 'circular-dependency-detection');
        }
      },

      {
        name: 'Maximum Node Count Stress',
        category: EdgeCaseCategory.GRAPH_STRUCTURE,
        severity: 'medium',
        description: 'Test system behavior with maximum allowable nodes',
        expectedBehavior: 'Should handle large graphs or fail gracefully with memory limits',
        testFn: async () => {
          const largeGraph = testDataGenerator.generateGraph({
            nodeCount: 1000,
            seed: 789,
            scenario: TestScenario.PERFORMANCE_STRESS,
            complexity: 'complex',
            includeAdvancedNodes: true
          });
          
          await retry.test(async () => {
            const executeGraph = await import('../../server/src/engine');
            
            const startMemory = process.memoryUsage().heapUsed;
            const result = await executeGraph.executeGraph(largeGraph as any);
            const endMemory = process.memoryUsage().heapUsed;
            
            expect(result).toBeDefined();
            expect(endMemory - startMemory).toBeLessThan(100 * 1024 * 1024); // < 100MB
          }, 'maximum-node-count-stress');
        }
      },

      {
        name: 'Deeply Nested Graph Execution',
        category: EdgeCaseCategory.GRAPH_STRUCTURE,
        severity: 'high',
        description: 'Test execution of graphs with excessive nesting depth',
        expectedBehavior: 'Should handle deep nesting or prevent stack overflow',
        testFn: async () => {
          const deepGraph = testDataGenerator.generateGraph({
            nodeCount: 100,
            seed: 321,
            scenario: TestScenario.DEEP_NESTING,
            complexity: 'complex',
            includeAdvancedNodes: true
          });
          
          await retry.test(async () => {
            const executeGraph = await import('../../server/src/engine');
            
            // Test should not cause stack overflow
            const result = await executeGraph.executeGraph(deepGraph as any);
            expect(result).toBeDefined();
          }, 'deeply-nested-graph-execution');
        }
      }
    ];

    this.edgeCases.set(EdgeCaseCategory.GRAPH_STRUCTURE, graphEdgeCases);
  }

  /**
   * Authentication Edge Cases
   */
  private addAuthenticationEdgeCases(): void {
    const authEdgeCases: EdgeCaseTest[] = [
      {
        name: 'Expired Token During Request',
        category: EdgeCaseCategory.AUTHENTICATION,
        severity: 'critical',
        description: 'Test behavior when JWT token expires mid-request',
        expectedBehavior: 'Should handle token expiration gracefully and redirect to login',
        testFn: async () => {
          await retry.test(async () => {
            // Create expired token
            const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
            
            // Mock API request with expired token
            const response = await fetch('/api/test', {
              headers: {
                'Authorization': `Bearer ${expiredToken}`
              }
            });
            
            expect([401, 403]).toContain(response.status);
          }, 'expired-token-handling');
        }
      },

      {
        name: 'Concurrent Session Conflict',
        category: EdgeCaseCategory.AUTHENTICATION,
        severity: 'high',
        description: 'Test handling of multiple concurrent sessions for same user',
        expectedBehavior: 'Should handle concurrent sessions per security policy',
        testFn: async () => {
          await retry.test(async () => {
            const user = testDataGenerator.generateUser({
              role: 'user',
              permissions: ['read'],
              isVerified: true,
              mfaEnabled: false
            });
            
            // Simulate multiple concurrent login attempts
            const promises = Array.from({ length: 5 }, async (_, i) => {
              return await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: user.email,
                  password: 'testpassword123'
                })
              });
            });
            
            const results = await Promise.all(promises);
            
            // Should handle concurrent sessions appropriately
            expect(results.some(r => r.ok)).toBe(true);
          }, 'concurrent-session-conflict');
        }
      },

      {
        name: 'Malformed Authentication Headers',
        category: EdgeCaseCategory.AUTHENTICATION,
        severity: 'medium',
        description: 'Test handling of malformed or invalid auth headers',
        expectedBehavior: 'Should reject invalid headers with appropriate error codes',
        testFn: async () => {
          const malformedHeaders = [
            'Bearer ',
            'Bearer invalid_token',
            'Basic invalid',
            'Token malformed',
            '',
            null,
            undefined
          ];
          
          for (const header of malformedHeaders) {
            await retry.test(async () => {
              const headers: any = {};
              if (header !== null && header !== undefined) {
                headers['Authorization'] = header;
              }
              
              const response = await fetch('/api/protected', { headers });
              expect([400, 401, 403]).toContain(response.status);
            }, `malformed-header-${header || 'null'}`);
          }
        }
      }
    ];

    this.edgeCases.set(EdgeCaseCategory.AUTHENTICATION, authEdgeCases);
  }

  /**
   * API Validation Edge Cases
   */
  private addAPIValidationEdgeCases(): void {
    const apiEdgeCases: EdgeCaseTest[] = [
      {
        name: 'Malformed JSON Payloads',
        category: EdgeCaseCategory.API_VALIDATION,
        severity: 'high',
        description: 'Test API handling of malformed JSON in request bodies',
        expectedBehavior: 'Should return 400 Bad Request with clear error message',
        testFn: async () => {
          const malformedPayloads = [
            '{ invalid json',
            '{ "key": }',
            '{ "key": "value", }',
            '{',
            '}',
            '[]',
            'not json at all',
            ''
          ];
          
          for (const payload of malformedPayloads) {
            await retry.test(async () => {
              const response = await fetch('/api/graphs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload
              });
              
              expect(response.status).toBe(400);
              const error = await response.json();
              expect(error.message).toMatch(/json|parse|syntax/i);
            }, `malformed-json-${payload.substring(0, 10)}`);
          }
        }
      },

      {
        name: 'Oversized Request Payloads',
        category: EdgeCaseCategory.API_VALIDATION,
        severity: 'medium',
        description: 'Test handling of requests exceeding size limits',
        expectedBehavior: 'Should reject oversized requests with 413 Payload Too Large',
        testFn: async () => {
          await retry.test(async () => {
            // Create oversized payload (10MB)
            const largePayload = {
              data: new Array(10 * 1024 * 1024).fill('X').join('')
            };
            
            const response = await fetch('/api/graphs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(largePayload)
            });
            
            expect([413, 400]).toContain(response.status);
          }, 'oversized-payload');
        }
      },

      {
        name: 'SQL Injection Attempts',
        category: EdgeCaseCategory.API_VALIDATION,
        severity: 'critical',
        description: 'Test API resilience against SQL injection attempts',
        expectedBehavior: 'Should sanitize inputs and prevent SQL injection',
        testFn: async () => {
          const sqlInjectionPayloads = [
            '\'; DROP TABLE users; --',
            '\' OR \'1\'=\'1',
            '\'; DELETE FROM graphs WHERE \'1\'=\'1\'; --',
            '\' UNION SELECT * FROM users --',
            '\'; INSERT INTO users VALUES (\'hacker\', \'password\'); --'
          ];
          
          for (const payload of sqlInjectionPayloads) {
            await retry.test(async () => {
              const response = await fetch(`/api/graphs?search=${encodeURIComponent(payload)}`);
              
              // Should not return 500 internal server error (indicating SQL error)
              expect(response.status).not.toBe(500);
              
              // Response should be sanitized/safe
              const data = await response.json();
              expect(JSON.stringify(data)).not.toMatch(/DROP|DELETE|INSERT|UNION/i);
            }, `sql-injection-${payload.substring(0, 10)}`);
          }
        }
      }
    ];

    this.edgeCases.set(EdgeCaseCategory.API_VALIDATION, apiEdgeCases);
  }

  /**
   * Runtime Execution Edge Cases
   */
  private addRuntimeExecutionEdgeCases(): void {
    const runtimeEdgeCases: EdgeCaseTest[] = [
      {
        name: 'Infinite Loop Detection',
        category: EdgeCaseCategory.RUNTIME_EXECUTION,
        severity: 'critical',
        description: 'Test detection of infinite loops in graph execution',
        expectedBehavior: 'Should detect and break infinite loops with timeout',
        testFn: async () => {
          await retry.test(async () => {
            // Create a graph that could cause infinite loops
            const graph = {
              seed: 123,
              nodes: [
                {
                  id: 'loop1',
                  type: 'Conditional',
                  data: {
                    branches: [
                      { condition: 'true', output: 'continue', label: 'Always True' }
                    ],
                    defaultOutput: 'continue'
                  }
                },
                {
                  id: 'loop2',
                  type: 'SetVariable',
                  data: {
                    variableName: 'counter',
                    value: '1'
                  }
                }
              ],
              edges: [
                { id: 'edge1', source: 'loop1', target: 'loop2' },
                { id: 'edge2', source: 'loop2', target: 'loop1' }
              ]
            };
            
            const executeGraph = await import('../../server/src/engine');
            
            const startTime = Date.now();
            try {
              await executeGraph.executeGraph(graph as any);
            } catch (error) {
              const duration = Date.now() - startTime;
              expect(duration).toBeLessThan(10000); // Should timeout within 10s
              expect(error.message).toMatch(/timeout|infinite|loop/i);
            }
          }, 'infinite-loop-detection');
        }
      },

      {
        name: 'Memory Exhaustion Prevention',
        category: EdgeCaseCategory.RUNTIME_EXECUTION,
        severity: 'high',
        description: 'Test prevention of memory exhaustion during execution',
        expectedBehavior: 'Should limit memory usage and fail gracefully',
        testFn: async () => {
          await retry.test(async () => {
            const memoryIntensiveGraph = testDataGenerator.generateGraph({
              nodeCount: 50,
              seed: 999,
              scenario: TestScenario.MEMORY_INTENSIVE,
              complexity: 'complex',
              includeAdvancedNodes: true
            });
            
            const executeGraph = await import('../../server/src/engine');
            
            const startMemory = process.memoryUsage().heapUsed;
            
            try {
              await executeGraph.executeGraph(memoryIntensiveGraph as any);
            } catch (error) {
              // Should fail gracefully rather than crash
              expect(error).toBeDefined();
            }
            
            const endMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = endMemory - startMemory;
            
            // Should not consume more than 500MB
            expect(memoryIncrease).toBeLessThan(500 * 1024 * 1024);
          }, 'memory-exhaustion-prevention');
        }
      },

      {
        name: 'Invalid Variable References',
        category: EdgeCaseCategory.RUNTIME_EXECUTION,
        severity: 'medium',
        description: 'Test handling of references to non-existent variables',
        expectedBehavior: 'Should handle undefined variables with default values or errors',
        testFn: async () => {
          await retry.test(async () => {
            const graph = {
              seed: 456,
              nodes: [
                {
                  id: 'get-invalid',
                  type: 'GetVariable',
                  data: {
                    variableName: 'nonExistentVariable',
                    defaultValue: 'default'
                  }
                },
                {
                  id: 'output',
                  type: 'Output',
                  data: {}
                }
              ],
              edges: [
                { id: 'edge1', source: 'get-invalid', target: 'output' }
              ]
            };
            
            const executeGraph = await import('../../server/src/engine');
            const result = await executeGraph.executeGraph(graph as any);
            
            // Should handle gracefully with default value
            expect(result).toBeDefined();
          }, 'invalid-variable-references');
        }
      }
    ];

    this.edgeCases.set(EdgeCaseCategory.RUNTIME_EXECUTION, runtimeEdgeCases);
  }

  /**
   * Data Validation Edge Cases
   */
  private addDataValidationEdgeCases(): void {
    const dataEdgeCases: EdgeCaseTest[] = [
      {
        name: 'Unicode and Special Characters',
        category: EdgeCaseCategory.DATA_VALIDATION,
        severity: 'medium',
        description: 'Test handling of Unicode and special characters in data',
        expectedBehavior: 'Should preserve Unicode characters and handle special chars safely',
        testFn: async () => {
          const specialStrings = [
            '🎯🔥💡🚀✨', // Emojis
            'Héllo Wörld', // Accented characters
            '测试中文字符', // Chinese characters
            'العربية', // Arabic
            '\\n\\t\\r', // Escape sequences
            '<script>alert("XSS")</script>', // XSS attempt
            '../../etc/passwd', // Path traversal
            'null\\x00byte' // Null byte
          ];
          
          for (const testString of specialStrings) {
            await retry.test(async () => {
              const graph = {
                seed: 123,
                nodes: [
                  {
                    id: 'test-node',
                    type: 'SetVariable',
                    data: {
                      variableName: 'testVar',
                      value: testString
                    }
                  },
                  {
                    id: 'output',
                    type: 'Output',
                    data: {}
                  }
                ],
                edges: [
                  { id: 'edge1', source: 'test-node', target: 'output' }
                ]
              };
              
              const executeGraph = await import('../../server/src/engine');
              const result = await executeGraph.executeGraph(graph as any);
              
              expect(result).toBeDefined();
            }, `special-characters-${testString.substring(0, 10)}`);
          }
        }
      }
    ];

    this.edgeCases.set(EdgeCaseCategory.DATA_VALIDATION, dataEdgeCases);
  }

  /**
   * Performance Limit Edge Cases
   */
  private addPerformanceLimitEdgeCases(): void {
    const performanceEdgeCases: EdgeCaseTest[] = [
      {
        name: 'Response Time Boundaries',
        category: EdgeCaseCategory.PERFORMANCE_LIMITS,
        severity: 'high',
        description: 'Test API response times at performance boundaries',
        expectedBehavior: 'Should meet performance budgets or timeout gracefully',
        testFn: async () => {
          await retry.test(async () => {
            const startTime = Date.now();
            
            const response = await fetch('/api/graphs/execute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                graph: testDataGenerator.generateGraph({
                  nodeCount: 100,
                  seed: 789,
                  scenario: TestScenario.PERFORMANCE_STRESS,
                  complexity: 'complex',
                  includeAdvancedNodes: true
                })
              })
            });
            
            const duration = Date.now() - startTime;
            
            // Should respond within performance budget (5 seconds)
            expect(duration).toBeLessThan(5000);
            expect(response.ok || response.status === 408).toBe(true);
          }, 'response-time-boundaries');
        }
      }
    ];

    this.edgeCases.set(EdgeCaseCategory.PERFORMANCE_LIMITS, performanceEdgeCases);
  }

  /**
   * Add remaining edge case categories with placeholder implementations
   */
  private addSecurityBoundaryEdgeCases(): void {
    this.edgeCases.set(EdgeCaseCategory.SECURITY_BOUNDARIES, []);
  }

  private addNetworkConditionEdgeCases(): void {
    this.edgeCases.set(EdgeCaseCategory.NETWORK_CONDITIONS, []);
  }

  private addMemoryLimitEdgeCases(): void {
    this.edgeCases.set(EdgeCaseCategory.MEMORY_LIMITS, []);
  }

  private addConcurrentAccessEdgeCases(): void {
    this.edgeCases.set(EdgeCaseCategory.CONCURRENT_ACCESS, []);
  }

  /**
   * Run all edge case tests for a specific category
   */
  async runCategoryTests(category: EdgeCaseCategory): Promise<EdgeCaseTestResults> {
    const tests = this.edgeCases.get(category) || [];
    const results: EdgeCaseTestResults = {
      category,
      totalTests: tests.length,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      testResults: [],
      duration: 0,
      summary: ''
    };

    const startTime = Date.now();

    for (const test of tests) {
      const testResult: EdgeCaseTestResult = {
        testName: test.name,
        severity: test.severity,
        passed: false,
        error: null,
        duration: 0,
        retryCount: 0
      };

      const testStartTime = Date.now();

      try {
        await test.testFn();
        testResult.passed = true;
        results.passedTests++;
      } catch (error) {
        testResult.passed = false;
        testResult.error = error instanceof Error ? error.message : String(error);
        results.failedTests++;
      }

      testResult.duration = Date.now() - testStartTime;
      results.testResults.push(testResult);
    }

    results.duration = Date.now() - startTime;
    results.summary = this.generateCategorySummary(results);

    return results;
  }

  /**
   * Run all edge case tests
   */
  async runAllTests(): Promise<EdgeCaseTestSummary> {
    const categoryResults: EdgeCaseTestResults[] = [];
    const startTime = Date.now();

    for (const category of Object.values(EdgeCaseCategory)) {
      const results = await this.runCategoryTests(category);
      categoryResults.push(results);
    }

    const totalDuration = Date.now() - startTime;
    const summary = this.generateOverallSummary(categoryResults, totalDuration);

    return {
      categoryResults,
      overallSummary: summary,
      totalDuration,
      timestamp: Date.now()
    };
  }

  private generateCategorySummary(results: EdgeCaseTestResults): string {
    const successRate = results.totalTests > 0 
      ? ((results.passedTests / results.totalTests) * 100).toFixed(1) 
      : '0';
    
    return `${results.category}: ${results.passedTests}/${results.totalTests} passed (${successRate}%) in ${results.duration}ms`;
  }

  private generateOverallSummary(results: EdgeCaseTestResults[], duration: number): string {
    const totals = results.reduce(
      (acc, result) => ({
        total: acc.total + result.totalTests,
        passed: acc.passed + result.passedTests,
        failed: acc.failed + result.failedTests
      }),
      { total: 0, passed: 0, failed: 0 }
    );

    const successRate = totals.total > 0 
      ? ((totals.passed / totals.total) * 100).toFixed(1) 
      : '0';

    return `Overall: ${totals.passed}/${totals.total} edge case tests passed (${successRate}%) in ${duration}ms`;
  }
}

// Interfaces for test results
interface EdgeCaseTestResult {
  testName: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  passed: boolean;
  error: string | null;
  duration: number;
  retryCount: number;
}

interface EdgeCaseTestResults {
  category: EdgeCaseCategory;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  testResults: EdgeCaseTestResult[];
  duration: number;
  summary: string;
}

interface EdgeCaseTestSummary {
  categoryResults: EdgeCaseTestResults[];
  overallSummary: string;
  totalDuration: number;
  timestamp: number;
}

// Export singleton instance
export const edgeCaseTestSuite = new EdgeCaseTestSuite();