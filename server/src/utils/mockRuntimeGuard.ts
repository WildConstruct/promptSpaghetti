export function isProductionLikeEnvironment(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL === '1' ||
    process.env.VERCEL === 'true' ||
    process.env.RAILWAY_ENVIRONMENT === 'production' ||
    process.env.RENDER === 'true'
  );
}

export function assertMockRuntimeAllowed(serverName: string): void {
  if (!isProductionLikeEnvironment()) {
    return;
  }

  console.error(
    `[${serverName}] Mock auth runtimes are disabled in production-like environments.`
  );
  process.exit(1);
}
