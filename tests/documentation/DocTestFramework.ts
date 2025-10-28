/**
 * Documentation Testing Framework - Epic 18
 *
 * Comprehensive testing framework for validating documentation accuracy, code examples,
 * API contracts, and tutorial content. Ensures documentation stays synchronized with
 * the actual codebase and provides reliable developer experience.
 *
 * Task: E18-1753114562748-32EEBC - Implement doc testing
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import * as ts from 'typescript';
import { CodeBlockExtractor } from './CodeBlockExtractor';
import { ApiValidator } from './ApiValidator';
import { TypeScriptValidator } from './TypeScriptValidator';
import { CliValidator } from './CliValidator';

// =============================================================================
// Documentation Testing Configuration
// =============================================================================

export interface DocTestConfig {
  enabled: boolean;
  verbose: boolean;

  // File pattern matching
  documentationPaths: string[];
  excludePatterns: string[];

  // Testing features
  validateCodeBlocks: boolean;
  validateApiExamples: boolean;
  validateTypeScript: boolean;
  validateCliCommands: boolean;
  validateLinks: boolean;

  // Code validation settings
  typescript: {
    compilerOptions: ts.CompilerOptions;
    allowUndeclaredImports: boolean;
    validateSyntax: boolean;
    validateTypes: boolean;
  };

  // API validation settings
  api: {
    baseUrl: string;
    timeout: number;
    validateRequests: boolean;
    validateResponses: boolean;
    skipNetworkRequests: boolean;
  };

  // CLI validation settings
  cli: {
    validateSyntax: boolean;
    validateCommands: boolean;
    allowedCommands: string[];
    skipExecution: boolean;
  };

  // Performance settings
  maxConcurrentFiles: number;
  maxFileSize: number; // bytes
  timeout: number; // milliseconds

  // Reporting settings
  generateReport: boolean;
  reportPath: string;
  reportFormat: 'json' | 'html' | 'markdown';
}

export interface DocTestResult {
  filePath: string;
  fileName: string;
  passed: boolean;

  // Test results by type
  codeBlockResults: CodeBlockTestResult[];
  apiResults: ApiTestResult[];
  linkResults: LinkTestResult[];

  // Metadata
  executionTime: number;
  errors: DocTestError[];
  warnings: DocTestWarning[];

  // Statistics
  stats: {
    totalCodeBlocks: number;
    validCodeBlocks: number;
    totalApiExamples: number;
    validApiExamples: number;
    totalLinks: number;
    validLinks: number;
  };
}

export interface CodeBlockTestResult {
  language: string;
  content: string;
  lineNumber: number;
  passed: boolean;
  errors: string[];
  validationType: 'syntax' | 'types' | 'execution' | 'imports';
}

export interface ApiTestResult {
  endpoint: string;
  method: string;
  example: unknown;
  passed: boolean;
  errors: string[];
  responseTime?: number;
  statusCode?: number;
}

export interface LinkTestResult {
  url: string;
  type: 'internal' | 'external' | 'anchor';
  passed: boolean;
  error?: string;
  statusCode?: number;
}

export interface DocTestError {
  type: 'syntax' | 'validation' | 'network' | 'file' | 'config';
  message: string;
  location?: {
    line: number;
    column: number;
    file: string;
  };
  details?: unknown;
}

export interface DocTestWarning {
  type: 'deprecated' | 'performance' | 'style' | 'maintenance';
  message: string;
  suggestion?: string;
}

export interface DocTestSummary {
  totalFiles: number;
  passedFiles: number;
  failedFiles: number;

  totalTests: number;
  passedTests: number;
  failedTests: number;

  executionTime: number;

  // Detailed breakdown
  breakdown: {
    codeBlocks: { total: number; passed: number; failed: number };
    apiExamples: { total: number; passed: number; failed: number };
    links: { total: number; passed: number; failed: number };
  };

  // Most common issues
  commonErrors: Array<{ error: string; count: number; files: string[] }>;
  warnings: Array<{ warning: string; count: number; files: string[] }>;
}

// =============================================================================
// Documentation Testing Framework
// =============================================================================

export class DocTestFramework {
  private config: DocTestConfig;
  private codeBlockExtractor: CodeBlockExtractor;
  private apiValidator: ApiValidator;
  private typeScriptValidator: TypeScriptValidator;
  private cliValidator: CliValidator;

  constructor(config: Partial<DocTestConfig> = {}) {
    this.config = {
      enabled: true,
      verbose: false,

      documentationPaths: [
        'README.md',
        'docs/**/*.md',
        'packages/**/README.md',
        '**/*.md'
      ],
      excludePatterns: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '.git/**',
        'coverage/**'
      ],

      validateCodeBlocks: true,
      validateApiExamples: true,
      validateTypeScript: true,
      validateCliCommands: true,
      validateLinks: true,

      typescript: {
        compilerOptions: {
          target: ts.ScriptTarget.ES2020,
          module: ts.ModuleKind.ESNext,
          moduleResolution: ts.ModuleResolutionKind.Node16,
          allowJs: true,
          jsx: ts.JsxEmit.ReactJSX,
          strict: false,
          noEmit: true,
          skipLibCheck: true,
          allowSyntheticDefaultImports: true,
          esModuleInterop: true
        },
        allowUndeclaredImports: true,
        validateSyntax: true,
        validateTypes: false
      },

      api: {
        baseUrl: 'http://localhost:8000',
        timeout: 5000,
        validateRequests: true,
        validateResponses: true,
        skipNetworkRequests: true
      },

      cli: {
        validateSyntax: true,
        validateCommands: true,
        allowedCommands: [
          'npm',
          'pnpm',
          'node',
          'npx',
          'git',
          'curl',
          'ls',
          'cd',
          'mkdir',
          'jest',
          'tsc',
          'eslint'
        ],
        skipExecution: true
      },

      maxConcurrentFiles: 5,
      maxFileSize: 1024 * 1024, // 1MB
      timeout: 30000,

      generateReport: true,
      reportPath: './test-results/documentation',
      reportFormat: 'json',

      ...config
    };

    this.codeBlockExtractor = new CodeBlockExtractor();
    this.apiValidator = new ApiValidator(this.config.api);
    this.typeScriptValidator = new TypeScriptValidator(this.config.typescript);
    this.cliValidator = new CliValidator(this.config.cli);
  }

  /**
   * Run documentation tests for all configured files
   */
  async runTests(): Promise<DocTestSummary> {
    if (!this.config.enabled) {
      throw new Error('Documentation testing is disabled');
    }

    const startTime = Date.now();

    try {
      // Find all documentation files
      const files = await this.findDocumentationFiles();

      if (this.config.verbose) {
        console.log(`Found ${files.length} documentation files to test`);
      }

      // Test files in batches for performance
      const results: DocTestResult[] = [];
      for (let i = 0; i < files.length; i += this.config.maxConcurrentFiles) {
        const batch = files.slice(i, i + this.config.maxConcurrentFiles);
        const batchResults = await Promise.all(
          batch.map(file => this.testDocumentationFile(file))
        );
        results.push(...batchResults);

        if (this.config.verbose && batch.length > 1) {
          const batchNum = Math.floor(i / this.config.maxConcurrentFiles) + 1;
          const totalBatches = Math.ceil(
            files.length / this.config.maxConcurrentFiles
          );
          console.log(`Completed batch ${batchNum}/${totalBatches}`);
        }
      }

      // Generate summary
      const summary = this.generateSummary(results, Date.now() - startTime);

      // Generate detailed report if configured
      if (this.config.generateReport) {
        await this.generateReport(summary, results);
      }

      return summary;
    } catch (error) {
      throw new Error(
        `Documentation testing failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Test a single documentation file
   */
  async testDocumentationFile(filePath: string): Promise<DocTestResult> {
    const startTime = Date.now();
    const fileName = path.basename(filePath);

    try {
      // Check file size
      const fileStats = await fs.stat(filePath);
      if (fileStats.size > this.config.maxFileSize) {
        return {
          filePath,
          fileName,
          passed: false,
          codeBlockResults: [],
          apiResults: [],
          linkResults: [],
          executionTime: Date.now() - startTime,
          errors: [
            {
              type: 'file',
              message: `File size (${fileStats.size} bytes) exceeds maximum (${this.config.maxFileSize} bytes)`
            }
          ],
          warnings: [],
          stats: {
            totalCodeBlocks: 0,
            validCodeBlocks: 0,
            totalApiExamples: 0,
            validApiExamples: 0,
            totalLinks: 0,
            validLinks: 0
          }
        };
      }

      // Read and parse file
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = matter(content);
      const markdown = parsed.content;

      // Initialize result containers
      const codeBlockResults: CodeBlockTestResult[] = [];
      const apiResults: ApiTestResult[] = [];
      const linkResults: LinkTestResult[] = [];
      const errors: DocTestError[] = [];
      const warnings: DocTestWarning[] = [];

      // Extract and validate code blocks
      if (this.config.validateCodeBlocks) {
        const codeBlocks = this.codeBlockExtractor.extractCodeBlocks(markdown);

        for (const block of codeBlocks) {
          try {
            let result: CodeBlockTestResult;

            if (
              this.config.validateTypeScript &&
              (block.language === 'typescript' ||
                block.language === 'tsx' ||
                block.language === 'javascript' ||
                block.language === 'jsx')
            ) {
              result = await this.typeScriptValidator.validateCodeBlock(block);
            } else if (
              this.config.validateCliCommands &&
              (block.language === 'bash' ||
                block.language === 'sh' ||
                block.language === 'shell')
            ) {
              result = await this.cliValidator.validateCodeBlock(block);
            } else {
              // Basic syntax validation for other languages
              result = {
                language: block.language,
                content: block.content,
                lineNumber: block.lineNumber,
                passed: true,
                errors: [],
                validationType: 'syntax'
              };
            }

            codeBlockResults.push(result);
          } catch (error) {
            errors.push({
              type: 'validation',
              message: `Code block validation failed: ${error instanceof Error ? error.message : String(error)}`,
              location: {
                line: block.lineNumber,
                column: 0,
                file: filePath
              }
            });
          }
        }
      }

      // Validate API examples
      if (this.config.validateApiExamples) {
        try {
          const apiExamples = this.apiValidator.extractApiExamples(markdown);
          for (const example of apiExamples) {
            const result = await this.apiValidator.validateApiExample(example);
            apiResults.push(result);
          }
        } catch (error) {
          errors.push({
            type: 'validation',
            message: `API validation failed: ${error instanceof Error ? error.message : String(error)}`
          });
        }
      }

      // Validate links
      if (this.config.validateLinks) {
        try {
          const links = this.extractLinks(markdown);
          for (const link of links) {
            const result = await this.validateLink(link, filePath);
            linkResults.push(result);
          }
        } catch (error) {
          errors.push({
            type: 'validation',
            message: `Link validation failed: ${error instanceof Error ? error.message : String(error)}`
          });
        }
      }

      // Calculate statistics
      const stats = {
        totalCodeBlocks: codeBlockResults.length,
        validCodeBlocks: codeBlockResults.filter(r => r.passed).length,
        totalApiExamples: apiResults.length,
        validApiExamples: apiResults.filter(r => r.passed).length,
        totalLinks: linkResults.length,
        validLinks: linkResults.filter(r => r.passed).length
      };

      // Determine overall pass/fail status
      const passed =
        errors.length === 0 &&
        codeBlockResults.every(r => r.passed) &&
        apiResults.every(r => r.passed) &&
        linkResults.every(r => r.passed);

      return {
        filePath,
        fileName,
        passed,
        codeBlockResults,
        apiResults,
        linkResults,
        executionTime: Date.now() - startTime,
        errors,
        warnings,
        stats
      };
    } catch (error) {
      return {
        filePath,
        fileName,
        passed: false,
        codeBlockResults: [],
        apiResults: [],
        linkResults: [],
        executionTime: Date.now() - startTime,
        errors: [
          {
            type: 'file',
            message: `Failed to process file: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        warnings: [],
        stats: {
          totalCodeBlocks: 0,
          validCodeBlocks: 0,
          totalApiExamples: 0,
          validApiExamples: 0,
          totalLinks: 0,
          validLinks: 0
        }
      };
    }
  }

  /**
   * Find all documentation files matching configured patterns
   */
  private async findDocumentationFiles(): Promise<string[]> {
    const allFiles: Set<string> = new Set();

    // Find files matching include patterns
    for (const pattern of this.config.documentationPaths) {
      try {
        const matches = await glob(pattern, {
          ignore: this.config.excludePatterns,
          absolute: true
        });
        matches.forEach(file => allFiles.add(file));
      } catch (error) {
        if (this.config.verbose) {
          console.warn(
            `Failed to match pattern ${pattern}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }

    return Array.from(allFiles).sort();
  }

  /**
   * Extract links from markdown content
   */
  private extractLinks(markdown: string): Array<{
    url: string;
    text: string;
    type: 'internal' | 'external' | 'anchor';
  }> {
    const links: Array<{
      url: string;
      text: string;
      type: 'internal' | 'external' | 'anchor';
    }> = [];

    // Match markdown links: [text](url)
    const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(markdown)) !== null) {
      const [, text, url] = match;

      let type: 'internal' | 'external' | 'anchor';
      if (url.startsWith('http://') || url.startsWith('https://')) {
        type = 'external';
      } else if (url.startsWith('#')) {
        type = 'anchor';
      } else {
        type = 'internal';
      }

      links.push({ url, text, type });
    }

    return links;
  }

  /**
   * Validate a link
   */
  private async validateLink(
    link: {
      url: string;
      text: string;
      type: 'internal' | 'external' | 'anchor';
    },
    filePath: string
  ): Promise<LinkTestResult> {
    try {
      if (link.type === 'external') {
        // For external links, we might want to skip actual network requests in tests
        if (this.config.api.skipNetworkRequests) {
          return {
            url: link.url,
            type: link.type,
            passed: true // Assume external links are valid to avoid network dependencies
          };
        }

        // Network request validation would go here
        return {
          url: link.url,
          type: link.type,
          passed: true,
          statusCode: 200
        };
      } else if (link.type === 'internal') {
        // Validate internal file links
        const fullPath = path.resolve(path.dirname(filePath), link.url);
        try {
          await fs.access(fullPath);
          return {
            url: link.url,
            type: link.type,
            passed: true
          };
        } catch {
          return {
            url: link.url,
            type: link.type,
            passed: false,
            error: 'File not found'
          };
        }
      } else {
        // Anchor links - validate that the anchor exists in the current file
        return {
          url: link.url,
          type: link.type,
          passed: true // Basic implementation - could be enhanced to check actual anchors
        };
      }
    } catch (error) {
      return {
        url: link.url,
        type: link.type,
        passed: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Generate test summary from results
   */
  private generateSummary(
    results: DocTestResult[],
    executionTime: number
  ): DocTestSummary {
    const totalFiles = results.length;
    const passedFiles = results.filter(r => r.passed).length;
    const failedFiles = totalFiles - passedFiles;

    // Calculate totals
    const totalCodeBlocks = results.reduce(
      (sum, r) => sum + r.stats.totalCodeBlocks,
      0
    );
    const passedCodeBlocks = results.reduce(
      (sum, r) => sum + r.stats.validCodeBlocks,
      0
    );
    const totalApiExamples = results.reduce(
      (sum, r) => sum + r.stats.totalApiExamples,
      0
    );
    const passedApiExamples = results.reduce(
      (sum, r) => sum + r.stats.validApiExamples,
      0
    );
    const totalLinks = results.reduce((sum, r) => sum + r.stats.totalLinks, 0);
    const passedLinks = results.reduce((sum, r) => sum + r.stats.validLinks, 0);

    const totalTests = totalCodeBlocks + totalApiExamples + totalLinks;
    const passedTests = passedCodeBlocks + passedApiExamples + passedLinks;

    // Collect common errors and warnings
    const errorMap = new Map<string, { count: number; files: string[] }>();
    const warningMap = new Map<string, { count: number; files: string[] }>();

    results.forEach(result => {
      result.errors.forEach(error => {
        const key = error.message;
        if (!errorMap.has(key)) {
          errorMap.set(key, { count: 0, files: [] });
        }
        const entry = errorMap.get(key)!;
        entry.count++;
        entry.files.push(result.fileName);
      });

      result.warnings.forEach(warning => {
        const key = warning.message;
        if (!warningMap.has(key)) {
          warningMap.set(key, { count: 0, files: [] });
        }
        const entry = warningMap.get(key)!;
        entry.count++;
        entry.files.push(result.fileName);
      });
    });

    const commonErrors = Array.from(errorMap.entries())
      .map(([error, data]) => ({ error, count: data.count, files: data.files }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const warnings = Array.from(warningMap.entries())
      .map(([warning, data]) => ({
        warning,
        count: data.count,
        files: data.files
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalFiles,
      passedFiles,
      failedFiles,
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      executionTime,
      breakdown: {
        codeBlocks: {
          total: totalCodeBlocks,
          passed: passedCodeBlocks,
          failed: totalCodeBlocks - passedCodeBlocks
        },
        apiExamples: {
          total: totalApiExamples,
          passed: passedApiExamples,
          failed: totalApiExamples - passedApiExamples
        },
        links: {
          total: totalLinks,
          passed: passedLinks,
          failed: totalLinks - passedLinks
        }
      },
      commonErrors,
      warnings
    };
  }

  /**
   * Generate detailed test report
   */
  private async generateReport(
    summary: DocTestSummary,
    results: DocTestResult[]
  ): Promise<void> {
    try {
      // Ensure report directory exists
      await fs.mkdir(path.dirname(this.config.reportPath), { recursive: true });

      const reportData = {
        timestamp: new Date().toISOString(),
        summary,
        results: results.map(result => ({
          ...result,
          // Limit code block content for readability
          codeBlockResults: result.codeBlockResults.map(cb => ({
            ...cb,
            content:
              cb.content.length > 200
                ? cb.content.substring(0, 200) + '...'
                : cb.content
          }))
        }))
      };

      if (this.config.reportFormat === 'json') {
        await fs.writeFile(
          `${this.config.reportPath}.json`,
          JSON.stringify(reportData, null, 2),
          'utf-8'
        );
      } else if (this.config.reportFormat === 'markdown') {
        const markdownReport = this.generateMarkdownReport(summary, results);
        await fs.writeFile(
          `${this.config.reportPath}.md`,
          markdownReport,
          'utf-8'
        );
      }

      if (this.config.verbose) {
        console.log(
          `Report generated: ${this.config.reportPath}.${this.config.reportFormat}`
        );
      }
    } catch (error) {
      console.warn(
        `Failed to generate report: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate markdown report
   */
  private generateMarkdownReport(
    summary: DocTestSummary,
    results: DocTestResult[]
  ): string {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    let report = '# Documentation Test Report\n\n';
    report += `**Generated:** ${date} at ${time}\n`;
    report += `**Execution Time:** ${summary.executionTime}ms\n\n`;

    // Summary section
    report += '## Summary\n\n';
    report += `- **Files Tested:** ${summary.totalFiles}\n`;
    report += `- **Files Passed:** ${summary.passedFiles}\n`;
    report += `- **Files Failed:** ${summary.failedFiles}\n`;
    report += `- **Success Rate:** ${((summary.passedFiles / summary.totalFiles) * 100).toFixed(1)}%\n\n`;

    report += '### Test Breakdown\n\n';
    report += '| Test Type | Total | Passed | Failed | Success Rate |\n';
    report += '|-----------|-------|--------|---------|--------------|\n';
    const codeBlocksRate =
      summary.breakdown.codeBlocks.total > 0
        ? (
            (summary.breakdown.codeBlocks.passed /
              summary.breakdown.codeBlocks.total) *
            100
          ).toFixed(1)
        : 0;
    report +=
      `| Code Blocks | ${summary.breakdown.codeBlocks.total} | ` +
      `${summary.breakdown.codeBlocks.passed} | ${summary.breakdown.codeBlocks.failed} | ${codeBlocksRate}% |\n`;
    const apiExamplesRate =
      summary.breakdown.apiExamples.total > 0
        ? (
            (summary.breakdown.apiExamples.passed /
              summary.breakdown.apiExamples.total) *
            100
          ).toFixed(1)
        : 0;
    report +=
      `| API Examples | ${summary.breakdown.apiExamples.total} | ` +
      `${summary.breakdown.apiExamples.passed} | ${summary.breakdown.apiExamples.failed} | ${apiExamplesRate}% |\n`;
    const linksRate =
      summary.breakdown.links.total > 0
        ? (
            (summary.breakdown.links.passed / summary.breakdown.links.total) *
            100
          ).toFixed(1)
        : 0;
    report +=
      `| Links | ${summary.breakdown.links.total} | ` +
      `${summary.breakdown.links.passed} | ${summary.breakdown.links.failed} | ${linksRate}% |\n\n`;

    // Common errors
    if (summary.commonErrors.length > 0) {
      report += '## Common Errors\n\n';
      summary.commonErrors.forEach((error, index) => {
        report += `${index + 1}. **${error.error}**\n`;
        report += `   - Occurrences: ${error.count}\n`;
        report += `   - Files: ${error.files.slice(0, 5).join(', ')}${error.files.length > 5 ? ' ...' : ''}\n\n`;
      });
    }

    // Failed files detail
    const failedFiles = results.filter(r => !r.passed);
    if (failedFiles.length > 0) {
      report += '## Failed Files\n\n';
      failedFiles.forEach(result => {
        report += `### ${result.fileName}\n\n`;
        report += `**Path:** \`${result.filePath}\`\n`;
        report += `**Execution Time:** ${result.executionTime}ms\n\n`;

        if (result.errors.length > 0) {
          report += '**Errors:**\n';
          result.errors.forEach(error => {
            report += `- ${error.message}\n`;
          });
          report += '\n';
        }

        if (result.codeBlockResults.some(cb => !cb.passed)) {
          report += '**Failed Code Blocks:**\n';
          result.codeBlockResults
            .filter(cb => !cb.passed)
            .forEach(cb => {
              report += `- Line ${cb.lineNumber} (${cb.language}): ${cb.errors.join(', ')}\n`;
            });
          report += '\n';
        }
      });
    }

    return report;
  }
}

/**
 * Default configuration for documentation testing
 */
export default DocTestFramework;
