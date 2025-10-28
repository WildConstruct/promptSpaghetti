/**
 * Text Processor Node - Example Extension Implementation
 * Demonstrates advanced node development patterns
 */

import {
  AdvancedRuntimeNode,
  IOSpecBuilder,
  ValidationHelpers,
  ValidationResult,
  NodeState
} from '@prompt-spaghetti/core';

export interface TextProcessorOptions {
  operation: 'uppercase' | 'lowercase' | 'title' | 'reverse' | 'clean';
  preserveWhitespace: boolean;
  customPattern?: string;
  replaceWith?: string;
}

export interface TextProcessorState extends NodeState {
  processedCount: number;
  totalCharacters: number;
  operationHistory: string[];
}

type TextProcessorInputMap = Record<string, unknown>;

interface TextProcessorExecutionResult {
  result: string;
  metadata: Record<string, unknown>;
}

export class TextProcessorNode extends AdvancedRuntimeNode {
  protected getIOSpec() {
    return new IOSpecBuilder()
      .input('text', 'string')
      .required()
      .description('Text to process')
      .constraint(ValidationHelpers.lengthConstraint(1, 10000))
      .input('operation', 'string')
      .required()
      .description('Processing operation to perform')
      .constraint(
        ValidationHelpers.customConstraint(value =>
          ['uppercase', 'lowercase', 'title', 'reverse', 'clean'].includes(
            value
          )
        )
      )
      .input('options', 'object')
      .optional()
      .defaultValue({})
      .description('Additional processing options')
      .output('result', 'string')
      .description('Processed text')
      .output('metadata', 'object')
      .description('Processing metadata and statistics')
      .build();
  }

  protected initializeState(): TextProcessorState {
    return {
      processedCount: 0,
      totalCharacters: 0,
      operationHistory: []
    };
  }

  protected validateInputs(inputs: TextProcessorInputMap): ValidationResult {
    const errors: string[] = [];

    // Validate text input
    if (!ValidationHelpers.isString(inputs.text)) {
      errors.push('Text input must be a string');
    } else if (inputs.text.length === 0) {
      errors.push('Text input cannot be empty');
    } else if (inputs.text.length > 10000) {
      errors.push('Text input is too long (max 10,000 characters)');
    }

    // Validate operation
    const validOperations = [
      'uppercase',
      'lowercase',
      'title',
      'reverse',
      'clean'
    ];
    if (!validOperations.includes(inputs.operation as string)) {
      errors.push(
        `Invalid operation. Must be one of: ${validOperations.join(', ')}`
      );
    }

    // Validate options if provided
    if (inputs.options && !ValidationHelpers.isObject(inputs.options)) {
      errors.push('Options must be an object');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  protected async executeImplementation(
    inputs: TextProcessorInputMap
  ): Promise<TextProcessorExecutionResult> {
    const startTime = performance.now();

    const text = typeof inputs.text === 'string' ? inputs.text : '';
    const operation =
      (inputs.operation as TextProcessorOptions['operation']) ?? 'uppercase';
    const options = (inputs.options as Partial<TextProcessorOptions>) || {};

    let result: string;

    try {
      result = await this.processText(text, operation, options);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown processing error';
      throw new Error(`Text processing failed: ${message}`);
    }

    const currentState = this.getState() as TextProcessorState;
    this.updateState({
      processedCount: currentState.processedCount + 1,
      totalCharacters: currentState.totalCharacters + text.length,
      operationHistory: [...currentState.operationHistory.slice(-9), operation]
    });

    const processingTime = performance.now() - startTime;
    const metadata: Record<string, unknown> = {
      operation,
      originalLength: text.length,
      resultLength: result.length,
      processingTime: Number(processingTime.toFixed(2)),
      charactersDiff: result.length - text.length,
      totalProcessed: (this.getState() as TextProcessorState).processedCount,
      operationHistory: (this.getState() as TextProcessorState).operationHistory
    };

    return { result, metadata };
  }

  private async processText(
    text: string,
    operation: string,
    options: Partial<TextProcessorOptions>
  ): Promise<string> {
    switch (operation) {
      case 'uppercase':
        return this.processUppercase(text, options);

      case 'lowercase':
        return this.processLowercase(text, options);

      case 'title':
        return this.processTitleCase(text, options);

      case 'reverse':
        return this.processReverse(text, options);

      case 'clean':
        return this.processClean(text, options);

      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }

  private processUppercase(
    text: string,
    options: Partial<TextProcessorOptions>
  ): string {
    if (options.preserveWhitespace === false) {
      return text.replace(/\s+/g, ' ').trim().toUpperCase();
    }
    return text.toUpperCase();
  }

  private processLowercase(
    text: string,
    options: Partial<TextProcessorOptions>
  ): string {
    if (options.preserveWhitespace === false) {
      return text.replace(/\s+/g, ' ').trim().toLowerCase();
    }
    return text.toLowerCase();
  }

  private processTitleCase(
    text: string,
    options: Partial<TextProcessorOptions>
  ): string {
    let result = text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

    if (options.preserveWhitespace === false) {
      result = result.replace(/\s+/g, ' ').trim();
    }

    return result;
  }

  private processReverse(
    text: string,
    options: Partial<TextProcessorOptions>
  ): string {
    if (options.preserveWhitespace === false) {
      // Reverse words, not characters
      return text.trim().split(/\s+/).reverse().join(' ');
    }

    // Reverse characters
    return text.split('').reverse().join('');
  }

  private processClean(
    text: string,
    options: Partial<TextProcessorOptions>
  ): string {
    let result = text;

    // Remove extra whitespace
    result = result.replace(/\s+/g, ' ').trim();

    // Apply custom pattern if provided
    if (options.customPattern && options.replaceWith !== undefined) {
      try {
        const regex = new RegExp(options.customPattern, 'g');
        result = result.replace(regex, options.replaceWith);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown regex error';
        throw new Error(
          `Invalid regex pattern: ${options.customPattern}. ${message}`
        );
      }
    }

    // Remove common unwanted characters
    result = result.replace(/[^\w\s.,!?-]/g, '');

    return result;
  }

  // Override state change handler for logging
  protected onStateChange(
    newState: TextProcessorState,
    oldState: TextProcessorState
  ): void {
    if (newState.processedCount > oldState.processedCount) {
      console.log(
        `TextProcessor: Processed ${newState.processedCount} texts, ${newState.totalCharacters} total characters`
      );
    }
  }

  // Static method for node information
  static getNodeInfo() {
    return {
      type: 'TextProcessorNode',
      displayName: 'Text Processor',
      description:
        'Advanced text processing with multiple transformation options',
      category: 'Text Processing',
      icon: '📝',
      version: '1.0.0',
      author: 'PromptSpaghetti Team',
      documentation: 'https://docs.prompt-spaghetti.dev/nodes/text-processor',
      examples: [
        {
          name: 'Convert to uppercase',
          inputs: {
            text: 'hello world',
            operation: 'uppercase'
          },
          expectedOutput: {
            result: 'HELLO WORLD'
          }
        },
        {
          name: 'Title case with whitespace cleaning',
          inputs: {
            text: 'hello   world   example',
            operation: 'title',
            options: { preserveWhitespace: false }
          },
          expectedOutput: {
            result: 'Hello World Example'
          }
        }
      ],
      performance: {
        averageExecutionTime: '< 1ms',
        memoryUsage: 'Low',
        scalability: 'Excellent'
      }
    };
  }
}
