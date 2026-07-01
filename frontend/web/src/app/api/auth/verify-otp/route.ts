import { NextResponse } from "next/server";
import { env } from "@/env";
import { apiRequest } from "@/infrastructure/http/api-client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const requestId = req.headers.get("x-request-id") || "";

    const backendUrl = env.BACKEND_API_URL;
    const res = await apiRequest(`${backendUrl}/api/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-ID": requestId,
      },
      body: JSON.stringify(body),
      actionName: "Proxy POST /api/auth/verify-otp",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Verify OTP proxy error:", error);
    return NextResponse.json(
      { error: "Backend API is unreachable" },
      { status: 500 }
    );
  }
}
