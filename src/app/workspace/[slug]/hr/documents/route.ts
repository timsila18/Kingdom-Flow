import { NextResponse } from "next/server";
import { hrAccess, hrData } from "@/lib/hr-store";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { randomUUID } from "node:crypto";
const bucket = "kingdomflow-hr-private";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return new NextResponse("Invalid request", { status: 403 });
  const access = await hrAccess(slug);
  if (!access?.admin) return new NextResponse("Access denied", { status: 403 });
  const form = await request.formData(),
    staffId = String(form.get("staffId") ?? ""),
    file = form.get("file"),
    title = String(form.get("title") ?? "").trim(),
    visibility = form.has("employeeVisible") ? "Employee visible" : "Admin only";
  const url = new URL(
    `/workspace/${slug}/hr?tab=staff&staff=${staffId}`,
    request.url,
  );
  try {
    if (!(await hrData(access)).staff.some((s) => s.id === staffId))
      throw new Error("Staff record not found.");
    if (
      !(file instanceof File) ||
      !file.size ||
      file.size > 5 * 1024 * 1024 ||
      !title ||
      title.length > 200
    )
      throw new Error("Provide a title and a PDF, PNG or JPEG up to 5 MB.");
    const bytes = Buffer.from(await file.arrayBuffer());
    const type =
      bytes.subarray(0, 5).toString() === "%PDF-"
        ? "application/pdf"
        : bytes
              .subarray(0, 8)
              .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          ? "image/png"
          : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
            ? "image/jpeg"
            : "";
    if (!type)
      throw new Error("Only valid PDF, PNG and JPEG documents are accepted.");
    const client = getSupabaseAdmin(),
      path = `${access.tenant.id}/${staffId}/${randomUUID()}.${type === "application/pdf" ? "pdf" : type === "image/png" ? "png" : "jpg"}`;
    const { error: uploadError } = await client.storage
      .from(bucket)
      .upload(path, bytes, { contentType: type, upsert: false });
    if (uploadError) throw new Error("Document could not be uploaded.");
    const { error } = await client.from("kf_hr_documents").insert({
      tenant_id: access.tenant.id,
      staff_id: staffId,
      title,
      storage_path: path,
      file_name: file.name.slice(0, 200),
      visibility,
      created_by: access.user.id,
    });
    if (error) {
      await client.storage.from(bucket).remove([path]);
      throw new Error("Document details could not be saved.");
    }
    await client.from("kf_hr_audit").insert({
      tenant_id: access.tenant.id,
      actor_id: access.user.id,
      action: "document.upload",
      entity_id: staffId,
    });
    url.searchParams.set("success", "Document saved");
  } catch (error) {
    url.searchParams.set(
      "error",
      error instanceof Error ? error.message : "Document could not be saved",
    );
  }
  return NextResponse.redirect(url, 303);
}
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params,
    access = await hrAccess(slug);
  if (!access) return new NextResponse("Access denied", { status: 403 });
  const client = getSupabaseAdmin(),
    id = new URL(request.url).searchParams.get("id"),
    own = await client.from("kf_hr_staff").select("id").eq("tenant_id", access.tenant.id).eq("user_id", access.user.id).maybeSingle();
  const { data, error } = await client
    .from("kf_hr_documents")
    .select("storage_path,visibility,staff_id")
    .eq("tenant_id", access.tenant.id)
    .eq("id", id)
    .maybeSingle();
  if (error || !data || (!access.admin && !(data.visibility === "Employee visible" && own.data?.id === data.staff_id)))
    return new NextResponse("Document not found", { status: 404 });
  const signed = await client.storage
    .from(bucket)
    .createSignedUrl(data.storage_path, 60, { download: true });
  if (signed.error)
    return new NextResponse("Download unavailable", { status: 400 });
  return NextResponse.redirect(signed.data.signedUrl, {
    status: 303,
    headers: { "Cache-Control": "private, no-store" },
  });
}
