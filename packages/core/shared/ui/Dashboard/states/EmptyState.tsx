/**
 * EmptyState - Consistent empty data displays for dashboards
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 * 
 * Provides standardized empty states with optional actions
 */
import React from 'react';
import { Database, Search, Filter, Plus, BarChart3 } from 'lucide-react';
import './EmptyState.css';

export interface EmptyStateProps {
  icon?: React.ComponentType<{ size?: number }>;
  title?: string;
  description?: string;
  action?: {
  label: string;,
  onClick: () => void;
  variant?: 'primary' | 'secondary';
};
  variant?: 'default' | 'search' | 'filter' | 'create';
  className?: string;
const VARIANT_CONFIGS = {
  default: {,
  icon: Database,
  title: 'No data available',
  description: 'There is no data to display at this time.',
},
  search: {,
  icon: Search,
  title: 'No search results',
  description: 'Try adjusting your search terms or filters.',
},
  filter: {,
  icon: Filter,
  title: 'No matching results',
  description: 'No items match your current filter criteria.',
},
  create: {,
  icon: Plus,
  title: 'Get started',
  description: 'Create your first item to see it here.',
};
}
export const EmptyState: React.FC<EmptyStateProps> = ({)
  icon,
  title,
  description,
  action,
  variant = 'default',
  className = ''
}) => {
  const config = VARIANT_CONFIGS[variant];
  const Icon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  return;
    <div className={`empty-state ${variant} ${className}`}>}
      <div className="empty-content">
        <div className="empty-icon-container">
          <Icon size={64} className="empty-icon" />
        </div>
        <div className="empty-text">
          <h3 className="empty-title">{displayTitle}</h3>
          <p className="empty-description">{displayDescription}</p>
        </div>
        {action && ()
          <div className="empty-actions">
            <button
              onClick={action.onClick}
              className={`empty-action-btn ${action.variant || 'primary'}`}
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Specialized empty state components for common use cases
export const EmptySearchState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => ()
  <EmptyState {...props} variant="search" />
);

export const EmptyFilterState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => ()
  <EmptyState {...props} variant="filter" />
);

export const EmptyCreateState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => ()
  <EmptyState {...props} variant="create" />
);

export const EmptyChartState: React.FC<Omit<EmptyStateProps, 'variant' | 'icon'>> = (props) => ()
  <EmptyState {...props} icon={BarChart3} title="No chart data" />
);

export default EmptyState;