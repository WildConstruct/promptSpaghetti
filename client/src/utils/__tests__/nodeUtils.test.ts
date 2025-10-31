import {
  calculateNodePosition,
  snapToGrid,
  getRandomOption,
  getWeightedRandomOptions,
  sortOptionsByWeight,
  validateNodeData,
  isValidNode,
  duplicateNode,
  moveNode,
  updateNodeOptions,
  searchNodes,
  filterNodesByType,
  filterNodesByCategory,
  getNodeStatistics
} from '../nodeUtils';
import {
  panelArchetypeTemplate,
  aestheticInfluenceTemplate
} from '../../data/nodeTemplates';
import type { NodeTemplate, OptionConfig } from '../../data/nodeTemplates/types';

const sampleOptions: OptionConfig = [
  { label: 'A', value: 'a', weight: 3 },
  { label: 'B', value: 'b', weight: 1 },
  { label: 'C', value: 'c', weight: 2 }
];

describe('nodeUtils', () => {
  it('calculates grid positions', () => {
    expect(calculateNodePosition(0)).toEqual({ x: 50, y: 50 });
    expect(calculateNodePosition(3)).toEqual({ x: 50, y: 250 });
  });

  it('snaps positions to the grid', () => {
    expect(snapToGrid({ x: 23, y: 47 })).toEqual({ x: 20, y: 40 });
    expect(snapToGrid({ x: 23, y: 47 }, 10)).toEqual({ x: 20, y: 50 });
  });

  it('returns weighted options', () => {
    const randomOption = getRandomOption(sampleOptions);
    expect(sampleOptions).toContainEqual(randomOption);

    const weighted = getWeightedRandomOptions(sampleOptions, 2);
    expect(weighted.length).toBe(2);
    expect(new Set(weighted.map(option => option.value)).size).toBe(weighted.length);
  });

  it('sorts options by weight', () => {
    const sorted = sortOptionsByWeight(sampleOptions);
    expect(sorted[0].weight).toBeGreaterThanOrEqual(sorted[1].weight);
  });

  it('validates node templates', () => {
    expect(validateNodeData(panelArchetypeTemplate)).toHaveLength(0);
    const invalid: NodeTemplate = { ...panelArchetypeTemplate, id: '' };
    expect(validateNodeData(invalid)).not.toHaveLength(0);
    expect(isValidNode(panelArchetypeTemplate)).toBe(true);
  });

  it('duplicates nodes with offset', () => {
    const duplicate = duplicateNode(panelArchetypeTemplate);
    expect(duplicate.id).not.toBe(panelArchetypeTemplate.id);
    expect(duplicate.position.x).not.toBe(panelArchetypeTemplate.position.x);
  });

  it('moves and updates nodes', () => {
    const moved = moveNode(panelArchetypeTemplate, { x: 100, y: 50 });
    expect(moved.position).toEqual({ x: 100, y: 50 });

    const updated = updateNodeOptions(panelArchetypeTemplate, sampleOptions);
    expect(updated.data.options).toEqual(sampleOptions);
  });

  it('searches and filters nodes', () => {
    const nodes = [panelArchetypeTemplate, aestheticInfluenceTemplate];
    expect(searchNodes(nodes, 'panel').length).toBeGreaterThan(0);
    expect(filterNodesByType(nodes, 'logic')).toHaveLength(1);
    expect(filterNodesByCategory(nodes, panelArchetypeTemplate.data.category)).toHaveLength(1);
  });

  it('computes statistics', () => {
    const stats = getNodeStatistics([panelArchetypeTemplate, aestheticInfluenceTemplate]);
    expect(stats.total).toBe(2);
    expect(stats.totalOptions).toBeGreaterThan(0);
  });
});
