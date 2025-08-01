/**
 * Selective Restore Widget - Epic 17.4.6
 * 
 * Admin interface for selective backup restoration with granular control over
 * tables, schemas, and data filtering. Integrates with existing RestoreFunctionalityService
 * to provide user-friendly selective restore operations.
 * 
 * Task: E17-1753114397287-A42A86 - Implement selective restore
 * Epic: 17 - Backstage Admin Controls
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Form, Select, Input, Alert, Tabs, Progress, Table, Tag, Space } from 'antd';
import { 
  DatabaseOutlined,
  FilterOutlined,
  HistoryOutlined,
  PlayCircleOutlined,
  StopOutlined,
  ReloadOutlined
 from '@ant-design/icons';
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

// =============================================================================
// Type Definitions
// =============================================================================


interface RecoveryPoint {
  id: string;,
  backup_type: 'scheduled' | 'transaction' | 'manual' | 'compliance' | 'incident',
  recovery_point_timestamp: string;,
  backup_size_bytes: number,
  included_tables: string;,
  excluded_tables: string,
  recovery_context: {
  description: string;,
  triggered_by: string;

  retention_},
  class: string;

};
  validation_status: 'not_validated' | 'valid' | 'corrupted' | 'partially_valid';,
  storage_info: {
  storage_provider: string;,
  location: string,
  encryption_status: string;
};


interface RestoreRequest {
  recovery_point_id: string;,
  operation_type: 'selective_restore',
  restore_scope: 'full_database' | 'table_level' | 'record_level' | 'schema_only' | 'data_only';,
  restore_strategy: 'replace' | 'merge' | 'append' | 'compare_first' | 'backup_first';
  target_database?: string,
  table_filters: {
  include_tables: string;,
  exclude_tables: string,
  where_conditions: Record<string, string>;
  limit_records?: number;


};
  validation_level: 'none' | 'basic' | 'full' | 'business_rules' | 'compliance';,
  notification_config: {
  on_completion: boolean;,
  on_error: boolean,
  notification_channels: string;
};


interface RestoreProgress {
  request_id: string;,
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled',
  progress_percentage: number;,
  current_operation: string,
  tables_processed: number;,
  total_tables: number,
  records_restored: number;,
  conflicts_resolved: number,
  started_at: string;
  estimated_completion?: string,
  errors: Array<{,
  table: string;,
  error_type: string,
  message: string;,
  severity: 'error' | 'warning';


>;


interface SelectiveRestoreWidgetProps {
  onRestoreComplete?: (requestId: string) => void;

  onError?: (error: string) => void;}


  // =============================================================================
  // Main Component
  // =============================================================================
  export const SelectiveRestoreWidget: React.FC<SelectiveRestoreWidgetProps> = ({
  onRestoreComplete,
  onError

}) => {
  // State Management
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('configure');
  const [recoveryPoints, setRecoveryPoints] = useState<RecoveryPoint[]>([]);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [activeRestores, setActiveRestores] = useState<RestoreProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<unknown>(null);
  const loadRecoveryPoints = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/backup/recovery-points?limit=50');
      const data = await response.json();
      if (data.success) {
        setRecoveryPoints(data.data);
 else {
        onError?.(data.error || 'Failed to load recovery points');
 catch {
      onError?.('Failed to load recovery points');
 finally {
      setLoading(false);
  }, [onError]);
  const loadAvailableTables = useCallback(async (recoveryPointId: string) => {
    try {
      const response = await fetch(`/api/admin/backup/recovery-points/${recoveryPointId}/tables`);}
      const data = await response.json();
      if (data.success) {
        setAvailableTables(data.tables);
 catch (error) {
  console.error('Failed to load available tables:', error);
}, []);
  const loadActiveRestores = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/backup/restore/active');
      const data = await response.json();
      if (data.success) {
        setActiveRestores(data.data);
 catch (error) {
  console.error('Failed to load active restores:', error);
}, []);
  // Load initial data
  useEffect(() => {
    loadRecoveryPoints();
    loadActiveRestores();
  }, [loadRecoveryPoints, loadActiveRestores]);
  // =============================================================================
  // Restore Configuration Handlers
  // =============================================================================
  const handleRecoveryPointChange = useCallback((recoveryPointId: string) => {
  const point = recoveryPoints.find(p => p.id === recoveryPointId);
  if (point) {
  loadAvailableTables(recoveryPointId);
  // Auto-populate table filters from recovery point
  form.setFieldsValue({
  'table_filters.include_tables': point.included_tables,
  'table_filters.exclude_tables': point.excluded_tables
});
  }, [recoveryPoints, form, loadAvailableTables]);
  const generateRestorePreview = async () => {
    try {
      setLoading(true);
      const values = form.getFieldsValue();
      const response = await fetch('/api/admin/backup/restore/preview', {
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
  recovery_point_id: values.recovery_point_id,
          table_filters: values.table_filters || {},
          restore_scope: values.restore_scope;

      });
      const data = await response.json();
      if (data.success) {
        setPreviewData(data.preview);
        setActiveTab('preview');
 else {
        onError?.(data.error || 'Failed to generate preview');
 catch {
      onError?.('Failed to generate preview');
 finally {
      setLoading(false);
  };
  const executeSelectiveRestore = async () => {
    try {
      setLoading(true);
      const values = form.getFieldsValue();
      const restoreConfig: RestoreRequest = {,
  recovery_point_id: values.recovery_point_id,
        operation_type: 'selective_restore',
        restore_scope: values.restore_scope || 'table_level',
        restore_strategy: values.restore_strategy || 'backup_first',
        target_database: values.target_database,
        table_filters: {
  include_tables: values.table_filters?.include_tables || [],
          exclude_tables: values.table_filters?.exclude_tables || [],
          where_conditions: values.table_filters?.where_conditions || {},
          limit_records: values.table_filters?.limit_records;
  },
  validation_level: values.validation_level || 'business_rules',
        notification_config: {
  on_completion: values.notification_config?.on_completion ?? true,
  on_error: values.notification_config?.on_error ?? true,
  notification_channels: values.notification_config?.notification_channels || ['email']
};
      const response = await fetch('/api/admin/backup/restore/execute', {
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restoreConfig);
  });
      const data = await response.json();
      if (data.success) {
        setActiveTab('monitor');
        loadActiveRestores();
        form.resetFields();
        onRestoreComplete?.(data.request_id);
 else {
        onError?.(data.error || 'Failed to start restore');
 catch {
      onError?.('Failed to start restore operation');
 finally {
      setLoading(false);
  };
  // =============================================================================
  // Progress Monitoring
  // =============================================================================
  const cancelRestore = async (requestId: string) => {
    try {
      await fetch(`/api/admin/backup/restore/${requestId}/cancel`, { method: 'POST' });}
      loadActiveRestores();
 catch (error) {
  console.error('Failed to cancel restore:', error);
};
  const getRestoreStatusColor = (status: string) => {
  switch (status) {
  case 'completed': return 'green';
  case 'failed': return 'red';
  case 'in_progress': return 'blue';
  case 'cancelled': return 'orange',
  default: return 'default';
};
  // =============================================================================
  // Render Functions
  // =============================================================================
  const renderConfigurationTab = () => (;);
    <Card title="Selective Restore Configuration" extra={<DatabaseOutlined />}>
      <Form form={form} layout="vertical" onFinish={executeSelectiveRestore}>
        {/* Recovery Point Selection */}
        <Form.Item
          name="recovery_point_id"
          label="Recovery Point"
          rules={[{ required: true, message: 'Please select a recovery point' }]}
        >
          <Select
            placeholder="Select recovery point"
            loading={loading}
            onChange={handleRecoveryPointChange}
            showSearch
            optionFilterProp="children"
          >
            {recoveryPoints.map(point => (
              <Option key={point.id} value={point.id}>
                <Space>
                  <Tag color={point.validation_status === 'valid' ? 'green' : 'orange'}>
                    {point.backup_type}
                  </Tag>
                  {new Date(point.recovery_point_timestamp).toLocaleString()}
                  <span style={{ color: '#8c8c8c' }}>
                    ({Math.round(point.backup_size_bytes / 1024 / 1024)}MB)
                  </span>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>
        {/* Restore Scope */}
        <Form.Item
          name="restore_scope"
          label="Restore Scope"
          initialValue="table_level"
        >
          <Select>
            <Option value="full_database">Full Database</Option>
            <Option value="table_level">Table Level</Option>
            <Option value="record_level">Record Level</Option>
            <Option value="schema_only">Schema Only</Option>
            <Option value="data_only">Data Only</Option>
          </Select>
        </Form.Item>
        {/* Restore Strategy */}
        <Form.Item
          name="restore_strategy"
          label="Restore Strategy"
          initialValue="backup_first"
        >
          <Select>
            <Option value="backup_first">Backup First (Safest)</Option>
            <Option value="replace">Replace Existing</Option>
            <Option value="merge">Merge Data</Option>
            <Option value="append">Append Data</Option>
            <Option value="compare_first">Compare First</Option>
          </Select>
        </Form.Item>
        {/* Table Filters */}
        <Card size="small" title="Table Filters" style={{ marginBottom: 16 }}>
          <Form.Item name={['table_filters', 'include_tables']} label="Include Tables">
            <Select
              mode="multiple"
              placeholder="Select tables to include (empty = all tables)"
              options={availableTables.map(table => ({ label: table, value: table }))}
            />
          </Form.Item>
          <Form.Item name={['table_filters', 'exclude_tables']} label="Exclude Tables">
            <Select
              mode="multiple"
              placeholder="Select tables to exclude"
              options={availableTables.map(table => ({ label: table, value: table }))}
            />
          </Form.Item>
          <Form.Item name={['table_filters', 'limit_records']} label="Record Limit (per table)">
            <Input type="number" placeholder="Leave empty for no limit" />
          </Form.Item>
          <Form.Item name={['table_filters', 'where_conditions']} label="WHERE Conditions (JSON)">
            <TextArea 
              rows={3} 
              placeholder='{"users": "created_at > \\"2024-01-01\\"", "orders": "status = \\"active\\""}'
            />
          </Form.Item>
        </Card>
        {/* Validation Level */}
        <Form.Item
          name="validation_level"
          label="Validation Level"
          initialValue="business_rules"
        >
          <Select>
            <Option value="none">None (Fastest)</Option>
            <Option value="basic">Basic</Option>
            <Option value="full">Full</Option>
            <Option value="business_rules">Business Rules</Option>
            <Option value="compliance">Compliance (Strictest)</Option>
          </Select>
        </Form.Item>
        {/* Target Database */}
        <Form.Item name="target_database" label="Target Database (Optional)">
          <Input placeholder="Leave empty to restore to original database" />
        </Form.Item>
        {/* Actions */}
        <Form.Item>
          <Space>
            <Button 
              icon={<FilterOutlined />} 
              onClick={generateRestorePreview}
              loading={loading}
            >
              Generate Preview
            </Button>
            <Button 
              type="primary"
              icon={<PlayCircleOutlined />}
              htmlType="submit"
              loading={loading}
            >
              Start Selective Restore
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
  const renderPreviewTab = () => (;);
    <Card title="Restore Preview" extra={<FilterOutlined />}>
      {previewData ? ()
        <div>
          <Alert
            message="Restore Preview Generated"
            description={`This restore will affect ${previewData.affected_tables?.length || 0} tables with approximately ${previewData.estimated_records || 0} records.`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Table
            dataSource={previewData.affected_tables || []}
            columns={[
              { title: 'Table', dataIndex: 'table_name', key: 'table_name' },
              { title: 'Estimated Records', dataIndex: 'estimated_records', key: 'estimated_records' },
              { title: 'Size (MB)', dataIndex: 'size_mb', key: 'size_mb' },
              { 
                title: 'Conflicts', 
                dataIndex: 'potential_conflicts', 
                key: 'conflicts',
                render: (conflicts: number) => conflicts > 0 ? <Tag color="orange">{conflicts}</Tag> : <Tag color="green">None</Tag>
            ]}
            pagination={false}
            size="small"
          />
          {previewData.warnings && previewData.warnings.length > 0 && ()
            <Alert
              message="Preview Warnings"
              description={
                <ul>
                  {previewData.warnings.map((warning: string, idx: number) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button type="primary" onClick={() => setActiveTab('configure')}>
              Back to Configuration
            </Button>
          </div>
        </div>
      ) : ()
        <div style={{ textAlign: 'center', padding: 32 }}>
          <p>No preview generated yet. Go to the Configuration tab to generate a preview.</p>
        </div>
      )}
    </Card>
  );
  const renderMonitoringTab = () => (;);
    <Card title="Active Restore Operations" extra={<HistoryOutlined />}>
      {activeRestores.length === 0 ? ()
        <div style={{ textAlign: 'center', padding: 32 }}>
          <p>No active restore operations.</p>
        </div>
      ) : ()
        <div>
          {activeRestores.map(restore => (
            <Card 
              key={restore.request_id} 
              size="small" 
              style={{ marginBottom: 16 }}
              title={
                <Space>
                  <span>Restore {restore.request_id.substring(0, 8)}...</span>
                  <Tag color={getRestoreStatusColor(restore.status)}>
                    {restore.status.toUpperCase()}
                  </Tag>
                </Space>
              extra={
                restore.status === 'in_progress' && ()
                  <Button 
                    size="small" 
                    icon={<StopOutlined />}
                    onClick={() => cancelRestore(restore.request_id)}
                  >
                    Cancel
                  </Button>
            >
              <div>
                <Progress 
                  percent={restore.progress_percentage} 
                  status={restore.status === 'failed' ? 'exception' : 'normal'}
                />
                <div style={{ marginTop: 8 }}>
                  <Space split={<span>•</span>}>
                    <span><strong>Current:</strong> {restore.current_operation}</span>
                    <span><strong>Tables:</strong> {restore.tables_processed}/{restore.total_tables}</span>
                    <span><strong>Records:</strong> {restore.records_restored.toLocaleString()}</span>
                    {restore.conflicts_resolved > 0 && ()
                      <span><strong>Conflicts:</strong> {restore.conflicts_resolved}</span>
                    )}
                  </Space>
                </div>
                {restore.estimated_completion && ()
                  <div style={{ marginTop: 4, color: '#8c8c8c' }}>
                    <strong>ETA:</strong> {new Date(restore.estimated_completion).toLocaleString()}
                  </div>
                )}
                {restore.errors && restore.errors.length > 0 && ()
                  <div style={{ marginTop: 8 }}>
                    <Alert
                      message={`${restore.errors.length} Issues Found`}
                      description={
                        <ul style={{ margin: 0, paddingLeft: 16 }}>
                          {restore.errors.slice(0, 3).map((error, idx) => (
                            <li key={idx}>
                              <strong>{error.table}:</strong> {error.message}
                            </li>
                          ))}
                          {restore.errors.length > 3 && ()
                            <li>... and {restore.errors.length - 3} more</li>
                          )}
                        </ul>
                      type={restore.errors.some(e => e.severity === 'error') ? 'error' : 'warning'}
                      showIcon
                    />
                  </div>
                )}
              </div>
            </Card>
          ))}
          <div style={{ textAlign: 'right' }}>
            <Button icon={<ReloadOutlined />} onClick={loadActiveRestores}>
              Refresh
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
  // =============================================================================
  // Main Render
  // =============================================================================
  return;
    <div className="selective-restore-widget">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Configure" key="configure">
          {renderConfigurationTab()}
        </TabPane>
        <TabPane tab="Preview" key="preview">
          {renderPreviewTab()}
        </TabPane>
        <TabPane tab="Monitor" key="monitor">
          {renderMonitoringTab()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SelectiveRestoreWidget;