/**
 * Security Regression Tests - Expression Security
 *
 * These tests ensure security boundaries remain intact across code changes.
 * Focuses on preventing code injection, prototype pollution, and other
 * security vulnerabilities in expression evaluation.
 *
 * CRITICAL: Security regressions can lead to system compromise.
 */

import { executeGraph } from '../../../server/src/engine';
import { Graph } from '../../packages/core/graphSchema';

describe('Security Regression Tests - Expression Security', () => {
  describe('Code Injection Prevention', () => {
    it('should block eval() expressions', async () => {
      const maliciousGraph: Graph = {
        id: 'eval-injection-test',
        seed: 12345,
        nodes: [
          {
            id: 'conditional1',
            type: 'Conditional',
            branches: [
              {
                condition: 'eval("process.exit(1)")',
                output: 'Malicious code executed'
              }
            ],
            defaultOutput: 'Safe output'
          },
          {
            id: 'output1',
            type: 'Output',
            inputs: ['conditional1']
          }
        ],
        edges: [{ id: 'e1', source: 'conditional1', target: 'output1' }]
      };

      await expect(executeGraph(maliciousGraph)).rejects.toThrow(
        /dangerous|eval|forbidden/i
      );
    });

    it('should block Function constructor access', async () => {
      const maliciousGraph: Graph = {
        id: 'function-constructor-test',
        seed: 12345,
        nodes: [
          {
            id: 'conditional1',
            type: 'Conditional',
            branches: [
              {
                condition: 'Function("return process")().exit(1)',
                output: 'Malicious code executed'
              }
            ],
            defaultOutput: 'Safe output'
          },
          {
            id: 'output1',
            type: 'Output',
            inputs: ['conditional1']
          }
        ],
        edges: [{ id: 'e1', source: 'conditional1', target: 'output1' }]
      };

      await expect(executeGraph(maliciousGraph)).rejects.toThrow(
        /dangerous|constructor|forbidden/i
      );
    });

    it('should block global object access', async () => {
      const maliciousGraph: Graph = {
        id: 'global-access-test',
        seed: 12345,
        nodes: [
          {
            id: 'conditional1',
            type: 'Conditional',
            branches: [
              {
                condition: 'global.process.exit(1)',
                output: 'Global access succeeded'
              },
              {
                condition: 'globalThis.process.exit(1)',
                output: 'GlobalThis access succeeded'
              }
            ],
            defaultOutput: 'Safe output'
          },
          {
            id: 'output1',
            type: 'Output',
            inputs: ['conditional1']
          }
        ],
        edges: [{ id: 'e1', source: 'conditional1', target: 'output1' }]
      };

      await expect(executeGraph(maliciousGraph)).rejects.toThrow(
        /dangerous|global|forbidden/i
      );
    });
  });

  describe('Prototype Pollution Prevention', () => {
    it('should block __proto__ access', async () => {
      const maliciousGraph: Graph = {
        id: 'proto-pollution-test',
        seed: 12345,
        nodes: [
          {
            id: 'conditional1',
            type: 'Conditional',
            branches: [
              {
                condition: 'Object.__proto__.isEvil = true',
                output: 'Prototype polluted'
              }
            ],
            defaultOutput: 'Safe output'
          },
          {
            id: 'output1',
            type: 'Output',
            inputs: ['conditional1']
          }
        ],
        edges: [{ id: 'e1', source: 'conditional1', target: 'output1' }]
      };

      await expect(executeGraph(maliciousGraph)).rejects.toThrow(
        /dangerous|proto|forbidden/i
      );
    });

    it('should block constructor property access', async () => {
      const maliciousGraph: Graph = {
        id: 'constructor-pollution-test',
        seed: 12345,
        nodes: [
          {
            id: 'conditional1',
            type: 'Conditional',
            branches: [
              {
                condition: '{}.constructor.prototype.isEvil = true',
                output: 'Constructor pollution succeeded'
              }
            ],
            defaultOutput: 'Safe output'
          },
          {
            id: 'output1',
            type: 'Output',
            inputs: ['conditional1']
          }
        ],
        edges: [{ id: 'e1', source: 'conditional1', target: 'output1' }]
      };

      await expect(executeGraph(maliciousGraph)).rejects.toThrow(
        /dangerous|constructor|forbidden/i
      );
    });
  });

  describe('Safe Expression Allowlist', () => {
    it('should allow safe mathematical expressions', async () => {
      const safeGraph: Graph = {
        id: 'safe-math-test',
        seed: 12345,
        nodes: [
          {
            id: 'conditional1',
            type: 'Conditional',
            branches: [
              { condition: '2 + 2 === 4', output: 'Math works' },
              { condition: 'Math.max(1, 2, 3) === 3', output: 'Math.max works' }
            ],
            defaultOutput: 'Math failed'
          },
          {
            id: 'output1',
            type: 'Output',
            inputs: ['conditional1']
          }
        ],
        edges: [{ id: 'e1', source: 'conditional1', target: 'output1' }]
      };

      const result = await executeGraph(safeGraph);
      expect(result[0]).toBe('Math works');
    });

    it('should allow safe string operations', async () => {
      const safeGraph: Graph = {
        id: 'safe-string-test',
        seed: 12345,
        nodes: [
          {
            id: 'setVar1',
            type: 'SetVariable',
            key: 'testString',
            value: 'Hello World'
          },
          {
            id: 'conditional1',
            type: 'Conditional',
            branches: [
              {
                condition: 'getVariable("testString").includes("Hello")',
                output: 'String includes works'
              },
              {
                condition: 'getVariable("testString").startsWith("Hello")',
                output: 'String startsWith works'
              }
            ],
            defaultOutput: 'String operations failed',
            inputs: ['setVar1']
          },
          {
            id: 'output1',
            type: 'Output',
            inputs: ['conditional1']
          }
        ],
        edges: [
          { id: 'e1', source: 'setVar1', target: 'conditional1' },
          { id: 'e2', source: 'conditional1', target: 'output1' }
        ]
      };

      const result = await executeGraph(safeGraph);
      expect(result[0]).toBe('String includes works');
    });

    it('should allow safe variable access', async () => {
      const safeGraph: Graph = {
        id: 'safe-variable-test',
        seed: 12345,
        nodes: [
          {
            id: 'setVar1',
            type: 'SetVariable',
            key: 'number',
            value: '42'
          },
          {
            id: 'conditional1',
            type: 'Conditional',
            branches: [
              {
                condition: 'parseInt(getVariable("number")) === 42',
                output: 'Variable access works'
              }
            ],
            defaultOutput: 'Variable access failed',
            inputs: ['setVar1']
          },
          {
            id: 'output1',
            type: 'Output',
            inputs: ['conditional1']
          }
        ],
        edges: [
          { id: 'e1', source: 'setVar1', target: 'conditional1' },
          { id: 'e2', source: 'conditional1', target: 'output1' }
        ]
      };

      const result = await executeGraph(safeGraph);
      expect(result[0]).toBe('Variable access works');
    });
  });

  describe('Resource Exhaustion Prevention', () => {
    it('should prevent infinite loops in expressions', async () => {
      const maliciousGraph: Graph = {
        id: 'infinite-loop-test',
        seed: 12345,
        nodes: [
          {
            id: 'conditional1',
            type: 'Conditional',
            branches: [
              {
                condition: 'while(true) { /* infinite loop */ }',
                output: 'Loop completed'
              }
            ],
            defaultOutput: 'Safe output'
          },
          {
            id: 'output1',
            type: 'Output',
            inputs: ['conditional1']
          }
        ],
        edges: [{ id: 'e1', source: 'conditional1', target: 'output1' }]
      };

      await expect(executeGraph(maliciousGraph)).rejects.toThrow(
        /dangerous|loop|forbidden/i
      );
    });

    it('should limit expression complexity', async () => {
      const complexExpression = 'true && '.repeat(1000) + 'true'; // Very long expression

      const complexGraph: Graph = {
        id: 'complex-expression-test',
        seed: 12345,
        nodes: [
          {
            id: 'conditional1',
            type: 'Conditional',
            branches: [
              {
                condition: complexExpression,
                output: 'Complex expression executed'
              }
            ],
            defaultOutput: 'Safe output',
            conditionalConfig: {
              maxExpressionLength: 100 // Should reject expressions longer than 100 chars
            }
          },
          {
            id: 'output1',
            type: 'Output',
            inputs: ['conditional1']
          }
        ],
        edges: [{ id: 'e1', source: 'conditional1', target: 'output1' }]
      };

      await expect(executeGraph(complexGraph)).rejects.toThrow(
        /length|complex|forbidden/i
      );
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize node input data', async () => {
      const maliciousGraph: Graph = {
        id: 'input-sanitization-test',
        seed: 12345,
        nodes: [
          {
            id: 'setVar1',
            type: 'SetVariable',
            key: '__proto__',
            value: '{ "isEvil": true }'
          },
          {
            id: 'getVar1',
            type: 'GetVariable',
            key: '__proto__',
            inputs: ['setVar1']
          },
          {
            id: 'output1',
            type: 'Output',
            inputs: ['getVar1']
          }
        ],
        edges: [
          { id: 'e1', source: 'setVar1', target: 'getVar1' },
          { id: 'e2', source: 'getVar1', target: 'output1' }
        ]
      };

      // Should either reject the dangerous key name or sanitize it
      const result = await executeGraph(maliciousGraph);
      expect(result[0]).not.toContain('isEvil');
    });

    it('should handle special characters safely', async () => {
      const safeGraph: Graph = {
        id: 'special-chars-test',
        seed: 12345,
        nodes: [
          {
            id: 'setVar1',
            type: 'SetVariable',
            key: 'safeKey',
            value: '<script>alert("xss")</script>'
          },
          {
            id: 'getVar1',
            type: 'GetVariable',
            key: 'safeKey',
            inputs: ['setVar1']
          },
          {
            id: 'output1',
            type: 'Output',
            inputs: ['getVar1']
          }
        ],
        edges: [
          { id: 'e1', source: 'setVar1', target: 'getVar1' },
          { id: 'e2', source: 'getVar1', target: 'output1' }
        ]
      };

      const result = await executeGraph(safeGraph);

      // Should return the value as string, not execute it
      expect(result[0]).toBe('<script>alert("xss")</script>');
    });
  });

  describe('Error Message Security', () => {
    it('should not leak sensitive information in error messages', async () => {
      const maliciousGraph: Graph = {
        id: 'error-leak-test',
        seed: 12345,
        nodes: [
          {
            id: 'conditional1',
            type: 'Conditional',
            branches: [
              {
                condition: 'process.env.DATABASE_PASSWORD',
                output: 'Got password'
              }
            ],
            defaultOutput: 'Safe output'
          },
          {
            id: 'output1',
            type: 'Output',
            inputs: ['conditional1']
          }
        ],
        edges: [{ id: 'e1', source: 'conditional1', target: 'output1' }]
      };

      try {
        await executeGraph(maliciousGraph);
      } catch (error: any) {
        // Error message should not contain sensitive information
        expect(error.message).not.toContain('password');
        expect(error.message).not.toContain('secret');
        expect(error.message).not.toContain('token');
        expect(error.message).not.toContain('key');
      }
    });
  });

  describe('Regression Testing of Known Vulnerabilities', () => {
    it('should prevent bypass attempts of security measures', async () => {
      const bypassAttempts = [
        'this["eva" + "l"]("malicious code")',
        'window["Function"]("return process")()',
        '(function(){return eval})()("malicious")',
        'Object["getPrototypeOf"]({})',
        '[].__proto__.constructor("malicious")'
      ];

      for (const attempt of bypassAttempts) {
        const maliciousGraph: Graph = {
          id: `bypass-test-${Math.random()}`,
          seed: 12345,
          nodes: [
            {
              id: 'conditional1',
              type: 'Conditional',
              branches: [{ condition: attempt, output: 'Bypass succeeded' }],
              defaultOutput: 'Safe output'
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['conditional1']
            }
          ],
          edges: [{ id: 'e1', source: 'conditional1', target: 'output1' }]
        };

        await expect(executeGraph(maliciousGraph)).rejects.toThrow(
          /dangerous|forbidden/i
        );
      }
    });
  });
});

export {}; // Make this a module
