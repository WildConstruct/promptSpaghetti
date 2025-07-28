/**
 * Template Version History Component  
 * Visual interface for managing template versions and history
 */
import React, { useState, useEffect } from 'react';
import { TemplateVersion, VersionComparisonResult } from '../templates/TemplateVersionManager';
import { ProjectTemplate } from '../templates/ProjectTemplateManager';
import {
  FiClock,
  FiTag,
  FiGitBranch,
  FiDownload,
  FiEye,
  FiCheck,
  FiX,
  FiArrowRight,
  FiMoreVertical,
  FiEdit3,
  FiTrash2,
  FiCopy,
  FiUpload
} from 'react-icons/fi';
interface TemplateVersionHistoryProps {
  template: ProjectTemplate;
  onVersionSelect?: (version: TemplateVersion) => void;
  onVersionCompare?: (fromVersion: string, toVersion: string) => void;
  onVersionRestore?: (version: TemplateVersion) => void;
  onVersionExport?: (version: TemplateVersion) => void;
  className?: string;
}
interface VersionNode {
  version: TemplateVersion;
  level: number;
  isLast: boolean;
  hasBranches: boolean;
}

export const TemplateVersionHistory: React.FC<TemplateVersionHistoryProps> = ({ _____templateId, onVersionSelect }) => {
  const [selectedVersions, setSelectedVersions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'tree' | 'table'>('timeline');
  const [_____filterBranch, _____setFilterBranch] = useState<string>('all');
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<VersionComparisonResult | null>(null);
  useEffect(() => {
    loadVersionHistory();
  }, [template.id]);
  const loadVersionHistory = async () => {
    setLoading(true);
    try {
      // Mock version history - in real implementation, would call TemplateVersionManager
      const mockVersions: TemplateVersion[] = [
        {
          id: 'v-1',
          template_id: template.id,
          version_number: '2.1.0',
          title: 'Major UI improvements',
          description: 'Added new node types and improved user interface',
          changelog: '- Added ConditionalNode\n- Improved styling\n- Bug fixes',
          branch_name: 'main',
          commit_hash: 'abc123',
          api_version: '2.0.0',
          compatibility_level: 'minor',
          migration_required: false,
          created_by: 'user-1',
          created_at: '2024-01-15T10:30:00Z',
          published_at: '2024-01-15T11:00:00Z',
          status: 'published',
          visibility: 'public',
          download_count: 142,
          usage_count: 89,
          rating: 4.7,
          dependencies: [],
          conflicts: [],
          template_data: template,
        },
        {
          id: 'v-2',
          template_id: template.id,
          version_number: '2.0.0',
          title: 'Major refactor',
          description: 'Complete rewrite with new architecture',
          changelog: '- Breaking changes\n- New API\n- Performance improvements',
          branch_name: 'main',
          commit_hash: 'def456',
          api_version: '2.0.0',
          compatibility_level: 'major',
          migration_required: true,
          created_by: 'user-1',
          created_at: '2024-01-10T14:20:00Z',
          published_at: '2024-01-10T15:00:00Z',
          status: 'published',
          visibility: 'public',
          download_count: 89,
          usage_count: 156,
          rating: 4.5,
          dependencies: [],
          conflicts: [],
          template_data: template,
        },
        {
          id: 'v-3',
          template_id: template.id,
          version_number: '1.9.1',
          title: 'Hotfix release',
          description: 'Critical bug fixes',
          changelog: '- Fixed memory leak\n- Improved error handling',
          branch_name: 'hotfix-1.9.1',
          commit_hash: 'ghi789',
          api_version: '1.9.0',
          compatibility_level: 'patch',
          migration_required: false,
          created_by: 'user-2',
          created_at: '2024-01-08T09:15:00Z',
          published_at: '2024-01-08T09:30:00Z',
          status: 'published',
          visibility: 'public',
          download_count: 67,
          usage_count: 234,
          rating: 4.3,
          dependencies: [],
          conflicts: [],
          template_data: template,
        }
      ];
      setVersions(mockVersions);
    } catch (error) {
      console.error('Failed to load version history:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleVersionSelect = (version: TemplateVersion, isMultiSelect: boolean) => {
    if (isMultiSelect) {
      const newSelection = new Set(selectedVersions);
      if (newSelection.has(version.id)) {
        newSelection.delete(version.id);
      } else {
        newSelection.add(version.id);
      }
      setSelectedVersions(newSelection);
    } else {
      setSelectedVersions(new Set([version.id]));
      onVersionSelect?.(version);
    }
  };
  const handleCompareVersions = async () => {
    const selectedArray = Array.from(selectedVersions);
    if (selectedArray.length !== 2) {
      alert('Please select exactly 2 versions to compare');
      return;
    }
    setLoading(true);
    try {
      // Mock comparison - in real implementation, would call TemplateVersionManager
      const mockComparison: VersionComparisonResult = {
        from_version: versions.find(v => v.id === selectedArray[0])!,
        to_version: versions.find(v => v.id === selectedArray[1])!,
        diff: {,
          metadata_changes: [,
            { field: 'name', old_value: 'Old Name', new_value: 'New Name', change_type: 'modified' }
          ],
          variable_changes: [,
            { variable_id: 'var-1', change_type: 'added', new_variable: { id: 'var-1', name: 'new_var' } as any }
          ],
          customization_changes: [],
          graph_changes: {,
            nodes_added: 2,
            nodes_removed: 1,
            nodes_modified: 3,
            edges_added: 1,
            edges_removed: 0,
            edges_modified: 2,
          }
        },
        compatibility: {,
          breaking_changes: false,
          api_changes: true,
          schema_changes: false,
          dependency_changes: true,
        },
        migration_required: false,
        migration_complexity: 'simple',
        estimated_migration_time: 5,
      };
      setComparisonResult(mockComparison);
      setShowComparison(true);
    } catch (error) {
      console.error('Failed to compare versions:', error);
    } finally {
      setLoading(false);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
    case 'published': return 'text-green-600 bg-green-100';
    case 'draft': return 'text-yellow-600 bg-yellow-100';
    case 'deprecated': return 'text-red-600 bg-red-100';
    case 'archived': return 'text-gray-600 bg-gray-100';
    default: return 'text-gray-600 bg-gray-100';
    }
  };
  const getCompatibilityColor = (level: string) => {
    switch (level) {
    case 'patch': return 'text-green-600';
    case 'minor': return 'text-yellow-600';
    case 'major': return 'text-red-600';
    default: return 'text-gray-600';
    }
  };
  const renderTimelineView = () => (;)
    <div className="space-y-4">
      {versions.map((version, index) => ()
        <div
          key={version.id}
          className={`relative flex items-start space-x-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
            selectedVersions.has(version.id)
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
          onClick={(e) => handleVersionSelect(version, e.metaKey || e.ctrlKey)}
        >
          {/* Timeline connector */}
          {index < versions.length - 1 && ()
            <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-300" />
          )}
          {/* Version indicator */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            version.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
          }`}>
            <FiTag className="w-4 h-4" />
          </div>
          {/* Version info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  v{version.version_number}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(version.status)}`}>}
                  {version.status}
                </span>
                <span className={`text-sm font-medium ${getCompatibilityColor(version.compatibility_level)}`}>}
                  {version.compatibility_level}
                </span>
                {version.migration_required && ()
                  <span className="px-2 py-1 text-xs font-medium text-orange-600 bg-orange-100 rounded-full">
                    Migration Required
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onVersionExport?.(version);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Export version"
                >
                  <FiDownload className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onVersionRestore?.(version);
                  }}
                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                  title="Restore version"
                >
                  <FiUpload className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  <FiMoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
            {version.title && ()
              <h4 className="text-sm font-medium text-gray-700 mt-1">
                {version.title}
              </h4>
            )}
            {version.description && ()
              <p className="text-sm text-gray-600 mt-1">
                {version.description}
              </p>
            )}
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center">
                <FiClock className="w-3 h-3 mr-1" />
                {new Date(version.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <FiGitBranch className="w-3 h-3 mr-1" />
                {version.branch_name}
              </span>
              <span>
                {version.download_count} downloads
              </span>
              <span>
                {version.usage_count} uses
              </span>
              <span className="flex items-center">
                ⭐ {version.rating.toFixed(1)}
              </span>
            </div>
            {version.changelog && ()
              <details className="mt-2">
                <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-700">
                  View changelog
                </summary>
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700 whitespace-pre-line">
                  {version.changelog}
                </div>
              </details>
            )}
          </div>
        </div>
      ))}
    </div>
  );
  const renderTableView = () => (;)
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedVersions(new Set(versions.map(v => v.id)));
                  } else {
                    setSelectedVersions(new Set());
                  }
                }}
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Version
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Branch
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usage
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {versions.map((version) => ()
            <tr
              key={version.id}
              className={`hover:bg-gray-50 cursor-pointer ${
                selectedVersions.has(version.id) ? 'bg-blue-50' : ''
              }`}
              onClick={(e) => handleVersionSelect(version, e.metaKey || e.ctrlKey)}
            >
              <td className="px-3 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedVersions.has(version.id)}
                  onChange={() => {}}
                  className="rounded border-gray-300"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">
                    v{version.version_number}
                  </span>
                  <span className={`ml-2 text-xs font-medium ${getCompatibilityColor(version.compatibility_level)}`}>}
                    {version.compatibility_level}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{version.title || '-'}</div>
                <div className="text-sm text-gray-500 truncate max-w-xs">
                  {version.description || '-'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="flex items-center text-sm text-gray-900">
                  <FiGitBranch className="w-3 h-3 mr-1" />
                  {version.branch_name}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(version.status)}`}>}
                  {version.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(version.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>{version.download_count} DL</div>
                <div>{version.usage_count} uses</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onVersionExport?.(version);
                    }}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <FiDownload className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onVersionRestore?.(version);
                    }}
                    className="text-gray-400 hover:text-green-600 transition-colors"
                  >
                    <FiUpload className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  const renderComparisonModal = () => {
    if (!showComparison || !comparisonResult) return null;
    return ()
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Version Comparison</h2>
              <button
                onClick={() => setShowComparison(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  From: v{comparisonResult.from_version.version_number}
                </h3>
                <p className="text-sm text-gray-600">{comparisonResult.from_version.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(comparisonResult.from_version.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  To: v{comparisonResult.to_version.version_number}
                </h3>
                <p className="text-sm text-gray-600">{comparisonResult.to_version.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(comparisonResult.to_version.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Compatibility</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    {comparisonResult.compatibility.breaking_changes ? 
                      <FiX className="w-4 h-4 text-red-500 mr-2" /> :
                      <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                    }
                    <span>Breaking changes</span>
                  </div>
                  <div className="flex items-center">
                    {comparisonResult.compatibility.api_changes ? 
                      <FiX className="w-4 h-4 text-yellow-500 mr-2" /> :
                      <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                    }
                    <span>API changes</span>
                  </div>
                  <div className="flex items-center">
                    {comparisonResult.compatibility.schema_changes ? 
                      <FiX className="w-4 h-4 text-yellow-500 mr-2" /> :
                      <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                    }
                    <span>Schema changes</span>
                  </div>
                  <div className="flex items-center">
                    {comparisonResult.compatibility.dependency_changes ? 
                      <FiX className="w-4 h-4 text-yellow-500 mr-2" /> :
                      <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                    }
                    <span>Dependency changes</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Changes Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-700">Graph Changes</div>
                    <div className="text-green-600">+{comparisonResult.diff.graph_changes.nodes_added} nodes</div>
                    <div className="text-red-600">-{comparisonResult.diff.graph_changes.nodes_removed} nodes</div>
                    <div className="text-yellow-600">~{comparisonResult.diff.graph_changes.nodes_modified} modified</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Variables</div>
                    <div>{comparisonResult.diff.variable_changes.length} changes</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Metadata</div>
                    <div>{comparisonResult.diff.metadata_changes.length} changes</div>
                  </div>
                </div>
              </div>
              {comparisonResult.migration_required && ()
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Migration Required</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Complexity: <span className="font-medium">{comparisonResult.migration_complexity}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Estimated time: {comparisonResult.estimated_migration_time} minutes
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <button
                onClick={() => setShowComparison(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  return ()
    <div className={`template-version-history ${className}`}>}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Version History</h2>
        <div className="flex items-center space-x-4">
          {/* View mode selector */}
          <div className="flex rounded-lg border border-gray-300">
            {['timeline', 'table'].map((mode) => ()
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-1 text-sm font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          {/* Actions */}
          {selectedVersions.size > 0 && ()
            <div className="flex items-center space-x-2">
              {selectedVersions.size === 2 && ()
                <button
                  onClick={handleCompareVersions}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={loading}
                >
                  <FiEye className="w-4 h-4" />
                  <span>Compare</span>
                </button>
              )}
              <span className="text-sm text-gray-600">
                {selectedVersions.size} selected
              </span>
            </div>
          )}
        </div>
      </div>
      {loading ? ()
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : ()
        <>
          {viewMode === 'timeline' ? renderTimelineView() : renderTableView()}
          {renderComparisonModal()}
        </>
      )}
    </div>
  );
};