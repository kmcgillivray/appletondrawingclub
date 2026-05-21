import { handleErrorWithSentry, replayIntegration } from "@sentry/sveltekit";
import * as Sentry from '@sentry/sveltekit';
import { dev } from '$app/environment';

Sentry.init({
  dsn: 'https://dcf20443074592658def19be653f01ad@o4511429021532160.ingest.us.sentry.io/4511429023629312',

  // Set environment based on dev mode
  environment: dev ? 'development' : 'production',

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Lower sample rate in development to reduce noise
  tracesSampleRate: dev ? 0.1 : 1.0,

  // Only capture errors in production by default
  // In dev, you can manually trigger errors to test
  beforeSend(event) {
    // In development, log to console instead of sending to Sentry
    if (dev) {
      console.log('[Sentry Dev]', event);
      return null; // Don't send to Sentry in dev
    }
    return event;
  },

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/sveltekit/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
