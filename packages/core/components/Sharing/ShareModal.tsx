/**
 * Epic 16 Marketplace Sharing Modal Component
 * 
 * Main modal interface for sharing templates, graphs, and marketplace content.
 * Provides options for different share formats, permissions, and social platforms.
 * 
 * Task: E16-1753114247020-65B7A3 - Design sharing system
 */
import React, { useState } from 'react';
import {
  ShareableResourceType,
  ShareTarget,
  ShareFormat,
  SocialPlatform,
  CreateShareRequest,
  ShareResponse,
  SharePermission
} from '../../types/sharingTypes';
import { SharingService } from '../../services/SharingService';
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId: string;
  resourceType: ShareableResourceType;
  resourceTitle: string;
  resourceDescription?: string;
  onShareCreated?: (shareResponse: ShareResponse) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({)
  isOpen,
  onClose,
  resourceId,
  resourceType,
  resourceTitle,
  resourceDescription,
  onShareCreated
}) => {
  const [shareTarget, setShareTarget] = useState<ShareTarget>('public');
  const [shareFormat, setShareFormat] = useState<ShareFormat>('link');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [permissions, setPermissions] = useState<SharePermission>({)
    canView: true,
    canComment: true,
    canClone: false,
    canEdit: false,
    canShare: true,
    canEmbed: true,
    canDownload: false,
    requiresAuth: false,
  });
  const [customTitle, setCustomTitle] = useState(resourceTitle);
  const [customDescription, setCustomDescription] = useState(resourceDescription || '');
  const [isLoading, setIsLoading] = useState(false);
  const [shareResponse, setShareResponse] = useState<ShareResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'options' | 'permissions' | 'preview'>('options');
  const sharingService = new SharingService({)
    baseUrl: 'https://prompt-spaghetti.vercel.app',
  });
  const handleCreateShare = async () => {
    setIsLoading(true);
    try {
      const request: CreateShareRequest = {
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
    } catch (error) {
      console.error('Failed to create share:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handlePlatformToggle = (platform: SocialPlatform) => {
    setSelectedPlatforms(prev => )
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // TODO: Show success toast
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };
  if (!isOpen) return null;
  return ()
    <div style={{
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
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 24px 0 24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#111827' }}>
              Share {resourceType}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '4px',
              }}
            >
              ×
            </button>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            {['options', 'permissions', 'preview'].map(tab => ()
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  backgroundColor: activeTab === tab ? '#3b82f6' : 'transparent',
                  color: activeTab === tab ? 'white' : '#6b7280',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        {/* Content */}
        <div style={{ padding: '24px', maxHeight: '500px', overflowY: 'auto' }}>
          {activeTab === 'options' && ()
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Basic Info */}
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  Description
                </label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                />
              </div>
              {/* Share Options */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                    Visibility
                  </label>
                  <select
                    value={shareTarget}
                    onChange={(e) => setShareTarget(e.target.value as ShareTarget)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  >
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="workspace">Workspace Only</option>
                    <option value="organization">Organization Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                    Format
                  </label>
                  <select
                    value={shareFormat}
                    onChange={(e) => setShareFormat(e.target.value as ShareFormat)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  >
                    <option value="link">Share Link</option>
                    <option value="embed">Embed Code</option>
                    <option value="export">Export File</option>
                    <option value="clone">Clone Template</option>
                  </select>
                </div>
              </div>
              {/* Social Platforms */}
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '12px', color: '#374151' }}>
                  Share on Social Platforms
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {['twitter', 'linkedin', 'discord', 'slack', 'teams', 'email'].map(platform => ()
                    <button
                      key={platform}
                      onClick={() => handlePlatformToggle(platform as SocialPlatform)}
                      style={{
                        padding: '8px 12px',
                        border: `1px solid ${selectedPlatforms.includes(platform as SocialPlatform) ? '#3b82f6' : '#d1d5db'}`,}
                        backgroundColor: selectedPlatforms.includes(platform as SocialPlatform) ? '#eff6ff' : 'white',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        textTransform: 'capitalize',
                        color: selectedPlatforms.includes(platform as SocialPlatform) ? '#3b82f6' : '#6b7280'
                      }}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'permissions' && ()
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                Access Permissions
              </h3>
              {Object.entries(permissions).map(([key, value]) => {
                if (typeof value !== 'boolean') return null;
                return ()
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setPermissions(prev => ({ ...prev, [key]: e.target.checked }))}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '14px', color: '#374151', textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
          {activeTab === 'preview' && shareResponse && ()
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                Share Created Successfully!
              </h3>
              {/* Share Link */}
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  Share Link
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={shareResponse.shareLink.shortUrl}
                    readOnly
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#f9fafb',
                    }}
                  />
                  <button
                    onClick={() => copyToClipboard(shareResponse.shareLink.shortUrl)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
              {/* Social Links */}
              {Object.keys(shareResponse.socialLinks).length > 0 && ()
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                    Social Platform Links
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(shareResponse.socialLinks).map(([platform, url]) => ()
                      <div key={platform} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ 
                          fontSize: '12px', 
                          textTransform: 'capitalize', 
                          minWidth: '80px',
                          color: '#6b7280',
                        }}>
                          {platform}:
                        </span>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#3b82f6',
                            textDecoration: 'none',
                            fontSize: '14px',
                          }}
                        >
                          Open {platform}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Embed Code */}
              {shareFormat === 'embed' && ()
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                    Embed Code
                  </label>
                  <textarea
                    value={shareResponse.embedCodes.responsive}
                    readOnly
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      backgroundColor: '#f9fafb',
                    }}
                  />
                  <button
                    onClick={() => copyToClipboard(shareResponse.embedCodes.responsive)}
                    style={{
                      marginTop: '8px',
                      padding: '6px 12px',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Copy Embed Code
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151',
            }}
          >
            Cancel
          </button>
          {activeTab !== 'preview' && ()
            <button
              onClick={handleCreateShare}
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              {isLoading ? 'Creating...' : 'Create Share'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;