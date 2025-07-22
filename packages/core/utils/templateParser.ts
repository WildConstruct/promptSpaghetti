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
  category: 'character' | 'setting' | 'action' | 'mood' | 'object' | 'cinematic' | 'temporal' | 'descriptive' | 'narrative' | 'custom';
  description: string;
  examples: string[];
  priority?: number; // For ranking suggestions (1-10, 10 = highest)
  nodeTypes?: string[]; // Specific node types where this suggestion is most relevant
  relatedVariables?: string[]; // Variables that often appear together
}

// Common filmmaker variable patterns
const COMMON_VARIABLES: VariableSuggestion[] = [
  // Characters (High Priority)
  { 
    name: 'character', 
    category: 'character', 
    description: 'Main character or person', 
    examples: ['a detective', 'young woman', 'warrior'], 
    priority: 10,
    nodeTypes: ['subject', 'output'],
    relatedVariables: ['action', 'location', 'mood']
  },
  { 
    name: 'creature', 
    category: 'character', 
    description: 'Any living being', 
    examples: ['dragon', 'wolf', 'alien'], 
    priority: 9,
    nodeTypes: ['subject', 'output'],
    relatedVariables: ['terrain', 'action']
  },
  { 
    name: 'protagonist', 
    category: 'character', 
    description: 'Main character', 
    examples: ['hero', 'detective', 'explorer'], 
    priority: 8,
    relatedVariables: ['goal', 'obstacle', 'setting']
  },
  { 
    name: 'villain', 
    category: 'character', 
    description: 'Antagonist character', 
    examples: ['sorcerer', 'criminal', 'monster'], 
    priority: 7,
    relatedVariables: ['threat', 'power', 'location']
  },
  { 
    name: 'hero', 
    category: 'character', 
    description: 'Heroic character', 
    examples: ['knight', 'space pilot', 'rebel leader'], 
    priority: 8
  },
  { 
    name: 'companion', 
    category: 'character', 
    description: 'Supporting character', 
    examples: ['loyal friend', 'wise mentor', 'magical familiar'], 
    priority: 6
  },
  { 
    name: 'crowd', 
    category: 'character', 
    description: 'Group of people', 
    examples: ['angry mob', 'festival-goers', 'army'], 
    priority: 5
  },

  // Settings (High Priority)
  { 
    name: 'location', 
    category: 'setting', 
    description: 'Where the scene takes place', 
    examples: ['ancient forest', 'space station', 'city street'], 
    priority: 10,
    nodeTypes: ['output', 'concat'],
    relatedVariables: ['time', 'weather', 'atmosphere']
  },
  { 
    name: 'terrain', 
    category: 'setting', 
    description: 'Type of landscape', 
    examples: ['rocky mountains', 'desert', 'jungle'], 
    priority: 8,
    relatedVariables: ['weather', 'creature', 'danger']
  },
  { 
    name: 'setting', 
    category: 'setting', 
    description: 'Scene environment', 
    examples: ['medieval castle', 'cyberpunk city', 'underwater'], 
    priority: 9,
    nodeTypes: ['output', 'concat']
  },
  { 
    name: 'weather', 
    category: 'setting', 
    description: 'Weather conditions', 
    examples: ['stormy night', 'bright sunshine', 'misty morning'], 
    priority: 7,
    relatedVariables: ['mood', 'time', 'location']
  },
  { 
    name: 'environment', 
    category: 'setting', 
    description: 'Surrounding environment', 
    examples: ['enchanted forest', 'alien world', 'post-apocalyptic wasteland'], 
    priority: 7
  },
  { 
    name: 'building', 
    category: 'setting', 
    description: 'Structure or building', 
    examples: ['ancient temple', 'skyscraper', 'cottage'], 
    priority: 6
  },

  // Actions (High Priority)
  { 
    name: 'action', 
    category: 'action', 
    description: 'What is happening', 
    examples: ['running', 'fighting', 'exploring'], 
    priority: 10,
    nodeTypes: ['output', 'concat'],
    relatedVariables: ['character', 'location', 'goal']
  },
  { 
    name: 'movement', 
    category: 'action', 
    description: 'Type of motion', 
    examples: ['flying', 'sneaking', 'dancing'], 
    priority: 8,
    relatedVariables: ['character', 'terrain']
  },
  { 
    name: 'interaction', 
    category: 'action', 
    description: 'Character interaction', 
    examples: ['talking', 'arguing', 'embracing'], 
    priority: 7,
    relatedVariables: ['character', 'companion']
  },
  { 
    name: 'conflict', 
    category: 'action', 
    description: 'Struggle or conflict', 
    examples: ['battle', 'argument', 'chase'], 
    priority: 7,
    relatedVariables: ['villain', 'hero', 'tension']
  },
  { 
    name: 'quest', 
    category: 'action', 
    description: 'Mission or journey', 
    examples: ['rescue mission', 'treasure hunt', 'pilgrimage'], 
    priority: 6,
    relatedVariables: ['goal', 'obstacle', 'location']
  },

  // Moods and Atmosphere (Medium Priority)
  { 
    name: 'mood', 
    category: 'mood', 
    description: 'Emotional atmosphere', 
    examples: ['mysterious', 'romantic', 'tense'], 
    priority: 8,
    nodeTypes: ['output', 'concat'],
    relatedVariables: ['lighting', 'music', 'atmosphere']
  },
  { 
    name: 'tone', 
    category: 'mood', 
    description: 'Overall feeling', 
    examples: ['dark', 'whimsical', 'epic'], 
    priority: 7,
    relatedVariables: ['genre', 'style']
  },
  { 
    name: 'atmosphere', 
    category: 'mood', 
    description: 'Scene atmosphere', 
    examples: ['eerie', 'peaceful', 'chaotic'], 
    priority: 7,
    relatedVariables: ['weather', 'lighting', 'sound']
  },
  { 
    name: 'emotion', 
    category: 'mood', 
    description: 'Emotional state', 
    examples: ['fear', 'joy', 'wonder'], 
    priority: 6,
    relatedVariables: ['character', 'action']
  },
  { 
    name: 'tension', 
    category: 'mood', 
    description: 'Level of suspense', 
    examples: ['high suspense', 'calm before storm', 'explosive'], 
    priority: 6,
    relatedVariables: ['conflict', 'danger']
  },

  // Objects (Medium Priority)
  { 
    name: 'object', 
    category: 'object', 
    description: 'Important item', 
    examples: ['magic sword', 'ancient book', 'spaceship'], 
    priority: 7,
    relatedVariables: ['character', 'power', 'quest']
  },
  { 
    name: 'prop', 
    category: 'object', 
    description: 'Scene prop', 
    examples: ['lantern', 'mirror', 'crown'], 
    priority: 6,
    relatedVariables: ['setting', 'character']
  },
  { 
    name: 'vehicle', 
    category: 'object', 
    description: 'Transportation', 
    examples: ['horse', 'spaceship', 'dragon'], 
    priority: 6,
    relatedVariables: ['movement', 'location']
  },
  { 
    name: 'weapon', 
    category: 'object', 
    description: 'Combat item', 
    examples: ['sword', 'laser gun', 'magic staff'], 
    priority: 5,
    relatedVariables: ['conflict', 'character']
  },
  { 
    name: 'artifact', 
    category: 'object', 
    description: 'Important relic', 
    examples: ['ancient scroll', 'crystal orb', 'golden idol'], 
    priority: 5,
    relatedVariables: ['quest', 'power', 'mystery']
  },

  // Cinematic (New Category)
  { 
    name: 'lighting', 
    category: 'cinematic', 
    description: 'Lighting condition', 
    examples: ['golden hour', 'harsh shadows', 'soft moonlight'], 
    priority: 8,
    nodeTypes: ['output', 'concat'],
    relatedVariables: ['mood', 'time', 'atmosphere']
  },
  { 
    name: 'camera', 
    category: 'cinematic', 
    description: 'Camera perspective', 
    examples: ['close-up', 'wide shot', 'bird\'s eye view'], 
    priority: 7,
    nodeTypes: ['output']
  },
  { 
    name: 'angle', 
    category: 'cinematic', 
    description: 'Camera angle', 
    examples: ['low angle', 'Dutch tilt', 'overhead'], 
    priority: 6,
    nodeTypes: ['output']
  },
  { 
    name: 'composition', 
    category: 'cinematic', 
    description: 'Visual composition', 
    examples: ['rule of thirds', 'symmetrical', 'leading lines'], 
    priority: 6
  },
  { 
    name: 'color_palette', 
    category: 'cinematic', 
    description: 'Color scheme', 
    examples: ['warm tones', 'monochromatic blue', 'vibrant contrast'], 
    priority: 5
  },

  // Temporal (New Category)
  { 
    name: 'time', 
    category: 'temporal', 
    description: 'Time of day or period', 
    examples: ['dawn', 'midnight', 'ancient times'], 
    priority: 7,
    relatedVariables: ['lighting', 'weather', 'mood']
  },
  { 
    name: 'era', 
    category: 'temporal', 
    description: 'Historical period', 
    examples: ['medieval times', 'far future', 'Victorian era'], 
    priority: 6,
    relatedVariables: ['setting', 'style']
  },
  { 
    name: 'season', 
    category: 'temporal', 
    description: 'Season of the year', 
    examples: ['spring bloom', 'winter frost', 'autumn colors'], 
    priority: 5,
    relatedVariables: ['weather', 'lighting']
  },
  { 
    name: 'duration', 
    category: 'temporal', 
    description: 'Length of time', 
    examples: ['brief moment', 'eternal', 'fleeting seconds'], 
    priority: 4
  },

  // Descriptive (New Category)
  { 
    name: 'size', 
    category: 'descriptive', 
    description: 'Scale or size', 
    examples: ['massive', 'tiny', 'towering'], 
    priority: 6,
    relatedVariables: ['object', 'creature', 'building']
  },
  { 
    name: 'texture', 
    category: 'descriptive', 
    description: 'Surface quality', 
    examples: ['rough stone', 'silky smooth', 'weathered wood'], 
    priority: 5,
    relatedVariables: ['object', 'setting']
  },
  { 
    name: 'color', 
    category: 'descriptive', 
    description: 'Color description', 
    examples: ['crimson red', 'ethereal blue', 'golden yellow'], 
    priority: 6,
    relatedVariables: ['lighting', 'mood']
  },
  { 
    name: 'style', 
    category: 'descriptive', 
    description: 'Artistic style', 
    examples: ['cyberpunk', 'steampunk', 'art deco'], 
    priority: 7,
    relatedVariables: ['era', 'mood']
  },
  { 
    name: 'quality', 
    category: 'descriptive', 
    description: 'Condition or quality', 
    examples: ['pristine', 'battle-worn', 'ancient'], 
    priority: 5
  },

  // Narrative (New Category)
  { 
    name: 'goal', 
    category: 'narrative', 
    description: 'Objective or purpose', 
    examples: ['save the kingdom', 'find the truth', 'escape danger'], 
    priority: 8,
    relatedVariables: ['character', 'quest', 'obstacle']
  },
  { 
    name: 'obstacle', 
    category: 'narrative', 
    description: 'Challenge or barrier', 
    examples: ['locked door', 'treacherous path', 'moral dilemma'], 
    priority: 7,
    relatedVariables: ['goal', 'conflict']
  },
  { 
    name: 'mystery', 
    category: 'narrative', 
    description: 'Unknown element', 
    examples: ['hidden secret', 'ancient curse', 'missing person'], 
    priority: 6,
    relatedVariables: ['goal', 'atmosphere']
  },
  { 
    name: 'revelation', 
    category: 'narrative', 
    description: 'Plot revelation', 
    examples: ['shocking truth', 'hidden identity', 'betrayal'], 
    priority: 5
  },
  { 
    name: 'theme', 
    category: 'narrative', 
    description: 'Central theme', 
    examples: ['love conquers all', 'power corrupts', 'coming of age'], 
    priority: 6
  },
  { 
    name: 'genre', 
    category: 'narrative', 
    description: 'Story genre', 
    examples: ['fantasy', 'sci-fi', 'horror'], 
    priority: 7,
    relatedVariables: ['style', 'tone']
  }
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

  // User history storage for custom suggestions
  private userHistory = new Map<string, { count: number; lastUsed: Date }>();
  private currentNodeType?: string;
  private currentVariables: string[] = [];

  /**
   * Set context for contextual suggestions
   */
  setContext(nodeType?: string, existingVariables: string[] = []): void {
    this.currentNodeType = nodeType;
    this.currentVariables = existingVariables;
  }

  /**
   * Track variable usage for user history
   */
  trackVariableUsage(variableName: string): void {
    const current = this.userHistory.get(variableName) || { count: 0, lastUsed: new Date() };
    this.userHistory.set(variableName, {
      count: current.count + 1,
      lastUsed: new Date()
    });
  }

  /**
   * Get user's custom variable suggestions based on history
   */
  private getUserHistorySuggestions(): VariableSuggestion[] {
    const historySuggestions: VariableSuggestion[] = [];
    
    for (const [variableName, history] of this.userHistory.entries()) {
      // Only include variables used more than once and recently
      const daysSinceUsed = (Date.now() - history.lastUsed.getTime()) / (1000 * 60 * 60 * 24);
      
      if (history.count > 1 && daysSinceUsed < 30) {
        // Check if it's not already in common variables
        const isCommon = COMMON_VARIABLES.some(v => v.name === variableName);
        
        if (!isCommon) {
          historySuggestions.push({
            name: variableName,
            category: 'custom',
            description: `Custom variable (used ${history.count} times)`,
            examples: [`{${variableName}}`],
            priority: Math.min(10, history.count), // Priority based on usage
            relatedVariables: this.findRelatedVariables(variableName)
          });
        }
      }
    }

    return historySuggestions.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Find related variables based on co-occurrence patterns
   */
  private findRelatedVariables(variableName: string): string[] {
    // This could be enhanced to track actual co-occurrence patterns
    // For now, return empty array but structure is in place
    return [];
  }

  /**
   * Get contextual suggestions based on node type and existing variables
   */
  private getContextualSuggestions(): VariableSuggestion[] {
    let contextualSuggestions: VariableSuggestion[] = [];

    // Node type context
    if (this.currentNodeType) {
      contextualSuggestions = COMMON_VARIABLES.filter(suggestion => 
        suggestion.nodeTypes?.includes(this.currentNodeType)
      );
    }

    // Related variable context
    if (this.currentVariables.length > 0) {
      const relatedSuggestions = COMMON_VARIABLES.filter(suggestion => 
        suggestion.relatedVariables?.some(related => 
          this.currentVariables.includes(related)
        ) && !this.currentVariables.includes(suggestion.name)
      );
      contextualSuggestions.push(...relatedSuggestions);
    }

    // Remove duplicates and sort by priority
    const uniqueSuggestions = contextualSuggestions.filter((suggestion, index, self) =>
      index === self.findIndex(s => s.name === suggestion.name)
    );

    return uniqueSuggestions.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Get variable suggestions for auto-completion with enhanced contextual support
   */
  getVariableSuggestions(
    partialName: string = '',
    context?: string,
    includeHistory: boolean = true
  ): VariableSuggestion[] {
    let allSuggestions: VariableSuggestion[] = [];

    // Start with contextual suggestions (highest priority)
    const contextualSuggestions = this.getContextualSuggestions();
    allSuggestions.push(...contextualSuggestions);

    // Add user history suggestions
    if (includeHistory) {
      const historySuggestions = this.getUserHistorySuggestions();
      allSuggestions.push(...historySuggestions);
    }

    // Add common variables
    allSuggestions.push(...COMMON_VARIABLES);

    // Remove duplicates
    const uniqueSuggestions = allSuggestions.filter((suggestion, index, self) =>
      index === self.findIndex(s => s.name === suggestion.name)
    );

    // Filter by partial name match
    const filtered = uniqueSuggestions.filter(suggestion => {
      if (!partialName) return true;
      
      const searchTerm = partialName.toLowerCase();
      return (
        suggestion.name.toLowerCase().includes(searchTerm) ||
        suggestion.description.toLowerCase().includes(searchTerm) ||
        suggestion.examples.some(example => example.toLowerCase().includes(searchTerm))
      );
    });

    // Sort by relevance and priority
    return filtered.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const searchTerm = partialName.toLowerCase();
      
      // Exact matches first
      if (aName === searchTerm && bName !== searchTerm) return -1;
      if (bName === searchTerm && aName !== searchTerm) return 1;
      
      // Starts with matches next
      const aStartsWith = aName.startsWith(searchTerm);
      const bStartsWith = bName.startsWith(searchTerm);
      if (aStartsWith && !bStartsWith) return -1;
      if (bStartsWith && !aStartsWith) return 1;
      
      // Priority-based sorting
      const aPriority = a.priority || 0;
      const bPriority = b.priority || 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      // Alphabetical as final tiebreaker
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

export const getVariableSuggestions = (
  partialName?: string, 
  context?: string, 
  includeHistory: boolean = true
): VariableSuggestion[] =>
  templateParser.getVariableSuggestions(partialName, context, includeHistory);

export const substituteVariables = (template: string, values: Record<string, string>): string =>
  templateParser.substituteVariables(template, values);

export const getPreviewWithSamples = (template: string) =>
  templateParser.getPreviewWithSamples(template);

// Context management functions
export 
export const trackVariableUsage = (variableName: string): void =>
  templateParser.trackVariableUsage(variableName);

// Clear cache utility
export 
// Variable categories for UI filtering
export const VARIABLE_CATEGORIES = [
  'character', 'setting', 'action', 'mood', 'object', 
  'cinematic', 'temporal', 'descriptive', 'narrative', 'custom'
] as const;

export type VariableCategory = typeof VARIABLE_CATEGORIES[number];

// Get suggestions by category
export 
// Get all common variables
export const getAllCommonVariables = (): VariableSuggestion[] => [...COMMON_VARIABLES];