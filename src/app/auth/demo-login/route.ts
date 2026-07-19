import { NextResponse } from "next/server";

export function GET(request: Request) {
  return NextResponse.redirect(new URL("/auth/sign-in?error=demo-disabled", request.url), { status: 303 });
}

export async function POST(request: Request) {
  return NextResponse.redirect(new URL("/auth/sign-in?error=demo-disabled", request.url), { status: 303 });
}
