// Privacy Protection and PII Detection

export class PrivacyFilter {
  private patterns: Map<string, RegExp> = new Map([
    // Social Security Numbers
    ['ssn', /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g],

    // Email addresses
    ['email', /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g],

    // Phone numbers (US format)
    ['phone', /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g],

    // Credit card numbers (basic pattern)
    ['creditCard', /\b(?:\d{4}[-\s]?){3}\d{4}\b/g],

    // IP addresses
    ['ipAddress', /\b(?:\d{1,3}\.){3}\d{1,3}\b/g],

    // Names (common patterns - this is imperfect)
    [
      'name',
      /\b(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/g
    ],

    // Addresses (street addresses)
    [
      'address',
      /\b\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Ln|Lane|Dr|Drive|Ct|Court)\b/gi
    ],

    // Date of birth (various formats)
    [
      'dob',
      /\b(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2})\b/g
    ],

    // Bank account numbers
    ['bankAccount', /\b[0-9]{8,17}\b/g],

    // Passport numbers
    ['passport', /\b[A-Z]{1,2}[0-9]{6,9}\b/g]
  ]);

  private blocklist: Set<string> = new Set([
    // Inappropriate content keywords
    'offensive_term_1',
    'offensive_term_2'
    // Add more as needed
  ]);

  detectPII(text: string): {
    hasPII: boolean;
    detectedTypes: string[];
    sanitized: string;
  } {
    let hasPII = false;
    const detectedTypes: string[] = [];
    let sanitized = text;

    for (const [type, pattern] of this.patterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        hasPII = true;
        detectedTypes.push(type);

        // Replace with placeholder
        sanitized = sanitized.replace(
          pattern,
          `[REDACTED_${type.toUpperCase()}]`
        );
      }
    }

    return {
      hasPII,
      detectedTypes,
      sanitized
    };
  }

  sanitizePrompt(prompt: string): {
    sanitized: string;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let sanitized = prompt;

    // Check for PII
    const piiCheck = this.detectPII(prompt);
    if (piiCheck.hasPII) {
      warnings.push(`PII detected: ${piiCheck.detectedTypes.join(', ')}`);
      sanitized = piiCheck.sanitized;
    }

    // Check for inappropriate content
    const lowerText = sanitized.toLowerCase();
    for (const term of this.blocklist) {
      if (lowerText.includes(term)) {
        warnings.push('Inappropriate content detected');
        sanitized = sanitized.replace(new RegExp(term, 'gi'), '[REDACTED]');
      }
    }

    // Remove potential injection attempts
    sanitized = this.preventInjection(sanitized);

    return {
      sanitized,
      warnings
    };
  }

  private preventInjection(text: string): string {
    // Remove potential prompt injection patterns
    let cleaned = text;

    // Remove instruction-like patterns
    cleaned = cleaned.replace(
      /\b(ignore|forget|disregard)\s+(previous|above|all)\s+(instructions?|prompts?)/gi,
      '[FILTERED]'
    );

    // Remove role-switching attempts
    cleaned = cleaned.replace(
      /\b(you are now|act as|pretend to be|roleplay as)/gi,
      '[FILTERED]'
    );

    // Remove system prompt attempts
    cleaned = cleaned.replace(
      /\[system\]|\[assistant\]|\[user\]/gi,
      '[FILTERED]'
    );

    return cleaned;
  }

  // Validate that response doesn't contain hallucinated PII
  validateResponse(response: string): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    let isValid = true;

    // Check if response contains PII that wasn't in the input
    const piiCheck = this.detectPII(response);
    if (piiCheck.hasPII) {
      issues.push(
        `Response contains PII: ${piiCheck.detectedTypes.join(', ')}`
      );
      isValid = false;
    }

    // Check for common hallucination patterns
    const hallucinations = this.detectHallucinations(response);
    if (hallucinations.length > 0) {
      issues.push(...hallucinations);
      isValid = false;
    }

    return {
      isValid,
      issues
    };
  }

  private detectHallucinations(text: string): string[] {
    const issues: string[] = [];

    // Check for made-up URLs
    const urlPattern = /https?:\/\/[^\s]+/g;
    const urls = text.match(urlPattern);
    if (urls) {
      // Check if URLs look suspicious (e.g., made-up domains)
      for (const url of urls) {
        if (
          url.includes('example.') ||
          url.includes('fake.') ||
          url.includes('test.')
        ) {
          issues.push(`Potentially hallucinated URL: ${url}`);
        }
      }
    }

    // Check for specific dates in the future
    const futureYear = new Date().getFullYear() + 1;
    const futurePattern = new RegExp(
      `\\b(${futureYear}|${futureYear + 1}|${futureYear + 2})\\b`,
      'g'
    );
    if (futurePattern.test(text)) {
      issues.push('Response contains future dates');
    }

    // Check for overly specific numbers that might be made up
    const suspiciousNumbers = /\b\d{10,}\b/g;
    if (suspiciousNumbers.test(text)) {
      issues.push('Response contains suspiciously specific numbers');
    }

    return issues;
  }

  // Add custom PII pattern
  addPIIPattern(name: string, pattern: RegExp): void {
    this.patterns.set(name, pattern);
  }

  // Add term to blocklist
  addBlocklistTerm(term: string): void {
    this.blocklist.add(term.toLowerCase());
  }

  // Get statistics about filtering
  getStats(): {
    piiPatternsCount: number;
    blocklistSize: number;
  } {
    return {
      piiPatternsCount: this.patterns.size,
      blocklistSize: this.blocklist.size
    };
  }
}
