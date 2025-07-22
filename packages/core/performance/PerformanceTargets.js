/**
 * Performance Targets and Thresholds for Epic 18
 * Defines performance targets based on user requirements, industry standards, and business objectives
 */
/**
 * Performance targets based on Web Vitals and industry standards
 *
 * Sources:
 * - Google Web Vitals: https://web.dev/vitals/
 * - Core Web Vitals: https://web.dev/defining-core-web-vitals-thresholds/
 * - Industry benchmarks for web applications
 * - User experience research for productivity tools
 */
export const performanceTargets = {
    // === CORE WEB VITALS (Google Standards) ===
    runtime_fcp: {
        kpiId: 'runtime_fcp',
        target: 1200, // 1.2s - Good FCP according to Google
        warning: 1500, // 1.5s - Needs improvement threshold
        critical: 2000, // 2.0s - Poor threshold
        reasoning: 'Based on Google Core Web Vitals. 75th percentile of page loads should be under 1.8s',
        source: 'industry-standard',
        businessImpact: {
            userExperience: 'high',
            businessValue: 'high',
            technicalRisk: 'medium'
        }
    },
    runtime_lcp: {
        kpiId: 'runtime_lcp',
        target: 2000, // 2.0s - Good LCP
        warning: 2500, // 2.5s - Needs improvement
        critical: 3000, // 3.0s - Poor
        reasoning: 'Google Core Web Vitals threshold. Critical for perceived performance',
        source: 'industry-standard',
        businessImpact: {
            userExperience: 'high',
            businessValue: 'high',
            technicalRisk: 'medium'
        }
    },
    runtime_fid: {
        kpiId: 'runtime_fid',
        target: 50, // 50ms - Good FID
        warning: 100, // 100ms - Needs improvement
        critical: 200, // 200ms - Poor
        reasoning: 'Google Core Web Vitals. Users perceive delays over 100ms as sluggish',
        source: 'industry-standard',
        businessImpact: {
            userExperience: 'high',
            businessValue: 'medium',
            technicalRisk: 'medium'
        }
    },
    runtime_cls: {
        kpiId: 'runtime_cls',
        target: 0.05, // 0.05 - Good CLS
        warning: 0.1, // 0.1 - Needs improvement
        critical: 0.25, // 0.25 - Poor
        reasoning: 'Google Core Web Vitals. Visual stability is crucial for user confidence',
        source: 'industry-standard',
        businessImpact: {
            userExperience: 'high',
            businessValue: 'medium',
            technicalRisk: 'low'
        }
    },
    runtime_tti: {
        kpiId: 'runtime_tti',
        target: 2500, // 2.5s - Good for interactive applications
        warning: 3000, // 3.0s - Acceptable for productivity tools
        critical: 4000, // 4.0s - Too slow for user productivity
        reasoning: 'Based on user research for productivity applications. Users expect interactivity within 3s',
        source: 'user-requirement',
        businessImpact: {
            userExperience: 'high',
            businessValue: 'high',
            technicalRisk: 'medium'
        }
    },
    // === API PERFORMANCE (Based on User Workflow Requirements) ===
    api_graph_execution: {
        kpiId: 'api_graph_execution',
        target: 800, // 800ms - Excellent for complex graph processing
        warning: 1000, // 1s - Good for interactive use
        critical: 1500, // 1.5s - Maximum acceptable for user workflow
        reasoning: 'Core workflow operation. Users need quick feedback for iteration cycles',
        source: 'user-requirement',
        businessImpact: {
            userExperience: 'high',
            businessValue: 'high',
            technicalRisk: 'high'
        }
    },
    api_preview_generation: {
        kpiId: 'api_preview_generation',
        target: 400, // 400ms - Near real-time preview
        warning: 500, // 500ms - Good for preview workflow
        critical: 800, // 800ms - Maximum for maintaining flow state
        reasoning: 'Preview is part of tight feedback loop. Delays break user flow state',
        source: 'user-requirement',
        businessImpact: {
            userExperience: 'high',
            businessValue: 'medium',
            technicalRisk: 'medium'
        }
    },
    api_validation: {
        kpiId: 'api_validation',
        target: 50, // 50ms - Real-time validation
        warning: 100, // 100ms - Acceptable for form validation
        critical: 200, // 200ms - Maximum for real-time feedback
        reasoning: 'Real-time validation should feel instantaneous to maintain editing flow',
        source: 'user-requirement',
        businessImpact: {
            userExperience: 'medium',
            businessValue: 'medium',
            technicalRisk: 'low'
        }
    },
    api_throughput: {
        kpiId: 'api_throughput',
        target: 100, // 100 RPS - Good for multi-user system
        warning: 75, // 75 RPS - Acceptable under normal load
        critical: 50, // 50 RPS - Minimum for system viability
        reasoning: 'Based on expected concurrent users and usage patterns. Enterprise deployment requirement',
        source: 'business-objective',
        businessImpact: {
            userExperience: 'medium',
            businessValue: 'high',
            technicalRisk: 'high'
        }
    },
    // === BUNDLE SIZE (Based on Network Performance) ===
    bundle_main_size: {
        kpiId: 'bundle_main_size',
        target: 200, // 200KB - Excellent for mobile networks
        warning: 250, // 250KB - Good for most connections
        critical: 350, // 350KB - Maximum for reasonable mobile performance
        reasoning: 'Based on mobile network performance. Initial bundle should load quickly on 3G',
        source: 'technical-constraint',
        businessImpact: {
            userExperience: 'high',
            businessValue: 'medium',
            technicalRisk: 'low'
        }
    },
    bundle_total_size: {
        kpiId: 'bundle_total_size',
        target: 800, // 800KB - Good total application size
        warning: 1000, // 1MB - Acceptable for feature-rich application
        critical: 1400, // 1.4MB - Maximum before significant mobile impact
        reasoning: 'Total application size impacts caching and update performance',
        source: 'technical-constraint',
        businessImpact: {
            userExperience: 'medium',
            businessValue: 'medium',
            technicalRisk: 'medium'
        }
    },
    // === MEMORY USAGE (Based on Device Constraints) ===
    memory_peak_usage: {
        kpiId: 'memory_peak_usage',
        target: 100, // 100MB - Good for desktop applications
        warning: 150, // 150MB - Acceptable for feature-rich apps
        critical: 200, // 200MB - Maximum before affecting other applications
        reasoning: 'Based on typical device memory and browser limitations. Must coexist with other applications',
        source: 'technical-constraint',
        businessImpact: {
            userExperience: 'medium',
            businessValue: 'low',
            technicalRisk: 'high'
        }
    },
    memory_leak_rate: {
        kpiId: 'memory_leak_rate',
        target: 2, // 2MB/hour - Minimal growth
        warning: 5, // 5MB/hour - Acceptable for long sessions
        critical: 10, // 10MB/hour - Maximum before requiring restart
        reasoning: 'Memory leaks accumulate over time. Application should be stable for 8+ hour sessions',
        source: 'user-requirement',
        businessImpact: {
            userExperience: 'high',
            businessValue: 'medium',
            technicalRisk: 'high'
        }
    },
    // === NETWORK EFFICIENCY ===
    network_transfer_size: {
        kpiId: 'network_transfer_size',
        target: 1200, // 1.2MB - Good for initial load
        warning: 1500, // 1.5MB - Acceptable on fast connections
        critical: 2000, // 2MB - Maximum for mobile data plans
        reasoning: 'Based on mobile data costs and connection speeds',
        source: 'technical-constraint',
        businessImpact: {
            userExperience: 'medium',
            businessValue: 'low',
            technicalRisk: 'low'
        }
    },
    network_request_count: {
        kpiId: 'network_request_count',
        target: 20, // 20 requests - Efficient resource loading
        warning: 25, // 25 requests - Acceptable
        critical: 35, // 35 requests - Too many for optimal performance
        reasoning: 'HTTP/2 mitigates request overhead but fewer requests improve reliability',
        source: 'technical-constraint',
        businessImpact: {
            userExperience: 'low',
            businessValue: 'low',
            technicalRisk: 'medium'
        }
    },
    // === BUILD PERFORMANCE (Developer Experience) ===
    build_time: {
        kpiId: 'build_time',
        target: 45, // 45s - Good developer experience
        warning: 60, // 60s - Acceptable for CI/CD
        critical: 90, // 90s - Maximum before affecting productivity
        reasoning: 'Developer productivity requirement. Fast builds enable rapid iteration',
        source: 'business-objective',
        businessImpact: {
            userExperience: 'low',
            businessValue: 'medium',
            technicalRisk: 'low'
        }
    },
    build_test_time: {
        kpiId: 'build_test_time',
        target: 25, // 25s - Fast test feedback
        warning: 30, // 30s - Acceptable for comprehensive tests
        critical: 45, // 45s - Maximum for pre-commit hooks
        reasoning: 'Test feedback speed affects development velocity and code quality',
        source: 'business-objective',
        businessImpact: {
            userExperience: 'low',
            businessValue: 'medium',
            technicalRisk: 'low'
        }
    },
    // === USER EXPERIENCE METRICS ===
    ux_graph_creation_time: {
        kpiId: 'ux_graph_creation_time',
        target: 30, // 30s - Excellent user workflow
        warning: 45, // 45s - Good productivity
        critical: 60, // 60s - Maximum before user frustration
        reasoning: 'End-to-end workflow time affects user productivity and satisfaction',
        source: 'user-requirement',
        businessImpact: {
            userExperience: 'high',
            businessValue: 'high',
            technicalRisk: 'medium'
        }
    },
    ux_error_rate: {
        kpiId: 'ux_error_rate',
        target: 1, // 1% - Excellent reliability
        warning: 3, // 3% - Acceptable error rate
        critical: 5, // 5% - Maximum before user trust issues
        reasoning: 'Error rate directly impacts user trust and productivity',
        source: 'user-requirement',
        businessImpact: {
            userExperience: 'high',
            businessValue: 'high',
            technicalRisk: 'high'
        }
    }
};
/**
 * Environment-specific target adjustments
 */
export const environmentAdjustments = {
    development: {
        // More lenient targets for development environment
        multiplier_warning: 1.5,
        multiplier_critical: 2.0
    },
    staging: {
        // Production-like targets but slightly more lenient
        multiplier_warning: 1.2,
        multiplier_critical: 1.5
    },
    production: {
        // Strict production targets
        multiplier_warning: 1.0,
        multiplier_critical: 1.0
    }
};
/**
 * Device-specific adjustments
 */
export const deviceAdjustments = {
    'high-end': {
        // High-end devices can handle more aggressive targets
        cpu_multiplier: 0.8,
        memory_multiplier: 0.8,
        network_multiplier: 0.9
    },
    'mid-range': {
        // Standard targets
        cpu_multiplier: 1.0,
        memory_multiplier: 1.0,
        network_multiplier: 1.0
    },
    'low-end': {
        // More conservative targets for low-end devices
        cpu_multiplier: 1.5,
        memory_multiplier: 1.3,
        network_multiplier: 1.2
    }
};
/**
 * Get adjusted performance targets based on configuration
 */
export function getAdjustedTargets(config) {
    const adjusted = {};
    const envAdjustment = environmentAdjustments[config.environment] || environmentAdjustments.production;
    const deviceAdjustment = deviceAdjustments[config.deviceProfile] || deviceAdjustments['mid-range'];
    for (const [kpiId, target] of Object.entries(performanceTargets)) {
        let targetMultiplier = 1.0;
        let warningMultiplier = envAdjustment.multiplier_warning || 1.0;
        let criticalMultiplier = envAdjustment.multiplier_critical || 1.0;
        // Apply device-specific multipliers
        if (kpiId.startsWith('runtime_') || kpiId.startsWith('api_')) {
            targetMultiplier *= deviceAdjustment.cpu_multiplier || 1.0;
            warningMultiplier *= deviceAdjustment.cpu_multiplier || 1.0;
            criticalMultiplier *= deviceAdjustment.cpu_multiplier || 1.0;
        }
        if (kpiId.startsWith('memory_')) {
            targetMultiplier *= deviceAdjustment.memory_multiplier || 1.0;
            warningMultiplier *= deviceAdjustment.memory_multiplier || 1.0;
            criticalMultiplier *= deviceAdjustment.memory_multiplier || 1.0;
        }
        if (kpiId.startsWith('network_')) {
            targetMultiplier *= deviceAdjustment.network_multiplier || 1.0;
            warningMultiplier *= deviceAdjustment.network_multiplier || 1.0;
            criticalMultiplier *= deviceAdjustment.network_multiplier || 1.0;
        }
        adjusted[kpiId] = {
            ...target,
            target: Math.round(target.target * targetMultiplier),
            warning: Math.round(target.warning * warningMultiplier),
            critical: Math.round(target.critical * criticalMultiplier)
        };
    }
    return adjusted;
}
/**
 * Get targets for specific user segment
 */
export function getTargetsForUserSegment(segment) {
    const adjustments = {
        'power-users': 0.8, // More aggressive targets for power users
        'general': 1.0, // Standard targets
        'enterprise': 1.2 // More conservative for enterprise stability
    };
    const multiplier = adjustments[segment] || 1.0;
    const adjusted = {};
    for (const [kpiId, target] of Object.entries(performanceTargets)) {
        // For user experience metrics, all segments have the same expectations
        if (kpiId.startsWith('ux_')) {
            adjusted[kpiId] = target;
        }
        else {
            adjusted[kpiId] = {
                ...target,
                target: Math.round(target.target * multiplier),
                warning: Math.round(target.warning * multiplier),
                critical: Math.round(target.critical * multiplier)
            };
        }
    }
    return adjusted;
}
/**
 * Validate if current performance meets targets
 */
export function validatePerformanceTargets(currentMetrics, config) {
    const targets = getAdjustedTargets(config);
    const violations = [];
    let score = 100;
    for (const [kpiId, current] of Object.entries(currentMetrics)) {
        const target = targets[kpiId];
        if (!target)
            continue;
        if (current > target.critical) {
            violations.push({
                kpiId,
                current,
                target: target.target,
                severity: 'critical'
            });
            score -= 20;
        }
        else if (current > target.warning) {
            violations.push({
                kpiId,
                current,
                target: target.target,
                severity: 'warning'
            });
            score -= 10;
        }
    }
    const recommendations = generateTargetRecommendations(violations, config);
    return {
        passed: violations.filter(v => v.severity === 'critical').length === 0,
        score: Math.max(0, score),
        violations,
        recommendations
    };
}
/**
 * Generate recommendations based on target violations
 */
function generateTargetRecommendations(violations, config) {
    const recommendations = [];
    const criticalViolations = violations.filter(v => v.severity === 'critical');
    if (criticalViolations.length > 0) {
        recommendations.push('🚨 Address critical performance violations immediately');
        recommendations.push(`Critical KPIs: ${criticalViolations.map(v => v.kpiId).join(', ')}`);
    }
    // Environment-specific recommendations
    if (config.environment === 'production') {
        recommendations.push('🎯 Production environment requires strict adherence to targets');
        recommendations.push('📊 Monitor performance continuously and set up alerts');
    }
    // Device-specific recommendations
    if (config.deviceProfile === 'low-end') {
        recommendations.push('📱 Optimize for low-end devices with aggressive code splitting');
        recommendations.push('🔧 Consider progressive enhancement strategies');
    }
    // User segment recommendations
    if (config.userSegment === 'power-users') {
        recommendations.push('⚡ Power users expect exceptional performance');
        recommendations.push('🚀 Consider implementing advanced optimization features');
    }
    return recommendations;
}
/**
 * Get performance target summary
 */
export function getPerformanceTargetSummary() {
    const targets = Object.values(performanceTargets);
    const businessImpactCounts = {
        critical: targets.filter(t => t.businessImpact.userExperience === 'high' && t.businessImpact.businessValue === 'high').length,
        high: targets.filter(t => t.businessImpact.userExperience === 'high' || t.businessImpact.businessValue === 'high').length,
        medium: targets.filter(t => t.businessImpact.userExperience === 'medium' || t.businessImpact.businessValue === 'medium').length,
        low: targets.filter(t => t.businessImpact.userExperience === 'low' && t.businessImpact.businessValue === 'low').length
    };
    const categories = {};
    targets.forEach(target => {
        const category = target.kpiId.split('_')[0];
        categories[category] = (categories[category] || 0) + 1;
    });
    return {
        totalTargets: targets.length,
        critical: businessImpactCounts.critical,
        high: businessImpactCounts.high - businessImpactCounts.critical,
        medium: businessImpactCounts.medium,
        low: businessImpactCounts.low,
        categories
    };
}
export default {
    performanceTargets,
    getAdjustedTargets,
    getTargetsForUserSegment,
    validatePerformanceTargets,
    getPerformanceTargetSummary
};
