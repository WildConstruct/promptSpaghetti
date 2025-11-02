import { SmartNodePositioner } from '../../runtime/nodes/epic1/SmartNodePositioning';
import { TextBlockNode } from '../../runtime/nodes/epic1/TextBlockNode';
import { ConcatNode } from '../../runtime/nodes/epic1/ConcatNode';
import { VariableNode } from '../../runtime/nodes/epic1/VariableNode';
import { WeightedChoiceNode } from '../../runtime/nodes/epic1/WeightedChoiceNode';
import { OutputNode } from '../../runtime/nodes/epic1/OutputNode';
import type { GeneratedNode } from '../../runtime/nodes/epic1/PromptParser';

const createTextNode = (id: string, segment: number): GeneratedNode => ({
  node: new TextBlockNode(id, `text-${id}`),
  sourceSegments: [segment]
});

const createConcatNode = (id: string, segment: number): GeneratedNode => ({
  node: new ConcatNode(id),
  sourceSegments: [segment]
});

const createVariableNode = (id: string, segment: number): GeneratedNode => ({
  node: new VariableNode(id, { name: `${id}_var` }),
  sourceSegments: [segment]
});

const createChoiceNode = (id: string, segment: number): GeneratedNode => ({
  node: new WeightedChoiceNode(id, [
    { id: `${id}-1`, text: 'A', weight: 50 },
    { id: `${id}-2`, text: 'B', weight: 50 }
  ]),
  sourceSegments: [segment]
});

const createOutputNode = (id: string): GeneratedNode => ({
  node: new OutputNode(id),
  sourceSegments: []
});

describe('SmartNodePositioner (runtime integration)', () => {
  let positioner: SmartNodePositioner;

  beforeEach(() => {
    positioner = new SmartNodePositioner();
  });

  it('lays out groups horizontally and wraps when exceeding max width', () => {
    const nodes: GeneratedNode[] = [
      createTextNode('text-1', 0),
      createTextNode('text-2', 1), // consecutive text blocks -> group
      createConcatNode('concat-1', 2),
      createVariableNode('var-1', 3), // grouped with concat via relation
      createChoiceNode('choice-1', 4),
      createTextNode('text-3', 5)
    ];

    const positions = positioner.calculatePositions(nodes, {
      flowDirection: 'horizontal',
      baseX: 0,
      baseY: 0,
      maxWidth: 450,
      horizontalSpacing: 80,
      verticalSpacing: 60,
      groupSpacing: 40
    });

    expect(positions).toHaveLength(nodes.length);

    // First group (two text nodes) should share the same row
    expect(positions[0].y).toBe(positions[1].y);

    // Ensure wrapping occurred by detecting multiple unique Y positions
    const uniqueY = Array.from(new Set(positions.map(p => p.y)));
    expect(uniqueY.length).toBeGreaterThan(1);
  });

  it('produces stacked vertical flow when configured', () => {
    const nodes: GeneratedNode[] = [
      createTextNode('text-1', 0),
      createTextNode('text-2', 0),
      createChoiceNode('choice-1', 1)
    ];

    const positions = positioner.calculatePositions(nodes, {
      flowDirection: 'vertical',
      baseX: 50,
      baseY: 75,
      verticalSpacing: 70
    });

    expect(positions).toHaveLength(nodes.length);
    expect(positions[0].x).toBe(positions[1].x);
    expect(positions[1].y).toBeGreaterThan(positions[0].y);
    expect(positions[2].y).toBeGreaterThan(positions[1].y);
  });

  it('stagger groups diagonally and repositions output node to bottom-right', () => {
    const nodes: GeneratedNode[] = [
      createTextNode('text-1', 0),
      createTextNode('text-2', 1),
      createConcatNode('concat-1', 2),
      createVariableNode('var-1', 3),
      createChoiceNode('choice-1', 4),
      createOutputNode('output-1')
    ];

    const positions = positioner.calculatePositions(nodes, {
      flowDirection: 'diagonal',
      baseX: 10,
      baseY: 20,
      maxWidth: 400,
      horizontalSpacing: 90,
      verticalSpacing: 70
    });

    expect(positions).toHaveLength(nodes.length);

    const nonOutput = positions.slice(0, -1);
    const maxX = Math.max(...nonOutput.map(p => p.x));
    const maxY = Math.max(...nonOutput.map(p => p.y));
    const output = positions[positions.length - 1];

    expect(output.x).toBeGreaterThan(maxX);
    expect(output.y).toBeGreaterThan(maxY);
  });

  it('optimizes overlapping nodes in both horizontal and vertical directions', () => {
    const nodes: GeneratedNode[] = [
      createTextNode('text-1', 0),
      createChoiceNode('choice-1', 1)
    ];

    const horizontalOverlap = [
      { x: 100, y: 100 },
      { x: 250, y: 100 }
    ];

    const verticalOverlap = [
      { x: 100, y: 100 },
      { x: 110, y: 120 }
    ];

    const originalHorizontalX = horizontalOverlap[1].x;
    const resolvedHorizontal = positioner.optimizePositions(
      horizontalOverlap,
      nodes,
      2
    );
    expect(resolvedHorizontal[1].x).toBeGreaterThan(originalHorizontalX);

    const originalVerticalY = verticalOverlap[1].y;
    const resolvedVertical = positioner.optimizePositions(
      verticalOverlap,
      nodes,
      2
    );
    expect(resolvedVertical[1].y).toBeGreaterThan(originalVerticalY);
  });

  it('keeps spaced positions unchanged during optimization', () => {
    const nodes: GeneratedNode[] = [
      createTextNode('text-1', 0),
      createTextNode('text-2', 1)
    ];

    const spacedPositions = [
      { x: 100, y: 100 },
      { x: 400, y: 200 }
    ];

    const optimized = positioner.optimizePositions(spacedPositions, nodes, 1);
    expect(optimized).toEqual(spacedPositions);
  });
});
