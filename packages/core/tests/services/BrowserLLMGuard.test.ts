import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../../../..');
const browserSourceRoots = [
  path.join(repoRoot, 'client', 'src'),
  path.join(repoRoot, 'packages', 'core', 'components'),
  path.join(repoRoot, 'packages', 'core', 'services')
];

const allowedPathFragments = [
  path.join('client', 'src', 'shims', 'openai.ts'),
  path.join('client', 'src', 'shims', 'openai-shim-node.ts'),
  path.join('packages', 'core', 'services', 'llm', 'LLMService.ts')
];

const forbiddenTokens = [
  "from 'openai'",
  'from "openai"',
  "from 'openai/shims/node'",
  'from "openai/shims/node"'
];

function collectSourceFiles(root: string): string[] {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') {
        continue;
      }
      files.push(...collectSourceFiles(fullPath));
      continue;
    }

    if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

describe('browser LLM bundle guard', () => {
  it('keeps provider SDK imports out of browser-facing source files', () => {
    const offenders = browserSourceRoots.flatMap(root =>
      collectSourceFiles(root)
        .filter(filePath =>
          !allowedPathFragments.some(fragment => filePath.includes(fragment))
        )
        .filter(filePath => {
          const source = fs.readFileSync(filePath, 'utf8');
          return forbiddenTokens.some(token => source.includes(token));
        })
        .map(filePath => path.relative(repoRoot, filePath))
    );

    expect(offenders).toEqual([]);
  });
});
