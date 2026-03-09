import type { PsgDocumentInput } from '../../../packages/core/services/psg/contracts';

const MAX_PSG_REQUEST_BYTES = Number(process.env.PSG_MAX_REQUEST_BYTES || 250_000);
const MAX_PSG_DEPTH = Number(process.env.PSG_MAX_DEPTH || 12);
const MAX_PSG_FRAGMENT_NODES = Number(process.env.PSG_MAX_FRAGMENT_NODES || 500);
const MAX_PSG_FRAGMENT_EDGES = Number(process.env.PSG_MAX_FRAGMENT_EDGES || 1_000);
const MAX_PSG_ASSETS = Number(process.env.PSG_MAX_ASSETS || 500);
const MAX_PSG_PLACEMENTS = Number(process.env.PSG_MAX_PLACEMENTS || 1_000);
const MAX_PSG_CROWD_MEMBERS = Number(process.env.PSG_MAX_CROWD_MEMBERS || 1_000);

function estimateDepth(value: unknown, current = 0): number {
  if (value === null || typeof value !== 'object') {
    return current;
  }

  if (Array.isArray(value)) {
    return value.reduce(
      (max: number, entry) => Math.max(max, estimateDepth(entry, current + 1)),
      current + 1
    );
  }

  return Object.values(value as Record<string, unknown>).reduce<number>(
    (max, entry) => Math.max(max, estimateDepth(entry, current + 1)),
    current + 1
  );
}

export function assertPsgRequestWithinLimits(input: unknown): void {
  const serialized = JSON.stringify(input);
  if (serialized.length > MAX_PSG_REQUEST_BYTES) {
    throw new Error(`PSG payload exceeds ${MAX_PSG_REQUEST_BYTES} bytes`);
  }

  const depth = estimateDepth(input);
  if (depth > MAX_PSG_DEPTH) {
    throw new Error(`PSG payload exceeds max depth of ${MAX_PSG_DEPTH}`);
  }
}

export function assertPsgDocumentWithinLimits(document: PsgDocumentInput): void {
  const fragment = document.fragment as
    | { nodes?: unknown[]; edges?: unknown[] }
    | undefined;
  const assets = Array.isArray(document.assets) ? document.assets : [];
  const scene = document.scene as
    | { placements?: unknown[]; crowdMembers?: unknown[] }
    | undefined;

  const nodeCount = Array.isArray(fragment?.nodes) ? fragment.nodes.length : 0;
  const edgeCount = Array.isArray(fragment?.edges) ? fragment.edges.length : 0;
  const placementCount = Array.isArray(scene?.placements)
    ? scene.placements.length
    : 0;
  const crowdMemberCount = Array.isArray(scene?.crowdMembers)
    ? scene.crowdMembers.length
    : 0;

  if (nodeCount > MAX_PSG_FRAGMENT_NODES) {
    throw new Error(`PSG fragment exceeds max node count of ${MAX_PSG_FRAGMENT_NODES}`);
  }

  if (edgeCount > MAX_PSG_FRAGMENT_EDGES) {
    throw new Error(`PSG fragment exceeds max edge count of ${MAX_PSG_FRAGMENT_EDGES}`);
  }

  if (assets.length > MAX_PSG_ASSETS) {
    throw new Error(`PSG document exceeds max asset count of ${MAX_PSG_ASSETS}`);
  }

  if (placementCount > MAX_PSG_PLACEMENTS) {
    throw new Error(`PSG scene exceeds max placement count of ${MAX_PSG_PLACEMENTS}`);
  }

  if (crowdMemberCount > MAX_PSG_CROWD_MEMBERS) {
    throw new Error(`PSG scene exceeds max crowd-member count of ${MAX_PSG_CROWD_MEMBERS}`);
  }
}
