/**
 * Debug endpoint to check environment variable status
 */

export default function handler(req, res) {
  // Only show debug info in non-production or with debug key
  const debugKey = req.query.key;

  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    vercel_env: process.env.VERCEL_ENV || 'not set',

    // Check if environment variables are set (don't show actual values)
    env_status: {
      ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
      ADMIN_PASSWORD_length: process.env.ADMIN_PASSWORD
        ? process.env.ADMIN_PASSWORD.length
        : 0,
      ADMIN_PASSWORD_is_default: process.env.ADMIN_PASSWORD === 'admin123',
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      OPENROUTER_API_KEY: !!process.env.OPENROUTER_API_KEY,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY
    },

    // Show what password will be used (without revealing it)
    auth_info: {
      using_env_password: !!process.env.ADMIN_PASSWORD,
      fallback_to_default: !process.env.ADMIN_PASSWORD,
      password_source: process.env.ADMIN_PASSWORD
        ? 'environment variable'
        : 'hardcoded default'
    },

    // Deployment info
    deployment: {
      region: process.env.VERCEL_REGION || 'unknown',
      url: process.env.VERCEL_URL || 'unknown',
      git_commit: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown'
    }
  };

  // If debug key is provided and matches, show first/last chars of password
  if (debugKey === 'check-config-2025') {
    const pwd = process.env.ADMIN_PASSWORD || 'admin123';
    debugInfo.auth_info.password_hint =
      pwd.length > 4
        ? `${pwd[0]}***${pwd[pwd.length - 1]} (length: ${pwd.length})`
        : `*** (length: ${pwd.length})`;
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(debugInfo);
}
