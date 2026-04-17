import { Router } from "express";
import { db, visitorRequestsTable } from "@workspace/db";
import { eq, and, ilike, or, sql, desc } from "drizzle-orm";
import {
  CreateVisitorRequestBody,
  ListVisitorRequestsQueryParams,
  GetVisitorRequestParams,
  ProcessVisitorRequestParams,
  ProcessVisitorRequestBody,
} from "@workspace/api-zod";

const router = Router();

function generateRequestId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `HAL-${year}-${random}`;
}

function serializeRequest(r: typeof visitorRequestsTable.$inferSelect) {
  return {
    id: r.id,
    requestId: r.requestId,
    fullName: r.fullName,
    mobileNumber: r.mobileNumber,
    email: r.email,
    address: r.address,
    nationality: r.nationality,
    idProofType: r.idProofType,
    idProofNumber: r.idProofNumber,
    companyName: r.companyName,
    employeeId: r.employeeId,
    designation: r.designation,
    purposeOfVisit: r.purposeOfVisit,
    department: r.department,
    division: r.division,
    building: r.building,
    visitDate: r.visitDate,
    visitTime: r.visitTime,
    expectedDuration: r.expectedDuration,
    personToMeet: r.personToMeet,
    carryingDevices: r.carryingDevices,
    devices: r.devices,
    status: r.status,
    rejectionReason: r.rejectionReason,
    statusHistory: r.statusHistory,
    currentReviewer: r.currentReviewer,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

router.post("/", async (req, res): Promise<void> => {
  const parsed = CreateVisitorRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", message: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const requestId = generateRequestId();

  const initialHistory = [
    {
      status: "submitted",
      timestamp: new Date().toISOString(),
      comment: "Request submitted by visitor",
      updatedBy: "System",
    },
  ];

  const [inserted] = await db
    .insert(visitorRequestsTable)
    .values({
      requestId,
      fullName: data.fullName,
      mobileNumber: data.mobileNumber,
      email: data.email,
      address: data.address ?? null,
      nationality: data.nationality ?? null,
      idProofType: data.idProofType ?? null,
      idProofNumber: data.idProofNumber ?? null,
      companyName: data.companyName ?? null,
      employeeId: data.employeeId ?? null,
      designation: data.designation ?? null,
      purposeOfVisit: data.purposeOfVisit,
      department: data.department,
      division: data.division ?? null,
      building: data.building ?? null,
      visitDate: data.visitDate,
      visitTime: data.visitTime,
      expectedDuration: data.expectedDuration ?? null,
      personToMeet: data.personToMeet,
      carryingDevices: data.carryingDevices,
      devices: (data.devices ?? []) as object[],
      status: "submitted",
      statusHistory: initialHistory as object[],
    })
    .returning();

  res.status(201).json(serializeRequest(inserted));
});

router.get("/", async (req, res): Promise<void> => {
  const parsed = ListVisitorRequestsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params", message: parsed.error.message });
    return;
  }

  const { status, department, search, page = 1, limit = 20 } = parsed.data;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (status) conditions.push(eq(visitorRequestsTable.status, status));
  if (department) conditions.push(eq(visitorRequestsTable.department, department));
  if (search) {
    conditions.push(
      or(
        ilike(visitorRequestsTable.fullName, `%${search}%`),
        ilike(visitorRequestsTable.requestId, `%${search}%`),
        ilike(visitorRequestsTable.email, `%${search}%`),
        ilike(visitorRequestsTable.purposeOfVisit, `%${search}%`)
      )!
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [requests, [{ count }]] = await Promise.all([
    db
      .select()
      .from(visitorRequestsTable)
      .where(where)
      .orderBy(desc(visitorRequestsTable.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(visitorRequestsTable)
      .where(where),
  ]);

  res.json({
    requests: requests.map(serializeRequest),
    total: count,
    page,
    limit,
  });
});

router.get("/:requestId", async (req, res): Promise<void> => {
  const parsed = GetVisitorRequestParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params", message: parsed.error.message });
    return;
  }

  const [request] = await db
    .select()
    .from(visitorRequestsTable)
    .where(eq(visitorRequestsTable.requestId, parsed.data.requestId));

  if (!request) {
    res.status(404).json({ error: "not_found", message: "Request not found" });
    return;
  }

  res.json(serializeRequest(request));
});

const NEXT_STATUS_MAP: Record<string, string> = {
  submitted: "under_verification",
  under_verification: "pending_department",
  pending_department: "pending_senior",
  pending_senior: "pending_gm",
  pending_gm: "approved",
};

const REVIEWER_MAP: Record<string, string> = {
  department_manager: "Department Manager",
  senior_officer: "Senior Officer",
  general_manager: "General Manager",
};

router.post("/:requestId/action", async (req, res): Promise<void> => {
  const paramsParsed = ProcessVisitorRequestParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }

  const bodyParsed = ProcessVisitorRequestBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid body", message: bodyParsed.error.message });
    return;
  }

  const { requestId } = paramsParsed.data;
  const { action, comment, rejectionReason, reviewerRole } = bodyParsed.data;

  const [existing] = await db
    .select()
    .from(visitorRequestsTable)
    .where(eq(visitorRequestsTable.requestId, requestId));

  if (!existing) {
    res.status(404).json({ error: "not_found", message: "Request not found" });
    return;
  }

  const reviewerName = REVIEWER_MAP[reviewerRole] ?? reviewerRole;
  const now = new Date().toISOString();
  let newStatus = existing.status;
  let newRejectionReason = existing.rejectionReason;

  if (action === "approve") {
    newStatus = NEXT_STATUS_MAP[existing.status] ?? "approved";
  } else if (action === "reject") {
    newStatus = "rejected";
    newRejectionReason = rejectionReason ?? "Rejected by reviewer";
  } else if (action === "forward") {
    newStatus = NEXT_STATUS_MAP[existing.status] ?? existing.status;
  }

  const historyEntry = {
    status: newStatus,
    timestamp: now,
    comment: comment ?? `${action} by ${reviewerName}`,
    updatedBy: reviewerName,
  };

  const updatedHistory = [...((existing.statusHistory as object[]) ?? []), historyEntry];

  const [updated] = await db
    .update(visitorRequestsTable)
    .set({
      status: newStatus,
      rejectionReason: newRejectionReason,
      statusHistory: updatedHistory,
      currentReviewer: reviewerName,
      updatedAt: new Date(),
    })
    .where(eq(visitorRequestsTable.requestId, requestId))
    .returning();

  res.json(serializeRequest(updated));
});

export default router;
