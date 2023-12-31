import { NextResponse } from "next/server";
import { inngest } from "../../../inngest/client"; // Import our client

// Create a simple async Next.js API route handler
export async function GET() {
  // Send your event payload to Inngest
  await inngest.send({
    name: "test/hello.world",
    data: {
      email: "testFromNext@example.com",
    },
  });

  return NextResponse.json({ name: "Hello Inngest from Next!" });
}
