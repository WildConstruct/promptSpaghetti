// Parser Security Service - Story 2.6
// Handles prompt sanitization and output validation

export class ParserSecurity {
  // PII patterns to detect and mask
  private readonly piiPatterns = {
    email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    phone: /\b(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    ipAddress: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
  };

  // Prompt injection patterns to remove
  private readonly injectionPatterns = [
    /ignore\s+(previous|all|above)\s+instructions?/gi,
    /disregard\s+(previous|all|above)/gi,
    /forget\s+everything/gi,
    /system\s*:/gi,
    /\[INST\]/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
    /\{\{system\}\}/gi,
    /assistant\s*:/gi,
    /user\s*:/gi,
  ];

  // Dangerous code patterns in LLM output
  private readonly dangerousPatterns = [
    'eval(',
    'Function(',
    'setTimeout(',
    'setInterval(',
    '__proto__',
    'constructor',
    'prototype',
    'document.write',
    'innerHTML',
    '<script',
    'javascript:',
    'onclick=',
    'onerror=',
  ];

  /**
   * Sanitize prompt before sending to LLM
   */
  sanitizePrompt(prompt: string): string {
    let sanitized = prompt;

    // Mask PII if configured (can be toggled at workspace level)
    if (this.shouldMaskPII()) {
      for (const [type, pattern] of Object.entries(this.piiPatterns)) {
        sanitized = sanitized.replace(pattern, `[${type.toUpperCase()}]`);
      }
    }

    // Remove injection attempts
    for (const pattern of this.injectionPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Escape special characters that might confuse the LLM
    sanitized = this.escapeSpecialCharacters(sanitized);

    // Truncate if too long (prevent token overflow)
    const maxLength = 10000; // characters
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength) + '... [truncated]';
    }

    return sanitized.trim();
  }

  /**
   * Validate LLM output for safety
   */
  validateOutputSafety(response: any): boolean {
    const responseStr = JSON.stringify(response);

    // Check for dangerous patterns
    for (const pattern of this.dangerousPatterns) {
      if (responseStr.includes(pattern)) {
        console.warn(`Dangerous pattern detected in LLM output: ${pattern}`);
        return false;
      }
    }

    // Check for suspicious node content
    if (response.nodes && Array.isArray(response.nodes)) {
      for (const node of response.nodes) {
        if (node.content && typeof node.content === 'string') {
          // Check for script tags or executable code
          if (this.containsExecutableCode(node.content)) {
            console.warn('Executable code detected in node content');
            return false;
          }
        }
      }
    }

    // Validate structure integrity
    if (!this.validateStructure(response)) {
      console.warn('Invalid structure in LLM response');
      return false;
    }

    return true;
  }

  /**
   * Check if PII masking should be enabled
   */
  private shouldMaskPII(): boolean {
    // This can be configured at workspace level
    // For now, check localStorage or environment variable
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('maskPII') === 'true';
    }
    return process.env.MASK_PII === 'true';
  }

  /**
   * Escape special characters that might confuse LLM
   */
  private escapeSpecialCharacters(text: string): string {
    // Don't escape variables in curly braces
    const variablePattern = /\{[^}]+\}/g;
    const variables: string[] = [];
    
    // Extract variables first
    let match;
    while ((match = variablePattern.exec(text)) !== null) {
      variables.push(match[0]);
    }

    // Replace variables with placeholders
    let escaped = text;
    variables.forEach((variable, index) => {
      escaped = escaped.replace(variable, `__VAR_${index}__`);
    });

    // Escape other special patterns
    escaped = escaped
      .replace(/```[\s\S]*?```/g, (match) => {
        // Preserve code blocks but mark them
        return `[CODE_BLOCK]${match}[/CODE_BLOCK]`;
      })
      .replace(/\\/g, '\\\\') // Escape backslashes
      .replace(/"/g, '\\"'); // Escape quotes

    // Restore variables
    variables.forEach((variable, index) => {
      escaped = escaped.replace(`__VAR_${index}__`, variable);
    });

    return escaped;
  }

  /**
   * Check if text contains executable code
   */
  private containsExecutableCode(text: string): boolean {
    // Check for common code patterns
    const codePatterns = [
      /<script[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi, // Event handlers
      /eval\s*\(/gi,
      /new\s+Function\s*\(/gi,
    ];

    for (const pattern of codePatterns) {
      if (pattern.test(text)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Validate response structure
   */
  private validateStructure(response: any): boolean {
    // Must have nodes array
    if (!response.nodes || !Array.isArray(response.nodes)) {
      return false;
    }

    // Must have edges array
    if (!response.edges || !Array.isArray(response.edges)) {
      return false;
    }

    // Validate edge references
    for (const edge of response.edges) {
      if (typeof edge.source !== 'number' || typeof edge.target !== 'number') {
        return false;
      }

      // Check that source and target are valid node indices
      if (edge.source < 0 || edge.source >= response.nodes.length ||
          edge.target < 0 || edge.target >= response.nodes.length) {
        return false;
      }

      // Prevent self-loops
      if (edge.source === edge.target) {
        return false;
      }
    }

    // Check for cycles (basic check - could be enhanced)
    if (this.hasCycles(response.edges, response.nodes.length)) {
      console.warn('Cycle detected in graph structure');
      // Don't fail on cycles, just log warning
      // Some use cases might want cycles
    }

    return true;
  }

  /**
   * Check if edges form a cycle
   */
  private hasCycles(edges: any[], nodeCount: number): boolean {
    const adjacency: number[][] = Array(nodeCount).fill(null).map(() => []);
    
    for (const edge of edges) {
      adjacency[edge.source].push(edge.target);
    }

    const visited = new Set<number>();
    const recursionStack = new Set<number>();

    const hasCycleDFS = (node: number): boolean => {
      visited.add(node);
      recursionStack.add(node);

      for (const neighbor of adjacency[node]) {
        if (!visited.has(neighbor)) {
          if (hasCycleDFS(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(node);
      return false;
    };

    for (let i = 0; i < nodeCount; i++) {
      if (!visited.has(i)) {
        if (hasCycleDFS(i)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Audit log for security events
   */
  logSecurityEvent(event: string, details: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      details,
      source: 'ParserSecurity'
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Security Audit]', logEntry);
    }

    // In production, this could send to a security monitoring service
    // For now, just store in memory or localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
      logs.push(logEntry);
      // Keep only last 100 entries
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      localStorage.setItem('securityLogs', JSON.stringify(logs));
    }
  }
}