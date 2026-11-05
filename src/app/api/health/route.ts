import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Liveness and database check for uptime monitoring. */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", database: "ok" });
  } catch {
    return Response.json({ status: "degraded", database: "unreachable" }, { status: 503 });
  }
}
