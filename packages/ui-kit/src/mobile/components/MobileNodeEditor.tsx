/**
 * Mobile-optimized node editor layout
 */

import React, { useState } from 'react';
import { GraphNode } from '@prompt-spaghetti/graph-core';
import { TOUCH_TARGETS, mobileStyles, MOBILE_SPACING } from '../design-system';
import { MobileHeader } from './MobileNavigation';
import { MobileButton } from './MobileButton';
import { MobileInput, MobileTextArea } from './MobileInput';
import { cn } from '../../utils';
import { CollapsiblePanel } from '../../responsive/containers';

export interface MobileNodeEditorProps {
  node: GraphNode | null;
  onUpdate?: (nodeId: string, updates: Partial<GraphNode>) => void;
  onDelete?: (nodeId: string) => void;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const MobileNodeEditor: React.FC<MobileNodeEditorProps> = ({
  node,
  onUpdate,
  onDelete,
  onClose,
  className,
  style
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'connections'>('properties');
  
  if (!node) {
    return (
      <div className="mobile-node-editor-empty" style={{ padding: MOBILE_SPACING.lg }}>
        <p>Select a node to edit</p>
      </div>
    );
  }
  
  const handlePropertyChange = (property: string, value: any) => {
    onUpdate?.(node.id, { 
      data: { 
        ...node.data, 
        [property]: value 
      } 
    });
  };
  
  const handleDelete = () => {
    if (window.confirm('Delete this node?')) {
      onDelete?.(node.id);
      onClose?.();
    }
  };
  
  return (
    <div
      className={cn('mobile-node-editor', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--color-background)',
        ...style
      }}
    >
      {/* Header */}
      <MobileHeader
        title={`Edit ${node.type} Node`}
        leftAction={{
          icon: '←',
          onClick: onClose || (() => {}),
          label: 'Back'
        }}
        rightActions={[
          {
            icon: '🗑️',
            onClick: handleDelete,
            label: 'Delete node'
          }
        ]}
      />
      
      {/* Tab Navigation */}
      <div
        className="mobile-editor-tabs"
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)'
        }}
      >
        <button
          className={cn('tab', activeTab === 'properties' && 'active')}
          onClick={() => setActiveTab('properties')}
          style={{
            flex: 1,
            padding: MOBILE_SPACING.md,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'properties' ? '2px solid var(--color-primary)' : 'none',
            color: activeTab === 'properties' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === 'properties' ? 500 : 400,
            cursor: 'pointer',
            ...mobileStyles.tapHighlight
          }}
        >
          Properties
        </button>
        <button
          className={cn('tab', activeTab === 'connections' && 'active')}
          onClick={() => setActiveTab('connections')}
          style={{
            flex: 1,
            padding: MOBILE_SPACING.md,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'connections' ? '2px solid var(--color-primary)' : 'none',
            color: activeTab === 'connections' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === 'connections' ? 500 : 400,
            cursor: 'pointer',
            ...mobileStyles.tapHighlight
          }}
        >
          Connections
        </button>
      </div>
      
      {/* Content */}
      <div
        className="mobile-editor-content"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: MOBILE_SPACING.md,
          ...mobileStyles.smoothScroll
        }}
      >
        {activeTab === 'properties' && (
          <div className="properties-tab">
            {/* Node ID */}
            <div className="form-group" style={{ marginBottom: MOBILE_SPACING.lg }}>
              <label style={{ 
                display: 'block', 
                marginBottom: MOBILE_SPACING.xs,
                fontSize: 14,
                color: 'var(--color-text-secondary)'
              }}>
                Node ID
              </label>
              <div style={{ 
                padding: MOBILE_SPACING.sm,
                backgroundColor: 'var(--color-surface)',
                borderRadius: 8,
                fontSize: 12,
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                {node.id}
              </div>
            </div>
            
            {/* Node-specific properties */}
            {renderNodeProperties(node, handlePropertyChange)}
          </div>
        )}
        
        {activeTab === 'connections' && (
          <div className="connections-tab">
            <CollapsiblePanel title="Incoming Connections" defaultOpen>
              {node.data.inputs?.length ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {node.data.inputs.map((input: string, index: number) => (
                    <li 
                      key={index}
                      style={{
                        padding: MOBILE_SPACING.sm,
                        borderBottom: '1px solid var(--color-border)'
                      }}
                    >
                      {input}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                  No incoming connections
                </p>
              )}
            </CollapsiblePanel>
            
            <CollapsiblePanel title="Outgoing Connections" defaultOpen>
              {node.data.outputs?.length ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {node.data.outputs.map((output: string, index: number) => (
                    <li 
                      key={index}
                      style={{
                        padding: MOBILE_SPACING.sm,
                        borderBottom: '1px solid var(--color-border)'
                      }}
                    >
                      {output}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                  No outgoing connections
                </p>
              )}
            </CollapsiblePanel>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div
        className="mobile-editor-actions"
        style={{
          padding: MOBILE_SPACING.md,
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          gap: MOBILE_SPACING.sm
        }}
      >
        <MobileButton
          variant="secondary"
          onClick={onClose}
          style={{ flex: 1 }}
        >
          Cancel
        </MobileButton>
        <MobileButton
          variant="primary"
          onClick={onClose}
          style={{ flex: 1 }}
        >
          Done
        </MobileButton>
      </div>
    </div>
  );
};

/**
 * Render node-specific property editors
 */
function renderNodeProperties(node: GraphNode, onChange: (property: string, value: any) => void) {
  const commonFieldStyle = { marginBottom: MOBILE_SPACING.lg };
  
  switch (node.type) {
  case 'subject':
  case 'action':
  case 'attribute':
    return (
      <>
        <div style={commonFieldStyle}>
          <label style={{ 
            display: 'block', 
            marginBottom: MOBILE_SPACING.xs,
            fontSize: 14,
            color: 'var(--color-text-secondary)'
          }}>
              Variations
          </label>
          <MobileTextArea
            value={node.data.variations?.join('\n') || ''}
            onChange={(e) => {
              const variations = e.target.value.split('\n').filter(Boolean);
              onChange('variations', variations);
            }}
            placeholder="Enter variations (one per line)"
            minRows={3}
            maxRows={8}
          />
        </div>
      </>
    );
      
  case 'weightedChoice':
    return (
      <>
        <div style={commonFieldStyle}>
          <label style={{ 
            display: 'block', 
            marginBottom: MOBILE_SPACING.xs,
            fontSize: 14,
            color: 'var(--color-text-secondary)'
          }}>
              Weighted Options
          </label>
          <MobileTextArea
            value={formatWeightedOptions(node.data.options || [])}
            onChange={(e) => {
              const options = parseWeightedOptions(e.target.value);
              onChange('options', options);
            }}
            placeholder="text:weight (e.g., option1:50)"
            minRows={4}
          />
          <div style={{ 
            fontSize: 12, 
            color: 'var(--color-text-secondary)',
            marginTop: MOBILE_SPACING.xs 
          }}>
              Format: text:weight (one per line)
          </div>
        </div>
      </>
    );
      
  case 'output':
    return (
      <>
        <div style={commonFieldStyle}>
          <label style={{ 
            display: 'block', 
            marginBottom: MOBILE_SPACING.xs,
            fontSize: 14,
            color: 'var(--color-text-secondary)'
          }}>
              Template
          </label>
          <MobileTextArea
            value={node.data.template || ''}
            onChange={(e) => onChange('template', e.target.value)}
            placeholder="Enter output template with {{variables}}"
            minRows={4}
          />
        </div>
      </>
    );
      
  default:
    return (
      <div style={{ color: 'var(--color-text-secondary)' }}>
          No editable properties for this node type
      </div>
    );
  }
}

function formatWeightedOptions(options: Array<{ text: string; weight: number }>): string {
  return options.map(opt => `${opt.text}:${opt.weight}`).join('\n');
}

function parseWeightedOptions(text: string): Array<{ text: string; weight: number }> {
  return text
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const [text, weightStr] = line.split(':');
      return {
        text: text.trim(),
        weight: parseInt(weightStr) || 1
      };
    });
}