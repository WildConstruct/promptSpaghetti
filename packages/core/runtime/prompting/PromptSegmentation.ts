/* eslint-disable @typescript-eslint/no-use-before-define */
/**
 * Shared prompt segmentation utilities used by both the runtime parser
 * (packages/core/services/PromptParser) and the client splash screen
 * prompt dissector.  These heuristics intentionally favour determinism
 * and full coverage of the source text so that nothing is silently
 * discarded during parsing.
 */

export type SegmentKind = 'text' | 'choice' | 'variable';

export interface SegmentedPrompt {
  segments: PromptSegment[];
}

export interface PromptSegment {
  text: string;
  startIndex: number;
  endIndex: number;
  kind: SegmentKind;
  /**
   * Weighted/alternative options when the segment represents a choice.
   */
  options?: string[];
  /**
   * Name of the variable when kind === 'variable'.
   */
  variableName?: string;
}

interface RawSegment {
  text: string;
  start: number;
  end: number;
}

const BULLET_PATTERN = /^\s*([-*•]|\d{1,3}[.)])\s+/;
const VARIABLE_FULL_PATTERN = /^\s*\{\{([\w.-]+)\}\}\s*$/;
const VARIABLE_INLINE_PATTERN = /\{\{([\w.-]+)\}\}/g;
const VARIABLE_ASSIGNMENT_PATTERN =
  /^\s*([\w.-]{1,32})\s*[:=\-]\s*(.+?)\s*$/i;
const CHOICE_SEPARATOR_PATTERN = /\s+(?:or|and)\s+/i;
const SENTENCE_BOUNDARY_PATTERN =
  /([.!?。！？])\s+|(\r?\n)+/; // includes new lines

const MAX_SENTENCE_LENGTH = 320;

/**
 * Main entry point – split a prompt into segments with rudimentary semantic tags.
 */
export function segmentPrompt(prompt: string): SegmentedPrompt {
  if (!prompt || !prompt.trim()) {
    return { segments: [] };
  }

  const rawSegments = extractRawSegments(prompt);
  const segments: PromptSegment[] = [];

  rawSegments.forEach(raw => {
    const analysed = analyseSegment(raw.text);
    analysed.forEach(part => {
      const segment: PromptSegment = {
        ...part,
        startIndex: raw.start + part.relativeStart,
        endIndex: raw.start + part.relativeEnd
      };
      segments.push(segment);
    });
  });

  // Ensure segments are ordered and non-overlapping
  segments.sort((a, b) => a.startIndex - b.startIndex || a.endIndex - b.endIndex);
  return { segments: mergeOverlappingSegments(segments) };
}

/**
 * Split the prompt into coarse pieces by blank lines, bullet lists, or sentence boundaries.
 */
function extractRawSegments(prompt: string): RawSegment[] {
  const segments: RawSegment[] = [];
  const paragraphs = splitParagraphs(prompt);

  paragraphs.forEach(paragraph => {
    const lines = paragraph.text.split(/\r?\n/);
    const bulletLines = lines.every(line => !line.trim() || BULLET_PATTERN.test(line));

    if (bulletLines && lines.length > 1) {
      let offset = paragraph.start;
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) {
          offset += line.length + 1;
          return;
        }
        const withoutBullet = trimmed.replace(BULLET_PATTERN, '');
        const start = paragraph.start + line.indexOf(withoutBullet);
        segments.push({
          text: withoutBullet.trim(),
          start,
          end: start + withoutBullet.trimEnd().length
        });
        offset += line.length + 1;
      });
    } else {
      // fallback to sentence-level splitting
      segments.push(...splitSentences(paragraph));
    }
  });

  return segments;
}

/**
 * Analyse a raw segment and return one or more refined prompt segments.
 */
function analyseSegment(text: string): Array<{
  text: string;
  relativeStart: number;
  relativeEnd: number;
  kind: SegmentKind;
  options?: string[];
  variableName?: string;
}> {
  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }

  const result: Array<{
    text: string;
    relativeStart: number;
    relativeEnd: number;
    kind: SegmentKind;
    options?: string[];
    variableName?: string;
  }> = [];

  // Pure variable placeholder
  const fullMatch = VARIABLE_FULL_PATTERN.exec(trimmed);
  if (fullMatch) {
    result.push({
      text: trimmed,
      relativeStart: text.indexOf(trimmed),
      relativeEnd: text.indexOf(trimmed) + trimmed.length,
      kind: 'variable',
      variableName: fullMatch[1]
    });
    return result;
  }

  // Variable assignment style: Tone: Cinematic
  const assignment = VARIABLE_ASSIGNMENT_PATTERN.exec(trimmed);
  if (assignment && assignment[2].length > 0 && assignment[1].length <= 32) {
    const assignmentStart = text.indexOf(trimmed);
    result.push({
      text: trimmed,
      relativeStart: assignmentStart,
      relativeEnd: assignmentStart + trimmed.length,
      kind: 'variable',
      variableName: assignment[1].trim()
    });
    return result;
  }

  // Weighted choice segments containing brackets or alternatives
  const bracketChoices = extractBracketChoices(text);
  if (bracketChoices.length > 0) {
    bracketChoices.forEach(choice => {
      result.push({
        text: choice.text,
        relativeStart: choice.start,
        relativeEnd: choice.end,
        kind: 'choice',
        options: splitChoiceAlternatives(choice.text, true)
      });
    });
    return result;
  }

  // Inline choices (word1 or word2) -> treat as a single choice
  if (CHOICE_SEPARATOR_PATTERN.test(trimmed)) {
    const start = text.indexOf(trimmed);
    result.push({
      text: trimmed,
      relativeStart: start,
      relativeEnd: start + trimmed.length,
      kind: 'choice',
      options: splitChoiceAlternatives(trimmed, false)
    });
    return result;
  }

  // Mixed text with inline variables -> split into text parts but keep as text kind.
  const parts: Array<{ part: string; start: number; end: number }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  VARIABLE_INLINE_PATTERN.lastIndex = 0;
  while ((match = VARIABLE_INLINE_PATTERN.exec(text)) !== null) {
    const [placeholder, varName] = match;
    if (match.index > lastIndex) {
      parts.push({
        part: text.slice(lastIndex, match.index),
        start: lastIndex,
        end: match.index
      });
    }
    parts.push({
      part: placeholder,
      start: match.index,
      end: match.index + placeholder.length
    });
    lastIndex = match.index + placeholder.length;
  }
  if (lastIndex < text.length) {
    parts.push({
      part: text.slice(lastIndex),
      start: lastIndex,
      end: text.length
    });
  }

  if (parts.length > 1) {
    parts.forEach(p => {
      const trimmedPart = p.part.trim();
      if (!trimmedPart) {
        return;
      }
      const partStart = findSubStringIndex(text, trimmedPart, p.start);
      const partEnd = partStart + trimmedPart.length;
      if (VARIABLE_FULL_PATTERN.test(trimmedPart)) {
        result.push({
          text: trimmedPart,
          relativeStart: partStart,
          relativeEnd: partEnd,
          kind: 'variable',
          variableName: trimmedPart.replace(VARIABLE_FULL_PATTERN, '$1')
        });
      } else {
        result.push({
          text: trimmedPart,
          relativeStart: partStart,
          relativeEnd: partEnd,
          kind: 'text'
        });
      }
    });
    return result;
  }

  // Default fallback: treat as text segment
  const start = text.indexOf(trimmed);
  result.push({
    text: trimmed,
    relativeStart: start,
    relativeEnd: start + trimmed.length,
    kind: 'text'
  });
  return result;
}

/**
 * Split prompt into paragraphs separated by blank lines.
 */
function splitParagraphs(prompt: string): Array<{ text: string; start: number }> {
  const result: Array<{ text: string; start: number }> = [];
  const splitter = /\n\s*\n/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = splitter.exec(prompt)) !== null) {
    const paraText = prompt.slice(lastIndex, match.index);
    if (paraText.trim()) {
      result.push({ text: paraText, start: lastIndex });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < prompt.length) {
    const paraText = prompt.slice(lastIndex);
    if (paraText.trim()) {
      result.push({ text: paraText, start: lastIndex });
    }
  }

  return result.length ? result : [{ text: prompt, start: 0 }];
}

/**
 * Split paragraphs into sentences conservatively.
 */
function splitSentences(paragraph: { text: string; start: number }): RawSegment[] {
  const segments: RawSegment[] = [];
  const { text, start } = paragraph;
  let cursor = 0;

  while (cursor < text.length) {
    const remaining = text.slice(cursor);
    const match = SENTENCE_BOUNDARY_PATTERN.exec(remaining);
    if (!match) {
      const snippet = remaining.trim();
      if (snippet) {
        const snippetStart = start + findSubStringIndex(text, snippet, cursor);
        segments.push({
          text: snippet,
          start: snippetStart,
          end: snippetStart + snippet.length
        });
      }
      break;
    }

    const boundaryIndex = match.index + (match[1]?.length ?? 0);
    const snippet = remaining.slice(0, boundaryIndex).trim();
    if (snippet) {
      const snippetStart = start + findSubStringIndex(text, snippet, cursor);
      segments.push({
        text: snippet,
        start: snippetStart,
        end: snippetStart + snippet.length
      });
    }
    cursor += boundaryIndex + (match[0].length - (match[1]?.length ?? 0));

    // Avoid infinite loops
    if (cursor <= start) {
      cursor = start + snippet.length;
    }
  }

  // Ensure long paragraphs still produce at least one segment
  if (segments.length === 0) {
    const trimmed = text.trim();
    if (trimmed) {
      const trimmedStart = start + findSubStringIndex(text, trimmed, 0);
      segments.push({
        text: trimmed,
        start: trimmedStart,
        end: trimmedStart + trimmed.length
      });
    }
  }

  return segments;
}

function extractBracketChoices(text: string): Array<{ text: string; start: number; end: number }> {
  const matches: Array<{ text: string; start: number; end: number }> = [];
  const regex = /\{([^}]+)\}/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const inside = match[1];
    const start = match.index;
    const end = start + match[0].length;
    if (inside.split('|').length > 1) {
      matches.push({ text: inside, start, end });
    }
  }
  return matches;
}

function splitChoiceAlternatives(text: string, fromBrackets: boolean): string[] {
  if (fromBrackets) {
    return text
      .split('|')
      .map(option => option.trim())
      .filter(Boolean);
  }

  const parts = text.split(CHOICE_SEPARATOR_PATTERN);
  if (parts.length > 1) {
    return parts.map(p => p.trim()).filter(Boolean);
  }

  // fallback: split on comma if multiple short phrases
  const commaParts = text.split(',').map(p => p.trim()).filter(Boolean);
  if (commaParts.length > 1 && commaParts.every(p => p.length <= MAX_SENTENCE_LENGTH / 2)) {
    return commaParts;
  }

  return [text.trim()];
}

function findSubStringIndex(haystack: string, needle: string, fromIndex: number): number {
  const idx = haystack.indexOf(needle, fromIndex);
  return idx === -1 ? fromIndex : idx;
}

/**
 * Merge overlapping or nested segments to avoid duplicated highlights.
 */
function mergeOverlappingSegments(segments: PromptSegment[]): PromptSegment[] {
  const merged: PromptSegment[] = [];
  for (const segment of segments) {
    const last = merged[merged.length - 1];
    if (last && segment.startIndex <= last.endIndex) {
      // extend last segment by merging text if necessary
      const combinedText = mergeText(last.text, segment.text);
      merged[merged.length - 1] = {
        ...last,
        text: combinedText,
        endIndex: Math.max(last.endIndex, segment.endIndex),
        options: last.options ?? segment.options,
        variableName: last.variableName ?? segment.variableName
      };
    } else {
      merged.push({ ...segment });
    }
  }
  return merged;
}

function mergeText(a: string, b: string): string {
  if (!a) {return b;}
  if (!b) {return a;}
  if (a.includes(b)) {return a;}
  if (b.includes(a)) {return b;}
  return `${a.trimEnd()} ${b.trimStart()}`.trim();
}

