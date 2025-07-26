import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Sticky Note Toolbar
 * Epic 8.7 Task 1: Professional toolbar for sticky notes management
 *
 * Features:
 * - Color selection
 * - Category management
 * - Quick templates
 * - Settings toggle
 * - Professional Cinema 4D quality UI
 */
import { useState } from 'react';
const COLORS = [
    { value: 'yellow', label: 'Yellow', bg: '#FEF3C7', border: '#F59E0B' },
    { value: 'blue', label: 'Blue', bg: '#DBEAFE', border: '#3B82F6' },
    { value: 'green', label: 'Green', bg: '#D1FAE5', border: '#10B981' },
    { value: 'red', label: 'Red', bg: '#FEE2E2', border: '#EF4444' },
    { value: 'purple', label: 'Purple', bg: '#EDE9FE', border: '#8B5CF6' },
    { value: 'orange', label: 'Orange', bg: '#FED7AA', border: '#F97316' },
    { value: 'pink', label: 'Pink', bg: '#FCE7F3', border: '#EC4899' },
    { value: 'gray', label: 'Gray', bg: '#F3F4F6', border: '#6B7280' }
];
const CATEGORIES = [
    { value: 'general', label: 'General', icon: '📝' },
    { value: 'technical', label: 'Technical', icon: '⚙️' },
    { value: 'creative', label: 'Creative', icon: '💡' },
    { value: 'feedback', label: 'Feedback', icon: '💬' },
    { value: 'question', label: 'Question', icon: '❓' },
    { value: 'decision', label: 'Decision', icon: '✅' },
    { value: 'action-item', label: 'Action Item', icon: '🎯' },
    { value: 'reference', label: 'Reference', icon: '📚' }
];
const QUICK_TEMPLATES = [
    { color: 'yellow', category: 'general', content: 'General note...', icon: '📝' },
    { color: 'blue', category: 'technical', content: 'Technical note: ', icon: '⚙️' },
    { color: 'green', category: 'decision', content: 'Decision: ', icon: '✅' },
    { color: 'red', category: 'action-item', content: 'TODO: ', icon: '🎯' },
    { color: 'purple', category: 'creative', content: 'Idea: ', icon: '💡' },
    { color: 'orange', category: 'question', content: 'Question: ', icon: '❓' }
];
export const StickyNoteToolbar = ({ selectedNotes, onColorChange, onCategoryChange, onCreate, onSettingsChange, settings, className = '' }) => {
    const [expanded, setExpanded] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const hasSelection = selectedNotes.length > 0;
    const toolbarStyle = {
        position: 'fixed',
        top: 20,
        right: 20,
        background: '#FFFFFF',
        borderRadius: 12,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.05)',
        border: '1px solid #E5E7EB',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        zIndex: 2000,
        userSelect: 'none',
        overflow: 'hidden'
    };
    const sectionStyle = {
        padding: '8px 12px',
        borderBottom: '1px solid #F3F4F6'
    };
    const buttonStyle = {
        background: 'none',
        border: 'none',
        borderRadius: 6,
        padding: '6px 8px',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 500,
        color: '#374151',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        transition: 'background-color 0.15s ease'
    };
    const colorButtonStyle = {
        width: 24,
        height: 24,
        borderRadius: 4,
        border: '2px solid transparent',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease'
    };
    return (_jsxs("div", { className: `sticky-note-toolbar ${className}`, style: toolbarStyle, children: [_jsx("div", { style: sectionStyle, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("button", { style: {
                                ...buttonStyle,
                                background: expanded ? '#F3F4F6' : 'transparent'
                            }, onClick: () => setExpanded(!expanded), title: "Toggle sticky notes toolbar", children: "\uD83D\uDCDD" }), _jsx("button", { style: buttonStyle, onClick: () => onCreate('yellow', 'general', 'New note...'), title: "Add sticky note (Cmd+N)", children: "\u2795" }), _jsx("button", { style: {
                                ...buttonStyle,
                                background: showTemplates ? '#F3F4F6' : 'transparent'
                            }, onClick: () => setShowTemplates(!showTemplates), title: "Quick templates", children: "\uD83D\uDCCB" }), _jsx("button", { style: {
                                ...buttonStyle,
                                background: showSettings ? '#F3F4F6' : 'transparent'
                            }, onClick: () => setShowSettings(!showSettings), title: "Settings", children: "\u2699\uFE0F" }), hasSelection && (_jsxs("div", { style: {
                                fontSize: 11,
                                color: '#6B7280',
                                background: '#F9FAFB',
                                padding: '2px 6px',
                                borderRadius: 4,
                                marginLeft: 4
                            }, children: [selectedNotes.length, " selected"] }))] }) }), expanded && (_jsxs(_Fragment, { children: [_jsxs("div", { style: sectionStyle, children: [_jsx("div", { style: { fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 8 }, children: "Colors" }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 200 }, children: COLORS.map(color => (_jsx("button", { style: {
                                        ...colorButtonStyle,
                                        backgroundColor: color.bg,
                                        borderColor: hasSelection ? color.border : 'transparent'
                                    }, onClick: () => onColorChange(color.value), title: `${color.label} notes`, onMouseEnter: (e) => {
                                        e.currentTarget.style.borderColor = color.border;
                                    }, onMouseLeave: (e) => {
                                        e.currentTarget.style.borderColor = hasSelection ? color.border : 'transparent';
                                    } }, color.value))) })] }), _jsxs("div", { style: sectionStyle, children: [_jsx("div", { style: { fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 8 }, children: "Categories" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, maxWidth: 200 }, children: CATEGORIES.map(category => (_jsxs("button", { style: {
                                        ...buttonStyle,
                                        fontSize: 11,
                                        background: hasSelection && selectedNotes.every(n => n.appearance.category === category.value)
                                            ? '#EBF8FF'
                                            : 'transparent'
                                    }, onClick: () => onCategoryChange(category.value), title: category.label, onMouseEnter: (e) => {
                                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                                    }, onMouseLeave: (e) => {
                                        e.currentTarget.style.backgroundColor =
                                            hasSelection && selectedNotes.every(n => n.appearance.category === category.value)
                                                ? '#EBF8FF'
                                                : 'transparent';
                                    }, children: [_jsx("span", { children: category.icon }), _jsx("span", { children: category.label })] }, category.value))) })] })] })), showTemplates && (_jsxs("div", { style: sectionStyle, children: [_jsx("div", { style: { fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 8 }, children: "Quick Templates" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 180 }, children: QUICK_TEMPLATES.map((template, index) => (_jsxs("button", { style: {
                                ...buttonStyle,
                                justifyContent: 'flex-start',
                                padding: '8px 12px'
                            }, onClick: () => {
                                onCreate(template.color, template.category, template.content);
                                setShowTemplates(false);
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = '#F9FAFB';
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }, children: [_jsx("span", { children: template.icon }), _jsx("span", { children: template.content })] }, index))) })] })), showSettings && (_jsxs("div", { style: sectionStyle, children: [_jsx("div", { style: { fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 8 }, children: "Settings" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 180 }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: settings.ghostMode, onChange: (e) => onSettingsChange({ ghostMode: e.target.checked }), style: { margin: 0 } }), _jsx("span", { style: { fontSize: 12, color: '#374151' }, children: "Ghost mode" })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: settings.snapToGrid, onChange: (e) => onSettingsChange({ snapToGrid: e.target.checked }), style: { margin: 0 } }), _jsx("span", { style: { fontSize: 12, color: '#374151' }, children: "Snap to grid" })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: settings.showAll, onChange: (e) => onSettingsChange({ showAll: e.target.checked }), style: { margin: 0 } }), _jsx("span", { style: { fontSize: 12, color: '#374151' }, children: "Show all notes" })] }), settings.snapToGrid && (_jsxs("div", { children: [_jsxs("label", { style: { fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 4 }, children: ["Grid size: ", settings.gridSize, "px"] }), _jsx("input", { type: "range", min: "10", max: "50", value: settings.gridSize, onChange: (e) => onSettingsChange({ gridSize: parseInt(e.target.value) }), style: { width: '100%' } })] }))] })] })), expanded && (_jsx("div", { style: {
                    padding: '6px 12px',
                    backgroundColor: '#F9FAFB',
                    fontSize: 10,
                    color: '#6B7280',
                    borderTop: '1px solid #F3F4F6'
                }, children: _jsx("div", { children: "\u2318N New \u2022 \u2318D Duplicate \u2022 Del Delete \u2022 Esc Deselect" }) }))] }));
};
export default StickyNoteToolbar;
