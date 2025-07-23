/**
 * Policy Management Dashboard - Epic 17.5.4
 * 
 * Main admin dashboard for marketplace policy management and enforcement.
 * Provides unified interface for Epic 17 Backstage Admin Controls.
 * 
 * Part of Epic 17 - Backstage Admin Controls
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Tabs,
  DatePicker,
  Select,
  Input,
  Modal,
  Form,
  message,
  Progress,
  Alert,
  Drawer,
  List,
  Avatar,
  Divider
} from 'antd';
import {
  FileTextOutlined,
  ShieldCheckOutlined,
  WarningOutlined,
  TrendingUpOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  BellOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

// Types and interfaces
interface PolicyStats {
  total_policies: number;
  active_policies: number;
  pending_approvals: number;
  total_violations: number;
  open_violations: number;
  appeal_rate: number;
}

interface PolicyDashboardData {
  statistics: PolicyStats;
  recent_activities: unknown[];
  policy_compliance_scores: Record<string, number>;
  enforcement_metrics: unknown;
  trending_violations: unknown[];
}

interface Policy {
  id: string;
  title: string;
  policy_type: string;
  status: string;
  version: string;
  created_at: string;
  last_modified: string;
  compliance_score: number;
}

interface Violation {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  reported_at: string;
  description: string;
  policy_id?: string;
  seller_id: string;
}

export const PolicyManagementDashboard: React.FC = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<PolicyDashboardData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const [violationDrawerVisible, setViolationDrawerVisible] = useState(false);
  const [___filters, setFilters] = useState({
    dateRange: null as any,
    policyType: null as string | null,
    violationStatus: null as string | null
  });

  // Data fetching
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Mock API calls - replace with actual API integration
      const [dashboardResponse, policiesResponse, violationsResponse] = await Promise.all([
        fetch('/admin/policy-management/dashboard').then(r => r.json()),
        fetch('/admin/policy-management/policies').then(r => r.json()),
        fetch('/admin/policy-management/violations').then(r => r.json())
      ]);

      setDashboardData(dashboardResponse);
      setPolicies(policiesResponse.data || []);
      setViolations(violationsResponse.data || []);
    } catch (error) {
      message.error('Failed to load dashboard data');
      console.error('Dashboard loading error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Event handlers
  const handlePolicyCreate = () => {
    setPolicyModalVisible(true);
    setSelectedPolicy(null);
  };

  const handlePolicyEdit = (policy: Policy) => {
    setSelectedPolicy(policy);
    setPolicyModalVisible(true);
  };

  const handleViolationView = (violation: Violation) => {
    setSelectedViolation(violation);
    setViolationDrawerVisible(true);
  };

  const handlePolicyStatusChange = async (policyId: string, status: string) => {
    try {
      // Mock API call
      await fetch(`/admin/policy-management/policies/${policyId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      message.success('Policy status updated successfully');
      fetchDashboardData();
    } catch (error) {
      message.error('Failed to update policy status');
    }
  };

  const handleViolationReview = async (violationId: string, action: string) => {
    try {
      await fetch(`/admin/policy-management/violations/${violationId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      message.success('Violation reviewed successfully');
      fetchDashboardData();
      setViolationDrawerVisible(false);
    } catch (error) {
      message.error('Failed to review violation');
    }
  };

  // Column definitions
  const policyColumns = [
    {
      title: 'Policy Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Policy) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.policy_type.replace('_', ' ').toUpperCase()}
          </Text>
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          active: { color: 'green', icon: <CheckCircleOutlined /> },
          draft: { color: 'orange', icon: <EditOutlined /> },
          under_review: { color: 'blue', icon: <EyeOutlined /> },
          archived: { color: 'gray', icon: <DeleteOutlined /> }
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
        return (
          <Tag color={config.color} icon={config.icon}>
            {status.replace('_', ' ').toUpperCase()}
          </Tag>
        );
      }
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (version: string) => <Tag>{version}</Tag>
    },
    {
      title: 'Compliance Score',
      dataIndex: 'compliance_score',
      key: 'compliance_score',
      render: (score: number) => (
        <Progress 
          percent={score} 
          size="small" 
          status={score > 80 ? 'success' : score > 60 ? 'normal' : 'exception'}
        />
      )
    },
    {
      title: 'Last Modified',
      dataIndex: 'last_modified',
      key: 'last_modified',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Policy) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handlePolicyEdit(record)} />
          <Button size="small" icon={<EditOutlined />} type="primary" />
          {record.status === 'draft' && (
            <Button 
              size="small" 
              type="primary"
              onClick={() => handlePolicyStatusChange(record.id, 'published')}
            >
              Publish
            </Button>
          )}
        </Space>
      )
    }
  ];

  const violationColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="red">
          {type.replace('_', ' ').toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => {
        const colors = { low: 'green', medium: 'orange', high: 'red', critical: 'purple' };
        return <Tag color={colors[severity as keyof typeof colors]}>{severity.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          open: { color: 'red', icon: <ExclamationCircleOutlined /> },
          under_review: { color: 'blue', icon: <EyeOutlined /> },
          resolved: { color: 'green', icon: <CheckCircleOutlined /> },
          dismissed: { color: 'gray', icon: <CloseCircleOutlined /> }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return config ? (
          <Tag color={config.color} icon={config.icon}>
            {status.replace('_', ' ').toUpperCase()}
          </Tag>
        ) : <Tag>{status}</Tag>;
      }
    },
    {
      title: 'Reported Date',
      dataIndex: 'reported_at',
      key: 'reported_at',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Violation) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => handleViolationView(record)}
          >
            Review
          </Button>
        </Space>
      )
    }
  ];

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <ShieldCheckOutlined style={{ marginRight: '12px' }} />
          Policy Management Dashboard
        </Title>
        <Paragraph type="secondary">
          Manage marketplace policies, enforcement rules, and violation reviews from a unified admin interface.
        </Paragraph>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Total Policies"
              value={dashboardData?.statistics.total_policies || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Active Policies"
              value={dashboardData?.statistics.active_policies || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Pending Approvals"
              value={dashboardData?.statistics.pending_approvals || 0}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Total Violations"
              value={dashboardData?.statistics.total_violations || 0}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Open Violations"
              value={dashboardData?.statistics.open_violations || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Appeal Rate"
              value={dashboardData?.statistics.appeal_rate || 0}
              prefix={<TrendingUpOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          tabBarExtraContent={
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchDashboardData}
              loading={loading}
            >
              Refresh
            </Button>
          }
        >
          <TabPane tab="Overview" key="overview">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <Card title="Policy Compliance Trends" style={{ marginBottom: '16px' }}>
                  {/* Compliance trends chart would go here */}
                  <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text type="secondary">Compliance trends visualization</Text>
                  </div>
                </Card>
                <Card title="Violation Trends">
                  {/* Violation trends chart would go here */}
                  <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text type="secondary">Violation trends visualization</Text>
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Recent Activities" style={{ marginBottom: '16px' }}>
                  <List
                    dataSource={dashboardData?.recent_activities?.slice(0, 5) || []}
                    renderItem={(item: unknown) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<BellOutlined />} />}
                          title={item.title}
                          description={item.description}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
                <Card title="Quick Actions">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button type="primary" block onClick={handlePolicyCreate}>
                      Create New Policy
                    </Button>
                    <Button block>
                      Create Enforcement Rule
                    </Button>
                    <Button block>
                      Generate Compliance Report
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Policies" key="policies">
            <div style={{ marginBottom: '16px' }}>
              <Space>
                <Button type="primary" onClick={handlePolicyCreate}>
                  Create Policy
                </Button>
                <Select
                  placeholder="Filter by type"
                  style={{ width: 200 }}
                  allowClear
                  onChange={(value) => setFilters(prev => ({ ...prev, policyType: value }))}
                >
                  <Option value="content_policy">Content Policy</Option>
                  <Option value="seller_guidelines">Seller Guidelines</Option>
                  <Option value="quality_standards">Quality Standards</Option>
                  <Option value="pricing_policy">Pricing Policy</Option>
                </Select>
                <Search 
                  placeholder="Search policies..." 
                  style={{ width: 200 }} 
                  onSearch={(value) => console.log('Search:', value)}
                />
              </Space>
            </div>
            <Table
              dataSource={policies}
              columns={policyColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              loading={loading}
            />
          </TabPane>

          <TabPane tab="Violations" key="violations">
            <div style={{ marginBottom: '16px' }}>
              <Space>
                <Select
                  placeholder="Filter by status"
                  style={{ width: 150 }}
                  allowClear
                  onChange={(value) => setFilters(prev => ({ ...prev, violationStatus: value }))}
                >
                  <Option value="open">Open</Option>
                  <Option value="under_review">Under Review</Option>
                  <Option value="resolved">Resolved</Option>
                  <Option value="dismissed">Dismissed</Option>
                </Select>
                <RangePicker onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))} />
                <Search 
                  placeholder="Search violations..." 
                  style={{ width: 200 }} 
                  onSearch={(value) => console.log('Search:', value)}
                />
              </Space>
            </div>
            <Table
              dataSource={violations}
              columns={violationColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              loading={loading}
            />
          </TabPane>

          <TabPane tab="Analytics" key="analytics">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Policy Compliance by Framework">
                  {/* Compliance by framework chart */}
                  <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text type="secondary">Compliance by framework chart</Text>
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Enforcement Actions Distribution">
                  {/* Enforcement actions chart */}
                  <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text type="secondary">Enforcement actions distribution</Text>
                  </div>
                </Card>
              </Col>
              <Col xs={24}>
                <Card title="Violation Resolution Time Trends">
                  {/* Resolution time trends */}
                  <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text type="secondary">Resolution time trends chart</Text>
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Policy Creation/Edit Modal */}
      <Modal
        title={selectedPolicy ? 'Edit Policy' : 'Create New Policy'}
        visible={policyModalVisible}
        onCancel={() => setPolicyModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form layout="vertical">
          <Form.Item label="Policy Title" required>
            <Input placeholder="Enter policy title" />
          </Form.Item>
          <Form.Item label="Policy Type" required>
            <Select placeholder="Select policy type">
              <Option value="content_policy">Content Policy</Option>
              <Option value="seller_guidelines">Seller Guidelines</Option>
              <Option value="quality_standards">Quality Standards</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Description">
            <Input.TextArea rows={4} placeholder="Enter policy description" />
          </Form.Item>
          <Space>
            <Button type="primary">Save Draft</Button>
            <Button>Save & Publish</Button>
            <Button onClick={() => setPolicyModalVisible(false)}>Cancel</Button>
          </Space>
        </Form>
      </Modal>

      {/* Violation Review Drawer */}
      <Drawer
        title="Review Violation"
        visible={violationDrawerVisible}
        onClose={() => setViolationDrawerVisible(false)}
        width={600}
      >
        {selectedViolation && (
          <div>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={4}>Violation Details</Title>
                <Paragraph>
                  <Text strong>Type:</Text> {selectedViolation.type.replace('_', ' ')}
                </Paragraph>
                <Paragraph>
                  <Text strong>Severity:</Text> <Tag color="red">{selectedViolation.severity.toUpperCase()}</Tag>
                </Paragraph>
                <Paragraph>
                  <Text strong>Description:</Text> {selectedViolation.description}
                </Paragraph>
                <Paragraph>
                  <Text strong>Reported:</Text> {new Date(selectedViolation.reported_at).toLocaleString()}
                </Paragraph>
              </div>
              
              <Divider />
              
              <div>
                <Title level={4}>Resolution Actions</Title>
                <Space>
                  <Button 
                    type="primary" 
                    danger
                    onClick={() => handleViolationReview(selectedViolation.id, 'uphold')}
                  >
                    Uphold Violation
                  </Button>
                  <Button onClick={() => handleViolationReview(selectedViolation.id, 'dismiss')}>
                    Dismiss
                  </Button>
                  <Button onClick={() => handleViolationReview(selectedViolation.id, 'escalate')}>
                    Escalate
                  </Button>
                </Space>
              </div>
            </Space>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default PolicyManagementDashboard;