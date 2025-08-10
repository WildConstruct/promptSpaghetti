import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * User dropdown menu component
 */
import { forwardRef, useState } from 'react';
export const UserDropdown = forwardRef(({ user, onSignOut, onClose }, ref) => {
    const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
    const handleSignOut = () => {
        if (showSignOutConfirm) {
            onSignOut();
        }
        else {
            setShowSignOutConfirm(true);
        }
    };
    const handleCancel = () => {
        setShowSignOutConfirm(false);
    };
    return (_jsxs("div", { ref: ref, style: {
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: '240px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e9ecef',
            zIndex: 1000,
            animation: 'dropdownSlide 0.2s ease'
        }, role: "menu", children: [_jsxs("div", { style: {
                    padding: '16px',
                    borderBottom: '1px solid #e9ecef'
                }, children: [_jsx("div", { style: {
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#212529',
                            marginBottom: '4px'
                        }, children: user.name || 'User' }), _jsx("div", { style: {
                            fontSize: '13px',
                            color: '#6c757d',
                            wordBreak: 'break-all'
                        }, children: user.email })] }), _jsxs("div", { style: { padding: '8px 0' }, children: [_jsx(MenuItem, { icon: "\u2699\uFE0F", label: "Settings", onClick: () => {
                            console.log('Settings clicked');
                            onClose();
                        } }), _jsx(MenuItem, { icon: "\uD83D\uDC64", label: "Profile", onClick: () => {
                            console.log('Profile clicked');
                            onClose();
                        } }), _jsx(MenuItem, { icon: "\uD83D\uDCBE", label: "My Graphs", onClick: () => {
                            console.log('My Graphs clicked');
                            onClose();
                        } }), _jsx("div", { style: {
                            height: '1px',
                            backgroundColor: '#e9ecef',
                            margin: '8px 0'
                        } }), !showSignOutConfirm ? (_jsx(MenuItem, { icon: "\uD83D\uDEAA", label: "Sign Out", onClick: handleSignOut, danger: true })) : (_jsxs("div", { style: { padding: '8px 16px' }, children: [_jsx("div", { style: {
                                    fontSize: '13px',
                                    color: '#dc3545',
                                    marginBottom: '8px'
                                }, children: "Are you sure you want to sign out?" }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { onClick: handleCancel, style: {
                                            flex: 1,
                                            padding: '6px 12px',
                                            borderRadius: '4px',
                                            border: '1px solid #dee2e6',
                                            backgroundColor: 'white',
                                            color: '#495057',
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        }, onMouseEnter: (e) => {
                                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                                        }, onMouseLeave: (e) => {
                                            e.currentTarget.style.backgroundColor = 'white';
                                        }, children: "Cancel" }), _jsx("button", { onClick: handleSignOut, style: {
                                            flex: 1,
                                            padding: '6px 12px',
                                            borderRadius: '4px',
                                            border: 'none',
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        }, onMouseEnter: (e) => {
                                            e.currentTarget.style.backgroundColor = '#c82333';
                                        }, onMouseLeave: (e) => {
                                            e.currentTarget.style.backgroundColor = '#dc3545';
                                        }, children: "Sign Out" })] })] }))] }), _jsx("style", { children: `
          @keyframes dropdownSlide {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        ` })] }));
});
UserDropdown.displayName = 'UserDropdown';
/**
 * Menu item component
 */
function MenuItem({ icon, label, onClick, danger = false }) {
    return (_jsxs("button", { onClick: onClick, style: {
            width: '100%',
            padding: '10px 16px',
            border: 'none',
            backgroundColor: 'transparent',
            color: danger ? '#dc3545' : '#212529',
            fontSize: '14px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        }, onMouseEnter: (e) => {
            e.currentTarget.style.backgroundColor = danger ? '#fff5f5' : '#f8f9fa';
        }, onMouseLeave: (e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
        }, role: "menuitem", children: [_jsx("span", { style: { fontSize: '16px' }, children: icon }), label] }));
}
