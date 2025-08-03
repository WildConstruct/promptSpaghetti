import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Quick Preview Widget
 *
 * Interactive preview widget for marketplace templates with
 * zoom, download, sharing, and detailed information display.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
from;
'../../services/Epic16InteractiveElementsService';
{ // Configuration
    const previewConfig = element.config.preview_config;
    const theme = element.config.theme;
    // State management
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [wishlistLoading, setWishlistLoading] = useState(false);
    // Refs
    const imageRef = useRef(null);
    const containerRef = useRef(null);
    // Track preview view
    useEffect(() => {
        const trackView = async () => {
            await interactiveService.trackInteraction(element.id, {});
            type: InteractionType.CUSTOM;
            user_id: userId;
            timestamp: new Date();
            context: {
                page_url: window.location.href;
                referrer: document.referrer;
                user_agent: navigator.userAgent;
            }
            screen_resolution: `${screen.width}x${screen.height}`;
        };
        viewport_size: `${window.innerWidth}x${window.innerHeight}`;
    }, device_type, window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop', session_id, 'session-' + Date.now(), ab_test_variant, null, data, {
        action: 'preview_opened',
        template_id: templateId,
        template_category: templateData.category,
        template_price: templateData.price });
}
result: {
    success: true,
        conversion;
    false;
}
data: {
    template_id: templateId;
}
duration: 0;
;
;
trackView();
[element.id, interactiveService, userId, templateId, templateData.category, templateData.price];
;
// Handle image navigation
const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => prev < templateData.thumbnails.length - 1 ? prev + 1 : 0);
    setImageLoaded(false);
}, [templateData.thumbnails.length]);
const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => prev > 0 ? prev - 1 : templateData.thumbnails.length - 1);
    setImageLoaded(false);
}, [templateData.thumbnails.length]);
// Handle zoom
const handleZoomIn = useCallback(() => { setZoomLevel(prev => Math.min(prev + 0.5, 3)); }, []);
const handleZoomOut = useCallback(() => { setZoomLevel(prev => Math.max(prev - 0.5, 0.5)); }, []);
const toggleZoom = useCallback(() => {
    if (isZoomed) {
        setIsZoomed(false);
        setZoomLevel(1);
    }
    else {
        setIsZoomed(true);
        setZoomLevel(1.5);
    }
    [isZoomed];
});
// Handle wishlist toggle
const handleWishlistToggle = useCallback(async () => {
    setWishlistLoading(true);
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        await interactiveService.trackInteraction(element.id, {});
        type: InteractionType.CLICK,
            user_id;
        userId,
            timestamp;
        new Date(),
            context;
        {
            page_url: window.location.href,
                referrer;
            document.referrer,
                user_agent;
            navigator.userAgent;
        }
        screen_resolution: `${screen.width}x${screen.height}`;
    }
    finally {
    }
}, viewport_size, `${window.innerWidth}x${window.innerHeight}`);
device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
    session_id;
'session-' + Date.now(),
    ab_test_variant;
null;
data: {
    action: templateData.isInWishlist ? 'wishlist_remove' : 'wishlist_add',
        template_id;
    templateId;
}
result: {
    success: true,
        conversion;
    !templateData.isInWishlist;
}
data: {
    wishlist_status: !templateData.isInWishlist;
}
duration: 500;
;
// Update local state (in real app, this would be managed by global state)
templateData.isInWishlist = !templateData.isInWishlist;
try {
}
catch (error) {
    console.error('Failed to update wishlist:', error);
}
finally {
    setWishlistLoading(false);
}
[element.id, interactiveService, userId, templateId, templateData];
;
// Handle share
const handleShare = useCallback(async (platform) => {
    onShare?.(templateId, platform);
    setShowShareMenu(false);
    await interactiveService.trackInteraction(element.id, {});
    type: InteractionType.CLICK,
        user_id;
    userId,
        timestamp;
    new Date(),
        context;
    {
        page_url: window.location.href,
            referrer;
        document.referrer,
            user_agent;
        navigator.userAgent;
    }
    screen_resolution: `${screen.width}x${screen.height}`;
});
viewport_size: `${window.innerWidth}x${window.innerHeight}`;
device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
    session_id;
'session-' + Date.now(),
    ab_test_variant;
null;
data: {
    action: 'template_shared',
        template_id;
    templateId,
        share_platform;
    platform;
}
result: {
    success: true,
        conversion;
    true;
}
data: {
    platform;
}
duration: 0;
;
[element.id, interactiveService, userId, templateId, onShare];
;
// Handle download
const handleDownload = useCallback(async () => {
    onDownload?.(templateId);
    await interactiveService.trackInteraction(element.id, {});
    type: InteractionType.CLICK,
        user_id;
    userId,
        timestamp;
    new Date(),
        context;
    {
        page_url: window.location.href,
            referrer;
        document.referrer,
            user_agent;
        navigator.userAgent;
    }
    screen_resolution: `${screen.width}x${screen.height}`;
});
viewport_size: `${window.innerWidth}x${window.innerHeight}`;
device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
    session_id;
'session-' + Date.now(),
    ab_test_variant;
null;
data: {
    action: 'template_downloaded',
        template_id;
    templateId,
        was_purchased;
    templateData.isPurchased;
}
result: {
    success: true,
        conversion;
    true;
}
data: {
    template_id: templateId;
}
duration: 0;
;
[element.id, interactiveService, userId, templateId, templateData.isPurchased, onDownload];
;
// Handle purchase
const handlePurchase = useCallback(async () => {
    onPurchase?.(templateId);
    await interactiveService.trackInteraction(element.id, {});
    type: InteractionType.CLICK,
        user_id;
    userId,
        timestamp;
    new Date(),
        context;
    {
        page_url: window.location.href,
            referrer;
        document.referrer,
            user_agent;
        navigator.userAgent;
    }
    screen_resolution: `${screen.width}x${screen.height}`;
});
viewport_size: `${window.innerWidth}x${window.innerHeight}`;
device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
    session_id;
'session-' + Date.now(),
    ab_test_variant;
null;
data: {
    action: 'purchase_initiated',
        template_id;
    templateId,
        price;
    templateData.price,
        currency;
    templateData.currency;
}
result: {
    success: true,
        conversion;
    true,
        data;
    {
        template_id: templateId,
            price;
        templateData.price,
            currency;
        templateData.currency;
    }
}
duration: 0;
;
[element.id, interactiveService, userId, templateId, templateData.price, templateData.currency, onPurchase];
;
// Format price
const formatPrice = useCallback((price, currency) => {
    return new Intl.NumberFormat('en-US', {});
    style: 'currency',
        currency;
    currency;
});
format(price);
[];
;
// Render stars for rating
const renderStars = useCallback((rating, size = 'sm') => {
    const stars = [];
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    for (let i = 1; i <= 5; i++) {
        stars.push(_jsx("svg", { className: `${sizeClass} ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`, fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" }) }, i));
        return _jsx("div", { className: "flex items-center", children: stars });
    }
    [];
});
return;
_jsxs("div", { className: "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4", children: [_jsx("div", { ref: containerRef, className: "bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-full overflow-hidden flex", style: {
                backgroundColor: theme.background_color
            }, "borderRadius:": true }), " `$", theme.border_radius, "px`} >", _jsxs("div", { className: "flex-1 relative bg-gray-100", children: [_jsxs("div", { className: "relative h-full flex items-center justify-center overflow-hidden", children: [_jsx("img", { ref: imageRef, src: templateData.thumbnails[currentImageIndex], alt: `${templateData.title} preview ${currentImageIndex + 1}`, className: `max-w-full max-h-full object-contain transition-all duration-300 ${isZoomed ? 'cursor-move' : 'cursor-zoom-in'}
`, style: {
                                transform: `scale(${zoomLevel})`
                            }, "filter:imageLoaded": true }), " ? 'none' : 'blur(4px)'; onLoad=", () => setImageLoaded(true), "onClick=", previewConfig.zoom_enabled ? toggleZoom : undefined, "/>", !imageLoaded && ()
                            < div, " className=\"absolute inset-0 flex items-center justify-center\">", _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" })] }), ")}"] }), templateData.thumbnails.length > 1 && ()
            <  >
            (_jsx("button", { onClick: prevImage, className: "absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all", children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) })
                ,
                    _jsx("button", { onClick: nextImage, className: "absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all", children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) }))] });
{ /* Zoom Controls */ }
{
    previewConfig.zoom_enabled && ()
        < div;
    className = "absolute bottom-4 left-4 flex space-x-2" >
        (_jsx("button", { onClick: handleZoomOut, disabled: zoomLevel <= 0.5, className: "bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-75 transition-all disabled:opacity-50", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M20 12H4" }) }) })
            ,
                _jsxs("div", { className: "bg-black bg-opacity-50 text-white px-3 py-2 rounded text-sm", children: [Math.round(zoomLevel * 100), "%"] })
                    ,
                        _jsx("button", { onClick: handleZoomIn, disabled: zoomLevel >= 3, className: "bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-75 transition-all disabled:opacity-50", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }) }));
    div >
    ;
}
{ /* Image Counter */ }
{
    templateData.thumbnails.length > 1 && ()
        < div;
    className = "absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm" >
        { currentImageIndex } + 1;
}
/ {templateData.thumbnails.length};
div >
;
div >
    { /* Details Panel */}
    < div;
className = "w-96 flex flex-col" >
    { /* Header */}
    < div;
className = "p-6 border-b border-gray-200" >
    _jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-2", children: templateData.title }), _jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [renderStars(templateData.rating), _jsxs("span", { className: "text-sm text-gray-600", children: ["(", templateData.reviewCount, " reviews)"] })] }), _jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-500", children: [_jsxs("span", { children: [templateData.downloadCount, " downloads"] }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: templateData.category })] })] }), _jsx("button", { onClick: onClose, className: "p-2 text-gray-400 hover:text-gray-600", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] });
{ /* Author */ }
_jsxs("div", { className: "flex items-center space-x-3 mb-4", children: [templateData.authorAvatar ? ()
            < img
            :
        , "src=", templateData.authorAvatar, "alt=", templateData.author, "className=\"w-8 h-8 rounded-full\" /> ) : ()", _jsx("div", { className: "w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-xs font-medium text-gray-600", children: templateData.author.charAt(0).toUpperCase() }) }), ")}", _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: templateData.author }), _jsx("div", { className: "text-xs text-gray-500", children: "Template Creator" })] })] });
{ /* Price and Actions */ }
_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { children: templateData.originalPrice && templateData.originalPrice > templateData.price ? ()
                < div >
                (_jsx("span", { className: "text-lg font-bold text-green-600", children: formatPrice(templateData.price, templateData.currency) })
                    ,
                        _jsx("span", { className: "text-sm text-gray-500 line-through ml-2", children: formatPrice(templateData.originalPrice, templateData.currency) }))
                :
         }), ") : ()", _jsx("span", { className: "text-lg font-bold text-gray-900", children: templateData.price === 0 ? 'Free' : formatPrice(templateData.price, templateData.currency) }), ")}"] })
    ,
        _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: handleWishlistToggle, disabled: wishlistLoading, className: `p-2 rounded-full transition-all ${templateData.isInWishlist
                        ? 'text-red-500 bg-red-50 hover:bg-red-100'
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}
`, title: templateData.isInWishlist ? 'Remove from wishlist' : 'Add to wishlist', children: _jsx("svg", { className: "w-5 h-5", fill: templateData.isInWishlist ? 'currentColor' : 'none', stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" }) }) }), previewConfig.sharing_enabled && ()
                    < div, " className=\"relative\">", _jsx("button", { onClick: () => setShowShareMenu(!showShareMenu), className: "p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all", title: "Share template", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" }) }) }), showShareMenu && ()
                    < div, " className=\"absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10\">", _jsx("button", { onClick: () => handleShare('twitter'), className: "block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded", children: "Twitter" }), _jsx("button", { onClick: () => handleShare('facebook'), className: "block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded", children: "Facebook" }), _jsx("button", { onClick: () => handleShare('linkedin'), className: "block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded", children: "LinkedIn" }), _jsx("button", { onClick: () => handleShare('copy'), className: "block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded", children: "Copy Link" })] });
div >
;
div >
;
div >
;
div >
    { /* Tabs */}
    < div;
className = "border-b border-gray-200" >
    _jsxs("nav", { className: "flex -mb-px", children: [['overview', 'details', 'reviews'].map((tab) => ()
                < button, key = { tab }, onClick = {}()), " => setActiveTab(tab as any)} className=", `flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-all ${activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
`, ">", tab.charAt(0).toUpperCase() + tab.slice(1)] });
nav >
;
div >
    { /* Tab Content */}
    < div;
className = "flex-1 overflow-y-auto p-6" >
    { activeTab } === 'overview' && ()
    < div;
className = "space-y-4" >
    (_jsxs("div", { children: [_jsx("h3", { className: "font-medium text-gray-900 mb-2", children: "Description" }), _jsx("p", { className: "text-sm text-gray-600", children: templateData.description })] })
        ,
            _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-gray-900 mb-2", children: "What's Included" }), _jsx("ul", { className: "text-sm text-gray-600 space-y-1", children: templateData.whatsIncluded.map((item, index) => ()
                            < li, key = { index }, className = "flex items-center" >
                            _jsx("svg", { className: "w-4 h-4 text-green-500 mr-2", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) }), { item }) }), "))}"] }));
div >
    _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-gray-900 mb-2", children: "Tags" }), _jsx("div", { className: "flex flex-wrap gap-2", children: templateData.tags.map((tag) => ()
                    < span, key = { tag }, className = "px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded" >
                    { tag }) }), "))}"] });
div >
;
div >
;
{
    activeTab === 'details' && ()
        < div;
    className = "space-y-4" >
        (_jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-900", children: "File Size:" }), _jsx("div", { className: "text-gray-600", children: templateData.fileSize })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-900", children: "Format:" }), _jsx("div", { className: "text-gray-600", children: templateData.fileFormat.join(', ') })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-900", children: "License:" }), _jsx("div", { className: "text-gray-600", children: templateData.license })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-900", children: "Updated:" }), _jsx("div", { className: "text-gray-600", children: templateData.lastUpdated.toLocaleDateString() })] })] })
            ,
                _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-gray-900 mb-2", children: "Compatibility" }), _jsx("div", { className: "flex flex-wrap gap-2", children: templateData.compatibility.map((app) => ()
                                < span, key = { app }, className = "px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded" >
                                { app }) }), "))}"] }));
    div >
        { templateData, : .requirements.length > 0 && ()
                < div >
                (_jsx("h3", { className: "font-medium text-gray-900 mb-2", children: "Requirements" })
                    ,
                        _jsx("ul", { className: "text-sm text-gray-600 space-y-1", children: templateData.requirements.map((req, index) => ()
                                < li, key = { index }, className = "flex items-start" >
                                _jsx("span", { className: "text-yellow-500 mr-2", children: "\u2022" }), { req }) }))
        };
    ul >
    ;
    div >
    ;
}
div >
;
{
    activeTab === 'reviews' && ()
        < div;
    className = "space-y-4" >
        _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { className: "flex items-center space-x-2", children: [renderStars(templateData.rating, 'md'), _jsx("span", { className: "font-bold", children: templateData.rating }), _jsxs("span", { className: "text-gray-500", children: ["(", templateData.reviewCount, " reviews)"] })] }) });
    { /* Mock reviews */ }
    _jsx("div", { className: "space-y-4", children: [
            { name: 'Sarah Johnson', rating: 5, comment: 'Excellent template! Very well designed and easy to customize.', date: '2 days ago' },
            { name: 'Mike Chen', rating: 4, comment: 'Good quality, though I wish it had more color variations.', date: '1 week ago' },
            { name: 'Emma Wilson', rating: 5, comment: 'Perfect for my project. Great value for money!', date: '2 weeks ago' }
        ].map((review, index) => ()
            < div, key = { index }, className = "border-b border-gray-200 pb-4 last:border-b-0" >
            (_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "font-medium text-sm", children: review.name }), renderStars(review.rating)] }), _jsx("span", { className: "text-xs text-gray-500", children: review.date })] })
                ,
                    _jsx("p", { className: "text-sm text-gray-600", children: review.comment }))) });
}
div >
;
div >
;
div >
    { /* Action Buttons */}
    < div;
className = "border-t border-gray-200 p-6" >
    _jsxs("div", { className: "space-y-3", children: [templateData.isPurchased || templateData.canDownload ? ()
                < button
                :
            , "onClick=", handleDownload, "className=\"w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-all font-medium\" >", previewConfig.download_enabled ? ()
                <  >
                _jsx("svg", { className: "w-5 h-5 inline mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 10v6m0 0l-4-4m4 4l4-4m-4-4V4" }) })
                :
            , "Download Template"] });
();
'View Template';
button >
;
()
    < button;
onClick = { handlePurchase };
className = "w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-all font-medium"
    >
        { templateData, : .price === 0 ? 'Get Free Template' : `Purchase for ${formatPrice(templateData.price, templateData.currency)}` };
button >
;
{
    templateData.demoUrl && ()
        < button;
    onClick = {}();
    window.open(templateData.demoUrl, '_blank');
}
className = "w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-all font-medium"
    >
        View;
Live;
Demo;
button >
;
div >
;
div >
;
div >
;
div >
;
div >
;
;
;
export default QuickPreviewWidget;
