import { NextResponse } from "next/server";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";
import { getWorkspaceAccess } from "@/lib/workspace-store";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return new NextResponse("Invalid request", { status: 403 });
  const tenant = await getVisibleTenantBySlug(slug);
  const access = tenant ? await getWorkspaceAccess(tenant.id) : undefined;
  const form = await request.formData();
  const type = String(form.get("type"));
  if (!tenant || !access || !access.member.types?.some((item) => item === type))
    return new NextResponse("Access denied", { status: 403 });
  const response = NextResponse.redirect(
    new URL(`/workspace/${slug}`, request.url),
    303,
  );
  response.cookies.set("kingdomflow_active_type", `${tenant.id}:${type}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
