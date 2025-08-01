import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { AnalyticsClient } from '../../analytics/AnalyticsClient';
import { Lightbulb, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target,
  ArrowRight,
  RefreshCw,
  Star,
  ThumbsUp }
  ThumbsDown
 from 'lucide-react';
/**
 * Recommendation priority colors
 */
const PRIORITY_COLORS = {};
/**
 * Recommendation type icons
 */
const RECOMMENDATION_TYPE_ICONS = {};
/**
 * Recommendation item props
 */


interface RecommendationItemProps { recommendation: unknown;
  onApply?: (recommendationId: string) => void;
  onDismiss?: (recommendationId: string) => void;
  onFeedback?: (recommendationId: string, feedback: 'positive' | 'negative') => void;
  /**
  * Recommendation item component
  */
  const RecommendationItem: React.FC<RecommendationItemProps> = ({);
  recommendation;
  onApply;
  onDismiss }
  onFeedback


}) => { const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const handleApply = useCallback(async () => {
    if (onApply) {
      setIsProcessing(true);
      try {
        await onApply(recommendation.id || 'unknown') } finally { setIsProcessing(false) }, [recommendation.id, onApply]);
  const handleDismiss = useCallback(async () => { if (onDismiss) {
      setIsProcessing(true);
      try {
        await onDismiss(recommendation.id || 'unknown') } finally { setIsProcessing(false) }, [recommendation.id, onDismiss]);
  const handleFeedback = useCallback(async (feedbackType: 'positive' | 'negative') => { if (onFeedback) {
      setFeedback(feedbackType);
      await onFeedback(recommendation.id || 'unknown', feedbackType) }, [recommendation.id, onFeedback]);
  const IconComponent = RECOMMENDATION_TYPE_ICONS[recommendation.type as keyof typeof RECOMMENDATION_TYPE_ICONS] || Lightbulb;
  const priorityClass = PRIORITY_COLORS[recommendation.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium;
  const getImpactIcon = (impact: string) => { switch (impact) {
  case 'high':,
  return <TrendingUp className="w-4 h-4 text-red-600" />;
  case 'medium':
  return <TrendingUp className="w-4 h-4 text-yellow-600" />;
  case 'low':
  return <TrendingUp className="w-4 h-4 text-green-600" />;
  default: }
  return <TrendingUp className="w-4 h-4 text-gray-600" />;
};
  return;
    <Card className={`recommendation-item ${priorityClass} border-l-4`}>}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <IconComponent className="w-5 h-5 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={recommendation.priority === 'high' ? 'destructive' : recommendation.priority === 'medium' ? 'warning' : 'secondary'}>
                  {recommendation.priority}
                </Badge>
                <span className="text-sm text-gray-600">{recommendation.type.replace('_', ' ')}</span>
              </div>
              <div className="font-medium">{recommendation.title}</div>
              <div className="text-sm text-gray-600 mt-1">{recommendation.description}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getImpactIcon(recommendation.impact)}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && ()
        <CardContent>
          <div className="space-y-4">
            {/* Recommendation Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${recommendation.estimatedSavings?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-gray-600">Estimated Savings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {recommendation.affectedUsers || 0}
                </div>
                <div className="text-sm text-gray-600">Affected Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {recommendation.impact}
                </div>
                <div className="text-sm text-gray-600">Impact Level</div>
              </div>
            </div>
            {/* Action Items */}
            {recommendation.actionItems && recommendation.actionItems.length > 0 && ()
              <div className="space-y-2">
                <div className="font-medium">Action Items:</div>
                <ul className="space-y-1">
                  {recommendation.actionItems.map((item: string, index: number) => ()
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Implementation Progress */}
            {recommendation.implementationProgress && ()
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Implementation Progress</span>
                  <span className="text-sm text-gray-600">{recommendation.implementationProgress}%</span>
                </div>
                <Progress value={recommendation.implementationProgress} className="h-2" />
              </div>
            )}
            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-2">
              <div className="flex gap-2">
                {onApply && ()
                  <Button
                    size="sm"
                    onClick={handleApply}
                    disabled={isProcessing}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isProcessing ? 'Applying...' : 'Apply'}
                  </Button>
                )}
                {onDismiss && ()
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDismiss}
                    disabled={isProcessing}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Dismiss
                  </Button>
                )}
              </div>
              {/* Feedback Buttons */}
              {onFeedback && ()
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleFeedback('positive')}
                    className={`flex items-center gap-1 ${feedback === 'positive' ? 'text-green-600' : ''}`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Helpful
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleFeedback('negative')}
                    className={`flex items-center gap-1 ${feedback === 'negative' ? 'text-red-600' : ''}`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Not Helpful
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
/**
 * Recommendation summary props
 */


interface RecommendationSummaryProps { recommendations: unknown;
  onRefresh?: () => void;
  /**
  * Recommendation summary component
  */
  const RecommendationSummary: React.FC<RecommendationSummaryProps> = ({);
  recommendations }
  onRefresh


}) => {
  const totalSavings = recommendations.reduce((sum, rec) => sum + (rec.estimatedSavings || 0), 0);
  const highPriorityCount = recommendations.filter(rec => rec.priority === 'high').length;
  const implementedCount = recommendations.filter(rec => rec.implementationProgress === 100).length;
  return;
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <CardTitle className="text-sm text-gray-600">Total Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {recommendations.length}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <CardTitle className="text-sm text-gray-600">Potential Savings</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ${totalSavings.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-red-600" />
            <CardTitle className="text-sm text-gray-600">High Priority</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {highPriorityCount}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <CardTitle className="text-sm text-gray-600">Implemented</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-green-600">
              {implementedCount}
            </div>
            {onRefresh && ()
              <Button size="sm" variant="ghost" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
/**
 * Recommendations panel props
 */


export interface RecommendationsPanelProps {
  recommendations: unknown;
  analyticsClient: AnalyticsClient;
  userId?: number;
  organizationId?: number;
  onRefresh?: () => void;
  className?: string;
  /**
  * Recommendations panel component
  */


export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ )
  recommendations
  analyticsClient
  userId
  organizationId
  onRefresh }
  className = ''
}) => { const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'savings' | 'impact'>('priority');
  /**
   * Filter recommendations
   */
  const filteredRecommendations = recommendations.filter(rec => {)
  if (filter === 'all') return true;
    return rec.priority === filter });
  /**
   * Sort recommendations
   */
  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
             (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
    if (sortBy === 'savings') {
      return (b.estimatedSavings || 0) - (a.estimatedSavings || 0);
    if (sortBy === 'impact') {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return (impactOrder[b.impact as keyof typeof impactOrder] || 0) - 
             (impactOrder[a.impact as keyof typeof impactOrder] || 0);
    return 0;
  });
  /**
   * Handle apply recommendation
   */
  const handleApplyRecommendation = useCallback(async (recommendationId: string) => {
  // This would implement the actual recommendation application logic
  console.log('Applying recommendation:', recommendationId);
  // You could call specific APIs based on the recommendation type
}, []);
  /**
   * Handle dismiss recommendation
   */
  const handleDismissRecommendation = useCallback(async (recommendationId: string) => { // This would implement the recommendation dismissal logic
  console.log('Dismissing recommendation:', recommendationId) }, []);
  /**
   * Handle recommendation feedback
   */
  const handleRecommendationFeedback = useCallback(async (;);
    recommendationId: string, 
    feedback: 'positive' | 'negative') => { ,
  // This would send feedback to the analytics system
  console.log('Recommendation feedback:', recommendationId, feedback) }, []);
  /**
   * Group recommendations by type
   */
  const getRecommendationsByType = () => { const types = {
  cost_reduction: recommendations.filter(r => r.type === 'model_switch' || r.type === 'usage_optimization' || r.type === 'budget_adjustment'),
  performance: recommendations.filter(r => r.type === 'performance_improvement'),
  feature_adoption: recommendations.filter(r => r.type === 'feature_adoption') }
};
    return types;
  };
  if (recommendations.length === 0) {
    return;
      <div className={`recommendations-panel ${className}`}>}
        <Card>
          <CardContent className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-600">No Recommendations Available</div>
            <div className="text-sm text-gray-500">
              We'll analyze your usage and provide recommendations to optimize your experience
            </div>
            {onRefresh && ()
              <Button className="mt-4" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  const recommendationsByType = getRecommendationsByType();
  return;
    <div className={`recommendations-panel ${className}`}>}
      <RecommendationSummary recommendations={recommendations} onRefresh={onRefresh} />
      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid grid-cols-4 w-fit">
            <TabsTrigger value="all" onClick={() => setFilter('all')}>
              All ({recommendations.length})
            </TabsTrigger>
            <TabsTrigger value="high" onClick={() => setFilter('high')}>
              High ({recommendations.filter(r => r.priority === 'high').length})
            </TabsTrigger>
            <TabsTrigger value="medium" onClick={() => setFilter('medium')}>
              Medium ({recommendations.filter(r => r.priority === 'medium').length})
            </TabsTrigger>
            <TabsTrigger value="low" onClick={() => setFilter('low')}>
              Low ({recommendations.filter(r => r.priority === 'low').length})
            </TabsTrigger>
          </TabsList>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'priority' | 'savings' | 'impact')}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="priority">Sort by Priority</option>
            <option value="savings">Sort by Savings</option>
            <option value="impact">Sort by Impact</option>
          </select>
        </div>
        <TabsContent value="all" className="space-y-4">
          {sortedRecommendations.map((recommendation, index) => ()
            <RecommendationItem
              key={index}
              recommendation={recommendation}
              onApply={handleApplyRecommendation}
              onDismiss={handleDismissRecommendation}
              onFeedback={handleRecommendationFeedback}
            />
          ))}
        </TabsContent>
        <TabsContent value="high" className="space-y-4">
          {sortedRecommendations.filter(r => r.priority === 'high').map((recommendation, index) => ()
            <RecommendationItem
              key={index}
              recommendation={recommendation}
              onApply={handleApplyRecommendation}
              onDismiss={handleDismissRecommendation}
              onFeedback={handleRecommendationFeedback}
            />
          ))}
        </TabsContent>
        <TabsContent value="medium" className="space-y-4">
          {sortedRecommendations.filter(r => r.priority === 'medium').map((recommendation, index) => ()
            <RecommendationItem
              key={index}
              recommendation={recommendation}
              onApply={handleApplyRecommendation}
              onDismiss={handleDismissRecommendation}
              onFeedback={handleRecommendationFeedback}
            />
          ))}
        </TabsContent>
        <TabsContent value="low" className="space-y-4">
          {sortedRecommendations.filter(r => r.priority === 'low').map((recommendation, index) => ()
            <RecommendationItem
              key={index}
              recommendation={recommendation}
              onApply={handleApplyRecommendation}
              onDismiss={handleDismissRecommendation}
              onFeedback={handleRecommendationFeedback}
            />
          ))}
        </TabsContent>
      </Tabs>
      {/* Quick Actions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium">Quick Actions</div>
          <Button size="sm" variant="outline">
            Apply All High Priority
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {recommendationsByType.cost_reduction.length}
            </div>
            <div className="text-sm text-gray-600">Cost Reduction</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {recommendationsByType.performance.length}
            </div>
            <div className="text-sm text-gray-600">Performance</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {recommendationsByType.feature_adoption.length}
            </div>
            <div className="text-sm text-gray-600">Feature Adoption</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPanel;