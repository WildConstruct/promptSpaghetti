import madge from 'madge';

const MADGE_TARGETS = [
  'client/src',
  'server/src',
  'packages/core',
  'packages/asset-browser/src'
];

const MADGE_OPTIONS = {
  baseDir: process.cwd(),
  fileExtensions: ['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs'],
  excludeRegExp: [
    '(^|[\\\\/])__tests__([\\\\/]|$)',
    '(^|[\\\\/])dist([\\\\/]|$)',
    '(^|[\\\\/])node_modules([\\\\/]|$)',
    '(^|[\\\\/])\\.local-output([\\\\/]|$)',
    '(^|[\\\\/])\\.local-runtime([\\\\/]|$)',
    '(^|[\\\\/])docs([\\\\/]|$)',
    '(^|[\\\\/])tests([\\\\/]|$)'
  ],
  tsConfig: './tsconfig.json'
};

async function main() {
  console.log('Circular dependency validation');
  console.log(`Scanning: ${MADGE_TARGETS.join(', ')}`);

  const result = await madge(MADGE_TARGETS, MADGE_OPTIONS);
  const circular = result.circular();

  if (circular.length > 0) {
    console.error('\nCircular dependencies detected:');
    for (const cycle of circular) {
      console.error(`- ${cycle.join(' -> ')}`);
    }
    process.exit(1);
  }

  console.log('No circular dependencies detected in maintained source surfaces.');
}

await main();
