# `github-app-inngest-nextjs-netlify-example`

This example app combines [Next.js](https://github.com/vercel/next.js) (Framework), [Inngest](https://www.inngest.com/) (Background tasks orchestration), and [Netlify](https://www.netlify.com/) (Hosting).

## Local setup

### Pre-requisites

Create an `.env.local` file with the following content:

```
INNGEST_EVENT_KEY="local"

GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=""
GITHUB_APP_WEBHOOK_SECRET="local"

TEST_REPOSITORY=""
TEST_REPOSITORY_CREATE_HOOK_TOKEN=""
```

You will need to register a GitHub App with the issues:write permission and webhooks disabled. Then you need to create a repository in which to test your GitHub App and a personall access token with the `repo` scope or `issues:write` permission.

Set the environment variables based on the GitHub App and repository you created. Replace line breaks in the private key with `\n`.

### Run locally

Start the Inngest server:

```bash
npm run inngest
```

In another terminal, start the dev server and web hook relay:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Test if the API works at [http://localhost:3000/api/ping](http://localhost:3000/api/ping). Test if the local Inngest server works at [http://localhost:3000/api/hello](http://localhost:3000/api/hello), then open [http://localhost:8288/stream](http://localhost:8288/stream) to see the Inngest event stream.

Finally, create an issue in your test repository and see if a comment is created by your GitHub App.

## Deploy

You will need accounts at [Inngest](https://www.inngest.com/) and [Netlify](https://www.netlify.com/).

Once you setup your repository to deploy to Netlify, add the following environment variables:

- `INNGEST_SIGNING_KEY`: Get at https://app.inngest.com/env/production/deploys
- `INNGEST_EVENT_KEY`: Get at https://app.inngest.com/env/production/manage/keys

## License

[ISC](LICENSE.md)
