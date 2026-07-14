import type { Node } from 'reactflow';
import {
  epic1MinimapProps,
  getMinimapNodeColor,
  getMinimapNodeBorderRadius,
  getMinimapNodeStrokeColor,
  getMinimapNodeStrokeWidth
} from '../nodeVisualTheme';

const node = (type: string): Node => ({
  id: `${type}-1`,
  type,
  position: { x: 0, y: 0 },
  data: {}
});

describe('node visual theme', () => {
  it.each([
    ['textBlock', '#a3a5ff'],
    ['weightedChoice', '#f6a723'],
    ['concat', '#22c493'],
    ['variable', '#9d70f7'],
    ['setVariable', '#9d70f7'],
    ['getVariable', '#9d70f7'],
    ['output', '#22d3ee'],
    ['enhancedBoundingBox', 'transparent'],
    ['boundingBox', 'transparent']
  ])('maps %s to a readable minimap color', (type, color) => {
    expect(getMinimapNodeColor(node(type))).toBe(color);
  });

  it.each(['enhancedBoundingBox', 'boundingBox'])(
    'renders %s as an outlined minimap region',
    type => {
      expect(getMinimapNodeColor(node(type))).toBe('transparent');
      expect(getMinimapNodeBorderRadius(node(type))).toBe(3);
      expect(getMinimapNodeStrokeColor(node(type))).toBe('#4ecdc4');
      expect(getMinimapNodeStrokeWidth(node(type))).toBe(2);
    }
  );

  it('keeps regular minimap nodes on the neutral stroke weight', () => {
    expect(getMinimapNodeStrokeColor(node('textBlock'))).toBe('#1f2328');
    expect(getMinimapNodeStrokeWidth(node('textBlock'))).toBe(1);
    expect(getMinimapNodeBorderRadius(node('textBlock'))).toBe(2);
  });

  it('falls back to a visible neutral color for unknown node types', () => {
    expect(getMinimapNodeColor(node('unknownNode'))).toBe('#94a3b8');
  });

  it('exports the React Flow minimap prop contract used by the editor', () => {
    expect(epic1MinimapProps.nodeColor).toBe(getMinimapNodeColor);
    expect(epic1MinimapProps.nodeStrokeColor).toBe(getMinimapNodeStrokeColor);
    // React Flow's built-in MiniMap only accepts a number for nodeStrokeWidth
    // (a function would be forwarded to <rect strokeWidth> and rejected by the
    // DOM). The per-node helper is still used by CustomMinimap's own rects.
    expect(epic1MinimapProps.nodeStrokeWidth).toBe(1);
    expect(epic1MinimapProps.nodeBorderRadius).toBe(3);
  });
});
