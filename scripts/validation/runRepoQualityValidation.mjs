import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

import { REPO_QUALITY_VALIDATION_PHASES } from './repoQualityValidation.config.mjs';

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

function runPhase(command, args, phase, index, total) {
  return new Promise((resolve, reject) => {
    console.log(`\n[${index + 1}/${total}] ${phase.title}`);
    console.log(`> ${[command, ...args, ...phase.pnpmArgs].join(' ')}`);

    const nodeBinDir = path.dirname(process.execPath);
    const phaseEnv = {
      ...process.env,
      PATH: [nodeBinDir, process.env.PATH].filter(Boolean).join(path.delimiter)
    };

    const child = spawn(command, [...args, ...phase.pnpmArgs], {
      cwd: process.cwd(),
      env: phaseEnv,
      stdio: 'inherit'
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      const reason = signal
        ? `stopped by signal ${signal}`
        : `exited with code ${code ?? 'unknown'}`;

      reject(new Error(`${phase.title} (${phase.id}) ${reason}`));
    });
  });
}

async function main() {
  const pnpm = resolvePnpmCommand();

  console.log('Repo quality validation lane');
  console.log(`Running ${REPO_QUALITY_VALIDATION_PHASES.length} phases in order`);

  for (const [index, phase] of REPO_QUALITY_VALIDATION_PHASES.entries()) {
    try {
      await runPhase(
        pnpm.command,
        pnpm.args,
        phase,
        index,
        REPO_QUALITY_VALIDATION_PHASES.length
      );
    } catch (error) {
      console.error('\nRepo quality validation failed.');
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  console.log('\nRepo quality validation passed.');
}

await main();
