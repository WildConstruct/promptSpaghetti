import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
/**
 * Mobile-optimized node editor layout
 */
import { useState } from 'react';
import { mobileStyles, MOBILE_SPACING } from '../design-system';
import { MobileHeader } from './MobileNavigation';
import { MobileButton } from './MobileButton';
import { MobileTextArea } from './MobileInput';
import { cn } from '../../utils';
import { CollapsiblePanel } from '../../responsive/containers';
export const MobileNodeEditor = ({ node, onUpdate, onDelete, onClose, className, style }) => {
  const [activeTab, setActiveTab] = useState('properties');
  if (!node) {
    return _jsx('div', {
      className: 'mobile-node-editor-empty',
      style: { padding: MOBILE_SPACING.lg },
      children: _jsx('p', { children: 'Select a node to edit' }),
    });
  }
  const handlePropertyChange = (property, value) => {
    onUpdate?.(node.id, {
      data: {
        ...node.data,
        [property]: value,
      },
    });
  };
  const handleDelete = () => {
    if (window.confirm('Delete this node?')) {
      onDelete?.(node.id);
      onClose?.();
    }
  };
  return _jsxs('div', {
    className: cn('mobile-node-editor', className),
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--color-background)',
      ...style,
    },
    children: [
      _jsx(MobileHeader, {
        title: `Edit ${node.type} Node`,
        leftAction: {
          icon: '←',
          onClick: onClose || (() => {}),
          label: 'Back',
        },
        rightActions: [
          {
            icon: '🗑️',
            onClick: handleDelete,
            label: 'Delete node',
          },
        ],
      }),
      _jsxs('div', {
        className: 'mobile-editor-tabs',
        style: {
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        },
        children: [
          _jsx('button', {
            className: cn('tab', activeTab === 'properties' && 'active'),
            onClick: () => setActiveTab('properties'),
            style: {
              flex: 1,
              padding: MOBILE_SPACING.md,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'properties' ? '2px solid var(--color-primary)' : 'none',
              color: activeTab === 'properties' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'properties' ? 500 : 400,
              cursor: 'pointer',
              ...mobileStyles.tapHighlight,
            },
            children: 'Properties',
          }),
          _jsx('button', {
            className: cn('tab', activeTab === 'connections' && 'active'),
            onClick: () => setActiveTab('connections'),
            style: {
              flex: 1,
              padding: MOBILE_SPACING.md,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'connections' ? '2px solid var(--color-primary)' : 'none',
              color: activeTab === 'connections' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'connections' ? 500 : 400,
              cursor: 'pointer',
              ...mobileStyles.tapHighlight,
            },
            children: 'Connections',
          }),
        ],
      }),
      _jsxs('div', {
        className: 'mobile-editor-content',
        style: {
          flex: 1,
          overflowY: 'auto',
          padding: MOBILE_SPACING.md,
          ...mobileStyles.smoothScroll,
        },
        children: [
          activeTab === 'properties' &&
            _jsxs('div', {
              className: 'properties-tab',
              children: [
                _jsxs('div', {
                  className: 'form-group',
                  style: { marginBottom: MOBILE_SPACING.lg },
                  children: [
                    _jsx('label', {
                      style: {
                        display: 'block',
                        marginBottom: MOBILE_SPACING.xs,
                        fontSize: 14,
                        color: 'var(--color-text-secondary)',
                      },
                      children: 'Node ID',
                    }),
                    _jsx('div', {
                      style: {
                        padding: MOBILE_SPACING.sm,
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: 8,
                        fontSize: 12,
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                      },
                      children: node.id,
                    }),
                  ],
                }),
                renderNodeProperties(node, handlePropertyChange),
              ],
            }),
          activeTab === 'connections' &&
            _jsxs('div', {
              className: 'connections-tab',
              children: [
                _jsx(CollapsiblePanel, {
                  title: 'Incoming Connections',
                  defaultOpen: true,
                  children: node.data.inputs?.length
                    ? _jsx('ul', {
                        style: { listStyle: 'none', padding: 0, margin: 0 },
                        children: node.data.inputs.map((input, index) =>
                          _jsx(
                            'li',
                            {
                              style: {
                                padding: MOBILE_SPACING.sm,
                                borderBottom: '1px solid var(--color-border)',
                              },
                              children: input,
                            },
                            index
                          )
                        ),
                      })
                    : _jsx('p', {
                        style: { color: 'var(--color-text-secondary)', margin: 0 },
                        children: 'No incoming connections',
                      }),
                }),
                _jsx(CollapsiblePanel, {
                  title: 'Outgoing Connections',
                  defaultOpen: true,
                  children: node.data.outputs?.length
                    ? _jsx('ul', {
                        style: { listStyle: 'none', padding: 0, margin: 0 },
                        children: node.data.outputs.map((output, index) =>
                          _jsx(
                            'li',
                            {
                              style: {
                                padding: MOBILE_SPACING.sm,
                                borderBottom: '1px solid var(--color-border)',
                              },
                              children: output,
                            },
                            index
                          )
                        ),
                      })
                    : _jsx('p', {
                        style: { color: 'var(--color-text-secondary)', margin: 0 },
                        children: 'No outgoing connections',
                      }),
                }),
              ],
            }),
        ],
      }),
      _jsxs('div', {
        className: 'mobile-editor-actions',
        style: {
          padding: MOBILE_SPACING.md,
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          gap: MOBILE_SPACING.sm,
        },
        children: [
          _jsx(MobileButton, { variant: 'secondary', onClick: onClose, style: { flex: 1 }, children: 'Cancel' }),
          _jsx(MobileButton, { variant: 'primary', onClick: onClose, style: { flex: 1 }, children: 'Done' }),
        ],
      }),
    ],
  });
};
/**
 * Render node-specific property editors
 */
function renderNodeProperties(node, onChange) {
  const commonFieldStyle = { marginBottom: MOBILE_SPACING.lg };
  switch (node.type) {
    case 'subject':
    case 'action':
    case 'attribute':
      return _jsx(_Fragment, {
        children: _jsxs('div', {
          style: commonFieldStyle,
          children: [
            _jsx('label', {
              style: {
                display: 'block',
                marginBottom: MOBILE_SPACING.xs,
                fontSize: 14,
                color: 'var(--color-text-secondary)',
              },
              children: 'Variations',
            }),
            _jsx(MobileTextArea, {
              value: node.data.variations?.join('\n') || '',
              onChange: e => {
                const variations = e.target.value.split('\n').filter(Boolean);
                onChange('variations', variations);
              },
              placeholder: 'Enter variations (one per line)',
              minRows: 3,
              maxRows: 8,
            }),
          ],
        }),
      });
    case 'weightedChoice':
      return _jsx(_Fragment, {
        children: _jsxs('div', {
          style: commonFieldStyle,
          children: [
            _jsx('label', {
              style: {
                display: 'block',
                marginBottom: MOBILE_SPACING.xs,
                fontSize: 14,
                color: 'var(--color-text-secondary)',
              },
              children: 'Weighted Options',
            }),
            _jsx(MobileTextArea, {
              value: formatWeightedOptions(node.data.options || []),
              onChange: e => {
                const options = parseWeightedOptions(e.target.value);
                onChange('options', options);
              },
              placeholder: 'text:weight (e.g., option1:50)',
              minRows: 4,
            }),
            _jsx('div', {
              style: {
                fontSize: 12,
                color: 'var(--color-text-secondary)',
                marginTop: MOBILE_SPACING.xs,
              },
              children: 'Format: text:weight (one per line)',
            }),
          ],
        }),
      });
    case 'output':
      return _jsx(_Fragment, {
        children: _jsxs('div', {
          style: commonFieldStyle,
          children: [
            _jsx('label', {
              style: {
                display: 'block',
                marginBottom: MOBILE_SPACING.xs,
                fontSize: 14,
                color: 'var(--color-text-secondary)',
              },
              children: 'Template',
            }),
            _jsx(MobileTextArea, {
              value: node.data.template || '',
              onChange: e => onChange('template', e.target.value),
              placeholder: 'Enter output template with {{variables}}',
              minRows: 4,
            }),
          ],
        }),
      });
    default:
      return _jsx('div', {
        style: { color: 'var(--color-text-secondary)' },
        children: 'No editable properties for this node type',
      });
  }
}
function formatWeightedOptions(options) {
  return options.map(opt => `${opt.text}:${opt.weight}`).join('\n');
}
function parseWeightedOptions(text) {
  return text
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const [text, weightStr] = line.split(':');
      return {
        text: text.trim(),
        weight: parseInt(weightStr) || 1,
      };
    });
}
//# sourceMappingURL=MobileNodeEditor.js.map
