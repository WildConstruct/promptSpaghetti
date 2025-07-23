import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Alert, Typography, Space, Button, Divider, Row, Col, Statistic, Tag, List, Tooltip } from 'antd';
import { WarningOutlined, InfoCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, SafetyOutlined, ClockCircleOutlined, EditOutlined } from '@ant-design/icons';
import { CONFLICT_DESCRIPTIONS } from '../../types/restoration';
const { Title, Text } = Typography;
export const RestorationConfirmation = ({ preview, config, onConfirm, onCancel }) => {
    const hasConflicts = preview.summary.totalConflicts > 0;
    const isHighRisk = preview.summary.riskLevel === 'high';
    const totalChanges = preview.summary.totalChanges;
    const getActionSummary = () => {
        const actions = [];
        if (preview.preview.nodesToAdd.length > 0) {
            actions.push({ type: 'add', count: preview.preview.nodesToAdd.length, item: 'nodes' });
        }
        if (preview.preview.nodesToUpdate.length > 0) {
            actions.push({ type: 'update', count: preview.preview.nodesToUpdate.length, item: 'nodes' });
        }
        if (preview.preview.nodesToDelete.length > 0) {
            actions.push({ type: 'delete', count: preview.preview.nodesToDelete.length, item: 'nodes' });
        }
        if (preview.preview.edgesToAdd.length > 0) {
            actions.push({ type: 'add', count: preview.preview.edgesToAdd.length, item: 'edges' });
        }
        if (preview.preview.edgesToUpdate.length > 0) {
            actions.push({ type: 'update', count: preview.preview.edgesToUpdate.length, item: 'edges' });
        }
        if (preview.preview.edgesToDelete.length > 0) {
            actions.push({ type: 'delete', count: preview.preview.edgesToDelete.length, item: 'edges' });
        }
        return actions;
    };
    const getConflictSummary = () => {
        const conflictTypes = preview.conflicts.reduce((acc, conflict) => {
            acc[conflict.conflictType] = (acc[conflict.conflictType] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(conflictTypes).map(([type, count]) => ({
            type,
            count,
            description: CONFLICT_DESCRIPTIONS[type]
        }));
    };
    const getActionIcon = (type) => {
        switch (type) {
            case 'add':
                return _jsx(CheckCircleOutlined, { style: { color: '#52c41a' } });
            case 'update':
                return _jsx(EditOutlined, { style: { color: '#1890ff' } });
            case 'delete':
                return _jsx(CloseCircleOutlined, { style: { color: '#ff4d4f' } });
            default:
                return _jsx(InfoCircleOutlined, {});
        }
    };
    const getActionColor = (type) => {
        switch (type) {
            case 'add':
                return 'success';
            case 'update':
                return 'processing';
            case 'delete':
                return 'error';
            default:
                return 'default';
        }
    };
    const formatDuration = (milliseconds) => {
        if (milliseconds < 1000) {
            return `${milliseconds}ms`;
        }
        const seconds = Math.floor(milliseconds / 1000);
        if (seconds < 60) {
            return `${seconds}s`;
        }
        const minutes = Math.floor(seconds / 60);
        return `${minutes}m ${seconds % 60}s`;
    };
    return (_jsxs("div", { children: [isHighRisk && (_jsx(Alert, { type: "error", message: "High Risk Operation", description: "This restoration operation has been classified as high risk due to the number of conflicts and changes involved. Please review carefully before proceeding.", showIcon: true, style: { marginBottom: '16px' } })), hasConflicts && (_jsx(Alert, { type: "warning", message: "Conflicts Require Resolution", description: `${preview.summary.totalConflicts} conflicts were detected and must be resolved before the restoration can proceed.`, showIcon: true, style: { marginBottom: '16px' } })), _jsxs(Row, { gutter: 16, style: { marginBottom: '24px' }, children: [_jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Total Changes", value: totalChanges, prefix: _jsx(EditOutlined, {}) }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Conflicts", value: preview.summary.totalConflicts, prefix: _jsx(WarningOutlined, {}), valueStyle: { color: hasConflicts ? '#ff4d4f' : '#3f8600' } }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Estimated Duration", value: formatDuration(preview.summary.estimatedDuration), prefix: _jsx(ClockCircleOutlined, {}) }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Risk Level", value: preview.summary.riskLevel.toUpperCase(), prefix: _jsx(SafetyOutlined, {}), valueStyle: {
                                    color: preview.summary.riskLevel === 'high' ? '#ff4d4f' :
                                        preview.summary.riskLevel === 'medium' ? '#fa8c16' : '#3f8600'
                                } }) }) })] }), _jsxs(Row, { gutter: 16, children: [_jsxs(Col, { span: 12, children: [_jsxs(Card, { title: "Actions to be Performed", style: { marginBottom: '16px' }, children: [_jsx(List, { size: "small", dataSource: getActionSummary(), renderItem: (action) => (_jsx(List.Item, { children: _jsxs(Space, { children: [getActionIcon(action.type), _jsx(Text, { strong: true, children: action.type.toUpperCase() }), _jsx(Text, { children: action.count }), _jsx(Text, { type: "secondary", children: action.item })] }) })) }), totalChanges === 0 && (_jsx(Text, { type: "secondary", children: "No changes will be made." }))] }), _jsx(Card, { title: "Configuration", style: { marginBottom: '16px' }, children: _jsxs(Space, { direction: "vertical", size: "small", style: { width: '100%' }, children: [_jsxs("div", { children: [_jsx(Text, { strong: true, children: "Restoration Type: " }), _jsx(Tag, { color: "blue", children: config.restorationType })] }), _jsxs("div", { children: [_jsx(Text, { strong: true, children: "Strategy: " }), _jsx(Tag, { color: "green", children: config.restorationStrategy })] }), _jsxs("div", { children: [_jsx(Text, { strong: true, children: "Preserve Changes: " }), _jsx(Tag, { color: config.preserveCurrentChanges ? 'success' : 'default', children: config.preserveCurrentChanges ? 'Yes' : 'No' })] }), _jsxs("div", { children: [_jsx(Text, { strong: true, children: "Create Backup: " }), _jsx(Tag, { color: config.createBackup ? 'success' : 'default', children: config.createBackup ? 'Yes' : 'No' })] }), _jsxs("div", { children: [_jsx(Text, { strong: true, children: "Notify on Completion: " }), _jsx(Tag, { color: config.notifyOnCompletion ? 'success' : 'default', children: config.notifyOnCompletion ? 'Yes' : 'No' })] })] }) })] }), _jsxs(Col, { span: 12, children: [hasConflicts && (_jsx(Card, { title: "Conflicts Detected", style: { marginBottom: '16px' }, children: _jsx(List, { size: "small", dataSource: getConflictSummary(), renderItem: (conflict) => (_jsx(List.Item, { children: _jsxs(Space, { children: [_jsx(WarningOutlined, { style: { color: '#fa8c16' } }), _jsx(Text, { strong: true, children: conflict.count }), _jsx(Tooltip, { title: conflict.description, children: _jsx(Text, { children: conflict.type.replace('_', ' ') }) })] }) })) }) })), _jsx(Card, { title: "Safety Measures", style: { marginBottom: '16px' }, children: _jsx(List, { size: "small", dataSource: [
                                        {
                                            text: 'Backup will be created before restoration',
                                            enabled: config.createBackup,
                                            icon: _jsx(SafetyOutlined, {})
                                        },
                                        {
                                            text: 'Current changes will be preserved where possible',
                                            enabled: config.preserveCurrentChanges,
                                            icon: _jsx(CheckCircleOutlined, {})
                                        },
                                        {
                                            text: 'Operation can be monitored in real-time',
                                            enabled: true,
                                            icon: _jsx(InfoCircleOutlined, {})
                                        },
                                        {
                                            text: 'Notification will be sent on completion',
                                            enabled: config.notifyOnCompletion,
                                            icon: _jsx(InfoCircleOutlined, {})
                                        }
                                    ], renderItem: (item) => (_jsx(List.Item, { children: _jsxs(Space, { children: [item.icon, _jsx(Text, { type: item.enabled ? 'default' : 'secondary', style: { textDecoration: item.enabled ? 'none' : 'line-through' }, children: item.text }), _jsx(Tag, { color: item.enabled ? 'success' : 'default', size: "small", children: item.enabled ? 'ENABLED' : 'DISABLED' })] }) })) }) })] })] }), _jsx(Divider, {}), _jsxs("div", { style: { textAlign: 'center', marginBottom: '24px' }, children: [_jsx(Title, { level: 4, children: "Are you sure you want to proceed with this restoration?" }), _jsxs(Text, { type: "secondary", children: ["This action cannot be undone. ", config.createBackup && 'A backup will be created before making changes.'] })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'center', gap: '16px' }, children: [_jsx(Button, { size: "large", onClick: onCancel, children: "Cancel" }), _jsx(Button, { type: "primary", size: "large", onClick: onConfirm, disabled: hasConflicts, danger: isHighRisk, children: isHighRisk ? 'Proceed with High Risk Operation' : 'Confirm Restoration' })] })] }));
};
