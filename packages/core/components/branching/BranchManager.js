import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Select, Switch, Tag, Tooltip, Space, Typography, Dropdown, Menu, Alert, Statistic, Row, Col, Drawer, Divider, } from 'antd';
import { BranchesOutlined, PlusOutlined, EditOutlined, DeleteOutlined, MergeOutlined, MoreOutlined, LockOutlined, UnlockOutlined, EyeOutlined, ForkOutlined, CheckCircleOutlined, CloseCircleOutlined, } from '@ant-design/icons';
import { BRANCH_TYPE_DESCRIPTIONS, PROTECTION_LEVEL_DESCRIPTIONS, } from '../../types/branching';
import { useBranching } from '../../hooks/useBranching';
import { MergeRequestPanel } from './MergeRequestPanel';
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const BranchNode = ({ branch, onEdit, onDelete, onCreateChild, onSelect, isSelected }) => {
    const getBranchTypeColor = (type) => {
        switch (type) {
            case 'main':
                return 'purple';
            case 'feature':
                return 'blue';
            case 'hotfix':
                return 'red';
            case 'release':
                return 'green';
            case 'experiment':
                return 'orange';
            default:
                return 'default';
        }
    };
    const getBranchStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'merged':
                return 'processing';
            case 'abandoned':
                return 'error';
            case 'archived':
                return 'default';
            default:
                return 'default';
        }
    };
    const getProtectionIcon = (level) => {
        switch (level) {
            case 'locked':
                return _jsx(LockOutlined, { style: { color: '#ff4d4f' } });
            case 'protected':
                return _jsx(LockOutlined, { style: { color: '#fa8c16' } });
            default:
                return _jsx(UnlockOutlined, { style: { color: '#52c41a' } });
        }
    };
    const formatLastActivity = (date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0)
            return 'Today';
        if (days === 1)
            return 'Yesterday';
        if (days < 7)
            return `${days} days ago`;
        if (days < 30)
            return `${Math.floor(days / 7)} weeks ago`;
        return `${Math.floor(days / 30)} months ago`;
    };
    const menu = (_jsxs(Menu, { children: [_jsx(Menu.Item, { icon: _jsx(EyeOutlined, {}), onClick: () => onSelect(branch.id), children: "Switch to Branch" }, "select"), _jsx(Menu.Item, { icon: _jsx(ForkOutlined, {}), onClick: () => onCreateChild(branch.id), children: "Create Child Branch" }, "create"), _jsx(Menu.Item, { icon: _jsx(EditOutlined, {}), onClick: () => onEdit(branch), children: "Edit Settings" }, "edit"), _jsx(Menu.Divider, {}), _jsx(Menu.Item, { icon: _jsx(DeleteOutlined, {}), onClick: () => onDelete(branch.id), disabled: branch.branchType === 'main', danger: true, children: "Delete Branch" }, "delete")] }));
    return (_jsx("div", { style: {
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
            border: isSelected ? '1px solid #1890ff' : '1px solid transparent',
            marginBottom: '4px',
            cursor: 'pointer',
        }, onClick: () => onSelect(branch.id), children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }, children: [_jsx(BranchesOutlined, { style: { color: getBranchTypeColor(branch.branchType) } }), _jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' }, children: [_jsx(Text, { strong: true, children: branch.displayName || branch.name }), _jsx(Tag, { color: getBranchTypeColor(branch.branchType), size: "small", children: branch.branchType }), _jsx(Tag, { color: getBranchStatusColor(branch.status), size: "small", children: branch.status }), _jsx(Tooltip, { title: PROTECTION_LEVEL_DESCRIPTIONS[branch.protectionLevel], children: getProtectionIcon(branch.protectionLevel) })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }, children: [_jsxs(Text, { type: "secondary", style: { fontSize: '11px' }, children: [branch.commitCount, " commits"] }), _jsxs(Text, { type: "secondary", style: { fontSize: '11px' }, children: [branch.contributorCount, " contributors"] }), _jsx(Text, { type: "secondary", style: { fontSize: '11px' }, children: formatLastActivity(branch.lastActivityAt) })] })] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '4px' }, children: [branch.requiresReview && (_jsx(Tooltip, { title: "Requires review", children: _jsx(CheckCircleOutlined, { style: { color: '#fa8c16' } }) })), branch.autoMergeEnabled && (_jsx(Tooltip, { title: "Auto-merge enabled", children: _jsx(MergeOutlined, { style: { color: '#52c41a' } }) })), _jsx(Dropdown, { overlay: menu, trigger: ['click'], children: _jsx(Button, { type: "text", size: "small", icon: _jsx(MoreOutlined, {}) }) })] })] }) }));
};
export const BranchManager = ({ projectId, currentBranchId, onBranchSelect, onBranchCreate, onBranchUpdate, onBranchDelete, }) => {
    const [hierarchy, setHierarchy] = useState([]);
    const [stats, setStats] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showMergeRequestPanel, setShowMergeRequestPanel] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [editingBranch, setEditingBranch] = useState(null);
    const [parentBranchId, setParentBranchId] = useState(null);
    const [form] = Form.useForm();
    const { createBranch, updateBranch, deleteBranch, getBranchHierarchy, getBranchStats, loading, error, } = useBranching();
    useEffect(() => {
        loadBranchData();
    }, [projectId]);
    const loadBranchData = async () => {
        try {
            const [hierarchyData, statsData] = await Promise.all([
                getBranchHierarchy(projectId),
                getBranchStats(projectId),
            ]);
            setHierarchy(hierarchyData);
            setStats(statsData);
        }
        catch (error) {
            console.error('Failed to load branch data:', error);
        }
    };
    const handleCreateBranch = async (values) => {
        try {
            const request = {
                projectId,
                name: values.name,
                displayName: values.displayName,
                description: values.description,
                parentBranchId: parentBranchId || undefined,
                branchType: values.branchType,
                autoMergeEnabled: values.autoMergeEnabled || false,
                requiresReview: values.requiresReview || false,
                allowForcePush: values.allowForcePush || false,
                deleteOnMerge: values.deleteOnMerge || false,
            };
            const branch = await createBranch(request);
            setShowCreateModal(false);
            form.resetFields();
            setParentBranchId(null);
            onBranchCreate?.(branch);
            loadBranchData();
        }
        catch (error) {
            console.error('Failed to create branch:', error);
        }
    };
    const handleUpdateBranch = async (values) => {
        if (!editingBranch)
            return;
        try {
            const request = {
                displayName: values.displayName,
                description: values.description,
                protectionLevel: values.protectionLevel,
                autoMergeEnabled: values.autoMergeEnabled,
                requiresReview: values.requiresReview,
                allowForcePush: values.allowForcePush,
                deleteOnMerge: values.deleteOnMerge,
            };
            const branch = await updateBranch(editingBranch.id, request);
            setShowEditModal(false);
            setEditingBranch(null);
            form.resetFields();
            onBranchUpdate?.(branch);
            loadBranchData();
        }
        catch (error) {
            console.error('Failed to update branch:', error);
        }
    };
    const handleDeleteBranch = async (branchId) => {
        try {
            await deleteBranch(branchId);
            onBranchDelete?.(branchId);
            loadBranchData();
        }
        catch (error) {
            console.error('Failed to delete branch:', error);
        }
    };
    const handleBranchSelect = (branchId) => {
        const branch = findBranchById(branchId);
        setSelectedBranch(branch);
        onBranchSelect?.(branchId);
    };
    const handleEditBranch = (branch) => {
        setEditingBranch(branch);
        form.setFieldsValue({
            displayName: branch.displayName,
            description: branch.description,
            protectionLevel: branch.protectionLevel,
            autoMergeEnabled: branch.autoMergeEnabled,
            requiresReview: branch.requiresReview,
            allowForcePush: branch.allowForcePush,
            deleteOnMerge: branch.deleteOnMerge,
        });
        setShowEditModal(true);
    };
    const handleCreateChild = (parentId) => {
        setParentBranchId(parentId);
        setShowCreateModal(true);
    };
    const findBranchById = (branchId) => {
        const searchInHierarchy = (nodes) => {
            for (const node of nodes) {
                if (node.branch.id === branchId) {
                    return node.branch;
                }
                const found = searchInHierarchy(node.children);
                if (found)
                    return found;
            }
            return null;
        };
        return searchInHierarchy(hierarchy);
    };
    const renderBranchHierarchy = (nodes) => {
        return nodes.map((node) => (_jsxs("div", { style: { marginLeft: `${node.depth * 20}px` }, children: [_jsx(BranchNode, { branch: node.branch, onEdit: handleEditBranch, onDelete: handleDeleteBranch, onCreateChild: handleCreateChild, onSelect: handleBranchSelect, isSelected: node.branch.id === currentBranchId }), node.children.length > 0 && renderBranchHierarchy(node.children)] }, node.branch.id)));
    };
    return (_jsxs("div", { style: { height: '100%', display: 'flex', flexDirection: 'column' }, children: [_jsxs("div", { style: { padding: '16px', borderBottom: '1px solid #f0f0f0' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs(Title, { level: 4, style: { margin: 0 }, children: [_jsx(BranchesOutlined, {}), " Branches"] }), _jsxs(Space, { children: [_jsx(Button, { type: "primary", icon: _jsx(PlusOutlined, {}), onClick: () => setShowCreateModal(true), children: "New Branch" }), _jsx(Button, { icon: _jsx(MergeOutlined, {}), onClick: () => setShowMergeRequestPanel(true), children: "Merge Requests" })] })] }), stats && (_jsxs(Row, { gutter: 16, style: { marginTop: '16px' }, children: [_jsx(Col, { span: 6, children: _jsx(Statistic, { title: "Total", value: stats.totalBranches, prefix: _jsx(BranchesOutlined, {}) }) }), _jsx(Col, { span: 6, children: _jsx(Statistic, { title: "Active", value: stats.activeBranches, prefix: _jsx(CheckCircleOutlined, {}), valueStyle: { color: '#52c41a' } }) }), _jsx(Col, { span: 6, children: _jsx(Statistic, { title: "Merged", value: stats.mergedBranches, prefix: _jsx(MergeOutlined, {}), valueStyle: { color: '#1890ff' } }) }), _jsx(Col, { span: 6, children: _jsx(Statistic, { title: "Abandoned", value: stats.abandonedBranches, prefix: _jsx(CloseCircleOutlined, {}), valueStyle: { color: '#ff4d4f' } }) })] }))] }), _jsxs("div", { style: { flex: 1, padding: '16px', overflowY: 'auto' }, children: [error && (_jsx(Alert, { message: "Error", description: error, type: "error", showIcon: true, closable: true, style: { marginBottom: '16px' } })), hierarchy.length > 0 ? (_jsx("div", { children: renderBranchHierarchy(hierarchy) })) : (_jsx("div", { style: { textAlign: 'center', padding: '40px' }, children: _jsx(Text, { type: "secondary", children: "No branches found" }) }))] }), _jsx(Modal, { title: "Create New Branch", visible: showCreateModal, onCancel: () => {
                    setShowCreateModal(false);
                    form.resetFields();
                    setParentBranchId(null);
                }, footer: null, width: 600, children: _jsxs(Form, { form: form, layout: "vertical", onFinish: handleCreateBranch, initialValues: {
                        branchType: 'feature',
                        autoMergeEnabled: false,
                        requiresReview: false,
                        allowForcePush: false,
                        deleteOnMerge: false,
                    }, children: [_jsx(Form.Item, { name: "name", label: "Branch Name", rules: [{ required: true, message: 'Please enter branch name' }], children: _jsx(Input, { placeholder: "e.g., feature/user-authentication" }) }), _jsx(Form.Item, { name: "displayName", label: "Display Name", children: _jsx(Input, { placeholder: "e.g., User Authentication Feature" }) }), _jsx(Form.Item, { name: "description", label: "Description", children: _jsx(TextArea, { rows: 3, placeholder: "Describe the purpose of this branch..." }) }), _jsx(Form.Item, { name: "branchType", label: "Branch Type", children: _jsx(Select, { children: Object.entries(BRANCH_TYPE_DESCRIPTIONS).map(([key, description]) => (_jsxs(Option, { value: key, children: [key.charAt(0).toUpperCase() + key.slice(1), " - ", description] }, key))) }) }), _jsx(Divider, {}), _jsxs(Form.Item, { name: "autoMergeEnabled", valuePropName: "checked", children: [_jsx(Switch, {}), " Auto-merge when approved"] }), _jsxs(Form.Item, { name: "requiresReview", valuePropName: "checked", children: [_jsx(Switch, {}), " Require review before merge"] }), _jsxs(Form.Item, { name: "allowForcePush", valuePropName: "checked", children: [_jsx(Switch, {}), " Allow force push"] }), _jsxs(Form.Item, { name: "deleteOnMerge", valuePropName: "checked", children: [_jsx(Switch, {}), " Delete branch after merge"] }), _jsx("div", { style: { textAlign: 'right', marginTop: '24px' }, children: _jsxs(Space, { children: [_jsx(Button, { onClick: () => setShowCreateModal(false), children: "Cancel" }), _jsx(Button, { type: "primary", htmlType: "submit", loading: loading, children: "Create Branch" })] }) })] }) }), _jsx(Modal, { title: "Edit Branch Settings", visible: showEditModal, onCancel: () => {
                    setShowEditModal(false);
                    setEditingBranch(null);
                    form.resetFields();
                }, footer: null, width: 600, children: editingBranch && (_jsxs(Form, { form: form, layout: "vertical", onFinish: handleUpdateBranch, children: [_jsx(Form.Item, { name: "displayName", label: "Display Name", children: _jsx(Input, { placeholder: "e.g., User Authentication Feature" }) }), _jsx(Form.Item, { name: "description", label: "Description", children: _jsx(TextArea, { rows: 3, placeholder: "Describe the purpose of this branch..." }) }), _jsx(Form.Item, { name: "protectionLevel", label: "Protection Level", children: _jsx(Select, { children: Object.entries(PROTECTION_LEVEL_DESCRIPTIONS).map(([key, description]) => (_jsxs(Option, { value: key, children: [key.charAt(0).toUpperCase() + key.slice(1), " - ", description] }, key))) }) }), _jsx(Divider, {}), _jsxs(Form.Item, { name: "autoMergeEnabled", valuePropName: "checked", children: [_jsx(Switch, {}), " Auto-merge when approved"] }), _jsxs(Form.Item, { name: "requiresReview", valuePropName: "checked", children: [_jsx(Switch, {}), " Require review before merge"] }), _jsxs(Form.Item, { name: "allowForcePush", valuePropName: "checked", children: [_jsx(Switch, {}), " Allow force push"] }), _jsxs(Form.Item, { name: "deleteOnMerge", valuePropName: "checked", children: [_jsx(Switch, {}), " Delete branch after merge"] }), _jsx("div", { style: { textAlign: 'right', marginTop: '24px' }, children: _jsxs(Space, { children: [_jsx(Button, { onClick: () => setShowEditModal(false), children: "Cancel" }), _jsx(Button, { type: "primary", htmlType: "submit", loading: loading, children: "Update Branch" })] }) })] })) }), _jsx(Drawer, { title: "Merge Requests", placement: "right", onClose: () => setShowMergeRequestPanel(false), visible: showMergeRequestPanel, width: 800, children: _jsx(MergeRequestPanel, { projectId: projectId, visible: showMergeRequestPanel, onClose: () => setShowMergeRequestPanel(false) }) })] }));
};
