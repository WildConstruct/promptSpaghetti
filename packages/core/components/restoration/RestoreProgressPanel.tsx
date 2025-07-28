import React, { useState } from 'react';
import { 
  Card, 
  Progress, 
  Typography, 
  Space, 
  Button, 
  Statistic,
  Row,
  Col,
  Alert,
  Tag,
  List,
  Collapse,
  Tooltip,
  Modal
} from 'antd';
import {
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  StopOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { 
  RestorationProgressResponse,
  RestorationStatus
} from '../../types/restoration';
const { Title, Text } = Typography;
const { Panel } = Collapse;
interface RestoreProgressPanelProps {
  progress: RestorationProgressResponse;
  onCancel: () => void;
  showDetails?: boolean;
}

export const RestoreProgressPanel: React.FC<RestoreProgressPanelProps> = ({)
  progress,
  onCancel,
  showDetails = false
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(showDetails);
  const getStatusIcon = (status: RestorationStatus) => {
    switch (status) {
    case 'pending':
      return <ClockCircleOutlined style={{ color: '#fa8c16' }} />;
    case 'in_progress':
      return <LoadingOutlined style={{ color: '#1890ff' }} />;
    case 'completed':
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    case 'failed':
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    case 'cancelled':
      return <StopOutlined style={{ color: '#d9d9d9' }} />;
    default:
      return <InfoCircleOutlined />;
    }
  };
  const getStatusColor = (status: RestorationStatus) => {
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
  const formatTime = (milliseconds: number) => {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;}
    }
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) {
      return `${seconds}s`;}
    }
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;}
  };
  const handleCancelConfirm = () => {
    setShowCancelModal(false);
    onCancel();
  };
  const isInProgress = progress.status === 'in_progress' || progress.status === 'pending';
  const isCompleted = progress.status === 'completed';
  const isFailed = progress.status === 'failed';
  const isCancelled = progress.status === 'cancelled';
  return ()
    <div>
      {/* Status Header */}
      <Card style={{ marginBottom: '16px' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="large">
              <Space>
                {getStatusIcon(progress.status)}
                <Title level={4} style={{ margin: 0 }}>
                  {progress.status.replace('_', ' ').toUpperCase()}
                </Title>
              </Space>
              <Tag color={getStatusColor(progress.status) as any} size="large">
                {progress.status.replace('_', ' ').toUpperCase()}
              </Tag>
            </Space>
          </Col>
          <Col>
            {isInProgress && ()
              <Button 
                danger 
                icon={<StopOutlined />}
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Restoration
              </Button>
            )}
          </Col>
        </Row>
      </Card>
      {/* Progress Bar */}
      <Card title="Progress" style={{ marginBottom: '16px' }}>
        <Progress
          percent={progress.progressPercentage}
          status={getProgressStatus()}
          strokeWidth={12}
          showInfo={true}
          format={(percent) => `${percent}%`}
        />
        {progress.currentOperation && ()
          <div style={{ marginTop: '8px' }}>
            <Text type="secondary">Current operation: </Text>
            <Text code>{progress.currentOperation}</Text>
          </div>
        )}
        {progress.estimatedTimeRemaining && progress.estimatedTimeRemaining > 0 && ()
          <div style={{ marginTop: '8px' }}>
            <Text type="secondary">Estimated time remaining: </Text>
            <Text strong>{formatTime(progress.estimatedTimeRemaining)}</Text>
          </div>
        )}
      </Card>
      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Operations"
              value={progress.operationsCompleted}
              suffix={`/ ${progress.totalOperations}`}
              prefix={<EditOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Conflicts"
              value={progress.conflictsResolved}
              suffix={`/ ${progress.totalConflicts}`}
              prefix={<WarningOutlined />}
              valueStyle={{ 
                color: progress.totalConflicts > 0 ? '#fa8c16' : '#3f8600' 
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Progress"
              value={progress.progressPercentage}
              suffix="%"
              prefix={<LoadingOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Status"
              value={progress.status.replace('_', ' ').toUpperCase()}
              prefix={getStatusIcon(progress.status)}
            />
          </Card>
        </Col>
      </Row>
      {/* Error Message */}
      {isFailed && progress.errorMessage && ()
        <Alert
          type="error"
          message="Restoration Failed"
          description={progress.errorMessage}
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}
      {/* Success Message */}
      {isCompleted && ()
        <Alert
          type="success"
          message="Restoration Completed Successfully"
          description="The version restoration has been completed successfully. All changes have been applied to your project."
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}
      {/* Cancellation Message */}
      {isCancelled && ()
        <Alert
          type="info"
          message="Restoration Cancelled"
          description="The restoration operation has been cancelled. Your project remains in its previous state."
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}
      {/* Details */}
      {detailsVisible && ()
        <Card 
          title="Details" 
          extra={
            <Button 
              type="link" 
              onClick={() => setDetailsVisible(!detailsVisible)}
            >
              {detailsVisible ? 'Hide' : 'Show'} Details
            </Button>
          }
        >
          <Collapse>
            <Panel header="Operation Progress" key="operations">
              <List
                size="small"
                dataSource={[
                  { label: 'Total Operations', value: progress.totalOperations },
                  { label: 'Completed Operations', value: progress.operationsCompleted },
                  { label: 'Remaining Operations', value: progress.totalOperations - progress.operationsCompleted },
                  { label: 'Success Rate', value: `${Math.round((progress.operationsCompleted / progress.totalOperations) * 100)}%` }
                ]}
                renderItem={(item) => ()
                  <List.Item>
                    <Space>
                      <Text type="secondary">{item.label}:</Text>
                      <Text strong>{item.value}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Panel>
            <Panel header="Conflict Resolution" key="conflicts">
              <List
                size="small"
                dataSource={[
                  { label: 'Total Conflicts', value: progress.totalConflicts },
                  { label: 'Resolved Conflicts', value: progress.conflictsResolved },
                  { label: 'Remaining Conflicts', value: progress.totalConflicts - progress.conflictsResolved },
                  { label: 'Resolution Rate', value: progress.totalConflicts > 0 ? `${Math.round((progress.conflictsResolved / progress.totalConflicts) * 100)}%` : 'N/A' }
                ]}
                renderItem={(item) => ()
                  <List.Item>
                    <Space>
                      <Text type="secondary">{item.label}:</Text>
                      <Text strong>{item.value}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Panel>
            <Panel header="System Information" key="system">
              <List
                size="small"
                dataSource={[
                  { label: 'Restoration ID', value: progress.restorationAttemptId },
                  { label: 'Status', value: progress.status },
                  { label: 'Current Operation', value: progress.currentOperation || 'N/A' },
                  { label: 'Estimated Time Remaining', value: progress.estimatedTimeRemaining ? formatTime(progress.estimatedTimeRemaining) : 'N/A' }
                ]}
                renderItem={(item) => ()
                  <List.Item>
                    <Space>
                      <Text type="secondary">{item.label}:</Text>
                      <Text code style={{ fontSize: '12px' }}>{item.value}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Panel>
          </Collapse>
        </Card>
      )}
      {/* Cancel Confirmation Modal */}
      <Modal
        title="Cancel Restoration"
        visible={showCancelModal}
        onOk={handleCancelConfirm}
        onCancel={() => setShowCancelModal(false)}
        okText="Yes, Cancel"
        cancelText="No, Continue"
        okButtonProps={{ danger: true }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ExclamationCircleOutlined style={{ color: '#fa8c16', fontSize: '20px' }} />
            <Text strong>Are you sure you want to cancel this restoration?</Text>
          </div>
          <Text type="secondary">
            Cancelling the restoration will stop the process and leave your project in its current state. 
            Any changes that have already been applied will remain.
          </Text>
          <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
            <Text type="secondary">
              Progress: {progress.progressPercentage}% complete ({progress.operationsCompleted}/{progress.totalOperations} operations)
            </Text>
          </div>
        </Space>
      </Modal>
    </div>
  );
};