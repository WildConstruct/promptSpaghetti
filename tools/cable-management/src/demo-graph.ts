import type { GraphEdge, GraphNode } from "./types";

/** Cable palette — physical wire colors (not UI chrome). */
export const CABLE_COLORS = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#22c55e", // green
  "#a855f7", // violet (wire, not chrome)
  "#f59e0b", // amber
  "#06b6d4", // cyan
  "#f97316", // orange
  "#e11d48", // rose
  "#84cc16", // lime
  "#6366f1", // indigo
];

/**
 * Dense demo graph inspired by a messy node UI (prompt graph style).
 * Multiple parallel corridors create spaghetti that benefits from bundling.
 */
export function createDemoGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const W = 168;
  const H = 72;

  const nodes: GraphNode[] = [
    { id: "prompt", label: "System Prompt", x: 40, y: 180, width: W, height: H, kind: "source" },
    { id: "style", label: "Style Block", x: 40, y: 300, width: W, height: H, kind: "source" },
    { id: "neg", label: "Negative", x: 40, y: 420, width: W, height: H, kind: "source" },
    { id: "seed", label: "Seed Bank", x: 40, y: 60, width: W, height: H, kind: "source" },

    { id: "w1", label: "Weighted A", x: 340, y: 100, width: W, height: H, kind: "branch" },
    { id: "w2", label: "Weighted B", x: 340, y: 240, width: W, height: H, kind: "branch" },
    { id: "w3", label: "Weighted C", x: 340, y: 380, width: W, height: H, kind: "branch" },
    { id: "w4", label: "Weighted D", x: 340, y: 520, width: W, height: H, kind: "branch" },

    { id: "cat1", label: "Concat Core", x: 640, y: 160, width: W, height: H, kind: "process" },
    { id: "cat2", label: "Concat Alt", x: 640, y: 320, width: W, height: H, kind: "process" },
    { id: "cat3", label: "Concat Mix", x: 640, y: 480, width: W, height: H, kind: "process" },

    { id: "var1", label: "Var: subject", x: 920, y: 120, width: W, height: H, kind: "process" },
    { id: "var2", label: "Var: lighting", x: 920, y: 260, width: W, height: H, kind: "process" },
    { id: "var3", label: "Var: camera", x: 920, y: 400, width: W, height: H, kind: "process" },

    { id: "out1", label: "Output A", x: 1180, y: 180, width: W, height: H, kind: "sink" },
    { id: "out2", label: "Output B", x: 1180, y: 360, width: W, height: H, kind: "sink" },
  ];

  const links: Array<[string, string, string?]> = [
    ["seed", "w1", "seed"],
    ["seed", "w2", "seed"],
    ["prompt", "w1", "sys"],
    ["prompt", "w2", "sys"],
    ["prompt", "w3", "sys"],
    ["style", "w2", "style"],
    ["style", "w3", "style"],
    ["style", "w4", "style"],
    ["neg", "w3", "neg"],
    ["neg", "w4", "neg"],

    ["w1", "cat1", "a"],
    ["w1", "cat2", "a"],
    ["w2", "cat1", "b"],
    ["w2", "cat2", "b"],
    ["w2", "cat3", "b"],
    ["w3", "cat2", "c"],
    ["w3", "cat3", "c"],
    ["w4", "cat3", "d"],
    ["w4", "cat1", "d"],

    ["cat1", "var1", "core"],
    ["cat1", "var2", "core"],
    ["cat2", "var1", "alt"],
    ["cat2", "var2", "alt"],
    ["cat2", "var3", "alt"],
    ["cat3", "var2", "mix"],
    ["cat3", "var3", "mix"],

    ["var1", "out1", "subject"],
    ["var1", "out2", "subject"],
    ["var2", "out1", "light"],
    ["var2", "out2", "light"],
    ["var3", "out1", "cam"],
    ["var3", "out2", "cam"],
  ];

  const edges: GraphEdge[] = links.map(([source, target, label], i) => ({
    id: `e${i}`,
    source,
    target,
    label,
    color: CABLE_COLORS[i % CABLE_COLORS.length],
  }));

  return { nodes, edges };
}
