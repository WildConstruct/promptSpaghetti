import React, { useEffect, useMemo, useState } from 'react';

export interface ComponentSaveOutputDraft {
  sourceNodeId: string;
  key: string;
  label: string;
}

export interface ComponentSaveDraft {
  name: string;
  description: string;
  outputs: ComponentSaveOutputDraft[];
}

export interface ComponentSaveDialogProps {
  isOpen: boolean;
  draft: ComponentSaveDraft | null;
  onClose: () => void;
  onSave: (draft: ComponentSaveDraft) => void;
}

export const ComponentSaveDialog: React.FC<ComponentSaveDialogProps> = ({
  isOpen,
  draft,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [outputs, setOutputs] = useState<ComponentSaveOutputDraft[]>([]);

  useEffect(() => {
    if (!draft) {
      return;
    }
    setName(draft.name);
    setDescription(draft.description);
    setOutputs(draft.outputs);
  }, [draft]);

  const isSaveDisabled = useMemo(() => {
    if (!name.trim()) {
      return true;
    }
    return outputs.some(output => !output.key.trim() || !output.label.trim());
  }, [name, outputs]);

  if (!isOpen || !draft) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(2, 6, 23, 0.72)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1400,
      padding: '24px'
    }}>
      <div style={{
        width: 'min(640px, 100%)',
        maxHeight: '80vh',
        overflow: 'auto',
        borderRadius: '14px',
        border: '1px solid rgba(148, 163, 184, 0.16)',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(17, 24, 39, 0.98))',
        boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45)',
        padding: '18px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ color: '#f8fafc', fontSize: '16px', fontWeight: 700 }}>Save Component</div>
            <div style={{ color: 'rgba(203, 213, 225, 0.72)', fontSize: '12px', marginTop: '4px' }}>
              Name the component and define its exposed outputs.
            </div>
          </div>
          <button type="button" onClick={onClose} style={{
            border: 'none', background: 'transparent', color: 'rgba(226, 232, 240, 0.78)', cursor: 'pointer', fontSize: '18px'
          }}>
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gap: '14px' }}>
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: 600 }}>Name</span>
            <input
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="Gang Cluster"
              style={{
                width: '100%',
                borderRadius: '10px',
                border: '1px solid rgba(148, 163, 184, 0.18)',
                background: 'rgba(15, 23, 42, 0.72)',
                color: '#f8fafc',
                padding: '10px 12px'
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: 600 }}>Description</span>
            <textarea
              value={description}
              onChange={event => setDescription(event.target.value)}
              rows={3}
              placeholder="Reusable cluster with surfaced outputs"
              style={{
                width: '100%',
                resize: 'vertical',
                borderRadius: '10px',
                border: '1px solid rgba(148, 163, 184, 0.18)',
                background: 'rgba(15, 23, 42, 0.72)',
                color: '#f8fafc',
                padding: '10px 12px'
              }}
            />
          </label>

          <div style={{ display: 'grid', gap: '10px' }}>
            <div style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: 600 }}>Outputs</div>
            {outputs.map((output, index) => (
              <div
                key={output.sourceNodeId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                  gap: '10px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(148, 163, 184, 0.14)',
                  background: 'rgba(15, 23, 42, 0.46)'
                }}
              >
                <label style={{ display: 'grid', gap: '6px' }}>
                  <span style={{ color: 'rgba(203, 213, 225, 0.68)', fontSize: '11px' }}>Reference key</span>
                  <input
                    value={output.key}
                    onChange={event => {
                      const nextValue = event.target.value;
                      setOutputs(current => current.map((candidate, candidateIndex) => (
                        candidateIndex === index
                          ? {
                              ...candidate,
                              key: nextValue
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '_')
                                .replace(/^_+|_+$/g, '')
                            }
                          : candidate
                      )));
                    }}
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.18)',
                      background: 'rgba(2, 6, 23, 0.5)',
                      color: '#f8fafc',
                      padding: '9px 10px'
                    }}
                  />
                </label>
                <label style={{ display: 'grid', gap: '6px' }}>
                  <span style={{ color: 'rgba(203, 213, 225, 0.68)', fontSize: '11px' }}>Display label</span>
                  <input
                    value={output.label}
                    onChange={event => {
                      const nextValue = event.target.value;
                      setOutputs(current => current.map((candidate, candidateIndex) => (
                        candidateIndex === index
                          ? { ...candidate, label: nextValue }
                          : candidate
                      )));
                    }}
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.18)',
                      background: 'rgba(2, 6, 23, 0.5)',
                      color: '#f8fafc',
                      padding: '9px 10px'
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 12px',
              borderRadius: '9px',
              border: '1px solid rgba(148, 163, 184, 0.16)',
              background: 'rgba(30, 41, 59, 0.6)',
              color: '#e2e8f0',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaveDisabled}
            onClick={() => onSave({ name: name.trim(), description: description.trim(), outputs })}
            style={{
              padding: '9px 12px',
              borderRadius: '9px',
              border: '1px solid rgba(96, 165, 250, 0.2)',
              background: isSaveDisabled ? 'rgba(51, 65, 85, 0.5)' : 'rgba(37, 99, 235, 0.72)',
              color: '#eff6ff',
              cursor: isSaveDisabled ? 'default' : 'pointer'
            }}
          >
            Save Component
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComponentSaveDialog;
