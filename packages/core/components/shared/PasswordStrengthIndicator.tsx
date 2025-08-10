/**
 * Password strength indicator component
 */

import React from 'react';
import { PasswordStrength } from '../../hooks/useAuthValidation';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function PasswordStrengthIndicator({ 
  strength, 
  requirements 
}: PasswordStrengthIndicatorProps) {
  const strengthConfig = {
    weak: {
      width: '33%',
      color: '#dc3545',
      label: 'Weak'
    },
    medium: {
      width: '66%',
      color: '#ffc107',
      label: 'Medium'
    },
    strong: {
      width: '100%',
      color: '#28a745',
      label: 'Strong'
    }
  };
  
  const config = strengthConfig[strength];
  
  return (
    <div style={{ marginBottom: '20px', marginTop: '-10px' }}>
      {/* Strength Bar */}
      <div style={{ marginBottom: '12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px'
          }}
        >
          <span
            style={{
              fontSize: '12px',
              color: '#6c757d',
              fontWeight: '500'
            }}
          >
            Password Strength
          </span>
          <span
            style={{
              fontSize: '12px',
              color: config.color,
              fontWeight: '600'
            }}
          >
            {config.label}
          </span>
        </div>
        
        <div
          style={{
            height: '4px',
            backgroundColor: '#e9ecef',
            borderRadius: '2px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              height: '100%',
              width: config.width,
              backgroundColor: config.color,
              transition: 'width 0.3s ease, background-color 0.3s ease'
            }}
          />
        </div>
      </div>
      
      {/* Requirements Checklist */}
      <div
        style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          padding: '10px',
          fontSize: '12px'
        }}
      >
        <div style={{ marginBottom: '4px', fontWeight: '500', color: '#495057' }}>
          Password requirements:
        </div>
        
        <ul
          style={{
            margin: 0,
            paddingLeft: '20px',
            listStyle: 'none'
          }}
        >
          <RequirementItem
            met={requirements.minLength}
            text="At least 8 characters"
          />
          <RequirementItem
            met={requirements.hasUppercase}
            text="One uppercase letter"
          />
          <RequirementItem
            met={requirements.hasNumber}
            text="One number"
          />
          <RequirementItem
            met={requirements.hasLowercase}
            text="One lowercase letter"
            optional
          />
          <RequirementItem
            met={requirements.hasSpecial}
            text="One special character"
            optional
          />
        </ul>
      </div>
    </div>
  );
}

function RequirementItem({ 
  met, 
  text, 
  optional = false 
}: { 
  met: boolean; 
  text: string; 
  optional?: boolean;
}) {
  return (
    <li
      style={{
        position: 'relative',
        paddingLeft: '20px',
        marginBottom: '2px',
        color: met ? '#28a745' : optional ? '#6c757d' : '#dc3545'
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: '1px'
        }}
      >
        {met ? '✓' : optional ? '○' : '✗'}
      </span>
      {text}
      {optional && (
        <span
          style={{
            marginLeft: '4px',
            color: '#6c757d',
            fontStyle: 'italic'
          }}
        >
          (recommended)
        </span>
      )}
    </li>
  );
}