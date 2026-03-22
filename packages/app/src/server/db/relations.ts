import { relations } from "drizzle-orm";
import {
  organizations,
  users,
  orgMembers,
  courts,
  cases,
  parties,
  documents,
  extractedData,
  validations,
  calculations,
  statusHistory,
  petitionTemplates,
  petitions,
  exceptions,
  auditLog,
} from "./schema";

// =============================================================================
// ORGANIZATIONS
// =============================================================================

export const organizationsRelations = relations(organizations, ({ many }) => ({
  orgMembers: many(orgMembers),
  cases: many(cases),
  documents: many(documents),
  petitionTemplates: many(petitionTemplates),
  petitions: many(petitions),
  auditLogs: many(auditLog),
}));

// =============================================================================
// USERS
// =============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  orgMembers: many(orgMembers),
  assignedCasesAsLawyer: many(cases, { relationName: "assignedLawyer" }),
  assignedCasesAsIntern: many(cases, { relationName: "assignedIntern" }),
  createdCases: many(cases, { relationName: "caseCreator" }),
}));

// =============================================================================
// ORG_MEMBERS
// =============================================================================

export const orgMembersRelations = relations(orgMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [orgMembers.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [orgMembers.userId],
    references: [users.id],
  }),
}));

// =============================================================================
// CASES
// =============================================================================

export const casesRelations = relations(cases, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [cases.orgId],
    references: [organizations.id],
  }),
  court: one(courts, {
    fields: [cases.courtId],
    references: [courts.id],
  }),
  assignedLawyer: one(users, {
    fields: [cases.assignedLawyerId],
    references: [users.id],
    relationName: "assignedLawyer",
  }),
  assignedIntern: one(users, {
    fields: [cases.assignedInternId],
    references: [users.id],
    relationName: "assignedIntern",
  }),
  createdByUser: one(users, {
    fields: [cases.createdBy],
    references: [users.id],
    relationName: "caseCreator",
  }),
  parties: many(parties),
  documents: many(documents),
  extractedData: many(extractedData),
  validations: many(validations),
  calculations: many(calculations),
  statusHistory: many(statusHistory),
  petitions: many(petitions),
  exceptions: many(exceptions),
}));

// =============================================================================
// COURTS
// =============================================================================

export const courtsRelations = relations(courts, ({ many }) => ({
  cases: many(cases),
  petitions: many(petitions),
}));

// =============================================================================
// PARTIES
// =============================================================================

export const partiesRelations = relations(parties, ({ one }) => ({
  organization: one(organizations, {
    fields: [parties.orgId],
    references: [organizations.id],
  }),
  case_: one(cases, {
    fields: [parties.caseId],
    references: [cases.id],
  }),
}));

// =============================================================================
// DOCUMENTS
// =============================================================================

export const documentsRelations = relations(documents, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [documents.orgId],
    references: [organizations.id],
  }),
  case_: one(cases, {
    fields: [documents.caseId],
    references: [cases.id],
  }),
  uploadedByUser: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
  parentDocument: one(documents, {
    fields: [documents.parentDocumentId],
    references: [documents.id],
  }),
  extractedData: many(extractedData),
  exceptions: many(exceptions),
}));

// =============================================================================
// EXTRACTED_DATA
// =============================================================================

export const extractedDataRelations = relations(
  extractedData,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [extractedData.orgId],
      references: [organizations.id],
    }),
    case_: one(cases, {
      fields: [extractedData.caseId],
      references: [cases.id],
    }),
    document: one(documents, {
      fields: [extractedData.documentId],
      references: [documents.id],
    }),
    approvedByUser: one(users, {
      fields: [extractedData.approvedBy],
      references: [users.id],
    }),
    validations: many(validations),
  })
);

// =============================================================================
// VALIDATIONS
// =============================================================================

export const validationsRelations = relations(validations, ({ one }) => ({
  organization: one(organizations, {
    fields: [validations.orgId],
    references: [organizations.id],
  }),
  case_: one(cases, {
    fields: [validations.caseId],
    references: [cases.id],
  }),
  extractedDataRecord: one(extractedData, {
    fields: [validations.extractedDataId],
    references: [extractedData.id],
  }),
  resolvedByUser: one(users, {
    fields: [validations.resolvedBy],
    references: [users.id],
  }),
}));

// =============================================================================
// CALCULATIONS
// =============================================================================

export const calculationsRelations = relations(
  calculations,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [calculations.orgId],
      references: [organizations.id],
    }),
    case_: one(cases, {
      fields: [calculations.caseId],
      references: [cases.id],
    }),
    validatedByUser: one(users, {
      fields: [calculations.validatedBy],
      references: [users.id],
    }),
    calculatedByUser: one(users, {
      fields: [calculations.calculatedBy],
      references: [users.id],
    }),
    petitions: many(petitions),
  })
);

// =============================================================================
// STATUS_HISTORY
// =============================================================================

export const statusHistoryRelations = relations(statusHistory, ({ one }) => ({
  organization: one(organizations, {
    fields: [statusHistory.orgId],
    references: [organizations.id],
  }),
  case_: one(cases, {
    fields: [statusHistory.caseId],
    references: [cases.id],
  }),
  changedByUser: one(users, {
    fields: [statusHistory.changedBy],
    references: [users.id],
  }),
}));

// =============================================================================
// PETITION_TEMPLATES
// =============================================================================

export const petitionTemplatesRelations = relations(
  petitionTemplates,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [petitionTemplates.orgId],
      references: [organizations.id],
    }),
    createdByUser: one(users, {
      fields: [petitionTemplates.createdBy],
      references: [users.id],
    }),
    petitions: many(petitions),
  })
);

// =============================================================================
// PETITIONS
// =============================================================================

export const petitionsRelations = relations(petitions, ({ one }) => ({
  organization: one(organizations, {
    fields: [petitions.orgId],
    references: [organizations.id],
  }),
  case_: one(cases, {
    fields: [petitions.caseId],
    references: [cases.id],
  }),
  template: one(petitionTemplates, {
    fields: [petitions.templateId],
    references: [petitionTemplates.id],
  }),
  calculation: one(calculations, {
    fields: [petitions.calculationId],
    references: [calculations.id],
  }),
  court: one(courts, {
    fields: [petitions.courtId],
    references: [courts.id],
  }),
  reviewedByUser: one(users, {
    fields: [petitions.reviewedBy],
    references: [users.id],
  }),
  filedByUser: one(users, {
    fields: [petitions.filedBy],
    references: [users.id],
  }),
  filingCourt: one(courts, {
    fields: [petitions.filingCourtId],
    references: [courts.id],
    relationName: "filingCourt",
  }),
  createdByUser: one(users, {
    fields: [petitions.createdBy],
    references: [users.id],
  }),
}));

// =============================================================================
// EXCEPTIONS
// =============================================================================

export const exceptionsRelations = relations(exceptions, ({ one }) => ({
  organization: one(organizations, {
    fields: [exceptions.orgId],
    references: [organizations.id],
  }),
  case_: one(cases, {
    fields: [exceptions.caseId],
    references: [cases.id],
  }),
  document: one(documents, {
    fields: [exceptions.documentId],
    references: [documents.id],
  }),
  validation: one(validations, {
    fields: [exceptions.validationId],
    references: [validations.id],
  }),
  resolvedByUser: one(users, {
    fields: [exceptions.resolvedBy],
    references: [users.id],
  }),
}));

// =============================================================================
// AUDIT_LOG
// =============================================================================

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  organization: one(organizations, {
    fields: [auditLog.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id],
  }),
}));
