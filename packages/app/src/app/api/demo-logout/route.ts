import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const response = NextResponse.redirect(`${origin}/login`);

  response.cookies.delete("demo-session");

  return response;
}
