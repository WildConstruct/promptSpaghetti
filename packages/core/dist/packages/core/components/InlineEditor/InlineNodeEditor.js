import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from 'react';
{
    const [localData, setLocalData] = useState(node.data);
    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const editorRef = useRef(null);
    const firstInputRef = useRef(null);
    // Auto-focus first field when editor becomes active
    useEffect(() => {
        if (isActive && firstInputRef.current) {
            firstInputRef.current.focus();
            firstInputRef.current.select();
        }
        [isActive];
    });
    // Handle clicks outside editor to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isActive && editorRef.current && !editorRef.current.contains(event.target)) {
                handleSubmit();
            }
            ;
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, [isActive];
    });
    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!isActive)
                return;
            switch (event.key) {
                case 'Escape':
                    event.preventDefault();
                    handleCancel();
                    break;
                case 'Enter':
                    if (event.metaKey || event.ctrlKey) {
                        event.preventDefault();
                        handleSubmit();
                        break;
                    }
                case 'Tab':
                    // Allow default tab behavior within editor
                    break;
            }
            ;
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }, [isActive];
    });
    const validateData = useCallback((data) => {
        const newErrors = {};
        // Basic validation
        if (!data.label?.trim()) {
            newErrors.label = 'Label is required';
            // Node-type specific validation
            switch (node.type) {
                case 'weightedChoice':
                    if (!data.choices || data.choices.length === 0) {
                        newErrors.choices = 'At least one choice is required';
                        break;
                    }
                case 'concat':
                    if (!data.template?.trim()) {
                        newErrors.template = 'Template is required';
                        break;
                    }
                case 'variable':
                    if (!data.variableName?.trim()) {
                        newErrors.variableName = 'Variable name is required';
                        break;
                        return newErrors;
                    }
                    [node.type];
            }
        }
    });
    const handleInputChange = useCallback((field, value) => {
        const newData = { ...localData, [field]: value };
        setLocalData(newData);
        setIsDirty(true);
        // Real-time validation
        const newErrors = validateData(newData);
        setErrors(newErrors);
        // Auto-save for simple changes
        if (Object.keys(newErrors).length === 0) {
            onUpdate(node.id, { [field]: value });
        }
        [localData, node.id, onUpdate, validateData];
    });
    const handleSubmit = useCallback(() => {
        const newErrors = validateData(localData);
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            onUpdate(node.id, localData);
            onSubmit();
            setIsDirty(false);
        }
        [localData, node.id, onUpdate, onSubmit, validateData];
    });
    const handleCancel = useCallback(() => {
        setLocalData(node.data);
        setErrors({});
        setIsDirty(false);
        onClose();
    }, [node.data, onClose]);
    if (!isActive)
        return null;
    return;
    _jsx("div", { ref: editorRef, className: "inline-node-editor", style: {
            position: 'absolute',
            left: position.x,
            top: position.y,
            maxWidth,
            maxHeight,
            background: '#2d3748',
            border: '2px solid #4299e1',
            borderRadius: 8,
            padding: 16,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            color: 'white',
            fontSize: 14,
            animation: 'slideIn 0.2s ease-out',
        }, children: _jsxs("div", { style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: '1px solid #4a5568',
            }, children: [_jsxs("h3", { style: {
                        margin: 0,
                        fontSize: 16,
                        color: '#e2e8f0',
                        fontWeight: 600,
                    }, children: ["Edit ", node.type, " Node"] }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [isDirty && ()
                            < span, " style=", {
                            fontSize: 12,
                            color: '#f6ad55',
                            fontStyle: 'italic',
                        }, "> Modified"] }), ")}", _jsx("button", { onClick: handleCancel, style: {
                        background: 'none',
                        border: 'none',
                        color: '#a0aec0',
                        cursor: 'pointer',
                        fontSize: 18,
                        padding: 0,
                        width: 20,
                        height: 20,
                    }, title: "Cancel (Esc)", children: "\u00D7" })] }) });
    { /* Basic Properties */ }
    _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: {
                    display: 'block',
                    marginBottom: 4,
                    fontSize: 12,
                    color: '#e2e8f0',
                    fontWeight: 500,
                }, children: "Label" }), _jsx("input", { ref: firstInputRef, type: "text", value: localData.label || '', onChange: (e) => handleInputChange('label', e.target.value), style: {
                    width: '100%',
                    padding: 8,
                    background: '#4a5568',
                    border: errors.label ? '1px solid #e53e3e' : '1px solid #718096',
                    borderRadius: 4,
                    color: 'white',
                    fontSize: 14,
                }, placeholder: "Enter node label" }), errors.label && ()
                < span, " style=", { color: '#e53e3e', fontSize: 12, marginTop: 4 }, ">", errors.label] });
}
div >
    { /* Node-specific properties */}
    < NodeSpecificEditor;
nodeType = { node, : .type };
data = { localData };
onChange = { handleInputChange };
errors = { errors };
theme = "cinema"
    /  >
    { /* Footer */}
    < div;
style = {};
{
    display: 'flex',
        justifyContent;
    'space-between',
        alignItems;
    'center',
        marginTop;
    16,
        paddingTop;
    12,
        borderTop;
    '1px solid #4a5568',
    ;
}
 >
    (_jsx("div", { style: { fontSize: 12, color: '#a0aec0' }, children: "Press \u2318Enter to save, Esc to cancel" })
        ,
            _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { onClick: handleCancel, style: {
                            padding: '6px 12px',
                            background: '#718096',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12,
                        }, children: "Cancel" }), _jsx("button", { onClick: handleSubmit, disabled: Object.keys(errors).length > 0, style: {
                            padding: '6px 12px',
                            background: Object.keys(errors).length > 0 ? '#4a5568' : '#4299e1',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: Object.keys(errors).length > 0 ? 'not-allowed' : 'pointer',
                            fontSize: 12,
                        }, children: "Save" })] }));
div >
    _jsx("style", { children: `
        @keyframes slideIn {
          from {
            opacity: 0;,
  transform: scale(0.95) translateY(-10px);
          to {
            opacity: 1;,
  transform: scale(1) translateY(0);
      ` });
div >
;
;
;
{
    const editorProps = { data, onChange, errors, theme };
    switch (nodeType) {
        case 'weightedChoice':
            return _jsx(WeightedChoiceEditor, { ...editorProps });
        case 'concat':
            return _jsx(ConcatEditor, { ...editorProps });
        case 'variable':
            return _jsx(VariableEditor, { ...editorProps });
        case 'conditional':
            return _jsx(ConditionalEditor, { ...editorProps });
        case 'output':
            return _jsx(OutputEditor, { ...editorProps });
        default:
            return;
            _jsxs("div", { style: {
                    padding: 12,
                    textAlign: 'center',
                    color: '#a0aec0',
                    fontSize: 12,
                    fontStyle: 'italic',
                }, children: ["No specialized editor for ", nodeType, " nodes"] });
            ;
    }
    ;
    export default InlineNodeEditor;
}
