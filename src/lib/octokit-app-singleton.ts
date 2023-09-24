import { cleanEnv, str, num } from "envalid";
import { App, Octokit } from "octokit";

import logger from "./logger-singleton";

const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "test", "production"],
    default: "development",
  }),
  GITHUB_APP_CLIENT_ID: str({ default: "" }),
  GITHUB_APP_CLIENT_SECRET: str({ default: "" }),
  GITHUB_APP_ID: num(),
  GITHUB_APP_PRIVATE_KEY: str(),
  GITHUB_APP_WEBHOOK_SECRET: str(),
});

// TODO: when passing `logger` directly as `log` argument to `Octokit.defaults()` and/or `createNodeMiddleware()`
//       some weird errors are thrown. This is a bug that should be fixed in Octokit. I assume there are places
//       where `octokit.log.info` etc is passed as callback directly, which looses its binding.
const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
};

const app = new App({
  appId: env.GITHUB_APP_ID,
  privateKey: env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, "\n"),
  webhooks: {
    secret: env.GITHUB_APP_WEBHOOK_SECRET,
  },
  Octokit: Octokit.defaults({
    userAgent: "gr2m/github-app-inngest-nextjs-netlify-example",
    log,
  }),
});

export default app;
