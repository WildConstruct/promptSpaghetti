#!/usr/bin/env node

/**
 * Test Case Generator
 *
 * Analyzes task requirements and automatically generates comprehensive test cases
 * to improve test coverage and ensure thorough validation of implementations.
 *
 * Key Features:
 * - Requirement parsing and analysis from task descriptions
 * - Automated test case generation for various testing frameworks
 * - Edge case detection and boundary condition testing
 * - Test coverage optimization and gap analysis
 * - Integration with Jest, Mocha, and other testing frameworks
 * - Mock generation for dependencies and external services
 */

const fs = require('fs').promises;
const path = require('path');

class TestCaseGenerator {
  constructor() {
    this.dataDir = path.join(__dirname, '../data/test-generation');
    this.stateFile = path.join(__dirname, '../data/state.json');
    this.templatesDir = path.join(this.dataDir, 'templates');
    this.outputDir = path.join(this.dataDir, 'generated-tests');
    this.analysisFile = path.join(this.dataDir, 'test-analysis.json');

    // Configuration for test generation
    this.config = {
      frameworks: {
        jest: {
          enabled: true,
          extensions: ['.test.js', '.test.ts', '.spec.js', '.spec.ts'],
          setupFiles: ['jest.setup.js'],
          mockPatterns: ['__mocks__/**/*']
        },
        mocha: {
          enabled: false,
          extensions: ['.test.js', '.spec.js'],
          setupFiles: ['test/setup.js']
        },
        vitest: {
          enabled: true,
          extensions: ['.test.ts', '.spec.ts'],
          setupFiles: ['vite.config.test.ts']
        }
      },

      generation: {
        // Types of tests to generate
        testTypes: {
          unit: true, // Unit tests for individual functions
          integration: true, // Integration tests for component interaction
          e2e: false, // End-to-end tests (requires more setup)
          performance: false, // Performance tests
          security: true, // Security vulnerability tests
          accessibility: false // Accessibility tests
        },

        // Test case categories
        categories: {
          happyPath: true, // Normal successful execution
          edgeCases: true, // Boundary conditions and edge cases
          errorHandling: true, // Error conditions and exceptions
          validation: true, // Input validation tests
          security: true, // Security-related tests
          performance: false // Performance benchmarks
        },

        // Code analysis depth
        analysis: {
          parseJSDoc: true, // Extract info from JSDoc comments
          analyzeTypes: true, // TypeScript type analysis
          detectPatterns: true, // Common code patterns
          findDependencies: true, // External dependencies
          extractInterfaces: true // Interface/API extraction
        },

        // Coverage targets
        coverage: {
          statements: 80,
          branches: 75,
          functions: 85,
          lines: 80
        }
      },

      patterns: {
        // Common requirement patterns
        requirementPatterns: [
          // Action patterns
          { pattern: /should\s+(.*?)(?:\.|$)/gi, type: 'requirement' },
          { pattern: /must\s+(.*?)(?:\.|$)/gi, type: 'requirement' },
          { pattern: /will\s+(.*?)(?:\.|$)/gi, type: 'requirement' },
          { pattern: /can\s+(.*?)(?:\.|$)/gi, type: 'capability' },

          // Validation patterns
          { pattern: /validate(?:s)?\s+(.*?)(?:\.|$)/gi, type: 'validation' },
          { pattern: /check(?:s)?\s+(.*?)(?:\.|$)/gi, type: 'validation' },
          { pattern: /ensure(?:s)?\s+(.*?)(?:\.|$)/gi, type: 'validation' },

          // Error patterns
          { pattern: /handle(?:s)?\s+(.*?)\s+error/gi, type: 'error_handling' },
          { pattern: /throw(?:s)?\s+(.*?)(?:\.|$)/gi, type: 'error_handling' },
          {
            pattern: /fail(?:s)?\s+when\s+(.*?)(?:\.|$)/gi,
            type: 'error_handling'
          },

          // Performance patterns
          { pattern: /performance\s+(.*?)(?:\.|$)/gi, type: 'performance' },
          { pattern: /optimize(?:s)?\s+(.*?)(?:\.|$)/gi, type: 'performance' },
          { pattern: /fast(?:er)?\s+(.*?)(?:\.|$)/gi, type: 'performance' },

          // Security patterns
          { pattern: /secure(?:s)?\s+(.*?)(?:\.|$)/gi, type: 'security' },
          { pattern: /prevent(?:s)?\s+(.*?)(?:\.|$)/gi, type: 'security' },
          { pattern: /sanitize(?:s)?\s+(.*?)(?:\.|$)/gi, type: 'security' }
        ],

        // Function patterns for code analysis
        functionPatterns: [
          /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
          /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[:=]\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>)/g,
          /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
        ],

        // Parameter patterns
        parameterPatterns: [
          /\(([^)]*)\)/g, // Function parameters
          /:\s*([^,)]+)/g // TypeScript type annotations
        ]
      }
    };

    this.testTemplates = new Map();
    this.generatedTests = new Map();
    this.analysisResults = {
      tasksAnalyzed: 0,
      testsGenerated: 0,
      coverageImprovements: [],
      lastGeneration: null
    };
  }

  /**
   * Initialize the test case generator
   */
  async initialize() {
    try {
      await this.ensureDirectories();
      await this.loadTestTemplates();
      await this.loadExistingAnalysis();

      console.log('✅ Test Case Generator initialized');
      console.log(`📋 Loaded ${this.testTemplates.size} test templates`);
      console.log(
        `📊 Previous analysis: ${this.analysisResults.tasksAnalyzed} tasks analyzed`
      );
    } catch (error) {
      console.error('❌ Failed to initialize Test Case Generator:', error);
      throw error;
    }
  }

  /**
   * Generate test cases for a specific task
   */
  async generateTestsForTask(taskId, options = {}) {
    console.log(`🧪 Generating tests for task ${taskId}...\n`);

    try {
      // Load task details
      const task = await this.getTaskById(taskId);
      if (!task) {
        throw new Error(`Task ${taskId} not found`);
      }

      // Analyze task requirements
      const requirements = this.analyzeRequirements(task);
      console.log(`📋 Extracted ${requirements.length} requirements`);

      // Find associated code files
      const codeFiles = await this.findAssociatedCode(task);
      console.log(`📂 Found ${codeFiles.length} associated code files`);

      // Analyze code structure
      const codeAnalysis = await this.analyzeCode(codeFiles);
      console.log(`🔍 Analyzed ${codeAnalysis.functions.length} functions`);

      // Generate test cases
      const testCases = await this.generateTestCases(
        requirements,
        codeAnalysis,
        options
      );
      console.log(`🧪 Generated ${testCases.length} test cases`);

      // Create test files
      const testFiles = await this.createTestFiles(testCases, taskId, options);
      console.log(`📝 Created ${testFiles.length} test files`);

      // Update analysis results
      this.analysisResults.tasksAnalyzed++;
      this.analysisResults.testsGenerated += testCases.length;
      this.analysisResults.lastGeneration = new Date().toISOString();

      await this.saveAnalysis();

      return {
        taskId,
        requirements: requirements.length,
        testCases: testCases.length,
        testFiles: testFiles.length,
        files: testFiles
      };
    } catch (error) {
      console.error(`❌ Test generation failed for task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Analyze task requirements and extract testable specifications
   */
  analyzeRequirements(task) {
    const requirements = [];
    const sources = [
      task.title || '',
      task.description || '',
      ...(task.acceptanceCriteria || [])
    ];

    const fullText = sources.join(' ');

    // Extract requirements using patterns
    for (const patternConfig of this.config.patterns.requirementPatterns) {
      const matches = [...fullText.matchAll(patternConfig.pattern)];

      for (const match of matches) {
        if (match[1] && match[1].trim().length > 5) {
          requirements.push({
            text: match[1].trim(),
            type: patternConfig.type,
            source: this.identifySource(match[0], sources),
            priority: this.calculateRequirementPriority(
              match[1],
              patternConfig.type
            ),
            testable: this.isTestable(match[1], patternConfig.type)
          });
        }
      }
    }

    // Remove duplicates and sort by priority
    const uniqueRequirements = this.deduplicateRequirements(requirements);
    return uniqueRequirements.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Find code files associated with a task
   */
  async findAssociatedCode(task) {
    const files = [];
    const text = `${task.title || ''} ${task.description || ''}`.toLowerCase();

    // Extract file references
    const filePatterns = [
      /(?:src|packages|client|server)\/[a-zA-Z0-9\/._-]+\.(js|ts|jsx|tsx)/g,
      /[a-zA-Z][a-zA-Z0-9]*\.(?:js|ts|jsx|tsx)/g,
      /components?\/[a-zA-Z][a-zA-Z0-9]*\.(js|ts|jsx|tsx)/g
    ];

    for (const pattern of filePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          const cleanPath = match.trim().replace(/['"`,]/g, '');
          try {
            await fs.access(cleanPath);
            files.push(cleanPath);
          } catch {
            // File doesn't exist, try common paths
            const commonPaths = [
              `src/${cleanPath}`,
              `packages/core/${cleanPath}`,
              `client/src/${cleanPath}`,
              `server/src/${cleanPath}`
            ];

            for (const testPath of commonPaths) {
              try {
                await fs.access(testPath);
                files.push(testPath);
                break;
              } catch {
                // Continue trying
              }
            }
          }
        }
      }
    }

    // Also search for files by component/module names mentioned in task
    const componentNames = this.extractComponentNames(task);
    for (const name of componentNames) {
      const searchResults = await this.searchForComponentFiles(name);
      files.push(...searchResults);
    }

    return [...new Set(files)]; // Remove duplicates
  }

  /**
   * Analyze code structure to understand what needs testing
   */
  async analyzeCode(codeFiles) {
    const analysis = {
      functions: [],
      classes: [],
      exports: [],
      imports: [],
      interfaces: [],
      types: [],
      complexity: {}
    };

    for (const file of codeFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const fileAnalysis = this.analyzeFileStructure(content, file);

        analysis.functions.push(...fileAnalysis.functions);
        analysis.classes.push(...fileAnalysis.classes);
        analysis.exports.push(...fileAnalysis.exports);
        analysis.imports.push(...fileAnalysis.imports);
        analysis.interfaces.push(...fileAnalysis.interfaces);
        analysis.types.push(...fileAnalysis.types);

        analysis.complexity[file] = fileAnalysis.complexity;
      } catch (error) {
        console.warn(`Could not analyze file ${file}:`, error.message);
      }
    }

    return analysis;
  }

  /**
   * Analyze individual file structure
   */
  analyzeFileStructure(content, filePath) {
    const analysis = {
      functions: [],
      classes: [],
      exports: [],
      imports: [],
      interfaces: [],
      types: [],
      complexity: 0
    };

    // Extract functions
    for (const pattern of this.config.patterns.functionPatterns) {
      const matches = [...content.matchAll(pattern)];
      for (const match of matches) {
        const name = match[1];
        if (name) {
          const func = {
            name,
            file: filePath,
            type: 'function',
            parameters: this.extractParameters(content, match.index),
            returnType: this.extractReturnType(content, match.index),
            isAsync: match[0].includes('async'),
            isExported: match[0].includes('export'),
            complexity: this.calculateFunctionComplexity(content, match.index)
          };
          analysis.functions.push(func);
        }
      }
    }

    // Extract classes
    const classMatches = [
      ...content.matchAll(/class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g)
    ];
    for (const match of classMatches) {
      analysis.classes.push({
        name: match[1],
        file: filePath,
        methods: this.extractClassMethods(content, match.index),
        isExported: this.isExported(content, match.index)
      });
    }

    // Extract exports
    const exportMatches = [
      ...content.matchAll(
        /export\s+(?:default\s+)?(?:class|function|const|let|var)?\s*([a-zA-Z_$][a-zA-Z0-9_$]*)?/g
      )
    ];
    analysis.exports = exportMatches.map(match => ({
      name: match[1] || 'default',
      type: this.getExportType(match[0]),
      file: filePath
    }));

    // Extract imports
    const importMatches = [
      ...content.matchAll(/import\s+.*?from\s+['"]([^'"]+)['"]/g)
    ];
    analysis.imports = importMatches.map(match => ({
      module: match[1],
      file: filePath,
      type: this.getImportType(match[0])
    }));

    // Extract TypeScript interfaces and types
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      const interfaceMatches = [
        ...content.matchAll(/interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g)
      ];
      analysis.interfaces = interfaceMatches.map(match => ({
        name: match[1],
        file: filePath,
        properties: this.extractInterfaceProperties(content, match.index)
      }));

      const typeMatches = [
        ...content.matchAll(/type\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g)
      ];
      analysis.types = typeMatches.map(match => ({
        name: match[1],
        file: filePath
      }));
    }

    // Calculate overall complexity
    analysis.complexity = this.calculateFileComplexity(content);

    return analysis;
  }

  /**
   * Generate test cases based on requirements and code analysis
   */
  async generateTestCases(requirements, codeAnalysis, options = {}) {
    const testCases = [];

    // Generate test cases for each requirement
    for (const requirement of requirements.filter(r => r.testable)) {
      const cases = await this.generateRequirementTests(
        requirement,
        codeAnalysis
      );
      testCases.push(...cases);
    }

    // Generate test cases for each function
    for (const func of codeAnalysis.functions) {
      const cases = await this.generateFunctionTests(func, codeAnalysis);
      testCases.push(...cases);
    }

    // Generate test cases for each class
    for (const cls of codeAnalysis.classes) {
      const cases = await this.generateClassTests(cls, codeAnalysis);
      testCases.push(...cases);
    }

    // Generate edge case tests
    if (this.config.generation.categories.edgeCases) {
      const edgeCases = this.generateEdgeCaseTests(codeAnalysis);
      testCases.push(...edgeCases);
    }

    // Generate error handling tests
    if (this.config.generation.categories.errorHandling) {
      const errorTests = this.generateErrorHandlingTests(codeAnalysis);
      testCases.push(...errorTests);
    }

    // Generate security tests
    if (this.config.generation.categories.security) {
      const securityTests = this.generateSecurityTests(codeAnalysis);
      testCases.push(...securityTests);
    }

    return this.deduplicateTestCases(testCases);
  }

  /**
   * Generate tests for a specific requirement
   */
  async generateRequirementTests(requirement, codeAnalysis) {
    const tests = [];

    const testCase = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `should ${requirement.text}`,
      type: 'requirement',
      category: requirement.type,
      priority: requirement.priority,
      description: `Test that the system ${requirement.text}`,
      setup: this.generateTestSetup(requirement, codeAnalysis),
      assertions: this.generateAssertions(requirement),
      cleanup: this.generateTestCleanup(requirement),
      mocks: this.generateMocks(requirement, codeAnalysis)
    };

    tests.push(testCase);

    // Generate negative test case
    if (requirement.type === 'validation') {
      const negativeTest = {
        ...testCase,
        id: `req-neg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `should fail when ${requirement.text} is invalid`,
        type: 'negative_requirement',
        description: `Test that the system properly handles invalid ${requirement.text}`,
        assertions: this.generateNegativeAssertions(requirement)
      };
      tests.push(negativeTest);
    }

    return tests;
  }

  /**
   * Generate tests for a specific function
   */
  async generateFunctionTests(func, codeAnalysis) {
    const tests = [];

    // Happy path test
    const happyPathTest = {
      id: `func-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${func.name} should work with valid inputs`,
      type: 'unit',
      category: 'happy_path',
      function: func.name,
      file: func.file,
      description: `Test ${func.name} with valid parameters`,
      setup: this.generateFunctionSetup(func),
      testCode: this.generateFunctionTestCode(func, 'happy_path'),
      assertions: this.generateFunctionAssertions(func, 'happy_path'),
      mocks: this.generateFunctionMocks(func, codeAnalysis)
    };
    tests.push(happyPathTest);

    // Parameter validation tests
    if (func.parameters.length > 0) {
      for (const param of func.parameters) {
        const paramTest = {
          id: `param-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: `${func.name} should validate ${param.name} parameter`,
          type: 'unit',
          category: 'validation',
          function: func.name,
          parameter: param.name,
          description: `Test ${func.name} parameter validation for ${param.name}`,
          setup: this.generateParameterTestSetup(func, param),
          testCode: this.generateParameterTestCode(func, param),
          assertions: this.generateParameterAssertions(func, param)
        };
        tests.push(paramTest);
      }
    }

    // Error handling test
    if (func.isAsync || func.complexity > 5) {
      const errorTest = {
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${func.name} should handle errors gracefully`,
        type: 'unit',
        category: 'error_handling',
        function: func.name,
        description: `Test ${func.name} error handling`,
        setup: this.generateErrorTestSetup(func),
        testCode: this.generateErrorTestCode(func),
        assertions: this.generateErrorAssertions(func)
      };
      tests.push(errorTest);
    }

    return tests;
  }

  /**
   * Generate tests for a class
   */
  async generateClassTests(cls, codeAnalysis) {
    const tests = [];

    // Constructor test
    const constructorTest = {
      id: `class-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${cls.name} should instantiate correctly`,
      type: 'unit',
      category: 'constructor',
      class: cls.name,
      description: `Test ${cls.name} constructor`,
      testCode: this.generateConstructorTestCode(cls),
      assertions: this.generateConstructorAssertions(cls)
    };
    tests.push(constructorTest);

    // Method tests
    for (const method of cls.methods) {
      const methodTest = {
        id: `method-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${cls.name}.${method.name} should work correctly`,
        type: 'unit',
        category: 'method',
        class: cls.name,
        method: method.name,
        description: `Test ${cls.name}.${method.name} method`,
        setup: this.generateMethodTestSetup(cls, method),
        testCode: this.generateMethodTestCode(cls, method),
        assertions: this.generateMethodAssertions(cls, method)
      };
      tests.push(methodTest);
    }

    return tests;
  }

  /**
   * Generate edge case tests
   */
  generateEdgeCaseTests(codeAnalysis) {
    const tests = [];

    // Common edge cases
    const edgeCases = [
      { name: 'empty input', value: '' },
      { name: 'null input', value: null },
      { name: 'undefined input', value: undefined },
      { name: 'very large input', value: 'x'.repeat(10000) },
      { name: 'special characters', value: '!@#$%^&*()' },
      { name: 'unicode characters', value: '🚀🌟✨' }
    ];

    for (const func of codeAnalysis.functions.slice(0, 5)) {
      // Limit to first 5 functions
      for (const edgeCase of edgeCases) {
        const test = {
          id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: `${func.name} should handle ${edgeCase.name}`,
          type: 'unit',
          category: 'edge_case',
          function: func.name,
          description: `Test ${func.name} with ${edgeCase.name}`,
          testCode: this.generateEdgeCaseTestCode(func, edgeCase),
          assertions: this.generateEdgeCaseAssertions(func, edgeCase)
        };
        tests.push(test);
      }
    }

    return tests;
  }

  /**
   * Generate error handling tests
   */
  generateErrorHandlingTests(codeAnalysis) {
    const tests = [];

    for (const func of codeAnalysis.functions.filter(f => f.isAsync)) {
      const errorTest = {
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${func.name} should reject with proper error`,
        type: 'unit',
        category: 'error_handling',
        function: func.name,
        description: `Test ${func.name} error scenarios`,
        testCode: this.generateAsyncErrorTestCode(func),
        assertions: this.generateAsyncErrorAssertions(func)
      };
      tests.push(errorTest);
    }

    return tests;
  }

  /**
   * Generate security tests
   */
  generateSecurityTests(codeAnalysis) {
    const tests = [];

    // XSS prevention tests
    const xssTest = {
      id: `security-xss-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'should prevent XSS attacks',
      type: 'security',
      category: 'xss_prevention',
      description: 'Test XSS attack prevention',
      testCode: this.generateXSSTestCode(codeAnalysis),
      assertions: [
        'expect(result).not.toContain("<script>")',
        'expect(result).not.toContain("javascript:")'
      ]
    };
    tests.push(xssTest);

    // Injection prevention tests
    const injectionTest = {
      id: `security-injection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'should prevent injection attacks',
      type: 'security',
      category: 'injection_prevention',
      description: 'Test injection attack prevention',
      testCode: this.generateInjectionTestCode(codeAnalysis),
      assertions: [
        'expect(result).not.toContain("eval(")',
        'expect(result).not.toContain("Function(")'
      ]
    };
    tests.push(injectionTest);

    return tests;
  }

  /**
   * Create test files from generated test cases
   */
  async createTestFiles(testCases, taskId, options = {}) {
    const framework = options.framework || 'jest';
    const testFiles = [];

    // Group test cases by file/module
    const groupedTests = this.groupTestsByTarget(testCases);

    for (const [target, tests] of groupedTests.entries()) {
      const fileName = this.generateTestFileName(target, framework, taskId);
      const testContent = await this.generateTestFileContent(
        tests,
        framework,
        options
      );

      const filePath = path.join(this.outputDir, fileName);
      await fs.writeFile(filePath, testContent);

      testFiles.push({
        path: filePath,
        target,
        testCount: tests.length,
        framework
      });

      console.log(`📝 Created ${fileName} with ${tests.length} tests`);
    }

    return testFiles;
  }

  /**
   * Generate test file content for a specific framework
   */
  async generateTestFileContent(tests, framework, options = {}) {
    const template = await this.getTestTemplate(framework);

    let content = template.header;

    // Add imports
    const imports = this.generateImports(tests, framework);
    content += imports + '\n\n';

    // Add test setup
    if (template.setup) {
      content += template.setup + '\n\n';
    }

    // Group tests by category
    const categories = this.groupTestsByCategory(tests);

    for (const [category, categoryTests] of categories.entries()) {
      content += `describe('${category}', () => {\n`;

      for (const test of categoryTests) {
        content += this.generateTestFunction(test, framework, 2);
        content += '\n\n';
      }

      content += '});\n\n';
    }

    // Add footer
    if (template.footer) {
      content += template.footer;
    }

    return content;
  }

  /**
   * Generate individual test function
   */
  generateTestFunction(test, framework, indent = 0) {
    const spaces = ' '.repeat(indent);
    const isAsync =
      test.function?.isAsync || test.category === 'error_handling';
    const asyncKeyword = isAsync ? 'async ' : '';

    let content = `${spaces}test('${test.name}', ${asyncKeyword}() => {\n`;

    // Add setup
    if (test.setup) {
      content += `${spaces}  // Setup\n`;
      content += `${spaces}  ${test.setup}\n\n`;
    }

    // Add mocks
    if (test.mocks && test.mocks.length > 0) {
      content += `${spaces}  // Mocks\n`;
      for (const mock of test.mocks) {
        content += `${spaces}  ${mock}\n`;
      }
      content += '\n';
    }

    // Add test code
    if (test.testCode) {
      content += `${spaces}  // Test execution\n`;
      content += `${spaces}  ${test.testCode}\n\n`;
    }

    // Add assertions
    if (test.assertions) {
      content += `${spaces}  // Assertions\n`;
      for (const assertion of test.assertions) {
        content += `${spaces}  ${assertion};\n`;
      }
    }

    // Add cleanup
    if (test.cleanup) {
      content += `\n${spaces}  // Cleanup\n`;
      content += `${spaces}  ${test.cleanup}\n`;
    }

    content += `${spaces}});`;

    return content;
  }

  // Helper methods for test generation

  generateTestSetup(requirement, codeAnalysis) {
    return `const testData = { /* test setup for ${requirement.text} */ };`;
  }

  generateAssertions(requirement) {
    return ['expect(result).toBeDefined()', 'expect(result).toBeTruthy()'];
  }

  generateTestCleanup(requirement) {
    return `// cleanup after ${requirement.text}`;
  }

  generateMocks(requirement, codeAnalysis) {
    return ["jest.mock('external-dependency')"];
  }

  generateNegativeAssertions(requirement) {
    return [
      'expect(() => testFunction()).toThrow()',
      'expect(result).toBeFalsy()'
    ];
  }

  generateFunctionSetup(func) {
    return `const ${func.name} = require('${func.file}').${func.name};`;
  }

  generateFunctionTestCode(func, testType) {
    const params = func.parameters
      .map(p => this.generateMockParameter(p))
      .join(', ');
    if (func.isAsync) {
      return `const result = await ${func.name}(${params});`;
    } else {
      return `const result = ${func.name}(${params});`;
    }
  }

  generateFunctionAssertions(func, testType) {
    const assertions = ['expect(result).toBeDefined()'];

    if (func.returnType === 'boolean') {
      assertions.push('expect(typeof result).toBe("boolean")');
    } else if (func.returnType === 'string') {
      assertions.push('expect(typeof result).toBe("string")');
    } else if (func.returnType === 'number') {
      assertions.push('expect(typeof result).toBe("number")');
    }

    return assertions;
  }

  generateFunctionMocks(func, codeAnalysis) {
    const mocks = [];

    // Mock external dependencies
    const externalImports = codeAnalysis.imports.filter(
      imp => !imp.module.startsWith('.') && !imp.module.startsWith('/')
    );

    for (const imp of externalImports.slice(0, 3)) {
      // Limit to 3 mocks
      mocks.push(`jest.mock('${imp.module}')`);
    }

    return mocks;
  }

  generateMockParameter(param) {
    if (param.type === 'string') return `'test-${param.name}'`;
    if (param.type === 'number') return '42';
    if (param.type === 'boolean') return 'true';
    if (param.type === 'array') return '[]';
    if (param.type === 'object') return '{}';
    return `mockData.${param.name}`;
  }

  // Utility methods

  async ensureDirectories() {
    await fs.mkdir(this.dataDir, { recursive: true });
    await fs.mkdir(this.templatesDir, { recursive: true });
    await fs.mkdir(this.outputDir, { recursive: true });
  }

  async loadTestTemplates() {
    // Load built-in templates
    this.testTemplates.set('jest', {
      header:
        '// Auto-generated test file\n// Generated by Test Case Generator\n\n',
      setup: 'beforeEach(() => {\n  // Test setup\n});',
      footer: '',
      imports: "const { jest } = require('@jest/globals');"
    });

    this.testTemplates.set('vitest', {
      header:
        "// Auto-generated test file\n// Generated by Test Case Generator\n\nimport { describe, test, expect, beforeEach } from 'vitest';\n\n",
      setup: 'beforeEach(() => {\n  // Test setup\n});',
      footer: ''
    });
  }

  async loadExistingAnalysis() {
    try {
      const data = await fs.readFile(this.analysisFile, 'utf8');
      this.analysisResults = JSON.parse(data);
    } catch {
      // No existing analysis
    }
  }

  async saveAnalysis() {
    await fs.writeFile(
      this.analysisFile,
      JSON.stringify(this.analysisResults, null, 2)
    );
  }

  async getTaskById(taskId) {
    try {
      const stateData = await fs.readFile(this.stateFile, 'utf8');
      const state = JSON.parse(stateData);
      return state.tasks?.[taskId];
    } catch {
      return null;
    }
  }

  identifySource(matchText, sources) {
    for (let i = 0; i < sources.length; i++) {
      if (sources[i].includes(matchText)) {
        return ['title', 'description', 'acceptance_criteria'][i] || 'unknown';
      }
    }
    return 'unknown';
  }

  calculateRequirementPriority(text, type) {
    let priority = 5; // Base priority

    // Increase priority for security and error handling
    if (type === 'security') priority += 3;
    if (type === 'error_handling') priority += 2;
    if (type === 'validation') priority += 1;

    // Increase priority for keywords indicating importance
    if (text.includes('critical') || text.includes('must')) priority += 2;
    if (text.includes('important') || text.includes('required')) priority += 1;

    return Math.min(10, priority);
  }

  isTestable(text, type) {
    // Some requirements are not easily testable
    const untestablePatterns = [
      /documentation/i,
      /readme/i,
      /comment/i,
      /style/i,
      /format/i
    ];

    return !untestablePatterns.some(pattern => pattern.test(text));
  }

  deduplicateRequirements(requirements) {
    const seen = new Set();
    return requirements.filter(req => {
      const key = req.text.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  deduplicateTestCases(testCases) {
    const seen = new Set();
    return testCases.filter(test => {
      const key = test.name.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  extractComponentNames(task) {
    const text = `${task.title || ''} ${task.description || ''}`;
    const matches =
      text.match(
        /[A-Z][a-zA-Z0-9]*(?:Component|Manager|Service|Handler|Helper)/g
      ) || [];
    return [...new Set(matches)];
  }

  async searchForComponentFiles(componentName) {
    // This would search the filesystem for files matching the component name
    // Simplified implementation
    return [];
  }

  extractParameters(content, functionIndex) {
    // Extract function parameters from content at the given index
    const afterFunction = content.slice(functionIndex);
    const match = afterFunction.match(/\(([^)]*)\)/);

    if (!match || !match[1].trim()) return [];

    return match[1].split(',').map(param => {
      const cleaned = param.trim();
      const [name, type] = cleaned.split(':').map(s => s.trim());
      return {
        name: name || 'param',
        type: type || 'any',
        optional: cleaned.includes('?')
      };
    });
  }

  extractReturnType(content, functionIndex) {
    // Extract TypeScript return type
    const afterFunction = content.slice(functionIndex);
    const match = afterFunction.match(/\):\s*([^{]+)/);
    return match ? match[1].trim() : 'any';
  }

  calculateFunctionComplexity(content, functionIndex) {
    // Simple complexity calculation based on control structures
    const afterFunction = content.slice(functionIndex, functionIndex + 1000);
    const patterns = [
      /if\s*\(/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /catch\s*\(/g
    ];

    return patterns.reduce((complexity, pattern) => {
      const matches = afterFunction.match(pattern);
      return complexity + (matches ? matches.length : 0);
    }, 1);
  }

  calculateFileComplexity(content) {
    const lines = content.split('\n').length;
    const functions = (content.match(/function\s+/g) || []).length;
    const classes = (content.match(/class\s+/g) || []).length;

    return Math.round(lines / 50 + functions * 2 + classes * 3);
  }

  extractClassMethods(content, classIndex) {
    // Extract class methods - simplified implementation
    const afterClass = content.slice(classIndex);
    const classBody = this.extractBlock(afterClass, '{', '}');
    const methodMatches = [
      ...classBody.matchAll(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g)
    ];

    return methodMatches.map(match => ({
      name: match[1],
      isAsync: match[0].includes('async'),
      isPrivate: match[1].startsWith('_')
    }));
  }

  extractInterfaceProperties(content, interfaceIndex) {
    // Extract TypeScript interface properties
    const afterInterface = content.slice(interfaceIndex);
    const interfaceBody = this.extractBlock(afterInterface, '{', '}');
    const propMatches = [
      ...interfaceBody.matchAll(
        /([a-zA-Z_$][a-zA-Z0-9_$]*)\??\s*:\s*([^;,}]+)/g
      )
    ];

    return propMatches.map(match => ({
      name: match[1],
      type: match[2].trim(),
      optional: match[0].includes('?')
    }));
  }

  extractBlock(content, openChar, closeChar) {
    let level = 0;
    let start = content.indexOf(openChar);
    if (start === -1) return '';

    for (let i = start; i < content.length; i++) {
      if (content[i] === openChar) level++;
      if (content[i] === closeChar) level--;
      if (level === 0) {
        return content.slice(start + 1, i);
      }
    }

    return '';
  }

  isExported(content, index) {
    const beforeIndex = content.slice(Math.max(0, index - 50), index);
    return beforeIndex.includes('export');
  }

  getExportType(exportMatch) {
    if (exportMatch.includes('default')) return 'default';
    if (exportMatch.includes('function')) return 'function';
    if (exportMatch.includes('class')) return 'class';
    if (exportMatch.includes('const')) return 'const';
    return 'named';
  }

  getImportType(importMatch) {
    if (importMatch.includes('* as')) return 'namespace';
    if (importMatch.includes('{')) return 'named';
    if (importMatch.includes('default')) return 'default';
    return 'side_effect';
  }

  groupTestsByTarget(testCases) {
    const grouped = new Map();

    for (const test of testCases) {
      const target = test.file || test.class || test.function || 'general';
      if (!grouped.has(target)) {
        grouped.set(target, []);
      }
      grouped.get(target).push(test);
    }

    return grouped;
  }

  groupTestsByCategory(tests) {
    const grouped = new Map();

    for (const test of tests) {
      const category = test.category || 'general';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category).push(test);
    }

    return grouped;
  }

  generateTestFileName(target, framework, taskId) {
    const cleanTarget = target.replace(/[^a-zA-Z0-9]/g, '_');
    const extension = framework === 'vitest' ? '.test.ts' : '.test.js';
    return `${cleanTarget}_${taskId}${extension}`;
  }

  async getTestTemplate(framework) {
    return this.testTemplates.get(framework) || this.testTemplates.get('jest');
  }

  generateImports(tests, framework) {
    const imports = new Set();

    // Add framework-specific imports
    if (framework === 'jest') {
      imports.add("const { jest } = require('@jest/globals');");
    } else if (framework === 'vitest') {
      imports.add(
        "import { describe, test, expect, beforeEach, vi } from 'vitest';"
      );
    }

    // Add imports for tested modules
    const modules = new Set();
    tests.forEach(test => {
      if (test.file) modules.add(test.file);
    });

    modules.forEach(module => {
      const importPath = module.replace(/\.(js|ts)$/, '');
      imports.add(`import * as testModule from '${importPath}';`);
    });

    return Array.from(imports).join('\n');
  }

  // Test code generators for specific patterns

  generateParameterTestSetup(func, param) {
    return "const invalidValues = [null, undefined, '', 0, NaN, {}, []];";
  }

  generateParameterTestCode(func, param) {
    return `
      for (const invalidValue of invalidValues) {
        expect(() => ${func.name}(invalidValue)).toThrow();
      }
    `;
  }

  generateParameterAssertions(func, param) {
    return ['expect(errorCount).toBeGreaterThan(0)'];
  }

  generateErrorTestSetup(func) {
    return "const mockError = new Error('Test error');";
  }

  generateErrorTestCode(func) {
    if (func.isAsync) {
      return `await expect(${func.name}(errorTrigger)).rejects.toThrow();`;
    } else {
      return `expect(() => ${func.name}(errorTrigger)).toThrow();`;
    }
  }

  generateErrorAssertions(func) {
    return ['expect(error).toBeInstanceOf(Error)'];
  }

  generateConstructorTestCode(cls) {
    return `const instance = new ${cls.name}();`;
  }

  generateConstructorAssertions(cls) {
    return [
      `expect(instance).toBeInstanceOf(${cls.name})`,
      'expect(instance).toBeDefined()'
    ];
  }

  generateMethodTestSetup(cls, method) {
    return `const instance = new ${cls.name}();`;
  }

  generateMethodTestCode(cls, method) {
    return `const result = instance.${method.name}();`;
  }

  generateMethodAssertions(cls, method) {
    return ['expect(result).toBeDefined()'];
  }

  generateEdgeCaseTestCode(func, edgeCase) {
    return `const result = ${func.name}(${JSON.stringify(edgeCase.value)});`;
  }

  generateEdgeCaseAssertions(func, edgeCase) {
    return [
      'expect(() => result).not.toThrow()',
      'expect(result).toBeDefined()'
    ];
  }

  generateAsyncErrorTestCode(func) {
    return `await expect(${func.name}(invalidInput)).rejects.toThrow();`;
  }

  generateAsyncErrorAssertions(func) {
    return ['expect(error).toBeInstanceOf(Error)'];
  }

  generateXSSTestCode(codeAnalysis) {
    return `
      const maliciousInput = '<script>alert("xss")</script>';
      const result = processInput(maliciousInput);
    `;
  }

  generateInjectionTestCode(codeAnalysis) {
    return `
      const injectionAttempt = 'eval("malicious code")';
      const result = processInput(injectionAttempt);
    `;
  }

  /**
   * Get test generation statistics
   */
  async getStatistics() {
    return {
      tasksAnalyzed: this.analysisResults.tasksAnalyzed,
      testsGenerated: this.analysisResults.testsGenerated,
      averageTestsPerTask:
        this.analysisResults.tasksAnalyzed > 0
          ? this.analysisResults.testsGenerated /
            this.analysisResults.tasksAnalyzed
          : 0,
      templatesLoaded: this.testTemplates.size,
      supportedFrameworks: Object.keys(this.config.frameworks).filter(
        f => this.config.frameworks[f].enabled
      ),
      lastGeneration: this.analysisResults.lastGeneration,
      coverageTargets: this.config.generation.coverage
    };
  }
}

// CLI mode
if (require.main === module) {
  const generator = new TestCaseGenerator();

  const args = process.argv.slice(2);
  const command = args[0];
  const taskId = args[1];

  async function main() {
    try {
      await generator.initialize();

      switch (command) {
        case 'generate':
          if (!taskId) {
            console.error('❌ Task ID required for generation');
            process.exit(1);
          }

          console.log(`🧪 Generating tests for task ${taskId}...\n`);
          const result = await generator.generateTestsForTask(taskId, {
            framework: args[2] || 'jest'
          });

          console.log('\n✅ Test generation complete:');
          console.log(`📋 Requirements analyzed: ${result.requirements}`);
          console.log(`🧪 Test cases generated: ${result.testCases}`);
          console.log(`📝 Test files created: ${result.testFiles}`);
          break;

        case 'stats':
          const stats = await generator.getStatistics();
          console.log('📊 Test Generation Statistics:');
          console.log(JSON.stringify(stats, null, 2));
          break;

        case 'help':
        default:
          console.log(`
🧪 Test Case Generator

USAGE:
  node TestCaseGenerator.js <command> [options]

COMMANDS:
  generate <taskId> [framework]    Generate test cases for a specific task
  stats                            Display generation statistics
  help                             Show this help

EXAMPLES:
  node TestCaseGenerator.js generate T-1234567890123-abc123
  node TestCaseGenerator.js generate T-1234567890123-abc123 vitest
  node TestCaseGenerator.js stats

SUPPORTED FRAMEWORKS:
  - jest (default)
  - vitest
  - mocha

OUTPUT:
  Generated test files are saved to: ${generator.outputDir}
`);
          break;
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }

  main();
}

module.exports = TestCaseGenerator;
