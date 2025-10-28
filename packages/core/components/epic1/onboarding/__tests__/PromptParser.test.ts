/**
 * Tests for PromptParser utility
 * Tests prompt parsing with various syntax patterns
 */

import { jest } from '@jest/globals';
import {
  PromptParser,
  ParsedPromptResult,
  ParsedPromptSegment
} from '../utils/promptParser';

describe('PromptParser', () => {
  describe('parse', () => {
    it('should parse simple text without choices', () => {
      const prompt = 'A simple prompt without choices';
      const result: ParsedPromptResult = PromptParser.parse(prompt);

      expect(result.segments).toHaveLength(1);
      expect(result.segments[0]).toEqual({
        type: 'text',
        content: 'A simple prompt without choices',
        id: 'text-0'
      });
      expect(result.nodeCount).toBe(1);
      expect(result.choiceCount).toBe(0);
      expect(result.textCount).toBe(1);
    });

    it('should parse single choice with two options', () => {
      const prompt = 'A {brave|cunning} knight';
      const result: ParsedPromptResult = PromptParser.parse(prompt);

      expect(result.segments).toHaveLength(3);
      expect(result.segments).toEqual([
        {
          type: 'text',
          content: 'A ',
          id: 'text-0'
        },
        {
          type: 'choice',
          content: 'brave|cunning',
          options: ['brave', 'cunning'],
          id: 'choice-0'
        },
        {
          type: 'text',
          content: ' knight',
          id: 'text-1'
        }
      ]);
      expect(result.nodeCount).toBe(3);
      expect(result.choiceCount).toBe(1);
      expect(result.textCount).toBe(2);
    });

    it('should parse multiple choices in one prompt', () => {
      const prompt =
        'A {brave|cunning} {knight|wizard} enters the {forest|castle}';
      const result: ParsedPromptResult = PromptParser.parse(prompt);

      expect(result.segments).toHaveLength(6);
      expect(result.choiceCount).toBe(3);
      expect(result.textCount).toBe(3);

      // Check specific segments
      expect(result.segments[1]).toEqual({
        type: 'choice',
        content: 'brave|cunning',
        options: ['brave', 'cunning'],
        id: 'choice-0'
      });

      expect(result.segments[3]).toEqual({
        type: 'choice',
        content: 'knight|wizard',
        options: ['knight', 'wizard'],
        id: 'choice-1'
      });

      expect(result.segments[5]).toEqual({
        type: 'choice',
        content: 'forest|castle',
        options: ['forest', 'castle'],
        id: 'choice-2'
      });
    });

    it('should handle empty prompt', () => {
      const result: ParsedPromptResult = PromptParser.parse('');

      expect(result.segments).toHaveLength(0);
      expect(result.nodeCount).toBe(0);
      expect(result.choiceCount).toBe(0);
      expect(result.textCount).toBe(0);
    });

    it('should handle whitespace-only prompt', () => {
      const result: ParsedPromptResult = PromptParser.parse('   \n\t  ');

      expect(result.segments).toHaveLength(0);
      expect(result.nodeCount).toBe(0);
    });

    it('should handle prompt with only whitespace between choices', () => {
      const prompt = '{option1|option2}{option3|option4}';
      const result: ParsedPromptResult = PromptParser.parse(prompt);

      expect(result.segments).toHaveLength(2);
      expect(result.choiceCount).toBe(2);
      expect(result.textCount).toBe(0);
    });

    it('should trim whitespace from options', () => {
      const prompt = 'A { brave | cunning } knight';
      const result: ParsedPromptResult = PromptParser.parse(prompt);

      expect(result.segments[1]).toEqual({
        type: 'choice',
        content: ' brave | cunning ',
        options: ['brave', 'cunning'],
        id: 'choice-0'
      });
    });

    it('should handle single option in choice', () => {
      const prompt = 'A {single} choice';
      const result: ParsedPromptResult = PromptParser.parse(prompt);

      expect(result.segments[1]).toEqual({
        type: 'choice',
        content: 'single',
        options: ['single'],
        id: 'choice-0'
      });
    });

    it('should handle empty options gracefully', () => {
      const prompt = 'A {|empty|} choice';
      const result: ParsedPromptResult = PromptParser.parse(prompt);

      expect(result.segments[1]).toEqual({
        type: 'choice',
        content: '|empty|',
        options: ['', 'empty'],
        id: 'choice-0'
      });
    });

    it('should handle complex real-world prompt', () => {
      const prompt =
        'Create a {mysterious|enigmatic|cryptic} {puzzle|enigma|riddle} that {challenges|tests|exercises} the {mind|intellect|brain} of {adventurers|explorers|seekers} who {dare|venture|attempt} to {solve|decode|unravel} its {secrets|mysteries|hidden truths}.';

      const result: ParsedPromptResult = PromptParser.parse(prompt);

      expect(result.choiceCount).toBe(6);
      expect(result.textCount).toBe(7);
      expect(result.nodeCount).toBe(13);

      // Check that all choices are properly parsed
      const choiceSegments = result.segments.filter(s => s.type === 'choice');
      expect(choiceSegments).toHaveLength(6);

      // Verify specific options
      expect(choiceSegments[0].options).toEqual([
        'mysterious',
        'enigmatic',
        'cryptic'
      ]);
      expect(choiceSegments[1].options).toEqual(['puzzle', 'enigma', 'riddle']);
      expect(choiceSegments[2].options).toEqual([
        'challenges',
        'tests',
        'exercises'
      ]);
    });

    it('should generate unique IDs for segments', () => {
      const prompt = 'A {first|choice} and {second|choice} here';
      const result: ParsedPromptResult = PromptParser.parse(prompt);

      const ids = result.segments.map(s => s.id);
      const uniqueIds = new Set(ids);

      expect(ids.length).toBe(uniqueIds.size); // All IDs are unique
      expect(ids).toEqual([
        'text-0',
        'choice-0',
        'text-1',
        'choice-1',
        'text-2'
      ]);
    });
  });

  describe('validate', () => {
    it('should validate correct prompt', () => {
      const prompt = 'A {brave|cunning} knight';
      const result = PromptParser.validate(prompt);

      expect(result.isValid).toBe(true);
    });

    it('should reject empty prompt', () => {
      const result = PromptParser.validate('');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('cannot be empty');
    });

    it('should reject whitespace-only prompt', () => {
      const result = PromptParser.validate('   \n\t  ');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('cannot be empty');
    });

    it('should reject too long prompt', () => {
      const longPrompt = 'A'.repeat(10001);
      const result = PromptParser.validate(longPrompt);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('too long');
    });

    it('should reject unbalanced braces', () => {
      const prompts = [
        'A {brave|cunning knight', // Missing closing brace
        'A brave|cunning} knight', // Missing opening brace
        'A {brave|cunning}} knight', // Extra closing brace
        'A {{brave|cunning} knight' // Extra opening brace
      ];

      prompts.forEach(prompt => {
        const result = PromptParser.validate(prompt);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('Unmatched braces');
      });
    });

    it('should reject empty choice options', () => {
      const prompts = [
        'A {|cunning} knight', // Empty first option
        'A {brave|} knight', // Empty second option
        'A {brave||cunning} knight' // Empty middle option
      ];

      prompts.forEach(prompt => {
        const result = PromptParser.validate(prompt);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('Empty choice options');
      });
    });

    it('should handle nested braces correctly', () => {
      const prompt = 'A {option with {nested} braces} here';
      const result = PromptParser.validate(prompt);

      // This should be valid - nested braces are allowed in the content
      expect(result.isValid).toBe(true);
    });

    it('should handle special characters in options', () => {
      const prompt = 'A {option-1|option_2|option.3} test';
      const result = PromptParser.validate(prompt);

      expect(result.isValid).toBe(true);
    });

    it('should handle unicode characters', () => {
      const prompt = 'A {café|naïve|résumé} test';
      const result = PromptParser.validate(prompt);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null input', () => {
      expect(() => {
        PromptParser.parse(null as any);
      }).toThrow();
    });

    it('should handle undefined input', () => {
      expect(() => {
        PromptParser.parse(undefined as any);
      }).toThrow();
    });

    it('should handle non-string input', () => {
      expect(() => {
        PromptParser.parse(123 as any);
      }).toThrow();
    });

    it('should handle malformed regex patterns gracefully', () => {
      // This tests internal error handling
      const prompt = 'A [invalid] {choice} here'; // Square brackets instead of curly
      const result: ParsedPromptResult = PromptParser.parse(prompt);

      // Should still work for the valid part
      expect(result.segments.some(s => s.type === 'choice')).toBe(true);
    });

    it('should handle very large number of options', () => {
      const manyOptions = Array.from(
        { length: 100 },
        (_, i) => `option${i}`
      ).join('|');
      const prompt = `A {${manyOptions}} test`;

      const result: ParsedPromptResult = PromptParser.parse(prompt);
      expect(result.segments[1].options).toHaveLength(100);
    });

    it('should handle options with special regex characters', () => {
      const prompt =
        'A {option.with.dots|option+with+plus|option*with*asterisk} test';
      const result: ParsedPromptResult = PromptParser.parse(prompt);

      expect(result.segments[1].options).toEqual([
        'option.with.dots',
        'option+with+plus',
        'option*with*asterisk'
      ]);
    });

    it('should handle options with quotes and apostrophes', () => {
      const prompt =
        'A {"quoted option"|\'apostrophe option\'|normal-option} test';
      const result: ParsedPromptResult = PromptParser.parse(prompt);

      expect(result.segments[1].options).toEqual([
        '"quoted option"',
        "'apostrophe option'",
        'normal-option'
      ]);
    });
  });

  describe('Performance and scalability', () => {
    it('should handle large prompts efficiently', () => {
      const largePrompt = 'Word '.repeat(1000) + '{option1|option2}';
      const startTime = Date.now();

      const result: ParsedPromptResult = PromptParser.parse(largePrompt);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
      expect(result.segments.length).toBeGreaterThan(1);
    });

    it('should handle many small choices efficiently', () => {
      const manyChoices = Array.from(
        { length: 50 },
        (_, i) => `{option${i}A|option${i}B}`
      ).join(' ');
      const prompt = `Test ${manyChoices} end`;

      const startTime = Date.now();
      const result: ParsedPromptResult = PromptParser.parse(prompt);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(50); // Should complete quickly
      expect(result.choiceCount).toBe(50);
    });
  });
});
