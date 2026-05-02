export const GENERATED_ARTIFACT_POLICY = [
  {
    id: 'asset-browser-graph-manifest',
    path: 'packages/asset-browser/public/graphs/manifest.json',
    role: 'active-runtime-input',
    ownerCommand: 'pnpm --filter @prompt/asset-browser prebuild',
    expectedCheckedIn: true,
    allowChangesDuring: ['validate:deploy:active', 'build:netlify']
  },
  {
    id: 'core-package-dist',
    path: 'packages/core/dist/**',
    role: 'publish-compat-output',
    ownerCommand: 'pnpm --filter @promptscape/core build',
    expectedCheckedIn: true,
    allowChangesDuring: []
  },
  {
    id: 'client-dist',
    path: 'client/dist/**',
    role: 'ignored-build-output',
    ownerCommand: 'pnpm --filter client build',
    expectedCheckedIn: false,
    allowChangesDuring: ['validate:active', 'validate:deploy:active', 'build:netlify']
  },
  {
    id: 'server-dist',
    path: 'server/dist/**',
    role: 'ignored-build-output',
    ownerCommand: 'pnpm --filter server build',
    expectedCheckedIn: false,
    allowChangesDuring: ['validate:active', 'validate:deploy:active', 'build:vercel-api']
  }
];

export const GENERATED_ARTIFACT_DOC_ASSERTIONS = [
  {
    path: 'docs/generated-artifact-policy.md',
    includes: [
      'packages/asset-browser/public/graphs/manifest.json',
      'active runtime-generated input',
      'packages/core/dist/**',
      'publish-compat output',
      'validate:artifacts:active',
      'refresh:publish-compat'
    ]
  },
  {
    path: 'docs/active-validation-lane.md',
    includes: [
      'validate:artifacts:active',
      'packages/core/dist/**',
      'publish-compat output',
      'refresh:publish-compat'
    ]
  },
  {
    path: 'docs/active-deploy-packaging-lane.md',
    includes: [
      'validate:artifacts:active',
      'packages/core/dist/**',
      'publish-compat output',
      'refresh:publish-compat'
    ]
  },
  {
    path: 'docs/deployment-current-state.md',
    includes: [
      'validate:artifacts:active',
      'packages/core/dist/**',
      'publish-compat output',
      'refresh:publish-compat'
    ]
  },
  {
    path: 'docs/mvp-handoff-status.md',
    includes: [
      'validate:active',
      'validate:deploy:active',
      'validate:artifacts:active',
      'refresh:publish-compat',
      'packages/core/dist/**',
      'compatibility-only'
    ]
  }
];
