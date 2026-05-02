# New Repo Bootstrap Checklist

This checklist captures the remaining manual setup for the new GitHub repo and hosted deployment surfaces.

## Current State

- GitHub repo: `WildConstruct/promptSpaghetti`
- Branch pushed: `fix/stabilize-functional-baseline`
- GitHub Actions workflows are recognized by the new repo
- Netlify build config passes locally via `pnpm run build:netlify`
- Vercel API build config passes locally via `pnpm run build:vercel-api`
- Full local deploy packaging passes via `pnpm run validate:deploy:active`
- Generated artifact hygiene passes via `pnpm run validate:artifacts:active`

## Netlify

- Connect the new repo to the Netlify site that should serve the client
- Confirm build command comes from [netlify.toml](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/netlify.toml#L1)
- Confirm publish directory is `client/dist`
- Confirm the client site uses the `/api/*` redirect target now set to:
  - `https://prompt-spaghetti-client.vercel.app/api/:splat`
- Set any required frontend env vars in Netlify UI:
  - Supabase public URL / anon key if cloud mode is enabled
  - any feature flags you want active for production

## Vercel

- Connect the new repo or target project for the backend/API surface
- Confirm the intended hostname for the API proxy is:
  - `https://prompt-spaghetti-client.vercel.app`
- Confirm `vercel.json` no longer routes legacy admin/debug rewrites
- If canonical server runtime is moving off legacy `api/`, treat this Vercel surface as transitional until that migration is done

## GitHub Actions Secrets

The new repo currently has no Actions secrets configured.

Only set what you actually intend to use:

- `OPENROUTER_API_KEY`
  - used by parser/model evaluation and release workflows
- `CODECOV_TOKEN`
  - used by coverage upload workflows
- `DISCORD_WEBHOOK`
  - optional release notification
- `API_TOKEN`
  - optional model-evaluation webhook auth
- `API_BASE_URL`
  - optional model-evaluation webhook base URL

Built-in:

- `GITHUB_TOKEN`
  - provided automatically by GitHub Actions

## GitHub Actions Variables

The new repo currently has no Actions variables configured.

Optional existing workflow vars:

- `MANIFEST_OPTIONAL`
  - set to `true` if graph-manifest generation should warn instead of fail
- `BUILD_DOCKER`
  - set to `true` only if Docker image build should run in CI

## Recommended First Checks

- Run the `Build Validation` workflow in the new repo
- Run the main `CI` workflow on the pushed branch
- Confirm Netlify preview build succeeds
- Confirm Vercel target hostname matches the proxy value used in:
  - [netlify.toml](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/netlify.toml#L1)
  - [client/public/_redirects](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/client/public/_redirects#L1)
