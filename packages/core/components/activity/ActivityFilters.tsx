/**
 * Epic 9.2.3 - Activity Filters Component
 * Filter controls for activity feed
 */
import React, { useState } from 'react';
import { ActivityEventFilter } from '../../types/workspace';
interface ActivityFiltersProps {
  filters: ActivityEventFilter;
  eventTypes: string[];
  onFilterChange: (filters: Partial<ActivityEventFilter>) => void;
  className?: string;
}

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({)
  filters,
  eventTypes,
  onFilterChange,
  className = ''
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateRange, setDateRange] = useState({)
    from: filters.from_date ? filters.from_date.toISOString().split('T')[0] : '',
    to: filters.to_date ? filters.to_date.toISOString().split('T')[0] : ''
  });
  const handleEventTypeChange = (eventType: string, checked: boolean) => {
    const currentTypes = filters.event_types || [];
    const newTypes = checked;
      ? [...currentTypes, eventType]
      : currentTypes.filter(t => t !== eventType);
    onFilterChange({ event_types: newTypes.length > 0 ? newTypes : undefined });
  };
  const handleDateRangeChange = (field: 'from' | 'to', value: string) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);
    onFilterChange({)
      from_date: newDateRange.from ? new Date(newDateRange.from) : undefined,
      to_date: newDateRange.to ? new Date(newDateRange.to) : undefined
    });
  };
  const clearFilters = () => {
    setDateRange({ from: '', to: '' });
    onFilterChange({)
      actor_id: undefined,
      event_types: undefined,
      from_date: undefined,
      to_date: undefined,
    });
  };
  const hasActiveFilters = !!(;)
    filters.actor_id ||
    (filters.event_types && filters.event_types.length > 0) ||
    filters.from_date ||
    filters.to_date
  );
  const eventTypeGroups = {
    workspace: eventTypes.filter(t => t.startsWith('workspace.')),
    project: eventTypes.filter(t => t.startsWith('project.')),
    resource: eventTypes.filter(t => t.startsWith('resource.')),
    comment: eventTypes.filter(t => t.startsWith('comment.')),
    user: eventTypes.filter(t => t.startsWith('user.')),
    other: eventTypes.filter(t => !['workspace.', 'project.', 'resource.', 'comment.', 'user.'].some(prefix => t.startsWith(prefix)))
  };
  return ()
    <div className={`activity-filters ${className}`}>}
      <div className="activity-filters__header">
        <h4>Filter Activity</h4>
        <div className="activity-filters__actions">
          {hasActiveFilters && ()
            <button
              className="btn btn--ghost btn--small"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
          <button
            className="btn btn--ghost btn--small"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Simple' : 'Advanced'}
          </button>
        </div>
      </div>
      <div className="activity-filters__content">
        {/* Quick Filters */}
        <div className="filter-group">
          <label className="filter-label">Quick Filters</label>
          <div className="quick-filters">
            <button
              className={`quick-filter ${!hasActiveFilters ? 'quick-filter--active' : ''}`}
              onClick={clearFilters}
            >
              All Activity
            </button>
            <button
              className={`quick-filter ${filters.event_types?.includes('comment.created') ? 'quick-filter--active' : ''}`}
              onClick={() => onFilterChange({ event_types: ['comment.created'] })}
            >
              Comments
            </button>
            <button
              className={`quick-filter ${filters.event_types?.some(t => t.includes('created')) ? 'quick-filter--active' : ''}`}
              onClick={() => onFilterChange({ )
                event_types: eventTypes.filter(t => t.includes('created'))
              })}
            >
              Created Items
            </button>
            <button
              className={`quick-filter ${filters.event_types?.some(t => t.startsWith('user.')) ? 'quick-filter--active' : ''}`}
              onClick={() => onFilterChange({ )
                event_types: eventTypes.filter(t => t.startsWith('user.'))
              })}
            >
              User Activity
            </button>
          </div>
        </div>
        {/* Date Range */}
        <div className="filter-group">
          <label className="filter-label">Date Range</label>
          <div className="date-range-inputs">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => handleDateRangeChange('from', e.target.value)}
              className="form-input form-input--small"
              placeholder="From date"
            />
            <span className="date-range-separator">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => handleDateRangeChange('to', e.target.value)}
              className="form-input form-input--small"
              placeholder="To date"
            />
          </div>
        </div>
        {/* User Filter */}
        <div className="filter-group">
          <label className="filter-label">User</label>
          <input
            type="text"
            value={filters.actor_id || ''}
            onChange={(e) => onFilterChange({ actor_id: e.target.value || undefined })}
            placeholder="Filter by user ID..."
            className="form-input form-input--small"
          />
        </div>
        {/* Advanced Filters */}
        {showAdvanced && ()
          <div className="filter-group filter-group--advanced">
            <label className="filter-label">Event Types</label>
            <div className="event-type-filters">
              {Object.entries(eventTypeGroups).map(([group, types]) => {
                if (types.length === 0) return null;
                return ()
                  <div key={group} className="event-type-group">
                    <h5 className="event-type-group__title">
                      {group.charAt(0).toUpperCase() + group.slice(1)} Events
                    </h5>
                    <div className="event-type-checkboxes">
                      {types.map(eventType => ()
                        <label key={eventType} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={filters.event_types?.includes(eventType) || false}
                            onChange={(e) => handleEventTypeChange(eventType, e.target.checked)}
                          />
                          <span className="checkbox-text">
                            {eventType.replace(/[._]/g, ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* Active Filters Summary */}
      {hasActiveFilters && ()
        <div className="activity-filters__summary">
          <div className="active-filters">
            <span className="active-filters__label">Active filters:</span>
            <div className="active-filters__tags">
              {filters.actor_id && ()
                <span className="filter-tag">
                  User: {filters.actor_id}
                  <button onClick={() => onFilterChange({ actor_id: undefined })}>×</button>
                </span>
              )}
              {filters.event_types?.map(type => ()
                <span key={type} className="filter-tag">
                  {type.replace(/[._]/g, ' ')}
                  <button onClick={() => handleEventTypeChange(type, false)}>×</button>
                </span>
              ))}
              {filters.from_date && ()
                <span className="filter-tag">
                  From: {filters.from_date.toLocaleDateString()}
                  <button onClick={() => handleDateRangeChange('from', '')}>×</button>
                </span>
              )}
              {filters.to_date && ()
                <span className="filter-tag">
                  To: {filters.to_date.toLocaleDateString()}
                  <button onClick={() => handleDateRangeChange('to', '')}>×</button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityFilters;