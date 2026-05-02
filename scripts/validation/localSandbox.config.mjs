export const LOCAL_SANDBOX_SERVER_TESTS = [
  '__tests__/local-image-routes.test.ts',
  '__tests__/local-image-sandbox-service.test.ts'
];

export const LOCAL_SANDBOX_CLIENT_TESTS = [
  'src/Epic1Editor/components/__tests__/LocalSandboxGenerationDialog.test.tsx',
  'src/Epic1Editor/components/__tests__/SimpleMenuBar.test.tsx',
  'src/Epic1Editor/__tests__/editorSurfacePolicy.test.ts'
];

export const LOCAL_SANDBOX_VALIDATION_PHASES = [
  {
    id: 'server-local-image',
    title: 'Server local sandbox route smoke',
    pnpmArgs: [
      '--filter',
      'server',
      'test',
      '--',
      '--runInBand',
      ...LOCAL_SANDBOX_SERVER_TESTS
    ]
  },
  {
    id: 'client-local-image',
    title: 'Client local sandbox dialog smoke',
    pnpmArgs: [
      '--filter',
      'client',
      'test',
      '--',
      '--runInBand',
      '--runTestsByPath',
      ...LOCAL_SANDBOX_CLIENT_TESTS
    ]
  }
];
