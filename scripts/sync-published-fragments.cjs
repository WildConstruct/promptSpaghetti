// Sync the published fragment set (per the manifest) from the source master
// (assets/library) into the app's served public dir (client/public/assets/library),
// so manifest-listed fragments serve their current source content.
const fs = require('fs');
const path = require('path');

const SRC = 'assets/library';
const PUB = 'client/public/assets/library';
const manifest = JSON.parse(fs.readFileSync(path.join(SRC, 'asset-fragments-manifest.json'), 'utf8'));
const frags = manifest.fragments || [];

let copied = 0;
const changes = [];
for (const f of frags) {
  const relRaw = f.file || f.path || f.source;
  if (!relRaw) continue;
  const rel = relRaw.replace(/^\.\//, '');
  const srcPath = path.join(SRC, rel);
  const pubPath = path.join(PUB, rel);
  if (!fs.existsSync(srcPath)) { console.log('MISSING SOURCE:', srcPath); continue; }
  const srcContent = fs.readFileSync(srcPath, 'utf8');
  const pubContent = fs.existsSync(pubPath) ? fs.readFileSync(pubPath, 'utf8') : null;
  if (srcContent === pubContent) continue;
  fs.mkdirSync(path.dirname(pubPath), { recursive: true });
  fs.writeFileSync(pubPath, srcContent);
  copied++;
  changes.push(rel);
}
// Keep the public manifest identical to the source manifest.
const srcMan = fs.readFileSync(path.join(SRC, 'asset-fragments-manifest.json'), 'utf8');
const pubManPath = path.join(PUB, 'asset-fragments-manifest.json');
if (fs.readFileSync(pubManPath, 'utf8') !== srcMan) { fs.writeFileSync(pubManPath, srcMan); changes.push('asset-fragments-manifest.json'); }

console.log('Synced', copied, 'fragment file(s) (of', frags.length, 'published):');
changes.forEach(c => console.log('  ' + c));
