import { Router } from "express";
import { db, visitorRequestsTable } from "@workspace/db";
import { eq, sql, gte, desc } from "drizzle-orm";

const router = Router();

router.get("/summary", async (req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [stats] = await db
    .select({
      totalRequests: sql<number>`count(*)::int`,
      pendingRequests: sql<number>`count(*) filter (where status in ('submitted','under_verification','pending_department','pending_senior','pending_gm'))::int`,
      approvedRequests: sql<number>`count(*) filter (where status = 'approved')::int`,
      rejectedRequests: sql<number>`count(*) filter (where status = 'rejected')::int`,
      submittedToday: sql<number>`count(*) filter (where created_at >= ${today.toISOString()})::int`,
      underVerification: sql<number>`count(*) filter (where status = 'under_verification')::int`,
      pendingAtDepartment: sql<number>`count(*) filter (where status = 'pending_department')::int`,
      pendingAtSenior: sql<number>`count(*) filter (where status = 'pending_senior')::int`,
      pendingAtGM: sql<number>`count(*) filter (where status = 'pending_gm')::int`,
    })
    .from(visitorRequestsTable);

  const devicesRows = await db
    .select({ devices: visitorRequestsTable.devices })
    .from(visitorRequestsTable)
    .where(gte(visitorRequestsTable.createdAt, today));

  let devicesRequestedToday = 0;
  for (const row of devicesRows) {
    const devices = row.devices as unknown[];
    if (Array.isArray(devices)) {
      devicesRequestedToday += devices.length;
    }
  }

  res.json({
    totalRequests: stats?.totalRequests ?? 0,
    pendingRequests: stats?.pendingRequests ?? 0,
    approvedRequests: stats?.approvedRequests ?? 0,
    rejectedRequests: stats?.rejectedRequests ?? 0,
    devicesRequestedToday,
    submittedToday: stats?.submittedToday ?? 0,
    underVerification: stats?.underVerification ?? 0,
    pendingAtDepartment: stats?.pendingAtDepartment ?? 0,
    pendingAtSenior: stats?.pendingAtSenior ?? 0,
    pendingAtGM: stats?.pendingAtGM ?? 0,
  });
});

router.get("/recent", async (req, res): Promise<void> => {
  const limit = parseInt(String(req.query.limit ?? "10"), 10);

  const requests = await db
    .select()
    .from(visitorRequestsTable)
    .orderBy(desc(visitorRequestsTable.updatedAt))
    .limit(limit);

  const activities = requests.map((r) => {
    const history = (r.statusHistory as Array<{ status: string; timestamp: string; updatedBy?: string; comment?: string }>) ?? [];
    const latest = history[history.length - 1];
    return {
      requestId: r.requestId,
      visitorName: r.fullName,
      action: latest?.comment ?? "Status updated",
      status: r.status,
      timestamp: r.updatedAt,
      department: r.department,
    };
  });

  res.json({ activities });
});

router.get("/departments", async (req, res): Promise<void> => {
  const rows = await db
    .select({
      department: visitorRequestsTable.department,
      total: sql<number>`count(*)::int`,
      approved: sql<number>`count(*) filter (where status = 'approved')::int`,
      rejected: sql<number>`count(*) filter (where status = 'rejected')::int`,
      pending: sql<number>`count(*) filter (where status in ('submitted','under_verification','pending_department','pending_senior','pending_gm'))::int`,
    })
    .from(visitorRequestsTable)
    .groupBy(visitorRequestsTable.department);

  res.json({ departments: rows });
});

export default router;
