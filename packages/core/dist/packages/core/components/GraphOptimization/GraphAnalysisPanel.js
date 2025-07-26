import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * GraphAnalysisPanel - Shows graph optimization opportunities and performance insights
 */
import { useMemo } from 'react';
/**
 * Analyze graph structure for optimization opportunities
 */
function analyzeGraph(nodes, edges) {
    const _____nodeMap = new Map(nodes.map(node => [node.id, node]));
    const incomingEdges = new Map();
    const outgoingEdges = new Map();
    // Build edge maps
    edges.forEach(edge => {
        if (!incomingEdges.has(edge.target))
            incomingEdges.set(edge.target, []);
        if (!outgoingEdges.has(edge.source))
            outgoingEdges.set(edge.source, []);
        incomingEdges.get(edge.target).push(edge);
        outgoingEdges.get(edge.source).push(edge);
    });
    // Find dead nodes (no outputs or unreachable)
    const deadNodes = nodes
        .filter(node => !outgoingEdges.has(node.id) && node.data?.nodeType !== 'Output')
        .map(node => node.id);
    // Find potentially constant nodes
    const constantNodes = nodes
        .filter(node => {
        const nodeType = node.data?.nodeType;
        return nodeType === 'Output' || nodeType === 'GetVariable' ||
            (nodeType === 'WeightedChoice' && node.data?.choices?.length === 1);
    })
        .map(node => node.id);
    // Find parallelizable nodes (no direct dependencies)
    const parallelizableNodes = [];
    nodes.forEach(node => {
        const dependsOn = incomingEdges.get(node.id)?.map(edge => edge.source) || [];
        if (dependsOn.length === 0 && node.data?.nodeType !== 'Output') {
            parallelizableNodes.push(node.id);
        }
    });
    // Calculate graph depth
    const calculateDepth = (nodeId, visited = new Set()) => {
        if (visited.has(nodeId))
            return 0; // Cycle detection
        visited.add(nodeId);
        const incoming = incomingEdges.get(nodeId) || [];
        if (incoming.length === 0)
            return 1;
        const depths = incoming.map(edge => calculateDepth(edge.source, new Set(visited)));
        return Math.max(...depths) + 1;
    };
    const maxDepth = Math.max(...nodes.map(node => calculateDepth(node.id)));
    // Determine complexity
    let complexity;
    if (nodes.length <= 10 && maxDepth <= 5)
        complexity = 'low';
    else if (nodes.length <= 50 && maxDepth <= 10)
        complexity = 'medium';
    else
        complexity = 'high';
    // Generate optimization opportunities
    const optimizationOpportunities = [];
    if (deadNodes.length > 0) {
        optimizationOpportunities.push({
            type: 'dead_code',
            severity: deadNodes.length > 5 ? 'high' : 'medium',
            description: `Remove ${deadNodes.length} unused node${deadNodes.length > 1 ? 's' : ''}`,
            nodeIds: deadNodes,
            estimatedImprovement: `${Math.round(deadNodes.length / nodes.length * 100)}% size reduction`
        });
    }
    if (constantNodes.length > 0) {
        optimizationOpportunities.push({
            type: 'constant_prop',
            severity: 'medium',
            description: `Pre-compute ${constantNodes.length} constant node${constantNodes.length > 1 ? 's' : ''}`,
            nodeIds: constantNodes,
            estimatedImprovement: `${constantNodes.length * 10}ms faster execution`
        });
    }
    if (parallelizableNodes.length > 2) {
        optimizationOpportunities.push({
            type: 'parallelization',
            severity: 'high',
            description: `${parallelizableNodes.length} nodes can run in parallel`,
            nodeIds: parallelizableNodes,
            estimatedImprovement: `${Math.round(parallelizableNodes.length / 2)}x faster execution`
        });
    }
    if (nodes.length > 20) {
        optimizationOpportunities.push({
            type: 'caching',
            severity: 'medium',
            description: 'Enable result caching for repeated executions',
            estimatedImprovement: '50-90% faster on repeat runs'
        });
    }
    if (complexity === 'high') {
        optimizationOpportunities.push({
            type: 'memory',
            severity: 'high',
            description: 'Large graph detected - enable memory optimization',
            estimatedImprovement: '30-60% less memory usage'
        });
    }
    return {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        deadNodes,
        constantNodes,
        cyclicPaths: [], // TODO: Implement cycle detection
        parallelizableNodes,
        maxDepth,
        complexity,
        optimizationOpportunities
    };
}
export const GraphAnalysisPanel = ({ nodes, edges, isOpen, onClose }) => {
    const analysis = useMemo(() => analyzeGraph(nodes, edges), [nodes, edges]);
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return '#dc3545';
            case 'medium': return '#ffc107';
            case 'low': return '#28a745';
        }
    };
    const getComplexityColor = (complexity) => {
        switch (complexity) {
            case 'high': return '#dc3545';
            case 'medium': return '#fd7e14';
            case 'low': return '#28a745';
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }, children: _jsxs("div", { style: {
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                width: '90%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px'
                    }, children: [_jsx("h2", { style: {
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#333'
                            }, children: "\uD83D\uDCCA Graph Analysis & Optimization" }), _jsx("button", { onClick: onClose, style: {
                                background: 'none',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                color: '#666',
                                padding: '0',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }, children: "\u00D7" })] }), _jsxs("div", { style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginBottom: '24px'
                    }, children: [_jsxs("div", { style: {
                                padding: '16px',
                                border: '1px solid #e9ecef',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }, children: [_jsx("div", { style: { fontSize: '32px', fontWeight: 'bold', color: '#495057' }, children: analysis.nodeCount }), _jsx("div", { style: { fontSize: '14px', color: '#6c757d' }, children: "Nodes" })] }), _jsxs("div", { style: {
                                padding: '16px',
                                border: '1px solid #e9ecef',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }, children: [_jsx("div", { style: { fontSize: '32px', fontWeight: 'bold', color: '#495057' }, children: analysis.edgeCount }), _jsx("div", { style: { fontSize: '14px', color: '#6c757d' }, children: "Connections" })] }), _jsxs("div", { style: {
                                padding: '16px',
                                border: '1px solid #e9ecef',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }, children: [_jsx("div", { style: { fontSize: '32px', fontWeight: 'bold', color: '#495057' }, children: analysis.maxDepth }), _jsx("div", { style: { fontSize: '14px', color: '#6c757d' }, children: "Max Depth" })] }), _jsxs("div", { style: {
                                padding: '16px',
                                border: '1px solid #e9ecef',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }, children: [_jsx("div", { style: {
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        color: getComplexityColor(analysis.complexity),
                                        textTransform: 'capitalize'
                                    }, children: analysis.complexity }), _jsx("div", { style: { fontSize: '14px', color: '#6c757d' }, children: "Complexity" })] })] }), _jsxs("div", { style: { marginBottom: '24px' }, children: [_jsx("h3", { style: {
                                margin: '0 0 16px 0',
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#333'
                            }, children: "\uD83D\uDE80 Optimization Opportunities" }), analysis.optimizationOpportunities.length === 0 ? (_jsx("div", { style: {
                                padding: '16px',
                                backgroundColor: '#d4edda',
                                border: '1px solid #c3e6cb',
                                borderRadius: '4px',
                                color: '#155724'
                            }, children: "\u2705 Your graph is already well-optimized! No major improvements detected." })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: analysis.optimizationOpportunities.map((opportunity, index) => (_jsxs("div", { style: {
                                    padding: '16px',
                                    border: `1px solid ${getSeverityColor(opportunity.severity)}33`,
                                    backgroundColor: `${getSeverityColor(opportunity.severity)}11`,
                                    borderRadius: '8px'
                                }, children: [_jsxs("div", { style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: '8px'
                                        }, children: [_jsx("h4", { style: {
                                                    margin: 0,
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    color: '#333'
                                                }, children: opportunity.description }), _jsx("span", { style: {
                                                    padding: '2px 8px',
                                                    backgroundColor: getSeverityColor(opportunity.severity),
                                                    color: 'white',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    textTransform: 'uppercase'
                                                }, children: opportunity.severity })] }), _jsxs("div", { style: {
                                            fontSize: '14px',
                                            color: '#28a745',
                                            fontWeight: '500',
                                            marginBottom: '8px'
                                        }, children: ["\uD83D\uDCA1 Estimated improvement: ", opportunity.estimatedImprovement] }), opportunity.nodeIds && (_jsxs("div", { style: {
                                            fontSize: '12px',
                                            color: '#6c757d',
                                            fontFamily: 'monospace'
                                        }, children: ["Affected nodes: ", opportunity.nodeIds.slice(0, 5).join(', '), opportunity.nodeIds.length > 5 && ` (+${opportunity.nodeIds.length - 5} more)`] }))] }, index))) }))] }), _jsxs("div", { style: {
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }, children: [_jsx("h3", { style: {
                                margin: '0 0 12px 0',
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#333'
                            }, children: "\uD83D\uDCC8 Graph Health Score" }), (() => {
                            const score = Math.max(0, 100 - (analysis.deadNodes.length * 10) -
                                (analysis.optimizationOpportunities.filter(op => op.severity === 'high').length * 20) -
                                (analysis.optimizationOpportunities.filter(op => op.severity === 'medium').length * 10));
                            const getScoreColor = (score) => {
                                if (score >= 80)
                                    return '#28a745';
                                if (score >= 60)
                                    return '#ffc107';
                                return '#dc3545';
                            };
                            return (_jsxs(_Fragment, { children: [_jsx("div", { style: {
                                            fontSize: '48px',
                                            fontWeight: 'bold',
                                            color: getScoreColor(score),
                                            marginBottom: '8px'
                                        }, children: score }), _jsx("div", { style: {
                                            fontSize: '14px',
                                            color: '#6c757d'
                                        }, children: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Optimization' })] }));
                        })()] }), _jsx("div", { style: {
                        marginTop: '24px',
                        textAlign: 'center'
                    }, children: _jsx("button", { onClick: onClose, style: {
                            padding: '12px 24px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }, children: "Apply Optimizations" }) })] }) }));
};
export default GraphAnalysisPanel;
