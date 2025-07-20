/**
 * Inspector Panel component for editing node properties
 */

import React, { useState, useMemo } from 'react';
import { InspectorPanelProps } from '../types';
import { useTheme, useResponsive } from '../hooks';
import { Button } from './Button';
import { Input, TextArea } from './Input';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Stack } from './Layout';
import { cn } from '../utils';

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedNode,
  onNodeUpdate,
  onNodeDelete,
  collapsed = false,
  position = 'right',
  className,
  style,
  testId,
  ...props
}) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const [internalCollapsed, setInternalCollapsed] = useState(collapsed);

  // Get node editor component based on node type
  const nodeEditor = useMemo(() => {
    if (!selectedNode) return null;

    switch (selectedNode.type) {
    case 'WeightedChoice':
      return <WeightedChoiceEditor node={selectedNode} onUpdate={onNodeUpdate} />;
    case 'Concat':
      return <ConcatEditor node={selectedNode} onUpdate={onNodeUpdate} />;
    case 'Output':
      return <OutputEditor node={selectedNode} onUpdate={onNodeUpdate} />;
    case 'Include':
      return <IncludeEditor node={selectedNode} onUpdate={onNodeUpdate} />;
    case 'SetVariable':
      return <SetVariableEditor node={selectedNode} onUpdate={onNodeUpdate} />;
    case 'GetVariable':
      return <GetVariableEditor node={selectedNode} onUpdate={onNodeUpdate} />;
    case 'WeightedAdvanced':
      return <WeightedAdvancedEditor node={selectedNode} onUpdate={onNodeUpdate} />;
    case 'Conditional':
      return <ConditionalEditor node={selectedNode} onUpdate={onNodeUpdate} />;
    case 'Sequential':
      return <SequentialEditor node={selectedNode} onUpdate={onNodeUpdate} />;
    case 'Markov':
      return <MarkovEditor node={selectedNode} onUpdate={onNodeUpdate} />;
    default:
      return <GenericEditor node={selectedNode} onUpdate={onNodeUpdate} />;
    }
  }, [selectedNode, onNodeUpdate]);

  const getPanelStyles = () => {
    const baseStyles = {
      width: position === 'bottom' ? '100%' : '320px',
      height: position === 'bottom' ? '300px' : '100%',
      backgroundColor: theme.colors.surface,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: `${theme.borderRadius}px`,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const,
      ...style
    };

    if (isMobile) {
      return {
        ...baseStyles,
        width: '100%',
        height: internalCollapsed ? '48px' : '50vh',
        position: 'fixed' as const,
        bottom: 0,
        left: 0,
        right: 0,
        borderRadius: internalCollapsed ? 0 : `${theme.borderRadius}px ${theme.borderRadius}px 0 0`,
        zIndex: 100
      };
    }

    return baseStyles;
  };

  const panelStyles = getPanelStyles();

  if (internalCollapsed) {
    return (
      <div
        className={cn('ui-inspector-panel ui-inspector-panel--collapsed', className)}
        style={panelStyles}
        data-testid={testId}
        {...props}
      >
        <div style={{
          padding: `${theme.spacing.sm}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: !isMobile ? `1px solid ${theme.colors.border}` : 'none'
        }}>
          <span style={{
            fontSize: `${theme.typography.fontSize.sm}px`,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text
          }}>
            Inspector
          </span>
          
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setInternalCollapsed(false)}
            aria-label="Expand inspector panel"
          >
            {position === 'bottom' || isMobile ? '🔼' : '▶️'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('ui-inspector-panel', className)}
      style={panelStyles}
      data-testid={testId}
      {...props}
    >
      {/* Header */}
      <div
        className="ui-inspector-panel-header"
        style={{
          padding: `${theme.spacing.md}px`,
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.background,
          flexShrink: 0
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: `${theme.typography.fontSize.md}px`,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text
          }}>
            Inspector
          </h3>
          
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setInternalCollapsed(true)}
            aria-label="Collapse inspector panel"
          >
            {position === 'bottom' || isMobile ? '🔽' : '◀️'}
          </Button>
        </div>
        
        {selectedNode && (
          <div style={{
            marginTop: `${theme.spacing.xs}px`,
            fontSize: `${theme.typography.fontSize.sm}px`,
            color: theme.colors.textSecondary
          }}>
            {selectedNode.type} Node
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="ui-inspector-panel-content"
        style={{
          flex: 1,
          overflow: 'auto',
          padding: `${theme.spacing.md}px`
        }}
      >
        {selectedNode ? (
          <Stack spacing="md">
            {/* Node basic info */}
            <Card variant="outlined" padding="sm">
              <Stack spacing="sm">
                <Input
                  label="Node ID"
                  value={selectedNode.id}
                  readOnly
                  size="sm"
                />
                
                <Input
                  label="Node Type"
                  value={selectedNode.type}
                  readOnly
                  size="sm"
                />
              </Stack>
            </Card>

            {/* Node-specific editor */}
            {nodeEditor}

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: `${theme.spacing.sm}px`,
              justifyContent: 'flex-end'
            }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNodeDelete?.(selectedNode.id)}
              >
                Delete Node
              </Button>
            </div>
          </Stack>
        ) : (
          <div style={{
            padding: `${theme.spacing.xl}px`,
            textAlign: 'center',
            color: theme.colors.textSecondary
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: `${theme.spacing.md}px`
            }}>
              🎯
            </div>
            <div style={{
              fontSize: `${theme.typography.fontSize.md}px`,
              marginBottom: `${theme.spacing.sm}px`
            }}>
              No Node Selected
            </div>
            <div style={{
              fontSize: `${theme.typography.fontSize.sm}px`
            }}>
              Select a node to edit its properties
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Individual node editors
import { GraphNode } from '@prompt-spaghetti/graph-core';

interface NodeEditorProps {
  node: GraphNode;
  onUpdate?: (nodeId: string, updates: Partial<GraphNode>) => void;
}

const WeightedChoiceEditor: React.FC<NodeEditorProps> = ({ node, onUpdate }) => {
  const choices = node.data.choices || [];
  
  const updateChoices = (newChoices: any[]) => {
    onUpdate?.(node.id, {
      data: { ...node.data, choices: newChoices }
    });
  };

  const addChoice = () => {
    updateChoices([...choices, { value: '', weight: 1 }]);
  };

  const removeChoice = (index: number) => {
    updateChoices(choices.filter((_, i) => i !== index));
  };

  const updateChoice = (index: number, field: 'value' | 'weight', value: any) => {
    const newChoices = [...choices];
    newChoices[index] = { ...newChoices[index], [field]: value };
    updateChoices(newChoices);
  };

  return (
    <Card variant="outlined" padding="sm">
      <CardHeader>
        <CardTitle level={4}>Weighted Choices</CardTitle>
      </CardHeader>
      <CardContent>
        <Stack spacing="sm">
          {choices.map((choice: any, index: number) => (
            <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'end' }}>
              <Input
                label={`Choice ${index + 1}`}
                value={choice.value}
                onChange={(value) => updateChoice(index, 'value', value)}
                size="sm"
                style={{ flex: 1 }}
              />
              <Input
                label="Weight"
                type="number"
                value={choice.weight}
                onChange={(value) => updateChoice(index, 'weight', parseFloat(value) || 0)}
                size="sm"
                style={{ width: '80px' }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeChoice(index)}
              >
                ❌
              </Button>
            </div>
          ))}
          
          <Button variant="outline" size="sm" onClick={addChoice}>
            Add Choice
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

const ConcatEditor: React.FC<NodeEditorProps> = ({ node, onUpdate }) => {
  return (
    <Card variant="outlined" padding="sm">
      <CardHeader>
        <CardTitle level={4}>Concatenation</CardTitle>
      </CardHeader>
      <CardContent>
        <TextArea
          label="Template"
          value={node.data.template || ''}
          onChange={(value) => onUpdate?.(node.id, {
            data: { ...node.data, template: value }
          })}
          rows={4}
          hint="Use {{nodeId}} to reference other nodes"
        />
      </CardContent>
    </Card>
  );
};

const OutputEditor: React.FC<NodeEditorProps> = ({ node, onUpdate }) => {
  return (
    <Card variant="outlined" padding="sm">
      <CardHeader>
        <CardTitle level={4}>Output</CardTitle>
      </CardHeader>
      <CardContent>
        <TextArea
          label="Text"
          value={node.data.text || ''}
          onChange={(value) => onUpdate?.(node.id, {
            data: { ...node.data, text: value }
          })}
          rows={4}
          hint="Use {{nodeId}} to reference other nodes"
        />
      </CardContent>
    </Card>
  );
};

const IncludeEditor: React.FC<NodeEditorProps> = ({ node, onUpdate }) => {
  return (
    <Card variant="outlined" padding="sm">
      <CardHeader>
        <CardTitle level={4}>Include Reference</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          label="Reference Name"
          value={node.data.name || ''}
          onChange={(value) => onUpdate?.(node.id, {
            data: { ...node.data, name: value }
          })}
          size="sm"
          hint="Name of the content to include"
        />
      </CardContent>
    </Card>
  );
};

const SetVariableEditor: React.FC<NodeEditorProps> = ({ node, onUpdate }) => {
  return (
    <Card variant="outlined" padding="sm">
      <CardHeader>
        <CardTitle level={4}>Set Variable</CardTitle>
      </CardHeader>
      <CardContent>
        <Stack spacing="sm">
          <Input
            label="Variable Key"
            value={node.data.key || ''}
            onChange={(value) => onUpdate?.(node.id, {
              data: { ...node.data, key: value }
            })}
            size="sm"
          />
          <Input
            label="Value"
            value={node.data.value || ''}
            onChange={(value) => onUpdate?.(node.id, {
              data: { ...node.data, value: value }
            })}
            size="sm"
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

const GetVariableEditor: React.FC<NodeEditorProps> = ({ node, onUpdate }) => {
  return (
    <Card variant="outlined" padding="sm">
      <CardHeader>
        <CardTitle level={4}>Get Variable</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          label="Variable Key"
          value={node.data.key || ''}
          onChange={(value) => onUpdate?.(node.id, {
            data: { ...node.data, key: value }
          })}
          size="sm"
        />
      </CardContent>
    </Card>
  );
};

// Placeholder editors for advanced nodes
const WeightedAdvancedEditor: React.FC<NodeEditorProps> = ({ node, onUpdate }) => {
  return (
    <Card variant="outlined" padding="sm">
      <CardHeader>
        <CardTitle level={4}>Advanced Weighted Choice</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
          Advanced configuration options
        </div>
      </CardContent>
    </Card>
  );
};

const ConditionalEditor: React.FC<NodeEditorProps> = ({ node, onUpdate }) => {
  return (
    <Card variant="outlined" padding="sm">
      <CardHeader>
        <CardTitle level={4}>Conditional Logic</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
          Conditional expression configuration
        </div>
      </CardContent>
    </Card>
  );
};

const SequentialEditor: React.FC<NodeEditorProps> = ({ node, onUpdate }) => {
  return (
    <Card variant="outlined" padding="sm">
      <CardHeader>
        <CardTitle level={4}>Sequential Processing</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
          Sequential pattern configuration
        </div>
      </CardContent>
    </Card>
  );
};

const MarkovEditor: React.FC<NodeEditorProps> = ({ node, onUpdate }) => {
  return (
    <Card variant="outlined" padding="sm">
      <CardHeader>
        <CardTitle level={4}>Markov Chain</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
          State transition configuration
        </div>
      </CardContent>
    </Card>
  );
};

const GenericEditor: React.FC<NodeEditorProps> = ({ node, onUpdate }) => {
  return (
    <Card variant="outlined" padding="sm">
      <CardHeader>
        <CardTitle level={4}>Node Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
          No specific editor available for {node.type}
        </div>
      </CardContent>
    </Card>
  );
};