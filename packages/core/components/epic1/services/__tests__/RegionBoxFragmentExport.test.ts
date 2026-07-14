import type { Edge, Node } from 'reactflow';
import {
  buildRegionBoxFragment,
  createRegionFragmentFilename
} from '../RegionBoxFragmentExport';

describe('RegionBoxFragmentExport', () => {
  const region: Node = {
    id: 'region-family-dna',
    type: 'enhancedBoundingBox',
    position: { x: 100, y: 80 },
    width: 520,
    height: 360,
    data: {
      title: 'Family DNA',
      description: 'The fixed language every facade inherits.',
      borderColor: '#8a8f98'
    }
  };

  const insideByParent: Node = {
    id: 'text-family',
    type: 'textBlock',
    parentNode: 'region-family-dna',
    position: { x: 40, y: 120 },
    data: {
      label: 'Text Block',
      value: 'weathered urban storefront'
    }
  };

  const insideByGeometry: Node = {
    id: 'choice-era',
    type: 'weightedChoice',
    position: { x: 220, y: 180 },
    width: 220,
    height: 120,
    data: {
      label: 'Era',
      options: [
        { id: 'a', text: 'sun-bleached frontier look', weight: 2 },
        { id: 'b', text: 'patched vinyl realism', weight: 1 }
      ]
    }
  };

  const outside: Node = {
    id: 'outside-detail',
    type: 'textBlock',
    position: { x: 900, y: 80 },
    width: 160,
    height: 80,
    data: {
      label: 'Outside',
      value: 'not part of the fragment'
    }
  };

  const annotationNote: Node = {
    id: 'note-inside',
    type: 'postItNote',
    parentNode: 'region-family-dna',
    position: { x: 60, y: 280 },
    width: 160,
    height: 90,
    data: {
      nodeType: 'postItNote',
      text: 'Explain why this region exists.'
    }
  };

  const edges: Edge[] = [
    {
      id: 'edge-inside',
      source: 'text-family',
      target: 'choice-era'
    },
    {
      id: 'edge-outside',
      source: 'choice-era',
      target: 'outside-detail'
    }
  ];

  it('exports a region box as a PSG fragment containing enclosed nodes and internal edges', () => {
    const fragment = buildRegionBoxFragment({
      regionNodeId: 'region-family-dna',
      nodes: [region, insideByParent, insideByGeometry, outside],
      edges
    });

    expect(fragment.name).toBe('Family DNA');
    expect(fragment.description).toBe(
      'The fixed language every facade inherits.'
    );
    expect(fragment.nodes.map(node => node.id).sort()).toEqual([
      'choice-era',
      'text-family'
    ]);
    expect(fragment.edges).toEqual([
      {
        id: 'edge-inside',
        source: 'text-family',
        target: 'choice-era'
      }
    ]);
    expect(fragment.regions).toEqual([
      {
        id: 'region-family-dna',
        name: 'Family DNA',
        color: '#8a8f98',
        description: 'The fixed language every facade inherits.',
        nodes: ['text-family', 'choice-era']
      }
    ]);
  });

  it('rejects empty regions so users do not save blank fragments', () => {
    expect(() =>
      buildRegionBoxFragment({
        regionNodeId: 'region-family-dna',
        nodes: [region, outside],
        edges: []
      })
    ).toThrow('Region Box does not contain any nodes');
  });

  it('excludes annotation notes from saved PSG fragment content', () => {
    const fragment = buildRegionBoxFragment({
      regionNodeId: 'region-family-dna',
      nodes: [region, insideByParent, annotationNote],
      edges: []
    });

    expect(fragment.nodes.map(node => node.id)).toEqual(['text-family']);
    expect(fragment.regions?.[0]?.nodes).toEqual(['text-family']);
  });

  it('creates safe psg filenames from user fragment names', () => {
    expect(createRegionFragmentFilename('Family DNA / Locked?')).toBe(
      'family-dna-locked.psg'
    );
    expect(createRegionFragmentFilename('   ')).toBe('region-fragment.psg');
  });
});
