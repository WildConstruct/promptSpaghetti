export const SERVER_SMOKE_TESTS = [
  '__tests__/llm-routes.test.ts',
  '__tests__/psg-routes.test.ts',
  '__tests__/route-surface-catalog.test.ts'
];

export const CLIENT_SMOKE_TESTS = [
  'src/components/LaunchScreen/__tests__/LaunchScreenQuickActions.test.tsx',
  'src/Epic1Editor/components/__tests__/SimpleMenuBar.test.tsx',
  'src/Epic1Editor/components/__tests__/ComfyExportDialog.test.tsx',
  'src/Epic1Editor/components/__tests__/PsgCrowdExpansionDialog.test.tsx',
  'src/__tests__/ButtonFunctionality.test.tsx',
  'src/Epic1Editor/__tests__/editorSurfacePolicy.test.ts'
];

export const ACTIVE_VALIDATION_PHASES = [
  {
    id: 'typecheck',
    title: 'Active typecheck',
    pnpmArgs: ['run', 'typecheck:active']
  },
  {
    id: 'client-build',
    title: 'Client build',
    pnpmArgs: ['--filter', 'client', 'build']
  },
  {
    id: 'server-build',
    title: 'Server build',
    pnpmArgs: ['--filter', 'server', 'build']
  },
  {
    id: 'server-smoke',
    title: 'Server runtime contract smoke',
    pnpmArgs: [
      '--filter',
      'server',
      'test',
      '--',
      '--runInBand',
      ...SERVER_SMOKE_TESTS
    ]
  },
  {
    id: 'client-smoke',
    title: 'Client MVP surface smoke',
    pnpmArgs: [
      '--filter',
      'client',
      'test',
      '--',
      '--runInBand',
      '--runTestsByPath',
      ...CLIENT_SMOKE_TESTS
    ]
  },
  {
    id: 'artifact-hygiene',
    title: 'Generated artifact hygiene check',
    pnpmArgs: ['run', 'validate:artifacts:active']
  }
];
