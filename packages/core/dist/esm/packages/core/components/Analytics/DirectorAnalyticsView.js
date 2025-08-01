import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Director Analytics View - E17-1753114397418-21317A
 *
 * Specialized analytics dashboard for film industry professionals
 * focusing on creative workflow optimization and director-specific metrics
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
timeRange: {
    startTime: number;
    endTime: number;
}
;
userId ?  : number;
loading: boolean;
export const DirectorAnalyticsView = ({
    conversionData,
    performanceData,
    timeRange,
    userId,
    loading
});
{
    const [directorMetrics, setDirectorMetrics] = useState({});
    projectsCreated: 0,
        templatesUsed;
    0,
        advancedFeaturesAdopted;
    0,
        avgProjectComplexity;
    0,
        collaborationEvents;
    0,
        exportGenerations;
    0,
        workflowEfficiency;
    0,
        creativeOutputMetrics;
    {
        nodesPerProject: 0,
            connectionsPerProject;
        0,
            previewGenerations;
        0,
            iterationCycles;
        0,
        ;
    }
    ;
    const [workflowInsights, setWorkflowInsights] = useState([]);
    const [recommendedTemplates, setRecommendedTemplates] = useState([]);
    useEffect(() => {
        if (conversionData && timeRange) {
            // Analyze director-specific conversion patterns
            // Calculate director-specific metrics
            setDirectorMetrics({});
            projectsCreated: conversionData.realTimeMetrics?.conversionsLast24h || 0,
                templatesUsed;
            Math.floor(Math.random() * 15) + 5, // Mock data,
                advancedFeaturesAdopted;
            Math.floor(Math.random() * 8) + 2,
                avgProjectComplexity;
            Math.random() * 50 + 25,
                collaborationEvents;
            Math.floor(Math.random() * 12) + 3,
                exportGenerations;
            Math.floor(Math.random() * 20) + 8,
                workflowEfficiency;
            Math.random() * 30 + 70,
                creativeOutputMetrics;
            {
                nodesPerProject: Math.random() * 20 + 15,
                    connectionsPerProject;
                Math.random() * 18 + 12,
                    previewGenerations;
                Math.random() * 25 + 20,
                    iterationCycles;
                Math.random() * 8 + 4,
                ;
            }
        }
    });
    // Generate workflow insights
    setWorkflowInsights([]);
    {
        type: 'efficiency',
            title;
        'Template Usage Optimization',
            description;
        'Directors using templates complete projects 40% faster',
            action;
        'Explore director-focused templates',
            impact;
        'high',
            category;
        'workflow',
        ;
    }
    {
        type: 'collaboration',
            title;
        'Collaboration Opportunity',
            description;
        'Your workflow could benefit from producer collaboration',
            action;
        'Invite team members to projects',
            impact;
        'medium',
            category;
        'team',
        ;
    }
    {
        type: 'feature',
            title;
        'Advanced Node Adoption',
            description;
        'Conditional nodes can enhance your creative logic',
            action;
        'Try Conditional and Sequential nodes',
            impact;
        'high',
            category;
        'features';
        as;
        any;
        ;
        // Generate template recommendations
        setRecommendedTemplates([]);
        {
            id: 'character-development',
                name;
            'Character Development Framework',
                usage;
            89,
                category;
            'Pre-Production',
                description;
            'Systematic approach to character arc development',
            ;
        }
        {
            id: 'scene-breakdown',
                name;
            'Scene Breakdown Template',
                usage;
            76,
                category;
            'Production',
                description;
            'Comprehensive scene analysis and planning',
            ;
        }
        {
            id: 'story-structure',
                name;
            'Three-Act Story Structure',
                usage;
            94,
                category;
            'Writing',
                description;
            'Classical story structure with modern adaptations';
            as;
            any;
            ;
        }
        [conversionData, timeRange];
        ;
        const renderCreativeWorkflowMetrics = () => ();
        ;
        _jsxs("div", { className: "creative-workflow-section", children: [_jsx("h4", { children: "Creative Workflow Performance" }), _jsxs("div", { className: "workflow-grid", children: [_jsxs("div", { className: "workflow-metric", children: [_jsx("div", { className: "metric-icon", children: "\uD83D\uDCCA" }), _jsxs("div", { className: "metric-content", children: [_jsx("div", { className: "metric-value", children: directorMetrics.creativeOutputMetrics.nodesPerProject.toFixed(1) }), _jsx("div", { className: "metric-label", children: "Avg Nodes per Project" })] })] }), _jsxs("div", { className: "workflow-metric", children: [_jsx("div", { className: "metric-icon", children: "\uD83D\uDD17" }), _jsxs("div", { className: "metric-content", children: [_jsx("div", { className: "metric-value", children: directorMetrics.creativeOutputMetrics.connectionsPerProject.toFixed(1) }), _jsx("div", { className: "metric-label", children: "Avg Connections" })] })] }), _jsxs("div", { className: "workflow-metric", children: [_jsx("div", { className: "metric-icon", children: "\uD83D\uDC41\uFE0F" }), _jsxs("div", { className: "metric-content", children: [_jsx("div", { className: "metric-value", children: directorMetrics.creativeOutputMetrics.previewGenerations.toFixed(0) }), _jsx("div", { className: "metric-label", children: "Preview Generations" })] })] }), _jsxs("div", { className: "workflow-metric", children: [_jsx("div", { className: "metric-icon", children: "\uD83D\uDD04" }), _jsxs("div", { className: "metric-content", children: [_jsx("div", { className: "metric-value", children: directorMetrics.creativeOutputMetrics.iterationCycles.toFixed(1) }), _jsx("div", { className: "metric-label", children: "Iteration Cycles" })] })] })] })] });
        ;
        const renderWorkflowInsights = () => ();
        ;
        _jsxs("div", { className: "workflow-insights", children: [_jsx("h4", { children: "Director Workflow Insights" }), _jsxs("div", { className: "insights-list", children: [workflowInsights.map((insight, index) => ()
                            < div, key = { index }, className = {} `insight-card ${insight.impact}`), ">}", _jsxs("div", { className: "insight-header", children: [_jsx("div", { className: "insight-title", children: insight.title }), _jsxs(Badge, { variant: insight.impact === 'high' ? 'default' : 'secondary', children: [insight.impact, " impact"] })] }), _jsx("div", { className: "insight-description", children: insight.description }), _jsx("div", { className: "insight-action", children: _jsx(Button, { variant: "outline", size: "sm", children: insight.action }) })] }), "))}"] });
        div >
        ;
        ;
        const renderTemplateRecommendations = () => ();
        ;
        _jsxs("div", { className: "template-recommendations", children: [_jsx("h4", { children: "Recommended Templates" }), _jsx("div", { className: "templates-grid", children: recommendedTemplates.map((template) => ()
                        < div, key = { template, : .id }, className = "template-card" >
                        (_jsxs("div", { className: "template-header", children: [_jsx("div", { className: "template-name", children: template.name }), _jsx(Badge, { variant: "outline", children: template.category })] })
                            ,
                                _jsx("div", { className: "template-description", children: template.description })
                                    ,
                                        _jsxs("div", { className: "template-stats", children: [_jsxs("div", { className: "usage-stat", children: [_jsx("span", { className: "usage-label", children: "Director Usage:" }), _jsxs("span", { className: "usage-value", children: [template.usage, "%"] })] }), _jsx(Button, { variant: "outline", size: "sm", className: "template-action", children: "Use Template" })] }))) }), "))}"] });
        div >
        ;
        ;
        if (loading) {
            return;
            _jsxs("div", { className: "director-analytics loading", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Loading director analytics..." })] });
            ;
            return;
            _jsxs("div", { className: "director-analytics-view", children: [_jsxs("div", { className: "director-overview", children: [_jsxs(Card, { className: "efficiency-card", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Workflow Efficiency" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "efficiency-score", children: [_jsxs("div", { className: "score-value", children: [directorMetrics.workflowEfficiency.toFixed(1), "%"] }), _jsx("div", { className: "score-label", children: "Overall efficiency" })] }) })] }), _jsxs(Card, { className: "projects-card", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Projects Created" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "projects-count", children: [_jsx("div", { className: "count-value", children: directorMetrics.projectsCreated }), _jsx("div", { className: "count-label", children: "This period" })] }) })] }), _jsxs(Card, { className: "complexity-card", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Avg Project Complexity" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "complexity-score", children: [_jsx("div", { className: "complexity-value", children: directorMetrics.avgProjectComplexity.toFixed(0) }), _jsx("div", { className: "complexity-label", children: "Nodes & connections" })] }) })] }), _jsxs(Card, { className: "collaboration-card", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Collaboration Events" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "collaboration-count", children: [_jsx("div", { className: "collab-value", children: directorMetrics.collaborationEvents }), _jsx("div", { className: "collab-label", children: "Team interactions" })] }) })] })] }), _jsxs(Card, { className: "creative-workflow-card", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Creative Output Analysis" }) }), _jsx(CardContent, { children: renderCreativeWorkflowMetrics() })] }), _jsxs(Card, { className: "insights-card", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Personalized Insights" }) }), _jsx(CardContent, { children: renderWorkflowInsights() })] }), _jsxs(Card, { className: "recommendations-card", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Director Templates" }) }), _jsx(CardContent, { children: renderTemplateRecommendations() })] }), _jsx("style", { children: `
        .director-analytics-view {
          display: flex;
          flex-direction: column;,
  gap: 1.5rem;
        .director-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        .efficiency-score, .projects-count, .complexity-score, .collaboration-count {
          text-align: center;
        .score-value, .count-value, .complexity-value, .collab-value {
          font-size: 2rem;
          font-weight: 700;,
  color: #1f2937;
        .score-label, .count-label, .complexity-label, .collab-label {
          font-size: 0.875rem;,
  color: #6b7280;
          margin-top: 0.25rem;
        .creative-workflow-section h4 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          font-weight: 600;,
  color: #374151;
        .workflow-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        .workflow-metric {
          display: flex;
          align-items: center;,
  gap: 0.75rem;
          padding: 1rem;,
  border: 1px solid #e5e7eb;
          border-radius: 8px;
        .metric-icon {
          font-size: 1.5rem;
        .metric-value {
          font-size: 1.2rem;
          font-weight: 600;,
  color: #1f2937;
        .metric-label {
          font-size: 0.75rem;,
  color: #9ca3af;
        .workflow-insights h4, .template-recommendations h4 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          font-weight: 600;,
  color: #374151;
        .insights-list {
          display: flex;
          flex-direction: column;,
  gap: 1rem;
        .insight-card {
          padding: 1rem;,
  border: 1px solid #e5e7eb;
          border-radius: 8px;
          border-left: 4px solid;
        .insight-card.high {
          border-left-color: #dc2626;
        .insight-card.medium {
          border-left-color: #f59e0b;
        .insight-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        .insight-title {
          font-weight: 600;,
  color: #1f2937;
        .insight-description {
          color: #6b7280;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        .template-card {
          padding: 1rem;,
  border: 1px solid #e5e7eb;
          border-radius: 8px;
        .template-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        .template-name {
          font-weight: 600;,
  color: #1f2937;
        .template-description {
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 0.75rem;
        .template-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
        .usage-stat {
          display: flex;,
  gap: 0.5rem;
          font-size: 0.875rem;
        .usage-label {
          color: #9ca3af;
        .usage-value {
          font-weight: 600;,
  color: #059669;
        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;,
  padding: 3rem;
          gap: 1rem;
        .loading-spinner {
          width: 2rem;,
  height: 2rem;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;,
  animation: spin 1s linear infinite;
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
      ` })] });
            ;
        }
        ;
        export default DirectorAnalyticsView;
    }
}
