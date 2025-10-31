import * as Sentry from '@sentry/react';

const {
  VITE_SENTRY_DSN,
  VITE_SENTRY_TRACES_SAMPLE_RATE,
  MODE
} = import.meta.env;

if (VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: VITE_SENTRY_DSN,
    environment: MODE ?? 'production',
    tracesSampleRate: Number(VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0)
  });
}
