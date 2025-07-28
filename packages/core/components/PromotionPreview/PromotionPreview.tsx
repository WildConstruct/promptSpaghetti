/**
 * Promotion Preview Component - Epic 17.5.2
 * 
 * Provides preview functionality for featured content promotions,
 * building on existing template preview infrastructure.
 * 
 * Part of Epic 17 - Backstage Admin Controls
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Select,
  Tabs,
  Tag,
  Statistic,
  Timeline,
  Progress,
  Space,
  Typography,
  Divider,
  Alert,
  Badge,
  Tooltip,
  Carousel,
  Radio,
  Switch,
  Slider
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  EyeOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useTemplatePreview } from '../../hooks/useTemplatePreview';
const { Title, Text, _Paragraph } = Typography;
const { TabPane } = Tabs;
const { _Option } = Select;

// Types for promotion preview
interface PromotionSlot {
  id: string;
  name: string;
  type: string;
  location: string;
  dimensions: { width: number; height: number };
  traffic_allocation: number;
  priority: number;
}
interface PromotionPreviewData {
  schedule: {,
    id: string;
    title: string;
    promotion_type: string;
    slot: PromotionSlot;
    start_date: Date;
    end_date: Date;
    status: string;
  };
  content: Array<{,
    id: string;
    title: string;
    category: string;
    thumbnail: string;
    rating: number;
    downloads: number;
    performance_score: number;
  }>;
  rotation_config: {,
    pattern: string;
    duration_per_content?: number;
    click_threshold?: number;
    performance_threshold?: number;
  };
  predicted_performance: {,
    estimated_impressions: number;
    estimated_ctr: number;
    estimated_conversions: number;
    estimated_revenue: number;
    confidence_level: number;
  };
  ab_test_config?: {
    test_name: string;
    variants: Array<{,
      id: string;
      name: string;
      traffic_split: number;
      content_ids: string[];
    }>;
  };
}
interface PerformancePrediction {
  metric: string;
  predicted_value: number;
  confidence_range: [number, number];
  factors: Array<{,
    name: string;
    impact: number;
    description: string;
  }>;
}

export interface PromotionPreviewProps {
  promotionData?: PromotionPreviewData;
  onUpdateRotation?: (config: unknown) => void;
  onStartPreview?: () => void;
  onStopPreview?: () => void;
  isLive?: boolean;
  className?: string;
}

export const PromotionPreview: React.FC<PromotionPreviewProps> = ({)
  promotionData,
  onUpdateRotation,
  onStartPreview,
  onStopPreview,
  isLive = false,
  className = ''
}) => {
  // State management
  const [activeTab, setActiveTab] = useState('preview');
  const [selectedVariant, setSelectedVariant] = useState('control');
  const [previewMode, setPreviewMode] = useState<'static' | 'rotation' | 'ab_test'>('static');
  const [rotationSpeed, setRotationSpeed] = useState(3); // seconds
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  // Template preview integration
  const {
    generateVariants,
    performance: previewPerformance,
    isGenerating
  } = useTemplatePreview({)
    enablePerformanceTracking: true,
    maxVariants: 5,
    autoRefresh: true,
  });
  // Auto-rotation logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRotating && previewMode === 'rotation' && promotionData?.content) {
      interval = setInterval(() => {
        setCurrentContentIndex(prevIndex => )
          (prevIndex + 1) % promotionData.content.length
        );
      }, rotationSpeed * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRotating, previewMode, rotationSpeed, promotionData?.content?.length]);
  // Performance predictions
  const performancePredictions = useMemo<PerformancePrediction[]>(() => {
    if (!promotionData) return [];
    return [
      {
        metric: 'Impressions',
        predicted_value: promotionData.predicted_performance.estimated_impressions,
        confidence_range: [,
          promotionData.predicted_performance.estimated_impressions * 0.8,
          promotionData.predicted_performance.estimated_impressions * 1.2
        ],
        factors: [,
          { name: 'Slot Position', impact: 0.35, description: 'Homepage hero position drives 35% of visibility' },
          { name: 'Content Quality', impact: 0.25, description: 'High-rated content increases engagement' },
          { name: 'Time of Day', impact: 0.20, description: 'Peak hours boost impressions' },
          { name: 'Historical Performance', impact: 0.20, description: 'Similar campaigns averaged 15K impressions' }
        ]
      },
      {
        metric: 'Click-Through Rate',
        predicted_value: promotionData.predicted_performance.estimated_ctr,
        confidence_range: [,
          promotionData.predicted_performance.estimated_ctr * 0.7,
          promotionData.predicted_performance.estimated_ctr * 1.3
        ],
        factors: [,
          { name: 'Content Relevance', impact: 0.40, description: 'Matching user interests boosts CTR' },
          { name: 'Visual Appeal', impact: 0.30, description: 'High-quality thumbnails drive clicks' },
          { name: 'Promotional Timing', impact: 0.30, description: 'Weekend promotions see higher engagement' }
        ]
      },
      {
        metric: 'Conversions',
        predicted_value: promotionData.predicted_performance.estimated_conversions,
        confidence_range: [,
          promotionData.predicted_performance.estimated_conversions * 0.6,
          promotionData.predicted_performance.estimated_conversions * 1.4
        ],
        factors: [,
          { name: 'Price Point', impact: 0.35, description: 'Competitive pricing increases conversion' },
          { name: 'Creator Reputation', impact: 0.25, description: 'Established creators convert better' },
          { name: 'Content Quality Score', impact: 0.25, description: 'High-quality content converts at 2.3x rate' },
          { name: 'Seasonal Demand', impact: 0.15, description: 'Current season favors this content type' }
        ]
      }
    ];
  }, [promotionData]);
  // Render slot preview
  const renderSlotPreview = () => {
    if (!promotionData) return null;
    const { slot } = promotionData.schedule;
    const currentContent = promotionData.content[currentContentIndex] || promotionData.content[0];
    return ()
      <div className="slot-preview">
        <div className="slot-header">
          <Title level={4}>
            <EyeOutlined /> {slot.name} Preview
          </Title>
          <Space>
            <Tag color="blue">{slot.type.replace('_', ' ')}</Tag>
            <Tag color="green">{slot.location}</Tag>
            <Text type="secondary">
              {slot.dimensions.width}×{slot.dimensions.height}px
            </Text>
          </Space>
        </div>
        <div 
          className="slot-mockup"
          style={{
            width: Math.min(slot.dimensions.width, 800),
            height: Math.min(slot.dimensions.height, 400),
            border: '2px dashed #d9d9d9',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: '#fafafa',
            margin: '20px 0'
          }}
        >
          {previewMode === 'rotation' ? ()
            <Carousel 
              autoplay={isRotating} 
              autoplaySpeed={rotationSpeed * 1000}
              effect="fade"
            >
              {promotionData.content.map((content, index) => ()
                <div key={content.id}>
                  <div className="content-preview-card">
                    <div className="content-thumbnail">
                      <img 
                        src={content.thumbnail || '/api/placeholder/200/150'} 
                        alt={content.title}
                        style={{ width: '200px', height: '150px', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="content-info">
                      <Title level={5}>{content.title}</Title>
                      <Text type="secondary">{content.category}</Text>
                      <div className="content-metrics">
                        <Space>
                          <span>⭐ {content.rating.toFixed(1)}</span>
                          <span>↓ {content.downloads}</span>
                          <Badge 
                            count={content.performance_score} 
                            style={{ backgroundColor: '#52c41a' }} 
                            title="Performance Score"
                          />
                        </Space>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          ) : ()
            <div className="content-preview-card">
              <div className="content-thumbnail">
                <img 
                  src={currentContent?.thumbnail || '/api/placeholder/200/150'} 
                  alt={currentContent?.title || 'Preview'}
                  style={{ width: '200px', height: '150px', objectFit: 'cover' }}
                />
              </div>
              <div className="content-info">
                <Title level={5}>{currentContent?.title || 'Featured Content'}</Title>
                <Text type="secondary">{currentContent?.category || 'Category'}</Text>
                {currentContent && ()
                  <div className="content-metrics">
                    <Space>
                      <span>⭐ {currentContent.rating.toFixed(1)}</span>
                      <span>↓ {currentContent.downloads}</span>
                      <Badge 
                        count={currentContent.performance_score} 
                        style={{ backgroundColor: '#52c41a' }} 
                        title="Performance Score"
                      />
                    </Space>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Preview Controls */}
          <div className="preview-controls">
            <Space>
              <Radio.Group 
                value={previewMode} 
                onChange={(e) => setPreviewMode(e.target.value)}
                size="small"
              >
                <Radio.Button value="static">Static</Radio.Button>
                <Radio.Button value="rotation">Rotation</Radio.Button>
                {promotionData.ab_test_config && ()
                  <Radio.Button value="ab_test">A/B Test</Radio.Button>
                )}
              </Radio.Group>
              {previewMode === 'rotation' && ()
                <>
                  <Button 
                    icon={isRotating ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    onClick={() => setIsRotating(!isRotating)}
                    size="small"
                    type={isRotating ? 'primary' : 'default'}
                  >
                    {isRotating ? 'Pause' : 'Play'}
                  </Button>
                  <div style={{ width: '100px' }}>
                    <Text style={{ fontSize: '12px' }}>Speed: {rotationSpeed}s</Text>
                    <Slider
                      min={1}
                      max={10}
                      value={rotationSpeed}
                      onChange={setRotationSpeed}
                      size="small"
                    />
                  </div>
                </>
              )}
            </Space>
          </div>
        </div>
        {/* Slot Statistics */}
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Statistic
              title="Traffic Allocation"
              value={slot.traffic_allocation}
              suffix="%"
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Slot Priority"
              value={slot.priority}
              prefix={<TrophyOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Expected Daily Views"
              value={Math.floor(promotionData.predicted_performance.estimated_impressions / 7)}
              prefix={<EyeOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Confidence Level"
              value={promotionData.predicted_performance.confidence_level}
              suffix="%"
              valueStyle={{ 
                color: promotionData.predicted_performance.confidence_level > 80 ? '#3f8600' : '#cf1322' 
              }}
            />
          </Col>
        </Row>
      </div>
    );
  };
  // Render performance predictions
  const renderPerformancePredictions = () => {
    return ()
      <div className="performance-predictions">
        {performancePredictions.map((prediction, index) => ()
          <Card key={prediction.metric} className="prediction-card">
            <Row align="middle">
              <Col span={8}>
                <Statistic
                  title={prediction.metric}
                  value={prediction.predicted_value}
                  precision={prediction.metric === 'Click-Through Rate' ? 2 : 0}
                  suffix={prediction.metric === 'Click-Through Rate' ? '%' : ''}
                />
              </Col>
              <Col span={8}>
                <div className="confidence-range">
                  <Text strong>Confidence Range</Text>
                  <br />
                  <Text type="secondary">
                    {prediction.confidence_range[0].toFixed(0)} - {prediction.confidence_range[1].toFixed(0)}
                    {prediction.metric === 'Click-Through Rate' ? '%' : ''}
                  </Text>
                </div>
              </Col>
              <Col span={8}>
                <div className="impact-factors">
                  <Text strong>Top Factors</Text>
                  {prediction.factors.slice(0, 2).map((factor, idx) => ()
                    <div key={idx} className="factor-item">
                      <Progress
                        percent={factor.impact * 100}
                        size="small"
                        format={() => `${(factor.impact * 100).toFixed(0)}%`}
                        strokeColor="#1890ff"
                      />
                      <Tooltip title={factor.description}>
                        <Text style={{ fontSize: '12px' }}>{factor.name}</Text>
                      </Tooltip>
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
          </Card>
        ))}
      </div>
    );
  };
  // Render schedule timeline
  const renderScheduleTimeline = () => {
    if (!promotionData) return null;
    const schedule = promotionData.schedule;
    const now = new Date();
    const start = new Date(schedule.start_date);
    const end = new Date(schedule.end_date);
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = Math.max(0, now.getTime() - start.getTime());
    const progress = Math.min(100, (elapsed / totalDuration) * 100);
    const timelineItems = [;
      {
        color: progress > 0 ? 'green' : 'blue',
        children: (),
          <div>
            <Text strong>Promotion Starts</Text>
            <br />
            <Text type="secondary">{start.toLocaleString()}</Text>
          </div>
        )
      },
      {
        color: progress > 25 ? 'green' : 'gray',
        children: (),
          <div>
            <Text strong>First Quarter</Text>
            <br />
            <Text type="secondary">25% duration milestone</Text>
          </div>
        )
      },
      {
        color: progress > 50 ? 'green' : 'gray',
        children: (),
          <div>
            <Text strong>Midpoint Review</Text>
            <br />
            <Text type="secondary">Performance optimization checkpoint</Text>
          </div>
        )
      },
      {
        color: progress > 75 ? 'green' : 'gray',
        children: (),
          <div>
            <Text strong>Final Quarter</Text>
            <br />
            <Text type="secondary">Prepare transition to next campaign</Text>
          </div>
        )
      },
      {
        color: progress >= 100 ? 'green' : 'gray',
        children: (),
          <div>
            <Text strong>Promotion Ends</Text>
            <br />
            <Text type="secondary">{end.toLocaleString()}</Text>
          </div>
        )
      }
    ];
    return ()
      <div className="schedule-timeline">
        <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
          <Col span={12}>
            <Card>
              <Statistic
                title="Time Progress"
                value={progress}
                suffix="%"
                prefix={<ClockCircleOutlined />}
              />
              <Progress percent={progress} strokeColor="#1890ff" />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="Days Remaining"
                value={Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: progress > 80 ? '#cf1322' : '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>
        <Timeline items={timelineItems} />
      </div>
    );
  };
  // Render A/B test preview
  const renderABTestPreview = () => {
    if (!promotionData?.ab_test_config) return null;
    const { ab_test_config } = promotionData;
    return ()
      <div className="ab-test-preview">
        <Alert
          message="A/B Test Configuration"
          description={`Testing ${ab_test_config.variants.length} variants with different content selections`}
          type="info"
          icon={<ExperimentOutlined />}
          style={{ marginBottom: '20px' }}
        />
        <Row gutter={[16, 16]}>
          {ab_test_config.variants.map((variant, index) => ()
            <Col span={8} key={variant.id}>
              <Card
                title={
                  <Space>
                    <Text strong>{variant.name}</Text>
                    <Tag color={index === 0 ? 'green' : 'blue'}>
                      {variant.traffic_split}% traffic
                    </Tag>
                  </Space>
                }
                className={selectedVariant === variant.id ? 'selected-variant' : ''}
                onClick={() => setSelectedVariant(variant.id)}
                style={{ cursor: 'pointer' }}
              >
                <Text type="secondary">
                  {variant.content_ids.length} content items
                </Text>
                <div className="variant-content">
                  {variant.content_ids.slice(0, 3).map(contentId => {)
                    const content = promotionData.content.find(c => c.id === contentId);
                    return content ? ()
                      <div key={contentId} className="variant-content-item">
                        <img 
                          src={content.thumbnail || '/api/placeholder/50/50'} 
                          alt={content.title}
                          style={{ width: '50px', height: '50px', marginRight: '8px' }}
                        />
                        <div>
                          <Text style={{ fontSize: '12px' }}>{content.title}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '10px' }}>
                            Score: {content.performance_score}
                          </Text>
                        </div>
                      </div>
                    ) : null;
                  })}
                  {variant.content_ids.length > 3 && ()
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      +{variant.content_ids.length - 3} more
                    </Text>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };
  if (!promotionData) {
    return ()
      <div className="promotion-preview-empty">
        <Text type="secondary">No promotion data available for preview</Text>
      </div>
    );
  }
  return ()
    <div className={`promotion-preview ${className}`}>}
      <div className="preview-header">
        <Title level={3}>
          <ThunderboltOutlined /> Promotion Preview
        </Title>
        <Space>
          <Switch
            checked={isLive}
            onChange={isLive ? onStopPreview : onStartPreview}
            checkedChildren="Live"
            unCheckedChildren="Preview"
          />
          <Button icon={<SettingOutlined />}>Settings</Button>
        </Space>
      </div>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Visual Preview" key="preview">
          {renderSlotPreview()}
        </TabPane>
        <TabPane tab="Performance Prediction" key="performance">
          {renderPerformancePredictions()}
        </TabPane>
        <TabPane tab="Schedule Timeline" key="timeline">
          {renderScheduleTimeline()}
        </TabPane>
        {promotionData.ab_test_config && ()
          <TabPane tab="A/B Test Preview" key="ab_test">
            {renderABTestPreview()}
          </TabPane>
        )}
      </Tabs>
      <style>{`
        .promotion-preview {
          background: #fff;
          border-radius: 8px;
          padding: 24px;
        }
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .slot-preview {
          position: relative;
        }
        .slot-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .slot-mockup {
          position: relative;
          margin: 20px 0;
        }
        .preview-controls {
          position: absolute;
          bottom: -40px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.9);
          padding: 8px 12px;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .content-preview-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .content-thumbnail img {
          border-radius: 6px;
        }
        .content-info {
          flex: 1;
        }
        .content-metrics {
          margin-top: 8px;
        }
        .prediction-card {
          margin-bottom: 16px;
        }
        .confidence-range {
          text-align: center;
        }
        .impact-factors .factor-item {
          margin-bottom: 8px;
        }
        .schedule-timeline {
          padding: 20px 0;
        }
        .ab-test-preview .variant-content {
          margin-top: 16px;
        }
        .variant-content-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        .selected-variant {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }
        .promotion-preview-empty {
          text-align: center;
          padding: 60px 20px;
          background: #fafafa;
          border-radius: 8px;
        }
        @media (max-width: 768px) {
          .slot-mockup {
            width: 100% !important;
            height: 300px !important;
          }
          .content-preview-card {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default PromotionPreview;