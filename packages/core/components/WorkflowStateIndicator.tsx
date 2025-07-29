// Epic 9.4 - Workflow State Indicator Component
// Simple component to show current workflow state in the editor
import React from 'react';
import { 
  DocumentTextIcon,
  EyeIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  ArchiveBoxIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
interface WorkflowState {
  id: string;
  name: string;
  color: string;
  icon?: string;
  is_initial: boolean;
  is_final: boolean;
  is_locked: boolean;
  interface WorkflowStateIndicatorProps {
  state: WorkflowState;
  isLocked?: boolean;
  canEdit?: boolean;
  onStateChange?: () => void;
  compact?: boolean;
  export const WorkflowStateIndicator: React.FC<WorkflowStateIndicatorProps> = ({,)
  state,
  isLocked = false,
  canEdit = false,
  onStateChange,
  compact = false
}) => {
  const getStateIcon = (iconName?: string) => {,
  switch (iconName) {
  case 'CheckCircleIcon': return <CheckCircleIcon className="h-4 w-4" />;
  case 'EyeIcon': return <EyeIcon className="h-4 w-4" />;
  case 'GlobeAltIcon': return <GlobeAltIcon className="h-4 w-4" />;
  case 'ArchiveBoxIcon': return <ArchiveBoxIcon className="h-4 w-4" />;
  case 'DocumentTextIcon':,
  default: return <DocumentTextIcon className="h-4 w-4" />;
};
  const getStateDescription = () => {
    if (state.is_initial) return 'Initial state';
    if (state.is_final) return 'Final state';
    if (state.is_locked) return 'Locked state';
    return 'Active state';
  };
  if (compact) {
    return;
      <div 
        className="flex items-center space-x-2 px-2 py-1 rounded-md text-sm"
        style={{ 
          backgroundColor: `${state.color}20`}
},
  color: state.color,
          border: `1px solid ${state.color}40`}
        }}
        title={`${state.name} - ${getStateDescription()}`}
      >
        {getStateIcon(state.icon)}
        <span className="font-medium">{state.name}</span>
        {isLocked && ()
          <span className="text-xs bg-red-100 text-red-800 px-1 rounded">
            Locked
          </span>
        )}
      </div>
    );
  return;
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium"
            style={{ 
              backgroundColor: `${state.color}20`}
},
  color: state.color ;
  }}
          >
            {getStateIcon(state.icon)}
            <span>{state.name}</span>
          </div>
          {/* State badges */}
          <div className="flex items-center space-x-2">
            {state.is_initial && ()
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                Initial
              </span>
            )}
            {state.is_final && ()
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                Final
              </span>
            )}
            {state.is_locked && ()
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                Locked
              </span>
            )}
            {isLocked && ()
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                Resource Locked
              </span>
            )}
          </div>
        </div>
        {/* Action button */}
        {canEdit && onStateChange && ()
          <button
            onClick={onStateChange}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition-colors"
          >
            <span>Change State</span>
            <ChevronDownIcon className="h-3 w-3" />
          </button>
        )}
      </div>
      {/* Description */}
      <div className="mt-2 text-sm text-gray-600">
        Current workflow state: {getStateDescription()}
      </div>
    </div>
  );
};

// Simple version for use in lists
export const WorkflowStateBadge: React.FC<{,
  state: WorkflowState;
  size?: 'sm' | 'md' | 'lg'
  }> = ({ state, size = 'md' }) => {
  const getStateIcon = (iconName?: string) => {
    const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
    switch (iconName) {
    case 'CheckCircleIcon': return <CheckCircleIcon className={iconSize} />;
    case 'EyeIcon': return <EyeIcon className={iconSize} />;
    case 'GlobeAltIcon': return <GlobeAltIcon className={iconSize} />;
    case 'ArchiveBoxIcon': return <ArchiveBoxIcon className={iconSize} />;
    case 'DocumentTextIcon': 
    default: return <DocumentTextIcon className={iconSize} />;
  };
  const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};
  return;
    <div 
      className={`inline-flex items-center space-x-2 rounded-full font-medium ${sizeClasses[size]}`}
      style={{ 
        backgroundColor: `${state.color}20`}
},
  color: state.color ;
  }}
    >
      {getStateIcon(state.icon)}
      <span>{state.name}</span>
    </div>
  );
};