/**
 * Complete Dashboard System Demo
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Demonstrates the full consolidated dashboard architecture with:
 * - Metrics & KPIs with trends
 * - Interactive charts (line, bar, pie)
 * - Advanced data tables
 * - Responsive design
 * - Loading/error states
 */

import React, { useState } from 'react';
import {
  DashboardShell,
  DashboardProvider,
  MetricsGrid,
  MetricCard,
  Chart,
  DataTable,
  LoadingState,
  ErrorState,
  EmptyState,
} from '../packages/ui-kit/src/Dashboard';
import { Users, DollarSign, TrendingUp, ShoppingCart, Eye, Edit, Trash2, Download } from 'lucide-react';

// Sample data for demonstration
const generateMetricsData = () => ({
  totalUsers: {
    current: 24567,
    previous: 23124,
    target: 25000,
    format: 'number' as const,
  },
  revenue: {
    current: 142567.89,
    previous: 134299.12,
    target: 150000,
    format: 'currency' as const,
    precision: 2,
  },
  conversionRate: {
    current: 3.45,
    previous: 3.12,
    target: 4.0,
    format: 'percentage' as const,
    precision: 2,
  },
  averageOrderValue: {
    current: 89.23,
    previous: 92.14,
    target: 95.0,
    format: 'currency' as const,
    precision: 2,
  },
});

const generateChartData = () => ({
  revenue: {
    series: [
      {
        name: 'Revenue',
        data: [
          { label: 'Jan', value: 120000 },
          { label: 'Feb', value: 132000 },
          { label: 'Mar', value: 148000 },
          { label: 'Apr', value: 156000 },
          { label: 'May', value: 142000 },
          { label: 'Jun', value: 167000 },
        ],
      },
    ],
  },
  userGrowth: {
    series: [
      {
        name: 'New Users',
        data: [
          { label: 'Week 1', value: 245 },
          { label: 'Week 2', value: 289 },
          { label: 'Week 3', value: 312 },
          { label: 'Week 4', value: 278 },
        ],
      },
    ],
  },
  trafficSources: {
    series: [
      {
        name: 'Traffic Sources',
        data: [
          { label: 'Direct', value: 45, color: '#3b82f6' },
          { label: 'Search', value: 30, color: '#10b981' },
          { label: 'Social', value: 15, color: '#f59e0b' },
          { label: 'Email', value: 10, color: '#ef4444' },
        ],
      },
    ],
  },
});

const generateTableData = () => [
  {
    id: 1,
    name: 'John Smith',
    email: 'john@example.com',
    status: 'Active',
    joinDate: '2024-01-15',
    orders: 12,
    revenue: 1234.56,
    lastSeen: '2 hours ago',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    status: 'Active',
    joinDate: '2024-02-20',
    orders: 8,
    revenue: 892.34,
    lastSeen: '1 day ago',
  },
  {
    id: 3,
    name: 'Mike Wilson',
    email: 'mike@example.com',
    status: 'Inactive',
    joinDate: '2024-01-03',
    orders: 15,
    revenue: 2156.78,
    lastSeen: '1 week ago',
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily@example.com',
    status: 'Active',
    joinDate: '2024-03-10',
    orders: 5,
    revenue: 567.89,
    lastSeen: '30 minutes ago',
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david@example.com',
    status: 'Pending',
    joinDate: '2024-03-25',
    orders: 2,
    revenue: 234.12,
    lastSeen: '3 days ago',
  },
];

const CompleteDashboardDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');

  const metrics = generateMetricsData();
  const charts = generateChartData();
  const tableData = generateTableData();

  const tabs = [
    { key: 'overview', label: 'Overview', icon: TrendingUp },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'revenue', label: 'Revenue', icon: DollarSign },
    { key: 'orders', label: 'Orders', icon: ShoppingCart },
  ];

  const timeRangeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
  ];

  // Table columns configuration
  const tableColumns = [
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name' as const,
      sortable: true,
      filterable: true,
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email' as const,
      sortable: true,
      filterable: true,
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status' as const,
      render: (status: string) => <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>,
      sortable: true,
      filterable: true,
    },
    {
      key: 'orders',
      title: 'Orders',
      dataIndex: 'orders' as const,
      align: 'right' as const,
      sortable: true,
    },
    {
      key: 'revenue',
      title: 'Revenue',
      dataIndex: 'revenue' as const,
      render: (value: number) => `$${value.toFixed(2)}`,
      align: 'right' as const,
      sortable: true,
    },
    {
      key: 'lastSeen',
      title: 'Last Seen',
      dataIndex: 'lastSeen' as const,
      sortable: true,
    },
  ];

  // Table actions
  const tableActions = [
    {
      key: 'view',
      label: 'View',
      icon: Eye,
      onClick: (record: any) => console.log('View user:', record.name),
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: Edit,
      onClick: (record: any) => console.log('Edit user:', record.name),
      variant: 'primary' as const,
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: (record: any) => console.log('Delete user:', record.name),
      variant: 'danger' as const,
      disabled: (record: any) => record.status === 'Active',
    },
  ];

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handleExport = () => {
    console.log('Exporting dashboard data...');
  };

  const handleTimeRangeChange = (newTimeRange: string) => {
    setTimeRange(newTimeRange);
    handleRefresh();
  };

  if (loading) {
    return (
      <DashboardShell
        title="Analytics Dashboard"
        loading={true}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        <LoadingState />
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell
        title="Analytics Dashboard"
        error={error}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        <ErrorState title="Dashboard Error" message={error} onRetry={() => setError(null)} />
      </DashboardShell>
    );
  }

  return (
    <DashboardProvider>
      <DashboardShell
        title="Analytics Dashboard"
        description="Comprehensive business metrics and insights"
        icon={TrendingUp}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        timeRange={timeRange}
        timeRangeOptions={timeRangeOptions}
        onTimeRangeChange={handleTimeRangeChange}
        onRefresh={handleRefresh}
        onExport={handleExport}
        actions={[
          {
            label: 'Export Data',
            icon: Download,
            onClick: handleExport,
            variant: 'primary',
          },
        ]}
      >
        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <>
              {/* Key Metrics */}
              <section className="dashboard-section">
                <h2 className="section-title">Key Metrics</h2>
                <MetricsGrid columns={4} gap="medium">
                  <MetricCard
                    title="Total Users"
                    value={metrics.totalUsers}
                    icon={Users}
                    trend={{
                      value: 6.2,
                      direction: 'up',
                      period: 'vs last month',
                      isGoodTrend: true,
                    }}
                    variant="success"
                    helpText="Total registered users on the platform"
                  />

                  <MetricCard
                    title="Revenue"
                    value={metrics.revenue}
                    icon={DollarSign}
                    trend={{
                      value: 6.1,
                      direction: 'up',
                      period: 'vs last month',
                      isGoodTrend: true,
                    }}
                    variant="success"
                    badge={{ text: 'Target: 95%', variant: 'success' }}
                  />

                  <MetricCard
                    title="Conversion Rate"
                    value={metrics.conversionRate}
                    icon={TrendingUp}
                    trend={{
                      value: 10.6,
                      direction: 'up',
                      period: 'vs last month',
                      isGoodTrend: true,
                    }}
                    variant="info"
                  />

                  <MetricCard
                    title="Avg Order Value"
                    value={metrics.averageOrderValue}
                    icon={ShoppingCart}
                    trend={{
                      value: 3.2,
                      direction: 'down',
                      period: 'vs last month',
                      isGoodTrend: false,
                    }}
                    variant="warning"
                  />
                </MetricsGrid>
              </section>

              {/* Charts */}
              <section className="dashboard-section">
                <h2 className="section-title">Performance Charts</h2>
                <div className="charts-grid">
                  <div className="chart-card">
                    <Chart
                      type="line"
                      series={charts.revenue.series}
                      title="Revenue Trend"
                      height={300}
                      showLegend={false}
                      valueFormatter={value => `$${(value / 1000).toFixed(0)}K`}
                      xAxisLabel="Month"
                      yAxisLabel="Revenue ($)"
                    />
                  </div>

                  <div className="chart-card">
                    <Chart
                      type="bar"
                      series={charts.userGrowth.series}
                      title="User Growth"
                      height={300}
                      showLegend={false}
                      colorScheme="info"
                      xAxisLabel="Week"
                      yAxisLabel="New Users"
                    />
                  </div>

                  <div className="chart-card">
                    <Chart
                      type="pie"
                      series={charts.trafficSources.series}
                      title="Traffic Sources"
                      height={300}
                      showLegend={true}
                      colorScheme="custom"
                    />
                  </div>
                </div>
              </section>

              {/* Data Table */}
              <section className="dashboard-section">
                <h2 className="section-title">Recent Users</h2>
                <DataTable
                  data={tableData}
                  columns={tableColumns}
                  actions={tableActions}
                  pagination={{
                    pageSize: 5,
                    showSizeChanger: true,
                    showTotal: true,
                  }}
                  rowSelection={{
                    type: 'checkbox',
                    onChange: (keys, rows) => console.log('Selected:', keys, rows),
                  }}
                  searchable={true}
                  exportable={true}
                  exportFileName="users-data"
                  bordered={true}
                  hoverable={true}
                />
              </section>
            </>
          )}

          {activeTab === 'users' && (
            <section className="dashboard-section">
              <h2 className="section-title">User Management</h2>
              <DataTable
                data={tableData}
                columns={tableColumns}
                actions={tableActions}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: true,
                  showQuickJumper: true,
                }}
                searchable={true}
                exportable={true}
                bordered={true}
              />
            </section>
          )}

          {activeTab === 'revenue' && (
            <>
              <section className="dashboard-section">
                <h2 className="section-title">Revenue Analytics</h2>
                <MetricsGrid columns={2} gap="large">
                  <MetricCard
                    title="Total Revenue"
                    value={metrics.revenue}
                    icon={DollarSign}
                    trend={{
                      value: 6.1,
                      direction: 'up',
                      period: 'vs last month',
                    }}
                    variant="success"
                    size="large"
                  />

                  <MetricCard
                    title="Average Order Value"
                    value={metrics.averageOrderValue}
                    icon={ShoppingCart}
                    trend={{
                      value: 3.2,
                      direction: 'down',
                      period: 'vs last month',
                    }}
                    variant="warning"
                    size="large"
                  />
                </MetricsGrid>
              </section>

              <section className="dashboard-section">
                <Chart
                  type="area"
                  series={charts.revenue.series}
                  title="Revenue Over Time"
                  height={400}
                  colorScheme="success"
                  showGrid={true}
                  showAxes={true}
                  valueFormatter={value => `$${(value / 1000).toFixed(0)}K`}
                />
              </section>
            </>
          )}

          {activeTab === 'orders' && (
            <section className="dashboard-section">
              <h2 className="section-title">Order Analytics</h2>
              <EmptyState
                title="No Order Data"
                message="Order analytics will be available once you have sufficient data"
                actionLabel="Import Sample Data"
                onAction={() => console.log('Import sample data')}
              />
            </section>
          )}
        </div>
      </DashboardShell>
    </DashboardProvider>
  );
};

export default CompleteDashboardDemo;
