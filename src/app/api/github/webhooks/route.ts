import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";

import githubApp from "../../../../github-app";
import app from "../../../../lib/octokit-app-singleton";
import logger from "../../../../lib/logger-singleton";
import { inngest } from "../../../../inngest/client";

githubApp(app, {
  logger,
  inngest,
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
  logger.info(
    { headers: Object.fromEntries(headersList.entries()) },
    "headers"
  );
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
