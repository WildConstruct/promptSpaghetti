// Epic 9.4.3 - Lock Indicator Component
// Visual indicator for lock status on resources

import React from 'react';
import { Lock, AlertTriangle, Users, Shield } from 'lucide-react';
import { WorkflowLock } from '../types/locking';

interface LockIndicatorProps {
  lock: WorkflowLock;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
  className?: string;
}

export const LockIndicator: React.FC<LockIndicatorProps> = ({
  lock,
  size = 'medium',
  showTooltip = true,
  className = ''
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6'
  };

  const containerSizeClasses = {
    small: 'p-1',
    medium: 'p-2',
    large: 'p-3'
  };

  const getIconAndColor = () => {
    const isExpired = lock.expires_at && new Date(lock.expires_at) < new Date();
    
    if (isExpired) {
      return {
        icon: AlertTriangle,
        color: 'text-red-500',
        bg: 'bg-red-100',
        border: 'border-red-300'
      };
    }

    switch (lock.lock_type) {
    case 'admin':
      return {
        icon: Shield,
        color: 'text-purple-500',
        bg: 'bg-purple-100',
        border: 'border-purple-300'
      };
    case 'delete':
      return {
        icon: AlertTriangle,
        color: 'text-red-500',
        bg: 'bg-red-100',
        border: 'border-red-300'
      };
    case 'state_change':
      return {
        icon: Users,
        color: 'text-orange-500',
        bg: 'bg-orange-100',
        border: 'border-orange-300'
      };
    case 'edit':
    default:
      return {
        icon: Lock,
        color: 'text-blue-500',
        bg: 'bg-blue-100',
        border: 'border-blue-300'
      };
    }
  };

  const { icon: Icon, color, bg, border } = getIconAndColor();

  const formatTimeRemaining = () => {
    if (!lock.expires_at) return 'Never expires';
    
    const now = new Date();
    const expiresAt = new Date(lock.expires_at);
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff < 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const tooltipContent = showTooltip ? (
    <div className="invisible group-hover:visible absolute z-10 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg -top-2 left-full ml-2">
      <div className="space-y-1">
        <div className="font-medium">
          {lock.lock_type.charAt(0).toUpperCase() + lock.lock_type.slice(1)} Lock
        </div>
        <div className="text-gray-300">
          Locked by: {lock.locked_by}
        </div>
        {lock.lock_reason && (
          <div className="text-gray-300">
            Reason: {lock.lock_reason}
          </div>
        )}
        <div className="text-gray-300">
          Expires: {formatTimeRemaining()}
        </div>
        <div className="text-gray-300">
          Created: {new Date(lock.locked_at).toLocaleString()}
        </div>
      </div>
      <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
    </div>
  ) : null;

  return (
    <div className={`relative inline-block group ${className}`}>
      <div
        className={`
          inline-flex items-center justify-center rounded-full border-2
          ${bg} ${border} ${containerSizeClasses[size]}
          transition-all duration-200 hover:shadow-md
        `}
      >
        <Icon className={`${sizeClasses[size]} ${color}`} />
      </div>
      {tooltipContent}
    </div>
  );
};

// Resource Lock Status Component
interface ResourceLockStatusProps {
  resourceId: string;
  locks: WorkflowLock[];
  className?: string;
}

export const ResourceLockStatus: React.FC<ResourceLockStatusProps> = ({
  resourceId,
  locks,
  className = ''
}) => {
  const resourceLocks = locks.filter(lock => lock.resource_id === resourceId);
  
  if (resourceLocks.length === 0) {
    return (
      <div className={`inline-flex items-center space-x-1 ${className}`}>
        <div className="h-4 w-4 rounded-full bg-green-100 border border-green-300">
          <div className="h-full w-full rounded-full bg-green-500 opacity-20"></div>
        </div>
        <span className="text-xs text-green-600">Unlocked</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-1 ${className}`}>
      <div className="flex -space-x-1">
        {resourceLocks.slice(0, 3).map((lock) => (
          <LockIndicator
            key={lock.id}
            lock={lock}
            size="small"
            showTooltip={true}
          />
        ))}
        {resourceLocks.length > 3 && (
          <div className="h-4 w-4 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center">
            <span className="text-xs text-gray-600">+{resourceLocks.length - 3}</span>
          </div>
        )}
      </div>
      <span className="text-xs text-gray-600">
        {resourceLocks.length} lock{resourceLocks.length !== 1 ? 's' : ''}
      </span>
    </div>
  );
};

// Lock Type Badge Component
interface LockTypeBadgeProps {
  lockType: string;
  size?: 'small' | 'medium';
  className?: string;
}

export const LockTypeBadge: React.FC<LockTypeBadgeProps> = ({
  lockType,
  size = 'medium',
  className = ''
}) => {
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1 text-sm'
  };

  const getTypeConfig = () => {
    switch (lockType) {
    case 'admin':
      return { color: 'bg-purple-100 text-purple-800', label: 'Admin' };
    case 'delete':
      return { color: 'bg-red-100 text-red-800', label: 'Delete' };
    case 'state_change':
      return { color: 'bg-orange-100 text-orange-800', label: 'State Change' };
    case 'edit':
      return { color: 'bg-blue-100 text-blue-800', label: 'Edit' };
    case 'custom':
      return { color: 'bg-gray-100 text-gray-800', label: 'Custom' };
    default:
      return { color: 'bg-gray-100 text-gray-800', label: lockType };
    }
  };

  const { color, label } = getTypeConfig();

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${color} ${sizeClasses[size]} ${className}`}>
      {label}
    </span>
  );
};