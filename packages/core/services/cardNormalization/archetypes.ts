/**
 * Archetype targets for card normalization.
 *
 * Each archetype defines its canonical head count (how many head-units tall a
 * correctly-normalized figure should be), the acceptable observed range, and a
 * real-world target height used for cross-scene metres-per-pixel scaling.
 */

export interface ArchetypeSpec {
  id: string;
  label: string;
  canonicalHeadCount: number;
  /** Inclusive [min, max] observed head count considered acceptable. */
  headCountRange: [number, number];
  targetHeightM: number;
}

export const ARCHETYPES: ArchetypeSpec[] = [
  {
    id: 'adult-male-racegoer',
    label: 'Adult male (racegoer)',
    canonicalHeadCount: 7.5,
    headCountRange: [6.8, 8.2],
    targetHeightM: 1.75
  },
  {
    id: 'adult-female-racegoer',
    label: 'Adult female (racegoer)',
    canonicalHeadCount: 7.5,
    headCountRange: [6.8, 8.2],
    targetHeightM: 1.62
  },
  {
    id: 'teen',
    label: 'Teen',
    canonicalHeadCount: 7.0,
    headCountRange: [6.3, 7.6],
    targetHeightM: 1.55
  },
  {
    id: 'child',
    label: 'Child',
    canonicalHeadCount: 6.0,
    headCountRange: [5.2, 6.8],
    targetHeightM: 1.2
  },
  {
    id: 'elderly',
    label: 'Elderly',
    canonicalHeadCount: 7.3,
    headCountRange: [6.6, 8.0],
    targetHeightM: 1.68
  }
];

export const DEFAULT_ARCHETYPE_ID = 'adult-male-racegoer';

const BY_ID: Record<string, ArchetypeSpec> = ARCHETYPES.reduce(
  (acc, spec) => {
    acc[spec.id] = spec;
    return acc;
  },
  {} as Record<string, ArchetypeSpec>
);

export function getArchetype(id: string): ArchetypeSpec | undefined {
  return BY_ID[id];
}

export function getArchetypeOrDefault(id: string | undefined): ArchetypeSpec {
  return (id && BY_ID[id]) || BY_ID[DEFAULT_ARCHETYPE_ID];
}
