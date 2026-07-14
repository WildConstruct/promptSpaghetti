// Offline geometry verifier for Explore-document region boxes.
// Estimates each content node's rendered height (calibrated against live
// measurements: all nodes are 280px wide) and checks, per template:
//   - membership: every content node is fully inside exactly one box
//   - overlaps:   no two region boxes overlap
//   - orphans:    no content node sits outside every box
//   - cross:      no content node is inside two boxes
// Boxes carry explicit width/height; content heights come from the model.
const esbuild = require('esbuild');

const out = esbuild.buildSync({
  entryPoints: ['client/src/templates/quickStartTemplates.ts'],
  bundle: true, format: 'cjs', write: false, platform: 'node', external: ['reactflow']
}).outputFiles[0].text;
const mod = { exports: {} };
new Function('module', 'exports', 'require', out)(mod, mod.exports, x => (x === 'reactflow' ? {} : require(x)));
const templates = mod.exports.quickStartTemplates || {};

const W = 280; // every node renders 280px wide (measured)

// Calibrated height model (see live measurements in the PR discussion).
function estHeight(node) {
  const t = node.type;
  if (t === 'concat' || t === 'output') return 140;
  if (t === 'textBlock') {
    const len = (node.data?.text || node.data?.value || '').length;
    return 120 + 14 * Math.max(1, Math.ceil(len / 40));
  }
  if (t === 'weightedChoice') {
    let opts = [];
    try { opts = node.data?.options || JSON.parse(node.data?.value || '{}').options || []; } catch { opts = node.data?.options || []; }
    // ~40 chars per line at 280px wide; base 47px/row, +30px per wrapped line.
    const rows = opts.reduce((s, o) => s + 47 + 30 * Math.max(0, Math.ceil((o.text || '').length / 40) - 1), 0);
    return 70 + rows;
  }
  return 120;
}

function rect(n, h) { return { id: n.id, x: n.position.x, y: n.position.y, w: W, h }; }
function boxRect(n) {
  const w = n.width ?? n.style?.width ?? n.data?.width ?? 0;
  const h = n.height ?? n.style?.height ?? n.data?.height ?? 0;
  return { id: n.id, x: n.position.x, y: n.position.y, w, h };
}
const inside = (c, b) => c.x >= b.x && c.x + c.w <= b.x + b.w && c.y >= b.y && c.y + c.h <= b.y + b.h;
const overlap = (a, b) => !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);

let totalProblems = 0;
for (const [key, g] of Object.entries(templates)) {
  const nodes = g.nodes || [];
  const boxes = nodes.filter(n => n.type === 'enhancedBoundingBox').map(boxRect);
  if (!boxes.length) { console.log(`\n## ${key} — (no region boxes)`); continue; }
  const content = nodes.filter(n => n.type !== 'enhancedBoundingBox').map(n => rect(n, estHeight(n)));

  const problems = [];
  // box-box overlap
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++)
      if (overlap(boxes[i], boxes[j])) problems.push(`OVERLAP ${boxes[i].id} ∩ ${boxes[j].id}`);
  // membership
  const membership = {};
  for (const c of content) {
    const owners = boxes.filter(b => inside(c, b));
    if (owners.length === 0) problems.push(`ORPHAN ${c.id} (in no box)`);
    if (owners.length > 1) problems.push(`CROSS ${c.id} in [${owners.map(o => o.id).join(', ')}]`);
    owners.forEach(o => { (membership[o.id] = membership[o.id] || []).push(c.id); });
  }
  totalProblems += problems.length;
  console.log(`\n## ${key}  (${boxes.length} boxes, ${content.length} content)  ${problems.length ? '❌ ' + problems.length : '✅ clean'}`);
  for (const b of boxes) console.log(`   ${b.id}: [${(membership[b.id] || []).join(', ') || '(empty!)'}]`);
  problems.forEach(p => console.log(`   ⚠ ${p}`));
}
console.log(`\n=== TOTAL PROBLEMS: ${totalProblems} ===`);
