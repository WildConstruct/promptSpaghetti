/**
 * Prompt Parser Utility for Tutorial System
 * Parses prompt text with {option1|option2} syntax into nodes
 */

export interface ParsedPromptSegment {
  type: 'text' | 'choice';
  content: string;
  options?: string[];
  id?: string;
}

export interface ParsedPromptResult {
  segments: ParsedPromptSegment[];
  nodeCount: number;
  choiceCount: number;
  textCount: number;
}

export class PromptParser {
  /**
   * Parse a prompt string with {option1|option2} syntax
   * @param prompt The prompt string to parse
   * @returns Parsed segments ready for node creation
   */
  static parse(prompt: string): ParsedPromptResult {
    if (!prompt || typeof prompt !== 'string') {
      return {
        segments: [],
        nodeCount: 0,
        choiceCount: 0,
        textCount: 0
      };
    }

    const segments: ParsedPromptSegment[] = [];
    let currentIndex = 0;

    // Regular expression to match {option1|option2|option3} patterns
    const choiceRegex = /\{([^}]+)\}/g;
    let match;

    while ((match = choiceRegex.exec(prompt)) !== null) {
      const matchIndex = match.index;
      const matchLength = match[0].length;

      // Add text before the choice if any
      if (matchIndex > currentIndex) {
        const textContent = prompt.substring(currentIndex, matchIndex).trim();
        if (textContent) {
          segments.push({
            type: 'text',
            content: textContent,
            id: `text-${segments.length}`
          });
        }
      }

      // Parse the choice options
      const optionsString = match[1];
      const options = optionsString
        .split('|')
        .map(opt => opt.trim())
        .filter(opt => opt);

      if (options.length > 0) {
        segments.push({
          type: 'choice',
          content: optionsString,
          options: options,
          id: `choice-${segments.length}`
        });
      }

      currentIndex = matchIndex + matchLength;
    }

    // Add remaining text after the last choice
    if (currentIndex < prompt.length) {
      const remainingText = prompt.substring(currentIndex).trim();
      if (remainingText) {
        segments.push({
          type: 'text',
          content: remainingText,
          id: `text-${segments.length}`
        });
      }
    }

    // If no segments were found, treat the entire prompt as text
    if (segments.length === 0 && prompt.trim()) {
      segments.push({
        type: 'text',
        content: prompt.trim(),
        id: 'text-0'
      });
    }

    const choiceCount = segments.filter(s => s.type === 'choice').length;
    const textCount = segments.filter(s => s.type === 'text').length;

    return {
      segments,
      nodeCount: segments.length,
      choiceCount,
      textCount
    };
  }

  /**
   * Validate if a prompt can be parsed
   * @param prompt The prompt to validate
   * @returns Validation result
   */
  static validate(prompt: string): { isValid: boolean; message?: string } {
    if (!prompt || !prompt.trim()) {
      return { isValid: false, message: 'Prompt cannot be empty' };
    }

    if (prompt.length > 10000) {
      return {
        isValid: false,
        message: 'Prompt is too long (max 10,000 characters)'
      };
    }

    // Check for malformed braces
    const openBraces = (prompt.match(/\{/g) || []).length;
    const closeBraces = (prompt.match(/\}/g) || []).length;

    if (openBraces !== closeBraces) {
      return { isValid: false, message: 'Unmatched braces in prompt' };
    }

    // Check for empty choices
    const choiceRegex = /\{([^}]+)\}/g;
    let match;
    while ((match = choiceRegex.exec(prompt)) !== null) {
      const options = match[1].split('|').map(opt => opt.trim());
      if (options.some(opt => !opt)) {
        return { isValid: false, message: 'Empty choice options found' };
      }
    }

    return { isValid: true };
  }
}

export default PromptParser;
