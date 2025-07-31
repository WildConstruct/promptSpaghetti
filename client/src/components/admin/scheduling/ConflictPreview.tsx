// Epic 17.1.5 - Conflict Preview Component
import React from 'react';
import {
  Box,
  Alert,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  AutoFixHigh as AutoFixHighIcon,
  ManualMode as ManualModeIcon,
  Block as BlockIcon
} from '@mui/icons-material';

}
interface Conflict {
  description: string;,
  severity: 'low' | 'medium' | 'high' | 'critical';
  interface ConflictPreviewProps {
  conflicts: Conflict;,
  resolution: 'skip' | 'override' | 'merge';
  const SEVERITY_CONFIG = {
  low: {
  icon: InfoIcon,
  color: 'info' as const,
  label: 'Low',
  description: 'Minor scheduling overlap with minimal impact',
}
},
  medium: {
  icon: WarningIcon,
  color: 'warning' as const,
  label: 'Medium',
  description: 'Moderate conflict that may cause unexpected behavior',
},
  high: {
  icon: ErrorIcon,
  color: 'error' as const,
  label: 'High',
  description: 'Significant conflict that will likely cause issues',
},
  critical: {
  icon: ErrorIcon,
  color: 'error' as const,
  label: 'Critical',
  description: 'Severe conflict that could break functionality',
};


  const conflictsByType = conflicts.reduce((acc, conflict) => {
    if (!acc[conflict.severity]) {
      acc[conflict.severity] = [];

    acc[conflict.severity].push(conflict);
    return acc;
  }, {} as Record<string, Conflict>);
  const getOverallSeverity = () => {
    if (conflicts.some(c => c.severity === 'critical')) return 'critical';
    if (conflicts.some(c => c.severity === 'high')) return 'high';
    if (conflicts.some(c => c.severity === 'medium')) return 'medium';
    return 'low';
  };
  const overallSeverity = getOverallSeverity();
  const overallConfig = SEVERITY_CONFIG[overallSeverity];
  return;
    <Paper elevation={1} sx={{ p: 2 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <overallConfig.icon color={overallConfig.color} />
        <Typography variant="h6" color={`${overallConfig.color}.main`}>}
          Schedule Conflicts Detected
        </Typography>
        <Chip 
          label={`${conflicts.length} conflict${conflicts.length > 1 ? 's' : ''}`}
          color={overallConfig.color}
          size="small"
        />
      </Box>
      {/* Summary */}
      <Alert severity={overallConfig.color} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Conflict Summary
        </Typography>
        <Typography variant="body2">
          {conflicts.length} scheduling conflict{conflicts.length > 1 ? 's' : ''} detected with{' '}
          <strong>{overallConfig.label.toLowerCase()}</strong> severity.{' '}
          {overallConfig.description}
        </Typography>
      </Alert>
      {/* Conflict Details */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Conflict Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {Object.entries(conflictsByType).map(([severity, severityConflicts]) => {
              const config = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG];
              return;
                <Box key={severity} mb={1}>
                  <Typography variant="subtitle2" color={`${config.color}.main`} gutterBottom>}
                    {config.label} Severity ({severityConflicts.length})
                  </Typography>
                  {severityConflicts.map((conflict, index) => ()
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <config.icon 
                          color={config.color} 
                          fontSize="small"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={conflict.description}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </Box>
              );
            })}
          </List>
        </AccordionDetails>
      </Accordion>
      {/* Resolution Strategy */}
      <Box mt={2}>
        <Typography variant="subtitle2" gutterBottom>
          Resolution Strategy
        </Typography>
        <Alert severity={resolutionConfig.color} icon={<resolutionConfig.icon />}>
          <Typography variant="subtitle2" gutterBottom>
            {resolutionConfig.label}
          </Typography>
          <Typography variant="body2">
            {resolutionConfig.description}
          </Typography>
        </Alert>
      </Box>
      {/* Recommendations */}
      {overallSeverity === 'critical' || overallSeverity === 'high' ? ()
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom color="error">
            Recommendations
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <InfoIcon color="info" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Consider rescheduling to avoid conflicts"
                secondary="Adjust the start time or recurrence pattern"
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoIcon color="info" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Increase schedule priority"
                secondary="Higher priority schedules execute first"
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
            {resolution === 'skip' && ()
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="warning" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Change conflict resolution to 'Override' or 'Merge'"
                  secondary="Current setting will skip execution when conflicts occur"
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            )}
          </List>
        </Box>
      ) : ()
        <Box mt={2}>
          <Alert severity="info">
            <Typography variant="body2">
              These conflicts are minor and should not significantly impact schedule execution.
              The selected resolution strategy should handle them appropriately.
            </Typography>
          </Alert>
        </Box>
      )}
      {/* Action Buttons */}
      {(overallSeverity === 'critical' || overallSeverity === 'high') && ()
        <Box mt={2} display="flex" gap={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AutoFixHighIcon />}
          >
            Auto-Resolve
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<WarningIcon />}
          >
            View Conflicting Schedules
          </Button>
        </Box>
      )}
    </Paper>
  );
};