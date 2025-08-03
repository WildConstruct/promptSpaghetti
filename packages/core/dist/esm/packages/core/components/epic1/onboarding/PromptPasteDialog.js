import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Prompt Paste Dialog - Allows users to paste prompts during tutorial
 */
import { useState, useEffect, useRef } from 'react';
export const PromptPasteDialog = ({ isOpen, onClose, onPaste, tutorialStep }) => {
    const [prompt, setPrompt] = useState('');
    const textareaRef = useRef(null);
    // Example prompt for tutorial
    const examplePrompt = 'A {brave|cunning|wise} {knight|wizard|rogue} ventures into the {dark forest|ancient ruins|dragon\'s lair}';
    useEffect(() => {
        if (isOpen && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isOpen]);
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        setPrompt(pastedText);
        // Auto-submit after paste
        setTimeout(() => {
            if (pastedText) {
                onPaste(pastedText);
            }
        }, 500);
    };
    const handleSubmit = () => {
        if (prompt.trim()) {
            onPaste(prompt);
        }
    };
    const handleCopyExample = () => {
        navigator.clipboard.writeText(examplePrompt);
        // Show a temporary message
        const button = document.getElementById('copy-button');
        if (button) {
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = 'Copy Example';
            }, 2000);
        }
    };
    if (!isOpen)
        return null;
    return (_jsxs("div", { style: {
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
        }, children: [_jsxs("div", { style: {
                    background: 'white',
                    borderRadius: '12px',
                    padding: '32px',
                    maxWidth: '600px',
                    width: '90%',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    animation: 'slideUp 0.3s ease'
                }, children: [_jsx("h2", { style: {
                            margin: '0 0 16px 0',
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#1a202c'
                        }, children: "\uD83C\uDF5D Paste Your Prompt" }), tutorialStep === 'paste-prompt' && (_jsxs("div", { style: {
                            background: '#f0f9ff',
                            border: '1px solid #3182ce',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '20px'
                        }, children: [_jsxs("p", { style: { margin: '0 0 12px 0', color: '#2c5282' }, children: [_jsx("strong", { children: "Tutorial Tip:" }), " Copy the example below, then paste it in the text area!"] }), _jsx("div", { style: {
                                    background: '#e6fffa',
                                    border: '1px solid #38b2ac',
                                    borderRadius: '4px',
                                    padding: '12px',
                                    fontFamily: 'monospace',
                                    fontSize: '14px',
                                    marginBottom: '12px'
                                }, children: examplePrompt }), _jsx("button", { id: "copy-button", onClick: handleCopyExample, style: {
                                    background: '#3182ce',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '8px 16px',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }, onMouseOver: (e) => e.currentTarget.style.background = '#2563eb', onMouseOut: (e) => e.currentTarget.style.background = '#3182ce', children: "Copy Example" })] })), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: {
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#4a5568'
                                }, children: "Paste or type your prompt here:" }), _jsx("textarea", { ref: textareaRef, value: prompt, onChange: (e) => setPrompt(e.target.value), onPaste: handlePaste, placeholder: "Paste your prompt here (Ctrl+V or Cmd+V)...", style: {
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
                                }, onFocus: (e) => e.currentTarget.style.borderColor = '#3182ce', onBlur: (e) => e.currentTarget.style.borderColor = '#e2e8f0' })] }), _jsxs("div", { style: {
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end'
                        }, children: [_jsx("button", { onClick: onClose, style: {
                                    padding: '10px 20px',
                                    background: '#e2e8f0',
                                    color: '#4a5568',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }, onMouseOver: (e) => e.currentTarget.style.background = '#cbd5e0', onMouseOut: (e) => e.currentTarget.style.background = '#e2e8f0', children: "Cancel" }), _jsx("button", { onClick: handleSubmit, disabled: !prompt.trim(), style: {
                                    padding: '10px 20px',
                                    background: prompt.trim() ? '#3182ce' : '#cbd5e0',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    cursor: prompt.trim() ? 'pointer' : 'not-allowed',
                                    transition: 'background 0.2s'
                                }, onMouseOver: (e) => {
                                    if (prompt.trim()) {
                                        e.currentTarget.style.background = '#2563eb';
                                    }
                                }, onMouseOut: (e) => {
                                    if (prompt.trim()) {
                                        e.currentTarget.style.background = '#3182ce';
                                    }
                                }, children: "Create Nodes" })] })] }), _jsx("style", { children: `
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
      ` })] }));
};
export default PromptPasteDialog;
