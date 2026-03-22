import type {
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
// SELECT TYPES (dados lidos do banco)
// =============================================================================

export type Organization = typeof organizations.$inferSelect;
export type User = typeof users.$inferSelect;
export type OrgMember = typeof orgMembers.$inferSelect;
export type Court = typeof courts.$inferSelect;
export type Case = typeof cases.$inferSelect;
export type Party = typeof parties.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type ExtractedData = typeof extractedData.$inferSelect;
export type Validation = typeof validations.$inferSelect;
export type Calculation = typeof calculations.$inferSelect;
export type StatusHistory = typeof statusHistory.$inferSelect;
export type PetitionTemplate = typeof petitionTemplates.$inferSelect;
export type Petition = typeof petitions.$inferSelect;
export type Exception = typeof exceptions.$inferSelect;
export type AuditLog = typeof auditLog.$inferSelect;

// =============================================================================
// INSERT TYPES (dados para inserir no banco)
// =============================================================================

export type NewOrganization = typeof organizations.$inferInsert;
export type NewUser = typeof users.$inferInsert;
export type NewOrgMember = typeof orgMembers.$inferInsert;
export type NewCourt = typeof courts.$inferInsert;
export type NewCase = typeof cases.$inferInsert;
export type NewParty = typeof parties.$inferInsert;
export type NewDocument = typeof documents.$inferInsert;
export type NewExtractedData = typeof extractedData.$inferInsert;
export type NewValidation = typeof validations.$inferInsert;
export type NewCalculation = typeof calculations.$inferInsert;
export type NewStatusHistory = typeof statusHistory.$inferInsert;
export type NewPetitionTemplate = typeof petitionTemplates.$inferInsert;
export type NewPetition = typeof petitions.$inferInsert;
export type NewException = typeof exceptions.$inferInsert;
export type NewAuditLog = typeof auditLog.$inferInsert;
