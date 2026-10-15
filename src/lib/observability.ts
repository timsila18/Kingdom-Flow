import "server-only";

type LogLevel = "info" | "warn" | "error";

const blockedKeys = /email|password|token|secret|phone|name|authorization/i;

export function logEvent(
  level: LogLevel,
  event: string,
  details: Record<string, unknown> = {},
) {
  const safeDetails = Object.fromEntries(
    Object.entries(details).filter(([key]) => !blockedKeys.test(key)),
  );
  const payload = JSON.stringify({
    level,
    event,
    timestamp: new Date().toISOString(),
    ...safeDetails,
  });

  if (level === "error") console.error(payload);
  else if (level === "warn") console.warn(payload);
  else console.info(payload);
}
