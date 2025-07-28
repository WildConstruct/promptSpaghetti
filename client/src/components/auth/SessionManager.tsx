// Epic 11 Session Manager Component
// React component for managing user sessions with multi-device support
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
interface SessionInfo {
  id: string;,
  deviceInfo: {,
  platform?: string;
  browser?: string;
  version?: string;
  userAgent?: string;
  fingerprint?: string;
};
  location: {,
  ipAddress?: string;
  country?: string;
  city?: string;
};
  lastAccessedAt: string;,
  createdAt: string;
  current: boolean;
interface SessionStats {
  totalSessions: number;,
  activeSessions: number;
  expiredSessions: number;,
  revokedSessions: number;
  interface SecurityInsights {
  suspiciousActivity: {,
  multipleLocations: boolean;,
  unusualDevices: boolean;
  suspiciousLocations: string;,
  newDevices: unknown;
};
  recommendations: string;
interface SessionManagerProps {
  onSessionRevoked?: (sessionId: string) => void;
  onAllSessionsRevoked?: () => void;
  showSecurityInsights?: boolean;
  export const SessionManager: React.FC<SessionManagerProps> = ({,)
  onSessionRevoked,
  onAllSessionsRevoked,
  showSecurityInsights = true
}) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionInfo>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [securityInsights, setSecurityInsights] = useState<SecurityInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [bulkRevoking, setBulkRevoking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (user) {
      fetchSessions();
      if (showSecurityInsights) {
        fetchSecurityInsights();
  }, [user, showSecurityInsights]);
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/sessions', {)
  headers: {,
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
      });
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      const data = await response.json();
      setSessions(data.sessions);
      setStats(data.stats);
    } catch (error) {
  console.error('Error fetching sessions:', error);
  setError('Failed to load sessions');
} finally {
      setLoading(false);
  };
  const fetchSecurityInsights = async () => {
    try {
      const response = await fetch('/api/auth/sessions/security', {)
  headers: {,
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
      });
      if (!response.ok) {
        throw new Error('Failed to fetch security insights');
      const data = await response.json();
      setSecurityInsights(data);
    } catch (error) {
  console.error('Error fetching security insights:', error);
};
  const revokeSession = async (sessionId: string, reason?: string) => {
    try {
      setRevoking(sessionId);
      const response = await fetch('/api/auth/sessions/revoke', {)
  method: 'POST',
        headers: {,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
  },
  body: JSON.stringify({ sessionId, reason })
      });
      if (!response.ok) {
  throw new Error('Failed to revoke session');
  // Remove session from local state
  setSessions(sessions.filter(s => s.id !== sessionId));
  // Update stats
  if (stats) {
  setStats({)
  ...stats,
  activeSessions: stats.activeSessions - 1,
  revokedSessions: stats.revokedSessions + 1,
});
      onSessionRevoked?.(sessionId);
    } catch (error) {
  console.error('Error revoking session:', error);
  setError('Failed to revoke session');
} finally {
      setRevoking(null);
  };
  const revokeAllSessions = async (exceptCurrent: boolean = true) => {
    try {
      setBulkRevoking(true);
      const response = await fetch('/api/auth/sessions/revoke-all', {)
  method: 'POST',
        headers: {,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
  },
  body: JSON.stringify({ exceptCurrent })
      });
      if (!response.ok) {
        throw new Error('Failed to revoke sessions');
      const data = await response.json();
      // Update local state
      if (exceptCurrent) {
        setSessions(sessions.filter(s => s.current));
      } else {
  setSessions([]);
  // Update stats
  if (stats) {
  setStats({)
  ...stats,
  activeSessions: exceptCurrent ? 1 : 0,
  revokedSessions: stats.revokedSessions + data.revokedCount,
});
      onAllSessionsRevoked?.();
    } catch (error) {
  console.error('Error revoking all sessions:', error);
  setError('Failed to revoke sessions');
} finally {
      setBulkRevoking(false);
  };
  const getDeviceIcon = (deviceInfo: unknown) => {
    const platform = deviceInfo.platform?.toLowerCase();
    if (platform?.includes('mobile') || platform?.includes('android') || platform?.includes('ios')) {
      return '📱';
    if (platform?.includes('windows')) {
      return '💻';
    if (platform?.includes('mac')) {
      return '🖥️';
    return '💻';
  };
  const getDeviceDescription = (deviceInfo: unknown) => {
    const platform = deviceInfo.platform || 'Unknown';
    const browser = deviceInfo.browser || 'Unknown Browser';
    const version = deviceInfo.version || '';
    return `${platform} • ${browser} ${version}`.trim();}
  };
  const formatLastAccessed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;}
    if (diffHours < 24) return `${diffHours}h ago`;}
    if (diffDays < 7) return `${diffDays}d ago`;}
    return date.toLocaleDateString();
  };
  if (loading) {
    return;
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  return;
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
        <button
          onClick={() => revokeAllSessions(true)}
          disabled={bulkRevoking || sessions.length <= 1}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
  bulkRevoking || sessions.length <= 1
  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
  : 'bg-red-50 text-red-700 hover:bg-red-100',
}`}
        >
          {bulkRevoking ? 'Revoking...' : 'Revoke All Others'}
        </button>
      </div>
      {/* Session Statistics */}
      {stats && ()
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.activeSessions}</div>
            <div className="text-sm text-blue-600">Active</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.totalSessions}</div>
            <div className="text-sm text-green-600">Total</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.expiredSessions}</div>
            <div className="text-sm text-yellow-600">Expired</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.revokedSessions}</div>
            <div className="text-sm text-red-600">Revoked</div>
          </div>
        </div>
      )}
      {/* Security Insights */}
      {showSecurityInsights && securityInsights && ()
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Security Insights</h4>
          {securityInsights.suspiciousActivity.multipleLocations && ()
            <div className="flex items-center text-sm text-yellow-700 mb-2">
              <span className="mr-2">⚠️</span>
              Multiple login locations detected
            </div>
          )}
          {securityInsights.suspiciousActivity.unusualDevices && ()
            <div className="flex items-center text-sm text-yellow-700 mb-2">
              <span className="mr-2">⚠️</span>
              Unusual devices detected
            </div>
          )}
          {securityInsights.recommendations.length > 0 && ()
            <div className="mt-3">
              <div className="text-sm font-medium text-yellow-800 mb-1">Recommendations:</div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {securityInsights.recommendations.map((rec, index) => ()
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {/* Error Message */}
      {error && ()
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center text-red-700">
            <span className="mr-2">❌</span>
            {error}
          </div>
        </div>
      )}
      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map((session) => ()
          <div
            key={session.id}
            className={`border rounded-lg p-4 ${
  session.current
  ? 'border-blue-200 bg-blue-50'
  : 'border-gray-200 bg-white',
}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {getDeviceIcon(session.deviceInfo)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {getDeviceDescription(session.deviceInfo)}
                    {session.current && ()
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {session.location.ipAddress && ()
                      <span className="mr-4">
                        📍 {session.location.ipAddress}
                        {session.location.city && ` • ${session.location.city}`}
                        {session.location.country && ` • ${session.location.country}`}
                      </span>
                    )}
                    <span>Last active: {formatLastAccessed(session.lastAccessedAt)}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Created: {new Date(session.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {!session.current && ()
                <button
                  onClick={() => revokeSession(session.id)}
                  disabled={revoking === session.id}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
  revoking === session.id
  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
  : 'bg-red-50 text-red-700 hover:bg-red-100',
}`}
                >
                  {revoking === session.id ? 'Revoking...' : 'Revoke'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {sessions.length === 0 && ()
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">📱</div>
          <div className="text-gray-600">No active sessions found</div>
        </div>
      )}
    </div>
  );
};

export default SessionManager;