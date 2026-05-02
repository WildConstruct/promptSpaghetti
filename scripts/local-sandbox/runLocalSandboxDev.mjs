import { mkdir, open } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

import {
  formatPreflightSummary,
  runLocalSandboxPreflight
} from './localSandboxRuntime.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const logDir = path.join(repoRoot, '.local-output', 'dev-logs');

const services = {
  server: {
    name: 'server',
    url: 'http://127.0.0.1:8000/health',
    launchArgs: ['--filter', 'server', 'dev'],
    logPath: path.join(logDir, 'local-sandbox-server.dev.log')
  },
  client: {
    name: 'client',
    url: 'http://localhost:3000/',
    launchArgs: ['--filter', 'client', 'dev'],
    logPath: path.join(logDir, 'local-sandbox-client.dev.log')
  }
};

const startupTimeoutMs = 45_000;
const pollIntervalMs = 1_000;

function parseMode(argv) {
  const modeFlagIndex = argv.indexOf('--mode');
  if (modeFlagIndex === -1) {
    return 'start';
  }

  return argv[modeFlagIndex + 1] ?? 'start';
}

function getPnpmInvocation() {
  const npmExecPath = process.env.npm_execpath;

  if (!npmExecPath) {
    throw new Error(
      'Unable to locate pnpm via npm_execpath. Run this launcher through pnpm.'
    );
  }

  return {
    command: process.execPath,
    baseArgs: [npmExecPath]
  };
}

async function isUrlReady(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json,text/html,*/*' }
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForUrl(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await isUrlReady(url)) {
      return true;
    }

    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }

  return false;
}

async function spawnDetachedService(service) {
  await mkdir(logDir, { recursive: true });
  const logFile = await open(service.logPath, 'a');
  const { command, baseArgs } = getPnpmInvocation();
  const child = spawn(command, [...baseArgs, ...service.launchArgs], {
    cwd: repoRoot,
    env: process.env,
    detached: true,
    stdio: ['ignore', logFile.fd, logFile.fd],
    windowsHide: true
  });

  child.unref();
  await logFile.close();
  return child.pid;
}

async function getServiceStatus(service) {
  const ready = await isUrlReady(service.url);
  return {
    ...service,
    ready,
    started: false,
    pid: null
  };
}

function printHelp() {
  console.log('Local sandbox dev launcher');
  console.log('- `pnpm run dev:local-sandbox` starts the server/client dev surfaces if needed.');
  console.log('- It then runs the local sandbox preflight and prints what is missing or ready.');
  console.log('- `pnpm run dev:local-sandbox:status` checks app/runtime status without starting services.');
  console.log('- Normal `pnpm run dev` remains the default lightweight startup path.');
}

function printServiceSummary(statuses) {
  console.log('Local sandbox app surfaces');
  for (const status of statuses) {
    const state = status.ready ? 'ready' : 'not ready';
    const started = status.started ? ` (started, pid ${status.pid})` : '';
    console.log(`- ${status.name}: ${state}${started}`);
    console.log(`  ${status.url}`);
    console.log(`  log: ${status.logPath}`);
  }
}

async function collectStatuses() {
  return Promise.all(
    Object.values(services).map(async service => getServiceStatus(service))
  );
}

async function startMissingServices() {
  const statuses = await collectStatuses();

  for (const status of statuses) {
    if (status.ready) {
      continue;
    }

    status.pid = await spawnDetachedService(status);
    status.started = true;
    status.ready = await waitForUrl(status.url, startupTimeoutMs);
  }

  return statuses;
}

async function printPreflight() {
  const preflight = await runLocalSandboxPreflight(repoRoot);
  console.log('');
  console.log(formatPreflightSummary(preflight));

  if (!preflight.available) {
    console.log('');
    console.log('Next step: fix the local sandbox prerequisites, then re-run `pnpm run dev:local-sandbox:status`.');
  }

  return preflight;
}

async function main() {
  const mode = parseMode(process.argv.slice(2));

  if (mode === 'help') {
    printHelp();
    return;
  }

  if (mode === 'status') {
    const statuses = await collectStatuses();
    printServiceSummary(statuses);
    await printPreflight();
    return;
  }

  const statuses = await startMissingServices();
  printServiceSummary(statuses);

  const failed = statuses.find(status => !status.ready);
  if (failed) {
    console.log('');
    console.log(`Startup failed: ${failed.name} did not become ready within ${startupTimeoutMs / 1000}s.`);
    process.exit(1);
  }

  await printPreflight();
}

await main();
