/**
 * Status Controls Component - Epic 17
 * 
 * Comprehensive status management interface for system operations,
 * user states, process monitoring, and administrative controls.
 * 
 * Task: E17-1753114397016-18BAC3 - Implement status controls
 * Epic: 17 - Backstage Admin Controls
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  Power,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Settings,
  Users,
  Database,
  Server,
  Wifi,
  HardDrive,
  Cpu,
  Memory,
  Zap,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Ban,
  UserCheck,
  UserX,
  Pause,
  Play,
  RotateCcw
} from 'lucide-react';

// Status Types
export type SystemStatus = 'operational' | 'degraded' | 'down' | 'maintenance';
export type ServiceStatus = 'running' | 'stopped' | 'error' | 'starting' | 'stopping';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'locked' | 'pending';
export type ProcessStatus = 'running' | 'idle' | 'busy' | 'error' | 'stopped';

export interface SystemService {
  id: string;
  name: string;
  displayName: string;
  description: string;
  status: ServiceStatus;
  health: number; // 0-100
  uptime: number; // milliseconds
  lastRestart: Date;
  autoRestart: boolean;
  dependencies: string[];
  port?: number;
  url?: string;
  logs: ServiceLog[];
  metrics: ServiceMetrics;
}

export interface ServiceLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  service: string;
  details?: Record<string, any>;
}

export interface ServiceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  requestCount: number;
  errorRate: number;
  responseTime: number;
  throughput: number;
}

export interface SystemOverview {
  overallStatus: SystemStatus;
  totalServices: number;
  runningServices: number;
  erroredServices: number;
  systemLoad: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  uptime: number;
  activeUsers: number;
  backgroundJobs: number;
}

export interface StatusControlsProps {
  className?: string;
  adminLevel?: 'admin' | 'super_admin' | 'system';
  onServiceAction?: (serviceId: string, action: string) => void;
  onSystemAction?: (action: string) => void;
}
const SERVICE_STATUS_CONFIG = {
  running: { ,
    color: 'text-green-600 bg-green-100', 
    icon: CheckCircle, 
    actions: ['stop', 'restart', 'pause'] 
  },
  stopped: { ,
    color: 'text-gray-600 bg-gray-100', 
    icon: StopCircle, 
    actions: ['start'] ,
  },
  error: { ,
    color: 'text-red-600 bg-red-100', 
    icon: XCircle, 
    actions: ['restart', 'stop'] 
  },
  starting: { ,
    color: 'text-yellow-600 bg-yellow-100', 
    icon: PlayCircle, 
    actions: [] ,
  },
  stopping: { ,
    color: 'text-orange-600 bg-orange-100', 
    icon: PauseCircle, 
    actions: [] ,
  }
};
const SYSTEM_STATUS_CONFIG = {
  operational: { color: 'text-green-600 bg-green-100', icon: CheckCircle },
  degraded: { color: 'text-yellow-600 bg-yellow-100', icon: AlertTriangle },
  down: { color: 'text-red-600 bg-red-100', icon: XCircle },
  maintenance: { color: 'text-blue-600 bg-blue-100', icon: Settings }
};

export const StatusControls: React.FC<StatusControlsProps> = ({)
  className = '',
  adminLevel = 'admin',
  onServiceAction,
  onSystemAction
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [services, setServices] = useState<SystemService[]>([]);
  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
  const [selectedService, setSelectedService] = useState<SystemService | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [_____refreshInterval, setRefreshInterval] = useState<number | null>(null);
  // Mock data - in real implementation, this would come from system APIs
  useEffect(() => {
    loadSystemData();
    // Set up auto-refresh
    const interval = setInterval(loadSystemData, 5000);
    setRefreshInterval(interval as any);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);
  const loadSystemData = async () => {
    try {
      setIsLoading(true);
      // Mock system overview
      const overview: SystemOverview = {
        overallStatus: 'operational',
        totalServices: 8,
        runningServices: 7,
        erroredServices: 1,
        systemLoad: 0.65,
        memoryUsage: 0.72,
        diskUsage: 0.45,
        networkLatency: 23,
        uptime: 7 * 24 * 60 * 60 * 1000, // 7 days
        activeUsers: 142,
        backgroundJobs: 3,
      };
      setSystemOverview(overview);
      // Mock services
      const mockServices: SystemService[] = [
        {
          id: 'web-server',
          name: 'nginx',
          displayName: 'Web Server',
          description: 'Primary web server handling HTTP requests',
          status: 'running',
          health: 98,
          uptime: 6 * 24 * 60 * 60 * 1000,
          lastRestart: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          autoRestart: true,
          dependencies: [],
          port: 80,
          url: 'http://localhost',
          logs: [],
          metrics: {,
            cpuUsage: 5.2,
            memoryUsage: 128,
            requestCount: 1250,
            errorRate: 0.02,
            responseTime: 45,
            throughput: 850,
          }
        },
        {
          id: 'api-server',
          name: 'fastify',
          displayName: 'API Server',
          description: 'Backend API server for application logic',
          status: 'running',
          health: 95,
          uptime: 5 * 24 * 60 * 60 * 1000,
          lastRestart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          autoRestart: true,
          dependencies: ['database', 'redis'],
          port: 8000,
          url: 'http://localhost:8000',
          logs: [],
          metrics: {,
            cpuUsage: 12.8,
            memoryUsage: 256,
            requestCount: 2840,
            errorRate: 0.05,
            responseTime: 125,
            throughput: 420,
          }
        },
        {
          id: 'database',
          name: 'postgresql',
          displayName: 'PostgreSQL Database',
          description: 'Primary database server',
          status: 'running',
          health: 92,
          uptime: 7 * 24 * 60 * 60 * 1000,
          lastRestart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          autoRestart: true,
          dependencies: [],
          port: 5432,
          logs: [],
          metrics: {,
            cpuUsage: 8.5,
            memoryUsage: 512,
            requestCount: 5600,
            errorRate: 0.01,
            responseTime: 15,
            throughput: 1200,
          }
        },
        {
          id: 'redis',
          name: 'redis',
          displayName: 'Redis Cache',
          description: 'In-memory cache and session store',
          status: 'error',
          health: 0,
          uptime: 0,
          lastRestart: new Date(Date.now() - 2 * 60 * 60 * 1000),
          autoRestart: false,
          dependencies: [],
          port: 6379,
          logs: [],
          metrics: {,
            cpuUsage: 0,
            memoryUsage: 0,
            requestCount: 0,
            errorRate: 1,
            responseTime: 0,
            throughput: 0,
          }
        }
      ];
      setServices(mockServices);
    } catch (error) {
      console.error('Failed to load system data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleServiceAction = async (serviceId: string, action: string) => {
    try {
      setServices(prev => prev.map(service => )
        service.id === serviceId 
          ? { 
            ...service, 
            status: action === 'start' ? 'starting' : ,
              action === 'stop' ? 'stopping' : 
                action === 'restart' ? 'starting' : 
                  service.status 
          }
          : service
      ));
      // Simulate action delay
      setTimeout(() => {
        setServices(prev => prev.map(service => )
          service.id === serviceId 
            ? { 
              ...service, 
              status: action === 'stop' ? 'stopped' : 'running',
              lastRestart: action === 'restart' ? new Date() : service.lastRestart,
              uptime: action === 'restart' ? 0 : service.uptime,
            }
            : service
        ));
      }, 2000);
      onServiceAction?.(serviceId, action);
    } catch (error) {
      console.error(`Failed to ${action} service ${serviceId}:`, error);}
    }
  };
  const handleSystemAction = async (action: string) => {
    try {
      onSystemAction?.(action);
    } catch (error) {
      console.error(`Failed to execute system action ${action}:`, error);}
    }
  };
  const renderOverview = () => {
    if (!systemOverview) return <div>Loading overview...</div>;
    const statusConfig = SYSTEM_STATUS_CONFIG[systemOverview.overallStatus];
    const StatusIcon = statusConfig.icon;
    return ();
      <div className="overview-section">
        <div className="system-status-card">
          <Card>
            <CardContent className="p-6">
              <div className="system-status-header">
                <div className="status-info">
                  <div className="status-title">System Status</div>
                  <div className="status-badge">
                    <Badge className={statusConfig.color}>
                      <StatusIcon className="w-4 h-4 mr-2" />
                      {systemOverview.overallStatus.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="system-actions">
                  <Button 
                    onClick={() => handleSystemAction('maintenance')}
                    variant="outline"
                    size="sm"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Maintenance Mode
                  </Button>
                  <Button 
                    onClick={loadSystemData}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />}
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="metrics-grid">
          <Card>
            <CardContent className="p-4">
              <div className="metric-item">
                <Server className="w-6 h-6 text-blue-600" />
                <div className="metric-info">
                  <div className="metric-label">Services</div>
                  <div className="metric-value">
                    {systemOverview.runningServices} / {systemOverview.totalServices}
                  </div>
                  <div className="metric-status running">
                    {systemOverview.runningServices} running
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="metric-item">
                <Cpu className="w-6 h-6 text-green-600" />
                <div className="metric-info">
                  <div className="metric-label">System Load</div>
                  <div className="metric-value">
                    {(systemOverview.systemLoad * 100).toFixed(1)}%
                  </div>
                  <div className="load-bar">
                    <div 
                      className="load-fill"
                      style={{ width: `${systemOverview.systemLoad * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="metric-item">
                <Memory className="w-6 h-6 text-purple-600" />
                <div className="metric-info">
                  <div className="metric-label">Memory Usage</div>
                  <div className="metric-value">
                    {(systemOverview.memoryUsage * 100).toFixed(1)}%
                  </div>
                  <div className="memory-bar">
                    <div 
                      className="memory-fill"
                      style={{ width: `${systemOverview.memoryUsage * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="metric-item">
                <Users className="w-6 h-6 text-orange-600" />
                <div className="metric-info">
                  <div className="metric-label">Active Users</div>
                  <div className="metric-value">{systemOverview.activeUsers}</div>
                  <div className="metric-status active">
                    Currently online
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="alerts-section">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="alerts-list">
                {systemOverview.erroredServices > 0 && ()
                  <div className="alert-item error">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{systemOverview.erroredServices} service(s) in error state</span>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                )}
                {systemOverview.memoryUsage > 0.8 && ()
                  <div className="alert-item warning">
                    <AlertTriangle className="w-4 h-4" />
                    <span>High memory usage detected ({(systemOverview.memoryUsage * 100).toFixed(1)}%)</span>
                    <Button size="sm" variant="outline">
                      Investigate
                    </Button>
                  </div>
                )}
                {systemOverview.backgroundJobs > 5 && ()
                  <div className="alert-item info">
                    <Activity className="w-4 h-4" />
                    <span>{systemOverview.backgroundJobs} background jobs running</span>
                    <Button size="sm" variant="outline">
                      Monitor
                    </Button>
                  </div>
                )}
                {systemOverview.erroredServices === 0 && 
                 systemOverview.memoryUsage <= 0.8 && 
                 systemOverview.backgroundJobs <= 5 && ()
                  <div className="alert-item success">
                    <CheckCircle className="w-4 h-4" />
                    <span>All systems operating normally</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  const renderServices = () => (;);
    <div className="services-section">
      <div className="services-header">
        <h3>System Services</h3>
        <div className="services-actions">
          <Button 
            onClick={() => handleSystemAction('restart_all')}
            variant="outline"
            size="sm"
            disabled={adminLevel !== 'super_admin'}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart All
          </Button>
        </div>
      </div>
      <div className="services-grid">
        {services.map(service => ()
          <ServiceCard
            key={service.id}
            service={service}
            onAction={handleServiceAction}
            onSelect={setSelectedService}
            adminLevel={adminLevel}
          />
        ))}
      </div>
    </div>
  );
  const renderProcesses = () => (;);
    <div className="processes-section">
      <Card>
        <CardHeader>
          <CardTitle>Background Processes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="processes-list">
            <div className="process-item">
              <div className="process-info">
                <div className="process-name">Data Backup</div>
                <div className="process-description">Automated daily backup job</div>
              </div>
              <div className="process-status">
                <Badge className="text-green-600 bg-green-100">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Running
                </Badge>
              </div>
              <div className="process-actions">
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Pause className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="process-item">
              <div className="process-info">
                <div className="process-name">Email Queue</div>
                <div className="process-description">Processing outbound email notifications</div>
              </div>
              <div className="process-status">
                <Badge className="text-blue-600 bg-blue-100">
                  <Activity className="w-3 h-3 mr-1" />
                  Processing
                </Badge>
              </div>
              <div className="process-actions">
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Pause className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="process-item">
              <div className="process-info">
                <div className="process-name">Cache Cleanup</div>
                <div className="process-description">Automatic cache invalidation and cleanup</div>
              </div>
              <div className="process-status">
                <Badge className="text-yellow-600 bg-yellow-100">
                  <Clock className="w-3 h-3 mr-1" />
                  Scheduled
                </Badge>
              </div>
              <div className="process-actions">
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  return ();
    <div className={`status-controls ${className}`}>}
      <div className="controls-header">
        <div className="header-info">
          <h2>Status Controls</h2>
          <p>Monitor and control system services, processes, and operations</p>
        </div>
        <div className="header-badges">
          <Badge className={`${SYSTEM_STATUS_CONFIG[systemOverview?.overallStatus || 'operational'].color} text-sm`}>}
            System {systemOverview?.overallStatus || 'Unknown'}
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 text-sm">
            {adminLevel.replace('_', ' ').toUpperCase()} Level
          </Badge>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">
            Services
            <Badge className="ml-2 text-xs">
              {systemOverview?.runningServices || 0}/{systemOverview?.totalServices || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="processes">Processes</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="tab-content">
          {renderOverview()}
        </TabsContent>
        <TabsContent value="services" className="tab-content">
          {renderServices()}
        </TabsContent>
        <TabsContent value="processes" className="tab-content">
          {renderProcesses()}
        </TabsContent>
        <TabsContent value="logs" className="tab-content">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <p>System log viewer coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Service Detail Modal */}
      {selectedService && ()
        <ServiceDetailModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onAction={handleServiceAction}
          adminLevel={adminLevel}
        />
      )}
      <style>{`
        .status-controls {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .controls-header {
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
        .header-badges {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .overview-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .system-status-card {
          margin-bottom: 1rem;
        }
        .system-status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .status-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }
        .system-actions {
          display: flex;
          gap: 0.5rem;
        }
        .metrics-grid {
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
        .metric-status {
          font-size: 0.75rem;
          color: #6b7280;
        }
        .metric-status.running {
          color: #059669;
        }
        .metric-status.active {
          color: #3b82f6;
        }
        .load-bar,
        .memory-bar {
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
          margin-top: 0.25rem;
        }
        .load-fill {
          height: 100%;
          background: #059669;
          transition: width 0.3s ease;
        }
        .memory-fill {
          height: 100%;
          background: #8b5cf6;
          transition: width 0.3s ease;
        }
        .alerts-section {
          margin-top: 1rem;
        }
        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .alert-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.875rem;
        }
        .alert-item.error {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
        .alert-item.warning {
          background: #fffbeb;
          color: #92400e;
          border: 1px solid #fed7aa;
        }
        .alert-item.info {
          background: #eff6ff;
          color: #1e40af;
          border: 1px solid #bfdbfe;
        }
        .alert-item.success {
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
        }
        .services-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .services-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .services-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }
        .services-actions {
          display: flex;
          gap: 0.5rem;
        }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1rem;
        }
        .processes-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .processes-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .process-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }
        .process-info {
          flex: 1;
        }
        .process-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }
        .process-description {
          font-size: 0.875rem;
          color: #6b7280;
        }
        .process-actions {
          display: flex;
          gap: 0.25rem;
        }
        @media (max-width: 768px) {
          .controls-header {
            flex-direction: column;
            align-items: stretch;
          }
          .system-status-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .services-grid {
            grid-template-columns: 1fr;
          }
          .process-item {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
        }
        @media (max-width: 480px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

// Service Card Component
interface ServiceCardProps {
  service: SystemService;
  onAction: (serviceId: string, action: string) => void;
  onSelect: (service: SystemService) => void;
  adminLevel: string;
}
const ServiceCard: React.FC<ServiceCardProps> = ({ )
  service, 
  onAction, 
  onSelect, 
  adminLevel 
}) => {
  const statusConfig = SERVICE_STATUS_CONFIG[service.status];
  const StatusIcon = statusConfig.icon;
  const canControl = adminLevel === 'super_admin' || adminLevel === 'admin';
  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-green-600';
    if (health >= 70) return 'text-yellow-600';
    if (health >= 50) return 'text-orange-600';
    return 'text-red-600';
  };
  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / (24 * 60 * 60 * 1000));
    const hours = Math.floor((uptime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    if (days > 0) return `${days}d ${hours}h`;}
    if (hours > 0) return `${hours}h`;}
    return '< 1h';
  };
  return ();
    <Card className="service-card">
      <CardContent className="p-4">
        <div className="service-header">
          <div className="service-info">
            <div className="service-name">{service.displayName}</div>
            <div className="service-description">{service.description}</div>
          </div>
          <div className="service-status">
            <Badge className={statusConfig.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {service.status.toUpperCase()}
            </Badge>
          </div>
        </div>
        <div className="service-metrics">
          <div className="metric-row">
            <span>Health:</span>
            <span className={`font-semibold ${getHealthColor(service.health)}`}>}
              {service.health}%
            </span>
          </div>
          <div className="metric-row">
            <span>Uptime:</span>
            <span>{formatUptime(service.uptime)}</span>
          </div>
          {service.port && ()
            <div className="metric-row">
              <span>Port:</span>
              <span>{service.port}</span>
            </div>
          )}
          <div className="metric-row">
            <span>CPU:</span>
            <span>{service.metrics.cpuUsage.toFixed(1)}%</span>
          </div>
          <div className="metric-row">
            <span>Memory:</span>
            <span>{service.metrics.memoryUsage}MB</span>
          </div>
        </div>
        <div className="service-actions">
          <Button
            onClick={() => onSelect(service)}
            variant="outline"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-1" />
            Details
          </Button>
          {canControl && statusConfig.actions.map(action => ()
            <Button
              key={action}
              onClick={() => onAction(service.id, action)}
              size="sm"
              variant={action === 'stop' ? 'outline' : 'default'}
              disabled={service.status === 'starting' || service.status === 'stopping'}
            >
              {action === 'start' && <PlayCircle className="w-4 h-4 mr-1" />}
              {action === 'stop' && <StopCircle className="w-4 h-4 mr-1" />}
              {action === 'restart' && <RefreshCw className="w-4 h-4 mr-1" />}
              {action === 'pause' && <PauseCircle className="w-4 h-4 mr-1" />}
              {action.charAt(0).toUpperCase() + action.slice(1)}
            </Button>
          ))}
        </div>
      </CardContent>
      <style>{`
        .service-card {
          transition: box-shadow 0.2s ease;
        }
        .service-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .service-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        .service-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }
        .service-description {
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.4;
        }
        .service-metrics {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
        }
        .metric-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }
        .metric-row span:first-child {
          color: #6b7280;
        }
        .metric-row span:last-child {
          color: #1f2937;
          font-weight: 500;
        }
        .service-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
      `}</style>
    </Card>
  );
};

// Service Detail Modal Component
interface ServiceDetailModalProps {
  service: SystemService;
  onClose: () => void;
  onAction: (serviceId: string, action: string) => void;
  adminLevel: string;
}
const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({)
  service,
  onClose,
  onAction,
  adminLevel
}) => {
  const statusConfig = SERVICE_STATUS_CONFIG[service.status];
  const StatusIcon = statusConfig.icon;
  const canControl = adminLevel === 'super_admin' || adminLevel === 'admin';
  return ();
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">
            <h2>{service.displayName}</h2>
            <Badge className={statusConfig.color}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {service.status.toUpperCase()}
            </Badge>
          </div>
          <Button onClick={onClose} variant="outline" size="sm">
            ✕
          </Button>
        </div>
        <div className="modal-body">
          <div className="service-details-grid">
            <div className="detail-section">
              <h3>Service Information</h3>
              <div className="detail-item">
                <label>Name:</label>
                <span>{service.name}</span>
              </div>
              <div className="detail-item">
                <label>Description:</label>
                <span>{service.description}</span>
              </div>
              <div className="detail-item">
                <label>Port:</label>
                <span>{service.port || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>URL:</label>
                <span>{service.url || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Auto Restart:</label>
                <Badge className={service.autoRestart ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {service.autoRestart ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
            <div className="detail-section">
              <h3>Performance Metrics</h3>
              <div className="detail-item">
                <label>Health Score:</label>
                <span className="font-semibold">{service.health}%</span>
              </div>
              <div className="detail-item">
                <label>CPU Usage:</label>
                <span>{service.metrics.cpuUsage.toFixed(1)}%</span>
              </div>
              <div className="detail-item">
                <label>Memory Usage:</label>
                <span>{service.metrics.memoryUsage}MB</span>
              </div>
              <div className="detail-item">
                <label>Request Count:</label>
                <span>{service.metrics.requestCount.toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <label>Error Rate:</label>
                <span>{(service.metrics.errorRate * 100).toFixed(2)}%</span>
              </div>
              <div className="detail-item">
                <label>Response Time:</label>
                <span>{service.metrics.responseTime}ms</span>
              </div>
            </div>
          </div>
          {service.dependencies.length > 0 && ()
            <div className="dependencies-section">
              <h3>Dependencies</h3>
              <div className="dependencies-list">
                {service.dependencies.map(dep => ()
                  <Badge key={dep} variant="outline">
                    {dep}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
          {canControl && statusConfig.actions.map(action => ()
            <Button
              key={action}
              onClick={() => {
                onAction(service.id, action);
                onClose();
              }}
              variant={action === 'stop' ? 'outline' : 'default'}
            >
              {action.charAt(0).toUpperCase() + action.slice(1)} Service
            </Button>
          ))}
        </div>
      </div>
      <style>{`
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
        .service-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .detail-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }
        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
        }
        .detail-item label {
          color: #6b7280;
          font-weight: 500;
        }
        .detail-item span {
          color: #1f2937;
        }
        .dependencies-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.75rem;
        }
        .dependencies-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }
        @media (max-width: 768px) {
          .service-details-grid {
            grid-template-columns: 1fr;
          }
          .modal-content {
            width: 95vw;
            max-height: 90vh;
          }
        }
      `}</style>
    </div>
  );
};

export default StatusControls;