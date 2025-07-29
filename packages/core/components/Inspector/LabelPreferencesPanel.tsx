/**
 * Label Preferences Panel
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 2
 * 
 * Inspector panel component for managing node label preferences
 * including display modes, positioning, styling, and behavior settings.
 */
import React, { useCallback } from 'react';
import { useGraphStore } from '../../graphStore';
import { 
  NodeLabelPreferences,
  NodeLabelDisplayMode,
  NodeLabelPosition,
  NodeLabelStyle
} from '../../types/CollaborationTypes';
interface LabelPreferencesPanelProps {
  onClose?: () => void;
  export const LabelPreferencesPanel: React.FC<LabelPreferencesPanelProps> = ({,)
  onClose
}) => {
  const { annotations, setLabelPreferences } = useGraphStore();
  const preferences = annotations.labelPreferences;
  const handlePreferenceChange = useCallback((updates: Partial<NodeLabelPreferences>) => {
    setLabelPreferences(updates);
  }, [setLabelPreferences]);
  const displayModeOptions: { value: NodeLabelDisplayMode; label: string; description: string }[] = [
    { value: 'always', label: 'Always Visible', description: 'Labels are always shown' },
    { value: 'hover', label: 'On Hover', description: 'Labels appear when hovering over nodes' },
    { value: 'focus', label: 'On Focus', description: 'Labels appear when nodes are focused' },
    { value: 'selected', label: 'When Selected', description: 'Labels appear when nodes are selected' },
    { value: 'never', label: 'Hidden', description: 'Labels are never shown' }
  ];
  const positionOptions: { value: NodeLabelPosition; label: string }[] = [
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
    { value: 'center', label: 'Center' }
  ];
  const styleOptions: { value: NodeLabelStyle; label: string; description: string }[] = [
    { value: 'default', label: 'Default', description: 'Clean white background with shadow' },
    { value: 'minimal', label: 'Minimal', description: 'Transparent background, subtle text' },
    { value: 'professional', label: 'Professional', description: 'Gradient background, bold text' },
    { value: 'colorful', label: 'Colorful', description: 'Yellow theme with bold styling' },
    { value: 'outline', label: 'Outline', description: 'Transparent with colored border' }
  ];
  return;
    <div
      style={{
  background: 'var(--bg-primary)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4)',
  width: '320px',
  fontFamily: 'var(--font-primary)',
  boxShadow: 'var(--shadow-lg)',
}}
    >
      {/* Header */}
      <div
        style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 'var(--space-4)',
  paddingBottom: 'var(--space-3)',
  borderBottom: '1px solid var(--border)',
}}
      >
        <h3
          style={{
  margin: 0,
  fontSize: 'var(--font-size-lg)',
  fontWeight: 600,
  color: 'var(--text-primary)',
}}
        >
          🏷️ Label Preferences
        </h3>
        {onClose && ()
          <button
            onClick={onClose}
            style={{
  background: 'none',
  border: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  padding: '4px',
  borderRadius: '4px',
  transition: 'all 0.2s ease',
}}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none'
  }}
          >
            ×
          </button>
        )}
      </div>
      {/* Display Mode */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <label
          style={{
  display: 'block',
  fontSize: 'var(--font-size-sm)',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: 'var(--space-2)',
}}
        >
          Display Mode
        </label>
        <select
          value={preferences.defaultDisplayMode}
          onChange={(e) => handlePreferenceChange({ )
            defaultDisplayMode: e.target.value as NodeLabelDisplayMode ;
  })}
          style={{
  width: '100%',
  padding: 'var(--space-2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  fontSize: 'var(--font-size-sm)',
}}
        >
          {displayModeOptions.map(option => ()
            <option key={option.value} value={option.value} title={option.description}>
              {option.label}
            </option>
          ))}
        </select>
        <div
          style={{
  fontSize: 'var(--font-size-xs)',
  color: 'var(--text-secondary)',
  marginTop: 'var(--space-1)',
  fontStyle: 'italic',
}}
        >
          {displayModeOptions.find(opt => opt.value === preferences.defaultDisplayMode)?.description}
        </div>
      </div>
      {/* Position */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <label
          style={{
  display: 'block',
  fontSize: 'var(--font-size-sm)',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: 'var(--space-2)',
}}
        >
          Default Position
        </label>
        <div
          style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 'var(--space-2)',
}}
        >
          {positionOptions.map(option => ()
            <button
              key={option.value}
              onClick={() => handlePreferenceChange({ defaultPosition: option.value })}
              style={{
  padding: 'var(--space-2)',
  border: preferences.defaultPosition === option.value ,
  ? '2px solid var(--accent-orange)'
  : '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  background: preferences.defaultPosition === option.value ,
  ? 'var(--accent-orange)10'
  : 'var(--bg-secondary)',
  color: preferences.defaultPosition === option.value ,
  ? 'var(--accent-orange)'
  : 'var(--text-primary)',
  fontSize: 'var(--font-size-xs)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
}}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {/* Style */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <label
          style={{
  display: 'block',
  fontSize: 'var(--font-size-sm)',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: 'var(--space-2)',
}}
        >
          Label Style
        </label>
        <select
          value={preferences.defaultStyle}
          onChange={(e) => handlePreferenceChange({ )
            defaultStyle: e.target.value as NodeLabelStyle ;
  })}
          style={{
  width: '100%',
  padding: 'var(--space-2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  fontSize: 'var(--font-size-sm)',
}}
        >
          {styleOptions.map(option => ()
            <option key={option.value} value={option.value} title={option.description}>
              {option.label}
            </option>
          ))}
        </select>
        <div
          style={{
  fontSize: 'var(--font-size-xs)',
  color: 'var(--text-secondary)',
  marginTop: 'var(--space-1)',
  fontStyle: 'italic',
}}
        >
          {styleOptions.find(opt => opt.value === preferences.defaultStyle)?.description}
        </div>
      </div>
      {/* Behavior Settings */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h4
          style={{
  margin: '0 0 var(--space-3) 0',
  fontSize: 'var(--font-size-sm)',
  fontWeight: 600,
  color: 'var(--text-primary)',
}}
        >
          Behavior
        </h4>
        {/* Inline Editing */}
        <label
          style={{
  display: 'flex',
  alignItems: 'center',
  marginBottom: 'var(--space-2)',
  cursor: 'pointer',
}}
        >
          <input
            type="checkbox"
            checked={preferences.enableInlineEditing}
            onChange={(e) => handlePreferenceChange({ enableInlineEditing: e.target.checked })}
            style={{ marginRight: 'var(--space-2)' }}
          />
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
            Enable inline editing
          </span>
        </label>
        {/* Auto Save */}
        <label
          style={{
  display: 'flex',
  alignItems: 'center',
  marginBottom: 'var(--space-2)',
  cursor: 'pointer',
}}
        >
          <input
            type="checkbox"
            checked={preferences.enableAutoSave}
            onChange={(e) => handlePreferenceChange({ enableAutoSave: e.target.checked })}
            style={{ marginRight: 'var(--space-2)' }}
          />
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
            Auto-save changes
          </span>
        </label>
        {/* Show Tooltips */}
        <label
          style={{
  display: 'flex',
  alignItems: 'center',
  marginBottom: 'var(--space-2)',
  cursor: 'pointer',
}}
        >
          <input
            type="checkbox"
            checked={preferences.showLabelTooltips}
            onChange={(e) => handlePreferenceChange({ showLabelTooltips: e.target.checked })}
            style={{ marginRight: 'var(--space-2)' }}
          />
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
            Show label tooltips
          </span>
        </label>
      </div>
      {/* Max Label Length */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <label
          style={{
  display: 'block',
  fontSize: 'var(--font-size-sm)',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: 'var(--space-2)',
}}
        >
          Max Label Length: {preferences.maxLabelLength}
        </label>
        <input
          type="range"
          min="10"
          max="100"
          value={preferences.maxLabelLength}
          onChange={(e) => handlePreferenceChange({ maxLabelLength: parseInt(e.target.value) })}
          style={{
  width: '100%',
  accentColor: 'var(--accent-orange)',
}}
        />
        <div
          style={{
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 'var(--font-size-xs)',
  color: 'var(--text-secondary)',
  marginTop: 'var(--space-1)',
}}
        >
          <span>10</span>
          <span>100</span>
        </div>
      </div>
      {/* Keyboard Shortcuts Info */}
      <div
        style={{
  padding: 'var(--space-3)',
  background: 'var(--bg-secondary)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
}}
      >
        <h4
          style={{
  margin: '0 0 var(--space-2) 0',
  fontSize: 'var(--font-size-sm)',
  fontWeight: 600,
  color: 'var(--text-primary)',
}}
        >
          Keyboard Shortcuts
        </h4>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          <div><kbd style={{ background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '3px' }}>L</kbd> - Add/edit label for selected node</div>
          <div><kbd style={{ background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '3px' }}>Enter</kbd> - Save label changes</div>
          <div><kbd style={{ background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '3px' }}>Esc</kbd> - Cancel editing</div>
        </div>
      </div>
    </div>
  );
};

export default LabelPreferencesPanel;