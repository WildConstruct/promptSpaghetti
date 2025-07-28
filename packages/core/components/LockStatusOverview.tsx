// Epic 9.4.3 - Lock Status Overview Component
// Overview dashboard for lock statistics and conflicts
import React from 'react';
import { Lock, Clock, AlertTriangle, Users, Activity, TrendingUp } from 'lucide-react';
import { LockingStatistics, LockConflict } from '../types/locking';
interface LockStatusOverviewProps {
  statistics: LockingStatistics;
  conflicts: LockConflict[];
  onConflictClick: (conflict: LockConflict) => void;
}

export const LockStatusOverview: React.FC<LockStatusOverviewProps> = ({)
  statistics,
  conflicts,
  onConflictClick
}) => {
  const pendingConflicts = conflicts.filter(c => c.status === 'pending');
  const resolvedConflicts = conflicts.filter(c => c.status === 'resolved');
  const StatCard = ({ title, value, icon: Icon, color, subtext }: {)
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    subtext?: string;
  }) => ()
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtext && <p className="text-sm text-gray-400">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>}
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
  return ();
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Locks"
          value={statistics.active_locks}
          icon={Lock}
          color="bg-blue-500"
          subtext={`${statistics.total_locks} total`}
        />
        <StatCard
          title="Pending Conflicts"
          value={pendingConflicts.length}
          icon={AlertTriangle}
          color="bg-red-500"
          subtext={`${resolvedConflicts.length} resolved`}
        />
        <StatCard
          title="Avg Duration"
          value={`${Math.round(statistics.avg_lock_duration_minutes)}m`}
          icon={Clock}
          color="bg-green-500"
          subtext="per lock"
        />
        <StatCard
          title="Conflict Rate"
          value={`${Math.round(statistics.conflict_rate)}%`}
          icon={TrendingUp}
          color="bg-orange-500"
          subtext="resolution rate"
        />
      </div>
      {/* Lock Type Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lock Type Distribution</h3>
        <div className="space-y-3">
          {Object.entries(statistics.by_type).map(([type, count]) => {
            const percentage = statistics.total_locks > 0 ? (count / statistics.total_locks) * 100 : 0;
            const colorMap: Record<string, string> = {
              edit: 'bg-blue-500',
              state_change: 'bg-orange-500',
              delete: 'bg-red-500',
              admin: 'bg-purple-500',
              custom: 'bg-gray-500',
            };
            return ();
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${colorMap[type] || 'bg-gray-400'}`}></div>}
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${colorMap[type] || 'bg-gray-400'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Top Users */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Lock Holders</h3>
        <div className="space-y-3">
          {Object.entries(statistics.by_user)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([userId, count]) => ()
              <div key={userId} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {userId.substring(0, 8)}...
                  </span>
                </div>
                <span className="text-sm text-gray-600">{count} locks</span>
              </div>
            ))}
        </div>
      </div>
      {/* Most Contended Resources */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Contended Resources</h3>
        <div className="space-y-3">
          {statistics.most_contended_resources.slice(0, 5).map((resource) => ()
            <div key={resource.resource_id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {resource.resource_id.substring(0, 8)}...
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-600">
                  {resource.conflict_count} conflicts
                </span>
                <br />
                <span className="text-xs text-gray-500">
                  {Math.round(resource.avg_wait_time)}m avg wait
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Recent Conflicts */}
      {pendingConflicts.length > 0 && ()
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pending Conflicts ({pendingConflicts.length})
          </h3>
          <div className="space-y-3">
            {pendingConflicts.slice(0, 10).map((conflict) => ()
              <div
                key={conflict.id}
                className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100"
                onClick={() => onConflictClick(conflict)}
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Resource: {conflict.resource_id.substring(0, 8)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      Requesting: {conflict.requesting_user_id.substring(0, 8)}...
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 capitalize">
                    {conflict.conflict_type}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(conflict.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* No Data State */}
      {statistics.total_locks === 0 && ()
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Locks</h3>
            <p className="text-gray-500">
              There are currently no active locks in this workspace.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};