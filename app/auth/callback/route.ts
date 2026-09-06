import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    // Return back to the main app dashboard after authentication completes
    return NextResponse.redirect(`${origin}/`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
