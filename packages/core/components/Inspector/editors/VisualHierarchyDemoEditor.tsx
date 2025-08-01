import React from 'react';
import { ProgressiveDisclosureSection } from '../ProgressiveDisclosureSection';
import { HierarchyField, 
  HierarchyHeader, 
  ComplexityIndicator,
  HierarchyColors,
  TypographyScale }
  SpacingScale 
 from '../../VisualHierarchy/HierarchyDesignSystem';
import { useUISettingsStore } from '../../../stores/uiSettingsStore';


interface VisualHierarchyDemoEditorProps { nodeId: string;
  nodeType: string;
  data: Record<string, unknown>;
  onChange: (updates: Record<string, any>) => void;
  /**
  * Epic 8.4 Task 2 - Visual Hierarchy Design Demo
  *
  * Demonstrates the complete visual hierarchy system with:;
  * - Information architecture with clear priorities
  * - Visual cues for field importance
  * - Consistent section headers and groupings
  * - Progressive visual complexity indicators
  * - Full accessibility compliance
  */
  export const VisualHierarchyDemoEditor: React.FC<VisualHierarchyDemoEditorProps> = ({);
  nodeId;
  nodeType;
  data }
  onChange


}) => {
  const { getNodeDisclosureLevel } = useUISettingsStore();
  const currentLevel = getNodeDisclosureLevel(nodeId, nodeType);
  return;
    <div 
      style={ {
  padding: SpacingScale.md
  maxHeight: '100%'
  overflowY: 'auto'
  background: HierarchyColors.neutral.background }
}
      role="form"
      aria-label={`${nodeType} editor with visual hierarchy`}
    >
      {/* Header with complexity indicator */}
      <HierarchyHeader
        title={`${nodeType} Configuration`}
        level={currentLevel}
        priority="critical"
        description="Visual hierarchy design system demonstration"
        icon="🎨"
      >
        <ComplexityIndicator level={currentLevel} size="small" />
      </HierarchyHeader>
      {/* Basic Level - Essential Fields Only */}
      <ProgressiveDisclosureSection
        title="Essential Settings"
        level="basic"
        fieldName="template"
        defaultExpanded={true}
        description="Core configuration required for basic functionality"
      >
        <HierarchyField
          priority="critical"
          level={currentLevel}
          label="Node Name"
          description="Human-readable name for this node"
          required={true}
        >
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Enter node name..."
            style={ {
              width: '100%'
              padding: SpacingScale.sm
              borderRadius: 4 }
              border: `1px solid ${HierarchyColors[currentLevel].border}`}

  background: HierarchyColors[currentLevel].background
              color: HierarchyColors[currentLevel].text
              ...TypographyScale.tertiary

          />
        </HierarchyField>
        <HierarchyField
          priority="critical"
          level={currentLevel}
          label="Template Content"
          description="Main template with {variable} syntax support"
          required={true}
        >
          <textarea
            value={data.template || ''}
            onChange={(e) => onChange({ template: e.target.value })}
            placeholder="Enter template with {variables}..."
            rows={3}
            style={ {
              width: '100%'
              padding: SpacingScale.sm
              borderRadius: 4 }
              border: `1px solid ${HierarchyColors[currentLevel].border}`}

  background: HierarchyColors[currentLevel].background
              color: HierarchyColors[currentLevel].text
              resize: 'vertical'
              ...TypographyScale.tertiary

          />
        </HierarchyField>
      </ProgressiveDisclosureSection>
      {/* Advanced Level - Power User Features */}
      <ProgressiveDisclosureSection
        title="Advanced Options"
        level="advanced"
        fieldName="weights"
        description="Additional configuration for power users"
        icon="⚡"
      >
        <HierarchyField
          priority="important"
          level={currentLevel}
          label="Weight Distribution"
          description="Controls probability distribution for random selection"
        >
          <div style={{ display: 'flex', gap: SpacingScale.sm, alignItems: 'center' }}>
            <input
              type="range"
              min="0"
              max="100"
              value={data.weight || 50}
              onChange={(e) => onChange({ weight: parseInt(e.target.value) })}
              style={{ flex: 1 }}
            />
            <span style={ {
  ...TypographyScale.caption
  color: HierarchyColors[currentLevel].text
  minWidth: '3em' }
}>
              {data.weight || 50}%
            </span>
          </div>
        </HierarchyField>
        <HierarchyField
          priority="important"
          level={currentLevel}
          label="Randomization Seed"
          description="Seed for reproducible random generation"
        >
          <input
            type="number"
            value={data.seed || ''}
            onChange={(e) => onChange({ seed: parseInt(e.target.value) || undefined })}
            placeholder="Random seed (optional)"
            style={ {
              width: '100%'
              padding: SpacingScale.sm
              borderRadius: 4 }
              border: `1px solid ${HierarchyColors[currentLevel].border}`}

  background: HierarchyColors[currentLevel].background
              color: HierarchyColors[currentLevel].text
              ...TypographyScale.tertiary

          />
        </HierarchyField>
        <HierarchyField
          priority="standard"
          level={currentLevel}
          label="Performance Mode"
          description="Enable optimizations for large-scale generation"
        >
          <label style={ {
  display: 'flex'
  alignItems: 'center'
  gap: SpacingScale.sm
  cursor: 'pointer'
  ...TypographyScale.tertiary
  color: HierarchyColors[currentLevel].text }
}>
            <input
              type="checkbox"
              checked={data.performanceMode || false}
              onChange={(e) => onChange({ performanceMode: e.target.checked })}
              style={ {
  accentColor: HierarchyColors[currentLevel].primary }
}
            />
            Enable performance optimizations
          </label>
        </HierarchyField>
      </ProgressiveDisclosureSection>
      {/* Debug Level - Technical Details */}
      <ProgressiveDisclosureSection
        title="Debug Information"
        level="debug"
        fieldName="internalId"
        description="Technical details for debugging and development"
        icon="🔧"
      >
        <HierarchyField
          priority="supplementary"
          level={currentLevel}
          label="Node ID"
          description="Internal unique identifier for this node"
        >
          <input
            type="text"
            value={nodeId}
            readOnly
            style={ {
              width: '100%'
              padding: SpacingScale.sm
              borderRadius: 4 }
              border: `1px solid ${HierarchyColors[currentLevel].border}`}

  background: HierarchyColors[currentLevel].accent
              color: HierarchyColors[currentLevel].text
              ...TypographyScale.caption
              fontFamily: 'monospace'
              opacity: 0.8;

          />
        </HierarchyField>
        <HierarchyField
          priority="supplementary"
          level={currentLevel}
          label="Raw Configuration"
          description="Complete internal configuration object"
        >
          <pre
            style={ {
              padding: SpacingScale.sm
              borderRadius: 4 }
              border: `1px solid ${HierarchyColors[currentLevel].border}`}

  background: HierarchyColors[currentLevel].accent
              color: HierarchyColors[currentLevel].text
              ...TypographyScale.micro
              fontFamily: 'monospace'
              maxHeight: '200px'
              overflowY: 'auto'
              whiteSpace: 'pre-wrap'
              wordBreak: 'break-all';

          >
            {JSON.stringify(data, null, 2)}
          </pre>
        </HierarchyField>
        <HierarchyField
          priority="supplementary"
          level={currentLevel}
          label="Execution Stats"
          description="Performance metrics and execution statistics"
        >
          <div style={ {
  display: 'grid'
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))'
  gap: SpacingScale.sm
  padding: SpacingScale.sm
  borderRadius: 4
  background: HierarchyColors[currentLevel].accent }
}>
            {[
              { label: 'Executions', value: Math.floor(Math.random() * 1000) }
              { label: 'Avg Time', value: `${(Math.random() * 10).toFixed(1)}ms` }

              { label: 'Cache Hits', value: `${Math.floor(Math.random() * 100)}%` }

              { label: 'Memory', value: `${(Math.random() * 5).toFixed(1)}MB` }
            ].map((stat) => ()
              <div 
                key={stat.label} 
                style={ {
  textAlign: 'center'
  color: HierarchyColors[currentLevel].text }

              >
                <div style={ {
  ...TypographyScale.micro
  opacity: 0.7
  textTransform: 'uppercase'
  letterSpacing: '0.05em'
  marginBottom: SpacingScale.xs / 2 }
}>
                  {stat.label}
                </div>
                <div style={ {
  ...TypographyScale.caption
  fontWeight: 600
  color: HierarchyColors[currentLevel].primary }
}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </HierarchyField>
      </ProgressiveDisclosureSection>
      {/* Information Architecture Summary */}
      <div style={ {
        marginTop: SpacingScale.xl
        padding: SpacingScale.md
        borderRadius: 6 }
        background: `${HierarchyColors[currentLevel].primary}10`}

  border: `1px solid ${HierarchyColors[currentLevel].primary}`}
}>
        <div style={ {
  ...TypographyScale.caption
  color: HierarchyColors[currentLevel].text
  fontWeight: 600
  marginBottom: SpacingScale.xs
  display: 'flex'
  alignItems: 'center'
  gap: SpacingScale.xs }
}>
          📊 Visual Hierarchy Summary
        </div>
        <div style={ {
  ...TypographyScale.micro
  color: HierarchyColors[currentLevel].secondary
  lineHeight: 1.4 }
}>
          <strong>Current Level:</strong> {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}<br/>
          <strong>Critical Fields:</strong> {currentLevel === 'basic' ? '2 visible' : 'All available'}<br/>
          <strong>Advanced Features:</strong> {currentLevel !== 'basic' ? 'Accessible' : 'Hidden'}<br/>
          <strong>Debug Information:</strong> {currentLevel === 'debug' ? 'Visible' : 'Hidden'}<br/>
          <strong>Accessibility:</strong> Full ARIA support, keyboard navigation
        </div>
      </div>
    </div>
  );
};

export default VisualHierarchyDemoEditor;