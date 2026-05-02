import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

import { DEPLOY_PACKAGING_PHASES } from './deploymentSurface.config.mjs';

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

function parseSelectedPhase(argv) {
  const phaseFlagIndex = argv.indexOf('--phase');

  if (phaseFlagIndex === -1) {
    return null;
  }

  return argv[phaseFlagIndex + 1] ?? null;
}

function getSelectedPhases(selectedPhaseId) {
  if (!selectedPhaseId) {
    return DEPLOY_PACKAGING_PHASES;
  }

  const selectedPhase = DEPLOY_PACKAGING_PHASES.find(
    (phase) => phase.id === selectedPhaseId
  );

  if (!selectedPhase) {
    const availablePhases = DEPLOY_PACKAGING_PHASES.map((phase) => phase.id).join(
      ', '
    );

    console.error(
      `Unknown deploy packaging phase "${selectedPhaseId}". Available phases: ${availablePhases}`
    );
    process.exit(1);
  }

  return [selectedPhase];
}

function createPhaseEnv() {
  const nodeBinDir = path.dirname(process.execPath);

  return {
    ...process.env,
    PATH: [nodeBinDir, process.env.PATH].filter(Boolean).join(path.delimiter)
  };
}

function runCommand(command, args, label) {
  return new Promise((resolve, reject) => {
    console.log(`> ${[command, ...args].join(' ')}`);

    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: createPhaseEnv(),
      stdio: 'inherit'
    });

    child.on('error', (error) => reject(error));
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

async function runPhase(phase, index, total) {
  console.log(`\n[${index + 1}/${total}] ${phase.title}`);

  if (phase.runner === 'node') {
    await runCommand(process.execPath, phase.args, `${phase.title} (${phase.id})`);
    return;
  }

  const pnpm = resolvePnpmCommand();

  for (const commandArgs of phase.commands) {
    await runCommand(
      pnpm.command,
      [...pnpm.args, ...commandArgs],
      `${phase.title} (${phase.id})`
    );
  }
}

async function main() {
  const selectedPhaseId = parseSelectedPhase(process.argv.slice(2));
  const phases = getSelectedPhases(selectedPhaseId);

  console.log('Phase 4b deploy packaging lane');
  console.log(
    selectedPhaseId
      ? `Running focused phase: ${selectedPhaseId}`
      : `Running ${phases.length} phases in order`
  );

  for (const [index, phase] of phases.entries()) {
    try {
      await runPhase(phase, index, phases.length);
    } catch (error) {
      console.error('\nDeploy packaging failed.');
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  console.log('\nDeploy packaging passed.');
}

await main();
