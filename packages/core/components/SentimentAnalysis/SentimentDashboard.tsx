/**
 * Epic 16 Marketplace Sentiment Analysis Dashboard Component
 * 
 * Comprehensive dashboard for viewing sentiment analytics, trends, and insights.
 * Displays sentiment distribution, emotion analysis, toxicity metrics, and recommendations.
 * 
 * Task: E16-1753114247016-0B348A - Create sentiment analysis
 */
import React, { useState, useEffect } from 'react';
import {
  SentimentAnalytics,
  SentimentType,
  EmotionType,
  ToxicityLevel
} from '../../types/SentimentAnalysisTypes';
import { SentimentAnalysisService } from '../../services/SentimentAnalysisService';
interface SentimentDashboardProps {
  resourceId: string;
  resourceType: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
  refreshInterval?: number; // Auto-refresh interval in milliseconds
}

export const SentimentDashboard: React.FC<SentimentDashboardProps> = ({)
  resourceId,
  resourceType,
  timeRange,
  refreshInterval
}) => {
  const [analytics, setAnalytics] = useState<SentimentAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, _____setSelectedTimeRange] = useState(timeRange || {)
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  });
  const sentimentService = new SentimentAnalysisService({)
    baseUrl: 'https://prompt-spaghetti.vercel.app',
  });
  useEffect(() => {
    loadAnalytics();
    // Set up auto-refresh if specified
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(loadAnalytics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [resourceId, resourceType, selectedTimeRange, refreshInterval]);
  const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const analyticsData = await sentimentService.getSentimentAnalytics(;);
        resourceId,
        resourceType,
        selectedTimeRange
      );
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sentiment analytics');
    } finally {
      setIsLoading(false);
    }
  };
  const getSentimentColor = (sentiment: SentimentType) => {
    switch (sentiment) {
    case 'positive': return '#059669';
    case 'negative': return '#dc2626';
    default: return '#6b7280';
    }
  };
  const getEmotionIcon = (emotion: EmotionType) => {
    const icons = {
      joy: '😄',
      sadness: '😢',
      anger: '😠',
      fear: '😨',
      surprise: '😲',
      disgust: '😒',
      trust: '😊',
      anticipation: '🤔',
    };
    return icons[emotion] || '😐';
  };
  const getToxicityColor = (level: ToxicityLevel) => {
    switch (level) {
    case 'severe': return '#dc2626';
    case 'high': return '#ea580c';
    case 'medium': return '#d97706';
    case 'low': return '#facc15';
    default: return '#059669';
    }
  };
  const formatPercentage = (num: number) => {
    return num.toFixed(1) + '%';
  };
  const renderSentimentDistribution = () => {
    if (!analytics) return null;
    const { sentimentDistribution } = analytics;
    const _____total = sentimentDistribution.positive.count + ;
                 sentimentDistribution.neutral.count + 
                 sentimentDistribution.negative.count;
    return ();
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e5e7eb',
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#111827',
        }}>
          📊 Sentiment Distribution
        </h3>
        {/* Sentiment Bar Chart */}
        <div style={{
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '16px',
          height: '40px',
          display: 'flex',
        }}>
          <div 
            style={{
              backgroundColor: '#059669',
              width: `${sentimentDistribution.positive.percentage}%`,}
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: '600',
            }}
          >
            {sentimentDistribution.positive.percentage > 10 && 
             formatPercentage(sentimentDistribution.positive.percentage)}
          </div>
          <div 
            style={{
              backgroundColor: '#6b7280',
              width: `${sentimentDistribution.neutral.percentage}%`,}
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: '600',
            }}
          >
            {sentimentDistribution.neutral.percentage > 10 && 
             formatPercentage(sentimentDistribution.neutral.percentage)}
          </div>
          <div 
            style={{
              backgroundColor: '#dc2626',
              width: `${sentimentDistribution.negative.percentage}%`,}
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: '600',
            }}
          >
            {sentimentDistribution.negative.percentage > 10 && 
             formatPercentage(sentimentDistribution.negative.percentage)}
          </div>
        </div>
        {/* Sentiment Details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#059669',
              marginBottom: '4px',
            }}>
              {sentimentDistribution.positive.count}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '4px',
            }}>
              Positive ({formatPercentage(sentimentDistribution.positive.percentage)})
            </div>
            <div style={{
              fontSize: '10px',
              color: '#9ca3af',
            }}>
              Avg: {sentimentDistribution.positive.averageScore.toFixed(2)}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#6b7280',
              marginBottom: '4px',
            }}>
              {sentimentDistribution.neutral.count}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '4px',
            }}>
              Neutral ({formatPercentage(sentimentDistribution.neutral.percentage)})
            </div>
            <div style={{
              fontSize: '10px',
              color: '#9ca3af',
            }}>
              Avg: {sentimentDistribution.neutral.averageScore.toFixed(2)}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#dc2626',
              marginBottom: '4px',
            }}>
              {sentimentDistribution.negative.count}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '4px',
            }}>
              Negative ({formatPercentage(sentimentDistribution.negative.percentage)})
            </div>
            <div style={{
              fontSize: '10px',
              color: '#9ca3af',
            }}>
              Avg: {sentimentDistribution.negative.averageScore.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    );
  };
  const renderEmotionAnalysis = () => {
    if (!analytics) return null;
    const { emotionAnalytics } = analytics;
    return ();
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e5e7eb',
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#111827',
        }}>
          🎭 Emotion Analysis
        </h3>
        {/* Dominant Emotion */}
        {emotionAnalytics.dominant && ()
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '32px',
              marginBottom: '8px',
            }}>
              {getEmotionIcon(emotionAnalytics.dominant)}
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#0c4a6e',
              textTransform: 'capitalize',
            }}>
              Dominant Emotion: {emotionAnalytics.dominant}
            </div>
          </div>
        )}
        {/* Emotion Distribution */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
        }}>
          {Object.entries(emotionAnalytics.distribution).map(([emotion, percentage]) => ()
            <div
              key={emotion}
              style={{
                textAlign: 'center',
                padding: '8px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                {getEmotionIcon(emotion as EmotionType)}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#374151',
                textTransform: 'capitalize',
                marginBottom: '2px',
              }}>
                {emotion}
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
              }}>
                {formatPercentage(percentage)}
              </div>
            </div>
          ))}
        </div>
        {/* Mixed Emotion Rate */}
        <div style={{
          marginTop: '12px',
          padding: '8px',
          backgroundColor: '#fef3c7',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#92400e',
          textAlign: 'center',
        }}>
          🌀 Mixed emotions detected in {formatPercentage(emotionAnalytics.mixedEmotionRate)} of feedback
        </div>
      </div>
    );
  };
  const renderToxicityAnalysis = () => {
    if (!analytics) return null;
    const { toxicityAnalytics } = analytics;
    return ();
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e5e7eb',
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#111827',
        }}>
          🛡️ Toxicity Analysis
        </h3>
        {/* Overall Toxicity Level */}
        <div style={{
          backgroundColor: toxicityAnalytics.overallLevel === 'none' ? '#f0fdf4' : ,
            toxicityAnalytics.overallLevel === 'low' ? '#fefce8' :
              toxicityAnalytics.overallLevel === 'medium' ? '#fef3c7' :
                toxicityAnalytics.overallLevel === 'high' ? '#fef2f2' : '#fecaca',
          border: `1px solid ${getToxicityColor(toxicityAnalytics.overallLevel)}40`,}
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: getToxicityColor(toxicityAnalytics.overallLevel),
            textTransform: 'uppercase',
          }}>
            Overall Level: {toxicityAnalytics.overallLevel}
          </div>
        </div>
        {/* Toxicity Distribution */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
          marginBottom: '16px',
        }}>
          {Object.entries(toxicityAnalytics.distribution).map(([level, percentage]) => ()
            <div
              key={level}
              style={{
                textAlign: 'center',
                padding: '8px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                border: `2px solid ${getToxicityColor(level as ToxicityLevel)}20`}
              }}
            >
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: getToxicityColor(level as ToxicityLevel),
                marginBottom: '4px',
              }}>
                {formatPercentage(percentage)}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#374151',
                textTransform: 'capitalize',
              }}>
                {level}
              </div>
            </div>
          ))}
        </div>
        {/* Toxicity Categories */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '12px',
        }}>
          {Object.entries(toxicityAnalytics.categories).map(([category, percentage]) => ()
            <div
              key={category}
              style={{
                padding: '6px 8px',
                backgroundColor: percentage > 10 ? '#fef2f2' : '#f9fafb',
                borderRadius: '4px',
                fontSize: '11px',
                textAlign: 'center',
              }}
            >
              <div style={{
                fontWeight: '600',
                color: percentage > 10 ? '#dc2626' : '#6b7280',
                marginBottom: '2px',
              }}>
                {formatPercentage(percentage)}
              </div>
              <div style={{
                color: '#9ca3af',
                textTransform: 'capitalize',
              }}>
                {category.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
        {/* Action Required */}
        {toxicityAnalytics.actionRequired > 0 && ()
          <div style={{
            padding: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#dc2626',
            textAlign: 'center',
          }}>
            ⚠️ {formatPercentage(toxicityAnalytics.actionRequired)} of content requires moderation action
          </div>
        )}
      </div>
    );
  };
  const renderInsights = () => {
    if (!analytics) return null;
    const { insights } = analytics;
    return ();
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e5e7eb',
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#111827',
        }}>
          💡 Key Insights
        </h3>
        {/* Quality Metrics */}
        <div style={{
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
        }}>
          <h4 style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: '#0c4a6e',
          }}>
            🏆 Quality Metrics
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e40af',
              }}>
                {insights.qualityMetrics.averageReadability}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#6b7280',
              }}>
                Readability
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e40af',
              }}>
                {insights.qualityMetrics.averageConstructiveness}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#6b7280',
              }}>
                Constructiveness
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e40af',
              }}>
                {insights.qualityMetrics.averageHelpfulness}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#6b7280',
              }}>
                Helpfulness
              </div>
            </div>
          </div>
        </div>
        {/* Top Keywords */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '16px',
        }}>
          <div>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              fontWeight: '600',
              color: '#059669',
            }}>
              🟢 Top Positive Keywords
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {insights.topPositiveKeywords.map(keyword => ()
                <span
                  key={keyword}
                  style={{
                    padding: '2px 6px',
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    borderRadius: '4px',
                    fontSize: '11px',
                  }}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              fontWeight: '600',
              color: '#dc2626',
            }}>
              🔴 Top Negative Keywords
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {insights.topNegativeKeywords.map(keyword => ()
                <span
                  key={keyword}
                  style={{
                    padding: '2px 6px',
                    backgroundColor: '#fecaca',
                    color: '#991b1b',
                    borderRadius: '4px',
                    fontSize: '11px',
                  }}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* Emerging Topics */}
        {insights.emergingTopics.length > 0 && ()
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              fontWeight: '600',
              color: '#7c2d12',
            }}>
              📈 Emerging Topics
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {insights.emergingTopics.map(topic => ()
                <div
                  key={topic.topic}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 8px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  <span style={{
                    color: '#92400e',
                    textTransform: 'capitalize',
                  }}>
                    {topic.topic.replace('_', ' ')}
                  </span>
                  <span style={{
                    color: getSentimentColor(topic.sentiment),
                    fontWeight: '600',
                  }}>
                    {topic.sentiment} (+{topic.growth}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Recommendations */}
        {insights.recommendations.length > 0 && ()
          <div>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              fontWeight: '600',
              color: '#7c2d12',
            }}>
              🎯 Recommendations
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {insights.recommendations.map((rec, index) => ()
                <div
                  key={index}
                  style={{
                    padding: '8px',
                    backgroundColor: rec.priority === 'critical' ? '#fef2f2' :,
                      rec.priority === 'high' ? '#fef3c7' :
                        rec.priority === 'medium' ? '#eff6ff' : '#f9fafb',
                    border: `1px solid ${rec.priority === 'critical' ? '#fecaca' :}
                      rec.priority === 'high' ? '#fed7aa' :
                        rec.priority === 'medium' ? '#bfdbfe' : '#e5e7eb'}`,
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px',
                  }}>
                    <span style={{
                      fontWeight: '600',
                      color: rec.priority === 'critical' ? '#dc2626' :,
                        rec.priority === 'high' ? '#d97706' :
                          rec.priority === 'medium' ? '#2563eb' : '#374151',
                      textTransform: 'capitalize',
                    }}>
                      {rec.type.replace('_', ' ')}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                    }}>
                      {rec.priority} priority
                    </span>
                  </div>
                  <div style={{
                    color: '#374151',
                    lineHeight: '1.3',
                  }}>
                    {rec.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  if (isLoading) {
    return ();
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#6b7280',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px',
        }}></div>
        Loading sentiment analytics...
      </div>
    );
  }
  if (error) {
    return ();
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#dc2626',
        backgroundColor: '#fef2f2',
        borderRadius: '8px',
        border: '1px solid #fecaca',
      }}>
        <div style={{ fontSize: '18px', marginBottom: '8px' }}>⚠️</div>
        <div>Error loading sentiment analytics: {error}</div>
        <button
          onClick={loadAnalytics}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    );
  }
  if (!analytics) {
    return ();
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#6b7280',
      }}>
        No sentiment analytics data available
      </div>
    );
  }
  return ();
    <div style={{
      padding: '20px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{
            margin: '0',
            fontSize: '28px',
            fontWeight: '700',
            color: '#111827',
          }}>
            📊 Sentiment Analytics Dashboard
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '14px',
            color: '#6b7280',
          }}>
            {analytics.totalAnalyses} analyses from {selectedTimeRange.start.toLocaleDateString()} to {selectedTimeRange.end.toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          🔄 Refresh
        </button>
      </div>
      {/* Dashboard Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
      }}>
        {renderSentimentDistribution()}
        {renderEmotionAnalysis()}
        {renderToxicityAnalysis()}
        {renderInsights()}
      </div>
    </div>
  );
};

export default SentimentDashboard;