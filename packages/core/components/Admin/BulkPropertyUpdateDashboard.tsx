/**
 * Bulk Property Update Dashboard - Epic 17
 * 
 * Comprehensive bulk operations interface for updating properties across multiple
 * entities with validation, progress tracking, and rollback capabilities.
 * 
 * Task: E17-1753114396945-40F775 - Implement bulk property updates
 * Epic: 17 - Backstage Admin Controls
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { 
  Settings,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  Package,
  Tag,
  Archive,
  Workflow,
  Globe,
  Target,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Save,
  Upload,
  Activity,
  BarChart3,
  Zap,
  History,
  AlertCircle
} from 'lucide-react';

import {
  bulkPropertyUpdateService,
  BulkUpdateOperation,
  BulkUpdateTarget,
  PropertyUpdate,
  UpdateOperationType,
  TargetType,
  OperationStatus,
  BulkUpdateTemplate,
  BulkUpdateFilter,
  BulkUpdateStats
} from '../../services/BulkPropertyUpdateService';

interface BulkPropertyUpdateDashboardProps {
  className?: string;
  userId?: string;
  userRole?: string;
}

const TARGET_TYPE_CONFIG = {
  user: { color: 'text-blue-600 bg-blue-100', icon: Users },
  content: { color: 'text-green-600 bg-green-100', icon: FileText },
  product: { color: 'text-orange-600 bg-orange-100', icon: Package },
  category: { color: 'text-purple-600 bg-purple-100', icon: Archive },
  tag: { color: 'text-yellow-600 bg-yellow-100', icon: Tag },
  collection: { color: 'text-indigo-600 bg-indigo-100', icon: Archive },
  campaign: { color: 'text-red-600 bg-red-100', icon: Target },
  workflow: { color: 'text-cyan-600 bg-cyan-100', icon: Workflow },
  system_setting: { color: 'text-gray-600 bg-gray-100', icon: Settings },
  custom_entity: { color: 'text-pink-600 bg-pink-100', icon: Globe }
};

const STATUS_CONFIG = {
  draft: { color: 'text-gray-600 bg-gray-100', icon: Edit },
  validating: { color: 'text-yellow-600 bg-yellow-100', icon: Clock },
  validated: { color: 'text-green-600 bg-green-100', icon: CheckCircle },
  executing: { color: 'text-blue-600 bg-blue-100', icon: Play },
  completed: { color: 'text-green-600 bg-green-100', icon: CheckCircle },
  failed: { color: 'text-red-600 bg-red-100', icon: XCircle },
  cancelled: { color: 'text-gray-600 bg-gray-100', icon: XCircle },
  rolling_back: { color: 'text-orange-600 bg-orange-100', icon: RotateCcw },
  rolled_back: { color: 'text-purple-600 bg-purple-100', icon: History }
};

const OPERATION_TYPE_CONFIG = {
  set: { label: 'Set Value', description: 'Set property to a specific value' },
  unset: { label: 'Remove Property', description: 'Remove property from entity' },
  append: { label: 'Append Text', description: 'Add text to end of property' },
  prepend: { label: 'Prepend Text', description: 'Add text to beginning of property' },
  increment: { label: 'Increment Number', description: 'Add to numeric property' },
  decrement: { label: 'Decrement Number', description: 'Subtract from numeric property' },
  multiply: { label: 'Multiply Number', description: 'Multiply numeric property' },
  divide: { label: 'Divide Number', description: 'Divide numeric property' },
  replace: { label: 'Replace Text', description: 'Replace text in property' },
  merge: { label: 'Merge Object', description: 'Merge with object property' },
  push: { label: 'Add to Array', description: 'Add item to array property' },
  pull: { label: 'Remove from Array', description: 'Remove item from array property' },
  toggle: { label: 'Toggle Boolean', description: 'Toggle boolean property' }
};

export const BulkPropertyUpdateDashboard: React.FC<BulkPropertyUpdateDashboardProps> = ({
  className = '',
  userId,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState('operations');
  const [operations, setOperations] = useState<BulkUpdateOperation[]>([]);
  const [templates, setTemplates] = useState<BulkUpdateTemplate[]>([]);
  const [stats, setStats] = useState<BulkUpdateStats | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<BulkUpdateOperation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [filter, setFilter] = useState<BulkUpdateFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OperationStatus | 'all'>('all');
  const [targetTypeFilter, setTargetTypeFilter] = useState<TargetType | 'all'>('all');

  // Create Operation Form
  const [isCreating, setIsCreating] = useState(false);
  const [newOperation, setNewOperation] = useState({
    name: '',
    targetType: 'user' as TargetType,
    targets: [] as BulkUpdateTarget[],
    updates: [] as PropertyUpdate[],
    dryRun: true,
    backupBeforeUpdate: true
  });

  // Load data
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Build filter
      const operationFilter: BulkUpdateFilter = {
        searchQuery: searchQuery || undefined,
        statuses: statusFilter !== 'all' ? [statusFilter] : undefined,
        targetTypes: targetTypeFilter !== 'all' ? [targetTypeFilter] : undefined
      };

      // Load operations
      const operationsList = bulkPropertyUpdateService.getOperations(operationFilter);
      setOperations(operationsList);

      // Load templates
      const templatesList = bulkPropertyUpdateService.getTemplates();
      setTemplates(templatesList);

      // Load stats
      const statsData = bulkPropertyUpdateService.getBulkUpdateStats();
      setStats(statsData);

    } catch (error) {
      console.error('Failed to load bulk update data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteOperation = async (operationId: string) => {
    try {
      await bulkPropertyUpdateService.executeOperation(operationId);
      loadData();
    } catch (error) {
      console.error('Failed to execute operation:', error);
    }
  };

  const handleRollbackOperation = async (operationId: string) => {
    try {
      await bulkPropertyUpdateService.rollbackOperation(operationId);
      loadData();
    } catch (error) {
      console.error('Failed to rollback operation:', error);
    }
  };

  const handleCreateOperation = async () => {
    try {
      const operation = await bulkPropertyUpdateService.createOperation(
        newOperation.name,
        newOperation.targets,
        newOperation.updates,
        {
          execution: {
            dryRun: newOperation.dryRun,
            backupBeforeUpdate: newOperation.backupBeforeUpdate
          }
        },
        userId || 'admin'
      );

      setIsCreating(false);
      setNewOperation({
        name: '',
        targetType: 'user',
        targets: [],
        updates: [],
        dryRun: true,
        backupBeforeUpdate: true
      });

      loadData();
    } catch (error) {
      console.error('Failed to create operation:', error);
    }
  };

  const filteredOperations = useMemo(() => {
    return operations.filter(op => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!op.name.toLowerCase().includes(query) &&
            !op.description?.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      if (statusFilter !== 'all' && op.status !== statusFilter) {
        return false;
      }
      
      if (targetTypeFilter !== 'all' && 
          !op.targets.some(target => target.type === targetTypeFilter)) {
        return false;
      }
      
      return true;
    });
  }, [operations, searchQuery, statusFilter, targetTypeFilter]);

  const renderOperations = () => (
    <div className="operations-section">
      {/* Controls */}
      <div className="operations-controls">
        <div className="search-filters">
          <div className="search-bar">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search operations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as OperationStatus | 'all')}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="validating">Validating</option>
            <option value="validated">Validated</option>
            <option value="executing">Executing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rolling_back">Rolling Back</option>
            <option value="rolled_back">Rolled Back</option>
          </Select>

          <Select
            value={targetTypeFilter}
            onValueChange={(value) => setTargetTypeFilter(value as TargetType | 'all')}
          >
            <option value="all">All Target Types</option>
            <option value="user">Users</option>
            <option value="content">Content</option>
            <option value="product">Products</option>
            <option value="category">Categories</option>
            <option value="tag">Tags</option>
            <option value="collection">Collections</option>
            <option value="campaign">Campaigns</option>
            <option value="workflow">Workflows</option>
            <option value="system_setting">System Settings</option>
            <option value="custom_entity">Custom Entities</option>
          </Select>
        </div>

        <div className="action-buttons">
          <Button onClick={loadData} disabled={isLoading} variant="outline">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Operation
          </Button>
        </div>
      </div>

      {/* Operations List */}
      <div className="operations-list">
        {filteredOperations.map(operation => (
          <OperationCard
            key={operation.id}
            operation={operation}
            onSelect={setSelectedOperation}
            onExecute={handleExecuteOperation}
            onRollback={handleRollbackOperation}
            userRole={userRole}
          />
        ))}
      </div>

      {filteredOperations.length === 0 && (
        <div className="empty-state">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No operations found</h3>
          <p className="text-gray-500">Create a bulk operation to update multiple entities.</p>
        </div>
      )}
    </div>
  );

  const renderTemplates = () => (
    <div className="templates-section">
      <div className="templates-header">
        <h3>Operation Templates</h3>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="templates-grid">
        {templates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onUse={(templateId) => console.log('Use template:', templateId)}
            onEdit={(templateId) => console.log('Edit template:', templateId)}
            onDelete={(templateId) => console.log('Delete template:', templateId)}
          />
        ))}
      </div>

      {templates.length === 0 && (
        <div className="empty-state">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500">Create reusable templates for common bulk operations.</p>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => {
    if (!stats) return <div>Loading analytics...</div>;

    return (
      <div className="analytics-section">
        <div className="analytics-grid">
          <Card>
            <CardContent className="p-6">
              <div className="metric-item">
                <Activity className="w-8 h-8 text-blue-600" />
                <div className="metric-info">
                  <div className="metric-label">Total Operations</div>
                  <div className="metric-value">{stats.totalOperations}</div>
                  <div className="metric-change">All time</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="metric-item">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="metric-info">
                  <div className="metric-label">Success Rate</div>
                  <div className="metric-value">
                    {((stats.completedOperations / Math.max(stats.totalOperations, 1)) * 100).toFixed(1)}%
                  </div>
                  <div className="metric-change positive">
                    {stats.completedOperations} completed
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="metric-item">
                <Target className="w-8 h-8 text-purple-600" />
                <div className="metric-info">
                  <div className="metric-label">Targets Processed</div>
                  <div className="metric-value">{stats.totalTargetsProcessed.toLocaleString()}</div>
                  <div className="metric-change">Across all operations</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="metric-item">
                <Zap className="w-8 h-8 text-yellow-600" />
                <div className="metric-info">
                  <div className="metric-label">Avg Speed</div>
                  <div className="metric-value">
                    {stats.performanceMetrics.averageItemsPerSecond.toFixed(1)}
                  </div>
                  <div className="metric-change">Items per second</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="charts-section">
          <Card>
            <CardHeader>
              <CardTitle>Success Rate by Target Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="success-rate-chart">
                {Object.entries(stats.successRateByType).map(([type, typeStats]) => {
                  const config = TARGET_TYPE_CONFIG[type as TargetType];
                  const Icon = config.icon;
                  
                  return (
                    <div key={type} className="chart-item">
                      <div className="chart-label">
                        <Icon className={`w-4 h-4 ${config.color.split(' ')[0]}`} />
                        <span>{type.replace('_', ' ')}</span>
                      </div>
                      <div className="chart-bar">
                        <div 
                          className={`chart-fill ${config.color.split(' ')[1]}`}
                          style={{ width: `${typeStats.rate}%` }}
                        />
                      </div>
                      <div className="chart-value">
                        {typeStats.rate.toFixed(1)}%
                        <span className="chart-details">
                          ({typeStats.successful}/{typeStats.total})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="errors-list">
                {stats.commonErrors.slice(0, 5).map((error, index) => (
                  <div key={index} className="error-item">
                    <div className="error-info">
                      <div className="error-type">{error.type}</div>
                      <div className="error-message">{error.message}</div>
                    </div>
                    <div className="error-stats">
                      <div className="error-count">{error.count} occurrences</div>
                      <div className="error-targets">{error.affectedTargets} targets</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderCreateOperation = () => (
    <div className="create-operation-modal">
      <div className="modal-overlay" onClick={() => setIsCreating(false)} />
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create Bulk Operation</h2>
          <Button onClick={() => setIsCreating(false)} variant="outline" size="sm">
            ✕
          </Button>
        </div>

        <div className="modal-body">
          <div className="form-section">
            <div className="form-group">
              <label>Operation Name</label>
              <Input
                value={newOperation.name}
                onChange={(e) => setNewOperation(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter operation name..."
              />
            </div>

            <div className="form-group">
              <label>Target Type</label>
              <Select
                value={newOperation.targetType}
                onValueChange={(value) => setNewOperation(prev => ({ ...prev, targetType: value as TargetType }))}
              >
                <option value="user">Users</option>
                <option value="content">Content</option>
                <option value="product">Products</option>
                <option value="category">Categories</option>
                <option value="tag">Tags</option>
                <option value="collection">Collections</option>
                <option value="campaign">Campaigns</option>
                <option value="workflow">Workflows</option>
                <option value="system_setting">System Settings</option>
                <option value="custom_entity">Custom Entities</option>
              </Select>
            </div>

            <div className="form-group">
              <label>Settings</label>
              <div className="form-checkboxes">
                <div className="checkbox-item">
                  <Switch
                    checked={newOperation.dryRun}
                    onCheckedChange={(checked) => setNewOperation(prev => ({ ...prev, dryRun: checked }))}
                  />
                  <span>Dry Run (Preview only)</span>
                </div>
                <div className="checkbox-item">
                  <Switch
                    checked={newOperation.backupBeforeUpdate}
                    onCheckedChange={(checked) => setNewOperation(prev => ({ ...prev, backupBeforeUpdate: checked }))}
                  />
                  <span>Backup before update</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Property Updates</h3>
            <div className="updates-list">
              {newOperation.updates.map((update, index) => (
                <div key={index} className="update-item">
                  <div className="update-fields">
                    <Input
                      placeholder="Property name"
                      value={update.property}
                      onChange={(e) => {
                        const updates = [...newOperation.updates];
                        updates[index] = { ...updates[index], property: e.target.value };
                        setNewOperation(prev => ({ ...prev, updates }));
                      }}
                    />
                    <Select
                      value={update.operation}
                      onValueChange={(value) => {
                        const updates = [...newOperation.updates];
                        updates[index] = { ...updates[index], operation: value as UpdateOperationType };
                        setNewOperation(prev => ({ ...prev, updates }));
                      }}
                    >
                      {Object.entries(OPERATION_TYPE_CONFIG).map(([op, config]) => (
                        <option key={op} value={op}>
                          {config.label}
                        </option>
                      ))}
                    </Select>
                    <Input
                      placeholder="Value"
                      value={update.value || ''}
                      onChange={(e) => {
                        const updates = [...newOperation.updates];
                        updates[index] = { ...updates[index], value: e.target.value };
                        setNewOperation(prev => ({ ...prev, updates }));
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const updates = newOperation.updates.filter((_, i) => i !== index);
                        setNewOperation(prev => ({ ...prev, updates }));
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                onClick={() => {
                  const updates = [...newOperation.updates, {
                    property: '',
                    operation: 'set' as UpdateOperationType,
                    value: ''
                  }];
                  setNewOperation(prev => ({ ...prev, updates }));
                }}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Update
              </Button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button onClick={() => setIsCreating(false)} variant="outline">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateOperation}
            disabled={!newOperation.name || newOperation.updates.length === 0}
          >
            <Save className="w-4 h-4 mr-2" />
            Create Operation
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bulk-update-dashboard ${className}`}>
      <div className="dashboard-header">
        <div className="header-info">
          <h2>Bulk Property Updates</h2>
          <p>Update properties across multiple entities with validation and rollback</p>
        </div>
        
        <div className="header-actions">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="operations">
            Operations
            <Badge className="ml-2 text-xs">{operations.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="tab-content">
          {renderOperations()}
        </TabsContent>

        <TabsContent value="templates" className="tab-content">
          {renderTemplates()}
        </TabsContent>

        <TabsContent value="analytics" className="tab-content">
          {renderAnalytics()}
        </TabsContent>
      </Tabs>

      {/* Operation Detail Modal */}
      {selectedOperation && (
        <OperationDetailModal
          operation={selectedOperation}
          onClose={() => setSelectedOperation(null)}
          onExecute={handleExecuteOperation}
          onRollback={handleRollbackOperation}
          userRole={userRole}
        />
      )}

      {/* Create Operation Modal */}
      {isCreating && renderCreateOperation()}

      <style jsx>{`
        .bulk-update-dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .header-info h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .header-info p {
          color: #6b7280;
          font-size: 1rem;
        }

        .operations-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .search-filters {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .search-bar {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-bar .lucide {
          position: absolute;
          left: 0.75rem;
          z-index: 1;
        }

        .search-input {
          padding-left: 2.25rem;
          min-width: 300px;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .operations-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .templates-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .templates-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .templates-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .analytics-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .metric-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .metric-info {
          flex: 1;
        }

        .metric-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .metric-change {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .metric-change.positive {
          color: #059669;
        }

        .charts-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .success-rate-chart {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .chart-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .chart-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 120px;
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .chart-bar {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .chart-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .chart-value {
          min-width: 80px;
          text-align: right;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .chart-details {
          font-size: 0.75rem;
          color: #6b7280;
          margin-left: 0.25rem;
        }

        .errors-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .error-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }

        .error-type {
          font-weight: 600;
          color: #dc2626;
          margin-bottom: 0.25rem;
        }

        .error-message {
          font-size: 0.875rem;
          color: #374151;
        }

        .error-stats {
          text-align: right;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .error-count {
          font-weight: 500;
          color: #1f2937;
        }

        .create-operation-modal {
          position: fixed;
          inset: 0;
          z-index: 1000;
        }

        .modal-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
        }

        .modal-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 8px;
          width: 90vw;
          max-width: 800px;
          max-height: 80vh;
          overflow: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-section {
          margin-bottom: 1.5rem;
        }

        .form-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .form-checkboxes {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .updates-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .update-item {
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }

        .update-fields {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr auto;
          gap: 0.5rem;
          align-items: center;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #6b7280;
        }

        .empty-state h3 {
          color: #1f2937;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
          }

          .operations-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }

          .search-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .search-input {
            min-width: auto;
          }

          .charts-section {
            grid-template-columns: 1fr;
          }

          .analytics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .templates-grid {
            grid-template-columns: 1fr;
          }

          .update-fields {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .chart-item {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }

          .chart-label {
            min-width: auto;
          }

          .chart-value {
            min-width: auto;
            text-align: left;
          }
        }

        @media (max-width: 480px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

// Operation Card Component (simplified for space)
interface OperationCardProps {
  operation: BulkUpdateOperation;
  onSelect: (operation: BulkUpdateOperation) => void;
  onExecute: (operationId: string) => void;
  onRollback: (operationId: string) => void;
  userRole?: string;
}

const OperationCard: React.FC<OperationCardProps> = ({ 
  operation, 
  onSelect, 
  onExecute, 
  onRollback, 
  userRole 
}) => {
  const statusConfig = STATUS_CONFIG[operation.status];
  const StatusIcon = statusConfig.icon;

  const progressPercentage = operation.progress.total > 0 
    ? (operation.progress.completed / operation.progress.total) * 100 
    : 0;

  const canExecute = userRole === 'admin' && operation.status === 'validated';
  const canRollback = userRole === 'admin' && operation.status === 'completed' && operation.rollback.enabled;

  return (
    <Card className="operation-card">
      <CardContent className="p-4">
        <div className="operation-header">
          <div className="operation-info">
            <div className="operation-name">{operation.name}</div>
            <div className="operation-description">
              {operation.targets.length} targets, {operation.updates.length} updates
            </div>
          </div>
          <Badge className={statusConfig.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {operation.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {operation.status === 'executing' && (
          <div className="operation-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="progress-text">
              {operation.progress.completed} / {operation.progress.total} completed
            </div>
          </div>
        )}

        <div className="operation-actions">
          <Button onClick={() => onSelect(operation)} variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            Details
          </Button>
          
          {canExecute && (
            <Button onClick={() => onExecute(operation.id)} size="sm">
              <Play className="w-4 h-4 mr-1" />
              Execute
            </Button>
          )}
          
          {canRollback && (
            <Button onClick={() => onRollback(operation.id)} size="sm" variant="outline">
              <RotateCcw className="w-4 h-4 mr-1" />
              Rollback
            </Button>
          )}
        </div>
      </CardContent>

      <style jsx>{`
        .operation-card {
          transition: box-shadow 0.2s ease;
        }

        .operation-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .operation-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .operation-description {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .operation-progress {
          margin-bottom: 1rem;
        }

        .progress-bar {
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: #3b82f6;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .operation-actions {
          display: flex;
          gap: 0.5rem;
        }
      `}</style>
    </Card>
  );
};

// Template Card Component (simplified)
interface TemplateCardProps {
  template: BulkUpdateTemplate;
  onUse: (templateId: string) => void;
  onEdit: (templateId: string) => void;
  onDelete: (templateId: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onUse, onEdit, onDelete }) => {
  const typeConfig = TARGET_TYPE_CONFIG[template.targetType];
  const TypeIcon = typeConfig.icon;

  return (
    <Card className="template-card">
      <CardContent className="p-4">
        <div className="template-header">
          <div className="template-info">
            <div className="template-name">{template.name}</div>
            <div className="template-description">{template.description}</div>
          </div>
          <Badge className={typeConfig.color}>
            <TypeIcon className="w-3 h-3 mr-1" />
            {template.targetType}
          </Badge>
        </div>

        <div className="template-stats">
          <div className="stat-item">
            <span className="stat-label">Updates:</span>
            <span className="stat-value">{template.updates.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Used:</span>
            <span className="stat-value">{template.usageCount} times</span>
          </div>
        </div>

        <div className="template-actions">
          <Button onClick={() => onUse(template.id)} size="sm">
            Use Template
          </Button>
          <Button onClick={() => onEdit(template.id)} size="sm" variant="outline">
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button onClick={() => onDelete(template.id)} size="sm" variant="outline">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>

      <style jsx>{`
        .template-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .template-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .template-description {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .template-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
        }

        .stat-item {
          font-size: 0.875rem;
        }

        .stat-label {
          color: #6b7280;
        }

        .stat-value {
          color: #1f2937;
          font-weight: 500;
          margin-left: 0.25rem;
        }

        .template-actions {
          display: flex;
          gap: 0.5rem;
        }
      `}</style>
    </Card>
  );
};

// Operation Detail Modal (simplified)
interface OperationDetailModalProps {
  operation: BulkUpdateOperation;
  onClose: () => void;
  onExecute: (operationId: string) => void;
  onRollback: (operationId: string) => void;
  userRole?: string;
}

const OperationDetailModal: React.FC<OperationDetailModalProps> = ({
  operation,
  onClose,
  onExecute,
  onRollback,
  userRole
}) => {
  const statusConfig = STATUS_CONFIG[operation.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">
            <h2>{operation.name}</h2>
            <Badge className={statusConfig.color}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {operation.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <Button onClick={onClose} variant="outline" size="sm">
            ✕
          </Button>
        </div>

        <div className="modal-body">
          <div className="operation-details">
            <div className="detail-section">
              <h3>Operation Info</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Name:</label>
                  <span>{operation.name}</span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <Badge className={statusConfig.color}>
                    {operation.status}
                  </Badge>
                </div>
                <div className="detail-item">
                  <label>Targets:</label>
                  <span>{operation.targets.length}</span>
                </div>
                <div className="detail-item">
                  <label>Updates:</label>
                  <span>{operation.updates.length}</span>
                </div>
                <div className="detail-item">
                  <label>Created:</label>
                  <span>{operation.createdAt.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Created By:</label>
                  <span>{operation.createdBy}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Progress</h3>
              <div className="progress-details">
                <div className="progress-stats">
                  <div className="progress-stat">
                    <span className="stat-label">Total:</span>
                    <span className="stat-value">{operation.progress.total}</span>
                  </div>
                  <div className="progress-stat">
                    <span className="stat-label">Completed:</span>
                    <span className="stat-value success">{operation.progress.completed}</span>
                  </div>
                  <div className="progress-stat">
                    <span className="stat-label">Failed:</span>
                    <span className="stat-value error">{operation.progress.failed}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
          {userRole === 'admin' && operation.status === 'validated' && (
            <Button onClick={() => { onExecute(operation.id); onClose(); }}>
              Execute Operation
            </Button>
          )}
          {userRole === 'admin' && operation.status === 'completed' && operation.rollback.enabled && (
            <Button onClick={() => { onRollback(operation.id); onClose(); }} variant="outline">
              Rollback Operation
            </Button>
          )}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90vw;
          max-width: 700px;
          max-height: 80vh;
          overflow: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .modal-title h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .operation-details {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .detail-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-item label {
          color: #6b7280;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .detail-item span {
          color: #1f2937;
          font-size: 0.875rem;
        }

        .progress-stats {
          display: flex;
          gap: 1rem;
        }

        .progress-stat {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
        }

        .stat-label {
          color: #6b7280;
        }

        .stat-value {
          font-weight: 600;
        }

        .stat-value.success {
          color: #059669;
        }

        .stat-value.error {
          color: #dc2626;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }

          .modal-content {
            width: 95vw;
            max-height: 90vh;
          }

          .progress-stats {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default BulkPropertyUpdateDashboard;