import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

import { ACTIVE_VALIDATION_PHASES } from './activeValidation.config.mjs';

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
    return ACTIVE_VALIDATION_PHASES;
  }

  const selectedPhase = ACTIVE_VALIDATION_PHASES.find(
    (phase) => phase.id === selectedPhaseId
  );

  if (!selectedPhase) {
    const availablePhases = ACTIVE_VALIDATION_PHASES.map((phase) => phase.id).join(
      ', '
    );

    console.error(
      `Unknown validation phase "${selectedPhaseId}". Available phases: ${availablePhases}`
    );
    process.exit(1);
  }

  return [selectedPhase];
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
  const selectedPhaseId = parseSelectedPhase(process.argv.slice(2));
  const phases = getSelectedPhases(selectedPhaseId);
  const pnpm = resolvePnpmCommand();

  console.log('Phase 4a active validation lane');
  console.log(
    selectedPhaseId
      ? `Running focused phase: ${selectedPhaseId}`
      : `Running ${phases.length} phases in order`
  );

  for (const [index, phase] of phases.entries()) {
    try {
      await runPhase(pnpm.command, pnpm.args, phase, index, phases.length);
    } catch (error) {
      console.error('\nActive validation failed.');
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  console.log('\nActive validation passed.');
}

await main();
