import React, { useState, useEffect } from 'react';
import { 
  ExportShare, 
  ShareAccessLevel
} from '../../types/export';
import { 
  FiShare2, 
  FiCopy, 
  FiEye, 
  FiEdit, 
  FiTrash2, 
  FiClock,
  FiDownload,
  FiLock,
  FiGlobe,
  FiUsers,
  FiRefreshCw,
  FiAlertCircle,
  FiCheck
} from 'react-icons/fi';
interface ShareManagerProps {
  projectId: string;
  className?: string;
  interface ShareStats {
  totalShares: number;,
  activeShares: number;
  totalDownloads: number;,
  totalAccesses: number;
  export const ShareManager: React.FC<ShareManagerProps> = ({,)
  projectId,
  className = ''
}) => {
  const [shares, setShares] = useState<ExportShare>([]);
  const [stats, setStats] = useState<ShareStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [_____selectedShare, setSelectedShare] = useState<ExportShare | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  useEffect(() => {
    fetchShares();
    fetchStats();
  }, [projectId]);
  const fetchShares = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/export/shares?project_id=${projectId}`);}
      if (!response.ok) {
        throw new Error('Failed to fetch shares');
      const data = await response.json();
      setShares(data.data || []);
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load shares');
} finally {
      setLoading(false);
  };
  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/export/shares/stats?project_id=${projectId}`);}
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
    } catch (err) {
  console.error('Failed to fetch share stats:', err);
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
  const handleDeactivateShare = async (shareId: string) => {
    try {
      const response = await fetch(`/api/export/shares/${shareId}`, {)}
  },
  method: 'PATCH',
        headers: {,
  'Content-Type': 'application/json',
},
  body: JSON.stringify({ is_active: false })
      });
      if (!response.ok) {
        throw new Error('Failed to deactivate share');
      await fetchShares();
      await fetchStats();
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to deactivate share');
};
  const handleDeleteShare = async (shareId: string) => {
    try {
      const response = await fetch(`/api/export/shares/${shareId}`, {)}
  },
  method: 'DELETE';
  });
      if (!response.ok) {
        throw new Error('Failed to delete share');
      await fetchShares();
      await fetchStats();
      setShowDeleteConfirm(null);
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to delete share');
};
  const getAccessLevelIcon = (accessLevel: ShareAccessLevel) => {
  switch (accessLevel) {
  case 'public':,
  return <FiGlobe className="w-4 h-4 text-green-600" />;
  case 'password_protected':,
  return <FiLock className="w-4 h-4 text-orange-600" />;
  case 'private':,
  return <FiEye className="w-4 h-4 text-red-600" />;
  default:,
  return <FiShare2 className="w-4 h-4 text-gray-600" />;
};
  const getAccessLevelColor = (accessLevel: ShareAccessLevel) => {
  switch (accessLevel) {
  case 'public':,
  return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
  case 'password_protected':,
  return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
  case 'private':,
  return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';,
  default:,
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
};
  const isShareExpired = (share: ExportShare) => {
    if (!share.expires_at) return false;
    return new Date(share.expires_at) < new Date();
  };
  const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {)
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
  };
  const getShareUrl = (share: ExportShare) => {
    return share.share_url || `${window.location.origin}/shared/${share.share_token}`;}
  };
  return;
    <div className={`share-manager ${className}`}>}
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Share Management
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Manage shared exports and access
          </p>
        </div>
        <button
          onClick={fetchShares}
          disabled={loading}
          className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          <span>Refresh</span>
        </button>
      </div>
      {/* Stats Cards */}
      {stats && ()
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <FiShare2 className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Shares</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {stats.totalShares}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <FiCheck className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Active</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {stats.activeShares}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <FiDownload className="w-5 h-5 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Downloads</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {stats.totalDownloads}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <FiUsers className="w-5 h-5 text-orange-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Access</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {stats.totalAccesses}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {error && ()
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <FiAlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}
      {copyFeedback && ()
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <FiCheck className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800 dark:text-green-200">{copyFeedback}</p>
          </div>
        </div>
      )}
      {/* Shares List */}
      {loading ? ()
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : shares.length === 0 ? ()
        <div className="text-center py-12">
          <FiShare2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No shares found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Create some shared exports to see them here
          </p>
        </div>
      ) : ()
        <div className="space-y-4">
          {shares.map((share) => {
            const expired = isShareExpired(share);
            return;
              <div
                key={share.id}
                className={`bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-4 ${
  expired ? 'opacity-60' : '',
} ${}
                  !share.is_active ? 'border-red-200 dark:border-red-800' : 'border-gray-200 dark:border-gray-700';
  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getAccessLevelIcon(share.access_level)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccessLevelColor(share.access_level)}`}>}
                        {share.access_level.replace('_', ' ').toUpperCase()}
                      </span>
                      {expired && ()
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                          EXPIRED
                        </span>
                      )}
                      {!share.is_active && ()
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                          INACTIVE
                        </span>
                      )}
                    </div>
                    {share.description && ()
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {share.description}
                      </p>
                    )}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <code className="text-sm text-gray-600 dark:text-gray-300 break-all">
                          {getShareUrl(share)}
                        </code>
                        <button
                          onClick={() => handleCopyLink(getShareUrl(share))}
                          className="ml-2 p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          title="Copy link"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Created:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatDate(share.created_at)}
                        </p>
                      </div>
                      {share.expires_at && ()
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                          <p className={`font-medium ${expired ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>}
                            {formatDate(share.expires_at)}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Downloads:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {share.download_count}
                          {share.max_downloads && ` / ${share.max_downloads}`}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Access Count:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {share.access_count}
                        </p>
                      </div>
                    </div>
                    {share.last_accessed_at && ()
                      <div className="mt-3 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Last accessed:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {formatDate(share.last_accessed_at)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedShare(share)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit share"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    {share.is_active && !expired && ()
                      <button
                        onClick={() => handleDeactivateShare(share.id)}
                        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                        title="Deactivate share"
                      >
                        <FiClock className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setShowDeleteConfirm(share.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete share"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && ()
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FiAlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Share
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this share? This action cannot be undone and the share link will become invalid immediately.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteShare(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareManager;