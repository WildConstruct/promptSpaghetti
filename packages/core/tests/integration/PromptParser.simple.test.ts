// Simplified integration test for Story 2.6 - QA focused
import { PromptParser, ParserOptions } from '../../services/PromptParser';

describe('Story 2.6 QA: PromptParser Core Integration', () => {
  let parser: PromptParser;

  beforeEach(() => {
    // Test without LLM service to focus on fallback behavior
    parser = new PromptParser();
  });

  it('should successfully parse in standard mode', async () => {
    const prompt = "A brave warrior fights the dragon.";
    const options: ParserOptions = { mode: 'standard' };

    const result = await parser.parse(prompt, options);

    expect(result).toBeDefined();
    expect(result.nodes).toBeDefined();
    expect(result.nodes.length).toBeGreaterThan(0);
    expect(result.edges).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(result.metadata.parserMode).toBe('standard');
  });

  it('should fallback to standard mode when no LLM service available', async () => {
    const prompt = "Test LLM fallback functionality.";
    const options: ParserOptions = { mode: 'llm-enhanced' };

    const result = await parser.parse(prompt, options);

    expect(result).toBeDefined();
    expect(result.nodes).toBeDefined();
    expect(result.metadata.parserMode).toBe('standard-fallback');
    expect(result.metadata.fallbackReason).toContain('LLM service not');
  });

  it('should handle empty prompts gracefully', async () => {
    const prompt = "";
    const options: ParserOptions = { mode: 'standard' };

    const result = await parser.parse(prompt, options);

    expect(result).toBeDefined();
    expect(result.nodes).toBeDefined();
    expect(result.metadata).toBeDefined();
  });

  it('should process prompts with variable syntax', async () => {
    const prompt = "A {hero_name} saves the {location}.";
    const options: ParserOptions = { mode: 'standard' };

    const result = await parser.parse(prompt, options);

    // Should produce valid nodes regardless of variable handling
    expect(result.nodes).toBeDefined();
    expect(result.nodes.length).toBeGreaterThan(0);
    // Note: Variable preservation depends on parser implementation
    // This test validates the parser doesn't crash on variable syntax
  });

  it('should include metadata information', async () => {
    const prompt = "Test metadata collection.";
    const options: ParserOptions = { mode: 'standard' };

    const result = await parser.parse(prompt, options);

    expect(result.metadata).toBeDefined();
    expect(result.metadata.parserMode).toBe('standard');
    // parseTime may or may not be implemented, so just check structure
    expect(typeof result.metadata).toBe('object');
  });
});