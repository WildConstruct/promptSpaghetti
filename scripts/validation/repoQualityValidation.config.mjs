export const REPO_QUALITY_VALIDATION_PHASES = [
  {
    id: 'unused',
    title: 'Unused code check',
    pnpmArgs: ['run', 'validate:unused']
  },
  {
    id: 'cycles',
    title: 'Circular dependency check',
    pnpmArgs: ['run', 'validate:cycles']
  },
  {
    id: 'epic1-source-of-truth',
    title: 'Epic 1 source-of-truth Jest slice',
    pnpmArgs: [
      '--filter',
      '@promptscape/core',
      'test',
      '--',
      '--runInBand',
      'components/epic1/nodes/__tests__/nodeRegistrySourceOfTruth.test.ts',
      'components/epic1/nodes/__tests__/EnhancedBranchingNode.test.tsx',
      'components/epic1/nodes/__tests__/NodeContextMenu.test.tsx'
    ]
  }
];
