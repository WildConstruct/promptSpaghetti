# Test Script Catalog

This file defines the intended status of the root `test:*` scripts.

## Canonical

- `test`
- `test:packages`
- `test:unit`
- `test:client`
- `test:integration`
- `test:epic1`
- `test:epic1:components`
- `test:epic1:nodes`
- `test:e2e`
- `test:mobile`

These are the supported entry points a contributor should reach for first.

## Specialist

- `test:coverage`
- `test:coverage:report`
- `test:docs`
- `test:docs:watch`
- `test:docs:coverage`
- `test:infrastructure`
- `test:infrastructure:watch`
- `test:infrastructure:coverage`
- `test:performance-scenarios`
- `test:harness`
- `test:regression`
- `test:regression:core-engine`
- `test:regression:api-stability`
- `test:regression:performance`
- `test:regression:generate-golden`
- `test:state-transitions`
- `test:state-transitions:sequential`
- `test:state-transitions:quick`
- `test:load-scenarios`
- `test:load-scenarios:watch`
- `test:performance-integration`
- `test:performance-benchmarks`
- `test:performance-full`
- `test:security`
- `test:automation`

These are intentionally narrower suites or support commands.

## Removed Public Aliases

The following historical aliases were removed from the public `test:*`
namespace because they duplicated other commands or represented non-canonical
wrappers:

- `test:comprehensive`
- `test:security-scan`
- `test:regression:benchmark`
- `test:clean`
- `test:reliability`
- `test:performance-only`
- `test:unit-only`
- `test:orchestrator`
- `test:orchestrator:parallel`
- `test:orchestrator:sequential`
- `test:orchestrator:fast-fail`
- `test:framework`
- `test:framework:setup`
- `test:framework:health`
- `test:framework:automation`
- `test:framework:coverage`
- `test:ci-enhanced`
- `test:matrix`
- `test:quality-gates`
- `test:edge-cases`

## Retired Broken Legacy Wrappers

These legacy wrappers were removed entirely after validation showed that their
backing scripts were syntactically invalid and not runnable:

- `legacy:test:reliability`
- `legacy:test:performance-only`
- `legacy:test:unit-only`
- `legacy:test:orchestrator`
- `legacy:test:orchestrator:parallel`
- `legacy:test:orchestrator:sequential`
- `legacy:test:orchestrator:fast-fail`
- `legacy:test:matrix`
- `legacy:test:quality-gates`

The following legacy wrappers were also retired after validation showed that
their backing script no longer matched the supported harness model:

- `legacy:test:framework`
- `legacy:test:framework:setup`
- `legacy:test:framework:health`
- `legacy:test:framework:automation`
- `legacy:test:framework:coverage`

The final compatibility wrappers were retired after validation showed they had
no current justification:

- `legacy:test:clean`
- `legacy:test:ci-enhanced`
- `legacy:test:edge-cases`

The equivalent supported commands are:

- `test:packages`
- `test:integration`
- `test:infrastructure`
- `test:performance-scenarios`
