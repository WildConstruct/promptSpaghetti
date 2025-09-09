// Node Replacement Modal with Connection Preservation
// Story 2.5a: Asset Browser Integration MVP

import React, { useState, useEffect } from 'react';
import './NodeReplacementModal.css';

export interface ReplacementInfo {
  targetNode: {
    id: string;
    type: string;
    label: string;
  };
  newAsset: {
    id: string;
    name: string;
    type: string;
  };
  connectionImpact: {
    preserved: number;
    lost: number;
    incompatible: string[];
  };
}

interface NodeReplacementModalProps {
  info: ReplacementInfo;
  onReplace: () => void;
  onCancel: () => void;
  isVisible: boolean;
  advancedActions?: {
    onMergeChoices?: () => void;
    onCreateVariant?: () => void;
    onSmartSwap?: () => void;
    onReplaceAllSimilar?: () => void;
    onReplaceAllSelected?: () => void;
  };
}

export const NodeReplacementModal: React.FC<NodeReplacementModalProps> = ({
  info,
  onReplace,
  onCancel,
  isVisible,
  advancedActions
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    }
  }, [isVisible]);

  if (!isVisible && !isAnimating) return null;

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onCancel, 300);
  };

  const handleReplace = () => {
    setIsAnimating(false);
    setTimeout(onReplace, 300);
  };

  const hasConnectionLoss = info.connectionImpact.lost > 0;
  const allConnectionsPreserved =
    info.connectionImpact.lost === 0 && info.connectionImpact.preserved > 0;

  return (
    <>
      <div
        className={`modal-backdrop ${isAnimating ? 'visible' : ''}`}
        onClick={handleClose}
      />
      <div className={`node-replacement-modal ${isAnimating ? 'visible' : ''}`}>
        <div className="modal-header">
          <h3>Replace Node</h3>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="replacement-summary">
            <div className="node-info current">
              <span className="node-label">Current:</span>
              <span className="node-type">{info.targetNode.type}</span>
              <span className="node-name">{info.targetNode.label}</span>
            </div>
            <div className="replacement-arrow">→</div>
            <div className="node-info new">
              <span className="node-label">New:</span>
              <span className="node-type">{info.newAsset.type}</span>
              <span className="node-name">{info.newAsset.name}</span>
            </div>
          </div>

          <div className="connection-impact">
            <h4>Connection Impact</h4>

            {allConnectionsPreserved && (
              <div className="impact-item success">
                <span className="impact-icon">✓</span>
                <span>
                  All {info.connectionImpact.preserved} connections will be
                  preserved
                </span>
              </div>
            )}

            {info.connectionImpact.preserved > 0 && hasConnectionLoss && (
              <div className="impact-item success">
                <span className="impact-icon">✓</span>
                <span>
                  {info.connectionImpact.preserved} connections will be
                  preserved
                </span>
              </div>
            )}

            {hasConnectionLoss && (
              <div className="impact-item warning">
                <span className="impact-icon">⚠️</span>
                <span>
                  {info.connectionImpact.lost} connections will be lost
                </span>
                {info.connectionImpact.incompatible.length > 0 && (
                  <ul className="incompatible-list">
                    {info.connectionImpact.incompatible.map((conn, idx) => (
                      <li key={idx}>{conn}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {info.connectionImpact.preserved === 0 &&
              info.connectionImpact.lost === 0 && (
                <div className="impact-item info">
                  <span className="impact-icon">ℹ️</span>
                  <span>This node has no connections</span>
                </div>
              )}
          </div>

          <div className="modal-hint">
            <span className="hint-icon">💡</span>
            <span>Tip: You can undo this action with Ctrl+Z</span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-button cancel" onClick={handleClose}>
            Cancel
          </button>
          <button
            className={`modal-button replace ${hasConnectionLoss ? 'warning' : 'success'}`}
            onClick={handleReplace}
          >
            {hasConnectionLoss ? 'Replace Anyway' : 'Replace Node'}
          </button>
        </div>
        <div
          className="modal-advanced"
          style={{
            padding: '12px 16px',
            borderTop: '1px dashed rgba(255,255,255,0.15)',
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap'
          }}
        >
          {advancedActions?.onMergeChoices && (
            <button
              className="modal-button"
              onClick={advancedActions.onMergeChoices}
            >
              Merge Choices
            </button>
          )}
          {advancedActions?.onCreateVariant && (
            <button
              className="modal-button"
              onClick={advancedActions.onCreateVariant}
            >
              Create Variant
            </button>
          )}
          {advancedActions?.onSmartSwap && (
            <button
              className="modal-button"
              onClick={advancedActions.onSmartSwap}
            >
              Smart Swap
            </button>
          )}
          {advancedActions?.onReplaceAllSimilar && (
            <button
              className="modal-button"
              onClick={advancedActions.onReplaceAllSimilar}
            >
              Replace All Similar
            </button>
          )}
          {advancedActions?.onReplaceAllSelected && (
            <button
              className="modal-button"
              onClick={advancedActions.onReplaceAllSelected}
            >
              Replace All Selected
            </button>
          )}
        </div>
      </div>
    </>
  );
};

// Connection validator service
export class ConnectionValidator {
  static analyzeReplacementImpact(
    currentNode: any,
    newNodeType: string,
    edges: any[]
  ): ReplacementInfo['connectionImpact'] {
    const incomingEdges = edges.filter(e => e.target === currentNode.id);
    const outgoingEdges = edges.filter(e => e.source === currentNode.id);

    let preserved = 0;
    let lost = 0;
    const incompatible: string[] = [];

    // Check incoming connections
    incomingEdges.forEach(edge => {
      if (
        this.isCompatibleConnection(edge.sourceHandle, newNodeType, 'input')
      ) {
        preserved++;
      } else {
        lost++;
        incompatible.push(`Input from ${edge.source}`);
      }
    });

    // Check outgoing connections
    outgoingEdges.forEach(edge => {
      if (
        this.isCompatibleConnection(newNodeType, edge.targetHandle, 'output')
      ) {
        preserved++;
      } else {
        lost++;
        incompatible.push(`Output to ${edge.target}`);
      }
    });

    return { preserved, lost, incompatible };
  }

  private static isCompatibleConnection(
    sourceType: string,
    targetType: string,
    direction: 'input' | 'output'
  ): boolean {
    // Simple compatibility matrix for MVP
    const compatibilityMatrix: Record<string, string[]> = {
      WeightedChoice: ['TextBlock', 'Output', 'Concat', 'WeightedChoice'],
      TextBlock: ['Output', 'Concat', 'WeightedChoice'],
      Output: [],
      Concat: ['Output', 'Concat', 'WeightedChoice'],
      Variable: ['TextBlock', 'Output', 'Concat']
    };

    if (direction === 'output') {
      return compatibilityMatrix[sourceType]?.includes(targetType) || false;
    } else {
      return Object.entries(compatibilityMatrix).some(
        ([key, values]) => key === targetType && values.includes(sourceType)
      );
    }
  }
}
