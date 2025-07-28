import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Avatar, 
  Typography, 
  Tag, 
  Tooltip, 
  Space, 
  Button,
  Drawer,
  List,
  Badge,
  Switch,
  Divider,
  Alert,
  Popover,
  Timeline,
  Empty
} from 'antd';
import {
  UserOutlined,
  HistoryOutlined,
  EyeOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  NodeIndexOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { 
  ChangeAttribution,
  AttributionPrivacySettings,
  ResourceType,
  ChangeType,
  CHANGE_TYPE_DESCRIPTIONS,
  RESOURCE_TYPE_DESCRIPTIONS,
  AUTHOR_TYPE_DESCRIPTIONS
} from '../../types/attribution';
import { useAttribution } from '../../hooks/useAttribution';
import { ContributorVisualization } from './ContributorVisualization';
const { Text, _____Title } = Typography;
interface AttributionPanelProps {
  projectId: string;
  selectedResourceType?: ResourceType;
  selectedResourceId?: string;
  visible: boolean;
  onClose: () => void;
  onAttributionRecord?: (attribution: ChangeAttribution) => void;
}
interface AuthorIndicatorProps {
  attribution: ChangeAttribution;
  showDetails?: boolean;
  onClick?: () => void;
}
const AuthorIndicator: React.FC<AuthorIndicatorProps> = ({ attribution, showDetails = true, onClick }) => {
  const getAuthorInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  const getAuthorColor = (authorType: string) => {
    switch (authorType) {
    case 'user':
      return '#1890ff';
    case 'anonymous':
      return '#d9d9d9';
    case 'guest':
      return '#faad14';
    case 'system':
      return '#52c41a';
    case 'api':
      return '#722ed1';
    default:
      return '#8c8c8c';
    }
  };
  const getChangeTypeIcon = (changeType: ChangeType) => {
    switch (changeType) {
    case 'create':
      return <PlusOutlined style={{ color: '#52c41a' }} />;
    case 'update':
      return <EditOutlined style={{ color: '#1890ff' }} />;
    case 'delete':
      return <DeleteOutlined style={{ color: '#ff4d4f' }} />;
    case 'move':
      return <NodeIndexOutlined style={{ color: '#722ed1' }} />;
    case 'connection_change':
      return <ShareAltOutlined style={{ color: '#fa8c16' }} />;
    default:
      return <EditOutlined />;
    }
  };
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;}
    if (hours < 24) return `${hours}h ago`;}
    if (days < 7) return `${days}d ago`;}
    return date.toLocaleDateString();
  };
  const content = (;);
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Avatar
        size={24}
        style={{ backgroundColor: getAuthorColor(attribution.authorType) }}
        icon={<UserOutlined />}
      >
        {getAuthorInitials(attribution.authorName)}
      </Avatar>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Text strong style={{ fontSize: '12px' }}>
            {attribution.authorName || 'Anonymous'}
          </Text>
          <Tag color={getAuthorColor(attribution.authorType)} size="small">
            {attribution.authorType}
          </Tag>
        </div>
        {showDetails && ()
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            {getChangeTypeIcon(attribution.changeType)}
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {CHANGE_TYPE_DESCRIPTIONS[attribution.changeType]}
            </Text>
            <ClockCircleOutlined style={{ fontSize: '10px', color: '#999' }} />
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {formatTime(attribution.createdAt)}
            </Text>
            {attribution.isCollaborative && ()
              <TeamOutlined style={{ fontSize: '10px', color: '#722ed1' }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
  if (onClick) {
    return ();
      <div 
        style={{ cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
        onClick={onClick}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        {content}
      </div>
    );
  }
  return content;
};

export const AttributionPanel: React.FC<AttributionPanelProps> = ({)
  projectId,
  selectedResourceType,
  selectedResourceId,
  visible,
  onClose,
  onAttributionRecord
}) => {
  const [attributions, setAttributions] = useState<ChangeAttribution[]>([]);
  const [showContributors, setShowContributors] = useState(false);
  const [privacySettings, setPrivacySettings] = useState<AttributionPrivacySettings | null>(null);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [selectedAttribution, setSelectedAttribution] = useState<ChangeAttribution | null>(null);
  const { 
    listAttributions, 
    getResourceAttribution, 
    getPrivacySettings, 
    updatePrivacySettings,
    loading, 
    error 
  } = useAttribution();
  useEffect(() => {
    if (visible) {
      loadPrivacySettings();
      if (selectedResourceType && selectedResourceId) {
        loadResourceAttributions();
      } else {
        loadRecentAttributions();
      }
    }
  }, [visible, projectId, selectedResourceType, selectedResourceId]);
  const loadPrivacySettings = async () => {
    try {
      const settings = await getPrivacySettings(projectId);
      setPrivacySettings(settings);
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    }
  };
  const loadResourceAttributions = async () => {
    if (!selectedResourceType || !selectedResourceId) return;
    try {
      const resourceAttributions = await getResourceAttribution(;);
        projectId, 
        selectedResourceType, 
        selectedResourceId
      );
      setAttributions(resourceAttributions);
    } catch (error) {
      console.error('Failed to load resource attributions:', error);
    }
  };
  const loadRecentAttributions = async () => {
    try {
      const recentAttributions = await listAttributions({)
        projectId,
        limit: 50,
        offset: 0,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      setAttributions(recentAttributions);
    } catch (error) {
      console.error('Failed to load recent attributions:', error);
    }
  };
  const handlePrivacySettingsChange = async (settings: Partial<AttributionPrivacySettings>) => {
    try {
      const updatedSettings = await updatePrivacySettings({)
        projectId,
        settings: { ...privacySettings, ...settings } as any
      });
      setPrivacySettings(updatedSettings);
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
    }
  };
  const handleAttributionClick = (attribution: ChangeAttribution) => {
    setSelectedAttribution(attribution);
  };
  const groupedAttributions = attributions.reduce((groups, attribution) => {
    const key = `${attribution.resourceType}:${attribution.resourceId}`;}
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(attribution);
    return groups;
  }, {} as Record<string, ChangeAttribution[]>);
  const renderAttributionList = () => {
    if (selectedResourceType && selectedResourceId) {
      // Show attributions for specific resource
      return ();
        <div>
          <div style={{ marginBottom: '12px' }}>
            <Text strong>Changes to {selectedResourceType} {selectedResourceId}</Text>
          </div>
          <List
            size="small"
            dataSource={attributions}
            renderItem={(attribution) => ()
              <List.Item style={{ padding: '8px 0' }}>
                <AuthorIndicator
                  attribution={attribution}
                  onClick={() => handleAttributionClick(attribution)}
                />
              </List.Item>
            )}
          />
        </div>
      );
    } else {
      // Show recent attributions grouped by resource
      return ();
        <div>
          <div style={{ marginBottom: '12px' }}>
            <Text strong>Recent Changes</Text>
          </div>
          {Object.entries(groupedAttributions).map(([resourceKey, resourceAttributions]) => {
            const [resourceType, resourceId] = resourceKey.split(':');
            const _____latestAttribution = resourceAttributions[0];
            return ();
              <Card 
                key={resourceKey} 
                size="small" 
                style={{ marginBottom: '8px' }}
                hoverable
              >
                <div style={{ marginBottom: '8px' }}>
                  <Space>
                    <Text strong style={{ fontSize: '12px' }}>
                      {RESOURCE_TYPE_DESCRIPTIONS[resourceType as ResourceType]}
                    </Text>
                    <Text code style={{ fontSize: '11px' }}>
                      {resourceId}
                    </Text>
                    <Badge count={resourceAttributions.length} size="small" />
                  </Space>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {resourceAttributions.slice(0, 3).map((attribution) => ()
                    <Tooltip
                      key={attribution.id}
                      title={
                        <div>
                          <div>{attribution.authorName || 'Anonymous'}</div>
                          <div>{CHANGE_TYPE_DESCRIPTIONS[attribution.changeType]}</div>
                          <div>{attribution.createdAt.toLocaleString()}</div>
                        </div>
                      }
                    >
                      <Avatar
                        size={20}
                        style={{ 
                          backgroundColor: attribution.authorType === 'user' ? '#1890ff' : '#d9d9d9',
                          fontSize: '10px',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleAttributionClick(attribution)}
                      >
                        {attribution.authorName?.[0] || '?'}
                      </Avatar>
                    </Tooltip>
                  ))}
                  {resourceAttributions.length > 3 && ()
                    <Avatar size={20} style={{ backgroundColor: '#f0f0f0', fontSize: '10px' }}>
                      +{resourceAttributions.length - 3}
                    </Avatar>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      );
    }
  };
  const renderPrivacySettings = () => (;);
    <div>
      <Alert
        message="Privacy Settings"
        description="Control how your attribution information is displayed and tracked."
        type="info"
        showIcon
        style={{ marginBottom: '16px' }}
      />
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>Show in attribution</Text>
          <Switch
            checked={privacySettings?.showInAttribution}
            onChange={(checked) => handlePrivacySettingsChange({ showInAttribution: checked })}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>Show detailed changes</Text>
          <Switch
            checked={privacySettings?.showDetailedChanges}
            onChange={(checked) => handlePrivacySettingsChange({ showDetailedChanges: checked })}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>Show timing information</Text>
          <Switch
            checked={privacySettings?.showTimingInfo}
            onChange={(checked) => handlePrivacySettingsChange({ showTimingInfo: checked })}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>Track property changes</Text>
          <Switch
            checked={privacySettings?.trackPropertyChanges}
            onChange={(checked) => handlePrivacySettingsChange({ trackPropertyChanges: checked })}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>Track position changes</Text>
          <Switch
            checked={privacySettings?.trackPositionChanges}
            onChange={(checked) => handlePrivacySettingsChange({ trackPositionChanges: checked })}
          />
        </div>
      </Space>
    </div>
  );
  const renderAttributionDetail = () => {
    if (!selectedAttribution) return null;
    return ();
      <div>
        <div style={{ marginBottom: '16px' }}>
          <Button size="small" onClick={() => setSelectedAttribution(null)}>
            ← Back
          </Button>
        </div>
        <Card title="Attribution Details" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Author:</Text>
              <div style={{ marginTop: '4px' }}>
                <AuthorIndicator attribution={selectedAttribution} showDetails={false} />
              </div>
            </div>
            <div>
              <Text strong>Change:</Text>
              <div style={{ marginTop: '4px' }}>
                <Tag color="blue">{selectedAttribution.changeType}</Tag>
                <Text>{CHANGE_TYPE_DESCRIPTIONS[selectedAttribution.changeType]}</Text>
              </div>
            </div>
            <div>
              <Text strong>Resource:</Text>
              <div style={{ marginTop: '4px' }}>
                <Text>{RESOURCE_TYPE_DESCRIPTIONS[selectedAttribution.resourceType]}</Text>
                <Text code style={{ marginLeft: '8px' }}>
                  {selectedAttribution.resourceId}
                </Text>
              </div>
            </div>
            <div>
              <Text strong>Time:</Text>
              <div style={{ marginTop: '4px' }}>
                <Text>{selectedAttribution.createdAt.toLocaleString()}</Text>
              </div>
            </div>
            {selectedAttribution.changeDescription && ()
              <div>
                <Text strong>Description:</Text>
                <div style={{ marginTop: '4px' }}>
                  <Text>{selectedAttribution.changeDescription}</Text>
                </div>
              </div>
            )}
            {selectedAttribution.isCollaborative && ()
              <div>
                <Text strong>Collaboration:</Text>
                <div style={{ marginTop: '4px' }}>
                  <Tag color="purple">
                    <TeamOutlined /> {selectedAttribution.collaboratorCount} collaborators
                  </Tag>
                </div>
              </div>
            )}
            <div>
              <Text strong>Confidence:</Text>
              <div style={{ marginTop: '4px' }}>
                <Text>{(selectedAttribution.confidenceScore * 100).toFixed(1)}%</Text>
              </div>
            </div>
          </Space>
        </Card>
      </div>
    );
  };
  return ();
    <Drawer
      title="Change Attribution"
      placement="right"
      onClose={onClose}
      visible={visible}
      width={400}
      extra={
        <Space>
          <Tooltip title="Contributors">
            <Button
              icon={<TeamOutlined />}
              size="small"
              onClick={() => setShowContributors(true)}
            />
          </Tooltip>
          <Tooltip title="Privacy Settings">
            <Button
              icon={<SettingOutlined />}
              size="small"
              onClick={() => setShowPrivacySettings(true)}
            />
          </Tooltip>
        </Space>
      }
    >
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
      {privacySettings && !privacySettings.showInAttribution && ()
        <Alert
          message="Attribution Disabled"
          description="You have disabled attribution tracking. Your changes will not be attributed to you."
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}
      {selectedAttribution ? renderAttributionDetail() : ()
        <div style={{ minHeight: '400px' }}>
          {attributions.length > 0 ? renderAttributionList() : ()
            <Empty description="No attributions found" />
          )}
        </div>
      )}
      {/* Contributors Modal */}
      <Drawer
        title="Contributors"
        placement="right"
        onClose={() => setShowContributors(false)}
        visible={showContributors}
        width={800}
      >
        <ContributorVisualization
          projectId={projectId}
          visible={showContributors}
          onClose={() => setShowContributors(false)}
        />
      </Drawer>
      {/* Privacy Settings Modal */}
      <Drawer
        title="Privacy Settings"
        placement="right"
        onClose={() => setShowPrivacySettings(false)}
        visible={showPrivacySettings}
        width={400}
      >
        {renderPrivacySettings()}
      </Drawer>
    </Drawer>
  );
};