# Epic 1 – Catch-Up TODOs

Foundation & Core Infrastructure is largely complete; only a few checklist items remain.

| Story                                | Verification Status | Notes                                                                                |
| ------------------------------------ | ------------------- | ------------------------------------------------------------------------------------ |
| 1.1 Repo & Monorepo Tooling          | ✅ Verified         | Repo exists, pnpm workspaces set, lint config present                                |
| 1.2 Dev Container & VS Code Settings | ⚠️ Partial          | `devcontainer.json` present; `.vscode/settings.json` missing eslint+prettier on save |
| 1.3 React-Flow Canvas Skeleton       | ✅ Verified         | Vite React app in `client`; canvas renders local dev                                 |
| 1.4 CI Pipeline                      | ⚠️ Partial          | Workflow runs lint/tests; Jest coverage < 80 % & badge missing                       |
| 1.5 Windsurf Preview Deployment      | ⚠️ Partial          | Preview deploy live; PR comment + teardown automation TODO                           |

Legend: ✅ Verified ⚠️ Partial ❌ Not found / Not started

## Next Steps

1. Add `.vscode/settings.json` for eslint & prettier autosave.
2. Increase Jest coverage to ≥ 80 % and upload Codecov badge to README.
3. Enhance CI to post preview URL on PR and teardown on branch delete.
