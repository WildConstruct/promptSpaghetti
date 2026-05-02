import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

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

function createPhaseEnv() {
  const nodeBinDir = path.dirname(process.execPath);

  return {
    ...process.env,
    PATH: [nodeBinDir, process.env.PATH].filter(Boolean).join(path.delimiter)
  };
}

async function main() {
  const pnpm = resolvePnpmCommand();
  const commandArgs = [...pnpm.args, '--filter', '@promptscape/core', 'build'];

  console.log('Publish-compat refresh');
  console.log(
    'Refreshing tracked package output for compatibility workflows only.'
  );
  console.log(`> ${[pnpm.command, ...commandArgs].join(' ')}`);

  await new Promise((resolve, reject) => {
    const child = spawn(pnpm.command, commandArgs, {
      cwd: process.cwd(),
      env: createPhaseEnv(),
      stdio: 'inherit'
    });

    child.on('error', (error) => reject(error));
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }

      const reason = signal
        ? `stopped by signal ${signal}`
        : `exited with code ${code ?? 'unknown'}`;

      reject(new Error(`Publish-compat refresh ${reason}`));
    });
  });

  console.log('\nPublish-compat refresh passed.');
}

await main();
