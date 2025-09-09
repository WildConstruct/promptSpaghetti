import * as Sentry from '@sentry/node';

const DSN = process.env.SENTRY_DSN;
if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0),
  });
}

export { Sentry };

