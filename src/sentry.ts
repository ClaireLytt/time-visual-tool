/* ─── Sentry Error Monitoring (placeholder) ───
 *
 * To enable:
 * 1. npm install @sentry/react
 * 2. Set VITE_SENTRY_DSN in .env
 * 3. Uncomment the init block below
 */

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return

  // Uncomment after installing @sentry/react:
  // import('@sentry/react').then(Sentry => {
  //   Sentry.init({
  //     dsn,
  //     environment: import.meta.env.MODE,
  //     tracesSampleRate: 0.1,
  //     replaysSessionSampleRate: 0,
  //     replaysOnErrorSampleRate: 1.0,
  //   })
  // })
}
