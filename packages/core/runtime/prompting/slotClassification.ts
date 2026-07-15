/**
 * Heuristic semantic-slot classification for prompt segments.
 * Used by draft-graph fallback and as a baseline when model plans omit slots.
 */
import type { PromptSegment } from './PromptSegmentation';
import type { DraftSlotAnalysis } from '../../services/agenticGraph';

export type SlotType = DraftSlotAnalysis['slotType'];
export type DomainHint = NonNullable<DraftSlotAnalysis['domainHints']>[number];

const SLOT_RULES: Array<{
  slot: Exclude<SlotType, 'unknown'>;
  patterns: RegExp[];
  weight: number;
}> = [
  {
    slot: 'camera',
    patterns: [
      /\b(camera|lens|aperture|focal|pov|close-?up|wide[\s-]?shot|dutch angle|tracking shot)\b/i
    ],
    weight: 0.92
  },
  {
    slot: 'lighting',
    patterns: [
      /\b(light(?:ing)?|glow|shadow|neon|golden hour|blue hour|rim light|backlit|illuminat)/i
    ],
    weight: 0.9
  },
  {
    slot: 'composition',
    patterns: [
      /\b(composition|framing|rule of thirds|centered|symmetr|foreground|background|depth of field)\b/i
    ],
    weight: 0.85
  },
  {
    slot: 'style-medium',
    patterns: [
      /\b(oil paint|watercolor|illustration|photograph|render|anime|noir|cyberpunk|style|medium)\b/i
    ],
    weight: 0.88
  },
  {
    slot: 'mood',
    patterns: [
      /\b(mood|atmosphere|tense|serene|melanchol|haunting|cheerful|ominous|gritty|moody)\b/i
    ],
    weight: 0.86
  },
  {
    slot: 'constraint',
    patterns: [
      /\b(must not|avoid|without|no\s+\w+|constraint|limit|only|never)\b/i
    ],
    weight: 0.8
  },
  {
    slot: 'action',
    patterns: [
      /\b(running|walking|fighting|flying|holding|wearing|standing|sitting|gesture|motion|action|dives|soars)\b/i
    ],
    weight: 0.82
  },
  {
    slot: 'setting',
    patterns: [
      /\b(street|city|forest|room|interior|exterior|landscape|weather|rain|fog|desert|harbor|backdrop|scene)\b/i
    ],
    weight: 0.84
  },
  {
    slot: 'appearance',
    patterns: [
      /\b(hair|face|eyes|clothing|armor|outfit|wearing|beard|silhouette|physique|scar)\b/i
    ],
    weight: 0.83
  },
  {
    slot: 'subject',
    patterns: [
      /\b(man|woman|person|character|hero|villain|creature|monster|truck|car|vehicle|soldier|child)\b/i
    ],
    weight: 0.78
  }
];

const DOMAIN_RULES: Array<{ domain: DomainHint; patterns: RegExp[] }> = [
  { domain: 'vehicle', patterns: [/\b(truck|car|vehicle|motorcycle|engine|tire)\b/i] },
  { domain: 'building', patterns: [/\b(building|storefront|architecture|facade|tower)\b/i] },
  {
    domain: 'environment',
    patterns: [/\b(forest|street|city|rain|fog|landscape|weather|harbor)\b/i]
  },
  { domain: 'crowd', patterns: [/\b(crowd|audience|group of|extras)\b/i] },
  { domain: 'creature', patterns: [/\b(creature|monster|beast|dragon)\b/i] },
  { domain: 'object', patterns: [/\b(weapon|sword|gun|tool|prop|item)\b/i] },
  {
    domain: 'character',
    patterns: [/\b(man|woman|person|portrait|face|hair|hero)\b/i]
  },
  { domain: 'abstract', patterns: [/\b(abstract|symbolic|metaphor)\b/i] }
];

const TONE_HINTS = [
  'gritty',
  'comic',
  'cinematic',
  'moody',
  'heroic',
  'haunted',
  'brutal',
  'playful',
  'surreal',
  'noir',
  'neon'
] as const;

export function classifySlotText(
  text: string,
  segmentKind: PromptSegment['kind'] = 'text'
): Pick<
  DraftSlotAnalysis,
  'slotType' | 'domainHints' | 'toneHints' | 'classificationConfidence'
> {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      slotType: 'unknown',
      domainHints: [],
      toneHints: [],
      classificationConfidence: 0
    };
  }

  let best: { slot: SlotType; score: number } = {
    slot: 'unknown',
    score: 0
  };

  for (const rule of SLOT_RULES) {
    if (rule.patterns.some(p => p.test(trimmed))) {
      if (rule.weight > best.score) {
        best = { slot: rule.slot, score: rule.weight };
      }
    }
  }

  // Kind bias: choices often appearance/action; variables are subjects/slots
  if (best.slot === 'unknown') {
    if (segmentKind === 'variable') {
      best = { slot: 'subject', score: 0.45 };
    } else if (segmentKind === 'choice') {
      best = { slot: 'appearance', score: 0.4 };
    } else {
      best = { slot: 'subject', score: 0.35 };
    }
  }

  const domainHints: DomainHint[] = [];
  for (const rule of DOMAIN_RULES) {
    if (rule.patterns.some(p => p.test(trimmed))) {
      domainHints.push(rule.domain);
    }
  }
  if (domainHints.length === 0 && best.slot === 'setting') {
    domainHints.push('environment');
  }
  if (domainHints.length === 0 && best.slot === 'subject') {
    domainHints.push('character');
  }

  const lower = trimmed.toLowerCase();
  const toneHints = TONE_HINTS.filter(t => lower.includes(t));

  return {
    slotType: best.slot,
    domainHints,
    toneHints: [...toneHints],
    classificationConfidence: best.score
  };
}

export function slotsFromSegments(
  segments: PromptSegment[]
): DraftSlotAnalysis[] {
  return segments.map((segment, index) => {
    const classified = classifySlotText(segment.text, segment.kind);
    return {
      id: `slot-${index + 1}`,
      sourceText: segment.text,
      startIndex: segment.startIndex,
      endIndex: segment.endIndex,
      slotType: classified.slotType,
      domainHints: classified.domainHints ?? [],
      toneHints: classified.toneHints ?? [],
      classificationConfidence: classified.classificationConfidence,
      segmentKind: segment.kind
    };
  });
}
