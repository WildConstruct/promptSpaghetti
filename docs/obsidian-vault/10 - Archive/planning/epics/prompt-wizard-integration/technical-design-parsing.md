# Technical Design: Prompt Parsing Algorithm

**Component:** Prompt Wizard Parser  
**Version:** 1.0.0  
**Author:** Sarah (Product Owner) with Engineering  
**Status:** DRAFT

---

## 1. Overview

The Prompt Parsing Algorithm is responsible for converting natural language prompts into structured spans that can be mapped to PSG nodes. This document details the technical implementation approach for achieving <150ms parsing performance on 400-token prompts.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Main Thread                           │
│  ┌─────────────┐                                        │
│  │ WizardPanel │                                        │
│  └──────┬──────┘                                        │
│         │ postMessage({prompt, options})                │
│         ▼                                                │
│  ┌─────────────────────────────────────┐               │
│  │   Parser Controller                  │               │
│  │  - Queue management                  │               │
│  │  - Result caching                    │               │
│  │  - Error handling                    │               │
│  └──────┬───────────────────────────────┘               │
└─────────┼────────────────────────────────────────────────┘
          │ 
          ▼ Web Worker Boundary
┌─────────────────────────────────────────────────────────┐
│                    Worker Thread                         │
│  ┌─────────────────────────────────────┐               │
│  │   Parsing Pipeline                   │               │
│  │                                      │               │
│  │  1. Tokenization                     │               │
│  │  2. Segmentation                     │               │
│  │  3. Classification                   │               │
│  │  4. Validation                       │               │
│  │  5. Assembly                         │               │
│  └──────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Core Algorithm

### 3.1 Tokenization Phase

```typescript
interface Token {
  text: string;
  start: number;
  end: number;
  type: 'word' | 'punct' | 'space' | 'quote';
  metadata?: {
    isConjunction?: boolean;
    isArticle?: boolean;
    isPossessive?: boolean;
  };
}

class Tokenizer {
  private static readonly CONJUNCTIONS = new Set([
    'and', 'or', 'but', 'nor', 'for', 'yet', 'so',
    'with', 'without', 'against', 'versus'
  ]);

  private static readonly ARTICLES = new Set([
    'a', 'an', 'the'
  ]);

  tokenize(text: string): Token[] {
    const tokens: Token[] = [];
    const regex = /(\w+(?:'\w+)?)|("[^"]*")|([.,;:!?])|(\s+)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const [fullMatch, word, quoted, punct, space] = match;
      
      let type: Token['type'];
      if (word) type = 'word';
      else if (quoted) type = 'quote';
      else if (punct) type = 'punct';
      else type = 'space';

      const token: Token = {
        text: fullMatch,
        start: match.index,
        end: match.index + fullMatch.length,
        type
      };

      // Add metadata for words
      if (type === 'word') {
        const lower = word.toLowerCase();
        token.metadata = {
          isConjunction: Tokenizer.CONJUNCTIONS.has(lower),
          isArticle: Tokenizer.ARTICLES.has(lower),
          isPossessive: word.includes("'s") || word.includes("s'")
        };
      }

      tokens.push(token);
    }

    return tokens;
  }
}
```

### 3.2 Segmentation Phase

```typescript
interface Segment {
  tokens: Token[];
  start: number;
  end: number;
  confidence: number;
  splitReason?: 'comma' | 'conjunction' | 'sentence' | 'parenthetical';
}

class Segmenter {
  private static readonly MIN_SEGMENT_LENGTH = 2; // tokens
  private static readonly MAX_SEGMENT_LENGTH = 15; // tokens

  segment(tokens: Token[]): Segment[] {
    const segments: Segment[] = [];
    let currentSegment: Token[] = [];
    let segmentStart = 0;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const nextToken = tokens[i + 1];
      
      currentSegment.push(token);

      // Check for split conditions
      const shouldSplit = this.shouldSplit(token, nextToken, currentSegment);
      
      if (shouldSplit.split) {
        // Filter out pure whitespace/punctuation segments
        const meaningfulTokens = currentSegment.filter(t => 
          t.type === 'word' || t.type === 'quote'
        );

        if (meaningfulTokens.length >= Segmenter.MIN_SEGMENT_LENGTH) {
          segments.push({
            tokens: currentSegment,
            start: segmentStart,
            end: token.end,
            confidence: shouldSplit.confidence,
            splitReason: shouldSplit.reason
          });
        }

        currentSegment = [];
        segmentStart = nextToken?.start || token.end;
      }
    }

    // Handle remaining tokens
    if (currentSegment.length > 0) {
      const meaningfulTokens = currentSegment.filter(t => 
        t.type === 'word' || t.type === 'quote'
      );
      
      if (meaningfulTokens.length >= Segmenter.MIN_SEGMENT_LENGTH) {
        segments.push({
          tokens: currentSegment,
          start: segmentStart,
          end: currentSegment[currentSegment.length - 1].end,
          confidence: 0.7
        });
      }
    }

    return this.mergeShortSegments(segments);
  }

  private shouldSplit(
    current: Token, 
    next: Token | undefined,
    segment: Token[]
  ): { split: boolean; confidence: number; reason?: Segment['splitReason'] } {
    
    // Don't split quoted text
    if (current.type === 'quote') {
      return { split: false, confidence: 1.0 };
    }

    // Split on commas (high confidence)
    if (current.type === 'punct' && current.text === ',') {
      return { split: true, confidence: 0.9, reason: 'comma' };
    }

    // Split on conjunctions (medium confidence)
    if (current.metadata?.isConjunction && segment.length > 2) {
      return { split: true, confidence: 0.7, reason: 'conjunction' };
    }

    // Split on sentence boundaries
    if (current.type === 'punct' && '.!?'.includes(current.text)) {
      return { split: true, confidence: 0.95, reason: 'sentence' };
    }

    // Don't split if segment is too short
    if (segment.length < Segmenter.MIN_SEGMENT_LENGTH) {
      return { split: false, confidence: 0.3 };
    }

    // Split if segment is getting too long
    if (segment.length > Segmenter.MAX_SEGMENT_LENGTH) {
      return { split: true, confidence: 0.6, reason: 'conjunction' };
    }

    return { split: false, confidence: 0.5 };
  }

  private mergeShortSegments(segments: Segment[]): Segment[] {
    const merged: Segment[] = [];
    
    for (let i = 0; i < segments.length; i++) {
      const current = segments[i];
      const next = segments[i + 1];
      
      // Merge single-word segments with neighbors
      if (current.tokens.filter(t => t.type === 'word').length === 1 && next) {
        next.tokens = [...current.tokens, ...next.tokens];
        next.start = current.start;
        next.confidence = Math.min(current.confidence, next.confidence);
      } else {
        merged.push(current);
      }
    }
    
    return merged;
  }
}
```

### 3.3 Classification Phase

```typescript
type SpanType = 
  | 'Subject' 
  | 'Style' 
  | 'Lighting' 
  | 'Optics' 
  | 'Color/Tonality'
  | 'Composition' 
  | 'Mood' 
  | 'Background/Location' 
  | 'Era/Reference' 
  | 'Process/Medium';

interface ClassificationRule {
  keywords: string[];
  patterns?: RegExp[];
  type: SpanType;
  weight: number;
}

class Classifier {
  private static readonly RULES: ClassificationRule[] = [
    {
      keywords: ['portrait', 'man', 'woman', 'person', 'people', 'face', 'figure'],
      patterns: [/\b(young|old|elderly|child|baby)\s+\w+/i],
      type: 'Subject',
      weight: 1.0
    },
    {
      keywords: ['cinematic', 'artistic', 'documentary', 'fashion', 'editorial'],
      type: 'Style',
      weight: 0.9
    },
    {
      keywords: ['lighting', 'light', 'bright', 'dark', 'shadows', 'highlights'],
      patterns: [/\b(soft|hard|natural|artificial)\s+light/i],
      type: 'Lighting',
      weight: 0.9
    },
    {
      keywords: ['lens', 'camera', 'shot', 'focus', 'bokeh', 'dof', 'aperture'],
      patterns: [/\d+mm/, /f\/[\d.]+/],
      type: 'Optics',
      weight: 0.95
    },
    {
      keywords: ['color', 'black', 'white', 'warm', 'cool', 'tones', 'palette'],
      patterns: [/\bb&w\b/i, /black\s+and\s+white/i],
      type: 'Color/Tonality',
      weight: 0.85
    },
    {
      keywords: ['composition', 'angle', 'close-up', 'wide', 'medium', 'profile'],
      patterns: [/\b(low|high|dutch)\s+angle/i],
      type: 'Composition',
      weight: 0.8
    },
    {
      keywords: ['mood', 'feeling', 'emotion', 'happy', 'sad', 'dramatic', 'peaceful'],
      type: 'Mood',
      weight: 0.75
    },
    {
      keywords: ['background', 'backdrop', 'location', 'setting', 'environment'],
      patterns: [/\b(indoor|outdoor|studio)\b/i],
      type: 'Background/Location',
      weight: 0.8
    },
    {
      keywords: ['vintage', 'retro', 'modern', 'classical', 'contemporary'],
      patterns: [/\b\d{4}s?\b/, /\b(era|period|style)\b/i],
      type: 'Era/Reference',
      weight: 0.7
    },
    {
      keywords: ['grain', 'film', 'digital', 'texture', 'filter', 'effect'],
      type: 'Process/Medium',
      weight: 0.75
    }
  ];

  classify(segment: Segment): { type: SpanType; confidence: number } {
    const text = segment.tokens
      .filter(t => t.type === 'word')
      .map(t => t.text)
      .join(' ')
      .toLowerCase();

    const scores = new Map<SpanType, number>();

    for (const rule of Classifier.RULES) {
      let score = 0;

      // Check keywords
      for (const keyword of rule.keywords) {
        if (text.includes(keyword)) {
          score += rule.weight;
        }
      }

      // Check patterns
      if (rule.patterns) {
        for (const pattern of rule.patterns) {
          if (pattern.test(text)) {
            score += rule.weight * 1.2; // Pattern matches are stronger
          }
        }
      }

      if (score > 0) {
        scores.set(rule.type, (scores.get(rule.type) || 0) + score);
      }
    }

    // Find highest scoring type
    let bestType: SpanType = 'Style'; // default
    let bestScore = 0;

    for (const [type, score] of scores) {
      if (score > bestScore) {
        bestScore = score;
        bestType = type;
      }
    }

    // Calculate confidence based on score strength
    const confidence = Math.min(1.0, bestScore / 2.0);

    return { type: bestType, confidence };
  }
}
```

### 3.4 Span Assembly Phase

```typescript
interface Span {
  id: string;
  text: string;
  start: number;
  end: number;
  type: SpanType;
  confidence: number;
  randomize: boolean;
  metadata: {
    tokens: number[];
    originalText: string;
    splitReason?: string;
  };
}

class SpanAssembler {
  private static readonly RANDOMIZE_KEYWORDS = new Set([
    'various', 'different', 'multiple', 'diverse', 'mixed',
    'random', 'any', 'some', 'several'
  ]);

  assemble(
    segments: Segment[], 
    classifications: Map<Segment, { type: SpanType; confidence: number }>,
    originalText: string
  ): Span[] {
    const spans: Span[] = [];

    segments.forEach((segment, index) => {
      const classification = classifications.get(segment)!;
      const text = this.extractText(segment, originalText);
      
      const span: Span = {
        id: `span_${index + 1}`,
        text: text.trim(),
        start: segment.start,
        end: segment.end,
        type: classification.type,
        confidence: segment.confidence * classification.confidence,
        randomize: this.shouldRandomize(text, classification.type),
        metadata: {
          tokens: segment.tokens.map((t, i) => i),
          originalText: text,
          splitReason: segment.splitReason
        }
      };

      spans.push(span);
    });

    return this.mergeAdjacentSpans(spans);
  }

  private extractText(segment: Segment, originalText: string): string {
    return originalText.slice(segment.start, segment.end);
  }

  private shouldRandomize(text: string, type: SpanType): boolean {
    // Check for randomization keywords
    const lower = text.toLowerCase();
    for (const keyword of SpanAssembler.RANDOMIZE_KEYWORDS) {
      if (lower.includes(keyword)) {
        return true;
      }
    }

    // Certain types are more likely to be randomized
    const randomizableTypes: SpanType[] = [
      'Optics', 
      'Color/Tonality', 
      'Process/Medium',
      'Mood'
    ];

    return randomizableTypes.includes(type);
  }

  private mergeAdjacentSpans(spans: Span[]): Span[] {
    const merged: Span[] = [];
    
    for (let i = 0; i < spans.length; i++) {
      const current = spans[i];
      const next = spans[i + 1];
      
      // Merge adjacent spans of the same type
      if (next && 
          current.type === next.type && 
          current.end === next.start &&
          current.randomize === next.randomize) {
        
        next.text = current.text + next.text;
        next.start = current.start;
        next.confidence = Math.min(current.confidence, next.confidence);
        next.metadata.tokens = [...current.metadata.tokens, ...next.metadata.tokens];
      } else {
        merged.push(current);
      }
    }
    
    return merged;
  }
}
```

### 3.5 Main Parser Class

```typescript
class PromptParser {
  private tokenizer: Tokenizer;
  private segmenter: Segmenter;
  private classifier: Classifier;
  private assembler: SpanAssembler;

  constructor() {
    this.tokenizer = new Tokenizer();
    this.segmenter = new Segmenter();
    this.classifier = new Classifier();
    this.assembler = new SpanAssembler();
  }

  parse(prompt: string, options?: ParseOptions): ParseResult {
    const startTime = performance.now();

    try {
      // Step 1: Tokenization
      const tokens = this.tokenizer.tokenize(prompt);
      
      // Step 2: Segmentation
      const segments = this.segmenter.segment(tokens);
      
      // Step 3: Classification
      const classifications = new Map();
      for (const segment of segments) {
        classifications.set(segment, this.classifier.classify(segment));
      }
      
      // Step 4: Assembly
      const spans = this.assembler.assemble(segments, classifications, prompt);
      
      // Step 5: Validation
      const validated = this.validate(spans, prompt);
      
      const endTime = performance.now();
      
      return {
        success: true,
        spans: validated,
        parseTime: endTime - startTime,
        tokenCount: tokens.filter(t => t.type === 'word').length,
        metadata: {
          version: '1.0.0',
          timestamp: Date.now(),
          options
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        parseTime: performance.now() - startTime,
        spans: []
      };
    }
  }

  private validate(spans: Span[], originalText: string): Span[] {
    // Remove overlapping spans
    const sorted = [...spans].sort((a, b) => a.start - b.start);
    const validated: Span[] = [];
    
    for (const span of sorted) {
      const lastValid = validated[validated.length - 1];
      
      // Check for overlap
      if (!lastValid || span.start >= lastValid.end) {
        validated.push(span);
      } else if (span.confidence > lastValid.confidence) {
        // Replace with higher confidence span
        validated[validated.length - 1] = span;
      }
    }
    
    // Ensure spans cover significant portion of text
    const coverage = validated.reduce((sum, s) => sum + (s.end - s.start), 0);
    const minCoverage = originalText.length * 0.3;
    
    if (coverage < minCoverage) {
      console.warn(`Low coverage: ${coverage}/${originalText.length} characters`);
    }
    
    return validated;
  }
}
```

---

## 4. Performance Optimization

### 4.1 Web Worker Implementation

```typescript
// parser.worker.ts
let parser: PromptParser | null = null;

self.addEventListener('message', async (event) => {
  const { type, payload, id } = event.data;

  switch (type) {
    case 'INIT':
      parser = new PromptParser();
      self.postMessage({ type: 'READY', id });
      break;

    case 'PARSE':
      if (!parser) {
        self.postMessage({ 
          type: 'ERROR', 
          error: 'Parser not initialized',
          id 
        });
        return;
      }

      const result = parser.parse(payload.prompt, payload.options);
      self.postMessage({ type: 'RESULT', result, id });
      break;

    case 'TERMINATE':
      parser = null;
      self.close();
      break;
  }
});
```

### 4.2 Caching Strategy

```typescript
class ParserCache {
  private cache: Map<string, ParseResult>;
  private maxSize: number;
  private accessOrder: string[];

  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.accessOrder = [];
  }

  get(prompt: string): ParseResult | null {
    const key = this.hash(prompt);
    const result = this.cache.get(key);
    
    if (result) {
      // Update access order for LRU
      this.accessOrder = this.accessOrder.filter(k => k !== key);
      this.accessOrder.push(key);
    }
    
    return result || null;
  }

  set(prompt: string, result: ParseResult): void {
    const key = this.hash(prompt);
    
    // Evict least recently used if at capacity
    if (this.cache.size >= this.maxSize) {
      const lru = this.accessOrder.shift();
      if (lru) this.cache.delete(lru);
    }
    
    this.cache.set(key, result);
    this.accessOrder.push(key);
  }

  private hash(prompt: string): string {
    // Simple hash for cache key
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }
}
```

---

## 5. Performance Benchmarks

### Target Metrics

| Metric | Target | Measured | Status |
|--------|--------|----------|--------|
| Parse time (100 tokens) | < 50ms | TBD | 🟡 |
| Parse time (400 tokens) | < 150ms | TBD | 🟡 |
| Memory usage | < 10MB | TBD | 🟡 |
| Cache hit rate | > 60% | TBD | 🟡 |
| Accuracy (F1 score) | > 0.75 | TBD | 🟡 |

### Test Prompts

```typescript
const TEST_PROMPTS = [
  // Simple (< 50 tokens)
  "A happy dog playing in the park during sunset",
  
  // Medium (100-200 tokens)
  "Cinematic portrait of a young woman in vintage clothing, soft natural lighting, shot on 35mm film with shallow depth of field, warm color grading",
  
  // Complex (300-400 tokens)
  "Ethereal fashion photography of an elegant model in flowing white silk dress with delicate embroidery, standing in a misty forest at dawn, surrounded by ancient trees with gnarled branches reaching toward a pale sky, soft diffused lighting filtering through the fog creating a dreamlike atmosphere, shot on medium format Hasselblad with 80mm lens at f/2.8 for creamy bokeh, subtle grain and vintage color processing reminiscent of 1970s editorial photography, with muted earth tones and desaturated highlights"
];
```

---

## 6. Error Handling

### Error Types

```typescript
enum ParseErrorType {
  INVALID_INPUT = 'INVALID_INPUT',
  TIMEOUT = 'TIMEOUT',
  MEMORY_EXCEEDED = 'MEMORY_EXCEEDED',
  WORKER_ERROR = 'WORKER_ERROR'
}

class ParseError extends Error {
  constructor(
    public type: ParseErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ParseError';
  }
}
```

### Recovery Strategies

1. **Invalid Input**: Return empty spans, show user-friendly message
2. **Timeout**: Fallback to simpler segmentation algorithm
3. **Memory Exceeded**: Clear cache, restart worker
4. **Worker Error**: Recreate worker, retry once

---

## 7. Testing Strategy

### Unit Tests

```typescript
describe('PromptParser', () => {
  describe('Tokenization', () => {
    it('should handle quoted text as single token', () => {
      const tokens = tokenizer.tokenize('"hello world" test');
      expect(tokens[0].type).toBe('quote');
      expect(tokens[0].text).toBe('"hello world"');
    });

    it('should identify conjunctions', () => {
      const tokens = tokenizer.tokenize('cats and dogs');
      expect(tokens[2].metadata?.isConjunction).toBe(true);
    });
  });

  describe('Segmentation', () => {
    it('should split on commas', () => {
      const segments = segmenter.segment(tokens);
      expect(segments).toHaveLength(3);
    });

    it('should preserve quoted phrases', () => {
      const text = 'Use "exact phrase", then continue';
      const segments = segmenter.segment(tokenizer.tokenize(text));
      expect(segments[0].tokens.some(t => t.text === '"exact phrase"')).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should parse 400 tokens in < 150ms', () => {
      const start = performance.now();
      parser.parse(COMPLEX_PROMPT);
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(150);
    });
  });
});
```

---

## 8. Future Enhancements

### Phase 2 (v1.1)
- Machine learning model for classification
- Semantic similarity matching
- Multi-language support
- Custom training on user corrections

### Phase 3 (v2.0)
- Contextual understanding (relationships between spans)
- Style transfer detection
- Automatic alternative generation
- Real-time collaborative parsing

---

## 9. Implementation Checklist

- [ ] Implement tokenizer with comprehensive regex
- [ ] Build segmentation algorithm with tunable parameters
- [ ] Create classification rule engine
- [ ] Develop span assembly and validation
- [ ] Set up Web Worker infrastructure
- [ ] Implement caching layer
- [ ] Add performance monitoring
- [ ] Create comprehensive test suite
- [ ] Document API and usage examples
- [ ] Benchmark against test dataset

---

**Next Steps:**
1. Review with engineering team
2. Prototype tokenizer and segmenter
3. Gather test prompt dataset
4. Establish performance baseline
5. Iterate on classification rules