/**
 * Example: How to use the contextual tooltip system
 * 
 * This example shows various tooltip implementations
 * for Epic 1's help system.
 */

import React, { useState } from 'react';
import {
  TooltipManagerProvider,
  ContextualTooltips,
  TooltipWrapper,
  SmartTooltip,
  TooltipContent,
  QuickTooltip,
  useTooltipManager,
  useTooltipSequence,
  AutoTooltips,
} from '../onboarding';

// Example: Basic tooltip usage
export const BasicTooltipExample: React.FC = () => {
  return (
    <div style={{ padding: '40px' }}>
      <h2>Basic Tooltip Examples</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '24px' }}>
        <TooltipWrapper content="Simple text tooltip">
          <button style={{ padding: '8px 16px' }}>
            Hover for text
          </button>
        </TooltipWrapper>

        <TooltipWrapper 
          content={<QuickTooltip text="With keyboard shortcut" shortcut="Ctrl+S" />}
          position="top"
        >
          <button style={{ padding: '8px 16px' }}>
            Hover for shortcut
          </button>
        </TooltipWrapper>

        <TooltipWrapper
          content={
            <TooltipContent
              title="Rich Content"
              description="Tooltips can contain rich formatting, examples, and actions."
              icon="💡"
              shortcut="Cmd+K"
              example="Type to search..."
              learnMore={() => alert('Learn more clicked!')}
            />
          }
          position="right"
          delay={300}
        >
          <button style={{ padding: '8px 16px' }}>
            Hover for rich content
          </button>
        </TooltipWrapper>
      </div>
    </div>
  );
};

// Example: Contextual tooltips for UI elements
export const ContextualTooltipExample: React.FC = () => {
  return (
    <TooltipManagerProvider>
      <div style={{ padding: '40px' }}>
        <h2>Contextual Tooltip System</h2>
        
        {/* Mock UI elements */}
        <div style={{ marginTop: '24px' }}>
          <div 
            className="mock-canvas"
            style={{
              width: '600px',
              height: '400px',
              border: '2px dashed #e5e7eb',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f9fafb',
            }}
          >
            <span style={{ color: '#6b7280' }}>Canvas Area</span>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <button className="preview-button" style={{ padding: '8px 16px' }}>
              Preview
            </button>
            <button className="save-button" style={{ padding: '8px 16px' }}>
              Save
            </button>
            <button className="settings-button" style={{ padding: '8px 16px' }}>
              ⚙️ Settings
            </button>
          </div>
        </div>

        {/* Contextual tooltips will automatically attach to these elements */}
        <ContextualTooltips />
        
        {/* Auto tooltips for new users */}
        <AutoTooltips showForNewUsers={true} />
      </div>
    </TooltipManagerProvider>
  );
};

// Example: Programmatic tooltip control
export const ProgrammaticTooltipExample: React.FC = () => {
  const TooltipControls = () => {
    const { showTooltip, hideTooltip, hideAllTooltips } = useTooltipManager();
    const { startSequence, nextInQueue, clearQueue, isShowingQueue } = useTooltipSequence();

    return (
      <div>
        <h3>Programmatic Control</h3>
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button
            onClick={() => showTooltip({
              id: 'manual-1',
              target: '.target-element',
              title: 'Manual Tooltip',
              content: 'This tooltip was triggered programmatically',
              position: 'right',
              priority: 'high',
            })}
            style={{ padding: '8px 16px' }}
          >
            Show Tooltip
          </button>

          <button
            onClick={() => hideTooltip('manual-1')}
            style={{ padding: '8px 16px' }}
          >
            Hide Specific
          </button>

          <button
            onClick={hideAllTooltips}
            style={{ padding: '8px 16px' }}
          >
            Hide All
          </button>
        </div>

        <h3 style={{ marginTop: '24px' }}>Tooltip Sequences</h3>
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button
            onClick={() => startSequence('firstTimeUser')}
            style={{ padding: '8px 16px' }}
          >
            Start Tutorial Sequence
          </button>

          <button
            onClick={nextInQueue}
            disabled={!isShowingQueue}
            style={{ padding: '8px 16px' }}
          >
            Next in Queue
          </button>

          <button
            onClick={clearQueue}
            disabled={!isShowingQueue}
            style={{ padding: '8px 16px' }}
          >
            Clear Queue
          </button>
        </div>

        <div 
          className="target-element"
          style={{
            marginTop: '24px',
            padding: '20px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          Target Element
        </div>
      </div>
    );
  };

  return (
    <TooltipManagerProvider>
      <div style={{ padding: '40px' }}>
        <h2>Programmatic Tooltip Control</h2>
        <TooltipControls />
        <ContextualTooltips />
      </div>
    </TooltipManagerProvider>
  );
};

// Example: Smart positioning
export const SmartPositioningExample: React.FC = () => {
  const [targetEl, setTargetEl] = useState<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'right' | 'bottom' | 'left' | 'auto'>('auto');

  return (
    <div style={{ padding: '40px', minHeight: '500px' }}>
      <h2>Smart Tooltip Positioning</h2>
      
      <div style={{ marginTop: '24px' }}>
        <label>Position: </label>
        <select 
          value={position} 
          onChange={(e) => setPosition(e.target.value as any)}
          style={{ marginLeft: '8px' }}
        >
          <option value="auto">Auto</option>
          <option value="top">Top</option>
          <option value="right">Right</option>
          <option value="bottom">Bottom</option>
          <option value="left">Left</option>
        </select>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '40px',
          marginTop: '40px',
        }}
      >
        {/* Test different positions */}
        {['Top Left', 'Top Center', 'Top Right',
          'Middle Left', 'Middle Center', 'Middle Right',
          'Bottom Left', 'Bottom Center', 'Bottom Right'].map((label, index) => (
          <button
            key={label}
            ref={(el) => {
              if (el && visible && targetEl?.textContent === label) {
                setTargetEl(el);
              }
            }}
            onMouseEnter={(e) => {
              setTargetEl(e.currentTarget);
              setVisible(true);
            }}
            onMouseLeave={() => setVisible(false)}
            style={{
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: '#f9fafb',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <SmartTooltip
        target={targetEl}
        visible={visible}
        position={position}
        arrow={true}
      >
        <div style={{ padding: '12px' }}>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
            Smart Positioning
          </h4>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            The tooltip automatically adjusts to stay within viewport bounds
          </p>
        </div>
      </SmartTooltip>
    </div>
  );
};

// Example: Custom tooltip configurations
export const CustomTooltipExample: React.FC = () => {
  const customTooltips = [
    {
      id: 'node-library',
      target: '.node-palette',
      title: 'Node Library',
      content: 'Drag node types from here to add them to your canvas',
      position: 'right' as const,
      delay: 500,
      priority: 'high' as const,
      actions: [
        { label: 'Show me', action: () => alert('Showing node library tutorial') },
      ],
    },
    {
      id: 'keyboard-help',
      target: '.help-button',
      title: 'Keyboard Shortcuts',
      content: 'Press ? to see all available keyboard shortcuts',
      position: 'bottom' as const,
      delay: 1000,
      showOnce: true,
    },
  ];

  return (
    <TooltipManagerProvider>
      <div style={{ padding: '40px' }}>
        <h2>Custom Tooltip Configurations</h2>
        
        <div style={{ marginTop: '24px', display: 'flex', gap: '20px' }}>
          <div 
            className="node-palette"
            style={{
              width: '200px',
              height: '300px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#f9fafb',
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
              Node Palette
            </h3>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Hover to see custom tooltip with action
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <button 
              className="help-button"
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
              }}
            >
              ? Help
            </button>
            
            <p style={{ marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
              The help button tooltip will only show once
            </p>
          </div>
        </div>

        <ContextualTooltips additionalTooltips={customTooltips} />
      </div>
    </TooltipManagerProvider>
  );
};