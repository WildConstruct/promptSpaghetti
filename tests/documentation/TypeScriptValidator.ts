/**
 * TypeScript Validator - Documentation Testing
 *
 * Validates TypeScript, JavaScript, TSX, and JSX code blocks from documentation
 * for syntax correctness, type safety, and import validation.
 *
 * Task: E18-1753114562748-32EEBC - Implement doc testing
 */

import * as ts from 'typescript';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CodeBlock, CodeBlockTestResult } from './DocTestFramework';

export interface TypeScriptValidationOptions {
  compilerOptions: ts.CompilerOptions;
  allowUndeclaredImports: boolean;
  validateSyntax: boolean;
  validateTypes: boolean;
  skipLibCheck: boolean;
  allowJavaScript: boolean;
}

export interface ImportValidationResult {
  module: string;
  exists: boolean;
  type: 'npm' | 'local' | 'builtin' | 'unknown';
  resolvedPath?: string;
  error?: string;
}

/**
 * Validates TypeScript/JavaScript code blocks from documentation
 */
export class TypeScriptValidator {
  private options: TypeScriptValidationOptions;
  private packageJsonCache = new Map<string, Record<string, unknown>>();
  private nodeModulesCache = new Map<string, boolean>();

  constructor(options: TypeScriptValidationOptions) {
    this.options = {
      skipLibCheck: true,
      allowJavaScript: true,
      ...options
    };
  }

  /**
   * Validate a TypeScript/JavaScript code block
   */
  async validateCodeBlock(codeBlock: CodeBlock): Promise<CodeBlockTestResult> {
    const errors: string[] = [];
    let validationType: CodeBlockTestResult['validationType'] = 'syntax';

    try {
      // Basic language check
      if (!this.isSupportedLanguage(codeBlock.language)) {
        return {
          language: codeBlock.language,
          content: codeBlock.content,
          lineNumber: codeBlock.lineNumber,
          passed: false,
          errors: [`Unsupported language: ${codeBlock.language}`],
          validationType: 'syntax'
        };
      }

      // Syntax validation
      if (this.options.validateSyntax) {
        const syntaxErrors = this.validateSyntax(codeBlock);
        errors.push(...syntaxErrors);

        if (syntaxErrors.length === 0) {
          validationType = 'syntax';
        }
      }

      // Import validation
      if (errors.length === 0) {
        const importErrors = await this.validateImports(codeBlock);
        errors.push(...importErrors);

        if (importErrors.length === 0) {
          validationType = 'imports';
        }
      }

      // Type validation (if TypeScript)
      if (
        errors.length === 0 &&
        this.options.validateTypes &&
        this.isTypeScriptLike(codeBlock.language)
      ) {
        const typeErrors = this.validateTypes(codeBlock);
        errors.push(...typeErrors);

        if (typeErrors.length === 0) {
          validationType = 'types';
        }
      }

      return {
        language: codeBlock.language,
        content: codeBlock.content,
        lineNumber: codeBlock.lineNumber,
        passed: errors.length === 0,
        errors,
        validationType
      };
    } catch (error) {
      return {
        language: codeBlock.language,
        content: codeBlock.content,
        lineNumber: codeBlock.lineNumber,
        passed: false,
        errors: [
          `Validation failed: ${error instanceof Error ? error.message : String(error)}`
        ],
        validationType: 'syntax'
      };
    }
  }

  /**
   * Validate syntax of TypeScript/JavaScript code
   */
  private validateSyntax(codeBlock: CodeBlock): string[] {
    const errors: string[] = [];

    try {
      // Determine script kind
      const scriptKind = this.getScriptKind(codeBlock.language);

      // Create source file for syntax parsing
      const sourceFile = ts.createSourceFile(
        `temp.${this.getFileExtension(codeBlock.language)}`,
        codeBlock.content,
        ts.ScriptTarget.Latest,
        true,
        scriptKind
      );

      // Check for syntax errors
      const diagnostics = sourceFile.parseDiagnostics;

      diagnostics.forEach(diagnostic => {
        if (diagnostic.file) {
          const { line, character } =
            diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
          const message = ts.flattenDiagnosticMessageText(
            diagnostic.messageText,
            '\n'
          );
          errors.push(`Line ${line + 1}, Col ${character + 1}: ${message}`);
        } else {
          const message = ts.flattenDiagnosticMessageText(
            diagnostic.messageText,
            '\n'
          );
          errors.push(message);
        }
      });
    } catch (error) {
      errors.push(
        `Syntax validation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return errors;
  }

  /**
   * Validate imports in code block
   */
  private async validateImports(codeBlock: CodeBlock): Promise<string[]> {
    if (!this.options.allowUndeclaredImports) {
      return [];
    }

    const errors: string[] = [];

    try {
      const imports = this.extractImports(codeBlock.content);

      for (const importStatement of imports) {
        const result = await this.validateImport(importStatement.module);

        if (!result.exists && result.type !== 'unknown') {
          errors.push(
            `Import not found: ${importStatement.module} (Line ${importStatement.line})`
          );
        }
      }
    } catch (error) {
      errors.push(
        `Import validation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return errors;
  }

  /**
   * Validate types in TypeScript code
   */
  private validateTypes(codeBlock: CodeBlock): string[] {
    const errors: string[] = [];

    try {
      // Create temporary program for type checking
      const tempFileName = `temp.${this.getFileExtension(codeBlock.language)}`;

      // Create in-memory host
      const files = new Map<string, string>();
      files.set(tempFileName, codeBlock.content);

      const host: ts.CompilerHost = {
        getSourceFile: fileName => {
          if (files.has(fileName)) {
            return ts.createSourceFile(
              fileName,
              files.get(fileName)!,
              ts.ScriptTarget.Latest,
              true
            );
          }
          return undefined;
        },
        writeFile: () => {},
        getCurrentDirectory: () => process.cwd(),
        getDirectories: () => [],
        fileExists: fileName => files.has(fileName),
        readFile: fileName => files.get(fileName),
        getCanonicalFileName: fileName => fileName,
        useCaseSensitiveFileNames: () => true,
        getNewLine: () => '\n',
        resolveModuleNames: () => []
      };

      // Create program
      const program = ts.createProgram(
        [tempFileName],
        this.options.compilerOptions,
        host
      );

      // Get diagnostics
      const diagnostics = ts.getPreEmitDiagnostics(program);

      diagnostics.forEach(diagnostic => {
        if (diagnostic.file && diagnostic.start !== undefined) {
          const { line, character } =
            diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
          const message = ts.flattenDiagnosticMessageText(
            diagnostic.messageText,
            '\n'
          );
          errors.push(`Line ${line + 1}, Col ${character + 1}: ${message}`);
        } else {
          const message = ts.flattenDiagnosticMessageText(
            diagnostic.messageText,
            '\n'
          );
          errors.push(message);
        }
      });
    } catch (error) {
      errors.push(
        `Type validation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return errors;
  }

  /**
   * Extract import statements from code
   */
  private extractImports(
    code: string
  ): Array<{ module: string; line: number; type: 'import' | 'require' }> {
    const imports: Array<{
      module: string;
      line: number;
      type: 'import' | 'require';
    }> = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // ES6 imports: import ... from 'module'
      const importMatch = trimmed.match(
        /^import\s+(?:.*?\s+from\s+)?['"`]([^'"`]+)['"`]/
      );
      if (importMatch) {
        imports.push({
          module: importMatch[1],
          line: index + 1,
          type: 'import'
        });
      }

      // CommonJS requires: require('module')
      const requireMatch = trimmed.match(
        /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/
      );
      if (requireMatch) {
        imports.push({
          module: requireMatch[1],
          line: index + 1,
          type: 'require'
        });
      }

      // Dynamic imports: import('module')
      const dynamicImportMatch = trimmed.match(
        /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/
      );
      if (dynamicImportMatch) {
        imports.push({
          module: dynamicImportMatch[1],
          line: index + 1,
          type: 'import'
        });
      }
    });

    return imports;
  }

  /**
   * Validate a single import/require statement
   */
  private async validateImport(
    moduleName: string
  ): Promise<ImportValidationResult> {
    try {
      // Built-in Node.js modules
      const builtinModules = [
        'fs',
        'path',
        'url',
        'util',
        'events',
        'stream',
        'http',
        'https',
        'crypto',
        'os',
        'child_process',
        'cluster',
        'worker_threads',
        'assert',
        'buffer',
        'console',
        'dns',
        'domain',
        'net',
        'querystring',
        'readline',
        'repl',
        'string_decoder',
        'timers',
        'tls',
        'tty',
        'dgram',
        'v8',
        'vm',
        'zlib',
        'inspector',
        'perf_hooks',
        'async_hooks'
      ];

      if (
        builtinModules.includes(moduleName) ||
        moduleName.startsWith('node:')
      ) {
        return {
          module: moduleName,
          exists: true,
          type: 'builtin'
        };
      }

      // Relative imports (local files)
      if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
        return {
          module: moduleName,
          exists: true, // Assume local imports are valid for documentation
          type: 'local'
        };
      }

      // Absolute imports (check if it's a known package)
      const packageExists = await this.checkPackageExists(moduleName);

      return {
        module: moduleName,
        exists: packageExists,
        type: packageExists ? 'npm' : 'unknown'
      };
    } catch (error) {
      return {
        module: moduleName,
        exists: false,
        type: 'unknown',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Check if a package exists in node_modules or package.json
   */
  private async checkPackageExists(packageName: string): Promise<boolean> {
    // Extract package name (remove sub-paths)
    const cleanPackageName = packageName.startsWith('@')
      ? packageName.split('/').slice(0, 2).join('/') // @scope/package
      : packageName.split('/')[0]; // package

    // Check cache first
    if (this.nodeModulesCache.has(cleanPackageName)) {
      return this.nodeModulesCache.get(cleanPackageName)!;
    }

    try {
      // Check if package is listed in dependencies
      const packageJsonExists =
        await this.isPackageInDependencies(cleanPackageName);
      if (packageJsonExists) {
        this.nodeModulesCache.set(cleanPackageName, true);
        return true;
      }

      // Check if package exists in node_modules
      const nodeModulesPath = path.resolve('node_modules', cleanPackageName);
      try {
        await fs.access(nodeModulesPath);
        this.nodeModulesCache.set(cleanPackageName, true);
        return true;
      } catch {
        // Package not found in node_modules
      }

      // Check common workspace locations
      const workspaceLocations = [
        path.resolve('packages', cleanPackageName),
        path.resolve('apps', cleanPackageName),
        path.resolve('libs', cleanPackageName)
      ];

      for (const location of workspaceLocations) {
        try {
          await fs.access(location);
          this.nodeModulesCache.set(cleanPackageName, true);
          return true;
        } catch {
          // Continue checking other locations
        }
      }

      this.nodeModulesCache.set(cleanPackageName, false);
      return false;
    } catch {
      this.nodeModulesCache.set(cleanPackageName, false);
      return false;
    }
  }

  /**
   * Check if package is listed in package.json dependencies
   */
  private async isPackageInDependencies(packageName: string): Promise<boolean> {
    try {
      // Check root package.json
      if (!this.packageJsonCache.has('root')) {
        try {
          const packageJsonContent = await fs.readFile('package.json', 'utf-8');
          const packageJson = JSON.parse(packageJsonContent);
          this.packageJsonCache.set('root', packageJson);
        } catch {
          this.packageJsonCache.set('root', {});
        }
      }

      const rootPackageJson = this.packageJsonCache.get('root')!;

      // Check all dependency types
      const depTypes = [
        'dependencies',
        'devDependencies',
        'peerDependencies',
        'optionalDependencies'
      ];
      for (const depType of depTypes) {
        if (rootPackageJson[depType] && rootPackageJson[depType][packageName]) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Check if language is supported by this validator
   */
  private isSupportedLanguage(language: string): boolean {
    const supportedLanguages = [
      'typescript',
      'javascript',
      'tsx',
      'jsx',
      'ts',
      'js'
    ];
    return supportedLanguages.includes(language.toLowerCase());
  }

  /**
   * Check if language is TypeScript-like (needs type checking)
   */
  private isTypeScriptLike(language: string): boolean {
    const tsLanguages = ['typescript', 'tsx', 'ts'];
    return tsLanguages.includes(language.toLowerCase());
  }

  /**
   * Get TypeScript ScriptKind for language
   */
  private getScriptKind(language: string): ts.ScriptKind {
    switch (language.toLowerCase()) {
      case 'typescript':
      case 'ts':
        return ts.ScriptKind.TS;
      case 'tsx':
        return ts.ScriptKind.TSX;
      case 'javascript':
      case 'js':
        return ts.ScriptKind.JS;
      case 'jsx':
        return ts.ScriptKind.JSX;
      default:
        return ts.ScriptKind.JS;
    }
  }

  /**
   * Get file extension for language
   */
  private getFileExtension(language: string): string {
    switch (language.toLowerCase()) {
      case 'typescript':
      case 'ts':
        return 'ts';
      case 'tsx':
        return 'tsx';
      case 'javascript':
      case 'js':
        return 'js';
      case 'jsx':
        return 'jsx';
      default:
        return 'js';
    }
  }
}

/**
 * Utility class for advanced TypeScript validation
 */
export class TypeScriptAnalyzer {
  /**
   * Analyze TypeScript code complexity
   */
  static analyzeComplexity(code: string): {
    cyclomaticComplexity: number;
    linesOfCode: number;
    functions: number;
    classes: number;
    interfaces: number;
    imports: number;
  } {
    const sourceFile = ts.createSourceFile(
      'temp.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );

    let cyclomaticComplexity = 1; // Base complexity
    let functions = 0;
    let classes = 0;
    let interfaces = 0;
    let imports = 0;

    function visit(node: ts.Node) {
      switch (node.kind) {
        case ts.SyntaxKind.IfStatement:
        case ts.SyntaxKind.WhileStatement:
        case ts.SyntaxKind.ForStatement:
        case ts.SyntaxKind.ForInStatement:
        case ts.SyntaxKind.ForOfStatement:
        case ts.SyntaxKind.DoWhileStatement:
        case ts.SyntaxKind.SwitchStatement:
        case ts.SyntaxKind.ConditionalExpression:
        case ts.SyntaxKind.CaseClause:
        case ts.SyntaxKind.CatchClause:
          cyclomaticComplexity++;
          break;
        case ts.SyntaxKind.FunctionDeclaration:
        case ts.SyntaxKind.FunctionExpression:
        case ts.SyntaxKind.ArrowFunction:
        case ts.SyntaxKind.MethodDeclaration:
          functions++;
          break;
        case ts.SyntaxKind.ClassDeclaration:
          classes++;
          break;
        case ts.SyntaxKind.InterfaceDeclaration:
          interfaces++;
          break;
        case ts.SyntaxKind.ImportDeclaration:
          imports++;
          break;
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    const linesOfCode = code
      .split('\n')
      .filter(line => line.trim().length > 0).length;

    return {
      cyclomaticComplexity,
      linesOfCode,
      functions,
      classes,
      interfaces,
      imports
    };
  }

  /**
   * Extract type definitions from TypeScript code
   */
  static extractTypeDefinitions(code: string): Array<{
    name: string;
    kind: 'interface' | 'type' | 'class' | 'enum';
    properties?: string[];
    methods?: string[];
  }> {
    const sourceFile = ts.createSourceFile(
      'temp.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );

    const types: Array<{
      name: string;
      kind: 'interface' | 'type' | 'class' | 'enum';
      properties?: string[];
      methods?: string[];
    }> = [];

    function visit(node: ts.Node) {
      if (ts.isInterfaceDeclaration(node)) {
        const properties = node.members
          .filter(ts.isPropertySignature)
          .map(prop => prop.name?.getText() || 'unknown')
          .filter(name => name !== 'unknown');

        const methods = node.members
          .filter(ts.isMethodSignature)
          .map(method => method.name?.getText() || 'unknown')
          .filter(name => name !== 'unknown');

        types.push({
          name: node.name.getText(),
          kind: 'interface',
          properties,
          methods
        });
      } else if (ts.isTypeAliasDeclaration(node)) {
        types.push({
          name: node.name.getText(),
          kind: 'type'
        });
      } else if (ts.isClassDeclaration(node)) {
        const properties = node.members
          .filter(ts.isPropertyDeclaration)
          .map(prop => prop.name?.getText() || 'unknown')
          .filter(name => name !== 'unknown');

        const methods = node.members
          .filter(ts.isMethodDeclaration)
          .map(method => method.name?.getText() || 'unknown')
          .filter(name => name !== 'unknown');

        types.push({
          name: node.name?.getText() || 'unknown',
          kind: 'class',
          properties,
          methods
        });
      } else if (ts.isEnumDeclaration(node)) {
        const properties = node.members
          .map(member => member.name?.getText() || 'unknown')
          .filter(name => name !== 'unknown');

        types.push({
          name: node.name.getText(),
          kind: 'enum',
          properties
        });
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    return types;
  }
}

export default TypeScriptValidator;
