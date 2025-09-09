/**
 * @jest-environment jsdom
 */
import { epic1NodeTypes, WeightedChoiceNode } from '../index';

describe('Node Registry Source of Truth', () => {
  it('maps weightedChoice to EnhancedBranchingNode (via alias)', () => {
    const registryImpl = epic1NodeTypes.weightedChoice;
    expect(registryImpl).toBeDefined();
    // compare component identity through the alias export
    expect(registryImpl).toBe(WeightedChoiceNode);
  });
});

