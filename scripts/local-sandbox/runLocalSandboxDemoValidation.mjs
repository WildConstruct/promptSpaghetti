import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

import { formatPreflightSummary, runLiveProbe, runLocalSandboxPreflight } from './localSandboxRuntime.mjs';

function resolvePnpmCommand() {
  const npmExecPath = process.env.npm_execpath;

  if (npmExecPath && /\.(c?js|mjs)$/i.test(npmExecPath)) {
    return {
      command: process.execPath,
      args: [npmExecPath]
    };
  }

  return {
    command: process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
    args: []
  };
}

function runCommand(command, args, label) {
  return new Promise((resolve, reject) => {
    console.log(`> ${[command, ...args].join(' ')}`);

    const nodeBinDir = path.dirname(process.execPath);
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PATH: [nodeBinDir, process.env.PATH].filter(Boolean).join(path.delimiter)
      },
      stdio: 'inherit'
    });

    child.on('error', error => reject(error));
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      const reason = signal
        ? `stopped by signal ${signal}`
        : `exited with code ${code ?? 'unknown'}`;
      reject(new Error(`${label} ${reason}`));
    });
  });
}

async function main() {
  console.log('Local sandbox live demo lane');

  const preflight = await runLocalSandboxPreflight(process.cwd());
  console.log(formatPreflightSummary(preflight));

  if (!preflight.available) {
    console.error('\nLocal sandbox demo validation failed.');
    process.exit(1);
  }

  const pnpm = resolvePnpmCommand();
  await runCommand(
    pnpm.command,
    [...pnpm.args, 'run', 'validate:local-sandbox:smoke'],
    'Local sandbox smoke'
  );

  const probe = await runLiveProbe(process.cwd());
  console.log('\nLocal sandbox live probe passed.');
  console.log(`- Probe output: ${probe.probeOutputPath}`);
  console.log(`- Probe seed: ${probe.probeSeed}`);
}

await main();
