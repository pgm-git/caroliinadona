import { pgEnum } from "drizzle-orm/pg-core";

export const caseStatusEnum = pgEnum("case_status", [
  "received",
  "analyzing",
  "extraction_complete",
  "validation_pending",
  "validated",
  "calculation_pending",
  "calculated",
  "petition_generating",
  "petition_generated",
  "reviewed",
  "filed",
  "exception",
]);

export const caseTypeEnum = pgEnum("case_type", ["execution", "collection"]);

export const documentTypeEnum = pgEnum("document_type", [
  "credit_certificate",
  "contract",
  "guarantee",
  "promissory_note",
  "check",
  "duplicate",
  "debenture",
  "bank_statement",
  "notification",
  "power_of_attorney",
  "amendment",
  "collateral_document",
  "other",
]);

export const partyRoleEnum = pgEnum("party_role", [
  "debtor",
  "guarantor",
  "creditor",
  "co_debtor",
  "surety",
  "assignee",
  "assignor",
]);

export const personTypeEnum = pgEnum("person_type", ["individual", "company"]);

export const exceptionTypeEnum = pgEnum("exception_type", [
  "missing_signature",
  "incomplete_data",
  "atypical_action",
  "invalid_document",
  "expired_statute",
  "insufficient_guarantee",
  "duplicate_case",
  "jurisdiction_conflict",
  "calculation_error",
  "missing_document",
  "data_inconsistency",
  "other",
]);

export const exceptionSeverityEnum = pgEnum("exception_severity", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const exceptionStatusEnum = pgEnum("exception_status", [
  "open",
  "in_review",
  "resolved",
  "dismissed",
]);

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "coordinator",
  "lawyer",
  "intern",
]);

export const validationStatusEnum = pgEnum("validation_status", [
  "pending",
  "passed",
  "failed",
  "warning",
]);

export const correctionIndexEnum = pgEnum("correction_index", [
  "igpm",
  "ipca",
  "inpc",
  "selic",
  "cdi",
  "tr",
  "tjlp",
  "custom",
]);

export const petitionStatusEnum = pgEnum("petition_status", [
  "draft",
  "generated",
  "reviewing",
  "approved",
  "filed",
  "rejected",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "INSERT",
  "UPDATE",
  "DELETE",
  "STATUS_CHANGE",
  "LOGIN",
  "EXPORT",
  "DOCUMENT_UPLOAD",
  "DOCUMENT_DOWNLOAD",
  "PETITION_GENERATE",
  "PETITION_FILE",
]);
