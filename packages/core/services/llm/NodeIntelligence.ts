// Node Intelligence Service for Story 2.2a
// Provides intelligent assistance for node operations

import { LLMService, SuggestionResponse } from './LLMService';
import { CacheManager } from './CacheManager';

export interface Choice {
  text: string;
  weight: number;
  locked?: boolean;
}

export interface WeightOptimizationResult {
  original: Choice[];
  optimized: Choice[];
  confidence: 'high' | 'medium' | 'low';
}

export interface InspirationSuggestion {
  theme: string;
  choices: Choice[];
}

export interface VariableInfo {
  name: string;
  position: number;
  placeholder: string;
}

export class NodeIntelligenceService {
  private llmService: LLMService;
  private cache: CacheManager;
  private offlineSuggestions: Map<string, Choice[]>;
  private variablePattern = /\{([^}]+)\}/g;

  constructor(llmService: LLMService) {
    this.llmService = llmService;
    this.cache = new CacheManager(50, 5 * 60 * 1000); // 5 minute cache
    this.offlineSuggestions = this.loadOfflineSuggestions();
  }

  // Extract variables from text to preserve them
  private extractVariables(text: string): VariableInfo[] {
    const variables: VariableInfo[] = [];
    let match;

    while ((match = this.variablePattern.exec(text)) !== null) {
      variables.push({
        name: match[1],
        position: match.index,
        placeholder: match[0]
      });
    }

    return variables;
  }

  // Preserve variables in generated text
  private preserveVariables(
    originalText: string,
    generatedText: string,
    variables: VariableInfo[]
  ): string {
    let result = generatedText;

    // Re-insert variables if they were removed
    for (const variable of variables) {
      if (!result.includes(variable.placeholder)) {
        // Try to insert at a reasonable position
        const words = result.split(' ');
        const insertPos = Math.min(variable.position, result.length);
        result =
          result.slice(0, insertPos) +
          ' ' +
          variable.placeholder +
          ' ' +
          result.slice(insertPos);
      }
    }

    return result.trim();
  }

  // Populate choices for WeightedChoice nodes
  async populateChoices(
    nodeText: string,
    context: string,
    count: number = 5
  ): Promise<Choice[]> {
    try {
      // Extract variables to preserve
      const variables = this.extractVariables(nodeText);
      const variableNames = variables.map(v => v.placeholder).join(', ');

      const prompt = `Generate ${count} creative variations for this text segment: "${nodeText}"
      
      Context of full prompt: "${context}"
      ${variables.length > 0 ? `IMPORTANT: Preserve these variables exactly: ${variableNames}` : ''}
      
      Return JSON with format: {"choices": [{"text": "...", "weight": 1-10}]}
      
      Requirements:
      - Each variation should be contextually appropriate
      - Weights should reflect likelihood/appropriateness (1=rare, 10=common)
      - Maintain similar length and style
      - Be creative but relevant`;

      const response = await this.llmService.populateChoices(
        context,
        nodeText,
        count
      );

      if (response && response.choices) {
        // Preserve variables in each choice
        return response.choices.map(choice => ({
          ...choice,
          text: this.preserveVariables(nodeText, choice.text, variables)
        }));
      }
    } catch (error) {
      console.error('[NodeIntelligence] Failed to populate choices:', error);
      console.log('[NodeIntelligence] Error details:', {
        message: (error as any)?.message,
        stack: (error as any)?.stack,
        llmServiceExists: !!this.llmService,
        willFallback: true
      });
    }

    // Fallback to offline suggestions
    console.warn('[NodeIntelligence] Falling back to offline suggestions');
    return this.getOfflineSuggestions(nodeText, count);
  }

  // Optimize weights based on context
  async optimizeWeights(
    choices: Choice[],
    context: string
  ): Promise<WeightOptimizationResult> {
    try {
      const lockedChoices = choices.filter(c => c.locked);
      const unlocked = choices.filter(c => !c.locked);

      if (unlocked.length === 0) {
        return {
          original: choices,
          optimized: choices,
          confidence: 'high'
        };
      }

      const prompt = `Analyze these text variations and suggest optimal weights (1-10 scale):
      
      Context: "${context}"
      
      Choices to optimize:
      ${unlocked.map((c, i) => `${i + 1}. "${c.text}" (current weight: ${c.weight})`).join('\n')}
      
      Return JSON: {"weights": [{"index": 0, "weight": 1-10, "reason": "..."}]}
      
      Consider:
      - Relevance to context
      - Variety and distribution
      - Natural frequency
      - Creative value`;

      const response = await this.llmService.complete({
        prompt,
        responseFormat: 'json',
        taskType: 'suggestion'
      });

      if (response?.content) {
        try {
          const parsed = JSON.parse(response.content);
          const optimized = [...choices];

          if (parsed.weights) {
            for (const update of parsed.weights) {
              if (update.index < unlocked.length) {
                const choiceIndex = choices.indexOf(unlocked[update.index]);
                if (choiceIndex !== -1 && !choices[choiceIndex].locked) {
                  optimized[choiceIndex] = {
                    ...choices[choiceIndex],
                    weight: Math.max(1, Math.min(10, update.weight))
                  };
                }
              }
            }
          }

          return {
            original: choices,
            optimized,
            confidence: 'high'
          };
        } catch (parseError) {
          console.error('Failed to parse optimization response:', parseError);
        }
      }
    } catch (error) {
      console.error('Failed to optimize weights:', error);
    }

    // Return original on failure
    return {
      original: choices,
      optimized: choices,
      confidence: 'low'
    };
  }

  // Generate inspiration suggestions for empty nodes
  async getInspiration(
    upstreamContext: string,
    nodeType: string = 'weighted'
  ): Promise<InspirationSuggestion[]> {
    try {
      const prompt = `Given this context: "${upstreamContext}"
      
      Suggest 3 thematic directions for variations:
      
      Return JSON: {
        "suggestions": [
          {
            "theme": "Theme name",
            "choices": [{"text": "...", "weight": 1-10}]
          }
        ]
      }
      
      Each theme should have 3-5 relevant choices.`;

      const response = await this.llmService.complete({
        prompt,
        responseFormat: 'json',
        taskType: 'suggestion'
      });

      if (response?.content) {
        try {
          const parsed = JSON.parse(response.content);
          if (parsed.suggestions) {
            return parsed.suggestions;
          }
        } catch (parseError) {
          console.error('Failed to parse inspiration response:', parseError);
        }
      }
    } catch (error) {
      console.error('Failed to get inspiration:', error);
    }

    // Fallback to offline inspiration
    return this.getOfflineInspiration(upstreamContext);
  }

  // Load offline suggestions for fallback
  private loadOfflineSuggestions(): Map<string, Choice[]> {
    const suggestions = new Map<string, Choice[]>();

    // Common patterns for different contexts
    suggestions.set('action', [
      { text: 'running frantically', weight: 7 },
      { text: 'diving for cover', weight: 8 },
      { text: 'freezing in place', weight: 5 },
      { text: 'stumbling backwards', weight: 6 },
      { text: 'scrambling away', weight: 7 }
    ]);

    suggestions.set('emotion', [
      { text: 'terrified', weight: 8 },
      { text: 'shocked', weight: 7 },
      { text: 'confused', weight: 5 },
      { text: 'panicked', weight: 9 },
      { text: 'stunned', weight: 6 }
    ]);

    suggestions.set('environment', [
      { text: 'debris-filled streets', weight: 7 },
      { text: 'smoke-filled air', weight: 8 },
      { text: 'abandoned buildings', weight: 6 },
      { text: 'chaotic scene', weight: 9 },
      { text: 'war-torn landscape', weight: 7 }
    ]);

    suggestions.set('time', [
      { text: 'at dawn', weight: 6 },
      { text: 'at dusk', weight: 7 },
      { text: 'in the dead of night', weight: 8 },
      { text: 'under harsh midday sun', weight: 5 },
      { text: 'during golden hour', weight: 7 }
    ]);

    suggestions.set('weather', [
      { text: 'heavy rain', weight: 7 },
      { text: 'thick fog', weight: 6 },
      { text: 'swirling dust', weight: 8 },
      { text: 'clear skies', weight: 5 },
      { text: 'storm approaching', weight: 7 }
    ]);

    return suggestions;
  }

  // Get offline suggestions based on text analysis
  private getOfflineSuggestions(text: string, count: number): Choice[] {
    const lowerText = text.toLowerCase();

    // Detect category from keywords
    let category = 'action'; // default

    if (lowerText.includes('feel') || lowerText.includes('emotion')) {
      category = 'emotion';
    } else if (lowerText.includes('scene') || lowerText.includes('place')) {
      category = 'environment';
    } else if (lowerText.includes('time') || lowerText.includes('when')) {
      category = 'time';
    } else if (lowerText.includes('weather') || lowerText.includes('sky')) {
      category = 'weather';
    }

    const suggestions = this.offlineSuggestions.get(category) || [];
    return suggestions.slice(0, count);
  }

  // Get offline inspiration themes
  private getOfflineInspiration(context: string): InspirationSuggestion[] {
    const lowerContext = context.toLowerCase();

    const suggestions: InspirationSuggestion[] = [];

    // Always provide these three themes
    suggestions.push({
      theme: 'Character Reactions',
      choices: [
        { text: 'panic and flee', weight: 8 },
        { text: 'freeze in shock', weight: 6 },
        { text: 'seek cover', weight: 7 },
        { text: 'help others', weight: 5 }
      ]
    });

    suggestions.push({
      theme: 'Environmental Details',
      choices: [
        { text: 'debris flying', weight: 7 },
        { text: 'dust clouds', weight: 6 },
        { text: 'sirens wailing', weight: 8 },
        { text: 'glass shattering', weight: 7 }
      ]
    });

    suggestions.push({
      theme: 'Time Variations',
      choices: [
        { text: 'dawn breaking', weight: 6 },
        { text: 'high noon', weight: 5 },
        { text: 'twilight hour', weight: 7 },
        { text: 'dead of night', weight: 8 }
      ]
    });

    return suggestions;
  }

  // Check if service is available
  isAvailable(): boolean {
    return this.llmService !== null;
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}
