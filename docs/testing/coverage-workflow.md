## Coverage Workflow

This guide documents the lightweight tooling around coverage so future contributors can spot the weakest areas quickly.

### 1. Generate Coverage JSON

```bash
pnpm test -- --coverage \
  --coverageReporters=json-summary \
  --coverageDirectory=.temp-coverage
```

The summary file (`.temp-coverage/coverage-summary.json`) is fast to parse and doesn’t clobber the full HTML report.

### 2. Report the Bottom 10 Files

```bash
pnpm coverage:report
```

This command runs `scripts/report-low-coverage.js`, which reads either `.temp-coverage/coverage-summary.json` or `coverage/coverage-final.json`, sorts by line coverage, and prints the 10 lowest files. Example output:

```
Lowest coverage files (source: .temp-coverage/coverage-summary.json):
  12.50%  10/80  packages/foo/bar.ts
  18.18%  20/110 packages/baz/qux.ts
```

### 3. Prioritise Work

1. **Runtime/Services** – focus on files that contribute to production execution paths (e.g., runtime nodes, LLM services) before tests or mock data.
2. **UI Components** – look for files below ~70 % coverage, especially those handling error states or user interactions.
3. **Legacy Archives** – files under `docs/_archive` or non-shipping code can remain low priority unless they bubble into the top list.

### 4. Cleaning Up

- Remove `.temp-coverage/` if you need a fresh run: `rimraf .temp-coverage`.
- Commit coverage artefacts **only** if they’re part of documentation (e.g., screenshots, not JSON files).

By baking the script into `package.json`, we ensure everyone can run the same prioritisation check locally or in CI.

