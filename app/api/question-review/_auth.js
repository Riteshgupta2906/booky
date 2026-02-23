import { NextResponse } from "next/server";

const AUTH_TOKEN = process.env.QUESTION_REVIEW_TOKEN;

export function requireAuth(request) {
  const origin =
    request.headers.get("origin") || request.headers.get("referer");
  const isSameOrigin =
    origin &&
    (origin.includes("localhost") ||
      origin.includes("vercel.app") ||
      origin.includes("ngrok-free.app"));

  if (isSameOrigin) {
    return null;
  }

  if (!AUTH_TOKEN) {
    return null;
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!token || token !== AUTH_TOKEN) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return null;
}
