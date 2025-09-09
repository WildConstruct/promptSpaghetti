import * as Sentry from '@sentry/react';

const DSN = (import.meta as any)?.env?.VITE_SENTRY_DSN as string | undefined;
if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: (import.meta as any)?.env?.MODE || 'production',
    tracesSampleRate: Number(
      (import.meta as any)?.env?.VITE_SENTRY_TRACES_SAMPLE_RATE || 0
    )
  });
}
