import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 - Case Study Modal Component
 * Task: E16-1753114247141-49BDC0 - Design case study UI components
 *
 * Modal component for displaying full case study details with rich media,
 * metrics, and template integration.
 */
import { useState, useEffect } from 'react';
export const CaseStudyModal = ({ caseStudy, isOpen, onClose, onTemplateClick, onAuthorClick, onShare, className = '' }) => {
    const [activeSection, setActiveSection] = useState('overview');
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    // Close modal on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);
    // Handle backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    // Get ROI display value
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
    if (!isOpen)
        return null;
    const roiDisplay = getROIDisplay();
    return (_jsxs("div", { className: `case-study-modal-overlay ${className}`, onClick: handleBackdropClick, children: [_jsxs("div", { className: "case-study-modal", children: [_jsxs("header", { className: "modal-header", children: [_jsxs("div", { className: "header-content", children: [_jsxs("div", { className: "title-section", children: [_jsx("h1", { className: "case-study-title", children: caseStudy.title }), caseStudy.subtitle && (_jsx("p", { className: "case-study-subtitle", children: caseStudy.subtitle }))] }), _jsxs("div", { className: "header-actions", children: [_jsx("button", { onClick: () => setIsBookmarked(!isBookmarked), className: `action-btn bookmark ${isBookmarked ? 'active' : ''}`, title: "Bookmark case study", children: isBookmarked ? '💙' : '🤍' }), _jsx("button", { onClick: () => setIsLiked(!isLiked), className: `action-btn like ${isLiked ? 'active' : ''}`, title: "Like case study", children: isLiked ? '❤️' : '🤍' }), _jsx("button", { onClick: () => onShare?.(caseStudy), className: "action-btn share", title: "Share case study", children: "\uD83D\uDCE4" }), _jsx("button", { onClick: onClose, className: "close-btn", title: "Close modal", children: "\u00D7" })] })] }), _jsxs("nav", { className: "modal-nav", children: [_jsx("button", { onClick: () => setActiveSection('overview'), className: `nav-btn ${activeSection === 'overview' ? 'active' : ''}`, children: "Overview" }), _jsx("button", { onClick: () => setActiveSection('implementation'), className: `nav-btn ${activeSection === 'implementation' ? 'active' : ''}`, children: "Implementation" }), _jsx("button", { onClick: () => setActiveSection('results'), className: `nav-btn ${activeSection === 'results' ? 'active' : ''}`, children: "Results" }), _jsxs("button", { onClick: () => setActiveSection('media'), className: `nav-btn ${activeSection === 'media' ? 'active' : ''}`, children: ["Media (", Object.values(caseStudy.media).flat().length, ")"] })] })] }), _jsxs("div", { className: "modal-content", children: [activeSection === 'overview' && (_jsxs("div", { className: "overview-section", children: [_jsxs("div", { className: "main-content", children: [caseStudy.featuredImage && (_jsx("div", { className: "featured-image", children: _jsx("img", { src: caseStudy.featuredImage.url, alt: caseStudy.featuredImage.altText || caseStudy.title }) })), _jsxs("section", { className: "description", children: [_jsx("h2", { children: "Challenge" }), _jsx("p", { children: caseStudy.content.challenge })] }), _jsxs("section", { className: "solution", children: [_jsx("h2", { children: "Solution" }), _jsx("p", { children: caseStudy.content.solution })] }), _jsxs("section", { className: "key-metrics", children: [_jsx("h2", { children: "Key Results" }), _jsxs("div", { className: "metrics-grid", children: [roiDisplay && (_jsxs("div", { className: "metric-card", children: [_jsx("div", { className: "metric-icon", children: "\uD83D\uDCB0" }), _jsx("div", { className: "metric-value", children: roiDisplay }), _jsx("div", { className: "metric-label", children: "Cost Savings" })] })), caseStudy.roiMetrics.timeSaved.hours > 0 && (_jsxs("div", { className: "metric-card", children: [_jsx("div", { className: "metric-icon", children: "\u23F0" }), _jsxs("div", { className: "metric-value", children: [caseStudy.roiMetrics.timeSaved.hours, "h"] }), _jsx("div", { className: "metric-label", children: "Time Saved" })] })), caseStudy.performanceMetrics.efficiency > 0 && (_jsxs("div", { className: "metric-card", children: [_jsx("div", { className: "metric-icon", children: "\u26A1" }), _jsxs("div", { className: "metric-value", children: ["+", caseStudy.performanceMetrics.efficiency, "%"] }), _jsx("div", { className: "metric-label", children: "Efficiency" })] })), caseStudy.performanceMetrics.outputQuality > 0 && (_jsxs("div", { className: "metric-card", children: [_jsx("div", { className: "metric-icon", children: "\u2B50" }), _jsxs("div", { className: "metric-value", children: [caseStudy.performanceMetrics.outputQuality, "/10"] }), _jsx("div", { className: "metric-label", children: "Quality Rating" })] }))] })] })] }), _jsxs("aside", { className: "sidebar-content", children: [_jsxs("section", { className: "author-section", children: [_jsx("h3", { children: "Created by" }), _jsxs("div", { className: "author-card", onClick: () => onAuthorClick?.(caseStudy.author.userId), children: [caseStudy.author.avatar ? (_jsx("img", { src: caseStudy.author.avatar, alt: caseStudy.author.name, className: "author-avatar" })) : (_jsx("div", { className: "author-avatar-placeholder", children: caseStudy.author.name.charAt(0).toUpperCase() })), _jsxs("div", { className: "author-info", children: [_jsxs("div", { className: "author-name", children: [caseStudy.author.name, caseStudy.author.verified && (_jsx("span", { className: "verified-badge", children: "\u2713" }))] }), caseStudy.author.title && (_jsx("div", { className: "author-title", children: caseStudy.author.title })), caseStudy.author.company && (_jsx("div", { className: "author-company", children: caseStudy.author.company }))] })] })] }), caseStudy.tags.length > 0 && (_jsxs("section", { className: "tags-section", children: [_jsx("h3", { children: "Tags" }), _jsx("div", { className: "tags", children: caseStudy.tags.map((tag, index) => (_jsx("span", { className: "tag", children: tag }, index))) })] })), _jsxs("section", { className: "industry-section", children: [_jsx("h3", { children: "Industry" }), _jsx("div", { className: "industry-badge", children: caseStudy.industry.replace('-', ' ') })] }), _jsxs("section", { className: "difficulty-section", children: [_jsx("h3", { children: "Difficulty Level" }), _jsx("div", { className: `difficulty-badge difficulty-${caseStudy.difficulty}`, children: caseStudy.difficulty })] })] })] })), activeSection === 'implementation' && (_jsxs("div", { className: "implementation-section", children: [_jsxs("section", { className: "implementation-details", children: [_jsx("h2", { children: "Implementation Process" }), _jsx("p", { children: caseStudy.content.implementation })] }), caseStudy.templatesUsed.length > 0 && (_jsxs("section", { className: "templates-section", children: [_jsx("h2", { children: "Templates Used" }), _jsx("div", { className: "templates-grid", children: caseStudy.templatesUsed.map((template) => (_jsxs("div", { className: "template-card", onClick: () => onTemplateClick?.(template.templateId), children: [_jsx("h4", { children: template.templateName }), _jsx("p", { className: "template-usage", children: template.usageDescription }), _jsxs("div", { className: "template-results", children: [_jsx("strong", { children: "Results:" }), " ", template.resultsWithTemplate] }), template.customizations.length > 0 && (_jsxs("div", { className: "template-customizations", children: [_jsx("strong", { children: "Customizations:" }), _jsxs("ul", { children: [template.customizations.slice(0, 3).map((customization, index) => (_jsx("li", { children: customization }, index))), template.customizations.length > 3 && (_jsxs("li", { children: ["+", template.customizations.length - 3, " more..."] }))] })] }))] }, template.templateId))) })] })), _jsxs("section", { className: "learnings-section", children: [_jsx("h2", { children: "Key Learnings" }), _jsx("p", { children: caseStudy.content.learnings })] })] })), activeSection === 'results' && (_jsxs("div", { className: "results-section", children: [_jsxs("section", { className: "results-details", children: [_jsx("h2", { children: "Results Achieved" }), _jsx("p", { children: caseStudy.content.results })] }), _jsxs("section", { className: "detailed-metrics", children: [_jsx("h2", { children: "Performance Metrics" }), _jsxs("div", { className: "metrics-table", children: [_jsxs("div", { className: "metric-row", children: [_jsx("span", { className: "metric-name", children: "Implementation Time" }), _jsxs("span", { className: "metric-value", children: [caseStudy.performanceMetrics.implementationTime, " hours"] })] }), _jsxs("div", { className: "metric-row", children: [_jsx("span", { className: "metric-name", children: "Project Duration" }), _jsxs("span", { className: "metric-value", children: [caseStudy.performanceMetrics.projectDuration, " days"] })] }), _jsxs("div", { className: "metric-row", children: [_jsx("span", { className: "metric-name", children: "Team Size" }), _jsxs("span", { className: "metric-value", children: [caseStudy.performanceMetrics.teamSize, " people"] })] }), _jsxs("div", { className: "metric-row", children: [_jsx("span", { className: "metric-name", children: "Error Reduction" }), _jsxs("span", { className: "metric-value", children: [caseStudy.performanceMetrics.errorReduction, "%"] })] }), _jsxs("div", { className: "metric-row", children: [_jsx("span", { className: "metric-name", children: "Stakeholder Satisfaction" }), _jsxs("span", { className: "metric-value", children: [caseStudy.performanceMetrics.stakeholderSatisfaction, "/10"] })] })] })] }), caseStudy.roiMetrics.qualityMetrics.length > 0 && (_jsxs("section", { className: "quality-metrics", children: [_jsx("h2", { children: "Quality Improvements" }), _jsx("div", { className: "quality-grid", children: caseStudy.roiMetrics.qualityMetrics.map((metric, index) => (_jsxs("div", { className: "quality-card", children: [_jsx("h4", { children: metric.metric }), _jsxs("div", { className: "before-after", children: [_jsxs("div", { className: "before", children: [_jsx("span", { className: "label", children: "Before:" }), _jsxs("span", { className: "value", children: [metric.before, " ", metric.unit || ''] })] }), _jsxs("div", { className: "after", children: [_jsx("span", { className: "label", children: "After:" }), _jsxs("span", { className: "value", children: [metric.after, " ", metric.unit || ''] })] }), _jsx("div", { className: "improvement", children: _jsxs("span", { className: "improvement-value", children: ["+", metric.improvement, "%"] }) })] })] }, index))) })] })), caseStudy.content.nextSteps && (_jsxs("section", { className: "next-steps", children: [_jsx("h2", { children: "Next Steps" }), _jsx("p", { children: caseStudy.content.nextSteps })] }))] })), activeSection === 'media' && (_jsx("div", { className: "media-section", children: _jsx("div", { className: "media-gallery", children: Object.entries(caseStudy.media).map(([category, mediaItems]) => {
                                        if (mediaItems.length === 0)
                                            return null;
                                        return (_jsxs("section", { className: "media-category", children: [_jsx("h3", { children: category.charAt(0).toUpperCase() + category.slice(1) }), _jsx("div", { className: "media-grid", children: mediaItems.map((media) => (_jsxs("div", { className: "media-item", onClick: () => setSelectedMedia(media), children: [media.type === 'image' || media.type === 'screenshot' ? (_jsx("img", { src: media.thumbnailUrl || media.url, alt: media.altText || media.title, className: "media-thumbnail" })) : media.type === 'video' ? (_jsxs("div", { className: "video-thumbnail", children: [_jsx("div", { className: "play-icon", children: "\u25B6" }), media.thumbnailUrl && (_jsx("img", { src: media.thumbnailUrl, alt: media.altText || media.title }))] })) : (_jsxs("div", { className: "document-thumbnail", children: [_jsx("div", { className: "doc-icon", children: "\uD83D\uDCC4" }), _jsx("span", { className: "doc-title", children: media.title })] })), _jsxs("div", { className: "media-info", children: [_jsx("h4", { children: media.title }), media.description && (_jsx("p", { children: media.description }))] })] }, media.id))) })] }, category));
                                    }) }) }))] }), selectedMedia && (_jsx("div", { className: "media-viewer-overlay", onClick: () => setSelectedMedia(null), children: _jsxs("div", { className: "media-viewer", onClick: (e) => e.stopPropagation(), children: [_jsx("button", { onClick: () => setSelectedMedia(null), className: "media-close", children: "\u00D7" }), selectedMedia.type === 'image' || selectedMedia.type === 'screenshot' ? (_jsx("img", { src: selectedMedia.url, alt: selectedMedia.altText || selectedMedia.title, className: "media-full" })) : selectedMedia.type === 'video' ? (_jsx("video", { src: selectedMedia.url, controls: true, className: "media-full", autoPlay: true })) : (_jsx("iframe", { src: selectedMedia.url, className: "media-full", title: selectedMedia.title })), _jsxs("div", { className: "media-caption", children: [_jsx("h4", { children: selectedMedia.title }), selectedMedia.description && (_jsx("p", { children: selectedMedia.description }))] })] }) }))] }), _jsx("style", { jsx: true, children: `
        .case-study-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .case-study-modal {
          background: #ffffff;
          border-radius: 12px;
          max-width: 1200px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          border-bottom: 1px solid #e5e7eb;
          padding: 24px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .case-study-title {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }

        .case-study-subtitle {
          margin: 0;
          font-size: 16px;
          color: #6b7280;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 16px;
        }

        .action-btn:hover {
          background: #f3f4f6;
        }

        .action-btn.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: #ffffff;
        }

        .close-btn {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 20px;
          color: #6b7280;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: #f3f4f6;
          color: #1f2937;
        }

        .modal-nav {
          display: flex;
          gap: 4px;
        }

        .nav-btn {
          background: none;
          border: none;
          padding: 12px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.2s ease;
        }

        .nav-btn:hover {
          background: #f9fafb;
          color: #1f2937;
        }

        .nav-btn.active {
          background: #3b82f6;
          color: #ffffff;
        }

        .modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .overview-section {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 32px;
        }

        .featured-image {
          margin-bottom: 24px;
          border-radius: 8px;
          overflow: hidden;
        }

        .featured-image img {
          width: 100%;
          height: auto;
          display: block;
        }

        .description, .solution {
          margin-bottom: 24px;
        }

        .description h2, .solution h2 {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .description p, .solution p {
          margin: 0;
          line-height: 1.6;
          color: #4b5563;
        }

        .key-metrics h2 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .metric-card {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }

        .metric-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .metric-value {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .metric-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sidebar-content {
          background: #f9fafb;
          border-radius: 8px;
          padding: 20px;
          height: fit-content;
        }

        .sidebar-content section {
          margin-bottom: 24px;
        }

        .sidebar-content section:last-child {
          margin-bottom: 0;
        }

        .sidebar-content h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .author-card {
          display: flex;
          gap: 12px;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .author-card:hover {
          opacity: 0.8;
        }

        .author-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }

        .author-avatar-placeholder {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
          color: #6b7280;
        }

        .author-name {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 2px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .verified-badge {
          color: #10b981;
          font-size: 12px;
        }

        .author-title, .author-company {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 2px;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tag {
          background: #e5e7eb;
          color: #4b5563;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .industry-badge {
          background: #dbeafe;
          color: #1e40af;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .difficulty-badge {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .difficulty-beginner {
          background: #dcfce7;
          color: #166534;
        }

        .difficulty-intermediate {
          background: #fef3c7;
          color: #92400e;
        }

        .difficulty-advanced {
          background: #fecaca;
          color: #991b1b;
        }

        .difficulty-expert {
          background: #e0e7ff;
          color: #3730a3;
        }

        .implementation-section, .results-section {
          max-width: 800px;
        }

        .implementation-section section, .results-section section {
          margin-bottom: 32px;
        }

        .implementation-section h2, .results-section h2 {
          margin: 0 0 16px 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }

        .template-card {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .template-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }

        .template-card h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .template-usage {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #6b7280;
        }

        .template-results, .template-customizations {
          font-size: 13px;
          color: #4b5563;
          margin-bottom: 8px;
        }

        .template-customizations ul {
          margin: 4px 0 0 16px;
          padding: 0;
        }

        .metrics-table {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .metric-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .metric-row:last-child {
          border-bottom: none;
        }

        .metric-name {
          font-weight: 500;
          color: #4b5563;
        }

        .metric-value {
          font-weight: 600;
          color: #1f2937;
        }

        .quality-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .quality-card {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
        }

        .quality-card h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .before-after {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .before, .after {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }

        .label {
          color: #6b7280;
        }

        .value {
          font-weight: 600;
          color: #1f2937;
        }

        .improvement {
          text-align: center;
          margin-top: 8px;
        }

        .improvement-value {
          background: #dcfce7;
          color: #166534;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .media-gallery {
          max-width: 1000px;
        }

        .media-category {
          margin-bottom: 32px;
        }

        .media-category h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .media-item {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .media-item:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }

        .media-thumbnail {
          width: 100%;
          height: 120px;
          object-fit: cover;
        }

        .video-thumbnail, .document-thumbnail {
          width: 100%;
          height: 120px;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .play-icon {
          position: absolute;
          z-index: 2;
          background: rgba(0, 0, 0, 0.7);
          color: #ffffff;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .video-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .doc-icon {
          font-size: 32px;
        }

        .doc-title {
          position: absolute;
          bottom: 8px;
          left: 8px;
          right: 8px;
          font-size: 10px;
          color: #6b7280;
          text-align: center;
        }

        .media-info {
          padding: 12px;
        }

        .media-info h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .media-info p {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
          line-height: 1.4;
        }

        .media-viewer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          z-index: 1001;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .media-viewer {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
        }

        .media-close {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 3;
          background: rgba(0, 0, 0, 0.7);
          color: #ffffff;
          border: none;
          border-radius: 4px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
        }

        .media-full {
          max-width: 100%;
          max-height: 80vh;
          display: block;
        }

        .media-caption {
          padding: 16px;
          background: #ffffff;
        }

        .media-caption h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .media-caption p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .case-study-modal {
            max-height: 95vh;
            margin: 10px;
          }

          .modal-header {
            padding: 16px;
          }

          .header-content {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .case-study-title {
            font-size: 20px;
          }

          .modal-nav {
            flex-wrap: wrap;
          }

          .modal-content {
            padding: 16px;
          }

          .overview-section {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .metrics-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }

          .templates-grid {
            grid-template-columns: 1fr;
          }

          .quality-grid {
            grid-template-columns: 1fr;
          }

          .media-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }

          .media-viewer-overlay {
            padding: 20px;
          }
        }
      ` })] }));
};
export default CaseStudyModal;
