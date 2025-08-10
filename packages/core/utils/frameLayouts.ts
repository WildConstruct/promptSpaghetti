/**
 * Frame Layout Utilities for Epic1 Graph Editor
 * Provides various layout patterns for positioning nodes around the viewport edges
 */

export interface Position {
  x: number;
  y: number;
}

export interface LayoutOptions {
  viewportWidth: number;
  viewportHeight: number;
  nodeWidth?: number;
  nodeHeight?: number;
  padding?: number;
}

/**
 * Creates a rectangular frame layout with nodes positioned along the edges
 */
export function rectangularFrameLayout(
  index: number,
  total: number,
  options: LayoutOptions
): Position {
  const {
    viewportWidth,
    viewportHeight,
    nodeWidth = 200,
    nodeHeight = 100,
    padding = 80
  } = options;

  // Calculate perimeter and distribute nodes evenly
  const perimeter = 2 * (viewportWidth + viewportHeight - 4 * padding);
  const step = perimeter / total;
  const distance = index * step;

  // Top edge
  if (distance < viewportWidth - 2 * padding) {
    return {
      x: padding + distance,
      y: padding
    };
  }

  // Right edge
  const rightStart = viewportWidth - 2 * padding;
  if (distance < rightStart + viewportHeight - 2 * padding) {
    return {
      x: viewportWidth - nodeWidth - padding,
      y: padding + (distance - rightStart)
    };
  }

  // Bottom edge
  const bottomStart = rightStart + viewportHeight - 2 * padding;
  if (distance < bottomStart + viewportWidth - 2 * padding) {
    return {
      x: viewportWidth - padding - (distance - bottomStart),
      y: viewportHeight - nodeHeight - padding
    };
  }

  // Left edge
  return {
    x: padding,
    y:
      viewportHeight -
      padding -
      (distance - bottomStart - viewportWidth + 2 * padding)
  };
}

/**
 * Creates nodes positioned at the absolute edges of the viewport frame
 * Nodes are pinned to the outer boundaries with minimal padding
 */
export function ellipticalFrameLayout(
  index: number,
  total: number,
  options: LayoutOptions
): Position {
  const {
    viewportWidth,
    viewportHeight,
    nodeWidth = 200,
    nodeHeight = 100,
    padding = 10 // Minimal padding from absolute edge
  } = options;

  // Calculate angle for this node position
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start from top

  // Get normalized direction
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // Determine which edge this node should be pinned to
  // by checking which direction component is larger
  const absX = Math.abs(cos);
  const absY = Math.abs(sin);

  let x: number;
  let y: number;

  if (absX > absY) {
    // Node belongs on left or right edge
    if (cos > 0) {
      // Right edge - pin to right boundary
      x = viewportWidth - nodeWidth - padding;
    } else {
      // Left edge - pin to left boundary
      x = padding;
    }
    // Position along the vertical axis based on angle
    const normalizedY = (sin + 1) / 2; // Convert from -1,1 to 0,1
    y = padding + normalizedY * (viewportHeight - nodeHeight - padding * 2);
  } else {
    // Node belongs on top or bottom edge
    if (sin > 0) {
      // Bottom edge - pin to bottom boundary
      y = viewportHeight - nodeHeight - padding;
    } else {
      // Top edge - pin to top boundary
      y = padding;
    }
    // Position along the horizontal axis based on angle
    const normalizedX = (cos + 1) / 2; // Convert from -1,1 to 0,1
    x = padding + normalizedX * (viewportWidth - nodeWidth - padding * 2);
  }

  return { x, y };
}

/**
 * Creates a diamond/rhombus frame layout
 */
export function diamondFrameLayout(
  index: number,
  total: number,
  options: LayoutOptions
): Position {
  const {
    viewportWidth,
    viewportHeight,
    nodeWidth = 200,
    nodeHeight = 100,
    padding = 100
  } = options;

  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;

  // Divide nodes into 4 sides
  const nodesPerSide = Math.ceil(total / 4);
  const side = Math.floor(index / nodesPerSide);
  const sideIndex = index % nodesPerSide;
  const sideProgress = sideIndex / (nodesPerSide - 1 || 1);

  let x, y;

  switch (side) {
    case 0: // Top to right
      x = centerX + (centerX - padding) * sideProgress;
      y = padding + (centerY - padding) * sideProgress;
      break;
    case 1: // Right to bottom
      x = viewportWidth - padding - (centerX - padding) * sideProgress;
      y = centerY + (centerY - padding) * sideProgress;
      break;
    case 2: // Bottom to left
      x = centerX - (centerX - padding) * sideProgress;
      y = viewportHeight - padding - (centerY - padding) * sideProgress;
      break;
    case 3: // Left to top
    default:
      x = padding + (centerX - padding) * sideProgress;
      y = centerY - (centerY - padding) * sideProgress;
      break;
  }

  return {
    x: x - nodeWidth / 2,
    y: y - nodeHeight / 2
  };
}

/**
 * Creates a spiral frame layout starting from outside
 */
export function spiralFrameLayout(
  index: number,
  total: number,
  options: LayoutOptions
): Position {
  const {
    viewportWidth,
    viewportHeight,
    nodeWidth = 200,
    nodeHeight = 100,
    padding = 80
  } = options;

  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;

  // Spiral parameters
  const maxRadius = Math.min(viewportWidth, viewportHeight) / 2 - padding;
  const minRadius = maxRadius * 0.3;
  const progress = index / (total - 1 || 1);
  const radius = maxRadius - (maxRadius - minRadius) * progress;
  const angle = progress * 4 * Math.PI; // 2 full rotations

  const x = centerX + radius * Math.cos(angle) - nodeWidth / 2;
  const y = centerY + radius * Math.sin(angle) - nodeHeight / 2;

  return {
    x: Math.max(
      padding / 2,
      Math.min(viewportWidth - nodeWidth - padding / 2, x)
    ),
    y: Math.max(
      padding / 2,
      Math.min(viewportHeight - nodeHeight - padding / 2, y)
    )
  };
}

/**
 * Creates a star/pentagram frame layout
 */
export function starFrameLayout(
  index: number,
  total: number,
  options: LayoutOptions
): Position {
  const {
    viewportWidth,
    viewportHeight,
    nodeWidth = 200,
    nodeHeight = 100,
    padding = 100
  } = options;

  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;
  const outerRadius = Math.min(viewportWidth, viewportHeight) / 2 - padding;
  const innerRadius = outerRadius * 0.4;

  // Alternate between outer and inner points
  const isOuter = index % 2 === 0;
  const radius = isOuter ? outerRadius : innerRadius;
  const pointIndex = Math.floor(index / 2);
  const totalPoints = Math.ceil(total / 2);

  // Start from top
  const angle = (pointIndex / totalPoints) * 2 * Math.PI - Math.PI / 2;

  const x = centerX + radius * Math.cos(angle) - nodeWidth / 2;
  const y = centerY + radius * Math.sin(angle) - nodeHeight / 2;

  return {
    x: Math.max(
      padding / 2,
      Math.min(viewportWidth - nodeWidth - padding / 2, x)
    ),
    y: Math.max(
      padding / 2,
      Math.min(viewportHeight - nodeHeight - padding / 2, y)
    )
  };
}

/**
 * Gets a frame layout function by name
 */
export function getFrameLayout(
  layoutType:
    | 'rectangular'
    | 'elliptical'
    | 'diamond'
    | 'spiral'
    | 'star' = 'elliptical'
) {
  switch (layoutType) {
    case 'rectangular':
      return rectangularFrameLayout;
    case 'diamond':
      return diamondFrameLayout;
    case 'spiral':
      return spiralFrameLayout;
    case 'star':
      return starFrameLayout;
    case 'elliptical':
    default:
      return ellipticalFrameLayout;
  }
}

/**
 * Auto-layout nodes in a frame pattern based on node count
 */
export function autoFrameLayout(
  nodes: any[],
  viewportWidth: number,
  viewportHeight: number,
  layoutType:
    | 'rectangular'
    | 'elliptical'
    | 'diamond'
    | 'spiral'
    | 'star' = 'elliptical'
): any[] {
  const layoutFn = getFrameLayout(layoutType);
  const layoutOptions: LayoutOptions = {
    viewportWidth,
    viewportHeight,
    nodeWidth: 220,
    nodeHeight: 120,
    padding: 100
  };

  return nodes.map((node, index) => ({
    ...node,
    position: layoutFn(index, nodes.length, layoutOptions)
  }));
}
