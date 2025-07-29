/**
 * Marketplace Policy Configuration - E17-1753114397363-F12F4D
 * 
 * Configuration system for marketplace-specific policy use cases
 * Part of Epic 17.5.4 - Policy Enforcement (Backstage Admin Controls)
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Settings,
  Shield,
  Users,
  ShoppingCart,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit3,
  Save,
  X,
  Info,
  Zap,
  Clock,
  Target
} from 'lucide-react';

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: string;
  enabled: boolean;
  priority: number;
}
export interface MarketplacePolicyTemplate {
  templateId: string;
  name: string;
  description: string;
  category: 'creator' | 'buyer' | 'template' | 'transaction' | 'system';
  rules: PolicyRule;
  defaultSeverity: 'low' | 'medium' | 'high' | 'critical';
  isSystemTemplate: boolean;
  configurable: {
  thresholds: Record<string, number>;
  timeframes: Record<string, number>;
  actions: string;
};
}
export interface MarketplacePolicyConfigProps {
  className?: string;
}
export const MarketplacePolicyConfig: React.FC<MarketplacePolicyConfigProps> = ({)
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('creator');
  const [editingTemplate, setEditingTemplate] = useState<MarketplacePolicyTemplate | null>(null);
  const [_____isCreatingNew, setIsCreatingNew] = useState(false);
  // Marketplace-specific policy templates
  const [policyTemplates] = useState<MarketplacePolicyTemplate>([)
    {
      templateId: 'creator-trust-policy',
      name: 'Creator Trust Score Policy',
      description: 'Enforces minimum trust scores for creators to maintain marketplace access',
      category: 'creator',
      defaultSeverity: 'high',
      isSystemTemplate: false,
      rules: [,
        {
          id: 'trust-minimum',
          name: 'Minimum Trust Score',
          description: 'Creator must maintain minimum trust score',
          condition: 'user.trustScore >= {minTrustScore}',
          action: 'suspend_marketplace_access',
          enabled: true,
          priority: 1;
  }
        {
          id: 'trust-warning',
          name: 'Trust Score Warning',
          description: 'Warn creator when trust score is declining',
          condition: 'user.trustScore < {warningThreshold} AND user.trustTrend == "declining"',
          action: 'send_warning_notification',
          enabled: true,
          priority: 2],
      configurable: {
  thresholds: {
  minTrustScore: 60,
  warningThreshold: 70,
  criticalThreshold: 50,
},
  timeframes: {
  evaluationPeriod: 7, // days,
  warningCooldown: 24 // hours,
},
  actions: ['suspend_marketplace_access', 'restrict_new_uploads', 'require_verification', 'send_warning_notification']
  }
    {
      templateId: 'template-quality-policy',
      name: 'Template Quality Standards',
      description: 'Maintains minimum quality standards for marketplace templates',
      category: 'template',
      defaultSeverity: 'medium',
      isSystemTemplate: false,
      rules: [,
        {
          id: 'quality-rating',
          name: 'Minimum Quality Rating',
          description: 'Template must maintain minimum quality rating',
          condition: 'template.qualityScore >= {minQualityScore}',
          action: 'hide_from_marketplace',
          enabled: true,
          priority: 1;
  }
        {
          id: 'review-count',
          name: 'Minimum Review Count',
          description: 'Template must have minimum number of reviews',
          condition: 'template.reviewCount >= {minReviews}',
          action: 'flag_for_promotion',
          enabled: false,
          priority: 3],
      configurable: {
  thresholds: {
  minQualityScore: 3.5,
  minReviews: 5,
  maxRefundRate: 10 // percentage,
},
  timeframes: {
  evaluationPeriod: 30, // days,
  gracePeriod: 7 // days,
},
  actions: ['hide_from_marketplace', 'require_improvement', 'flag_for_review', 'flag_for_promotion']
  }
    {
      templateId: 'transaction-fraud-policy',
      name: 'Transaction Fraud Detection',
      description: 'Detects and prevents fraudulent transaction patterns',
      category: 'transaction',
      defaultSeverity: 'critical',
      isSystemTemplate: true,
      rules: [,
        {
          id: 'velocity-check',
          name: 'Transaction Velocity Check',
          description: 'Detects unusually high transaction velocity',
          condition: 'user.transactionsLast24h > {maxTransactions24h}',
          action: 'block_transactions',
          enabled: true,
          priority: 1;
  }
        {
          id: 'payment-failure',
          name: 'Payment Failure Pattern',
          description: 'Detects multiple payment failures',
          condition: 'user.failedPaymentsLast1h > {maxFailures1h}',
          action: 'temporary_block',
          enabled: true,
          priority: 1],
      configurable: {
  thresholds: {
  maxTransactions24h: 20,
  maxFailures1h: 3,
  maxChargebacks: 2,
},
  timeframes: {
  velocityWindow: 24, // hours,
  cooldownPeriod: 1 // hours,
},
  actions: ['block_transactions', 'temporary_block', 'require_verification', 'flag_for_review']
  }
    {
      templateId: 'buyer-behavior-policy',
      name: 'Buyer Behavior Standards',
      description: 'Monitors and enforces buyer behavior standards',
      category: 'buyer',
      defaultSeverity: 'medium',
      isSystemTemplate: false,
      rules: [,
        {
          id: 'dispute-rate',
          name: 'Maximum Dispute Rate',
          description: 'Buyer dispute rate must not exceed threshold',
          condition: 'buyer.disputeRate > {maxDisputeRate}',
          action: 'require_payment_verification',
          enabled: true,
          priority: 2],
      configurable: {
  thresholds: {
  maxDisputeRate: 15, // percentage,
  maxRefundRate: 25 // percentage,
},
  timeframes: {
  evaluationPeriod: 90 // days,
},
  actions: ['require_payment_verification', 'limit_purchases', 'flag_for_review']
  ]);
  const getCategoryIcon = (category: string) => {
  switch (category) {
  case 'creator': return Users;
  case 'buyer': return ShoppingCart;
  case 'template': return FileText;
  case 'transaction': return DollarSign;
  case 'system': return Settings;
  default: return Shield;
};
  const getCategoryColor = (category: string) => {
  switch (category) {
  case 'creator': return 'text-blue-600 bg-blue-100';
  case 'buyer': return 'text-green-600 bg-green-100';
  case 'template': return 'text-purple-600 bg-purple-100';
  case 'transaction': return 'text-orange-600 bg-orange-100';
  case 'system': return 'text-gray-600 bg-gray-100';
  default: return 'text-gray-600 bg-gray-100';
};
  const filteredTemplates = policyTemplates.filter(template => ;);
    selectedCategory === 'all' || template.category === selectedCategory
  );
  const renderCategoryFilter = () => (;);
    <div className="category-filter">
      <div className="filter-buttons">
        {['creator', 'buyer', 'template', 'transaction', 'system'].map(category => {)
  const Icon = getCategoryIcon(category);
          const count = policyTemplates.filter(t => t.category === category).length;
          return;
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`category-button ${selectedCategory === category ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4" />
              <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
              <Badge className="count-badge">{count}</Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
  const renderTemplateCard = (template: MarketplacePolicyTemplate) => (;);
    <Card key={template.templateId} className="template-card">
      <CardHeader>
        <div className="template-header">
          <div className="template-info">
            <div className="template-title">
              <h4>{template.name}</h4>
              <div className="template-badges">
                <Badge className={getCategoryColor(template.category)}>
                  {template.category.toUpperCase()}
                </Badge>
                {template.isSystemTemplate && ()
                  <Badge className="text-purple-600 bg-purple-100">
                    <Shield className="w-3 h-3 mr-1" />
                    SYSTEM
                  </Badge>
                )}
              </div>
            </div>
            <p className="template-description">{template.description}</p>
          </div>
          <div className="template-actions">
            <Button
              onClick={() => setEditingTemplate(template)}
              size="sm"
              variant="outline"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Configure
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="template-stats">
          <div className="stat-item">
            <span className="stat-label">Rules</span>
            <span className="stat-value">{template.rules.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Active</span>
            <span className="stat-value">
              {template.rules.filter(r => r.enabled).length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Severity</span>
            <Badge className={
  template.defaultSeverity === 'critical' ? 'text-red-600 bg-red-100' :,
  template.defaultSeverity === 'high' ? 'text-orange-600 bg-orange-100' :,
  template.defaultSeverity === 'medium' ? 'text-yellow-600 bg-yellow-100' :,
  'text-blue-600 bg-blue-100'
}>
              {template.defaultSeverity.toUpperCase()}
            </Badge>
          </div>
        </div>
        <div className="template-rules">
          <h5>Policy Rules</h5>
          <div className="rules-list">
            {template.rules.slice(0, 3).map(rule => ()
              <div key={rule.id} className="rule-item">
                <div className="rule-info">
                  <span className="rule-name">{rule.name}</span>
                  <span className="rule-description">{rule.description}</span>
                </div>
                <div className="rule-status">
                  {rule.enabled ? ()
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : ()
                    <X className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
            {template.rules.length > 3 && ()
              <div className="more-rules">
                +{template.rules.length - 3} more rules
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
  const renderTemplateEditor = () => {
    if (!editingTemplate) return null;
    return;
      <div className="template-editor-overlay">
        <Card className="template-editor">
          <CardHeader>
            <div className="editor-header">
              <div className="editor-title">
                <h3>Configure Policy: {editingTemplate.name}</h3>
                <Badge className={getCategoryColor(editingTemplate.category)}>
                  {editingTemplate.category.toUpperCase()}
                </Badge>
              </div>
              <Button
                onClick={() => setEditingTemplate(null)}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="editor-content">
              <div className="editor-section">
                <h4>Threshold Configuration</h4>
                <div className="thresholds-grid">
                  {Object.entries(editingTemplate.configurable.thresholds).map(([key, value]) => ()
                    <div key={key} className="threshold-item">
                      <label className="threshold-label">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <input
                        type="number"
                        value={value}
                        className="threshold-input"
                        readOnly
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="editor-section">
                <h4>Timeframe Settings</h4>
                <div className="timeframes-grid">
                  {Object.entries(editingTemplate.configurable.timeframes).map(([key, value]) => ()
                    <div key={key} className="timeframe-item">
                      <label className="timeframe-label">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <div className="timeframe-input-group">
                        <input
                          type="number"
                          value={value}
                          className="timeframe-input"
                          readOnly
                        />
                        <span className="timeframe-unit">
                          {key.includes('Period') ? 'days' : 'hours'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="editor-section">
                <h4>Policy Rules</h4>
                <div className="rules-editor">
                  {editingTemplate.rules.map(rule => ()
                    <div key={rule.id} className="rule-editor-item">
                      <div className="rule-editor-header">
                        <div className="rule-editor-info">
                          <h5>{rule.name}</h5>
                          <p>{rule.description}</p>
                        </div>
                        <div className="rule-editor-controls">
                          <label className="rule-toggle">
                            <input
                              type="checkbox"
                              checked={rule.enabled}
                              readOnly
                            />
                            <span>Enabled</span>
                          </label>
                        </div>
                      </div>
                      <div className="rule-editor-details">
                        <div className="rule-condition">
                          <label>Condition</label>
                          <code className="condition-code">{rule.condition}</code>
                        </div>
                        <div className="rule-action">
                          <label>Action</label>
                          <select className="action-select" value={rule.action} readOnly>
                            {editingTemplate.configurable.actions.map(action => ()
                              <option key={action} value={action}>
                                {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="editor-actions">
                <Button className="save-button">
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
                <Button variant="outline">
                  <Target className="w-4 h-4 mr-2" />
                  Test Policy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  return;
    <div className={`marketplace-policy-config ${className}`}>}
      <div className="config-header">
        <div className="header-info">
          <h2>Marketplace Policy Configuration</h2>
          <p>Configure and customize policies for marketplace operations</p>
        </div>
        <div className="header-actions">
          <Button onClick={() => setIsCreatingNew(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Policy
          </Button>
        </div>
      </div>
      {renderCategoryFilter()}
      <div className="templates-section">
        <div className="templates-grid">
          {filteredTemplates.map(template => renderTemplateCard(template))}
        </div>
      </div>
      {editingTemplate && renderTemplateEditor()}
      <div className="config-info">
        <Card>
          <CardHeader>
            <CardTitle>Policy Configuration Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="guide-content">
              <div className="guide-section">
                <Info className="w-5 h-5 text-blue-500" />
                <div>
                  <h4>Getting Started</h4>
                  <p>Select a policy category to view available templates. Each template contains pre-configured rules that can be customized for your marketplace needs.</p>
                </div>
              </div>
              <div className="guide-section">
                <Zap className="w-5 h-5 text-orange-500" />
                <div>
                  <h4>Rule Conditions</h4>
                  <p>Policy rules use expressions to evaluate conditions. Variables like user.trustScore and template.qualityScore are automatically populated from your system data.</p>
                </div>
              </div>
              <div className="guide-section">
                <Shield className="w-5 h-5 text-green-500" />
                <div>
                  <h4>Enforcement Actions</h4>
                  <p>When a policy rule is triggered, the configured action is automatically executed. Actions range from notifications to account restrictions.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <style>{`
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
      `}</style>
    </div>
  );
};

export default MarketplacePolicyConfig;