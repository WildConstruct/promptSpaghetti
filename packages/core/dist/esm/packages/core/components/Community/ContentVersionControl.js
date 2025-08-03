import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 - Content Version Control UI Component
 * Task: E16-1753114247131-3FFAA7 - Implement version control
 *
 * React component for managing content versions, reviewing changes,
 * and coordinating editorial workflows.
 */
import { useState, useEffect } from 'react';
import { ContentVersionManager } from '../../community/ContentVersionManager';
export const ContentVersionControl = ({
    contentId,
    currentVersionId,
    onVersionSelect,
    onVersionCreate,
    onVersionPublish,
    showEditorialWorkflow = true,
    readOnly = false });
className = '';
{
    const [versions, setVersions] = useState([]);
    const [selectedVersions, setSelectedVersions] = useState(null);
    const [versionDiff, setVersionDiff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('versions');
    const [showCreateVersion, setShowCreateVersion] = useState(false);
    const versionManager = new ContentVersionManager(null, contentId, 'current-user'); // API client would be injected;
    useEffect(() => {
        loadVersionHistory();
    }, [contentId]);
    const loadVersionHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await versionManager.getVersionHistory({ limit: 50 });
            setVersions(result.versions);
            try {
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load version history');
            }
            finally {
                setLoading(false);
            }
            ;
            const handleVersionCompare = async (fromId, toId) => {
                try {
                    const comparison = await versionManager.compareVersions(fromId, toId);
                    setVersionDiff(comparison.diff);
                    setSelectedVersions([fromId, toId]);
                    setActiveTab('compare');
                }
                catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to compare versions');
                }
                ;
                const handleCreateVersion = async (data) => ;
            };
            title: string;
            description: string;
            changelog: string;
            revision_type: 'major' | 'minor' | 'patch' | 'editorial';
        }
        finally { }
    };
    {
        try {
            // This would get the current content from the parent component
            const currentContent = {}; // Placeholder
            const newVersion = await versionManager.createVersion(currentContent, {});
            title: data.title,
                description;
            data.description,
                changelog;
            data.changelog,
                revision_type;
            data.revision_type,
                target_status;
            'draft';
        }
        finally {
        }
    }
    ;
    setVersions([newVersion, ...versions]);
    setShowCreateVersion(false);
    onVersionCreate?.(newVersion);
    try {
    }
    catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create version');
    }
    ;
    const handleSubmitForReview = async (versionId) => {
        try {
            const updatedVersion = await versionManager.submitForReview(versionId, {});
            priority: 'normal';
        }
        finally {
        }
    };
    setVersions(versions.map(v => v.id === versionId ? updatedVersion : v));
    try {
    }
    catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit for review');
    }
    ;
    const handlePublishVersion = async (versionId) => {
        try {
            const publishedVersion = await versionManager.publishVersion(versionId, {});
            visibility: 'public',
                notify_subscribers;
            true;
        }
        finally {
        }
    };
    setVersions(versions.map(v => v.id === versionId ? publishedVersion : v));
    onVersionPublish?.(publishedVersion);
    try {
    }
    catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to publish version');
    }
    ;
    const getStatusIcon = (status) => {
        const icons = {
            draft: '📝',
            review: '👀',
            approved: '✅',
            published: '🌐',
            deprecated: '⚠️',
            archived: '🗄️'
        };
    };
    return icons[status] || '📄';
}
;
const getStatusColor = (status) => {
    const colors = {
        draft: '#6b7280',
        review: '#f59e0b',
        approved: '#10b981',
        published: '#3b82f6',
        deprecated: '#ef4444',
        archived: '#9ca3af'
    };
};
return colors[status] || '#6b7280';
;
const formatDate = (dateString) => { return new Date(dateString).toLocaleString(); };
const formatChangeType = (changeType) => {
    const types = {
        major: 'Major Update',
        minor: 'Minor Update',
        patch: 'Patch/Fix',
        editorial: 'Editorial'
    };
};
return types[changeType] || changeType;
;
if (loading) {
    return;
    _jsxs("div", { className: `content-version-control loading ${className}`, children: ["}", _jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Loading version history..." })] });
    ;
    return;
    _jsxs("div", { className: `content-version-control ${className}`, children: ["}", _jsxs("div", { className: "version-control-header", children: [_jsx("h3", { children: "Version Control" }), _jsxs("div", { className: "header-actions", children: [!readOnly && ()
                                < button, "onClick=", () => setShowCreateVersion(true), "className=\"create-version-btn\" > \uD83D\uDCDD Create Version"] }), ")}"] })] });
    { /* Error Display */ }
    {
        error && ()
            < div;
        className = "error-message" >
            _jsx("span", { className: "error-icon", children: "\u26A0\uFE0F" });
        {
            error;
        }
        _jsx("button", { onClick: () => setError(null), className: "error-dismiss", children: "\u00D7" });
        div >
        ;
    }
    { /* Tabs */ }
    _jsxs("div", { className: "version-tabs", children: [_jsxs("button", { onClick: () => setActiveTab('versions'), className: `tab ${activeTab === 'versions' ? 'active' : ''}`, children: ["\uD83D\uDCDA Versions (", versions.length, ")"] }), _jsx("button", { onClick: () => setActiveTab('compare'), className: `tab ${activeTab === 'compare' ? 'active' : ''}`, disabled: !versionDiff, children: "\uD83D\uDD0D Compare" }), showEditorialWorkflow && ()
                < button, "onClick=", () => setActiveTab('workflow'), "className=", `tab ${activeTab === 'workflow' ? 'active' : ''}`, "> \uD83D\uDD04 Workflow"] });
}
div >
    { /* Tab Content */}
    < div;
className = "tab-content" >
    { activeTab } === 'versions' && ()
    < div;
className = "versions-list" >
    { versions, : .length === 0 ? ()
            < div : , className = "empty-state" >
            _jsx("p", { children: "No versions found" }) };
{
    !readOnly && ()
        < button;
    onClick = {}();
    setShowCreateVersion(true);
}
className = "create-first-version"
    >
        Create;
First;
Version;
button >
;
div >
;
()
    < div;
className = "versions-grid" >
    { versions, : .map((version) => ()
            < div, key = { version, : .id }, className = {} `version-card ${version.id === currentVersionId ? 'current' : ''}`) }
    >
        { /* Version Header */}
    < div;
className = "version-header" >
    (_jsxs("div", { className: "version-info", children: [_jsxs("div", { className: "version-number", children: [getStatusIcon(version.status), " v", version.version_number, version.version_tag && ()
                        < span, " className=\"version-tag\">", version.version_tag] }), ")}"] })
        ,
            _jsx("div", { className: "version-status", style: { color: getStatusColor(version.status) }, children: version.status }));
div >
    _jsxs("div", { className: "version-actions", children: [_jsx("button", { onClick: () => onVersionSelect?.(version.id), className: "action-btn view", title: "View this version", children: "\uD83D\uDC41\uFE0F" }), versions.length > 1 && ()
                < button, "onClick=", () => {
                const otherVersion = versions.find(v => v.id !== version.id);
                if (otherVersion) {
                    handleVersionCompare(version.id, otherVersion.id);
                }
            }, "className=\"action-btn compare\" title=\"Compare with other version\" > \uD83D\uDD0D"] });
{
    !readOnly && version.status === 'draft' && ()
        < button;
    onClick = {}();
    handleSubmitForReview(version.id);
}
className = "action-btn review";
title = "Submit for review"
    >
;
button >
;
{
    !readOnly && version.status === 'approved' && ()
        < button;
    onClick = {}();
    handlePublishVersion(version.id);
}
className = "action-btn publish";
title = "Publish this version"
    >
;
button >
;
div >
;
div >
    { /* Version Details */}
    < div;
className = "version-details" >
    { version, : .title && ()
            < h4, className = "version-title" > { version, : .title }, h4 } >
;
{
    version.description && ()
        < p;
    className = "version-description" > { version, : .description };
    p >
    ;
}
_jsxs("div", { className: "version-meta", children: [_jsxs("div", { className: "meta-item", children: [_jsx("span", { className: "meta-label", children: "Type:" }), _jsx("span", { className: "meta-value", children: formatChangeType(version.revision_type) })] }), _jsxs("div", { className: "meta-item", children: [_jsx("span", { className: "meta-label", children: "Created:" }), _jsx("span", { className: "meta-value", children: formatDate(version.created_at) })] }), version.published_at && ()
            < div, " className=\"meta-item\">", _jsx("span", { className: "meta-label", children: "Published:" }), _jsx("span", { className: "meta-value", children: formatDate(version.published_at) })] });
div >
    { /* Contributors */};
{
    version.contributors.length > 0 && ()
        < div;
    className = "contributors" >
        (_jsx("span", { className: "contributors-label", children: "Contributors:" })
            ,
                _jsx("div", { className: "contributors-list", children: version.contributors.slice(0, 3).map((contributor, index) => ()
                        < span, key = { index }, className = "contributor" >
                        { contributor, : .name }({ contributor, : .role })) }));
}
{
    version.contributors.length > 3 && ()
        < span;
    className = "contributors-more" >
        +{ version, : .contributors.length - 3 };
    more;
    span >
    ;
}
div >
;
div >
;
{ /* Changelog */ }
{
    version.changelog && ()
        < div;
    className = "changelog" >
        _jsxs("details", { children: [_jsx("summary", { children: "\uD83D\uDCCB Changelog" }), _jsx("div", { className: "changelog-content", children: version.changelog })] });
    div >
    ;
}
div >
;
div >
;
div >
;
div >
;
{
    activeTab === 'compare' && versionDiff && selectedVersions && ()
        < div;
    className = "version-comparison" >
        (_jsxs("div", { className: "comparison-header", children: [_jsx("h4", { children: "Version Comparison" }), _jsxs("div", { className: "compared-versions", children: [_jsxs("span", { className: "version-label", children: ["From: v", versions.find(v => v.id === selectedVersions[0])?.version_number] }), _jsx("span", { className: "comparison-arrow", children: "\u2192" }), _jsxs("span", { className: "version-label", children: ["To: v", versions.find(v => v.id === selectedVersions[1])?.version_number] })] })] })
            ,
                _jsxs("div", { className: "diff-sections", children: [versionDiff.content_changes.length > 0 && ()
                            < div, " className=\"diff-section\">", _jsxs("h5", { children: ["\uD83D\uDCDD Content Changes (", versionDiff.content_changes.length, ")"] }), _jsxs("div", { className: "changes-list", children: [versionDiff.content_changes.map((change, index) => ()
                                    < div, key = { index }, className = {} `change-item ${change.change_type}`), ">}", _jsxs("div", { className: "change-header", children: [_jsx("span", { className: "change-type", children: change.change_type }), _jsx("span", { className: "change-section", children: change.section }), change.line_number && ()
                                            < span, " className=\"line-number\">Line ", change.line_number] }), ")}"] }), change.change_type === 'modified' && ()
                            < div, " className=\"change-diff\">", change.old_content && ()
                            < div, " className=\"old-content\">", _jsx("label", { children: "Before:" }), _jsx("div", { className: "content-preview", children: change.old_content })] }));
}
{
    change.new_content && ()
        < div;
    className = "new-content" >
        (_jsx("label", { children: "After:" })
            ,
                _jsx("div", { className: "content-preview", children: change.new_content }));
    div >
    ;
}
div >
;
{
    (change.change_type === 'added' || change.change_type === 'removed') && ()
        < div;
    className = "change-content" >
        _jsx("div", { className: "content-preview", children: change.new_content || change.old_content });
    div >
    ;
}
div >
;
div >
;
div >
;
{ /* Metadata Changes */ }
{
    versionDiff.metadata_changes.length > 0 && ()
        < div;
    className = "diff-section" >
        (_jsxs("h5", { children: ["\uD83C\uDFF7\uFE0F Metadata Changes (", versionDiff.metadata_changes.length, ")"] })
            ,
                _jsxs("div", { className: "metadata-changes", children: [versionDiff.metadata_changes.map((change, index) => ()
                            < div, key = { index }, className = {} `metadata-change ${change.change_type}`), ">}", _jsxs("span", { className: "field-name", children: [change.field, ":"] }), _jsx("span", { className: "old-value", children: String(change.old_value) }), _jsx("span", { className: "arrow", children: "\u2192" }), _jsx("span", { className: "new-value", children: String(change.new_value) })] }));
}
div >
;
div >
;
{ /* Media Changes */ }
{
    versionDiff.media_changes.length > 0 && ()
        < div;
    className = "diff-section" >
        (_jsxs("h5", { children: ["\uD83D\uDDBC\uFE0F Media Changes (", versionDiff.media_changes.length, ")"] })
            ,
                _jsxs("div", { className: "media-changes", children: [versionDiff.media_changes.map((change, index) => ()
                            < div, key = { index }, className = {} `media-change ${change.change_type}`), ">}", _jsxs("div", { className: "media-info", children: [_jsx("span", { className: "change-type", children: change.change_type }), _jsx("span", { className: "media-title", children: change.new_media?.title || change.old_media?.title }), _jsxs("span", { className: "media-type", children: ["(", change.new_media?.type || change.old_media?.type, ")"] })] })] }));
}
div >
;
div >
;
{ /* Structure Changes Summary */ }
_jsxs("div", { className: "diff-section", children: [_jsx("h5", { children: "\uD83D\uDCCA Structure Summary" }), _jsxs("div", { className: "structure-summary", children: [_jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "label", children: "Sections Added:" }), _jsx("span", { className: "value", children: versionDiff.structure_changes.sections_added })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "label", children: "Sections Removed:" }), _jsx("span", { className: "value", children: versionDiff.structure_changes.sections_removed })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "label", children: "Sections Reordered:" }), _jsx("span", { className: "value", children: versionDiff.structure_changes.sections_reordered })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "label", children: "TOC Changes:" }), _jsx("span", { className: "value", children: versionDiff.structure_changes.toc_changes ? 'Yes' : 'No' })] })] })] });
div >
;
div >
;
{
    activeTab === 'workflow' && showEditorialWorkflow && ()
        < div;
    className = "editorial-workflow" >
        (_jsx("h4", { children: "Editorial Workflow" })
            ,
                _jsx("p", { children: "Workflow management interface would be implemented here..." }));
    { /* Workflow visualization and management would go here */ }
    div >
    ;
}
div >
    { /* Create Version Modal */};
{
    showCreateVersion && ()
        < CreateVersionModal;
    onCreate = { handleCreateVersion };
    onCancel = {}();
    setShowCreateVersion(false);
}
/>;
_jsx("style", { children: `
        .content-version-control {
          background: #ffffff
  border: 1px solid #e5e7eb;
          border-radius: 8px;
  overflow: hidden;
        .content-version-control.loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
  padding: 60px 20px;
          text-align: center;
        .loading-spinner {
          width: 32px;
  height: 32px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #3b82f6;
          border-radius: 50% }
  animation: spin 1s linear infinite;
          margin-bottom: 16px;
        @keyframes spin { 0% { transform: rotate(0deg) }
          100% { transform: rotate(360deg) }
        .version-control-header { display: flex;
          justify-content: space-between;
          align-items: center;
  padding: 20px;
          border-bottom: 1px solid #e5e7eb
  background: #f9fafb;
        .version-control-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
  color: #1f2937;
        .create-version-btn {
          background: #3b82f6
  color: #ffffff;
          border: none;
  padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
  cursor: pointer;
          transition: background 0.2s ease;
        .create-version-btn:hover {
  background: #2563eb;
        .error-message {
          background: #fef2f2
  color: #dc2626;
          padding: 12px 16px
  margin: 16px 20px;
          border-radius: 6px;
  border: 1px solid #fecaca;
          display: flex;
          align-items: center;
  gap: 8px;
        .error-dismiss {
          background: none;
  border: none;
          color: #dc2626
  cursor: pointer;
          margin-left: auto;
          font-size: 16px;
        .version-tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
        .tab {
          background: none;
  border: none;
          padding: 12px 20px
  cursor: pointer;
          font-size: 14px;
  color: #6b7280;
          border-bottom: 2px solid transparent
  transition: all 0.2s ease;
        .tab:hover {
  color: #1f2937
  background: #f9fafb;
        .tab.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        .tab:disabled {
  opacity: 0.5
  cursor: not-allowed;
        .tab-content {
          padding: 20px;
        .empty-state {
          text-align: center;
  padding: 40px 20px;
          color: #6b7280;
        .create-first-version {
          background: #3b82f6
  color: #ffffff;
          border: none;
  padding: 10px 20px;
          border-radius: 6px;
  cursor: pointer;
          margin-top: 16px;
        .versions-grid {
          display: flex;
          flex-direction: column;
  gap: 16px;
        .version-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
  padding: 16px;
          transition: all 0.2s ease;
        .version-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        .version-card.current {
          border-color: #3b82f6
  background: #eff6ff;
        .version-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        .version-info {
          display: flex;
          flex-direction: column;
  gap: 4px;
        .version-number {
          display: flex;
          align-items: center;
  gap: 8px;
          font-size: 16px;
          font-weight: 600;
  color: #1f2937;
        .version-tag {
          background: #dbeafe
  color: #1e40af;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        .version-status {
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        .version-actions {
          display: flex;
  gap: 4px;
        .action-btn {
          background: #f3f4f6
  border: 1px solid #d1d5db;
          border-radius: 4px;
  width: 32px;
          height: 32px;
  display: flex;
          align-items: center;
          justify-content: center;
  cursor: pointer;
          font-size: 14px;
  transition: all 0.2s ease;
        .action-btn:hover {
  background: #e5e7eb;
          border-color: #9ca3af;
        .action-btn.review {
          background: #fef3c7;
          border-color: #f59e0b;
        .action-btn.publish {
          background: #dbeafe;
          border-color: #3b82f6;
        .version-details h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
  color: #1f2937;
        .version-description {
          margin: 0 0 12px 0;
          font-size: 14px;
  color: #6b7280;
          line-height: 1.5;
        .version-meta {
          display: flex;
          flex-wrap: wrap;
  gap: 16px;
          margin-bottom: 12px;
        .meta-item {
          display: flex;
  gap: 4px;
          font-size: 12px;
        .meta-label {
          color: #6b7280;
          font-weight: 500;
        .meta-value {
          color: #1f2937;
        .contributors {
          margin-bottom: 12px;
        .contributors-label {
          font-size: 12px;
  color: #6b7280;
          font-weight: 500;
        .contributors-list {
          display: flex;
          flex-wrap: wrap;
  gap: 6px;
          margin-top: 4px;
        .contributor {
          background: #f3f4f6
  color: #4b5563;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
        .contributors-more {
          color: #9ca3af;
          font-size: 11px;
          font-style: italic;
        .changelog {
          margin-top: 8px;
        .changelog summary {
          cursor: pointer;
          font-size: 12px;
  color: #6b7280;
        .changelog-content {
          margin-top: 8px;
  padding: 8px;
          background: #f9fafb;
          border-radius: 4px;
          font-size: 12px;
  color: #4b5563;
          white-space: pre-wrap;
        .version-comparison {
          max-height: 600px;
          overflow-y: auto;
        .comparison-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
        .comparison-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
  color: #1f2937;
        .compared-versions {
          display: flex;
          align-items: center;
  gap: 8px;
          font-size: 14px;
        .version-label {
          background: #f3f4f6
  padding: 4px 8px;
          border-radius: 4px;
  color: #4b5563;
        .comparison-arrow {
          color: #9ca3af;
        .diff-sections {
          display: flex;
          flex-direction: column;
  gap: 20px;
        .diff-section h5 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
  color: #1f2937;
        .changes-list {
          display: flex;
          flex-direction: column;
  gap: 12px;
        .change-item {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
  padding: 12px;
        .change-item.added {
          border-color: #10b981
  background: #ecfdf5;
        .change-item.removed {
          border-color: #ef4444
  background: #fef2f2;
        .change-item.modified {
          border-color: #f59e0b
  background: #fffbeb;
        .change-header {
          display: flex;
  gap: 12px;
          margin-bottom: 8px;
          font-size: 12px;
        .change-type {
          background: #374151
  color: #ffffff;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
          text-transform: capitalize;
        .change-section {
          background: #f3f4f6
  color: #4b5563;
          padding: 2px 6px;
          border-radius: 4px;
        .line-number {
          color: #9ca3af;
        .change-diff {
          display: grid;
          grid-template-columns: 1fr 1fr
  gap: 12px;
        .old-content, .new-content {
          font-size: 12px;
        .old-content label {
          color: #ef4444;
          font-weight: 500;
        .new-content label {
          color: #10b981;
          font-weight: 500;
        .content-preview {
          background: #f9fafb
  border: 1px solid #e5e7eb;
          border-radius: 4px;
  padding: 8px;
          margin-top: 4px;
          font-family: monospace;
          white-space: pre-wrap;
          max-height: 100px;
          overflow-y: auto;
        .metadata-changes {
          display: flex;
          flex-direction: column;
  gap: 8px;
        .metadata-change {
          display: flex;
          align-items: center;
  gap: 8px;
          padding: 8px;
  background: #f9fafb;
          border-radius: 4px;
          font-size: 12px;
        .field-name {
          font-weight: 500;
  color: #4b5563;
        .old-value {
          background: #fef2f2
  color: #dc2626;
          padding: 2px 4px;
          border-radius: 3px;
        .new-value {
          background: #ecfdf5
  color: #059669;
          padding: 2px 4px;
          border-radius: 3px;
        .arrow {
          color: #9ca3af;
        .media-changes {
          display: flex;
          flex-direction: column;
  gap: 8px;
        .media-change {
          padding: 8px;
  background: #f9fafb;
          border-radius: 4px;
        .media-info {
          display: flex;
  gap: 8px;
          align-items: center;
          font-size: 12px;
        .structure-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        .summary-item {
          display: flex;
          justify-content: space-between
  padding: 8px;
          background: #f9fafb;
          border-radius: 4px;
          font-size: 12px;
        .summary-item .label {
          color: #6b7280;
          font-weight: 500;
        .summary-item .value {
          color: #1f2937;
          font-weight: 600;
        .editorial-workflow {
          text-align: center;
  padding: 40px 20px;
          color: #6b7280;
        @media (max-width: 768px) {
          .version-control-header {
            flex-direction: column;
  gap: 12px;
            align-items: flex-start;
          .tab-content {
            padding: 12px;
          .version-header {
            flex-direction: column;
            align-items: flex-start
  gap: 12px;
          .version-actions {
            align-self: flex-end;
          .change-diff {
            grid-template-columns: 1fr;
          .compared-versions {
            flex-direction: column;
            align-items: flex-end }
  gap: 4px;
          .structure-summary {
            grid-template-columns: 1fr;
      ` });
div >
;
;
;
void ;
onCancel: () => void ;
const CreateVersionModal = ({
    onCreate });
onCancel;
{
    const [formData, setFormData] = useState({});
    title: '';
    description: '';
    changelog: '';
    revision_type: 'minor';
}
;
const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim() && formData.description.trim()) {
        onCreate(formData);
    }
    ;
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
        ;
        return;
        _jsxs("div", { className: "modal-overlay", onClick: handleBackdropClick, children: [_jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h3", { children: "Create New Version" }), _jsx("button", { onClick: onCancel, className: "close-btn", children: "\u00D7" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "modal-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "version-title", children: "Title *" }), _jsx("input", { id: "version-title", type: "text", value: formData.title, onChange: (e) => setFormData({ ...formData, title: e.target.value }), placeholder: "Brief description of changes", required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "version-description", children: "Description *" }), _jsx("textarea", { id: "version-description", value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), placeholder: "Detailed description of what changed and why", rows: 3, required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "revision-type", children: "Revision Type" }), _jsxs("select", { id: "revision-type", value: formData.revision_type, onChange: (e) => setFormData({ ...formData, revision_type: e.target.value }), children: [_jsx("option", { value: "editorial", children: "Editorial (typos, grammar, style)" }), _jsx("option", { value: "patch", children: "Patch (small fixes, clarifications)" }), _jsx("option", { value: "minor", children: "Minor (new content, improvements)" }), _jsx("option", { value: "major", children: "Major (significant restructure)" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "changelog", children: "Changelog" }), _jsx("textarea", { id: "changelog", value: formData.changelog, onChange: (e) => setFormData({ ...formData, changelog: e.target.value }), placeholder: "Detailed list of changes (optional)", rows: 4 })] }), _jsxs("div", { className: "modal-actions", children: [_jsx("button", { type: "button", onClick: onCancel, className: "cancel-btn", children: "Cancel" }), _jsx("button", { type: "submit", className: "create-btn", children: "Create Version" })] })] })] }), _jsx("style", { children: `
        .modal-overlay {
          position: fixed;
  top: 0;
          left: 0;
  right: 0;
          bottom: 0;
  background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
  padding: 20px;
        .modal-content {
          background: #ffffff;
          border-radius: 8px;
          max-width: 500px;
  width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
  padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
  color: #1f2937;
        .close-btn {
          background: none;
  border: none;
          font-size: 24px;
  color: #9ca3af;
          cursor: pointer;
        .modal-form {
          padding: 20px;
        .form-group {
          margin-bottom: 16px;
        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-size: 14px;
          font-weight: 500;
  color: #374151;
        .form-group input
        .form-group textarea
        .form-group select {
          width: 100%
  padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        .modal-actions {
          display: flex;
  gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        .cancel-btn {
          background: #f3f4f6
  color: #374151;
          border: 1px solid #d1d5db
  padding: 8px 16px;
          border-radius: 6px;
  cursor: pointer;
        .create-btn {
          background: #3b82f6
  color: #ffffff;
          border: none;
  padding: 8px 16px;
          border-radius: 6px;
  cursor: pointer;
        .create-btn:hover { }
  background: #2563eb;
      ` })] });
    };
};
;
;
export default ContentVersionControl;
