export const DEPLOYMENT_SURFACE = {
  frontendPublishDir: 'client/dist',
  backendApiOrigin: 'https://prompt-spaghetti-client.vercel.app',
  apiProxyTarget: 'https://prompt-spaghetti-client.vercel.app/api/:splat',
  netlifyBuildCommand:
    'pnpm --filter @prompt/asset-browser prebuild && pnpm --filter client build',
  vercelMode: 'legacy-api-compatibility',
  vercelPlaceholderTitle: 'Prompt Spaghetti API Compatibility Surface'
};

export const DEPLOY_PACKAGING_PHASES = [
  {
    id: 'netlify-build',
    title: 'Netlify frontend packaging build',
    commands: [
      ['--filter', '@prompt/asset-browser', 'prebuild'],
      ['--filter', 'client', 'build']
    ]
  },
  {
    id: 'vercel-api-build',
    title: 'Vercel API compatibility build',
    commands: [['--filter', 'server', 'build']]
  },
  {
    id: 'deploy-config-check',
    title: 'Deploy config consistency check',
    runner: 'node',
    args: ['scripts/deploy/verifyDeploymentSurface.mjs']
  },
  {
    id: 'artifact-hygiene-check',
    title: 'Generated artifact hygiene check',
    commands: [['run', 'validate:artifacts:active']]
  }
];
