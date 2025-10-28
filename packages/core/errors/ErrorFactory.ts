/**
 * Error Factory for creating standardized error types
 * Provides consistent error creation across the application
 */

export class ErrorFactory {
  /**
   * Create a node execution error
   */
  static createNodeExecutionError(message?: string): Error {
    return new Error(message || 'Node execution failed');
  }

  /**
   * Create a validation error
   */
  static createValidationError(message?: string): Error {
    return new Error(message || 'Validation failed');
  }

  /**
   * Create a configuration error
   */
  static createConfigurationError(message?: string): Error {
    return new Error(message || 'Configuration error');
  }

  /**
   * Create a network error
   */
  static createNetworkError(message?: string): Error {
    return new Error(message || 'Network error occurred');
  }

  /**
   * Create a parsing error
   */
  static createParsingError(message?: string): Error {
    return new Error(message || 'Parsing error occurred');
  }
}
