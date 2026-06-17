// Dry-run / apply: give unnamed asset-fragment nodes a clear header name.
// Single-node fragments derive the name from the file's concept; we print the
// fragment name + region name alongside so the choice can be sanity-checked.
const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const root = 'assets/library';

function walk(d) {
  let r = [];
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) r = r.concat(walk(p));
    else if (e.name.endsWith('.psg')) r.push(p);
  }
  return r;
}

function titleCaseFromSlug(slug) {
  return slug
    .replace(/\.psg$/i, '')
    .split(/[-_]/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const files = walk(root);
const rows = [];
let changed = 0;

for (const f of files) {
  const rel = f.split(path.sep).join('/').replace(root + '/', '');
  let raw;
  try { raw = fs.readFileSync(f, 'utf8'); } catch (e) { continue; }
  let d;
  try { d = JSON.parse(raw); } catch (e) { continue; }
  const nodes = d.nodes || [];
  const unnamed = nodes.filter(n => !n.name || !String(n.name).trim());
  if (!unnamed.length) continue;

  const fileSlug = path.basename(rel);
  for (const n of unnamed) {
    // For single-node fragments the file concept is the right header.
    // For multi-node fragments, fall back to the node id (slug) so each node
    // still gets a distinct, readable header instead of a blank.
    const source = nodes.length === 1 ? fileSlug : String(n.id || 'node');
    const proposed = titleCaseFromSlug(source);
    rows.push({ rel, nodeId: n.id, type: n.type, proposed, fragName: d.name, multi: nodes.length });
    if (APPLY) n.name = proposed;
  }
  if (APPLY) {
    fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
    changed++;
  }
}

for (const r of rows) {
  console.log(
    (r.multi > 1 ? '[multi:' + r.multi + '] ' : '') +
    r.rel + '  node=' + r.nodeId + ' (' + r.type + ')  ->  "' + r.proposed + '"'
  );
}
console.log('\n' + (APPLY ? 'APPLIED to ' + changed + ' files, ' : 'DRY RUN — ') + rows.length + ' nodes');
