import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
export const SimpleVariationList = ({
    variations,
    onChange,
    placeholder = 'Add item...',
    addButtonText = 'Add',
    emptyMessage = 'No items defined.'
});
{
    const [newItem, setNewItem] = useState('');
    const handleAdd = () => {
        if (newItem.trim()) {
            onChange([...variations, newItem.trim()]);
            setNewItem('');
        }
        ;
        const handleRemove = (index) => {
            onChange(variations.filter((_, i) => i !== index));
        };
        const handleUpdate = (index, value) => {
            const updated = [...variations];
            updated[index] = value;
            onChange(updated);
        };
        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
            }
            ;
            return;
            _jsxs("div", { style: { marginBottom: 12 }, children: [variations.length === 0 ? ()
                        < div : , " style=", {
                        padding: 12,
                        background: '#2d3748',
                        border: '1px dashed #4a5568',
                        borderRadius: 4,
                        textAlign: 'center',
                        color: '#a0aec0',
                        fontSize: 12,
                        fontStyle: 'italic',
                        marginBottom: 8,
                    }, ">", emptyMessage] });
        };
    };
    ()
        < div;
    style = {};
    {
        background: '#2d3748',
            border;
        '1px solid #4a5568',
            borderRadius;
        4,
            padding;
        8,
            marginBottom;
        8,
        ;
    }
}
 >
    { variations, : .map((variation, index) => ()
            < div, key = { index }, style = {}, {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: index < variations.length - 1 ? 8 : 0,
        }) }
    >
        (_jsx("input", { type: "text", value: variation, onChange: (e) => handleUpdate(index, e.target.value), style: {
                flex: 1,
                padding: 6,
                border: '1px solid #4a5568',
                borderRadius: 2,
                background: '#1a202c',
                color: '#e2e8f0',
                fontSize: 12,
            } })
            ,
                _jsx("button", { onClick: () => handleRemove(index), style: {
                        padding: '4px 6px',
                        background: '#e53e3e',
                        border: 'none',
                        borderRadius: 2,
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: 10,
                    }, children: "\u2715" }));
div >
;
div >
;
_jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("input", { type: "text", value: newItem, onChange: (e) => setNewItem(e.target.value), onKeyPress: handleKeyPress, placeholder: placeholder, style: {
                flex: 1,
                padding: 6,
                border: '1px solid #4a5568',
                borderRadius: 4,
                background: '#2d3748',
                color: '#e2e8f0',
                fontSize: 12,
            } }), _jsx("button", { onClick: handleAdd, disabled: !newItem.trim(), style: {
                padding: '6px 12px',
                background: newItem.trim() ? '#4299e1' : '#4a5568',
                border: 'none',
                borderRadius: 4,
                color: 'white',
                cursor: newItem.trim() ? 'pointer' : 'not-allowed',
                fontSize: 12,
                whiteSpace: 'nowrap',
            }, children: addButtonText })] });
div >
;
;
;
