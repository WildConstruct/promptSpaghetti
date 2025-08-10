/**
 * User avatar component for header display
 */

import React, { useState, useRef, useEffect } from 'react';
import { UserDropdown } from './UserDropdown';

interface UserAvatarProps {
  user: {
    email: string;
    name?: string;
    avatar?: string;
  } | null;
  onSignOut: () => void;
  onSignIn: () => void;
}

export function UserAvatar({ user, onSignOut, onSignIn }: UserAvatarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);
  
  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
        buttonRef.current?.focus();
      }
    };
    
    if (showDropdown) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showDropdown]);
  
  if (!user) {
    return (
      <button
        onClick={onSignIn}
        style={{
          padding: '8px 16px',
          borderRadius: '6px',
          border: '1px solid #007bff',
          backgroundColor: 'white',
          color: '#007bff',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#007bff';
          e.currentTarget.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.color = '#007bff';
        }}
      >
        <span style={{ fontSize: '16px' }}>👤</span>
        Sign In
      </button>
    );
  }
  
  // Get user initials
  const getInitials = () => {
    if (user.name) {
      return user.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email[0].toUpperCase();
  };
  
  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '2px solid transparent',
          backgroundColor: user.avatar ? 'transparent' : '#007bff',
          color: 'white',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          overflow: 'hidden',
          outline: showDropdown ? '2px solid #007bff' : 'none',
          outlineOffset: '2px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#007bff';
        }}
        onMouseLeave={(e) => {
          if (!showDropdown) {
            e.currentTarget.style.borderColor = 'transparent';
          }
        }}
        aria-label="User menu"
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || user.email}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          getInitials()
        )}
      </button>
      
      {showDropdown && (
        <UserDropdown
          ref={dropdownRef}
          user={user}
          onSignOut={() => {
            setShowDropdown(false);
            onSignOut();
          }}
          onClose={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}