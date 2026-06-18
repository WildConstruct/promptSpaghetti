// Audit each Explore template's Concat (Merge) nodes against the merge
// methodology: a space/default join of content sources is GLUE (replaceable by
// wiring content -> content, implicit concat); a styled join (comma/oxford/
// sentence/bullet/json) or non-space separator is KEEP.
const esbuild = require('esbuild');

const out = esbuild.buildSync({
  entryPoints: ['client/src/templates/quickStartTemplates.ts'],
  bundle: true,
  format: 'cjs',
  write: false,
  platform: 'node',
  external: ['reactflow']
}).outputFiles[0].text;
const mod = { exports: {} };
new Function('module', 'exports', 'require', out)(
  mod,
  mod.exports,
  x => (x === 'reactflow' ? {} : require(x))
);
const templates = mod.exports.quickStartTemplates || {};

const STYLED = new Set(['comma', 'and', 'sentence', 'bullet', 'json']);

function classify(concat, incoming) {
  const sep = concat.data?.separator;
  const style = concat.data?.joinStyle;
  if (style && STYLED.has(style)) return { verdict: 'KEEP', why: `styled join (${style})` };
  if (typeof sep === 'string' && sep.trim() !== '' && sep !== ' ')
    return { verdict: 'KEEP', why: `non-space separator ${JSON.stringify(sep)}` };
  if (incoming.length <= 1)
    return { verdict: 'DROP', why: 'single/zero input — pointless' };
  return { verdict: 'GLUE', why: 'space join of content — chain instead' };
}

let totals = { GLUE: 0, KEEP: 0, DROP: 0 };
for (const [key, g] of Object.entries(templates)) {
  const nodes = g.nodes || [];
  const edges = g.edges || [];
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  const concats = nodes.filter(n => n.type === 'concat');
  if (!concats.length) {
    console.log(`\n## ${key} — no Merge nodes`);
    continue;
  }
  console.log(`\n## ${key}  (${nodes.length} nodes, ${concats.length} merge)`);
  for (const c of concats) {
    const incoming = edges.filter(e => e.target === c.id);
    const srcs = incoming.map(e => {
      const s = byId[e.source];
      return `${e.source}:${s ? s.type : '?'}`;
    });
    const { verdict, why } = classify(c, incoming);
    totals[verdict]++;
    console.log(
      `  [${verdict}] ${c.id}  inputs=${incoming.length} (${srcs.join(', ')})  — ${why}`
    );
  }
}
console.log(
  `\nTOTALS: GLUE(convert)=${totals.GLUE}  KEEP=${totals.KEEP}  DROP=${totals.DROP}`
);
