/**
 * Comprehensive example demonstrating the prompt targeting system
 */
export declare class PromptTargetingExample {
  private engine;
  private validator;
  private logger;
  private cache;
  private metrics;
  constructor();
  private setupAdaptors;
  /**
   * Example 1: Simple text-to-text translation
   */
  simpleTextTranslation(): Promise<void>;
  /**
   * Example 2: Complex graph with multiple nodes
   */
  complexGraphTranslation(): Promise<void>;
  /**
   * Example 3: Validation and quality assessment
   */
  validationExample(): Promise<void>;
  /**
   * Example 4: Performance and caching demonstration
   */
  performanceExample(): Promise<void>;
  /**
   * Run all examples
   */
  runAllExamples(): Promise<void>;
}
export declare function createPromptTargetingExample(): PromptTargetingExample;
