import React, { useState } from 'react';
import { 
  ExportJob, 
  ExportShare, 
  CreateExportShare, 
  ShareAccessLevel 
} from '../../types/export';
import { 
  FiShare2, 
  FiX, 
  FiCopy, 
  FiEye, 
  FiLock, 
  FiClock, 
  FiUsers,
  FiCheck,
  FiAlertCircle,
  FiGlobe
} from 'react-icons/fi';
interface ShareDialogProps {
  exportJob: ExportJob;
  onClose: () => void;
  onShareCreated: (share: ExportShare) => void;
  className?: string;
  const ACCESS_LEVELS: Array<{,
  value: ShareAccessLevel;
  label: string;
  description: string;
  icon: React.ComponentType;
}> = [
  {
  value: 'public',
  label: 'Public',
  description: 'Anyone with the link can access',
  icon: FiGlobe,
}
  {
  value: 'password_protected',
  label: 'Password Protected',
  description: 'Requires password to access',
  icon: FiLock,
}
  {
    value: 'private',
    label: 'Private',
    description: 'Only you can access',
    icon: FiEye];
const EXPIRATION_OPTIONS = [;
  { value: null, label: 'Never expires' },
  { value: 1, label: '1 day' },
  { value: 7, label: '1 week' },
  { value: 30, label: '1 month' },
  { value: 90, label: '3 months' }
];

export const ShareDialog: React.FC<ShareDialogProps> = ({)
  exportJob,
  onClose,
  onShareCreated,
  className = ''
}) => {
  const [shareData, setShareData] = useState<Partial<CreateExportShare>>({)
  export_job_id: exportJob.id,
  access_level: 'public',
  password: '',
  max_downloads: null,
  expires_in_days: null,
  description: '',
  allow_download: true,
  allow_preview: true,
  track_access: true,
  notify_on_access: false,
});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdShare, setCreatedShare] = useState<ExportShare | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  try {
  // Validate required fields
  if (shareData.access_level === 'password_protected' && !shareData.password) {
  throw new Error('Password is required for password-protected shares');
  // Calculate expiration date if specified
  let expires_at: string | undefined;
  if (shareData.expires_in_days) {
  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + shareData.expires_in_days);
  expires_at = expireDate.toISOString();
  const sharePayload: CreateExportShare = {,
  ...shareData,
  expires_at,
  export_job_id: exportJob.id,
} as CreateExportShare;
      const response = await fetch('/api/export/shares', {)
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
},
  body: JSON.stringify(sharePayload);
  });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create share');
      const result = await response.json();
      const newShare = result.data;
      setCreatedShare(newShare);
      onShareCreated(newShare);
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to create share');
} finally {
      setLoading(false);
  };
  const handleCopyLink = async (shareUrl: string) => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyFeedback('Link copied to clipboard!');
      setTimeout(() => setCopyFeedback(null), 3000);
    } catch (err) {
      setCopyFeedback('Failed to copy link');
      setTimeout(() => setCopyFeedback(null), 3000);
  };
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };
  const getShareUrl = (share: ExportShare) => {
    return `${window.location.origin}/shared/${share.share_token}`;}
  };
  if (createdShare) {
    return;
      <div className={`share-dialog success-state ${className}`}>}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <FiCheck className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Share Created Successfully
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <FiShare2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                Your export is now shared
              </h4>
              <div className="bg-white dark:bg-gray-800 rounded border p-3 mb-3">
                <div className="flex items-center justify-between">
                  <code className="text-sm text-gray-600 dark:text-gray-300 break-all">
                    {getShareUrl(createdShare)}
                  </code>
                  <button
                    onClick={() => handleCopyLink(getShareUrl(createdShare))}
                    className="ml-2 p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    title="Copy link"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {copyFeedback && ()
                <p className="text-sm text-green-700 dark:text-green-300">{copyFeedback}</p>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Access Level:</span>
              <p className="font-medium text-gray-900 dark:text-white capitalize">
                {createdShare.access_level.replace('_', ' ')}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">File Size:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {exportJob.output_file_size ? formatFileSize(exportJob.output_file_size) : 'Unknown'}
              </p>
            </div>
            {createdShare.expires_at && ()
              <div>
                <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(createdShare.expires_at).toLocaleDateString()}
                </p>
              </div>
            )}
            {createdShare.max_downloads && ()
              <div>
                <span className="text-gray-600 dark:text-gray-400">Max Downloads:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {createdShare.max_downloads}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  return;
    <div className={`share-dialog ${className}`}>}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FiShare2 className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Share Export
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <FiX className="w-6 h-6" />
        </button>
      </div>
      {/* Export Info */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {exportJob.export_format.toUpperCase()} Export
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {exportJob.export_type.replace('_', ' ')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
            <p className="font-medium text-green-600 capitalize">{exportJob.status}</p>
          </div>
        </div>
        {exportJob.output_file_size && ()
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            File size: {formatFileSize(exportJob.output_file_size)}
          </p>
        )}
      </div>
      {error && ()
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <FiAlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Access Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Access Level
          </label>
          <div className="grid grid-cols-1 gap-3">
            {ACCESS_LEVELS.map((level) => {
              const Icon = level.icon;
              return;
                <label
                  key={level.value}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
  shareData.access_level === level.value
  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800',
}`}
                >
                  <input
                    type="radio"
                    name="access_level"
                    value={level.value}
                    checked={shareData.access_level === level.value}
                    onChange={(e) => setShareData(prev => ({)
  ...prev,
  access_level: e.target.value as ShareAccessLevel,
}))}
                    className="sr-only"
                  />
                  <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {level.label}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {level.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
        {/* Password Field */}
        {shareData.access_level === 'password_protected' && ()
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={shareData.password}
              onChange={(e) => setShareData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter password for access"
              required
            />
          </div>
        )}
        {/* Expiration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Link Expiration
          </label>
          <select
            value={shareData.expires_in_days || ''}
            onChange={(e) => setShareData(prev => ({)
  ...prev,
  expires_in_days: e.target.value ? parseInt(e.target.value) : null,
}))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {EXPIRATION_OPTIONS.map((option) => ()
              <option key={option.value} value={option.value || ''}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {/* Download Limits */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Maximum Downloads
          </label>
          <select
            value={shareData.max_downloads || ''}
            onChange={(e) => setShareData(prev => ({)
  ...prev,
  max_downloads: e.target.value ? parseInt(e.target.value) : null,
}))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Unlimited</option>
            <option value="1">1 download</option>
            <option value="5">5 downloads</option>
            <option value="10">10 downloads</option>
            <option value="25">25 downloads</option>
            <option value="100">100 downloads</option>
          </select>
        </div>
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={shareData.description}
            onChange={(e) => setShareData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={3}
            placeholder="Add a description for this shared export..."
          />
        </div>
        {/* Options */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={shareData.track_access}
              onChange={(e) => setShareData(prev => ({ ...prev, track_access: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Track access and download statistics
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={shareData.notify_on_access}
              onChange={(e) => setShareData(prev => ({ ...prev, notify_on_access: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Notify me when someone accesses this share
            </span>
          </label>
        </div>
        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Share...' : 'Create Share Link'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShareDialog;