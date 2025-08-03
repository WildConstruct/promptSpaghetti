import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
actionDescription = 'continue';
{
    if (!isOpen)
        return null;
    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000 };
}
;
const dialogStyle = {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    minWidth: 400,
    maxWidth: 500,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    fontFamily: 'system-ui, -apple-system, sans-serif' };
;
const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 16,
    fontSize: 18,
    fontWeight: 600,
    color: '#1f2937' };
;
const iconStyle = {
    fontSize: 24,
    marginRight: 12,
    color: '#f59e0b' };
;
const messageStyle = {
    marginBottom: 24,
    lineHeight: 1.5,
    color: '#374151' };
;
const projectNameStyle = {
    fontWeight: 600,
    color: '#1f2937' };
;
const buttonGroupStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12 };
;
const buttonBaseStyle = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    transition: 'background-color 0.2s' };
;
const saveButtonStyle = { ...buttonBaseStyle,
    backgroundColor: '#3b82f6',
    color: 'white' };
;
const dontSaveButtonStyle = { ...buttonBaseStyle,
    backgroundColor: '#dc2626',
    color: 'white' };
;
const cancelButtonStyle = { ...buttonBaseStyle,
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db' };
;
return;
_jsxs("div", { style: overlayStyle, onClick: onCancel, children: [_jsxs("div", { style: dialogStyle, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { style: headerStyle, children: [_jsx("span", { style: iconStyle, children: "\u26A0\uFE0F" }), "Unsaved Changes"] }), _jsxs("div", { style: messageStyle, children: [projectName ? ()
                            :
                        , "You have unsaved changes in ", _jsxs("span", { style: projectNameStyle, children: ["\"", projectName, "\""] }), ".", _jsx("br", {}), "Do you want to save your changes before ", actionDescription, "?"] }), ") : ()", _jsxs(_Fragment, { children: ["You have unsaved changes in your current project.", _jsx("br", {}), "Do you want to save your changes before ", actionDescription, "?"] }), ")}"] }), _jsxs("div", { style: buttonGroupStyle, children: [_jsx("button", { style: cancelButtonStyle, onClick: onCancel, onMouseEnter: (e) => {
                        e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }, onMouseLeave: (e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }, children: "Cancel" }), _jsx("button", { style: dontSaveButtonStyle, onClick: onDontSave, onMouseEnter: (e) => {
                        e.currentTarget.style.backgroundColor = '#b91c1c';
                    }, onMouseLeave: (e) => {
                        e.currentTarget.style.backgroundColor = '#dc2626';
                    }, children: "Don't Save" }), _jsx("button", { style: saveButtonStyle, onClick: onSave, onMouseEnter: (e) => {
                        e.currentTarget.style.backgroundColor = '#2563eb';
                    }, onMouseLeave: (e) => {
                        e.currentTarget.style.backgroundColor = '#3b82f6';
                    }, children: "Save" })] })] });
div >
;
;
;
export default UnsavedChangesDialog;
