// Metadata Extraction Service for Story 2.3a
// Provides automatic, background metadata extraction for segments and assets

import { LLMService } from './LLMService';

export interface SegmentMetadata {
  subject?: string;
  action?: string;
  location?: string;
  mood?: string;
  intensity?: number; // 1-10
  tags: string[];
  extracted_by?: string;
  extraction_date?: string;
  consent_flag?: boolean;
}

export interface ExtractionResult {
  metadata: SegmentMetadata;
  extractionTime: number;
  fromCache: boolean;
}

interface CacheEntry {
  metadata: SegmentMetadata;
  timestamp: number;
  ttl: number;
}

export class MetadataExtractor {
  private cache = new Map<string, CacheEntry>();
  private extractionQueue: Array<{
    text: string;
    resolve: (result: ExtractionResult) => void;
  }> = [];
  private isProcessing = false;
  private llmService: LLMService | null = null;
  private offlineCache = new Map<string, SegmentMetadata>();

  constructor(llmService?: LLMService) {
    this.llmService = llmService || null;
    this.initializeOfflineCache();
  }

  private initializeOfflineCache(): void {
    // Pre-cached metadata for common scenarios (demo reliability)
    this.offlineCache.set('urban chaos', {
      subject: 'city street',
      action: 'chaos',
      location: 'urban',
      mood: 'tense',
      intensity: 9,
      tags: ['urban', 'chaos', 'crowd']
    });

    this.offlineCache.set('desert scene', {
      subject: 'landscape',
      action: null,
      location: 'desert',
      mood: 'desolate',
      intensity: 3,
      tags: ['desert', 'outdoor', 'landscape']
    });

    this.offlineCache.set('crowd panic', {
      subject: 'crowd',
      action: 'panic',
      location: null,
      mood: 'frantic',
      intensity: 10,
      tags: ['crowd', 'panic', 'emergency']
    });

    this.offlineCache.set('car drifting', {
      subject: 'sports car',
      action: 'drifting',
      location: null,
      mood: 'intense',
      intensity: 8,
      tags: ['vehicle', 'action', 'speed']
    });
  }

  async extractInBackground(text: string): Promise<void> {
    // Fire and forget - no UI blocking
    this.extract(text).catch(error => {
      // Silent failure - no user notification
      console.debug('Background metadata extraction failed:', error);
    });
  }

  async extract(text: string): Promise<ExtractionResult> {
    const startTime = performance.now();

    // Check cache first
    const cached = this.checkCache(text);
    if (cached) {
      return {
        metadata: cached,
        extractionTime: performance.now() - startTime,
        fromCache: true
      };
    }

    // Try offline matching for common patterns
    const offlineMetadata = this.matchOfflinePattern(text);
    if (offlineMetadata) {
      this.cacheMetadata(text, offlineMetadata, 3600000); // 1 hour
      return {
        metadata: offlineMetadata,
        extractionTime: performance.now() - startTime,
        fromCache: false
      };
    }

    // Use LLM if available
    if (this.llmService) {
      try {
        const metadata = await this.extractWithLLM(text);
        this.cacheMetadata(text, metadata, 3600000);
        return {
          metadata,
          extractionTime: performance.now() - startTime,
          fromCache: false
        };
      } catch (error) {
        console.debug('LLM extraction failed, using fallback:', error);
      }
    }

    // Fallback to basic extraction
    const fallbackMetadata = this.extractBasic(text);
    this.cacheMetadata(text, fallbackMetadata, 1800000); // 30 min for fallback
    return {
      metadata: fallbackMetadata,
      extractionTime: performance.now() - startTime,
      fromCache: false
    };
  }

  private async extractWithLLM(text: string): Promise<SegmentMetadata> {
    if (!this.llmService) {
      throw new Error('LLM service not available');
    }

    const prompt = `Extract key metadata from this text segment. Output JSON only:
    
Text: "${text}"

Output format:
{
  "subject": "main topic or entity",
  "action": "primary action or null",
  "location": "setting or null",
  "mood": "emotional tone or null",
  "intensity": 1-10 scale,
  "tags": ["tag1", "tag2", "tag3"]
}

Keep tags limited to 3 maximum. Be concise.`;

    const response = await this.llmService.complete({
      prompt,
      maxTokens: 100,
      responseFormat: 'json',
      taskType: 'metadata'
    });

    if (!response?.content) {
      throw new Error('No response from LLM');
    }

    const parsed = JSON.parse(response.content);

    return {
      subject: parsed.subject || undefined,
      action: parsed.action || undefined,
      location: parsed.location || undefined,
      mood: parsed.mood || undefined,
      intensity: parsed.intensity || undefined,
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 3) : [],
      extracted_by: response.model,
      extraction_date: new Date().toISOString(),
      consent_flag: true
    };
  }

  private extractBasic(text: string): SegmentMetadata {
    const words = text.toLowerCase().split(/\s+/);
    const tags: string[] = [];

    // Basic keyword detection
    if (words.some(w => ['car', 'vehicle', 'truck'].includes(w))) {
      tags.push('vehicle');
    }
    if (words.some(w => ['city', 'urban', 'street'].includes(w))) {
      tags.push('urban');
    }
    if (words.some(w => ['desert', 'sand', 'dune'].includes(w))) {
      tags.push('desert');
    }
    if (words.some(w => ['run', 'jump', 'drift', 'chase'].includes(w))) {
      tags.push('action');
    }
    if (words.some(w => ['crowd', 'people', 'group'].includes(w))) {
      tags.push('crowd');
    }

    // Detect mood from keywords
    let mood: string | undefined;
    let intensity = 5;

    if (words.some(w => ['panic', 'chaos', 'frantic'].includes(w))) {
      mood = 'frantic';
      intensity = 9;
    } else if (words.some(w => ['calm', 'peaceful', 'serene'].includes(w))) {
      mood = 'peaceful';
      intensity = 2;
    } else if (
      words.some(w => ['intense', 'extreme', 'dramatic'].includes(w))
    ) {
      mood = 'intense';
      intensity = 8;
    }

    return {
      tags: tags.slice(0, 3),
      mood,
      intensity,
      extracted_by: 'basic-fallback',
      extraction_date: new Date().toISOString(),
      consent_flag: true
    };
  }

  private matchOfflinePattern(text: string): SegmentMetadata | null {
    const lowerText = text.toLowerCase();

    // Check for exact or partial matches in offline cache
    for (const [pattern, metadata] of this.offlineCache.entries()) {
      if (lowerText.includes(pattern)) {
        return {
          ...metadata,
          extracted_by: 'offline-cache',
          extraction_date: new Date().toISOString(),
          consent_flag: true
        };
      }
    }

    return null;
  }

  private checkCache(text: string): SegmentMetadata | null {
    const entry = this.cache.get(text);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(text);
      return null;
    }

    return entry.metadata;
  }

  private cacheMetadata(
    text: string,
    metadata: SegmentMetadata,
    ttl: number
  ): void {
    // Limit cache size
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(text, {
      metadata,
      timestamp: Date.now(),
      ttl
    });
  }

  async extractBatch(texts: string[]): Promise<ExtractionResult[]> {
    // Process up to 5 texts in batch
    const batch = texts.slice(0, 5);
    const results = await Promise.all(batch.map(text => this.extract(text)));
    return results;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; hitRate: number } {
    // This would track actual hit rate in production
    return {
      size: this.cache.size,
      hitRate: 0.75 // Mock for now
    };
  }

  // Search enhancement - convert natural language to metadata filters
  parseSearchQuery(query: string): {
    filters: Partial<SegmentMetadata>;
    keywords: string[];
  } {
    const lowerQuery = query.toLowerCase();
    const filters: Partial<SegmentMetadata> = {};
    const keywords: string[] = [];

    // Extract location filters
    if (lowerQuery.includes('urban') || lowerQuery.includes('city')) {
      filters.location = 'urban';
    } else if (lowerQuery.includes('desert')) {
      filters.location = 'desert';
    }

    // Extract mood filters
    if (lowerQuery.includes('intense') || lowerQuery.includes('dramatic')) {
      filters.mood = 'intense';
    } else if (lowerQuery.includes('calm') || lowerQuery.includes('peaceful')) {
      filters.mood = 'peaceful';
    } else if (lowerQuery.includes('tense') || lowerQuery.includes('frantic')) {
      filters.mood = 'frantic';
    }

    // Extract action keywords
    if (lowerQuery.includes('action')) {
      filters.action = '*'; // Wildcard for any action
    }

    // Extract remaining keywords
    const words = query
      .split(/\s+/)
      .filter(
        word =>
          ![
            'urban',
            'city',
            'desert',
            'intense',
            'dramatic',
            'calm',
            'peaceful',
            'tense',
            'frantic',
            'action',
            'scene',
            'with'
          ].includes(word.toLowerCase())
      );
    keywords.push(...words);

    return { filters, keywords };
  }

  // Calculate relevance score for search results
  calculateRelevance(
    metadata: SegmentMetadata,
    filters: Partial<SegmentMetadata>
  ): number {
    let score = 0;
    let maxScore = 0;

    // Subject match
    if (filters.subject) {
      maxScore += 3;
      if (
        metadata.subject?.toLowerCase().includes(filters.subject.toLowerCase())
      ) {
        score += 3;
      }
    }

    // Location match
    if (filters.location) {
      maxScore += 2;
      if (metadata.location === filters.location) {
        score += 2;
      }
    }

    // Mood match
    if (filters.mood) {
      maxScore += 2;
      if (metadata.mood === filters.mood) {
        score += 2;
      }
    }

    // Action match (wildcard support)
    if (filters.action) {
      maxScore += 2;
      if (filters.action === '*' && metadata.action) {
        score += 2;
      } else if (metadata.action === filters.action) {
        score += 2;
      }
    }

    // Tag matches
    if (filters.tags && metadata.tags) {
      maxScore += filters.tags.length;
      for (const tag of filters.tags) {
        if (metadata.tags.includes(tag)) {
          score += 1;
        }
      }
    }

    return maxScore > 0 ? score / maxScore : 0;
  }
}
