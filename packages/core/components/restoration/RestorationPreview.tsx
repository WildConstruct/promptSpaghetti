import React, { useState } from 'react';
import { 
  Card, 
  Tabs, 
  Table, 
  Tag, 
  Typography, 
  Collapse, 
  Badge, 
  Button,
  Select,
  Tooltip,
  Alert,
  Space,
  Statistic,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  MinusOutlined,
  EditOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { 
  RestorationPreviewResponse, 
  RestorationConfig, 
  RestorationConflict,
  ResolutionStrategy,
  CONFLICT_DESCRIPTIONS,
  RESOLUTION_STRATEGY_DESCRIPTIONS
} from '../../types/restoration';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

interface RestorationPreviewProps {
  preview: RestorationPreviewResponse;
  config: RestorationConfig;
  onConflictResolve: (conflictId: string, strategy: ResolutionStrategy) => void;
}

export const RestorationPreview: React.FC<RestorationPreviewProps> = ({
  preview,
  config,
  onConflictResolve
}) => {
  const [activeTab, setActiveTab] = useState('changes');
  const [conflictResolutions, setConflictResolutions] = useState<Record<string, ResolutionStrategy>>({});

  const handleConflictResolution = (conflictId: string, strategy: ResolutionStrategy) => {
    setConflictResolutions(prev => ({
      ...prev,
      [conflictId]: strategy
    }));
    onConflictResolve(conflictId, strategy);
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
    case 'add':
      return <PlusOutlined style={{ color: '#52c41a' }} />;
    case 'update':
      return <EditOutlined style={{ color: '#1890ff' }} />;
    case 'delete':
      return <MinusOutlined style={{ color: '#ff4d4f' }} />;
    default:
      return <InfoCircleOutlined />;
    }
  };

  const getChangeColor = (type: string) => {
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

  const getRiskLevelColor = (level: string) => {
    switch (level) {
    case 'low':
      return 'success';
    case 'medium':
      return 'warning';
    case 'high':
      return 'error';
    default:
      return 'default';
    }
  };

  const nodeColumns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 80,
      render: (action: string) => (
        <Tag color={getChangeColor(action) as any} icon={getChangeIcon(action)}>
          {action.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Node ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      render: (id: string) => (
        <Text code style={{ fontSize: '12px' }}>
          {id}
        </Text>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120
    },
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label',
      render: (label: string) => label || <Text type="secondary">No label</Text>
    },
    {
      title: 'Properties',
      dataIndex: 'properties',
      key: 'properties',
      render: (properties: unknown) => (
        <Text type="secondary">
          {properties ? Object.keys(properties).length : 0} properties
        </Text>
      )
    }
  ];

  const edgeColumns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 80,
      render: (action: string) => (
        <Tag color={getChangeColor(action) as any} icon={getChangeIcon(action)}>
          {action.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Edge ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      render: (id: string) => (
        <Text code style={{ fontSize: '12px' }}>
          {id}
        </Text>
      )
    },
    {
      title: 'From',
      dataIndex: 'source',
      key: 'source',
      width: 150,
      render: (source: string) => (
        <Text code style={{ fontSize: '12px' }}>
          {source}
        </Text>
      )
    },
    {
      title: 'To',
      dataIndex: 'target',
      key: 'target',
      width: 150,
      render: (target: string) => (
        <Text code style={{ fontSize: '12px' }}>
          {target}
        </Text>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120
    }
  ];

  const conflictColumns = [
    {
      title: 'Conflict',
      dataIndex: 'conflictType',
      key: 'conflictType',
      width: 150,
      render: (type: string) => (
        <Tooltip title={CONFLICT_DESCRIPTIONS[type as keyof typeof CONFLICT_DESCRIPTIONS]}>
          <Tag color="warning" icon={<WarningOutlined />}>
            {type.replace('_', ' ').toUpperCase()}
          </Tag>
        </Tooltip>
      )
    },
    {
      title: 'Resource',
      dataIndex: 'resourceId',
      key: 'resourceId',
      width: 200,
      render: (resourceId: string, record: RestorationConflict) => (
        <div>
          <Text code style={{ fontSize: '12px' }}>
            {resourceId}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {record.resourceType}
          </Text>
        </div>
      )
    },
    {
      title: 'Description',
      dataIndex: 'conflictDescription',
      key: 'conflictDescription',
      render: (description: string) => description || <Text type="secondary">No description</Text>
    },
    {
      title: 'Resolution',
      dataIndex: 'id',
      key: 'resolution',
      width: 200,
      render: (conflictId: string) => (
        <Select
          placeholder="Choose resolution"
          style={{ width: '100%' }}
          value={conflictResolutions[conflictId]}
          onChange={(value) => handleConflictResolution(conflictId, value)}
        >
          {Object.entries(RESOLUTION_STRATEGY_DESCRIPTIONS).map(([key, description]) => (
            <Option key={key} value={key}>
              <Tooltip title={description}>
                {key.replace('_', ' ').toUpperCase()}
              </Tooltip>
            </Option>
          ))}
        </Select>
      )
    }
  ];

  const allNodeChanges = [
    ...preview.preview.nodesToAdd.map((node: Error) => ({ ...node, action: 'add' })),
    ...preview.preview.nodesToUpdate.map((node: Error) => ({ ...node, action: 'update' })),
    ...preview.preview.nodesToDelete.map((id: string) => ({ id, action: 'delete' }))
  ];

  const allEdgeChanges = [
    ...preview.preview.edgesToAdd.map((edge: Error) => ({ ...edge, action: 'add' })),
    ...preview.preview.edgesToUpdate.map((edge: Error) => ({ ...edge, action: 'update' })),
    ...preview.preview.edgesToDelete.map((id: string) => ({ id, action: 'delete' }))
  ];

  const unresolvedConflicts = preview.conflicts.filter(
    conflict => !conflictResolutions[conflict.id]
  );

  return (
    <div>
      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Changes"
              value={preview.summary.totalChanges}
              prefix={<EditOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Conflicts"
              value={preview.summary.totalConflicts}
              prefix={<WarningOutlined />}
              valueStyle={{ color: preview.summary.totalConflicts > 0 ? '#ff4d4f' : '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Estimated Duration"
              value={preview.summary.estimatedDuration}
              suffix="ms"
              prefix={<InfoCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Risk Level"
              value={preview.summary.riskLevel.toUpperCase()}
              prefix={<QuestionCircleOutlined />}
              valueStyle={{ color: getRiskLevelColor(preview.summary.riskLevel) }}
            />
          </Card>
        </Col>
      </Row>

      {/* Conflicts Alert */}
      {preview.summary.totalConflicts > 0 && (
        <Alert
          type="warning"
          message="Conflicts Detected"
          description={
            <div>
              <Text>
                {preview.summary.totalConflicts} conflicts were detected that require resolution.
              </Text>
              {unresolvedConflicts.length > 0 && (
                <Text type="secondary">
                  {' '}({unresolvedConflicts.length} unresolved)
                </Text>
              )}
            </div>
          }
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* Main Content Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <Badge count={allNodeChanges.length + allEdgeChanges.length} offset={[10, 0]}>
              Changes
            </Badge>
          }
          key="changes"
        >
          <Collapse defaultActiveKey={['nodes', 'edges']}>
            <Panel
              header={
                <Space>
                  <Text strong>Node Changes</Text>
                  <Badge count={allNodeChanges.length} showZero />
                </Space>
              }
              key="nodes"
            >
              <Table
                columns={nodeColumns}
                dataSource={allNodeChanges}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 10 }}
                scroll={{ y: 300 }}
              />
            </Panel>
            <Panel
              header={
                <Space>
                  <Text strong>Edge Changes</Text>
                  <Badge count={allEdgeChanges.length} showZero />
                </Space>
              }
              key="edges"
            >
              <Table
                columns={edgeColumns}
                dataSource={allEdgeChanges}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 10 }}
                scroll={{ y: 300 }}
              />
            </Panel>
          </Collapse>
        </TabPane>

        <TabPane
          tab={
            <Badge count={preview.summary.totalConflicts} offset={[10, 0]}>
              Conflicts
            </Badge>
          }
          key="conflicts"
        >
          {preview.summary.totalConflicts > 0 ? (
            <Table
              columns={conflictColumns}
              dataSource={preview.conflicts}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 10 }}
              scroll={{ y: 400 }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary">
                No conflicts detected. The restoration can proceed without manual intervention.
              </Text>
            </div>
          )}
        </TabPane>

        <TabPane tab="Configuration" key="config">
          <Card>
            <Row gutter={16}>
              <Col span={12}>
                <Title level={5}>Restoration Settings</Title>
                <p><Text strong>Type:</Text> {config.restorationType}</p>
                <p><Text strong>Strategy:</Text> {config.restorationStrategy}</p>
                <p><Text strong>Preserve Changes:</Text> {config.preserveCurrentChanges ? 'Yes' : 'No'}</p>
              </Col>
              <Col span={12}>
                <Title level={5}>Options</Title>
                <p><Text strong>Create Backup:</Text> {config.createBackup ? 'Yes' : 'No'}</p>
                <p><Text strong>Notify on Completion:</Text> {config.notifyOnCompletion ? 'Yes' : 'No'}</p>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};