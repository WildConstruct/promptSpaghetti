import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Avatar, 
  Typography, 
  Timeline, 
  Tag, 
  Tooltip, 
  Space, 
  Progress,
  Row,
  Col,
  Statistic,
  List,
  Badge,
  Tabs,
  DatePicker,
  Select,
  Button,
  Empty
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  EditOutlined,
  TeamOutlined,
  TrophyOutlined,
  CalendarOutlined,
  BarChartOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import { 
  ContributorStatsResponse,
  ChangeAttribution,
  ResourceType,
  ChangeType,
  CHANGE_TYPE_DESCRIPTIONS,
  RESOURCE_TYPE_DESCRIPTIONS
} from '../../types/attribution';
import { useAttribution } from '../../hooks/useAttribution';
const { Title, Text, _____Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { _____Option } = Select;
interface ContributorVisualizationProps {
  projectId: string;
  visible?: boolean;
  onClose?: () => void;
interface ContributorCardProps {
  contributor: ContributorStatsResponse['contributors'][0];
  projectId: string;
  onViewDetails: (contributorId: string) => void;
const ContributorCard: React.FC<ContributorCardProps> = ({ contributor, _____projectId, onViewDetails }) => {
  const getContributorInitials = (name?: string) => {,
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};
  const getContributorColor = (authorType: string) => {
  switch (authorType) {
  case 'user':,
  return '#1890ff';
  case 'anonymous':,
  return '#d9d9d9';
  case 'guest':,
  return '#faad14';
  case 'system':,
  return '#52c41a';
  case 'api':,
  return '#722ed1';
  default:,
  return '#8c8c8c';
};
  const formatDuration = (start: Date, end: Date) => {
    const duration = end.getTime() - start.getTime();
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day';
    if (days < 30) return `${days} days`;}
    if (days < 365) return `${Math.floor(days / 30)} months`;}
    return `${Math.floor(days / 365)} years`;}
  };
  const topExpertise = contributor.expertise;
    .sort((a, b) => b.changes - a.changes)
    .slice(0, 3);
  return;
    <Card
      size="small"
      hoverable
      onClick={() => contributor.authorId && onViewDetails(contributor.authorId)}
      style={{ marginBottom: '8px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Avatar
          size={48}
          style={{ backgroundColor: getContributorColor(contributor.authorType) }}
          icon={<UserOutlined />}
        >
          {getContributorInitials(contributor.authorName)}
        </Avatar>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Text strong>
              {contributor.authorName || 'Anonymous'}
            </Text>
            <Tag color={getContributorColor(contributor.authorType)} size="small">
              {contributor.authorType.toUpperCase()}
            </Tag>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '4px' }}>
            <Space size="small">
              <EditOutlined />
              <Text type="secondary">{contributor.totalChanges} changes</Text>
            </Space>
            <Space size="small">
              <ClockCircleOutlined />
              <Text type="secondary">
                {formatDuration(contributor.firstContribution, contributor.lastContribution)}
              </Text>
            </Space>
            {contributor.collaborations.length > 0 && ()
              <Space size="small">
                <TeamOutlined />
                <Text type="secondary">{contributor.collaborations.length} collaborations</Text>
              </Space>
            )}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {topExpertise.map((expertise) => ()
              <Tooltip
                key={expertise.resourceType}
                title={`${expertise.changes} ${RESOURCE_TYPE_DESCRIPTIONS[expertise.resourceType]} changes (${expertise.percentage.toFixed(1)}%)`}
              >
                <Tag size="small" color="blue">
                  {expertise.resourceType} {expertise.percentage.toFixed(0)}%
                </Tag>
              </Tooltip>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Progress
            type="circle"
            size={32}
            percent={Math.min(100, (contributor.totalChanges / 100) * 100)}
            showInfo={false}
            strokeColor={getContributorColor(contributor.authorType)}
          />
          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
            Activity
          </div>
        </div>
      </div>
    </Card>
  );
};

export const ContributorVisualization: React.FC<ContributorVisualizationProps> = ({)
  projectId,
  visible = true,
  onClose
}) => {
  const [contributors, setContributors] = useState<ContributorStatsResponse | null>(null);
  const [recentAttributions, setRecentAttributions] = useState<ChangeAttribution>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [selectedContributor, setSelectedContributor] = useState<string | null>(null);
  const [showAnonymous, setShowAnonymous] = useState(false);
  const { 
    getContributorStats, 
    listAttributions, 
    loading, 
    error 
  } = useAttribution();
  useEffect(() => {
    if (visible) {
      loadContributors();
      loadRecentAttributions();
  }, [visible, projectId, dateRange]);
  const loadContributors = async () => {
  try {
  const stats = await getContributorStats(projectId, dateRange ? {)
  start: dateRange[0],
  end: dateRange[1],
} : undefined);
      setContributors(stats);
    } catch (error) {
  console.error('Failed to load contributors:', error);
};
  const loadRecentAttributions = async () => {
  try {
  const attributions = await listAttributions({)
  projectId,
  dateFrom: dateRange?.[0],
  dateTo: dateRange?.[1],
  limit: 50,
  offset: 0,
  sortBy: 'created_at',
  sortOrder: 'desc',
});
      setRecentAttributions(attributions);
    } catch (error) {
  console.error('Failed to load recent attributions:', error);
};
  const handleViewDetails = (contributorId: string) => {
    setSelectedContributor(contributorId);
    setActiveTab('details');
  };
  const filteredContributors = contributors?.contributors.filter(contributor => {)
  if (!showAnonymous && contributor.authorType === 'anonymous') {
      return false;
    return true;
  }) || [];
  const getChangeTypeIcon = (changeType: ChangeType) => {
    switch (changeType) {
    case 'create':
      return <EditOutlined style={{ color: '#52c41a' }} />;
    case 'update':
      return <EditOutlined style={{ color: '#1890ff' }} />;
    case 'delete':
      return <EditOutlined style={{ color: '#ff4d4f' }} />;
    default:
      return <EditOutlined />;
  };
  const getChangeTypeColor = (changeType: ChangeType) => {
  switch (changeType) {
  case 'create':,
  return 'success';
  case 'update':,
  return 'processing';
  case 'delete':,
  return 'error';
  default:,
  return 'default'
  };
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (minutes < 60) return `${minutes}m ago`;}
    if (hours < 24) return `${hours}h ago`;}
    if (days < 30) return `${days}d ago`;}
    return date.toLocaleDateString();
  };
  if (!visible) return null;
  return;
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={4}>Change Attribution</Title>
        <Space>
          <Button
            icon={showAnonymous ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => setShowAnonymous(!showAnonymous)}
            size="small"
          >
            {showAnonymous ? 'Hide' : 'Show'} Anonymous
          </Button>
          <RangePicker
            size="small"
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            placeholder={['Start date', 'End date']}
          />
          {onClose && ()
            <Button size="small" onClick={onClose}>
              Close
            </Button>
          )}
        </Space>
      </div>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Overview" key="overview">
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Contributors"
                  value={contributors?.summary.totalContributors || 0}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Active Contributors"
                  value={contributors?.summary.activeContributors || 0}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Avg. Contributions"
                  value={contributors?.summary.averageContributionsPerUser || 0}
                  precision={1}
                  prefix={<EditOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Top Contributor"
                  value={contributors?.summary.mostActiveContributor?.authorName || 'None'}
                  prefix={<TrophyOutlined />}
                />
              </Card>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={16}>
              <Card title="Contributors" size="small">
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {filteredContributors.length > 0 ? ()
                    filteredContributors.map((contributor) => ()
                      <ContributorCard
                        key={contributor.authorId || contributor.authorName}
                        contributor={contributor}
                        projectId={projectId}
                        onViewDetails={handleViewDetails}
                      />
                    ))
                  ) : ()
                    <Empty description="No contributors found" />
                  )}
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Recent Activity" size="small">
                <Timeline
                  style={{ maxHeight: '400px', overflowY: 'auto' }}
                  items={recentAttributions.slice(0, 20).map((attribution) => ({)
  dot: getChangeTypeIcon(attribution.changeType),
                    children: (),
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space size="small">
                            <Text strong>{attribution.authorName || 'Anonymous'}</Text>
                            <Tag color={getChangeTypeColor(attribution.changeType) as any} size="small">
                              {attribution.changeType.toUpperCase()}
                            </Tag>
                          </Space>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {formatTime(attribution.createdAt)}
                          </Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {attribution.changeDescription || 
                           `${CHANGE_TYPE_DESCRIPTIONS[attribution.changeType]} ${RESOURCE_TYPE_DESCRIPTIONS[attribution.resourceType]}`}
                        </Text>
                        {attribution.isCollaborative && ()
                          <div style={{ marginTop: '2px' }}>
                            <Tag color="purple" size="small">
                              <TeamOutlined style={{ marginRight: '2px' }} />
                              {attribution.collaboratorCount} collaborators
                            </Tag>
                          </div>
                        )}
                      </div>
                  }))}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="Details" key="details">
          {selectedContributor ? ()
            <ContributorDetails
              projectId={projectId}
              contributorId={selectedContributor}
              onBack={() => setSelectedContributor(null)}
            />
          ) : ()
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary">Select a contributor to view details</Text>
            </div>
          )}
        </TabPane>
        <TabPane tab="Analytics" key="analytics">
          <ContributorAnalytics
            contributors={contributors}
            projectId={projectId}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

// Placeholder components for detailed views
const ContributorDetails: React.FC<{,
  projectId: string;
  contributorId: string;
  onBack: () => void;
}> = ({ projectId, contributorId, onBack }) => {
  return;
    <div>
      <Button onClick={onBack} style={{ marginBottom: '16px' }}>
        ← Back to Overview
      </Button>
      <Card title="Contributor Details">
        <Text>Detailed contributor information for {contributorId}</Text>
        {/* Implementation would show detailed contributor statistics, activity timeline, etc. */}
      </Card>
    </div>
  );
};
const ContributorAnalytics: React.FC<{,
  contributors: ContributorStatsResponse | null;
  projectId: string;
}> = ({ contributors, projectId }) => {
  return;
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Contribution Patterns">
            <Text>Analytics about contribution patterns</Text>
            {/* Implementation would show charts and analytics */}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Collaboration Network">
            <Text>Collaboration network visualization</Text>
            {/* Implementation would show collaboration graphs */}
          </Card>
        </Col>
      </Row>
    </div>
  );
};