#!/usr/bin/env node

/**
 * Summarise the lowest-covered files from Jest coverage output.
 *
 * Usage:
 *   node scripts/report-low-coverage.js [pathToCoverageJson]
 *
 * Defaults to coverage/coverage-final.json, falling back to
 * .temp-coverage/coverage-summary.json if available.
 */

const fs = require('fs');
const path = require('path');

const INPUT_PATH =
  process.argv[2] ||
  (fs.existsSync(path.resolve('.temp-coverage/coverage-summary.json'))
    ? '.temp-coverage/coverage-summary.json'
    : 'coverage/coverage-final.json');

function loadCoverage(file) {
  const resolved = path.resolve(file);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Coverage file not found: ${resolved}`);
  }
  const raw = fs.readFileSync(resolved, 'utf8');
  return JSON.parse(raw);
}

function normalizeEntries(data) {
  if (Array.isArray(data)) {
    return data;
  }

  // coverage-summary.json stores totals at "total"; filter that out.
  return Object.entries(data)
    .filter(([filename]) => filename !== 'total')
    .map(([filename, metrics]) => ({ filename, metrics }));
}

function computeLowest(entries, metric = 'lines', limit = 10) {
  return entries
    .map(({ filename, metrics }) => {
      const { covered = 0, total = 0 } = metrics[metric] || {};
      const pct = total > 0 ? (covered / total) * 100 : 0;
      return { filename, covered, total, pct };
    })
    .filter(item => item.total > 0)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, limit);
}

function main() {
  try {
    const data = loadCoverage(INPUT_PATH);
    const entries = normalizeEntries(data);
    const lowest = computeLowest(entries);

    if (lowest.length === 0) {
      console.log('No coverage data found.');
      return;
    }

    console.log(`Lowest coverage files (source: ${INPUT_PATH}):`);
    console.log('---------------------------------------------------------');
    lowest.forEach(({ filename, covered, total, pct }) => {
      console.log(
        `${pct.toFixed(2).padStart(6)}%  ${covered}/${total}  ${filename}`
      );
    });
    console.log('---------------------------------------------------------');
    console.log(
      'Tip: re-run with `node scripts/report-low-coverage.js coverage/coverage-final.json` after a full coverage run.'
    );
  } catch (error) {
    console.error(`[coverage] ${error.message}`);
    process.exitCode = 1;
  }
}

main();

