import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 - Case Study Card Component
 * Task: E16-1753114247141-49BDC0 - Design case study UI components
 *
 * Responsive card component for displaying case studies in gallery/list views.
 * Showcases key metrics, templates used, and engagement data.
 */
import { useState } from 'react';
export const CaseStudyCard = ({
    caseStudy,
    variant = 'standard',
    showMetrics = true,
    showTemplates = true,
    showAuthor = true,
    onClick,
    onTemplateClick,
    onAuthorClick,
    onBookmark,
    onLike,
    onShare });
className = '';
{
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [imageError, setImageError] = useState(false);
    // Get type icon and color
    const getTypeDisplay = (type) => {
        const typeConfig = {
            'template-success': { icon: '🎯', color: '#10B981', label: 'Success Story' },
            'user-story': { icon: '👤', color: '#3B82F6', label: 'User Story' },
            'roi-analysis': { icon: '💰', color: '#F59E0B', label: 'ROI Analysis' },
            'before-after': { icon: '📊', color: '#8B5CF6', label: 'Before/After' },
            'industry-showcase': { icon: '🏭', color: '#EF4444', label: 'Industry Case' },
            'community-highlight': { icon: '⭐', color: '#EC4899', label: 'Community' },
            'innovation-case': { icon: '🚀', color: '#06B6D4', label: 'Innovation' }
        };
        return typeConfig[type] || { icon: '📄', color: '#6B7280', label: 'Case Study' };
    };
    // Get industry icon
    const getIndustryIcon = (industry) => {
        const industryIcons = {
            'film-production': '🎬',
            'advertising': '📢',
            'gaming': '🎮',
            'publishing': '📚',
            'education': '🎓',
            'healthcare': '⚕️',
            'finance': '💳',
            'technology': '💻',
            'legal': '⚖️',
            'consulting': '💼',
            'e-commerce': '🛒',
            'non-profit': '🤝',
            'other': '🏢'
        };
    };
    return industryIcons[industry] || '🏢';
}
;
// Calculate ROI display value
const getROIDisplay = () => {
    if (!caseStudy.roiMetrics.costSavings.amount)
        return null;
    const amount = caseStudy.roiMetrics.costSavings.amount;
    const currency = caseStudy.roiMetrics.costSavings.currency;
    if (amount >= 1000000) {
        return `${currency}${(amount / 1000000).toFixed(1)}M`;
    }
    else if (amount >= 1000) {
        return `${currency}${(amount / 1000).toFixed(1)}K`;
    }
    else {
        return `${currency}${amount.toFixed(0)}`;
    }
};
// Handle card click
const handleCardClick = (e) => {
    e.preventDefault();
    onClick?.(caseStudy);
};
// Handle bookmark
const handleBookmark = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    onBookmark?.(caseStudy.id);
};
// Handle like
const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike?.(caseStudy.id);
};
// Handle share
const handleShare = (e) => {
    e.stopPropagation();
    onShare?.(caseStudy);
};
const typeDisplay = getTypeDisplay(caseStudy.type);
const roiDisplay = getROIDisplay();
const industryIcon = getIndustryIcon(caseStudy.industry);
return;
_jsxs("div", { className: `case-study-card ${variant} ${className}`, onClick: handleCardClick, children: [caseStudy.status === 'featured' && ()
            < div, " className=\"featured-badge\">", _jsx("span", { className: "badge-icon", children: "\u2B50" }), "Featured"] });
{ /* Featured Image */ }
_jsxs("div", { className: "card-image", children: [caseStudy.featuredImage && !imageError ? ()
            < img
            :
        , "src=", caseStudy.featuredImage.url, "alt=", caseStudy.featuredImage.altText || caseStudy.title, "onError=", () => setImageError(true), "/> ) : ()", _jsx("div", { className: "image-placeholder", children: _jsx("span", { className: "placeholder-icon", children: typeDisplay.icon }) }), ")}", _jsxs("div", { className: "type-badge", style: { backgroundColor: typeDisplay.color }, children: [_jsx("span", { className: "type-icon", children: typeDisplay.icon }), variant !== 'compact' && ()
                    < span, " className=\"type-label\">", typeDisplay.label] }), ")}"] });
{ /* Quick Actions */ }
_jsxs("div", { className: "quick-actions", children: [_jsx("button", { className: `action-btn bookmark ${isBookmarked ? 'active' : ''}`, onClick: handleBookmark, title: "Bookmark this case study", children: isBookmarked ? '💙' : '🤍' }), _jsx("button", { className: `action-btn like ${isLiked ? 'active' : ''}`, onClick: handleLike, title: "Like this case study", children: isLiked ? '❤️' : '🤍' }), _jsx("button", { className: "action-btn share", onClick: handleShare, title: "Share this case study", children: "\uD83D\uDCE4" })] });
div >
    { /* Card Content */}
    < div;
className = "card-content" >
    { /* Header */}
    < div;
className = "card-header" >
    _jsxs("div", { className: "title-section", children: [_jsx("h3", { className: "case-study-title", children: caseStudy.title }), caseStudy.subtitle && variant !== 'compact' && ()
                < p, " className=\"case-study-subtitle\">", caseStudy.subtitle] });
div >
    _jsxs("div", { className: "industry-badge", children: [_jsx("span", { className: "industry-icon", children: industryIcon }), variant === 'featured' && ()
                < span, " className=\"industry-name\">", caseStudy.industry.replace('-', ' ')] });
div >
;
div >
    { /* Summary */}
    < p;
className = "case-study-summary" >
    { caseStudy, : .summary.length > 150 && variant === 'compact'
            ? `${caseStudy.summary.substring(0, 150)}...` :  };
caseStudy.summary;
p >
    { /* Metrics Section */};
{
    showMetrics && variant !== 'compact' && ()
        < div;
    className = "metrics-section" >
        { roiDisplay } && ()
        < div;
    className = "metric-item" >
        (_jsx("span", { className: "metric-icon", children: "\uD83D\uDCB0" })
            ,
                _jsx("span", { className: "metric-label", children: "Saved" })
                    ,
                        _jsx("span", { className: "metric-value", children: roiDisplay }));
    div >
    ;
}
{
    caseStudy.roiMetrics.timeSaved.hours > 0 && ()
        < div;
    className = "metric-item" >
        (_jsx("span", { className: "metric-icon", children: "\u23F0" })
            ,
                _jsx("span", { className: "metric-label", children: "Time" })
                    ,
                        _jsxs("span", { className: "metric-value", children: [caseStudy.roiMetrics.timeSaved.hours, "h"] }));
    div >
    ;
}
{
    caseStudy.performanceMetrics.efficiency > 0 && ()
        < div;
    className = "metric-item" >
        (_jsx("span", { className: "metric-icon", children: "\u26A1" })
            ,
                _jsx("span", { className: "metric-label", children: "Efficiency" })
                    ,
                        _jsxs("span", { className: "metric-value", children: ["+", caseStudy.performanceMetrics.efficiency, "%"] }));
    div >
    ;
}
div >
;
{ /* Templates Used */ }
{
    showTemplates && caseStudy.templatesUsed.length > 0 && variant !== 'compact' && ()
        < div;
    className = "templates-section" >
        _jsxs("div", { className: "templates-header", children: [_jsx("span", { className: "templates-icon", children: "\uD83D\uDCDD" }), _jsxs("span", { className: "templates-label", children: [caseStudy.templatesUsed.length, " template", caseStudy.templatesUsed.length > 1 ? 's' : '', " used"] })] });
    {
        variant === 'featured' && ()
            < div;
        className = "template-list" >
            { caseStudy, : .templatesUsed.slice(0, 3).map((template, index) => ()
                    < button, key = { template, : .templateId }, className = "template-chip", onClick = {}(e), {
                    e, : .stopPropagation(),
                    onTemplateClick
                }(template.templateId)) };
    }
        >
            { template, : .templateName };
    button >
    ;
}
{
    caseStudy.templatesUsed.length > 3 && ()
        < span;
    className = "template-more" >
        +{ caseStudy, : .templatesUsed.length - 3 };
    more;
    span >
    ;
}
div >
;
div >
;
{ /* Tags */ }
{
    caseStudy.tags.length > 0 && variant !== 'compact' && ()
        < div;
    className = "tags-section" >
        { caseStudy, : .tags.slice(0, variant === 'featured' ? 5 : 3).map((tag, index) => ()
                < span, key = { index }, className = "tag" >
                { tag }, span >
            ) };
    {
        caseStudy.tags.length > (variant === 'featured' ? 5 : 3) && ()
            < span;
        className = "tag-more" >
            +{ caseStudy, : .tags.length - (variant === 'featured' ? 5 : 3) };
        span >
        ;
    }
    div >
    ;
}
{ /* Footer */ }
_jsxs("div", { className: "card-footer", children: [showAuthor && caseStudy.config.showAuthor && ()
            < div, "className=\"author-section\" onClick=", (e) => {
            e.stopPropagation();
            onAuthorClick?.(caseStudy.author.userId);
        }, ">", caseStudy.author.avatar ? ()
            < img
            :
        , "src=", caseStudy.author.avatar, "alt=", caseStudy.author.name, "className=\"author-avatar\" /> ) : ()", _jsx("div", { className: "author-avatar-placeholder", children: caseStudy.author.name.charAt(0).toUpperCase() }), ")}", _jsxs("div", { className: "author-info", children: [_jsxs("span", { className: "author-name", children: [caseStudy.author.name, caseStudy.author.verified && ()
                            < span, " className=\"verified-badge\">\u2713"] }), ")}"] }), caseStudy.author.title && variant !== 'compact' && ()
            < span, " className=\"author-title\">", caseStudy.author.title] });
div >
;
div >
;
{ /* Engagement Stats */ }
_jsxs("div", { className: "engagement-stats", children: [caseStudy.engagement.views > 0 && ()
            < span, " className=\"stat\">", _jsx("span", { className: "stat-icon", children: "\uD83D\uDC41\uFE0F" }), caseStudy.engagement.views > 1000
            ? `${Math.floor(caseStudy.engagement.views / 1000)}k` : , ": caseStudy.engagement.views"] });
{
    caseStudy.engagement.likes > 0 && ()
        < span;
    className = "stat" >
        _jsx("span", { className: "stat-icon", children: "\u2764\uFE0F" });
    {
        caseStudy.engagement.likes;
    }
    span >
    ;
}
{
    caseStudy.engagement.helpfulVotes > 0 && variant === 'featured' && ()
        < span;
    className = "stat" >
        _jsx("span", { className: "stat-icon", children: "\uD83D\uDC4D" });
    {
        caseStudy.engagement.helpfulVotes;
    }
    span >
    ;
}
div >
;
div >
    { /* Difficulty Badge */}
    < div;
className = {} `difficulty-badge difficulty-${caseStudy.difficulty}`;
 > ;
{
    caseStudy.difficulty;
}
div >
;
div >
    _jsx("style", { children: `
        .case-study-card {
          position: relative;
  background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
  transition: all 0.3s ease;
          cursor: pointer;
  border: 1px solid #e0e4e7;
        .case-study-card:hover {
  transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          border-color: #3b82f6;
        .case-study-card.compact {
          max-width: 320px;
        .case-study-card.standard {
          max-width: 380px;
        .case-study-card.featured {
          max-width: 500px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        .featured-badge {
          position: absolute;
  top: 12px;
          left: 12px;
          z-index: 3;
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
          color: #ffffff
  padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
  display: flex;
          align-items: center;
  gap: 4px;
        .badge-icon {
          font-size: 10px;
        .card-image {
          position: relative;
  width: 100%;
          height: 200px;
  overflow: hidden;
        .case-study-card.compact .card-image {
          height: 160px;
        .case-study-card.featured .card-image {
          height: 240px;
        .card-image img {
          width: 100%
  height: 100%;
          object-fit: cover;
  transition: transform 0.3s ease;
        .case-study-card:hover .card-image img {
  transform: scale(1.05);
        .image-placeholder {
          width: 100%
  height: 100%;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        .placeholder-icon {
          font-size: 48px;
  opacity: 0.5;
        .type-badge {
          position: absolute;
  top: 12px;
          right: 12px;
  padding: 6px 10px;
          border-radius: 16px;
  color: #ffffff;
          font-size: 12px;
          font-weight: 600;
  display: flex;
          align-items: center;
  gap: 4px;
          backdrop-filter: blur(4px);
        .type-icon {
          font-size: 14px;
        .quick-actions {
          position: absolute;
  bottom: 12px;
          right: 12px;
  display: flex;
          gap: 6px;
  opacity: 0;
          transition: opacity 0.3s ease;
        .case-study-card:hover .quick-actions {
  opacity: 1;
        .action-btn {
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%
  width: 32px;
          height: 32px;
  display: flex;
          align-items: center;
          justify-content: center;
  cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(4px);
          font-size: 14px;
        .action-btn:hover {
  transform: scale(1.1)
  background: #ffffff;
        .action-btn.active {
          background: #3b82f6
  color: #ffffff;
        .card-content {
          padding: 20px;
  position: relative;
        .case-study-card.compact .card-content {
          padding: 16px;
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        .title-section {
          flex: 1;
          margin-right: 12px;
        .case-study-title {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 600;
  color: #1f2937;
          line-height: 1.3;
        .case-study-card.compact .case-study-title {
          font-size: 16px;
        .case-study-card.featured .case-study-title {
          font-size: 20px;
        .case-study-subtitle {
          margin: 0;
          font-size: 14px;
  color: #6b7280;
          line-height: 1.4;
        .industry-badge {
          display: flex;
          align-items: center;
  gap: 4px;
          background: #f3f4f6
  padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
  color: #6b7280;
          white-space: nowrap;
        .industry-icon {
          font-size: 14px;
        .case-study-summary {
          margin: 0 0 16px 0;
          font-size: 14px;
  color: #4b5563;
          line-height: 1.5;
        .metrics-section {
          display: flex;
  gap: 16px;
          margin-bottom: 16px;
  padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
        .metric-item {
          display: flex;
          flex-direction: column;
          align-items: center;
  gap: 2px;
          flex: 1;
        .metric-icon {
          font-size: 16px;
        .metric-label {
          font-size: 11px;
  color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        .metric-value {
          font-size: 14px;
          font-weight: 600;
  color: #1f2937;
        .templates-section {
          margin-bottom: 16px;
        .templates-header {
          display: flex;
          align-items: center;
  gap: 6px;
          margin-bottom: 8px;
        .templates-icon {
          font-size: 14px;
        .templates-label {
          font-size: 12px;
  color: #6b7280;
          font-weight: 500;
        .template-list {
          display: flex;
          flex-wrap: wrap;
  gap: 6px;
        .template-chip {
          background: #e0f2fe
  color: #0369a1;
          border: 1px solid #bae6fd
  padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
  cursor: pointer;
          transition: all 0.2s ease;
        .template-chip:hover {
  background: #0369a1
  color: #ffffff;
        .template-more {
          font-size: 11px;
  color: #6b7280;
          font-style: italic;
        .tags-section {
          display: flex;
          flex-wrap: wrap;
  gap: 6px;
          margin-bottom: 16px;
        .tag {
          background: #f3f4f6
  color: #4b5563;
          padding: 3px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
        .tag-more {
          font-size: 10px;
  color: #9ca3af;
          font-style: italic;
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        .author-section {
          display: flex;
          align-items: center;
  gap: 8px;
          cursor: pointer;
  transition: opacity 0.2s ease;
        .author-section:hover {
  opacity: 0.8;
        .author-avatar {
          width: 32px;
  height: 32px;
          border-radius: 50%;
          object-fit: cover;
        .author-avatar-placeholder {
          width: 32px;
  height: 32px;
          border-radius: 50%
  background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
  color: #6b7280;
        .author-info {
          display: flex;
          flex-direction: column;
        .author-name {
          font-size: 12px;
          font-weight: 600;
  color: #1f2937;
          display: flex;
          align-items: center;
  gap: 4px;
        .verified-badge {
          color: #10b981;
          font-size: 10px;
        .author-title {
          font-size: 10px;
  color: #6b7280;
        .engagement-stats {
          display: flex;
  gap: 12px;
          align-items: center;
        .stat {
          display: flex;
          align-items: center;
  gap: 3px;
          font-size: 11px;
  color: #6b7280;
        .stat-icon {
          font-size: 12px;
        .difficulty-badge {
          position: absolute;
  bottom: 16px;
          right: 16px;
  padding: 2px 6px;
          border-radius: 8px;
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        .difficulty-beginner {
          background: #dcfce7
  color: #166534;
        .difficulty-intermediate {
          background: #fef3c7
  color: #92400e;
        .difficulty-advanced {
          background: #fecaca
  color: #991b1b;
        .difficulty-expert {
          background: #e0e7ff
  color: #3730a3;
        @media (max-width: 768px) {
          .case-study-card {
            max-width: 100%;
          .card-image {
            height: 180px;
          .metrics-section {
            flex-direction: column;
  gap: 8px;
          .metric-item {
            flex-direction: row;
            justify-content: space-between;
          .template-list {
            flex-direction: column;
          .engagement-stats {
            gap: 8px;
          .card-header {
            flex-direction: column;
            align-items: flex-start
  gap: 8px;
          .title-section {
            margin-right: 0;
          .industry-badge {
            align-self: flex-start;
        @media (max-width: 480px) {
          .case-study-card.compact .card-content }
          .case-study-card.standard .card-content {
            padding: 12px;
          .case-study-title {
            font-size: 14px;
          .case-study-summary {
            font-size: 13px;
          .metrics-section {
            padding: 8px;
          .template-chip {
            font-size: 10px;
  padding: 3px 6px;
          .quick-actions {
            opacity: 1;
  position: static;
            margin-top: 8px;
            justify-content: center;
      ` });
div >
;
;
;
export default CaseStudyCard;
