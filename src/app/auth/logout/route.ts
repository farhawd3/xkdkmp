import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const url = new URL("/dashboard", request.url);
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(request: NextRequest) {
  const url = new URL("/dashboard", request.url);
  return NextResponse.redirect(url);
}
