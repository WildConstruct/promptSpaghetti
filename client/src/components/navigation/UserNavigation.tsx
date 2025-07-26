/**
 * User Navigation Component
 * 
 * AUTH-985114-AF38: Update Navigation System for Authentication
 * 
 * Displays user information and role-based navigation options in the main app header.
 * Integrates with the auth store to show authenticated user details and provides
 * quick access to user-specific features based on roles and permissions.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { User, ChevronDown, Settings, Shield, Users } from 'lucide-react';

interface UserNavigationProps {
  className?: string;
}

export   const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return null;
  }

  // Check if user has admin role
  const isAdmin = user.roles?.includes('admin') || user.roles?.includes('administrator');
  
  // Get user display name
  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.firstName ?? user.lastName ?? user.email.split('@')[0];

  const userInitials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : displayName.slice(0, 2);

  const handleOptionClick = (action: string) => {
    setDropdownOpen(false);
    
    switch (action) {
    case 'profile':
      // Navigate to profile page
      navigate('/profile');
      break;
    case 'settings':
      // Navigate to user settings
      navigate('/settings');
      break;
    case 'admin':
      // Navigate to admin panel
      navigate('/admin');
      break;
    case 'user-management':
      // Navigate to user management dashboard
      navigate('/admin/users');
      break;
    default:
      break;
    }
  };

  return (
    <div className={`user-navigation ${className}`} style={{ position: 'relative' }}>
      {/* User Info Button */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          border: '1px solid #e1e5e9',
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#374151',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.backgroundColor = '#f8f9fa';
          e.currentTarget.style.borderColor = '#d1d5db';
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.borderColor = '#e1e5e9';
        }}
      >
        {/* User Avatar */}
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          {userInitials.toUpperCase()}
        </div>
        
        {/* User Name */}
        <span style={{ fontWeight: '500' }}>
          {displayName}
        </span>
        
        {/* Role Badge */}
        {isAdmin && (
          <span
            style={{
              padding: '2px 6px',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '600'
            }}
          >
            Admin
          </span>
        )}
        
        {/* Dropdown Icon */}
        <ChevronDown 
          size={14} 
          style={{ 
            transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }} 
        />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10
            }}
            onClick={() => setDropdownOpen(false)}
          />
          
          {/* Menu */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              width: '240px',
              backgroundColor: 'white',
              border: '1px solid #e1e5e9',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              zIndex: 20,
              overflow: 'hidden'
            }}
          >
            {/* User Info Header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                {displayName}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {user.email}
              </div>
              {user.roles && user.roles.length > 0 && (
                <div style={{ marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {user.roles.map((role) => (
                    <span
                      key={role}
                      style={{
                        padding: '2px 6px',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '500'
                      }}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Menu Options */}
            <div style={{ padding: '8px 0' }}>
              <button
                onClick={() => handleOptionClick('profile')}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <User size={16} />
                My Profile
              </button>
              
              <button
                onClick={() => handleOptionClick('settings')}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Settings size={16} />
                Settings
              </button>

              {/* Admin Menu Section */}
              {isAdmin && (
                <>
                  <div
                    style={{
                      margin: '8px 0',
                      borderTop: '1px solid #f3f4f6'
                    }}
                  />
                  <button
                    onClick={() => handleOptionClick('user-management')}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.backgroundColor = '#fef3c7';
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Users size={16} />
                    User Management
                  </button>
                  
                  <button
                    onClick={() => handleOptionClick('admin')}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.backgroundColor = '#fef3c7';
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Shield size={16} />
                    Admin Panel
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};