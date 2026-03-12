#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../assets/library');
const MANIFEST_PATH = path.join(ROOT, 'asset-fragments-manifest.json');
const PUBLIC_MANIFEST_PATH = path.resolve(
  __dirname,
  '../client/public/assets/library/asset-fragments-manifest.json'
);
const SUMMARY_MODE = process.argv.includes('--summary');
const COMPACT_MODE = process.argv.includes('--compact');
const SYNC_MANIFEST_MODE = process.argv.includes('--sync-manifest');

const ALLOWED_NODE_TYPES = new Set([
  'WeightedChoice',
  'TextBlock',
  'Concat',
  'Output',
  'Variable',
  'SetVariable',
  'GetVariable',
  'Include'
]);

const ALLOWED_TOP_LEVEL_FIELDS = new Set([
  'version',
  'name',
  'description',
  'metadata',
  'nodes',
  'edges',
  'regions'
]);

const ALLOWED_METADATA_FIELDS = new Set(['type', 'author', 'tags', 'source']);

const ALLOWED_NODE_FIELDS = new Set([
  'id',
  'type',
  'name',
  'description',
  'x',
  'y',
  'options',
  'template',
  'value',
  'data'
]);

const EDITORISH_NODE_DATA_FIELDS = new Set([
  'label',
  'region',
  'collapsed',
  'nodeType',
  'fragmentRegionIds',
  'fragmentImported',
  'fragmentSource',
  'fragmentRegions',
  'regionCount',
  'nodeCount',
  'width',
  'height',
  'isCollapsed',
  'locked',
  'ports',
  'backgroundColor',
  'opacity',
  'borderColor',
  'borderStyle',
  'borderWidth',
  'title',
  'description',
  'position',
  'parentNode',
  'extent',
  'expandParent',
  'style',
  'selected',
  'dragging',
  'resizing',
  'measured'
]);

function walkPsgFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach(entry => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist') {
        return;
      }
      walkPsgFiles(entryPath, files);
      return;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.psg')) {
      files.push(entryPath);
    }
  });
  return files;
}

function uniq(values) {
  return Array.from(new Set(values));
}

function bump(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function classifyFile(filePath) {
  const relativePath = path.relative(path.resolve(__dirname, '..'), filePath);
  let parsed;

  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return {
      file: relativePath,
      category: 'unsafe',
      reasons: ['invalid JSON'],
      deviations: []
    };
  }

  const reasons = [];
  const deviations = [];

  if (!isObject(parsed)) {
    reasons.push('top-level PSG value is not an object');
  }

  if (typeof parsed.version !== 'string' || parsed.version.trim().length === 0) {
    reasons.push('missing version');
  }
  if (typeof parsed.name !== 'string' || parsed.name.trim().length === 0) {
    reasons.push('missing name');
  }
  if (!Array.isArray(parsed.nodes)) {
    reasons.push('missing nodes array');
  }
  if (!Array.isArray(parsed.edges)) {
    reasons.push('missing edges array');
  }
  if (parsed.regions !== undefined && !Array.isArray(parsed.regions)) {
    reasons.push('regions is not an array');
  }

  Object.keys(parsed || {}).forEach(key => {
    if (!ALLOWED_TOP_LEVEL_FIELDS.has(key)) {
      deviations.push(`extra top-level field: ${key}`);
    }
  });

  if (parsed.metadata !== undefined) {
    if (!isObject(parsed.metadata)) {
      reasons.push('metadata is not an object');
    } else {
      Object.keys(parsed.metadata).forEach(key => {
        if (!ALLOWED_METADATA_FIELDS.has(key)) {
          deviations.push(`extra metadata field: ${key}`);
        }
      });

      if (
        parsed.metadata.type !== undefined &&
        parsed.metadata.type !== 'ASSET_FRAGMENT'
      ) {
        deviations.push(`metadata.type is ${parsed.metadata.type}`);
      }

      if (
        parsed.metadata.tags !== undefined &&
        !Array.isArray(parsed.metadata.tags)
      ) {
        reasons.push('metadata.tags is not an array');
      }
    }
  }

  if (Array.isArray(parsed.nodes)) {
    parsed.nodes.forEach(node => {
      if (!isObject(node)) {
        reasons.push('node is not an object');
        return;
      }

      if (typeof node.id !== 'string' || node.id.trim().length === 0) {
        reasons.push('node missing id');
      }
      if (!ALLOWED_NODE_TYPES.has(node.type)) {
        reasons.push(`unknown node type: ${String(node.type)}`);
      }

      Object.keys(node).forEach(key => {
        if (!ALLOWED_NODE_FIELDS.has(key)) {
          deviations.push(`extra node field: ${key}`);
        }
      });

      if (
        node.position !== undefined ||
        node.parentNode !== undefined ||
        node.extent !== undefined ||
        node.expandParent !== undefined
      ) {
        reasons.push('editor wrapper fields still present on node');
      }

      if (node.data !== undefined) {
        if (!isObject(node.data)) {
          reasons.push('node.data is not an object');
        } else {
          Object.keys(node.data).forEach(key => {
            if (EDITORISH_NODE_DATA_FIELDS.has(key)) {
              deviations.push(`editor-ish node.data field: ${key}`);
            } else {
              deviations.push(`extra node.data field: ${key}`);
            }
          });
        }
      }

      if (node.type === 'WeightedChoice' && !Array.isArray(node.options)) {
        reasons.push('WeightedChoice missing options');
      }
      if (node.type === 'TextBlock' && typeof node.value !== 'string') {
        reasons.push('TextBlock missing value');
      }
      if (node.type === 'Output' && typeof node.template !== 'string') {
        reasons.push('Output missing template');
      }
      if (node.type === 'Concat' && node.value !== undefined && typeof node.value !== 'string') {
        reasons.push('Concat value is not a string');
      }

      if (Array.isArray(node.options)) {
        node.options.forEach(option => {
          if (!isObject(option)) {
            reasons.push('WeightedChoice option is not an object');
            return;
          }
          if (typeof option.text !== 'string') {
            reasons.push('WeightedChoice option missing text');
          }
          if (typeof option.weight !== 'number') {
            reasons.push('WeightedChoice option missing weight');
          }
          Object.keys(option).forEach(key => {
            if (!['text', 'weight', 'meta'].includes(key)) {
              deviations.push(`extra option field: ${key}`);
            }
          });
          if (option.meta !== undefined && !isObject(option.meta)) {
            reasons.push('WeightedChoice option meta is not an object');
          }
        });
      }
    });
  }

  if (Array.isArray(parsed.edges)) {
    parsed.edges.forEach(edge => {
      if (!isObject(edge)) {
        reasons.push('edge is not an object');
        return;
      }
      if (typeof edge.id !== 'string' || edge.id.trim().length === 0) {
        reasons.push('edge missing id');
      }
      if (typeof edge.source !== 'string' || typeof edge.target !== 'string') {
        reasons.push('edge missing source or target');
      }
      if (edge.sourceHandle !== undefined) {
        if (typeof edge.sourceHandle !== 'string') {
          reasons.push('sourceHandle is not a string');
        } else if (
          !/^branch-\d+$/.test(edge.sourceHandle) &&
          edge.sourceHandle !== 'source' &&
          edge.sourceHandle !== 'main'
        ) {
          reasons.push(`unsupported sourceHandle: ${edge.sourceHandle}`);
        } else if (edge.sourceHandle === 'source' || edge.sourceHandle === 'main') {
          deviations.push(`explicit generic sourceHandle: ${edge.sourceHandle}`);
        }
      }
      if (edge.targetHandle !== undefined) {
        if (typeof edge.targetHandle !== 'string') {
          reasons.push('targetHandle is not a string');
        } else if (!['target', 'input1', 'input2'].includes(edge.targetHandle)) {
          reasons.push(`unsupported targetHandle: ${edge.targetHandle}`);
        } else if (edge.targetHandle === 'target') {
          deviations.push('explicit generic targetHandle: target');
        }
      }
    });
  }

  if (Array.isArray(parsed.regions)) {
    parsed.regions.forEach(region => {
      if (!isObject(region)) {
        reasons.push('region is not an object');
        return;
      }
      if (typeof region.id !== 'string' || region.id.trim().length === 0) {
        reasons.push('region missing id');
      }
      if (typeof region.name !== 'string' || region.name.trim().length === 0) {
        reasons.push('region missing name');
      }
      if (!Array.isArray(region.nodes)) {
        reasons.push('region missing nodes');
      } else if (region.nodes.some(nodeId => typeof nodeId !== 'string')) {
        reasons.push('region has non-string node ids');
      }

      Object.keys(region).forEach(key => {
        if (!['id', 'name', 'color', 'color_comment', 'nodes', 'description', 'metadata', 'ports'].includes(key)) {
          deviations.push(`extra region field: ${key}`);
        }
      });

      if (region.metadata !== undefined) {
        if (!isObject(region.metadata)) {
          reasons.push('region metadata is not an object');
        } else if (Object.keys(region.metadata).length > 0) {
          deviations.push('region metadata');
        }
      }

      if (region.ports !== undefined) {
        if (!Array.isArray(region.ports)) {
          reasons.push('region ports is not an array');
        } else if (region.ports.length > 0) {
          deviations.push('region ports');
        }
      }
    });
  }

  const uniqueReasons = uniq(reasons);
  const uniqueDeviations = uniq(deviations);

  if (uniqueReasons.length > 0) {
    return {
      file: relativePath,
      category: 'unsafe',
      reasons: uniqueReasons,
      deviations: uniqueDeviations
    };
  }

  if (uniqueDeviations.length > 0) {
    return {
      file: relativePath,
      category: 'richer',
      reasons: [],
      deviations: uniqueDeviations
    };
  }

  return {
    file: relativePath,
    category: 'canonical',
    reasons: [],
    deviations: []
  };
}

function collectManifestMismatches() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const mismatches = [];

  (manifest.fragments || []).forEach(fragment => {
    const filePath = path.join(ROOT, String(fragment.path || '').replace(/^\.\//, ''));
    if (!fs.existsSync(filePath)) {
      mismatches.push({ path: fragment.path, issue: 'missing file' });
      return;
    }

    const psg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const nodeCount = Array.isArray(psg.nodes) ? psg.nodes.length : 0;
    const edgeCount = Array.isArray(psg.edges) ? psg.edges.length : 0;

    if (
      fragment.name !== psg.name ||
      String(fragment.description || '') !== String(psg.description || '') ||
      fragment.nodeCount !== nodeCount ||
      fragment.edgeCount !== edgeCount
    ) {
      mismatches.push({
        path: fragment.path,
        manifest: {
          name: fragment.name,
          description: fragment.description,
          nodeCount: fragment.nodeCount,
          edgeCount: fragment.edgeCount
        },
        file: {
          name: psg.name,
          description: psg.description,
          nodeCount,
          edgeCount
        }
      });
    }
  });

  return mismatches;
}

function syncManifestFromFiles() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  let updatedCount = 0;

  (manifest.fragments || []).forEach(fragment => {
    const filePath = path.join(ROOT, String(fragment.path || '').replace(/^\.\//, ''));
    if (!fs.existsSync(filePath)) {
      return;
    }

    const psg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const nextName = psg.name;
    const nextDescription = psg.description;
    const nextNodeCount = Array.isArray(psg.nodes) ? psg.nodes.length : 0;
    const nextEdgeCount = Array.isArray(psg.edges) ? psg.edges.length : 0;

    const changed =
      fragment.name !== nextName ||
      String(fragment.description || '') !== String(nextDescription || '') ||
      fragment.nodeCount !== nextNodeCount ||
      fragment.edgeCount !== nextEdgeCount;

    if (!changed) {
      return;
    }

    fragment.name = nextName;
    fragment.description = nextDescription;
    fragment.nodeCount = nextNodeCount;
    fragment.edgeCount = nextEdgeCount;
    updatedCount += 1;
  });

  if (updatedCount > 0) {
    manifest.lastUpdated = new Date().toISOString();
    const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
    fs.writeFileSync(MANIFEST_PATH, serialized, 'utf8');

    const publicDir = path.dirname(PUBLIC_MANIFEST_PATH);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(PUBLIC_MANIFEST_PATH, serialized, 'utf8');
  }

  return { updatedCount };
}

function buildReport() {
  const results = walkPsgFiles(ROOT).sort().map(classifyFile);
  const counts = {
    canonical: 0,
    richer: 0,
    unsafe: 0,
    total: results.length
  };
  const deviationCounts = new Map();

  results.forEach(result => {
    counts[result.category] += 1;
    result.reasons.forEach(reason => bump(deviationCounts, reason));
    result.deviations.forEach(deviation => bump(deviationCounts, deviation));
  });

  return {
    counts,
    unsafeFiles: results.filter(result => result.category === 'unsafe'),
    richerFiles: results.filter(result => result.category === 'richer'),
    topDeviations: Array.from(deviationCounts.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 25)
      .map(([deviation, count]) => ({ deviation, count })),
    manifestMismatches: collectManifestMismatches()
  };
}

const report = buildReport();

if (SYNC_MANIFEST_MODE) {
  const syncResult = syncManifestFromFiles();
  console.log(JSON.stringify(syncResult, null, 2));
  process.exit(0);
}

if (COMPACT_MODE) {
  console.log(JSON.stringify({
    counts: report.counts,
    unsafeCount: report.unsafeFiles.length,
    manifestMismatchCount: report.manifestMismatches.length,
    topDeviations: report.topDeviations.slice(0, 15)
  }, null, 2));
} else if (SUMMARY_MODE) {
  console.log(JSON.stringify({
    counts: report.counts,
    unsafeFiles: report.unsafeFiles.slice(0, 20),
    richerSample: report.richerFiles.slice(0, 20),
    topDeviations: report.topDeviations,
    manifestMismatchCount: report.manifestMismatches.length,
    manifestMismatchSample: report.manifestMismatches.slice(0, 20)
  }, null, 2));
} else {
  console.log(JSON.stringify(report, null, 2));
}
