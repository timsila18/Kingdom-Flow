import "server-only";
import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "./supabase-admin";
import { logEvent } from "./observability";

type RateLimitOptions = {
  scope: string;
  limit: number;
  windowSeconds: number;
  identity?: string;
};

function requestIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function allowRequest(
  request: Request,
  { scope, limit, windowSeconds, identity = "" }: RateLimitOptions,
) {
  const keyHash = createHash("sha256")
    .update(`${scope}:${requestIp(request)}:${identity.trim().toLowerCase()}`)
    .digest("hex");

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.rpc("kf_consume_rate_limit", {
      p_key_hash: keyHash,
      p_scope: scope,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      const windowStartedAt = new Date(
        Date.now() - windowSeconds * 1000,
      ).toISOString();
      const action = `security.rate_limit.${scope}`;
      const { count, error: countError } = await admin
        .from("audit_logs")
        .select("id", { count: "exact", head: true })
        .eq("action", action)
        .eq("request_id", keyHash)
        .gte("created_at", windowStartedAt);
      if (countError) throw countError;
      if ((count ?? 0) >= limit) return false;
      const { error: insertError } = await admin.from("audit_logs").insert({
        action,
        entity_type: "security_attempt",
        request_id: keyHash,
        result: "success",
        reason: "rate_limit_counter",
      });
      if (insertError) throw insertError;
      return true;
    }
    return data === true;
  } catch (error) {
    // Avoid locking every user out during a database or provider incident.
    logEvent("warn", "rate_limit.unavailable", {
      scope,
      reason: error instanceof Error ? error.message.slice(0, 160) : "unknown",
    });
    return true;
  }
}
