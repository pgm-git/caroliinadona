import { NextResponse } from "next/server";
import { getQueues } from "@/server/queue";
import { checkQueueHealth } from "@/server/queue/health";

export const dynamic = "force-dynamic";

export async function GET() {
  // Health + queue stats endpoint
  const health = await checkQueueHealth();

  if (health.redis !== "connected") {
    return NextResponse.json(
      { status: "error", ...health },
      { status: 503 }
    );
  }

  const queues = getQueues();
  const stats = await Promise.all(
    Array.from(queues.entries()).map(async ([name, queue]) => {
      const counts = await queue.getJobCounts();
      return { name, ...counts };
    })
  );

  return NextResponse.json({
    status: "ok",
    redis: health,
    queues: stats,
  });
}
