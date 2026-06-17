const fs = require('fs');
const path = require('path');

function walk(d) {
  let r = [];
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) r = r.concat(walk(p));
    else if (e.name.endsWith('.psg')) r.push(p);
  }
  return r;
}

const root = 'assets/library';
const files = walk(root);
const byCat = {};
const unnamedFrag = [];
const regionGap = [];
const genericName = [];

for (const f of files) {
  const rel = f.split(path.sep).join('/').replace(root + '/', '');
  const cat = rel.split('/')[0];
  byCat[cat] = (byCat[cat] || 0) + 1;
  let d;
  try { d = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { continue; }
  const nodes = d.nodes || [];
  const regions = d.regions || [];
  const nodeIds = new Set(nodes.map(n => n.id));
  const unnamed = nodes.filter(n => !n.name || !String(n.name).trim());
  if (unnamed.length) unnamedFrag.push(rel + ' (' + unnamed.length + '/' + nodes.length + ')');
  const covered = new Set();
  for (const r of regions) for (const id of (r.nodes || [])) covered.add(id);
  const uncovered = [...nodeIds].filter(id => !covered.has(id));
  if (uncovered.length || !regions.length) regionGap.push(rel + ' [uncovered:' + uncovered.length + ', regions:' + regions.length + ']');
  for (const n of nodes) {
    const nm = String(n.name || '').trim();
    if (/^(weighted ?choice|node|untitled|new node|output)$/i.test(nm)) genericName.push(rel + ' :: "' + nm + '"');
  }
}

console.log('TOTAL fragments:', files.length);
console.log('by category:', JSON.stringify(byCat));
console.log('\nUNNAMED-NODE fragments (' + unnamedFrag.length + '):');
unnamedFrag.forEach(x => console.log('  ' + x));
console.log('\nREGION-GAP fragments (' + regionGap.length + '):');
regionGap.forEach(x => console.log('  ' + x));
console.log('\nGENERIC node names (' + genericName.length + '):');
genericName.forEach(x => console.log('  ' + x));
