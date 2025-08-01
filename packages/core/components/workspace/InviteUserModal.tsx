/**
 * Epic 9.2.1 - Invite User Modal Component
 * Modal for inviting users to workspaces
 */
import React, { useState } from 'react';


interface InviteUserModalProps { workspaceId: string;
  workspaceName: string }
},
  onSubmit: (data: { userId: string; role: string }) => void;
  onCancel: () => void;
const ROLES = [
  { value: 'admin', label: 'Admin', description: 'Full workspace access and management' },
  { value: 'editor', label: 'Editor', description: 'Can create and edit projects and resources' },
  { value: 'commenter', label: 'Commenter', description: 'Can view content and add comments' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access to content' }
];

export const InviteUserModal: React.FC<InviteUserModalProps> = ({ )
  workspaceId
  workspaceName
  onSubmit }
  onCancel
}) => { const [formData, setFormData] = useState({)
  userId: ''
  role: 'editor' }
});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.userId.trim()) { newErrors.userId = 'User ID or email is required' } else if (formData.userId.length < 3) { newErrors.userId = 'User ID must be at least 3 characters';
    if (!formData.role) {
      newErrors.role = 'Role selection is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault();
  if (!validateForm()) {
  return;
  setIsSubmitting(true);
  try {
  await onSubmit({)
  userId: formData.userId.trim(),
  role: formData.role }
});
 catch (error) { console.error('Failed to invite user:', error) } finally { setIsSubmitting(false) };
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
  };
  const selectedRole = ROLES.find(role => role.value === formData.role);
  return;
    <div className="modal-overlay">
      <div className="modal modal--medium">
        <div className="modal__header">
          <h2>Invite User to Workspace</h2>
          <button
            className="modal__close"
            onClick={onCancel}
            type="button"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal__content">
          <div className="invite-modal__workspace-info">
            <h3>Inviting to: {workspaceName}</h3>
            <p>The user will receive a notification and can start collaborating immediately.</p>
          </div>
          <div className="form-group">
            <label htmlFor="user-id" className="form-label">
              User ID or Email *
            </label>
            <input
              id="user-id"
              type="text"
              value={formData.userId}
              onChange={(e) => handleChange('userId', e.target.value)}
              className={`form-input ${errors.userId ? 'form-input--error' : ''}`}
              placeholder="Enter user ID or email address"
              disabled={isSubmitting}
            />
            {errors.userId && ()
              <div className="form-error">{errors.userId}</div>
            )}
            <div className="form-hint">
              Enter the user's ID or email address to send them an invitation
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">
              Role *
            </label>
            <div className="role-selection">
              {ROLES.map(role => ()
                <label
                  key={role.value}
                  className={`role-option ${formData.role === role.value ? 'role-option--selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={(e) => handleChange('role', e.target.value)}
                    disabled={isSubmitting}
                  />
                  <div className="role-option__content">
                    <div className="role-option__name">{role.label}</div>
                    <div className="role-option__description">{role.description}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.role && ()
              <div className="form-error">{errors.role}</div>
            )}
          </div>
          {selectedRole && ()
            <div className="invite-preview">
              <h3>Permission Summary</h3>
              <div className="permission-summary">
                <div className="permission-summary__role">
                  <strong>{selectedRole.label}</strong>
                </div>
                <div className="permission-summary__description">
                  {selectedRole.description}
                </div>
                <div className="permission-summary__details">
                  <h4>This role will be able to:</h4>
                  <ul>
                    {formData.role === 'admin' && ()
                      <>
                        <li>Manage workspace settings and members</li>
                        <li>Create, edit, and delete projects</li>
                        <li>Invite and remove users</li>
                        <li>Access all workspace content</li>
                      </>
                    )}
                    {formData.role === 'editor' && ()
                      <>
                        <li>Create and edit projects and resources</li>
                        <li>Comment on content</li>
                        <li>View workspace activity</li>
                      </>
                    )}
                    {formData.role === 'commenter' && ()
                      <>
                        <li>View all workspace content</li>
                        <li>Add comments and discussions</li>
                        <li>View workspace activity</li>
                      </>
                    )}
                    {formData.role === 'viewer' && ()
                      <>
                        <li>View all workspace content</li>
                        <li>View workspace activity</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </form>
        <div className="modal__footer">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.userId.trim()}
          >
            {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteUserModal;