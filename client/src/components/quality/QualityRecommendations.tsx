/**
 * Quality Recommendations - Epic 18
 * 
 * Component displaying quality improvement recommendations with priority-based
 * filtering, action tracking, and impact assessment for the quality dashboard.
 * 
 * Task: E18-1753114562561-695DBB - Create quality dashboards
 */
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { 
  Lightbulb,
  TrendingUp,
  Clock,
  Zap,
  CheckCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  Filter,
  ArrowUpDown,
  Target,
  Wrench
} from 'lucide-react';
import { QualityRecommendation } from '../../hooks/useQualityMetrics';

// =============================================================================
// Quality Recommendations Component
// =============================================================================

}
export interface QualityRecommendationsProps {
  recommendations: QualityRecommendation;
  onRecommendationAction?: (recommendationId: string, action: 'acknowledge' | 'start' | 'complete' | 'dismiss') => void;
  compact?: boolean;
  className?: string;
}
}
export const QualityRecommendations: React.FC<QualityRecommendationsProps> = ({)
  recommendations,
  onRecommendationAction,
  compact = false,
  className = ''
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'acknowledged' | 'in_progress' | 'completed' | 'dismissed'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'impact' | 'effort' | 'createdAt'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  // Helper function to get priority color
  const getPriorityColor = (priority: string) => {,
  switch (priority) {
  case 'critical':,
  return 'destructive';
  case 'high':,
  return 'default';
  case 'medium':,
  return 'secondary';
  case 'low':,
  return 'outline';
  default:,
  return 'outline';
};
  // Helper function to get priority icon
  const getPriorityIcon = (priority: string) => {
  switch (priority) {
  case 'critical':,
  return <Zap className="w-4 h-4 text-red-600" />;
  case 'high':,
  return <TrendingUp className="w-4 h-4 text-orange-600" />;
  case 'medium':,
  return <Clock className="w-4 h-4 text-yellow-600" />;
  case 'low':,
  return <Lightbulb className="w-4 h-4 text-blue-600" />;
  default:,
  return <Lightbulb className="w-4 h-4 text-gray-600" />;
};
  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
  switch (status) {
  case 'new':,
  return <Lightbulb className="w-4 h-4 text-blue-500" />;
  case 'acknowledged':,
  return <CheckCircle className="w-4 h-4 text-green-500" />;
  case 'in_progress':,
  return <PlayCircle className="w-4 h-4 text-yellow-500" />;
  case 'completed':,
  return <CheckCircle className="w-4 h-4 text-green-600" />;
  case 'dismissed':,
  return <XCircle className="w-4 h-4 text-gray-500" />;
  default:,
  return <PauseCircle className="w-4 h-4 text-gray-500" />;
};
  // Helper function to get category icon
  const getCategoryIcon = (category: string) => {
  switch (category) {
  case 'testCoverage':,
  return '🧪';
  case 'codeQuality':,
  return '💎';
  case 'performance':,
  return '⚡';
  case 'security':,
  return '🔒';
  case 'documentation':,
  return '📖';
  case 'buildHealth':,
  return '🔧';
  default:,
  return '💡';
};
  // Helper function to get impact/effort indicator
  const getEffortColor = (effort: string) => {
  switch (effort) {
  case 'high':,
  return 'bg-red-500';
  case 'medium':,
  return 'bg-yellow-500';
  case 'low':,
  return 'bg-green-500';
  default:,
  return 'bg-gray-500';
};
  // Filter recommendations
  const filteredRecommendations = recommendations.filter(rec => {)
  const categoryMatch = categoryFilter === 'all' || rec.category === categoryFilter;
    const priorityMatch = priorityFilter === 'all' || rec.priority === priorityFilter;
    const statusMatch = statusFilter === 'all' || rec.status === statusFilter;
    return categoryMatch && priorityMatch && statusMatch;
  });
  // Sort recommendations
  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
    case 'priority': {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
                    (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
      break;
    case 'impact': {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      comparison = (impactOrder[a.impact as keyof typeof impactOrder] || 0) - 
                    (impactOrder[b.impact as keyof typeof impactOrder] || 0);
      break;
    case 'effort': {
      const effortOrder = { low: 3, medium: 2, high: 1 };
      comparison = (effortOrder[a.effort as keyof typeof effortOrder] || 0) - 
                    (effortOrder[b.effort as keyof typeof effortOrder] || 0);
      break;
    case 'createdAt':
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      break;
    default:
      comparison = 0;
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  // Handle recommendation actions
  const handleRecommendationAction = (;);
    recommendationId: string,
    action: 'acknowledge' | 'start' | 'complete' | 'dismiss') => {,
    if (onRecommendationAction) {
      onRecommendationAction(recommendationId, action);
  };
  // Toggle sort order
  const toggleSort = () => {
  setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
};
  if (compact) {
    return;
      <div className={`quality-recommendations-compact ${className}`}>}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Recommendations</span>
              <Badge variant="outline" className="text-xs">
                {filteredRecommendations.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {sortedRecommendations.slice(0, 3).map((rec) => ()
                <div key={rec.id} className="p-3 bg-gray-50 rounded-md">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getCategoryIcon(rec.category)}</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {rec.title}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getPriorityColor(rec.priority)} size="sm">
                      {rec.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex space-x-2">
                      <span>Impact: {rec.impact}</span>
                      <span>•</span>
                      <span>Effort: {rec.effort}</span>
                    </div>
                    {getStatusIcon(rec.status)}
                  </div>
                </div>
              ))}
              {sortedRecommendations.length === 0 && ()
                <div className="text-center py-4 text-gray-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">No recommendations</p>
                </div>
              )}
              {sortedRecommendations.length > 3 && ()
                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500">
                    and {sortedRecommendations.length - 3} more recommendations...
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  return;
    <div className={`quality-recommendations ${className}`}>}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5" />
              <span>Quality Recommendations</span>
            </CardTitle>
            <Badge variant="outline">
              {filteredRecommendations.length} of {recommendations.length} recommendations
            </Badge>
          </div>
          {/* Filters and Controls */}
          <div className="flex items-center space-x-4 pt-4">
            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="testCoverage">Test Coverage</SelectItem>
                <SelectItem value="codeQuality">Code Quality</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="documentation">Documentation</SelectItem>
                <SelectItem value="buildHealth">Build Health</SelectItem>
              </SelectContent>
            </Select>
            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            {/* Sort Controls */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="impact">Impact</SelectItem>
                <SelectItem value="effort">Effort</SelectItem>
                <SelectItem value="createdAt">Created</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={toggleSort}>
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 max-h-96 overflow-y-auto">
            {sortedRecommendations.map((rec) => ()
              <div key={rec.id} className="border border-gray-200 rounded-lg p-6">
                {/* Recommendation Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getCategoryIcon(rec.category)}</span>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{rec.title}</h4>
                        <Badge variant={getPriorityColor(rec.priority)} size="sm">
                          {getPriorityIcon(rec.priority)}
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {rec.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">Impact:</span>
                          <Badge variant="outline" size="sm">{rec.impact}</Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Wrench className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Effort:</span>
                          <Badge variant="outline" size="sm">{rec.effort}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(rec.status)}
                    <span className="text-sm text-gray-500 capitalize">
                      {rec.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                {/* Expected Improvement */}
                {rec.expectedImprovement && ()
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Expected Improvement</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-blue-700">Metric:</span>
                        <div>{rec.expectedImprovement.metric}</div>
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">Current:</span>
                        <div>{rec.expectedImprovement.currentValue}</div>
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">Projected:</span>
                        <div>{rec.expectedImprovement.projectedValue}</div>
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">Confidence:</span>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={rec.expectedImprovement.confidence} 
                            className="w-16 h-2"
                          />
                          <span>{rec.expectedImprovement.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Action Items */}
                {rec.actions && rec.actions.length > 0 && ()
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-2">Action Items</h5>
                    <div className="space-y-2">
                      {rec.actions.map((action, index) => ()
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{action.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-600 mt-1">
                              <span>Type: {action.type.replace('_', ' ')}</span>
                              <span>Effort: {action.effort}</span>
                              {action.automated && ()
                                <Badge variant="outline" size="sm">Automated</Badge>
                              )}
                            </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${getEffortColor(action.effort)}`}></div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Related Files/Components */}
                {(rec.relatedFiles?.length > 0 || rec.relatedComponents?.length > 0) && ()
                  <div className="mb-4 text-sm">
                    {rec.relatedFiles?.length > 0 && ()
                      <div className="mb-2">
                        <span className="font-medium text-gray-700">Related Files:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rec.relatedFiles.slice(0, 3).map((file, index) => ()
                            <Badge key={index} variant="outline" size="sm">{file}</Badge>
                          ))}
                          {rec.relatedFiles.length > 3 && ()
                            <Badge variant="outline" size="sm">+{rec.relatedFiles.length - 3} more</Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {rec.relatedComponents?.length > 0 && ()
                      <div>
                        <span className="font-medium text-gray-700">Related Components:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rec.relatedComponents.slice(0, 3).map((component, index) => ()
                            <Badge key={index} variant="outline" size="sm">{component}</Badge>
                          ))}
                          {rec.relatedComponents.length > 3 && ()
                            <Badge variant="outline" size="sm">+{rec.relatedComponents.length - 3} more</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Created: {rec.createdAt.toLocaleDateString()}
                    {rec.updatedAt && rec.updatedAt.getTime() !== rec.createdAt.getTime() && ()
                      <span> • Updated: {rec.updatedAt.toLocaleDateString()}</span>
                    )}
                  </div>
                  {rec.status === 'new' && ()
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRecommendationAction(rec.id, 'acknowledge')}
                      >
                        Acknowledge
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRecommendationAction(rec.id, 'start')}
                      >
                        Start Work
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRecommendationAction(rec.id, 'dismiss')}
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                  {rec.status === 'acknowledged' && ()
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleRecommendationAction(rec.id, 'start')}
                      >
                        Start Work
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRecommendationAction(rec.id, 'dismiss')}
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                  {rec.status === 'in_progress' && ()
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleRecommendationAction(rec.id, 'complete')}
                      >
                        Mark Complete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sortedRecommendations.length === 0 && ()
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Quality Recommendations
                </h3>
                <p className="text-gray-500">
                  {categoryFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all'
                    ? 'No recommendations match the current filters.'
                    : 'Your codebase is in excellent shape! No immediate improvements needed.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QualityRecommendations;