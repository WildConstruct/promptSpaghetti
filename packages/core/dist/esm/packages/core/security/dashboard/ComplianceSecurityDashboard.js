import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { useState, useEffect, useCallback, useMemo } from 'react';
import { DashboardTheme } from './SecurityDashboardFramework';
export var ComplianceFramework;
(function (ComplianceFramework) {
    ComplianceFramework["SOC2_TYPE1"] = "soc2_type1";
    ComplianceFramework["SOC2_TYPE2"] = "soc2_type2";
    ComplianceFramework["ISO27001"] = "iso27001";
    ComplianceFramework["NIST_CSF"] = "nist_csf";
    ComplianceFramework["GDPR"] = "gdpr";
    ComplianceFramework["CCPA"] = "ccpa";
    ComplianceFramework["HIPAA"] = "hipaa";
    ComplianceFramework["PCI_DSS"] = "pci_dss";
    ComplianceFramework["FEDRAMP"] = "fedramp";
    ComplianceFramework[ComplianceFramework["export"] = void 0] = "export";
    ComplianceFramework[ComplianceFramework["enum"] = void 0] = "enum";
    ComplianceFramework[ComplianceFramework["ComplianceStatus"] = void 0] = "ComplianceStatus";
})(ComplianceFramework || (ComplianceFramework = {}));
{
    COMPLIANT = 'compliant',
        PARTIALLY_COMPLIANT = 'partially_compliant',
        NON_COMPLIANT = 'non_compliant',
        NOT_ASSESSED = 'not_assessed',
        IN_REMEDIATION = 'in_remediation';
}
 > ;
riskProfile: {
    high: number;
    medium: number;
    low: number;
    accepted: number;
}
;
auditStatus: {
    upcoming: AuditCycle;
    active: AuditCycle;
    recentlyCompleted: AuditCycle;
}
;
evidenceHealth: {
    current: number;
    outdated: number;
    missing: number;
    expiringWithin30Days: number;
}
;
export const ComplianceSecurityDashboard = ({
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
});
{
    const [selectedFramework, setSelectedFramework] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedRequirement, setSelectedRequirement] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [reportGenerating, setReportGenerating] = useState(null);
    // Theme configuration
    const themeStyles = useMemo(() => {
        const themes = {
            light: {
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
            dark: {
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
            cinema: {
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
            },
            return: themes[theme] || themes.light
        }, [theme];
    });
    // Auto-refresh
    useEffect(() => {
        if (refreshInterval > 0) {
            const interval = setInterval(() => {
                setLastUpdate(new Date());
            }, refreshInterval * 60 * 1000);
            return () => clearInterval(interval);
        }
        [refreshInterval];
    });
    // Filter requirements
    const filteredRequirements = useMemo(() => {
        return requirements.filter(req => { });
        const frameworkMatch = selectedFramework === 'all' || req.framework === selectedFramework;
        const statusMatch = selectedStatus === 'all' || req.status === selectedStatus;
        return frameworkMatch && statusMatch;
    }).sort((a, b) => {
        // Sort by risk level, then status
        const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
            return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
            return a.requirement.localeCompare(b.requirement);
        }
    });
}
[requirements, selectedFramework, selectedStatus];
;
// Get status color
const getStatusColor = useCallback((status) => {
    switch (status) {
        case ComplianceStatus.COMPLIANT: return themeStyles.success;
        case ComplianceStatus.PARTIALLY_COMPLIANT: return themeStyles.warning;
        case ComplianceStatus.NON_COMPLIANT: return themeStyles.error;
        case ComplianceStatus.IN_REMEDIATION: return themeStyles.primary;
        case ComplianceStatus.NOT_ASSESSED: return themeStyles.textSecondary;
        default: return themeStyles.textSecondary;
    }
    [themeStyles];
});
// Get framework display name
const getFrameworkName = useCallback((framework) => {
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
const handleGenerateReport = useCallback(async (framework, format) => {
    setReportGenerating(`${framework}-${format}`);
});
try {
    await onGenerateReport?.(framework, format);
}
finally {
    setReportGenerating(null);
}
[onGenerateReport];
;
// Render compliance score gauge
const renderComplianceGauge = (framework, score) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const getScoreColor = (score) => {
        if (score >= 90)
            return themeStyles.success;
        if (score >= 75)
            return themeStyles.warning;
        return themeStyles.error;
    };
    return;
    _jsx("div", { style: {
            background: themeStyles.surface,
            border: `1px solid ${themeStyles.border}`
        }, "borderRadius:": true });
    '8px',
        padding;
    '16px',
        textAlign;
    'center';
};
 >
    (_jsx("h4", { style: {
            margin: '0 0 12px 0',
            fontSize: '12px',
            fontWeight: 600,
            color: themeStyles.textSecondary,
            textTransform: 'uppercase',
        }, children: getFrameworkName(framework) })
        ,
            _jsxs("div", { style: { position: 'relative', display: 'inline-block', marginBottom: '8px' }, children: [_jsxs("svg", { width: "90", height: "90", style: { transform: 'rotate(-90deg)' }, children: [_jsx("circle", { cx: "45", cy: "45", r: radius, stroke: themeStyles.border, strokeWidth: "6", fill: "none" }), _jsx("circle", { cx: "45", cy: "45", r: radius, stroke: getScoreColor(score), strokeWidth: "6", fill: "none", strokeDasharray: circumference, strokeDashoffset: strokeDashoffset, strokeLinecap: "round", style: { transition: 'stroke-dashoffset 0.5s ease' } })] }), _jsxs("div", { style: {
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '18px',
                            fontWeight: 700,
                            color: getScoreColor(score),
                        }, children: [score, "%"] })] })
                ,
                    _jsxs("div", { style: {
                            fontSize: '11px',
                            color: themeStyles.textSecondary,
                        }, children: [metrics.byFramework[framework]?.compliantRequirements || 0, "/", metrics.byFramework[framework]?.totalRequirements || 0, " compliant"] }));
{
    metrics.byFramework[framework]?.criticalGaps > 0 && ()
        < div;
    style = {};
    {
        marginTop: '4px',
            fontSize;
        '10px',
            color;
        themeStyles.error,
            fontWeight;
        500,
        ;
    }
}
 >
    { metrics, : .byFramework[framework].criticalGaps };
critical;
gaps;
div >
;
div >
;
;
;
// Render requirement item
const renderRequirementItem = (requirement) => ();
;
_jsx("div", { onClick: () => setSelectedRequirement(requirement), style: {
        background: themeStyles.surface,
        border: `1px solid ${themeStyles.border}`
    }, "borderLeft:": true }, requirement.id);
`4px solid ${getStatusColor(requirement.status)}`;
borderRadius: '6px',
    padding;
'16px',
    marginBottom;
'12px',
    cursor;
'pointer',
    transition;
'all 0.2s ease';
    >
        _jsxs("div", { style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px',
            }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: {
                                fontSize: '14px',
                                fontWeight: 600,
                                color: themeStyles.text,
                                marginBottom: '4px',
                            }, children: requirement.requirement }), _jsx("div", { style: {
                                fontSize: '12px',
                                color: themeStyles.textSecondary,
                                marginBottom: '8px',
                            }, children: requirement.description })] }), _jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("span", { style: {
                                fontSize: '10px',
                                padding: '2px 6px',
                                background: `${getStatusColor(requirement.status)}20`
                            } }), ", color: getStatusColor(requirement.status), borderRadius: '4px', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>", requirement.status.replace('_', ' ')] }), requirement.riskLevel === 'critical' && ()
                    < span, " style=", {
                    fontSize: '10px',
                    padding: '2px 6px',
                    background: `${themeStyles.critical}20`
                }, ", color: themeStyles.critical, borderRadius: '4px', fontWeight: 600; }}> CRITICAL"] });
div >
;
div >
    _jsxs("div", { style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: themeStyles.textSecondary,
        }, children: [_jsxs("div", { style: { display: 'flex', gap: '12px' }, children: [_jsx("span", { children: getFrameworkName(requirement.framework) }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Owner: ", requirement.responsible] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Evidence: ", requirement.evidence.length] })] }), _jsxs("div", { children: ["Last assessed: ", requirement.lastAssessment.toLocaleDateString()] })] });
{
    requirement.findings.length > 0 && (_jsxs("div", { style: {
            marginTop: '8px',
            padding: '8px',
            background: themeStyles.background,
            borderRadius: '4px',
            fontSize: '11px',
        }, children: [_jsxs("span", { style: { color: themeStyles.error, fontWeight: 500 }, children: [requirement.findings.length, " finding(s):"] }), _jsxs("span", { style: { color: themeStyles.textSecondary, marginLeft: '8px' }, children: [requirement.findings.filter(f => f.severity === 'critical').length, " critical,", requirement.findings.filter(f => f.severity === 'high').length, " high priority"] })] }));
}
div >
;
;
return;
_jsxs("div", { style: {
        background: themeStyles.background,
        color: themeStyles.text,
        minHeight: '100vh',
        fontFamily: 'Inter, system-ui, sans-serif',
    }, children: [_jsx("div", { style: {
                background: themeStyles.surface,
                borderBottom: `1px solid ${themeStyles.border}`
            } }), ", padding: '20px 24px'; }}>", _jsxs("div", { style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '1400px',
                margin: '0 auto',
            }, children: [_jsxs("div", { children: [_jsx("h1", { style: {
                                margin: '0 0 4px 0',
                                fontSize: '24px',
                                fontWeight: 700,
                                color: themeStyles.text,
                            }, children: "\uD83D\uDCCB Compliance Dashboard" }), _jsx("p", { style: {
                                margin: '0',
                                fontSize: '16px',
                                color: themeStyles.textSecondary,
                            }, children: "Regulatory compliance monitoring and audit management" })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '16px' }, children: [_jsxs("div", { style: {
                                fontSize: '12px',
                                color: themeStyles.textSecondary,
                            }, children: ["Last updated: ", lastUpdate.toLocaleTimeString()] }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [exportFormats.map(format => ()
                                    < button, key = { format }, onClick = {}()), " => selectedFramework !== 'all' && handleGenerateReport(selectedFramework, format)} disabled=", selectedFramework === 'all' || reportGenerating !== null, "style=", {
                                    background: themeStyles.primary,
                                    color: themeStyles.background,
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    cursor: selectedFramework === 'all' ? 'not-allowed' : 'pointer',
                                    opacity: selectedFramework === 'all' ? 0.5 : 1,
                                }, ">", reportGenerating === `${selectedFramework}-${format}` ? '⏳' : '📊', " Export ", format.toUpperCase()] }), "))}"] })] })] });
div >
    _jsxs("div", { style: { padding: '24px', maxWidth: '1400px', margin: '0 auto' }, children: [_jsx("div", { style: {
                    background: themeStyles.surface,
                    border: `1px solid ${themeStyles.border}`
                } }), ", borderRadius: '8px', padding: '24px', marginBottom: '24px', textAlign: 'center' }}>", _jsx("h2", { style: {
                    margin: '0 0 16px 0',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: themeStyles.text,
                }, children: "Overall Compliance Score" }), _jsxs("div", { style: {
                    fontSize: '48px',
                    fontWeight: 800,
                    color: metrics.overallScore >= 90 ? themeStyles.success : ,
                    metrics, : .overallScore >= 75 ? themeStyles.warning : themeStyles.error,
                    marginBottom: '8px',
                }, children: [metrics.overallScore, "%"] }), _jsxs("div", { style: {
                    fontSize: '14px',
                    color: themeStyles.textSecondary,
                }, children: ["Based on ", frameworks.length, " compliance frameworks"] })] });
{ /* Framework Compliance Scores */ }
_jsxs("div", { style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
    }, children: [frameworks.map(framework => ), "renderComplianceGauge(framework, metrics.byFramework[framework]?.score || 0) )}"] });
{ /* Risk Profile and Evidence Health */ }
_jsxs("div", { style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: '16px',
        marginBottom: '24px',
    }, children: [_jsx("div", { style: {
                background: themeStyles.surface,
                border: `1px solid ${themeStyles.border}`
            } }), ", borderRadius: '8px', padding: '16px' }}>", _jsx("h4", { style: {
                margin: '0 0 8px 0',
                fontSize: '12px',
                color: themeStyles.textSecondary,
                textTransform: 'uppercase',
            }, children: "High Risk Items" }), _jsx("div", { style: {
                fontSize: '28px',
                fontWeight: 700,
                color: metrics.riskProfile.high > 0 ? themeStyles.error : themeStyles.success,
            }, children: metrics.riskProfile.high })] })
    ,
        _jsx("div", { style: {
                background: themeStyles.surface,
                border: `1px solid ${themeStyles.border}`
            }, "borderRadius:": true });
'8px',
    padding;
'16px';
 >
    (_jsx("h4", { style: {
            margin: '0 0 8px 0',
            fontSize: '12px',
            color: themeStyles.textSecondary,
            textTransform: 'uppercase',
        }, children: "Medium Risk Items" })
        ,
            _jsx("div", { style: {
                    fontSize: '28px',
                    fontWeight: 700,
                    color: themeStyles.warning,
                }, children: metrics.riskProfile.medium }));
div >
    _jsx("div", { style: {
            background: themeStyles.surface,
            border: `1px solid ${themeStyles.border}`
        }, "borderRadius:": true });
'8px',
    padding;
'16px';
 >
    (_jsx("h4", { style: {
            margin: '0 0 8px 0',
            fontSize: '12px',
            color: themeStyles.textSecondary,
            textTransform: 'uppercase',
        }, children: "Evidence Missing" })
        ,
            _jsx("div", { style: {
                    fontSize: '28px',
                    fontWeight: 700,
                    color: metrics.evidenceHealth.missing > 0 ? themeStyles.error : themeStyles.success,
                }, children: metrics.evidenceHealth.missing }));
div >
    _jsx("div", { style: {
            background: themeStyles.surface,
            border: `1px solid ${themeStyles.border}`
        }, "borderRadius:": true });
'8px',
    padding;
'16px';
 >
    (_jsx("h4", { style: {
            margin: '0 0 8px 0',
            fontSize: '12px',
            color: themeStyles.textSecondary,
            textTransform: 'uppercase',
        }, children: "Expiring Soon" })
        ,
            _jsx("div", { style: {
                    fontSize: '28px',
                    fontWeight: 700,
                    color: metrics.evidenceHealth.expiringWithin30Days > 0 ? themeStyles.warning : themeStyles.success,
                }, children: metrics.evidenceHealth.expiringWithin30Days }));
div >
;
div >
    { /* Filters */}
    < div;
style = {};
{
    display: 'flex',
        gap;
    '16px',
        marginBottom;
    '16px',
        alignItems;
    'center',
    ;
}
 >
    _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("label", { style: {
                    fontSize: '12px',
                    fontWeight: 600,
                    color: themeStyles.textSecondary,
                }, children: "Framework:" }), _jsx("select", { value: selectedFramework, onChange: (e) => setSelectedFramework(e.target.value), style: {
                    background: themeStyles.surface,
                    border: `1px solid ${themeStyles.border}`
                } }), ", borderRadius: '4px', padding: '6px 8px', color: themeStyles.text, fontSize: '12px' }} >", _jsx("option", { value: "all", children: "All Frameworks" }), frameworks.map(framework => ()
                < option, key = { framework }, value = { framework } >
                {})] });
select >
;
div >
    _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("label", { style: {
                    fontSize: '12px',
                    fontWeight: 600,
                    color: themeStyles.textSecondary,
                }, children: "Status:" }), _jsx("select", { value: selectedStatus, onChange: (e) => setSelectedStatus(e.target.value), style: {
                    background: themeStyles.surface,
                    border: `1px solid ${themeStyles.border}`
                } }), ", borderRadius: '4px', padding: '6px 8px', color: themeStyles.text, fontSize: '12px' }} >", _jsx("option", { value: "all", children: "All Statuses" }), Object.values(ComplianceStatus).map(status => ()
                < option, key = { status }, value = { status } >
                { status, : .replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) })] });
select >
;
div >
    _jsxs("div", { style: {
            fontSize: '12px',
            color: themeStyles.textSecondary,
            marginLeft: 'auto',
        }, children: ["Showing ", filteredRequirements.length, " of ", requirements.length, " requirements"] });
div >
    { /* Requirements List */}
    < div;
style = {};
{
    background: themeStyles.surface,
        border;
    `1px solid ${themeStyles.border}`;
}
borderRadius: '8px',
    padding;
'20px';
 >
    _jsx("h3", { style: {
            margin: '0 0 16px 0',
            fontSize: '16px',
            fontWeight: 600,
            color: themeStyles.text,
        }, children: "Compliance Requirements" });
{
    filteredRequirements.length === 0 ? ()
        < div : ;
    style = {};
    {
        textAlign: 'center',
            padding;
        '40px',
            color;
        themeStyles.textSecondary,
        ;
    }
}
 >
    (_jsx("div", { style: { fontSize: '48px', marginBottom: '16px' }, children: "\u2705" })
        ,
            _jsx("div", { children: "No requirements match the current filters" }));
div >
;
()
    < div;
style = {};
{
    maxHeight: '600px', overflowY;
    'auto';
}
 >
    { filteredRequirements, : .map(renderRequirementItem) };
div >
;
div >
;
div >
    { /* Requirement Detail Modal */};
{
    selectedRequirement && ()
        < div;
    style = {};
    {
        position: 'fixed',
            top;
        0,
            left;
        0,
            right;
        0,
            bottom;
        0,
            background;
        'rgba(0, 0, 0, 0.8)',
            display;
        'flex',
            alignItems;
        'center',
            justifyContent;
        'center',
            zIndex;
        1000,
        ;
    }
}
 >
    _jsx("div", { style: {
            background: themeStyles.background,
            border: `1px solid ${themeStyles.border}`
        }, "borderRadius:": true });
'8px',
    padding;
'24px',
    maxWidth;
'800px',
    width;
'90%',
    maxHeight;
'80vh',
    overflowY;
'auto';
 >
    (_jsxs("div", { style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px',
        }, children: [_jsx("h3", { style: {
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: 600,
                    color: themeStyles.text,
                }, children: "Requirement Details" }), _jsx("button", { onClick: () => setSelectedRequirement(null), style: {
                    background: 'transparent',
                    border: 'none',
                    color: themeStyles.textSecondary,
                    fontSize: '20px',
                    cursor: 'pointer',
                }, children: "\u00D7" })] })
        ,
            _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("h4", { style: {
                            margin: '0 0 8px 0',
                            fontSize: '16px',
                            color: themeStyles.text,
                        }, children: selectedRequirement.requirement }), _jsx("p", { style: {
                            margin: '0 0 12px 0',
                            color: themeStyles.textSecondary,
                            lineHeight: 1.5,
                        }, children: selectedRequirement.description }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("strong", { children: "Business Impact:" }), " ", selectedRequirement.businessImpact] }), selectedRequirement.evidence.length > 0 && ()
                        < div, " style=", { marginBottom: '16px' }, ">", _jsxs("h5", { style: { margin: '0 0 8px 0', color: themeStyles.text }, children: ["Evidence (", selectedRequirement.evidence.length, ")"] }), selectedRequirement.evidence.map(evidence => ()
                        < div, key = { evidence, : .id }, style = {}, {
                        padding: '8px',
                        background: themeStyles.surface,
                        borderRadius: '4px',
                        marginBottom: '4px',
                        fontSize: '12px',
                    }), ">", _jsx("strong", { children: evidence.title }), " - ", evidence.type, _jsxs("div", { style: { color: themeStyles.textSecondary }, children: ["Last updated: ", evidence.lastUpdated.toLocaleDateString()] })] }));
div >
;
{
    selectedRequirement.findings.length > 0 && ()
        < div >
        _jsxs("h5", { style: { margin: '0 0 8px 0', color: themeStyles.text }, children: ["Findings (", selectedRequirement.findings.length, ")"] });
    {
        selectedRequirement.findings.map(finding => ()
            < div, key = { finding, : .id }, style = {}, {
            padding: '12px',
            background: themeStyles.surface,
            borderLeft: `4px solid ${finding.severity === 'critical' ? themeStyles.critical : }
                        finding.severity === 'high' ? themeStyles.error :
                          finding.severity === 'medium' ? themeStyles.warning : themeStyles.success}`,
            borderRadius: '4px',
            marginBottom: '8px',
            fontSize: '12px'
        });
    }
     >
        (_jsx("div", { style: { fontWeight: 600, marginBottom: '4px' }, children: finding.title })
            ,
                _jsx("div", { style: { color: themeStyles.textSecondary, marginBottom: '8px' }, children: finding.description })
                    ,
                        _jsxs("div", { style: { color: themeStyles.primary }, children: [_jsx("strong", { children: "Recommendation:" }), " ", finding.recommendation] }));
    div >
    ;
}
div >
;
div >
    _jsxs("div", { style: { display: 'flex', gap: '12px' }, children: [selectedRequirement.status !== ComplianceStatus.COMPLIANT && ()
                < button, "onClick=", () => {
                onRequirementUpdate?.(selectedRequirement.id, ComplianceStatus.COMPLIANT);
                setSelectedRequirement(null);
            }, "style=", {
                background: themeStyles.success,
                color: themeStyles.background,
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
            }, "> Mark Compliant"] });
_jsx("button", { onClick: () => {
        onRequirementUpdate?.(selectedRequirement.id, ComplianceStatus.IN_REMEDIATION);
        setSelectedRequirement(null);
    }, style: {
        background: themeStyles.primary,
        color: themeStyles.background,
        border: 'none',
        borderRadius: '4px',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
    }, children: "Start Remediation" });
div >
;
div >
;
div >
;
div >
;
;
;
export default ComplianceSecurityDashboard;
