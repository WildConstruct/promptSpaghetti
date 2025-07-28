/**
 * Satisfaction Survey Widget
 * 
 * React component for displaying and managing user satisfaction surveys
 * within the administrative dashboard. Provides survey creation, response
 * collection, and real-time satisfaction monitoring capabilities.
 * 
 * Part of Epic 17 - Backstage Admin Controls
 * Task: E17-1753114397430-2D9B2A - Implement user satisfaction tracking
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AlertTriangle, TrendingUp, TrendingDown, Users, MessageSquare, Star } from 'lucide-react';
interface SatisfactionMetrics {
  overallScore: number;,
  npsScore: number;
  responseRate: number;,
  totalResponses: number;
  trendDirection: 'up' | 'down' | 'stable';
interface SatisfactionAlert {
  alertId: string;,
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';,
  title: string;
  description: string;,
  affectedUsers: number;
  triggeredAt: Date;,
  acknowledged: boolean;
interface RecentFeedback {
  positive: { text: string; user: string; timestamp: Date }[];
  negative: { text: string; user: string; timestamp: Date }[];
  suggestions: { text: string; user: string; timestamp: Date }[];

// Currently unused but may be needed for future dashboard integration
// interface SatisfactionDashboardData {
//   summary: SatisfactionMetrics;
//   realtime: {
//     todayResponses: number;
//     averageToday: number;

//     hourlyTrend: { hour: number; score: number; responses: number }[];
//   };
//   segments: {
//     userType: { segment: string; satisfaction: number; count: number }[];
//     geography: { region: string; satisfaction: number; count: number }[];
//     tenure: { group: string; satisfaction: number; count: number }[];
//   };
//   features: {
//     topRated: { feature: string; rating: number; responses: number }[];
//     bottomRated: { feature: string; rating: number; responses: number }[];
//     trending: { feature: string; change: number; current: number }[];
//   };
//   alerts: SatisfactionAlert;
//   recentFeedback: RecentFeedback;
//   timestamp: Date;
//   dataFreshness: number;
// }
interface SatisfactionSurveyWidgetProps {
  className?: string;
  refreshInterval?: number;
  export const SatisfactionSurveyWidget: React.FC<SatisfactionSurveyWidgetProps> = ({ ),
  className,
  refreshInterval = 30000
}) => {
  const [dashboardData, setDashboardData] = useState<{
  summary: SatisfactionMetrics;,
  realtime: Record<string, unknown>;
  segments: Record<string, unknown>;
  features: Record<string, unknown>;
  alerts: SatisfactionAlert;,
  recentFeedback: RecentFeedback;
  dataFreshness: number;
} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/satisfaction/dashboard');
      const result = await response.json();
      if (result.success) {
        setDashboardData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to load satisfaction data');
    } catch (err) {
  setError('Network error loading satisfaction data');
  console.error('Error fetching satisfaction dashboard:', err);
} finally {
      setLoading(false);
  };
  // Setup periodic refresh
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);
  // Acknowledge alert
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/admin/satisfaction/alerts/${alertId}/acknowledge`, {)}
  },
  method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        // Refresh data to update alert status
        fetchDashboardData();
    } catch (err) {
  console.error('Error acknowledging alert:', err);
};
  // Create new survey
  const handleCreateSurvey = async (surveyType: string) => {
    try {
      const response = await fetch('/api/admin/satisfaction/surveys', {)
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyType })
      });
      const result = await response.json();
      if (result.success) {
  // Handle successful survey creation
  console.log('Survey created:', result.data);
} catch (err) {
  console.error('Error creating survey:', err);
};
  if (loading) {
    return;
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse">Loading satisfaction data...</div>
        </CardContent>
      </Card>
    );
  if (error) {
    return;
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-red-600">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  if (!dashboardData) {
    return;
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div>No satisfaction data available</div>
        </CardContent>
      </Card>
    );
  const { summary, realtime, segments, features, alerts, recentFeedback } = dashboardData;
  return;
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          User Satisfaction Tracking
          <Badge variant={summary.trendDirection === 'up' ? 'success' : 
            summary.trendDirection === 'down' ? 'destructive' : 'secondary'}>
            {summary.trendDirection === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
            {summary.trendDirection === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
            {summary.trendDirection}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.overallScore}</div>
                <div className="text-sm text-gray-600">Overall Score</div>
                <Progress value={summary.overallScore} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.npsScore}</div>
                <div className="text-sm text-gray-600">NPS Score</div>
                <div className="text-xs text-gray-500">
                  {summary.npsScore > 0 ? 'Positive' : summary.npsScore < 0 ? 'Negative' : 'Neutral'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{summary.responseRate}%</div>
                <div className="text-sm text-gray-600">Response Rate</div>
                <Progress value={summary.responseRate} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{summary.totalResponses}</div>
                <div className="text-sm text-gray-600">Total Responses</div>
                <div className="text-xs text-gray-500">All time</div>
              </div>
            </div>
            {/* Realtime Data */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Today&apos;s Activity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-lg font-semibold">{realtime.todayResponses}</div>
                  <div className="text-sm text-gray-600">Responses Today</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{realtime.averageToday}</div>
                  <div className="text-sm text-gray-600">Average Score Today</div>
                </div>
              </div>
              {/* Hourly trend would be displayed as a small chart */}
              <div className="mt-3">
                <div className="text-xs text-gray-500">Hourly Trend (last 24h)</div>
                <div className="flex items-end space-x-1 mt-1">
                  {realtime.hourlyTrend.map((point, i) => ()
                    <div
                      key={i}
                      className="bg-blue-200 w-2"
                      style={{ height: `${(point.score / 100) * 30}px` }}
                      title={`Hour ${point.hour}: ${point.score} (${point.responses} responses)`}
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => handleCreateSurvey('post_purchase')}>
                  Create Post-Purchase Survey
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleCreateSurvey('feature_feedback')}>
                  Feature Feedback Survey
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleCreateSurvey('admin_experience')}>
                  Admin Experience Survey
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="segments" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* User Type Segments */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">By User Type</h3>
                <div className="space-y-2">
                  {segments.userType.map((segment, i) => ()
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm">{segment.segment}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{segment.satisfaction}</span>
                        <Badge variant="secondary" className="text-xs">{segment.count}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Geography Segments */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">By Region</h3>
                <div className="space-y-2">
                  {segments.geography.map((segment, i) => ()
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm">{segment.region}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{segment.satisfaction}</span>
                        <Badge variant="secondary" className="text-xs">{segment.count}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Tenure Segments */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">By User Tenure</h3>
                <div className="space-y-2">
                  {segments.tenure.map((segment, i) => ()
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm">{segment.group}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{segment.satisfaction}</span>
                        <Badge variant="secondary" className="text-xs">{segment.count}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="features" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Top Rated Features */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3 text-green-600">Top Rated Features</h3>
                <div className="space-y-2">
                  {features.topRated.map((feature, i) => ()
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm">{feature.feature}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{feature.rating}</span>
                        <Badge variant="secondary" className="text-xs">{feature.responses}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Bottom Rated Features */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3 text-red-600">Needs Improvement</h3>
                <div className="space-y-2">
                  {features.bottomRated.map((feature, i) => ()
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm">{feature.feature}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-gray-400" />
                        <span className="text-sm font-medium">{feature.rating}</span>
                        <Badge variant="secondary" className="text-xs">{feature.responses}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Trending Features */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">Trending</h3>
                <div className="space-y-2">
                  {features.trending.map((feature, i) => ()
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm">{feature.feature}</span>
                      <div className="flex items-center gap-1">
                        {feature.change > 0 ? ()
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        ) : ()
                          <TrendingDown className="w-3 h-3 text-red-500" />
                        )}
                        <span className="text-sm font-medium">{feature.current}</span>
                        <Badge 
                          variant={feature.change > 0 ? 'success' : 'destructive'} 
                          className="text-xs"
                        >
                          {feature.change > 0 ? '+' : ''}{feature.change}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="alerts" className="space-y-4">
            {alerts.length === 0 ? ()
              <div className="text-center py-8 text-gray-500">
                No active satisfaction alerts
              </div>
            ) : ()
              <div className="space-y-3">
                {alerts.map((alert) => ()
                  <div
                    key={alert.alertId}
                    className={`border rounded-lg p-4 ${
  alert.severity === 'critical' ? 'border-red-300 bg-red-50' :,
  alert.severity === 'high' ? 'border-orange-300 bg-orange-50' :,
  alert.severity === 'medium' ? 'border-yellow-300 bg-yellow-50' :,
  'border-blue-300 bg-blue-50'
}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className={`w-4 h-4 ${
  alert.severity === 'critical' ? 'text-red-600' :,
  alert.severity === 'high' ? 'text-orange-600' :,
  alert.severity === 'medium' ? 'text-yellow-600' :,
  'text-blue-600'
}`} />
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge variant={
  alert.severity === 'critical' ? 'destructive' :,
  alert.severity === 'high' ? 'destructive' :,
  alert.severity === 'medium' ? 'warning' :,
  'secondary'
}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            <Users className="w-3 h-3 inline mr-1" />
                            {alert.affectedUsers} users affected
                          </span>
                          <span>{new Date(alert.triggeredAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        {!alert.acknowledged && ()
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAcknowledgeAlert(alert.alertId)}
                          >
                            Acknowledge
                          </Button>
                        )}
                        {alert.acknowledged && ()
                          <Badge variant="success">Acknowledged</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="feedback" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Positive Feedback */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3 text-green-600">Recent Positive Feedback</h3>
                <div className="space-y-3">
                  {recentFeedback.positive.map((feedback, i) => ()
                    <div key={i} className="text-sm">
                      <p className="text-gray-700">&quot;{feedback.text}&quot;</p>
                      <div className="text-xs text-gray-500 mt-1">
                        — {feedback.user} • {new Date(feedback.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Negative Feedback */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3 text-red-600">Recent Concerns</h3>
                <div className="space-y-3">
                  {recentFeedback.negative.map((feedback, i) => ()
                    <div key={i} className="text-sm">
                      <p className="text-gray-700">&quot;{feedback.text}&quot;</p>
                      <div className="text-xs text-gray-500 mt-1">
                        — {feedback.user} • {new Date(feedback.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Suggestions */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3 text-blue-600">Recent Suggestions</h3>
                <div className="space-y-3">
                  {recentFeedback.suggestions.map((feedback, i) => ()
                    <div key={i} className="text-sm">
                      <p className="text-gray-700">&quot;{feedback.text}&quot;</p>
                      <div className="text-xs text-gray-500 mt-1">
                        — {feedback.user} • {new Date(feedback.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        {/* Data freshness indicator */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Data updated {dashboardData.dataFreshness} minutes ago
        </div>
      </CardContent>
    </Card>
  );
};