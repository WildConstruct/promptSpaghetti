import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ArrowLeft } from 'lucide-react';
const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({)
  name: user?.name || '',
  email: user?.email || '',
  displayName: user?.displayName || '',
});
  const handleSave = () => {
    if (updateUser) {
      updateUser({)
  ...user,
        ...formData
      });
    setIsEditing(false);
  };
  const handleCancel = () => {
  setFormData({)
  name: user?.name || '',
  email: user?.email || '',
  displayName: user?.displayName || '',
});
    setIsEditing(false);
  };
  return;
    <div style={{
  padding: '40px',
  maxWidth: '800px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  minHeight: '100vh',
}}>
      <div style={{
  marginBottom: '32px',
  borderBottom: '1px solid #e5e7eb',
  paddingBottom: '16px',
}}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  backgroundColor: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#374151',
  textDecoration: 'none',
}}
          >
            <ArrowLeft size={16} />
            Back to App
          </button>
          <h1 style={{
  fontSize: '24px',
  fontWeight: '700',
  color: '#111827',
  margin: 0,
}}>
            User Profile
          </h1>
        </div>
        <p style={{
  color: '#6b7280',
  fontSize: '14px',
  margin: 0,
}}>
          Manage your account information and preferences
        </p>
      </div>
      <div style={{
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '24px',
}}>
        <div style={{
  display: 'flex',
  alignItems: 'center',
  marginBottom: '24px',
}}>
          <div style={{
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: '#3b82f6',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '600',
  marginRight: '20px',
}}>
            {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 style={{
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 4px 0',
}}>
              {user?.displayName || user?.name || 'User'}
            </h3>
            <p style={{
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 4px 0',
}}>
              {user?.email || 'No email set'}
            </p>
            {user?.role && ()
              <span style={{
  backgroundColor: user.role === 'admin' ? '#dc2626' : '#059669',
  color: '#ffffff',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '500',
}}>
                {user.role}
              </span>
            )}
          </div>
        </div>
        {!isEditing ? ()
          <button
            onClick={() => setIsEditing(true)}
            style={{
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: '500',
}}
          >
            Edit Profile
          </button>
        ) : ()
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
  display: 'block',
  fontSize: '14px',
  fontWeight: '500',
  color: '#374151',
  marginBottom: '4px',
}}>
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                style={{
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
}}
                placeholder="Your display name"
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
  display: 'block',
  fontSize: '14px',
  fontWeight: '500',
  color: '#374151',
  marginBottom: '4px',
}}>
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
}}
                placeholder="Your full name"
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
  display: 'block',
  fontSize: '14px',
  fontWeight: '500',
  color: '#374151',
  marginBottom: '4px',
}}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
}}
                placeholder="your.email@example.com"
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleSave}
                style={{
  backgroundColor: '#059669',
  color: '#ffffff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: '500',
}}
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                style={{
  backgroundColor: '#6b7280',
  color: '#ffffff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: '500',
}}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      <div style={{
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '24px',
}}>
        <h3 style={{
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
  marginBottom: '12px',
}}>
          Account Information
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>Account ID:</span>
            <span style={{ color: '#111827', fontSize: '14px', fontFamily: 'monospace' }}>
              {user?.id || 'N/A'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>Account Created:</span>
            <span style={{ color: '#111827', fontSize: '14px' }}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>Last Login:</span>
            <span style={{ color: '#111827', fontSize: '14px' }}>
              {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;