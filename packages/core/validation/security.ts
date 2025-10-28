/**
 * Security validation utilities for graph schemas
 * Provides Zod schema validators for secure input validation
 */

import { z } from 'zod';

export class SecurityValidation {
  /**
   * Validates variable names to prevent prototype pollution and injection attacks
   * - Only alphanumeric characters and underscores allowed
   * - Cannot start with number
   * - Maximum 64 characters
   * - Blacklists dangerous property names
   */
  static variableName() {
    return z.string().refine(
      name => {
        // Basic format validation
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
          return false;
        }

        // Length limit
        if (name.length > 64) {
          return false;
        }

        // Dangerous property names
        const dangerous = [
          '__proto__',
          'constructor',
          'prototype',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'toLocaleString',
          'toString',
          'valueOf'
        ];

        return (
          !dangerous.includes(name.toLowerCase()) &&
          !name.includes('__proto__') &&
          !name.includes('constructor')
        );
      },
      {
        message:
          'Variable name must be alphanumeric with underscores, max 64 chars, and not use dangerous property names'
      }
    );
  }

  /**
   * Validates static variableName (for direct use)
   */
  static validateVariableName(name: string): boolean {
    try {
      SecurityValidation.variableName().parse(name);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates property keys for safe object access
   */
  static safePropertyKey() {
    return z.string().refine(
      key => {
        // Similar to variable name but allows dots for nested access
        if (!/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(key)) {
          return false;
        }

        if (key.length > 128) {
          return false;
        }

        // Prevent dangerous property access
        return (
          !key.includes('__proto__') &&
          !key.includes('constructor') &&
          !key.includes('prototype')
        );
      },
      {
        message: 'Property key must be safe and not access dangerous properties'
      }
    );
  }

  /**
   * Validates safe string values (prevents script injection)
   */
  static safeString() {
    return z.string().refine(
      str => {
        // Prevent common script injection patterns
        const dangerousPatterns = [
          /<script/i,
          /javascript:/i,
          /vbscript:/i,
          /on\w+\s*=/i, // event handlers
          /eval\s*\(/i,
          /Function\s*\(/i,
          /setTimeout\s*\(/i,
          /setInterval\s*\(/i
        ];

        return !dangerousPatterns.some(pattern => pattern.test(str));
      },
      {
        message: 'String contains potentially dangerous content'
      }
    );
  }

  /**
   * Validates safe expressions for conditional nodes
   */
  static safeExpression() {
    return z.string().refine(
      expr => {
        // Basic length limit
        if (expr.length > 1000) {
          return false;
        }

        // Dangerous patterns in expressions
        const dangerousPatterns = [
          /eval\s*\(/i,
          /Function\s*\(/i,
          /constructor/i,
          /__proto__/i,
          /prototype/i,
          /import\s*\(/i,
          /require\s*\(/i,
          /process\s*\./i,
          /global\s*\./i,
          /window\s*\./i,
          /document\s*\./i,
          /console\s*\./i,
          /setTimeout/i,
          /setInterval/i,
          /fetch\s*\(/i,
          /XMLHttpRequest/i
        ];

        return !dangerousPatterns.some(pattern => pattern.test(expr));
      },
      {
        message: 'Expression contains potentially dangerous code patterns'
      }
    );
  }

  /**
   * Validates safe values (prevents object pollution)
   */
  static safeValue() {
    return z
      .union([
        z.string(),
        z.number(),
        z.boolean(),
        z.null(),
        z.array(z.union([z.string(), z.number(), z.boolean()])),
        z.record(z.union([z.string(), z.number(), z.boolean()]))
      ])
      .refine(
        value => {
          // Additional safety check for objects/arrays
          if (typeof value === 'object' && value !== null) {
            const jsonStr = JSON.stringify(value);

            // Check for dangerous property names in serialized form
            return (
              !jsonStr.includes('__proto__') &&
              !jsonStr.includes('constructor') &&
              !jsonStr.includes('prototype')
            );
          }

          return true;
        },
        {
          message: 'Value contains dangerous property references'
        }
      );
  }

  /**
   * Validates content length limits
   */
  static limitedString(maxLength: number = 10000) {
    return z
      .string()
      .max(maxLength, `String must be less than ${maxLength} characters`);
  }

  /**
   * Validates positive numbers
   */
  static positiveNumber() {
    return z.number().positive('Number must be positive');
  }

  /**
   * Validates number within range
   */
  static rangeNumber(min: number, max: number) {
    return z.number().min(min).max(max);
  }
}
