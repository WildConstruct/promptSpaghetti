/**
 * The WeightedChoice router depends on `hasBranch` surviving the
 * node -> runtime conversion. Before this was fixed, toWeightedOption dropped
 * the field, so the engine could never tell a branched option from a plain one.
 */
import { nodeDataToRuntimeNode } from '../nodeFactory';
import { WeightedChoiceNode } from '../../../../runtime/nodes/epic1/WeightedChoiceNode';

describe('nodeFactory WeightedChoice conversion', () => {
  it('preserves per-option hasBranch into the runtime node', () => {
    const flowNode = {
      id: 'wc',
      type: 'weightedChoice',
      position: { x: 0, y: 0 },
      data: {
        nodeType: 'weightedChoice',
        options: [
          { id: '1', text: 'A', weight: 50, hasBranch: true, locked: false },
          { id: '2', text: 'B', weight: 50, hasBranch: false, locked: true }
        ]
      }
    } as any;

    const node = nodeDataToRuntimeNode(flowNode) as WeightedChoiceNode | null;
    expect(node).toBeTruthy();

    const options = node!.getData().value;
    expect(options).toHaveLength(2);
    expect(options[0].hasBranch).toBe(true);
    expect(options[1].hasBranch).toBe(false);
    expect(options[0].locked).toBe(false);
    expect(options[1].locked).toBe(true);
  });

  it('defaults hasBranch to false when absent', () => {
    const flowNode = {
      id: 'wc',
      type: 'weightedChoice',
      position: { x: 0, y: 0 },
      data: {
        nodeType: 'weightedChoice',
        options: [{ id: '1', text: 'A', weight: 50 }]
      }
    } as any;

    const node = nodeDataToRuntimeNode(flowNode) as WeightedChoiceNode | null;
    expect(node!.getData().value[0].hasBranch).toBe(false);
  });
});
