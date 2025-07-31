import React from 'react';
import { professionalColors } from './styles/professional-design-system';

export interface NodeMeta {
  id: string;
  label: string;
  icon: React.ReactNode;
  category?: string;
  tooltip: string;
}

export interface PaletteProps {
  nodes: NodeMeta[];
  collapsed: boolean;
  onToggle: () => void;
  onDragStart?: (nodeId: string) => void;
}

export const Palette: React.FC<PaletteProps> = ({ nodes, collapsed, onToggle, onDragStart }) => {
  return (
    <aside
      aria-label="Node Palette"
      style={{
        width: collapsed ? 56 : 200,
        background: professionalColors.background.primary,
        color: professionalColors.text.primary,
        borderRight: `1px solid ${professionalColors.ui.border}`,
        padding: 0,
        height: '100%',
        transition: 'width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <button
        aria-label={collapsed ? 'Expand palette' : 'Collapse palette'}
        aria-expanded={!collapsed}
        onClick={onToggle}
        style={{
          background: professionalColors.ui.hover,
          border: `1px solid ${professionalColors.ui.border}`,
          color: professionalColors.text.primary,
          fontSize: 18,
          width: '100%',
          padding: '12px 0',
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {collapsed ? '»' : '«'}
      </button>
      <div style={{ flex: 1, overflowY: 'auto', padding: collapsed ? 0 : 8 }}>
        {collapsed
          ? // Collapsed view - show icons only
            nodes.map(node => (
              <div
                key={node.id}
                role="button"
                tabIndex={0}
                draggable
                aria-label={`${node.label} - ${node.tooltip}`.trim()}
                aria-describedby={`tooltip-${node.id}`}
                aria-grabbed="false"
                onDragStart={e => {
                  e.dataTransfer?.setData?.('application/node-type', node.id);
                  onDragStart?.(node.id);
                }}
                title={node.tooltip}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 0',
                  marginBottom: 4,
                  borderRadius: 6,
                  background: 'none',
                  cursor: 'grab',
                  outline: 'none',
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onDragStart?.(node.id);
                  }
                }}
              >
                <span
                  id={`tooltip-${node.id}`}
                  style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
                >
                  {node.tooltip}
                </span>
                <span style={{ fontSize: 22, width: 28, textAlign: 'center' }}>{node.icon}</span>
              </div>
            ))
          : // Expanded view - show by category
            (() => {
              const categories = nodes.reduce(
                (acc, node) => {
                  const category = node.category || 'other';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(node);
                  return acc;
                },
                {} as Record<string, typeof nodes>
              );
              const categoryOrder = [
                'content',
                'flow',
                'advanced',
                'transform',
                'output',
                'memory',
                'smart',
                'process',
                'other',
              ];
              const categoryLabels = {
                content: 'Content Building Blocks',
                flow: 'Content Flow Tools',
                advanced: 'Advanced Nodes',
                transform: 'Transform & Logic',
                output: 'Final Output',
                memory: 'Memory & Storage',
                smart: 'Smart Tools',
                process: 'Custom Processing',
                other: 'Other Tools',
              };
              return categoryOrder.map(categoryKey => {
                const categoryNodes = categories[categoryKey];
                if (!categoryNodes || categoryNodes.length === 0) return null;
                return (
                  <div key={categoryKey} style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#9ca3af',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: 8,
                        paddingLeft: 8,
                      }}
                    >
                      {categoryLabels[categoryKey as keyof typeof categoryLabels]}
                    </div>
                    {categoryNodes.map(node => (
                      <div
                        key={node.id}
                        role="button"
                        tabIndex={0}
                        draggable
                        aria-label={`${node.label} - ${node.tooltip}`.trim()}
                        aria-describedby={`tooltip-${node.id}`}
                        aria-grabbed="false"
                        onDragStart={e => {
                          e.dataTransfer?.setData?.('application/node-type', node.id);
                          onDragStart?.(node.id);
                        }}
                        title={node.tooltip}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 16px',
                          marginBottom: 4,
                          borderRadius: 6,
                          background: 'none',
                          cursor: 'grab',
                          outline: 'none',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = '#2a2f3a';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = 'none';
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            onDragStart?.(node.id);
                          }
                        }}
                      >
                        <span
                          id={`tooltip-${node.id}`}
                          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
                        >
                          {node.tooltip}
                        </span>
                        <span style={{ fontSize: 22, width: 28, textAlign: 'center' }}>{node.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{node.label}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{node.tooltip}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              });
            })()}
      </div>
    </aside>
  );
};
