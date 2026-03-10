# Epic: Test Harness Repair and Simplification

## Purpose

This epic is focused on repairing the test harness itself rather than adding
more product tests.

The current repo can run tests, but the harness has drifted into a shape that
creates avoidable failures, duplicated setup logic, and too many execution
paths. The result is that simple unit tests can fail for infrastructure reasons
before they fail for product reasons.

The goal of this epic is to make the harness:

- predictable
- composable
- easier to debug
- less dependent on ad hoc config exceptions

## Current State

### What Exists Now

- Root Jest delegates only to package-level configs in [jest.config.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/jest.config.js).
- `client`, `packages/core`, `packages/asset-browser`, `server`, and
  `tests/integration` all maintain separate Jest configs.
- `packages/core` also has narrower Epic1-specific Jest configs in:
  - [packages/core/components/epic1/jest.config.cjs](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/components/epic1/jest.config.cjs)
  - [packages/core/runtime/nodes/epic1/jest.config.cjs](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/runtime/nodes/epic1/jest.config.cjs)
- Test setup is split across multiple layers:
  - [jest.setup.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/jest.setup.js)
  - [packages/core/tests/setupTests.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/tests/setupTests.ts)
  - [tests/utils/globalTestSetup.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/tests/utils/globalTestSetup.ts)
  - [tests/utils/axeSetup.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/tests/utils/axeSetup.ts)
- There are multiple custom runners and scripts in [package.json](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/package.json), including root Jest, package Jest, integration Jest, Playwright, and several bespoke Node test runners.

### Evidence of Drift

- `packages/asset-browser` has carried duplicate Jest configs that drifted over time.
- `packages/core` relies on a growing `transformIgnorePatterns` exception list in [packages/core/jest.config.cjs](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/jest.config.cjs).
- Integration Jest config uses `moduleNameMapping` instead of
  `moduleNameMapper` in [tests/integration/jest.config.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/tests/integration/jest.config.js), which strongly suggests part of that config is not being applied as intended.
- Some unit tests still import modules that pull in browser/runtime-heavy
  dependencies like `reactflow`, `d3-force`, and `import.meta` paths.

## Main Problems

### Problem 1: Too Many Harness Entry Points

There is no single obvious path for:

- package unit tests
- browser-component tests
- Epic1-specific tests
- integration tests

That makes it easy for one command to pass while another command exercises a
different harness shape entirely.

### Problem 2: Setup Logic Is Duplicated and Sometimes Conflicting

Current setup files overlap on:

- timeout settings
- global DOM polyfills
- `fetch` mocks
- console suppression
- navigation mocks
- accessibility setup

This creates hidden ordering dependencies.

Example:

- [jest.setup.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/jest.setup.js) applies broad DOM polyfills and console filtering.
- [tests/utils/globalTestSetup.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/tests/utils/globalTestSetup.ts) then replaces the entire console with `jest.fn()` methods, which can hide failures instead of selectively filtering noise.

### Problem 3: Unit Tests Still Cross Runtime Boundaries

A unit test for a pure graph helper should not need to parse:

- `import.meta`
- `d3-force`
- layout engines
- large drag/drop hooks

When that happens, Jest config grows in complexity just to keep the test booting.

This is the clearest signal that more graph logic should be extracted into pure
services.

### Problem 4: ESM/CJS Strategy Is Inconsistent

Current state is mixed:

- `client` uses `ts-jest` with `useESM: true` in [client/jest.config.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/client/jest.config.js)
- `packages/core` uses CommonJS transform in [packages/core/jest.config.cjs](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/jest.config.cjs)
- integration config has its own transform choices in [tests/integration/jest.config.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/tests/integration/jest.config.js)

This multiplies the number of ways import resolution can fail.

### Problem 5: Root Test Scripts Are Overgrown

[package.json](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/package.json) exposes a very large number of test commands. Some are useful, but together they make the testing surface hard to reason about.

The problem is not just volume. It is that the script set mixes:

- canonical entry points
- historical one-offs
- orchestration wrappers
- special-purpose suites

without a clear hierarchy.

## Epic Outcome

When this epic is done, we should be able to say:

- there is one clearly documented harness model per test layer
- unit tests mostly run against pure services, not runtime-heavy hooks
- setup files are consolidated by responsibility instead of duplicated
- Jest config exceptions are minimized and intentional
- root test commands map cleanly to the actual supported test layers

## Stories

### Story 1: Define Canonical Test Layers

**Goal**

Establish a clear contract for the supported test layers in the repo.

**Scope**

- define canonical layers:
  - package unit
  - browser component
  - server unit
  - integration
  - e2e
- define which config owns each layer
- define which root scripts are canonical vs legacy

**Acceptance Criteria**

- one short doc describes each supported test layer
- each layer has one primary config entry point
- duplicate or ambiguous entry points are marked deprecated or removed

### Story 2: Consolidate Setup Files By Responsibility

**Goal**

Stop scattering global environment setup across overlapping files.

**Scope**

- inventory setup behavior in:
  - [jest.setup.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/jest.setup.js)
  - [packages/core/tests/setupTests.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/tests/setupTests.ts)
  - [tests/utils/globalTestSetup.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/tests/utils/globalTestSetup.ts)
  - [tests/utils/axeSetup.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/tests/utils/axeSetup.ts)
- move shared browser polyfills into one shared layer
- move optional accessibility setup into an explicit layer
- replace broad console muting with targeted suppression

**Acceptance Criteria**

- no overlapping timeout configuration across multiple setup files for the same suite
- browser polyfills exist in one shared setup module
- console behavior is explicit and minimally destructive
- setup ordering is documented and stable

### Story 3: Collapse Duplicate Jest Configs

**Goal**

Reduce config sprawl and remove drift.

**Scope**

- reconcile or remove duplicate asset-browser Jest config ownership
- decide whether Epic1-specific configs should extend package config or remain isolated
- fix invalid or stale config fields in integration config

**Acceptance Criteria**

- duplicate configs are removed or made to share one base
- integration config uses correct Jest keys
- package configs have clear ownership and minimal drift risk

### Story 4: Extract Pure Testable Services Out of Runtime-Heavy Modules

**Goal**

Reduce the need for Jest transform exceptions by moving logic out of hooks and
components.

**Scope**

- identify tests that currently import runtime-heavy modules only to reach pure logic
- extract pure services for:
  - graph planning
  - graph execution
  - structural targeting
  - context inference
- update tests to hit pure services directly

**Acceptance Criteria**

- representative unit tests no longer require browser-only or layout-heavy imports
- `transformIgnorePatterns` shrinks instead of growing
- new pure services become the default seam for unit testing

### Story 5: Standardize ESM/CJS Strategy for Jest

**Goal**

Make module loading behavior predictable across packages.

**Scope**

- decide where Jest should remain CommonJS-backed
- decide where ESM support is truly required
- remove config-specific surprises where possible
- standardize `ts-jest` options across packages unless there is a real reason not to

**Acceptance Criteria**

- each package documents whether it runs Jest in CJS or ESM mode
- avoid mixed import behavior unless required by the package
- common import shapes like env access have one supported test-safe pattern

### Story 6: Rationalize Root Test Scripts

**Goal**

Turn root test scripts into a clean public interface rather than an archive of
historical commands.

**Scope**

- group scripts into:
  - canonical
  - specialist
  - deprecated
- remove or rename ambiguous commands
- ensure root `test` reflects the intended default coverage of the repo

**Acceptance Criteria**

- the top-level script surface is materially smaller or clearly categorized
- the default `test` command has intentional scope
- package-level specialty commands remain available only where justified

**Current progress**

- canonical layer commands are documented in
  [docs/test-harness-canonical-layers.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/test-harness-canonical-layers.md)
- root script status is classified in
  [docs/test-script-catalog.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/test-script-catalog.md)
- pure duplicate aliases have been removed from
  [package.json](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/package.json)
- broken legacy runners backed by syntactically invalid scripts have been
  retired from [package.json](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/package.json)
- the remaining legacy "framework" wrapper was also retired after checking its
  assumptions against the current repo state and finding missing files plus
  stale command references
- the last compatibility-only legacy wrappers were retired once they were shown
  to be either obsolete cleanup, missing-test aliases, or pure command chains
- there is no remaining `legacy:test:*` namespace in
  [package.json](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/package.json)
- [packages/core/jest.config.cjs](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/packages/core/jest.config.cjs)
  now keeps a much narrower `transformIgnorePatterns` allowlist, reduced to the
  active `react-dnd` dependency path instead of a long transitive ESM chain
- core Jest also now resolves the workspace package alias
  `@prompt/asset-browser`, which was previously causing Epic1 integration tests
  to fail before product behavior was exercised

## Recommended Order

1. Story 1: Define Canonical Test Layers
2. Story 2: Consolidate Setup Files By Responsibility
3. Story 3: Collapse Duplicate Jest Configs
4. Story 4: Extract Pure Testable Services
5. Story 5: Standardize ESM/CJS Strategy
6. Story 6: Rationalize Root Test Scripts

## Immediate Findings To Carry Into Implementation

### High Confidence Repairs

- Remove asset-browser Jest config duplication.
- Fix incorrect config keys in integration Jest config.
- Stop globally replacing the console with no-op mocks in shared setup.
- Keep extracting pure graph logic out of hooks/components.

### Smells That Should Trigger Refactor Instead Of More Config

- growing `transformIgnorePatterns`
- test-only workarounds for `import.meta`
- unit tests that require full `reactflow` or layout-engine imports
- suite-specific mocks that should be shared infrastructure

## Out of Scope

This epic should not:

- redesign product behavior
- replace Jest with another runner wholesale
- rewrite all existing tests
- merge E2E and unit harnesses into one tool

## Practical Definition Of Done

This epic is done when:

- a new contributor can tell which test command to run for a given layer
- a pure helper test does not require browser runtime scaffolding to boot
- setup behavior is centralized enough that failures are debuggable
- the harness needs fewer special-case exceptions over time, not more
