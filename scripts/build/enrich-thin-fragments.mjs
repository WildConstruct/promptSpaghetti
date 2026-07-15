/**
 * Enrich thin (single-node) library fragments into multi-node mini-graphs
 * where it improves standalone preview / Epic1 executability.
 *
 * Policy (v1):
 * 1. All thin fragments missing an Output: add Output + edge (safe default).
 * 2. High-value categories (setting, action, emotion, body, hair, facial,
 *    vehicles): if WeightedChoice has ≥12 options, also add a short TextBlock
 *    prefix (grammatical glue) so the fragment is Text → Choice → Output.
 * 3. weapons-armor-combat: Output only (volume high; avoid aggressive rewrites).
 *
 * Does not move files. Re-run: node scripts/build/enrich-thin-fragments.mjs
 * Then: pnpm audit:agent-fragments
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');
const libraryRoot = path.join(repoRoot, 'assets', 'library');

const RICH_PREFIX_CATEGORIES = new Set([
  'setting-environment',
  'action-dynamics',
  'emotion-mood',
  'body-silhouette',
  'hair',
  'facial-features',
  'vehicles-mobility'
]);

const PREFIX_BY_CATEGORY = {
  'setting-environment': 'set in',
  'action-dynamics': 'while',
  'emotion-mood': 'with a',
  'body-silhouette': 'with',
  hair: 'with',
  'facial-features': 'with',
  'vehicles-mobility': 'a'
};

async function walkPsg(dir) {
  const out = [];
  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'index') continue;
        await walk(full);
      } else if (entry.name.endsWith('.psg')) {
        out.push(full);
      }
    }
  }
  await walk(dir);
  return out;
}

function isWeightedChoice(node) {
  const t = String(node?.type || '');
  return /weightedchoice/i.test(t) || t === 'WeightedChoice';
}

function isOutput(node) {
  return /output/i.test(String(node?.type || ''));
}

function optionCount(node) {
  if (Array.isArray(node?.options)) return node.options.length;
  if (Array.isArray(node?.data?.options)) return node.data.options.length;
  return 0;
}

function enrichDocument(parsed, relPath) {
  const category = relPath.split(/[/\\]/)[0] || 'extras';
  const nodes = Array.isArray(parsed.nodes) ? [...parsed.nodes] : [];
  const edges = Array.isArray(parsed.edges) ? [...parsed.edges] : [];
  const regions = Array.isArray(parsed.regions) ? [...parsed.regions] : [];

  if (nodes.length === 0) {
    return { changed: false, reason: 'empty' };
  }

  const hasOutput = nodes.some(isOutput);
  const choiceNodes = nodes.filter(isWeightedChoice);
  const primary =
    choiceNodes[0] ||
    nodes.find(n => !/bounding|region|group|postit/i.test(String(n.type || '')));

  if (!primary) {
    return { changed: false, reason: 'no-primary' };
  }

  let changed = false;
  const notes = [];
  const baseId = String(primary.id || 'main');
  let lastSourceId = baseId;

  // Optional grammatical prefix for high-value categories with many options
  const opts = optionCount(primary);
  const wantPrefix =
    RICH_PREFIX_CATEGORIES.has(category) &&
    opts >= 12 &&
    !nodes.some(n => /textblock|text/i.test(String(n.type || '')));

  if (wantPrefix) {
    const prefixText =
      PREFIX_BY_CATEGORY[category] || 'with';
    const textId = `${baseId}-prefix`;
    const px = typeof primary.x === 'number' ? primary.x - 280 : 0;
    const py = typeof primary.y === 'number' ? primary.y : 100;
    nodes.unshift({
      id: textId,
      type: 'TextBlock',
      x: px,
      y: py,
      value: prefixText,
      name: 'Prefix',
      data: {
        label: 'Prefix',
        text: prefixText,
        value: prefixText
      }
    });
    // Primary stays; Concat would be ideal but fragment insert often uses the
    // choice node — keep chain as prefix → choice for linear assembly tools.
    edges.push({
      id: `${textId}-to-${baseId}`,
      source: textId,
      target: baseId,
      sourceHandle: 'source',
      targetHandle: 'target'
    });
    lastSourceId = baseId;
    changed = true;
    notes.push('added-text-prefix');
  }

  if (!hasOutput) {
    const outId = `${baseId}-output`;
    const ox =
      typeof primary.x === 'number' ? primary.x + 320 : 420;
    const oy = typeof primary.y === 'number' ? primary.y : 100;
    nodes.push({
      id: outId,
      type: 'Output',
      x: ox,
      y: oy,
      template: '',
      name: 'Output',
      data: {
        label: 'Output',
        outputName: 'fragment_output'
      }
    });
    edges.push({
      id: `${lastSourceId}-to-${outId}`,
      source: lastSourceId,
      target: outId,
      sourceHandle: 'source',
      targetHandle: 'target'
    });
    changed = true;
    notes.push('added-output');

    // Expand first region to include new nodes when present
    if (regions.length > 0 && Array.isArray(regions[0].nodes)) {
      const set = new Set(regions[0].nodes);
      if (wantPrefix) set.add(`${baseId}-prefix`);
      set.add(outId);
      regions[0] = { ...regions[0], nodes: Array.from(set) };
      notes.push('updated-region');
    }
  }

  if (!changed) {
    return { changed: false, reason: 'already-rich-enough' };
  }

  const next = {
    ...parsed,
    nodes,
    edges,
    regions: regions.length > 0 ? regions : parsed.regions,
    metadata: {
      ...(parsed.metadata || {}),
      enriched: true,
      enrichedAt: new Date().toISOString().slice(0, 10),
      enrichNotes: notes
    }
  };

  return { changed: true, document: next, notes };
}

async function main() {
  const files = await walkPsg(libraryRoot);
  let enriched = 0;
  let skipped = 0;
  const byNote = {};

  for (const abs of files) {
    const rel = path.relative(libraryRoot, abs).split(path.sep).join('/');
    let parsed;
    try {
      parsed = JSON.parse(await fs.readFile(abs, 'utf8'));
    } catch {
      skipped += 1;
      continue;
    }

    const nodeCount = Array.isArray(parsed.nodes) ? parsed.nodes.length : 0;
    // Only touch single-node (thin) fragments unless already missing output on 2-node
    const hasOutput = (parsed.nodes || []).some(isOutput);
    if (nodeCount > 1 && hasOutput) {
      skipped += 1;
      continue;
    }
    if (nodeCount === 0) {
      skipped += 1;
      continue;
    }

    const result = enrichDocument(parsed, rel);
    if (!result.changed) {
      skipped += 1;
      continue;
    }

    await fs.writeFile(abs, JSON.stringify(result.document, null, 2) + '\n', 'utf8');
    enriched += 1;
    for (const n of result.notes || []) {
      byNote[n] = (byNote[n] || 0) + 1;
    }
  }

  console.log(
    `[enrich-thin] enriched=${enriched} skipped=${skipped} notes=${JSON.stringify(byNote)}`
  );

  // Rebuild agent index so nodeCounts refresh
  await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [path.join(__dirname, 'audit-and-expand-agent-fragments.mjs')],
      { cwd: repoRoot, stdio: 'inherit' }
    );
    child.on('exit', code =>
      code === 0 ? resolve() : reject(new Error(`audit exit ${code}`))
    );
  });
}

main().catch(err => {
  console.error('[enrich-thin] failed', err);
  process.exit(1);
});
