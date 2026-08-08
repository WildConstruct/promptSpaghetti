import {
  add,
  angleOf,
  dist,
  lerp,
  lerpPoint,
  mid,
  mulberry32,
  normalize,
  perp,
  pointAlongPolyline,
  polylineToPath,
  scale,
  sub,
} from "./geometry";
import type {
  BundleGroup,
  CablePath,
  GraphEdge,
  GraphNode,
  LayoutOptions,
  LayoutResult,
  Point,
  ZipTie,
} from "./types";

const DEFAULTS: Required<LayoutOptions> = {
  management: 1,
  cableSpacing: 7,
  clusterRadius: 120,
  tiesPerGroup: 2,
  fanLength: 56,
  seed: 42,
};

function nodePort(node: GraphNode, side: "out" | "in"): Point {
  return {
    x: side === "out" ? node.x + node.width : node.x,
    y: node.y + node.height / 2,
  };
}

function byId(nodes: GraphNode[]): Map<string, GraphNode> {
  return new Map(nodes.map((n) => [n.id, n]));
}

type EdgeMeta = {
  edge: GraphEdge;
  source: Point;
  target: Point;
  mid: Point;
  dir: Point;
  angle: number;
  length: number;
  sourceId: string;
  targetId: string;
};

function edgeMeta(edge: GraphEdge, nodes: Map<string, GraphNode>): EdgeMeta | null {
  const s = nodes.get(edge.source);
  const t = nodes.get(edge.target);
  if (!s || !t) return null;
  const source = nodePort(s, "out");
  const target = nodePort(t, "in");
  const dir = normalize(sub(target, source));
  return {
    edge,
    source,
    target,
    mid: mid(source, target),
    dir,
    angle: angleOf(dir),
    length: dist(source, target),
    sourceId: edge.source,
    targetId: edge.target,
  };
}

/**
 * Corridor clustering:
 * 1) Prefer edges that share a source or target (fan-in / fan-out trunks)
 * 2) Also merge edges with similar direction + nearby midpoints
 */
function clusterEdges(metas: EdgeMeta[], radius: number): EdgeMeta[][] {
  const n = metas.length;
  const parent = Array.from({ length: n }, (_, i) => i);

  function find(i: number): number {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  }
  function union(a: number, b: number) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = metas[i];
      const b = metas[j];

      const shareSource = a.sourceId === b.sourceId;
      const shareTarget = a.targetId === b.targetId;
      if (shareSource || shareTarget) {
        // Same fan: always candidates if not going opposite ways
        let dAng = Math.abs(a.angle - b.angle);
        if (dAng > Math.PI) dAng = 2 * Math.PI - dAng;
        if (dAng < Math.PI * 0.55) {
          union(i, j);
          continue;
        }
      }

      let dAng = Math.abs(a.angle - b.angle);
      if (dAng > Math.PI) dAng = 2 * Math.PI - dAng;
      if (dAng > Math.PI / 5) continue;
      if (dist(a.mid, b.mid) > radius) continue;

      // Similar travel distance helps form clean trunks
      const lenRatio =
        Math.min(a.length, b.length) / Math.max(a.length, b.length, 1);
      if (lenRatio < 0.45) continue;

      union(i, j);
    }
  }

  const groups = new Map<number, EdgeMeta[]>();
  for (let i = 0; i < n; i++) {
    const r = find(i);
    const list = groups.get(r) ?? [];
    list.push(metas[i]);
    groups.set(r, list);
  }
  return Array.from(groups.values());
}

function lateralOrder(metas: EdgeMeta[]): EdgeMeta[] {
  if (metas.length <= 1) return metas;
  const avgDir = normalize(
    metas.reduce((acc, m) => add(acc, m.dir), { x: 0, y: 0 } as Point),
  );
  const normal = perp(avgDir);
  return [...metas].sort((a, b) => {
    const pa = a.mid.x * normal.x + a.mid.y * normal.y;
    const pb = b.mid.x * normal.x + b.mid.y * normal.y;
    return pa - pb;
  });
}

function spaghettiPath(meta: EdgeMeta, rand: () => number, wobble: number): Point[] {
  const { source, target } = meta;
  const dx = target.x - source.x;
  const c1 = {
    x: source.x + Math.max(48, Math.abs(dx) * 0.4),
    y: source.y + (rand() - 0.5) * 90 * wobble,
  };
  const c2 = {
    x: target.x - Math.max(48, Math.abs(dx) * 0.4),
    y: target.y + (rand() - 0.5) * 90 * wobble,
  };
  const midPt = {
    x: (source.x + target.x) / 2 + (rand() - 0.5) * 50 * wobble,
    y: (source.y + target.y) / 2 + (rand() - 0.5) * 110 * wobble,
  };
  return [source, c1, midPt, c2, target];
}

/**
 * Build a shared trunk spine between average source/target ports.
 * Spine starts after fan-out and ends before fan-in.
 */
function buildSpine(metas: EdgeMeta[], fan: number): Point[] {
  const avg = (pts: Point[]): Point => ({
    x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
    y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
  });
  const s = avg(metas.map((m) => m.source));
  const t = avg(metas.map((m) => m.target));
  const dir = normalize(sub(t, s));
  const len = dist(s, t);
  const fanPx = Math.min(fan, len * 0.28);

  const start = add(s, scale(dir, fanPx));
  const end = add(t, scale(dir, -fanPx));

  // Slight S-curve for organic look, still shared
  const nrm = perp(dir);
  const bow = Math.min(28, len * 0.04);
  const mid1 = add(lerpPoint(start, end, 0.33), scale(nrm, bow * 0.35));
  const mid2 = add(lerpPoint(start, end, 0.66), scale(nrm, -bow * 0.2));
  return [start, mid1, mid2, end];
}

/**
 * Managed path: fan from source → join trunk → ride offset spine → fan to target.
 * Trunk portion keeps tight parallel offsets (the "zip-tied" look).
 */
function managedPath(
  meta: EdgeMeta,
  offsetIndex: number,
  groupSize: number,
  spacing: number,
  spine: Point[],
): Point[] {
  const { source, target } = meta;
  const centered = offsetIndex - (groupSize - 1) / 2;
  const lateral = centered * spacing;

  const spineStart = spine[0];
  const spineEnd = spine[spine.length - 1];
  const trunkDir = normalize(sub(spineEnd, spineStart));
  const normal = perp(trunkDir);

  // Tight parallel trunk (constant lateral — zip-tie look)
  const trunk: Point[] = spine.map((p) => add(p, scale(normal, lateral)));

  // Fan segments: ease from node port to trunk join
  const join = trunk[0];
  const leave = trunk[trunk.length - 1];
  const fanOutCtrl = {
    x: lerp(source.x, join.x, 0.55),
    y: lerp(source.y, join.y, 0.35),
  };
  const fanInCtrl = {
    x: lerp(target.x, leave.x, 0.55),
    y: lerp(target.y, leave.y, 0.35),
  };

  return [source, fanOutCtrl, ...trunk, fanInCtrl, target];
}

function blendPaths(messy: Point[], clean: Point[], t: number): Point[] {
  // Resample both to same count via simple index mapping
  const n = Math.max(messy.length, clean.length, 8);
  const sample = (pts: Point[], i: number): Point => {
    if (pts.length === 1) return pts[0];
    const u = i / (n - 1);
    const f = u * (pts.length - 1);
    const a = Math.floor(f);
    const b = Math.min(pts.length - 1, a + 1);
    return lerpPoint(pts[a], pts[b], f - a);
  };
  const out: Point[] = [];
  for (let i = 0; i < n; i++) {
    out.push(lerpPoint(sample(messy, i), sample(clean, i), t));
  }
  return out;
}

/**
 * Layout cables for a node graph.
 * `management` 0 → spaghetti Beziers; 1 → corridor bundling with zip ties.
 */
export function layoutCables(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: Partial<LayoutOptions> = {},
): LayoutResult {
  const opts: Required<LayoutOptions> = { ...DEFAULTS, ...options };
  const rand = mulberry32(opts.seed);
  const nodeMap = byId(nodes);
  const metas = edges
    .map((e) => edgeMeta(e, nodeMap))
    .filter((m): m is EdgeMeta => m !== null);

  const m = Math.max(0, Math.min(1, opts.management));
  const paths: CablePath[] = [];
  const ties: ZipTie[] = [];
  const groups: BundleGroup[] = [];

  if (m < 0.04) {
    for (const meta of metas) {
      const pts = spaghettiPath(meta, rand, 1);
      paths.push({
        edgeId: meta.edge.id,
        color: meta.edge.color,
        d: polylineToPath(pts, 0.4),
        samples: pts,
        groupId: null,
        offsetIndex: 0,
      });
    }
    return { paths, ties, groups };
  }

  const clusters = clusterEdges(metas, opts.clusterRadius);

  clusters.forEach((cluster, ci) => {
    const ordered = lateralOrder(cluster);
    const groupId = `g${ci}`;
    const canBundle = ordered.length >= 2;
    const spine = buildSpine(ordered, opts.fanLength);
    const offsets: Record<string, number> = {};
    ordered.forEach((meta, i) => {
      offsets[meta.edge.id] = i;
    });

    const group: BundleGroup = {
      id: groupId,
      edgeIds: ordered.map((o) => o.edge.id),
      spine,
      offsets,
      ties: [],
    };

    if (canBundle && m >= 0.35) {
      const count = Math.max(1, opts.tiesPerGroup);
      for (let k = 0; k < count; k++) {
        const t = count === 1 ? 0.5 : 0.28 + (0.44 * k) / Math.max(1, count - 1);
        group.ties.push(t);
        const { point, angle } = pointAlongPolyline(spine, t);
        const width = ordered.length * opts.cableSpacing + 16;
        ties.push({
          id: `tie-${groupId}-${k}`,
          groupId,
          t,
          x: point.x,
          y: point.y,
          angle,
          width,
          height: 11,
          edgeCount: ordered.length,
        });
      }
      groups.push(group);
    }

    ordered.forEach((meta, i) => {
      if (!canBundle) {
        const pts = spaghettiPath(meta, rand, 0.12);
        paths.push({
          edgeId: meta.edge.id,
          color: meta.edge.color,
          d: polylineToPath(pts, 0.35),
          samples: pts,
          groupId: null,
          offsetIndex: 0,
        });
        return;
      }

      const clean = managedPath(meta, i, ordered.length, opts.cableSpacing, spine);
      const messy = spaghettiPath(meta, rand, 1);
      const blended = blendPaths(messy, clean, m);

      paths.push({
        edgeId: meta.edge.id,
        color: meta.edge.color,
        d: polylineToPath(blended, 0.32),
        samples: blended,
        groupId: canBundle ? groupId : null,
        offsetIndex: i,
      });
    });
  });

  return { paths, ties, groups };
}

export function nodeCenter(node: GraphNode): Point {
  return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
}
