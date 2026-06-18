// Audit each Explore template for nodes that describe the ENVIRONMENT / scene /
// location the subject is in (vs. the subject itself). For subject-extraction
// documents these should be a neutral light-gray backdrop, not a described place.
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

// Heuristic: node id/name/label that reads as a place/scene/backdrop.
const ENV = /(scene|setting|venue|location|backdrop|background|environment|seat|zone|town|street|room|stage|arena|stadium|field|biome|weather|sky|context|place|surrounding)/i;

for (const [key, g] of Object.entries(templates)) {
  const nodes = g.nodes || [];
  const envNodes = nodes.filter(n => {
    const tag = `${n.id} ${n.data?.label || ''} ${n.data?.title || ''}`;
    return ENV.test(tag);
  });
  if (!envNodes.length) {
    console.log(`\n## ${key} — (no obvious environment node)`);
    continue;
  }
  console.log(`\n## ${key}`);
  for (const n of envNodes) {
    const opts = (n.data?.options || []).map(o => o.text).filter(Boolean);
    const label = n.data?.label || n.data?.title || n.id;
    const sample =
      n.type === 'weightedChoice'
        ? opts.slice(0, 4).join(' | ') + (opts.length > 4 ? ` … (${opts.length})` : '')
        : JSON.stringify(n.data?.text || n.data?.value || '').slice(0, 90);
    console.log(`  [${n.type}] "${label}" (${n.id}): ${sample}`);
  }
}
