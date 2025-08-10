import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { collectGraphEntries } = require('./lib.cjs');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // Root: package folder (../.. from this script)
  const pkgRoot = path.resolve(__dirname, '../../');
  const graphsDir = path.join(pkgRoot, 'public', 'graphs');
  const manifestPath = path.join(graphsDir, 'manifest.json');

  const entries = await collectGraphEntries(graphsDir);
  const manifest = entries;

  await fs.promises.mkdir(graphsDir, { recursive: true });
  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  // eslint-disable-next-line no-console
  console.log(`[manifest] Wrote ${entries.length} entries to ${path.relative(pkgRoot, manifestPath)}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[manifest] generation failed:', err);
  process.exit(1);
});
