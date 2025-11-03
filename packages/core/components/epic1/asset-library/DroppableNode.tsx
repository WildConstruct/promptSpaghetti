/**
 * DroppableNode - Higher-order component that makes React Flow nodes accept preset drops
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDrop } from 'react-dnd';
import { NodeProps } from 'reactflow';
import type { EditableNodeData } from '../nodes';
import {
  DraggedPreset,
  Preset,
  isTextBlockPreset,
  isWeightedChoicePreset,
  isConcatPreset,
  isVariablePreset,
  isOutputPreset
} from './types';
import { applyPresetToNode } from './presetUtils';
import './DroppableNode.css';

export interface DroppableNodeProps {
  onPresetDrop?: (nodeId: string, preset: Preset) => void;
  autoEditOnDrop?: boolean;
}

type DroppableNodeData = EditableNodeData & {
  isDropTarget?: boolean;
  dropHighlight?: boolean;
  justDropped?: boolean;
};

/**
 * Makes a React Flow node component accept preset drops
 */
export function withDroppableNode<T extends NodeProps<DroppableNodeData>>(
  NodeComponent: React.ComponentType<T>,
  options: DroppableNodeProps = {}
) {
  const DroppableComponent: React.FC<T> = props => {
    const { id, data, type } = props;
    const [dropHighlight, setDropHighlight] = useState(false);
    const [justDropped, setJustDropped] = useState(false);
    const autoEdit = options.autoEditOnDrop !== false;
    const presetDropHandler = options.onPresetDrop;

    const handleDrop = useCallback((item: DraggedPreset) => {
      const { preset } = item;
      
      // Check if preset is compatible with node type
      if (!isPresetCompatible(preset, type || '')) {
        console.warn(`Preset type ${preset.nodeType} is not compatible with node type ${type}`);
        return;
      }

      // Apply preset to node
      const newData = applyPresetToNode(data, preset, type || '');
      
      // Auto-enter edit mode if enabled
      if (autoEdit) {
        newData.isEditing = true;
      }

      // Notify parent about the drop
      if (presetDropHandler) {
        presetDropHandler(id, preset);
      }

      // Trigger drop animation
      setJustDropped(true);
      setTimeout(() => setJustDropped(false), 600);

      // Update node data through React Flow's onChange
      if (data.onEdit) {
        if (isTextBlockPreset(preset) && preset.value.text) {
          data.onEdit(preset.value.text);
        } else if (isWeightedChoicePreset(preset) && preset.value.options) {
          data.onEdit(JSON.stringify(preset.value.options));
        } else if (isConcatPreset(preset) && preset.value.separator !== undefined) {
          data.onEdit(preset.value.separator);
        } else if (isVariablePreset(preset) && preset.value.variableName) {
          data.onEdit(preset.value.variableName);
        } else if (isOutputPreset(preset) && preset.value.label) {
          data.onEdit(preset.value.label);
        }
      }
    }, [autoEdit, data, id, presetDropHandler, type]);

    const [{ isOver, canDrop }, drop] = useDrop(() => ({
      accept: 'preset',
      drop: handleDrop,
      canDrop: (item: DraggedPreset) => isPresetCompatible(item.preset, type || ''),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
      })
    }), [handleDrop, type]);

    // Update highlight state
    useEffect(() => {
      setDropHighlight(isOver && canDrop);
    }, [isOver, canDrop]);

    // Create enhanced props
    const enhancedData = useMemo(
      () => ({
        ...data,
        isDropTarget: true,
        dropHighlight,
        justDropped
      }),
      [data, dropHighlight, justDropped]
    );

    const enhancedProps: T = {
      ...props,
      data: enhancedData
    };

    return (
      <div 
        ref={drop} 
        className={`droppable-node-wrapper ${dropHighlight ? 'drop-highlight' : ''} ${justDropped ? 'just-dropped' : ''}`}
      >
        <NodeComponent {...enhancedProps} />
        {dropHighlight && (
          <div className="drop-indicator">
            <span>Drop to apply preset</span>
          </div>
        )}
      </div>
    );
  };

  return React.memo(DroppableComponent);
}

/**
 * Check if a preset is compatible with a node type
 */
function isPresetCompatible(preset: Preset, nodeType: string): boolean {
  // Direct type match
  if (preset.nodeType === nodeType) {
    return true;
  }

  // Variable nodes can accept set/get variable presets
  if (nodeType === 'variable' && (preset.nodeType === 'setVariable' || preset.nodeType === 'getVariable')) {
    return true;
  }
  if ((nodeType === 'setVariable' || nodeType === 'getVariable') && preset.nodeType === 'variable') {
    return true;
  }

  return false;
}
