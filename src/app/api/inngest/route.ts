import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import {
  helloWorld,
  helloAgain,
  createComments,
} from "../../../inngest/functions";

// create serve handler
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld, helloAgain, createComments],
});
