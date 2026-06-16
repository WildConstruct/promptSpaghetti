/**
 * ConcatNode - A node that concatenates inputs with configurable separator
 * Supports trimming inputs and custom separators with inline editing
 */

import { ExecutionContext } from '../../types';
import { assemble, JoinStyle } from '../../assembly';
import {
  BaseInlineEditableNode,
  InlineEditableConfig
} from './BaseInlineEditableNode';

/**
 * Configuration value for Concat nodes
 */
export interface ConcatConfig {
  /** Separator to use between concatenated values */
  separator: string;
  /** Whether to trim whitespace from inputs before concatenating */
  trimInputs: boolean;
  /** Whether all expected inputs must be present before emitting output */
  requireAllInputs?: boolean;
  /**
   * Natural-language join strategy. When set to a prose style ('space', 'comma',
   * 'and', 'sentence'), inputs are assembled to read as natural language instead
   * of being glued with `separator`. Omitted/`'separator'` keeps legacy behavior.
   */
  joinStyle?: JoinStyle;
  /** Remove case-insensitive duplicate inputs before joining. */
  dedupe?: boolean;
}

/**
 * Concat node implementation with inline editing support
 */
export class ConcatNode extends BaseInlineEditableNode<ConcatConfig, string> {
  private inputs: string[] = [];

  constructor(
    id: string,
    initialConfig: ConcatConfig = {
      separator: ' ',
      trimInputs: true,
      requireAllInputs: false
    },
    config: InlineEditableConfig = {}
  ) {
    super(id, initialConfig, config);
  }

  /**
   * Set the inputs to concatenate
   * This would typically be called by the graph execution engine
   */
  setInputs(inputs: string[]): void {
    this.inputs = inputs;
  }

  /**
   * Execute the node - concatenate inputs with separator
   */
  async run(ctx: ExecutionContext): Promise<string> {
    const config = this.getCurrentValue();
    const requireAllInputs = config.requireAllInputs === true;

    if (
      requireAllInputs &&
      this.inputs.some(input => String(input ?? '').trim().length === 0)
    ) {
      return '';
    }

    // Natural-language assembly path (opt-in via joinStyle).
    if (config.joinStyle && config.joinStyle !== 'separator') {
      return assemble(this.inputs, {
        style: config.joinStyle,
        trim: config.trimInputs,
        dropEmpty: config.trimInputs,
        dedupe: config.dedupe
      });
    }

    // Legacy path: process inputs then glue with the separator.
    const processedInputs = this.inputs
      .map(input => {
        // Convert to string if needed
        const str = String(input || '');
        // Trim if configured
        return config.trimInputs ? str.trim() : str;
      })
      .filter(input => {
        // Filter out empty strings if trimming is enabled
        return !config.trimInputs || input.length > 0;
      });

    // Join with separator
    return processedInputs.join(config.separator);
  }

  /**
   * Clone the configuration value
   */
  protected cloneValue(value: ConcatConfig): ConcatConfig {
    return { ...value };
  }

  /**
   * Validate the configuration
   */
  protected async validateValue(
    value: ConcatConfig
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check if value is an object
    if (!value || typeof value !== 'object') {
      errors.push('Configuration must be an object');
      return { valid: false, errors };
    }

    // Validate separator
    if (typeof value.separator !== 'string') {
      errors.push('Separator must be a string');
    }

    // Validate trimInputs
    if (typeof value.trimInputs !== 'boolean') {
      errors.push('trimInputs must be a boolean');
    }

    if (
      value.requireAllInputs !== undefined &&
      typeof value.requireAllInputs !== 'boolean'
    ) {
      errors.push('requireAllInputs must be a boolean');
    }

    const allowedJoinStyles: JoinStyle[] = [
      'separator',
      'space',
      'comma',
      'and',
      'sentence'
    ];
    if (
      value.joinStyle !== undefined &&
      !allowedJoinStyles.includes(value.joinStyle)
    ) {
      errors.push('joinStyle must be one of: ' + allowedJoinStyles.join(', '));
    }

    if (value.dedupe !== undefined && typeof value.dedupe !== 'boolean') {
      errors.push('dedupe must be a boolean');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get the node type
   */
  getNodeType(): string {
    return 'Concat';
  }

  /**
   * Update separator
   */
  setSeparator(separator: string): void {
    const config = this.getCurrentValue();
    const updated = { ...config, separator };

    if (this.isEditing()) {
      this.updateEditBuffer(updated);
    } else {
      this.data.value = updated;
    }
  }

  /**
   * Get current separator
   */
  getSeparator(): string {
    return this.getCurrentValue().separator;
  }

  /**
   * Update trim inputs setting
   */
  setTrimInputs(trimInputs: boolean): void {
    const config = this.getCurrentValue();
    const updated = { ...config, trimInputs };

    if (this.isEditing()) {
      this.updateEditBuffer(updated);
    } else {
      this.data.value = updated;
    }
  }

  /**
   * Get trim inputs setting
   */
  getTrimInputs(): boolean {
    return this.getCurrentValue().trimInputs;
  }

  setRequireAllInputs(requireAllInputs: boolean): void {
    const config = this.getCurrentValue();
    const updated = { ...config, requireAllInputs };

    if (this.isEditing()) {
      this.updateEditBuffer(updated);
    } else {
      this.data.value = updated;
    }
  }

  getRequireAllInputs(): boolean {
    return this.getCurrentValue().requireAllInputs === true;
  }

  /**
   * Get common separator presets
   */
  static getSeparatorPresets(): Array<{ label: string; value: string }> {
    return [
      { label: 'Space', value: ' ' },
      { label: 'Comma', value: ', ' },
      { label: 'Newline', value: '\n' },
      { label: 'Tab', value: '\t' },
      { label: 'Pipe', value: ' | ' },
      { label: 'Dash', value: ' - ' },
      { label: 'None', value: '' }
    ];
  }

  /**
   * Preview the concatenation result with sample inputs
   */
  preview(sampleInputs: string[]): string {
    const config = this.getCurrentValue();

    if (config.joinStyle && config.joinStyle !== 'separator') {
      return assemble(sampleInputs, {
        style: config.joinStyle,
        trim: config.trimInputs,
        dropEmpty: config.trimInputs,
        dedupe: config.dedupe
      });
    }

    const processed = sampleInputs
      .map(input => {
        const str = String(input || '');
        return config.trimInputs ? str.trim() : str;
      })
      .filter(input => {
        return !config.trimInputs || input.length > 0;
      });

    return processed.join(config.separator);
  }

  /**
   * Get the current input count
   */
  getInputCount(): number {
    return this.inputs.length;
  }

  /**
   * Clear all inputs
   */
  clearInputs(): void {
    this.inputs = [];
  }

  /**
   * Enhanced serialization
   */
  serialize(): any {
    const base = super.serialize();
    return {
      ...base,
      metadata: {
        inputCount: this.inputs.length,
        separatorLength: this.data.value.separator.length,
        separatorDisplay: this.getSeparatorDisplay()
      }
    };
  }

  /**
   * Get a display-friendly representation of the separator
   */
  private getSeparatorDisplay(): string {
    const sep = this.data.value.separator;

    // Handle special characters
    switch (sep) {
      case ' ':
        return 'Space';
      case '\n':
        return 'Newline';
      case '\t':
        return 'Tab';
      case '':
        return 'None';
      default:
        // Show the separator with quotes if it contains whitespace
        return /^\s*$/.test(sep) ? `"${sep}"` : sep;
    }
  }
}
