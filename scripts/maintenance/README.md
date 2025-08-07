# Maintenance Scripts

Helper scripts for local maintenance, diagnostics, and refactors. Not used by CI or production builds.

- analyze-\*.js: analysis and reporting utilities
- fix-\_.js / fix\_\_.sh: targeted repair/migration scripts
- advanced-typescript-fixer.js, auto-fix-all-typescript.js, batch-fix-components.js, comprehensive-fix.js: meta-fixers

If a script becomes part of automated workflows, consider relocating to an appropriate package or `scripts/build/`.
