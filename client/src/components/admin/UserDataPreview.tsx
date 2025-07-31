/**
 * User Data Preview Component
 * 
 * Epic 17 - Admin Dashboard Framework
 * Task: E17-1753114396801-A60F16 - Create user preview
 * 
 * Provides comprehensive preview of user data before retention/deletion operations.
 * Shows data categories, volume estimates, affected systems, and retention controls.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, Database, Shield, FileText,
  Download, Trash2, Archive, AlertTriangle, CheckCircle,
  ChevronDown, ChevronRight, Search, RefreshCw
} from 'lucide-react';

// Types for user data preview
}
interface UserDataCategory {
  category: string;,
  displayName: string;
  itemCount: number;,
  dataVolume: number;
  dataSensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  retentionPeriod?: number;
  items: UserDataItem;,
  affectedSystems: string;
  interface UserDataItem {
  id: string;,
  type: string;
  description: string;,
  createdAt: string;
  lastModified: string;,
  dataSize: number;
  systemSource: string;,
  hasPersonalData: boolean;
  interface RetentionPolicy {
  id: string;,
  name: string;
  description: string;,
  retentionPeriodDays: number;
  applicableCategories: string;,
  complianceFramework: string;
  interface UserDataPreviewProps {
  userId: string;,
  userName: string;
  onRetentionAction?: (action: 'delete' | 'archive' | 'export', categories: string) => void;
  const UserDataPreview: React.FC<UserDataPreviewProps> = ({ ),
  userId,
  userName,
  onRetentionAction
}
}) => {
  const [dataCategories, setDataCategories] = useState<UserDataCategory>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sensitivityFilter, setSensitivityFilter] = useState<string>('ALL');
  const [showRetentionActions, setShowRetentionActions] = useState(false);
  // Mock data for demonstration - wrapped in useMemo to prevent recreation
  const mockDataCategories: UserDataCategory = useMemo(() => [
  {
  category: 'profile_data',
  displayName: 'Profile Information',
  itemCount: 15,
  dataVolume: 2048,
  dataSensitivity: 'HIGH',
  retentionPeriod: 2555, // 7 years,
  affectedSystems: ['user_service', 'auth_service'],
  items: [,
  {
  id: 'profile_1',
  type: 'Personal Info',
  description: 'Name, email, phone number',
  createdAt: '2022-01-15T00:00:00Z',
  lastModified: '2024-03-15T00:00:00Z',
  dataSize: 512,
  systemSource: 'user_service',
  hasPersonalData: true,
}
        {
  id: 'profile_2',
  type: 'Employment Data',
  description: 'Job title, department, manager',
  createdAt: '2022-01-15T00:00:00Z',
  lastModified: '2024-01-10T00:00:00Z',
  dataSize: 256,
  systemSource: 'hr_system',
  hasPersonalData: true];
  }
    {
  category: 'activity_logs',
  displayName: 'Activity & Access Logs',
  itemCount: 1247,
  dataVolume: 15360,
  dataSensitivity: 'MEDIUM',
  retentionPeriod: 365,
  affectedSystems: ['audit_service', 'analytics_service'],
  items: [,
  {
  id: 'log_1',
  type: 'Login Events',
  description: '834 login/logout events',
  createdAt: '2022-01-15T00:00:00Z',
  lastModified: '2024-07-22T00:00:00Z',
  dataSize: 8192,
  systemSource: 'audit_service',
  hasPersonalData: false,
}
        {
  id: 'log_2',
  type: 'System Access',
  description: '413 system access events',
  createdAt: '2022-01-15T00:00:00Z',
  lastModified: '2024-07-21T00:00:00Z',
  dataSize: 7168,
  systemSource: 'analytics_service',
  hasPersonalData: false];
  }
    {
  category: 'content_data',
  displayName: 'Created Content',
  itemCount: 89,
  dataVolume: 45056,
  dataSensitivity: 'MEDIUM',
  retentionPeriod: 1095, // 3 years,
  affectedSystems: ['content_service', 'graph_service'],
  items: [,
  {
  id: 'content_1',
  type: 'Prompt Graphs',
  description: '52 prompt generation graphs',
  createdAt: '2022-02-01T00:00:00Z',
  lastModified: '2024-07-20T00:00:00Z',
  dataSize: 32768,
  systemSource: 'graph_service',
  hasPersonalData: false,
}
        {
  id: 'content_2',
  type: 'Generated Content',
  description: '37 generated text outputs',
  createdAt: '2022-02-15T00:00:00Z',
  lastModified: '2024-07-19T00:00:00Z',
  dataSize: 12288,
  systemSource: 'content_service',
  hasPersonalData: false];
  }
    {
  category: 'communication_data',
  displayName: 'Communications',
  itemCount: 23,
  dataVolume: 3072,
  dataSensitivity: 'HIGH',
  retentionPeriod: 1825, // 5 years,
  affectedSystems: ['notification_service', 'support_service'],
  items: [,
  {
  id: 'comm_1',
  type: 'Email Communications',
  description: '18 system notification emails',
  createdAt: '2022-01-15T00:00:00Z',
  lastModified: '2024-07-15T00:00:00Z',
  dataSize: 2048,
  systemSource: 'notification_service',
  hasPersonalData: true,
}
        {
  id: 'comm_2',
  type: 'Support Tickets',
  description: '5 support interactions',
  createdAt: '2022-03-10T00:00:00Z',
  lastModified: '2024-06-30T00:00:00Z',
  dataSize: 1024,
  systemSource: 'support_service',
  hasPersonalData: true],
  ], []); // Empty dependency array since this is static mock data
  const mockRetentionPolicies: RetentionPolicy = useMemo(() => [
  {
  id: 'policy_1',
  name: 'Standard User Data Retention',
  description: 'Standard retention for user profile and activity data',
  retentionPeriodDays: 2555, // 7 years,
  applicableCategories: ['profile_data', 'communication_data'],
  complianceFramework: 'GDPR',
}
    {
  id: 'policy_2',
  name: 'Activity Log Retention',
  description: 'Short-term retention for system activity logs',
  retentionPeriodDays: 365, // 1 year,
  applicableCategories: ['activity_logs'],
  complianceFramework: 'SOX',
}
    {
  id: 'policy_3',
  name: 'Content Retention Policy',
  description: 'Medium-term retention for user-generated content',
  retentionPeriodDays: 1095, // 3 years,
  applicableCategories: ['content_data'],
  complianceFramework: 'Internal'], []); // Empty dependency array since this is static mock data
  useEffect(() => {
  // Simulate loading user data
  setLoading(true);
  setTimeout(() => {
  setDataCategories(mockDataCategories);
  setRetentionPolicies(mockRetentionPolicies);
  setLoading(false);
}, 1000);
  }, [userId, mockDataCategories, mockRetentionPolicies]);
  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => {)
  const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      return newSet;
    });
  };
  const toggleCategorySelection = (category: string) => {
    setSelectedCategories(prev => {)
  const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      return newSet;
    });
  };
  const selectAllCategories = () => {
    setSelectedCategories(new Set(dataCategories.map(cat => cat.category)));
  };
  const clearAllSelections = () => {
    setSelectedCategories(new Set());
  };
  const formatDataSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;}
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;}
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;}
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;}
  };
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString();
  };
  const getSensitivityColor = (sensitivity: string): string => {
  switch (sensitivity) {
  case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
  case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
  case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
  default: return 'text-gray-600 bg-gray-50 border-gray-200';
};
  const handleRetentionAction = (action: 'delete' | 'archive' | 'export') => {
    if (selectedCategories.size === 0) {
      alert('Please select at least one data category.');
      return;
    const selectedCategoryArray = Array.from(selectedCategories);
    onRetentionAction?.(action, selectedCategoryArray);
  };
  const filteredCategories = dataCategories.filter(category => {)
  const matchesSearch = category.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||;
                         category.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSensitivity = sensitivityFilter === 'ALL' || category.dataSensitivity === sensitivityFilter;
    return matchesSearch && matchesSensitivity;
  });
  const totalSelectedItems = Array.from(selectedCategories).reduce((sum, categoryId) => {
    const category = dataCategories.find(cat => cat.category === categoryId);
    return sum + (category?.itemCount || 0);
  }, 0);
  const totalSelectedVolume = Array.from(selectedCategories).reduce((sum, categoryId) => {
    const category = dataCategories.find(cat => cat.category === categoryId);
    return sum + (category?.dataVolume || 0);
  }, 0);
  if (loading) {
    return;
      <div className="p-6 text-center">
        <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
        <p>Loading user data preview...</p>
      </div>
    );
  return;
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <User className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">User Data Preview</h1>
              <p className="text-gray-600">Data retention preview for {userName} (ID: {userId})</p>
            </div>
          </div>
          <button
            onClick={() => setShowRetentionActions(!showRetentionActions)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Retention Actions
          </button>
        </div>
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-700">Total Categories</span>
            </div>
            <p className="text-2xl font-semibold text-blue-900 mt-1">{dataCategories.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700">Total Items</span>
            </div>
            <p className="text-2xl font-semibold text-green-900 mt-1">
              {dataCategories.reduce((sum, cat) => sum + cat.itemCount, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Archive className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-purple-700">Total Volume</span>
            </div>
            <p className="text-2xl font-semibold text-purple-900 mt-1">
              {formatDataSize(dataCategories.reduce((sum, cat) => sum + cat.dataVolume, 0))}
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-orange-700">Selected Items</span>
            </div>
            <p className="text-2xl font-semibold text-orange-900 mt-1">{totalSelectedItems.toLocaleString()}</p>
          </div>
        </div>
      </div>
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={sensitivityFilter}
              onChange={(e) => setSensitivityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Sensitivity Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={selectAllCategories}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={clearAllSelections}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
      {/* Data Categories */}
      <div className="space-y-4">
        {filteredCategories.map((category) => ()
          <div key={category.category} className="bg-white rounded-lg shadow-sm border">
            {/* Category Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(category.category)}
                    onChange={() => toggleCategorySelection(category.category)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <button
                    onClick={() => toggleCategoryExpansion(category.category)}
                    className="flex items-center space-x-2 text-left"
                  >
                    {expandedCategories.has(category.category) ? ()
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : ()
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                    <h3 className="text-lg font-medium text-gray-900">{category.displayName}</h3>
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSensitivityColor(category.dataSensitivity)}`}>}
                    {category.dataSensitivity}
                  </span>
                  <span className="text-sm text-gray-500">
                    {category.itemCount.toLocaleString()} items
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDataSize(category.dataVolume)}
                  </span>
                </div>
              </div>
              {/* Category Summary */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Affected Systems:</span>
                  <div className="mt-1">
                    {category.affectedSystems.map((system) => ()
                      <span key={system} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1">
                        {system}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Retention Period:</span>
                  <p className="text-gray-900 font-medium">
                    {category.retentionPeriod ? `${category.retentionPeriod} days` : 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Data Volume:</span>
                  <p className="text-gray-900 font-medium">{formatDataSize(category.dataVolume)}</p>
                </div>
              </div>
            </div>
            {/* Expanded Category Details */}
            {expandedCategories.has(category.category) && ()
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Data Items</h4>
                <div className="space-y-3">
                  {category.items.map((item) => ()
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-medium text-gray-900">{item.type}</h5>
                          {item.hasPersonalData && ()
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                              Personal Data
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                          <span>Created: {formatDate(item.createdAt)}</span>
                          <span>Modified: {formatDate(item.lastModified)}</span>
                          <span>Source: {item.systemSource}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatDataSize(item.dataSize)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Retention Actions Panel */}
      {showRetentionActions && ()
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Retention Actions</h3>
          {selectedCategories.size > 0 ? ()
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Selection Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Categories:</span>
                    <p className="font-medium text-blue-900">{selectedCategories.size}</p>
                  </div>
                  <div>
                    <span className="text-blue-700">Items:</span>
                    <p className="font-medium text-blue-900">{totalSelectedItems.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-blue-700">Volume:</span>
                    <p className="font-medium text-blue-900">{formatDataSize(totalSelectedVolume)}</p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleRetentionAction('export')}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </button>
                <button
                  onClick={() => handleRetentionAction('archive')}
                  className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Archive Data
                </button>
                <button
                  onClick={() => handleRetentionAction('delete')}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Data
                </button>
              </div>
            </div>
          ) : ()
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
              <p className="text-gray-600">Select one or more data categories to perform retention actions.</p>
            </div>
          )}
        </div>
      )}
      {/* Applicable Retention Policies */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Applicable Retention Policies</h3>
        <div className="space-y-3">
          {retentionPolicies.map((policy) => ()
            <div key={policy.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{policy.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">Retention Period</span>
                  <p className="font-medium text-gray-900">{policy.retentionPeriodDays} days</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Framework:</span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                    {policy.complianceFramework}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Applies to: {policy.applicableCategories.join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDataPreview;