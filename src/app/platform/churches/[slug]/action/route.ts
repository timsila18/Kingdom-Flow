import { NextResponse } from "next/server";
import { changeChurchStatus } from "@/lib/tenant-store";
import { getCurrentUser } from "@/lib/app-auth";
import type { TenantStatus } from "@/lib/types";
const decisions: Record<string, TenantStatus> = {
  approve: "approved",
  clarification: "needs_clarification",
  reject: "rejected",
  suspend: "suspended",
  reactivate: "approved",
};
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user?.isSuperAdmin)
    return new NextResponse("Access denied", { status: 403 });
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return new NextResponse("Invalid request", { status: 403 });
  const form = await request.formData();
  const status = decisions[String(form.get("decision"))];
  const url = new URL(`/platform/churches/${slug}`, request.url);
  try {
    if (!status) throw new Error("Choose a valid church decision.");
    await changeChurchStatus(slug, status, String(form.get("reason") ?? ""));
    url.searchParams.set("updated", status);
  } catch (error) {
    url.searchParams.set(
      "error",
      error instanceof Error ? error.message : "Decision could not be saved.",
    );
  }
  return NextResponse.redirect(url, 303);
}
