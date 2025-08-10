/**
 * Smart Node Positioning System for Epic 1
 *
 * Implements intelligent node placement that minimizes overlaps,
 * creates natural flow, and groups related content together.
 */

import { GeneratedNode } from './PromptParser';
import { Epic1NodeType } from './nodeTypes';

/**
 * Position coordinates for a node
 */
export interface NodePosition {
  x: number;
  y: number;
}

/**
 * Node dimensions for layout calculations
 */
export interface NodeDimensions {
  width: number;
  height: number;
}

/**
 * Layout configuration options
 */
export interface LayoutConfig {
  horizontalSpacing: number;
  verticalSpacing: number;
  baseX: number;
  baseY: number;
  maxWidth: number;
  groupSpacing: number;
  flowDirection: 'horizontal' | 'vertical' | 'diagonal';
}

/**
 * Node group for related content
 */
interface NodeGroup {
  nodes: number[]; // indices into nodes array
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

/**
 * Smart node positioning calculator
 */
export class SmartNodePositioner {
  private readonly defaultConfig: LayoutConfig = {
    horizontalSpacing: 250,
    verticalSpacing: 120,
    baseX: 100,
    baseY: 100,
    maxWidth: 1200,
    groupSpacing: 50,
    flowDirection: 'diagonal'
  };

  private readonly nodeDimensions: Record<Epic1NodeType, NodeDimensions> = {
    [Epic1NodeType.TextBlock]: { width: 200, height: 80 },
    [Epic1NodeType.WeightedChoice]: { width: 240, height: 120 },
    [Epic1NodeType.Concat]: { width: 150, height: 60 },
    [Epic1NodeType.Variable]: { width: 180, height: 70 },
    [Epic1NodeType.Output]: { width: 120, height: 60 }
  };

  /**
   * Calculate smart positions for all nodes
   */
  calculatePositions(
    nodes: GeneratedNode[],
    config?: Partial<LayoutConfig>
  ): NodePosition[] {
    const finalConfig = { ...this.defaultConfig, ...config };

    // Identify node groups based on relationships
    const groups = this.identifyNodeGroups(nodes);

    // Calculate positions based on flow direction
    switch (finalConfig.flowDirection) {
      case 'horizontal':
        return this.layoutHorizontal(nodes, groups, finalConfig);
      case 'vertical':
        return this.layoutVertical(nodes, groups, finalConfig);
      case 'diagonal':
      default:
        return this.layoutDiagonal(nodes, groups, finalConfig);
    }
  }

  /**
   * Identify groups of related nodes
   */
  private identifyNodeGroups(nodes: GeneratedNode[]): NodeGroup[] {
    const groups: NodeGroup[] = [];
    const visited = new Set<number>();

    for (let i = 0; i < nodes.length; i++) {
      if (visited.has(i)) continue;

      const group: NodeGroup = {
        nodes: [i],
        bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 }
      };

      // Check if this node is related to others
      const node = nodes[i];

      // Group nodes that share source segments
      for (let j = i + 1; j < nodes.length; j++) {
        if (visited.has(j)) continue;

        const otherNode = nodes[j];
        if (this.areNodesRelated(node, otherNode)) {
          group.nodes.push(j);
          visited.add(j);
        }
      }

      // Group consecutive text blocks
      if (node.node.getType() === Epic1NodeType.TextBlock) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (visited.has(j)) continue;

          const otherNode = nodes[j];
          if (
            otherNode.node.getType() === Epic1NodeType.TextBlock &&
            j === i + 1
          ) {
            // Only consecutive blocks
            group.nodes.push(j);
            visited.add(j);
          } else {
            break; // Stop at first non-text block
          }
        }
      }

      visited.add(i);
      groups.push(group);
    }

    return groups;
  }

  /**
   * Check if two nodes are related
   */
  private areNodesRelated(node1: GeneratedNode, node2: GeneratedNode): boolean {
    // Check if they share source segments
    const segments1 = new Set(node1.sourceSegments);
    const segments2 = new Set(node2.sourceSegments);

    for (const seg of segments1) {
      if (segments2.has(seg)) return true;
    }

    // Check if one is a concat node between others
    if (
      node1.node.getType() === Epic1NodeType.Concat ||
      node2.node.getType() === Epic1NodeType.Concat
    ) {
      return true;
    }

    return false;
  }

  /**
   * Layout nodes horizontally (left to right flow)
   */
  private layoutHorizontal(
    nodes: GeneratedNode[],
    groups: NodeGroup[],
    config: LayoutConfig
  ): NodePosition[] {
    const positions: NodePosition[] = [];
    let currentX = config.baseX;
    let currentY = config.baseY;
    let rowHeight = 0;

    for (const group of groups) {
      const groupPositions = this.layoutGroup(
        group,
        nodes,
        currentX,
        currentY,
        config,
        'horizontal'
      );

      // Update positions array
      for (let i = 0; i < group.nodes.length; i++) {
        positions[group.nodes[i]] = groupPositions[i];
      }

      // Calculate group bounds
      const groupWidth = this.calculateGroupWidth(group, nodes);
      const groupHeight = this.calculateGroupHeight(group, nodes);

      // Update position for next group
      currentX += groupWidth + config.groupSpacing;
      rowHeight = Math.max(rowHeight, groupHeight);

      // Wrap to next row if needed
      if (currentX > config.maxWidth) {
        currentX = config.baseX;
        currentY += rowHeight + config.verticalSpacing;
        rowHeight = 0;
      }
    }

    return positions;
  }

  /**
   * Layout nodes vertically (top to bottom flow)
   */
  private layoutVertical(
    nodes: GeneratedNode[],
    groups: NodeGroup[],
    config: LayoutConfig
  ): NodePosition[] {
    const positions: NodePosition[] = [];
    let currentX = config.baseX;
    let currentY = config.baseY;

    for (const group of groups) {
      const groupPositions = this.layoutGroup(
        group,
        nodes,
        currentX,
        currentY,
        config,
        'vertical'
      );

      // Update positions array
      for (let i = 0; i < group.nodes.length; i++) {
        positions[group.nodes[i]] = groupPositions[i];
      }

      // Calculate group height
      const groupHeight = this.calculateGroupHeight(group, nodes);

      // Update position for next group
      currentY += groupHeight + config.groupSpacing;
    }

    return positions;
  }

  /**
   * Layout nodes diagonally (natural reading flow)
   */
  private layoutDiagonal(
    nodes: GeneratedNode[],
    groups: NodeGroup[],
    config: LayoutConfig
  ): NodePosition[] {
    const positions: NodePosition[] = [];
    let currentX = config.baseX;
    let currentY = config.baseY;
    let diagonalOffset = 0;

    for (let g = 0; g < groups.length; g++) {
      const group = groups[g];
      const groupPositions = this.layoutGroup(
        group,
        nodes,
        currentX,
        currentY,
        config,
        'diagonal'
      );

      // Update positions array
      for (let i = 0; i < group.nodes.length; i++) {
        positions[group.nodes[i]] = groupPositions[i];
      }

      // Calculate next position with diagonal offset
      const groupWidth = this.calculateGroupWidth(group, nodes);
      const groupHeight = this.calculateGroupHeight(group, nodes);

      // Create a flowing diagonal pattern
      if (g % 2 === 0) {
        // Even groups: move right and slightly down
        currentX += groupWidth + config.horizontalSpacing;
        currentY += 30; // Slight vertical offset
      } else {
        // Odd groups: move down and slightly right
        currentX += 50; // Slight horizontal offset
        currentY += groupHeight + config.verticalSpacing;
      }

      // Wrap if we go too far right
      if (currentX > config.maxWidth) {
        currentX = config.baseX + diagonalOffset * 100;
        currentY += config.verticalSpacing * 2;
        diagonalOffset = (diagonalOffset + 1) % 3;
      }
    }

    // Special handling for output node (last node)
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      if (lastNode.node.getType() === Epic1NodeType.Output) {
        // Position output node at the bottom right
        const maxX = Math.max(...positions.map(p => p.x));
        const maxY = Math.max(...positions.map(p => p.y));

        positions[nodes.length - 1] = {
          x: maxX + config.horizontalSpacing,
          y: maxY + config.verticalSpacing
        };
      }
    }

    return positions;
  }

  /**
   * Layout nodes within a group
   */
  private layoutGroup(
    group: NodeGroup,
    nodes: GeneratedNode[],
    startX: number,
    startY: number,
    config: LayoutConfig,
    direction: 'horizontal' | 'vertical' | 'diagonal'
  ): NodePosition[] {
    const positions: NodePosition[] = [];
    let currentX = startX;
    let currentY = startY;

    for (let i = 0; i < group.nodes.length; i++) {
      const nodeIndex = group.nodes[i];
      const node = nodes[nodeIndex];
      const nodeType = node.node.getType();
      const dimensions = this.nodeDimensions[nodeType];

      // Position this node
      positions.push({ x: currentX, y: currentY });

      // Update position for next node in group
      switch (direction) {
        case 'horizontal':
          currentX += dimensions.width + config.horizontalSpacing * 0.7;
          break;
        case 'vertical':
          currentY += dimensions.height + config.verticalSpacing * 0.7;
          break;
        case 'diagonal':
          // Stagger nodes in a group
          if (i % 2 === 0) {
            currentX += dimensions.width + config.horizontalSpacing * 0.5;
          } else {
            currentY += dimensions.height + config.verticalSpacing * 0.5;
          }
          break;
      }
    }

    return positions;
  }

  /**
   * Calculate total width of a group
   */
  private calculateGroupWidth(
    group: NodeGroup,
    nodes: GeneratedNode[]
  ): number {
    let totalWidth = 0;

    for (const nodeIndex of group.nodes) {
      const node = nodes[nodeIndex];
      const dimensions = this.nodeDimensions[node.node.getType()];
      totalWidth = Math.max(totalWidth, dimensions.width);
    }

    return totalWidth;
  }

  /**
   * Calculate total height of a group
   */
  private calculateGroupHeight(
    group: NodeGroup,
    nodes: GeneratedNode[]
  ): number {
    let totalHeight = 0;

    for (const nodeIndex of group.nodes) {
      const node = nodes[nodeIndex];
      const dimensions = this.nodeDimensions[node.node.getType()];
      totalHeight = Math.max(totalHeight, dimensions.height);
    }

    return totalHeight;
  }

  /**
   * Optimize positions to minimize overlaps
   */
  optimizePositions(
    positions: NodePosition[],
    nodes: GeneratedNode[],
    iterations: number = 10
  ): NodePosition[] {
    const optimized = [...positions];

    for (let iter = 0; iter < iterations; iter++) {
      let hasOverlap = false;

      // Check all pairs for overlaps
      for (let i = 0; i < optimized.length; i++) {
        for (let j = i + 1; j < optimized.length; j++) {
          const node1 = nodes[i];
          const node2 = nodes[j];
          const pos1 = optimized[i];
          const pos2 = optimized[j];
          const dim1 = this.nodeDimensions[node1.node.getType()];
          const dim2 = this.nodeDimensions[node2.node.getType()];

          // Check for overlap
          if (this.doNodesOverlap(pos1, dim1, pos2, dim2)) {
            hasOverlap = true;

            // Resolve overlap by moving the second node
            const overlap = this.calculateOverlap(pos1, dim1, pos2, dim2);

            // Move in the direction of least overlap
            if (overlap.horizontal < overlap.vertical) {
              // Move horizontally
              optimized[j].x += overlap.horizontal * 1.1;
            } else {
              // Move vertically
              optimized[j].y += overlap.vertical * 1.1;
            }
          }
        }
      }

      // If no overlaps found, we're done
      if (!hasOverlap) break;
    }

    return optimized;
  }

  /**
   * Check if two nodes overlap
   */
  private doNodesOverlap(
    pos1: NodePosition,
    dim1: NodeDimensions,
    pos2: NodePosition,
    dim2: NodeDimensions
  ): boolean {
    const buffer = 20; // Small buffer between nodes

    return !(
      pos1.x + dim1.width + buffer < pos2.x ||
      pos2.x + dim2.width + buffer < pos1.x ||
      pos1.y + dim1.height + buffer < pos2.y ||
      pos2.y + dim2.height + buffer < pos1.y
    );
  }

  /**
   * Calculate overlap amount
   */
  private calculateOverlap(
    pos1: NodePosition,
    dim1: NodeDimensions,
    pos2: NodePosition,
    dim2: NodeDimensions
  ): { horizontal: number; vertical: number } {
    const horizontalOverlap = Math.min(
      pos1.x + dim1.width - pos2.x,
      pos2.x + dim2.width - pos1.x
    );

    const verticalOverlap = Math.min(
      pos1.y + dim1.height - pos2.y,
      pos2.y + dim2.height - pos1.y
    );

    return {
      horizontal: horizontalOverlap,
      vertical: verticalOverlap
    };
  }
}

// Export singleton instance
export const smartNodePositioner = new SmartNodePositioner();
