export const MVP_DEMO_CLIENT_TESTS = [
  'src/components/LaunchScreen/__tests__/LaunchScreenQuickActions.test.tsx',
  'src/Epic1Editor/components/__tests__/SimpleMenuBar.test.tsx',
  'src/Epic1Editor/components/__tests__/PsgSceneAssetsDialog.test.tsx',
  'src/Epic1Editor/components/__tests__/ComfyExportDialog.test.tsx',
  'src/Epic1Editor/components/__tests__/PsgCrowdExpansionDialog.test.tsx',
  'src/__tests__/ButtonFunctionality.test.tsx'
];

export const MVP_DEMO_CORE_TESTS = [
  'fileFormats/__tests__/mvpDemoExamples.test.ts'
];

export const MVP_SHIP_PHASES = [
  {
    id: 'active-validation',
    title: 'Active validation lane',
    commands: [['run', 'validate:active']]
  },
  {
    id: 'artifact-hygiene',
    title: 'Generated artifact hygiene lane',
    commands: [['run', 'validate:artifacts:active']]
  },
  {
    id: 'deploy-packaging',
    title: 'Active deploy packaging lane',
    commands: [['run', 'validate:deploy:active']]
  },
  {
    id: 'demo-flows',
    title: 'Focused MVP demo flows',
    commands: [
      [
        '--filter',
        'client',
        'test',
        '--',
        '--runInBand',
        '--runTestsByPath',
        ...MVP_DEMO_CLIENT_TESTS
      ],
      [
        '--filter',
        '@promptscape/core',
        'test',
        '--',
        '--runInBand',
        ...MVP_DEMO_CORE_TESTS
      ]
    ]
  }
];
