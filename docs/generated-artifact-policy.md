# Generated Artifact Policy

_Last updated: 2026-04-13_

This note defines which generated files are part of the active MVP workflow and
which ones are publish-compat outputs only.

## active runtime-generated input

- `packages/asset-browser/public/graphs/manifest.json`
  - owner command: `pnpm --filter @prompt/asset-browser prebuild`
  - expected to be checked in
  - allowed to change during `build:netlify` and `validate:deploy:active`
  - must be deterministic from PSG file contents, not host filesystem mtimes

## Publish-compat output

- `packages/core/dist/**`
  - owner command: `pnpm --filter @promptscape/core build`
  - kept for package/publish compatibility
  - publish-compat output, not the source of truth for local MVP validation or deploy packaging
  - not allowed to change during `validate:active` or `validate:deploy:active`

## Ignored build outputs

- `client/dist/**`
  - owner command: `pnpm --filter client build`
- `server/dist/**`
  - owner command: `pnpm --filter server build`

These are expected local build outputs and are not checked in.

## Canonical command

- `pnpm run validate:artifacts:active`
- `pnpm run refresh:publish-compat`

Use this check to verify that:

- active docs still describe generated artifacts honestly
- the graph manifest is fresh and deterministic
- active validation and deploy lanes are not refreshing publish-compat output

Use `pnpm run refresh:publish-compat` only when you intentionally want to refresh tracked package compatibility output such as `packages/core/dist/**`.

An active-lane green check does not imply publish-compat output is refreshed, and a publish-compat refresh does not imply product behavior changed.
