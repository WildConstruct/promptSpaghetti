import React from 'react';

interface NewDocumentModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const NewDocumentModal: React.FC<NewDocumentModalProps> = ({
  isOpen,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}
      onClick={onCancel}
    >
      <div
        className="modal-content"
        style={{
          background: '#2a2a2a',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          border: '1px solid #444'
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2
          style={{
            margin: '0 0 16px 0',
            color: '#fff',
            fontSize: '1.25rem'
          }}
        >
          Create New Graph?
        </h2>
        <p
          style={{
            margin: '0 0 24px 0',
            color: '#ccc',
            fontSize: '0.95rem',
            lineHeight: '1.5'
          }}
        >
          Any unsaved changes will be lost. Are you sure you want to create a
          new graph?
        </p>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              background: '#444',
              border: '1px solid #555',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 16px',
              background: '#4a90e2',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            Create New
          </button>
        </div>
      </div>
    </div>
  );
};
