import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Contributor Profile Manager Component
 * Task: E16-1753114247118-46E576 - Design contribution UI components
 *
 * Interface for managing contributor profiles, achievements, badges,
 * and notification preferences.
 */
import { useState, useEffect } from 'react';
from;
'../../types/contributions';
export const ContributorProfileManager = ({
    profile,
    onProfileUpdate,
    readOnly = false });
className = '';
{
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState(profile);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    useEffect(() => { setFormData(profile); }, [profile]);
    // Update form data
    const updateFormData = (updates) => {
        setFormData(prev => ({ ...prev, ...updates }));
        // Clear errors for updated fields
        const updatedFields = Object.keys(updates);
        setErrors(prev => { });
        const newErrors = { ...prev };
        updatedFields.forEach(field => delete newErrors[field]);
        return newErrors;
    };
}
;
// Validate form
const validateForm = () => {
    const newErrors = {};
    if (!formData.displayName?.trim()) {
        newErrors.displayName = 'Display name is required';
        if (formData.bio && formData.bio.length > 500) {
            newErrors.bio = 'Bio must be less than 500 characters';
            if (formData.website && !isValidUrl(formData.website)) {
                newErrors.website = 'Please enter a valid URL';
                setErrors(newErrors);
                return Object.keys(newErrors).length === 0;
            }
            ;
            // Check if URL is valid
            const isValidUrl = (url) => {
                try {
                    new URL(url);
                    return true;
                }
                catch {
                    return false;
                }
                ;
                // Handle save
                const handleSave = async () => {
                    if (!validateForm())
                        return;
                    setSaving(true);
                    try {
                        // Validate with Zod
                        // API call would go here
                        const response = await fetch(`/api/marketplace/contributors/${profile.id}`, {});
                    }
                    finally {
                    }
                    method: 'PUT';
                    headers: {
                        'Content-Type';
                        'application/json';
                    }
                    'Authorization';
                    `Bearer ${localStorage.getItem('token')}`;
                };
                body: JSON.stringify(formData);
            };
            if (!response.ok) {
                throw new Error('Failed to update profile');
                const updatedProfile = await response.json();
                onProfileUpdate(updatedProfile);
                setEditMode(false);
            }
            try { }
            catch (err) {
                setErrors({});
                save: err instanceof Error ? err.message : 'Failed to save profile';
            }
        }
        ;
        try {
        }
        finally {
            setSaving(false);
        }
        ;
        // Handle cancel
        const handleCancel = () => {
            setFormData(profile);
            setErrors({});
            setEditMode(false);
        };
        // Add skill
        const addSkill = (skill) => {
            if (skill.trim() && !formData.skills?.includes(skill.trim())) {
                updateFormData({});
                skills: [...(formData.skills || []), skill.trim()];
            }
        };
    }
    ;
    // Remove skill
    const removeSkill = (index) => {
        updateFormData({});
        skills: formData.skills?.filter((_, i) => i !== index) || [];
    };
};
;
// Add expertise
const addExpertise = (expertise) => {
    if (expertise.trim() && !formData.expertise?.includes(expertise.trim())) {
        updateFormData({});
        expertise: [...(formData.expertise || []), expertise.trim()];
    }
};
;
// Remove expertise
const removeExpertise = (index) => {
    updateFormData({});
    expertise: formData.expertise?.filter((_, i) => i !== index) || [];
};
;
;
// Get level badge styling
const getLevelBadgeStyle = (level) => {
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
return;
_jsxs("div", { className: `contributor-profile-manager ${className}`, children: ["}", _jsx("div", { className: "profile-header", children: _jsxs("div", { className: "header-main", children: [_jsxs("div", { className: "avatar-section", children: [_jsx("div", { className: "avatar", children: profile.displayName.charAt(0).toUpperCase() }), _jsxs("div", { className: "level-badge", style: {
                                    backgroundColor: levelStyle.bg,
                                    color: levelStyle.color
                                }, children: [_jsx("span", { className: "level-icon", children: levelStyle.icon }), _jsx("span", { className: "level-text", children: profile.level })] })] }), _jsxs("div", { className: "profile-info", children: [_jsx("h2", { children: profile.displayName }), profile.bio && _jsx("p", { className: "bio", children: profile.bio }), profile.location && ()
                                < div, " className=\"location\">", _jsxs("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", children: [_jsx("path", { d: "M8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1Z", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("path", { d: "M8 15C8 15 13 10 13 6C13 3.79086 10.2091 1 8 1C5.79086 1 3 3.79086 3 6C3 10 8 15 8 15Z", stroke: "currentColor", strokeWidth: "1.5" })] }), profile.location] }), ")}"] }) }), !readOnly && ()
            < div, " className=\"header-actions\">", editMode ? ()
            < div : , " className=\"edit-actions\">", _jsx("button", { onClick: handleCancel, className: "btn-secondary", disabled: saving, children: "Cancel" }), _jsx("button", { onClick: handleSave, className: "btn-primary", disabled: saving, children: saving ? 'Saving...' : 'Save Changes' })] });
()
    < button;
onClick = {}();
setEditMode(true);
className = "btn-outline"
    >
        Edit;
Profile;
button >
;
div >
;
div >
    { /* Stats Grid */}
    < div;
className = "stats-grid" >
    (_jsxs("div", { className: "stat-item", children: [_jsx("div", { className: "stat-value", children: profile.totalContributions }), _jsx("div", { className: "stat-label", children: "Total Contributions" })] })
        ,
            _jsxs("div", { className: "stat-item", children: [_jsx("div", { className: "stat-value", children: profile.publishedContributions }), _jsx("div", { className: "stat-label", children: "Published" })] })
                ,
                    _jsxs("div", { className: "stat-item", children: [_jsx("div", { className: "stat-value", children: profile.totalViews.toLocaleString() }), _jsx("div", { className: "stat-label", children: "Total Views" })] })
                        ,
                            _jsxs("div", { className: "stat-item", children: [_jsx("div", { className: "stat-value", children: profile.totalLikes }), _jsx("div", { className: "stat-label", children: "Total Likes" })] })
                                ,
                                    _jsxs("div", { className: "stat-item", children: [_jsxs("div", { className: "stat-value", children: [Math.round(profile.averageQualityScore), "%"] }), _jsx("div", { className: "stat-label", children: "Avg Quality" })] })
                                        ,
                                            _jsxs("div", { className: "stat-item", children: [_jsx("div", { className: "stat-value", children: profile.badges.length }), _jsx("div", { className: "stat-label", children: "Badges Earned" })] }));
div >
    { /* Navigation Tabs */}
    < div;
className = "profile-tabs" >
    (_jsx("button", { onClick: () => setActiveTab('profile'), className: `tab-btn ${activeTab === 'profile' ? 'active' : ''}`, children: "Profile Details" })
        ,
            _jsx("button", { onClick: () => setActiveTab('achievements'), className: `tab-btn ${activeTab === 'achievements' ? 'active' : ''}`, children: "Achievements & Badges" })
                ,
                    _jsx("button", { onClick: () => setActiveTab('preferences'), className: `tab-btn ${activeTab === 'preferences' ? 'active' : ''}`, children: "Preferences" }));
div >
    { /* Tab Content */}
    < div;
className = "tab-content" >
    { activeTab } === 'profile' && ()
    < div;
className = "profile-details" >
    {}
    < div;
className = "edit-form" >
    (_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "displayName", children: "Display Name *" }), _jsx("input", { id: "displayName", type: "text", value: formData.displayName || '', onChange: (e) => updateFormData({ displayName: e.target.value }), className: errors.displayName ? 'error' : '' }), errors.displayName && _jsx("div", { className: "error-message", children: errors.displayName })] })
        ,
            _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "bio", children: "Bio" }), _jsx("textarea", { id: "bio", value: formData.bio || '', onChange: (e) => updateFormData({ bio: e.target.value }), placeholder: "Tell us about yourself...", rows: 3, className: errors.bio ? 'error' : '' }), _jsxs("div", { className: "char-count", children: [formData.bio?.length || 0, " / 500 characters"] }), errors.bio && _jsx("div", { className: "error-message", children: errors.bio })] })
                ,
                    _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "location", children: "Location" }), _jsx("input", { id: "location", type: "text", value: formData.location || '', onChange: (e) => updateFormData({ location: e.target.value }), placeholder: "City, Country" })] })
                        ,
                            _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "website", children: "Website" }), _jsx("input", { id: "website", type: "url", value: formData.website || '', onChange: (e) => updateFormData({ website: e.target.value }), placeholder: "https://yourwebsite.com", className: errors.website ? 'error' : '' }), errors.website && _jsx("div", { className: "error-message", children: errors.website })] })
                                ,
                                    _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Social Links" }), _jsxs("div", { className: "social-inputs", children: [_jsx("input", { type: "text", value: formData.social?.twitter || '', onChange: (e) => updateFormData({}), "social:": true, ...(formData.social, twitter) }), ": e.target.value } })} placeholder=\"Twitter username\" />", _jsx("input", { type: "text", value: formData.social?.linkedin || '', onChange: (e) => updateFormData({}), "social:": true, ...(formData.social, linkedin) }), ": e.target.value } })} placeholder=\"LinkedIn profile\" />", _jsx("input", { type: "text", value: formData.social?.github || '', onChange: (e) => updateFormData({}), "social:": true, ...(formData.social, github) }), ": e.target.value } })} placeholder=\"GitHub username\" />"] })] })
                                        ,
                                            _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Areas of Expertise" }), _jsxs("div", { className: "tags-input", children: [_jsx("input", { type: "text", placeholder: "Add expertise area...", onKeyPress: (e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        addExpertise(e.currentTarget.value);
                                                                        e.currentTarget.value = '';
                                                                    }
                                                                } }), _jsxs("div", { className: "tags-list", children: [formData.expertise?.map((area, index) => ()
                                                                        < span, key = { index }, className = "tag" >
                                                                        { area }
                                                                        < button, type = "button", onClick = {}()), " => removeExpertise(index)} className=\"tag-remove\" > \u00D7"] })] }), "))}"] }));
div >
;
div >
    _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Skills" }), _jsxs("div", { className: "tags-input", children: [_jsx("input", { type: "text", placeholder: "Add skill...", onKeyPress: (e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addSkill(e.currentTarget.value);
                                e.currentTarget.value = '';
                            }
                        } }), _jsxs("div", { className: "tags-list", children: [formData.skills?.map((skill, index) => ()
                                < span, key = { index }, className = "tag" >
                                { skill }
                                < button, type = "button", onClick = {}()), " => removeSkill(index)} className=\"tag-remove\" > \u00D7"] })] }), "))}"] });
div >
;
div >
    { errors, : .save && _jsx("div", { className: "error-message", children: errors.save }) };
div >
;
()
    < div;
className = "profile-display" >
    (_jsxs("div", { className: "detail-section", children: [_jsx("h4", { children: "About" }), _jsx("p", { children: profile.bio || 'No bio provided' })] })
        ,
            _jsxs("div", { className: "detail-section", children: [_jsx("h4", { children: "Areas of Expertise" }), _jsxs("div", { className: "tags-display", children: [profile.expertise.length > 0 ? ()
                                :
                            , "profile.expertise.map((area, index) => ()", _jsx("span", { className: "tag", children: area }, index), ")) ) : ()", _jsx("p", { className: "empty-text", children: "No expertise areas specified" }), ")}"] })] })
                ,
                    _jsxs("div", { className: "detail-section", children: [_jsx("h4", { children: "Skills" }), _jsxs("div", { className: "tags-display", children: [profile.skills.length > 0 ? ()
                                        :
                                    , "profile.skills.map((skill, index) => ()", _jsx("span", { className: "tag", children: skill }, index), ")) ) : ()", _jsx("p", { className: "empty-text", children: "No skills specified" }), ")}"] })] }));
{
    (profile.website || profile.social) && ()
        < div;
    className = "detail-section" >
        (_jsx("h4", { children: "Links" })
            ,
                _jsxs("div", { className: "links-list", children: [profile.website && ()
                            < a, " href=", profile.website, " target=\"_blank\" rel=\"noopener noreferrer\" className=\"link-item\"> \uD83C\uDF10 Website"] }));
}
{
    profile.social?.twitter && ()
        < a;
    href = {} `https://twitter.com/${profile.social.twitter}`;
}
target = "_blank";
rel = "noopener noreferrer";
className = "link-item" > ;
Twitter;
a >
;
{
    profile.social?.linkedin && ()
        < a;
    href = { profile, : .social.linkedin };
    target = "_blank";
    rel = "noopener noreferrer";
    className = "link-item" >
    ;
    LinkedIn;
    a >
    ;
}
{
    profile.social?.github && ()
        < a;
    href = {} `https://github.com/${profile.social.github}`;
}
target = "_blank";
rel = "noopener noreferrer";
className = "link-item" > ;
GitHub;
a >
;
div >
;
div >
;
div >
;
div >
;
{
    activeTab === 'achievements' && ()
        < div;
    className = "achievements-content" >
        _jsxs("div", { className: "badges-section", children: [_jsxs("h4", { children: ["Badges (", profile.badges.length, ")"] }), _jsx("div", { className: "badges-grid", children: profile.badges.map((badge) => ()
                        < div, key = { badge, : .id }, className = "badge-item" >
                        (_jsx("img", { src: badge.iconUrl, alt: badge.name, className: "badge-icon" })
                            ,
                                _jsxs("div", { className: "badge-info", children: [_jsx("h5", { children: badge.name }), _jsx("p", { children: badge.description }), _jsxs("span", { className: "earned-date", children: ["Earned ", new Date(badge.earnedAt).toLocaleDateString()] })] }))) }), "))}", profile.badges.length === 0 && ()
                    < p, " className=\"empty-text\">No badges earned yet"] });
}
div >
;
div >
    _jsxs("div", { className: "achievements-section", children: [_jsxs("h4", { children: ["Achievements (", profile.achievements.length, ")"] }), _jsx("div", { className: "achievements-list", children: profile.achievements.map((achievement) => ()
                    < div, key = { achievement, : .id }, className = "achievement-item" >
                    (_jsxs("div", { className: "achievement-info", children: [_jsx("h5", { children: achievement.name }), _jsx("p", { children: achievement.description })] })
                        ,
                            _jsxs("div", { className: "achievement-progress", children: [_jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: { width: `${achievement.progress}%` } }) }), _jsxs("span", { className: "progress-text", children: [achievement.progress, "%"] })] }))) }), "))}", profile.achievements.length === 0 && ()
                < p, " className=\"empty-text\">No achievements in progress"] });
div >
;
div >
;
div >
;
{
    activeTab === 'preferences' && ()
        < div;
    className = "preferences-content" >
        _jsxs("div", { className: "preferences-section", children: [_jsx("h4", { children: "Notification Preferences" }), _jsx("div", { className: "preference-item", children: _jsxs("label", { className: "preference-label", children: [_jsx("input", { type: "checkbox", checked: formData.notificationPreferences?.emailOnComment ?? true, onChange: (e) => updateFormData({}), "notificationPreferences:": true, ...formData.notificationPreferences, "emailOnComment:e": true }), ".target.checked } })} disabled=", !editMode && !readOnly, "/> Email when someone comments on my contributions"] }) }), _jsx("div", { className: "preference-item", children: _jsxs("label", { className: "preference-label", children: [_jsx("input", { type: "checkbox", checked: formData.notificationPreferences?.emailOnLike ?? false, onChange: (e) => updateFormData({}), "notificationPreferences:": true, ...formData.notificationPreferences, "emailOnLike:e": true }), ".target.checked } })} disabled=", !editMode && !readOnly, "/> Email when someone likes my contributions"] }) }), _jsx("div", { className: "preference-item", children: _jsxs("label", { className: "preference-label", children: [_jsx("input", { type: "checkbox", checked: formData.notificationPreferences?.emailOnFeature ?? true, onChange: (e) => updateFormData({}), "notificationPreferences:": true, ...formData.notificationPreferences, "emailOnFeature:e": true }), ".target.checked } })} disabled=", !editMode && !readOnly, "/> Email when my contributions are featured"] }) }), _jsx("div", { className: "preference-item", children: _jsxs("label", { className: "preference-label", children: [_jsx("input", { type: "checkbox", checked: formData.notificationPreferences?.weeklyDigest ?? true, onChange: (e) => updateFormData({}), "notificationPreferences:": true, ...formData.notificationPreferences, "weeklyDigest:e": true }), ".target.checked } })} disabled=", !editMode && !readOnly, "/> Weekly digest of community activity"] }) })] });
    div >
    ;
}
div >
    _jsx("style", { children: `
        .contributor-profile-manager {
          background: #ffffff
  border: 1px solid #e5e7eb;
          border-radius: 12px;
  overflow: hidden;
        .profile-header {
          padding: 24px;
          border-bottom: 1px solid #e5e7eb
  display: flex;
          justify-content: space-between;
          align-items: flex-start
  gap: 20px;
        .header-main {
          display: flex;
  gap: 20px;
          flex: 1;
        .avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
  gap: 8px;
        .avatar {
          width: 80px;
  height: 80px;
          border-radius: 50%
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: #ffffff
  display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 700;
        .level-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
  display: flex;
          align-items: center;
  gap: 4px;
          text-transform: capitalize;
        .profile-info {
          flex: 1;
        .profile-info h2 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
  color: #1f2937;
        .bio {
          margin: 0 0 12px 0
  color: #6b7280;
          line-height: 1.5;
        .location {
          display: flex;
          align-items: center;
  gap: 6px;
          color: #6b7280;
          font-size: 14px;
        .edit-actions {
          display: flex;
  gap: 12px;
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1px;
  background: #e5e7eb;
        .stat-item {
          background: #ffffff
  padding: 16px;
          text-align: center;
        .stat-value {
          font-size: 24px;
          font-weight: 700;
  color: #1f2937;
          margin-bottom: 4px;
        .stat-label {
          font-size: 12px;
  color: #6b7280;
          font-weight: 500;
        .profile-tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb
  background: #f8fafc;
        .tab-btn {
          background: none;
  border: none;
          padding: 16px 24px
  cursor: pointer;
          font-weight: 500;
  color: #6b7280;
          border-bottom: 3px solid transparent
  transition: all 0.2s ease;
        .tab-btn:hover {
  color: #3b82f6
  background: #f1f5f9;
        .tab-btn.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6
  background: #ffffff;
        .tab-content {
          padding: 24px;
        .form-group {
          margin-bottom: 20px;
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
  color: #374151;
        .form-group input
        .form-group textarea
        .form-group select {
          width: 100%
  padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
  transition: border-color 0.2s ease;
        .form-group input:focus
        .form-group textarea:focus {
  outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        .form-group input.error
        .form-group textarea.error {
          border-color: #ef4444;
        .char-count {
          text-align: right;
          font-size: 12px;
  color: #9ca3af;
          margin-top: 4px;
        .social-inputs {
          display: flex;
          flex-direction: column;
  gap: 8px;
        .tags-input input {
          margin-bottom: 8px;
        .tags-list
        .tags-display {
          display: flex;
          flex-wrap: wrap;
  gap: 6px;
        .tag {
          background: #3b82f6
  color: #ffffff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
  display: flex;
          align-items: center;
  gap: 4px;
        .tags-display .tag {
          background: #e5e7eb
  color: #4b5563;
        .tag-remove {
          background: none;
  border: none;
          color: #ffffff
  cursor: pointer;
          font-size: 14px;
  padding: 0;
          margin: 0;
  width: 16px;
          height: 16px;
          border-radius: 50%
  display: flex;
          align-items: center;
          justify-content: center;
        .tag-remove:hover {
  background: rgba(255, 255, 255, 0.2);
        .detail-section {
          margin-bottom: 24px;
        .detail-section h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
  color: #1f2937;
        .detail-section p {
          margin: 0;
  color: #6b7280;
          line-height: 1.5;
        .links-list {
          display: flex;
          flex-direction: column;
  gap: 8px;
        .link-item {
          color: #3b82f6;
          text-decoration: none;
          font-size: 14px;
  display: flex;
          align-items: center;
  gap: 8px;
        .link-item:hover {
          text-decoration: underline;
        .badges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        .badge-item {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
  padding: 16px;
          display: flex;
  gap: 12px;
        .badge-icon {
          width: 48px;
  height: 48px;
          border-radius: 8px;
        .badge-info h5 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
  color: #1f2937;
        .badge-info p {
          margin: 0 0 4px 0;
          font-size: 12px;
  color: #6b7280;
        .earned-date {
          font-size: 11px;
  color: #9ca3af;
        .achievements-list {
          display: flex;
          flex-direction: column;
  gap: 16px;
        .achievement-item {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
  padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
  gap: 16px;
        .achievement-info h5 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
  color: #1f2937;
        .achievement-info p {
          margin: 0;
          font-size: 12px;
  color: #6b7280;
        .achievement-progress {
          display: flex;
          align-items: center;
  gap: 8px;
          min-width: 120px;
        .progress-bar {
          flex: 1;
  height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
  overflow: hidden;
        .progress-fill {
          height: 100%
  background: #3b82f6;
          transition: width 0.3s ease;
        .progress-text {
          font-size: 12px;
  color: #6b7280;
          font-weight: 500;
          min-width: 32px;
        .preference-item {
          margin-bottom: 16px;
        .preference-label {
          display: flex;
          align-items: center;
  gap: 8px;
          cursor: pointer;
          font-size: 14px;
  color: #374151;
        .empty-text {
          color: #9ca3af;
          font-style: italic;
  margin: 0;
        .error-message {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
        .btn-primary
        .btn-secondary
        .btn-outline {
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 500;
  cursor: pointer;
          transition: all 0.2s ease
  border: 1px solid transparent;
        .btn-primary {
          background: #3b82f6
  color: #ffffff;
        .btn-primary:hover:not(:disabled) {
  background: #2563eb;
        .btn-secondary {
          background: #f3f4f6
  color: #374151;
          border-color: #d1d5db;
        .btn-secondary:hover {
  background: #e5e7eb;
        .btn-outline {
          background: #ffffff
  color: #374151;
          border-color: #d1d5db;
        .btn-outline:hover {
  background: #f9fafb;
        .btn-primary:disabled {
  opacity: 0.5 }
  cursor: not-allowed;
        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            align-items: stretch;
          .header-main {
            flex-direction: column;
            align-items: center;
            text-align: center;
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          .profile-tabs {
            overflow-x: auto;
          .tab-btn {
            white-space: nowrap;
          .badges-grid {
            grid-template-columns: 1fr;
          .achievement-item {
            flex-direction: column;
            align-items: stretch;
      ` });
div >
;
;
;
export default ContributorProfileManager;
