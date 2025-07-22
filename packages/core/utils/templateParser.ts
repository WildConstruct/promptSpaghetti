// packages/core/utils/templateParser.ts
// Director-friendly template parsing system for {variable} syntax

export interface ExtractedVariable {
  name: string;          // Variable name (without braces)
  placeholder: string;   // Full placeholder text {name}
  startIndex: number;    // Start position in template
  endIndex: number;      // End position in template
  isValid: boolean;      // Whether the variable name is valid
}

export interface TemplateParseResult {
  variables: ExtractedVariable[];
  errors: TemplateError[];
  isValid: boolean;
  processedTemplate: string;  // Template with highlighted variables
}

export interface TemplateError {
  type: 'unclosed_brace' | 'empty_variable' | 'invalid_name' | 'nested_braces';
  message: string;
  position: number;
  severity: 'error' | 'warning';
}

export interface VariableSuggestion {
  name: string;
  category: 'character' | 'setting' | 'action' | 'mood' | 'object' | 'custom';
  description: string;
  examples: string[];
}

// Common filmmaker variable patterns
const COMMON_VARIABLES: VariableSuggestion[] = [
  // Characters
  { name: 'character', category: 'character', description: 'Main character or person', examples: ['a detective', 'young woman', 'warrior'] },
  { name: 'creature', category: 'character', description: 'Any living being', examples: ['dragon', 'wolf', 'alien'] },
  { name: 'protagonist', category: 'character', description: 'Main character', examples: ['hero', 'detective', 'explorer'] },
  { name: 'villain', category: 'character', description: 'Antagonist character', examples: ['sorcerer', 'criminal', 'monster'] },
  
  // Settings  
  { name: 'location', category: 'setting', description: 'Where the scene takes place', examples: ['ancient forest', 'space station', 'city street'] },
  { name: 'terrain', category: 'setting', description: 'Type of landscape', examples: ['rocky mountains', 'desert', 'jungle'] },
  { name: 'setting', category: 'setting', description: 'Scene environment', examples: ['medieval castle', 'cyberpunk city', 'underwater'] },
  { name: 'weather', category: 'setting', description: 'Weather conditions', examples: ['stormy night', 'bright sunshine', 'misty morning'] },
  
  // Actions
  { name: 'action', category: 'action', description: 'What is happening', examples: ['running', 'fighting', 'exploring'] },
  { name: 'movement', category: 'action', description: 'Type of motion', examples: ['flying', 'sneaking', 'dancing'] },
  { name: 'interaction', category: 'action', description: 'Character interaction', examples: ['talking', 'arguing', 'embracing'] },
  
  // Moods and Atmosphere
  { name: 'mood', category: 'mood', description: 'Emotional atmosphere', examples: ['mysterious', 'romantic', 'tense'] },
  { name: 'tone', category: 'mood', description: 'Overall feeling', examples: ['dark', 'whimsical', 'epic'] },
  { name: 'atmosphere', category: 'mood', description: 'Scene atmosphere', examples: ['eerie', 'peaceful', 'chaotic'] },
  
  // Objects
  { name: 'object', category: 'object', description: 'Important item', examples: ['magic sword', 'ancient book', 'spaceship'] },
  { name: 'prop', category: 'object', description: 'Scene prop', examples: ['lantern', 'mirror', 'crown'] },
  { name: 'vehicle', category: 'object', description: 'Transportation', examples: ['horse', 'car', 'dragon'] },
];

class TemplateParser {
  private static instance: TemplateParser;
  private parseCache = new Map<string, TemplateParseResult>();
  
  static getInstance(): TemplateParser {
    if (!TemplateParser.instance) {
      TemplateParser.instance = new TemplateParser();
    }
    return TemplateParser.instance;
  }

  /**
   * Parse template and extract variables
   */
  parseTemplate(template: string): TemplateParseResult {
    // Check cache first
    if (this.parseCache.has(template)) {
      return this.parseCache.get(template)!;
    }

    const result = this.performParse(template);
    
    // Cache result (limit cache size)
    if (this.parseCache.size > 100) {
      const firstKey = this.parseCache.keys().next().value;
      this.parseCache.delete(firstKey);
    }
    this.parseCache.set(template, result);
    
    return result;
  }

  private performParse(template: string): TemplateParseResult {
    const variables: ExtractedVariable[] = [];
    const errors: TemplateError[] = [];
    let processedTemplate = template;
    
    // Find all potential variable patterns
    const braceRegex = /{([^{}]*)}/g;
    let match;
    
    while ((match = braceRegex.exec(template)) !== null) {
      const [fullMatch, variableName] = match;
      const startIndex = match.index;
      const endIndex = startIndex + fullMatch.length;
      
      // Validate variable name
      const validation = this.validateVariableName(variableName);
      
      if (validation.isValid) {
        variables.push({
          name: variableName.trim(),
          placeholder: fullMatch,
          startIndex,
          endIndex,
          isValid: true
        });
      } else {
        variables.push({
          name: variableName.trim(),
          placeholder: fullMatch,
          startIndex,
          endIndex,
          isValid: false
        });
        
        errors.push({
          type: validation.errorType!,
          message: validation.errorMessage!,
          position: startIndex,
          severity: 'error'
        });
      }
    }
    
    // Check for unclosed braces
    this.findUnclosedBraces(template, errors);
    
    // Check for nested braces (not supported)
    this.findNestedBraces(template, errors);
    
    return {
      variables,
      errors,
      isValid: errors.length === 0,
      processedTemplate: this.highlightVariables(template, variables)
    };
  }

  private validateVariableName(name: string): { isValid: boolean; errorType?: TemplateError['type']; errorMessage?: string } {
    const trimmed = name.trim();
    
    if (trimmed === '') {
      return {
        isValid: false,
        errorType: 'empty_variable',
        errorMessage: 'Variable name cannot be empty'
      };
    }
    
    // Variable names should be alphanumeric with underscores, hyphens allowed
    const validNameRegex = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
    if (!validNameRegex.test(trimmed)) {
      return {
        isValid: false,
        errorType: 'invalid_name',
        errorMessage: `Invalid variable name "${trimmed}". Use letters, numbers, underscore, and hyphen only.`
      };
    }
    
    return { isValid: true };
  }

  private findUnclosedBraces(template: string, errors: TemplateError[]): void {
    let braceCount = 0;
    let lastOpenBrace = -1;
    
    for (let i = 0; i < template.length; i++) {
      if (template[i] === '{') {
        if (braceCount === 0) {
          lastOpenBrace = i;
        }
        braceCount++;
      } else if (template[i] === '}') {
        braceCount--;
      }
    }
    
    if (braceCount > 0) {
      errors.push({
        type: 'unclosed_brace',
        message: 'Unclosed brace - missing closing }',
        position: lastOpenBrace,
        severity: 'error'
      });
    }
  }

  private findNestedBraces(template: string, errors: TemplateError[]): void {
    let braceDepth = 0;
    
    for (let i = 0; i < template.length; i++) {
      if (template[i] === '{') {
        braceDepth++;
        if (braceDepth > 1) {
          errors.push({
            type: 'nested_braces',
            message: 'Nested braces are not supported',
            position: i,
            severity: 'error'
          });
        }
      } else if (template[i] === '}') {
        braceDepth--;
      }
    }
  }

  private highlightVariables(template: string, variables: ExtractedVariable[]): string {
    // This would be used by the UI to highlight variables
    // For now, return template as-is since highlighting is done in React
    return template;
  }

  /**
   * Get variable suggestions for auto-completion
   */
  getVariableSuggestions(partialName: string = '', context?: string): VariableSuggestion[] {
    const filtered = COMMON_VARIABLES.filter(suggestion => 
      suggestion.name.toLowerCase().includes(partialName.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(partialName.toLowerCase())
    );
    
    // Sort by relevance (exact matches first, then starts-with, then contains)
    return filtered.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const searchTerm = partialName.toLowerCase();
      
      if (aName === searchTerm) return -1;
      if (bName === searchTerm) return 1;
      if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
      if (bName.startsWith(searchTerm) && !aName.startsWith(searchTerm)) return 1;
      
      return aName.localeCompare(bName);
    });
  }

  /**
   * Substitute variables in template with actual values
   */
  substituteVariables(template: string, values: Record<string, string>): string {
    let result = template;
    
    for (const [varName, value] of Object.entries(values)) {
      const regex = new RegExp(`{${varName}}`, 'g');
      result = result.replace(regex, value || `{${varName}}`);
    }
    
    return result;
  }

  /**
   * Get preview with sample values
   */
  getPreviewWithSamples(template: string): { preview: string; usedSamples: Record<string, string> } {
    const parseResult = this.parseTemplate(template);
    const sampleValues: Record<string, string> = {};
    
    for (const variable of parseResult.variables) {
      if (variable.isValid) {
        // Find matching suggestion or use generic sample
        const suggestion = COMMON_VARIABLES.find(s => s.name === variable.name);
        sampleValues[variable.name] = suggestion ? 
          suggestion.examples[0] : 
          `[${variable.name}]`;
      }
    }
    
    return {
      preview: this.substituteVariables(template, sampleValues),
      usedSamples: sampleValues
    };
  }

  /**
   * Clear parse cache
   */
  clearCache(): void {
    this.parseCache.clear();
  }
}

// Export singleton instance
export const templateParser = TemplateParser.getInstance();

// Export utility functions
export const parseTemplate = (template: string): TemplateParseResult => 
  templateParser.parseTemplate(template);

export const getVariableSuggestions = (partialName?: string, context?: string): VariableSuggestion[] =>
  templateParser.getVariableSuggestions(partialName, context);

export const substituteVariables = (template: string, values: Record<string, string>): string =>
  templateParser.substituteVariables(template, values);

export const getPreviewWithSamples = (template: string) =>
  templateParser.getPreviewWithSamples(template);