/**
 * Payment Optimization Tools
 * Story 30.1.3 - Payment Integration Analytics
 * 
 * Tools and recommendations for optimizing payment processing performance
 */

import React, { useState, useCallback } from 'react';
import { PaymentProvider, PaymentMethodType } from '../../../../server/src/marketplace/transaction.types';
import { PaymentProviderMetrics, PaymentMethodMetrics, PaymentFailureAnalysis } from './PaymentAnalyticsDashboard';
import './PaymentOptimizationTools.css';

export interface PaymentOptimizationRecommendation {
  id: string;
  type: 'routing' | 'retry' | 'method' | 'provider' | 'performance';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  priority: number;
  estimatedImprovement: {
    successRate?: number;
    processingTime?: number;
    cost?: number;
  };
  actionItems: Array<{
    task: string;
    owner: string;
    timeline: string;
  }>;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
}

export interface PaymentRoutingRule {
  id: string;
  name: string;
  description: string;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
    value: string | number;
  }>;
  actions: Array<{
    type: 'route_to_provider' | 'use_method' | 'apply_retry_logic';
    provider?: PaymentProvider;
    method?: PaymentMethodType;
    retryCount?: number;
    retryDelay?: number;
  }>;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  lastModified: Date;
}

export interface PaymentOptimizationToolsProps {
  providerMetrics: PaymentProviderMetrics[];
  methodMetrics: PaymentMethodMetrics[];
  failureAnalysis: PaymentFailureAnalysis[];
  className?: string;
}

export const PaymentOptimizationTools: React.FC<PaymentOptimizationToolsProps> = ({
  providerMetrics,
  methodMetrics,
  failureAnalysis,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'routing' | 'monitoring'>('recommendations');
  const [recommendations, setRecommendations] = useState<PaymentOptimizationRecommendation[]>(
    generateRecommendations(providerMetrics, methodMetrics, failureAnalysis)
  );
  const [routingRules, setRoutingRules] = useState<PaymentRoutingRule[]>([]);
  const [isCreatingRule, setIsCreatingRule] = useState(false);

  const handleRecommendationAction = useCallback((
    recommendationId: string, 
    action: 'implement' | 'dismiss' | 'in_progress'
  ) => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === recommendationId 
        ? { 
            ...rec, 
            status: action === 'implement' ? 'in_progress' : 
                   action === 'dismiss' ? 'dismissed' : 'in_progress'
          }
        : rec
    ));
  }, []);

  const handleCreateRoutingRule = useCallback(() => {
    setIsCreatingRule(true);
  }, []);

  const handleSaveRoutingRule = useCallback((rule: Omit<PaymentRoutingRule, 'id' | 'createdAt' | 'lastModified'>) => {
    const newRule: PaymentRoutingRule = {
      ...rule,
      id: `rule_${Date.now()}`,
      createdAt: new Date(),
      lastModified: new Date()
    };
    
    setRoutingRules(prev => [...prev, newRule]);
    setIsCreatingRule(false);
  }, []);

  return (
    <div className={`payment-optimization-tools ${className}`}>
      {/* Header */}
      <div className="optimization-header">
        <h2>Payment Optimization Tools</h2>
        <p className="header-subtitle">
          Analyze performance and optimize payment processing with AI-powered recommendations
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="optimization-tabs">
        {[
          { id: 'recommendations', label: 'Recommendations', count: recommendations.filter(r => r.status === 'pending').length },
          { id: 'routing', label: 'Smart Routing', count: routingRules.filter(r => r.isActive).length },
          { id: 'monitoring', label: 'Real-time Monitoring' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="optimization-content">
        {activeTab === 'recommendations' && (
          <RecommendationsPanel
            recommendations={recommendations}
            onAction={handleRecommendationAction}
          />
        )}

        {activeTab === 'routing' && (
          <RoutingPanel
            rules={routingRules}
            providerMetrics={providerMetrics}
            onCreateRule={handleCreateRoutingRule}
            onSaveRule={handleSaveRoutingRule}
            isCreating={isCreatingRule}
            onCancelCreate={() => setIsCreatingRule(false)}
          />
        )}

        {activeTab === 'monitoring' && (
          <MonitoringPanel
            providerMetrics={providerMetrics}
            methodMetrics={methodMetrics}
            failureAnalysis={failureAnalysis}
          />
        )}
      </div>
    </div>
  );
};

// Recommendations Panel Component
const RecommendationsPanel: React.FC<{
  recommendations: PaymentOptimizationRecommendation[];
  onAction: (id: string, action: 'implement' | 'dismiss' | 'in_progress') => void;
}> = ({ recommendations, onAction }) => {
  const pendingRecommendations = recommendations
    .filter(rec => rec.status === 'pending')
    .sort((a, b) => b.priority - a.priority);

  return (
    <div className="recommendations-panel">
      <div className="panel-header">
        <h3>AI-Powered Recommendations</h3>
        <div className="recommendations-summary">
          <span className="high-priority">
            {pendingRecommendations.filter(r => r.impact === 'high').length} High Impact
          </span>
          <span className="medium-priority">
            {pendingRecommendations.filter(r => r.impact === 'medium').length} Medium Impact
          </span>
          <span className="low-priority">
            {pendingRecommendations.filter(r => r.impact === 'low').length} Low Impact
          </span>
        </div>
      </div>

      <div className="recommendations-list">
        {pendingRecommendations.map(recommendation => (
          <div key={recommendation.id} className={`recommendation-card ${recommendation.impact}-impact`}>
            <div className="recommendation-header">
              <div className="rec-title-section">
                <h4>{recommendation.title}</h4>
                <div className="rec-badges">
                  <span className={`impact-badge ${recommendation.impact}`}>
                    {recommendation.impact.toUpperCase()} IMPACT
                  </span>
                  <span className={`effort-badge ${recommendation.effort}`}>
                    {recommendation.effort.toUpperCase()} EFFORT
                  </span>
                </div>
              </div>
              <div className="rec-priority">
                Priority: {recommendation.priority}
              </div>
            </div>

            <p className="rec-description">{recommendation.description}</p>

            {/* Estimated Improvements */}
            <div className="estimated-improvements">
              <h5>Estimated Improvements:</h5>
              <div className="improvements-grid">
                {recommendation.estimatedImprovement.successRate && (
                  <div className="improvement-item">
                    <span className="improvement-label">Success Rate:</span>
                    <span className="improvement-value">
                      +{recommendation.estimatedImprovement.successRate.toFixed(1)}%
                    </span>
                  </div>
                )}
                {recommendation.estimatedImprovement.processingTime && (
                  <div className="improvement-item">
                    <span className="improvement-label">Processing Time:</span>
                    <span className="improvement-value">
                      -{recommendation.estimatedImprovement.processingTime}ms
                    </span>
                  </div>
                )}
                {recommendation.estimatedImprovement.cost && (
                  <div className="improvement-item">
                    <span className="improvement-label">Cost Reduction:</span>
                    <span className="improvement-value">
                      -{recommendation.estimatedImprovement.cost.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Items */}
            <div className="action-items">
              <h5>Implementation Steps:</h5>
              <div className="action-items-list">
                {recommendation.actionItems.map((item, index) => (
                  <div key={index} className="action-item">
                    <span className="action-task">{item.task}</span>
                    <span className="action-owner">{item.owner}</span>
                    <span className="action-timeline">{item.timeline}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="recommendation-actions">
              <button
                className="action-button implement"
                onClick={() => onAction(recommendation.id, 'implement')}
              >
                Implement
              </button>
              <button
                className="action-button in-progress"
                onClick={() => onAction(recommendation.id, 'in_progress')}
              >
                Mark In Progress
              </button>
              <button
                className="action-button dismiss"
                onClick={() => onAction(recommendation.id, 'dismiss')}
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Routing Panel Component
const RoutingPanel: React.FC<{
  rules: PaymentRoutingRule[];
  providerMetrics: PaymentProviderMetrics[];
  onCreateRule: () => void;
  onSaveRule: (rule: Omit<PaymentRoutingRule, 'id' | 'createdAt' | 'lastModified'>) => void;
  isCreating: boolean;
  onCancelCreate: () => void;
}> = ({ rules, providerMetrics, onCreateRule, onSaveRule, isCreating, onCancelCreate }) => {
  return (
    <div className="routing-panel">
      <div className="panel-header">
        <h3>Smart Payment Routing</h3>
        <button className="create-rule-button" onClick={onCreateRule}>
          Create New Rule
        </button>
      </div>

      {/* Provider Performance Overview */}
      <div className="provider-performance-overview">
        <h4>Provider Performance Snapshot</h4>
        <div className="providers-grid">
          {providerMetrics.map(provider => (
            <div key={provider.provider} className="provider-card">
              <h5>{provider.provider.toUpperCase()}</h5>
              <div className="provider-stats">
                <div className="stat">
                  <span className="stat-label">Success Rate:</span>
                  <span className={`stat-value ${provider.successRate >= 95 ? 'good' : provider.successRate >= 90 ? 'warning' : 'poor'}`}>
                    {provider.successRate.toFixed(1)}%
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Avg Time:</span>
                  <span className="stat-value">{provider.averageProcessingTime}ms</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Fee Rate:</span>
                  <span className="stat-value">{provider.averageFeeRate.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Routing Rules */}
      <div className="routing-rules">
        <h4>Active Routing Rules</h4>
        {rules.length === 0 ? (
          <div className="no-rules">
            <p>No routing rules configured. Create your first rule to optimize payment routing.</p>
          </div>
        ) : (
          <div className="rules-list">
            {rules.map(rule => (
              <div key={rule.id} className={`rule-card ${rule.isActive ? 'active' : 'inactive'}`}>
                <div className="rule-header">
                  <h5>{rule.name}</h5>
                  <div className="rule-status">
                    <span className={`status-badge ${rule.isActive ? 'active' : 'inactive'}`}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="priority">Priority: {rule.priority}</span>
                  </div>
                </div>
                <p className="rule-description">{rule.description}</p>
                
                <div className="rule-conditions">
                  <h6>Conditions:</h6>
                  {rule.conditions.map((condition, index) => (
                    <div key={index} className="condition">
                      {condition.field} {condition.operator} {condition.value}
                    </div>
                  ))}
                </div>

                <div className="rule-actions">
                  <h6>Actions:</h6>
                  {rule.actions.map((action, index) => (
                    <div key={index} className="action">
                      {action.type} 
                      {action.provider && ` → ${action.provider}`}
                      {action.method && ` (${action.method})`}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rule Creation Modal/Form */}
      {isCreating && (
        <RoutingRuleCreator
          onSave={onSaveRule}
          onCancel={onCancelCreate}
          providerMetrics={providerMetrics}
        />
      )}
    </div>
  );
};

// Monitoring Panel Component
const MonitoringPanel: React.FC<{
  providerMetrics: PaymentProviderMetrics[];
  methodMetrics: PaymentMethodMetrics[];
  failureAnalysis: PaymentFailureAnalysis[];
}> = ({ providerMetrics, methodMetrics, failureAnalysis }) => {
  const [alertThresholds, setAlertThresholds] = useState({
    successRate: 90,
    processingTime: 1000,
    failureRate: 10
  });

  return (
    <div className="monitoring-panel">
      <div className="panel-header">
        <h3>Real-time Payment Monitoring</h3>
      </div>

      {/* Alert Thresholds */}
      <div className="alert-thresholds">
        <h4>Alert Thresholds</h4>
        <div className="thresholds-grid">
          <div className="threshold-item">
            <label>Success Rate Minimum:</label>
            <input
              type="number"
              value={alertThresholds.successRate}
              onChange={(e) => setAlertThresholds(prev => ({
                ...prev,
                successRate: parseFloat(e.target.value)
              }))}
              min="0"
              max="100"
              step="0.1"
            />
            <span>%</span>
          </div>
          <div className="threshold-item">
            <label>Max Processing Time:</label>
            <input
              type="number"
              value={alertThresholds.processingTime}
              onChange={(e) => setAlertThresholds(prev => ({
                ...prev,
                processingTime: parseInt(e.target.value)
              }))}
              min="0"
              step="100"
            />
            <span>ms</span>
          </div>
          <div className="threshold-item">
            <label>Max Failure Rate:</label>
            <input
              type="number"
              value={alertThresholds.failureRate}
              onChange={(e) => setAlertThresholds(prev => ({
                ...prev,
                failureRate: parseFloat(e.target.value)
              }))}
              min="0"
              max="100"
              step="0.1"
            />
            <span>%</span>
          </div>
        </div>
      </div>

      {/* Current Alerts */}
      <div className="current-alerts">
        <h4>Current Alerts</h4>
        <div className="alerts-list">
          {providerMetrics.map(provider => {
            const alerts = [];
            
            if (provider.successRate < alertThresholds.successRate) {
              alerts.push({
                type: 'warning',
                message: `${provider.provider} success rate (${provider.successRate.toFixed(1)}%) below threshold`
              });
            }
            
            if (provider.averageProcessingTime > alertThresholds.processingTime) {
              alerts.push({
                type: 'warning',
                message: `${provider.provider} processing time (${provider.averageProcessingTime}ms) above threshold`
              });
            }

            const failureRate = (provider.failedPayments / provider.totalAttempts) * 100;
            if (failureRate > alertThresholds.failureRate) {
              alerts.push({
                type: 'error',
                message: `${provider.provider} failure rate (${failureRate.toFixed(1)}%) above threshold`
              });
            }

            return alerts.map((alert, index) => (
              <div key={`${provider.provider}-${index}`} className={`alert ${alert.type}`}>
                <span className="alert-icon">⚠️</span>
                <span className="alert-message">{alert.message}</span>
                <span className="alert-time">Just now</span>
              </div>
            ));
          })}
        </div>
      </div>

      {/* Performance Trends */}
      <div className="performance-trends">
        <h4>Performance Trends</h4>
        <div className="trends-grid">
          {providerMetrics.map(provider => (
            <div key={provider.provider} className="trend-card">
              <h5>{provider.provider.toUpperCase()}</h5>
              <div className="trend-chart">
                {/* Simple trend visualization */}
                <div className="trend-line">
                  {provider.performanceByHour.slice(-12).map((hour, index) => (
                    <div
                      key={index}
                      className="trend-point"
                      style={{
                        height: `${(hour.successRate / 100) * 40}px`,
                        backgroundColor: hour.successRate >= 95 ? '#10b981' : 
                                       hour.successRate >= 90 ? '#f59e0b' : '#ef4444'
                      }}
                      title={`Hour ${hour.hour}: ${hour.successRate.toFixed(1)}%`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Routing Rule Creator Component
const RoutingRuleCreator: React.FC<{
  onSave: (rule: Omit<PaymentRoutingRule, 'id' | 'createdAt' | 'lastModified'>) => void;
  onCancel: () => void;
  providerMetrics: PaymentProviderMetrics[];
}> = ({ onSave, onCancel, providerMetrics }) => {
  const [rule, setRule] = useState({
    name: '',
    description: '',
    conditions: [{ field: 'amount', operator: 'greater_than' as const, value: 0 }],
    actions: [{ type: 'route_to_provider' as const, provider: PaymentProvider.STRIPE }],
    isActive: true,
    priority: 1
  });

  const handleSave = () => {
    onSave(rule);
  };

  return (
    <div className="rule-creator-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h4>Create Routing Rule</h4>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Rule Name:</label>
            <input
              type="text"
              value={rule.name}
              onChange={(e) => setRule(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Route high-value transactions to Stripe"
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={rule.description}
              onChange={(e) => setRule(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe when and why this rule should be applied..."
            />
          </div>

          <div className="form-group">
            <label>Priority:</label>
            <input
              type="number"
              value={rule.priority}
              onChange={(e) => setRule(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
              min="1"
              max="10"
            />
          </div>

          {/* More form fields would be added here for conditions and actions */}
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="save-button" onClick={handleSave}>
            Save Rule
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate recommendations
function generateRecommendations(
  providerMetrics: PaymentProviderMetrics[],
  methodMetrics: PaymentMethodMetrics[],
  failureAnalysis: PaymentFailureAnalysis[]
): PaymentOptimizationRecommendation[] {
  const recommendations: PaymentOptimizationRecommendation[] = [];

  // Analyze success rates
  providerMetrics.forEach((provider, index) => {
    if (provider.successRate < 95) {
      recommendations.push({
        id: `success_rate_${provider.provider}`,
        type: 'provider',
        title: `Improve ${provider.provider} Success Rate`,
        description: `${provider.provider} has a success rate of ${provider.successRate.toFixed(1)}%, which is below the recommended 95% threshold. Consider implementing retry logic and payment method fallbacks.`,
        impact: provider.successRate < 90 ? 'high' : 'medium',
        effort: 'medium',
        priority: 10 - index,
        estimatedImprovement: {
          successRate: 95 - provider.successRate,
        },
        actionItems: [
          { task: 'Implement intelligent retry logic', owner: 'Engineering Team', timeline: '2 weeks' },
          { task: 'Add payment method fallbacks', owner: 'Product Team', timeline: '3 weeks' },
          { task: 'Monitor and analyze retry performance', owner: 'Analytics Team', timeline: '1 week' }
        ],
        status: 'pending'
      });
    }

    if (provider.averageProcessingTime > 1000) {
      recommendations.push({
        id: `processing_time_${provider.provider}`,
        type: 'performance',
        title: `Optimize ${provider.provider} Processing Time`,
        description: `${provider.provider} average processing time is ${provider.averageProcessingTime}ms, which impacts user experience. Consider API optimizations and caching strategies.`,
        impact: 'medium',
        effort: 'high',
        priority: 7 - index,
        estimatedImprovement: {
          processingTime: Math.max(200, provider.averageProcessingTime - 500),
        },
        actionItems: [
          { task: 'Optimize API call patterns', owner: 'Engineering Team', timeline: '4 weeks' },
          { task: 'Implement response caching', owner: 'DevOps Team', timeline: '2 weeks' },
          { task: 'Add performance monitoring', owner: 'SRE Team', timeline: '1 week' }
        ],
        status: 'pending'
      });
    }
  });

  // Analyze failure patterns
  failureAnalysis.forEach((failure, index) => {
    if (failure.percentage > 20) {
      recommendations.push({
        id: `failure_${failure.provider}_${failure.failureCode}`,
        type: 'retry',
        title: `Address High-Frequency ${failure.failureCode} Failures`,
        description: `${failure.failureCode} represents ${failure.percentage.toFixed(1)}% of failures for ${failure.provider}. Focus on this error type for maximum impact.`,
        impact: 'high',
        effort: 'low',
        priority: 15 - index,
        estimatedImprovement: {
          successRate: failure.percentage * 0.3, // Assume 30% improvement
        },
        actionItems: [
          { task: 'Analyze failure root causes', owner: 'Engineering Team', timeline: '1 week' },
          { task: 'Implement targeted retry logic', owner: 'Engineering Team', timeline: '2 weeks' },
          { task: 'Add user-friendly error messaging', owner: 'UX Team', timeline: '1 week' }
        ],
        status: 'pending'
      });
    }
  });

  // Smart routing recommendations
  if (providerMetrics.length > 1) {
    const bestProvider = providerMetrics.reduce((best, current) => 
      current.successRate > best.successRate ? current : best
    );
    
    recommendations.push({
      id: 'smart_routing',
      type: 'routing',
      title: 'Implement Smart Payment Routing',
      description: `Route payments intelligently based on transaction characteristics. ${bestProvider.provider} shows the best performance with ${bestProvider.successRate.toFixed(1)}% success rate.`,
      impact: 'high',
      effort: 'medium',
      priority: 20,
      estimatedImprovement: {
        successRate: 2.5,
        cost: 0.5
      },
      actionItems: [
        { task: 'Design routing algorithm', owner: 'Engineering Team', timeline: '3 weeks' },
        { task: 'Implement A/B testing framework', owner: 'Data Team', timeline: '2 weeks' },
        { task: 'Create routing configuration UI', owner: 'Frontend Team', timeline: '4 weeks' }
      ],
      status: 'pending'
    });
  }

  return recommendations.sort((a, b) => b.priority - a.priority);
}

export default PaymentOptimizationTools;