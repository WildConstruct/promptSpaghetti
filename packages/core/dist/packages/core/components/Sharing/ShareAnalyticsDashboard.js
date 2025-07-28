import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Marketplace Share Analytics Dashboard Component
 *
 * Displays comprehensive sharing analytics and metrics.
 * Provides insights into share performance, engagement, and reach.
 *
 * Task: E16-1753114247020-65B7A3 - Design sharing system
 */
import { useState, useEffect } from 'react';
import { SharingService } from '../../services/SharingService';
{
    const [metrics, setMetrics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const sharingService = new SharingService({});
    baseUrl: 'https://prompt-spaghetti.vercel.app',
    ;
}
;
useEffect(() => {
    const fetchMetrics = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const defaultTimeRange = timeRange || {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago,
                end: new Date(),
            };
            const metricsData = await sharingService.getShareMetrics(shareLinkId, defaultTimeRange);
            setMetrics(metricsData);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load metrics');
        }
        finally {
            setIsLoading(false);
        }
        ;
        fetchMetrics();
    }, [shareLinkId, timeRange];
});
const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }
    ;
    const formatPercentage = (num) => {
        return (num * 100).toFixed(1) + '%';
    };
    if (isLoading) {
        return;
        _jsxs("div", { style: {
                padding: '40px',
                textAlign: 'center',
                color: '#6b7280',
            }, children: [_jsx("div", { style: {
                        width: '40px',
                        height: '40px',
                        border: '3px solid #e5e7eb',
                        borderTop: '3px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px',
                    } }), "Loading analytics..."] });
    }
};
;
if (error) {
    return;
    _jsxs("div", { style: {
            padding: '40px',
            textAlign: 'center',
            color: '#dc2626',
        }, children: [_jsx("div", { style: { fontSize: '18px', marginBottom: '8px' }, children: "\u26A0\uFE0F" }), _jsxs("div", { children: ["Error loading analytics: ", error] })] });
    ;
    if (!metrics) {
        return;
        _jsx("div", { style: {
                padding: '40px',
                textAlign: 'center',
                color: '#6b7280',
            }, children: "No analytics data available" });
        ;
        return;
        _jsxs("div", { style: {
                padding: '24px',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
            }, children: [_jsx("h3", { style: {
                        margin: '0 0 24px 0',
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#111827',
                    }, children: "Share Analytics" }), _jsxs("div", { style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginBottom: '32px',
                    }, children: [_jsxs("div", { style: {
                                padding: '20px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                textAlign: 'center',
                            }, children: [_jsx("div", { style: {
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: '#3b82f6',
                                        marginBottom: '4px',
                                    }, children: formatNumber(metrics.metrics.totalViews) }), _jsx("div", { style: { fontSize: '14px', color: '#6b7280' }, children: "Total Views" })] }), _jsxs("div", { style: {
                                padding: '20px',
                                backgroundColor: '#f0fdf4',
                                borderRadius: '8px',
                                textAlign: 'center',
                            }, children: [_jsx("div", { style: {
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: '#059669',
                                        marginBottom: '4px',
                                    }, children: formatNumber(metrics.metrics.totalShares) }), _jsx("div", { style: { fontSize: '14px', color: '#6b7280' }, children: "Total Shares" })] }), _jsxs("div", { style: {
                                padding: '20px',
                                backgroundColor: '#fef3c7',
                                borderRadius: '8px',
                                textAlign: 'center',
                            }, children: [_jsx("div", { style: {
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: '#d97706',
                                        marginBottom: '4px',
                                    }, children: formatPercentage(metrics.metrics.conversionRate) }), _jsx("div", { style: { fontSize: '14px', color: '#6b7280' }, children: "Conversion Rate" })] }), _jsxs("div", { style: {
                                padding: '20px',
                                backgroundColor: '#fdf2f8',
                                borderRadius: '8px',
                                textAlign: 'center',
                            }, children: [_jsx("div", { style: {
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: '#be185d',
                                        marginBottom: '4px',
                                    }, children: metrics.metrics.engagementScore }), _jsx("div", { style: { fontSize: '14px', color: '#6b7280' }, children: "Engagement Score" })] })] }), _jsxs("div", { style: { marginBottom: '32px' }, children: [_jsx("h4", { style: {
                                margin: '0 0 16px 0',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#374151',
                            }, children: "Share Sources" }), _jsxs("div", { style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '12px',
                            }, children: [Object.entries(metrics.breakdowns.byPlatform).map(([platform, count]) => ()
                                    < div, key = { platform }, style = {}, {
                                    padding: '12px',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }), ">", _jsx("span", { style: {
                                        fontSize: '14px',
                                        color: '#374151',
                                        textTransform: 'capitalize',
                                    }, children: platform }), _jsx("span", { style: {
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#6b7280',
                                    }, children: count })] }), "))}"] })] });
        { /* Geography Breakdown */ }
        _jsxs("div", { style: { marginBottom: '32px' }, children: [_jsx("h4", { style: {
                        margin: '0 0 16px 0',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#374151',
                    }, children: "Geographic Distribution" }), _jsxs("div", { style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '12px',
                    }, children: [Object.entries(metrics.breakdowns.byGeography).map(([country, count]) => ()
                            < div, key = { country }, style = {}, {
                            padding: '8px 12px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '4px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }), ">", _jsx("span", { style: { fontSize: '13px', color: '#374151' }, children: country }), _jsx("span", { style: {
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#6b7280',
                            }, children: count })] }), "))}"] });
        div >
            { /* Additional Metrics */}
            < div;
        style = {};
        {
            display: 'grid',
                gridTemplateColumns;
            '1fr 1fr',
                gap;
            '24px',
            ;
        }
    }
     >
        (_jsxs("div", { children: [_jsx("h4", { style: {
                        margin: '0 0 12px 0',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#374151',
                    }, children: "Engagement Details" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx("span", { style: { fontSize: '14px', color: '#6b7280' }, children: "Comments:" }), _jsx("span", { style: { fontSize: '14px', fontWeight: '500' }, children: metrics.metrics.totalComments })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx("span", { style: { fontSize: '14px', color: '#6b7280' }, children: "Clones:" }), _jsx("span", { style: { fontSize: '14px', fontWeight: '500' }, children: metrics.metrics.totalClones })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx("span", { style: { fontSize: '14px', color: '#6b7280' }, children: "Downloads:" }), _jsx("span", { style: { fontSize: '14px', fontWeight: '500' }, children: metrics.metrics.totalDownloads })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx("span", { style: { fontSize: '14px', color: '#6b7280' }, children: "Avg Rating:" }), _jsxs("span", { style: { fontSize: '14px', fontWeight: '500' }, children: [metrics.metrics.averageRating.toFixed(1), "/5"] })] })] })] })
            ,
                _jsxs("div", { children: [_jsx("h4", { style: {
                                margin: '0 0 12px 0',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#374151',
                            }, children: "Device Breakdown" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: [Object.entries(metrics.breakdowns.byDevice).map(([device, count]) => ()
                                    < div, key = { device }, style = {}, { display: 'flex', justifyContent: 'space-between' }), ">", _jsxs("span", { style: {
                                        fontSize: '14px',
                                        color: '#6b7280',
                                        textTransform: 'capitalize',
                                    }, children: [device, ":"] }), _jsx("span", { style: { fontSize: '14px', fontWeight: '500' }, children: count })] }), "))}"] }));
    div >
    ;
    div >
    ;
    div >
    ;
    ;
}
;
export default ShareAnalyticsDashboard;
