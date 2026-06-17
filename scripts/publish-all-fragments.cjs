// Publish every .psg in assets/library to the app:
//  1. Rebuild asset-fragments-manifest.json (flat `fragments[]`) covering all
//     fragments, preserving the existing curated entries by path.
//  2. Mirror all .psg + the manifest into client/public/assets/library so the
//     app actually serves them.
// Run with --apply to write; default is a dry-run summary.
const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const SRC = 'assets/library';
const PUB = 'client/public/assets/library';
const MANIFEST = 'asset-fragments-manifest.json';

function walk(d) {
  let r = [];
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) r = r.concat(walk(p));
    else if (e.name.endsWith('.psg')) r.push(p);
  }
  return r;
}

const srcManifest = JSON.parse(fs.readFileSync(path.join(SRC, MANIFEST), 'utf8'));
const existingByPath = new Map();
for (const f of (srcManifest.fragments || [])) {
  existingByPath.set(f.path.replace(/^\.\//, ''), f);
}

const files = walk(SRC).filter(f => !f.endsWith(MANIFEST));
const usedIds = new Set();
const fragments = [];
const catSet = new Set();
let preserved = 0, added = 0;

// Stable order: by relative path.
const rels = files
  .map(f => f.split(path.sep).join('/').replace(SRC + '/', ''))
  .sort();

for (const rel of rels) {
  const full = path.join(SRC, rel);
  let d;
  try { d = JSON.parse(fs.readFileSync(full, 'utf8')); } catch (e) { console.log('SKIP (parse):', rel); continue; }
  const parts = rel.split('/');
  const category = parts.length > 1 ? parts[0] : (d.metadata && d.metadata.category) || 'misc';
  catSet.add(category);
  const nodeCount = (d.nodes || []).length;
  const edgeCount = (d.edges || []).length;

  const existing = existingByPath.get(rel);
  if (existing) {
    usedIds.add(existing.id);
    // Refresh derived counts but keep curated id/name/description/tags.
    fragments.push({ ...existing, nodeCount, edgeCount });
    preserved++;
    continue;
  }

  const fileSlug = path.basename(rel).replace(/\.psg$/i, '');
  let id = 'fragment-' + fileSlug;
  if (usedIds.has(id)) id = 'fragment-' + category + '-' + fileSlug;
  let n = 2;
  while (usedIds.has(id)) id = 'fragment-' + category + '-' + fileSlug + '-' + n++;
  usedIds.add(id);

  fragments.push({
    id,
    name: d.name || fileSlug,
    description: d.description || '',
    path: './' + rel,
    category,
    tags: (d.metadata && d.metadata.tags) || [],
    nodeCount,
    edgeCount,
    metadata: {
      author: (d.metadata && d.metadata.author) || srcManifest.author || 'Library',
      created: (d.metadata && d.metadata.created) || '',
      updated: (d.metadata && d.metadata.updated) || '',
      version: (d.metadata && d.metadata.version) || '1.0.0'
    }
  });
  added++;
}

const totalNodes = fragments.reduce((s, f) => s + (f.nodeCount || 0), 0);
const outManifest = {
  ...srcManifest,
  fragments,
  statistics: {
    ...(srcManifest.statistics || {}),
    total_fragments: fragments.length,
    total_nodes: totalNodes,
    categories: [...catSet].sort()
  }
};

console.log('Fragments total:', fragments.length, '(preserved', preserved, '+ added', added, ')');
console.log('Categories (' + catSet.size + '):', [...catSet].sort().join(', '));
console.log('Sample new entries:');
fragments.filter(f => !existingByPath.has(f.path.replace(/^\.\//, ''))).slice(0, 4)
  .forEach(f => console.log('  ', JSON.stringify({ id: f.id, name: f.name, category: f.category, path: f.path, nodeCount: f.nodeCount })));

if (!APPLY) { console.log('\nDRY RUN — pass --apply to write manifest + mirror .psg files'); process.exit(0); }

const manifestStr = JSON.stringify(outManifest, null, 2) + '\n';
fs.writeFileSync(path.join(SRC, MANIFEST), manifestStr);
fs.mkdirSync(PUB, { recursive: true });
fs.writeFileSync(path.join(PUB, MANIFEST), manifestStr);

let mirrored = 0;
for (const rel of rels) {
  const from = path.join(SRC, rel);
  const to = path.join(PUB, rel);
  const content = fs.readFileSync(from, 'utf8');
  if (!fs.existsSync(to) || fs.readFileSync(to, 'utf8') !== content) {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.writeFileSync(to, content);
    mirrored++;
  }
}
console.log('\nAPPLIED. Manifest written (src + public). Mirrored', mirrored, '.psg file(s) to public.');
