/**
 * Epic 9.2.3 - Activity Stats Component
 * Statistics dashboard for workspace activity
 */
import React, { useState } from 'react';
interface ActivityStatsData {
  total_events: number;
  events_by_type: Record<string, number>;
  events_by_day: Array<{ date: string; count: number }>;
  most_active_users: Array<{ user_id: string; count: number }>;
interface ActivityStatsProps {
  stats: ActivityStatsData;
  workspaceId: string;
  className?: string;
  export const ActivityStats: React.FC<ActivityStatsProps> = ({,)
  stats,
  workspaceId,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'types' | 'timeline' | 'users'>('overview');
  const topEventTypes = Object.entries(stats.events_by_type);
  .sort(([ a], [ b]) => b - a)
  .slice(0, 5);
  const recentDays = stats.events_by_day.slice(-7);
  const maxDayCount = Math.max(...recentDays.map(d => d.count), 1);
  const formatEventType = (type: string) => {,
  return type.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};
  return;
    <div className={`activity-stats ${className}`}>}
      <div className="activity-stats__header">
        <h3>Activity Overview</h3>
        <div className="activity-stats__period">
          Last 30 days
        </div>
      </div>
      <div className="activity-stats__tabs">
        <button
          className={`stats-tab ${activeTab === 'overview' ? 'stats-tab--active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`stats-tab ${activeTab === 'types' ? 'stats-tab--active' : ''}`}
          onClick={() => setActiveTab('types')}
        >
          Event Types
        </button>
        <button
          className={`stats-tab ${activeTab === 'timeline' ? 'stats-tab--active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline
        </button>
        <button
          className={`stats-tab ${activeTab === 'users' ? 'stats-tab--active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Active Users
        </button>
      </div>
      <div className="activity-stats__content">
        {activeTab === 'overview' && ()
          <div className="stats-overview">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card__value">{stats.total_events}</div>
                <div className="stat-card__label">Total Events</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__value">{Object.keys(stats.events_by_type).length}</div>
                <div className="stat-card__label">Event Types</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__value">{stats.most_active_users.length}</div>
                <div className="stat-card__label">Active Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__value">
                  {Math.round(stats.total_events / Math.max(stats.events_by_day.length, 1))}
                </div>
                <div className="stat-card__label">Avg/Day</div>
              </div>
            </div>
            <div className="overview-summary">
              <h4>Summary</h4>
              <div className="summary-items">
                <div className="summary-item">
                  <strong>Most common activity:</strong> {
                    topEventTypes.length > 0 
                      ? formatEventType(topEventTypes[0][0])
                      : 'None'
                </div>
                <div className="summary-item">
                  <strong>Most active user:</strong> {
                    stats.most_active_users.length > 0
                      ? stats.most_active_users[0].user_id
                      : 'None'
                </div>
                <div className="summary-item">
                  <strong>Recent activity:</strong> {
                    recentDays.length > 0
                      ? `${recentDays[recentDays.length - 1].count} events today`}
                      : 'No recent activity'
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'types' && ()
          <div className="stats-types">
            <h4>Events by Type</h4>
            <div className="event-type-chart">
              {topEventTypes.map(([type, count]) => {
                const percentage = (count / stats.total_events) * 100;
                return;
                  <div key={type} className="event-type-bar">
                    <div className="event-type-bar__info">
                      <span className="event-type-bar__label">
                        {formatEventType(type)}
                      </span>
                      <span className="event-type-bar__count">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="event-type-bar__track">
                      <div 
                        className="event-type-bar__fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            {Object.keys(stats.events_by_type).length > 5 && ()
              <div className="stats-note">
                Showing top 5 event types out of {Object.keys(stats.events_by_type).length} total
              </div>
            )}
          </div>
        )}
        {activeTab === 'timeline' && ()
          <div className="stats-timeline">
            <h4>Activity Timeline (Last 7 Days)</h4>
            <div className="timeline-chart">
              {recentDays.map((day, index) => {
                const height = Math.max((day.count / maxDayCount) * 100, 2);
                const date = new Date(day.date);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                return;
                  <div key={day.date} className="timeline-bar">
                    <div className="timeline-bar__column">
                      <div 
                        className="timeline-bar__fill"
                        style={{ height: `${height}%` }}
                        title={`${day.count} events on ${date.toLocaleDateString()}`}
                      ></div>
                    </div>
                    <div className="timeline-bar__label">
                      <div className="timeline-bar__day">{dayName}</div>
                      <div className="timeline-bar__count">{day.count}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {recentDays.length === 0 && ()
              <div className="stats-empty">
                No activity data available for the selected period.
              </div>
            )}
          </div>
        )}
        {activeTab === 'users' && ()
          <div className="stats-users">
            <h4>Most Active Users</h4>
            <div className="user-activity-list">
              {stats.most_active_users.slice(0, 10).map((user, index) => {
                const percentage = (user.count / stats.total_events) * 100;
                return;
                  <div key={user.user_id} className="user-activity-item">
                    <div className="user-activity-item__rank">
                      #{index + 1}
                    </div>
                    <div className="user-activity-item__user">
                      <div className="user-avatar user-avatar--small">
                        {user.user_id.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <div className="user-name">{user.user_id}</div>
                        <div className="user-stats">
                          {user.count} events ({percentage.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {stats.most_active_users.length === 0 && ()
              <div className="stats-empty">
                No user activity data available.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityStats;