import { NextResponse } from "next/server";
import { env } from "@/env";
import { apiRequest } from "@/lib/api-client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const requestId = req.headers.get("x-request-id") || "";

    const backendUrl = env.BACKEND_API_URL;
    const res = await apiRequest(`${backendUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": req.headers.get("user-agent") || "",
        "X-Forwarded-For": req.headers.get("x-forwarded-for") || "",
        "X-Request-ID": requestId,
      },
      body: JSON.stringify(body),
      actionName: "Proxy POST /api/auth/register",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Register proxy error:", error);
    return NextResponse.json(
      { error: "Backend API is unreachable" },
      { status: 500 }
    );
  }
}
