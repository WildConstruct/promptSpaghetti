/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * StatusBadge - Consistent status display component
 * REFACTOR-002: Admin Dashboard Architecture Consolidation
 * 
 * Standardized badge component for status indicators across admin interfaces
 */
import React from 'react';

export type StatusType = 
  | 'active' | 'inactive' | 'enabled' | 'disabled' 
  | 'pending' | 'approved' | 'rejected' | 'suspended'
  | 'online' | 'offline' | 'success' | 'error' | 'warning'
  | 'high' | 'medium' | 'low' | 'critical';

export type StatusSize = 'small' | 'medium' | 'large';


interface StatusBadgeProps {
  status: StatusType | string;
  size?: StatusSize;
  variant?: 'solid' | 'outline' | 'soft';
  children?: React.ReactNode;
  className?: string;


const statusConfigs: Record<string, { color: string; icon?: string; label?: string }> = {
  // Boolean states
  active: { color: '#10b981', icon: '●', label: 'Active' },
  inactive: { color: '#6b7280', icon: '●', label: 'Inactive' },
  enabled: { color: '#10b981', icon: '✓', label: 'Enabled' },
  disabled: { color: '#ef4444', icon: '✕', label: 'Disabled' },
  // Workflow states
  pending: { color: '#f59e0b', icon: '⏳', label: 'Pending' },
  approved: { color: '#10b981', icon: '✓', label: 'Approved' },
  rejected: { color: '#ef4444', icon: '✕', label: 'Rejected' },
  suspended: { color: '#f59e0b', icon: '⏸', label: 'Suspended' },
  // Connection states
  online: { color: '#10b981', icon: '●', label: 'Online' },
  offline: { color: '#6b7280', icon: '●', label: 'Offline' },
  // Result states
  success: { color: '#10b981', icon: '✓', label: 'Success' },
  error: { color: '#ef4444', icon: '✕', label: 'Error' },
  warning: { color: '#f59e0b', icon: '⚠', label: 'Warning' },
  // Priority levels
  critical: { color: '#dc2626', icon: '🔴', label: 'Critical' },
  high: { color: '#f59e0b', icon: '🟡', label: 'High' },
  medium: { color: '#3b82f6', icon: '🔵', label: 'Medium' },
  low: { color: '#6b7280', icon: '⚪', label: 'Low' }
};
const sizeConfigs = {
  small: {,
  padding: '2px 6px',
  fontSize: '11px',
  gap: '4px',
},
  medium: {,
  padding: '4px 8px',
  fontSize: '12px',
  gap: '6px',
},
  large: {,
  padding: '6px 12px',
  fontSize: '14px',
  gap: '8px',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({)
  status,
  size = 'medium',
  variant = 'soft',
  children,
  className = ''
}) => {
  const config = statusConfigs[status.toLowerCase()] || statusConfigs.medium;
  const sizeConfig = sizeConfigs[size];
  const getVariantStyles = () => {
    const baseColor = config.color;
    switch (variant) {
      case 'solid':
        return {
          backgroundColor: baseColor,
          color: '#ffffff',
          border: `1px solid ${baseColor}`}
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: baseColor,
          border: `1px solid ${baseColor}`}
        };
      case 'soft':
      default:
        return {,
  backgroundColor: `${baseColor}15`}
},
  color: baseColor,
          border: `1px solid ${baseColor}40`}
        };
  };
  const variantStyles = getVariantStyles();
  return;
    <span
      className={`status-badge ${className}`}
      style={{
  display: 'inline-flex',
  alignItems: 'center',
  gap: sizeConfig.gap,
  padding: sizeConfig.padding,
  fontSize: sizeConfig.fontSize,
  fontWeight: '500',
  borderRadius: '12px',
  whiteSpace: 'nowrap',
  ...variantStyles

    >
      {config.icon && <span className="status-icon">{config.icon}</span>}
      <span className="status-text">
        {children || config.label || status}
      </span>
    </span>
  );
};

export default StatusBadge;