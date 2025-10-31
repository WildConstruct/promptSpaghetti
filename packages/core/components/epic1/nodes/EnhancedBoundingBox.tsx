import React, { type FC } from 'react';
import type { Position } from 'reactflow';
import { EnhancedBoundingBox as EnhancedBoundingBoxRefactored } from './EnhancedBoundingBox/index';
import type { Epic1NodeProps } from './nodePropTypes';

export interface Port {
  id: string;
  label: string;
  type: 'string' | 'number' | 'choice' | 'any';
  direction: 'input' | 'output';
  nodeId: string;
  position: Position;
  color?: string;
}

export interface EnhancedBoundingBoxData {
  title: string;
  description?: string;
  backgroundColor: string;
  opacity: number;
  borderColor: string;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderWidth: number;
  locked: boolean;
  width?: number;
  height?: number;
  isCollapsed?: boolean;
  ports?: Port[];
  autoLayout?: boolean;
  collapsedNodeIds?: string[];
  collapsedNodeTypes?: string[];
}

export type EnhancedBoundingBoxProps =
  Epic1NodeProps<EnhancedBoundingBoxData>;

export const EnhancedBoundingBox: FC<EnhancedBoundingBoxProps> = props => (
  <EnhancedBoundingBoxRefactored {...props} />
);

EnhancedBoundingBox.displayName = 'EnhancedBoundingBox';

export default EnhancedBoundingBox;
