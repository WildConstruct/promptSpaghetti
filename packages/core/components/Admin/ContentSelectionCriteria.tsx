/**
 * Content Selection Criteria - E17-1753114397323-A4BE50
 * 
 * Administrative interface for creating and managing content selection criteria
 * Part of Epic 17.5.2 - Featured Content Tools (Backstage Admin Controls)
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  Settings,
  Filter,
  Users,
  Calendar,
  TrendingUp,
  Star,
  Download,
  Tag,
  Globe,
  Shield,
  Plus,
  Trash2,
  Copy,
  Eye,
  Play,
  Save,
  RefreshCw,
  Target,
  BarChart3,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

// Types based on existing PromotionSchedulingService
export interface ContentCriteria {
  // Quality filters
  min_rating?: number;
  min_download_count?: number;
  quality_score_threshold?: number;
  // Category filters
  categories?: string[];
  tags?: string[];
  exclude_categories?: string[];
  // Time-based filters
  published_after?: Date;
  last_updated_after?: Date;
  // Creator filters
  creator_ids?: string[];
  creator_tiers?: string[];
  // Performance filters
  min_conversion_rate?: number;
  min_engagement_score?: number;
  // Content attributes
  content_types?: string[];
  languages?: string[];
  // Exclusions
  exclude_content_ids?: string[];
  exclude_recently_promoted?: boolean;
  exclude_current_promotions?: boolean;
  // Limits
  max_content_count?: number;
  diversification_rules?: DiversificationRule[];
}

export interface DiversificationRule {
  attribute: string;
  max_percentage: number;
  enforce_uniqueness: boolean;
}

export interface SelectionCriteriaTemplate {
  id: string;
  name: string;
  description: string;
  category: 'quality' | 'performance' | 'diversity' | 'trending' | 'seasonal' | 'custom';
  criteria: ContentCriteria;
  is_system_template: boolean;
  usage_count: number;
  created_by: string;
  created_at: Date;
  last_used?: Date;
}

export interface ContentSelectionPreview {
  total_matches: number;
  sample_content: Array<{,
    id: string;
    title: string;
    creator: string;
    rating: number;
    downloads: number;
    category: string;
    match_reasons: string[];
  }>;
  category_distribution: Record<string, number>;
  creator_distribution: Record<string, number>;
  quality_stats: {,
    avg_rating: number;
    avg_downloads: number;
    avg_engagement: number;
  };
  performance_prediction: {,
    expected_ctr: number;
    expected_conversion_rate: number;
    confidence_level: number;
  };
}

export interface ContentSelectionCriteriaProps {
  className?: string;
}

export const ContentSelectionCriteria: React.FC<ContentSelectionCriteriaProps> = ({)
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('builder');
  const [currentCriteria, setCurrentCriteria] = useState<ContentCriteria>({});
  const [templates] = useState<SelectionCriteriaTemplate[]>([)
    {
      id: 'template-trending',
      name: 'Trending Content',
      description: 'High-performing content with recent engagement',
      category: 'trending',
      criteria: {,
        min_rating: 4.0,
        min_download_count: 100,
        published_after: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        min_engagement_score: 75,
        exclude_recently_promoted: true,
        max_content_count: 20,
      },
      is_system_template: true,
      usage_count: 45,
      created_by: 'system',
      created_at: new Date('2024-01-15'),
      last_used: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'template-quality',
      name: 'Premium Quality',
      description: 'Highest quality content from top creators',
      category: 'quality',
      criteria: {,
        min_rating: 4.5,
        quality_score_threshold: 90,
        creator_tiers: ['premium', 'verified'],
        min_download_count: 500,
        exclude_current_promotions: true,
        diversification_rules: [,
          { attribute: 'creator', max_percentage: 30, enforce_uniqueness: true },
          { attribute: 'category', max_percentage: 40, enforce_uniqueness: false }
        ]
      },
      is_system_template: true,
      usage_count: 78,
      created_by: 'system',
      created_at: new Date('2024-01-10'),
      last_used: new Date(Date.now() - 24 * 60 * 60 * 1000),
    }
  ]);
  const [previewData] = useState<ContentSelectionPreview>({)
    total_matches: 187,
    sample_content: [,
      {
        id: 'content-1',
        title: 'Professional Business Card Template',
        creator: 'DesignPro',
        rating: 4.8,
        downloads: 2450,
        category: 'Business',
        match_reasons: ['High rating', 'Popular downloads', 'Premium creator']
      },
      {
        id: 'content-2',
        title: 'Modern Wedding Invitation Suite',
        creator: 'EventDesigns',
        rating: 4.7,
        downloads: 1890,
        category: 'Events',
        match_reasons: ['Quality score', 'Recent engagement', 'Trending']
      }
    ],
    category_distribution: {,
      'Business': 45,
      'Events': 32,
      'Marketing': 28,
      'Creative': 25,
      'Educational': 18
    },
    creator_distribution: {,
      'Premium': 67,
      'Verified': 89,
      'Community': 31
    },
    quality_stats: {,
      avg_rating: 4.6,
      avg_downloads: 1845,
      avg_engagement: 82.5,
    },
    performance_prediction: {,
      expected_ctr: 3.8,
      expected_conversion_rate: 12.4,
      confidence_level: 0.85,
    }
  });
  const categories = ['Business', 'Events', 'Marketing', 'Creative', 'Educational', 'Technology'];
  const contentTypes = ['Template', 'Asset Pack', 'Component', 'Theme', 'Tool'];
    const creatorTiers = ['premium', 'verified', 'community'];
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'trending': 'text-orange-600 bg-orange-100',
      'quality': 'text-purple-600 bg-purple-100',
      'performance': 'text-green-600 bg-green-100',
      'diversity': 'text-blue-600 bg-blue-100',
      'seasonal': 'text-pink-600 bg-pink-100',
      'custom': 'text-gray-600 bg-gray-100'
    };
    return colors[category] || 'text-gray-600 bg-gray-100';
  };
  const renderCriteriaBuilder = () => (;);
    <div className="criteria-builder">
      <div className="builder-sections">
        {/* Quality Filters */}
        <Card className="builder-section">
          <CardHeader>
            <CardTitle className="section-title">
              <Star className="w-5 h-5 text-yellow-500" />
              Quality Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="filter-grid">
              <div className="filter-item">
                <label>Minimum Rating</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={currentCriteria.min_rating || ''}
                    onChange={(e) => setCurrentCriteria({)
                      ...currentCriteria,
                      min_rating: parseFloat(e.target.value) || undefined,
                    })}
                    className="criteria-input"
                    placeholder="4.0"
                  />
                  <span className="input-unit">stars</span>
                </div>
              </div>
              <div className="filter-item">
                <label>Minimum Downloads</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    min="0"
                    value={currentCriteria.min_download_count || ''}
                    onChange={(e) => setCurrentCriteria({)
                      ...currentCriteria,
                      min_download_count: parseInt(e.target.value) || undefined,
                    })}
                    className="criteria-input"
                    placeholder="100"
                  />
                  <span className="input-unit">downloads</span>
                </div>
              </div>
              <div className="filter-item">
                <label>Quality Score Threshold</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={currentCriteria.quality_score_threshold || ''}
                    onChange={(e) => setCurrentCriteria({)
                      ...currentCriteria,
                      quality_score_threshold: parseInt(e.target.value) || undefined,
                    })}
                    className="criteria-input"
                    placeholder="80"
                  />
                  <span className="input-unit">%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Category & Content Filters */}
        <Card className="builder-section">
          <CardHeader>
            <CardTitle className="section-title">
              <Tag className="w-5 h-5 text-blue-500" />
              Category & Content Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="filter-grid">
              <div className="filter-item span-2">
                <label>Include Categories</label>
                <div className="multi-select">
                  {categories.map(category => ()
                    <label key={category} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={currentCriteria.categories?.includes(category) || false}
                        onChange={(e) => {
                          const categories = currentCriteria.categories || [];
                          if (e.target.checked) {
                            setCurrentCriteria({)
                              ...currentCriteria,
                              categories: [...categories, category]
                            });
                          } else {
                            setCurrentCriteria({)
                              ...currentCriteria,
                              categories: categories.filter(c => c !== category),
                            });
                          }
                        }}
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="filter-item span-2">
                <label>Content Types</label>
                <div className="multi-select">
                  {contentTypes.map(type => ()
                    <label key={type} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={currentCriteria.content_types?.includes(type) || false}
                        onChange={(e) => {
                          const types = currentCriteria.content_types || [];
                          if (e.target.checked) {
                            setCurrentCriteria({)
                              ...currentCriteria,
                              content_types: [...types, type]
                            });
                          } else {
                            setCurrentCriteria({)
                              ...currentCriteria,
                              content_types: types.filter(t => t !== type),
                            });
                          }
                        }}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Performance Filters */}
        <Card className="builder-section">
          <CardHeader>
            <CardTitle className="section-title">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Performance Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="filter-grid">
              <div className="filter-item">
                <label>Min Conversion Rate</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={currentCriteria.min_conversion_rate || ''}
                    onChange={(e) => setCurrentCriteria({)
                      ...currentCriteria,
                      min_conversion_rate: parseFloat(e.target.value) || undefined,
                    })}
                    className="criteria-input"
                    placeholder="5.0"
                  />
                  <span className="input-unit">%</span>
                </div>
              </div>
              <div className="filter-item">
                <label>Min Engagement Score</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={currentCriteria.min_engagement_score || ''}
                    onChange={(e) => setCurrentCriteria({)
                      ...currentCriteria,
                      min_engagement_score: parseInt(e.target.value) || undefined,
                    })}
                    className="criteria-input"
                    placeholder="70"
                  />
                  <span className="input-unit">pts</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Creator & Time Filters */}
        <Card className="builder-section">
          <CardHeader>
            <CardTitle className="section-title">
              <Users className="w-5 h-5 text-purple-500" />
              Creator & Time Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="filter-grid">
              <div className="filter-item">
                <label>Creator Tiers</label>
                <div className="multi-select">
                  {creatorTiers.map(tier => ()
                    <label key={tier} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={currentCriteria.creator_tiers?.includes(tier) || false}
                        onChange={(e) => {
                          const tiers = currentCriteria.creator_tiers || [];
                          if (e.target.checked) {
                            setCurrentCriteria({)
                              ...currentCriteria,
                              creator_tiers: [...tiers, tier]
                            });
                          } else {
                            setCurrentCriteria({)
                              ...currentCriteria,
                              creator_tiers: tiers.filter(t => t !== tier),
                            });
                          }
                        }}
                      />
                      <span className="capitalize">{tier}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="filter-item">
                <label>Published After</label>
                <input
                  type="date"
                  value={currentCriteria.published_after ? 
                    currentCriteria.published_after.toISOString().split('T')[0] : ''}
                  onChange={(e) => setCurrentCriteria({)
                    ...currentCriteria,
                    published_after: e.target.value ? new Date(e.target.value) : undefined,
                  })}
                  className="criteria-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Advanced Settings */}
        <Card className="builder-section">
          <CardHeader>
            <CardTitle className="section-title">
              <Settings className="w-5 h-5 text-gray-500" />
              Advanced Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="filter-grid">
              <div className="filter-item">
                <label>Max Content Count</label>
                <input
                  type="number"
                  min="1"
                  value={currentCriteria.max_content_count || ''}
                  onChange={(e) => setCurrentCriteria({)
                    ...currentCriteria,
                    max_content_count: parseInt(e.target.value) || undefined,
                  })}
                  className="criteria-input"
                  placeholder="50"
                />
              </div>
              <div className="filter-item span-2">
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={currentCriteria.exclude_recently_promoted || false}
                      onChange={(e) => setCurrentCriteria({)
                        ...currentCriteria,
                        exclude_recently_promoted: e.target.checked,
                      })}
                    />
                    <span>Exclude recently promoted content</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={currentCriteria.exclude_current_promotions || false}
                      onChange={(e) => setCurrentCriteria({)
                        ...currentCriteria,
                        exclude_current_promotions: e.target.checked,
                      })}
                    />
                    <span>Exclude currently promoted content</span>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="builder-actions">
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button variant="outline">
          <Copy className="w-4 h-4 mr-2" />
          Copy from Template
        </Button>
        <Button>
          <Eye className="w-4 h-4 mr-2" />
          Preview Selection
        </Button>
        <Button className="bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4 mr-2" />
          Save Criteria
        </Button>
      </div>
    </div>
  );
  const renderTemplates = () => (;);
    <div className="templates-section">
      <div className="templates-header">
        <h3>Selection Criteria Templates</h3>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>
      <div className="templates-grid">
        {templates.map(template => ()
          <Card key={template.id} className="template-card">
            <CardHeader>
              <div className="template-header">
                <div className="template-info">
                  <h4>{template.name}</h4>
                  <p>{template.description}</p>
                </div>
                <Badge className={getCategoryColor(template.category)}>
                  {template.category.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="template-stats">
                <div className="stat-group">
                  <span className="stat-label">Usage</span>
                  <span className="stat-value">{template.usage_count} times</span>
                </div>
                <div className="stat-group">
                  <span className="stat-label">Last Used</span>
                  <span className="stat-value">
                    {template.last_used ? template.last_used.toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
              <div className="template-preview">
                <h5>Criteria Overview</h5>
                <div className="criteria-tags">
                  {template.criteria.min_rating && ()
                    <Badge className="criteria-tag">
                      <Star className="w-3 h-3 mr-1" />
                      {template.criteria.min_rating}+ rating
                    </Badge>
                  )}
                  {template.criteria.min_download_count && ()
                    <Badge className="criteria-tag">
                      <Download className="w-3 h-3 mr-1" />
                      {template.criteria.min_download_count}+ downloads
                    </Badge>
                  )}
                  {template.criteria.creator_tiers && ()
                    <Badge className="criteria-tag">
                      <Users className="w-3 h-3 mr-1" />
                      {template.criteria.creator_tiers.join(', ')}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="template-actions">
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button size="sm" variant="outline">
                  <Copy className="w-4 h-4 mr-1" />
                  Use Template
                </Button>
                {!template.is_system_template && ()
                  <Button size="sm" variant="outline" className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
  const renderPreview = () => (;);
    <div className="preview-section">
      <div className="preview-header">
        <h3>Selection Preview</h3>
        <div className="preview-actions">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Preview
          </Button>
          <Button>
            <Play className="w-4 h-4 mr-2" />
            Apply Selection
          </Button>
        </div>
      </div>
      <div className="preview-metrics">
        <Card className="metric-card">
          <CardContent>
            <div className="metric-value">{previewData.total_matches}</div>
            <div className="metric-label">Total Matches</div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardContent>
            <div className="metric-value">{previewData.quality_stats.avg_rating.toFixed(1)}</div>
            <div className="metric-label">Avg Rating</div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardContent>
            <div className="metric-value">{previewData.quality_stats.avg_downloads.toLocaleString()}</div>
            <div className="metric-label">Avg Downloads</div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardContent>
            <div className="metric-value">{previewData.performance_prediction.expected_ctr.toFixed(1)}%</div>
            <div className="metric-label">Expected CTR</div>
          </CardContent>
        </Card>
      </div>
      <div className="preview-content">
        <div className="preview-left">
          <Card>
            <CardHeader>
              <CardTitle>Sample Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="sample-content-list">
                {previewData.sample_content.map(content => ()
                  <div key={content.id} className="sample-content-item">
                    <div className="content-info">
                      <h5>{content.title}</h5>
                      <div className="content-meta">
                        <span>by {content.creator}</span>
                        <Badge className="category-badge">{content.category}</Badge>
                      </div>
                      <div className="content-stats">
                        <span>★ {content.rating}</span>
                        <span>↓ {content.downloads.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="match-reasons">
                      {content.match_reasons.map(reason => ()
                        <Badge key={reason} className="reason-badge">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="preview-right">
          <Card>
            <CardHeader>
              <CardTitle>Distribution Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="distribution-charts">
                <div className="chart-section">
                  <h5>By Category</h5>
                  <div className="distribution-bars">
                    {Object.entries(previewData.category_distribution).map(([category, count]) => ()
                      <div key={category} className="distribution-bar">
                        <span className="bar-label">{category}</span>
                        <div className="bar-container">
                          <div 
                            className="bar-fill"
                            style={{ width: `${(count / previewData.total_matches) * 100}%` }}
                          ></div>
                        </div>
                        <span className="bar-value">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="chart-section">
                  <h5>Performance Prediction</h5>
                  <div className="prediction-metrics">
                    <div className="prediction-item">
                      <span className="prediction-label">Expected CTR</span>
                      <span className="prediction-value">
                        {previewData.performance_prediction.expected_ctr.toFixed(1)}%
                      </span>
                    </div>
                    <div className="prediction-item">
                      <span className="prediction-label">Expected Conversion</span>
                      <span className="prediction-value">
                        {previewData.performance_prediction.expected_conversion_rate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="prediction-item">
                      <span className="prediction-label">Confidence Level</span>
                      <span className="prediction-value">
                        {(previewData.performance_prediction.confidence_level * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
  return ();
    <div className={`content-selection-criteria ${className}`}>}
      <div className="criteria-header">
        <div className="header-info">
          <h2>Content Selection Criteria</h2>
          <p>Create and manage criteria for featured content selection</p>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="criteria-tabs">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="builder">
            <Filter className="w-4 h-4 mr-2" />
            Criteria Builder
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Target className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>
        <TabsContent value="builder" className="tab-content">
          {renderCriteriaBuilder()}
        </TabsContent>
        <TabsContent value="templates" className="tab-content">
          {renderTemplates()}
        </TabsContent>
        <TabsContent value="preview" className="tab-content">
          {renderPreview()}
        </TabsContent>
      </Tabs>
      <style>{`
        .content-selection-criteria {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .criteria-header {
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
        .criteria-builder {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .builder-sections {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .builder-section .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
        }
        .filter-grid {
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
        .criteria-input {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        }
        .criteria-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        .input-with-unit {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .input-with-unit .criteria-input {
          flex: 1;
        }
        .input-unit {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }
        .multi-select {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          color: #374151;
          cursor: pointer;
        }
        .checkbox-label input[type="checkbox"] {
          width: 1rem;
          height: 1rem;
        }
        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .builder-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        .templates-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .templates-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .templates-header h3 {
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }
        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1rem;
        }
        .template-card .card-content {
          padding-top: 0;
        }
        .template-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }
        .template-info h4 {
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }
        .template-info p {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
        }
        .template-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
        }
        .stat-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }
        .stat-value {
          font-size: 0.875rem;
          color: #1f2937;
          font-weight: 600;
        }
        .template-preview h5 {
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }
        .criteria-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
          margin-bottom: 1rem;
        }
        .criteria-tag {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          background: #f3f4f6;
          color: #374151;
          display: flex;
          align-items: center;
        }
        .template-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }
        .preview-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .preview-header h3 {
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }
        .preview-actions {
          display: flex;
          gap: 0.5rem;
        }
        .preview-metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        .metric-card .card-content {
          text-align: center;
          padding: 1.5rem;
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
        .preview-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .sample-content-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .sample-content-item {
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }
        .content-info h5 {
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }
        .content-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .content-meta span {
          font-size: 0.875rem;
          color: #6b7280;
        }
        .category-badge {
          font-size: 0.75rem;
          padding: 0.125rem 0.375rem;
        }
        .content-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        .match-reasons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }
        .reason-badge {
          font-size: 0.75rem;
          padding: 0.125rem 0.375rem;
          background: #eff6ff;
          color: #1e40af;
        }
        .distribution-charts {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .chart-section h5 {
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.75rem 0;
        }
        .distribution-bars {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .distribution-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .bar-label {
          font-size: 0.875rem;
          color: #374151;
          min-width: 80px;
        }
        .bar-container {
          flex: 1;
          height: 20px;
          background: #f3f4f6;
          border-radius: 10px;
          overflow: hidden;
        }
        .bar-fill {
          height: 100%;
          background: #3b82f6;
          transition: width 0.3s ease;
        }
        .bar-value {
          font-size: 0.875rem;
          color: #374151;
          font-weight: 600;
          min-width: 30px;
          text-align: right;
        }
        .prediction-metrics {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .prediction-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
        }
        .prediction-label {
          font-size: 0.875rem;
          color: #6b7280;
        }
        .prediction-value {
          font-size: 0.875rem;
          color: #1f2937;
          font-weight: 600;
        }
        @media (max-width: 1200px) {
          .preview-content {
            grid-template-columns: 1fr;
          }
          .preview-metrics {
            grid-template-columns: repeat(2, 1fr);
          }
          .filter-grid {
            grid-template-columns: 1fr;
          }
          .filter-item.span-2 {
            grid-column: span 1;
          }
        }
        @media (max-width: 768px) {
          .criteria-header {
            flex-direction: column;
            gap: 1rem;
          }
          .preview-metrics {
            grid-template-columns: 1fr;
          }
          .templates-grid {
            grid-template-columns: 1fr;
          }
          .builder-actions {
            flex-wrap: wrap;
          }
          .multi-select {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ContentSelectionCriteria;