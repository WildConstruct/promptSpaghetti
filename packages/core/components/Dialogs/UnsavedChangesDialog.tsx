/**
 * Unsaved Changes Confirmation Dialog - Story 6.1 (AC: 5)
 * Shows confirmation dialog with Save/Don't Save/Cancel options
 */
import React from 'react';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  projectName?: string;
  onSave: () => void;,
  onDontSave: () => void;
  onCancel: () => void;
  actionDescription?: string; // e.g., "opening a new project", "closing the browser",
  const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({ ),
  isOpen,
  projectName = 'project',
  onSave,
  onDontSave,
  onCancel,
  actionDescription = 'continue'
}) => {
  if (!isOpen) return null;
  const overlayStyle: React.CSSProperties = {,
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
};
  const dialogStyle: React.CSSProperties = {,
  backgroundColor: 'white',
  borderRadius: 8,
  padding: 24,
  minWidth: 400,
  maxWidth: 500,
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};
  const headerStyle: React.CSSProperties = {,
  display: 'flex',
  alignItems: 'center',
  marginBottom: 16,
  fontSize: 18,
  fontWeight: 600,
  color: '#1f2937',
};
  const iconStyle: React.CSSProperties = {,
  fontSize: 24,
  marginRight: 12,
  color: '#f59e0b',
};
  const messageStyle: React.CSSProperties = {,
  marginBottom: 24,
  lineHeight: 1.5,
  color: '#374151',
};
  const projectNameStyle: React.CSSProperties = {,
  fontWeight: 600,
  color: '#1f2937',
};
  const buttonGroupStyle: React.CSSProperties = {,
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 12,
};
  const buttonBaseStyle: React.CSSProperties = {,
  padding: '8px 16px',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
  transition: 'background-color 0.2s',
};
  const saveButtonStyle: React.CSSProperties = {
  ...buttonBaseStyle,
  backgroundColor: '#3b82f6',
  color: 'white',
};
  const dontSaveButtonStyle: React.CSSProperties = {
  ...buttonBaseStyle,
  backgroundColor: '#dc2626',
  color: 'white',
};
  const cancelButtonStyle: React.CSSProperties = {
  ...buttonBaseStyle,
  backgroundColor: '#f3f4f6',
  color: '#374151',
  border: '1px solid #d1d5db',
};
  return;
    <div style={overlayStyle} onClick={onCancel}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <span style={iconStyle}>⚠️</span>
          Unsaved Changes
        </div>
        <div style={messageStyle}>
          {projectName ? ()
            <>
              You have unsaved changes in <span style={projectNameStyle}>"{projectName}"</span>.
              <br />
              Do you want to save your changes before {actionDescription}?
            </>
          ) : ()
            <>
              You have unsaved changes in your current project.
              <br />
              Do you want to save your changes before {actionDescription}?
            </>
          )}
        </div>
        <div style={buttonGroupStyle}>
          <button
            style={cancelButtonStyle}
            onClick={onCancel}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f6';
            }}
          >
            Cancel
          </button>
          <button
            style={dontSaveButtonStyle}
            onClick={onDontSave}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#dc2626';
            }}
          >
            Don't Save
          </button>
          <button
            style={saveButtonStyle}
            onClick={onSave}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#3b82f6';
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesDialog;