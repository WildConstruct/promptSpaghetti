/**
 * PromptParser utility – behaviour aligned with runtime implementation
 */

import {
  PromptParser,
  type ParsedPromptResult
} from '../../utils/promptParser';

describe('PromptParser.parse', () => {
  it('splits text and choice segments while trimming whitespace', () => {
    const prompt = 'A {brave|cunning} hero';
    const result: ParsedPromptResult = PromptParser.parse(prompt);

    expect(result.nodeCount).toBe(3);
    expect(result.choiceCount).toBe(1);
    expect(result.textCount).toBe(2);

    expect(result.segments).toEqual([
      { type: 'text', content: 'A', id: 'text-0' },
      {
        type: 'choice',
        content: 'brave|cunning',
        options: ['brave', 'cunning'],
        id: 'choice-1'
      },
      { type: 'text', content: 'hero', id: 'text-2' }
    ]);
  });

  it('handles multiple adjacent choices and preserves unique IDs', () => {
    const prompt =
      'A {brave|cunning} {knight|wizard} enters the {forest|castle}';
    const result: ParsedPromptResult = PromptParser.parse(prompt);

    expect(result.choiceCount).toBe(3);
    expect(result.textCount).toBe(2);
    expect(result.nodeCount).toBe(5);

    const ids = result.segments.map(segment => segment.id);
    expect(ids).toEqual([
      'text-0',
      'choice-1',
      'choice-2',
      'text-3',
      'choice-4'
    ]);
    expect(new Set(ids).size).toBe(result.segments.length);
  });

  it('trims choice options and filters empty entries', () => {
    const prompt = 'A { brave | cunning |  } knight';
    const result: ParsedPromptResult = PromptParser.parse(prompt);
    const choiceSegment = result.segments.find(
      segment => segment.type === 'choice'
    );

    expect(choiceSegment).toBeDefined();
    expect(choiceSegment?.options).toEqual(['brave', 'cunning']);
  });

  it('gracefully handles non-string input', () => {
    expect(PromptParser.parse(undefined as any).segments).toHaveLength(0);
    expect(PromptParser.parse(null as any).segments).toHaveLength(0);
    expect(PromptParser.parse(42 as any).segments).toHaveLength(0);
  });

  it('parses large prompts efficiently', () => {
    const prompt =
      'Create a {mysterious|enigmatic|cryptic} {puzzle|enigma|riddle} that ' +
      '{challenges|tests|exercises} the {mind|intellect|brain} of ' +
      '{adventurers|explorers|seekers} who {dare|venture|attempt} to ' +
      '{solve|decode|unravel} its {secrets|mysteries|hidden truths}.';

    const result: ParsedPromptResult = PromptParser.parse(prompt);

    expect(result.choiceCount).toBe(8);
    expect(result.textCount).toBeGreaterThan(0);
    expect(result.nodeCount).toBe(result.segments.length);
  });
});

describe('PromptParser.validate', () => {
  it('accepts well-formed prompts', () => {
    const prompt = 'A {brave|cunning} knight';
    expect(PromptParser.validate(prompt).isValid).toBe(true);
  });

  it('rejects prompts with unmatched braces or empty options', () => {
    expect(PromptParser.validate('A {brave|cunning knight').isValid).toBe(
      false
    );
    expect(PromptParser.validate('A {brave|} knight').isValid).toBe(false);
  });

  it('rejects empty or whitespace-only prompts', () => {
    expect(PromptParser.validate('').isValid).toBe(false);
    expect(PromptParser.validate('   ').isValid).toBe(false);
  });

  it('rejects overly long prompts', () => {
    const longPrompt = 'a'.repeat(10_001);
    expect(PromptParser.validate(longPrompt).isValid).toBe(false);
  });
});
