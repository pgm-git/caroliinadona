import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  timestamp,
  integer,
  bigint,
  decimal,
  date,
  jsonb,
  inet,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import {
  caseStatusEnum,
  caseTypeEnum,
  documentTypeEnum,
  partyRoleEnum,
  personTypeEnum,
  exceptionTypeEnum,
  exceptionSeverityEnum,
  exceptionStatusEnum,
  userRoleEnum,
  validationStatusEnum,
  correctionIndexEnum,
  petitionStatusEnum,
  auditActionEnum,
} from "./enums";

// =============================================================================
// ORGANIZATIONS
// =============================================================================

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    cnpj: varchar("cnpj", { length: 18 }).unique(),
    oabNumber: varchar("oab_number", { length: 20 }),
    email: text("email"),
    phone: varchar("phone", { length: 20 }),
    website: text("website"),
    addressStreet: text("address_street"),
    addressNumber: varchar("address_number", { length: 20 }),
    addressComplement: varchar("address_complement", { length: 100 }),
    addressNeighborhood: varchar("address_neighborhood", { length: 100 }),
    addressCity: varchar("address_city", { length: 100 }),
    addressState: varchar("address_state", { length: 2 }),
    addressZip: varchar("address_zip", { length: 10 }),
    settings: jsonb("settings").notNull().default({}),
    plan: text("plan").notNull().default("starter"),
    maxUsers: integer("max_users").notNull().default(5),
    maxCasesPerMonth: integer("max_cases_per_month").notNull().default(100),
    storageLimitGb: integer("storage_limit_gb").notNull().default(10),
    lgpdDpoName: text("lgpd_dpo_name"),
    lgpdDpoEmail: text("lgpd_dpo_email"),
    lgpdPrivacyPolicyUrl: text("lgpd_privacy_policy_url"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_organizations_is_active").on(table.isActive),
    index("idx_organizations_plan").on(table.plan),
  ]
);

// =============================================================================
// USERS
// =============================================================================

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: varchar("phone", { length: 20 }),
    avatarUrl: text("avatar_url"),
    oabNumber: varchar("oab_number", { length: 20 }),
    oabState: varchar("oab_state", { length: 2 }),
    preferences: jsonb("preferences").notNull().default({}),
    lgpdConsentAt: timestamp("lgpd_consent_at", { withTimezone: true }),
    lgpdConsentVersion: text("lgpd_consent_version"),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_users_email").on(table.email),
    index("idx_users_is_active").on(table.isActive),
  ]
);

// =============================================================================
// ORG_MEMBERS
// =============================================================================

export const orgMembers = pgTable(
  "org_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: userRoleEnum("role").notNull().default("intern"),
    permissions: jsonb("permissions").notNull().default([]),
    isActive: boolean("is_active").notNull().default(true),
    invitedAt: timestamp("invited_at", { withTimezone: true }),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("org_members_org_id_user_id_unique").on(
      table.orgId,
      table.userId
    ),
    index("idx_org_members_user_id").on(table.userId),
    index("idx_org_members_org_id").on(table.orgId),
    index("idx_org_members_role").on(table.orgId, table.role),
  ]
);

// =============================================================================
// COURTS
// =============================================================================

export const courts = pgTable(
  "courts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    code: varchar("code", { length: 20 }),
    comarca: text("comarca").notNull(),
    vara: text("vara"),
    district: text("district"),
    tribunalName: text("tribunal_name").notNull(),
    tribunalAcronym: varchar("tribunal_acronym", { length: 10 }).notNull(),
    justiceType: text("justice_type").notNull().default("estadual"),
    state: varchar("state", { length: 2 }).notNull(),
    city: text("city").notNull(),
    address: text("address"),
    zipCode: varchar("zip_code", { length: 10 }),
    electronicFiling: boolean("electronic_filing").notNull().default(false),
    filingSystem: text("filing_system"),
    filingUrl: text("filing_url"),
    phone: varchar("phone", { length: 20 }),
    email: text("email"),
    businessHours: text("business_hours"),
    notes: text("notes"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_courts_tribunal").on(table.tribunalAcronym),
    index("idx_courts_state").on(table.state),
    index("idx_courts_comarca").on(table.comarca),
    index("idx_courts_state_comarca").on(table.state, table.comarca),
  ]
);

// =============================================================================
// CASES
// =============================================================================

export const cases = pgTable(
  "cases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    caseNumber: varchar("case_number", { length: 50 }),
    internalReference: varchar("internal_reference", { length: 50 }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    caseType: caseTypeEnum("case_type").notNull(),
    status: caseStatusEnum("status").notNull().default("received"),
    priority: integer("priority").notNull().default(3),
    courtId: uuid("court_id").references(() => courts.id, {
      onDelete: "set null",
    }),
    jurisdictionNotes: text("jurisdiction_notes"),
    principalAmount: decimal("principal_amount", {
      precision: 15,
      scale: 2,
    }),
    interestAmount: decimal("interest_amount", { precision: 15, scale: 2 }),
    correctionAmount: decimal("correction_amount", {
      precision: 15,
      scale: 2,
    }),
    feesAmount: decimal("fees_amount", { precision: 15, scale: 2 }),
    totalAmount: decimal("total_amount", { precision: 15, scale: 2 }),
    currency: varchar("currency", { length: 3 }).notNull().default("BRL"),
    contractNumber: varchar("contract_number", { length: 100 }),
    contractDate: date("contract_date"),
    dueDate: date("due_date"),
    defaultDate: date("default_date"),
    correctionIndex: correctionIndexEnum("correction_index"),
    interestRate: decimal("interest_rate", { precision: 8, scale: 4 }),
    penaltyRate: decimal("penalty_rate", { precision: 8, scale: 4 }),
    calculationBaseDate: date("calculation_base_date"),
    assignedLawyerId: uuid("assigned_lawyer_id").references(() => users.id, {
      onDelete: "set null",
    }),
    assignedInternId: uuid("assigned_intern_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow(),
    analysisStartedAt: timestamp("analysis_started_at", {
      withTimezone: true,
    }),
    extractionCompletedAt: timestamp("extraction_completed_at", {
      withTimezone: true,
    }),
    validationCompletedAt: timestamp("validation_completed_at", {
      withTimezone: true,
    }),
    calculationCompletedAt: timestamp("calculation_completed_at", {
      withTimezone: true,
    }),
    petitionGeneratedAt: timestamp("petition_generated_at", {
      withTimezone: true,
    }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    filedAt: timestamp("filed_at", { withTimezone: true }),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_cases_org_id").on(table.orgId),
    index("idx_cases_org_status").on(table.orgId, table.status),
    uniqueIndex("idx_cases_org_internal_ref").on(
      table.orgId,
      table.internalReference
    ),
    index("idx_cases_org_type_status").on(
      table.orgId,
      table.caseType,
      table.status
    ),
    index("idx_cases_org_priority").on(
      table.orgId,
      table.priority,
      table.createdAt
    ),
  ]
);

// =============================================================================
// PARTIES
// =============================================================================

export const parties = pgTable(
  "parties",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    role: partyRoleEnum("role").notNull(),
    personType: personTypeEnum("person_type").notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    fullName: text("full_name").notNull(),
    cpf: varchar("cpf", { length: 14 }),
    rg: varchar("rg", { length: 20 }),
    rgIssuer: varchar("rg_issuer", { length: 20 }),
    birthDate: date("birth_date"),
    nationality: varchar("nationality", { length: 50 }).default("brasileira"),
    maritalStatus: varchar("marital_status", { length: 20 }),
    profession: varchar("profession", { length: 100 }),
    companyName: text("company_name"),
    tradeName: text("trade_name"),
    cnpj: varchar("cnpj", { length: 18 }),
    stateRegistration: varchar("state_registration", { length: 20 }),
    legalRepresentative: text("legal_representative"),
    email: text("email"),
    phone: varchar("phone", { length: 20 }),
    mobile: varchar("mobile", { length: 20 }),
    addressStreet: text("address_street"),
    addressNumber: varchar("address_number", { length: 20 }),
    addressComplement: varchar("address_complement", { length: 100 }),
    addressNeighborhood: varchar("address_neighborhood", { length: 100 }),
    addressCity: varchar("address_city", { length: 100 }),
    addressState: varchar("address_state", { length: 2 }),
    addressZip: varchar("address_zip", { length: 10 }),
    altAddressStreet: text("alt_address_street"),
    altAddressCity: varchar("alt_address_city", { length: 100 }),
    altAddressState: varchar("alt_address_state", { length: 2 }),
    altAddressZip: varchar("alt_address_zip", { length: 10 }),
    bankName: varchar("bank_name", { length: 100 }),
    bankBranch: varchar("bank_branch", { length: 20 }),
    bankAccount: varchar("bank_account", { length: 30 }),
    bankAccountType: varchar("bank_account_type", { length: 20 }),
    metadata: jsonb("metadata").notNull().default({}),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_parties_org_id").on(table.orgId),
    index("idx_parties_case_id").on(table.caseId),
    index("idx_parties_case_role").on(table.caseId, table.role),
    index("idx_parties_org_cpf").on(table.orgId, table.cpf),
    index("idx_parties_org_cnpj").on(table.orgId, table.cnpj),
  ]
);

// =============================================================================
// DOCUMENTS
// =============================================================================

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    documentType: documentTypeEnum("document_type").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    storageBucket: text("storage_bucket").notNull().default("case-documents"),
    storagePath: text("storage_path").notNull(),
    originalFilename: text("original_filename").notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    fileSizeBytes: bigint("file_size_bytes", { mode: "number" }).notNull(),
    fileHash: varchar("file_hash", { length: 64 }),
    isProcessed: boolean("is_processed").notNull().default(false),
    processingStartedAt: timestamp("processing_started_at", {
      withTimezone: true,
    }),
    processingCompletedAt: timestamp("processing_completed_at", {
      withTimezone: true,
    }),
    processingError: text("processing_error"),
    ocrText: text("ocr_text"),
    aiClassification: documentTypeEnum("ai_classification"),
    aiConfidence: decimal("ai_confidence", { precision: 5, scale: 4 }),
    version: integer("version").notNull().default(1),
    parentDocumentId: uuid("parent_document_id"),
    metadata: jsonb("metadata").notNull().default({}),
    uploadedBy: uuid("uploaded_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_documents_org_id").on(table.orgId),
    index("idx_documents_case_id").on(table.caseId),
    index("idx_documents_case_type").on(table.caseId, table.documentType),
    uniqueIndex("idx_documents_storage_path").on(table.storagePath),
  ]
);

// =============================================================================
// EXTRACTED_DATA
// =============================================================================

export const extractedData = pgTable(
  "extracted_data",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    extractionModel: text("extraction_model").notNull(),
    extractionVersion: text("extraction_version").notNull(),
    extractionPromptHash: varchar("extraction_prompt_hash", { length: 64 }),
    confidenceScore: decimal("confidence_score", {
      precision: 5,
      scale: 4,
    }).notNull(),
    extractedFields: jsonb("extracted_fields").notNull().default({}),
    rawExtraction: text("raw_extraction"),
    isApproved: boolean("is_approved"),
    approvedBy: uuid("approved_by").references(() => users.id),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_extracted_data_org").on(table.orgId),
    index("idx_extracted_data_case").on(table.caseId),
    index("idx_extracted_data_document").on(table.documentId),
    index("idx_extracted_data_case_doc").on(table.caseId, table.documentId),
  ]
);

// =============================================================================
// VALIDATIONS
// =============================================================================

export const validations = pgTable(
  "validations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    extractedDataId: uuid("extracted_data_id").references(
      () => extractedData.id,
      { onDelete: "set null" }
    ),
    ruleCode: varchar("rule_code", { length: 50 }).notNull(),
    ruleName: text("rule_name").notNull(),
    ruleCategory: text("rule_category").notNull(),
    ruleDescription: text("rule_description"),
    status: validationStatusEnum("status").notNull().default("pending"),
    severity: exceptionSeverityEnum("severity").notNull().default("medium"),
    fieldName: text("field_name"),
    expectedValue: text("expected_value"),
    actualValue: text("actual_value"),
    message: text("message").notNull(),
    details: jsonb("details").default({}),
    resolvedBy: uuid("resolved_by").references(() => users.id),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolutionNotes: text("resolution_notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_validations_org").on(table.orgId),
    index("idx_validations_case").on(table.caseId),
    index("idx_validations_case_status").on(table.caseId, table.status),
    index("idx_validations_rule").on(table.ruleCode),
  ]
);

// =============================================================================
// CALCULATIONS
// =============================================================================

export const calculations = pgTable(
  "calculations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    principalAmount: decimal("principal_amount", {
      precision: 15,
      scale: 2,
    }).notNull(),
    contractDate: date("contract_date").notNull(),
    defaultDate: date("default_date").notNull(),
    calculationDate: date("calculation_date").notNull(),
    correctionIndex: correctionIndexEnum("correction_index").notNull(),
    interestRateMonthly: decimal("interest_rate_monthly", {
      precision: 8,
      scale: 6,
    }).notNull(),
    penaltyRate: decimal("penalty_rate", { precision: 8, scale: 4 })
      .notNull()
      .default("0"),
    attorneyFeesRate: decimal("attorney_fees_rate", {
      precision: 8,
      scale: 4,
    })
      .notNull()
      .default("0"),
    correctedAmount: decimal("corrected_amount", {
      precision: 15,
      scale: 2,
    }).notNull(),
    interestAmount: decimal("interest_amount", {
      precision: 15,
      scale: 2,
    }).notNull(),
    penaltyAmount: decimal("penalty_amount", {
      precision: 15,
      scale: 2,
    }).notNull(),
    attorneyFeesAmount: decimal("attorney_fees_amount", {
      precision: 15,
      scale: 2,
    }).notNull(),
    courtCosts: decimal("court_costs", { precision: 15, scale: 2 })
      .notNull()
      .default("0"),
    otherCharges: decimal("other_charges", { precision: 15, scale: 2 })
      .notNull()
      .default("0"),
    totalAmount: decimal("total_amount", {
      precision: 15,
      scale: 2,
    }).notNull(),
    monthlyBreakdown: jsonb("monthly_breakdown").notNull().default([]),
    indexValues: jsonb("index_values").notNull().default({}),
    isCurrent: boolean("is_current").notNull().default(true),
    version: integer("version").notNull().default(1),
    supersededBy: uuid("superseded_by"),
    isValidated: boolean("is_validated").notNull().default(false),
    validatedBy: uuid("validated_by").references(() => users.id),
    validatedAt: timestamp("validated_at", { withTimezone: true }),
    validationNotes: text("validation_notes"),
    calculatedBy: uuid("calculated_by").references(() => users.id),
    calculationMethod: text("calculation_method")
      .notNull()
      .default("automated"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_calculations_org").on(table.orgId),
    index("idx_calculations_case").on(table.caseId),
    uniqueIndex("idx_calculations_one_current")
      .on(table.caseId)
      .where(sql`is_current = true`),
  ]
);

// =============================================================================
// STATUS_HISTORY
// =============================================================================

export const statusHistory = pgTable(
  "status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    previousStatus: text("previous_status").notNull(),
    newStatus: text("new_status").notNull(),
    changedBy: uuid("changed_by").references(() => users.id),
    reason: text("reason"),
    metadata: jsonb("metadata").default({}),
    changedAt: timestamp("changed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_status_history_org").on(table.orgId),
    index("idx_status_history_case").on(table.caseId),
    index("idx_status_history_case_at").on(table.caseId, table.changedAt),
  ]
);

// =============================================================================
// PETITION_TEMPLATES
// =============================================================================

export const petitionTemplates = pgTable(
  "petition_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    description: text("description"),
    templateCode: varchar("template_code", { length: 50 }).notNull(),
    version: integer("version").notNull().default(1),
    caseType: caseTypeEnum("case_type").notNull(),
    applicableDocumentTypes: text("applicable_document_types")
      .array()
      .notNull()
      .default(sql`'{}'`),
    templateBody: text("template_body").notNull(),
    templateFormat: text("template_format").notNull().default("html"),
    requiredVariables: jsonb("required_variables").notNull().default([]),
    courtState: varchar("court_state", { length: 2 }),
    tribunalAcronym: varchar("tribunal_acronym", { length: 10 }),
    isActive: boolean("is_active").notNull().default(true),
    isSystem: boolean("is_system").notNull().default(false),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_petition_templates_org").on(table.orgId),
    index("idx_petition_templates_type").on(table.caseType),
    index("idx_petition_templates_code").on(table.templateCode),
  ]
);

// =============================================================================
// PETITIONS
// =============================================================================

export const petitions = pgTable(
  "petitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    templateId: uuid("template_id").references(() => petitionTemplates.id, {
      onDelete: "set null",
    }),
    calculationId: uuid("calculation_id").references(() => calculations.id, {
      onDelete: "set null",
    }),
    courtId: uuid("court_id").references(() => courts.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    petitionType: text("petition_type").notNull(),
    version: integer("version").notNull().default(1),
    contentHtml: text("content_html"),
    contentText: text("content_text"),
    variablesUsed: jsonb("variables_used").notNull().default({}),
    storageBucket: text("storage_bucket").default("petitions"),
    storagePath: text("storage_path"),
    fileSizeBytes: bigint("file_size_bytes", { mode: "number" }),
    status: petitionStatusEnum("status").notNull().default("draft"),
    generatedBy: text("generated_by").notNull().default("ai"),
    aiModel: text("ai_model"),
    generationPromptHash: varchar("generation_prompt_hash", { length: 64 }),
    reviewedBy: uuid("reviewed_by").references(() => users.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewNotes: text("review_notes"),
    changesMade: jsonb("changes_made").default([]),
    filedBy: uuid("filed_by").references(() => users.id),
    filedAt: timestamp("filed_at", { withTimezone: true }),
    filingNumber: varchar("filing_number", { length: 50 }),
    filingCourtId: uuid("filing_court_id").references(() => courts.id),
    filingReceiptPath: text("filing_receipt_path"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_petitions_org").on(table.orgId),
    index("idx_petitions_case").on(table.caseId),
    index("idx_petitions_case_status").on(table.caseId, table.status),
    index("idx_petitions_status").on(table.orgId, table.status),
  ]
);

// =============================================================================
// EXCEPTIONS
// =============================================================================

export const exceptions = pgTable(
  "exceptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    documentId: uuid("document_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    validationId: uuid("validation_id").references(() => validations.id, {
      onDelete: "set null",
    }),
    exceptionType: exceptionTypeEnum("exception_type").notNull(),
    severity: exceptionSeverityEnum("severity").notNull().default("medium"),
    status: exceptionStatusEnum("status").notNull().default("open"),
    title: text("title").notNull(),
    description: text("description").notNull(),
    affectedField: text("affected_field"),
    suggestedAction: text("suggested_action"),
    autoResolvable: boolean("auto_resolvable").notNull().default(false),
    resolvedBy: uuid("resolved_by").references(() => users.id),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolutionNotes: text("resolution_notes"),
    resolutionAction: text("resolution_action"),
    blocksPipeline: boolean("blocks_pipeline").notNull().default(true),
    pipelineStep: text("pipeline_step"),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_exceptions_org").on(table.orgId),
    index("idx_exceptions_case").on(table.caseId),
    index("idx_exceptions_case_status").on(table.caseId, table.status),
    index("idx_exceptions_type").on(table.orgId, table.exceptionType),
  ]
);

// =============================================================================
// AUDIT_LOG
// =============================================================================

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    action: auditActionEnum("action").notNull(),
    tableName: text("table_name").notNull(),
    recordId: uuid("record_id"),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    userEmail: text("user_email"),
    userRole: text("user_role"),
    ipAddress: inet("ip_address"),
    userAgent: text("user_agent"),
    oldData: jsonb("old_data"),
    newData: jsonb("new_data"),
    changedFields: text("changed_fields").array(),
    description: text("description"),
    metadata: jsonb("metadata").default({}),
    containsPii: boolean("contains_pii").notNull().default(false),
    dataSubjectId: uuid("data_subject_id"),
    legalBasis: text("legal_basis"),
    retentionUntil: timestamp("retention_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_audit_log_org").on(table.orgId),
    index("idx_audit_log_action").on(table.action, table.createdAt),
    index("idx_audit_log_org_table").on(
      table.orgId,
      table.tableName,
      table.createdAt
    ),
    index("idx_audit_log_org_timeline").on(table.orgId, table.createdAt),
  ]
);
