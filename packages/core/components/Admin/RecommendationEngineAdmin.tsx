/**
 * Recommendation Engine Admin - E17-1753114397324-2FB112
 * 
 * Administrative interface for configuring and monitoring the recommendation engine
 * Part of Epic 17.5.2 - Featured Content Tools (Backstage Admin Controls)
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  Settings,
  Brain,
  Target,
  TrendingUp,
  BarChart3,
  Zap,
  Users,
  Clock,
  Star,
  Eye,
  Play,
  Pause,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
  Activity,
  Sliders,
  Database,
  Cpu,
  Network,
  Filter
} from 'lucide-react';

// Algorithm configuration interfaces
export interface RecommendationAlgorithm {
  id: string;
  name: string;
  type: 'collaborative_filtering' | 'content_based' | 'hybrid' | 'deep_learning' | 'performance_based';
  description: string;
  enabled: boolean;
  weight: number; // Weight in ensemble
  parameters: Record<string, any>;
  performance_metrics: {,
    precision: number;
    recall: number;
    ndcg: number;
    click_through_rate: number;
    conversion_rate: number;
  };
  last_trained?: Date;
  training_status: 'idle' | 'training' | 'failed' | 'completed';
}

export interface FeaturedContentConfig {
  algorithm_weights: {,
    trending_boost: number;
    quality_boost: number;
    diversity_boost: number;
    recency_boost: number;
    creator_tier_boost: number;
  };
  content_filters: {,
    min_quality_score: number;
    exclude_categories: string[];
    featured_categories_boost: Record<string, number>;
    creator_tier_weights: Record<string, number>;
  };
  rotation_settings: {,
    rotation_frequency: number; // minutes
    max_consecutive_shows: number;
    cooldown_period: number; // hours
    randomization_factor: number; // 0-1
  };
  ab_testing: {,
    enabled: boolean;
    variants: ABTestVariant[];
    traffic_allocation: number; // percentage for A/B testing
  };
}

export interface ABTestVariant {
  id: string;
  name: string;
  config_override: Partial<FeaturedContentConfig>;
  allocation_percentage: number;
  performance_metrics?: {
    ctr: number;
    conversion_rate: number;
    engagement_score: number;
    revenue_per_view: number;
  };
}

export interface RecommendationMetrics {
  overall_performance: {,
    total_recommendations_served: number;
    click_through_rate: number;
    conversion_rate: number;
    avg_engagement_time: number;
    revenue_impact: number;
  };
  algorithm_performance: Record<string, {
    precision: number;
    recall: number;
    f1_score: number;
    latency_ms: number;
    cache_hit_rate: number;
  }>;
  featured_content_performance: {,
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    top_performing_content: Array<{,
      id: string;
      title: string;
      performance_score: number;
    }>;
  };
  real_time_stats: {,
    current_recommendations_per_minute: number;
    active_users: number;
    cache_utilization: number;
    model_accuracy: number;
  };
}

export interface RecommendationEngineAdminProps {
  className?: string;
}

export const RecommendationEngineAdmin: React.FC<RecommendationEngineAdminProps> = ({)
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('algorithms');
  const [featuredConfig, setFeaturedConfig] = useState<FeaturedContentConfig>({)
    algorithm_weights: {,
      trending_boost: 1.2,
      quality_boost: 1.5,
      diversity_boost: 0.8,
      recency_boost: 1.1,
      creator_tier_boost: 1.3,
    },
    content_filters: {,
      min_quality_score: 80,
      exclude_categories: ['nsfw', 'inappropriate'],
      featured_categories_boost: {,
        'business': 1.2,
        'creative': 1.1,
        'technology': 1.15
      },
      creator_tier_weights: {,
        'premium': 1.5,
        'verified': 1.2,
        'community': 1.0
      }
    },
    rotation_settings: {,
      rotation_frequency: 60,
      max_consecutive_shows: 3,
      cooldown_period: 24,
      randomization_factor: 0.2,
    },
    ab_testing: {,
      enabled: true,
      variants: [,
        {
          id: 'variant-quality',
          name: 'Quality Focused',
          config_override: {,
            algorithm_weights: {,
              trending_boost: 1.0,
              quality_boost: 2.0,
              diversity_boost: 0.8,
              recency_boost: 0.9,
              creator_tier_boost: 1.4,
            }
          },
          allocation_percentage: 40,
          performance_metrics: {,
            ctr: 4.2,
            conversion_rate: 14.8,
            engagement_score: 87.5,
            revenue_per_view: 0.24,
          }
        },
        {
          id: 'variant-trending',
          name: 'Trending Focused',
          config_override: {,
            algorithm_weights: {,
              trending_boost: 2.0,
              quality_boost: 1.2,
              diversity_boost: 1.1,
              recency_boost: 1.5,
              creator_tier_boost: 1.0,
            }
          },
          allocation_percentage: 40,
          performance_metrics: {,
            ctr: 5.1,
            conversion_rate: 11.2,
            engagement_score: 92.1,
            revenue_per_view: 0.19,
          }
        }
      ],
      traffic_allocation: 80,
    }
  });
  const [algorithms] = useState<RecommendationAlgorithm[]>([)
    {
      id: 'collaborative-filtering',
      name: 'Collaborative Filtering',
      type: 'collaborative_filtering',
      description: 'User-based collaborative filtering using matrix factorization',
      enabled: true,
      weight: 0.4,
      parameters: {,
        n_factors: 100,
        learning_rate: 0.005,
        regularization: 0.02,
        min_user_interactions: 5,
      },
      performance_metrics: {,
        precision: 0.78,
        recall: 0.65,
        ndcg: 0.82,
        click_through_rate: 4.2,
        conversion_rate: 12.8,
      },
      last_trained: new Date(Date.now() - 6 * 60 * 60 * 1000),
      training_status: 'completed',
    },
    {
      id: 'content-based',
      name: 'Content-Based Filtering',
      type: 'content_based',
      description: 'Content similarity using TF-IDF and metadata features',
      enabled: true,
      weight: 0.3,
      parameters: {,
        tfidf_max_features: 5000,
        similarity_threshold: 0.1,
        metadata_weights: {,
          category: 0.3,
          tags: 0.4,
          creator: 0.2,
          style: 0.1,
        }
      },
      performance_metrics: {,
        precision: 0.71,
        recall: 0.58,
        ndcg: 0.75,
        click_through_rate: 3.8,
        conversion_rate: 10.5,
      },
      last_trained: new Date(Date.now() - 12 * 60 * 60 * 1000),
      training_status: 'completed',
    },
    {
      id: 'deep-learning',
      name: 'Neural Network Model',
      type: 'deep_learning',
      description: 'Deep learning model with user and item embeddings',
      enabled: false,
      weight: 0.2,
      parameters: {,
        embedding_dim: 128,
        hidden_layers: [256, 128, 64],
        dropout_rate: 0.3,
        learning_rate: 0.001,
        batch_size: 512,
      },
      performance_metrics: {,
        precision: 0.85,
        recall: 0.72,
        ndcg: 0.88,
        click_through_rate: 5.1,
        conversion_rate: 15.2,
      },
      last_trained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      training_status: 'idle',
    },
    {
      id: 'performance-based',
      name: 'Performance Optimizer',
      type: 'performance_based',
      description: 'Featured content optimization for promotional performance',
      enabled: true,
      weight: 0.1,
      parameters: {,
        performance_window_days: 30,
        conversion_weight: 0.6,
        engagement_weight: 0.4,
        trending_decay: 0.95,
        quality_threshold: 4.0,
      },
      performance_metrics: {,
        precision: 0.82,
        recall: 0.69,
        ndcg: 0.84,
        click_through_rate: 4.7,
        conversion_rate: 14.1,
      },
      last_trained: new Date(Date.now() - 2 * 60 * 60 * 1000),
      training_status: 'completed',
    }
  ]);
  const [metrics] = useState<RecommendationMetrics>({)
    overall_performance: {,
      total_recommendations_served: 2847392,
      click_through_rate: 4.35,
      conversion_rate: 13.2,
      avg_engagement_time: 127,
      revenue_impact: 284750,
    },
    algorithm_performance: {,
      'collaborative-filtering': {
        precision: 0.78,
        recall: 0.65,
        f1_score: 0.71,
        latency_ms: 45,
        cache_hit_rate: 0.89,
      },
      'content-based': {
        precision: 0.71,
        recall: 0.58,
        f1_score: 0.64,
        latency_ms: 32,
        cache_hit_rate: 0.92,
      },
      'deep-learning': {
        precision: 0.85,
        recall: 0.72,
        f1_score: 0.78,
        latency_ms: 125,
        cache_hit_rate: 0.76,
      },
      'performance-based': {
        precision: 0.82,
        recall: 0.69,
        f1_score: 0.75,
        latency_ms: 28,
        cache_hit_rate: 0.95,
      }
    },
    featured_content_performance: {,
      impressions: 1247893,
      clicks: 54287,
      conversions: 7165,
      revenue: 71650,
      top_performing_content: [,
        { id: 'content-1', title: 'Business Card Pro Template', performance_score: 95.2 },
        { id: 'content-2', title: 'Wedding Invitation Suite', performance_score: 92.7 },
        { id: 'content-3', title: 'Marketing Flyer Pack', performance_score: 89.4 }
      ]
    },
    real_time_stats: {,
      current_recommendations_per_minute: 1250,
      active_users: 8374,
      cache_utilization: 87.5,
      model_accuracy: 84.2,
    }
  });
  const getStatusColor = (status: string) => {
    switch (status) {
    case 'completed': return 'text-green-600 bg-green-100';
    case 'training': return 'text-blue-600 bg-blue-100';
    case 'failed': return 'text-red-600 bg-red-100';
    case 'idle': return 'text-gray-600 bg-gray-100';
    default: return 'text-gray-600 bg-gray-100';
    }
  };
  const getAlgorithmTypeIcon = (type: string) => {
    switch (type) {
    case 'collaborative_filtering': return Users;
    case 'content_based': return Database;
    case 'deep_learning': return Brain;
    case 'performance_based': return Target;
    case 'hybrid': return Network;
    default: return Cpu;
    }
  };
  const renderAlgorithmManagement = () => (;)
    <div className="algorithms-section">
      <div className="algorithms-header">
        <h3>Recommendation Algorithms</h3>
        <div className="header-actions">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retrain All
          </Button>
          <Button>
            <Brain className="w-4 h-4 mr-2" />
            Add Algorithm
          </Button>
        </div>
      </div>
      <div className="algorithms-list">
        {algorithms.map(algorithm => {)
          const IconComponent = getAlgorithmTypeIcon(algorithm.type);
          return ()
            <Card key={algorithm.id} className="algorithm-card">
              <CardHeader>
                <div className="algorithm-header">
                  <div className="algorithm-info">
                    <div className="algorithm-title">
                      <IconComponent className="w-5 h-5 text-blue-500" />
                      <h4>{algorithm.name}</h4>
                      <Badge className={getStatusColor(algorithm.training_status)}>
                        {algorithm.training_status.toUpperCase()}
                      </Badge>
                    </div>
                    <p>{algorithm.description}</p>
                  </div>
                  <div className="algorithm-controls">
                    <div className="weight-control">
                      <label>Weight: {algorithm.weight}</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={algorithm.weight}
                        className="weight-slider"
                      />
                    </div>
                    <label className="enable-switch">
                      <input
                        type="checkbox"
                        checked={algorithm.enabled}
                      />
                      <span>Enabled</span>
                    </label>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="algorithm-metrics">
                  <div className="metrics-grid">
                    <div className="metric-item">
                      <span className="metric-label">Precision</span>
                      <span className="metric-value">{(algorithm.performance_metrics.precision * 100).toFixed(1)}%</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Recall</span>
                      <span className="metric-value">{(algorithm.performance_metrics.recall * 100).toFixed(1)}%</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">CTR</span>
                      <span className="metric-value">{algorithm.performance_metrics.click_through_rate.toFixed(1)}%</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Conversion</span>
                      <span className="metric-value">{algorithm.performance_metrics.conversion_rate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div className="algorithm-actions">
                  <Button size="sm" variant="outline">
                    <Settings className="w-4 h-4 mr-1" />
                    Configure
                  </Button>
                  <Button size="sm" variant="outline">
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Retrain
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
  const renderFeaturedContentConfig = () => (;)
    <div className="featured-config-section">
      <div className="config-header">
        <h3>Featured Content Configuration</h3>
        <div className="header-actions">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>
      <div className="config-sections">
        {/* Algorithm Weights */}
        <Card className="config-section">
          <CardHeader>
            <CardTitle>Algorithm Weights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="weights-grid">
              {Object.entries(featuredConfig.algorithm_weights).map(([key, value]) => ()
                <div key={key} className="weight-control">
                  <label className="weight-label">
                    {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                  <div className="weight-input-group">
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={value}
                      onChange={(e) => setFeaturedConfig({)
                        ...featuredConfig,
                        algorithm_weights: {,
                          ...featuredConfig.algorithm_weights,
                          [key]: parseFloat(e.target.value)
                        }
                      })}
                      className="weight-slider"
                    />
                    <span className="weight-value">{value.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Content Filters */}
        <Card className="config-section">
          <CardHeader>
            <CardTitle>Content Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="filters-grid">
              <div className="filter-item">
                <label>Min Quality Score</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={featuredConfig.content_filters.min_quality_score}
                  onChange={(e) => setFeaturedConfig({)
                    ...featuredConfig,
                    content_filters: {,
                      ...featuredConfig.content_filters,
                      min_quality_score: parseInt(e.target.value),
                    }
                  })}
                  className="config-input"
                />
              </div>
              <div className="filter-item span-2">
                <label>Category Boosts</label>
                <div className="category-boosts">
                  {Object.entries(featuredConfig.content_filters.featured_categories_boost).map(([category, boost]) => ()
                    <div key={category} className="category-boost-item">
                      <span className="category-name">{category}</span>
                      <input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={boost}
                        onChange={(e) => setFeaturedConfig({)
                          ...featuredConfig,
                          content_filters: {,
                            ...featuredConfig.content_filters,
                            featured_categories_boost: {,
                              ...featuredConfig.content_filters.featured_categories_boost,
                              [category]: parseFloat(e.target.value)
                            }
                          }
                        })}
                        className="boost-input"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* A/B Testing */}
        <Card className="config-section">
          <CardHeader>
            <CardTitle className="section-title">
              <Target className="w-5 h-5 text-purple-500" />
              A/B Testing Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="ab-testing-config">
              <div className="ab-header">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={featuredConfig.ab_testing.enabled}
                    onChange={(e) => setFeaturedConfig({)
                      ...featuredConfig,
                      ab_testing: {,
                        ...featuredConfig.ab_testing,
                        enabled: e.target.checked,
                      }
                    })}
                  />
                  <span>Enable A/B Testing</span>
                </label>
                <div className="traffic-allocation">
                  <label>Traffic Allocation: {featuredConfig.ab_testing.traffic_allocation}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={featuredConfig.ab_testing.traffic_allocation}
                    onChange={(e) => setFeaturedConfig({)
                      ...featuredConfig,
                      ab_testing: {,
                        ...featuredConfig.ab_testing,
                        traffic_allocation: parseInt(e.target.value),
                      }
                    })}
                    className="traffic-slider"
                  />
                </div>
              </div>
              {featuredConfig.ab_testing.enabled && ()
                <div className="variants-list">
                  <h5>Test Variants</h5>
                  {featuredConfig.ab_testing.variants.map(variant => ()
                    <div key={variant.id} className="variant-item">
                      <div className="variant-info">
                        <h6>{variant.name}</h6>
                        <span className="variant-allocation">{variant.allocation_percentage}% allocation</span>
                      </div>
                      {variant.performance_metrics && ()
                        <div className="variant-metrics">
                          <div className="variant-metric">
                            <span>CTR: {variant.performance_metrics.ctr}%</span>
                          </div>
                          <div className="variant-metric">
                            <span>Conv: {variant.performance_metrics.conversion_rate}%</span>
                          </div>
                          <div className="variant-metric">
                            <span>Rev/View: ${variant.performance_metrics.revenue_per_view}</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  const renderPerformanceMetrics = () => (;)
    <div className="metrics-section">
      <div className="metrics-header">
        <h3>Performance Metrics</h3>
        <div className="header-actions">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      <div className="metrics-overview">
        <div className="overview-cards">
          <Card className="metric-card">
            <CardContent>
              <div className="metric-header">
                <Eye className="w-6 h-6 text-blue-500" />
                <div className="metric-trend positive">
                  <TrendingUp className="w-4 h-4" />
                  +12.5%
                </div>
              </div>
              <div className="metric-content">
                <div className="metric-value">{metrics.overall_performance.total_recommendations_served.toLocaleString()}</div>
                <div className="metric-label">Total Recommendations</div>
              </div>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent>
              <div className="metric-header">
                <Target className="w-6 h-6 text-green-500" />
                <div className="metric-trend positive">
                  <TrendingUp className="w-4 h-4" />
                  +8.2%
                </div>
              </div>
              <div className="metric-content">
                <div className="metric-value">{metrics.overall_performance.click_through_rate.toFixed(2)}%</div>
                <div className="metric-label">Click-Through Rate</div>
              </div>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent>
              <div className="metric-header">
                <Zap className="w-6 h-6 text-purple-500" />
                <div className="metric-trend positive">
                  <TrendingUp className="w-4 h-4" />
                  +15.7%
                </div>
              </div>
              <div className="metric-content">
                <div className="metric-value">{metrics.overall_performance.conversion_rate.toFixed(1)}%</div>
                <div className="metric-label">Conversion Rate</div>
              </div>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent>
              <div className="metric-header">
                <Activity className="w-6 h-6 text-orange-500" />
                <div className="metric-trend positive">
                  <TrendingUp className="w-4 h-4" />
                  +22.1%
                </div>
              </div>
              <div className="metric-content">
                <div className="metric-value">${metrics.overall_performance.revenue_impact.toLocaleString()}</div>}
                <div className="metric-label">Revenue Impact</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="detailed-metrics">
        <Card>
          <CardHeader>
            <CardTitle>Algorithm Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="algorithm-comparison">
              <div className="comparison-table">
                <div className="table-header">
                  <div className="header-cell">Algorithm</div>
                  <div className="header-cell">Precision</div>
                  <div className="header-cell">Recall</div>
                  <div className="header-cell">F1 Score</div>
                  <div className="header-cell">Latency</div>
                  <div className="header-cell">Cache Hit</div>
                </div>
                {Object.entries(metrics.algorithm_performance).map(([algId, perf]) => {
                  const algorithm = algorithms.find(a => a.id === algId);
                  return ()
                    <div key={algId} className="table-row">
                      <div className="cell algorithm-name">
                        {algorithm?.name || algId}
                        {algorithm?.enabled && <Badge className="enabled-badge">Active</Badge>}
                      </div>
                      <div className="cell metric-cell">{(perf.precision * 100).toFixed(1)}%</div>
                      <div className="cell metric-cell">{(perf.recall * 100).toFixed(1)}%</div>
                      <div className="cell metric-cell">{(perf.f1_score * 100).toFixed(1)}%</div>
                      <div className="cell metric-cell">{perf.latency_ms}ms</div>
                      <div className="cell metric-cell">{(perf.cache_hit_rate * 100).toFixed(1)}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Real-Time Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="real-time-stats">
              <div className="stat-item">
                <div className="stat-icon">
                  <Activity className="w-5 h-5 text-green-500" />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{metrics.real_time_stats.current_recommendations_per_minute.toLocaleString()}</div>
                  <div className="stat-label">Recommendations/Min</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{metrics.real_time_stats.active_users.toLocaleString()}</div>
                  <div className="stat-label">Active Users</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <Database className="w-5 h-5 text-purple-500" />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{metrics.real_time_stats.cache_utilization.toFixed(1)}%</div>
                  <div className="stat-label">Cache Utilization</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <Target className="w-5 h-5 text-orange-500" />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{metrics.real_time_stats.model_accuracy.toFixed(1)}%</div>
                  <div className="stat-label">Model Accuracy</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  return ()
    <div className={`recommendation-engine-admin ${className}`}>}
      <div className="admin-header">
        <div className="header-info">
          <h2>Recommendation Engine Administration</h2>
          <p>Configure algorithms and monitor recommendation performance</p>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="admin-tabs">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="algorithms">
            <Brain className="w-4 h-4 mr-2" />
            Algorithms
          </TabsTrigger>
          <TabsTrigger value="featured">
            <Star className="w-4 h-4 mr-2" />
            Featured Content
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>
        <TabsContent value="algorithms" className="tab-content">
          {renderAlgorithmManagement()}
        </TabsContent>
        <TabsContent value="featured" className="tab-content">
          {renderFeaturedContentConfig()}
        </TabsContent>
        <TabsContent value="metrics" className="tab-content">
          {renderPerformanceMetrics()}
        </TabsContent>
      </Tabs>
      <style>{`
        .recommendation-engine-admin {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .header-info h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }
        .header-info p {
          color: #6b7280;
          font-size: 1rem;
        }
        .algorithms-section,
        .featured-config-section,
        .metrics-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .algorithms-header,
        .config-header,
        .metrics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .algorithms-header h3,
        .config-header h3,
        .metrics-header h3 {
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }
        .header-actions {
          display: flex;
          gap: 0.5rem;
        }
        .algorithms-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .algorithm-card .card-content {
          padding-top: 0;
        }
        .algorithm-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }
        .algorithm-info {
          flex: 1;
        }
        .algorithm-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .algorithm-title h4 {
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }
        .algorithm-info p {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
        }
        .algorithm-controls {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: flex-end;
        }
        .weight-control {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          align-items: center;
        }
        .weight-control label {
          font-size: 0.875rem;
          color: #374151;
        }
        .weight-slider {
          width: 80px;
        }
        .enable-switch {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #374151;
          cursor: pointer;
        }
        .algorithm-metrics {
          margin-bottom: 1rem;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        .metric-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          text-align: center;
        }
        .metric-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }
        .metric-value {
          font-size: 0.875rem;
          color: #1f2937;
          font-weight: 600;
        }
        .algorithm-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }
        .config-sections {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .config-section .card-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .weights-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .weight-control {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .weight-label {
          font-weight: 500;
          color: #374151;
        }
        .weight-input-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .weight-slider {
          flex: 1;
        }
        .weight-value {
          font-weight: 600;
          color: #1f2937;
          min-width: 30px;
          text-align: right;
        }
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .filter-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .filter-item.span-2 {
          grid-column: span 2;
        }
        .filter-item label {
          font-weight: 500;
          color: #374151;
        }
        .config-input {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        }
        .category-boosts {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .category-boost-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .category-name {
          font-weight: 500;
          color: #374151;
          min-width: 100px;
          text-transform: capitalize;
        }
        .boost-input {
          width: 80px;
          padding: 0.25rem 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.875rem;
        }
        .ab-testing-config {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .ab-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
        }
        .traffic-allocation {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          align-items: center;
        }
        .traffic-allocation label {
          font-size: 0.875rem;
          color: #374151;
        }
        .traffic-slider {
          width: 120px;
        }
        .variants-list h5 {
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.75rem 0;
        }
        .variant-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          margin-bottom: 0.5rem;
        }
        .variant-info h6 {
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.25rem 0;
        }
        .variant-allocation {
          font-size: 0.875rem;
          color: #6b7280;
        }
        .variant-metrics {
          display: flex;
          gap: 1rem;
        }
        .variant-metric span {
          font-size: 0.875rem;
          color: #374151;
          font-weight: 500;
        }
        .metrics-overview {
          margin-bottom: 1.5rem;
        }
        .overview-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        .metric-card .card-content {
          padding: 1.5rem;
        }
        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .metric-trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }
        .metric-trend.positive {
          color: #059669;
          background: #d1fae5;
        }
        .metric-content {
          text-align: center;
        }
        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
        }
        .metric-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.5rem;
        }
        .detailed-metrics {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .algorithm-comparison {
          overflow-x: auto;
        }
        .comparison-table {
          display: grid;
          grid-template-columns: 2fr repeat(5, 1fr);
          gap: 0;
          min-width: 600px;
        }
        .table-header {
          display: contents;
        }
        .header-cell {
          padding: 0.75rem;
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }
        .table-row {
          display: contents;
        }
        .table-row:nth-child(even) .cell {
          background: #f9fafb;
        }
        .cell {
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
        }
        .algorithm-name {
          font-weight: 500;
          color: #1f2937;
          gap: 0.5rem;
        }
        .enabled-badge {
          font-size: 0.75rem;
          padding: 0.125rem 0.375rem;
          background: #d1fae5;
          color: #059669;
        }
        .metric-cell {
          justify-content: center;
          font-weight: 600;
          color: #374151;
        }
        .real-time-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }
        .stat-icon {
          flex-shrink: 0;
        }
        .stat-content {
          flex: 1;
        }
        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
        }
        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
        @media (max-width: 1200px) {
          .overview-cards {
            grid-template-columns: repeat(2, 1fr);
          }
          .real-time-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          .weights-grid {
            grid-template-columns: 1fr;
          }
          .filters-grid {
            grid-template-columns: 1fr;
          }
          .filter-item.span-2 {
            grid-column: span 1;
          }
        }
        @media (max-width: 768px) {
          .admin-header {
            flex-direction: column;
            gap: 1rem;
          }
          .overview-cards {
            grid-template-columns: 1fr;
          }
          .real-time-stats {
            grid-template-columns: 1fr;
          }
          .algorithm-header {
            flex-direction: column;
            gap: 0.75rem;
          }
          .ab-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          .variant-item {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RecommendationEngineAdmin;