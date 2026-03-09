import {
  FragmentManifestLoader,
  type FragmentManifest
} from './FragmentManifestLoader';

export type FragmentRole =
  | 'archetype'
  | 'archetype-support'
  | 'modifier'
  | 'scenario'
  | 'branch-extension'
  | 'merge-helper'
  | 'output-finisher';

export type FragmentDomain =
  | 'character'
  | 'creature'
  | 'vehicle'
  | 'building'
  | 'environment'
  | 'crowd';

export type FragmentNodeType =
  | 'weighted-choice'
  | 'text'
  | 'variable'
  | 'merge'
  | 'output'
  | 'region';

export type PlacementHint =
  | 'downstream-of-choice'
  | 'branch-lane'
  | 'before-output'
  | 'inside-region';

export type AgentFragmentRecord = {
  id: string;
  name: string;
  path: string;
  category: string;
  description?: string;
  tags: string[];
  roles: FragmentRole[];
  domains: FragmentDomain[];
  nodeTypes: FragmentNodeType[];
  placementHints: PlacementHint[];
  tone: string[];
  nodeCount: number;
  priority: number;
};

type AgentFragmentManifest = {
  version: string;
  type: 'agent-fragment-manifest';
  fragments: Array<Omit<AgentFragmentRecord, 'priority'>>;
};

export type FragmentQuery = {
  roles?: FragmentRole[];
  domains?: FragmentDomain[];
  nodeTypes?: FragmentNodeType[];
  placementHints?: PlacementHint[];
  tone?: string[];
  tags?: string[];
  limit?: number;
};

export type SelectionContext = {
  selectedNodeType?: string;
  isBranchLane?: boolean;
  leadsToOutput?: boolean;
  needsMerge?: boolean;
  domainHints?: FragmentDomain[];
  toneHints?: string[];
};

type CategoryDefaults = {
  roles: FragmentRole[];
  domains: FragmentDomain[];
  placementHints: PlacementHint[];
};

const CATEGORY_DEFAULTS: Record<string, CategoryDefaults> = {
  'body-silhouette': {
    roles: ['modifier', 'archetype-support'],
    domains: ['character', 'creature'],
    placementHints: ['downstream-of-choice']
  },
  'emotion-mood': {
    roles: ['modifier', 'branch-extension', 'output-finisher'],
    domains: ['character', 'creature', 'crowd'],
    placementHints: ['branch-lane', 'before-output', 'downstream-of-choice']
  },
  'action-dynamics': {
    roles: ['scenario', 'branch-extension', 'modifier'],
    domains: ['character', 'creature', 'vehicle'],
    placementHints: ['branch-lane', 'downstream-of-choice']
  },
  'setting-environment': {
    roles: ['scenario', 'output-finisher', 'branch-extension'],
    domains: ['environment', 'building', 'vehicle'],
    placementHints: ['branch-lane', 'before-output']
  },
  'facial-features': {
    roles: ['modifier', 'output-finisher'],
    domains: ['character', 'creature'],
    placementHints: ['downstream-of-choice', 'before-output']
  },
  hair: {
    roles: ['modifier', 'archetype-support'],
    domains: ['character', 'creature'],
    placementHints: ['downstream-of-choice']
  }
};

const DOMAIN_HINTS: Array<[FragmentDomain, string[]]> = [
  ['vehicle', ['vehicle', 'truck', 'engine', 'muffler', 'tire', 'arena']],
  ['building', ['building', 'architecture', 'storefront', 'structure']],
  ['environment', ['environment', 'weather', 'lighting', 'scene', 'backdrop']],
  ['crowd', ['crowd', 'group', 'extras']],
  ['character', ['character', 'body', 'hair', 'face', 'emotion']],
  ['creature', ['creature', 'monster', 'beast']]
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
  'surreal'
] as const;

const OMIT_IDS = new Set(['complete-batch-placeholder']);

function normalizePath(path: string): string {
  return path.startsWith('/assets/')
    ? path
    : `/assets/library/${path.replace(/^\.\//, '')}`;
}

function inferDomains(tags: string[], category: string): FragmentDomain[] {
  const defaults = CATEGORY_DEFAULTS[category]?.domains ?? [];
  const detected = new Set<FragmentDomain>(defaults);
  const haystack = tags.join(' ').toLowerCase();

  for (const [domain, patterns] of DOMAIN_HINTS) {
    if (patterns.some(pattern => haystack.includes(pattern))) {
      detected.add(domain);
    }
  }

  return Array.from(detected);
}

function inferTone(tags: string[], description?: string): string[] {
  const haystack = `${tags.join(' ')} ${description ?? ''}`.toLowerCase();
  return TONE_HINTS.filter(pattern => haystack.includes(pattern));
}

function inferNodeTypes(nodeCount: number): FragmentNodeType[] {
  return nodeCount > 1 ? ['weighted-choice', 'region'] : ['weighted-choice'];
}

function inferPriority(record: AgentFragmentRecord): number {
  let score = 0;
  if (record.roles.includes('branch-extension')) score += 4;
  if (record.roles.includes('output-finisher')) score += 3;
  if (record.roles.includes('scenario')) score += 2;
  if (record.roles.includes('archetype')) score += 5;
  return score + Math.min(record.nodeCount, 4);
}

function toAgentRecord(
  fragment: NonNullable<FragmentManifest['fragments']>[number]
): AgentFragmentRecord | null {
  if (OMIT_IDS.has(fragment.id)) {
    return null;
  }

  if (fragment.id === 'roman-citizen' || fragment.name.includes('Roman Citizen')) {
    const record: AgentFragmentRecord = {
      id: fragment.id,
      name: fragment.name,
      path: normalizePath(fragment.path),
      category: fragment.category,
      description: fragment.description,
      tags: fragment.tags ?? [],
      roles: ['archetype'],
      domains: ['character'],
      nodeTypes: ['weighted-choice', 'region', 'output'],
      placementHints: ['inside-region'],
      tone: inferTone(fragment.tags ?? [], fragment.description),
      nodeCount: fragment.nodeCount,
      priority: 10
    };
    return record;
  }

  const defaults = CATEGORY_DEFAULTS[fragment.category] ?? {
    roles: ['modifier'],
    domains: ['character'],
    placementHints: ['downstream-of-choice']
  };
  const tags = fragment.tags ?? [];
  const record: AgentFragmentRecord = {
    id: fragment.id,
    name: fragment.name,
    path: normalizePath(fragment.path),
    category: fragment.category,
    description: fragment.description,
    tags,
    roles: defaults.roles,
    domains: inferDomains(tags, fragment.category),
    nodeTypes: inferNodeTypes(fragment.nodeCount),
    placementHints: defaults.placementHints,
    tone: inferTone(tags, fragment.description),
    nodeCount: fragment.nodeCount,
    priority: 0
  };
  record.priority = inferPriority(record);
  return record;
}

function matchesList<T extends string>(
  values: T[],
  filters?: T[]
): boolean {
  if (!filters || filters.length === 0) {
    return true;
  }
  return filters.some(filter => values.includes(filter));
}

function scoreRecord(
  record: AgentFragmentRecord,
  context: SelectionContext,
  desiredRoles: FragmentRole[]
): number {
  let score = record.priority;

  if (desiredRoles.some(role => record.roles.includes(role))) {
    score += 12;
  }
  if (context.domainHints?.some(domain => record.domains.includes(domain))) {
    score += 6;
  }
  if (context.toneHints?.some(tone => record.tone.includes(tone))) {
    score += 3;
  }
  if (context.isBranchLane && record.placementHints.includes('branch-lane')) {
    score += 5;
  }
  if (context.leadsToOutput && record.roles.includes('output-finisher')) {
    score += 4;
  }
  return score;
}

export class AgentFragmentRetrievalService {
  private static cache: AgentFragmentRecord[] | null = null;
  private static agentManifestPath = '/assets/library/agent-fragment-manifest.json';

  private static async loadAgentManifest(): Promise<AgentFragmentManifest | null> {
    try {
      const response = await fetch(this.agentManifestPath);
      if (!response.ok) {
        return null;
      }
      const manifest = (await response.json()) as AgentFragmentManifest;
      if (manifest.type !== 'agent-fragment-manifest') {
        return null;
      }
      return manifest;
    } catch {
      return null;
    }
  }

  static async loadIndex(): Promise<AgentFragmentRecord[]> {
    if (this.cache) {
      return this.cache;
    }

    const agentManifest = await this.loadAgentManifest();
    if (agentManifest) {
      this.cache = agentManifest.fragments.map(fragment => ({
        ...fragment,
        priority: inferPriority({
          ...fragment,
          priority: 0
        })
      }));
      return this.cache;
    }

    const manifest = await FragmentManifestLoader.loadManifest();
    const fragments = (manifest.fragments ?? [])
      .map(toAgentRecord)
      .filter((record): record is AgentFragmentRecord => record !== null);
    this.cache = fragments;
    return fragments;
  }

  static async queryFragments(query: FragmentQuery): Promise<AgentFragmentRecord[]> {
    const index = await this.loadIndex();
    const results = index.filter(record => {
      return (
        matchesList(record.roles, query.roles) &&
        matchesList(record.domains, query.domains) &&
        matchesList(record.nodeTypes, query.nodeTypes) &&
        matchesList(record.placementHints, query.placementHints) &&
        matchesList(record.tone, query.tone) &&
        matchesList(record.tags, query.tags)
      );
    });

    results.sort((a, b) => b.priority - a.priority || a.name.localeCompare(b.name));
    return results.slice(0, query.limit ?? results.length);
  }

  static async suggestFragmentsForSelection(
    context: SelectionContext
  ): Promise<AgentFragmentRecord[]> {
    const nodeType = context.selectedNodeType?.toLowerCase();
    const desiredRoles: FragmentRole[] = [];
    const placementHints: PlacementHint[] = [];

    switch (nodeType) {
      case 'weightedchoice':
      case 'weighted-choice':
        desiredRoles.push(
          context.isBranchLane ? 'scenario' : 'branch-extension',
          'modifier'
        );
        placementHints.push(
          context.isBranchLane ? 'branch-lane' : 'downstream-of-choice'
        );
        break;
      case 'concat':
      case 'merge':
        desiredRoles.push('output-finisher');
        placementHints.push('before-output');
        break;
      case 'output':
        desiredRoles.push('output-finisher');
        placementHints.push('before-output');
        break;
      case 'textblock':
      case 'text':
        desiredRoles.push('modifier');
        placementHints.push('downstream-of-choice');
        break;
      default:
        desiredRoles.push('modifier', 'scenario');
        placementHints.push('downstream-of-choice');
        break;
    }

    if (context.needsMerge) {
      desiredRoles.unshift('merge-helper');
    }

    if (context.leadsToOutput) {
      desiredRoles.push('output-finisher');
      placementHints.push('before-output');
    }

    const candidates = await this.queryFragments({
      roles: Array.from(new Set(desiredRoles)),
      domains: context.domainHints,
      placementHints: Array.from(new Set(placementHints)),
      tone: context.toneHints,
      limit: 12
    });

    return candidates
      .map(record => ({
        record,
        score: scoreRecord(record, context, desiredRoles)
      }))
      .sort((a, b) => b.score - a.score || a.record.name.localeCompare(b.record.name))
      .slice(0, 5)
      .map(item => item.record);
  }

  static clearCache(): void {
    this.cache = null;
    FragmentManifestLoader.clearCache();
  }
}
