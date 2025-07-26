/**
 * React Hook for Policy Management Integration
 *
 * Provides easy-to-use React integration for the unified policy management system.
 * Handles policy evaluation, violation monitoring, and compliance tracking.
 */
import { useEffect, useState, useCallback, useMemo } from 'react';
import { PolicyManagement, PolicyDomain, PolicyType, PolicyStatus, ComplianceFramework } from '../services/PolicyManagement';
export const usePolicyManagement = (config = {}) => {
    const { autoEvaluate = false, cacheTimeout = 300000, // 5 minutes
    enableRealTimeUpdates = true, complianceFrameworks = [] } = config;
    const [policyManager] = useState(() => new PolicyManagement());
    const [policies, setPolicies] = useState([]);
    const [evaluationResults, setEvaluationResults] = useState([]);
    const [violations, setViolations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // Load policies
    const loadPolicies = useCallback(async (filters) => {
        try {
            setIsLoading(true);
            const loadedPolicies = policyManager.getPolicies(filters);
            setPolicies(loadedPolicies);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load policies');
        }
        finally {
            setIsLoading(false);
        }
    }, [policyManager]);
    // Create new policy
    const createPolicy = useCallback(async (policyData, createdBy) => {
        try {
            setIsLoading(true);
            const newPolicy = await policyManager.createPolicy(policyData, createdBy);
            await loadPolicies(); // Refresh policies
            return newPolicy;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create policy';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    }, [policyManager, loadPolicies]);
    // Update existing policy
    const updatePolicy = useCallback(async (policyId, updates, updatedBy) => {
        try {
            setIsLoading(true);
            const updatedPolicy = await policyManager.updatePolicy(policyId, updates, updatedBy);
            await loadPolicies(); // Refresh policies
            return updatedPolicy;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update policy';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    }, [policyManager, loadPolicies]);
    // Delete policy
    const deletePolicy = useCallback(async (policyId, deletedBy) => {
        try {
            setIsLoading(true);
            await policyManager.deletePolicy(policyId, deletedBy);
            await loadPolicies(); // Refresh policies
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete policy';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    }, [policyManager, loadPolicies]);
    // Evaluate policies for a given context
    const evaluatePolicies = useCallback(async (evaluationOptions) => {
        try {
            setIsLoading(true);
            setError(null);
            const context = {
                requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date(),
                userId: evaluationOptions.userId,
                entityType: evaluationOptions.entityType,
                entityId: evaluationOptions.entityId,
                sessionData: {
                    ipAddress: '127.0.0.1', // This would come from actual session
                    userAgent: navigator.userAgent,
                    geolocation: undefined,
                    authenticationMethod: 'session'
                },
                operation: {
                    type: evaluationOptions.operation.type,
                    parameters: evaluationOptions.operation.parameters,
                    riskLevel: evaluationOptions.operation.riskLevel || 'MEDIUM'
                },
                contentContext: evaluationOptions.contentContext,
                additionalContext: evaluationOptions.additionalContext || {}
            };
            const results = await policyManager.evaluatePolicies(context);
            setEvaluationResults(prev => [...results, ...prev].slice(0, 100)); // Keep last 100 results
            return results;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Policy evaluation failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    }, [policyManager]);
    // Quick policy check for specific scenarios
    const checkVFXHistoricalAccuracy = useCallback(async (templateId, historicalPeriod, culturalContext, expertReviewed = false) => {
        const results = await evaluatePolicies({
            entityType: 'TEMPLATE',
            entityId: templateId,
            operation: {
                type: 'historical_accuracy_check',
                parameters: { historicalPeriod, culturalContext }
            },
            contentContext: {
                historicalPeriod,
                culturalContext,
                accuracyLevel: 'STRICT',
                expertReviewed
            }
        });
        const violations = results.filter(r => r.result === 'DENY' || r.result === 'RESTRICT');
        const reviewRequired = results.some(r => r.metadata.reviewRequired);
        return {
            allowed: violations.length === 0,
            violations: violations.map(v => v.policyName),
            reviewRequired
        };
    }, [evaluatePolicies]);
    // Check data protection compliance
    const checkDataProtectionCompliance = useCallback(async (userId, dataType, operation, dataClassification) => {
        const results = await evaluatePolicies({
            userId,
            entityType: 'USER',
            entityId: userId,
            operation: {
                type: operation,
                parameters: { dataType, dataClassification },
                riskLevel: 'MEDIUM'
            }
        });
        const nonCompliant = results.filter(r => r.result === 'DENY');
        const frameworks = results.flatMap(r => r.complianceStatus.frameworks.map(f => f.framework));
        const actions = results.flatMap(r => r.triggeredActions.map(a => a.actionType));
        return {
            compliant: nonCompliant.length === 0,
            frameworks,
            actions
        };
    }, [evaluatePolicies]);
    // Generate compliance report
    const generateComplianceReport = useCallback(async (framework) => {
        try {
            setIsLoading(true);
            const report = await policyManager.generateComplianceReport(framework);
            return report;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate compliance report';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    }, [policyManager]);
    // Get policy statistics
    const getPolicyStatistics = useCallback(() => {
        const stats = {
            totalPolicies: policies.length,
            activePolicies: policies.filter(p => p.status === PolicyStatus.ACTIVE).length,
            byDomain: policies.reduce((acc, policy) => {
                acc[policy.domain] = (acc[policy.domain] || 0) + 1;
                return acc;
            }, {}),
            byType: policies.reduce((acc, policy) => {
                acc[policy.type] = (acc[policy.type] || 0) + 1;
                return acc;
            }, {}),
            evaluationMetrics: {
                totalEvaluations: evaluationResults.length,
                deniedRequests: evaluationResults.filter(r => r.result === 'DENY').length,
                restrictedRequests: evaluationResults.filter(r => r.result === 'RESTRICT').length,
                averageEvaluationTime: evaluationResults.length > 0 ?
                    evaluationResults.reduce((sum, r) => sum + r.performance.evaluationTimeMs, 0) / evaluationResults.length : 0
            }
        };
        return stats;
    }, [policies, evaluationResults]);
    // Get filtered policies
    const getFilteredPolicies = useCallback((filters) => {
        let filtered = policies;
        if (filters.domain) {
            filtered = filtered.filter(p => p.domain === filters.domain);
        }
        if (filters.type) {
            filtered = filtered.filter(p => p.type === filters.type);
        }
        if (filters.status) {
            filtered = filtered.filter(p => p.status === filters.status);
        }
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(p => p.name.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower) ||
                p.metadata.tags.some(tag => tag.toLowerCase().includes(searchLower)));
        }
        return filtered;
    }, [policies]);
    // Get recent evaluation results
    const getRecentEvaluations = useCallback((limit = 20) => {
        return evaluationResults
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }, [evaluationResults]);
    // Get policy violations
    const getPolicyViolations = useCallback((filters) => {
        let filtered = violations;
        if (filters?.severity) {
            filtered = filtered.filter(v => v.violation.severity === filters.severity);
        }
        if (filters?.resolved !== undefined) {
            filtered = filtered.filter(v => v.response.resolved === filters.resolved);
        }
        if (filters?.entityType) {
            filtered = filtered.filter(v => v.context.entityType === filters.entityType);
        }
        const sorted = filtered.sort((a, b) => b.metadata.detectedAt.getTime() - a.metadata.detectedAt.getTime());
        return filters?.limit ? sorted.slice(0, filters.limit) : sorted;
    }, [violations]);
    // Setup event listeners
    useEffect(() => {
        if (!enableRealTimeUpdates)
            return;
        const handlePolicyViolation = (violation) => {
            setViolations(prev => [violation, ...prev].slice(0, 100)); // Keep last 100 violations
        };
        const handlePolicyCreated = ({ policy }) => {
            setPolicies(prev => [policy, ...prev]);
        };
        const handlePolicyUpdated = ({ newPolicy }) => {
            setPolicies(prev => prev.map(p => p.id === newPolicy.id ? newPolicy : p));
        };
        const handlePolicyDeleted = ({ policy }) => {
            setPolicies(prev => prev.filter(p => p.id !== policy.id));
        };
        policyManager.on('policyViolation', handlePolicyViolation);
        policyManager.on('policyCreated', handlePolicyCreated);
        policyManager.on('policyUpdated', handlePolicyUpdated);
        policyManager.on('policyDeleted', handlePolicyDeleted);
        return () => {
            policyManager.off('policyViolation', handlePolicyViolation);
            policyManager.off('policyCreated', handlePolicyCreated);
            policyManager.off('policyUpdated', handlePolicyUpdated);
            policyManager.off('policyDeleted', handlePolicyDeleted);
        };
    }, [policyManager, enableRealTimeUpdates]);
    // Initial load
    useEffect(() => {
        loadPolicies();
    }, [loadPolicies]);
    // Policy domain helpers
    const domains = useMemo(() => Object.values(PolicyDomain), []);
    const types = useMemo(() => Object.values(PolicyType), []);
    const statuses = useMemo(() => Object.values(PolicyStatus), []);
    const frameworks = useMemo(() => Object.values(ComplianceFramework), []);
    // Convenience getters
    const activePolicies = useMemo(() => policies.filter(p => p.status === PolicyStatus.ACTIVE), [policies]);
    const vfxPolicies = useMemo(() => policies.filter(p => p.domain === PolicyDomain.VFX_PIPELINE), [policies]);
    const securityPolicies = useMemo(() => policies.filter(p => p.domain === PolicyDomain.SECURITY), [policies]);
    const compliancePolicies = useMemo(() => policies.filter(p => p.domain === PolicyDomain.COMPLIANCE), [policies]);
    return {
        // Core data
        policies,
        evaluationResults,
        violations,
        isLoading,
        error,
        // Policy management
        loadPolicies,
        createPolicy,
        updatePolicy,
        deletePolicy,
        // Policy evaluation
        evaluatePolicies,
        checkVFXHistoricalAccuracy,
        checkDataProtectionCompliance,
        // Reporting and analytics
        generateComplianceReport,
        getPolicyStatistics,
        // Filtering and querying
        getFilteredPolicies,
        getRecentEvaluations,
        getPolicyViolations,
        // Convenience getters
        activePolicies,
        vfxPolicies,
        securityPolicies,
        compliancePolicies,
        // Metadata
        domains,
        types,
        statuses,
        frameworks,
        // Quick access properties
        policyCount: policies.length,
        activePolicyCount: activePolicies.length,
        violationCount: violations.length,
        unresolvedViolationCount: violations.filter(v => !v.response.resolved).length,
        // Helper functions
        getPolicyById: (id) => policies.find(p => p.id === id),
        isPolicyActive: (policyId) => {
            const policy = policies.find(p => p.id === policyId);
            return policy?.status === PolicyStatus.ACTIVE;
        },
        // Direct access to policy manager for advanced use cases
        policyManager
    };
};
export default usePolicyManagement;
