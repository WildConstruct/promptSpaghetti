import type { Node, NodeProps } from 'reactflow';

export interface NodeMeasurements {
  width?: number | null;
  height?: number | null;
}

export type Epic1Node<T = any> = Node<T> & {
  measured?: NodeMeasurements | null;
};

export type Epic1NodeProps<T = any> = NodeProps<T> &
  Partial<Pick<Node<T>, 'width' | 'height' | 'draggable'>> & {
    measured?: NodeMeasurements | null;
  };

export const hasMeasuredDimensions = <T>(
  node: Node<T>
): node is Epic1Node<T> => {
  const candidate = node as Partial<Epic1Node<T>>;
  return typeof candidate.measured === 'object' && candidate.measured !== null;
};

export const resolveNodeDimensions = <T>(
  node: Node<T>,
  fallback: Required<NodeMeasurements>
): Required<NodeMeasurements> => {
  const measured = hasMeasuredDimensions(node) ? node.measured : null;

  return {
    width: node.width ?? measured?.width ?? fallback.width,
    height: node.height ?? measured?.height ?? fallback.height
  };
};
