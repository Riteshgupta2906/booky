import { NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function proxy(request) {
  // Handle preflight OPTIONS requests immediately
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }

  // For all other requests, let them pass through and attach CORS headers
  const response = NextResponse.next();
  Object.entries(CORS_HEADERS).forEach(([k, v]) => response.headers.set(k, v));
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
