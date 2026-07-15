/**
 * Deterministic slot → fragment matching for review-first swap flow.
 * Original user text remains the default selection in the UI; this only ranks
 * library candidates (top N) with short human-readable reasons.
 */

export type MatchableFragment = {
  id: string;
  name: string;
  path: string;
  slotTypes?: string[];
  domains?: string[];
  tone?: string[];
  tags?: string[];
  roles?: string[];
  category?: string;
  userCreated?: boolean;
  suggestionWeight?: number;
  priority?: number;
};

export type SlotMatchQuery = {
  slotType: string;
  sourceText: string;
  domainHints?: string[];
  toneHints?: string[];
  limit?: number;
};

export type FragmentMatchCandidate = {
  fragmentId: string;
  name: string;
  path: string;
  score: number;
  reasons: string[];
  userCreated?: boolean;
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(t => t.length > 2);
}

/**
 * Rank library fragments for a semantic slot. Stable sort: score desc, name asc.
 */
export function matchFragmentsForSlot(
  query: SlotMatchQuery,
  fragments: MatchableFragment[]
): FragmentMatchCandidate[] {
  const limit = query.limit ?? 3;
  const slot = query.slotType === 'unknown' ? null : query.slotType;
  const domainHints = query.domainHints ?? [];
  const toneHints = query.toneHints ?? [];
  const tokens = new Set(tokenize(query.sourceText));

  const ranked: FragmentMatchCandidate[] = [];

  for (const frag of fragments) {
    const reasons: string[] = [];
    let score = 0;

    const slotTypes = frag.slotTypes ?? [];
    const domains = frag.domains ?? [];
    const tone = frag.tone ?? [];
    const tags = frag.tags ?? [];

    if (slot && slotTypes.includes(slot)) {
      score += 40;
      reasons.push(`same slot (${slot})`);
    } else if (slot && slotTypes.length > 0) {
      // mild penalty for explicit mismatch
      score -= 5;
    }

    const domainHits = domainHints.filter(d => domains.includes(d));
    if (domainHits.length > 0) {
      score += 18 * domainHits.length;
      reasons.push(
        domainHits.length === 1
          ? `same domain (${domainHits[0]})`
          : `domains: ${domainHits.join(', ')}`
      );
    }

    const toneHits = toneHints.filter(t =>
      tone.some(tt => tt.toLowerCase() === t.toLowerCase())
    );
    if (toneHits.length > 0) {
      score += 8;
      reasons.push(`tone overlap (${toneHits.join(', ')})`);
    }

    // Tag / name lexical overlap with source text
    const lexical = [...tags, frag.name, frag.category ?? '']
      .join(' ')
      .toLowerCase();
    let tokenHits = 0;
    for (const token of tokens) {
      if (lexical.includes(token)) {
        tokenHits += 1;
      }
    }
    if (tokenHits > 0) {
      score += Math.min(12, tokenHits * 3);
      reasons.push(`text overlap (${tokenHits} token${tokenHits > 1 ? 's' : ''})`);
    }

    score += Math.min(6, frag.suggestionWeight ?? 0);
    score += Math.min(4, frag.priority ?? 0);

    if (frag.userCreated) {
      score += 2;
      reasons.push('user fragment');
    }

    // Require at least one substantive reason for inclusion
    if (reasons.length === 0 || score < 12) {
      continue;
    }

    // Default reason wording for high slot+domain matches
    if (
      slot &&
      slotTypes.includes(slot) &&
      domainHits.length > 0 &&
      !reasons.some(r => r.startsWith('same slot'))
    ) {
      reasons.unshift(`same slot and ${domainHits[0]} domain`);
    }

    ranked.push({
      fragmentId: frag.id,
      name: frag.name,
      path: frag.path,
      score,
      reasons: reasons.slice(0, 4),
      userCreated: frag.userCreated
    });
  }

  ranked.sort(
    (a, b) =>
      b.score - a.score || a.name.localeCompare(b.name) || a.fragmentId.localeCompare(b.fragmentId)
  );

  return ranked.slice(0, limit);
}

/**
 * Match every slot; empty candidate lists mean "No library match".
 */
export function matchFragmentsForSlots(
  slots: Array<{
    id: string;
    slotType: string;
    sourceText: string;
    domainHints?: string[];
    toneHints?: string[];
  }>,
  fragments: MatchableFragment[],
  limitPerSlot = 3
): Record<string, FragmentMatchCandidate[]> {
  const out: Record<string, FragmentMatchCandidate[]> = {};
  for (const slot of slots) {
    out[slot.id] = matchFragmentsForSlot(
      {
        slotType: slot.slotType,
        sourceText: slot.sourceText,
        domainHints: slot.domainHints,
        toneHints: slot.toneHints,
        limit: limitPerSlot
      },
      fragments
    );
  }
  return out;
}
