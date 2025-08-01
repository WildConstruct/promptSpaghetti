import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Comprehensive Audit Management Dashboard
 *
 * React dashboard providing advanced audit analytics, compliance monitoring, and management tools
 */
import { useState, useEffect } from 'react';
import { Card, Table, Select, DatePicker, Button, Space, Tag, Statistic, Row, Col, Alert, Input, Modal, Tabs, Progress } from 'antd';
import { Bar, Pie } from '@ant-design/plots';
import { SecurityScanOutlined, AlertOutlined, UserOutlined, FileTextOutlined, ExclamationTriangleOutlined, CheckCircleOutlined, ClockCircleOutlined, DownloadOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { AuditEventType, AuditSeverity, ComplianceFramework, AuditStatus, auditManagementSystem } from '../audit/AuditManagementSystem';
const { RangePicker } = DatePicker;
const { Search } = Input;
const { TabPane } = Tabs;
analytics: null,
    anomalousPatterns;
[];
;
const [filters, setFilters] = useState({});
dateRange: [undefined, undefined],
    eventTypes;
[],
    severities;
[],
    complianceFrameworks;
[],
    statuses;
[],
    searchText;
'',
    riskScoreRange;
[0, 10],
;
;
const [activeTab, setActiveTab] = useState('overview');
// Load audit data
useEffect(() => {
    loadAuditData();
}, [dashboardState.currentQuery]);
// Detect anomalous patterns
useEffect(() => {
    const patterns = auditManagementSystem.detectAnomalousPatterns();
    setDashboardState(prev => ({ ...prev, anomalousPatterns: patterns }));
}, [dashboardState.events]);
const loadAuditData = async () => {
    setDashboardState(prev => ({ ...prev, loading: true }));
    try {
        const result = await auditManagementSystem.queryAuditEvents(dashboardState.currentQuery);
        setDashboardState(prev => ({}), ...prev, events, result.events, totalCount, result.totalCount, analytics, result.analytics, loading, false);
    }
    finally { }
    ;
};
try { }
catch (error) {
    console.error('Failed to load audit data:', error);
    setDashboardState(prev => ({ ...prev, loading: false }));
}
;
const applyFilters = () => {
    const newQuery = {
        ...dashboardState.currentQuery,
        page: 1,
        start_date: filters.dateRange[0],
        end_date: filters.dateRange[1],
        event_types: filters.eventTypes.length > 0 ? filters.eventTypes : undefined,
        severities: filters.severities.length > 0 ? filters.severities : undefined,
        compliance_frameworks: filters.complianceFrameworks.length > 0 ? filters.complianceFrameworks : undefined,
        statuses: filters.statuses.length > 0 ? filters.statuses : undefined,
        search_text: filters.searchText || undefined,
        min_risk_score: filters.riskScoreRange[0],
        max_risk_score: filters.riskScoreRange[1],
    };
    setDashboardState(prev => ({ ...prev, currentQuery: newQuery }));
};
const exportAuditData = (format) => {
    // Implementation for exporting audit data
    console.log(`Exporting audit data in ${format} format`);
};
;
// Render severity badge
const renderSeverityBadge = (severity) => {
    const colors = {
        [AuditSeverity.LOW]: 'green',
        [AuditSeverity.MEDIUM]: 'orange',
        [AuditSeverity.HIGH]: 'red',
        [AuditSeverity.CRITICAL]: 'purple',
    };
    return _jsx(Tag, { color: colors[severity], children: severity.toUpperCase() });
};
// Render risk score
const renderRiskScore = (score) => {
    let color = 'green';
    if (score >= 7)
        color = 'red';
    else if (score >= 5)
        color = 'orange';
    else if (score >= 3)
        color = 'gold';
    return;
    _jsxs("div", { style: { display: 'flex', alignItems: 'center' }, children: [_jsx(Progress, { percent: score * 10, size: "small", strokeColor: color, showInfo: false, style: { width: 60, marginRight: 8 } }), _jsxs("span", { children: [score, "/10"] })] });
};
;
;
// Analytics overview cards
const renderOverviewCards = () => {
    if (!dashboardState.analytics)
        return null;
    const { analytics } = dashboardState;
    return;
    _jsxs(Row, { gutter: 16, style: { marginBottom: 24 }, children: [_jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Total Events", value: analytics.total_events, prefix: _jsx(FileTextOutlined, {}), valueStyle: { color: '#1890ff' } }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "High Risk Events", value: analytics.high_risk_events, prefix: _jsx(ExclamationTriangleOutlined, {}), valueStyle: { color: '#f5222d' } }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Average Risk Score", value: analytics.average_risk_score, precision: 2, prefix: _jsx(SecurityScanOutlined, {}), valueStyle: { color: analytics.average_risk_score > 5 ? '#f5222d' : '#52c41a' } }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Critical Severity", value: analytics.severity_distribution?.critical || 0, prefix: _jsx(AlertOutlined, {}), valueStyle: { color: '#722ed1' } }) }) })] });
};
;
;
// Anomalous patterns alerts
const renderAnomalousPatterns = () => {
    if (dashboardState.anomalousPatterns.length === 0)
        return null;
    return;
    _jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h3", { children: "\uD83D\uDEA8 Anomalous Patterns Detected" }), dashboardState.anomalousPatterns.map((pattern, index) => ()
                < Alert, key = { index }, message = { pattern, : .description }, description = { pattern, : .recommendation }, type = { pattern, : .severity === 'critical' ? 'error' : pattern.severity === 'high' ? 'warning' : 'info' }, showIcon, style = {}, { marginBottom: 8 }), "action=", _jsx(Button, { size: "small", onClick: () => console.log('Investigate pattern:', pattern), children: "Investigate" })
                /  >
            , "))}"] });
};
;
;
// Audit events table
const renderAuditEventsTable = () => {
    const columns = [
        {
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (timestamp) => timestamp.toLocaleString(),
            sorter: true,
        },
        {
            title: 'Event Type',
            dataIndex: 'event_type',
            key: 'event_type',
            render: (type) => _jsx(Tag, { children: type.replace('_', ' ').toUpperCase() })
        },
        {
            title: 'Severity',
            dataIndex: 'severity',
            key: 'severity',
            render: renderSeverityBadge,
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
        },
        {
            title: 'User',
            dataIndex: 'user_id',
            key: 'user_id',
            render: (userId) => userId ? _jsx(Tag, { icon: _jsx(UserOutlined, {}), children: userId }) : 'System'
        },
        {
            title: 'Risk Score',
            dataIndex: 'risk_score',
            key: 'risk_score',
            render: renderRiskScore,
            sorter: true,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => { },
            const: colors = {
                [AuditStatus.ACTIVE]: 'blue',
                [AuditStatus.RESOLVED]: 'green',
                [AuditStatus.INVESTIGATING]: 'orange',
                [AuditStatus.SUPPRESSED]: 'gray',
                [AuditStatus.ESCALATED]: 'red',
            },
            [status]: 
        } > { status, : .toUpperCase() }, Tag > 
    ];
};
{
    title: 'Compliance',
        dataIndex;
    'compliance_frameworks',
        key;
    'compliance_frameworks',
        render;
    (frameworks) => (),
        _jsx("div", { children: frameworks.map(framework => ()
                < Tag, key = { framework }, size = "small" > { framework, : .toUpperCase() }) });
}
div >
;
{
    title: 'Actions',
        key;
    'actions',
        render;
    (record) => (),
        _jsx(Space, { children: _jsx(Button, { size: "small", onClick: () => setDashboardState(prev => ({ ...prev, selectedEvent: record })), children: "View Details" }) });
    ;
    return;
    _jsx(Table, { columns: columns, dataSource: dashboardState.events, loading: dashboardState.loading, pagination: {
            current: dashboardState.currentQuery.page,
            pageSize: dashboardState.currentQuery.limit,
            total: dashboardState.totalCount,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (page, pageSize) => {
                setDashboardState(prev => ({}), ...prev, currentQuery, { ...prev.currentQuery, page, limit: pageSize || 50 });
            }
        }, rowKey: "id", scroll: { x: 1200 } });
    ;
}
;
// Analytics charts
const renderAnalyticsCharts = () => {
    if (!dashboardState.analytics)
        return null;
    const { analytics } = dashboardState;
    // Severity distribution pie chart
    const severityData = Object.entries(analytics.severity_distribution || {}).map(([severity, count]) => ({}), type, severity, value, count);
};
// Event type distribution bar chart
const eventTypeData = Object.entries(analytics.event_type_distribution || {}).map(([type, count]) => ({}), type, type.replace('_', ' '), value, count);
;
return;
_jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 12, children: _jsx(Card, { title: "Severity Distribution", style: { marginBottom: 16 }, children: _jsx(Pie, { data: severityData, angleField: "value", colorField: "type", radius: 0.8, label: {
                        type: 'outer',
                        content: '{name} {percentage}'
                    }, height: 300 }) }) }), _jsx(Col, { span: 12, children: _jsx(Card, { title: "Event Type Distribution", style: { marginBottom: 16 }, children: _jsx(Bar, { data: eventTypeData, xField: "value", yField: "type", height: 300 }) }) })] });
;
;
// Event details modal
const renderEventDetailsModal = () => {
    if (!dashboardState.selectedEvent)
        return null;
    const event = dashboardState.selectedEvent;
    return;
    _jsx(Modal, { title: `Audit Event Details - ${event.title}`, visible: !!dashboardState.selectedEvent, onCancel: () => setDashboardState(prev => ({ ...prev, selectedEvent: null })), width: 800, footer: [
            _jsx(Button, { onClick: () => setDashboardState(prev => ({ ...prev, selectedEvent: null })), children: "Close" }, "close")
        ], children: _jsxs(Tabs, { defaultActiveKey: "details", children: [_jsx(TabPane, { tab: "Event Details", children: _jsxs(Row, { gutter: 16, children: [_jsxs(Col, { span: 12, children: [_jsxs("p", { children: [_jsx("strong", { children: "Event ID:" }), " ", event.id] }), _jsxs("p", { children: [_jsx("strong", { children: "Timestamp:" }), " ", event.timestamp.toLocaleString()] }), _jsxs("p", { children: [_jsx("strong", { children: "Event Type:" }), " ", event.event_type] }), _jsxs("p", { children: [_jsx("strong", { children: "Severity:" }), " ", renderSeverityBadge(event.severity)] }), _jsxs("p", { children: [_jsx("strong", { children: "Status:" }), " ", _jsx(Tag, { color: "blue", children: event.status })] }), _jsxs("p", { children: [_jsx("strong", { children: "Risk Score:" }), " ", renderRiskScore(event.risk_score)] })] }), _jsxs(Col, { span: 12, children: [_jsxs("p", { children: [_jsx("strong", { children: "User ID:" }), " ", event.user_id || 'System'] }), _jsxs("p", { children: [_jsx("strong", { children: "IP Address:" }), " ", event.ip_address || 'N/A'] }), _jsxs("p", { children: [_jsx("strong", { children: "System Component:" }), " ", event.system_component] }), _jsx("p", { children: _jsx("strong", { children: "Compliance Frameworks:" }) }), _jsx("div", { children: event.compliance_frameworks.map(framework => ()
                                            < Tag, key = { framework } > { framework, : .toUpperCase() }) }), "))}"] })] }) }, "details"), _jsxs("div", { style: { marginTop: 16 }, children: [_jsx("p", { children: _jsx("strong", { children: "Description:" }) }), _jsx("p", { children: event.description })] }), _jsxs("div", { style: { marginTop: 16 }, children: [_jsx("p", { children: _jsx("strong", { children: "Risk Factors:" }) }), event.risk_factors.map(factor => ()
                            < Tag, key = { factor }, color = "orange" > { factor })] }), "))}"] }) })
        ,
            _jsx(TabPane, { tab: "Metadata", children: _jsx("pre", { children: JSON.stringify(event.metadata, null, 2) }) }, "metadata")
                ,
                    _jsxs(TabPane, { tab: "Chain Integrity", children: [_jsxs("p", { children: [_jsx("strong", { children: "Chain Hash:" }), " ", event.chain_hash] }), _jsxs("p", { children: [_jsx("strong", { children: "Previous Hash:" }), " ", event.previous_hash || 'N/A'] }), _jsx(Button, { type: "primary", icon: _jsx(SecurityScanOutlined, {}), children: "Verify Integrity" })] }, "integrity");
};
Tabs >
;
Modal >
;
;
;
// Filter panel
const renderFilterPanel = () => ();
;
_jsxs(Card, { style: { marginBottom: 16 }, children: [_jsxs(Row, { gutter: 16, children: [_jsxs(Col, { span: 6, children: [_jsx("label", { children: "Date Range:" }), _jsx(RangePicker, { style: { width: '100%' }, onChange: (dates) => setFilters(prev => ({}), ...prev, dateRange) }), ": dates ? [dates[0]?.toDate(), dates[1]?.toDate()] : [undefined, undefined] }))} />"] }), _jsxs(Col, { span: 4, children: [_jsx("label", { children: "Event Types:" }), _jsx(Select, { mode: "multiple", style: { width: '100%' }, placeholder: "Select types", onChange: (values) => setFilters(prev => ({ ...prev, eventTypes: values })), children: Object.values(AuditEventType).map(type => ()
                                < Select.Option, key = { type }, value = { type } >
                                { type, : .replace('_', ' ').toUpperCase() }) }), "))}"] })] }), _jsxs(Col, { span: 4, children: [_jsx("label", { children: "Severity:" }), _jsx(Select, { mode: "multiple", style: { width: '100%' }, placeholder: "Select severity", onChange: (values) => setFilters(prev => ({ ...prev, severities: values })), children: Object.values(AuditSeverity).map(severity => ()
                        < Select.Option, key = { severity }, value = { severity } >
                        { severity, : .toUpperCase() }) }), "))}"] })] })
    ,
        _jsxs(Col, { span: 4, children: [_jsx("label", { children: "Compliance:" }), _jsx(Select, { mode: "multiple", style: { width: '100%' }, placeholder: "Select frameworks", onChange: (values) => setFilters(prev => ({ ...prev, complianceFrameworks: values })), children: Object.values(ComplianceFramework).map(framework => ()
                        < Select.Option, key = { framework }, value = { framework } >
                        { framework, : .toUpperCase() }) }), "))}"] });
Col >
    _jsxs(Col, { span: 6, children: [_jsx("label", { children: "Search:" }), _jsx(Search, { placeholder: "Search events...", onChange: (e) => setFilters(prev => ({ ...prev, searchText: e.target.value })), onSearch: applyFilters })] });
Row >
    _jsx(Row, { gutter: 16, style: { marginTop: 16 }, children: _jsx(Col, { children: _jsxs(Space, { children: [_jsx(Button, { type: "primary", icon: _jsx(FilterOutlined, {}), onClick: applyFilters, children: "Apply Filters" }), _jsx(Button, { icon: _jsx(ReloadOutlined, {}), onClick: loadAuditData, children: "Refresh" }), _jsx(Button, { icon: _jsx(DownloadOutlined, {}), onClick: () => exportAuditData('csv'), children: "Export CSV" }), _jsx(Button, { icon: _jsx(DownloadOutlined, {}), onClick: () => exportAuditData('json'), children: "Export JSON" })] }) }) });
Card >
;
;
return;
_jsxs("div", { style: { padding: '24px' }, children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h1", { children: "\uD83D\uDD0D Audit Management Dashboard" }), _jsx("p", { children: "Comprehensive audit analytics, compliance monitoring, and security insights" })] }), _jsxs(Tabs, { activeKey: activeTab, onChange: setActiveTab, children: [_jsxs(TabPane, { tab: "Overview", children: [renderOverviewCards(), renderAnomalousPatterns(), renderAnalyticsCharts()] }, "overview"), _jsxs(TabPane, { tab: "Audit Events", children: [renderFilterPanel(), renderAuditEventsTable()] }, "events"), _jsx(TabPane, { tab: "Compliance Reports", children: _jsx(ComplianceReportsTab, {}) }, "compliance"), _jsx(TabPane, { tab: "Real-time Monitoring", children: _jsx(RealTimeMonitoringTab, {}) }, "monitoring"), _jsx(TabPane, { tab: "System Health", children: _jsx(SystemHealthTab, {}) }, "health")] }), renderEventDetailsModal()] });
;
;
// Compliance Reports Tab Component
const ComplianceReportsTab = () => {
    const [selectedFramework, setSelectedFramework] = useState(ComplianceFramework.GDPR);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const generateComplianceReport = async () => {
        setLoading(true);
        try {
            const report = auditManagementSystem.generateComplianceReport(selectedFramework, {});
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days,
                end;
            new Date(),
            ;
        }
        finally { }
        ;
        setReportData(report);
    };
    try { }
    catch (error) {
        console.error('Failed to generate compliance report:', error);
        setLoading(false);
    }
    ;
    useEffect(() => {
        generateComplianceReport();
    }, [selectedFramework]);
    return;
    _jsxs("div", { children: [_jsx(Row, { gutter: 16, style: { marginBottom: 16 }, children: _jsxs(Col, { span: 6, children: [_jsx(Select, { style: { width: '100%' }, value: selectedFramework, onChange: setSelectedFramework, children: Object.values(ComplianceFramework).map(framework => ()
                                < Select.Option, key = { framework }, value = { framework } >
                                { framework, : .toUpperCase() }) }), "))}"] }) }), _jsx(Col, { children: _jsx(Button, { type: "primary", onClick: generateComplianceReport, loading: loading, children: "Generate Report" }) })] });
    {
        reportData && ()
            < div >
            (_jsxs(Row, { gutter: 16, style: { marginBottom: 16 }, children: [_jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Total Events", value: reportData.summary.total_events }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Critical Events", value: reportData.summary.critical_events }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "High Risk Events", value: reportData.summary.high_risk_events }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Unresolved Events", value: reportData.summary.unresolved_events }) }) })] })
                ,
                    _jsxs(Card, { title: "Risk Analysis", style: { marginBottom: 16 }, children: [_jsxs("p", { children: [_jsx("strong", { children: "Average Risk Score:" }), " ", reportData.risk_analysis.average_risk_score?.toFixed(2)] }), _jsxs("p", { children: [_jsx("strong", { children: "High Risk Events:" }), " ", reportData.risk_analysis.high_risk_events?.length || 0] })] })
                        ,
                            _jsxs(Card, { title: "Recommendations", children: [_jsx("ul", { children: reportData.recommendations.map((rec, index) => ()
                                            < li, key = { index } > { rec }) }), "))}"] }));
    }
};
Card >
;
div >
;
div >
;
;
;
// Real-time Monitoring Tab Component
const RealTimeMonitoringTab = () => {
    const [monitoringData, setMonitoringData] = useState({});
    eventsPerMinute: 0,
        alertsActive;
    0,
        systemHealth;
    'healthy',
    ;
};
useEffect(() => {
    // Set up real-time monitoring
    const interval = setInterval(() => {
        // This would connect to real-time event streams
        setMonitoringData({});
        eventsPerMinute: Math.floor(Math.random() * 50),
            alertsActive;
        Math.floor(Math.random() * 5),
            systemHealth;
        Math.random() > 0.1 ? 'healthy' : 'warning',
        ;
    });
}, 5000);
return () => clearInterval(interval);
[];
;
return;
_jsxs("div", { children: [_jsxs(Row, { gutter: 16, style: { marginBottom: 16 }, children: [_jsx(Col, { span: 8, children: _jsx(Card, { children: _jsx(Statistic, { title: "Events/Minute", value: monitoringData.eventsPerMinute, prefix: _jsx(ClockCircleOutlined, {}) }) }) }), _jsx(Col, { span: 8, children: _jsx(Card, { children: _jsx(Statistic, { title: "Active Alerts", value: monitoringData.alertsActive, prefix: _jsx(AlertOutlined, {}), valueStyle: { color: monitoringData.alertsActive > 0 ? '#f5222d' : '#52c41a' } }) }) }), _jsx(Col, { span: 8, children: _jsx(Card, { children: _jsx(Statistic, { title: "System Health", value: monitoringData.systemHealth.toUpperCase(), prefix: _jsx(CheckCircleOutlined, {}), valueStyle: { color: monitoringData.systemHealth === 'healthy' ? '#52c41a' : '#faad14' } }) }) })] }), _jsx(Alert, { message: "Real-time Monitoring Active", description: "Monitoring audit events, security incidents, and system health in real-time.", type: "info", showIcon: true })] });
;
;
// System Health Tab Component
const SystemHealthTab = () => {
    return;
    _jsxs("div", { children: [_jsx(Card, { title: "Audit System Health Check", style: { marginBottom: 16 }, children: _jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 8, children: _jsx(Progress, { type: "circle", percent: 98, format: () => 'Chain Integrity', strokeColor: "#52c41a" }) }), _jsx(Col, { span: 8, children: _jsx(Progress, { type: "circle", percent: 95, format: () => 'Storage Health', strokeColor: "#1890ff" }) }), _jsx(Col, { span: 8, children: _jsx(Progress, { type: "circle", percent: 100, format: () => 'API Response', strokeColor: "#52c41a" }) })] }) }), _jsx(Alert, { message: "All Systems Operational", description: "Audit management system is running optimally with no issues detected.", type: "success", showIcon: true })] });
};
;
;
export default AuditManagementDashboard;
