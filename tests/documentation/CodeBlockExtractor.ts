/**
 * Code Block Extractor - Documentation Testing
 *
 * Extracts and parses code blocks from markdown files for validation testing.
 * Supports multiple languages and provides metadata for accurate testing.
 *
 * Task: E18-1753114562748-32EEBC - Implement doc testing
 */

export interface CodeBlock {
  language: string;
  content: string;
  lineNumber: number;
  startColumn: number;
  endColumn: number;
  originalBlock: string;
  metadata?: {
    filename?: string;
    title?: string;
    highlightLines?: number[];
    showLineNumbers?: boolean;
  };
}

export interface CodeBlockExtractionOptions {
  supportedLanguages: string[];
  includeUnknownLanguages: boolean;
  preserveIndentation: boolean;
  extractMetadata: boolean;
  minContentLength: number;
  maxContentLength: number;
}

/**
 * Extracts code blocks from markdown content
 */
export class CodeBlockExtractor {
  private options: CodeBlockExtractionOptions;

  constructor(options: Partial<CodeBlockExtractionOptions> = {}) {
    this.options = {
      supportedLanguages: [
        'typescript',
        'ts',
        'tsx',
        'javascript',
        'js',
        'jsx',
        'json',
        'jsonc',
        'bash',
        'sh',
        'shell',
        'sql',
        'mysql',
        'postgresql',
        'html',
        'css',
        'scss',
        'less',
        'yaml',
        'yml',
        'xml',
        'dockerfile',
        'python',
        'py',
        'java',
        'go',
        'rust',
        'c',
        'cpp',
        'cxx',
        'php',
        'ruby',
        'swift',
        'kotlin',
        'scala',
      ],
      includeUnknownLanguages: true,
      preserveIndentation: true,
      extractMetadata: true,
      minContentLength: 1,
      maxContentLength: 10000,
      ...options,
    };
  }

  /**
   * Extract all code blocks from markdown content
   */
  extractCodeBlocks(markdown: string): CodeBlock[] {
    const codeBlocks: CodeBlock[] = [];
    const lines = markdown.split('\n');
    let currentBlock: Partial<CodeBlock> | null = null;
    let blockContent: string[] = [];

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const trimmedLine = line.trim();

      // Check for fenced code block start
      if (trimmedLine.startsWith('```') && !currentBlock) {
        const language = this.extractLanguageFromFence(trimmedLine);

        // Check if we should include this language
        if (this.shouldIncludeLanguage(language)) {
          currentBlock = {
            language,
            lineNumber: lineIndex + 1,
            startColumn: line.indexOf('```'),
            originalBlock: line,
          };
          blockContent = [];

          // Extract metadata if present
          if (this.options.extractMetadata) {
            currentBlock.metadata = this.extractMetadataFromFence(trimmedLine);
          }
        }

        // Check for fenced code block end
      } else if (trimmedLine.startsWith('```') && currentBlock) {
        // Complete the current block
        const content = blockContent.join('\n');

        if (this.isValidCodeBlockContent(content)) {
          const completeBlock: CodeBlock = {
            language: currentBlock.language!,
            content: this.options.preserveIndentation ? content : content.trim(),
            lineNumber: currentBlock.lineNumber!,
            startColumn: currentBlock.startColumn!,
            endColumn: line.indexOf('```'),
            originalBlock: currentBlock.originalBlock + '\n' + blockContent.join('\n') + '\n' + line,
            metadata: currentBlock.metadata,
          };

          codeBlocks.push(completeBlock);
        }

        currentBlock = null;
        blockContent = [];

        // Collect content lines
      } else if (currentBlock) {
        blockContent.push(line);

        // Safety check for runaway blocks
        if (blockContent.length > 1000) {
          console.warn(`Code block starting at line ${currentBlock.lineNumber} is too long, skipping`);
          currentBlock = null;
          blockContent = [];
        }
      }
    }

    // Handle unclosed code blocks
    if (currentBlock && blockContent.length > 0) {
      const content = blockContent.join('\n');
      if (this.isValidCodeBlockContent(content)) {
        const completeBlock: CodeBlock = {
          language: currentBlock.language!,
          content: this.options.preserveIndentation ? content : content.trim(),
          lineNumber: currentBlock.lineNumber!,
          startColumn: currentBlock.startColumn!,
          endColumn: 0,
          originalBlock: currentBlock.originalBlock + '\n' + blockContent.join('\n'),
          metadata: currentBlock.metadata,
        };

        codeBlocks.push(completeBlock);
      }
    }

    return codeBlocks;
  }

  /**
   * Extract inline code snippets (not full blocks)
   */
  extractInlineCode(markdown: string): Array<{ content: string; lineNumber: number; column: number }> {
    const inlineCode: Array<{ content: string; lineNumber: number; column: number }> = [];
    const lines = markdown.split('\n');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      // Match inline code: `code`
      const inlineCodeRegex = /`([^`\n]+)`/g;
      let match;

      while ((match = inlineCodeRegex.exec(line)) !== null) {
        const [, content] = match;

        if (content.trim().length > 0) {
          inlineCode.push({
            content: content.trim(),
            lineNumber: lineIndex + 1,
            column: match.index,
          });
        }
      }
    }

    return inlineCode;
  }

  /**
   * Get statistics about code blocks in the document
   */
  getCodeBlockStatistics(markdown: string): {
    totalBlocks: number;
    languageDistribution: Record<string, number>;
    averageBlockSize: number;
    largestBlock: number;
    totalLinesOfCode: number;
  } {
    const codeBlocks = this.extractCodeBlocks(markdown);
    const languageDistribution: Record<string, number> = {};
    let totalLinesOfCode = 0;
    let largestBlock = 0;

    codeBlocks.forEach(block => {
      // Update language distribution
      languageDistribution[block.language] = (languageDistribution[block.language] || 0) + 1;

      // Count lines
      const lines = block.content.split('\n').length;
      totalLinesOfCode += lines;

      // Track largest block
      if (lines > largestBlock) {
        largestBlock = lines;
      }
    });

    const averageBlockSize = codeBlocks.length > 0 ? totalLinesOfCode / codeBlocks.length : 0;

    return {
      totalBlocks: codeBlocks.length,
      languageDistribution,
      averageBlockSize: Math.round(averageBlockSize * 100) / 100,
      largestBlock,
      totalLinesOfCode,
    };
  }

  /**
   * Filter code blocks by language
   */
  filterByLanguage(codeBlocks: CodeBlock[], languages: string[]): CodeBlock[] {
    const normalizedLanguages = languages.map(lang => this.normalizeLanguage(lang));
    return codeBlocks.filter(block => normalizedLanguages.includes(this.normalizeLanguage(block.language)));
  }

  /**
   * Filter code blocks by content patterns
   */
  filterByPattern(codeBlocks: CodeBlock[], patterns: RegExp[]): CodeBlock[] {
    return codeBlocks.filter(block => patterns.some(pattern => pattern.test(block.content)));
  }

  /**
   * Extract language from fenced code block
   */
  private extractLanguageFromFence(fence: string): string {
    // Remove the opening ```
    const withoutFence = fence.replace(/^```/, '').trim();

    // Extract just the language identifier (before any spaces or metadata)
    const language = withoutFence.split(/\s/)[0].toLowerCase();

    return this.normalizeLanguage(language);
  }

  /**
   * Extract metadata from fenced code block
   */
  private extractMetadataFromFence(fence: string): CodeBlock['metadata'] {
    const metadata: CodeBlock['metadata'] = {};

    // Look for filename in comments or attributes
    const filenameMatch = fence.match(/filename[=:"]\s*([^\s"']+)/i);
    if (filenameMatch) {
      metadata.filename = filenameMatch[1];
    }

    // Look for title
    const titleMatch = fence.match(/title[=:"]\s*"([^"]+)"/i);
    if (titleMatch) {
      metadata.title = titleMatch[1];
    }

    // Look for line highlighting
    const highlightMatch = fence.match(/highlight[=:"]\s*(\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*)/i);
    if (highlightMatch) {
      metadata.highlightLines = this.parseHighlightLines(highlightMatch[1]);
    }

    // Look for line numbers option
    if (fence.match(/\b(showLineNumbers|line-numbers)\b/i)) {
      metadata.showLineNumbers = true;
    }

    return Object.keys(metadata).length > 0 ? metadata : undefined;
  }

  /**
   * Parse highlight line specifications
   */
  private parseHighlightLines(spec: string): number[] {
    const lines: number[] = [];
    const parts = spec.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        // Range: 1-5
        const [start, end] = trimmed.split('-').map(n => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            lines.push(i);
          }
        }
      } else {
        // Single line: 3
        const line = parseInt(trimmed, 10);
        if (!isNaN(line)) {
          lines.push(line);
        }
      }
    }

    return lines.sort((a, b) => a - b);
  }

  /**
   * Normalize language identifiers
   */
  private normalizeLanguage(language: string): string {
    const normalized = language.toLowerCase().trim();

    // Language aliases
    const aliases: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      sh: 'bash',
      shell: 'bash',
      yml: 'yaml',
      py: 'python',
      md: 'markdown',
      jsonc: 'json',
      cxx: 'cpp',
      'c++': 'cpp',
    };

    return aliases[normalized] || normalized;
  }

  /**
   * Check if language should be included
   */
  private shouldIncludeLanguage(language: string): boolean {
    if (this.options.includeUnknownLanguages) {
      return true;
    }

    return (
      this.options.supportedLanguages.includes(language) ||
      this.options.supportedLanguages.includes(this.normalizeLanguage(language))
    );
  }

  /**
   * Validate code block content
   */
  private isValidCodeBlockContent(content: string): boolean {
    const trimmedContent = content.trim();

    // Check minimum length
    if (trimmedContent.length < this.options.minContentLength) {
      return false;
    }

    // Check maximum length
    if (trimmedContent.length > this.options.maxContentLength) {
      return false;
    }

    // Skip empty or whitespace-only blocks
    if (trimmedContent.length === 0) {
      return false;
    }

    return true;
  }
}

/**
 * Utility functions for code block analysis
 */
export class CodeBlockAnalyzer {
  /**
   * Detect the primary programming language in a document
   */
  static detectPrimaryLanguage(codeBlocks: CodeBlock[]): string | null {
    if (codeBlocks.length === 0) {
      return null;
    }

    const languageCounts: Record<string, number> = {};

    codeBlocks.forEach(block => {
      const lang = block.language;
      languageCounts[lang] = (languageCounts[lang] || 0) + block.content.split('\n').length;
    });

    // Find language with most lines of code
    let maxLines = 0;
    let primaryLanguage = null;

    for (const [language, lines] of Object.entries(languageCounts)) {
      if (lines > maxLines) {
        maxLines = lines;
        primaryLanguage = language;
      }
    }

    return primaryLanguage;
  }

  /**
   * Find code blocks that might contain examples
   */
  static findExampleBlocks(codeBlocks: CodeBlock[]): CodeBlock[] {
    const exampleIndicators = [
      /example/i,
      /usage/i,
      /demo/i,
      /sample/i,
      /tutorial/i,
      /getting.?started/i,
      /quickstart/i,
      /how.?to/i,
    ];

    return codeBlocks.filter(block => {
      // Check metadata for example indicators
      if (block.metadata?.title) {
        return exampleIndicators.some(pattern => pattern.test(block.metadata!.title!));
      }

      // Check if filename suggests it's an example
      if (block.metadata?.filename) {
        return exampleIndicators.some(pattern => pattern.test(block.metadata!.filename!));
      }

      // Check content for example patterns
      const content = block.content.toLowerCase();
      return exampleIndicators.some(pattern => pattern.test(content));
    });
  }

  /**
   * Find code blocks that might be incomplete or pseudo-code
   */
  static findIncompleteBlocks(codeBlocks: CodeBlock[]): CodeBlock[] {
    const incompleteIndicators = [
      /\.\.\./,
      /\/\/ TODO/i,
      /\/\/ FIXME/i,
      /\/\/ XXX/i,
      /# TODO/i,
      /# FIXME/i,
      /\[placeholder\]/i,
      /\[your.+here\]/i,
      /<your.+here>/i,
      /replace.with/i,
      /fill.in/i,
    ];

    return codeBlocks.filter(block => incompleteIndicators.some(pattern => pattern.test(block.content)));
  }

  /**
   * Extract import/require statements from code blocks
   */
  static extractImports(
    codeBlocks: CodeBlock[]
  ): Array<{ module: string; type: 'import' | 'require'; language: string; lineNumber: number }> {
    const imports: Array<{ module: string; type: 'import' | 'require'; language: string; lineNumber: number }> = [];

    codeBlocks.forEach(block => {
      const lines = block.content.split('\n');

      lines.forEach((line, index) => {
        const trimmed = line.trim();

        // ES6 imports
        const importMatch = trimmed.match(/^import\s+.*?\s+from\s+['"]([^'"]+)['"]/);
        if (importMatch) {
          imports.push({
            module: importMatch[1],
            type: 'import',
            language: block.language,
            lineNumber: block.lineNumber + index,
          });
        }

        // CommonJS requires
        const requireMatch = trimmed.match(/require\(['"]([^'"]+)['"]\)/);
        if (requireMatch) {
          imports.push({
            module: requireMatch[1],
            type: 'require',
            language: block.language,
            lineNumber: block.lineNumber + index,
          });
        }
      });
    });

    return imports;
  }
}

export default CodeBlockExtractor;
