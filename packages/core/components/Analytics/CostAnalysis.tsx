import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Progress } from '../ui/Progress';
import { Alert, AlertDescription } from '../ui/Alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { AnalyticsClient } from '../../analytics/AnalyticsClient';
import { DollarSign, TrendingUp, AlertCircle, PieChart, BarChart3 } from 'lucide-react';
import { 
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
/**
 * Budget card props
 */
interface BudgetCardProps {
  budget: unknown;,
  usage: Error;
  onUpdate: (budgetId: string, updates: unknown) => void;
/**
 * Budget card component
 */
const BudgetCard: React.FC<BudgetCardProps> = ({ budget, usage, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({)
  amount: budget.amount,
  alertThresholds: budget.alertThresholds || [75, 90],
});
  const handleSave = () => {
    onUpdate(budget.id, editForm);
    setIsEditing(false);
  };
  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  const getStatusText = (percentage: number) => {
    if (percentage >= 100) return 'Exceeded';
    if (percentage >= 90) return 'Critical';
    if (percentage >= 75) return 'Warning';
    return 'On Track';
  };
  return;
    <Card className="budget-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{budget.name}</CardTitle>
            <div className="text-sm text-gray-500">{budget.period} budget</div>
          </div>
          <Badge variant={usage?.percentageUsed >= 90 ? 'destructive' : usage?.percentageUsed >= 75 ? 'warning' : 'secondary'}>
            {getStatusText(usage?.percentageUsed || 0)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Budget Usage */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used</span>
              <span>{usage?.percentageUsed?.toFixed(1) || 0}%</span>
            </div>
            <Progress
              value={usage?.percentageUsed || 0}
              className={`h-2 ${getStatusColor(usage?.percentageUsed || 0)}`}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>${usage?.amountUsed?.toFixed(2) || '0.00'}</span>}
              <span>${budget.amount.toFixed(2)}</span>}
            </div>
          </div>
          {/* Budget Details */}
          {isEditing ? ()
            <div className="space-y-3">
              <div>
                <Label htmlFor="amount">Budget Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="thresholds">Alert Thresholds (%)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={editForm.alertThresholds[0]}
                    onChange={(e) => setEditForm(prev => ({ )
                      ...prev, 
                      alertThresholds: [parseFloat(e.target.value), prev.alertThresholds[1]] 
                    }))}
                    placeholder="Warning"
                  />
                  <Input
                    type="number"
                    value={editForm.alertThresholds[1]}
                    onChange={(e) => setEditForm(prev => ({ )
                      ...prev, 
                      alertThresholds: [prev.alertThresholds[0], parseFloat(e.target.value)] 
                    }))}
                    placeholder="Critical"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : ()
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Remaining</span>
                <span className="text-sm font-medium">${usage?.amountRemaining?.toFixed(2) || budget.amount.toFixed(2)}</span>}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Transactions</span>
                <span className="text-sm">{usage?.transactionCount || 0}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => setIsEditing(true)}
              >
                Edit Budget
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
/**
 * Cost forecast chart props
 */
interface CostForecastChartProps {
  forecastData: unknown;,
  loading: boolean;
/**
 * Cost forecast chart component
 */
const CostForecastChart: React.FC<CostForecastChartProps> = ({ forecastData, loading }) => {
  if (loading) {
    return;
      <Card>
        <CardHeader>
          <CardTitle>Cost Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  if (!forecastData) {
    return;
      <Card>
        <CardHeader>
          <CardTitle>Cost Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            No forecast data available
          </div>
        </CardContent>
      </Card>
    );
  const chartData = Array.from({ length: 30 }, (_, i) => ({)
  day: i + 1,
  projected: forecastData.forecastedDailyCost * (i + 1),
  lower: forecastData.confidenceInterval.lower * (i + 1) / 30,
  upper: forecastData.confidenceInterval.upper * (i + 1) / 30,
}));
  return;
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Cost Forecast (30 days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${forecastData.forecastedTotalCost.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Projected Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${forecastData.forecastedDailyCost.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Daily Average</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {forecastData.basedOnDays}
              </div>
              <div className="text-sm text-gray-600">Days of Data</div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} />}
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']} />}
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Projected"
                />
                <Line
                  type="monotone"
                  dataKey="lower"
                  stroke="#10B981"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="Lower Bound"
                />
                <Line
                  type="monotone"
                  dataKey="upper"
                  stroke="#EF4444"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="Upper Bound"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
/**
 * Cost analysis props
 */

export interface CostAnalysisProps {
  analyticsClient: AnalyticsClient;,
  timeRange: { startTime: number; endTime: number };
  userId?: number;
  organizationId?: number;
/**
 * Cost analysis state
 */
interface CostAnalysisState {
  loading: boolean;,
  costSummary: unknown;
  forecast: unknown;,
  budgets: unknown;
  budgetUsage: Map<string, any>;
  recommendations: unknown;,
  error: string | null;
  /**
  * Cost analysis component
  */
}
export const CostAnalysis: React.FC<CostAnalysisProps> = ({)
  analyticsClient,
  timeRange,
  userId,
  organizationId
}) => {
  const [state, setState] = useState<CostAnalysisState>({)
  loading: true,
  costSummary: null,
  forecast: null,
  budgets: [],
  budgetUsage: new Map(),
  recommendations: [],
  error: null,
});
  /**
   * Load cost data
   */
  const loadCostData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const [costResponse, forecastResponse, budgetsResponse, recommendationsResponse] = await Promise.all([)
        analyticsClient.getCostSummary(timeRange, userId, organizationId),
        analyticsClient.getCostForecast(30, userId, organizationId),
        analyticsClient.getBudgets(userId, organizationId),
        analyticsClient.getRecommendations(userId, organizationId)
      ]);
      if (!costResponse.success) {
        throw new Error(costResponse.error || 'Failed to load cost summary');
      // Load budget usage for each budget
      const budgetUsageMap = new Map();
      if (budgetsResponse.success && budgetsResponse.data) {
        for (const budget of budgetsResponse.data) {
          try {
            const usageResponse = await analyticsClient.getBudgetUsage(budget.id);
            if (usageResponse.success) {
              budgetUsageMap.set(budget.id, usageResponse.data);
          } catch (error) {
            console.warn(`Failed to load usage for budget ${budget.id}:`, error);}
      setState(prev => ({)
  ...prev,
  loading: false,
  costSummary: costResponse.data,
  forecast: forecastResponse.success ? forecastResponse.data : null,
  budgets: budgetsResponse.success ? budgetsResponse.data : [],
  budgetUsage: budgetUsageMap,
  recommendations: recommendationsResponse.success ? recommendationsResponse.data : [],
}));
    } catch (error) {
  console.error('Failed to load cost data:', error);
  setState(prev => ({)
  ...prev,
  loading: false,
  error: error instanceof Error ? error.message : 'Failed to load cost data',
}));
  }, [analyticsClient, timeRange, userId, organizationId]);
  /**
   * Create new budget
   */
  const handleCreateBudget = useCallback(async (budgetData: unknown) => {
    try {
      const response = await analyticsClient.createBudget(budgetData);
      if (response.success) {
        loadCostData(); // Refresh data
    } catch (error) {
  console.error('Failed to create budget:', error);
}, [analyticsClient, loadCostData]);
  /**
   * Update budget
   */
  const handleUpdateBudget = useCallback(async (budgetId: string, updates: unknown) => {
    try {
      const response = await analyticsClient.updateBudget(budgetId, updates);
      if (response.success) {
        loadCostData(); // Refresh data
    } catch (error) {
  console.error('Failed to update budget:', error);
}, [analyticsClient, loadCostData]);
  /**
   * Load data on mount
   */
  useEffect(() => {
    loadCostData();
  }, [loadCostData]);
  if (state.loading) {
    return;
      <div className="cost-analysis">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading cost analysis...</p>
        </div>
      </div>
    );
  if (state.error) {
    return;
      <div className="cost-analysis">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {state.error}
            <Button
              variant="outline"
              size="sm"
              onClick={loadCostData}
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  const costSummary = state.costSummary || {};
  const providerData = Array.from(costSummary.costByProvider || []).map(([provider, cost]) => ({)
  name: provider,
  value: cost,
}));
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  return;
    <div className="cost-analysis">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          {/* Cost Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Total Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ${costSummary.totalCost?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-gray-500">This period</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Total Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {(costSummary.totalTokens || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Tokens consumed</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Avg Cost/Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ${costSummary.averageCostPerTransaction?.toFixed(3) || '0.000'}
                </div>
                <div className="text-sm text-gray-500">Per execution</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {costSummary.transactionCount || 0}
                </div>
                <div className="text-sm text-gray-500">Total executions</div>
              </CardContent>
            </Card>
          </div>
          {/* Provider Cost Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Cost by Provider
                </CardTitle>
              </CardHeader>
              <CardContent>
                {providerData.length > 0 ? ()
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={providerData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {providerData.map((entry, index) => ()
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />}
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />}
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                ) : ()
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No provider data available
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Top Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(costSummary.topModels || []).slice(0, 5).map((model: HTMLElement, index: number) => ()
                    <div key={model.model} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-medium">{model.model}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${model.cost.toFixed(2)}</div>}
                        <div className="text-sm text-gray-600">
                          {model.tokens.toLocaleString()} tokens
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="budgets" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Budget Management</h3>
            <Button onClick={() => {
  const name = prompt('Budget name:');
  const amount = prompt('Budget amount:');
  const period = prompt('Budget period (daily/weekly/monthly/yearly):');
  if (name && amount && period) {
  handleCreateBudget({)
  name,
  amount: parseFloat(amount),
  period,
  userId,
  organizationId
});
            }}>
              Create Budget
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.budgets.map((budget: unknown) => ()
              <BudgetCard
                key={budget.id}
                budget={budget}
                usage={state.budgetUsage.get(budget.id)}
                onUpdate={handleUpdateBudget}
              />
            ))}
          </div>
          {state.budgets.length === 0 && ()
            <div className="text-center py-8 text-gray-500">
              No budgets configured. Create your first budget to start tracking costs.
            </div>
          )}
        </TabsContent>
        <TabsContent value="forecast" className="space-y-6">
          <CostForecastChart
            forecastData={state.forecast}
            loading={state.loading}
          />
        </TabsContent>
        <TabsContent value="recommendations" className="space-y-6">
          <div className="space-y-4">
            {state.recommendations.map((rec: unknown, index: number) => ()
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                    <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'warning' : 'secondary'}>
                      {rec.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-gray-600">{rec.description}</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">
                        Potential savings: ${rec.estimatedSavings?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Action Items:</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {rec.actionItems?.map((item: string, i: number) => ()
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {state.recommendations.length === 0 && ()
            <div className="text-center py-8 text-gray-500">
              No recommendations available at this time.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CostAnalysis;