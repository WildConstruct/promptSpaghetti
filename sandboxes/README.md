# Sandboxes

This directory contains ad-hoc demos, debug scripts, and manual test harnesses that are NOT part of the production build or CI pipeline.

- Files were moved from the repo root to reduce clutter.
- Use these for local experimentation and manual verification.
- Nothing in here should be required by automated workflows.

Conventions

- test-\*.js/html/md: manual test harnesses
- debug-\*.js/html: debugging utilities
- demo-\*.js: feature demos
- epic*-*.js/html/md: historical demo scripts per epic

If a script becomes maintained/required, promote it to an appropriate package or scripts/ subfolder and add tests.
