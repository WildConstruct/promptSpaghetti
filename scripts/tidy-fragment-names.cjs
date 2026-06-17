// Strip the verbose "... Asset Fragment" / "... Fragment" suffix from each
// fragment's display name so the Library list reads cleanly. The node headers
// and ids are untouched. Run with --apply.
const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const root = 'assets/library';

function walk(d) {
  let r = [];
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name.startsWith('_')) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) r = r.concat(walk(p));
    else if (e.name.endsWith('.psg')) r.push(p);
  }
  return r;
}

function tidy(name) {
  return String(name || '')
    .replace(/\s*(?:asset\s+)?fragment\s*$/i, '')
    .trim();
}

const files = walk(root);
let changed = 0;
const samples = [];
for (const f of files) {
  let d;
  try { d = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { continue; }
  const next = tidy(d.name);
  if (next && next !== d.name) {
    if (samples.length < 8) samples.push(`"${d.name}"  ->  "${next}"`);
    if (APPLY) {
      d.name = next;
      fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
    }
    changed++;
  }
}
samples.forEach(s => console.log('  ' + s));
console.log('\n' + (APPLY ? 'APPLIED to ' : 'DRY RUN — ') + changed + ' fragment name(s)');
