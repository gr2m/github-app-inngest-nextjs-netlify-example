import { cleanEnv, str } from "envalid";

import pino from "pino";

const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "test", "production"],
    default: "development",
  }),
  LOG_LEVEL: str({
    choices: ["trace", "debug", "info", "warn", "error", "fatal"],
    default: "info",
  }),
});

const pinoLogger = pino({ level: env.LOG_LEVEL });

const logger = pinoLogger.child({
  env: env.NODE_ENV,
});

export default logger;
