/**
 * User Data Transparency Dashboard
 * 
 * Comprehensive user-facing dashboard that provides full transparency
 * into data access, usage, sharing, and privacy controls. Implements
 * GDPR "right to know" requirements and user-centric privacy management.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 * Task: T-1752989143998-872 - Create user access transparency tools
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert';
import {
  Badge,
  Button,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  // Dialog,
  // DialogContent,
  // DialogDescription,
  // DialogHeader,
  // DialogTitle,
  // DialogTrigger,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input
} from '@/components/ui';
import {
  Eye,
  Download,
  Shield,
  Settings,
  AlertTriangle,
  Clock,
  Globe,
  Users,
  Database,
  Activity,
  FileText,
  Trash2,
  Lock,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Search,
  BarChart3
} from 'lucide-react';

interface UserDataInventory {
  userId: string;
  generatedAt: Date;
  dataCategories: DataCategory[];
  totalDataPoints: number;
  sensitiveDataCount: number;
  retentionSummary: RetentionSummary;
  thirdPartySharing: ThirdPartySharing[];
  complianceStatus: ComplianceStatus;
  privacyScore: PrivacyScore;
}

interface DataCategory {
  category: string;
  description: string;
  classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  dataPoints: DataPoint[];
  lawfulBasis: LawfulBasis[];
  retentionPeriod: RetentionPeriod;
  processingPurposes: ProcessingPurpose[];
  thirdPartyAccess: boolean;
  userControl: 'none' | 'limited' | 'moderate' | 'full';
}

interface DataPoint {
  id: string;
  fieldName: string;
  dataType: 'PERSONAL' | 'SENSITIVE' | 'FINANCIAL' | 'HEALTH' | 'BIOMETRIC' | 'BEHAVIORAL';
  source: string;
  collectedAt: Date;
  lastAccessed: Date;
  accessCount: number;
  consentStatus: ConsentStatus;
}

interface UserAccessActivity {
  timestamp: Date;
  activityType: string;
  actor: {
    type: 'USER' | 'SYSTEM' | 'THIRD_PARTY' | 'ADMIN';
    name: string;
    role?: string;
  };
  dataAccessed: {
    dataType: string;
    classification: string;
    operation: string;
    recordCount: number;
  }[];
  purpose: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: {
    country: string;
    withinEU: boolean;
  };
}

interface PrivacyScore {
  overall: number;
  categories: {
    dataMinimization: number;
    consentHealth: number;
    securityPosture: number;
    thirdPartyRisk: number;
    retentionCompliance: number;
    userControl: number;
  };
  trends: Array<{
    metric: string;
    change: number;
    direction: 'IMPROVING' | 'DEGRADING' | 'STABLE';
  }>;
  recommendations: Array<{
    category: string;
    title: string;
    description: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    userAction: boolean;
  }>;
}

const UserDataTransparencyDashboard: React.FC = () => {
  const [inventory, setInventory] = useState<UserDataInventory | null>(null);
  const [activities, setActivities] = useState<UserAccessActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch user data inventory
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transparency/inventory');
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user access activities
  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetch(`/api/transparency/activities?range=${timeRange}&type=${filterType}&search=${searchTerm}`);
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  }, [timeRange, filterType, searchTerm]);

  useEffect(() => {
    fetchInventory();
    fetchActivities();
  }, [fetchInventory, fetchActivities]);

  const handleDownloadData = async (format: string) => {
    try {
      const response = await fetch(`/api/transparency/export?format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-data.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download data:', error);
    }
  };

  const handleDeleteData = async (categoryId: string) => {
    try {
      await fetch(`/api/transparency/delete/${categoryId}`, { method: 'DELETE' });
      fetchInventory(); // Refresh
    } catch (error) {
      console.error('Failed to delete data:', error);
    }
  };

  const getClassificationColor = (classification: string): string => {
    switch (classification) {
    case 'PUBLIC': return 'bg-green-100 text-green-800';
    case 'INTERNAL': return 'bg-blue-100 text-blue-800';
    case 'CONFIDENTIAL': return 'bg-yellow-100 text-yellow-800';
    case 'RESTRICTED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (level: string): string => {
    switch (level) {
    case 'LOW': return 'text-green-600';
    case 'MEDIUM': return 'text-yellow-600';
    case 'HIGH': return 'text-orange-600';
    case 'CRITICAL': return 'text-red-600';
    default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (direction: string): React.ReactElement | null => {
    switch (direction) {
    case 'IMPROVING': return <TrendingUp className="h-4 w-4 text-green-600" />;
    case 'DEGRADING': return <TrendingDown className="h-4 w-4 text-red-600" />;
    case 'STABLE': return <Minus className="h-4 w-4 text-gray-600" />;
    default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Transparency Dashboard</h1>
          <p className="text-muted-foreground">
            Complete visibility into your personal data and privacy controls
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => fetchInventory()} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="data">My Data</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="sharing">Sharing</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Privacy Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy Score
              </CardTitle>
              <CardDescription>
                Your overall privacy and data protection score
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inventory?.privacyScore && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{inventory.privacyScore.overall}/100</span>
                    <Badge variant={inventory.privacyScore.overall >= 80 ? 'default' : 'secondary'}>
                      {inventory.privacyScore.overall >= 80 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </div>
                  <Progress value={inventory.privacyScore.overall} className="w-full" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {Object.entries(inventory.privacyScore.categories).map(([category, score]) => (
                      <div key={category} className="text-center">
                        <div className="text-sm text-muted-foreground capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="font-semibold">{score}/100</div>
                      </div>
                    ))}
                  </div>

                  {inventory.privacyScore.recommendations.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Recommendations</h4>
                      <div className="space-y-2">
                        {inventory.privacyScore.recommendations.slice(0, 3).map((rec, index) => (
                          <Alert key={index}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>{rec.title}</AlertTitle>
                            <AlertDescription>{rec.description}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Database className="h-8 w-8 text-blue-600" />
                  <div className="text-right">
                    <div className="text-2xl font-bold">{inventory?.totalDataPoints || 0}</div>
                    <div className="text-sm text-muted-foreground">Data Points</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  <div className="text-right">
                    <div className="text-2xl font-bold">{inventory?.sensitiveDataCount || 0}</div>
                    <div className="text-sm text-muted-foreground">Sensitive Data</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Globe className="h-8 w-8 text-green-600" />
                  <div className="text-right">
                    <div className="text-2xl font-bold">{inventory?.thirdPartySharing.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Third Parties</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div className="text-right">
                    <div className="text-2xl font-bold">{inventory?.retentionSummary.nearExpirationCount || 0}</div>
                    <div className="text-sm text-muted-foreground">Expiring Soon</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Personal Data Inventory
                </span>
                <div className="flex items-center space-x-2">
                  <Button onClick={() => handleDownloadData('json')} size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download JSON
                  </Button>
                  <Button onClick={() => handleDownloadData('csv')} size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                All personal data we have about you, organized by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventory?.dataCategories.map((category, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{category.category}</CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getClassificationColor(category.classification)}>
                            {category.classification}
                          </Badge>
                          <Badge variant="outline">
                            {category.dataPoints.length} items
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Retention: </span>
                            {category.retentionPeriod.duration} days
                          </div>
                          <div>
                            <span className="font-medium">Third Party Access: </span>
                            {category.thirdPartyAccess ? 'Yes' : 'No'}
                          </div>
                          <div>
                            <span className="font-medium">User Control: </span>
                            <Badge variant="outline" className="capitalize">
                              {category.userControl}
                            </Badge>
                          </div>
                          <div>
                            <span className="font-medium">Processing Purposes: </span>
                            {category.processingPurposes.length}
                          </div>
                        </div>
                        
                        {category.dataPoints.length > 0 && (
                          <details className="mt-4">
                            <summary className="cursor-pointer font-medium">
                              View Data Points ({category.dataPoints.length})
                            </summary>
                            <div className="mt-2 space-y-1">
                              {category.dataPoints.map((point, pointIndex) => (
                                <div key={pointIndex} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded">
                                  <span className="text-sm">{point.fieldName}</span>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                      {point.dataType}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      Accessed {point.accessCount} times
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}

                        <div className="flex items-center justify-between mt-4">
                          <div className="text-sm text-muted-foreground">
                            Last updated: {new Date(inventory.generatedAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                            {category.userControl === 'full' && (
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDeleteData(category.category)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Data Access Activity
              </CardTitle>
              <CardDescription>
                Real-time view of who accessed your data and when
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1d">Last Day</SelectItem>
                    <SelectItem value="7d">Last Week</SelectItem>
                    <SelectItem value="30d">Last Month</SelectItem>
                    <SelectItem value="90d">Last 3 Months</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="USER">User Access</SelectItem>
                    <SelectItem value="SYSTEM">System Access</SelectItem>
                    <SelectItem value="THIRD_PARTY">Third Party</SelectItem>
                    <SelectItem value="ADMIN">Admin Access</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
              </div>

              {/* Activity Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Data Accessed</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="text-sm">
                          {activity.timestamp.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {activity.actor.type}
                          </Badge>
                          <span className="text-sm">{activity.actor.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {activity.dataAccessed.map((data, dataIndex) => (
                            <div key={dataIndex} className="text-sm">
                              <Badge className={getClassificationColor(data.classification)} size="sm">
                                {data.classification}
                              </Badge>
                              <span className="ml-2">{data.dataType}</span>
                              <span className="text-muted-foreground ml-1">
                                ({data.recordCount} records)
                              </span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{activity.purpose}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {activity.location.country}
                          {activity.location.withinEU && (
                            <Badge variant="outline" size="sm" className="ml-1">EU</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={getRiskColor(activity.riskLevel)}
                        >
                          {activity.riskLevel}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sharing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Third-Party Data Sharing
              </CardTitle>
              <CardDescription>
                Organizations that have access to your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventory?.thirdPartySharing.map((sharing, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{sharing.thirdPartyName}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant={sharing.userConsent ? 'default' : 'destructive'}>
                            {sharing.userConsent ? 'Consented' : 'No Consent'}
                          </Badge>
                          <Badge variant="outline">
                            {sharing.dataShared.length} data types
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="font-medium">Purpose: </span>
                          {sharing.sharingPurpose}
                        </div>
                        <div>
                          <span className="font-medium">Since: </span>
                          {sharing.sharingDate.toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Retention: </span>
                          {sharing.retentionByThirdParty} days
                        </div>
                        <div>
                          <span className="font-medium">Agreement: </span>
                          {sharing.dataProcessingAgreement ? 'Yes' : 'No'}
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className="font-medium text-sm">Data Shared: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {sharing.dataShared.map((data, dataIndex) => (
                            <Badge key={dataIndex} variant="outline" size="sm">
                              {data}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Contact: {sharing.contactInfo.privacyEmail || sharing.contactInfo.dpoEmail || 'Not provided'}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Privacy Policy
                          </Button>
                          <Button size="sm" variant="outline">
                            <UserCheck className="h-4 w-4 mr-2" />
                            Manage Rights
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Privacy Analytics
              </CardTitle>
              <CardDescription>
                Detailed privacy metrics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inventory?.privacyScore && (
                <div className="space-y-6">
                  {/* Category Breakdown */}
                  <div>
                    <h4 className="font-semibold mb-4">Privacy Category Scores</h4>
                    <div className="space-y-3">
                      {Object.entries(inventory.privacyScore.categories).map(([category, score]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="capitalize text-sm">
                            {category.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <div className="flex items-center space-x-2 w-48">
                            <Progress value={score} className="flex-1" />
                            <span className="text-sm font-medium w-12">{score}/100</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trends */}
                  {inventory.privacyScore.trends.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-4">Privacy Trends</h4>
                      <div className="space-y-2">
                        {inventory.privacyScore.trends.map((trend, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center space-x-2">
                              {getTrendIcon(trend.direction)}
                              <span className="text-sm">{trend.metric}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm ${trend.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {trend.change > 0 ? '+' : ''}{trend.change}%
                              </span>
                              <Badge variant="outline" size="sm">
                                {trend.direction.toLowerCase()}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-semibold mb-4">Privacy Recommendations</h4>
                    <div className="space-y-3">
                      {inventory.privacyScore.recommendations.map((rec, index) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle className="flex items-center justify-between">
                            <span>{rec.title}</span>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" size="sm">
                                {rec.impact} impact
                              </Badge>
                              {rec.userAction && (
                                <Badge size="sm">Action Required</Badge>
                              )}
                            </div>
                          </AlertTitle>
                          <AlertDescription>{rec.description}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Privacy Controls
              </CardTitle>
              <CardDescription>
                Manage your privacy preferences and data controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Notification Preferences */}
                <div>
                  <h4 className="font-semibold mb-4">Notification Preferences</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Real-time Notifications</div>
                        <div className="text-sm text-muted-foreground">
                          Get notified immediately when your data is accessed
                        </div>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Weekly Privacy Reports</div>
                        <div className="text-sm text-muted-foreground">
                          Receive weekly summaries of data access activity
                        </div>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Consent Reminders</div>
                        <div className="text-sm text-muted-foreground">
                          Periodic reminders to review and update your consent preferences
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                {/* Data Retention Controls */}
                <div>
                  <h4 className="font-semibold mb-4">Data Retention Controls</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Automatic Data Deletion</div>
                        <div className="text-sm text-muted-foreground">
                          Automatically delete data when retention period expires
                        </div>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Data Minimization</div>
                        <div className="text-sm text-muted-foreground">
                          Only collect and retain data that is necessary
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                {/* Access Controls */}
                <div>
                  <h4 className="font-semibold mb-4">Access Controls</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Require Explicit Approval</div>
                        <div className="text-sm text-muted-foreground">
                          Require your approval for sensitive data access
                        </div>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Restrict Third-Party Access</div>
                        <div className="text-sm text-muted-foreground">
                          Limit third-party access to your data
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                {/* Data Requests */}
                <div>
                  <h4 className="font-semibold mb-4">Data Rights Requests</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <Download className="h-6 w-6 mb-2" />
                      <span>Download My Data</span>
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex-col">
                      <FileText className="h-6 w-6 mb-2" />
                      <span>Request Data Correction</span>
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex-col">
                      <Trash2 className="h-6 w-6 mb-2" />
                      <span>Request Data Deletion</span>
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex-col">
                      <Lock className="h-6 w-6 mb-2" />
                      <span>Restrict Processing</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDataTransparencyDashboard;