# Deferred Image Generation Review

_Created during the branch-biased merge of `fix/stabilize-functional-baseline`._

## Context

`origin/main` contains newer image bootstrap, scene preview, and image generation work that was intentionally not blended into the stabilization merge. The stabilization branch remains the product source of truth for the current crowd tool UX, active validation lane, route catalog, and launch/editor shell.

## Follow-Up Work

- Review the image bootstrap and scene preview changes from `origin/main` after the stabilization merge lands.
- Decide which pieces belong in the active MVP surface versus a later image-generation lane.
- Reintroduce only the compatible UI, API, service, and validation changes behind the current active-surface boundaries.
- Run the active validation and MVP ship lanes before promoting any restored image-generation work.
