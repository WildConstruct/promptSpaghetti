// Environment configuration for the client application

interface EnvironmentConfig {
  API_URL: string;
  PYTHON_EXECUTOR_URL: string;
  WEBSOCKET_URL: string;
  ANALYTICS_ENABLED: boolean;
  DEBUG_MODE: boolean;
  FEATURE_FLAGS_ENABLED: boolean;
}

// Helper function to get environment variable with fallback
const getEnvVar = (key: string, fallback: string = ''): string => {
  return import.meta.env[key] || fallback;
};

// Helper function to get boolean environment variable
const getBoolEnvVar = (key: string, fallback: boolean = false): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return fallback;
  return value === 'true' || value === '1' || value === true;
};

// Environment configuration
export const env: EnvironmentConfig = {
  // API endpoints
  API_URL: getEnvVar('VITE_API_URL', ''),
  PYTHON_EXECUTOR_URL: getEnvVar('VITE_PYTHON_EXECUTOR_URL', ''),
  WEBSOCKET_URL: getEnvVar('VITE_WEBSOCKET_URL', ''),
  // Feature flags
  ANALYTICS_ENABLED: getBoolEnvVar('VITE_ANALYTICS_ENABLED', true),
  DEBUG_MODE: getBoolEnvVar('VITE_DEBUG_MODE', false),
  FEATURE_FLAGS_ENABLED: getBoolEnvVar('VITE_FEATURE_FLAGS_ENABLED', true)
};

// Validate required environment variables in production
if (import.meta.env.PROD) {
  const requiredVars = ['VITE_API_URL'];
  const missingVars = requiredVars.filter(key => !import.meta.env[key]);

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
  }
}

// Export individual values for convenience
export const API_URL = env.API_URL;
export const PYTHON_EXECUTOR_URL = env.PYTHON_EXECUTOR_URL;
export const WEBSOCKET_URL = env.WEBSOCKET_URL;
export const ANALYTICS_ENABLED = env.ANALYTICS_ENABLED;
export const DEBUG_MODE = env.DEBUG_MODE;
export const FEATURE_FLAGS_ENABLED = env.FEATURE_FLAGS_ENABLED;
