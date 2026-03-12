#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  repairPsgContent
} = require('../packages/core/fileFormats/psgRepair.runtime.js');

const DEFAULT_TARGET = 'assets/library';
const VALID_STATUSES = ['canonical', 'rewritten', 'skipped', 'unsafe'];

function printHelp() {
  console.log(`PSG Fragment Repair Tool

Usage:
  pnpm psg:repair [--dry-run] [--write] [--path <file-or-dir>]

Options:
  --dry-run         Default mode. Reports changes without writing files.
  --write           Rewrite safe files in place.
  --path <target>   Target a single .psg file or a directory. Defaults to assets/library.
  --help, -h        Show this help message.
`);
}

function parseArgs(argv) {
  let dryRun = true;
  let write = false;
  let targetPath = DEFAULT_TARGET;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dry-run') {
      dryRun = true;
      write = false;
      continue;
    }
    if (arg === '--write') {
      write = true;
      dryRun = false;
      continue;
    }
    if (arg === '--path') {
      const next = argv[index + 1];
      if (!next) {
        throw new Error('Missing value for --path');
      }
      targetPath = next;
      index += 1;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return { dryRun, write, targetPath };
}

function resolveTargetPaths(targetPath) {
  const absoluteTargetPath = path.resolve(process.cwd(), targetPath);
  if (!fs.existsSync(absoluteTargetPath)) {
    throw new Error(`Target path does not exist: ${targetPath}`);
  }

  const stat = fs.statSync(absoluteTargetPath);
  if (stat.isFile()) {
    if (!absoluteTargetPath.toLowerCase().endsWith('.psg')) {
      throw new Error(`Target file is not a .psg file: ${targetPath}`);
    }
    return [absoluteTargetPath];
  }

  const matches = [];
  const pending = [absoluteTargetPath];

  while (pending.length > 0) {
    const currentPath = pending.pop();
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    entries.forEach(entry => {
      const entryPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
          return;
        }
        pending.push(entryPath);
        return;
      }

      if (entry.isFile() && entry.name.toLowerCase().endsWith('.psg')) {
        matches.push(entryPath);
      }
    });
  }

  return matches.sort((left, right) => left.localeCompare(right));
}

function printFileReport(report) {
  const { relativePath, result } = report;
  console.log(`[${result.status.toUpperCase()}] ${relativePath}`);

  if (Array.isArray(result.changes)) {
    result.changes.forEach(change => {
      console.log(`  - ${change}`);
    });
  }

  if (Array.isArray(result.reasons)) {
    result.reasons.forEach(reason => {
      console.log(`  - ${reason}`);
    });
  }
}

function printSummary(reports, mode) {
  const counts = {
    canonical: 0,
    rewritten: 0,
    skipped: 0,
    unsafe: 0
  };

  reports.forEach(report => {
    if (VALID_STATUSES.includes(report.result.status)) {
      counts[report.result.status] += 1;
    }
  });

  console.log('');
  console.log(`Summary (${mode})`);
  console.log(`  canonical: ${counts.canonical}`);
  console.log(`  rewritten: ${counts.rewritten}`);
  console.log(`  skipped: ${counts.skipped}`);
  console.log(`  unsafe: ${counts.unsafe}`);
  console.log(`  total: ${reports.length}`);
}

function maybeWriteReport(report, write) {
  if (!write) {
    return;
  }
  if (report.result.status !== 'rewritten' || !report.result.normalizedContent) {
    return;
  }
  fs.writeFileSync(report.filePath, report.result.normalizedContent, 'utf8');
}

function run() {
  const options = parseArgs(process.argv.slice(2));
  const filePaths = resolveTargetPaths(options.targetPath);

  if (filePaths.length === 0) {
    console.log('No .psg files found.');
    return;
  }

  console.log(
    options.write
      ? 'PSG repair running in WRITE mode.'
      : 'PSG repair running in DRY-RUN mode.'
  );
  console.log(`Target: ${options.targetPath}`);
  console.log(`Files: ${filePaths.length}`);
  console.log('');

  const reports = filePaths.map(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = repairPsgContent(content);
    const report = {
      filePath,
      relativePath: path.relative(process.cwd(), filePath),
      result
    };
    maybeWriteReport(report, options.write);
    printFileReport(report);
    return report;
  });

  printSummary(reports, options.write ? 'write' : 'dry-run');
}

try {
  run();
} catch (error) {
  console.error(error instanceof Error ? `Error: ${error.message}` : 'Unknown error');
  process.exit(1);
}
