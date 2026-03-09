# Generated Output Audit

_Last updated: 2026-03-08_

This note records which generated or semi-generated files should be kept for the MVP branch and which should be deferred.

## Keep

These changes are justified by the current MVP work and should stay if their source changes are committed.

- [packages/core/dist/cjs/utils/psgCodec.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/dist/cjs/utils/psgCodec.js)
- [packages/core/dist/esm/utils/psgCodec.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/dist/esm/utils/psgCodec.js)
- [packages/core/dist/types/utils/psgCodec.d.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/dist/types/utils/psgCodec.d.ts)
- [packages/core/dist/cjs/utils/supabaseFeature.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/dist/cjs/utils/supabaseFeature.js)
- [packages/core/dist/esm/utils/supabaseFeature.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/dist/esm/utils/supabaseFeature.js)
- [packages/core/dist/types/utils/supabaseFeature.d.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/dist/types/utils/supabaseFeature.d.ts)

Reason:

- these files back the actual public package surface consumed by the client build
- stale dist exports were a real production-build blocker
- rebuilding them is part of keeping `@promptscape/core` internally coherent for MVP deploy checks

## Review Before Keeping

These files may be legitimate, but they are not automatically required just because they changed.

- [packages/asset-browser/dist/index.esm.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/asset-browser/dist/index.esm.js)
- [packages/asset-browser/dist/index.esm.js.map](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/asset-browser/dist/index.esm.js.map)
- [packages/asset-browser/public/graphs/manifest.json](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/asset-browser/public/graphs/manifest.json)
- [pnpm-lock.yaml](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/pnpm-lock.yaml)

Current recommendation:

- `packages/asset-browser/dist/**`
  Keep only if the package is consumed from built output in the MVP path.
  Otherwise prefer rebuilding during CI/deploy and do not mix it into the release commit by default.
- `packages/asset-browser/public/graphs/manifest.json`
  Review the timestamp-only churn.
  Keep if the changed library/demo set depends on the refreshed manifest contents.
  Otherwise regenerate later and exclude from the MVP push.
- `pnpm-lock.yaml`
  Keep only if the final dependency graph actually changed because of intentional package/script updates.

## Defer / Leave Out

These should stay out of the MVP push unless a separate reason appears.

- [packages/custom-node-sdk/dist/cli/index.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/custom-node-sdk/dist/cli/index.js)
- [packages/custom-node-sdk/dist/index.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/custom-node-sdk/dist/index.js)
- [packages/custom-node-sdk/dist/runtime/SecurityManager.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/custom-node-sdk/dist/runtime/SecurityManager.js)
- [packages/custom-node-sdk/dist/runtime/ValidationEngine.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/custom-node-sdk/dist/runtime/ValidationEngine.js)
- `*.tsbuildinfo`

Reason:

- they are outside the MVP product story worked in this pass
- they were not required to pass the deploy checks we ran
- they increase review noise without improving the demoable surface

## Asset Library Churn

The current `assets/library/**` diff is too broad for the MVP push by default.

Recommendation:

- do not include the bulk library churn in the first MVP commit set
- treat it as a separate audited content pass
- only pull specific demo-relevant assets if the launch/demo pack actually needs them

## Working Rule

If a generated file was not needed to:

- make `pnpm run build:netlify` pass
- make `pnpm run build:vercel-api` pass
- keep the package public surface coherent

then it should default to review or defer, not automatic inclusion.
