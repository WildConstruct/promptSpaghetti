/**
 * User dropdown menu component
 */

import React, { forwardRef, useState } from 'react';

interface UserDropdownProps {
  user: {
    email: string;
    name?: string;
    avatar?: string;
  };
  onSignOut: () => void;
  onClose: () => void;
}

export const UserDropdown = forwardRef<HTMLDivElement, UserDropdownProps>(
  ({ user, onSignOut, onClose }, ref) => {
    const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
    
    const handleSignOut = () => {
      if (showSignOutConfirm) {
        onSignOut();
      } else {
        setShowSignOutConfirm(true);
      }
    };
    
    const handleCancel = () => {
      setShowSignOutConfirm(false);
    };
    
    return (
      <div
        ref={ref}
        style={{
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
        }}
        role="menu"
      >
        {/* User Info */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #e9ecef'
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#212529',
              marginBottom: '4px'
            }}
          >
            {user.name || 'User'}
          </div>
          <div
            style={{
              fontSize: '13px',
              color: '#6c757d',
              wordBreak: 'break-all'
            }}
          >
            {user.email}
          </div>
        </div>
        
        {/* Menu Items */}
        <div style={{ padding: '8px 0' }}>
          <MenuItem
            icon="⚙️"
            label="Settings"
            onClick={() => {
              console.log('Settings clicked');
              onClose();
            }}
          />
          <MenuItem
            icon="👤"
            label="Profile"
            onClick={() => {
              console.log('Profile clicked');
              onClose();
            }}
          />
          <MenuItem
            icon="💾"
            label="My Graphs"
            onClick={() => {
              console.log('My Graphs clicked');
              onClose();
            }}
          />
          
          <div
            style={{
              height: '1px',
              backgroundColor: '#e9ecef',
              margin: '8px 0'
            }}
          />
          
          {!showSignOutConfirm ? (
            <MenuItem
              icon="🚪"
              label="Sign Out"
              onClick={handleSignOut}
              danger
            />
          ) : (
            <div style={{ padding: '8px 16px' }}>
              <div
                style={{
                  fontSize: '13px',
                  color: '#dc3545',
                  marginBottom: '8px'
                }}
              >
                Are you sure you want to sign out?
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleCancel}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    backgroundColor: 'white',
                    color: '#495057',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignOut}
                  style={{
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
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#c82333';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc3545';
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* CSS Animation */}
        <style>{`
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
        `}</style>
      </div>
    );
  }
);

UserDropdown.displayName = 'UserDropdown';

/**
 * Menu item component
 */
function MenuItem({
  icon,
  label,
  onClick,
  danger = false
}: {
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
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
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = danger ? '#fff5f5' : '#f8f9fa';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      role="menuitem"
    >
      <span style={{ fontSize: '16px' }}>{icon}</span>
      {label}
    </button>
  );
}