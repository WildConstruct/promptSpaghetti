/**
 * Template Collaboration Panel Component
 * Epic 8.6: Story 8.6 - Structured Pipeline Export - Task 4
 * 
 * Advanced collaboration interface for sharing export templates, managing
 * permissions, tracking usage analytics, and facilitating team workflows.
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  ExportTemplate, 
  CreateExportTemplate,
  UpdateExportTemplate
} from '../../types/export';
import { useExport } from '../../hooks/useExport';
interface TemplateCollaborationPanelProps {
  template: ExportTemplate;
  visible?: boolean;
  onClose?: () => void;
  projectId?: string;
  className?: string;
}
interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: string;
  lastActive: string;
}
interface CollaborationActivity {
  id: string;
  userId: string;
  userEmail: string;
  action: 'created' | 'updated' | 'shared' | 'forked' | 'used' | 'commented';
  timestamp: string;
  details: string;
  metadata?: Record<string, any>;
}
interface TemplateAnalytics {
  totalUses: number;
  uniqueUsers: number;
  successRate: number;
  averageRating: number;
  forkCount: number;
  usageByFormat: Record<string, number>;
  usageOverTime: Array<{ date: string; count: number }>;
  topUsers: Array<{ userId: string; email: string; uses: number }>;
}
interface ShareSettings {
  isPublic: boolean;
  allowForks: boolean;
  allowComments: boolean;
  requireApproval: boolean;
  expiresAt?: string;
  shareLink?: string;
}

export const TemplateCollaborationPanel: React.FC<TemplateCollaborationPanelProps> = ({)
  template,
  visible = true,
  onClose,
  projectId = '',
  className = ''
}) => {
  // State management
  const [collaborators, setCollaborators] = useState<CollaborationUser[]>([]);
  const [activities, setActivities] = useState<CollaborationActivity[]>([]);
  const [analytics, setAnalytics] = useState<TemplateAnalytics | null>(null);
  const [shareSettings, setShareSettings] = useState<ShareSettings>({)
    isPublic: template.is_public || false,
    allowForks: true,
    allowComments: true,
    requireApproval: false,
  });
  // UI state
  const [activeTab, setActiveTab] = useState<'collaborators' | 'activity' | 'analytics' | 'sharing'>('collaborators');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Hooks
  const { 
    getTemplateCollaborators,
    getTemplateActivity,
    getTemplateAnalytics,
    inviteCollaborator,
    updateCollaboratorRole,
    removeCollaborator,
    updateShareSettings,
    generateShareLink,
    forkTemplate
  } = useExport(projectId);
  // Load collaboration data
  useEffect(() => {
    if (visible) {
      loadCollaborationData();
    }
  }, [visible]);
  const loadCollaborationData = useCallback(async () => {
    setLoading(true);
    try {
      const [collaboratorsData, activitiesData, analyticsData] = await Promise.all([)
        getTemplateCollaborators(template.id),
        getTemplateActivity(template.id),
        getTemplateAnalytics(template.id)
      ]);
      setCollaborators(collaboratorsData);
      setActivities(activitiesData);
      setAnalytics(analyticsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collaboration data');
    } finally {
      setLoading(false);
    }
  }, [template.id, getTemplateCollaborators, getTemplateActivity, getTemplateAnalytics]);
  // Handle inviting collaborator
  const handleInviteCollaborator = useCallback(async () => {
    if (!inviteEmail.trim()) return;
    setLoading(true);
    try {
      const newCollaborator = await inviteCollaborator(template.id, {)
        email: inviteEmail,
        role: inviteRole,
      });
      setCollaborators(prev => [...prev, newCollaborator]);
      setInviteEmail('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite collaborator');
    } finally {
      setLoading(false);
    }
  }, [template.id, inviteEmail, inviteRole, inviteCollaborator]);
  // Handle role change
  const handleRoleChange = useCallback(async (userId: string, newRole: 'owner' | 'editor' | 'viewer') => {
    setLoading(true);
    try {
      await updateCollaboratorRole(template.id, userId, newRole);
      setCollaborators(prev => prev.map(c => )
        c.id === userId ? { ...c, role: newRole } : c
      ));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setLoading(false);
    }
  }, [template.id, updateCollaboratorRole]);
  // Handle removing collaborator
  const handleRemoveCollaborator = useCallback(async (userId: string) => {
    if (!confirm('Are you sure you want to remove this collaborator?')) return;
    setLoading(true);
    try {
      await removeCollaborator(template.id, userId);
      setCollaborators(prev => prev.filter(c => c.id !== userId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove collaborator');
    } finally {
      setLoading(false);
    }
  }, [template.id, removeCollaborator]);
  // Handle share settings update
  const handleShareSettingsUpdate = useCallback(async (newSettings: Partial<ShareSettings>) => {
    const updatedSettings = { ...shareSettings, ...newSettings };
    setLoading(true);
    try {
      await updateShareSettings(template.id, updatedSettings);
      setShareSettings(updatedSettings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update share settings');
    } finally {
      setLoading(false);
    }
  }, [template.id, shareSettings, updateShareSettings]);
  // Generate share link
  const handleGenerateShareLink = useCallback(async () => {
    setLoading(true);
    try {
      const shareLink = await generateShareLink(template.id);
      setShareSettings(prev => ({ ...prev, shareLink }));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate share link');
    } finally {
      setLoading(false);
    }
  }, [template.id, generateShareLink]);
  // Handle template fork
  const handleForkTemplate = useCallback(async () => {
    setLoading(true);
    try {
            // Could emit event or navigate to forked template
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fork template');
    } finally {
      setLoading(false);
    }
  }, [template.id, forkTemplate]);
  // Format date
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {)
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);
  // Format usage count
  const formatUsageCount = useCallback((count: number) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${Math.round(count / 100) / 10}K`;}
    return `${Math.round(count / 100000) / 10}M`;}
  }, []);
  if (!visible) return null;
  return ();
    <div
      className={`template-collaboration-panel ${className}`}
      style={{
        position: 'fixed',
        inset: '60px',
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        zIndex: 1200,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
              👥 Template Collaboration
            </h2>
            <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>
              {template.name} • {collaborators.length} collaborators
            </div>
          </div>
          {onClose && ()
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>
      {/* Navigation Tabs */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'collaborators', label: '👥 Collaborators', desc: 'Manage team access' },
            { key: 'activity', label: '📈 Activity', desc: 'Recent changes and usage' },
            { key: 'analytics', label: '📊 Analytics', desc: 'Usage statistics' },
            { key: 'sharing', label: '🌐 Sharing', desc: 'Public sharing settings' }
          ].map(tab => ()
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '8px 16px',
                background: activeTab === tab.key ? '#0ea5e9' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#6b7280',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab.key ? '600' : 'normal',
                transition: 'all 0.2s ease',
              }}
              title={tab.desc}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
        {error && ()
          <div
            style={{
              padding: '12px 16px',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              marginBottom: '20px',
              fontSize: '14px',
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}
        {/* Collaborators Tab */}
        {activeTab === 'collaborators' && ()
          <div>
            {/* Invite Section */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
              }}
            >
              <h4 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '600' }}>
                Invite Collaborator
              </h4>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280' }}>
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>
                <button
                  onClick={handleInviteCollaborator}
                  disabled={loading || !inviteEmail.trim()}
                  style={{
                    padding: '8px 16px',
                    background: loading ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  {loading ? '⏳' : '➕'} Invite
                </button>
              </div>
            </div>
            {/* Collaborators List */}
            <div>
              <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }}>
                Current Collaborators ({collaborators.length})
              </h4>
              {collaborators.length === 0 ? ()
                <div
                  style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#9ca3af',
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
                  <div>No collaborators yet. Invite team members to get started!</div>
                </div>
              ) : ()
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {collaborators.map(collaborator => ()
                    <div
                      key={collaborator.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: collaborator.avatar ,
                              ? `url(${collaborator.avatar}) center/cover`}
                              : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                          }}
                        >
                          {!collaborator.avatar && collaborator.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                            {collaborator.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {collaborator.email} • Joined {formatDate(collaborator.joinedAt)}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            background: collaborator.role === 'owner' ? '#dbeafe' : ,
                                       collaborator.role === 'editor' ? '#ecfdf5' : '#f3f4f6',
                            color: collaborator.role === 'owner' ? '#1e40af' :,
                                   collaborator.role === 'editor' ? '#166534' : '#374151',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                          }}
                        >
                          {collaborator.role}
                        </span>
                        {collaborator.role !== 'owner' && ()
                          <>
                            <select
                              value={collaborator.role}
                              onChange={(e) => handleRoleChange(collaborator.id, e.target.value as any)}
                              style={{
                                padding: '4px 8px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '4px',
                                fontSize: '12px',
                              }}
                            >
                              <option value="viewer">Viewer</option>
                              <option value="editor">Editor</option>
                            </select>
                            <button
                              onClick={() => handleRemoveCollaborator(collaborator.id)}
                              style={{
                                padding: '4px 8px',
                                background: '#fee2e2',
                                border: '1px solid #fecaca',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: '#dc2626',
                              }}
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Activity Tab */}
        {activeTab === 'activity' && ()
          <div>
            <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }}>
              Recent Activity
            </h4>
            {activities.length === 0 ? ()
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#9ca3af',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📈</div>
                <div>No activity yet. Use the template to see activity here!</div>
              </div>
            ) : ()
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activities.map(activity => ()
                  <div
                    key={activity.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: activity.action === 'created' ? '#10b981' :,
                                   activity.action === 'updated' ? '#f59e0b' :
                                   activity.action === 'shared' ? '#06b6d4' :
                                   activity.action === 'forked' ? '#8b5cf6' :
                                   activity.action === 'used' ? '#3b82f6' : '#6b7280'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', color: '#374151' }}>
                        <strong>{activity.userEmail}</strong> {activity.details}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {formatDate(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Analytics Tab */}
        {activeTab === 'analytics' && ()
          <div>
            <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }}>
              Usage Analytics
            </h4>
            {!analytics ? ()
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#9ca3af',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                <div>Loading analytics...</div>
              </div>
            ) : ()
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat()
                auto-fit,
                minmax(200px,)
                1fr
              ))', gap: '16px' }}>
                <div
                  style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ fontSize: '24px', fontWeight: '600' }}>
                    {formatUsageCount(analytics.totalUses)}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Total Uses</div>
                </div>
                <div
                  style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ fontSize: '24px', fontWeight: '600' }}>
                    {analytics.uniqueUsers}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Unique Users</div>
                </div>
                <div
                  style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ fontSize: '24px', fontWeight: '600' }}>
                    {Math.round(analytics.successRate * 100)}%
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Success Rate</div>
                </div>
                <div
                  style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ fontSize: '24px', fontWeight: '600' }}>
                    {analytics.forkCount}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Forks</div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Sharing Tab */}
        {activeTab === 'sharing' && ()
          <div>
            <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }}>
              Public Sharing Settings
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Public Toggle */}
              <div
                style={{
                  padding: '16px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={shareSettings.isPublic}
                    onChange={(e) => handleShareSettingsUpdate({ isPublic: e.target.checked })}
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>Make Template Public</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Allow anyone to discover and use this template
                    </div>
                  </div>
                </label>
              </div>
              {/* Additional Settings */}
              {shareSettings.isPublic && ()
                <>
                  <div
                    style={{
                      padding: '16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '8px' }}>
                        <input
                          type="checkbox"
                          checked={shareSettings.allowForks}
                          onChange={(e) => handleShareSettingsUpdate({ allowForks: e.target.checked })}
                        />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500' }}>Allow Forks</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            Let others create their own copies of this template
                          </div>
                        </div>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={shareSettings.allowComments}
                          onChange={(e) => handleShareSettingsUpdate({ allowComments: e.target.checked })}
                        />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500' }}>Allow Comments</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            Enable community feedback and discussions
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                  {/* Share Link */}
                  <div
                    style={{
                      padding: '16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                        Share Link
                      </div>
                      {shareSettings.shareLink ? ()
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            value={shareSettings.shareLink}
                            readOnly
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '12px',
                              background: 'white',
                            }}
                          />
                          <button
                            onClick={() => navigator.clipboard.writeText(shareSettings.shareLink!)}
                            style={{
                              padding: '8px 12px',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            📋 Copy
                          </button>
                        </div>
                      ) : ()
                        <button
                          onClick={handleGenerateShareLink}
                          style={{
                            padding: '8px 16px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                          }}
                        >
                          🔗 Generate Share Link
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Footer */}
      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          gap: '12px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleForkTemplate}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: '#f3f4f6',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              color: '#374151',
              opacity: loading ? 0.6 : 1,
            }}
          >
            🍴 Fork Template
          </button>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {onClose && ()
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#6b7280',
              }}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateCollaborationPanel;