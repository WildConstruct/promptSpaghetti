# Local Sandbox Tree Demo

_Last updated: 2026-05-06_

This is the supported operator path for the local-only tree-generation demo.

The supported v1 target is intentionally narrow:

- runtime: local Comfy-compatible server
- pinned checkpoint: `flux1-schnell-fp8.safetensors`
- demo flow: generate `20` deterministic tree variations

## 1. Configure the local sandbox env

1. Copy [`.env.local-sandbox.example`](/C:/Users/Owner/CascadeProjects/prompt-spaghetti/.env.local-sandbox.example) to either:
   - `.env.local-sandbox`
   - `server/.env.local-sandbox`
2. Keep these values aligned with the supported demo target:
   - `ENABLE_LOCAL_IMAGE_SANDBOX=true`
   - `LOCAL_IMAGE_COMFY_API_URL=http://127.0.0.1:8188`
   - `LOCAL_IMAGE_COMFY_CHECKPOINT=flux1-schnell-fp8.safetensors`
   - `LOCAL_IMAGE_OUTPUT_DIR=.local-output/local-image-sandbox`

## 2. Start the supported local runtime

Start your local Comfy runtime so it is reachable at the configured API URL and has the pinned checkpoint available.

If you need a quick reminder of the repo-owned flow, run:

- `pnpm run local-sandbox:help`
- `pnpm run setup:local-sandbox:runtime`
- `pnpm run start:local-sandbox:runtime`
- `pnpm run dev:local-sandbox`

`dev:local-sandbox` starts the app surfaces if needed, then prints the local sandbox readiness summary so you can see whether Comfy/checkpoint setup is still missing.

For the current easiest supported setup, use the official single-file Flux Schnell FP8 checkpoint with the checkpoint-based Comfy workflow that Prompt Spaghetti already injects prompts into.

## 3. Run the repo preflight

Before opening the app, run:

- `pnpm run validate:local-sandbox:runtime`
- `pnpm run dev:local-sandbox:status`

That preflight checks:

- sandbox enable flag
- Comfy reachability
- pinned checkpoint availability
- output directory writability
- basic runtime compatibility

## 4. Run the demo validation lane

For the full teammate-facing demo lane, run:

- `pnpm run validate:local-sandbox:demo`

That lane runs:

1. runtime preflight
2. local sandbox smoke tests
3. a one-image live probe against the configured local runtime

If you only want the code-path tests without a live runtime, run:

- `pnpm run validate:local-sandbox:smoke`

## 5. Generate 20 trees in the app

1. Start Prompt Spaghetti with `pnpm run dev:local-sandbox` or your normal dev flow.
2. Open [mvp-tree-family-sandbox-demo.psg](/C:/Users/Owner/CascadeProjects/prompt-spaghetti/docs/examples/mvp-tree-family-sandbox-demo.psg) in the editor.
3. Go to `File -> Local Sandbox Generation (Local Only)...`
4. Confirm the dialog says it is using the graph-derived tree archetype flow.
5. Review the derived family DNA and variation axes, then keep the canonical defaults:
   - count: `20`
   - start seed: `1200`
6. Click `Generate 20 Trees`
7. After the batch returns, click `Capture To Scene Assets`
8. Optionally click `Open Scene Assets` to review the captured local render outputs in the existing PSG sidecar flow

## 6. What success looks like

- the dialog says the local sandbox is available
- the pinned checkpoint is shown as `ready`
- the dialog shows graph-derived family DNA and bounded variation notes
- the app returns thumbnails with distinct seeds
- the output folder path is visible in the results
- the batch manifest path is visible in the results
- captured renders appear as `render-output` assets in `PSG Scene Assets`
- generated files land under the configured local output directory

## Boundaries

- This is a local-only demo lane, not a hosted MVP promise.
- It does not replace Comfy export or PSG sidecar flows.
- It does not support provider switching or arbitrary checkpoint selection in v1.
