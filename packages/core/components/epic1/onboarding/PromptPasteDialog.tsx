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
  
  // Example prompt for tutorial
  const examplePrompt = 'A {brave|cunning|wise} {knight|wizard|rogue} ventures into the {dark forest|ancient ruins|dragon\'s lair}';

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

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

  const handleCopyExample = async () => {
    try {
      await navigator.clipboard.writeText(examplePrompt);
    } catch (error) {
      console.warn('[PromptPasteDialog] Failed to copy example prompt', error);
    }

    // Show a temporary message
    const button = document.getElementById('copy-button');
    if (button) {
      button.textContent = 'Copied!';
      setTimeout(() => {
        button.textContent = 'Copy Example';
      }, 2000);
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
        background: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '600px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        animation: 'slideUp 0.3s ease'
      }}>
        <h2 style={{
          margin: '0 0 16px 0',
          fontSize: '24px',
          fontWeight: '600',
          color: '#1a202c'
        }}>
          🍝 Paste Your Prompt
        </h2>
        
        {tutorialStep === 'paste-prompt' && (
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #3182ce',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <p style={{ margin: '0 0 12px 0', color: '#2c5282' }}>
              <strong>Tutorial Tip:</strong> Copy the example below, then paste it in the text area!
            </p>
            <div style={{
              background: '#e6fffa',
              border: '1px solid #38b2ac',
              borderRadius: '4px',
              padding: '12px',
              fontFamily: 'monospace',
              fontSize: '14px',
              marginBottom: '12px'
            }}>
              {examplePrompt}
            </div>
            <button
              id="copy-button"
              onClick={handleCopyExample}
              style={{
                background: '#3182ce',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
              onMouseOut={(e) => e.currentTarget.style.background = '#3182ce'}
            >
              Copy Example
            </button>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#4a5568'
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
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#3182ce'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
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
              padding: '10px 20px',
              background: '#e2e8f0',
              color: '#4a5568',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#cbd5e0'}
            onMouseOut={(e) => e.currentTarget.style.background = '#e2e8f0'}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim()}
            style={{
              padding: '10px 20px',
              background: prompt.trim() ? '#3182ce' : '#cbd5e0',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: prompt.trim() ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => {
              if (prompt.trim()) {
                e.currentTarget.style.background = '#2563eb';
              }
            }}
            onMouseOut={(e) => {
              if (prompt.trim()) {
                e.currentTarget.style.background = '#3182ce';
              }
            }}
          >
            Create Nodes
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
