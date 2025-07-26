import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Promotion Preview Component - Epic 17.5.2
 *
 * Provides preview functionality for featured content promotions,
 * building on existing template preview infrastructure.
 *
 * Part of Epic 17 - Backstage Admin Controls
 */
import { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Button, Select, Tabs, Tag, Statistic, Timeline, Progress, Space, Typography, Alert, Badge, Tooltip, Carousel, Radio, Switch, Slider } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, EyeOutlined, ClockCircleOutlined, TrophyOutlined, ThunderboltOutlined, ExperimentOutlined, SettingOutlined } from '@ant-design/icons';
import { useTemplatePreview } from '../../hooks/useTemplatePreview';
const { Title, Text, _Paragraph } = Typography;
const { TabPane } = Tabs;
const { _Option } = Select;
export const PromotionPreview = ({ promotionData, onUpdateRotation, onStartPreview, onStopPreview, isLive = false, className = '' }) => {
    // State management
    const [activeTab, setActiveTab] = useState('preview');
    const [selectedVariant, setSelectedVariant] = useState('control');
    const [previewMode, setPreviewMode] = useState('static');
    const [rotationSpeed, setRotationSpeed] = useState(3); // seconds
    const [currentContentIndex, setCurrentContentIndex] = useState(0);
    const [isRotating, setIsRotating] = useState(false);
    // Template preview integration
    const { generateVariants, performance: previewPerformance, isGenerating } = useTemplatePreview({
        enablePerformanceTracking: true,
        maxVariants: 5,
        autoRefresh: true
    });
    // Auto-rotation logic
    useEffect(() => {
        let interval;
        if (isRotating && previewMode === 'rotation' && promotionData?.content) {
            interval = setInterval(() => {
                setCurrentContentIndex(prevIndex => (prevIndex + 1) % promotionData.content.length);
            }, rotationSpeed * 1000);
        }
        return () => {
            if (interval)
                clearInterval(interval);
        };
    }, [isRotating, previewMode, rotationSpeed, promotionData?.content?.length]);
    // Performance predictions
    const performancePredictions = useMemo(() => {
        if (!promotionData)
            return [];
        return [
            {
                metric: 'Impressions',
                predicted_value: promotionData.predicted_performance.estimated_impressions,
                confidence_range: [
                    promotionData.predicted_performance.estimated_impressions * 0.8,
                    promotionData.predicted_performance.estimated_impressions * 1.2
                ],
                factors: [
                    { name: 'Slot Position', impact: 0.35, description: 'Homepage hero position drives 35% of visibility' },
                    { name: 'Content Quality', impact: 0.25, description: 'High-rated content increases engagement' },
                    { name: 'Time of Day', impact: 0.20, description: 'Peak hours boost impressions' },
                    { name: 'Historical Performance', impact: 0.20, description: 'Similar campaigns averaged 15K impressions' }
                ]
            },
            {
                metric: 'Click-Through Rate',
                predicted_value: promotionData.predicted_performance.estimated_ctr,
                confidence_range: [
                    promotionData.predicted_performance.estimated_ctr * 0.7,
                    promotionData.predicted_performance.estimated_ctr * 1.3
                ],
                factors: [
                    { name: 'Content Relevance', impact: 0.40, description: 'Matching user interests boosts CTR' },
                    { name: 'Visual Appeal', impact: 0.30, description: 'High-quality thumbnails drive clicks' },
                    { name: 'Promotional Timing', impact: 0.30, description: 'Weekend promotions see higher engagement' }
                ]
            },
            {
                metric: 'Conversions',
                predicted_value: promotionData.predicted_performance.estimated_conversions,
                confidence_range: [
                    promotionData.predicted_performance.estimated_conversions * 0.6,
                    promotionData.predicted_performance.estimated_conversions * 1.4
                ],
                factors: [
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
        if (!promotionData)
            return null;
        const { slot } = promotionData.schedule;
        const currentContent = promotionData.content[currentContentIndex] || promotionData.content[0];
        return (_jsxs("div", { className: "slot-preview", children: [_jsxs("div", { className: "slot-header", children: [_jsxs(Title, { level: 4, children: [_jsx(EyeOutlined, {}), " ", slot.name, " Preview"] }), _jsxs(Space, { children: [_jsx(Tag, { color: "blue", children: slot.type.replace('_', ' ') }), _jsx(Tag, { color: "green", children: slot.location }), _jsxs(Text, { type: "secondary", children: [slot.dimensions.width, "\u00D7", slot.dimensions.height, "px"] })] })] }), _jsxs("div", { className: "slot-mockup", style: {
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
                    }, children: [previewMode === 'rotation' ? (_jsx(Carousel, { autoplay: isRotating, autoplaySpeed: rotationSpeed * 1000, effect: "fade", children: promotionData.content.map((content, index) => (_jsx("div", { children: _jsxs("div", { className: "content-preview-card", children: [_jsx("div", { className: "content-thumbnail", children: _jsx("img", { src: content.thumbnail || '/api/placeholder/200/150', alt: content.title, style: { width: '200px', height: '150px', objectFit: 'cover' } }) }), _jsxs("div", { className: "content-info", children: [_jsx(Title, { level: 5, children: content.title }), _jsx(Text, { type: "secondary", children: content.category }), _jsx("div", { className: "content-metrics", children: _jsxs(Space, { children: [_jsxs("span", { children: ["\u2B50 ", content.rating.toFixed(1)] }), _jsxs("span", { children: ["\u2193 ", content.downloads] }), _jsx(Badge, { count: content.performance_score, style: { backgroundColor: '#52c41a' }, title: "Performance Score" })] }) })] })] }) }, content.id))) })) : (_jsxs("div", { className: "content-preview-card", children: [_jsx("div", { className: "content-thumbnail", children: _jsx("img", { src: currentContent?.thumbnail || '/api/placeholder/200/150', alt: currentContent?.title || 'Preview', style: { width: '200px', height: '150px', objectFit: 'cover' } }) }), _jsxs("div", { className: "content-info", children: [_jsx(Title, { level: 5, children: currentContent?.title || 'Featured Content' }), _jsx(Text, { type: "secondary", children: currentContent?.category || 'Category' }), currentContent && (_jsx("div", { className: "content-metrics", children: _jsxs(Space, { children: [_jsxs("span", { children: ["\u2B50 ", currentContent.rating.toFixed(1)] }), _jsxs("span", { children: ["\u2193 ", currentContent.downloads] }), _jsx(Badge, { count: currentContent.performance_score, style: { backgroundColor: '#52c41a' }, title: "Performance Score" })] }) }))] })] })), _jsx("div", { className: "preview-controls", children: _jsxs(Space, { children: [_jsxs(Radio.Group, { value: previewMode, onChange: (e) => setPreviewMode(e.target.value), size: "small", children: [_jsx(Radio.Button, { value: "static", children: "Static" }), _jsx(Radio.Button, { value: "rotation", children: "Rotation" }), promotionData.ab_test_config && (_jsx(Radio.Button, { value: "ab_test", children: "A/B Test" }))] }), previewMode === 'rotation' && (_jsxs(_Fragment, { children: [_jsx(Button, { icon: isRotating ? _jsx(PauseCircleOutlined, {}) : _jsx(PlayCircleOutlined, {}), onClick: () => setIsRotating(!isRotating), size: "small", type: isRotating ? 'primary' : 'default', children: isRotating ? 'Pause' : 'Play' }), _jsxs("div", { style: { width: '100px' }, children: [_jsxs(Text, { style: { fontSize: '12px' }, children: ["Speed: ", rotationSpeed, "s"] }), _jsx(Slider, { min: 1, max: 10, value: rotationSpeed, onChange: setRotationSpeed, size: "small" })] })] }))] }) })] }), _jsxs(Row, { gutter: [16, 16], children: [_jsx(Col, { span: 6, children: _jsx(Statistic, { title: "Traffic Allocation", value: slot.traffic_allocation, suffix: "%", valueStyle: { color: '#3f8600' } }) }), _jsx(Col, { span: 6, children: _jsx(Statistic, { title: "Slot Priority", value: slot.priority, prefix: _jsx(TrophyOutlined, {}) }) }), _jsx(Col, { span: 6, children: _jsx(Statistic, { title: "Expected Daily Views", value: Math.floor(promotionData.predicted_performance.estimated_impressions / 7), prefix: _jsx(EyeOutlined, {}) }) }), _jsx(Col, { span: 6, children: _jsx(Statistic, { title: "Confidence Level", value: promotionData.predicted_performance.confidence_level, suffix: "%", valueStyle: {
                                    color: promotionData.predicted_performance.confidence_level > 80 ? '#3f8600' : '#cf1322'
                                } }) })] })] }));
    };
    // Render performance predictions
    const renderPerformancePredictions = () => {
        return (_jsx("div", { className: "performance-predictions", children: performancePredictions.map((prediction, index) => (_jsx(Card, { className: "prediction-card", children: _jsxs(Row, { align: "middle", children: [_jsx(Col, { span: 8, children: _jsx(Statistic, { title: prediction.metric, value: prediction.predicted_value, precision: prediction.metric === 'Click-Through Rate' ? 2 : 0, suffix: prediction.metric === 'Click-Through Rate' ? '%' : '' }) }), _jsx(Col, { span: 8, children: _jsxs("div", { className: "confidence-range", children: [_jsx(Text, { strong: true, children: "Confidence Range" }), _jsx("br", {}), _jsxs(Text, { type: "secondary", children: [prediction.confidence_range[0].toFixed(0), " - ", prediction.confidence_range[1].toFixed(0), prediction.metric === 'Click-Through Rate' ? '%' : ''] })] }) }), _jsx(Col, { span: 8, children: _jsxs("div", { className: "impact-factors", children: [_jsx(Text, { strong: true, children: "Top Factors" }), prediction.factors.slice(0, 2).map((factor, idx) => (_jsxs("div", { className: "factor-item", children: [_jsx(Progress, { percent: factor.impact * 100, size: "small", format: () => `${(factor.impact * 100).toFixed(0)}%`, strokeColor: "#1890ff" }), _jsx(Tooltip, { title: factor.description, children: _jsx(Text, { style: { fontSize: '12px' }, children: factor.name }) })] }, idx)))] }) })] }) }, prediction.metric))) }));
    };
    // Render schedule timeline
    const renderScheduleTimeline = () => {
        if (!promotionData)
            return null;
        const schedule = promotionData.schedule;
        const now = new Date();
        const start = new Date(schedule.start_date);
        const end = new Date(schedule.end_date);
        const totalDuration = end.getTime() - start.getTime();
        const elapsed = Math.max(0, now.getTime() - start.getTime());
        const progress = Math.min(100, (elapsed / totalDuration) * 100);
        const timelineItems = [
            {
                color: progress > 0 ? 'green' : 'blue',
                children: (_jsxs("div", { children: [_jsx(Text, { strong: true, children: "Promotion Starts" }), _jsx("br", {}), _jsx(Text, { type: "secondary", children: start.toLocaleString() })] }))
            },
            {
                color: progress > 25 ? 'green' : 'gray',
                children: (_jsxs("div", { children: [_jsx(Text, { strong: true, children: "First Quarter" }), _jsx("br", {}), _jsx(Text, { type: "secondary", children: "25% duration milestone" })] }))
            },
            {
                color: progress > 50 ? 'green' : 'gray',
                children: (_jsxs("div", { children: [_jsx(Text, { strong: true, children: "Midpoint Review" }), _jsx("br", {}), _jsx(Text, { type: "secondary", children: "Performance optimization checkpoint" })] }))
            },
            {
                color: progress > 75 ? 'green' : 'gray',
                children: (_jsxs("div", { children: [_jsx(Text, { strong: true, children: "Final Quarter" }), _jsx("br", {}), _jsx(Text, { type: "secondary", children: "Prepare transition to next campaign" })] }))
            },
            {
                color: progress >= 100 ? 'green' : 'gray',
                children: (_jsxs("div", { children: [_jsx(Text, { strong: true, children: "Promotion Ends" }), _jsx("br", {}), _jsx(Text, { type: "secondary", children: end.toLocaleString() })] }))
            }
        ];
        return (_jsxs("div", { className: "schedule-timeline", children: [_jsxs(Row, { gutter: [16, 16], style: { marginBottom: '20px' }, children: [_jsx(Col, { span: 12, children: _jsxs(Card, { children: [_jsx(Statistic, { title: "Time Progress", value: progress, suffix: "%", prefix: _jsx(ClockCircleOutlined, {}) }), _jsx(Progress, { percent: progress, strokeColor: "#1890ff" })] }) }), _jsx(Col, { span: 12, children: _jsx(Card, { children: _jsx(Statistic, { title: "Days Remaining", value: Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))), prefix: _jsx(ClockCircleOutlined, {}), valueStyle: { color: progress > 80 ? '#cf1322' : '#3f8600' } }) }) })] }), _jsx(Timeline, { items: timelineItems })] }));
    };
    // Render A/B test preview
    const renderABTestPreview = () => {
        if (!promotionData?.ab_test_config)
            return null;
        const { ab_test_config } = promotionData;
        return (_jsxs("div", { className: "ab-test-preview", children: [_jsx(Alert, { message: "A/B Test Configuration", description: `Testing ${ab_test_config.variants.length} variants with different content selections`, type: "info", icon: _jsx(ExperimentOutlined, {}), style: { marginBottom: '20px' } }), _jsx(Row, { gutter: [16, 16], children: ab_test_config.variants.map((variant, index) => (_jsx(Col, { span: 8, children: _jsxs(Card, { title: _jsxs(Space, { children: [_jsx(Text, { strong: true, children: variant.name }), _jsxs(Tag, { color: index === 0 ? 'green' : 'blue', children: [variant.traffic_split, "% traffic"] })] }), className: selectedVariant === variant.id ? 'selected-variant' : '', onClick: () => setSelectedVariant(variant.id), style: { cursor: 'pointer' }, children: [_jsxs(Text, { type: "secondary", children: [variant.content_ids.length, " content items"] }), _jsxs("div", { className: "variant-content", children: [variant.content_ids.slice(0, 3).map(contentId => {
                                            const content = promotionData.content.find(c => c.id === contentId);
                                            return content ? (_jsxs("div", { className: "variant-content-item", children: [_jsx("img", { src: content.thumbnail || '/api/placeholder/50/50', alt: content.title, style: { width: '50px', height: '50px', marginRight: '8px' } }), _jsxs("div", { children: [_jsx(Text, { style: { fontSize: '12px' }, children: content.title }), _jsx("br", {}), _jsxs(Text, { type: "secondary", style: { fontSize: '10px' }, children: ["Score: ", content.performance_score] })] })] }, contentId)) : null;
                                        }), variant.content_ids.length > 3 && (_jsxs(Text, { type: "secondary", style: { fontSize: '12px' }, children: ["+", variant.content_ids.length - 3, " more"] }))] })] }) }, variant.id))) })] }));
    };
    if (!promotionData) {
        return (_jsx("div", { className: "promotion-preview-empty", children: _jsx(Text, { type: "secondary", children: "No promotion data available for preview" }) }));
    }
    return (_jsxs("div", { className: `promotion-preview ${className}`, children: [_jsxs("div", { className: "preview-header", children: [_jsxs(Title, { level: 3, children: [_jsx(ThunderboltOutlined, {}), " Promotion Preview"] }), _jsxs(Space, { children: [_jsx(Switch, { checked: isLive, onChange: isLive ? onStopPreview : onStartPreview, checkedChildren: "Live", unCheckedChildren: "Preview" }), _jsx(Button, { icon: _jsx(SettingOutlined, {}), children: "Settings" })] })] }), _jsxs(Tabs, { activeKey: activeTab, onChange: setActiveTab, children: [_jsx(TabPane, { tab: "Visual Preview", children: renderSlotPreview() }, "preview"), _jsx(TabPane, { tab: "Performance Prediction", children: renderPerformancePredictions() }, "performance"), _jsx(TabPane, { tab: "Schedule Timeline", children: renderScheduleTimeline() }, "timeline"), promotionData.ab_test_config && (_jsx(TabPane, { tab: "A/B Test Preview", children: renderABTestPreview() }, "ab_test"))] }), _jsx("style", { children: `
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
      ` })] }));
};
export default PromotionPreview;
