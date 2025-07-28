// Epic 17.1.5 - Action Configuration Editor Component
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Slider,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  IconButton,
  Alert,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

export interface ActionConfig {
  targetValue?: unknown;
  rolloutPercentage?: number;
  conditions?: Array<{
    attribute: string;
    operator: string;
    value: Error;
  }>;
  gradualRollout?: {
    startPercentage: number;
    endPercentage: number;
    incrementMinutes: number;
  };
}
interface ActionConfigEditorProps {
  action: string;
  value: ActionConfig;
  onChange: (config: ActionConfig) => void;
  error?: string;
}
const CONDITION_OPERATORS = [;
  { value: 'equals', label: 'Equals', symbol: '=' },
  { value: 'not_equals', label: 'Not Equals', symbol: '≠' },
  { value: 'greater_than', label: 'Greater Than', symbol: '>' },
  { value: 'less_than', label: 'Less Than', symbol: '<' },
  { value: 'greater_equal', label: 'Greater or Equal', symbol: '≥' },
  { value: 'less_equal', label: 'Less or Equal', symbol: '≤' },
  { value: 'in', label: 'In List', symbol: '∈' },
  { value: 'not_in', label: 'Not In List', symbol: '∉' },
  { value: 'contains', label: 'Contains', symbol: '⊃' },
  { value: 'not_contains', label: 'Not Contains', symbol: '⊅' },
  { value: 'starts_with', label: 'Starts With', symbol: '⌜' },
  { value: 'ends_with', label: 'Ends With', symbol: '⌝' }
];
const COMMON_ATTRIBUTES = [;
  { value: 'user.id', label: 'User ID', type: 'string' },
  { value: 'user.email', label: 'User Email', type: 'string' },
  { value: 'user.role', label: 'User Role', type: 'string' },
  { value: 'user.createdAt', label: 'User Creation Date', type: 'date' },
  { value: 'user.lastLogin', label: 'Last Login', type: 'date' },
  { value: 'user.isActive', label: 'Is Active', type: 'boolean' },
  { value: 'user.plan', label: 'Subscription Plan', type: 'string' },
  { value: 'user.country', label: 'Country', type: 'string' },
  { value: 'user.language', label: 'Language', type: 'string' },
  { value: 'organization.id', label: 'Organization ID', type: 'string' },
  { value: 'organization.plan', label: 'Organization Plan', type: 'string' },
  { value: 'organization.size', label: 'Organization Size', type: 'number' },
  { value: 'session.duration', label: 'Session Duration', type: 'number' },
  { value: 'request.ip', label: 'IP Address', type: 'string' },
  { value: 'request.userAgent', label: 'User Agent', type: 'string' },
  { value: 'feature.usageCount', label: 'Feature Usage Count', type: 'number' },
  { value: 'custom.attribute', label: 'Custom Attribute', type: 'string' }
];

export const [showAdvanced, setShowAdvanced] = useState(false);
  useEffect(() => {
    setConfig(value);
  }, [value]);
  const handleConfigChange = (updates: Partial<ActionConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onChange(newConfig);
  };
  const handleConditionChange = (index: number, field: string, newValue: Error) => {
    const conditions = [...(config.conditions || [])];
    conditions[index] = { ...conditions[index], [field]: newValue };
    handleConfigChange({ conditions });
  };
  const addCondition = () => {
    const conditions = config.conditions || [];
    conditions.push({)
      attribute: 'user.id',
      operator: 'equals',
      value: '',
    });
    handleConfigChange({ conditions });
  };
  const removeCondition = (index: number) => {
    const conditions = [...(config.conditions || [])];
    conditions.splice(index, 1);
    handleConfigChange({ conditions });
  };
  const handleGradualRolloutChange = (field: string, newValue: number) => {
    const gradualRollout = { ...config.gradualRollout } || {
      startPercentage: 0,
      endPercentage: 100,
      incrementMinutes: 60,
    };
    handleConfigChange({)
      gradualRollout: { ...gradualRollout, [field]: newValue }
    });
  };
  const renderValueInput = (condition: unknown, index: number) => {
    const attribute = COMMON_ATTRIBUTES.find(attr => attr.value === condition.attribute);
    const type = attribute?.type || 'string';
    switch (type) {
    case 'boolean':
      return ()
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(condition.value)}
              onChange={(e) => handleConditionChange(index, 'value', e.target.checked)}
            />
          }
          label={condition.value ? 'True' : 'False'}
        />
      );
    case 'number':
      return ()
        <TextField
          type="number"
          value={condition.value || ''}
          onChange={(e) => handleConditionChange(index, 'value', parseFloat(e.target.value) || 0)}
          size="small"
          fullWidth
        />
      );
    case 'date':
      return ()
        <TextField
          type="datetime-local"
          value={condition.value || ''}
          onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
          size="small"
          fullWidth
        />
      );
    default:
      if (['in', 'not_in'].includes(condition.operator)) {
        return ()
          <TextField
            value={Array.isArray(condition.value) ? condition.value.join(', ') : condition.value || ''}
            onChange={(e) => {
              const values = e.target.value.split(',').map(v => v.trim()).filter(v => v);
              handleConditionChange(index, 'value', values);
            }}
            placeholder="value1, value2, value3"
            size="small"
            fullWidth
            helperText="Comma-separated values"
          />
        );
      }
      return ()
        <TextField
          value={condition.value || ''}
          onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
          size="small"
          fullWidth
        />
      );
    }
  };
  const getActionConfigHelp = () => {
    switch (action) {
    case 'enable':
    case 'disable':
      return 'This action requires no additional configuration.';
    case 'update_value':
      return 'Specify the new value for the feature toggle.';
    case 'modify_percentage':
      return 'Set the rollout percentage (0-100%).';
    case 'activate_rollout':
      return 'Configure gradual rollout settings.';
    default:
      return 'Configure action-specific settings.';
    }
  };
  return ()
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          {getActionConfigHelp()}
        </Typography>
      </Alert>
      <Grid container spacing={3}>
        {/* Target Value (for update_value action) */}
        {action === 'update_value' && ()
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Target Value
            </Typography>
            <TextField
              fullWidth
              label="New Toggle Value"
              value={typeof config.targetValue === 'string' ? config.targetValue : JSON.stringify(config.targetValue || '')}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleConfigChange({ targetValue: parsed });
                } catch {
                  handleConfigChange({ targetValue: e.target.value });
                }
              }}
              placeholder='{"enabled": true} or "simple string value"'
              helperText="Enter JSON object or simple value"
              multiline
              rows={3}
            />
          </Grid>
        )}
        {/* Rollout Percentage (for modify_percentage action) */}
        {action === 'modify_percentage' && ()
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Rollout Percentage
            </Typography>
            <Box px={2}>
              <Slider
                value={config.rolloutPercentage || 0}
                onChange={(_, value) => handleConfigChange({ rolloutPercentage: value as number })}
                min={0}
                max={100}
                step={1}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 25, label: '25%' },
                  { value: 50, label: '50%' },
                  { value: 75, label: '75%' },
                  { value: 100, label: '100%' }
                ]}
                valueLabelDisplay="on"
                valueLabelFormat={(value) => `${value}%`}
              />
            </Box>
            <TextField
              type="number"
              label="Percentage"
              value={config.rolloutPercentage || 0}
              onChange={(e) => handleConfigChange({ rolloutPercentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
              inputProps={{ min: 0, max: 100 }}
              sx={{ mt: 2, width: 150 }}
            />
          </Grid>
        )}
        {/* Gradual Rollout (for activate_rollout action) */}
        {action === 'activate_rollout' && ()
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Gradual Rollout Configuration
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Start Percentage"
                    type="number"
                    value={config.gradualRollout?.startPercentage || 0}
                    onChange={(e) => handleGradualRolloutChange('startPercentage', parseInt(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="End Percentage"
                    type="number"
                    value={config.gradualRollout?.endPercentage || 100}
                    onChange={(e) => handleGradualRolloutChange('endPercentage', parseInt(e.target.value) || 100)}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Increment Interval (minutes)"
                    type="number"
                    value={config.gradualRollout?.incrementMinutes || 60}
                    onChange={(e) => handleGradualRolloutChange('incrementMinutes', parseInt(e.target.value) || 60)}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      Rollout will increase from {config.gradualRollout?.startPercentage || 0}% to{' '}
                      {config.gradualRollout?.endPercentage || 100}% in increments every{' '}
                      {config.gradualRollout?.incrementMinutes || 60} minutes.
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
        {/* Advanced Configuration */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={showAdvanced}
                  onChange={(e) => setShowAdvanced(e.target.checked)}
                />
              }
              label="Advanced Configuration"
            />
            <SettingsIcon color="action" />
          </Box>
        </Grid>
        {showAdvanced && ()
          <>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            {/* Conditions */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="subtitle2">
                  Execution Conditions
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addCondition}
                  size="small"
                >
                  Add Condition
                </Button>
              </Box>
              {(config.conditions || []).map((condition, index) => ()
                <Paper key={index} elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Attribute</InputLabel>
                        <Select
                          value={condition.attribute}
                          onChange={(e) => handleConditionChange(index, 'attribute', e.target.value)}
                          label="Attribute"
                        >
                          {COMMON_ATTRIBUTES.map(attr => ()
                            <MenuItem key={attr.value} value={attr.value}>
                              <Box>
                                <Typography variant="body2">{attr.label}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {attr.value} ({attr.type})
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Operator</InputLabel>
                        <Select
                          value={condition.operator}
                          onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                          label="Operator"
                        >
                          {CONDITION_OPERATORS.map(op => ()
                            <MenuItem key={op.value} value={op.value}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip label={op.symbol} size="small" variant="outlined" />
                                <Typography variant="body2">{op.label}</Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                      {renderValueInput(condition, index)}
                    </Grid>
                    <Grid item xs={1}>
                      <IconButton
                        onClick={() => removeCondition(index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              {(config.conditions || []).length === 0 && ()
                <Alert severity="info">
                  <Typography variant="body2">
                    No conditions defined. The action will execute for all users.
                  </Typography>
                </Alert>
              )}
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};