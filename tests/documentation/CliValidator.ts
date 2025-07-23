/**
 * CLI Validator - Documentation Testing
 * 
 * Validates CLI commands and shell scripts in documentation for syntax correctness,
 * command availability, and safe execution patterns.
 * 
 * Task: E18-1753114562748-32EEBC - Implement doc testing
 */

// Removed unused imports
import { spawn } from 'child_process';
import { CodeBlock, CodeBlockTestResult } from './DocTestFramework';

export interface CliValidationOptions {
  validateSyntax: boolean;
  validateCommands: boolean;
  allowedCommands: string[];
  skipExecution: boolean;
  safetyChecks: boolean;
  shellPath: string;
  timeout: number;
}

export interface CommandInfo {
  command: string;
  args: string[];
  isAvailable: boolean;
  isAllowed: boolean;
  isSafe: boolean;
  suggestedAlternative?: string;
}

/**
 * Validates CLI commands and shell scripts from documentation
 */
export class CliValidator {
  private options: CliValidationOptions;
  private commandCache = new Map<string, boolean>();
  
  constructor(options: CliValidationOptions) {
    this.options = {
      safetyChecks: true,
      shellPath: '/bin/bash',
      timeout: 10000,
      ...options
    };
  }
  
  /**
   * Validate a CLI code block
   */
  async validateCodeBlock(codeBlock: CodeBlock): Promise<CodeBlockTestResult> {
    const errors: string[] = [];
    let validationType: CodeBlockTestResult['validationType'] = 'syntax';
    
    try {
      // Check if this is a supported shell language
      if (!this.isSupportedShellLanguage(codeBlock.language)) {
        return {
          language: codeBlock.language,
          content: codeBlock.content,
          lineNumber: codeBlock.lineNumber,
          passed: false,
          errors: [`Unsupported shell language: ${codeBlock.language}`],
          validationType: 'syntax'
        };
      }
      
      // Parse commands from code block
      const commands = this.parseCommands(codeBlock.content);
      
      // Syntax validation
      if (this.options.validateSyntax) {
        for (const command of commands) {
          const syntaxErrors = await this.validateCommandSyntax(command);
          errors.push(...syntaxErrors);
        }
        
        if (errors.length === 0) {
          validationType = 'syntax';
        }
      }
      
      // Command availability validation
      if (this.options.validateCommands && errors.length === 0) {
        for (const command of commands) {
          const commandErrors = await this.validateCommandAvailability(command);
          errors.push(...commandErrors);
        }
        
        if (errors.length === 0) {
          validationType = 'execution';
        }
      }
      
      // Safety validation
      if (this.options.safetyChecks) {
        for (const command of commands) {
          const safetyErrors = this.validateCommandSafety(command);
          errors.push(...safetyErrors);
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
        errors: [`CLI validation failed: ${error instanceof Error ? error.message : String(error)}`],
        validationType: 'syntax'
      };
    }
  }
  
  /**
   * Parse commands from shell script content
   */
  private parseCommands(content: string): Array<{ command: string; args: string[]; line: number; fullLine: string }> {
    const commands: Array<{ command: string; args: string[]; line: number; fullLine: string }> = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and comments
      if (line === '' || line.startsWith('#')) {
        continue;
      }
      
      // Skip variable assignments (unless they contain command substitution)
      if (line.match(/^[A-Za-z_][A-Za-z0-9_]*=/)) {
        if (line.includes('$(') || line.includes('`')) {
          // Contains command substitution, parse it
          const commandSubstitutions = this.extractCommandSubstitutions(line);
          for (const cmd of commandSubstitutions) {
            const parsed = this.parseCommandLine(cmd);
            if (parsed) {
              commands.push({ ...parsed, line: i + 1, fullLine: line });
            }
          }
        }
        continue;
      }
      
      // Parse command line
      const parsed = this.parseCommandLine(line);
      if (parsed) {
        commands.push({ ...parsed, line: i + 1, fullLine: line });
      }
      
      // Handle multi-line commands (ending with backslash)
      if (line.endsWith('\\')) {
        let fullCommand = line.slice(0, -1).trim();
        let j = i + 1;
        
        while (j < lines.length && lines[j - 1].endsWith('\\')) {
          const continuationLine = lines[j].trim();
          fullCommand += ' ' + continuationLine.replace(/\\$/, '').trim();
          j++;
        }
        
        const parsed = this.parseCommandLine(fullCommand);
        if (parsed) {
          commands.push({ ...parsed, line: i + 1, fullLine: fullCommand });
        }
        
        i = j - 1; // Skip the continuation lines
      }
    }
    
    return commands;
  }
  
  /**
   * Parse a single command line
   */
  private parseCommandLine(line: string): { command: string; args: string[] } | null {
    // Remove shell operators and pipes for basic parsing
    const cleaned = line
      .replace(/\s*[;&|]+\s*$/, '') // Remove trailing operators
      .split(/\s*[;&|]+\s*/)[0] // Take first command in chain
      .trim();
    
    if (cleaned === '') {
      return null;
    }
    
    // Simple argument parsing (doesn't handle all shell quoting perfectly)
    const parts = this.parseShellArguments(cleaned);
    
    if (parts.length === 0) {
      return null;
    }
    
    return {
      command: parts[0],
      args: parts.slice(1)
    };
  }
  
  /**
   * Parse shell arguments (basic implementation)
   */
  private parseShellArguments(line: string): string[] {
    const args: string[] = [];
    let currentArg = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let escapeNext = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (escapeNext) {
        currentArg += char;
        escapeNext = false;
        continue;
      }
      
      if (char === '\\' && !inSingleQuote) {
        escapeNext = true;
        continue;
      }
      
      if (char === '\'' && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
        continue;
      }
      
      if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
        continue;
      }
      
      if (char === ' ' && !inSingleQuote && !inDoubleQuote) {
        if (currentArg !== '') {
          args.push(currentArg);
          currentArg = '';
        }
        continue;
      }
      
      currentArg += char;
    }
    
    if (currentArg !== '') {
      args.push(currentArg);
    }
    
    return args;
  }
  
  /**
   * Extract command substitutions from line
   */
  private extractCommandSubstitutions(line: string): string[] {
    const commands: string[] = [];
    
    // Extract $(command) patterns
    const dollarParenMatches = line.matchAll(/\$\(([^)]+)\)/g);
    for (const match of dollarParenMatches) {
      commands.push(match[1]);
    }
    
    // Extract `command` patterns
    const backtickMatches = line.matchAll(/`([^`]+)`/g);
    for (const match of backtickMatches) {
      commands.push(match[1]);
    }
    
    return commands;
  }
  
  /**
   * Validate command syntax
   */
  private async validateCommandSyntax(
    commandInfo: { command: string; args: string[]; line: number; fullLine: string }
  ): Promise<string[]> {
    const errors: string[] = [];
    
    // Check for common syntax errors
    const fullLine = commandInfo.fullLine;
    
    // Unmatched quotes
    if (this.hasUnmatchedQuotes(fullLine)) {
      errors.push(`Line ${commandInfo.line}: Unmatched quotes`);
    }
    
    // Unmatched parentheses
    if (this.hasUnmatchedParentheses(fullLine)) {
      errors.push(`Line ${commandInfo.line}: Unmatched parentheses`);
    }
    
    // Invalid redirections
    const invalidRedirections = this.findInvalidRedirections(fullLine);
    if (invalidRedirections.length > 0) {
      errors.push(`Line ${commandInfo.line}: Invalid redirections: ${invalidRedirections.join(', ')}`);
    }
    
    // Potentially dangerous patterns
    if (this.options.safetyChecks) {
      const dangerousPatterns = this.findDangerousPatterns(fullLine);
      if (dangerousPatterns.length > 0) {
        errors.push(`Line ${commandInfo.line}: Potentially dangerous patterns: ${dangerousPatterns.join(', ')}`);
      }
    }
    
    return errors;
  }
  
  /**
   * Validate command availability
   */
  private async validateCommandAvailability(
    commandInfo: { command: string; args: string[]; line: number }
  ): Promise<string[]> {
    const errors: string[] = [];
    const command = commandInfo.command;
    
    // Skip built-in shell commands and operators
    if (this.isShellBuiltin(command)) {
      return errors;
    }
    
    // Check if command is in allowed list
    if (this.options.allowedCommands.length > 0 && !this.options.allowedCommands.includes(command)) {
      errors.push(`Line ${commandInfo.line}: Command not in allowed list: ${command}`);
      return errors;
    }
    
    // Check if command is available
    const isAvailable = await this.isCommandAvailable(command);
    if (!isAvailable) {
      const suggestion = this.suggestAlternativeCommand(command);
      const errorMsg = `Line ${commandInfo.line}: Command not found: ${command}`;
      errors.push(suggestion ? `${errorMsg} (try: ${suggestion})` : errorMsg);
    }
    
    return errors;
  }
  
  /**
   * Validate command safety
   */
  private validateCommandSafety(
    commandInfo: { command: string; args: string[]; line: number; fullLine: string }
  ): string[] {
    const errors: string[] = [];
    const command = commandInfo.command;
    const args = commandInfo.args;
    const fullLine = commandInfo.fullLine;
    
    // Dangerous commands
    const dangerousCommands = [
      'rm', 'rmdir', 'dd', 'mkfs', 'fdisk', 'parted',
      'chmod', 'chown', 'sudo', 'su', 'init', 'shutdown',
      'reboot', 'halt', 'poweroff', 'kill', 'killall'
    ];
    
    if (dangerousCommands.includes(command)) {
      // Check for particularly dangerous usage
      if (command === 'rm' && (args.includes('-rf') || args.includes('-r'))) {
        errors.push(`Line ${commandInfo.line}: Potentially destructive command: rm -rf`);
      } else if (command === 'chmod' && args.includes('777')) {
        errors.push(`Line ${commandInfo.line}: Overly permissive chmod 777`);
      } else if (['sudo', 'su'].includes(command)) {
        errors.push(`Line ${commandInfo.line}: Privilege escalation command: ${command}`);
      } else {
        errors.push(`Line ${commandInfo.line}: Potentially dangerous command: ${command}`);
      }
    }
    
    // Check for wildcards in dangerous contexts
    if (fullLine.includes('*') && ['rm', 'chmod', 'chown'].includes(command)) {
      errors.push(`Line ${commandInfo.line}: Wildcard usage with potentially dangerous command`);
    }
    
    // Network operations
    const networkCommands = ['curl', 'wget', 'ssh', 'scp', 'rsync', 'ftp', 'sftp'];
    if (networkCommands.includes(command)) {
      // This is just a warning for documentation
      // In real validation, you might want to check for HTTPS, etc.
    }
    
    return errors;
  }
  
  /**
   * Check if command is available on system
   */
  private async isCommandAvailable(command: string): Promise<boolean> {
    // Check cache first
    if (this.commandCache.has(command)) {
      return this.commandCache.get(command)!;
    }
    
    try {
      const result = await this.executeCommand('which', [command]);
      const available = result.exitCode === 0;
      this.commandCache.set(command, available);
      return available;
    } catch {
      this.commandCache.set(command, false);
      return false;
    }
  }
  
  /**
   * Execute a command (used for validation, not from documentation)
   */
  private executeCommand(
    command: string, 
    args: string[]
  ): Promise<{ exitCode: number; stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        timeout: this.options.timeout,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (exitCode) => {
        resolve({ exitCode: exitCode || 0, stdout, stderr });
      });
      
      child.on('error', (error) => {
        reject(error);
      });
    });
  }
  
  /**
   * Check if language is supported shell language
   */
  private isSupportedShellLanguage(language: string): boolean {
    const shellLanguages = ['bash', 'sh', 'shell', 'zsh', 'fish', 'csh', 'tcsh'];
    return shellLanguages.includes(language.toLowerCase());
  }
  
  /**
   * Check if command is a shell builtin
   */
  private isShellBuiltin(command: string): boolean {
    const builtins = [
      'cd', 'pwd', 'echo', 'printf', 'test', '[', 'eval', 'exec',
      'exit', 'return', 'break', 'continue', 'shift', 'set', 'unset',
      'export', 'source', '.', 'alias', 'unalias', 'history',
      'jobs', 'bg', 'fg', 'wait', 'read', 'getopts', 'let',
      'declare', 'typeset', 'readonly', 'local', 'trap',
      'if', 'then', 'else', 'elif', 'fi', 'case', 'esac',
      'for', 'while', 'until', 'do', 'done', 'function',
      'time', 'coproc', 'select'
    ];
    
    return builtins.includes(command);
  }
  
  /**
   * Suggest alternative command
   */
  private suggestAlternativeCommand(command: string): string | undefined {
    const alternatives: Record<string, string> = {
      'node': 'nodejs',
      'python': 'python3',
      'pip': 'pip3',
      'vim': 'nano',
      'emacs': 'nano',
      'cat': 'less',
      'less': 'more',
      'grep': 'rg',
      'find': 'fd',
      'ls': 'exa'
    };
    
    return alternatives[command];
  }
  
  /**
   * Check for unmatched quotes
   */
  private hasUnmatchedQuotes(line: string): boolean {
    let singleQuotes = 0;
    let doubleQuotes = 0;
    let escapeNext = false;
    
    for (const char of line) {
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '\'') singleQuotes++;
      if (char === '"') doubleQuotes++;
    }
    
    return (singleQuotes % 2 !== 0) || (doubleQuotes % 2 !== 0);
  }
  
  /**
   * Check for unmatched parentheses
   */
  private hasUnmatchedParentheses(line: string): boolean {
    let count = 0;
    let inQuotes = false;
    let quoteChar = '';
    
    for (const char of line) {
      if (!inQuotes && (char === '"' || char === '\'')) {
        inQuotes = true;
        quoteChar = char;
        continue;
      }
      
      if (inQuotes && char === quoteChar) {
        inQuotes = false;
        continue;
      }
      
      if (!inQuotes) {
        if (char === '(') count++;
        if (char === ')') count--;
      }
    }
    
    return count !== 0;
  }
  
  /**
   * Find invalid redirections
   */
  private findInvalidRedirections(line: string): string[] {
    const invalid: string[] = [];
    
    // Check for malformed redirections
    const redirections = line.match(/[<>]+\s*[<>]/g);
    if (redirections) {
      invalid.push(...redirections);
    }
    
    // Check for redirections to dangerous locations
    if (line.match(/>\s*\/dev\/null/)) {
      // This is actually OK, but worth noting
    }
    
    if (line.match(/>\s*\/dev\/zero/)) {
      invalid.push('> /dev/zero');
    }
    
    return invalid;
  }
  
  /**
   * Find dangerous patterns
   */
  private findDangerousPatterns(line: string): string[] {
    const patterns: string[] = [];
    
    // Command injection patterns
    if (line.includes('$(curl') || line.includes('`curl')) {
      patterns.push('remote code execution');
    }
    
    if (line.includes('eval') && line.includes('$')) {
      patterns.push('eval with variable expansion');
    }
    
    // File system dangers
    if (line.includes('rm -rf /')) {
      patterns.push('recursive deletion from root');
    }
    
    if (line.includes('chmod -R 777')) {
      patterns.push('recursive permission change to 777');
    }
    
    // Network dangers
    if (line.match(/curl.*\|\s*(sh|bash|zsh)/)) {
      patterns.push('pipe from curl to shell');
    }
    
    return patterns;
  }
}

/**
 * Utility class for CLI command analysis
 */
export class CliAnalyzer {
  /**
   * Extract all CLI commands from documentation
   */
  static extractAllCommands(codeBlocks: CodeBlock[]): Array<{
    command: string;
    language: string;
    file: string;
    lineNumber: number;
    context: string;
  }> {
    const commands: Array<{
      command: string;
      language: string;
      file: string;
      lineNumber: number;
      context: string;
    }> = [];
    
    for (const block of codeBlocks) {
      if (this.isShellLanguage(block.language)) {
        const validator = new CliValidator({
          validateSyntax: false,
          validateCommands: false,
          allowedCommands: [],
          skipExecution: true
        });
        
        const parsedCommands = (
          validator as unknown as { parseCommands: (content: string) => unknown[] }
        ).parseCommands(block.content);
        
        for (const cmd of parsedCommands) {
          commands.push({
            command: `${cmd.command} ${cmd.args.join(' ')}`.trim(),
            language: block.language,
            file: 'unknown',
            lineNumber: block.lineNumber + cmd.line - 1,
            context: block.content
          });
        }
      }
    }
    
    return commands;
  }
  
  /**
   * Get statistics about CLI usage in documentation
   */
  static getCliStatistics(codeBlocks: CodeBlock[]): {
    totalShellBlocks: number;
    totalCommands: number;
    commandFrequency: Record<string, number>;
    languageDistribution: Record<string, number>;
    mostCommonCommands: Array<{ command: string; count: number }>;
  } {
    const shellBlocks = codeBlocks.filter(block => this.isShellLanguage(block.language));
    const commandFrequency: Record<string, number> = {};
    const languageDistribution: Record<string, number> = {};
    let totalCommands = 0;
    
    for (const block of shellBlocks) {
      languageDistribution[block.language] = (languageDistribution[block.language] || 0) + 1;
      
      const commands = this.extractAllCommands([block]);
      totalCommands += commands.length;
      
      for (const cmd of commands) {
        const baseCommand = cmd.command.split(' ')[0];
        commandFrequency[baseCommand] = (commandFrequency[baseCommand] || 0) + 1;
      }
    }
    
    const mostCommonCommands = Object.entries(commandFrequency)
      .map(([command, count]) => ({ command, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
      totalShellBlocks: shellBlocks.length,
      totalCommands,
      commandFrequency,
      languageDistribution,
      mostCommonCommands
    };
  }
  
  /**
   * Check if language is a shell language
   */
  private static isShellLanguage(language: string): boolean {
    const shellLanguages = ['bash', 'sh', 'shell', 'zsh', 'fish', 'csh', 'tcsh'];
    return shellLanguages.includes(language.toLowerCase());
  }
}

export default CliValidator;