import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Forward the request to the real C# API
  const res = await fetch(`${baseUrl}/api/v1/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Forward the Authorization header from the original request
      ...(request.headers.get("Authorization")
        ? { Authorization: request.headers.get("Authorization")! }
        : {}),
    },
    body: await request.text(),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export function GET(): NextResponse {
  return NextResponse.json(
    { title: "Method Not Allowed", detail: "This endpoint only accepts POST requests.", status: 405 },
    { status: 405, headers: { Allow: "POST" } }
  );
}





// import { NextRequest, NextResponse } from "next/server";

// export async function POST(request: NextRequest): Promise<NextResponse> {

//   // Try to read the JSON body. If it's broken, stop and return 400.
//   let body: Record<string, unknown>;
//   try {
//     body = await request.json();
//   } catch {
//     return NextResponse.json(
//       { title: "Bad Request", detail: "Request body must be valid JSON.", status: 400 },
//       { status: 400 }
//     );
//   }

//   const { jobId, email } = body as { jobId?: unknown; email?: unknown };

//   // If jobId or email is missing, tell the user what's wrong and stop.
//   if (!jobId || !email) {
//     const missing = [!jobId && "jobId", !email && "email"].filter(Boolean).join(" and ");
//     return NextResponse.json(
//       { title: "Bad Request", detail: `Missing required field(s): ${missing}.`, status: 400 },
//       { status: 400 }
//     );
//   }

//   // Wait 800ms to fake a real database call — makes the loading spinner visible in the UI.
//   await new Promise<void>((resolve) => setTimeout(resolve, 800));

//   // All good — return 201 with a new ID, the submitted data, and a timestamp.
//   return NextResponse.json(
//     {
//       id: crypto.randomUUID(),          // A brand-new unique ID for this application
//       jobId,                            // Echoed back from the request
//       email,                            // Echoed back from the request
//       submittedAt: new Date().toISOString(), // When the server received it
//     },
//     { status: 201 }
//   );
// }

// // Block GET requests — this endpoint is POST only.
// // We return a proper error message instead of letting Next.js silently 405.
// export function GET(): NextResponse {
//   return NextResponse.json(
//     { title: "Method Not Allowed", detail: "This endpoint only accepts POST requests.", status: 405 },
//     { status: 405, headers: { Allow: "POST" } }
//   );
// }