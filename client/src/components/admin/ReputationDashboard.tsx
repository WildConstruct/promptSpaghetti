/**
 * Reputation Dashboard Component
 * 
 * React component for the administrative reputation dashboard,
 * providing user reputation management, verification controls,
 * badge management, and fraud detection interface.
 * 
 * Part of Epic 17 - Backstage Admin Controls
 * Task: E17-1753114397412-B12019 - Add reputation system
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Shield, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertTriangle,
  Award,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Flag,
  Eye
} from 'lucide-react';

interface ReputationMetrics {
  totalUsers: number;
  reputationDistribution: {
    veryHigh: number;
    high: number;
    medium: number;
    low: number;
    veryLow: number;
  };
  verificationStats: {
    identityVerified: number;
    emailVerified: number;
    phoneVerified: number;
    fullyVerified: number;
    verificationRate: number;
  };
  trustTrends: {
    averageTrustScore: number;
    trendDirection: 'improving' | 'stable' | 'declining';
    monthlyChange: number;
    topReputationUsers: Array<{ userId: string; username: string; score: number }>;
  };
  riskAnalysis: {
    highRiskUsers: number;
    flaggedUsers: number;
    suspiciousActivity: number;
    fraudPrevented: {
      estimatedValue: number;
      incidentsBlocked: number;
    };
  };
  badgeStats: {
    totalBadgesAwarded: number;
    mostPopularBadges: Array<{ badgeType: string; count: number }>;
  };
}

interface ReputationAlert {
  alertId: string;
  userId: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  triggerScore: number;
  currentScore: number;
  riskFactors: string[];
  suggestedActions: string[];
  status: 'active' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: Date;
  assignedTo?: string;
  priority: number;
  escalated: boolean;
}

interface UserReputationSummary {
  userId: string;
  username: string;
  overallTrustScore: number;
  reputationLevel: string;
  verificationLevel: string;
  achievementCount: number;
  flagged: boolean;
  lastCalculated: Date;
}

interface ReputationDashboardData {
  overview: {
    totalUsers: number;
    averageTrustScore: number;
    verificationRate: number;
    activeAlerts: number;
    criticalAlerts: number;
  };
  metrics: ReputationMetrics;
  alerts: ReputationAlert[];
  recentActivity: any[];
  systemHealth: any;
  lastUpdated: Date;
}

interface ReputationDashboardProps {
  className?: string;
  refreshInterval?: number;
}

export const ReputationDashboard: React.FC<ReputationDashboardProps> = ({ 
  className, 
  refreshInterval = 300000 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // User search and filtering
  const [userSearchResults, setUserSearchResults] = useState<UserReputationSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    reputationLevel: '',
    verificationLevel: '',
    riskLevel: '',
    flagged: ''
  });
  
  // Selected user for detailed view
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/reputation/dashboard');
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to load reputation data');
      }
    } catch (err) {
      setError('Network error loading reputation data');
      console.error('Error fetching reputation dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search users
  const searchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (searchFilters.reputationLevel) params.append('reputationLevel', searchFilters.reputationLevel);
      if (searchFilters.verificationLevel) params.append('verificationLevel', searchFilters.verificationLevel);
      if (searchFilters.riskLevel) params.append('riskLevel', searchFilters.riskLevel);
      if (searchFilters.flagged) params.append('flagged', searchFilters.flagged);
      
      const response = await fetch(`/api/admin/reputation/users?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setUserSearchResults(result.data);
      }
    } catch (err) {
      console.error('Error searching users:', err);
    }
  };

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/admin/reputation/leaderboard?limit=10');
      const result = await response.json();
      
      if (result.success) {
        setLeaderboard(result.data);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  // Handle user flag/unflag
  const handleFlagUser = async (userId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/reputation/users/${userId}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, restrictionLevel: 'limited' })
      });
      
      if (response.ok) {
        // Refresh user search results
        searchUsers();
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error flagging user:', err);
    }
  };

  // Handle reputation recalculation
  const handleRecalculateReputation = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/reputation/users/${userId}/recalculate`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // Refresh data
        searchUsers();
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error recalculating reputation:', err);
    }
  };

  // Handle alert acknowledgment
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/admin/reputation/alerts/${alertId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: 'current_admin' })
      });
      
      if (response.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  };

  // Setup periodic refresh
  useEffect(() => {
    fetchDashboardData();
    fetchLeaderboard();
    
    const interval = setInterval(fetchDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Search users when filters change
  useEffect(() => {
    if (searchQuery || Object.values(searchFilters).some(v => v)) {
      searchUsers();
    }
  }, [searchQuery, searchFilters]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse">Loading reputation dashboard...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-red-600">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dashboardData) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div>No reputation data available</div>
        </CardContent>
      </Card>
    );
  }

  const { overview, metrics, alerts } = dashboardData;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          User Reputation System
          <Badge variant={overview.criticalAlerts > 0 ? 'destructive' : 'success'}>
            {overview.criticalAlerts > 0 ? `${overview.criticalAlerts} Critical` : 'Healthy'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{overview.totalUsers}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{overview.averageTrustScore}</div>
                <div className="text-sm text-gray-600">Avg Trust Score</div>
                <div className="text-xs text-gray-500">
                  {metrics.trustTrends.trendDirection === 'improving' && <TrendingUp className="w-3 h-3 inline text-green-500" />}
                  {metrics.trustTrends.trendDirection === 'declining' && <TrendingDown className="w-3 h-3 inline text-red-500" />}
                  {metrics.trustTrends.monthlyChange > 0 ? '+' : ''}{metrics.trustTrends.monthlyChange}%
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{overview.verificationRate}%</div>
                <div className="text-sm text-gray-600">Verification Rate</div>
                <Progress value={overview.verificationRate} className="mt-2" />
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{overview.activeAlerts}</div>
                <div className="text-sm text-gray-600">Active Alerts</div>
                <div className="text-xs text-gray-500">
                  {overview.criticalAlerts} critical
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{metrics.riskAnalysis.highRiskUsers}</div>
                <div className="text-sm text-gray-600">High Risk Users</div>
                <div className="text-xs text-gray-500">
                  {metrics.riskAnalysis.flaggedUsers} flagged
                </div>
              </div>
            </div>

            {/* Reputation Distribution */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Reputation Distribution</h3>
              <div className="space-y-2">
                {Object.entries(metrics.reputationDistribution).map(([level, count]) => (
                  <div key={level} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{level.replace(/([A-Z])/g, ' $1')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32">
                        <Progress value={(count / overview.totalUsers) * 100} className="h-2" />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Recent Alerts</h3>
              <div className="space-y-2">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.alertId}
                    className={`flex justify-between items-center p-2 rounded ${
                      alert.severity === 'critical' ? 'bg-red-50 border-l-4 border-red-500' :
                        alert.severity === 'high' ? 'bg-orange-50 border-l-4 border-orange-500' :
                          alert.severity === 'medium' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                            'bg-blue-50 border-l-4 border-blue-500'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${
                          alert.severity === 'critical' ? 'text-red-600' :
                            alert.severity === 'high' ? 'text-orange-600' :
                              alert.severity === 'medium' ? 'text-yellow-600' :
                                'text-blue-600'
                        }`} />
                        <span className="font-medium text-sm">{alert.title}</span>
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{alert.description}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAcknowledgeAlert(alert.alertId)}
                    >
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            {/* User Search */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">User Search & Management</h3>
              
              {/* Search Controls */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by username or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button onClick={searchUsers} className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </Button>
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
                <Select value={searchFilters.reputationLevel} onValueChange={(value) => 
                  setSearchFilters(prev => ({ ...prev, reputationLevel: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Reputation Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    <SelectItem value="diamond">Diamond</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="newcomer">Newcomer</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={searchFilters.verificationLevel} onValueChange={(value) => 
                  setSearchFilters(prev => ({ ...prev, verificationLevel: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Verification Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Verifications</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enhanced">Enhanced</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={searchFilters.flagged} onValueChange={(value) => 
                  setSearchFilters(prev => ({ ...prev, flagged: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Flag Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Users</SelectItem>
                    <SelectItem value="true">Flagged Only</SelectItem>
                    <SelectItem value="false">Not Flagged</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setSearchFilters({ reputationLevel: '', verificationLevel: '', riskLevel: '', flagged: '' });
                  }}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Clear
                </Button>
              </div>
            </div>

            {/* User Results */}
            <div className="space-y-2">
              {userSearchResults.map((user) => (
                <div key={user.userId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{user.username}</h4>
                        <Badge variant={
                          user.reputationLevel === 'diamond' ? 'default' :
                            user.reputationLevel === 'platinum' ? 'secondary' :
                              user.reputationLevel === 'gold' ? 'default' :
                                'outline'
                        }>
                          {user.reputationLevel}
                        </Badge>
                        {user.flagged && <Badge variant="destructive">Flagged</Badge>}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Trust Score:</span>
                          <div className="font-medium">{user.overallTrustScore}/1000</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Verification:</span>
                          <div className="font-medium">{user.verificationLevel}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Badges:</span>
                          <div className="font-medium">{user.achievementCount}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Updated:</span>
                          <div className="font-medium">{new Date(user.lastCalculated).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedUser(user.userId)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRecalculateReputation(user.userId)}
                      >
                        Recalculate
                      </Button>
                      {!user.flagged && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            const reason = prompt('Enter reason for flagging:');
                            if (reason) handleFlagUser(user.userId, reason);
                          }}
                        >
                          <Flag className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            {/* Verification Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.verificationStats.emailVerified}</div>
                <div className="text-sm text-gray-600">Email Verified</div>
                <Progress value={(metrics.verificationStats.emailVerified / overview.totalUsers) * 100} className="mt-2" />
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{metrics.verificationStats.identityVerified}</div>
                <div className="text-sm text-gray-600">Identity Verified</div>
                <Progress value={(metrics.verificationStats.identityVerified / overview.totalUsers) * 100} className="mt-2" />
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{metrics.verificationStats.phoneVerified}</div>
                <div className="text-sm text-gray-600">Phone Verified</div>
                <Progress value={(metrics.verificationStats.phoneVerified / overview.totalUsers) * 100} className="mt-2" />
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{metrics.verificationStats.fullyVerified}</div>
                <div className="text-sm text-gray-600">Fully Verified</div>
                <Progress value={(metrics.verificationStats.fullyVerified / overview.totalUsers) * 100} className="mt-2" />
              </div>
            </div>

            {/* Verification Queue - Placeholder */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Pending Verifications</h3>
              <div className="text-center py-8 text-gray-500">
                Verification queue interface would be implemented here
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No active reputation alerts
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.alertId}
                    className={`border rounded-lg p-4 ${
                      alert.severity === 'critical' ? 'border-red-300 bg-red-50' :
                        alert.severity === 'high' ? 'border-orange-300 bg-orange-50' :
                          alert.severity === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                            'border-blue-300 bg-blue-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className={`w-5 h-5 ${
                            alert.severity === 'critical' ? 'text-red-600' :
                              alert.severity === 'high' ? 'text-orange-600' :
                                alert.severity === 'medium' ? 'text-yellow-600' :
                                  'text-blue-600'
                          }`} />
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge variant={
                            alert.severity === 'critical' ? 'destructive' :
                              alert.severity === 'high' ? 'destructive' :
                                alert.severity === 'medium' ? 'warning' :
                                  'secondary'
                          }>
                            {alert.severity}
                          </Badge>
                          {alert.escalated && <Badge variant="destructive">Escalated</Badge>}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-2">
                          <div>User: {alert.userId}</div>
                          <div>Score: {alert.currentScore} (was {alert.triggerScore})</div>
                          <div>Created: {new Date(alert.createdAt).toLocaleDateString()}</div>
                          <div>Status: {alert.status}</div>
                        </div>
                        
                        {alert.suggestedActions.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs text-gray-600 mb-1">Suggested Actions:</div>
                            <ul className="text-xs text-gray-500">
                              {alert.suggestedActions.map((action, i) => (
                                <li key={i}>• {action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {alert.status === 'active' && (
                          <>
                            <Button size="sm" onClick={() => handleAcknowledgeAlert(alert.alertId)}>
                              Investigate
                            </Button>
                            <Button size="sm" variant="outline">
                              Resolve
                            </Button>
                            <Button size="sm" variant="destructive">
                              Escalate
                            </Button>
                          </>
                        )}
                        {alert.assignedTo && (
                          <div className="text-xs text-gray-500">
                            Assigned to: {alert.assignedTo}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Top Reputation Users</h3>
              <div className="space-y-2">
                {leaderboard.map((user, index) => (
                  <div key={user.userId} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gold to-yellow-400 flex items-center justify-center text-white font-bold text-sm">
                      {user.rank}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.username}</span>
                        <Badge variant={
                          user.reputationLevel === 'diamond' ? 'default' :
                            user.reputationLevel === 'platinum' ? 'secondary' :
                              'outline'
                        }>
                          {user.reputationLevel}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {user.achievementCount} badges • {user.verificationLevel} verified
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{user.overallTrustScore}</div>
                      <div className="text-xs text-gray-500">trust score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {/* Fraud Prevention Impact */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Fraud Prevention Impact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${metrics.riskAnalysis.fraudPrevented.estimatedValue}</div>
                  <div className="text-sm text-gray-600">Estimated Value Protected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{metrics.riskAnalysis.fraudPrevented.incidentsBlocked}</div>
                  <div className="text-sm text-gray-600">Incidents Prevented</div>
                </div>
              </div>
            </div>

            {/* Badge Statistics */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Badge Statistics</h3>
              <div className="space-y-2">
                <div className="text-lg font-semibold mb-2">
                  Total Badges Awarded: {metrics.badgeStats.totalBadgesAwarded}
                </div>
                <div className="space-y-1">
                  {metrics.badgeStats.mostPopularBadges.map((badge, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{badge.badgeType.replace(/_/g, ' ')}</span>
                      <Badge variant="secondary">{badge.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Data freshness indicator */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Last updated: {dashboardData.lastUpdated.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};