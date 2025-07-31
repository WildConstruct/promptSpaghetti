import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Marketplace Policy Configuration - E17-1753114397363-F12F4D
 *
 * Configuration system for marketplace-specific policy use cases
 * Part of Epic 17.5.4 - Policy Enforcement (Backstage Admin Controls)
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Settings, Shield, Users, ShoppingCart, FileText, DollarSign, CheckCircle, Plus, Edit3, Save, X, Info, Zap, Target } from 'lucide-react';
;
export const MarketplacePolicyConfig = ({
    className = ''
});
{
    const [selectedCategory, setSelectedCategory] = useState('creator');
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [_____isCreatingNew, setIsCreatingNew] = useState(false);
    // Marketplace-specific policy templates
    const [policyTemplates] = useState([]);
    {
        templateId: 'creator-trust-policy',
            name;
        'Creator Trust Score Policy',
            description;
        'Enforces minimum trust scores for creators to maintain marketplace access',
            category;
        'creator',
            defaultSeverity;
        'high',
            isSystemTemplate;
        false,
            rules;
        [,
            {
                id: 'trust-minimum',
                name: 'Minimum Trust Score',
                description: 'Creator must maintain minimum trust score',
                condition: 'user.trustScore >= {minTrustScore}',
                action: 'suspend_marketplace_access',
                enabled: true,
                priority: 1
            },
            {
                id: 'trust-warning',
                name: 'Trust Score Warning',
                description: 'Warn creator when trust score is declining',
                condition: 'user.trustScore < {warningThreshold} AND user.trustTrend == "declining"',
                action: 'send_warning_notification',
                enabled: true,
                priority: 2
            }],
            configurable;
        {
            thresholds: {
                minTrustScore: 60,
                    warningThreshold;
                70,
                    criticalThreshold;
                50,
                ;
            }
            timeframes: {
                evaluationPeriod: 7, // days,
                    warningCooldown;
                24; // hours,
            }
            actions: ['suspend_marketplace_access', 'restrict_new_uploads', 'require_verification', 'send_warning_notification'];
        }
        {
            templateId: 'template-quality-policy',
                name;
            'Template Quality Standards',
                description;
            'Maintains minimum quality standards for marketplace templates',
                category;
            'template',
                defaultSeverity;
            'medium',
                isSystemTemplate;
            false,
                rules;
            [,
                {
                    id: 'quality-rating',
                    name: 'Minimum Quality Rating',
                    description: 'Template must maintain minimum quality rating',
                    condition: 'template.qualityScore >= {minQualityScore}',
                    action: 'hide_from_marketplace',
                    enabled: true,
                    priority: 1
                },
                {
                    id: 'review-count',
                    name: 'Minimum Review Count',
                    description: 'Template must have minimum number of reviews',
                    condition: 'template.reviewCount >= {minReviews}',
                    action: 'flag_for_promotion',
                    enabled: false,
                    priority: 3
                }],
                configurable;
            {
                thresholds: {
                    minQualityScore: 3.5,
                        minReviews;
                    5,
                        maxRefundRate;
                    10; // percentage,
                }
                timeframes: {
                    evaluationPeriod: 30, // days,
                        gracePeriod;
                    7; // days,
                }
                actions: ['hide_from_marketplace', 'require_improvement', 'flag_for_review', 'flag_for_promotion'];
            }
            {
                templateId: 'transaction-fraud-policy',
                    name;
                'Transaction Fraud Detection',
                    description;
                'Detects and prevents fraudulent transaction patterns',
                    category;
                'transaction',
                    defaultSeverity;
                'critical',
                    isSystemTemplate;
                true,
                    rules;
                [,
                    {
                        id: 'velocity-check',
                        name: 'Transaction Velocity Check',
                        description: 'Detects unusually high transaction velocity',
                        condition: 'user.transactionsLast24h > {maxTransactions24h}',
                        action: 'block_transactions',
                        enabled: true,
                        priority: 1
                    },
                    {
                        id: 'payment-failure',
                        name: 'Payment Failure Pattern',
                        description: 'Detects multiple payment failures',
                        condition: 'user.failedPaymentsLast1h > {maxFailures1h}',
                        action: 'temporary_block',
                        enabled: true,
                        priority: 1
                    }],
                    configurable;
                {
                    thresholds: {
                        maxTransactions24h: 20,
                            maxFailures1h;
                        3,
                            maxChargebacks;
                        2,
                        ;
                    }
                    timeframes: {
                        velocityWindow: 24, // hours,
                            cooldownPeriod;
                        1; // hours,
                    }
                    actions: ['block_transactions', 'temporary_block', 'require_verification', 'flag_for_review'];
                }
                {
                    templateId: 'buyer-behavior-policy',
                        name;
                    'Buyer Behavior Standards',
                        description;
                    'Monitors and enforces buyer behavior standards',
                        category;
                    'buyer',
                        defaultSeverity;
                    'medium',
                        isSystemTemplate;
                    false,
                        rules;
                    [,
                        {
                            id: 'dispute-rate',
                            name: 'Maximum Dispute Rate',
                            description: 'Buyer dispute rate must not exceed threshold',
                            condition: 'buyer.disputeRate > {maxDisputeRate}',
                            action: 'require_payment_verification',
                            enabled: true,
                            priority: 2
                        }],
                        configurable;
                    {
                        thresholds: {
                            maxDisputeRate: 15, // percentage,
                                maxRefundRate;
                            25; // percentage,
                        }
                        timeframes: {
                            evaluationPeriod: 90; // days,
                        }
                        actions: ['require_payment_verification', 'limit_purchases', 'flag_for_review'];
                        ;
                        const getCategoryIcon = (category) => {
                            switch (category) {
                                case 'creator': return Users;
                                case 'buyer': return ShoppingCart;
                                case 'template': return FileText;
                                case 'transaction': return DollarSign;
                                case 'system': return Settings;
                                default: return Shield;
                            }
                            ;
                            const getCategoryColor = (category) => {
                                switch (category) {
                                    case 'creator': return 'text-blue-600 bg-blue-100';
                                    case 'buyer': return 'text-green-600 bg-green-100';
                                    case 'template': return 'text-purple-600 bg-purple-100';
                                    case 'transaction': return 'text-orange-600 bg-orange-100';
                                    case 'system': return 'text-gray-600 bg-gray-100';
                                    default: return 'text-gray-600 bg-gray-100';
                                }
                                ;
                                const filteredTemplates = policyTemplates.filter(template => );
                                ;
                                selectedCategory === 'all' || template.category === selectedCategory;
                            };
                        };
                        ;
                        const renderCategoryFilter = () => ();
                        ;
                        _jsx("div", { className: "category-filter", children: _jsxs("div", { className: "filter-buttons", children: [['creator', 'buyer', 'template', 'transaction', 'system'].map(category => { }), "const Icon = getCategoryIcon(category); const count = policyTemplates.filter(t => t.category === category).length; return;", _jsxs("button", { onClick: () => setSelectedCategory(category), className: `category-button ${selectedCategory === category ? 'active' : ''}`, children: [_jsx(Icon, { className: "w-4 h-4" }), _jsx("span", { children: category.charAt(0).toUpperCase() + category.slice(1) }), _jsx(Badge, { className: "count-badge", children: count })] }, category), "); })}"] }) });
                        ;
                        const renderTemplateCard = (template) => ();
                        ;
                        _jsx(Card, { className: "template-card", children: _jsxs(CardHeader, { children: [_jsxs("div", { className: "template-header", children: [_jsx("div", { className: "template-info", children: _jsxs("div", { className: "template-title", children: [_jsx("h4", { children: template.name }), _jsxs("div", { className: "template-badges", children: [_jsx(Badge, { className: getCategoryColor(template.category), children: template.category.toUpperCase() }), template.isSystemTemplate && ()
                                                                    < Badge, " className=\"text-purple-600 bg-purple-100\">", _jsx(Shield, { className: "w-3 h-3 mr-1" }), "SYSTEM"] }), ")}"] }) }), _jsx("p", { className: "template-description", children: template.description })] }), _jsx("div", { className: "template-actions", children: _jsxs(Button, { onClick: () => setEditingTemplate(template), size: "sm", variant: "outline", children: [_jsx(Edit3, { className: "w-4 h-4 mr-1" }), "Configure"] }) })] }) }, template.templateId)
                            ,
                                _jsxs(CardContent, { children: [_jsxs("div", { className: "template-stats", children: [_jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Rules" }), _jsx("span", { className: "stat-value", children: template.rules.length })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Active" }), _jsx("span", { className: "stat-value", children: template.rules.filter(r => r.enabled).length })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Severity" }), _jsx(Badge, { className: (template.defaultSeverity === 'critical' ? 'text-red-600 bg-red-100' : ,
                                                                template.defaultSeverity === 'high' ? 'text-orange-600 bg-orange-100' : ,
                                                                template.defaultSeverity === 'medium' ? 'text-yellow-600 bg-yellow-100' : ,
                                                                'text-blue-600 bg-blue-100'), children: template.defaultSeverity.toUpperCase() })] })] }), _jsxs("div", { className: "template-rules", children: [_jsx("h5", { children: "Policy Rules" }), _jsx("div", { className: "rules-list", children: template.rules.slice(0, 3).map(rule => ()
                                                        < div, key = { rule, : .id }, className = "rule-item" >
                                                        (_jsxs("div", { className: "rule-info", children: [_jsx("span", { className: "rule-name", children: rule.name }), _jsx("span", { className: "rule-description", children: rule.description })] })
                                                            ,
                                                                _jsxs("div", { className: "rule-status", children: [rule.enabled ? ()
                                                                            < CheckCircle : , " className=\"w-4 h-4 text-green-500\" /> ) : ()", _jsx(X, { className: "w-4 h-4 text-gray-400" }), ")}"] }))) }), "))}", template.rules.length > 3 && ()
                                                    < div, " className=\"more-rules\"> +", template.rules.length - 3, " more rules"] }), ")}"] });
                        div >
                        ;
                        CardContent >
                        ;
                        Card >
                        ;
                        ;
                        const renderTemplateEditor = () => {
                            if (!editingTemplate)
                                return null;
                            return;
                            _jsx("div", { className: "template-editor-overlay", children: _jsxs(Card, { className: "template-editor", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "editor-header", children: [_jsxs("div", { className: "editor-title", children: [_jsxs("h3", { children: ["Configure Policy: ", editingTemplate.name] }), _jsx(Badge, { className: getCategoryColor(editingTemplate.category), children: editingTemplate.category.toUpperCase() })] }), _jsx(Button, { onClick: () => setEditingTemplate(null), variant: "outline", size: "sm", children: _jsx(X, { className: "w-4 h-4" }) })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "editor-content", children: _jsxs("div", { className: "editor-section", children: [_jsx("h4", { children: "Threshold Configuration" }), _jsx("div", { className: "thresholds-grid", children: Object.entries(editingTemplate.configurable.thresholds).map(([key, value]) => ()
                                                                    < div, key = { key }, className = "threshold-item" >
                                                                    (_jsx("label", { className: "threshold-label", children: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) })
                                                                        ,
                                                                            _jsx("input", { type: "number", value: value, className: "threshold-input", readOnly: true }))) }), "))}"] }) }), _jsxs("div", { className: "editor-section", children: [_jsx("h4", { children: "Timeframe Settings" }), _jsx("div", { className: "timeframes-grid", children: Object.entries(editingTemplate.configurable.timeframes).map(([key, value]) => ()
                                                                < div, key = { key }, className = "timeframe-item" >
                                                                (_jsx("label", { className: "timeframe-label", children: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) })
                                                                    ,
                                                                        _jsxs("div", { className: "timeframe-input-group", children: [_jsx("input", { type: "number", value: value, className: "timeframe-input", readOnly: true }), _jsx("span", { className: "timeframe-unit", children: key.includes('Period') ? 'days' : 'hours' })] }))) }), "))}"] })] }), _jsxs("div", { className: "editor-section", children: [_jsx("h4", { children: "Policy Rules" }), _jsx("div", { className: "rules-editor", children: editingTemplate.rules.map(rule => ()
                                                        < div, key = { rule, : .id }, className = "rule-editor-item" >
                                                        (_jsxs("div", { className: "rule-editor-header", children: [_jsxs("div", { className: "rule-editor-info", children: [_jsx("h5", { children: rule.name }), _jsx("p", { children: rule.description })] }), _jsx("div", { className: "rule-editor-controls", children: _jsxs("label", { className: "rule-toggle", children: [_jsx("input", { type: "checkbox", checked: rule.enabled, readOnly: true }), _jsx("span", { children: "Enabled" })] }) })] })
                                                            ,
                                                                _jsxs("div", { className: "rule-editor-details", children: [_jsxs("div", { className: "rule-condition", children: [_jsx("label", { children: "Condition" }), _jsx("code", { className: "condition-code", children: rule.condition })] }), _jsxs("div", { className: "rule-action", children: [_jsx("label", { children: "Action" }), _jsx("select", { className: "action-select", value: rule.action, readOnly: true, children: editingTemplate.configurable.actions.map(action => ()
                                                                                        < option, key = { action }, value = { action } >
                                                                                        { action, : .replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }) }), "))}"] })] }))) })] }), "))}"] }) });
                        };
                        div >
                            _jsxs("div", { className: "editor-actions", children: [_jsxs(Button, { className: "save-button", children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Save Configuration"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Target, { className: "w-4 h-4 mr-2" }), "Test Policy"] })] });
                        div >
                        ;
                        CardContent >
                        ;
                        Card >
                        ;
                        div >
                        ;
                        ;
                    }
                    ;
                    return;
                    _jsxs("div", { className: `marketplace-policy-config ${className}`, children: ["}", _jsxs("div", { className: "config-header", children: [_jsxs("div", { className: "header-info", children: [_jsx("h2", { children: "Marketplace Policy Configuration" }), _jsx("p", { children: "Configure and customize policies for marketplace operations" })] }), _jsx("div", { className: "header-actions", children: _jsxs(Button, { onClick: () => setIsCreatingNew(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Policy"] }) })] }), renderCategoryFilter(), _jsx("div", { className: "templates-section", children: _jsx("div", { className: "templates-grid", children: filteredTemplates.map(template => renderTemplateCard(template)) }) }), editingTemplate && renderTemplateEditor(), _jsx("div", { className: "config-info", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Policy Configuration Guide" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "guide-content", children: [_jsxs("div", { className: "guide-section", children: [_jsx(Info, { className: "w-5 h-5 text-blue-500" }), _jsxs("div", { children: [_jsx("h4", { children: "Getting Started" }), _jsx("p", { children: "Select a policy category to view available templates. Each template contains pre-configured rules that can be customized for your marketplace needs." })] })] }), _jsxs("div", { className: "guide-section", children: [_jsx(Zap, { className: "w-5 h-5 text-orange-500" }), _jsxs("div", { children: [_jsx("h4", { children: "Rule Conditions" }), _jsx("p", { children: "Policy rules use expressions to evaluate conditions. Variables like user.trustScore and template.qualityScore are automatically populated from your system data." })] })] }), _jsxs("div", { className: "guide-section", children: [_jsx(Shield, { className: "w-5 h-5 text-green-500" }), _jsxs("div", { children: [_jsx("h4", { children: "Enforcement Actions" }), _jsx("p", { children: "When a policy rule is triggered, the configured action is automatically executed. Actions range from notifications to account restrictions." })] })] })] }) })] }) }), _jsx("style", { children: `
        .marketplace-policy-config {
          max-width: 1400px;
  margin: 0 auto;
          padding: 1.5rem;
  display: flex;
          flex-direction: column;
  gap: 1.5rem;
        .config-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        .header-info h2 {
          font-size: 1.875rem;
          font-weight: 700;
  color: #1f2937;
          margin-bottom: 0.5rem;
        .header-info p {
          color: #6b7280;
          font-size: 1rem;
        .category-filter {
          padding: 1rem;
  background: #f9fafb;
          border-radius: 8px;
        .filter-buttons {
          display: flex;
  gap: 0.5rem;
          flex-wrap: wrap;
        .category-button {
          display: flex;
          align-items: center;
  gap: 0.5rem;
          padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
          border-radius: 6px;
  background: white;
          cursor: pointer;
  transition: all 0.2s ease;
        .category-button:hover {
          border-color: #3b82f6;
  background: #f8fafc;
        .category-button.active {
          border-color: #3b82f6;
  background: #eff6ff;
          color: #1e40af;
        .count-badge {
          font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1rem;
        .template-card .card-header {
          padding-bottom: 0;
        .template-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
  gap: 1rem;
        .template-info {
          flex: 1;
        .template-title {
          display: flex;
          flex-direction: column;
  gap: 0.5rem;
          margin-bottom: 0.75rem;
        .template-title h4 {
          font-weight: 600;
  color: #1f2937;
          margin: 0;
        .template-badges {
          display: flex;
  gap: 0.5rem;
        .template-description {
          color: #6b7280;
          font-size: 0.875rem;
  margin: 0;
        .template-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
  padding: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
  gap: 0.25rem;
        .stat-label {
          font-size: 0.75rem;
  color: #6b7280;
          font-weight: 500;
        .stat-value {
          font-size: 0.875rem;
  color: #1f2937;
          font-weight: 600;
        .template-rules h5 {
          font-weight: 600;
  color: #1f2937;
          margin-bottom: 0.75rem;
          margin-top: 0;
        .rules-list {
          display: flex;
          flex-direction: column;
  gap: 0.5rem;
        .rule-item {
          display: flex;
          align-items: center;
  gap: 0.75rem;
          padding: 0.5rem;
  border: 1px solid #e5e7eb;
          border-radius: 4px;
        .rule-info {
          flex: 1;
  display: flex;
          flex-direction: column;
  gap: 0.125rem;
        .rule-name {
          font-size: 0.875rem;
          font-weight: 500;
  color: #1f2937;
        .rule-description {
          font-size: 0.75rem;
  color: #6b7280;
        .more-rules {
          padding: 0.5rem;
          text-align: center;
          font-size: 0.875rem;
  color: #6b7280;
          font-style: italic;
        .template-editor-overlay {
          position: fixed;
  top: 0;
          left: 0;
  right: 0;
          bottom: 0;
  background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
  padding: 1rem;
        .template-editor {
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        .editor-title {
          display: flex;
          align-items: center;
  gap: 0.75rem;
        .editor-title h3 {
          font-weight: 600;
  color: #1f2937;
          margin: 0;
        .editor-content {
          display: flex;
          flex-direction: column;
  gap: 1.5rem;
        .editor-section h4 {
          font-weight: 600;
  color: #1f2937;
          margin-bottom: 0.75rem;
          margin-top: 0;
        .thresholds-grid, .timeframes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        .threshold-item, .timeframe-item {
          display: flex;
          flex-direction: column;
  gap: 0.5rem;
        .threshold-label, .timeframe-label {
          font-size: 0.875rem;
          font-weight: 500;
  color: #374151;
        .threshold-input, .timeframe-input {
          padding: 0.5rem;
  border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        .timeframe-input-group {
          display: flex;
          align-items: center;
  gap: 0.5rem;
        .timeframe-input {
          flex: 1;
        .timeframe-unit {
          font-size: 0.875rem;
  color: #6b7280;
        .rules-editor {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .rule-editor-item {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
  padding: 1rem;
        .rule-editor-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        .rule-editor-info h5 {
          font-weight: 600;
  color: #1f2937;
          margin: 0 0 0.25rem 0;
        .rule-editor-info p {
          font-size: 0.875rem;
  color: #6b7280;
          margin: 0;
        .rule-toggle {
          display: flex;
          align-items: center;
  gap: 0.5rem;
          font-size: 0.875rem;
  color: #374151;
        .rule-editor-details {
          display: grid;
          grid-template-columns: 2fr 1fr;
  gap: 1rem;
        .rule-condition label, .rule-action label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
  color: #374151;
          margin-bottom: 0.5rem;
        .condition-code {
          display: block;
  padding: 0.5rem;
          background: #f3f4f6;
  border: 1px solid #d1d5db;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.75rem;
  color: #374151;
        .action-select {
          width: 100%;
  padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        .editor-actions {
          display: flex;
  gap: 0.75rem;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        .save-button {
          background: #059669;
          border-color: #059669;
        .save-button:hover {,
  background: #047857;
          border-color: #047857;
        .config-info {
          margin-top: 2rem;
        .guide-content {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .guide-section {
          display: flex;
          align-items: flex-start;
  gap: 0.75rem;
        .guide-section h4 {
          font-weight: 600;
  color: #1f2937;
          margin: 0 0 0.25rem 0;
        .guide-section p {
          color: #6b7280;
          font-size: 0.875rem;
  margin: 0;
        @media (max-width: 1200px) {
          .templates-grid {
            grid-template-columns: 1fr;
          .rule-editor-details {
            grid-template-columns: 1fr;
        @media (max-width: 768px) {
          .config-header {
            flex-direction: column;
            align-items: stretch;
  gap: 1rem;
          .filter-buttons {
            flex-direction: column;
          .category-button {
            justify-content: center;
          .template-header {
            flex-direction: column;
  gap: 0.75rem;
          .template-stats {
            flex-direction: column;
  gap: 0.5rem;
          .stat-item {
            flex-direction: row;
            justify-content: space-between;
          .thresholds-grid,
          .timeframes-grid {
            grid-template-columns: 1fr;
      ` })] });
                    ;
                }
                ;
                export default MarketplacePolicyConfig;
            }
        }
    }
}
