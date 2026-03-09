import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');

const manifestPath = path.join(
  repoRoot,
  'assets',
  'library',
  'agent-fragment-manifest.json'
);
const outputRoot = path.join(repoRoot, 'assets', 'library', 'index');

function stableSort(records) {
  return [...records].sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });
}

function groupBy(records, key) {
  const groups = new Map();
  for (const record of records) {
    const values = Array.isArray(record[key]) ? record[key] : [record[key]];
    for (const value of values) {
      if (!value) continue;
      if (!groups.has(value)) {
        groups.set(value, []);
      }
      groups.get(value).push(record);
    }
  }
  return groups;
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

async function writeJsonl(filePath, rows) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const body = rows.map(row => JSON.stringify(row)).join('\n') + '\n';
  await fs.writeFile(filePath, body, 'utf8');
}

async function main() {
  const manifestRaw = await fs.readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestRaw);

  if (manifest.type !== 'agent-fragment-manifest') {
    throw new Error(`Unexpected manifest type: ${manifest.type}`);
  }

  const fragments = stableSort(manifest.fragments);
  const generatedAt = new Date().toISOString();

  const fullIndex = {
    version: manifest.version,
    type: 'agent-fragment-index',
    generatedAt,
    totalFragments: fragments.length,
    fragments
  };

  await writeJson(path.join(outputRoot, 'agent-fragments.json'), fullIndex);
  await writeJsonl(path.join(outputRoot, 'agent-fragments.jsonl'), fragments);

  const categoryGroups = groupBy(fragments, 'category');
  for (const [category, records] of categoryGroups.entries()) {
    await writeJson(
      path.join(outputRoot, 'shards', 'by-category', `${category}.json`),
      {
        version: manifest.version,
        type: 'agent-fragment-shard',
        groupBy: 'category',
        key: category,
        generatedAt,
        totalFragments: records.length,
        fragments: stableSort(records)
      }
    );
  }

  const roleGroups = groupBy(fragments, 'roles');
  for (const [role, records] of roleGroups.entries()) {
    await writeJson(
      path.join(outputRoot, 'shards', 'by-role', `${role}.json`),
      {
        version: manifest.version,
        type: 'agent-fragment-shard',
        groupBy: 'role',
        key: role,
        generatedAt,
        totalFragments: records.length,
        fragments: stableSort(records)
      }
    );
  }

  console.log(
    `[agent-index] Wrote ${fragments.length} records to ${path.relative(
      repoRoot,
      outputRoot
    )}`
  );
}

main().catch(error => {
  console.error('[agent-index] generation failed:', error);
  process.exit(1);
});
