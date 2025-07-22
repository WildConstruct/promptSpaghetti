/**
 * Enhanced Toggle Dashboard Integration (Epic 17 UI Integration)
 * 
 * Provides React hooks and components that integrate the Enhanced Toggle Evaluation System
 * and Toggle Dependency Integration Service with the existing FeatureToggleDashboard.
 * 
 * Features:
 * - Real-time dependency validation hooks
 * - Impact preview components for admin operations
 * - Enhanced toggle evaluation with Claude context
 * - Dependency visualization integration
 * - Risk assessment display components
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  AlertTriangle, 
  Zap, 
  Shield, 
  Activity, 
  GitBranch, 
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';

// Types from our enhanced services
interface EnhancedEvaluationResult {
  enabled: boolean;
  value: any;
  reason: string;
  evaluationTime: number;
  cacheHit: boolean;
  ruleName?: string;
  dependencyStatus?: {
    checked: boolean;
    violations: any[];
    warnings: any[];
    blockers: string[];
    requirements: string[];
    canActivate: boolean;
  };
  cascadeEffects?: any[];
  riskAssessment?: {
    riskScore: number;
    factors: any[];
    mitigation: string[];
    recommendation: 'proceed' | 'caution' | 'review' | 'block';
  };
  impactScore?: number;
  claudeMetadata?: {
    costImpact: 'none' | 'low' | 'medium' | 'high';
    qualityImpact: 'none' | 'positive' | 'neutral' | 'negative';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    modelRecommendation?: string;
  };
}

interface OperationEnforcement {
  allowed: boolean;
  blockers: any[];
  warnings: any[];
  cascadeActions: any[];
  impactAssessment: any;
  riskScore: number;
  recommendation: any;
  rollbackPlan?: any;
}

interface ImpactPreview {
  operation: any;
  directImpact: any[];
  indirectImpact: any[];
  cascadePreview: any[];
  riskFactors: any[];
  overallRiskScore: number;
  estimatedAffectedUsers: number;
  estimatedExecutionTime: number;
  recommendedApprovals: string[];
  safetyChecks: string[];
}

// Custom hooks for enhanced toggle operations

/**
 * Hook for enhanced toggle evaluation with dependency awareness
 */
export const useEnhancedToggleEvaluation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluateToggle = useCallback(async (
    toggleKey: string,
    context?: {
      claudeContext?: {
        modelVersion?: string;
        promptType?: 'creative' | 'analytical' | 'conversational' | 'code';
        tokensUsed?: number;
        riskLevel?: 'low' | 'medium' | 'high' | 'critical';
        costImpact?: 'none' | 'low' | 'medium' | 'high';
      };
      performanceHints?: {
        priority?: 'low' | 'normal' | 'high' | 'critical';
        maxEvaluationTime?: number;
      };
      dependencyContext?: {
        enforceDependencies?: boolean;
        cascadeEvaluation?: boolean;
        impactAnalysis?: boolean;
      };
      traceEnabled?: boolean;
    }
  ): Promise<EnhancedEvaluationResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/enhanced-feature-toggles/enhanced-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          toggleKey,
          context
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Enhanced evaluation failed');
      }

      const data = await response.json();
      return data.result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const evaluateBulkToggles = useCallback(async (
    toggleKeys: string[],
    context?: any
  ): Promise<Record<string, EnhancedEvaluationResult> | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/enhanced-feature-toggles/bulk-enhanced-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          toggleKeys,
          context
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Bulk evaluation failed');
      }

      const data = await response.json();
      return data.results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    evaluateToggle,
    evaluateBulkToggles,
    loading,
    error
  };
};

/**
 * Hook for operation dependency enforcement
 */
export const useOperationEnforcement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enforceOperation = useCallback(async (
    operation: {
      type: 'activate' | 'deactivate' | 'modify_value' | 'modify_config' | 'archive';
      targetToggleId: string;
      reason: string;
      newState?: boolean;
      newValue?: any;
    },
    context: {
      requestSource: 'admin_dashboard';
      urgencyLevel: 'low' | 'normal' | 'high' | 'emergency';
      approvals?: any[];
      rolloutStrategy?: 'immediate' | 'gradual' | 'scheduled';
    }
  ): Promise<OperationEnforcement | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/enhanced-feature-toggles/enforce-operation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          operation,
          context
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          // Operation blocked by enforcement
          return data.enforcement;
        }
        throw new Error(data.error || 'Operation enforcement failed');
      }

      return data.enforcement;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const executeOperation = useCallback(async (
    operation: any,
    enforcement: OperationEnforcement,
    context: any
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/enhanced-feature-toggles/execute-operation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          operation,
          context,
          enforcement
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Operation execution failed');
      }

      const data = await response.json();
      return data.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    enforceOperation,
    executeOperation,
    loading,
    error
  };
};

/**
 * Hook for impact preview functionality
 */
export const useImpactPreview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getImpactPreview = useCallback(async (
    operation: {
      type: string;
      targetToggleId: string;
      reason: string;
    },
    context?: any
  ): Promise<ImpactPreview | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/enhanced-feature-toggles/impact-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          operation,
          context: context || {
            requestSource: 'admin_dashboard',
            urgencyLevel: 'normal'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Impact preview failed');
      }

      const data = await response.json();
      return data.preview;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getImpactPreview,
    loading,
    error
  };
};

// Enhanced UI Components

/**
 * Risk Assessment Display Component
 */
export const RiskAssessmentBadge: React.FC<{
  riskAssessment?: {
    riskScore: number;
    recommendation: 'proceed' | 'caution' | 'review' | 'block';
  };
}> = ({ riskAssessment }) => {
  if (!riskAssessment) return null;

  const { riskScore, recommendation } = riskAssessment;
  
  const getRiskColor = () => {
    if (riskScore >= 0.8) return 'text-red-600 bg-red-50 border-red-200';
    if (riskScore >= 0.6) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (riskScore >= 0.3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getRiskIcon = () => {
    if (riskScore >= 0.8) return <XCircle size={14} />;
    if (riskScore >= 0.6) return <AlertTriangle size={14} />;
    if (riskScore >= 0.3) return <AlertCircle size={14} />;
    return <CheckCircle size={14} />;
  };

  const getRiskText = () => {
    if (riskScore >= 0.8) return 'High Risk';
    if (riskScore >= 0.6) return 'Medium Risk';
    if (riskScore >= 0.3) return 'Low Risk';
    return 'Safe';
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getRiskColor()}`}>
      {getRiskIcon()}
      {getRiskText()}
      <span className="text-gray-500">({Math.round(riskScore * 100)}%)</span>
    </div>
  );
};

/**
 * Claude Impact Display Component
 */
export const ClaudeImpactDisplay: React.FC<{
  claudeMetadata?: {
    costImpact: 'none' | 'low' | 'medium' | 'high';
    qualityImpact: 'none' | 'positive' | 'neutral' | 'negative';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    modelRecommendation?: string;
  };
}> = ({ claudeMetadata }) => {
  if (!claudeMetadata || claudeMetadata.costImpact === 'none') return null;

  const getCostColor = () => {
    switch (claudeMetadata.costImpact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getQualityIcon = () => {
    switch (claudeMetadata.qualityImpact) {
      case 'positive': return <TrendingUp size={12} className="text-green-600" />;
      case 'negative': return <AlertTriangle size={12} className="text-red-600" />;
      default: return <Activity size={12} className="text-gray-600" />;
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1">
        <Zap size={12} className={getCostColor()} />
        <span className={getCostColor()}>
          {claudeMetadata.costImpact.charAt(0).toUpperCase() + claudeMetadata.costImpact.slice(1)} Cost
        </span>
      </div>
      <div className="flex items-center gap-1">
        {getQualityIcon()}
        <span className="text-gray-600">
          Quality: {claudeMetadata.qualityImpact}
        </span>
      </div>
      {claudeMetadata.modelRecommendation && (
        <div className="text-gray-500" title={claudeMetadata.modelRecommendation}>
          <Shield size={12} />
        </div>
      )}
    </div>
  );
};

/**
 * Performance Metrics Display Component
 */
export const PerformanceMetrics: React.FC<{
  evaluationTime: number;
  cacheHit: boolean;
}> = ({ evaluationTime, cacheHit }) => {
  const getPerformanceColor = () => {
    if (evaluationTime > 100) return 'text-red-600';
    if (evaluationTime > 50) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <div className="flex items-center gap-1">
        <Clock size={12} className={getPerformanceColor()} />
        <span className={getPerformanceColor()}>
          {evaluationTime}ms
        </span>
      </div>
      {cacheHit && (
        <div className="flex items-center gap-1 text-blue-600">
          <Activity size={12} />
          <span>Cached</span>
        </div>
      )}
    </div>
  );
};

/**
 * Dependency Status Indicator Component
 */
export const DependencyStatusIndicator: React.FC<{
  dependencyStatus?: {
    checked: boolean;
    violations: any[];
    warnings: any[];
    blockers: string[];
    canActivate: boolean;
  };
}> = ({ dependencyStatus }) => {
  if (!dependencyStatus || !dependencyStatus.checked) return null;

  const hasBlockers = dependencyStatus.blockers.length > 0;
  const hasWarnings = dependencyStatus.warnings.length > 0;
  const hasViolations = dependencyStatus.violations.length > 0;

  if (hasBlockers) {
    return (
      <div className="flex items-center gap-1 text-red-600 text-xs">
        <XCircle size={12} />
        <span>Blocked ({dependencyStatus.blockers.length})</span>
      </div>
    );
  }

  if (hasViolations || hasWarnings) {
    return (
      <div className="flex items-center gap-1 text-orange-600 text-xs">
        <AlertTriangle size={12} />
        <span>
          {hasViolations ? `${dependencyStatus.violations.length} violations` : ''}
          {hasViolations && hasWarnings ? ', ' : ''}
          {hasWarnings ? `${dependencyStatus.warnings.length} warnings` : ''}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-green-600 text-xs">
      <CheckCircle size={12} />
      <span>Dependencies OK</span>
    </div>
  );
};

/**
 * Cascade Effects Preview Component
 */
export const CascadeEffectsPreview: React.FC<{
  cascadeEffects?: any[];
  compact?: boolean;
}> = ({ cascadeEffects, compact = false }) => {
  if (!cascadeEffects || cascadeEffects.length === 0) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-blue-600 text-xs">
        <GitBranch size={12} />
        <span>{cascadeEffects.length} cascade effects</span>
      </div>
    );
  }

  return (
    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
      <div className="flex items-center gap-1 text-blue-700 text-sm font-medium mb-1">
        <GitBranch size={14} />
        Cascade Effects ({cascadeEffects.length})
      </div>
      <div className="space-y-1">
        {cascadeEffects.slice(0, 3).map((effect, index) => (
          <div key={index} className="text-xs text-blue-600">
            • {effect.targetToggle}: {effect.effect} - {effect.reason}
          </div>
        ))}
        {cascadeEffects.length > 3 && (
          <div className="text-xs text-blue-500">
            +{cascadeEffects.length - 3} more effects
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Impact Preview Modal Component
 */
export const ImpactPreviewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  operation: {
    type: string;
    targetToggleId: string;
    reason: string;
  };
  onProceed: (enforcement: OperationEnforcement) => void;
}> = ({ isOpen, onClose, operation, onProceed }) => {
  const { getImpactPreview, loading: previewLoading } = useImpactPreview();
  const { enforceOperation, loading: enforcementLoading } = useOperationEnforcement();
  
  const [preview, setPreview] = useState<ImpactPreview | null>(null);
  const [enforcement, setEnforcement] = useState<OperationEnforcement | null>(null);

  useEffect(() => {
    if (isOpen && operation) {
      getImpactPreview(operation).then(setPreview);
    }
  }, [isOpen, operation, getImpactPreview]);

  const handleProceedClick = async () => {
    if (!enforcement) {
      const result = await enforceOperation(operation, {
        requestSource: 'admin_dashboard',
        urgencyLevel: 'normal'
      });
      
      if (result) {
        setEnforcement(result);
        if (result.allowed) {
          onProceed(result);
        }
      }
    } else {
      onProceed(enforcement);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Impact Preview</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {previewLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="animate-spin" size={24} />
              <span className="ml-2">Analyzing impact...</span>
            </div>
          ) : preview ? (
            <div className="space-y-4">
              {/* Operation Details */}
              <div className="border-b pb-3">
                <h3 className="font-medium text-gray-900">Operation</h3>
                <p className="text-sm text-gray-600">
                  {operation.type} toggle {operation.targetToggleId}
                </p>
                <p className="text-xs text-gray-500 mt-1">{operation.reason}</p>
              </div>

              {/* Risk Assessment */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Risk Assessment</h3>
                <div className="flex items-center justify-between">
                  <RiskAssessmentBadge riskAssessment={{
                    riskScore: preview.overallRiskScore,
                    recommendation: preview.overallRiskScore >= 0.8 ? 'block' : 
                                  preview.overallRiskScore >= 0.6 ? 'review' : 
                                  preview.overallRiskScore >= 0.3 ? 'caution' : 'proceed'
                  }} />
                  <div className="text-sm text-gray-600">
                    {preview.estimatedAffectedUsers.toLocaleString()} users affected
                  </div>
                </div>
              </div>

              {/* Direct Impact */}
              {preview.directImpact.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Direct Impact</h3>
                  <div className="space-y-1">
                    {preview.directImpact.slice(0, 5).map((impact, index) => (
                      <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <AlertCircle size={12} className="text-orange-500" />
                        {impact.toggleId}: {impact.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cascade Preview */}
              <CascadeEffectsPreview cascadeEffects={preview.cascadePreview} />

              {/* Safety Checks */}
              {preview.safetyChecks.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Safety Checks</h3>
                  <ul className="space-y-1">
                    {preview.safetyChecks.map((check, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <Shield size={12} className="text-blue-500" />
                        {check}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Enforcement Status */}
              {enforcement && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <h4 className="font-medium text-sm mb-2">Enforcement Result</h4>
                  <div className="flex items-center gap-2">
                    {enforcement.allowed ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <XCircle size={16} className="text-red-600" />
                    )}
                    <span className="text-sm">
                      {enforcement.allowed ? 'Operation allowed' : 'Operation blocked'}
                    </span>
                  </div>
                  {enforcement.blockers.length > 0 && (
                    <div className="mt-2 text-xs text-red-600">
                      Blocked by: {enforcement.blockers.map(b => b.reason).join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Failed to load impact preview
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            {preview && (
              <button
                onClick={handleProceedClick}
                disabled={enforcementLoading || (enforcement && !enforcement.allowed)}
                className={`px-4 py-2 rounded ${
                  enforcement && !enforcement.allowed
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : preview.overallRiskScore >= 0.8
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : preview.overallRiskScore >= 0.6
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {enforcementLoading ? (
                  <>
                    <Loader className="animate-spin inline mr-2" size={16} />
                    Validating...
                  </>
                ) : enforcement && !enforcement.allowed ? (
                  'Blocked'
                ) : enforcement ? (
                  'Execute Operation'
                ) : (
                  'Validate & Proceed'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default {
  useEnhancedToggleEvaluation,
  useOperationEnforcement,
  useImpactPreview,
  RiskAssessmentBadge,
  ClaudeImpactDisplay,
  PerformanceMetrics,
  DependencyStatusIndicator,
  CascadeEffectsPreview,
  ImpactPreviewModal
};