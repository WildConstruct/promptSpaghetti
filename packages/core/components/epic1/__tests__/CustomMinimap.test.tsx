import React from 'react';
import { render } from '@testing-library/react';
import type { Node } from 'reactflow';
import { CustomMinimap } from '../CustomMinimap';

jest.mock('reactflow', () => ({
  useViewport: () => ({ x: 0, y: 0, zoom: 1 }),
  useReactFlow: () => ({
    getViewport: () => ({ x: 0, y: 0, zoom: 1 }),
    setViewport: jest.fn()
  })
}));

const node = (overrides: Partial<Node>): Node => ({
  id: 'node-1',
  type: 'textBlock',
  position: { x: 0, y: 0 },
  data: {},
  ...overrides
});

describe('CustomMinimap', () => {
  it('draws Region Box outlines using their actual dimensions', () => {
    const region = node({
      id: 'region-1',
      type: 'enhancedBoundingBox',
      position: { x: 100, y: 100 },
      width: 600,
      height: 300,
      data: { width: 600, height: 300 }
    });

    const { container } = render(
      <CustomMinimap nodes={[region]} edges={[]} />
    );

    const regionRect = container.querySelector(
      'rect[fill="transparent"]'
    ) as SVGRectElement | null;

    expect(regionRect).toBeTruthy();
    expect(regionRect?.getAttribute('stroke')).toBe('#4ecdc4');
    expect(regionRect?.getAttribute('rx')).toBe('3');
    expect(Number(regionRect?.getAttribute('width'))).toBeCloseTo(80, 1);
    expect(Number(regionRect?.getAttribute('height'))).toBeCloseTo(40, 1);
  });
});
