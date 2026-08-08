/**
 * Lightweight self-check for cable layout.
 * Run: npx tsx tools/cable-management/src/layout.test.ts
 * (or import layoutCables from a Jest suite under packages/core)
 */
import { createDemoGraph } from "./demo-graph";
import { layoutCables } from "./layout";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const { nodes, edges } = createDemoGraph();

const spaghetti = layoutCables(nodes, edges, { management: 0, seed: 1 });
assert(spaghetti.paths.length === edges.length, "spaghetti path count");
assert(spaghetti.ties.length === 0, "spaghetti has no ties");
assert(spaghetti.groups.length === 0, "spaghetti has no groups");

const managed = layoutCables(nodes, edges, {
  management: 1,
  cableSpacing: 7,
  clusterRadius: 130,
  tiesPerGroup: 2,
  fanLength: 56,
  seed: 1,
});
assert(managed.paths.length === edges.length, "managed path count");
assert(managed.groups.length > 0, "managed has groups");
assert(managed.ties.length > 0, "managed has zip ties");
assert(
  managed.paths.every((p) => typeof p.d === "string" && p.d.startsWith("M")),
  "paths are SVG d strings",
);
assert(
  managed.paths.filter((p) => p.groupId).length > 0,
  "some cables are bundled",
);

// Determinism
const again = layoutCables(nodes, edges, {
  management: 1,
  seed: 1,
  cableSpacing: 7,
  clusterRadius: 130,
  tiesPerGroup: 2,
  fanLength: 56,
});
assert(
  again.paths.map((p) => p.d).join("|") === managed.paths.map((p) => p.d).join("|"),
  "deterministic layout for same seed",
);

console.log(
  JSON.stringify(
    {
      ok: true,
      edges: edges.length,
      groups: managed.groups.length,
      ties: managed.ties.length,
      bundled: managed.paths.filter((p) => p.groupId).length,
    },
    null,
    2,
  ),
);
