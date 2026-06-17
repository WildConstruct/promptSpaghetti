// Conform RomanCitizen from a full document (has Output nodes) into a valid
// fragment, and deprecate the original by archiving it under _deprecated/.
const fs = require('fs');
const path = require('path');

const SRC = 'assets/library/RomanCitizen.psg';
const ARCHIVE_DIR = 'assets/library/_deprecated';
const ARCHIVE = path.join(ARCHIVE_DIR, 'RomanCitizen.psg');

const original = JSON.parse(fs.readFileSync(SRC, 'utf8'));

// 1. Archive the original (full document) as deprecated.
fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
const archived = {
  ...original,
  metadata: {
    ...(original.metadata || {}),
    deprecated: true,
    deprecation_note:
      'Full-document form (contains Output nodes); superseded by the conformed RomanCitizen fragment. Not published.'
  }
};
fs.writeFileSync(ARCHIVE, JSON.stringify(archived, null, 2) + '\n');

// 2. Build the conformed fragment: drop Output nodes, drop edges touching them,
//    and remove their ids from every region.
const isOutput = n => String(n.type || '').toLowerCase() === 'output';
const outputIds = new Set(original.nodes.filter(isOutput).map(n => n.id));

const nodes = original.nodes.filter(n => !isOutput(n));
const edges = (original.edges || []).filter(e => {
  const from = e.source || e.from;
  const to = e.target || e.to;
  return !outputIds.has(from) && !outputIds.has(to);
});
const regions = (original.regions || []).map(r => ({
  ...r,
  nodes: Array.isArray(r.nodes) ? r.nodes.filter(id => !outputIds.has(id)) : r.nodes
}));

const conformed = {
  ...original,
  nodes,
  edges,
  regions,
  metadata: {
    ...(original.metadata || {}),
    type: 'ASSET_FRAGMENT',
    conformed_from: 'full-document (Output nodes removed)'
  }
};
fs.writeFileSync(SRC, JSON.stringify(conformed, null, 2) + '\n');

console.log('Conformed RomanCitizen fragment:');
console.log('  nodes:', original.nodes.length, '->', nodes.length, '(removed Output:', [...outputIds].join(', ') + ')');
console.log('  edges:', (original.edges || []).length, '->', edges.length);
console.log('  region nodes:', (original.regions?.[0]?.nodes || []).length, '->', regions?.[0]?.nodes?.length);
console.log('Archived original ->', ARCHIVE, '(deprecated)');
