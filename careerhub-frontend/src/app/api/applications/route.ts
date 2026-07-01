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


