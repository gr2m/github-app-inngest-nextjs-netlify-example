import { App } from "octokit";
import type { Logger } from "pino";
import type { Inngest } from "inngest";

type Options = {
  logger: Logger;
  inngest: Inngest;
};

/**
 * This function is our "GitHub App". It's called from the `/api/github/*` routes
 * and handles webhooks and OAuth.
 *
 * The `app` is an instance of `@octokit/app` and logger is an object with `debug`, `info`, `warn` and `error` methods.
 */
export default async function githubApp(
  app: App,
  { logger, inngest }: Options
) {
  app.webhooks.onAny(async (event) => {
    let eventRepositoryName = "N/A";
    let eventAction = "N/A";

    if ("repository" in event.payload && event.payload.repository) {
      eventRepositoryName = event.payload.repository.full_name;
    }

    if ("action" in event.payload) {
      eventAction = event.payload.action;
    }

    const data = {
      eventId: event.id,
      eventName: event.name,
      eventAction,
      eventRepositoryName,
    };

    logger.info(data, "Event received");
  });

  app.webhooks.on("issues.opened", async ({ payload }) => {
    const data = {
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: payload.issue.number,
      installationId: payload.installation?.id,
    };

    await inngest.send({
      // The event name
      name: "app/issue.created",
      // The event's data
      data,
    });

    logger.info(data, '"app/issue.created" inngest event sent');
  });
}
