/**
 * Epic 16 Contributor Profile Manager Component
 * Task: E16-1753114247118-46E576 - Design contribution UI components
 * 
 * Interface for managing contributor profiles, achievements, badges,
 * and notification preferences.
 */
import React, { useState, useEffect } from 'react';
import { 
  ContributorProfile, 
  ContributorLevel,
  validateContributorProfile 
} from '../../types/contributions';

export interface ContributorProfileManagerProps {
  profile: ContributorProfile;
  onProfileUpdate: (profile: ContributorProfile) => void;
  readOnly?: boolean;
  className?: string;
}

export const ContributorProfileManager: React.FC<ContributorProfileManagerProps> = ({)
  profile,
  onProfileUpdate,
  readOnly = false,
  className = ''
}) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<ContributorProfile>>(profile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'achievements' | 'preferences'>('profile');
  useEffect(() => {
    setFormData(profile);
  }, [profile]);
  // Update form data
  const updateFormData = (updates: Partial<ContributorProfile>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates);
    setErrors(prev => {)
      const newErrors = { ...prev };
      updatedFields.forEach(field => delete newErrors[field]);
      return newErrors;
    });
  };
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.displayName?.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid URL';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Check if URL is valid
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      // Validate with Zod
      // API call would go here
      const response = await fetch(`/api/marketplace/contributors/${profile.id}`, {)}
        method: 'PUT',
        headers: {,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      const updatedProfile = await response.json();
      onProfileUpdate(updatedProfile);
      setEditMode(false);
    } catch (err) {
      setErrors({ )
        save: err instanceof Error ? err.message : 'Failed to save profile' ,
      });
    } finally {
      setSaving(false);
    }
  };
  // Handle cancel
  const handleCancel = () => {
    setFormData(profile);
    setErrors({});
    setEditMode(false);
  };
  // Add skill
  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.skills?.includes(skill.trim())) {
      updateFormData({ )
        skills: [...(formData.skills || []), skill.trim()]
      });
    }
  };
  // Remove skill
  const removeSkill = (index: number) => {
    updateFormData({)
      skills: formData.skills?.filter((_, i) => i !== index) || []
    });
  };
  // Add expertise
  const addExpertise = (expertise: string) => {
    if (expertise.trim() && !formData.expertise?.includes(expertise.trim())) {
      updateFormData({ )
        expertise: [...(formData.expertise || []), expertise.trim()]
      });
    }
  };
  // Remove expertise
  const removeExpertise = (index: number) => {
    updateFormData({)
      expertise: formData.expertise?.filter((_, i) => i !== index) || []
    });
  };
  // Get level badge styling
  const getLevelBadgeStyle = (level: ContributorLevel) => {
    const styles = {
      newcomer: { bg: '#f3f4f6', color: '#4b5563', icon: '🌱' },
      contributor: { bg: '#dbeafe', color: '#1d4ed8', icon: '📝' },
      regular: { bg: '#d1fae5', color: '#065f46', icon: '⭐' },
      trusted: { bg: '#fef3c7', color: '#92400e', icon: '🏆' },
      expert: { bg: '#e0e7ff', color: '#3730a3', icon: '👑' },
      moderator: { bg: '#fce7f3', color: '#be185d', icon: '🛡️' }
    };
    return styles[level] || styles.newcomer;
  };
  const levelStyle = getLevelBadgeStyle(profile.level);
  return ();
    <div className={`contributor-profile-manager ${className}`}>}
      {/* Profile Header */}
      <div className="profile-header">
        <div className="header-main">
          <div className="avatar-section">
            <div className="avatar">
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="level-badge" style={{
              backgroundColor: levelStyle.bg,
              color: levelStyle.color,
            }}>
              <span className="level-icon">{levelStyle.icon}</span>
              <span className="level-text">{profile.level}</span>
            </div>
          </div>
          <div className="profile-info">
            <h2>{profile.displayName}</h2>
            {profile.bio && <p className="bio">{profile.bio}</p>}
            {profile.location && ()
              <div className="location">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 15C8 15 13 10 13 6C13 3.79086 10.2091 1 8 1C5.79086 1 3 3.79086 3 6C3 10 8 15 8 15Z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                {profile.location}
              </div>
            )}
          </div>
        </div>
        {!readOnly && ()
          <div className="header-actions">
            {editMode ? ()
              <div className="edit-actions">
                <button
                  onClick={handleCancel}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : ()
              <button
                onClick={() => setEditMode(true)}
                className="btn-outline"
              >
                Edit Profile
              </button>
            )}
          </div>
        )}
      </div>
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{profile.totalContributions}</div>
          <div className="stat-label">Total Contributions</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{profile.publishedContributions}</div>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{profile.totalViews.toLocaleString()}</div>
          <div className="stat-label">Total Views</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{profile.totalLikes}</div>
          <div className="stat-label">Total Likes</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{Math.round(profile.averageQualityScore)}%</div>
          <div className="stat-label">Avg Quality</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{profile.badges.length}</div>
          <div className="stat-label">Badges Earned</div>
        </div>
      </div>
      {/* Navigation Tabs */}
      <div className="profile-tabs">
        <button
          onClick={() => setActiveTab('profile')}
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
        >
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
        >
          Achievements & Badges
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
        >
          Preferences
        </button>
      </div>
      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'profile' && ()
          <div className="profile-details">
            {editMode ? ()
              <div className="edit-form">
                <div className="form-group">
                  <label htmlFor="displayName">Display Name *</label>
                  <input
                    id="displayName"
                    type="text"
                    value={formData.displayName || ''}
                    onChange={(e) => updateFormData({ displayName: e.target.value })}
                    className={errors.displayName ? 'error' : ''}
                  />
                  {errors.displayName && <div className="error-message">{errors.displayName}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    value={formData.bio || ''}
                    onChange={(e) => updateFormData({ bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className={errors.bio ? 'error' : ''}
                  />
                  <div className="char-count">{formData.bio?.length || 0} / 500 characters</div>
                  {errors.bio && <div className="error-message">{errors.bio}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => updateFormData({ location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => updateFormData({ website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                    className={errors.website ? 'error' : ''}
                  />
                  {errors.website && <div className="error-message">{errors.website}</div>}
                </div>
                <div className="form-group">
                  <label>Social Links</label>
                  <div className="social-inputs">
                    <input
                      type="text"
                      value={formData.social?.twitter || ''}
                      onChange={(e) => updateFormData({ )
                        social: { ...formData.social, twitter: e.target.value } 
                      })}
                      placeholder="Twitter username"
                    />
                    <input
                      type="text"
                      value={formData.social?.linkedin || ''}
                      onChange={(e) => updateFormData({ )
                        social: { ...formData.social, linkedin: e.target.value } 
                      })}
                      placeholder="LinkedIn profile"
                    />
                    <input
                      type="text"
                      value={formData.social?.github || ''}
                      onChange={(e) => updateFormData({ )
                        social: { ...formData.social, github: e.target.value } 
                      })}
                      placeholder="GitHub username"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Areas of Expertise</label>
                  <div className="tags-input">
                    <input
                      type="text"
                      placeholder="Add expertise area..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addExpertise(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <div className="tags-list">
                      {formData.expertise?.map((area, index) => ()
                        <span key={index} className="tag">
                          {area}
                          <button
                            type="button"
                            onClick={() => removeExpertise(index)}
                            className="tag-remove"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Skills</label>
                  <div className="tags-input">
                    <input
                      type="text"
                      placeholder="Add skill..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <div className="tags-list">
                      {formData.skills?.map((skill, index) => ()
                        <span key={index} className="tag">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(index)}
                            className="tag-remove"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {errors.save && <div className="error-message">{errors.save}</div>}
              </div>
            ) : ()
              <div className="profile-display">
                <div className="detail-section">
                  <h4>About</h4>
                  <p>{profile.bio || 'No bio provided'}</p>
                </div>
                <div className="detail-section">
                  <h4>Areas of Expertise</h4>
                  <div className="tags-display">
                    {profile.expertise.length > 0 ? ()
                      profile.expertise.map((area, index) => ()
                        <span key={index} className="tag">{area}</span>
                      ))
                    ) : ()
                      <p className="empty-text">No expertise areas specified</p>
                    )}
                  </div>
                </div>
                <div className="detail-section">
                  <h4>Skills</h4>
                  <div className="tags-display">
                    {profile.skills.length > 0 ? ()
                      profile.skills.map((skill, index) => ()
                        <span key={index} className="tag">{skill}</span>
                      ))
                    ) : ()
                      <p className="empty-text">No skills specified</p>
                    )}
                  </div>
                </div>
                {(profile.website || profile.social) && ()
                  <div className="detail-section">
                    <h4>Links</h4>
                    <div className="links-list">
                      {profile.website && ()
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="link-item">
                          🌐 Website
                        </a>
                      )}
                      {profile.social?.twitter && ()
                        <a href={`https://twitter.com/${profile.social.twitter}`} target="_blank" rel="noopener noreferrer" className="link-item">}
                          🐦 Twitter
                        </a>
                      )}
                      {profile.social?.linkedin && ()
                        <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" className="link-item">
                          💼 LinkedIn
                        </a>
                      )}
                      {profile.social?.github && ()
                        <a href={`https://github.com/${profile.social.github}`} target="_blank" rel="noopener noreferrer" className="link-item">}
                          💻 GitHub
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {activeTab === 'achievements' && ()
          <div className="achievements-content">
            <div className="badges-section">
              <h4>Badges ({profile.badges.length})</h4>
              <div className="badges-grid">
                {profile.badges.map((badge) => ()
                  <div key={badge.id} className="badge-item">
                    <img src={badge.iconUrl} alt={badge.name} className="badge-icon" />
                    <div className="badge-info">
                      <h5>{badge.name}</h5>
                      <p>{badge.description}</p>
                      <span className="earned-date">
                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {profile.badges.length === 0 && ()
                  <p className="empty-text">No badges earned yet</p>
                )}
              </div>
            </div>
            <div className="achievements-section">
              <h4>Achievements ({profile.achievements.length})</h4>
              <div className="achievements-list">
                {profile.achievements.map((achievement) => ()
                  <div key={achievement.id} className="achievement-item">
                    <div className="achievement-info">
                      <h5>{achievement.name}</h5>
                      <p>{achievement.description}</p>
                    </div>
                    <div className="achievement-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{achievement.progress}%</span>
                    </div>
                  </div>
                ))}
                {profile.achievements.length === 0 && ()
                  <p className="empty-text">No achievements in progress</p>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'preferences' && ()
          <div className="preferences-content">
            <div className="preferences-section">
              <h4>Notification Preferences</h4>
              <div className="preference-item">
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={formData.notificationPreferences?.emailOnComment ?? true}
                    onChange={(e) => updateFormData({)
                      notificationPreferences: {,
                        ...formData.notificationPreferences,
                        emailOnComment: e.target.checked,
                      }
                    })}
                    disabled={!editMode && !readOnly}
                  />
                  Email when someone comments on my contributions
                </label>
              </div>
              <div className="preference-item">
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={formData.notificationPreferences?.emailOnLike ?? false}
                    onChange={(e) => updateFormData({)
                      notificationPreferences: {,
                        ...formData.notificationPreferences,
                        emailOnLike: e.target.checked,
                      }
                    })}
                    disabled={!editMode && !readOnly}
                  />
                  Email when someone likes my contributions
                </label>
              </div>
              <div className="preference-item">
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={formData.notificationPreferences?.emailOnFeature ?? true}
                    onChange={(e) => updateFormData({)
                      notificationPreferences: {,
                        ...formData.notificationPreferences,
                        emailOnFeature: e.target.checked,
                      }
                    })}
                    disabled={!editMode && !readOnly}
                  />
                  Email when my contributions are featured
                </label>
              </div>
              <div className="preference-item">
                <label className="preference-label">
                  <input
                    type="checkbox"
                    checked={formData.notificationPreferences?.weeklyDigest ?? true}
                    onChange={(e) => updateFormData({)
                      notificationPreferences: {,
                        ...formData.notificationPreferences,
                        weeklyDigest: e.target.checked,
                      }
                    })}
                    disabled={!editMode && !readOnly}
                  />
                  Weekly digest of community activity
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .contributor-profile-manager {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }
        .profile-header {
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }
        .header-main {
          display: flex;
          gap: 20px;
          flex: 1;
        }
        .avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 700;
        }
        .level-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          text-transform: capitalize;
        }
        .profile-info {
          flex: 1;
        }
        .profile-info h2 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
        }
        .bio {
          margin: 0 0 12px 0;
          color: #6b7280;
          line-height: 1.5;
        }
        .location {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 14px;
        }
        .edit-actions {
          display: flex;
          gap: 12px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1px;
          background: #e5e7eb;
        }
        .stat-item {
          background: #ffffff;
          padding: 16px;
          text-align: center;
        }
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
        }
        .stat-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }
        .profile-tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
          background: #f8fafc;
        }
        .tab-btn {
          background: none;
          border: none;
          padding: 16px 24px;
          cursor: pointer;
          font-weight: 500;
          color: #6b7280;
          border-bottom: 3px solid transparent;
          transition: all 0.2s ease;
        }
        .tab-btn:hover {
          color: #3b82f6;
          background: #f1f5f9;
        }
        .tab-btn.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
          background: #ffffff;
        }
        .tab-content {
          padding: 24px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #374151;
        }
        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .form-group input.error,
        .form-group textarea.error {
          border-color: #ef4444;
        }
        .char-count {
          text-align: right;
          font-size: 12px;
          color: #9ca3af;
          margin-top: 4px;
        }
        .social-inputs {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .tags-input input {
          margin-bottom: 8px;
        }
        .tags-list,
        .tags-display {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .tag {
          background: #3b82f6;
          color: #ffffff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .tags-display .tag {
          background: #e5e7eb;
          color: #4b5563;
        }
        .tag-remove {
          background: none;
          border: none;
          color: #ffffff;
          cursor: pointer;
          font-size: 14px;
          padding: 0;
          margin: 0;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tag-remove:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .detail-section {
          margin-bottom: 24px;
        }
        .detail-section h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }
        .detail-section p {
          margin: 0;
          color: #6b7280;
          line-height: 1.5;
        }
        .links-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .link-item {
          color: #3b82f6;
          text-decoration: none;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .link-item:hover {
          text-decoration: underline;
        }
        .badges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }
        .badge-item {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          gap: 12px;
        }
        .badge-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
        }
        .badge-info h5 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }
        .badge-info p {
          margin: 0 0 4px 0;
          font-size: 12px;
          color: #6b7280;
        }
        .earned-date {
          font-size: 11px;
          color: #9ca3af;
        }
        .achievements-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .achievement-item {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }
        .achievement-info h5 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }
        .achievement-info p {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
        }
        .achievement-progress {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 120px;
        }
        .progress-bar {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: #3b82f6;
          transition: width 0.3s ease;
        }
        .progress-text {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
          min-width: 32px;
        }
        .preference-item {
          margin-bottom: 16px;
        }
        .preference-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #374151;
        }
        .empty-text {
          color: #9ca3af;
          font-style: italic;
          margin: 0;
        }
        .error-message {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
        }
        .btn-primary,
        .btn-secondary,
        .btn-outline {
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        .btn-primary {
          background: #3b82f6;
          color: #ffffff;
        }
        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }
        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border-color: #d1d5db;
        }
        .btn-secondary:hover {
          background: #e5e7eb;
        }
        .btn-outline {
          background: #ffffff;
          color: #374151;
          border-color: #d1d5db;
        }
        .btn-outline:hover {
          background: #f9fafb;
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            align-items: stretch;
          }
          .header-main {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .profile-tabs {
            overflow-x: auto;
          }
          .tab-btn {
            white-space: nowrap;
          }
          .badges-grid {
            grid-template-columns: 1fr;
          }
          .achievement-item {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default ContributorProfileManager;