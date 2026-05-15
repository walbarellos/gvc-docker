// instrument.ts deve ser o primeiro import no server.ts
import * as Sentry from "@sentry/node";
import { config } from "./config/unifiedConfig.js";

if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.nodeEnv,
    tracesSampleRate: 1.0,
  });
  console.log("🚀 Sentry initialized");
} else {
  console.log("⚠️ Sentry DSN not found, skipping initialization");
}
