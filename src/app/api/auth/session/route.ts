import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  // Set the session cookie
  // In a real production app, you should use firebase-admin to create a session cookie
  // and set it as HttpOnly. For now, we'll use the ID token for simplicity.
  (await cookies()).set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 5, // 5 days
    path: "/",
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  (await cookies()).delete("session");
  return NextResponse.json({ success: true });
}
