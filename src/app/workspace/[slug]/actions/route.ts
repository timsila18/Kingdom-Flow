import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const formData = await request.formData();
  const returnTo = String(formData.get("returnTo") ?? `/workspace/${slug}`);
  const action = String(formData.get("action") ?? "saved");
  const url = new URL(returnTo.startsWith("/") ? returnTo : `/workspace/${slug}`, request.url);

  url.searchParams.set("done", action);
  return NextResponse.redirect(url, 303);
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return NextResponse.redirect(new URL(`/workspace/${slug}`, request.url), 303);
}
