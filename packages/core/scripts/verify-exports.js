#!/usr/bin/env node
/*
 Simple verification script for @promptscape/core exports and build outputs.
 Checks that the package.json exports map to existing files and that core
 utils subpaths exist for ESM, CJS, and types.
*/
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

function assertExists(relPath, label) {
  const p = path.join(root, relPath);
  if (!fs.existsSync(p)) {
    throw new Error(`Missing ${label}: ${relPath}`);
  }
}

function readText(relPath, label) {
  assertExists(relPath, label);
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function assertContains(text, expected, label) {
  if (!text.includes(expected)) {
    throw new Error(`Missing ${label}: ${expected}`);
  }
}

function logOk(msg) {
  process.stdout.write(`✔ ${msg}\n`);
}

// Verify main exports
const exp = pkg.exports;
if (!exp || !exp['.'] || !exp['./utils'] || !exp['./utils/*']) {
  throw new Error(
    'package.json exports missing required entries (., ./utils, ./utils/*)'
  );
}

// "." export
assertExists(exp['.'].import.replace('./', ''), 'ESM main export');
assertExists(exp['.'].require.replace('./', ''), 'CJS main export');
assertExists(exp['.'].types.replace('./', ''), 'Types main export');
logOk('Main (.) export maps to dist files');

// "./utils" export
assertExists(exp['./utils'].import.replace('./', ''), 'ESM utils index');
assertExists(exp['./utils'].require.replace('./', ''), 'CJS utils index');
assertExists(exp['./utils'].types.replace('./', ''), 'Types utils index');
logOk('Utils export maps to dist files');

// Spot-check specific utils via the subpath pattern
const utilsToCheck = [
  'psgCodec',
  'psgStorage',
  'supabaseClient',
  'supabaseFeature'
];
for (const u of utilsToCheck) {
  assertExists(`dist/esm/utils/${u}.js`, `ESM utils/${u}`);
  assertExists(`dist/cjs/utils/${u}.js`, `CJS utils/${u}`);
  assertExists(`dist/types/utils/${u}.d.ts`, `Types utils/${u}`);
}
logOk('Utils subpaths exist for ESM/CJS/types');

// Bonus: ensure public files are in place
assertExists('dist/esm/public.js', 'ESM public.js');
assertExists('dist/cjs/public.js', 'CJS public.js');
assertExists('dist/types/public.d.ts', 'Types public.d.ts');
logOk('Public entrypoint files present');

const publicSource = readText('public.ts', 'source public.ts');
const publicTypes = readText(
  'dist/types/public.d.ts',
  'generated public types'
);
const requiredPublicSymbols = [
  'readPsg',
  'looksLikeLegacyGraphWrapper',
  'parsePsgWithCompatibility',
  'exportGraphToPSG'
];

for (const symbol of requiredPublicSymbols) {
  assertContains(publicSource, symbol, `source public symbol in public.ts`);
  assertContains(
    publicTypes,
    symbol,
    `generated public symbol in dist/types/public.d.ts`
  );
}
logOk('Required public symbols exist in source and generated types');

process.stdout.write('All export checks passed.\n');
