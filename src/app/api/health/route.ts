import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { logEvent } from "@/lib/observability";

export const dynamic = "force-dynamic";

export async function GET() {
  let database: "ok" | "unavailable" = "unavailable";
  try {
    const { error } = await getSupabaseAdmin()
      .from("tenants")
      .select("id")
      .limit(1);
    if (error) throw error;
    database = "ok";
  } catch (error) {
    logEvent("error", "health.database.failed", {
      reason: error instanceof Error ? error.message.slice(0, 160) : "unknown",
    });
  }

  const healthy = database === "ok";
  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks: { database },
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
      timestamp: new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
