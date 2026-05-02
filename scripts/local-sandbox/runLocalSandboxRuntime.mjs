import process from 'node:process';

import {
  formatPreflightSummary,
  runLiveProbe,
  runLocalSandboxPreflight
} from './localSandboxRuntime.mjs';

function parseMode(argv) {
  const modeFlagIndex = argv.indexOf('--mode');

  if (modeFlagIndex === -1) {
    return 'check';
  }

  return argv[modeFlagIndex + 1] ?? 'check';
}

async function main() {
  const mode = parseMode(process.argv.slice(2));

  if (mode === 'help') {
    console.log('Local sandbox help');
    console.log('- Copy .env.local-sandbox.example to .env.local-sandbox or server/.env.local-sandbox');
    console.log('- Keep ENABLE_LOCAL_IMAGE_SANDBOX=true');
    console.log('- Use the pinned Flux Schnell FP8 checkpoint flux1-schnell-fp8.safetensors');
    console.log('- Run pnpm run setup:local-sandbox:runtime for the repo-managed ComfyUI install');
    console.log('- Run pnpm run start:local-sandbox:runtime to launch the local runtime on port 8188');
    console.log('- Start the local Comfy runtime');
    console.log('- Run pnpm run validate:local-sandbox:runtime');
    console.log('- Run pnpm run validate:local-sandbox:demo for the full live-demo lane');
    return;
  }

  if (mode === 'probe') {
    const probe = await runLiveProbe(process.cwd());
    console.log('Local sandbox live probe passed.');
    console.log(`- Probe output: ${probe.probeOutputPath}`);
    console.log(`- Probe seed: ${probe.probeSeed}`);
    return;
  }

  const preflight = await runLocalSandboxPreflight(process.cwd());
  console.log(formatPreflightSummary(preflight));

  if (!preflight.available) {
    process.exit(1);
  }
}

await main();
