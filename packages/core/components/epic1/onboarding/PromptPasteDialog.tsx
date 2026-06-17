/**
 * Prompt Paste Dialog - Allows users to paste prompts during tutorial
 */

import React, { useState, useEffect, useRef } from 'react';

interface PromptPasteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPaste: (prompt: string) => void;
  tutorialStep?: string;
}

export const PromptPasteDialog: React.FC<PromptPasteDialogProps> = ({
  isOpen,
  onClose,
  onPaste,
  tutorialStep
}) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Example prompt for the tutorial — themed to the app's racegoer examples and
  // showing how "{a|b|c}" alternatives become weighted-choice branches.
  const examplePrompt =
    "A {weathered|grinning|stoic} 1960s {racegoer|mechanic|vendor} in a {flat cap|straw boater|fedora}, watching from the grandstand";

  const isTutorial = Boolean(tutorialStep);

  useEffect(() => {
    if (isOpen) {
      // Pre-fill the example during the tutorial so a learner has something to run.
      if (isTutorial) {
        setPrompt(examplePrompt);
      }
      textareaRef.current?.focus();
    }
  }, [isOpen, isTutorial]);

  const handleUseExample = () => {
    setPrompt(examplePrompt);
    textareaRef.current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    setPrompt(pastedText);
    // Do NOT auto-advance - let user click "Create Nodes" button
  };

  const handleSubmit = () => {
    const trimmed = prompt.trim();
    if (trimmed) {
      onPaste(trimmed);
    }
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  if (!isOpen) {return null;}

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      animation: 'fadeIn 0.3s ease'
    }} onClick={handleOverlayClick}>
      <div style={{
        background: '#1b1e25',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        borderRadius: '12px',
        padding: '28px',
        maxWidth: '600px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
        animation: 'slideUp 0.3s ease'
      }}>
        <h2 style={{
          margin: '0 0 16px 0',
          fontSize: '22px',
          fontWeight: 600,
          color: '#e6a23c'
        }}>
          Paste your prompt
        </h2>

        {isTutorial && (
          <div style={{
            background: 'rgba(230, 162, 60, 0.07)',
            border: '1px solid rgba(230, 162, 60, 0.28)',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '18px'
          }}>
            <p style={{ margin: '0 0 10px 0', color: '#9aa1ad', fontSize: '13px', lineHeight: 1.5 }}>
              We pre-filled an example below. Words in <code style={{ color: '#f0bd6e' }}>{'{a|b|c}'}</code> become weighted-choice branches. Edit it or just press Create nodes.
            </p>
            <div style={{
              background: '#0e1014',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '10px 12px',
              fontFamily: 'monospace',
              fontSize: '12.5px',
              color: '#cfd3da',
              marginBottom: '10px'
            }}>
              {examplePrompt}
            </div>
            <button
              id="copy-button"
              onClick={handleUseExample}
              style={{
                background: '#20242c',
                color: '#dfe2e8',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '6px',
                padding: '7px 14px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#2a2f38')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#20242c')}
            >
              Use example
            </button>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#9aa1ad'
          }}>
            Paste or type your prompt here:
          </label>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            placeholder="Paste your prompt here (Ctrl+V or Cmd+V)..."
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              background: '#0e1014',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              fontSize: '15px',
              color: '#e7e9ee',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#e6a23c')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
          />
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 18px',
              background: '#20242c',
              color: '#dfe2e8',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#2a2f38')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#20242c')}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim()}
            style={{
              padding: '9px 18px',
              background: prompt.trim() ? '#e6a23c' : '#3a3f49',
              color: prompt.trim() ? '#1a1206' : '#8b919c',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: 500,
              cursor: prompt.trim() ? 'pointer' : 'not-allowed'
            }}
            onMouseOver={(e) => {
              if (prompt.trim()) {
                e.currentTarget.style.background = '#f0bd6e';
              }
            }}
            onMouseOut={(e) => {
              if (prompt.trim()) {
                e.currentTarget.style.background = '#e6a23c';
              }
            }}
          >
            Create nodes
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            transform: translateY(20px);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default PromptPasteDialog;
