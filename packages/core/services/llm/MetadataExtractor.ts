// Metadata Extraction Service for Story 2.3a
// Provides automatic, background metadata extraction for segments and assets

import { LLMService } from './LLMService';

export interface MetadataTheme {
  name: string;
  confidence?: number;
}

export interface MetadataEntity {
  name: string;
  type?: string;
  confidence?: number;
}

export interface SegmentMetadata {
  subject?: string;
  action?: string;
  location?: string;
  mood?: string;
  intensity?: number; // 1-10
  summary?: string;
  tags: string[];
  style?: string[];
  themes?: MetadataTheme[];
  entities?: MetadataEntity[];
  raw?: unknown;
  fallbackReason?: string;
  extracted_by?: string;
  extraction_date?: string;
  consent_flag?: boolean;
}

export interface ExtractionResult {
  metadata: SegmentMetadata;
  extractionTime: number;
  fromCache: boolean;
}

type MetadataCompletionOptions = {
  responseFormat?: string;
  taskType?: string;
  maxTokens?: number;
};

type MetadataCompletionRequest = {
  prompt: string;
  maxTokens?: number;
  responseFormat?: string;
  taskType?: string;
};

type MetadataCompleteFn =
  | ((prompt: string, options?: MetadataCompletionOptions) => Promise<unknown>)
  | ((request: MetadataCompletionRequest) => Promise<unknown>);

type MetadataExtractionClient = {
  extractMetadata?: (payload: {
    content: string;
    includeEntities: boolean;
    includeThemes: boolean;
    includeStyle: boolean;
    maxTags: number;
  }) => Promise<unknown>;
  metadata?: (payload: string | Record<string, unknown>) => Promise<unknown>;
  complete?: MetadataCompleteFn;
};

type MetadataCompletionResponse = {
  content?: unknown;
  model?: string;
};

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
      location: 'desert',
      mood: 'desolate',
      intensity: 3,
      tags: ['desert', 'outdoor', 'landscape']
    });

    this.offlineCache.set('crowd panic', {
      subject: 'crowd',
      action: 'panic',
      mood: 'frantic',
      intensity: 10,
      tags: ['crowd', 'panic', 'emergency']
    });

    this.offlineCache.set('car drifting', {
      subject: 'sports car',
      action: 'drifting',
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

    const service = this.llmService as LLMService & MetadataExtractionClient;

    // Prefer dedicated metadata endpoints when available
    if (typeof service.extractMetadata === 'function') {
      try {
        const payload = await service.extractMetadata({
          content: text,
          includeEntities: true,
          includeThemes: true,
          includeStyle: true,
          maxTags: 8
        });
        const normalised = this.normalizeMetadataPayload(payload, text);
        if (normalised) {
          return normalised;
        }
      } catch (error) {
        console.debug('Dedicated extractMetadata call failed:', error);
      }
    } else if (typeof service.metadata === 'function') {
      try {
        const payload = await service.metadata({
          content: text,
          includeEntities: true,
          includeThemes: true,
          includeStyle: true,
          maxTags: 8
        });
        const normalised = this.normalizeMetadataPayload(payload, text);
        if (normalised) {
          return normalised;
        }
      } catch (error) {
        console.debug('LLM metadata API call failed:', error);
      }
    }

    const prompt = `Extract rich metadata from this narrative segment. Respond with JSON only.

Text: "${text}"

Output schema:
{
  "subject": "primary topic or entity",
  "action": "primary action or null",
  "location": "setting or null",
  "mood": "emotional tone or null",
  "intensity": 1-10,
  "summary": "one sentence summary",
  "style": ["style keyword", ...],
  "themes": [{"name": "descriptor", "confidence": 0-1}],
  "entities": [{"name": "entity", "type": "character|object|location|concept", "confidence": 0-1}],
  "tags": ["tag1", "tag2", "tag3"]
}`;

    if (typeof service.complete === 'function') {
      try {
        let response: unknown;
        const completeFn = service.complete as MetadataCompleteFn | undefined;
        if (!completeFn) {
          throw new Error('LLM completion function missing');
        }

        if (completeFn.length >= 2) {
          // API-based service signature: complete(prompt, options?)
          response = await (
            completeFn as (
              prompt: string,
              options?: MetadataCompletionOptions
            ) => Promise<unknown>
          )(prompt, {
            responseFormat: 'json',
            taskType: 'metadata',
            maxTokens: 220
          });
        } else {
          // Core service signature: complete(request)
          response = await (
            completeFn as (
              request: MetadataCompletionRequest
            ) => Promise<unknown>
          )({
            prompt,
            maxTokens: 220,
            responseFormat: 'json',
            taskType: 'metadata'
          });
        }

        const completionResponse = response as MetadataCompletionResponse;
        const payload =
          completionResponse.content !== undefined
            ? completionResponse.content
            : response;
        const normalised = this.normalizeMetadataPayload(
          payload,
          text,
          completionResponse.model ? { model: completionResponse.model } : {}
        );
        if (normalised) {
          return normalised;
        }
      } catch (error) {
        console.debug('LLM completion metadata extraction failed:', error);
      }
    }

    throw new Error('No response from LLM');
  }

  private normalizeMetadataPayload(
    payload: unknown,
    sourceText: string,
    context: { model?: string } = {}
  ): SegmentMetadata | null {
    if (payload === null || payload === undefined) {
      return null;
    }

    if (typeof payload === 'string') {
      const trimmed = payload.trim();
      if (!trimmed) {
        return null;
      }
      try {
        return this.normalizeMetadataPayload(
          JSON.parse(trimmed),
          sourceText,
          context
        );
      } catch (error) {
        console.debug('Failed to parse metadata payload string:', error);
        return null;
      }
    }

    if (typeof payload !== 'object') {
      return null;
    }

    const record = payload as Record<string, unknown>;
    const candidate =
      record.metadata && typeof record.metadata === 'object'
        ? (record.metadata as Record<string, unknown>)
        : record;

    const style = this.coerceStringArray(
      candidate.style ?? candidate.styles ?? candidate.genres
    );
    const themes = this.normalizeThemes(
      candidate.themes ?? candidate.topics ?? candidate.motifs
    );
    const entities = this.normalizeEntities(candidate.entities);

    let tags = this.coerceStringArray(
      candidate.tags ?? candidate.keywords ?? candidate.labels
    );
    if (!tags.length && themes.length > 0) {
      tags = themes.map(theme => theme.name);
    }
    if (!tags.length && entities.length > 0) {
      tags = entities.map(entity => entity.name);
    }

    const metadata: SegmentMetadata = {
      subject: this.coerceString(candidate.subject ?? candidate.topic),
      action: this.coerceString(candidate.action ?? candidate.intent),
      location: this.coerceString(candidate.location ?? candidate.setting),
      mood: this.coerceString(candidate.mood ?? candidate.tone),
      intensity: this.coerceNumber(candidate.intensity),
      summary: this.coerceString(candidate.summary ?? candidate.overview),
      style: style.length ? this.dedupeStrings(style).slice(0, 6) : undefined,
      tags: this.dedupeStrings(tags).slice(0, 8),
      themes: themes.length ? themes : undefined,
      entities: entities.length ? entities : undefined,
      raw: payload,
      extracted_by:
        this.coerceString(candidate.extracted_by ?? context.model) ||
        'llm-service',
      extraction_date:
        this.coerceString(candidate.extraction_date) ||
        new Date().toISOString(),
      consent_flag:
        'consent_flag' in candidate ? Boolean(candidate.consent_flag) : true
    };

    if (metadata.tags.length === 0) {
      const fallback = this.extractBasic(sourceText);
      metadata.tags = fallback.tags;
      metadata.fallbackReason = 'No tags returned from LLM';
    }

    if (!metadata.summary && typeof record.summary === 'string') {
      metadata.summary = this.coerceString(record.summary);
    }

    return metadata;
  }

  private coerceString(value: unknown): string | undefined {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }
    return undefined;
  }

  private coerceNumber(value: unknown): number | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }
    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(num)) {
      return undefined;
    }
    return Math.max(0, Math.min(10, num));
  }

  private normaliseConfidence(value: unknown): number | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }
    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(num)) {
      return undefined;
    }
    if (num > 1) {
      if (num <= 10) {
        return Math.max(0, Math.min(1, num / 10));
      }
      return Math.max(0, Math.min(1, num / 100));
    }
    return Math.max(0, Math.min(1, num));
  }

  private coerceStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value
        .map(entry => this.coerceString(entry))
        .filter((entry): entry is string => Boolean(entry));
    }
    if (typeof value === 'string') {
      return value
        .split(/[,;|]+/)
        .map(part => part.trim())
        .filter(Boolean);
    }
    return [];
  }

  private normalizeThemes(value: unknown): MetadataTheme[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .map(item => {
        if (typeof item === 'string') {
          const name = item.trim();
          return name ? { name } : null;
        }
        if (item && typeof item === 'object') {
          const record = item as Record<string, unknown>;
          const name = this.coerceString(
            record.name ?? record.label ?? record.topic
          );
          if (!name) {
            return null;
          }
          const confidence = this.normaliseConfidence(record.confidence);
          return confidence !== undefined ? { name, confidence } : { name };
        }
        return null;
      })
      .filter((entry): entry is MetadataTheme => Boolean(entry));
  }

  private normalizeEntities(value: unknown): MetadataEntity[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .map(item => {
        if (typeof item === 'string') {
          const name = item.trim();
          return name ? { name } : null;
        }
        if (item && typeof item === 'object') {
          const record = item as Record<string, unknown>;
          const name = this.coerceString(record.name ?? record.label);
          if (!name) {
            return null;
          }
          const type = this.coerceString(
            record.type ?? record.entityType ?? record.category
          );
          const confidence = this.normaliseConfidence(
            record.confidence ?? record.score
          );
          return {
            name,
            type: type || undefined,
            confidence
          };
        }
        return null;
      })
      .filter((entry): entry is MetadataEntity => Boolean(entry));
  }

  private dedupeStrings(values: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    values.forEach(value => {
      const key = value.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(value);
      }
    });
    return result;
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

    const uniqueTags = this.dedupeStrings(tags);
    const inferredThemes: MetadataTheme[] = uniqueTags.map(tag => ({
      name: tag
    }));

    return {
      tags: uniqueTags.slice(0, 5),
      mood,
      intensity,
      themes: inferredThemes.slice(0, 3),
      fallbackReason: 'basic-fallback',
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
        const tags = this.dedupeStrings(metadata.tags || []);
        const themes =
          Array.isArray(metadata.themes) && metadata.themes.length > 0
            ? metadata.themes
            : tags.map(tag => ({ name: tag }));
        return {
          ...metadata,
          tags: tags.slice(0, 5),
          themes: themes.slice(0, 3),
          extracted_by: 'offline-cache',
          extraction_date: new Date().toISOString(),
          consent_flag: true,
          fallbackReason: 'offline-cache'
        };
      }
    }

    return null;
  }

  private checkCache(text: string): SegmentMetadata | null {
    const entry = this.cache.get(text);
    if (!entry) {
      return null;
    }

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
      if (firstKey) {
        this.cache.delete(firstKey);
      }
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
