/**
 * TextBlockNode - A simple text content node with inline editing support
 * This node stores and outputs text content, supporting multiline text and length constraints
 */

import { ExecutionContext } from '../../types';
import { BaseInlineEditableNode, InlineEditableConfig } from './BaseInlineEditableNode';

/**
 * Configuration specific to TextBlock nodes
 */
export interface TextBlockConfig extends InlineEditableConfig {
  /** Maximum length of text content */
  maxLength?: number;
  /** Whether the text block supports multiline content */
  multiline?: boolean;
  /** Placeholder text when empty */
  placeholder?: string;
}

/**
 * TextBlock node implementation with inline editing support
 */
export class TextBlockNode extends BaseInlineEditableNode<string, string> {
  private config: TextBlockConfig;

  constructor(
    id: string,
    initialValue: string = '',
    config: TextBlockConfig = {}
  ) {
    super(id, initialValue, config);
    this.config = config;
  }

  /**
   * Execute the node - simply returns the text content
   */
  async run(ctx: ExecutionContext): Promise<string> {
    // For text blocks, we simply return the current value
    // If in edit mode with auto preview, return the edit buffer
    const value = this.getCurrentValue();
    
    // Process any variable substitutions if needed
    // This allows for {{variable}} syntax in text blocks
    return this.processVariables(value, ctx);
  }

  /**
   * Process variable substitutions in the text
   */
  private processVariables(text: string, ctx: ExecutionContext): string {
    // Simple variable substitution using {{variableName}} syntax
    return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      const value = ctx.variables[varName];
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Clone the string value
   */
  protected cloneValue(value: string): string {
    return value;
  }

  /**
   * Validate the text value
   */
  protected async validateValue(value: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check if value is a string
    if (typeof value !== 'string') {
      errors.push('Value must be a string');
      return { valid: false, errors };
    }

    // Check max length if configured
    if (this.config.maxLength && value.length > this.config.maxLength) {
      errors.push(`Text exceeds maximum length of ${this.config.maxLength} characters`);
    }

    // Check multiline constraint
    if (!this.config.multiline && value.includes('\n')) {
      errors.push('Multiline text is not allowed');
    }

    // Check for dangerous content (basic XSS prevention)
    if (this.containsDangerousContent(value)) {
      errors.push('Text contains potentially dangerous content');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check for dangerous content patterns
   */
  private containsDangerousContent(text: string): boolean {
    // Basic patterns that might indicate script injection attempts
    const dangerousPatterns = [
      /<script[^>]*>/i,
      /<\/script>/i,
      /javascript:/i,
      /on\w+\s*=/i, // Event handlers like onclick=
      /<iframe/i,
      /<object/i,
      /<embed/i,
    ];

    return dangerousPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Get the node type
   */
  getNodeType(): string {
    return 'TextBlock';
  }

  /**
   * Get text-specific configuration
   */
  getTextConfig(): TextBlockConfig {
    return { ...this.config };
  }

  /**
   * Set placeholder text
   */
  setPlaceholder(placeholder: string): void {
    this.config.placeholder = placeholder;
  }

  /**
   * Get placeholder text
   */
  getPlaceholder(): string | undefined {
    return this.config.placeholder;
  }

  /**
   * Enable/disable multiline support
   */
  setMultiline(multiline: boolean): void {
    this.config.multiline = multiline;
    // If disabling multiline, validate current content
    if (!multiline && this.data.value.includes('\n')) {
      this.data.isValid = false;
      this.data.validationMessage = 'Content contains newlines but multiline is disabled';
    }
  }

  /**
   * Set maximum length
   */
  setMaxLength(maxLength: number | undefined): void {
    this.config.maxLength = maxLength;
    // Validate current content against new constraint
    if (maxLength && this.data.value.length > maxLength) {
      this.data.isValid = false;
      this.data.validationMessage = `Content exceeds new maximum length of ${maxLength}`;
    }
  }

  /**
   * Get a preview of the text (useful for UI display)
   */
  getPreview(maxLength: number = 50): string {
    const value = this.getCurrentValue();
    if (value.length <= maxLength) {
      return value;
    }
    return value.substring(0, maxLength - 3) + '...';
  }

  /**
   * Get word count
   */
  getWordCount(): number {
    const value = this.getCurrentValue();
    return value.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Get character count
   */
  getCharacterCount(): number {
    return this.getCurrentValue().length;
  }

  /**
   * Enhanced serialization with text-specific config
   */
  serialize(): any {
    const base = super.serialize();
    return {
      ...base,
      config: this.config,
      metadata: {
        wordCount: this.getWordCount(),
        characterCount: this.getCharacterCount(),
      }
    };
  }
}