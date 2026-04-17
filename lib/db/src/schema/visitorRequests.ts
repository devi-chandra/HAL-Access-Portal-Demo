import { pgTable, text, serial, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const visitorRequestsTable = pgTable("visitor_requests", {
  id: serial("id").primaryKey(),
  requestId: text("request_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  mobileNumber: text("mobile_number").notNull(),
  email: text("email").notNull(),
  address: text("address"),
  nationality: text("nationality"),
  idProofType: text("id_proof_type"),
  idProofNumber: text("id_proof_number"),
  companyName: text("company_name"),
  employeeId: text("employee_id"),
  designation: text("designation"),
  purposeOfVisit: text("purpose_of_visit").notNull(),
  department: text("department").notNull(),
  division: text("division"),
  building: text("building"),
  visitDate: text("visit_date").notNull(),
  visitTime: text("visit_time").notNull(),
  expectedDuration: text("expected_duration"),
  personToMeet: text("person_to_meet").notNull(),
  carryingDevices: boolean("carrying_devices").notNull().default(false),
  devices: jsonb("devices").notNull().default([]),
  status: text("status").notNull().default("submitted"),
  rejectionReason: text("rejection_reason"),
  statusHistory: jsonb("status_history").notNull().default([]),
  currentReviewer: text("current_reviewer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVisitorRequestSchema = createInsertSchema(visitorRequestsTable).omit({
  id: true,
  requestId: true,
  status: true,
  statusHistory: true,
  currentReviewer: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVisitorRequest = z.infer<typeof insertVisitorRequestSchema>;
export type VisitorRequest = typeof visitorRequestsTable.$inferSelect;
