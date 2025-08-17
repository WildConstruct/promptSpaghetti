/**
 * OutputNode - A special node that represents the final output of a graph
 * Typically locked and used to display execution results with inline preview
 */

import { ExecutionContext } from '../../types';
import {
  BaseInlineEditableNode,
  InlineEditableConfig
} from './BaseInlineEditableNode';

/**
 * Output node implementation with inline editing support
 * Usually locked and used for displaying results
 */
export class OutputNode extends BaseInlineEditableNode<string, string> {
  private inputs: string[] = [];

  constructor(
    id: string,
    initialValue: string = '',
    config: InlineEditableConfig = {
      isLocked: true,
      lockReason: 'Output nodes are read-only',
      previewMode: 'live'
    }
  ) {
    super(id, initialValue, config);
  }

  /**
   * Set the input value(s)
   * Can accept a single string or array of strings to concatenate
   */
  setInput(value: string | string[]): void {
    if (Array.isArray(value)) {
      this.inputs = value.map(v => String(v || ''));
      // Concatenate all inputs with spaces
      this.data.value = this.inputs.filter(v => v).join(' ');
    } else {
      this.inputs = [String(value || '')];
      this.data.value = this.inputs[0];
    }
    this.data.lastPreviewUpdate = new Date().toISOString();
  }

  /**
   * Execute the node - concatenates all inputs
   */
  async run(ctx: ExecutionContext): Promise<string> {
    // For output nodes, we concatenate all inputs
    return this.inputs.filter(v => v).join(' ');
  }

  /**
   * Clone the string value
   */
  protected cloneValue(value: string): string {
    return value;
  }

  /**
   * Validate the value (output nodes accept any string)
   */
  protected async validateValue(
    value: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    // Output nodes accept any string value
    return {
      valid: true,
      errors: []
    };
  }

  /**
   * Get the node type
   */
  getNodeType(): string {
    return 'Output';
  }

  /**
   * Override to prevent unlocking (output nodes should remain locked)
   */
  unlock(): void {
    // Do nothing - output nodes should remain locked
    console.warn('Output nodes cannot be unlocked');
  }

  /**
   * Get the current output value
   */
  getOutput(): string {
    return this.data.value;
  }

  /**
   * Clear the output
   */
  clearOutput(): void {
    this.inputs = [];
    this.data.value = '';
    this.data.lastPreviewUpdate = new Date().toISOString();
  }

  /**
   * Get execution statistics
   */
  getStats(): {
    isEmpty: boolean;
    length: number;
    wordCount: number;
    lineCount: number;
    lastUpdated?: string;
  } {
    const value = this.data.value;
    const isEmpty = value.trim().length === 0;

    return {
      isEmpty,
      length: value.length,
      wordCount: isEmpty ? 0 : value.trim().split(/\s+/).length,
      lineCount: isEmpty ? 0 : value.split('\n').length,
      lastUpdated: this.data.lastPreviewUpdate
    };
  }

  /**
   * Get a preview of the output
   */
  getPreview(maxLength: number = 100): string {
    const value = this.data.value;
    if (value.length <= maxLength) {
      return value;
    }
    return value.substring(0, maxLength - 3) + '...';
  }

  /**
   * Format output for display (with optional syntax highlighting hints)
   */
  getFormattedOutput(): {
    content: string;
    format?: 'plain' | 'json' | 'markdown' | 'code';
  } {
    const value = this.data.value;

    // Try to detect format
    let format: 'plain' | 'json' | 'markdown' | 'code' = 'plain';

    // Check for JSON
    if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
      try {
        JSON.parse(value);
        format = 'json';
      } catch {
        // Not valid JSON
      }
    }

    // Check for markdown indicators
    else if (
      value.includes('```') ||
      value.includes('##') ||
      value.includes('**')
    ) {
      format = 'markdown';
    }

    // Check for code indicators
    else if (
      value.includes('function') ||
      value.includes('const') ||
      value.includes('class')
    ) {
      format = 'code';
    }

    return {
      content: value,
      format
    };
  }

  /**
   * Enhanced serialization
   */
  serialize(): any {
    const base = super.serialize();
    const stats = this.getStats();

    return {
      ...base,
      metadata: {
        ...stats,
        format: this.getFormattedOutput().format
      }
    };
  }
}
