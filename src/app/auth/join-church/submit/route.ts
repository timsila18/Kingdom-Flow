import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/app-auth";
import { joinChurch } from "@/lib/church-joining";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return new NextResponse("Invalid request", { status: 403 });
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.redirect(
      new URL("/auth/sign-in?next=/auth/join-church", request.url),
      303,
    );
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  try {
    if (!name || name.length > 200) throw new Error("Provide your name");
    const slug = await joinChurch(
      { ...user, name },
      String(form.get("churchId") ?? ""),
      String(form.get("phone") ?? ""),
      String(form.get("journeyStage") ?? "Visitor"),
    );
    return NextResponse.redirect(
      new URL(`/workspace/${slug}`, request.url),
      303,
    );
  } catch {
    return NextResponse.redirect(
      new URL("/auth/join-church?error=join-unavailable", request.url),
      303,
    );
  }
}
