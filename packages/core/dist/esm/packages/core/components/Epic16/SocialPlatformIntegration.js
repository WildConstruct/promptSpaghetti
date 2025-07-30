import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Social Platform Integration - E16-1753114247029-1A29A4
 *
 * Comprehensive social platform integration for template sharing and cross-platform
 * promotion. Integrates with major social platforms and provides unified sharing
 * interface with analytics tracking.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ShareIcon, LinkIcon, CheckIcon, XMarkIcon, ChartBarIcon, CalendarIcon, HashtagIcon, PhotoIcon, Cog6ToothIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
export const ShareContentGenerator = {
    generateTitle: (template, platform) => {
        const baseTitle = template.title;
        const platformSpecific = {
            twitter: `🚀 ${baseTitle}`
        };
    },
    linkedin: `Professional Template: ${baseTitle}`
};
facebook: `Check out this amazing template: ${baseTitle}`;
reddit: `[Template] ${baseTitle}`;
discord: `**${baseTitle}** - New Template Alert!`;
;
return platformSpecific[platform] || baseTitle;
generateDescription: (template, platform) => {
    const baseDesc = template.description;
    const platformSpecific = {
        twitter: `${baseDesc.slice(0, 200)}... #PromptEngineering #AI`
    };
},
    linkedin;
`${baseDesc}\n\n💡 Perfect for professionals looking to enhance their AI workflow.\n\n#AI #Productivity #Templates`;
facebook: `${baseDesc}\n\nWant to streamline your AI interactions? This template is exactly what you need! 🎯`;
reddit: `${baseDesc}\n\nThought this community might find this useful. What do you think?`;
discord: `${baseDesc}\n\nAnyone tried something like this before? Would love to hear your thoughts! 💭`;
;
return platformSpecific[platform] || baseDesc;
generateHashtags: (template, platform) => {
    const baseTags = template.tags || [];
    const platformSpecific = {
        twitter: [...baseTags, 'AI', 'Productivity', 'Templates', 'PromptEngineering'].slice(0, 10),
        linkedin: [...baseTags, 'ArtificialIntelligence', 'Productivity', 'Innovation'].slice(0, 5),
        facebook: [], // Facebook doesn't use hashtags effectively,
        reddit: [], // Reddit uses subreddits instead,
        discord: [] // Discord doesn't use hashtags,
    };
    return platformSpecific[platform] || [];
};
// Main component
export const SocialPlatformIntegration = ({
    template,
    platforms = SOCIAL_PLATFORMS,
    trackingEnabled = true,
    onShareComplete,
    onAnalyticsUpdate,
    className = '',
    showAnalytics = true,
    customizations = {
        autoHashtags: true,
        customBranding: true,
        trackingParameters: true,
        crossPlatformSync: false,
        schedulingEnabled: true,
        analyticsIntegration: true,
    } });
{
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [shareContent, setShareContent] = useState({});
    const [isSharing, setIsSharing] = useState({});
    const [shareResults, setShareResults] = useState({});
    const [showCustomization, setShowCustomization] = useState(false);
    const [analytics, setAnalytics] = useState({});
    views: 0,
        clicks;
    0,
        engagements;
    0,
        conversions;
    0,
        revenue;
    0,
        demographics;
    {
        ageGroups: { }
        geoLocations: { }
        interests: { }
        devices: { }
    }
    performance: {
        clickThroughRate: 0,
            conversionRate;
        0,
            engagementRate;
        0,
            viralCoefficient;
        0,
            timeToConversion;
        0,
        ;
    }
    ;
    // Initialize share content for all platforms
    useEffect(() => {
        const initialContent = {};
        platforms.forEach(platform => { });
        initialContent[platform.id] = {
            title: ShareContentGenerator.generateTitle(template, platform.id),
            description: ShareContentGenerator.generateDescription(template, platform.id),
            url: `${window.location.origin}/templates/${template.id}`
        };
    }, imageUrl, template.thumbnailUrl, hashtags, ShareContentGenerator.generateHashtags(template, platform.id), mentions, [], customText, '');
}
;
;
setShareContent(initialContent);
[template, platforms];
;
const handlePlatformToggle = useCallback((platformId) => {
    setSelectedPlatforms(prev => );
    prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId];
});
[];
;
const handleContentChange = useCallback((platformId, updates) => {
    setShareContent(prev => ({}), ...prev, [platformId], { ...prev[platformId], ...updates });
});
[];
;
const performShare = useCallback(async (platformId) => {
    const platform = platforms.find(p => p.id === platformId);
    const content = shareContent[platformId];
    if (!platform || !content) {
        throw new Error(`Platform ${platformId} not configured`);
    }
    // Simulate API call to social platform
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    // Generate tracking parameters
    const trackingParams = trackingEnabled ? {
        utm_source: platformId,
        utm_medium: 'social',
        utm_campaign: `template_${template.id}`
    }
        :
    ;
}, utm_content, 'share_button');
{ }
;
const shareRecord = {
    id: `share_${Date.now()}_${platformId}` };
templateId: template.id,
    platform;
platformId,
    shareType;
'direct',
    content;
{
    content,
        url;
    content.url + (trackingEnabled ? '?' + new URLSearchParams(trackingParams).toString() : ''),
    ;
}
timestamp: new Date(),
    userId;
'current_user', // Would come from auth context
    success;
Math.random() > 0.1, // 90% success rate simulation
    analytics;
{
    views: Math.floor(Math.random() * 1000),
        clicks;
    Math.floor(Math.random() * 100),
        engagements;
    Math.floor(Math.random() * 50),
        conversions;
    Math.floor(Math.random() * 10),
        revenue;
    Math.floor(Math.random() * 1000) / 100,
        demographics;
    {
        ageGroups: {
            '18-24';
            30, '25-34';
            45, '35-44';
            25;
        }
        geoLocations: {
            'US';
            60, 'EU';
            25, 'Other';
            15;
        }
        interests: {
            'AI';
            80, 'Tech';
            70, 'Productivity';
            60;
        }
        devices: {
            'Desktop';
            60, 'Mobile';
            35, 'Tablet';
            5;
        }
    }
    performance: {
        clickThroughRate: Math.random() * 10,
            conversionRate;
        Math.random() * 5,
            engagementRate;
        Math.random() * 15,
            viralCoefficient;
        Math.random() * 2,
            timeToConversion;
        Math.random() * 3600,
        ;
    }
    metadata: {
        userAgent: navigator.userAgent,
            referrer;
        document.referrer,
            deviceType;
        /Mobile/.test(navigator.userAgent) ? 'mobile' : 'desktop',
            source;
        'template_page',
            medium;
        'social_share',
        ;
    }
    ;
    return shareRecord;
}
[platforms, shareContent, template.id, trackingEnabled];
;
const handleSingleShare = useCallback(async (platformId) => {
    setIsSharing(prev => ({ ...prev, [platformId]: true }));
    try {
        const shareRecord = await performShare(platformId);
        setShareResults(prev => ({ ...prev, [platformId]: shareRecord }));
        onShareComplete?.(shareRecord);
        // Update analytics
        if (customizations.analyticsIntegration) {
            const updatedAnalytics = {
                ...analytics,
                views: analytics.views + shareRecord.analytics.views,
                clicks: analytics.clicks + shareRecord.analytics.clicks,
                engagements: analytics.engagements + shareRecord.analytics.engagements,
                conversions: analytics.conversions + shareRecord.analytics.conversions,
                revenue: analytics.revenue + shareRecord.analytics.revenue,
            };
            setAnalytics(updatedAnalytics);
            onAnalyticsUpdate?.(updatedAnalytics);
        }
        try { }
        catch (error) {
            console.error(`Failed to share on ${platformId}:`, error);
        }
    }
    finally {
        setIsSharing(prev => ({ ...prev, [platformId]: false }));
    }
    [performShare, onShareComplete, analytics, onAnalyticsUpdate, customizations.analyticsIntegration];
});
const handleBulkShare = useCallback(async () => {
    const sharePromises = selectedPlatforms.map(platformId => );
});
handleSingleShare(platformId).catch(err => ({ platformId, error: err }));
;
await Promise.all(sharePromises);
[selectedPlatforms, handleSingleShare];
;
const copyShareLink = useCallback(async () => {
    const shareUrl = `${window.location.origin}/templates/${template.id}${}
      trackingEnabled ? '?utm_source=direct&utm_medium=link&utm_campaign=template_share' : ''
    }`;
    try {
        await navigator.clipboard.writeText(shareUrl);
        // Show success feedback
    }
    catch (err) {
        console.error('Failed to copy link:', err);
    }
    [template.id, trackingEnabled];
});
const enabledPlatforms = useMemo(() => );
platforms.filter(platform => platform.enabled),
    [platforms];
;
const totalAnalytics = useMemo(() => ({}), totalShares, Object.keys(shareResults).length, successfulShares, Object.values(shareResults).filter(r => r.success).length, totalReach, Object.values(shareResults).reduce((sum, r) => sum + r.analytics.views, 0), totalEngagements, Object.values(shareResults).reduce((sum, r) => sum + r.analytics.engagements, 0), averageCTR, Object.values(shareResults).reduce((sum, r) => sum + r.analytics.performance.clickThroughRate, 0) / Math.max(Object.keys(shareResults).length, 1));
[shareResults];
;
return;
_jsxs("div", { className: `bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`, children: ["}", _jsx("div", { className: "border-b border-gray-200 p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(ShareIcon, { className: "h-6 w-6 text-blue-500" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900", children: "Social Platform Integration" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Share \"", template.title, "\" across multiple platforms"] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: copyShareLink, className: "flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded text-sm", children: [_jsx(LinkIcon, { className: "h-4 w-4" }), "Copy Link"] }), _jsxs("button", { onClick: () => setShowCustomization(!showCustomization), className: "flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded text-sm", children: [_jsx(Cog6ToothIcon, { className: "h-4 w-4" }), "Customize"] })] })] }) }), showAnalytics && Object.keys(shareResults).length > 0 && ()
            < div, " className=\"border-b border-gray-200 p-4 bg-blue-50\">", _jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "Share Performance" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: totalAnalytics.totalShares }), _jsx("div", { className: "text-xs text-gray-600", children: "Total Shares" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: totalAnalytics.successfulShares }), _jsx("div", { className: "text-xs text-gray-600", children: "Successful" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-purple-600", children: totalAnalytics.totalReach.toLocaleString() }), _jsx("div", { className: "text-xs text-gray-600", children: "Total Reach" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-orange-600", children: totalAnalytics.totalEngagements }), _jsx("div", { className: "text-xs text-gray-600", children: "Engagements" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-indigo-600", children: [totalAnalytics.averageCTR.toFixed(1), "%"] }), _jsx("div", { className: "text-xs text-gray-600", children: "Avg CTR" })] })] })] });
{ /* Platform Selection */ }
_jsx("div", { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h4", { className: "font-medium text-gray-900", children: "Select Platforms" }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-600", children: [_jsxs("span", { children: [selectedPlatforms.length, " of ", enabledPlatforms.length, " selected"] }), selectedPlatforms.length > 0 && ()
                        < button, "onClick=", handleBulkShare, "disabled=", Object.values(isSharing).some(Boolean), "className=\"flex items-center gap-1 px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded disabled:opacity-50\" >", _jsx(RocketLaunchIcon, { className: "h-4 w-4" }), "Share All"] }), ")}"] }) })
    ,
        _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [enabledPlatforms.map(platform => { }), "const Icon = platform.icon; const isSelected = selectedPlatforms.includes(platform.id); const isSharing = isSharing[platform.id]; const shareResult = shareResults[platform.id]; return;", _jsxs("div", { className: `border rounded-lg p-4 cursor-pointer transition-all ${isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                    }`, onClick: () => handlePlatformToggle(platform.id), children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded-lg", style: { backgroundColor: `${platform.color}10`, color: platform.color }, children: _jsx(Icon, { className: "h-5 w-5" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: platform.displayName }), _jsx("div", { className: "text-xs text-gray-600", children: platform.description })] })] }), _jsx("input", { type: "checkbox", checked: isSelected, onChange: () => handlePlatformToggle(platform.id), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded", onClick: (e) => e.stopPropagation() })] }), shareResult && ()
                            < div, " className=\"mb-3 p-2 bg-gray-100 rounded text-xs\">", _jsxs("div", { className: "flex items-center gap-2", children: [shareResult.success ? ()
                                    < CheckIcon : , " className=\"h-3 w-3 text-green-600\" /> ) : ()", _jsx(XMarkIcon, { className: "h-3 w-3 text-red-600" }), ")}", _jsx("span", { className: shareResult.success ? 'text-green-600' : 'text-red-600', children: shareResult.success ? 'Shared successfully' : 'Share failed' })] }), shareResult.success && ()
                            < div, " className=\"mt-1 grid grid-cols-3 gap-1 text-gray-600\">", _jsxs("div", { children: [shareResult.analytics.views, " views"] }), _jsxs("div", { children: [shareResult.analytics.clicks, " clicks"] }), _jsxs("div", { children: [shareResult.analytics.engagements, " eng."] })] }, platform.id), ")}"] });
{
    isSelected && ()
        < div;
    className = "space-y-2" >
        _jsxs("button", { onClick: (e) => {
                e.stopPropagation();
                handleSingleShare(platform.id);
            }, disabled: isSharing, className: "w-full flex items-center justify-center gap-2 px-3 py-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm disabled:opacity-50", children: [isSharing ? ()
                    <  >
                    _jsx("div", { className: "animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent" })
                    :
                , "Sharing..."] });
    ()
        <  >
        _jsx(ShareIcon, { className: "h-3 w-3" });
    Share;
    Now;
     >
    ;
}
button >
;
div >
;
{ /* Platform capabilities */ }
_jsxs("div", { className: "flex items-center gap-1 mt-2 text-xs text-gray-500", children: [platform.features.hashtags && _jsx(HashtagIcon, { className: "h-3 w-3" }), platform.features.mediaUpload && _jsx(PhotoIcon, { className: "h-3 w-3" }), platform.features.scheduledPosting && _jsx(CalendarIcon, { className: "h-3 w-3" }), platform.features.analytics && _jsx(ChartBarIcon, { className: "h-3 w-3" })] });
div >
;
;
div >
;
div >
    { /* Customization Panel */};
{
    showCustomization && selectedPlatforms.length > 0 && ()
        < div;
    className = "border-t border-gray-200 p-4 bg-gray-50" >
        _jsx("h4", { className: "font-medium text-gray-900 mb-4", children: "Customize Share Content" });
    {
        selectedPlatforms.map(platformId => { });
        const platform = platforms.find(p => p.id === platformId);
        const content = shareContent[platformId];
        if (!platform || !content)
            return null;
        return;
        _jsxs("div", { className: "mb-6 p-4 bg-white border border-gray-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(platform.icon, { className: "h-4 w-4", style: { color: platform.color } }), _jsx("span", { className: "font-medium text-gray-900", children: platform.displayName })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Title" }), _jsx("input", { type: "text", value: content.title, onChange: (e) => handleContentChange(platformId, { title: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm", maxLength: platform.limits.maxTextLength })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }), _jsx("textarea", { value: content.description, onChange: (e) => handleContentChange(platformId, { description: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm", rows: 3, maxLength: platform.limits.maxTextLength }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [content.description.length, " / ", platform.limits.maxTextLength] })] })] }), platform.features.hashtags && ()
                    < div, " className=\"mt-4\">", _jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Hashtags" }), _jsx("input", { type: "text", value: content.hashtags.join(' '), onChange: (e) => handleContentChange(platformId, {}), "hashtags:e": true }), ".target.value.split(' ').filter(tag => tag.startsWith('#')).slice(0, platform.limits.maxHashtags) })} placeholder=\"#AI #productivity #templates\" className=\"w-full px-3 py-2 border border-gray-300 rounded-md text-sm\" />", _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [content.hashtags.length, " / ", platform.limits.maxHashtags, " hashtags"] })] }, platformId);
    }
    div >
    ;
    ;
}
div >
;
div >
;
;
;
export default SocialPlatformIntegration;
