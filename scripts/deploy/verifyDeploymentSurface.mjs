import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { DEPLOYMENT_SURFACE } from './deploymentSurface.config.mjs';

function readFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

function assertIncludes(contents, expected, label) {
  if (!contents.includes(expected)) {
    throw new Error(`${label} is missing expected value: ${expected}`);
  }
}

function main() {
  const redirects = readFile('client/public/_redirects');
  const netlifyToml = readFile('netlify.toml');
  const vercelJson = JSON.parse(readFile('vercel.json'));
  const deploymentDoc = readFile('docs/deployment-current-state.md');
  const bootstrapDoc = readFile('docs/new-repo-bootstrap-checklist.md');
  const convergenceDoc = readFile('docs/vercel-convergence-decision.md');
  const deployLaneDoc = readFile('docs/active-deploy-packaging-lane.md');

  assertIncludes(
    redirects,
    `/api/*  ${DEPLOYMENT_SURFACE.apiProxyTarget}  200`,
    'client/public/_redirects'
  );
  assertIncludes(
    netlifyToml,
    `command = "${DEPLOYMENT_SURFACE.netlifyBuildCommand}"`,
    'netlify.toml build command'
  );
  assertIncludes(
    netlifyToml,
    `publish = "${DEPLOYMENT_SURFACE.frontendPublishDir}"`,
    'netlify.toml publish directory'
  );
  assertIncludes(
    netlifyToml,
    `to = "${DEPLOYMENT_SURFACE.apiProxyTarget}"`,
    'netlify.toml redirect target'
  );
  assertIncludes(
    netlifyToml,
    DEPLOYMENT_SURFACE.backendApiOrigin,
    'netlify.toml connect-src allowlist'
  );

  if (vercelJson.buildCommand !== 'node scripts/build/vercel-api-placeholder.js') {
    throw new Error('vercel.json buildCommand no longer points at the API placeholder surface.');
  }

  if (vercelJson.outputDirectory !== 'public') {
    throw new Error('vercel.json outputDirectory must remain "public" for the compatibility placeholder.');
  }

  const rewriteSources = (vercelJson.rewrites ?? []).map((rewrite) => rewrite.source);
  const forbiddenRewritePatterns = ['debug', 'test', 'logout', 'simple', 'enhanced'];

  if (
    rewriteSources.some((source) =>
      forbiddenRewritePatterns.some((pattern) => source.includes(pattern))
    )
  ) {
    throw new Error('vercel.json contains a forbidden legacy admin/debug rewrite.');
  }

  for (const [label, contents] of [
    ['docs/deployment-current-state.md', deploymentDoc],
    ['docs/new-repo-bootstrap-checklist.md', bootstrapDoc],
    ['docs/vercel-convergence-decision.md', convergenceDoc],
    ['docs/active-deploy-packaging-lane.md', deployLaneDoc]
  ]) {
    assertIncludes(contents, DEPLOYMENT_SURFACE.backendApiOrigin, label);
  }

  assertIncludes(
    convergenceDoc,
    DEPLOYMENT_SURFACE.postMvpBackendDirection,
    'docs/vercel-convergence-decision.md post-MVP backend direction'
  );
  assertIncludes(
    convergenceDoc,
    DEPLOYMENT_SURFACE.canonicalBackendEntry,
    'docs/vercel-convergence-decision.md canonical backend entry'
  );
  assertIncludes(
    deploymentDoc,
    DEPLOYMENT_SURFACE.postMvpBackendDirection,
    'docs/deployment-current-state.md post-MVP backend direction'
  );
  assertIncludes(
    deployLaneDoc,
    DEPLOYMENT_SURFACE.canonicalBackendEntry,
    'docs/active-deploy-packaging-lane.md canonical backend entry'
  );

  console.log('Deploy surface config is consistent.');
}

main();
