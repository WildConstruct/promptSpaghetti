/**
 * Epic 16 Contribution Card Component
 * Task: E16-1753114247118-46E576 - Design contribution UI components
 * 
 * Displays individual contributions in card format with type-specific
 * styling, status indicators, and engagement metrics.
 */
import React from 'react';
import { Contribution, ContributionType, ContributionStatus } from '../../types/contributions';

export interface ContributionCardProps {
  contribution: Contribution;
  variant?: 'compact' | 'standard' | 'detailed';
  showActions?: boolean;
  onClick?: (contribution: Contribution) => void;
  onEdit?: (contributionId: string) => void;
  onDelete?: (contributionId: string) => void;
  onView?: (contributionId: string) => void;
  className?: string;
}

export const ContributionCard: React.FC<ContributionCardProps> = ({)
  contribution,
  variant = 'standard',
  showActions = false,
  onClick,
  onEdit,
  onDelete,
  onView,
  className = ''
}) => {
  // Get type-specific styling and icons
  const getTypeConfig = (type: ContributionType) => {
    const configs = {
      template: {,
        color: '#3b82f6',
        bgColor: '#eff6ff',
        icon: '📄',
        label: 'Template',
      },
      knowledge_article: {,
        color: '#10b981',
        bgColor: '#ecfdf5',
        icon: '📚',
        label: 'Knowledge Article',
      },
      tutorial: {,
        color: '#f59e0b',
        bgColor: '#fffbeb',
        icon: '🎓',
        label: 'Tutorial',
      },
      case_study: {,
        color: '#8b5cf6',
        bgColor: '#f3e8ff',
        icon: '📊',
        label: 'Case Study',
      },
      pattern_library: {,
        color: '#ef4444',
        bgColor: '#fef2f2',
        icon: '🔧',
        label: 'Pattern Library',
      },
      community_post: {,
        color: '#06b6d4',
        bgColor: '#ecfeff',
        icon: '💬',
        label: 'Community Post',
      },
      documentation: {,
        color: '#6b7280',
        bgColor: '#f9fafb',
        icon: '📋',
        label: 'Documentation',
      },
      review: {,
        color: '#84cc16',
        bgColor: '#f7fee7',
        icon: '⭐',
        label: 'Review',
      }
    };
    return configs[type] || configs.template;
  };
  // Get status styling
  const getStatusConfig = (status: ContributionStatus) => {
    const configs = {
      draft: {,
        color: '#6b7280',
        bgColor: '#f9fafb',
        label: 'Draft',
      },
      submitted: {,
        color: '#3b82f6',
        bgColor: '#eff6ff',
        label: 'Submitted',
      },
      under_review: {,
        color: '#f59e0b',
        bgColor: '#fffbeb',
        label: 'Under Review',
      },
      revision_requested: {,
        color: '#ef4444',
        bgColor: '#fef2f2',
        label: 'Needs Revision',
      },
      approved: {,
        color: '#10b981',
        bgColor: '#ecfdf5',
        label: 'Approved',
      },
      published: {,
        color: '#10b981',
        bgColor: '#ecfdf5',
        label: 'Published',
      },
      rejected: {,
        color: '#ef4444',
        bgColor: '#fef2f2',
        label: 'Rejected',
      },
      archived: {,
        color: '#6b7280',
        bgColor: '#f9fafb',
        label: 'Archived',
      }
    };
    return configs[status] || configs.draft;
  };
  const typeConfig = getTypeConfig(contribution.type);
  const statusConfig = getStatusConfig(contribution.status);
  // Format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {)
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  // Format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  // Handle card click
  const handleCardClick = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('.card-actions')) {
      return; // Don't trigger card click if clicking on actions
    }
    onClick?.(contribution);
  };
  return ();
    <div 
      className={`contribution-card ${variant} ${className}`}
      onClick={handleCardClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Card Header */}
      <div className="card-header">
        <div className="type-badge" style={{ 
          color: typeConfig.color, 
          backgroundColor: typeConfig.bgColor ,
        }}>
          <span className="type-icon">{typeConfig.icon}</span>
          <span className="type-label">{typeConfig.label}</span>
        </div>
        <div className="status-badge" style={{
          color: statusConfig.color,
          backgroundColor: statusConfig.bgColor,
        }}>
          {statusConfig.label}
        </div>
      </div>
      {/* Card Content */}
      <div className="card-content">
        <h3 className="contribution-title">{contribution.title}</h3>
        {variant !== 'compact' && ()
          <p className="contribution-description">
            {contribution.description.length > 120 
              ? `${contribution.description.substring(0, 120)}...`}
              : contribution.description
            }
          </p>
        )}
        {/* Tags */}
        {contribution.tags.length > 0 && ()
          <div className="tags-container">
            {contribution.tags.slice(0, variant === 'compact' ? 2 : 4).map((tag, index) => ()
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
            {contribution.tags.length > (variant === 'compact' ? 2 : 4) && ()
              <span className="tag more-tags">
                +{contribution.tags.length - (variant === 'compact' ? 2 : 4)}
              </span>
            )}
          </div>
        )}
      </div>
      {/* Card Metrics */}
      {variant !== 'compact' && ()
        <div className="card-metrics">
          <div className="metric">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3C4.5 3 1.5 5.5 1.5 8.5S4.5 14 8 14s6.5-2.5 6.5-5.5S11.5 3 8 3z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <circle cx="8" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            <span>{formatNumber(contribution.views)}</span>
          </div>
          <div className="metric">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2l1.5 4.5L14 8l-4.5 1.5L8 14l-1.5-4.5L2 8l4.5-1.5L8 2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            <span>{formatNumber(contribution.likes)}</span>
          </div>
          <div className="metric">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 6c0-2.2-1.8-4-4-4s-4 1.8-4 4v2H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2h-2V6z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            <span>{contribution.qualityScore}%</span>
          </div>
          {contribution.comments > 0 && ()
            <div className="metric">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 10c0 1.1-.9 2-2 2H4l-2 2V4c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v6z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
              <span>{formatNumber(contribution.comments)}</span>
            </div>
          )}
        </div>
      )}
      {/* Card Footer */}
      <div className="card-footer">
        <div className="footer-info">
          <span className="contributor-name">{contribution.contributorName}</span>
          <span className="date">{formatDate(contribution.createdAt.toString())}</span>
        </div>
        {/* Card Actions */}
        {showActions && ()
          <div className="card-actions">
            {onView && ()
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(contribution.id);
                }}
                className="action-btn view-btn"
                title="View"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3C4.5 3 1.5 5.5 1.5 8.5S4.5 14 8 14s6.5-2.5 6.5-5.5S11.5 3 8 3z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <circle cx="8" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              </button>
            )}
            {onEdit && ()
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(contribution.id);
                }}
                className="action-btn edit-btn"
                title="Edit"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M11.5 3.5l1 1L6 11H5v-1l6.5-6.5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M10.5 4.5l1 1" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
            )}
            {onDelete && contribution.status === 'draft' && ()
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(contribution.id);
                }}
                className="action-btn delete-btn"
                title="Delete"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 2h4M2 4h12M3 4l1 9c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2l1-9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
      <style>{`
        .contribution-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .contribution-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .contribution-card.compact {
          padding: 16px;
          gap: 12px;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .type-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .type-icon {
          font-size: 14px;
        }
        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }
        .card-content {
          flex: 1;
        }
        .contribution-title {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          line-height: 1.4;
        }
        .compact .contribution-title {
          font-size: 16px;
          margin-bottom: 4px;
        }
        .contribution-description {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }
        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .tag {
          background: #f3f4f6;
          color: #4b5563;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .more-tags {
          background: #e5e7eb;
          color: #6b7280;
        }
        .card-metrics {
          display: flex;
          gap: 16px;
          padding-top: 12px;
          border-top: 1px solid #f3f4f6;
        }
        .metric {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #6b7280;
        }
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid #f3f4f6;
        }
        .footer-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }
        .contributor-name {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          truncate;
        }
        .date {
          font-size: 12px;
          color: #9ca3af;
        }
        .card-actions {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }
        .action-btn {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 6px;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .action-btn:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
          color: #374151;
        }
        .edit-btn:hover {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #3b82f6;
        }
        .delete-btn:hover {
          background: #fef2f2;
          border-color: #ef4444;
          color: #ef4444;
        }
        .view-btn:hover {
          background: #ecfdf5;
          border-color: #10b981;
          color: #10b981;
        }
        @media (max-width: 640px) {
          .contribution-card {
            padding: 16px;
            gap: 12px;
          }
          .card-header {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          .type-badge {
            align-self: flex-start;
          }
          .card-metrics {
            gap: 12px;
          }
          .card-footer {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          .card-actions {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default ContributionCard;