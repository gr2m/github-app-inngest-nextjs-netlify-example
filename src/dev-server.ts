// This file is a replacement of the `next dev` command. The four lines that
// mostly replicate next's dev command are:
//
//     const nextApp = next({ dev: true, hostname, port });
//     const handle = nextApp.getRequestHandler();
//
//     await nextApp.prepare();
//     createServer(handle).listen(port);
//
// Everything else is custom code to setup webhook relay and inject webhook
// requests into the GitHub App function.

import { createServer } from "node:http";

import next from "next";
import AppWebhookRelay from "github-app-webhook-relay";
import { App, Octokit } from "octokit";
import pino from "pino";
import { cleanEnv, str, num, host } from "envalid";

import githubApp from "./github-app";

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
  PORT: num({ default: 3000 }),
  HOST: host({ default: "localhost" }),
  TEST_REPOSITORY: str(),
  TEST_REPOSITORY_CREATE_HOOK_TOKEN: str(),
});

const port = env.PORT;
const hostname = env.HOST;
const logger = pino({ level: env.LOG_LEVEL });
const serverLogger = logger.child({ name: "server" });
const relayLogger = logger.child({ name: "relay" });
const octokitLogger = logger.child({ name: "octokit" });

const DevOctokit = Octokit.defaults({
  userAgent: "gr2m/github-app-inngest-nextjs-netlify-example/local",
  log: octokitLogger,
});

run();

async function run() {
  const app = new App({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, "\n"),
    webhooks: {
      secret: env.GITHUB_APP_WEBHOOK_SECRET,
    },
    oauth: {
      clientId: env.GITHUB_APP_CLIENT_ID,
      clientSecret: env.GITHUB_APP_CLIENT_SECRET,
    },
    Octokit: DevOctokit,
    // this should just be log: octokitLogger, but that does not work (yet)
    log: {
      debug: octokitLogger.debug.bind(octokitLogger),
      info: octokitLogger.info.bind(octokitLogger),
      warn: octokitLogger.warn.bind(octokitLogger),
      error: octokitLogger.error.bind(octokitLogger),
    },
  });

  await app.octokit.request("GET /app");

  await githubApp(app, {
    logger: logger.child({ name: "app" }),
  });

  const [owner, repo] = env.TEST_REPOSITORY.split("/");

  const relay = new AppWebhookRelay({
    owner,
    repo,
    createHookToken: env.TEST_REPOSITORY_CREATE_HOOK_TOKEN,
    // @ts-expect-error - `app` is incompatible
    app,
    events: ["issues"],
  });
  const relayName = env.TEST_REPOSITORY;

  relay.on("error", (error) => {
    relayLogger.error("error: %s", error);
  });

  await relay.start();

  relayLogger.info(`Started local relay server for webhooks on ${relayName}`);

  const nextApp = next({ dev: true, hostname, port });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();
  createServer(handle).listen(port);
  serverLogger.info(`Dev server is ready at http://${hostname}:${port}`);
}
