import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";
import { cleanEnv, str, num } from "envalid";
import { App, Octokit } from "octokit";
import pino from "pino";

import githubApp from "../../../../github-app";

const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "test", "production"],
    default: "development",
  }),
  LOG_LEVEL: str({
    choices: ["trace", "debug", "info", "warn", "error", "fatal"],
    default: "info",
  }),
  GITHUB_APP_CLIENT_ID: str({ default: "" }),
  GITHUB_APP_CLIENT_SECRET: str({ default: "" }),
  GITHUB_APP_ID: num(),
  GITHUB_APP_PRIVATE_KEY: str(),
  GITHUB_APP_WEBHOOK_SECRET: str(),
});

const pinoLogger = pino({ level: env.LOG_LEVEL });

const logger = pinoLogger.child({
  env: env.NODE_ENV,
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

githubApp(app, {
  logger,
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();

  const webhook = {
    id: headersList.get("x-github-delivery"),
    name: headersList.get("x-github-event"),
    signature: String(headersList.get("x-hub-signature-256")),
    payload: body,
  };

  const { id, name, signature } = webhook;
  logger.info({ id, name, signature }, "received webhook");

  try {
    // @ts-expect-error - webhook is not typed correctly but that's ok
    await app.webhooks.verifyAndReceive(webhook);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({
      // @ts-expect-error
      error: error.message,
    });
  }
}
