/** Shared types for the cable-management utility. */

export type Point = { x: number; y: number };

export type GraphNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: "source" | "process" | "sink" | "branch";
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  /** Stable color for this cable (hex). */
  color: string;
  /** Optional named signal for labels / tooltips. */
  label?: string;
};

export type BundleGroup = {
  id: string;
  edgeIds: string[];
  /** Spine of the shared trunk (polyline). */
  spine: Point[];
  /** Lateral offset index per edge in the group. */
  offsets: Record<string, number>;
  /** Zip-tie positions along the spine (0–1). */
  ties: number[];
};

export type CablePath = {
  edgeId: string;
  color: string;
  /** SVG path `d` string for the full cable. */
  d: string;
  /** Sampled points for hit-testing / ties. */
  samples: Point[];
  groupId: string | null;
  offsetIndex: number;
};

export type ZipTie = {
  id: string;
  groupId: string;
  /** Normalized position along the group spine (0–1). */
  t: number;
  x: number;
  y: number;
  angle: number;
  width: number;
  height: number;
  edgeCount: number;
};

export type LayoutResult = {
  paths: CablePath[];
  ties: ZipTie[];
  groups: BundleGroup[];
};

export type LayoutOptions = {
  /** 0 = pure spaghetti, 1 = fully managed. */
  management: number;
  /** Spacing between parallel cables in a trunk (px). */
  cableSpacing: number;
  /** How aggressively to merge corridors (px). */
  clusterRadius: number;
  /** Number of zip ties per group when managed. */
  tiesPerGroup: number;
  /** Fan length before cables join the trunk (px). */
  fanLength: number;
  seed?: number;
};
