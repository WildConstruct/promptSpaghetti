# Test Framework Guide

This project no longer treats the historical "comprehensive test framework"
wrappers as the primary interface to the test harness.

Use the canonical layer model instead:

- [docs/test-harness-canonical-layers.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/test-harness-canonical-layers.md)
- [docs/test-script-catalog.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/test-script-catalog.md)
- [docs/test-harness-repair-epic.md](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/docs/test-harness-repair-epic.md)

## Canonical Commands

```bash
pnpm test
pnpm test:packages
pnpm test:client
pnpm test:integration
pnpm test:epic1
pnpm test:e2e
```

## Specialist Commands

Use these when you are targeting a narrower suite intentionally:

```bash
pnpm test:docs
pnpm test:infrastructure
pnpm test:performance-integration
pnpm test:performance-benchmarks
pnpm test:regression
```

## Legacy Wrappers

Historical orchestration wrappers have been retired. New automation should use
the canonical and specialist commands directly instead of introducing wrapper
scripts.
