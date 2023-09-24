import { App } from "octokit";
import type { Logger } from "pino";

type Options = {
  logger: Logger;
};

/**
 * This function is our "GitHub App". It's called from the `/api/github/*` routes
 * and handles webhooks and OAuth.
 *
 * The `app` is an instance of `@octokit/app` and logger is an object with `debug`, `info`, `warn` and `error` methods.
 */
export default async function githubApp(app: App, { logger }: Options) {
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

  app.webhooks.on("issues.opened", async ({ octokit, payload }) => {
    const { data: comment } = await octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      {
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        issue_number: payload.issue.number,
        body: "Hello from the GitHub App!",
      }
    );

    logger.info(
      {
        id: comment.id,
        url: comment.html_url,
      },
      "Comment created"
    );
  });
}
