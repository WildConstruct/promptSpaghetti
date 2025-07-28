import React from 'react';
import { 
  Card, 
  Alert, 
  Typography, 
  Space, 
  Button, 
  Divider,
  Row,
  Col,
  Statistic,
  Tag,
  List,
  Tooltip
} from 'antd';
import {
  WarningOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  EditOutlined
} from '@ant-design/icons';
import { 
  RestorationPreviewResponse, 
  RestorationConfig,
  CONFLICT_DESCRIPTIONS
} from '../../types/restoration';
const { Title, Text } = Typography;
interface RestorationConfirmationProps {
  preview: RestorationPreviewResponse;,
  config: RestorationConfig;
  onConfirm: () => void;,
  onCancel: () => void;
  export const RestorationConfirmation: React.FC<RestorationConfirmationProps> = ({,)
  preview,
  config,
  onConfirm,
  onCancel
}) => {
  const hasConflicts = preview.summary.totalConflicts > 0;
  const isHighRisk = preview.summary.riskLevel === 'high';
  const totalChanges = preview.summary.totalChanges;
  const getActionSummary = () => {
    const actions = [];
    if (preview.preview.nodesToAdd.length > 0) {
      actions.push({ type: 'add', count: preview.preview.nodesToAdd.length, item: 'nodes' });
    if (preview.preview.nodesToUpdate.length > 0) {
      actions.push({ type: 'update', count: preview.preview.nodesToUpdate.length, item: 'nodes' });
    if (preview.preview.nodesToDelete.length > 0) {
      actions.push({ type: 'delete', count: preview.preview.nodesToDelete.length, item: 'nodes' });
    if (preview.preview.edgesToAdd.length > 0) {
      actions.push({ type: 'add', count: preview.preview.edgesToAdd.length, item: 'edges' });
    if (preview.preview.edgesToUpdate.length > 0) {
      actions.push({ type: 'update', count: preview.preview.edgesToUpdate.length, item: 'edges' });
    if (preview.preview.edgesToDelete.length > 0) {
      actions.push({ type: 'delete', count: preview.preview.edgesToDelete.length, item: 'edges' });
    return actions;
  };
  const getConflictSummary = () => {
    const conflictTypes = preview.conflicts.reduce((acc, conflict) => {
      acc[conflict.conflictType] = (acc[conflict.conflictType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(conflictTypes).map(([type, count]) => ({)
  type,
  count,
  description: CONFLICT_DESCRIPTIONS[type as keyof typeof CONFLICT_DESCRIPTIONS],
}));
  };
  const getActionIcon = (type: string) => {
    switch (type) {
    case 'add':
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    case 'update':
      return <EditOutlined style={{ color: '#1890ff' }} />;
    case 'delete':
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    default:
      return <InfoCircleOutlined />;
  };
  const _____getActionColor = (type: string) => {
  switch (type) {
  case 'add':,
  return 'success';
  case 'update':,
  return 'processing';
  case 'delete':,
  return 'error';
  default:,
  return 'default';
};
  const formatDuration = (milliseconds: number) => {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;}
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) {
      return `${seconds}s`;}
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;}
  };
  return;
    <div>
      {/* Risk Assessment */}
      {isHighRisk && ()
        <Alert
          type="error"
          message="High Risk Operation"
          description="This restoration operation has been classified as high risk due to the number of conflicts and changes involved. Please review carefully before proceeding."
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}
      {hasConflicts && ()
        <Alert
          type="warning"
          message="Conflicts Require Resolution"
          description={`${preview.summary.totalConflicts} conflicts were detected and must be resolved before the restoration can proceed.`}
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}
      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Changes"
              value={totalChanges}
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
              valueStyle={{ color: hasConflicts ? '#ff4d4f' : '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Estimated Duration"
              value={formatDuration(preview.summary.estimatedDuration)}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Risk Level"
              value={preview.summary.riskLevel.toUpperCase()}
              prefix={<SafetyOutlined />}
              valueStyle={{
  color: preview.summary.riskLevel === 'high' ? '#ff4d4f' : ,
  preview.summary.riskLevel === 'medium' ? '#fa8c16' : '#3f8600',
}}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          {/* Action Summary */}
          <Card title="Actions to be Performed" style={{ marginBottom: '16px' }}>
            <List
              size="small"
              dataSource={getActionSummary()}
              renderItem={(action) => ()
                <List.Item>
                  <Space>
                    {getActionIcon(action.type)}
                    <Text strong>{action.type.toUpperCase()}</Text>
                    <Text>{action.count}</Text>
                    <Text type="secondary">{action.item}</Text>
                  </Space>
                </List.Item>
              )}
            />
            {totalChanges === 0 && ()
              <Text type="secondary">No changes will be made.</Text>
            )}
          </Card>
          {/* Configuration Summary */}
          <Card title="Configuration" style={{ marginBottom: '16px' }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div>
                <Text strong>Restoration Type: </Text>
                <Tag color="blue">{config.restorationType}</Tag>
              </div>
              <div>
                <Text strong>Strategy: </Text>
                <Tag color="green">{config.restorationStrategy}</Tag>
              </div>
              <div>
                <Text strong>Preserve Changes: </Text>
                <Tag color={config.preserveCurrentChanges ? 'success' : 'default'}>
                  {config.preserveCurrentChanges ? 'Yes' : 'No'}
                </Tag>
              </div>
              <div>
                <Text strong>Create Backup: </Text>
                <Tag color={config.createBackup ? 'success' : 'default'}>
                  {config.createBackup ? 'Yes' : 'No'}
                </Tag>
              </div>
              <div>
                <Text strong>Notify on Completion: </Text>
                <Tag color={config.notifyOnCompletion ? 'success' : 'default'}>
                  {config.notifyOnCompletion ? 'Yes' : 'No'}
                </Tag>
              </div>
            </Space>
          </Card>
        </Col>
        <Col span={12}>
          {/* Conflict Summary */}
          {hasConflicts && ()
            <Card title="Conflicts Detected" style={{ marginBottom: '16px' }}>
              <List
                size="small"
                dataSource={getConflictSummary()}
                renderItem={(conflict) => ()
                  <List.Item>
                    <Space>
                      <WarningOutlined style={{ color: '#fa8c16' }} />
                      <Text strong>{conflict.count}</Text>
                      <Tooltip title={conflict.description}>
                        <Text>{conflict.type.replace('_', ' ')}</Text>
                      </Tooltip>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          )}
          {/* Safety Measures */}
          <Card title="Safety Measures" style={{ marginBottom: '16px' }}>
            <List
              size="small"
              dataSource={[
                {
  text: 'Backup will be created before restoration',
  enabled: config.createBackup,
  icon: <SafetyOutlined />,
}
                {
  text: 'Current changes will be preserved where possible',
  enabled: config.preserveCurrentChanges,
  icon: <CheckCircleOutlined />,
}
                {
  text: 'Operation can be monitored in real-time',
  enabled: true,
  icon: <InfoCircleOutlined />,
}
                { 
                  text: 'Notification will be sent on completion', 
                  enabled: config.notifyOnCompletion,
                  icon: <InfoCircleOutlined />]}
              renderItem={(item) => ()
                <List.Item>
                  <Space>
                    {item.icon}
                    <Text 
                      type={item.enabled ? 'default' : 'secondary'} 
                      style={{ textDecoration: item.enabled ? 'none' : 'line-through' }}
                    >
                      {item.text}
                    </Text>
                    <Tag color={item.enabled ? 'success' : 'default'} size="small">
                      {item.enabled ? 'ENABLED' : 'DISABLED'}
                    </Tag>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
      <Divider />
      {/* Final Confirmation */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Title level={4}>
          Are you sure you want to proceed with this restoration?
        </Title>
        <Text type="secondary">
          This action cannot be undone. {config.createBackup && 'A backup will be created before making changes.'}
        </Text>
      </div>
      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
        <Button size="large" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="primary" 
          size="large" 
          onClick={onConfirm}
          disabled={hasConflicts}
          danger={isHighRisk}
        >
          {isHighRisk ? 'Proceed with High Risk Operation' : 'Confirm Restoration'}
        </Button>
      </div>
    </div>
  );
};