# `inngest-nextjs-netlify-example`

This example app combines [Next.js](https://github.com/vercel/next.js) (Framework), [Inngest](https://www.inngest.com/) (Background tasks orchestration), and [Netlify](https://www.netlify.com/) (Hosting).

## Local setup

Create an `.env.local` file with the following content:

```
INNGEST_EVENT_KEY="local"
```

Then, start the Inngest server:

```bash
npm run inngest
```

In another terminal, start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy

You will need accounts at [Inngest](https://www.inngest.com/) and [Netlify](https://www.netlify.com/).

Once you setup your repository to deploy to Netlify, add the following environment variables:

- `INNGEST_SIGNING_KEY`: Get at https://app.inngest.com/env/production/deploys
- `INNGEST_EVENT_KEY`: Get at https://app.inngest.com/env/production/manage/keys

## License

[ISC](LICENSE.md)
