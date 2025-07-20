import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, Progress, Typography, Space, Button, Statistic, Row, Col, Alert, Tag, List, Collapse, Modal, } from 'antd';
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, StopOutlined, InfoCircleOutlined, ClockCircleOutlined, EditOutlined, ExclamationCircleOutlined, } from '@ant-design/icons';
const { Title, Text } = Typography;
const { Panel } = Collapse;
export const RestoreProgressPanel = ({ progress, onCancel, showDetails = false, }) => {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [detailsVisible, setDetailsVisible] = useState(showDetails);
    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return _jsx(ClockCircleOutlined, { style: { color: '#fa8c16' } });
            case 'in_progress':
                return _jsx(LoadingOutlined, { style: { color: '#1890ff' } });
            case 'completed':
                return _jsx(CheckCircleOutlined, { style: { color: '#52c41a' } });
            case 'failed':
                return _jsx(CloseCircleOutlined, { style: { color: '#ff4d4f' } });
            case 'cancelled':
                return _jsx(StopOutlined, { style: { color: '#d9d9d9' } });
            default:
                return _jsx(InfoCircleOutlined, {});
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'in_progress':
                return 'processing';
            case 'completed':
                return 'success';
            case 'failed':
                return 'error';
            case 'cancelled':
                return 'default';
            default:
                return 'default';
        }
    };
    const getProgressStatus = () => {
        switch (progress.status) {
            case 'completed':
                return 'success';
            case 'failed':
                return 'exception';
            case 'cancelled':
                return 'exception';
            default:
                return 'active';
        }
    };
    const formatTime = (milliseconds) => {
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
    const handleCancelConfirm = () => {
        setShowCancelModal(false);
        onCancel();
    };
    const isInProgress = progress.status === 'in_progress' || progress.status === 'pending';
    const isCompleted = progress.status === 'completed';
    const isFailed = progress.status === 'failed';
    const isCancelled = progress.status === 'cancelled';
    return (_jsxs("div", { children: [_jsx(Card, { style: { marginBottom: '16px' }, children: _jsxs(Row, { align: "middle", justify: "space-between", children: [_jsx(Col, { children: _jsxs(Space, { size: "large", children: [_jsxs(Space, { children: [getStatusIcon(progress.status), _jsx(Title, { level: 4, style: { margin: 0 }, children: progress.status.replace('_', ' ').toUpperCase() })] }), _jsx(Tag, { color: getStatusColor(progress.status), size: "large", children: progress.status.replace('_', ' ').toUpperCase() })] }) }), _jsx(Col, { children: isInProgress && (_jsx(Button, { danger: true, icon: _jsx(StopOutlined, {}), onClick: () => setShowCancelModal(true), children: "Cancel Restoration" })) })] }) }), _jsxs(Card, { title: "Progress", style: { marginBottom: '16px' }, children: [_jsx(Progress, { percent: progress.progressPercentage, status: getProgressStatus(), strokeWidth: 12, showInfo: true, format: (percent) => `${percent}%` }), progress.currentOperation && (_jsxs("div", { style: { marginTop: '8px' }, children: [_jsx(Text, { type: "secondary", children: "Current operation: " }), _jsx(Text, { code: true, children: progress.currentOperation })] })), progress.estimatedTimeRemaining && progress.estimatedTimeRemaining > 0 && (_jsxs("div", { style: { marginTop: '8px' }, children: [_jsx(Text, { type: "secondary", children: "Estimated time remaining: " }), _jsx(Text, { strong: true, children: formatTime(progress.estimatedTimeRemaining) })] }))] }), _jsxs(Row, { gutter: 16, style: { marginBottom: '16px' }, children: [_jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Operations", value: progress.operationsCompleted, suffix: `/ ${progress.totalOperations}`, prefix: _jsx(EditOutlined, {}) }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Conflicts", value: progress.conflictsResolved, suffix: `/ ${progress.totalConflicts}`, prefix: _jsx(WarningOutlined, {}), valueStyle: {
                                    color: progress.totalConflicts > 0 ? '#fa8c16' : '#3f8600'
                                } }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Progress", value: progress.progressPercentage, suffix: "%", prefix: _jsx(LoadingOutlined, {}) }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Status", value: progress.status.replace('_', ' ').toUpperCase(), prefix: getStatusIcon(progress.status) }) }) })] }), isFailed && progress.errorMessage && (_jsx(Alert, { type: "error", message: "Restoration Failed", description: progress.errorMessage, showIcon: true, style: { marginBottom: '16px' } })), isCompleted && (_jsx(Alert, { type: "success", message: "Restoration Completed Successfully", description: "The version restoration has been completed successfully. All changes have been applied to your project.", showIcon: true, style: { marginBottom: '16px' } })), isCancelled && (_jsx(Alert, { type: "info", message: "Restoration Cancelled", description: "The restoration operation has been cancelled. Your project remains in its previous state.", showIcon: true, style: { marginBottom: '16px' } })), detailsVisible && (_jsx(Card, { title: "Details", extra: _jsxs(Button, { type: "link", onClick: () => setDetailsVisible(!detailsVisible), children: [detailsVisible ? 'Hide' : 'Show', " Details"] }), children: _jsxs(Collapse, { children: [_jsx(Panel, { header: "Operation Progress", children: _jsx(List, { size: "small", dataSource: [
                                    { label: 'Total Operations', value: progress.totalOperations },
                                    { label: 'Completed Operations', value: progress.operationsCompleted },
                                    { label: 'Remaining Operations', value: progress.totalOperations - progress.operationsCompleted },
                                    { label: 'Success Rate', value: `${Math.round((progress.operationsCompleted / progress.totalOperations) * 100)}%` },
                                ], renderItem: (item) => (_jsx(List.Item, { children: _jsxs(Space, { children: [_jsxs(Text, { type: "secondary", children: [item.label, ":"] }), _jsx(Text, { strong: true, children: item.value })] }) })) }) }, "operations"), _jsx(Panel, { header: "Conflict Resolution", children: _jsx(List, { size: "small", dataSource: [
                                    { label: 'Total Conflicts', value: progress.totalConflicts },
                                    { label: 'Resolved Conflicts', value: progress.conflictsResolved },
                                    { label: 'Remaining Conflicts', value: progress.totalConflicts - progress.conflictsResolved },
                                    { label: 'Resolution Rate', value: progress.totalConflicts > 0 ? `${Math.round((progress.conflictsResolved / progress.totalConflicts) * 100)}%` : 'N/A' },
                                ], renderItem: (item) => (_jsx(List.Item, { children: _jsxs(Space, { children: [_jsxs(Text, { type: "secondary", children: [item.label, ":"] }), _jsx(Text, { strong: true, children: item.value })] }) })) }) }, "conflicts"), _jsx(Panel, { header: "System Information", children: _jsx(List, { size: "small", dataSource: [
                                    { label: 'Restoration ID', value: progress.restorationAttemptId },
                                    { label: 'Status', value: progress.status },
                                    { label: 'Current Operation', value: progress.currentOperation || 'N/A' },
                                    { label: 'Estimated Time Remaining', value: progress.estimatedTimeRemaining ? formatTime(progress.estimatedTimeRemaining) : 'N/A' },
                                ], renderItem: (item) => (_jsx(List.Item, { children: _jsxs(Space, { children: [_jsxs(Text, { type: "secondary", children: [item.label, ":"] }), _jsx(Text, { code: true, style: { fontSize: '12px' }, children: item.value })] }) })) }) }, "system")] }) })), _jsx(Modal, { title: "Cancel Restoration", visible: showCancelModal, onOk: handleCancelConfirm, onCancel: () => setShowCancelModal(false), okText: "Yes, Cancel", cancelText: "No, Continue", okButtonProps: { danger: true }, children: _jsxs(Space, { direction: "vertical", size: "middle", style: { width: '100%' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx(ExclamationCircleOutlined, { style: { color: '#fa8c16', fontSize: '20px' } }), _jsx(Text, { strong: true, children: "Are you sure you want to cancel this restoration?" })] }), _jsx(Text, { type: "secondary", children: "Cancelling the restoration will stop the process and leave your project in its current state. Any changes that have already been applied will remain." }), _jsx("div", { style: { background: '#f5f5f5', padding: '12px', borderRadius: '4px' }, children: _jsxs(Text, { type: "secondary", children: ["Progress: ", progress.progressPercentage, "% complete (", progress.operationsCompleted, "/", progress.totalOperations, " operations)"] }) })] }) })] }));
};
