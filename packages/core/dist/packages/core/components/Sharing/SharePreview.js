import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * Epic 16 Marketplace Share Preview Component
 *
 * Shows how shared content will appear on different platforms.
 * Provides real-time preview of OpenGraph, Twitter cards, and embed codes.
 *
 * Task: E16-1753114247020-65B7A3 - Design sharing system
 */
import { useState } from 'react';
{
    const [activePreview, setActivePreview] = useState(selectedPlatform);
    const previewOptions = [];
    {
        id: 'opengraph', label;
        'Web Preview', icon;
        '🌐';
    }
    {
        id: 'twitter', label;
        'Twitter Card', icon;
        '🐦';
    }
    {
        id: 'linkedin', label;
        'LinkedIn', icon;
        '💼';
    }
    {
        id: 'discord', label;
        'Discord', icon;
        '💬';
    }
    {
        id: 'embed', label;
        'Embed Code', icon;
        '📄';
    }
    ;
    const renderOpenGraphPreview = () => ();
    ;
    _jsxs("div", { style: {
            border: '1px solid #e1e5e9',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'white',
            maxWidth: '500px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
        }, children: [shareConfig.thumbnailUrl && ()
                < div, " style=", {
                width: '100%',
                height: '200px',
                backgroundImage: `url(${shareConfig.thumbnailUrl})`
            }, ", backgroundSize: 'cover', backgroundPosition: 'center'; }}>"] });
}
_jsxs("div", { style: { padding: '16px' }, children: [_jsx("div", { style: {
                fontSize: '12px',
                color: '#65676b',
                textTransform: 'uppercase',
                marginBottom: '4px',
            }, children: new URL(shareLink.fullUrl).hostname }), _jsx("div", { style: {
                fontSize: '16px',
                fontWeight: '600',
                color: '#1c1e21',
                marginBottom: '4px',
                lineHeight: '1.2',
            }, children: shareLink.socialTags.openGraph.title }), _jsx("div", { style: {
                fontSize: '14px',
                color: '#65676b',
                lineHeight: '1.3',
            }, children: shareLink.socialTags.openGraph.description })] });
div >
;
;
const renderTwitterPreview = () => ();
;
_jsxs("div", { style: {
        border: '1px solid #cfd9de',
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: 'white',
        maxWidth: '500px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }, children: [shareConfig.thumbnailUrl && ()
            < div, " style=", {
            width: '100%',
            height: '250px',
            backgroundImage: `url(${shareConfig.thumbnailUrl})`
        }, ", backgroundSize: 'cover', backgroundPosition: 'center'; }}>"] });
_jsxs("div", { style: { padding: '12px' }, children: [_jsx("div", { style: {
                fontSize: '15px',
                color: '#536471',
                marginBottom: '2px',
                lineHeight: '1.2',
            }, children: new URL(shareLink.fullUrl).hostname }), _jsx("div", { style: {
                fontSize: '15px',
                fontWeight: '700',
                color: '#0f1419',
                marginBottom: '2px',
                lineHeight: '1.2',
            }, children: shareLink.socialTags.twitter.title }), _jsx("div", { style: {
                fontSize: '15px',
                color: '#536471',
                lineHeight: '1.3',
            }, children: shareLink.socialTags.twitter.description })] });
div >
;
;
const renderLinkedInPreview = () => ();
;
_jsxs("div", { style: {
        border: '1px solid #d0d0d0',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: 'white',
        maxWidth: '500px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }, children: [shareConfig.thumbnailUrl && ()
            < div, " style=", {
            width: '100%',
            height: '200px',
            backgroundImage: `url(${shareConfig.thumbnailUrl})`
        }, ", backgroundSize: 'cover', backgroundPosition: 'center'; }}>"] });
_jsxs("div", { style: { padding: '12px' }, children: [_jsx("div", { style: {
                fontSize: '14px',
                fontWeight: '600',
                color: '#000000',
                marginBottom: '4px',
                lineHeight: '1.2',
            }, children: shareLink.socialTags.openGraph.title }), _jsx("div", { style: {
                fontSize: '12px',
                color: '#666666',
                marginBottom: '8px',
                lineHeight: '1.3',
            }, children: shareLink.socialTags.openGraph.description }), _jsx("div", { style: {
                fontSize: '12px',
                color: '#666666',
                textTransform: 'uppercase',
            }, children: new URL(shareLink.fullUrl).hostname })] });
div >
;
;
const renderDiscordPreview = () => ();
;
_jsxs("div", { style: {
        backgroundColor: '#2f3136',
        padding: '16px',
        borderRadius: '8px',
        maxWidth: '500px',
        fontFamily: 'Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif',
    }, children: [_jsxs("div", { style: {
                borderLeft: '4px solid #5865f2',
                paddingLeft: '12px',
                backgroundColor: '#36393f',
                borderRadius: '4px',
                padding: '16px',
                paddingLeft: '12px',
            }, children: [_jsx("div", { style: {
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#00b0f4',
                        marginBottom: '8px',
                    }, children: shareLink.socialTags.openGraph.title }), _jsx("div", { style: {
                        fontSize: '14px',
                        color: '#dcddde',
                        marginBottom: '12px',
                        lineHeight: '1.3',
                    }, children: shareLink.socialTags.openGraph.description }), shareConfig.thumbnailUrl && ()
                    < div, " style=", {
                    width: '100%',
                    maxWidth: '400px',
                    height: '200px',
                    backgroundImage: `url(${shareConfig.thumbnailUrl})`
                }, ", backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '4px'; }}>"] }), ")}"] });
div >
;
;
const renderEmbedPreview = () => ();
;
_jsxs("div", { style: {
        backgroundColor: '#f8fafc',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
    }, children: [_jsx("div", { style: {
                marginBottom: '12px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
            }, children: "Embed Preview" }), _jsx("div", { style: {
                position: 'relative',
                paddingBottom: '56.25%', // 16:9 aspect ratio,
                height: 0,
                overflow: 'hidden',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
            }, children: _jsx("div", { style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f9fafb',
                    color: '#6b7280',
                    fontSize: '14px',
                }, children: _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { marginBottom: '8px' }, children: "\uD83D\uDCC4" }), _jsx("div", { children: shareConfig.title }), _jsxs("div", { style: { fontSize: '12px', marginTop: '4px' }, children: ["Interactive ", shareConfig.resourceType] })] }) }) }), _jsxs("div", { style: { marginTop: '16px' }, children: [_jsx("label", { style: {
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '500',
                        marginBottom: '8px',
                        color: '#374151',
                    }, children: "Embed Code:" }), _jsx("textarea", { value: shareLink.embedCode?.responsive || '', readOnly: true, style: {
                        width: '100%',
                        height: '80px',
                        padding: '8px',
                        fontSize: '11px',
                        fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                        backgroundColor: '#1f2937',
                        color: '#f9fafb',
                        border: '1px solid #374151',
                        borderRadius: '4px',
                        resize: 'none',
                    } })] })] });
;
const renderPreview = () => {
    switch (activePreview) {
        case 'twitter':
            return renderTwitterPreview();
        case 'linkedin':
            return renderLinkedInPreview();
        case 'discord':
            return renderDiscordPreview();
        case 'embed':
            return renderEmbedPreview();
        default:
            return renderOpenGraphPreview();
    }
    ;
    return;
    _jsxs("div", { style: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
        }, children: [_jsx("h3", { style: {
                    margin: '0 0 20px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                }, children: "Share Preview" }), _jsxs("div", { style: {
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                }, children: [previewOptions.map(option => ()
                        < button, key = { option, : .id }, onClick = {}()), " => setActivePreview(option.id)} style=", {
                        padding: '8px 12px',
                        border: `1px solid ${activePreview === option.id ? '#3b82f6' : '#d1d5db'}`
                    }, ", backgroundColor: activePreview === option.id ? '#eff6ff' : 'white', color: activePreview === option.id ? '#3b82f6' : '#6b7280', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px'; }} >", _jsx("span", { children: option.icon }), option.label] }), "))}"] });
    { /* Preview Content */ }
    _jsx("div", { style: {
            display: 'flex',
            justifyContent: 'center',
            padding: '20px',
            backgroundColor: activePreview === 'discord' ? '#36393f' : '#f8fafc',
            borderRadius: '8px',
            minHeight: '200px',
            alignItems: 'flex-start',
        }, children: renderPreview() });
};
div >
;
;
;
export default SharePreview;
