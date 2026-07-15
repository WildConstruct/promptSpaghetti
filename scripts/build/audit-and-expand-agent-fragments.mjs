/**
 * Fragment corpus audit + agent-manifest expansion (Fragment Dissection v1).
 *
 * - Scans assets/library for all .psg files (canonical; does not move files)
 * - Merges curated agent-fragment-manifest entries (authoritative metadata)
 * - Derives defaults (including slotTypes) for unindexed fragments
 * - Writes:
 *   - assets/library/agent-fragment-manifest.json (expanded)
 *   - assets/library/index/fragment-audit-report.json
 *   - client/public/assets/library/agent-fragment-manifest.json (browser fetch path)
 * - Regenerates agent-fragment index via generate-agent-fragment-index.mjs
 *
 * Usage: node scripts/build/audit-and-expand-agent-fragments.mjs
 */
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');

const libraryRoot = path.join(repoRoot, 'assets', 'library');
const manifestPath = path.join(libraryRoot, 'agent-fragment-manifest.json');
const auditReportPath = path.join(
  libraryRoot,
  'index',
  'fragment-audit-report.json'
);
const publicManifestPath = path.join(
  repoRoot,
  'client',
  'public',
  'assets',
  'library',
  'agent-fragment-manifest.json'
);

/** Semantic slots for dissection / swap matching. */
const SLOT_TYPES = [
  'subject',
  'appearance',
  'action',
  'setting',
  'composition',
  'camera',
  'lighting',
  'style-medium',
  'mood',
  'constraint'
];

const DOMAINS = [
  'character',
  'creature',
  'vehicle',
  'building',
  'environment',
  'crowd',
  'object',
  'abstract'
];

const CATEGORY_DEFAULTS = {
  'body-silhouette': {
    roles: ['modifier', 'archetype-support'],
    domains: ['character', 'creature'],
    placementHints: ['downstream-of-choice'],
    slotTypes: ['appearance', 'subject']
  },
  'emotion-mood': {
    roles: ['modifier', 'branch-extension', 'output-finisher'],
    domains: ['character', 'creature', 'crowd'],
    placementHints: ['branch-lane', 'before-output', 'downstream-of-choice'],
    slotTypes: ['mood', 'appearance']
  },
  'action-dynamics': {
    roles: ['scenario', 'branch-extension', 'modifier'],
    domains: ['character', 'creature', 'vehicle'],
    placementHints: ['branch-lane', 'downstream-of-choice'],
    slotTypes: ['action']
  },
  'setting-environment': {
    roles: ['scenario', 'output-finisher', 'branch-extension'],
    domains: ['environment', 'building', 'vehicle'],
    placementHints: ['branch-lane', 'before-output'],
    slotTypes: ['setting', 'lighting', 'mood']
  },
  'facial-features': {
    roles: ['modifier', 'output-finisher'],
    domains: ['character', 'creature'],
    placementHints: ['downstream-of-choice', 'before-output'],
    slotTypes: ['appearance']
  },
  hair: {
    roles: ['modifier', 'archetype-support'],
    domains: ['character', 'creature'],
    placementHints: ['downstream-of-choice'],
    slotTypes: ['appearance']
  },
  'vehicles-mobility': {
    roles: ['scenario', 'modifier', 'archetype-support'],
    domains: ['vehicle', 'object'],
    placementHints: ['downstream-of-choice', 'branch-lane'],
    slotTypes: ['subject', 'appearance']
  },
  'weapons-armor-combat': {
    roles: ['modifier', 'archetype-support', 'branch-extension'],
    domains: ['character', 'object'],
    placementHints: ['downstream-of-choice', 'branch-lane'],
    slotTypes: ['appearance', 'subject', 'action']
  },
  extras: {
    roles: ['archetype'],
    domains: ['character', 'crowd'],
    placementHints: ['inside-region'],
    slotTypes: ['subject', 'appearance']
  },
  characters: {
    roles: ['archetype'],
    domains: ['character'],
    placementHints: ['inside-region'],
    slotTypes: ['subject', 'appearance']
  }
};

const SLOT_KEYWORD_RULES = [
  ['camera', ['camera', 'lens', 'focal', 'angle', 'pov', 'perspective']],
  ['lighting', ['light', 'lighting', 'illuminat', 'shadow', 'rim light', 'glow']],
  ['composition', ['composition', 'framing', 'rule of thirds', 'wide shot', 'close-up']],
  ['style-medium', ['style', 'medium', 'oil paint', 'watercolor', 'render', 'illustration', 'photograph']],
  ['mood', ['mood', 'emotion', 'atmosphere', 'tense', 'serene', 'melanchol']],
  ['constraint', ['must', 'avoid', 'no ', 'without', 'constraint', 'limit']],
  ['action', ['action', 'motion', 'gesture', 'running', 'fighting', 'walking', 'pose']],
  ['setting', ['setting', 'environment', 'weather', 'landscape', 'interior', 'exterior', 'backdrop']],
  ['appearance', ['hair', 'face', 'clothing', 'armor', 'outfit', 'body', 'silhouette', 'wear']],
  ['subject', ['subject', 'character', 'person', 'creature', 'vehicle', 'weapon', 'object']]
];

const DOMAIN_KEYWORD_RULES = [
  ['vehicle', ['vehicle', 'truck', 'car', 'engine', 'muffler', 'tire', 'motorcycle']],
  ['building', ['building', 'architecture', 'storefront', 'structure', 'facade']],
  ['environment', ['environment', 'weather', 'landscape', 'forest', 'city', 'backdrop', 'scene']],
  ['crowd', ['crowd', 'group', 'extras', 'audience']],
  ['creature', ['creature', 'monster', 'beast', 'dragon']],
  ['object', ['weapon', 'armor', 'gear', 'tool', 'prop', 'item']],
  ['abstract', ['abstract', 'concept', 'symbolic']],
  ['character', ['character', 'body', 'hair', 'face', 'emotion', 'human', 'person']]
];

const TONE_HINTS = [
  'gritty',
  'comic',
  'cinematic',
  'moody',
  'heroic',
  'haunted',
  'brutal',
  'playful',
  'surreal'
];

async function walkPsgFiles(dir) {
  const out = [];
  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'index' || entry.name === 'node_modules') {
          continue;
        }
        await walk(full);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.psg')) {
        out.push(full);
      }
    }
  }
  await walk(dir);
  return out.sort((a, b) => a.localeCompare(b));
}

function toPosixRel(absPath) {
  return path.relative(libraryRoot, absPath).split(path.sep).join('/');
}

function toPublicPath(relPosix) {
  return `/assets/library/${relPosix}`;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function titleCaseFromSlug(slug) {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function categoryFromRel(relPosix) {
  const parts = relPosix.split('/');
  if (parts.length === 1) {
    return 'extras';
  }
  return parts[0];
}

function detectFromKeywords(haystack, rules) {
  const found = [];
  for (const [key, patterns] of rules) {
    if (patterns.some(p => haystack.includes(p))) {
      found.push(key);
    }
  }
  return found;
}

function unique(list) {
  return Array.from(new Set(list.filter(Boolean)));
}

function inferNodeTypes(parsed) {
  const types = new Set();
  const nodes = Array.isArray(parsed?.nodes) ? parsed.nodes : [];
  for (const node of nodes) {
    const t = String(node?.type || '').toLowerCase();
    if (t.includes('weighted') || t === 'weightedchoice') {
      types.add('weighted-choice');
    } else if (t.includes('text')) {
      types.add('text');
    } else if (t.includes('variable')) {
      types.add('variable');
    } else if (t.includes('concat') || t.includes('merge')) {
      types.add('merge');
    } else if (t.includes('output')) {
      types.add('output');
    } else if (
      t.includes('bounding') ||
      t.includes('region') ||
      t.includes('group')
    ) {
      types.add('region');
    }
  }
  if (types.size === 0) {
    types.add(nodes.length > 1 ? 'weighted-choice' : 'weighted-choice');
  }
  return Array.from(types);
}

function contentFingerprint(parsed) {
  const nodes = Array.isArray(parsed?.nodes) ? parsed.nodes : [];
  const edges = Array.isArray(parsed?.edges) ? parsed.edges : [];
  const compact = {
    n: nodes.map(n => ({
      t: n?.type,
      o: Array.isArray(n?.options)
        ? n.options.map(o => o?.text ?? o?.label ?? '')
        : n?.value ?? n?.template ?? ''
    })),
    e: edges.map(e => `${e?.source}->${e?.target}`)
  };
  return crypto
    .createHash('sha1')
    .update(JSON.stringify(compact))
    .digest('hex')
    .slice(0, 12);
}

function qualityStatus(parseOk, nodeCount, hasOutput, category) {
  if (!parseOk) {
    return 'invalid';
  }
  if (category === '_deprecated') {
    return 'archived';
  }
  if (nodeCount === 0) {
    return 'empty';
  }
  if (nodeCount === 1) {
    return 'thin';
  }
  if (nodeCount >= 8 && hasOutput) {
    return 'rich';
  }
  return 'ok';
}

function recommendedAction(status, inManifest, duplicateGroup) {
  if (status === 'invalid') {
    return 'exclude-repair';
  }
  if (status === 'archived') {
    return 'exclude-archived';
  }
  if (status === 'empty') {
    return 'exclude-empty';
  }
  if (duplicateGroup && !inManifest) {
    return 'review-duplicate';
  }
  if (!inManifest) {
    return 'index-eligible';
  }
  return 'keep-indexed';
}

function mergeRecord(curated, derived) {
  if (!curated) {
    return derived;
  }
  // Curated fields win; fill gaps from derived (especially new slotTypes).
  return {
    ...derived,
    ...curated,
    tags: unique([...(curated.tags || []), ...(derived.tags || [])]),
    roles: unique([...(curated.roles || []), ...(derived.roles || [])]),
    domains: unique([...(curated.domains || []), ...(derived.domains || [])]),
    nodeTypes: unique([...(curated.nodeTypes || []), ...(derived.nodeTypes || [])]),
    placementHints: unique([
      ...(curated.placementHints || []),
      ...(derived.placementHints || [])
    ]),
    tone: unique([...(curated.tone || []), ...(derived.tone || [])]),
    slotTypes: unique([
      ...(curated.slotTypes || []),
      ...(derived.slotTypes || [])
    ]),
    description: curated.description || derived.description,
    name: curated.name || derived.name,
    path: curated.path || derived.path,
    category: curated.category || derived.category,
    nodeCount:
      typeof curated.nodeCount === 'number'
        ? curated.nodeCount
        : derived.nodeCount,
    source: curated ? 'curated+derived' : 'derived',
    userCreated: curated.userCreated === true
  };
}

function deriveRecord(relPosix, parsed, parseOk, parseError) {
  const category = categoryFromRel(relPosix);
  const baseName = path.basename(relPosix, '.psg');
  const id = slugify(
    category === 'extras' || category === relPosix
      ? baseName
      : `${category}-${baseName}`
  );
  const defaults = CATEGORY_DEFAULTS[category] || {
    roles: ['modifier'],
    domains: ['character'],
    placementHints: ['downstream-of-choice'],
    slotTypes: ['subject']
  };

  const haystack = `${relPosix} ${baseName} ${parsed?.name || ''} ${
    parsed?.description || ''
  }`.toLowerCase();
  const tags = unique([
    ...baseName.split(/[-_]/).filter(t => t.length > 2),
    category
  ]);

  const slotTypes = unique([
    ...defaults.slotTypes,
    ...detectFromKeywords(haystack, SLOT_KEYWORD_RULES)
  ]).filter(s => SLOT_TYPES.includes(s));

  const domains = unique([
    ...defaults.domains,
    ...detectFromKeywords(haystack, DOMAIN_KEYWORD_RULES)
  ]).filter(d => DOMAINS.includes(d));

  const tone = TONE_HINTS.filter(t => haystack.includes(t));
  const nodes = Array.isArray(parsed?.nodes) ? parsed.nodes : [];
  const nodeCount = nodes.length;
  const hasOutput = nodes.some(n =>
    String(n?.type || '')
      .toLowerCase()
      .includes('output')
  );

  return {
    id,
    name: parsed?.name || titleCaseFromSlug(baseName),
    path: toPublicPath(relPosix),
    category,
    description:
      parsed?.description ||
      `Library fragment: ${titleCaseFromSlug(baseName)} (${category}).`,
    tags,
    roles: [...defaults.roles],
    domains: domains.length > 0 ? domains : ['character'],
    nodeTypes: parseOk ? inferNodeTypes(parsed) : ['weighted-choice'],
    placementHints: [...defaults.placementHints],
    tone,
    slotTypes: slotTypes.length > 0 ? slotTypes : ['subject'],
    nodeCount,
    source: 'derived',
    userCreated: false,
    // audit-only fields stripped before writing manifest
    _audit: {
      relPath: relPosix,
      parseOk,
      parseError,
      fingerprint: parseOk ? contentFingerprint(parsed) : null,
      hasOutput,
      qualityStatus: qualityStatus(
        parseOk,
        nodeCount,
        hasOutput,
        category
      )
    }
  };
}

function stripAudit(record) {
  const {
    _audit,
    source,
    ...rest
  } = record;
  // Keep userCreated when true; omit false noise for curated cleanliness
  const out = { ...rest };
  if (record.userCreated === true) {
    out.userCreated = true;
  } else {
    delete out.userCreated;
  }
  // Ensure slotTypes always present on expanded manifest
  if (!Array.isArray(out.slotTypes) || out.slotTypes.length === 0) {
    out.slotTypes = ['subject'];
  }
  return out;
}

async function loadJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function runGenerateIndex() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [path.join(__dirname, 'generate-agent-fragment-index.mjs')],
      { cwd: repoRoot, stdio: 'inherit' }
    );
    child.on('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`generate-agent-fragment-index exited ${code}`));
      }
    });
  });
}

async function main() {
  const curatedManifest = await loadJson(manifestPath);
  if (curatedManifest.type !== 'agent-fragment-manifest') {
    throw new Error(`Unexpected manifest type: ${curatedManifest.type}`);
  }

  const curatedByPath = new Map();
  const curatedById = new Map();
  for (const frag of curatedManifest.fragments || []) {
    curatedById.set(frag.id, frag);
    const rel = String(frag.path || '')
      .replace(/^\/assets\/library\//, '')
      .replace(/^\//, '');
    curatedByPath.set(rel, frag);
  }

  const files = await walkPsgFiles(libraryRoot);
  const auditRows = [];
  const derivedRecords = [];
  const fingerprintGroups = new Map();

  for (const abs of files) {
    const rel = toPosixRel(abs);
    let parseOk = false;
    let parseError = null;
    let parsed = null;
    try {
      const raw = await fs.readFile(abs, 'utf8');
      parsed = JSON.parse(raw);
      parseOk =
        parsed &&
        typeof parsed === 'object' &&
        Array.isArray(parsed.nodes);
      if (!parseOk) {
        parseError = 'missing nodes array';
      }
    } catch (error) {
      parseOk = false;
      parseError = error instanceof Error ? error.message : String(error);
    }

    const derived = deriveRecord(rel, parsed, parseOk, parseError);
    const curated =
      curatedByPath.get(rel) ||
      curatedById.get(derived.id) ||
      null;
    const merged = mergeRecord(curated, derived);
    derivedRecords.push(merged);

    const fp = merged._audit?.fingerprint;
    if (fp) {
      if (!fingerprintGroups.has(fp)) {
        fingerprintGroups.set(fp, []);
      }
      fingerprintGroups.get(fp).push(rel);
    }
  }

  // Mark duplicate groups (same fingerprint, 2+ files)
  const duplicateOf = new Map();
  for (const [fp, paths] of fingerprintGroups.entries()) {
    if (paths.length < 2) {
      continue;
    }
    const groupId = `dup-${fp}`;
    for (const p of paths) {
      duplicateOf.set(p, groupId);
    }
  }

  const expandedFragments = [];
  for (const record of derivedRecords) {
    const rel = record._audit.relPath;
    const inManifest = Boolean(
      curatedByPath.has(rel) || curatedById.has(record.id)
    );
    const status = record._audit.qualityStatus;
    const dup = duplicateOf.get(rel) || null;
    const eligible =
      status === 'ok' ||
      status === 'thin' ||
      status === 'rich' ||
      (inManifest && status !== 'invalid');

    const action = recommendedAction(status, inManifest, dup);

    auditRows.push({
      path: record.path,
      relPath: rel,
      id: record.id,
      name: record.name,
      category: record.category,
      slotTypes: record.slotTypes,
      domains: record.domains,
      roles: record.roles,
      tone: record.tone,
      tags: record.tags,
      nodeCount: record.nodeCount,
      qualityStatus: status,
      parseOk: record._audit.parseOk,
      parseError: record._audit.parseError,
      duplicateGroup: dup,
      previouslyIndexed: inManifest,
      indexEligible: eligible && action !== 'exclude-repair' && action !== 'exclude-empty' && action !== 'exclude-archived',
      recommendedAction: action,
      userCreated: record.userCreated === true,
      metadataCoverage: {
        hasDescription: Boolean(record.description),
        hasSlotTypes: Array.isArray(record.slotTypes) && record.slotTypes.length > 0,
        hasDomains: Array.isArray(record.domains) && record.domains.length > 0,
        hasRoles: Array.isArray(record.roles) && record.roles.length > 0
      }
    });

    if (
      eligible &&
      action !== 'exclude-repair' &&
      action !== 'exclude-empty' &&
      action !== 'exclude-archived'
    ) {
      // Prefer curated id/path when present
      const curated = curatedByPath.get(rel) || curatedById.get(record.id);
      const finalRec = stripAudit({
        ...record,
        id: curated?.id || record.id,
        path: curated?.path || record.path
      });
      expandedFragments.push(finalRec);
    }
  }

  // Stable sort: category then name
  expandedFragments.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  // Ensure unique ids
  const seenIds = new Set();
  for (const frag of expandedFragments) {
    if (seenIds.has(frag.id)) {
      frag.id = `${frag.id}-${contentFingerprint({ nodes: [{ type: frag.path }] })}`;
    }
    seenIds.add(frag.id);
  }

  const expandedManifest = {
    version: '1.1.0',
    type: 'agent-fragment-manifest',
    generatedBy: 'audit-and-expand-agent-fragments',
    slotTypesCatalog: SLOT_TYPES,
    domainsCatalog: DOMAINS,
    fragments: expandedFragments
  };

  await writeJson(manifestPath, expandedManifest);
  try {
    await writeJson(publicManifestPath, expandedManifest);
  } catch {
    // public path optional in some layouts
  }

  // Mirror .psg files into client/public so browser fetch(/assets/library/...) works (F4).
  const publicLibraryRoot = path.join(
    repoRoot,
    'client',
    'public',
    'assets',
    'library'
  );
  let mirrored = 0;
  for (const abs of files) {
    const rel = toPosixRel(abs);
    const dest = path.join(publicLibraryRoot, ...rel.split('/'));
    try {
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.copyFile(abs, dest);
      mirrored += 1;
    } catch {
      // ignore individual copy failures
    }
  }
  console.log(
    `[fragment-audit] mirrored ${mirrored} .psg files → client/public/assets/library`
  );

  const summary = {
    scanned: files.length,
    previouslyIndexed: curatedManifest.fragments?.length ?? 0,
    expandedIndexed: expandedFragments.length,
    invalid: auditRows.filter(r => r.qualityStatus === 'invalid').length,
    empty: auditRows.filter(r => r.qualityStatus === 'empty').length,
    thin: auditRows.filter(r => r.qualityStatus === 'thin').length,
    rich: auditRows.filter(r => r.qualityStatus === 'rich').length,
    duplicates: Array.from(new Set(duplicateOf.values())).length,
    byCategory: {},
    bySlotType: {}
  };
  for (const row of auditRows) {
    summary.byCategory[row.category] =
      (summary.byCategory[row.category] || 0) + 1;
  }
  for (const frag of expandedFragments) {
    for (const slot of frag.slotTypes || []) {
      summary.bySlotType[slot] = (summary.bySlotType[slot] || 0) + 1;
    }
  }

  const auditReport = {
    version: '1.0.0',
    type: 'fragment-audit-report',
    generatedAt: new Date().toISOString(),
    libraryRoot: 'assets/library',
    summary,
    fragments: auditRows.sort((a, b) => a.relPath.localeCompare(b.relPath))
  };
  await writeJson(auditReportPath, auditReport);

  await runGenerateIndex();

  console.log(
    `[fragment-audit] scanned=${summary.scanned} previously=${summary.previouslyIndexed} expanded=${summary.expandedIndexed} invalid=${summary.invalid}`
  );
  console.log(
    `[fragment-audit] report → ${path.relative(repoRoot, auditReportPath)}`
  );
  console.log(
    `[fragment-audit] manifest → ${path.relative(repoRoot, manifestPath)} (${expandedFragments.length} fragments)`
  );
}

main().catch(error => {
  console.error('[fragment-audit] failed:', error);
  process.exit(1);
});
