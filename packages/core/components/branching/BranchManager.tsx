import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tree, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Tag, 
  Tooltip, 
  Space, 
  Typography,
  Popconfirm,
  Dropdown,
  Menu,
  Badge,
  Alert,
  Timeline,
  Statistic,
  Row,
  Col,
  Drawer,
  Divider
} from 'antd';
import {
  BranchesOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MergeOutlined,
  SettingOutlined,
  UserOutlined,
  ClockCircleOutlined,
  MoreOutlined,
  GitlabOutlined,
  LockOutlined,
  UnlockOutlined,
  EyeOutlined,
  ForkOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { 
  ProjectBranch,
  BranchHierarchy,
  BranchStatsResponse,
  CreateBranchRequest,
  UpdateBranchRequest,
  BranchType,
  BranchStatus,
  ProtectionLevel,
  BRANCH_TYPE_DESCRIPTIONS,
  BRANCH_STATUS_DESCRIPTIONS,
  PROTECTION_LEVEL_DESCRIPTIONS
} from '../../types/branching';
import { useBranching } from '../../hooks/useBranching';
import { MergeRequestPanel } from './MergeRequestPanel';
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
interface BranchManagerProps {
  projectId: string;
  currentBranchId?: string;
  onBranchSelect?: (branchId: string) => void;
  onBranchCreate?: (branch: ProjectBranch) => void;
  onBranchUpdate?: (branch: ProjectBranch) => void;
  onBranchDelete?: (branchId: string) => void;
}
interface BranchNodeProps {
  branch: ProjectBranch;
  onEdit: (branch: ProjectBranch) => void;
  onDelete: (branchId: string) => void;
  onCreateChild: (parentId: string) => void;
  onSelect: (branchId: string) => void;
  isSelected: boolean;
}
const BranchNode: React.FC<BranchNodeProps> = ({ )
  branch, 
  onEdit, 
  onDelete, 
  onCreateChild, 
  onSelect,
  isSelected 
}) => {
  const getBranchTypeColor = (type: BranchType) => {
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
  const getBranchStatusColor = (status: BranchStatus) => {
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
  const getProtectionIcon = (level: ProtectionLevel) => {
    switch (level) {
    case 'locked':
      return <LockOutlined style={{ color: '#ff4d4f' }} />;
    case 'protected':
      return <LockOutlined style={{ color: '#fa8c16' }} />;
    default:
      return <UnlockOutlined style={{ color: '#52c41a' }} />;
    }
  };
  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;}
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;}
    return `${Math.floor(days / 30)} months ago`;}
  };
  const menu = (;)
    <Menu>
      <Menu.Item key="select" icon={<EyeOutlined />} onClick={() => onSelect(branch.id)}>
        Switch to Branch
      </Menu.Item>
      <Menu.Item key="create" icon={<ForkOutlined />} onClick={() => onCreateChild(branch.id)}>
        Create Child Branch
      </Menu.Item>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => onEdit(branch)}>
        Edit Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined />} 
        onClick={() => onDelete(branch.id)}
        disabled={branch.branchType === 'main'}
        danger
      >
        Delete Branch
      </Menu.Item>
    </Menu>
  );
  return ()
    <div 
      style={{ 
        padding: '8px 12px', 
        borderRadius: '6px',
        backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
        border: isSelected ? '1px solid #1890ff' : '1px solid transparent',
        marginBottom: '4px',
        cursor: 'pointer',
      }}
      onClick={() => onSelect(branch.id)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <BranchesOutlined style={{ color: getBranchTypeColor(branch.branchType) }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Text strong>{branch.displayName || branch.name}</Text>
              <Tag color={getBranchTypeColor(branch.branchType)} size="small">
                {branch.branchType}
              </Tag>
              <Tag color={getBranchStatusColor(branch.status) as any} size="small">
                {branch.status}
              </Tag>
              <Tooltip title={PROTECTION_LEVEL_DESCRIPTIONS[branch.protectionLevel]}>
                {getProtectionIcon(branch.protectionLevel)}
              </Tooltip>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                {branch.commitCount} commits
              </Text>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                {branch.contributorCount} contributors
              </Text>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                {formatLastActivity(branch.lastActivityAt)}
              </Text>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {branch.requiresReview && ()
            <Tooltip title="Requires review">
              <CheckCircleOutlined style={{ color: '#fa8c16' }} />
            </Tooltip>
          )}
          {branch.autoMergeEnabled && ()
            <Tooltip title="Auto-merge enabled">
              <MergeOutlined style={{ color: '#52c41a' }} />
            </Tooltip>
          )}
          <Dropdown overlay={menu} trigger={['click']}>
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export const BranchManager: React.FC<BranchManagerProps> = ({)
  projectId,
  currentBranchId,
  onBranchSelect,
  onBranchCreate,
  onBranchUpdate,
  onBranchDelete
}) => {
  const [hierarchy, setHierarchy] = useState<BranchHierarchy[]>([]);
  const [stats, setStats] = useState<BranchStatsResponse | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMergeRequestPanel, setShowMergeRequestPanel] = useState(false);
  const [_____selectedBranch, setSelectedBranch] = useState<ProjectBranch | null>(null);
  const [editingBranch, setEditingBranch] = useState<ProjectBranch | null>(null);
  const [parentBranchId, setParentBranchId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const {
    createBranch,
    updateBranch,
    deleteBranch,
    getBranchHierarchy,
    getBranchStats,
    loading,
    error
  } = useBranching();
  useEffect(() => {
    loadBranchData();
  }, [projectId]);
  const loadBranchData = async () => {
    try {
      const [hierarchyData, statsData] = await Promise.all([)
        getBranchHierarchy(projectId),
        getBranchStats(projectId)
      ]);
      setHierarchy(hierarchyData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load branch data:', error);
    }
  };
  const handleCreateBranch = async (values: unknown) => {
    try {
      const request: CreateBranchRequest = {
        projectId,
        name: values.name,
        displayName: values.displayName,
        description: values.description,
        parentBranchId: parentBranchId || undefined,
        branchType: values.branchType,
        autoMergeEnabled: values.autoMergeEnabled || false,
        requiresReview: values.requiresReview || false,
        allowForcePush: values.allowForcePush || false,
        deleteOnMerge: values.deleteOnMerge || false
      };
      const branch = await createBranch(request);
      setShowCreateModal(false);
      form.resetFields();
      setParentBranchId(null);
      onBranchCreate?.(branch);
      loadBranchData();
    } catch (error) {
      console.error('Failed to create branch:', error);
    }
  };
  const handleUpdateBranch = async (values: unknown) => {
    if (!editingBranch) return;
    try {
      const request: UpdateBranchRequest = {
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
    } catch (error) {
      console.error('Failed to update branch:', error);
    }
  };
  const handleDeleteBranch = async (branchId: string) => {
    try {
      await deleteBranch(branchId);
      onBranchDelete?.(branchId);
      loadBranchData();
    } catch (error) {
      console.error('Failed to delete branch:', error);
    }
  };
  const handleBranchSelect = (branchId: string) => {
    const branch = findBranchById(branchId);
    setSelectedBranch(branch);
    onBranchSelect?.(branchId);
  };
  const handleEditBranch = (branch: ProjectBranch) => {
    setEditingBranch(branch);
    form.setFieldsValue({)
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
  const handleCreateChild = (parentId: string) => {
    setParentBranchId(parentId);
    setShowCreateModal(true);
  };
  const findBranchById = (branchId: string): ProjectBranch | null => {
    const searchInHierarchy = (nodes: BranchHierarchy[]): ProjectBranch | null => {
      for (const node of nodes) {
        if (node.branch.id === branchId) {
          return node.branch;
        }
        const found = searchInHierarchy(node.children);
        if (found) return found;
      }
      return null;
    };
    return searchInHierarchy(hierarchy);
  };
  const renderBranchHierarchy = (nodes: BranchHierarchy[]) => {
    return nodes.map((node) => ()
      <div key={node.branch.id} style={{ marginLeft: `${node.depth * 20}px` }}>}
        <BranchNode
          branch={node.branch}
          onEdit={handleEditBranch}
          onDelete={handleDeleteBranch}
          onCreateChild={handleCreateChild}
          onSelect={handleBranchSelect}
          isSelected={node.branch.id === currentBranchId}
        />
        {node.children.length > 0 && renderBranchHierarchy(node.children)}
      </div>
    ));
  };
  return ()
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            <BranchesOutlined /> Branches
          </Title>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setShowCreateModal(true)}
            >
              New Branch
            </Button>
            <Button 
              icon={<MergeOutlined />} 
              onClick={() => setShowMergeRequestPanel(true)}
            >
              Merge Requests
            </Button>
          </Space>
        </div>
        {/* Statistics */}
        {stats && ()
          <Row gutter={16} style={{ marginTop: '16px' }}>
            <Col span={6}>
              <Statistic 
                title="Total" 
                value={stats.totalBranches}
                prefix={<BranchesOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="Active" 
                value={stats.activeBranches}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="Merged" 
                value={stats.mergedBranches}
                prefix={<MergeOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="Abandoned" 
                value={stats.abandonedBranches}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
          </Row>
        )}
      </div>
      {/* Branch List */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
        {error && ()
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            style={{ marginBottom: '16px' }}
          />
        )}
        {hierarchy.length > 0 ? ()
          <div>{renderBranchHierarchy(hierarchy)}</div>
        ) : ()
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">No branches found</Text>
          </div>
        )}
      </div>
      {/* Create Branch Modal */}
      <Modal
        title="Create New Branch"
        visible={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          form.resetFields();
          setParentBranchId(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateBranch}
          initialValues={{
            branchType: 'feature',
            autoMergeEnabled: false,
            requiresReview: false,
            allowForcePush: false,
            deleteOnMerge: false,
          }}
        >
          <Form.Item
            name="name"
            label="Branch Name"
            rules={[{ required: true, message: 'Please enter branch name' }]}
          >
            <Input placeholder="e.g., feature/user-authentication" />
          </Form.Item>
          <Form.Item name="displayName" label="Display Name">
            <Input placeholder="e.g., User Authentication Feature" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Describe the purpose of this branch..." />
          </Form.Item>
          <Form.Item name="branchType" label="Branch Type">
            <Select>
              {Object.entries(BRANCH_TYPE_DESCRIPTIONS).map(([key, description]) => ()
                <Option key={key} value={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)} - {description}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Divider />
          <Form.Item name="autoMergeEnabled" valuePropName="checked">
            <Switch /> Auto-merge when approved
          </Form.Item>
          <Form.Item name="requiresReview" valuePropName="checked">
            <Switch /> Require review before merge
          </Form.Item>
          <Form.Item name="allowForcePush" valuePropName="checked">
            <Switch /> Allow force push
          </Form.Item>
          <Form.Item name="deleteOnMerge" valuePropName="checked">
            <Switch /> Delete branch after merge
          </Form.Item>
          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <Space>
              <Button onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Branch
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
      {/* Edit Branch Modal */}
      <Modal
        title="Edit Branch Settings"
        visible={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setEditingBranch(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {editingBranch && ()
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateBranch}
          >
            <Form.Item name="displayName" label="Display Name">
              <Input placeholder="e.g., User Authentication Feature" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <TextArea rows={3} placeholder="Describe the purpose of this branch..." />
            </Form.Item>
            <Form.Item name="protectionLevel" label="Protection Level">
              <Select>
                {Object.entries(PROTECTION_LEVEL_DESCRIPTIONS).map(([key, description]) => ()
                  <Option key={key} value={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)} - {description}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Divider />
            <Form.Item name="autoMergeEnabled" valuePropName="checked">
              <Switch /> Auto-merge when approved
            </Form.Item>
            <Form.Item name="requiresReview" valuePropName="checked">
              <Switch /> Require review before merge
            </Form.Item>
            <Form.Item name="allowForcePush" valuePropName="checked">
              <Switch /> Allow force push
            </Form.Item>
            <Form.Item name="deleteOnMerge" valuePropName="checked">
              <Switch /> Delete branch after merge
            </Form.Item>
            <div style={{ textAlign: 'right', marginTop: '24px' }}>
              <Space>
                <Button onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Update Branch
                </Button>
              </Space>
            </div>
          </Form>
        )}
      </Modal>
      {/* Merge Request Panel */}
      <Drawer
        title="Merge Requests"
        placement="right"
        onClose={() => setShowMergeRequestPanel(false)}
        visible={showMergeRequestPanel}
        width={800}
      >
        <MergeRequestPanel
          projectId={projectId}
          visible={showMergeRequestPanel}
          onClose={() => setShowMergeRequestPanel(false)}
        />
      </Drawer>
    </div>
  );
};