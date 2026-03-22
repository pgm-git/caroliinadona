import type { ConnectionOptions } from "bullmq";

function getRedisUrl(): string {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("Missing required environment variable: REDIS_URL");
  }
  return url;
}

export function getConnectionOptions(): ConnectionOptions {
  const url = getRedisUrl();
  const parsed = new URL(url);

  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || "6379"),
    password: parsed.password || undefined,
    username: parsed.username || undefined,
    tls: url.startsWith("rediss://") ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}
