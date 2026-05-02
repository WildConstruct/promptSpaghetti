import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';

import { ACTIVE_VALIDATION_PHASES } from '../validation/activeValidation.config.mjs';
import {
  DEPLOY_PACKAGING_PHASES,
  DEPLOYMENT_SURFACE
} from '../deploy/deploymentSurface.config.mjs';
import {
  GENERATED_ARTIFACT_DOC_ASSERTIONS,
  GENERATED_ARTIFACT_POLICY
} from './generatedArtifactPolicy.mjs';

const require = createRequire(import.meta.url);
const { collectGraphEntries } = require('../../packages/asset-browser/scripts/build/lib.cjs');

function readFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readFile(relativePath));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function phaseCommandsContain(phases, matcher) {
  return phases.some((phase) =>
    (phase.commands ?? []).some((commandArgs) => matcher(commandArgs))
  );
}

async function verifyManifestIsFresh() {
  const graphsDir = path.join(
    process.cwd(),
    'packages',
    'asset-browser',
    'public',
    'graphs'
  );
  const manifestPath = path.join(graphsDir, 'manifest.json');
  const expectedManifest =
    JSON.stringify(await collectGraphEntries(graphsDir), null, 2) + '\n';
  const actualManifest = fs.readFileSync(manifestPath, 'utf8');

  assert(
    actualManifest === expectedManifest,
    'packages/asset-browser/public/graphs/manifest.json is stale relative to current PSG inputs.'
  );
}

function verifyActiveLanesDoNotRefreshCoreDist() {
  const hasCoreBuildInDeployLane = phaseCommandsContain(
    DEPLOY_PACKAGING_PHASES,
    (commandArgs) =>
      commandArgs.includes('@promptscape/core') && commandArgs.includes('build')
  );
  assert(
    !hasCoreBuildInDeployLane,
    'Active deploy packaging lane still refreshes @promptscape/core build output.'
  );

  const hasCoreBuildInValidationLane = ACTIVE_VALIDATION_PHASES.some((phase) =>
    (phase.pnpmArgs ?? []).includes('@promptscape/core')
  );
  assert(
    !hasCoreBuildInValidationLane,
    'Active validation lane should not refresh @promptscape/core build output.'
  );

  assert(
    !DEPLOYMENT_SURFACE.netlifyBuildCommand.includes('@promptscape/core build'),
    'Netlify build command still refreshes @promptscape/core build output.'
  );
}

function verifyPublishCompatRefreshContract() {
  const packageJson = readJson('package.json');
  const refreshCommand = packageJson.scripts?.['refresh:publish-compat'];

  assert(
    typeof refreshCommand === 'string' &&
      refreshCommand.includes('runPublishCompatRefresh.ps1'),
    'package.json is missing the Windows-safe refresh:publish-compat command.'
  );
}

function verifyPolicyDocumentation() {
  for (const assertion of GENERATED_ARTIFACT_DOC_ASSERTIONS) {
    const contents = readFile(assertion.path);

    for (const snippet of assertion.includes) {
      assert(
        contents.includes(snippet),
        `${assertion.path} is missing required artifact-policy text: ${snippet}`
      );
    }
  }
}

function verifyPolicyShape() {
  const manifestPolicy = GENERATED_ARTIFACT_POLICY.find(
    (artifact) => artifact.id === 'asset-browser-graph-manifest'
  );
  const coreDistPolicy = GENERATED_ARTIFACT_POLICY.find(
    (artifact) => artifact.id === 'core-package-dist'
  );

  assert(manifestPolicy, 'Generated artifact policy is missing the graph manifest entry.');
  assert(coreDistPolicy, 'Generated artifact policy is missing the core dist entry.');
  assert(
    manifestPolicy.role === 'active-runtime-input',
    'Graph manifest must be classified as an active runtime input.'
  );
  assert(
    coreDistPolicy.role === 'publish-compat-output',
    'packages/core/dist/** must be classified as publish-compat output.'
  );
}

async function main() {
  verifyPolicyShape();
  verifyActiveLanesDoNotRefreshCoreDist();
  verifyPublishCompatRefreshContract();
  verifyPolicyDocumentation();
  await verifyManifestIsFresh();
  console.log('Generated artifact policy is consistent.');
}

await main();
