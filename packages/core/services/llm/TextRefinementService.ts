// Text Refinement Service for Story 2.2b
// Provides expand, contract, and correct operations for text nodes

import { LLMService } from './LLMService';
import { NodeIntelligenceService } from './NodeIntelligence';

export type RefinementMode = 'expand' | 'contract' | 'correct';

export interface RefinementResult {
  original: string;
  refined: string;
  changes: string[];
  mode: RefinementMode;
  confidence: 'high' | 'medium' | 'low';
}

export interface DiffSegment {
  type: 'unchanged' | 'added' | 'removed';
  text: string;
}

export class TextRefinementService {
  private llmService: LLMService;
  private nodeIntelligence: NodeIntelligenceService;

  constructor(llmService: LLMService) {
    this.llmService = llmService;
    this.nodeIntelligence = new NodeIntelligenceService(llmService);
  }

  // Main refinement method
  async refine(
    text: string,
    mode: RefinementMode,
    context?: string
  ): Promise<RefinementResult> {
    // Extract and preserve variables
    const variables = this.extractVariables(text);
    const contextSummary = context?.trim();

    try {
      const response = await this.llmService.refineText(text, mode);

      if (response) {
        // Ensure variables are preserved
        let refined = response.refined;
        if (variables.length > 0) {
          refined = this.preserveVariables(text, refined, variables);
        }

        return {
          original: response.original || text,
          refined,
          changes: response.changes || this.detectChanges(text, refined),
          mode,
          confidence: 'high'
        };
      }
    } catch (error) {
      console.error('Text refinement failed:', error);
    }

    // Fallback to offline refinement
    return this.offlineRefine(text, mode, contextSummary);
  }

  // Batch refinement for multiple nodes
  async refineBatch(
    texts: string[],
    mode: RefinementMode,
    context?: string
  ): Promise<RefinementResult[]> {
    const promises = texts.map(text => this.refine(text, mode, context));
    return Promise.all(promises);
  }

  // Extract variables to preserve
  private extractVariables(text: string): string[] {
    const variablePattern = /\{([^}]+)\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variablePattern.exec(text)) !== null) {
      variables.push(match[0]);
    }

    return variables;
  }

  // Preserve variables in refined text
  private preserveVariables(
    original: string,
    refined: string,
    variables: string[]
  ): string {
    let result = refined;

    // Re-insert variables if they were removed
    for (const variable of variables) {
      if (!result.includes(variable)) {
        // Try to insert at a semantically appropriate position
        // For now, append at the end if missing
        result = result.trim() + ' ' + variable;
      }
    }

    return result;
  }

  // Detect changes between original and refined
  private detectChanges(original: string, refined: string): string[] {
    const changes: string[] = [];

    const originalWords = original.split(/\s+/);
    const refinedWords = refined.split(/\s+/);

    if (refinedWords.length > originalWords.length) {
      changes.push(`Added ${refinedWords.length - originalWords.length} words`);
    } else if (refinedWords.length < originalWords.length) {
      changes.push(
        `Removed ${originalWords.length - refinedWords.length} words`
      );
    }

    // Detect specific changes
    const originalSet = new Set(originalWords);
    const refinedSet = new Set(refinedWords);

    const added = Array.from(refinedSet).filter(w => !originalSet.has(w));
    const removed = Array.from(originalSet).filter(w => !refinedSet.has(w));

    if (added.length > 0) {
      changes.push(
        `Added: ${added.slice(0, 3).join(', ')}${added.length > 3 ? '...' : ''}`
      );
    }
    if (removed.length > 0) {
      changes.push(
        `Removed: ${removed.slice(0, 3).join(', ')}${removed.length > 3 ? '...' : ''}`
      );
    }

    return changes;
  }

  // Generate diff for visualization
  generateDiff(original: string, refined: string): DiffSegment[] {
    const diff: DiffSegment[] = [];
    const originalWords = original.split(/\s+/);
    const refinedWords = refined.split(/\s+/);

    // Simple diff algorithm (can be improved with proper LCS)
    let i = 0,
      j = 0;

    while (i < originalWords.length || j < refinedWords.length) {
      if (i >= originalWords.length) {
        // Remaining refined words are additions
        diff.push({
          type: 'added',
          text: refinedWords.slice(j).join(' ')
        });
        break;
      }

      if (j >= refinedWords.length) {
        // Remaining original words are removals
        diff.push({
          type: 'removed',
          text: originalWords.slice(i).join(' ')
        });
        break;
      }

      if (originalWords[i] === refinedWords[j]) {
        // Words match
        diff.push({
          type: 'unchanged',
          text: originalWords[i]
        });
        i++;
        j++;
      } else {
        // Look ahead for matches
        const nextOriginal = originalWords.indexOf(refinedWords[j], i);
        const nextRefined = refinedWords.indexOf(originalWords[i], j);

        if (nextOriginal !== -1 && nextOriginal - i <= 3) {
          // Original has extra words
          diff.push({
            type: 'removed',
            text: originalWords.slice(i, nextOriginal).join(' ')
          });
          i = nextOriginal;
        } else if (nextRefined !== -1 && nextRefined - j <= 3) {
          // Refined has extra words
          diff.push({
            type: 'added',
            text: refinedWords.slice(j, nextRefined).join(' ')
          });
          j = nextRefined;
        } else {
          // No close match, treat as replacement
          diff.push({
            type: 'removed',
            text: originalWords[i]
          });
          diff.push({
            type: 'added',
            text: refinedWords[j]
          });
          i++;
          j++;
        }
      }
    }

    return this.consolidateDiff(diff);
  }

  // Consolidate adjacent diff segments of the same type
  private consolidateDiff(diff: DiffSegment[]): DiffSegment[] {
    const consolidated: DiffSegment[] = [];

    for (const segment of diff) {
      const last = consolidated[consolidated.length - 1];

      if (last && last.type === segment.type) {
        last.text += ' ' + segment.text;
      } else {
        consolidated.push({ ...segment });
      }
    }

    return consolidated;
  }

  // Offline refinement fallback
  private offlineRefine(
    text: string,
    mode: RefinementMode,
    context?: string | null
  ): RefinementResult {
    let refined = text;
    const changes: string[] = [];

    switch (mode) {
      case 'expand':
        refined = this.offlineExpand(text);
        changes.push('Added descriptive details');
        break;

      case 'contract':
        refined = this.offlineContract(text);
        changes.push('Reduced to essentials');
        break;

      case 'correct':
        refined = this.offlineCorrect(text);
        changes.push('Fixed grammar issues');
        break;
    }

    if (mode === 'expand' && context) {
      const keywords = context
        .split(/\s+/)
        .filter(word => word.length > 5)
        .slice(0, 2);

      if (keywords.length > 0) {
        for (const keyword of keywords) {
          if (!refined.toLowerCase().includes(keyword.toLowerCase())) {
            refined = `${refined} ${keyword}`.trim();
          }
        }
        changes.push(`Added context cues: ${keywords.join(', ')}`);
      }
    }

    return {
      original: text,
      refined,
      changes,
      mode,
      confidence: 'low'
    };
  }

  // Offline expand - add common descriptive words
  private offlineExpand(text: string): string {
    const expansions: { [key: string]: string } = {
      car: 'sleek sports car',
      drifting: 'aggressively drifting',
      sunset: 'golden sunset',
      scene: 'dramatic scene',
      running: 'frantically running',
      explosion: 'massive explosion',
      building: 'towering building',
      street: 'debris-filled street'
    };

    let expanded = text;

    for (const [simple, detailed] of Object.entries(expansions)) {
      const regex = new RegExp(`\\b${simple}\\b`, 'gi');
      expanded = expanded.replace(regex, detailed);
    }

    return expanded;
  }

  // Offline contract - remove common filler words
  private offlineContract(text: string): string {
    const fillers = [
      'very',
      'really',
      'quite',
      'somewhat',
      'rather',
      'just',
      'actually',
      'basically',
      'literally',
      'beautiful',
      'amazing',
      'incredible',
      'awesome'
    ];

    let contracted = text;

    for (const filler of fillers) {
      const regex = new RegExp(`\\b${filler}\\s+`, 'gi');
      contracted = contracted.replace(regex, '');
    }

    // Remove duplicate spaces
    contracted = contracted.replace(/\s+/g, ' ').trim();

    return contracted;
  }

  // Offline correct - fix common grammar issues
  private offlineCorrect(text: string): string {
    const corrections: { [key: string]: string } = {
      dont: "don't",
      cant: "can't",
      wont: "won't",
      wasnt: "wasn't",
      arent: "aren't",
      isnt: "isn't",
      thats: "that's",
      its: "it's", // Context-dependent, but common
      'your welcome': "you're welcome",
      'there coming': "they're coming",
      'to much': 'too much',
      'to many': 'too many',
      alot: 'a lot',
      everytime: 'every time',
      eachother: 'each other'
    };

    let corrected = text;

    for (const [error, correction] of Object.entries(corrections)) {
      const regex = new RegExp(`\\b${error}\\b`, 'gi');
      corrected = corrected.replace(regex, correction);
    }

    // Fix common verb tense issues
    corrected = corrected.replace(/\b(\w+) don't (\w+s)\b/gi, "$1 doesn't $2");
    corrected = corrected.replace(/\b(\w+) was (\w+ing)\b/gi, '$1 were $2');

    // Capitalize first letter
    corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);

    // Ensure period at end if missing
    if (!/[.!?]$/.test(corrected)) {
      corrected += '.';
    }

    return corrected;
  }
}
