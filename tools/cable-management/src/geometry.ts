import type { Point } from "./types";

export function dist(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpPoint(a: Point, b: Point, t: number): Point {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

export function mid(a: Point, b: Point): Point {
  return lerpPoint(a, b, 0.5);
}

export function normalize(v: Point): Point {
  const len = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / len, y: v.y / len };
}

export function perp(v: Point): Point {
  return { x: -v.y, y: v.x };
}

export function add(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(v: Point, s: number): Point {
  return { x: v.x * s, y: v.y * s };
}

export function angleOf(v: Point): number {
  return Math.atan2(v.y, v.x);
}

/** Cubic Bezier sample. */
export function cubicAt(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
}

export function sampleCubic(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  steps = 24,
): Point[] {
  const out: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    out.push(cubicAt(p0, p1, p2, p3, i / steps));
  }
  return out;
}

/** Build smooth SVG path from polyline using Catmull-Rom → Bezier. */
export function polylineToPath(points: Point[], tension = 0.35): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const c1 = {
      x: p1.x + ((p2.x - p0.x) * tension) / 3,
      y: p1.y + ((p2.y - p0.y) * tension) / 3,
    };
    const c2 = {
      x: p2.x - ((p3.x - p1.x) * tension) / 3,
      y: p2.y - ((p3.y - p1.y) * tension) / 3,
    };
    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/** Point along a polyline at normalized t in [0,1]. */
export function pointAlongPolyline(points: Point[], t: number): { point: Point; angle: number } {
  if (points.length === 0) return { point: { x: 0, y: 0 }, angle: 0 };
  if (points.length === 1) return { point: points[0], angle: 0 };

  const lengths: number[] = [0];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += dist(points[i - 1], points[i]);
    lengths.push(total);
  }
  if (total <= 0) return { point: points[0], angle: 0 };

  const target = Math.max(0, Math.min(1, t)) * total;
  let i = 1;
  while (i < lengths.length && lengths[i] < target) i++;
  const a = points[i - 1];
  const b = points[Math.min(i, points.length - 1)];
  const segStart = lengths[i - 1];
  const segLen = Math.max(1e-6, lengths[Math.min(i, lengths.length - 1)] - segStart);
  const localT = (target - segStart) / segLen;
  const dir = sub(b, a);
  return {
    point: lerpPoint(a, b, localT),
    angle: angleOf(dir),
  };
}

/** Deterministic PRNG (mulberry32). */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
