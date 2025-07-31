/**
 * Smooth Node Wrapper with Professional Interactions
 * Epic 8.1: Task 4 - Cinema 4D quality node animations and hover states
 *
 * Wraps React Flow nodes with professional smooth animations
 */
import React from 'react';
import { NodeProps } from 'reactflow';
import '../../styles/smoothAnimations.css';

}
export interface SmoothNodeWrapperProps extends NodeProps {
    children: React.ReactNode;
    nodeType?: string;
    isSelected?: boolean;
    isConnectable?: boolean;
    onNodeClick?: (nodeId: string) => void;
    onNodeDoubleClick?: (nodeId: string) => void;
    onNodeDelete?: (nodeId: string) => void;

export declare const SmoothNodeWrapper: React.FC<SmoothNodeWrapperProps>;
/**
 * Enhanced node creation animation component
 */

}
export interface NodeCreationAnimatorProps {
    children: React.ReactNode;
    isCreating: boolean;
    onAnimationComplete?: () => void;

export declare const NodeCreationAnimator: React.FC<NodeCreationAnimatorProps>;
export default SmoothNodeWrapper;
//# sourceMappingURL=SmoothNodeWrapper.d.ts.map
}