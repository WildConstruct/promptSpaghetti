# Test Harness Canonical Layers

## Purpose

This note defines the supported test layers and the canonical config or command
for each one.

The goal is to stop treating every historical Jest entrypoint as equally valid.

## Canonical Layers

### Layer 1: Package Unit Tests

Scope:

- `packages/asset-browser`
- `packages/core`
- `server`

Canonical root config:

- [jest.config.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/jest.config.js)

Canonical commands:

- `pnpm test`
- `pnpm test:packages`

Notes:

- This is the default root Jest layer.
- Package-owned Jest config lives with each package.

### Layer 2: Client App Tests

Scope:

- `client`

Canonical config:

- [client/jest.config.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/client/jest.config.js)

Canonical command:

- `pnpm test:client`

Notes:

- The client uses a separate ESM-oriented Jest setup and is not folded into the
  root package-unit project set.

### Layer 3: Integration Tests

Scope:

- `tests/integration`

Canonical config:

- [tests/integration/jest.config.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/tests/integration/jest.config.js)

Canonical command:

- `pnpm test:integration`

Notes:

- Integration tests should not rely on root project discovery.
- This layer owns its own environment and reporting.

### Layer 4: Epic1 Targeted Suites

Scope:

- focused Epic1 component and runtime-node suites

Canonical configs:

- [packages/core/components/epic1/jest.config.cjs](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/components/epic1/jest.config.cjs)
- [packages/core/runtime/nodes/epic1/jest.config.cjs](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/runtime/nodes/epic1/jest.config.cjs)

Canonical commands:

- `pnpm test:epic1`
- `pnpm test:epic1:components`
- `pnpm test:epic1:nodes`

Notes:

- These are specialist suites, not the default unit-test layer.

### Layer 5: End-to-End Tests

Scope:

- browser and performance-path validation via Playwright

Canonical config:

- [playwright.config.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/playwright.config.ts)

Canonical commands:

- `pnpm test:e2e`
- `pnpm test:mobile`

## Canonical vs Legacy

Treat these as canonical:

- `test`
- `test:packages`
- `test:client`
- `test:integration`
- `test:epic1`
- `test:e2e`

Treat historical one-off commands as specialist or legacy until they are
reviewed individually. The current classification lives in
[docs/test-script-catalog.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/test-script-catalog.md).

## Rules Going Forward

- New package-level unit suites should plug into the package-owned Jest config,
  not invent a new root-level pattern.
- New integration suites should use the integration harness directly.
- If a test layer needs a separate config, it should have a clearly scoped
  command and a documented reason to exist.
