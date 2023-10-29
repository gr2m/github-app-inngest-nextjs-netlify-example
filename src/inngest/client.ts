import { Inngest, slugify } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: slugify("gr2m/github-app-inngest-nextjs-netlify-example"),
});
