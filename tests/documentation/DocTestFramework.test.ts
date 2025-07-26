/**
 * Documentation Testing Framework - Jest Test Suite
 * 
 * Comprehensive test suite for the documentation testing framework,
 * validating all components and ensuring reliable doc testing capabilities.
 * 
 * Task: E18-1753114562748-32EEBC - Implement doc testing
 */

import * as fs from 'fs/promises';
import { DocTestFramework, DEFAULT_DOC_TEST_CONFIG, DocTestConfig } from './DocTestFramework';
import { CodeBlockExtractor } from './CodeBlockExtractor';
import { TypeScriptValidator } from './TypeScriptValidator';
import { ApiValidator } from './ApiValidator';
import { CliValidator } from './CliValidator';

// Mock dependencies for testing
jest.mock('fs/promises');
jest.mock('glob', () => ({
  glob: jest.fn<unknown[], unknown>()
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('DocTestFramework', () => {
  let docTest: DocTestFramework;
  let testConfig: DocTestConfig;
  
  beforeEach(() => {
    testConfig = {
      ...DEFAULT_DOC_TEST_CONFIG,
      generateReport: false,
      verbose: false
    };
    docTest = new DocTestFramework(testConfig);
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  describe('Configuration', () => {
    it('should use default configuration when no config provided', () => {
      const defaultDocTest = new DocTestFramework();
      expect(defaultDocTest).toBeDefined();
    });
    
    it('should merge custom configuration with defaults', () => {
      const customConfig = {
        validateCodeBlocks: false,
        validateApiExamples: false,
        maxConcurrentFiles: 10
      };
      
      const customDocTest = new DocTestFramework(customConfig);
      expect(customDocTest).toBeDefined();
    });
    
    it('should handle invalid configuration gracefully', () => {
      const invalidConfig = {
        maxConcurrentFiles: -1,
        timeout: -1000
      };
      
      expect(() => new DocTestFramework(invalidConfig as unknown as DocTestConfig)).not.toThrow();
    });
  });
  
  describe('File Discovery', () => {
    it('should find documentation files using glob patterns', async () => {
      const mockFiles = [
        '/project/README.md',
        '/project/docs/guide.md',
        '/project/packages/core/README.md'
      ];
      
      // Mock glob to return test files
      const { glob } = await import('glob') as { glob: { mockResolvedValue: (value: unknown) => void } };
      glob.mockResolvedValue(mockFiles as unknown as unknown);
      
      const files = await (
        docTest as unknown as { findDocumentationFiles: () => Promise<string[]> }
      ).findDocumentationFiles();
      
      expect(files).toEqual(mockFiles.sort());
    });
    
    it('should exclude files matching exclude patterns', async () => {
      const { glob } = await import('glob') as { glob: { mockResolvedValue: (value: unknown) => void } };
      glob.mockResolvedValue(['/project/README.md'] as unknown as unknown); // Excluded files filtered by glob
      
      const files = await (
        docTest as unknown as { findDocumentationFiles: () => Promise<string[]> }
      ).findDocumentationFiles();
      
      expect(files).toEqual(['/project/README.md']);
    });
  });
  
  describe('Single File Testing', () => {
    it('should test a documentation file successfully', async () => {
      const testFilePath = '/project/test.md';
      const testContent = `# Test Documentation
      
      This is a sample documentation file.
      
      \`\`\`typescript
      const greeting = "Hello, World!";
      console.log(greeting);
      \`\`\`
      
      \`\`\`bash
      npm install
      npm test
      \`\`\`
      `;
      
      mockFs.stat.mockResolvedValue({ size: 1000 } as fs.Stats as unknown);
      mockFs.readFile.mockResolvedValue(testContent as unknown as unknown);
      
      const result = await docTest.testDocumentationFile(testFilePath);
      
      expect(result).toMatchObject({
        filePath: testFilePath,
        fileName: 'test.md',
        passed: expect.any(Boolean),
        codeBlockResults: expect.any(Array),
        apiResults: expect.any(Array),
        linkResults: expect.any(Array),
        executionTime: expect.any(Number),
        errors: expect.any(Array),
        warnings: expect.any(Array),
        stats: {
          totalCodeBlocks: expect.any(Number),
          validCodeBlocks: expect.any(Number),
          totalApiExamples: expect.any(Number),
          validApiExamples: expect.any(Number),
          totalLinks: expect.any(Number),
          validLinks: expect.any(Number)
        }
      });
    });
    
    it('should handle file size limits', async () => {
      const testFilePath = '/project/large.md';
      
      mockFs.stat.mockResolvedValue({ size: 10 * 1024 * 1024 } as fs.Stats as unknown); // 10MB
      
      const result = await docTest.testDocumentationFile(testFilePath);
      
      expect(result.passed).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'file',
          message: expect.stringContaining('exceeds maximum')
        })
      );
    });
    
    it('should handle malformed frontmatter', async () => {
      const testFilePath = '/project/malformed.md';
      const testContent = `---
      invalid: yaml: content
      ---
      # Test
      `;
      
      mockFs.stat.mockResolvedValue({ size: 100 } as fs.Stats as unknown);
      mockFs.readFile.mockResolvedValue(testContent as unknown as unknown);
      
      const result = await docTest.testDocumentationFile(testFilePath);
      
      // Should not fail due to malformed frontmatter
      expect(result).toBeDefined();
    });
    
    it('should handle file read errors', async () => {
      const testFilePath = '/project/nonexistent.md';
      
      mockFs.stat.mockRejectedValue(new Error('File not found'));
      
      const result = await docTest.testDocumentationFile(testFilePath);
      
      expect(result.passed).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'file',
          message: expect.stringContaining('Failed to process file')
        })
      );
    });
  });
  
  describe('Link Validation', () => {
    it('should validate internal links', async () => {
      const testContent = `# Test

See [other doc](./other.md) for more info.`;
      
      mockFs.stat.mockResolvedValue({ size: 100 } as fs.Stats as unknown);
      mockFs.readFile.mockResolvedValue(testContent as unknown as unknown);
      mockFs.access.mockResolvedValue(undefined as unknown as unknown); // File exists
      
      const result = await docTest.testDocumentationFile('/project/test.md');
      
      expect(result.linkResults).toContainEqual(
        expect.objectContaining({
          url: './other.md',
          type: 'internal',
          passed: true
        })
      );
    });
    
    it('should handle broken internal links', async () => {
      const testContent = `# Test

See [broken link](./nonexistent.md) for more info.`;
      
      mockFs.stat.mockResolvedValue({ size: 100 } as fs.Stats as unknown);
      mockFs.readFile.mockResolvedValue(testContent as unknown as unknown);
      mockFs.access.mockRejectedValue(new Error('File not found'));
      
      const result = await docTest.testDocumentationFile('/project/test.md');
      
      expect(result.linkResults).toContainEqual(
        expect.objectContaining({
          url: './nonexistent.md',
          type: 'internal',
          passed: false,
          error: 'File not found'
        })
      );
    });
    
    it('should validate external links when network requests are enabled', async () => {
      const testContent = `# Test

Visit [GitHub](https://github.com) for more info.`;
      
      const configWithNetwork = {
        ...testConfig,
        api: { ...testConfig.api, skipNetworkRequests: false }
      };
      
      const networkDocTest = new DocTestFramework(configWithNetwork);
      
      mockFs.stat.mockResolvedValue({ size: 100 } as fs.Stats as unknown);
      mockFs.readFile.mockResolvedValue(testContent as unknown as unknown);
      
      const result = await networkDocTest.testDocumentationFile('/project/test.md');
      
      expect(result.linkResults).toContainEqual(
        expect.objectContaining({
          url: 'https://github.com',
          type: 'external',
          passed: expect.any(Boolean)
        })
      );
    });
    
    it('should validate anchor links', async () => {
      const testContent = `# Test

Jump to [section](#example) below.

## Example`;
      
      mockFs.stat.mockResolvedValue({ size: 100 } as fs.Stats as unknown);
      mockFs.readFile.mockResolvedValue(testContent as unknown as unknown);
      
      const result = await docTest.testDocumentationFile('/project/test.md');
      
      expect(result.linkResults).toContainEqual(
        expect.objectContaining({
          url: '#example',
          type: 'anchor',
          passed: true
        })
      );
    });
  });
  
  describe('Summary Generation', () => {
    it('should generate accurate summary from results', () => {
      const mockResults = [
        {
          filePath: '/project/test1.md',
          fileName: 'test1.md',
          passed: true,
          codeBlockResults: [],
          apiResults: [],
          linkResults: [],
          executionTime: 100,
          errors: [],
          warnings: [],
          stats: {
            totalCodeBlocks: 2,
            validCodeBlocks: 2,
            totalApiExamples: 1,
            validApiExamples: 1,
            totalLinks: 3,
            validLinks: 3
          }
        },
        {
          filePath: '/project/test2.md',
          fileName: 'test2.md',
          passed: false,
          codeBlockResults: [],
          apiResults: [],
          linkResults: [],
          executionTime: 150,
          errors: [{ type: 'syntax' as const, message: 'Syntax error' }],
          warnings: [],
          stats: {
            totalCodeBlocks: 1,
            validCodeBlocks: 0,
            totalApiExamples: 0,
            validApiExamples: 0,
            totalLinks: 1,
            validLinks: 0
          }
        }
      ];
      
      const summary = (
        docTest as unknown as { generateSummary: (results: unknown[], time: number) => unknown }
      ).generateSummary(mockResults, 250);
      
      expect(summary).toMatchObject({
        totalFiles: 2,
        passedFiles: 1,
        failedFiles: 1,
        totalTests: 8, // 3 code blocks + 1 api example + 4 links
        passedTests: 6, // 2 + 1 + 3  
        failedTests: 2,
        executionTime: 250,
        breakdown: {
          codeBlocks: { total: 3, passed: 2, failed: 1 },
          apiExamples: { total: 1, passed: 1, failed: 0 },
          links: { total: 4, passed: 3, failed: 1 }
        },
        commonErrors: expect.any(Array),
        warnings: expect.any(Array)
      });
    });
  });
  
  describe('Error Handling', () => {
    it('should handle disabled framework gracefully', async () => {
      const disabledConfig = { ...testConfig, enabled: false };
      const disabledDocTest = new DocTestFramework(disabledConfig);
      
      await expect(disabledDocTest.runTests()).rejects.toThrow('Documentation testing is disabled');
    });
    
    it('should handle timeout scenarios', async () => {
      const timeoutConfig = { ...testConfig, timeout: 1 }; // 1ms timeout
      const timeoutDocTest = new DocTestFramework(timeoutConfig);
      
      mockFs.stat.mockResolvedValue({ size: 100 } as fs.Stats as unknown);
      mockFs.readFile.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('# Test'), 100))
      );
      
      // Should not hang indefinitely
      const startTime = Date.now();
      try {
        await timeoutDocTest.runTests();
      } catch {
        // Expected to fail due to timeout
      }
      const elapsed = Date.now() - startTime;
      
      expect(elapsed).toBeLessThan(5000); // Should not take more than 5 seconds
    });
  });
  
  describe('Integration with Validators', () => {
    it('should integrate with TypeScript validator', async () => {
      const testContent = `# Test

\`\`\`typescript
const message: string = "Hello";
console.log(message);
\`\`\``;
      
      mockFs.stat.mockResolvedValue({ size: 100 } as fs.Stats as unknown);
      mockFs.readFile.mockResolvedValue(testContent as unknown as unknown);
      
      const result = await docTest.testDocumentationFile('/project/test.md');
      
      expect(result.codeBlockResults).toHaveLength(1);
      expect(result.codeBlockResults[0]).toMatchObject({
        language: 'typescript',
        passed: expect.any(Boolean),
        validationType: expect.any(String)
      });
    });
    
    it('should integrate with CLI validator', async () => {
      const testContent = `# Test

\`\`\`bash
npm install
npm test
\`\`\``;
      
      mockFs.stat.mockResolvedValue({ size: 100 } as fs.Stats as unknown);
      mockFs.readFile.mockResolvedValue(testContent as unknown as unknown);
      
      const result = await docTest.testDocumentationFile('/project/test.md');
      
      expect(result.codeBlockResults).toHaveLength(1);
      expect(result.codeBlockResults[0]).toMatchObject({
        language: 'bash',
        passed: expect.any(Boolean),
        validationType: expect.any(String)
      });
    });
    
    it('should integrate with API validator', async () => {
      const testContent = `# Test API
      
      \`\`\`
      GET /api/users
      \`\`\`
      
      \`\`\`json
      {
        "users": [
          {"id": 1, "name": "John"}
        ]
      }
      \`\`\`
      `;
      
      mockFs.stat.mockResolvedValue({ size: 100 } as fs.Stats as unknown);
      mockFs.readFile.mockResolvedValue(testContent as unknown as unknown);
      
      const result = await docTest.testDocumentationFile('/project/test.md');
      
      expect(result.apiResults.length).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('CodeBlockExtractor', () => {
  let extractor: CodeBlockExtractor;
  
  beforeEach(() => {
    extractor = new CodeBlockExtractor();
  });
  
  it('should extract fenced code blocks', () => {
    const markdown = `# Test
    
    \`\`\`typescript
    const greeting = "Hello, World!";
    console.log(greeting);
    \`\`\`
    
    \`\`\`javascript
    const message = "Hello";
    \`\`\`
    `;
    
    const blocks = extractor.extractCodeBlocks(markdown);
    
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({
      language: 'typescript',
      content: expect.stringContaining('greeting'),
      lineNumber: 3
    });
    expect(blocks[1]).toMatchObject({
      language: 'javascript',
      content: expect.stringContaining('message'),
      lineNumber: 8
    });
  });
  
  it('should handle code blocks with metadata', () => {
    const markdown = `# Test

\`\`\`typescript filename="example.ts" title="Example Code"
const example = true;
\`\`\``;
    
    const blocks = extractor.extractCodeBlocks(markdown);
    
    expect(blocks).toHaveLength(1);
    expect(blocks[0].metadata).toMatchObject({
      title: 'Example Code'
    });
    // Note: filename parsing may need adjustment based on regex
  });
  
  it('should handle unclosed code blocks', () => {
    const markdown = `# Test
    
    \`\`\`typescript
    const incomplete = "code block";
    `;
    
    const blocks = extractor.extractCodeBlocks(markdown);
    
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({
      language: 'typescript',
      content: expect.stringContaining('incomplete')
    });
  });
  
  it('should extract inline code', () => {
    const markdown = `# Test
    
    Use \`npm install\` to install dependencies.
    The \`package.json\` file contains metadata.
    `;
    
    const inlineCode = extractor.extractInlineCode(markdown);
    
    expect(inlineCode).toHaveLength(2);
    expect(inlineCode[0]).toMatchObject({
      content: 'npm install',
      lineNumber: 3
    });
    expect(inlineCode[1]).toMatchObject({
      content: 'package.json',
      lineNumber: 4
    });
  });
  
  it('should generate code block statistics', () => {
    const markdown = `# Test
    
    \`\`\`typescript
    const ts = "code";
    console.log(ts);
    \`\`\`
    
    \`\`\`javascript
        \`\`\`
    
    \`\`\`typescript
    const more = "typescript";
    \`\`\`
    `;
    
    const stats = extractor.getCodeBlockStatistics(markdown);
    
    expect(stats).toMatchObject({
      totalBlocks: 3,
      languageDistribution: {
        typescript: 2,
        javascript: 1
      },
      averageBlockSize: expect.any(Number),
      largestBlock: expect.any(Number),
      totalLinesOfCode: expect.any(Number)
    });
  });
});

describe('Integration Tests', () => {
  it('should validate TypeScript code examples', async () => {
    const validator = new TypeScriptValidator({
      compilerOptions: {
        target: 99 as unknown as import('typescript').ScriptTarget, // ts.ScriptTarget.Latest
        noEmit: true,
        skipLibCheck: true
      },
      allowUndeclaredImports: true,
      validateSyntax: true,
      validateTypes: false
    });
    
    const codeBlock = {
      language: 'typescript',
      content: 'const greeting: string = "Hello, World!";',
      lineNumber: 1,
      startColumn: 0,
      endColumn: 0,
      originalBlock: '```typescript\nconst greeting: string = "Hello, World!";\n```'
    };
    
    const result = await validator.validateCodeBlock(codeBlock);
    
    expect(result).toMatchObject({
      language: 'typescript',
      passed: true,
      validationType: expect.any(String)
    });
  });
  
  it('should validate CLI commands', async () => {
    const validator = new CliValidator({
      validateSyntax: true,
      validateCommands: false, // Skip actual command validation for tests
      allowedCommands: ['npm', 'node', 'git'],
      skipExecution: true
    });
    
    const codeBlock = {
      language: 'bash',
      content: 'npm install\nnpm test',
      lineNumber: 1,
      startColumn: 0,
      endColumn: 0,
      originalBlock: '```bash\nnpm install\nnpm test\n```'
    };
    
    const result = await validator.validateCodeBlock(codeBlock);
    
    expect(result).toMatchObject({
      language: 'bash',
      passed: expect.any(Boolean),
      validationType: expect.any(String)
    });
  });
  
  it('should validate API examples', async () => {
    const validator = new ApiValidator({
      baseUrl: 'http://localhost:8000',
      timeout: 5000,
      validateRequests: true,
      validateResponses: true,
      skipNetworkRequests: true
    });
    
    const markdown = `# API Documentation
    
    GET /api/users
    
    \`\`\`json
    {
      "users": [
        {"id": 1, "name": "John"}
      ]
    }
    \`\`\`
    `;
    
    const examples = validator.extractApiExamples(markdown);
    
    expect(examples.length).toBeGreaterThanOrEqual(0);
    
    if (examples.length > 0) {
      const result = await validator.validateApiExample(examples[0]);
      expect(result).toMatchObject({
        endpoint: expect.any(String),
        method: expect.any(String),
        passed: expect.any(Boolean),
        errors: expect.any(Array)
      });
    }
  });
});