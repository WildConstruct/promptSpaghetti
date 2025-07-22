import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, List, Button, Modal, Form, Input, Select, Tag, Typography, Space, Alert, Divider, Badge, Dropdown, Menu } from 'antd';
import { MergeOutlined, PlusOutlined, CloseOutlined, UserOutlined, ClockCircleOutlined, MoreOutlined, EyeOutlined, BranchesOutlined } from '@ant-design/icons';
import { useBranching } from '../../hooks/useBranching';
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const MergeRequestItem = ({ mergeRequest, onView, onMerge, onClose }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'open':
                return 'success';
            case 'merged':
                return 'processing';
            case 'closed':
                return 'default';
            case 'draft':
                return 'warning';
            default:
                return 'default';
        }
    };
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString();
    };
    const menu = (_jsxs(Menu, { children: [_jsx(Menu.Item, { icon: _jsx(EyeOutlined, {}), onClick: () => onView(mergeRequest), children: "View Details" }, "view"), mergeRequest.status === 'open' && (_jsxs(_Fragment, { children: [_jsx(Menu.Item, { icon: _jsx(MergeOutlined, {}), onClick: () => onMerge(mergeRequest), children: "Merge" }, "merge"), _jsx(Menu.Item, { icon: _jsx(CloseOutlined, {}), onClick: () => onClose(mergeRequest), children: "Close" }, "close")] }))] }));
    return (_jsx(Card, { size: "small", style: { marginBottom: '8px' }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }, children: [_jsx(Text, { strong: true, children: mergeRequest.title }), _jsx(Tag, { color: getStatusColor(mergeRequest.status), children: mergeRequest.status.toUpperCase() })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }, children: [_jsxs(Space, { size: "small", children: [_jsx(BranchesOutlined, {}), _jsx(Text, { code: true, style: { fontSize: '11px' }, children: "source \u2192 target" })] }), _jsxs(Space, { size: "small", children: [_jsx(UserOutlined, {}), _jsx(Text, { type: "secondary", style: { fontSize: '11px' }, children: "Created by User" })] }), _jsxs(Space, { size: "small", children: [_jsx(ClockCircleOutlined, {}), _jsx(Text, { type: "secondary", style: { fontSize: '11px' }, children: formatDate(mergeRequest.createdAt) })] })] }), mergeRequest.description && (_jsx(Text, { type: "secondary", style: { fontSize: '12px' }, children: mergeRequest.description })), _jsx("div", { style: { marginTop: '8px' }, children: _jsxs(Space, { children: [_jsx(Badge, { count: mergeRequest.commitsCount, size: "small", children: _jsx(Tag, { size: "small", children: "Commits" }) }), _jsx(Badge, { count: mergeRequest.filesChanged, size: "small", children: _jsx(Tag, { size: "small", children: "Files" }) }), _jsx(Badge, { count: mergeRequest.reviewers.length, size: "small", children: _jsx(Tag, { size: "small", children: "Reviewers" }) })] }) })] }), _jsx(Dropdown, { overlay: menu, trigger: ['click'], children: _jsx(Button, { type: "text", size: "small", icon: _jsx(MoreOutlined, {}) }) })] }) }));
};
export const MergeRequestPanel = ({ projectId, visible, onClose }) => {
    const [mergeRequests, setMergeRequests] = useState([]);
    const [branches, setBranches] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedMergeRequest, setSelectedMergeRequest] = useState(null);
    const [form] = Form.useForm();
    const { listBranches, createMergeRequest, mergeBranch, loading, error } = useBranching();
    useEffect(() => {
        if (visible) {
            loadData();
        }
    }, [visible, projectId]);
    const loadData = async () => {
        try {
            const [branchesData] = await Promise.all([
                listBranches({ projectId, limit: 100 })
                // Would also load merge requests here
            ]);
            setBranches(branchesData);
            // setMergeRequests(mergeRequestsData);
        }
        catch (error) {
            console.error('Failed to load data:', error);
        }
    };
    const handleCreateMergeRequest = async (values) => {
        try {
            const request = {
                projectId,
                sourceBranchId: values.sourceBranchId,
                targetBranchId: values.targetBranchId,
                title: values.title,
                description: values.description,
                reviewers: values.reviewers || [],
                assignedTo: values.assignedTo,
                allowSquashMerge: values.allowSquashMerge !== false,
                allowMergeCommit: values.allowMergeCommit !== false,
                allowRebaseMerge: values.allowRebaseMerge || false,
                deleteSourceBranch: values.deleteSourceBranch || false
            };
            await createMergeRequest(request);
            setShowCreateModal(false);
            form.resetFields();
            loadData();
        }
        catch (error) {
            console.error('Failed to create merge request:', error);
        }
    };
    const handleMergeBranch = async (mergeRequest) => {
        try {
            await mergeBranch({
                mergeRequestId: mergeRequest.id,
                mergeStrategy: 'merge',
                deleteSourceBranch: mergeRequest.deleteSourceBranch
            });
            loadData();
        }
        catch (error) {
            console.error('Failed to merge branch:', error);
        }
    };
    const handleCloseMergeRequest = async (mergeRequest) => {
        // Would implement close functionality
        console.log('Closing merge request:', mergeRequest.id);
    };
    const handleViewMergeRequest = (mergeRequest) => {
        setSelectedMergeRequest(mergeRequest);
    };
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }, children: [_jsx(Title, { level: 4, style: { margin: 0 }, children: "Merge Requests" }), _jsx(Button, { type: "primary", icon: _jsx(PlusOutlined, {}), onClick: () => setShowCreateModal(true), children: "Create Merge Request" })] }), error && (_jsx(Alert, { message: "Error", description: error, type: "error", showIcon: true, closable: true, style: { marginBottom: '16px' } })), _jsx("div", { style: { minHeight: '400px' }, children: mergeRequests.length > 0 ? (_jsx(List, { dataSource: mergeRequests, renderItem: (mergeRequest) => (_jsx(MergeRequestItem, { mergeRequest: mergeRequest, onView: handleViewMergeRequest, onMerge: handleMergeBranch, onClose: handleCloseMergeRequest }, mergeRequest.id)) })) : (_jsx("div", { style: { textAlign: 'center', padding: '40px' }, children: _jsx(Text, { type: "secondary", children: "No merge requests found" }) })) }), _jsx(Modal, { title: "Create Merge Request", visible: showCreateModal, onCancel: () => {
                    setShowCreateModal(false);
                    form.resetFields();
                }, footer: null, width: 600, children: _jsxs(Form, { form: form, layout: "vertical", onFinish: handleCreateMergeRequest, children: [_jsx(Form.Item, { name: "title", label: "Title", rules: [{ required: true, message: 'Please enter a title' }], children: _jsx(Input, { placeholder: "e.g., Add user authentication feature" }) }), _jsx(Form.Item, { name: "description", label: "Description", children: _jsx(TextArea, { rows: 3, placeholder: "Describe the changes in this merge request..." }) }), _jsx(Form.Item, { name: "sourceBranchId", label: "Source Branch", rules: [{ required: true, message: 'Please select source branch' }], children: _jsx(Select, { placeholder: "Select source branch", children: branches.map(branch => (_jsx(Option, { value: branch.id, children: branch.displayName || branch.name }, branch.id))) }) }), _jsx(Form.Item, { name: "targetBranchId", label: "Target Branch", rules: [{ required: true, message: 'Please select target branch' }], children: _jsx(Select, { placeholder: "Select target branch", children: branches.map(branch => (_jsx(Option, { value: branch.id, children: branch.displayName || branch.name }, branch.id))) }) }), _jsx(Form.Item, { name: "reviewers", label: "Reviewers", children: _jsx(Select, { mode: "multiple", placeholder: "Select reviewers" }) }), _jsx(Form.Item, { name: "assignedTo", label: "Assignee", children: _jsx(Select, { placeholder: "Select assignee" }) }), _jsx("div", { style: { textAlign: 'right', marginTop: '24px' }, children: _jsxs(Space, { children: [_jsx(Button, { onClick: () => setShowCreateModal(false), children: "Cancel" }), _jsx(Button, { type: "primary", htmlType: "submit", loading: loading, children: "Create Merge Request" })] }) })] }) }), _jsx(Modal, { title: "Merge Request Details", visible: selectedMergeRequest !== null, onCancel: () => setSelectedMergeRequest(null), footer: null, width: 800, children: selectedMergeRequest && (_jsxs("div", { children: [_jsx(Title, { level: 4, children: selectedMergeRequest.title }), _jsx("div", { style: { marginBottom: '16px' }, children: _jsx(Tag, { color: getStatusColor(selectedMergeRequest.status), children: selectedMergeRequest.status.toUpperCase() }) }), _jsx(Text, { children: selectedMergeRequest.description }), _jsx(Divider, {}), _jsxs("div", { children: [_jsx(Text, { strong: true, children: "Changes:" }), _jsx("div", { style: { marginTop: '8px' }, children: _jsxs(Space, { children: [_jsxs(Tag, { children: [selectedMergeRequest.commitsCount, " commits"] }), _jsxs(Tag, { children: [selectedMergeRequest.filesChanged, " files changed"] }), _jsxs(Tag, { children: ["+", selectedMergeRequest.additionsCount, " additions"] }), _jsxs(Tag, { children: ["-", selectedMergeRequest.deletionsCount, " deletions"] })] }) })] }), _jsx(Divider, {}), _jsxs("div", { children: [_jsx(Text, { strong: true, children: "Reviews:" }), _jsx("div", { style: { marginTop: '8px' }, children: selectedMergeRequest.reviewers.length > 0 ? (_jsxs(Text, { children: ["Reviews pending from ", selectedMergeRequest.reviewers.length, " reviewers"] })) : (_jsx(Text, { type: "secondary", children: "No reviewers assigned" })) })] })] })) })] }));
};
