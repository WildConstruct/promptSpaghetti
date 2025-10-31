/**
 * WeightedChoiceNode - A node that randomly selects from weighted options with inline editing
 * Supports adding/removing options, adjusting weights, and visual weight distribution
 */

import { ExecutionContext } from '../../types';
import {
  BaseInlineEditableNode,
  InlineEditableConfig
} from './BaseInlineEditableNode';
import seedrandom from 'seedrandom';

/**
 * Individual choice option with weight
 */
export interface WeightedOption {
  /** Unique identifier for the option */
  id: string;
  /** The text content of the option */
  text: string;
  /** The weight of this option (relative to others) */
  weight: number;
  /** Optional color for UI representation */
  color?: string;
}

/**
 * Value type for WeightedChoice nodes
 */
export type WeightedChoiceValue = WeightedOption[];

/**
 * Configuration specific to WeightedChoice nodes
 */
export interface WeightedChoiceConfig extends InlineEditableConfig {
  /** Whether to normalize weights to percentages */
  normalizeWeights?: boolean;
  /** Whether to show percentages in UI */
  showPercentages?: boolean;
  /** Whether users can add/remove options */
  allowAddRemove?: boolean;
  /** Minimum number of options required */
  minOptions?: number;
  /** Maximum number of options allowed */
  maxOptions?: number;
}

/**
 * WeightedChoice node implementation with inline editing support
 */
export class WeightedChoiceNode extends BaseInlineEditableNode<
  WeightedChoiceValue,
  string
> {
  private config: WeightedChoiceConfig;

  constructor(
    id: string,
    initialValue: WeightedChoiceValue = [],
    config: WeightedChoiceConfig = {}
  ) {
    // Allow single options, only add defaults if completely empty
    const defaultValue =
      initialValue.length > 0
        ? initialValue
        : [
            { id: 'option-1', text: 'Option 1', weight: 50 },
            { id: 'option-2', text: 'Option 2', weight: 50 }
          ];

    super(id, defaultValue, config);
    this.config = {
      normalizeWeights: true,
      showPercentages: true,
      allowAddRemove: true,
      minOptions: 1, // Allow single options
      ...config
    };
  }

  /**
   * Execute the node - select a weighted random option
   */
  async run(ctx: ExecutionContext): Promise<string> {
    const options = this.getCurrentValue();

    if (options.length === 0) {
      return '';
    }

    // If there's only one option, return it directly
    if (options.length === 1) {
      return options[0].text;
    }

    // Calculate total weight
    const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);

    if (totalWeight === 0) {
      // If all weights are 0, return empty or first option
      return options[0]?.text || '';
    }

    // Create seeded random generator
    const seed = typeof ctx.seed === 'string' ? ctx.seed : String(ctx.seed);
    const rng = seedrandom(`${seed}-${this.id}`);
    const random = rng() * totalWeight;

    // Select option based on weight
    let cumulative = 0;
    for (const option of options) {
      cumulative += option.weight;
      if (random < cumulative) {
        return option.text;
      }
    }

    // Fallback (should not reach here)
    return options[options.length - 1].text;
  }

  /**
   * Clone the weighted options array
   */
  protected cloneValue(value: WeightedChoiceValue): WeightedChoiceValue {
    return value.map(option => ({ ...option }));
  }

  /**
   * Validate the weighted options
   */
  protected async validateValue(
    value: WeightedChoiceValue
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check if value is an array
    if (!Array.isArray(value)) {
      errors.push('Value must be an array of options');
      return { valid: false, errors };
    }

    // Check minimum options
    if (this.config.minOptions && value.length < this.config.minOptions) {
      errors.push(`At least ${this.config.minOptions} options are required`);
    }

    // Check maximum options
    if (this.config.maxOptions && value.length > this.config.maxOptions) {
      errors.push(`Maximum ${this.config.maxOptions} options allowed`);
    }

    // Validate each option
    const ids = new Set<string>();
    for (let i = 0; i < value.length; i++) {
      const option = value[i];

      // Check structure
      if (!option || typeof option !== 'object') {
        errors.push(`Option ${i + 1} is invalid`);
        continue;
      }

      // Check required fields
      if (!option.id || typeof option.id !== 'string') {
        errors.push(`Option ${i + 1} missing valid id`);
      } else if (ids.has(option.id)) {
        errors.push(`Duplicate option id: ${option.id}`);
      } else {
        ids.add(option.id);
      }

      if (typeof option.text !== 'string') {
        errors.push(`Option ${i + 1} missing valid text`);
      }

      if (typeof option.weight !== 'number' || option.weight < 0) {
        errors.push(`Option ${i + 1} has invalid weight`);
      }
    }

    // Check that at least one option has non-zero weight
    const hasNonZeroWeight = value.some(option => option.weight > 0);
    if (!hasNonZeroWeight && value.length > 0) {
      errors.push('At least one option must have a non-zero weight');
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
    return 'WeightedChoice';
  }

  /**
   * Add a new option
   */
  addOption(text: string = 'New Option', weight: number = 50): string {
    if (!this.config.allowAddRemove) {
      throw new Error('Adding options is not allowed');
    }

    const options = this.getCurrentValue();
    if (this.config.maxOptions && options.length >= this.config.maxOptions) {
      throw new Error(`Maximum ${this.config.maxOptions} options allowed`);
    }

    const newId = `option-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newOption: WeightedOption = {
      id: newId,
      text,
      weight
    };

    if (this.isEditing()) {
      this.updateEditBuffer([...options, newOption]);
    } else {
      this.data.value = [...this.data.value, newOption];
    }

    return newId;
  }

  /**
   * Remove an option by ID
   */
  removeOption(id: string): void {
    if (!this.config.allowAddRemove) {
      throw new Error('Removing options is not allowed');
    }

    const options = this.getCurrentValue();
    const filtered = options.filter(option => option.id !== id);

    if (this.config.minOptions && filtered.length < this.config.minOptions) {
      throw new Error(`Minimum ${this.config.minOptions} options required`);
    }

    if (this.isEditing()) {
      this.updateEditBuffer(filtered);
    } else {
      this.data.value = filtered;
    }
  }

  /**
   * Update an option's text
   */
  updateOptionText(id: string, text: string): void {
    const options = this.getCurrentValue();
    const updated = options.map(option =>
      option.id === id ? { ...option, text } : option
    );

    if (this.isEditing()) {
      this.updateEditBuffer(updated);
    } else {
      this.data.value = updated;
    }
  }

  /**
   * Update an option's weight
   */
  updateOptionWeight(id: string, weight: number): void {
    if (weight < 0) {
      throw new Error('Weight must be non-negative');
    }

    const options = this.getCurrentValue();
    const updated = options.map(option =>
      option.id === id ? { ...option, weight } : option
    );

    if (this.isEditing()) {
      this.updateEditBuffer(updated);
    } else {
      this.data.value = updated;
    }
  }

  /**
   * Update an option's color
   */
  updateOptionColor(id: string, color: string | undefined): void {
    const options = this.getCurrentValue();
    const updated = options.map(option =>
      option.id === id ? { ...option, color } : option
    );

    if (this.isEditing()) {
      this.updateEditBuffer(updated);
    } else {
      this.data.value = updated;
    }
  }

  /**
   * Get weight percentages for all options
   */
  getWeightPercentages(): Map<string, number> {
    const options = this.getCurrentValue();
    const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
    const percentages = new Map<string, number>();

    if (totalWeight === 0) {
      options.forEach(option => percentages.set(option.id, 0));
    } else {
      options.forEach(option => {
        const percentage = (option.weight / totalWeight) * 100;
        percentages.set(option.id, Math.round(percentage * 10) / 10); // Round to 1 decimal
      });
    }

    return percentages;
  }

  /**
   * Normalize weights to sum to 100
   */
  normalizeWeights(): void {
    const options = this.getCurrentValue();
    const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);

    if (totalWeight === 0) {
      // Distribute evenly
      const evenWeight = 100 / options.length;
      const normalized = options.map(option => ({
        ...option,
        weight: evenWeight
      }));

      if (this.isEditing()) {
        this.updateEditBuffer(normalized);
      } else {
        this.data.value = normalized;
      }
    } else {
      // Scale to 100
      const normalized = options.map(option => ({
        ...option,
        weight: (option.weight / totalWeight) * 100
      }));

      if (this.isEditing()) {
        this.updateEditBuffer(normalized);
      } else {
        this.data.value = normalized;
      }
    }
  }

  /**
   * Get configuration
   */
  getWeightedConfig(): WeightedChoiceConfig {
    return { ...this.config };
  }

  /**
   * Enhanced serialization with weighted choice metadata
   */
  serialize(): any {
    const base = super.serialize();
    return {
      ...base,
      config: this.config,
      metadata: {
        optionCount: this.data.value.length,
        totalWeight: this.data.value.reduce((sum, opt) => sum + opt.weight, 0),
        percentages: Object.fromEntries(this.getWeightPercentages())
      }
    };
  }
}
