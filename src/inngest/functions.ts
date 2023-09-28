import { inngest } from "./client";
import app from "../lib/octokit-app-singleton";

export const helloWorld = inngest.createFunction(
  { name: "Hello World" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("1s");
    return { event, body: "Hello there!" };
  }
);

export const createComments = inngest.createFunction(
  { name: "Issue comments" },
  { event: "app/issue.created" },
  async ({ event, step }) => {
    // create first comment
    await step.run("Create first comment", async () => {
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
    await step.sleep("1m");

    // create second comment
    await step.run("Create second comment", async () => {
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
