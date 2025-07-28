/**
 * Compliance Security Dashboard
 * Task T-1752989143998-124: Design security dashboard framework
 * 
 * Compliance-focused security dashboard for regulatory reporting,
 * audit preparation, and compliance monitoring. Designed for
 * compliance officers, auditors, and regulatory teams.
 * 
 * Features:
 * - Multi-framework compliance tracking
 * - Audit trail management
 * - Policy compliance monitoring
 * - Risk assessment and remediation
 * - Regulatory reporting automation
 * - Evidence collection and management
 * 
 * Target Users:
 * - Compliance Officers
 * - Internal/External Auditors
 * - Risk Managers
 * - Legal Teams
 * - Regulatory Affairs
 * 
 * Supported Frameworks:
 * - SOC 2 Type I/II
 * - ISO 27001
 * - NIST Cybersecurity Framework
 * - GDPR/CCPA Privacy Regulations
 * - HIPAA (Healthcare)
 * - PCI DSS (Payment Card Industry)
 * - FedRAMP (Government)
 * 
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2024-01-22
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  DashboardConfig, 
  DashboardTheme, 
  SecurityRole,
  WidgetConfiguration,
  DashboardType 
} from './SecurityDashboardFramework';

export enum ComplianceFramework {
  SOC2_TYPE1 = 'soc2_type1',
  SOC2_TYPE2 = 'soc2_type2',
  ISO27001 = 'iso27001',
  NIST_CSF = 'nist_csf',
  GDPR = 'gdpr',
  CCPA = 'ccpa',
  HIPAA = 'hipaa',
  PCI_DSS = 'pci_dss',
  FEDRAMP = 'fedramp'
  export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  PARTIALLY_COMPLIANT = 'partially_compliant',
  NON_COMPLIANT = 'non_compliant',
  NOT_ASSESSED = 'not_assessed',
  IN_REMEDIATION = 'in_remediation'
  export interface ComplianceRequirement {
  id: string;,
  framework: ComplianceFramework;
  category: string;,
  requirement: string;
  description: string;,
  status: ComplianceStatus;
  lastAssessment: Date;
  nextAssessment?: Date;
  responsible: string;,
  evidence: Evidence;
  findings: Finding;,
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  businessImpact: string;
}
export interface Evidence {
  id: string;,
  type: 'document' | 'screenshot' | 'log' | 'certificate' | 'policy';
  title: string;,
  description: string;
  lastUpdated: Date;
  validUntil?: Date;
  location: string;,
  owner: string;
  status: 'current' | 'outdated' | 'missing';
}
export interface Finding {
  id: string;,
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'gap' | 'weakness' | 'deficiency' | 'observation';,
  title: string;
  description: string;,
  recommendation: string;
  identifiedDate: Date;,
  targetResolution: Date;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';,
  owner: string;
  estimatedEffort: string;
}
export interface AuditCycle {
  id: string;,
  framework: ComplianceFramework;
  type: 'internal' | 'external' | 'certification';,
  auditor: string;
  plannedStart: Date;,
  plannedEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';,
  scope: string;
  findings: Finding;
  reportUrl?: string;
}
export interface ComplianceMetrics {
  overallScore: number;,
  byFramework: Record<ComplianceFramework, {,
  score: number;,
  compliantRequirements: number;
  totalRequirements: number;,
  criticalGaps: number;
  lastAudit: Date;
  nextAudit?: Date;
}>;
  riskProfile: {,
  high: number;
  medium: number;,
  low: number;
  accepted: number;
};
  auditStatus: {,
  upcoming: AuditCycle;
  active: AuditCycle;,
  recentlyCompleted: AuditCycle;
};
  evidenceHealth: {,
  current: number;
  outdated: number;,
  missing: number;
  expiringWithin30Days: number;
};
}
export interface ComplianceSecurityDashboardProps {
  metrics: ComplianceMetrics;,
  requirements: ComplianceRequirement;
  frameworks: ComplianceFramework;,
  auditCycles: AuditCycle;
  theme?: DashboardTheme;
  refreshInterval?: number;
  exportFormats?: ('pdf' | 'excel' | 'csv')[];
  onRequirementUpdate?: (requirementId: string, status: ComplianceStatus) => void;
  onGenerateReport?: (framework: ComplianceFramework, format: string) => void;
  onScheduleAudit?: (framework: ComplianceFramework) => void;
  /**
  * Compliance Security Dashboard Component
  */
}
export const ComplianceSecurityDashboard: React.FC<ComplianceSecurityDashboardProps> = ({)
  metrics,
  requirements,
  frameworks,
  auditCycles,
  theme = DashboardTheme.LIGHT,
  refreshInterval = 60,
  exportFormats = ['pdf', 'excel'],
  onRequirementUpdate,
  onGenerateReport,
  onScheduleAudit
}) => {
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ComplianceStatus | 'all'>('all');
  const [selectedRequirement, setSelectedRequirement] = useState<ComplianceRequirement | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [reportGenerating, setReportGenerating] = useState<string | null>(null);
  // Theme configuration
  const themeStyles = useMemo(() => {
  const themes = {
  light: {,
  background: '#ffffff',
  surface: '#f8fafc',
  border: '#e2e8f0',
  text: '#1e293b',
  textSecondary: '#64748b',
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  critical: '#dc2626',
},
  dark: {,
  background: '#0f172a',
  surface: '#1e293b',
  border: '#334155',
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  primary: '#60a5fa',
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  critical: '#ef4444',
},
  cinema: {,
  background: '#0a0a0a',
  surface: '#1a1a1a',
  border: '#333333',
  text: '#f5f5f5',
  textSecondary: '#d4d4d4',
  primary: '#fbbf24',
  success: '#22d3ee',
  warning: '#f59e0b',
  error: '#ef4444',
  critical: '#dc2626',
};
    return themes[theme] || themes.light;
  }, [theme]);
  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, refreshInterval * 60 * 1000);
      return () => clearInterval(interval);
  }, [refreshInterval]);
  // Filter requirements
  const filteredRequirements = useMemo(() => {
    return requirements.filter(req => {)
  const frameworkMatch = selectedFramework === 'all' || req.framework === selectedFramework;
      const statusMatch = selectedStatus === 'all' || req.status === selectedStatus;
      return frameworkMatch && statusMatch;
    }).sort((a, b) => {
      // Sort by risk level, then status
      const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
        return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
      return a.requirement.localeCompare(b.requirement);
    });
  }, [requirements, selectedFramework, selectedStatus]);
  // Get status color
  const getStatusColor = useCallback((status: ComplianceStatus) => {
  switch (status) {
  case ComplianceStatus.COMPLIANT: return themeStyles.success;
  case ComplianceStatus.PARTIALLY_COMPLIANT: return themeStyles.warning;
  case ComplianceStatus.NON_COMPLIANT: return themeStyles.error;
  case ComplianceStatus.IN_REMEDIATION: return themeStyles.primary;
  case ComplianceStatus.NOT_ASSESSED: return themeStyles.textSecondary;,
  default: return themeStyles.textSecondary;
}, [themeStyles]);
  // Get framework display name
  const getFrameworkName = useCallback((framework: ComplianceFramework) => {
  const names = {
  [ComplianceFramework.SOC2_TYPE1]: 'SOC 2 Type I',
  [ComplianceFramework.SOC2_TYPE2]: 'SOC 2 Type II',
  [ComplianceFramework.ISO27001]: 'ISO 27001',
  [ComplianceFramework.NIST_CSF]: 'NIST CSF',
  [ComplianceFramework.GDPR]: 'GDPR',
  [ComplianceFramework.CCPA]: 'CCPA',
  [ComplianceFramework.HIPAA]: 'HIPAA',
  [ComplianceFramework.PCI_DSS]: 'PCI DSS',
  [ComplianceFramework.FEDRAMP]: 'FedRAMP',
};
    return names[framework] || framework;
  }, []);
  // Handle report generation
  const handleGenerateReport = useCallback(async (framework: ComplianceFramework, format: string) => {
    setReportGenerating(`${framework}-${format}`);}
    try {
      await onGenerateReport?.(framework, format);
    } finally {
      setReportGenerating(null);
  }, [onGenerateReport]);
  // Render compliance score gauge
  const renderComplianceGauge = (framework: ComplianceFramework, score: number) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const getScoreColor = (score: number) => {,
  if (score >= 90) return themeStyles.success;
  if (score >= 75) return themeStyles.warning;
  return themeStyles.error;
};
    return;
      <div style={{
        background: themeStyles.surface,
        border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '8px',
        padding: '16px',
        textAlign: 'center';
  }}>
        <h4 style={{
  margin: '0 0 12px 0',
  fontSize: '12px',
  fontWeight: 600,
  color: themeStyles.textSecondary,
  textTransform: 'uppercase',
}}>
          {getFrameworkName(framework)}
        </h4>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '8px' }}>
          <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="45"
              cy="45"
              r={radius}
              stroke={themeStyles.border}
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="45"
              cy="45"
              r={radius}
              stroke={getScoreColor(score)}
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div style={{
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: '18px',
  fontWeight: 700,
  color: getScoreColor(score),
}}>
            {score}%
          </div>
        </div>
        <div style={{
  fontSize: '11px',
  color: themeStyles.textSecondary,
}}>
          {metrics.byFramework[framework]?.compliantRequirements || 0}/
          {metrics.byFramework[framework]?.totalRequirements || 0} compliant
        </div>
        {metrics.byFramework[framework]?.criticalGaps > 0 && ()
          <div style={{
  marginTop: '4px',
  fontSize: '10px',
  color: themeStyles.error,
  fontWeight: 500,
}}>
            {metrics.byFramework[framework].criticalGaps} critical gaps
          </div>
        )}
      </div>
    );
  };
  // Render requirement item
  const renderRequirementItem = (requirement: ComplianceRequirement) => (;);
    <div
      key={requirement.id}
      onClick={() => setSelectedRequirement(requirement)}
      style={{
        background: themeStyles.surface,
        border: `1px solid ${themeStyles.border}`}
},
  borderLeft: `4px solid ${getStatusColor(requirement.status)}`}
},
  borderRadius: '6px',
        padding: '16px',
        marginBottom: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease';
  }}
    >
      <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '8px',
}}>
        <div style={{ flex: 1 }}>
          <div style={{
  fontSize: '14px',
  fontWeight: 600,
  color: themeStyles.text,
  marginBottom: '4px',
}}>
            {requirement.requirement}
          </div>
          <div style={{
  fontSize: '12px',
  color: themeStyles.textSecondary,
  marginBottom: '8px',
}}>
            {requirement.description}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            fontSize: '10px',
            padding: '2px 6px',
            background: `${getStatusColor(requirement.status)}20`}
},
  color: getStatusColor(requirement.status),
            borderRadius: '4px',
            fontWeight: 600,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap';
  }}>
            {requirement.status.replace('_', ' ')}
          </span>
          {requirement.riskLevel === 'critical' && ()
            <span style={{
              fontSize: '10px',
              padding: '2px 6px',
              background: `${themeStyles.critical}20`}
},
  color: themeStyles.critical,
              borderRadius: '4px',
              fontWeight: 600;
  }}>
              CRITICAL
            </span>
          )}
        </div>
      </div>
      <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '11px',
  color: themeStyles.textSecondary,
}}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span>{getFrameworkName(requirement.framework)}</span>
          <span>•</span>
          <span>Owner: {requirement.responsible}</span>
          <span>•</span>
          <span>Evidence: {requirement.evidence.length}</span>
        </div>
        <div>
          Last assessed: {requirement.lastAssessment.toLocaleDateString()}
        </div>
      </div>
      {requirement.findings.length > 0 && (<div style={{)
  marginTop: '8px',
  padding: '8px',
  background: themeStyles.background,
  borderRadius: '4px',
  fontSize: '11px',
}}>
          <span style={{ color: themeStyles.error, fontWeight: 500 }}>
            {requirement.findings.length} finding(s):
          </span>
          <span style={{ color: themeStyles.textSecondary, marginLeft: '8px' }}>
            {requirement.findings.filter(f => f.severity === 'critical').length} critical, 
            {requirement.findings.filter(f => f.severity === 'high').length} high priority
          </span>
        </div>
      )}
    </div>
  );
  return;
    <div style={{
  background: themeStyles.background,
  color: themeStyles.text,
  minHeight: '100vh',
  fontFamily: 'Inter, system-ui, sans-serif',
}}>
      {/* Header */}
      <div style={{
        background: themeStyles.surface,
        borderBottom: `1px solid ${themeStyles.border}`}
},
  padding: '20px 24px';
  }}>
        <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  maxWidth: '1400px',
  margin: '0 auto',
}}>
          <div>
            <h1 style={{
  margin: '0 0 4px 0',
  fontSize: '24px',
  fontWeight: 700,
  color: themeStyles.text,
}}>
              📋 Compliance Dashboard
            </h1>
            <p style={{
  margin: '0',
  fontSize: '16px',
  color: themeStyles.textSecondary,
}}>
              Regulatory compliance monitoring and audit management
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
  fontSize: '12px',
  color: themeStyles.textSecondary,
}}>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {exportFormats.map(format => ()
                <button
                  key={format}
                  onClick={() => selectedFramework !== 'all' && handleGenerateReport(selectedFramework, format)}
                  disabled={selectedFramework === 'all' || reportGenerating !== null}
                  style={{
  background: themeStyles.primary,
  color: themeStyles.background,
  border: 'none',
  borderRadius: '4px',
  padding: '6px 12px',
  fontSize: '12px',
  fontWeight: 500,
  cursor: selectedFramework === 'all' ? 'not-allowed' : 'pointer',
  opacity: selectedFramework === 'all' ? 0.5 : 1,
}}
                >
                  {reportGenerating === `${selectedFramework}-${format}` ? '⏳' : '📊'} Export {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Overall Compliance Score */}
        <div style={{
          background: themeStyles.surface,
          border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
          textAlign: 'center';
  }}>
          <h2 style={{
  margin: '0 0 16px 0',
  fontSize: '18px',
  fontWeight: 600,
  color: themeStyles.text,
}}>
            Overall Compliance Score
          </h2>
          <div style={{
  fontSize: '48px',
  fontWeight: 800,
  color: metrics.overallScore >= 90 ? themeStyles.success :,
  metrics.overallScore >= 75 ? themeStyles.warning : themeStyles.error,
  marginBottom: '8px',
}}>
            {metrics.overallScore}%
          </div>
          <div style={{
  fontSize: '14px',
  color: themeStyles.textSecondary,
}}>
            Based on {frameworks.length} compliance frameworks
          </div>
        </div>
        {/* Framework Compliance Scores */}
        <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '16px',
  marginBottom: '24px',
}}>
          {frameworks.map(framework => )
            renderComplianceGauge(framework, metrics.byFramework[framework]?.score || 0)
          )}
        </div>
        {/* Risk Profile and Evidence Health */}
        <div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr 1fr',
  gap: '16px',
  marginBottom: '24px',
}}>
          <div style={{
            background: themeStyles.surface,
            border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '8px',
            padding: '16px';
  }}>
            <h4 style={{
  margin: '0 0 8px 0',
  fontSize: '12px',
  color: themeStyles.textSecondary,
  textTransform: 'uppercase',
}}>
              High Risk Items
            </h4>
            <div style={{
  fontSize: '28px',
  fontWeight: 700,
  color: metrics.riskProfile.high > 0 ? themeStyles.error : themeStyles.success,
}}>
              {metrics.riskProfile.high}
            </div>
          </div>
          <div style={{
            background: themeStyles.surface,
            border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '8px',
            padding: '16px';
  }}>
            <h4 style={{
  margin: '0 0 8px 0',
  fontSize: '12px',
  color: themeStyles.textSecondary,
  textTransform: 'uppercase',
}}>
              Medium Risk Items
            </h4>
            <div style={{
  fontSize: '28px',
  fontWeight: 700,
  color: themeStyles.warning,
}}>
              {metrics.riskProfile.medium}
            </div>
          </div>
          <div style={{
            background: themeStyles.surface,
            border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '8px',
            padding: '16px';
  }}>
            <h4 style={{
  margin: '0 0 8px 0',
  fontSize: '12px',
  color: themeStyles.textSecondary,
  textTransform: 'uppercase',
}}>
              Evidence Missing
            </h4>
            <div style={{
  fontSize: '28px',
  fontWeight: 700,
  color: metrics.evidenceHealth.missing > 0 ? themeStyles.error : themeStyles.success,
}}>
              {metrics.evidenceHealth.missing}
            </div>
          </div>
          <div style={{
            background: themeStyles.surface,
            border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '8px',
            padding: '16px';
  }}>
            <h4 style={{
  margin: '0 0 8px 0',
  fontSize: '12px',
  color: themeStyles.textSecondary,
  textTransform: 'uppercase',
}}>
            Expiring Soon
            </h4>
            <div style={{
  fontSize: '28px',
  fontWeight: 700,
  color: metrics.evidenceHealth.expiringWithin30Days > 0 ? themeStyles.warning : themeStyles.success,
}}>
              {metrics.evidenceHealth.expiringWithin30Days}
            </div>
          </div>
        </div>
        {/* Filters */}
        <div style={{
  display: 'flex',
  gap: '16px',
  marginBottom: '16px',
  alignItems: 'center',
}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{
  fontSize: '12px',
  fontWeight: 600,
  color: themeStyles.textSecondary,
}}>
              Framework:
            </label>
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value as ComplianceFramework | 'all')}
              style={{
                background: themeStyles.surface,
                border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '4px',
                padding: '6px 8px',
                color: themeStyles.text,
                fontSize: '12px';
  }}
            >
              <option value="all">All Frameworks</option>
              {frameworks.map(framework => ()
                <option key={framework} value={framework}>
                  {getFrameworkName(framework)}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{
  fontSize: '12px',
  fontWeight: 600,
  color: themeStyles.textSecondary,
}}>
              Status:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ComplianceStatus | 'all')}
              style={{
                background: themeStyles.surface,
                border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '4px',
                padding: '6px 8px',
                color: themeStyles.text,
                fontSize: '12px';
  }}
            >
              <option value="all">All Statuses</option>
              {Object.values(ComplianceStatus).map(status => ()
                <option key={status} value={status}>
                  {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div style={{
  fontSize: '12px',
  color: themeStyles.textSecondary,
  marginLeft: 'auto',
}}>
            Showing {filteredRequirements.length} of {requirements.length} requirements
          </div>
        </div>
        {/* Requirements List */}
        <div style={{
          background: themeStyles.surface,
          border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '8px',
          padding: '20px';
  }}>
          <h3 style={{
  margin: '0 0 16px 0',
  fontSize: '16px',
  fontWeight: 600,
  color: themeStyles.text,
}}>
            Compliance Requirements
          </h3>
          {filteredRequirements.length === 0 ? ()
            <div style={{
  textAlign: 'center',
  padding: '40px',
  color: themeStyles.textSecondary,
}}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <div>No requirements match the current filters</div>
            </div>
          ) : ()
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {filteredRequirements.map(renderRequirementItem)}
            </div>
          )}
        </div>
      </div>
      {/* Requirement Detail Modal */}
      {selectedRequirement && ()
        <div style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
}}>
          <div style={{
            background: themeStyles.background,
            border: `1px solid ${themeStyles.border}`}
},
  borderRadius: '8px',
            padding: '24px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto';
  }}>
            <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '16px',
}}>
              <h3 style={{
  margin: 0,
  fontSize: '18px',
  fontWeight: 600,
  color: themeStyles.text,
}}>
                Requirement Details
              </h3>
              <button
                onClick={() => setSelectedRequirement(null)}
                style={{
  background: 'transparent',
  border: 'none',
  color: themeStyles.textSecondary,
  fontSize: '20px',
  cursor: 'pointer',
}}
              >
                ×
              </button>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{
  margin: '0 0 8px 0',
  fontSize: '16px',
  color: themeStyles.text,
}}>
                {selectedRequirement.requirement}
              </h4>
              <p style={{
  margin: '0 0 12px 0',
  color: themeStyles.textSecondary,
  lineHeight: 1.5,
}}>
                {selectedRequirement.description}
              </p>
              <div style={{ marginBottom: '16px' }}>
                <strong>Business Impact:</strong> {selectedRequirement.businessImpact}
              </div>
              {selectedRequirement.evidence.length > 0 && ()
                <div style={{ marginBottom: '16px' }}>
                  <h5 style={{ margin: '0 0 8px 0', color: themeStyles.text }}>Evidence ({selectedRequirement.evidence.length})</h5>
                  {selectedRequirement.evidence.map(evidence => ()
                    <div key={evidence.id} style={{
  padding: '8px',
  background: themeStyles.surface,
  borderRadius: '4px',
  marginBottom: '4px',
  fontSize: '12px',
}}>
                      <strong>{evidence.title}</strong> - {evidence.type}
                      <div style={{ color: themeStyles.textSecondary }}>
                        Last updated: {evidence.lastUpdated.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedRequirement.findings.length > 0 && ()
                <div>
                  <h5 style={{ margin: '0 0 8px 0', color: themeStyles.text }}>Findings ({selectedRequirement.findings.length})</h5>
                  {selectedRequirement.findings.map(finding => ()
                    <div key={finding.id} style={{
                      padding: '12px',
                      background: themeStyles.surface,
                      borderLeft: `4px solid ${finding.severity === 'critical' ? themeStyles.critical : }
                        finding.severity === 'high' ? themeStyles.error :
                          finding.severity === 'medium' ? themeStyles.warning : themeStyles.success}`,
                      borderRadius: '4px',
                      marginBottom: '8px',
                      fontSize: '12px';
  }}>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{finding.title}</div>
                      <div style={{ color: themeStyles.textSecondary, marginBottom: '8px' }}>
                        {finding.description}
                      </div>
                      <div style={{ color: themeStyles.primary }}>
                        <strong>Recommendation:</strong> {finding.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {selectedRequirement.status !== ComplianceStatus.COMPLIANT && ()
                <button
                  onClick={() => {
                    onRequirementUpdate?.(selectedRequirement.id, ComplianceStatus.COMPLIANT);
                    setSelectedRequirement(null);
                  }}
                  style={{
  background: themeStyles.success,
  color: themeStyles.background,
  border: 'none',
  borderRadius: '4px',
  padding: '8px 16px',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
}}
                >
                  Mark Compliant
                </button>
              )}
              <button
                onClick={() => {
                  onRequirementUpdate?.(selectedRequirement.id, ComplianceStatus.IN_REMEDIATION);
                  setSelectedRequirement(null);
                }}
                style={{
  background: themeStyles.primary,
  color: themeStyles.background,
  border: 'none',
  borderRadius: '4px',
  padding: '8px 16px',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
}}
              >
                Start Remediation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceSecurityDashboard;