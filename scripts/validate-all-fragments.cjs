const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function walk(d) {
  let r = [];
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name.startsWith('_')) continue; // skip _deprecated / archive dirs
    const p = path.join(d, e.name);
    if (e.isDirectory()) r = r.concat(walk(p));
    else if (e.name.endsWith('.psg')) r.push(p);
  }
  return r;
}

const files = walk('assets/library');
const fails = [];
for (const f of files) {
  const rel = f.split(path.sep).join('/').replace('assets/library/', '');
  let out = '';
  try {
    out = execSync('node scripts/validate-asset.js "' + f + '"', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (e) {
    out = (e.stdout || '') + (e.stderr || '');
  }
  if (/FAILED|invalid/i.test(out) || out.includes('❌')) {
    const errs = [...new Set((out.match(/•\s*(.+)/g) || []).map(s => s.replace(/•\s*/, '').trim()))];
    fails.push({ rel, errs });
  }
}

console.log('TOTAL:', files.length, '| FAILED:', fails.length);
const byErr = {};
for (const x of fails) {
  console.log('  ' + x.rel + '  =>  ' + x.errs.join('; '));
  for (const e of x.errs) byErr[e] = (byErr[e] || 0) + 1;
}
console.log('\nError frequency:');
Object.entries(byErr).sort((a, b) => b[1] - a[1]).forEach(([e, c]) => console.log('  ' + c + '  ' + e));
