/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

import React, { useState } from 'react';
import { User } from '../../types/auth';


interface UserProfileProps {
  user: User;
  onUpdateProfile?: (updates: Partial<User>) => void;
  onDeleteAccount?: () => void;
  readOnly?: boolean;
  export const UserProfile: React.FC<UserProfileProps> = ({),
  user,
  onUpdateProfile,
  onDeleteAccount,
  readOnly = false


}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({)
  name: user.name || '',
  email: user.email || '',
  bio: user.bio || '',
});
  const handleSave = () => {
    onUpdateProfile?.(formData);
    setIsEditing(false);
  };
  const handleCancel = () => {
  setFormData({)
  name: user.name || '',
  email: user.email || '',
  bio: user.bio || '',
});
    setIsEditing(false);
  };
  return;
    <div className="user-profile">
      <div className="profile-header">
        <h2>User Profile</h2>
        {!readOnly && !isEditing && ()
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        )}
      </div>
      <div className="profile-content">
        {isEditing ? ()
          <div className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
              />
            </div>
            <div className="form-actions">
              <button onClick={handleSave} className="save-btn">Save</button>
              <button onClick={handleCancel} className="cancel-btn">Cancel</button>
            </div>
          </div>
        ) : ()
          <div className="profile-display">
            <div className="profile-field">
              <label>Name:</label>
              <span>{user.name || 'Not provided'}</span>
            </div>
            <div className="profile-field">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            <div className="profile-field">
              <label>Bio:</label>
              <span>{user.bio || 'No bio provided'}</span>
            </div>
            <div className="profile-field">
              <label>Account Created:</label>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="profile-field">
              <label>Last Login:</label>
              <span>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}</span>
            </div>
          </div>
        )}
      </div>
      {!readOnly && !isEditing && ()
        <div className="profile-actions">
          <button 
            onClick={onDeleteAccount}
            className="delete-account-btn"
            style={{ color: 'red', marginTop: '20px' }}
          >
            Delete Account
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;