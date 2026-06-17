/**
 * assembly.ts — natural-language prompt assembly.
 *
 * Prompt Spaghetti's job is to produce prompts that read as prose, not tag lists.
 * These are pure, deterministic helpers shared by the Concat join rules and the
 * Template/slot node. No randomness, no I/O — safe to run on client or server.
 */

/** How a set of fragments is joined into text. */
export type JoinStyle =
  | 'separator' // join with an explicit separator string (legacy behavior)
  | 'space' // simple space-joined words
  | 'comma' // comma list: "a, b, c"
  | 'and' // Oxford list: "a, b, and c"
  | 'sentence' // space-joined, capitalized, terminal punctuation
  | 'bullet' // markdown bullet list, one part per line ("- a\n- b")
  | 'json'; // structured JSON: keyed by input labels when available, else { "parts": [...] }

export interface AssembleOptions {
  /** Join strategy. Defaults to 'space'. */
  style?: JoinStyle;
  /** Separator used only when style === 'separator'. Defaults to ' '. */
  separator?: string;
  /** Trim each part. Defaults to true. */
  trim?: boolean;
  /** Drop empty/whitespace-only parts. Defaults to true. */
  dropEmpty?: boolean;
  /** Remove consecutive duplicate parts (case-insensitive). Defaults to false. */
  dedupe?: boolean;
  /** Capitalize the first letter of the result. Defaults to false (forced true for 'sentence'). */
  capitalize?: boolean;
  /**
   * Per-part labels (e.g. the source node names), aligned to `parts`. Used by
   * the 'json' style to emit a keyed object. Ignored by every other style.
   */
  labels?: Array<string | undefined>;
}

/** Slugify a label into a stable JSON key: "Base Wardrobe" -> "base_wardrobe". */
function jsonKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

/**
 * Pick "a" or "an" for a word using a light heuristic. Not perfect English, but
 * good enough for prompt assembly ("an orange cat", "a unicorn").
 */
export function indefiniteArticle(word: string): 'a' | 'an' {
  const w = word.trim().toLowerCase();
  if (!w) return 'a';
  const first = w[0];
  // Common exceptions where spelling and sound disagree.
  if (/^(hour|honest|honor|heir)/.test(w)) return 'an';
  if (/^(uni|use|user|euro|one|once|ufo)/.test(w)) return 'a';
  return VOWELS.has(first) ? 'an' : 'a';
}

/**
 * Collapse whitespace and fix spacing around punctuation so assembled fragments
 * read cleanly even when a slot resolved to empty.
 */
export function normalizePrompt(text: string): string {
  return (
    text
      // collapse runs of whitespace
      .replace(/\s+/g, ' ')
      // drop space before , . ; : ! ?
      .replace(/\s+([,.;:!?])/g, '$1')
      // collapse duplicate punctuation produced by empty slots ("a , b" -> "a, b")
      .replace(/([,;:])\1+/g, '$1')
      // remove leading punctuation/space left by an empty first slot
      .replace(/^[\s,;:]+/, '')
      // ensure one space after a comma/semicolon/colon if followed by a word
      .replace(/([,;:])(\S)/g, '$1 $2')
      .trim()
  );
}

/** Capitalize the first alphabetic character without touching the rest. */
export function capitalizeFirst(text: string): string {
  return text.replace(/[a-z]/i, c => c.toUpperCase());
}

/** Join parts as an Oxford list: ["a"] -> "a", ["a","b"] -> "a and b", ["a","b","c"] -> "a, b, and c". */
export function oxfordJoin(parts: string[]): string {
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
}

function prepareParts(parts: unknown[], opts: AssembleOptions): string[] {
  const trim = opts.trim !== false;
  const dropEmpty = opts.dropEmpty !== false;

  let out = parts.map(p => {
    const s = String(p ?? '');
    return trim ? s.trim() : s;
  });

  if (dropEmpty) out = out.filter(s => s.trim().length > 0);

  if (opts.dedupe) {
    const seen = new Set<string>();
    out = out.filter(s => {
      const key = s.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return out;
}

/**
 * Assemble fragments into a single string using a join style, then normalize
 * punctuation/whitespace so the result reads as natural language.
 */
export function assemble(parts: unknown[], opts: AssembleOptions = {}): string {
  const style = opts.style ?? 'space';
  const prepared = prepareParts(parts, opts);

  if (prepared.length === 0) return '';

  // Structured styles emit non-prose output, so they bypass normalizePrompt.
  if (style === 'bullet') {
    return prepared.map(p => `- ${p}`).join('\n');
  }

  if (style === 'json') {
    const labels = opts.labels;
    if (Array.isArray(labels)) {
      // Align labels to the original parts, then drop empties together so the
      // keys stay paired with their values.
      const trim = opts.trim !== false;
      const dropEmpty = opts.dropEmpty !== false;
      const pairs = parts
        .map((p, i) => ({
          value: trim ? String(p ?? '').trim() : String(p ?? ''),
          key: typeof labels[i] === 'string' ? (labels[i] as string).trim() : ''
        }))
        .filter(pr => !dropEmpty || pr.value.length > 0);
      const keys = pairs.map(pr => jsonKey(pr.key)).filter(Boolean);
      const allKeyed =
        pairs.length > 0 &&
        keys.length === pairs.length &&
        new Set(keys).size === keys.length;
      if (allKeyed) {
        const obj: Record<string, string> = {};
        pairs.forEach(pr => {
          obj[jsonKey(pr.key)] = pr.value;
        });
        return JSON.stringify(obj, null, 2);
      }
    }
    // Fallback: ordered array of the prepared parts.
    return JSON.stringify({ parts: prepared }, null, 2);
  }

  let joined: string;
  switch (style) {
    case 'separator':
      joined = prepared.join(opts.separator ?? ' ');
      break;
    case 'comma':
      joined = prepared.join(', ');
      break;
    case 'and':
      joined = oxfordJoin(prepared);
      break;
    case 'sentence':
    case 'space':
    default:
      joined = prepared.join(' ');
      break;
  }

  // 'separator' is the legacy path: respect the separator verbatim and skip
  // prose normalization so existing graphs are unaffected.
  if (style === 'separator') {
    return joined;
  }

  let result = normalizePrompt(joined);

  if (opts.capitalize || style === 'sentence') {
    result = capitalizeFirst(result);
  }

  if (style === 'sentence' && result && !/[.!?]$/.test(result)) {
    result += '.';
  }

  return result;
}

export interface FillTemplateOptions {
  /** Capitalize the first letter of the filled result. Defaults to true. */
  capitalize?: boolean;
  /** Add a terminal period if none is present. Defaults to false. */
  terminate?: boolean;
}

/**
 * Fill a sentence template like "a {age} {profession} wearing {outfit}" from a
 * slot map, then normalize so missing/empty slots don't leave dangling spaces or
 * punctuation. This is the primary natural-language mechanism: the human writes
 * the sentence; variation fills the slots.
 */
export function fillTemplate(
  template: string,
  slots: Record<string, unknown>,
  opts: FillTemplateOptions = {}
): string {
  const filled = template.replace(/\{(\w+)\}/g, (_match, name: string) => {
    const value = slots[name];
    return value === undefined || value === null ? '' : String(value);
  });

  let result = normalizePrompt(filled);

  if (opts.capitalize !== false) result = capitalizeFirst(result);
  if (opts.terminate && result && !/[.!?]$/.test(result)) result += '.';

  return result;
}

/** Extract the distinct `{slot}` names referenced by a template, in order of first appearance. */
export function templateSlots(template: string): string[] {
  const names: string[] = [];
  const seen = new Set<string>();
  const re = /\{(\w+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(template)) !== null) {
    if (!seen.has(m[1])) {
      seen.add(m[1]);
      names.push(m[1]);
    }
  }
  return names;
}
