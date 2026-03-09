# Core runtime Jest runner note

## What changed

A low-blast-radius discovery fix was applied to:

- `packages/core/jest.config.cjs`

Change:

- added `'<rootDir>/runtime'` to `roots`

Result:

- `packages/core/runtime/__tests__/importGraphNormalization.test.ts` is now included in Jest's configured search roots for the core package

## Verification result

Initial targeted verification command attempted from `packages/core/`:

```bash
npm test -- importGraphNormalization.test.ts
```

Observed failure:

- Jest did not fail on test discovery
- the run failed before executing tests because the local Jest binary could not resolve `import-local`

Error summary:

```text
Error: Cannot find module 'import-local'
Require stack:
- ...\node_modules\...\jest\bin\jest.js
```

Repo-supported verification command attempted from the workspace root:

```bash
pnpm --filter @promptscape/core test -- importGraphNormalization.test.ts
```

Observed result:

- this is the correct package-manager flow for the repo
- it fails with the same `import-local` error, so the command path was not the root problem

## Interpretation

This means the immediate remaining gap is not the runtime test file location.

The remaining blocker is:

- local Jest runtime dependency resolution in the current install state
- specifically, a broken pnpm-linked install state on Windows

Additional evidence gathered:

- `pnpm-workspace.yaml` and root `package.json` confirm the repo is a `pnpm` workspace
- `import-local` exists in the pnpm store layout
- the Jest-local `import-local` entry under `.pnpm/.../jest.../node_modules/` appears as a reparse-point directory with no populated target
- `node_modules/.bin/jest.cmd` is also absent in the current install state

## Smallest viable next runner path

Try the package-manager-native test invocation that matches the install layout before changing more config.

Recommended next checks:

1. run the core package test with the repo's native package manager if available
2. verify that the local Jest install is complete enough to resolve `import-local`
3. only after that, re-run the targeted file:

```bash
[pkg-manager] test -- importGraphNormalization.test.ts
```

Current smallest viable repair step attempted:

```bash
pnpm install
```

Observed blocker:

```text
EPERM: operation not permitted, unlink '...\node_modules\commander'
```

Interpretation:

- the install likely needs a relink/reinstall to repair broken pnpm links
- the relink is currently blocked by a Windows file lock or permissions issue in `node_modules`

## Why no further config change was made

No broader Jest config changes were made because:

- the root discovery gap appears fixed
- the current failure happens before test collection/execution
- changing transforms, testMatch, or environments would not address a missing `import-local` module
- the next blocker is install repair, not Jest config semantics

## Practical side effect of the current config change

Adding `'<rootDir>/runtime'` to `roots` means core-package Jest will now also discover tests under:

- `packages/core/runtime/**`

This is the intended smallest-scope change to make runtime tests eligible under the existing package test setup.
