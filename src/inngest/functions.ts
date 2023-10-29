import { slugify } from "inngest";

import { inngest } from "./client";
import app from "../lib/octokit-app-singleton";

export const helloWorld = inngest.createFunction(
  { id: slugify("Hello there!") },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-second", "1s");
    return { event, body: "Hello there!" };
  }
);

export const helloAgain = inngest.createFunction(
  { id: slugify("Hello again!") },
  { event: "test/hello.again" },
  async ({ event, step }) => {
    await step.sleep("wait-a-second", "1s");
    return { event, body: "Hello again!" };
  }
);

export const createComments = inngest.createFunction(
  { id: slugify("Issue comments") },
  { event: "app/issue.created" },
  async ({ event, step }) => {
    // create first comment
    await step.run(slugify("Create first comment"), async () => {
      const octokit = await app.getInstallationOctokit(
        event.data.installationId
      );
      const { data: comment } = await octokit.request(
        "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
        {
          owner: event.data.owner,
          repo: event.data.repo,
          issue_number: event.data.issue_number,
          body: "Hello there, I am a bot! I will comment again in a minute, unless you comment first.",
        }
      );

      return comment.html_url;
    });

    // wait 1 minute
    await step.sleep("wait-a-minute", "1m");

    // create second comment
    await step.run(slugify("Create second comment"), async () => {
      const octokit = await app.getInstallationOctokit(
        event.data.installationId
      );

      const { data: comments } = await octokit.request(
        "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
        {
          owner: event.data.owner,
          repo: event.data.repo,
          issue_number: event.data.issue_number,
          per_page: 2,
        }
      );

      if (comments.length === 2) {
        // If there are already 2 comments, oh well ...
        const { data: comment } = await octokit.request(
          "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
          {
            owner: event.data.owner,
            repo: event.data.repo,
            issue_number: event.data.issue_number,
            body: "Okay I lied.",
          }
        );

        return comment.html_url;
      }

      const { data: comment } = await octokit.request(
        "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
        {
          owner: event.data.owner,
          repo: event.data.repo,
          issue_number: event.data.issue_number,
          body: "See? I told you I would comment again.",
        }
      );

      return comment.html_url;
    });
  }
);
