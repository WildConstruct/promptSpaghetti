import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * Epic 16 Marketplace Sharing Modal Component
 *
 * Main modal interface for sharing templates, graphs, and marketplace content.
 * Provides options for different share formats, permissions, and social platforms.
 *
 * Task: E16-1753114247020-65B7A3 - Design sharing system
 */
import { useState } from 'react';
import { SharingService } from '../../services/SharingService';
{
    const [shareTarget, setShareTarget] = useState('public');
    const [shareFormat, setShareFormat] = useState('link');
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [permissions, setPermissions] = useState({});
    canView: true,
        canComment;
    true,
        canClone;
    false,
        canEdit;
    false,
        canShare;
    true,
        canEmbed;
    true,
        canDownload;
    false,
        requiresAuth;
    false,
    ;
}
;
const [customTitle, setCustomTitle] = useState(resourceTitle);
const [customDescription, setCustomDescription] = useState(resourceDescription || '');
const [isLoading, setIsLoading] = useState(false);
const [shareResponse, setShareResponse] = useState(null);
const [activeTab, setActiveTab] = useState('options');
const sharingService = new SharingService({});
baseUrl: 'https://prompt-spaghetti.vercel.app',
;
;
const handleCreateShare = async () => {
    setIsLoading(true);
    try {
        const request = {
            resourceId,
            resourceType,
            shareTarget,
            shareFormat,
            title: customTitle,
            description: customDescription,
            permissions,
            socialPlatforms: selectedPlatforms,
        };
        const response = await sharingService.createShare(request);
        setShareResponse(response);
        onShareCreated?.(response);
        setActiveTab('preview');
    }
    catch (error) {
        console.error('Failed to create share:', error);
    }
    finally {
        setIsLoading(false);
    }
    ;
    const handlePlatformToggle = (platform) => {
        setSelectedPlatforms(prev => );
        prev.includes(platform)
            ? prev.filter(p => p !== platform)
            : [...prev, platform];
        ;
    };
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            // TODO: Show success toast,
        }
        catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
        ;
        if (!isOpen)
            return null;
        return;
        _jsxs("div", { style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }, children: [_jsx("div", { style: {
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    }, children: _jsxs("div", { style: {
                            padding: '24px 24px 0 24px',
                            borderBottom: '1px solid #e5e7eb',
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("h2", { style: { margin: 0, fontSize: '24px', fontWeight: '600', color: '#111827' }, children: ["Share ", resourceType] }), _jsx("button", { onClick: onClose, style: {
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '24px',
                                            cursor: 'pointer',
                                            color: '#6b7280',
                                            padding: '4px',
                                        }, children: "\u00D7" })] }), _jsxs("div", { style: { display: 'flex', gap: '8px', marginTop: '16px' }, children: [['options', 'permissions', 'preview'].map(tab => ()
                                        < button, key = { tab }, onClick = {}()), " => setActiveTab(tab as any)} style=", {
                                        padding: '8px 16px',
                                        border: 'none',
                                        backgroundColor: activeTab === tab ? '#3b82f6' : 'transparent',
                                        color: activeTab === tab ? 'white' : '#6b7280',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        textTransform: 'capitalize',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                    }, ">", tab] }), "))}"] }) }), _jsxs("div", { style: { padding: '24px', maxHeight: '500px', overflowY: 'auto' }, children: [activeTab === 'options' && ()
                            < div, " style=", { display: 'flex', flexDirection: 'column', gap: '20px' }, ">", _jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }, children: "Title" }), _jsx("input", { type: "text", value: customTitle, onChange: (e) => setCustomTitle(e.target.value), style: {
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                    } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }, children: "Description" }), _jsx("textarea", { value: customDescription, onChange: (e) => setCustomDescription(e.target.value), rows: 3, style: {
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        resize: 'vertical',
                                    } })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }, children: "Visibility" }), _jsxs("select", { value: shareTarget, onChange: (e) => setShareTarget(e.target.value), style: {
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                            }, children: [_jsx("option", { value: "public", children: "Public" }), _jsx("option", { value: "unlisted", children: "Unlisted" }), _jsx("option", { value: "workspace", children: "Workspace Only" }), _jsx("option", { value: "organization", children: "Organization Only" }), _jsx("option", { value: "private", children: "Private" })] })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }, children: "Format" }), _jsxs("select", { value: shareFormat, onChange: (e) => setShareFormat(e.target.value), style: {
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                            }, children: [_jsx("option", { value: "link", children: "Share Link" }), _jsx("option", { value: "embed", children: "Embed Code" }), _jsx("option", { value: "export", children: "Export File" }), _jsx("option", { value: "clone", children: "Clone Template" })] })] })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontWeight: '500', marginBottom: '12px', color: '#374151' }, children: "Share on Social Platforms" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }, children: [['twitter', 'linkedin', 'discord', 'slack', 'teams', 'email'].map(platform => ()
                                            < button, key = { platform }, onClick = {}()), " => handlePlatformToggle(platform as SocialPlatform)} style=", {
                                            padding: '8px 12px',
                                            border: `1px solid ${selectedPlatforms.includes(platform) ? '#3b82f6' : '#d1d5db'}`
                                        }, ", backgroundColor: selectedPlatforms.includes(platform as SocialPlatform) ? '#eff6ff' : 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', textTransform: 'capitalize', color: selectedPlatforms.includes(platform as SocialPlatform) ? '#3b82f6' : '#6b7280'; }} >", platform] }), "))}"] })] })] });
    };
};
{
    activeTab === 'permissions' && ()
        < div;
    style = {};
    {
        display: 'flex', flexDirection;
        'column', gap;
        '16px';
    }
}
 >
    _jsx("h3", { style: { margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }, children: "Access Permissions" });
{
    Object.entries(permissions).map(([key, value]) => {
        if (typeof value !== 'boolean')
            return null;
        return;
        _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("input", { type: "checkbox", checked: value, onChange: (e) => setPermissions(prev => ({ ...prev, [key]: e.target.checked })), style: { width: '16px', height: '16px' } }), _jsx("span", { style: { fontSize: '14px', color: '#374151', textTransform: 'capitalize' }, children: key.replace(/([A-Z])/g, ' $1').toLowerCase() })] }, key);
    });
}
div >
;
{
    activeTab === 'preview' && shareResponse && ()
        < div;
    style = {};
    {
        display: 'flex', flexDirection;
        'column', gap;
        '20px';
    }
}
 >
    _jsx("h3", { style: { margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }, children: "Share Created Successfully!" });
{ /* Share Link */ }
_jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }, children: "Share Link" }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("input", { type: "text", value: shareResponse.shareLink.shortUrl, readOnly: true, style: {
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: '#f9fafb',
                    } }), _jsx("button", { onClick: () => copyToClipboard(shareResponse.shareLink.shortUrl), style: {
                        padding: '8px 16px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                    }, children: "Copy" })] })] });
{ /* Social Links */ }
{
    Object.keys(shareResponse.socialLinks).length > 0 && ()
        < div >
        (_jsx("label", { style: { display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }, children: "Social Platform Links" })
            ,
                _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: [Object.entries(shareResponse.socialLinks).map(([platform, url]) => ()
                            < div, key = { platform }, style = {}, { display: 'flex', gap: '8px', alignItems: 'center' }), ">", _jsxs("span", { style: {
                                fontSize: '12px',
                                textTransform: 'capitalize',
                                minWidth: '80px',
                                color: '#6b7280',
                            }, children: [platform, ":"] }), _jsxs("a", { href: url, target: "_blank", rel: "noopener noreferrer", style: {
                                color: '#3b82f6',
                                textDecoration: 'none',
                                fontSize: '14px',
                            }, children: ["Open ", platform] })] }));
}
div >
;
div >
;
{ /* Embed Code */ }
{
    shareFormat === 'embed' && ()
        < div >
        (_jsx("label", { style: { display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }, children: "Embed Code" })
            ,
                _jsx("textarea", { value: shareResponse.embedCodes.responsive, readOnly: true, rows: 4, style: {
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        backgroundColor: '#f9fafb',
                    } })
                    ,
                        _jsx("button", { onClick: () => copyToClipboard(shareResponse.embedCodes.responsive), style: {
                                marginTop: '8px',
                                padding: '6px 12px',
                                backgroundColor: '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                            }, children: "Copy Embed Code" }));
    div >
    ;
}
div >
;
div >
    { /* Footer */}
    < div;
style = {};
{
    padding: '16px 24px',
        borderTop;
    '1px solid #e5e7eb',
        display;
    'flex',
        justifyContent;
    'flex-end',
        gap;
    '12px',
    ;
}
 >
    _jsx("button", { onClick: onClose, style: {
            padding: '8px 16px',
            border: '1px solid #d1d5db',
            backgroundColor: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#374151',
        }, children: "Cancel" });
{
    activeTab !== 'preview' && ()
        < button;
    onClick = { handleCreateShare };
    disabled = { isLoading };
    style = {};
    {
        padding: '8px 16px',
            backgroundColor;
        isLoading ? '#9ca3af' : '#3b82f6',
            color;
        'white',
            border;
        'none',
            borderRadius;
        '6px',
            cursor;
        isLoading ? 'not-allowed' : 'pointer',
            fontSize;
        '14px',
            fontWeight;
        '500',
        ;
    }
}
    >
        { isLoading, 'Creating...': 'Create Share' };
button >
;
div >
;
div >
;
div >
;
;
;
export default ShareModal;
