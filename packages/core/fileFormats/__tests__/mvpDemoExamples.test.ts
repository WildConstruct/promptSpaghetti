import fs from 'node:fs';
import path from 'node:path';

import { parsePSG } from '../psg';

const demoExampleDir = path.resolve(__dirname, '../../../../docs/examples');

const demoExamples = [
  {
    filename: 'mvp-character-archetype-demo.psg',
    name: 'Character Archetype Demo'
  },
  {
    filename: 'mvp-vehicle-family-demo.psg',
    name: 'Vehicle Family Demo'
  },
  {
    filename: 'mvp-building-family-demo.psg',
    name: 'Building Family Demo'
  },
  {
    filename: 'mvp-indy-500-crowd-card-demo.psg',
    name: 'Indy 500 Crowd Card Demo'
  },
  {
    filename: 'mvp-tree-branch-direction-demo.psg',
    name: 'Tree Branch Direction Demo'
  }
];

describe('MVP demo examples', () => {
  it.each(demoExamples)(
    'parses $filename as a canonical flat PSG demo artifact',
    ({ filename, name }) => {
      const fullPath = path.join(demoExampleDir, filename);

      expect(fs.existsSync(fullPath)).toBe(true);

      const parsed = parsePSG(fs.readFileSync(fullPath, 'utf8'));

      expect(parsed.name).toBe(name);
      expect(parsed.version).toBe('1.0.0');
      expect(parsed.nodes.some(node => node.type === 'TextBlock')).toBe(true);
      expect(parsed.nodes.some(node => node.type === 'WeightedChoice')).toBe(true);
      expect(parsed.nodes.some(node => node.type === 'Output')).toBe(true);
      expect(parsed.edges.length).toBeGreaterThan(0);
    }
  );

  it('parses the branching tree demo with explicit branch handles and one final output path', () => {
    const fullPath = path.join(
      demoExampleDir,
      'mvp-tree-branch-direction-demo.psg'
    );

    const parsed = parsePSG(fs.readFileSync(fullPath, 'utf8'));

    const branchDirectionNode = parsed.nodes.find(
      node => node.id === 'tree-direction'
    );
    expect(branchDirectionNode?.type).toBe('WeightedChoice');
    expect(branchDirectionNode?.options).toHaveLength(3);

    const sourceHandles = parsed.edges
      .map(edge => edge.sourceHandle)
      .filter((handle): handle is string => typeof handle === 'string');

    expect(sourceHandles).toEqual(
      expect.arrayContaining(['main', 'branch-0', 'branch-1', 'branch-2'])
    );

    expect(
      parsed.edges.filter(edge => edge.target === 'tree-final')
    ).toHaveLength(3);
    expect(parsed.nodes.find(node => node.id === 'tree-output')?.type).toBe(
      'Output'
    );
  });
});
