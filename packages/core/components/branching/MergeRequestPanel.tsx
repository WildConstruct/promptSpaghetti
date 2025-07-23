import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Tag, 
  Typography, 
  Space, 
  Avatar,
  Tooltip,
  Alert,
  Divider,
  Timeline,
  Badge,
  Dropdown,
  Menu
} from 'antd';
import {
  MergeOutlined,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  CommentOutlined,
  UserOutlined,
  ClockCircleOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BranchesOutlined
} from '@ant-design/icons';
import { 
  BranchMergeRequest,
  ProjectBranch,
  CreateMergeRequestRequest,
  MergeRequestStatus,
  ReviewStatus
} from '../../types/branching';
import { useBranching } from '../../hooks/useBranching';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface MergeRequestPanelProps {
  projectId: string;
  visible: boolean;
  onClose: () => void;
}

interface MergeRequestItemProps {
  mergeRequest: BranchMergeRequest;
  onView: (mergeRequest: BranchMergeRequest) => void;
  onMerge: (mergeRequest: BranchMergeRequest) => void;
  onClose: (mergeRequest: BranchMergeRequest) => void;
}

const MergeRequestItem: React.FC<MergeRequestItemProps> = ({ 
  mergeRequest, 
  onView, 
  onMerge, 
  onClose 
}) => {
  const getStatusColor = (status: MergeRequestStatus) => {
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const menu = (
    <Menu>
      <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => onView(mergeRequest)}>
        View Details
      </Menu.Item>
      {mergeRequest.status === 'open' && (
        <>
          <Menu.Item key="merge" icon={<MergeOutlined />} onClick={() => onMerge(mergeRequest)}>
            Merge
          </Menu.Item>
          <Menu.Item key="close" icon={<CloseOutlined />} onClick={() => onClose(mergeRequest)}>
            Close
          </Menu.Item>
        </>
      )}
    </Menu>
  );

  return (
    <Card size="small" style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Text strong>{mergeRequest.title}</Text>
            <Tag color={getStatusColor(mergeRequest.status) as any}>
              {mergeRequest.status.toUpperCase()}
            </Tag>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <Space size="small">
              <BranchesOutlined />
              <Text code style={{ fontSize: '11px' }}>
                {/* Would show branch names here */}
                source → target
              </Text>
            </Space>
            
            <Space size="small">
              <UserOutlined />
              <Text type="secondary" style={{ fontSize: '11px' }}>
                Created by User
              </Text>
            </Space>
            
            <Space size="small">
              <ClockCircleOutlined />
              <Text type="secondary" style={{ fontSize: '11px' }}>
                {formatDate(mergeRequest.createdAt)}
              </Text>
            </Space>
          </div>
          
          {mergeRequest.description && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {mergeRequest.description}
            </Text>
          )}
          
          <div style={{ marginTop: '8px' }}>
            <Space>
              <Badge count={mergeRequest.commitsCount} size="small">
                <Tag size="small">Commits</Tag>
              </Badge>
              <Badge count={mergeRequest.filesChanged} size="small">
                <Tag size="small">Files</Tag>
              </Badge>
              <Badge count={mergeRequest.reviewers.length} size="small">
                <Tag size="small">Reviewers</Tag>
              </Badge>
            </Space>
          </div>
        </div>
        
        <Dropdown overlay={menu} trigger={['click']}>
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </Dropdown>
      </div>
    </Card>
  );
};

export const MergeRequestPanel: React.FC<MergeRequestPanelProps> = ({
  projectId,
  visible,
  onClose
}) => {
  const [mergeRequests, _____setMergeRequests] = useState<BranchMergeRequest[]>([]);
  const [branches, setBranches] = useState<ProjectBranch[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMergeRequest, setSelectedMergeRequest] = useState<BranchMergeRequest | null>(null);
  const [form] = Form.useForm();

  const { 
    listBranches,
    createMergeRequest,
    mergeBranch,
    loading,
    error
  } = useBranching();

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
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleCreateMergeRequest = async (values: unknown) => {
    try {
      const request: CreateMergeRequestRequest = {
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
    } catch (error) {
      console.error('Failed to create merge request:', error);
    }
  };

  const handleMergeBranch = async (mergeRequest: BranchMergeRequest) => {
    try {
      await mergeBranch({
        mergeRequestId: mergeRequest.id,
        mergeStrategy: 'merge',
        deleteSourceBranch: mergeRequest.deleteSourceBranch
      });
      loadData();
    } catch (error) {
      console.error('Failed to merge branch:', error);
    }
  };

  const handleCloseMergeRequest = async (mergeRequest: BranchMergeRequest) => {
    // Would implement close functionality
    console.log('Closing merge request:', mergeRequest.id);
  };

  const handleViewMergeRequest = (mergeRequest: BranchMergeRequest) => {
    setSelectedMergeRequest(mergeRequest);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={4} style={{ margin: 0 }}>
          Merge Requests
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCreateModal(true)}>
          Create Merge Request
        </Button>
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: '16px' }}
        />
      )}

      <div style={{ minHeight: '400px' }}>
        {mergeRequests.length > 0 ? (
          <List
            dataSource={mergeRequests}
            renderItem={(mergeRequest) => (
              <MergeRequestItem
                key={mergeRequest.id}
                mergeRequest={mergeRequest}
                onView={handleViewMergeRequest}
                onMerge={handleMergeBranch}
                onClose={handleCloseMergeRequest}
              />
            )}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">No merge requests found</Text>
          </div>
        )}
      </div>

      {/* Create Merge Request Modal */}
      <Modal
        title="Create Merge Request"
        visible={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateMergeRequest}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="e.g., Add user authentication feature" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Describe the changes in this merge request..." />
          </Form.Item>

          <Form.Item
            name="sourceBranchId"
            label="Source Branch"
            rules={[{ required: true, message: 'Please select source branch' }]}
          >
            <Select placeholder="Select source branch">
              {branches.map(branch => (
                <Option key={branch.id} value={branch.id}>
                  {branch.displayName || branch.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="targetBranchId"
            label="Target Branch"
            rules={[{ required: true, message: 'Please select target branch' }]}
          >
            <Select placeholder="Select target branch">
              {branches.map(branch => (
                <Option key={branch.id} value={branch.id}>
                  {branch.displayName || branch.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="reviewers" label="Reviewers">
            <Select mode="multiple" placeholder="Select reviewers">
              {/* Would populate with project members */}
            </Select>
          </Form.Item>

          <Form.Item name="assignedTo" label="Assignee">
            <Select placeholder="Select assignee">
              {/* Would populate with project members */}
            </Select>
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <Space>
              <Button onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Merge Request
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Merge Request Details Modal */}
      <Modal
        title="Merge Request Details"
        visible={selectedMergeRequest !== null}
        onCancel={() => setSelectedMergeRequest(null)}
        footer={null}
        width={800}
      >
        {selectedMergeRequest && (
          <div>
            <Title level={4}>{selectedMergeRequest.title}</Title>
            <div style={{ marginBottom: '16px' }}>
              <Tag color={getStatusColor(selectedMergeRequest.status) as any}>
                {selectedMergeRequest.status.toUpperCase()}
              </Tag>
            </div>
            <Text>{selectedMergeRequest.description}</Text>
            
            <Divider />
            
            <div>
              <Text strong>Changes:</Text>
              <div style={{ marginTop: '8px' }}>
                <Space>
                  <Tag>{selectedMergeRequest.commitsCount} commits</Tag>
                  <Tag>{selectedMergeRequest.filesChanged} files changed</Tag>
                  <Tag>+{selectedMergeRequest.additionsCount} additions</Tag>
                  <Tag>-{selectedMergeRequest.deletionsCount} deletions</Tag>
                </Space>
              </div>
            </div>
            
            <Divider />
            
            <div>
              <Text strong>Reviews:</Text>
              <div style={{ marginTop: '8px' }}>
                {selectedMergeRequest.reviewers.length > 0 ? (
                  <Text>Reviews pending from {selectedMergeRequest.reviewers.length} reviewers</Text>
                ) : (
                  <Text type="secondary">No reviewers assigned</Text>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};