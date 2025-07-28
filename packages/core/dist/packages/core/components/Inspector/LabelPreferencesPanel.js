import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Label Preferences Panel
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 2
 *
 * Inspector panel component for managing node label preferences
 * including display modes, positioning, styling, and behavior settings.
 */
import { useCallback } from 'react';
import { useGraphStore } from '../../graphStore';
{
    const { annotations, setLabelPreferences } = useGraphStore();
    const preferences = annotations.labelPreferences;
    const handlePreferenceChange = useCallback((updates) => {
        setLabelPreferences(updates);
    }, [setLabelPreferences]);
    const displayModeOptions = [
        { value: 'always', label: 'Always Visible', description: 'Labels are always shown' },
        { value: 'hover', label: 'On Hover', description: 'Labels appear when hovering over nodes' },
        { value: 'focus', label: 'On Focus', description: 'Labels appear when nodes are focused' },
        { value: 'selected', label: 'When Selected', description: 'Labels appear when nodes are selected' },
        { value: 'never', label: 'Hidden', description: 'Labels are never shown' }
    ];
    const positionOptions = [
        { value: 'top', label: 'Top' },
        { value: 'bottom', label: 'Bottom' },
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
        { value: 'center', label: 'Center' }
    ];
    const styleOptions = [
        { value: 'default', label: 'Default', description: 'Clean white background with shadow' },
        { value: 'minimal', label: 'Minimal', description: 'Transparent background, subtle text' },
        { value: 'professional', label: 'Professional', description: 'Gradient background, bold text' },
        { value: 'colorful', label: 'Colorful', description: 'Yellow theme with bold styling' },
        { value: 'outline', label: 'Outline', description: 'Transparent with colored border' }
    ];
    return;
    _jsxs("div", { style: {
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            width: '320px',
            fontFamily: 'var(--font-primary)',
            boxShadow: 'var(--shadow-lg)',
        }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-4)',
                    paddingBottom: 'var(--space-3)',
                    borderBottom: '1px solid var(--border)',
                }, children: [_jsx("h3", { style: {
                            margin: 0,
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                        }, children: "\uD83C\uDFF7\uFE0F Label Preferences" }), onClose && ()
                        < button, "onClick=", onClose, "style=", {
                        background: 'none',
                        border: 'none',
                        fontSize: '18px',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        padding: '4px',
                        borderRadius: '4px',
                        transition: 'all 0.2s ease',
                    }, "onMouseEnter=", (e) => {
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                    }, "onMouseLeave=", (e) => {
                        e.currentTarget.style.background = 'none';
                    }, "> \u00D7"] }), ")}"] });
    { /* Display Mode */ }
    _jsxs("div", { style: { marginBottom: 'var(--space-4)' }, children: [_jsx("label", { style: {
                    display: 'block',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--space-2)',
                }, children: "Display Mode" }), _jsx("select", { value: preferences.defaultDisplayMode, onChange: (e) => handlePreferenceChange({}), "defaultDisplayMode:e": true }), ".target.value as NodeLabelDisplayMode ; })} style=", {
                width: '100%',
                padding: 'var(--space-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: 'var(--font-size-sm)',
            }, ">", displayModeOptions.map(option => ()
                < option, key = { option, : .value }, value = { option, : .value }, title = { option, : .description } >
                { option, : .label })] });
}
select >
    _jsx("div", { style: {
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-secondary)',
            marginTop: 'var(--space-1)',
            fontStyle: 'italic',
        }, children: displayModeOptions.find(opt => opt.value === preferences.defaultDisplayMode)?.description });
div >
    { /* Position */}
    < div;
style = {};
{
    marginBottom: 'var(--space-4)';
}
 >
    (_jsx("label", { style: {
            display: 'block',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-2)',
        }, children: "Default Position" })
        ,
            _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 'var(--space-2)',
                }, children: [positionOptions.map(option => ()
                        < button, key = { option, : .value }, onClick = {}()), " => handlePreferenceChange(", defaultPosition, ": option.value })} style=", ({
                        padding: 'var(--space-2)',
                        border: preferences.defaultPosition === option.value,
                    }
                        ? '2px solid var(--accent-orange)'
                        : '1px solid var(--border)',
                        borderRadius), ": 'var(--radius-md)', background: preferences.defaultPosition === option.value , ? 'var(--accent-orange)10' : 'var(--bg-secondary)', color: preferences.defaultPosition === option.value , ? 'var(--accent-orange)' : 'var(--text-primary)', fontSize: 'var(--font-size-xs)', cursor: 'pointer', transition: 'all 0.2s ease', }} >", option.label] }));
div >
;
div >
    { /* Style */}
    < div;
style = {};
{
    marginBottom: 'var(--space-4)';
}
 >
    (_jsx("label", { style: {
            display: 'block',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-2)',
        }, children: "Label Style" })
        ,
            _jsx("select", { value: preferences.defaultStyle, onChange: (e) => handlePreferenceChange({}), "defaultStyle:e": true, target: true, value: true, as: true, NodeLabelStyle: true, style: {
                    width: '100%',
                    padding: 'var(--space-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--font-size-sm)',
                }, children: styleOptions.map(option => ()
                    < option, key = { option, : .value }, value = { option, : .value }, title = { option, : .description } >
                    { option, : .label }) }));
select >
    _jsx("div", { style: {
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-secondary)',
            marginTop: 'var(--space-1)',
            fontStyle: 'italic',
        }, children: styleOptions.find(opt => opt.value === preferences.defaultStyle)?.description });
div >
    { /* Behavior Settings */}
    < div;
style = {};
{
    marginBottom: 'var(--space-4)';
}
 >
    _jsx("h4", { style: {
            margin: '0 0 var(--space-3) 0',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            color: 'var(--text-primary)',
        }, children: "Behavior" });
{ /* Inline Editing */ }
_jsxs("label", { style: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 'var(--space-2)',
        cursor: 'pointer',
    }, children: [_jsx("input", { type: "checkbox", checked: preferences.enableInlineEditing, onChange: (e) => handlePreferenceChange({ enableInlineEditing: e.target.checked }), style: { marginRight: 'var(--space-2)' } }), _jsx("span", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }, children: "Enable inline editing" })] });
{ /* Auto Save */ }
_jsxs("label", { style: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 'var(--space-2)',
        cursor: 'pointer',
    }, children: [_jsx("input", { type: "checkbox", checked: preferences.enableAutoSave, onChange: (e) => handlePreferenceChange({ enableAutoSave: e.target.checked }), style: { marginRight: 'var(--space-2)' } }), _jsx("span", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }, children: "Auto-save changes" })] });
{ /* Show Tooltips */ }
_jsxs("label", { style: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 'var(--space-2)',
        cursor: 'pointer',
    }, children: [_jsx("input", { type: "checkbox", checked: preferences.showLabelTooltips, onChange: (e) => handlePreferenceChange({ showLabelTooltips: e.target.checked }), style: { marginRight: 'var(--space-2)' } }), _jsx("span", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }, children: "Show label tooltips" })] });
div >
    { /* Max Label Length */}
    < div;
style = {};
{
    marginBottom: 'var(--space-4)';
}
 >
    (_jsxs("label", { style: {
            display: 'block',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-2)',
        }, children: ["Max Label Length: ", preferences.maxLabelLength] })
        ,
            _jsx("input", { type: "range", min: "10", max: "100", value: preferences.maxLabelLength, onChange: (e) => handlePreferenceChange({ maxLabelLength: parseInt(e.target.value) }), style: {
                    width: '100%',
                    accentColor: 'var(--accent-orange)',
                } })
                ,
                    _jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--text-secondary)',
                            marginTop: 'var(--space-1)',
                        }, children: [_jsx("span", { children: "10" }), _jsx("span", { children: "100" })] }));
div >
    { /* Keyboard Shortcuts Info */}
    < div;
style = {};
{
    padding: 'var(--space-3)',
        background;
    'var(--bg-secondary)',
        borderRadius;
    'var(--radius-md)',
        border;
    '1px solid var(--border)',
    ;
}
    >
        (_jsx("h4", { style: {
                margin: '0 0 var(--space-2) 0',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--text-primary)',
            }, children: "Keyboard Shortcuts" })
            ,
                _jsxs("div", { style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.4 }, children: [_jsxs("div", { children: [_jsx("kbd", { style: { background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '3px' }, children: "L" }), " - Add/edit label for selected node"] }), _jsxs("div", { children: [_jsx("kbd", { style: { background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '3px' }, children: "Enter" }), " - Save label changes"] }), _jsxs("div", { children: [_jsx("kbd", { style: { background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '3px' }, children: "Esc" }), " - Cancel editing"] })] }));
div >
;
div >
;
;
;
export default LabelPreferencesPanel;
