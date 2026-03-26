/**
 * Demo mode mock data
 * Used when the demo-session cookie is present
 */

const DEMO_ORG_ID = "demo-org-00000000-0000-0000-0000-000000000001";
const DEMO_USER_ID = "demo-user-00000000-0000-0000-0000-000000000001";

export const DEMO_USER = {
  id: DEMO_USER_ID,
  email: "demo@carolina.app",
};

export const DEMO_ORG = DEMO_ORG_ID;
export const DEMO_ROLE = "admin" as const;

// Generate deterministic UUIDs for demo
function demoId(n: number) {
  return `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
}

const now = new Date();
const day = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// CASES
// ---------------------------------------------------------------------------

export const DEMO_CASES = [
  {
    id: demoId(101),
    orgId: DEMO_ORG_ID,
    internalReference: "EXEC-2026-001",
    title: "Execucao CCB - Banco Alpha vs. Jose da Silva",
    caseType: "execution" as const,
    status: "petition_generated" as const,
    description: "Execucao de titulo extrajudicial - CCB no valor de R$ 150.000,00",
    priority: 5,
    courtId: null,
    caseNumber: null,
    jurisdictionNotes: null,
    principalAmount: "150000.00",
    interestAmount: "12300.00",
    correctionAmount: "8500.00",
    feesAmount: "17080.00",
    totalAmount: "187880.00",
    currency: "BRL",
    contractNumber: "CCB-2024-00123",
    contractDate: "2024-01-15",
    dueDate: "2024-07-15",
    defaultDate: "2024-08-01",
    correctionIndex: "inpc" as const,
    interestRate: "0.0100",
    penaltyRate: "0.02",
    calculationBaseDate: "2026-03-26",
    assignedLawyerId: DEMO_USER_ID,
    assignedInternId: null,
    createdBy: DEMO_USER_ID,
    receivedAt: new Date(now.getTime() - 15 * day),
    analysisStartedAt: new Date(now.getTime() - 14 * day),
    extractionCompletedAt: new Date(now.getTime() - 13 * day),
    validationCompletedAt: new Date(now.getTime() - 12 * day),
    calculationCompletedAt: new Date(now.getTime() - 10 * day),
    petitionGeneratedAt: new Date(now.getTime() - 8 * day),
    reviewedAt: null,
    filedAt: null,
    metadata: {},
    createdAt: new Date(now.getTime() - 15 * day),
    updatedAt: new Date(now.getTime() - 2 * day),
    deletedAt: null,
  },
  {
    id: demoId(102),
    orgId: DEMO_ORG_ID,
    internalReference: "EXEC-2026-002",
    title: "Execucao CCB - Banco Beta vs. Maria Santos",
    caseType: "execution" as const,
    status: "calculated" as const,
    description: "Cedula de credito bancario com garantia fidejussoria",
    priority: 4,
    courtId: null,
    caseNumber: null,
    jurisdictionNotes: null,
    principalAmount: "85000.00",
    interestAmount: "6200.00",
    correctionAmount: "4100.00",
    feesAmount: "9532.00",
    totalAmount: "104832.00",
    currency: "BRL",
    contractNumber: "CCB-2024-00456",
    contractDate: "2024-03-20",
    dueDate: "2024-09-20",
    defaultDate: "2024-10-05",
    correctionIndex: "igpm" as const,
    interestRate: "0.0085",
    penaltyRate: "0.02",
    calculationBaseDate: "2026-03-26",
    assignedLawyerId: DEMO_USER_ID,
    assignedInternId: null,
    createdBy: DEMO_USER_ID,
    receivedAt: new Date(now.getTime() - 12 * day),
    analysisStartedAt: new Date(now.getTime() - 11 * day),
    extractionCompletedAt: new Date(now.getTime() - 10 * day),
    validationCompletedAt: new Date(now.getTime() - 9 * day),
    calculationCompletedAt: new Date(now.getTime() - 7 * day),
    petitionGeneratedAt: null,
    reviewedAt: null,
    filedAt: null,
    metadata: {},
    createdAt: new Date(now.getTime() - 12 * day),
    updatedAt: new Date(now.getTime() - 3 * day),
    deletedAt: null,
  },
  {
    id: demoId(103),
    orgId: DEMO_ORG_ID,
    internalReference: "COB-2026-001",
    title: "Cobranca - Banco Gamma vs. Tech Solutions LTDA",
    caseType: "collection" as const,
    status: "validated" as const,
    description: "Acao de cobranca por inadimplencia contratual",
    priority: 3,
    courtId: null,
    caseNumber: null,
    jurisdictionNotes: null,
    principalAmount: "42000.00",
    interestAmount: null,
    correctionAmount: null,
    feesAmount: null,
    totalAmount: null,
    currency: "BRL",
    contractNumber: "CONT-2024-00789",
    contractDate: "2023-11-01",
    dueDate: "2024-05-01",
    defaultDate: "2024-05-15",
    correctionIndex: "ipca" as const,
    interestRate: "0.0100",
    penaltyRate: "0.02",
    calculationBaseDate: null,
    assignedLawyerId: DEMO_USER_ID,
    assignedInternId: null,
    createdBy: DEMO_USER_ID,
    receivedAt: new Date(now.getTime() - 10 * day),
    analysisStartedAt: new Date(now.getTime() - 9 * day),
    extractionCompletedAt: new Date(now.getTime() - 8 * day),
    validationCompletedAt: new Date(now.getTime() - 6 * day),
    calculationCompletedAt: null,
    petitionGeneratedAt: null,
    reviewedAt: null,
    filedAt: null,
    metadata: {},
    createdAt: new Date(now.getTime() - 10 * day),
    updatedAt: new Date(now.getTime() - 4 * day),
    deletedAt: null,
  },
  {
    id: demoId(104),
    orgId: DEMO_ORG_ID,
    internalReference: "EXEC-2026-003",
    title: "Execucao CCB - Banco Delta vs. Carlos Oliveira",
    caseType: "execution" as const,
    status: "analyzing" as const,
    description: "Titulo extrajudicial com clausula de juros compostos",
    priority: 3,
    courtId: null,
    caseNumber: null,
    jurisdictionNotes: null,
    principalAmount: "67500.00",
    interestAmount: null,
    correctionAmount: null,
    feesAmount: null,
    totalAmount: null,
    currency: "BRL",
    contractNumber: "CCB-2024-00901",
    contractDate: "2024-04-10",
    dueDate: "2024-10-10",
    defaultDate: null,
    correctionIndex: "cdi" as const,
    interestRate: "0.0120",
    penaltyRate: "0.02",
    calculationBaseDate: null,
    assignedLawyerId: DEMO_USER_ID,
    assignedInternId: null,
    createdBy: DEMO_USER_ID,
    receivedAt: new Date(now.getTime() - 7 * day),
    analysisStartedAt: new Date(now.getTime() - 6 * day),
    extractionCompletedAt: null,
    validationCompletedAt: null,
    calculationCompletedAt: null,
    petitionGeneratedAt: null,
    reviewedAt: null,
    filedAt: null,
    metadata: {},
    createdAt: new Date(now.getTime() - 7 * day),
    updatedAt: new Date(now.getTime() - 5 * day),
    deletedAt: null,
  },
  {
    id: demoId(105),
    orgId: DEMO_ORG_ID,
    internalReference: "COB-2026-002",
    title: "Cobranca - Banco Epsilon vs. Ana Costa ME",
    caseType: "collection" as const,
    status: "received" as const,
    description: "Cobranca de debito em conta corrente",
    priority: 2,
    courtId: null,
    caseNumber: null,
    jurisdictionNotes: null,
    principalAmount: "18500.00",
    interestAmount: null,
    correctionAmount: null,
    feesAmount: null,
    totalAmount: null,
    currency: "BRL",
    contractNumber: "CONT-2025-00112",
    contractDate: "2025-01-15",
    dueDate: "2025-07-15",
    defaultDate: null,
    correctionIndex: null,
    interestRate: null,
    penaltyRate: null,
    calculationBaseDate: null,
    assignedLawyerId: null,
    assignedInternId: null,
    createdBy: DEMO_USER_ID,
    receivedAt: new Date(now.getTime() - 3 * day),
    analysisStartedAt: null,
    extractionCompletedAt: null,
    validationCompletedAt: null,
    calculationCompletedAt: null,
    petitionGeneratedAt: null,
    reviewedAt: null,
    filedAt: null,
    metadata: {},
    createdAt: new Date(now.getTime() - 3 * day),
    updatedAt: new Date(now.getTime() - 1 * day),
    deletedAt: null,
  },
  {
    id: demoId(106),
    orgId: DEMO_ORG_ID,
    internalReference: "EXEC-2026-004",
    title: "Execucao CCB - Banco Zeta vs. Roberto Lima",
    caseType: "execution" as const,
    status: "filed" as const,
    description: "Execucao protocolada junto ao TJ-SP - 5a Vara Civel",
    priority: 5,
    courtId: null,
    caseNumber: "1023456-78.2026.8.26.0100",
    jurisdictionNotes: "5a Vara Civel do Foro Central - Sao Paulo/SP",
    principalAmount: "220000.00",
    interestAmount: "19800.00",
    correctionAmount: "14300.00",
    feesAmount: "25414.00",
    totalAmount: "279514.00",
    currency: "BRL",
    contractNumber: "CCB-2023-00567",
    contractDate: "2023-06-01",
    dueDate: "2023-12-01",
    defaultDate: "2023-12-20",
    correctionIndex: "igpm" as const,
    interestRate: "0.0100",
    penaltyRate: "0.02",
    calculationBaseDate: "2026-02-15",
    assignedLawyerId: DEMO_USER_ID,
    assignedInternId: null,
    createdBy: DEMO_USER_ID,
    receivedAt: new Date(now.getTime() - 30 * day),
    analysisStartedAt: new Date(now.getTime() - 29 * day),
    extractionCompletedAt: new Date(now.getTime() - 28 * day),
    validationCompletedAt: new Date(now.getTime() - 27 * day),
    calculationCompletedAt: new Date(now.getTime() - 25 * day),
    petitionGeneratedAt: new Date(now.getTime() - 20 * day),
    reviewedAt: new Date(now.getTime() - 15 * day),
    filedAt: new Date(now.getTime() - 10 * day),
    metadata: {},
    createdAt: new Date(now.getTime() - 30 * day),
    updatedAt: new Date(now.getTime() - 1 * day),
    deletedAt: null,
  },
  {
    id: demoId(107),
    orgId: DEMO_ORG_ID,
    internalReference: "EXEC-2026-005",
    title: "Execucao CCB - Banco Eta vs. Fernanda Souza",
    caseType: "execution" as const,
    status: "exception" as const,
    description: "Pendencia na validacao de CPF do devedor",
    priority: 4,
    courtId: null,
    caseNumber: null,
    jurisdictionNotes: null,
    principalAmount: "95000.00",
    interestAmount: null,
    correctionAmount: null,
    feesAmount: null,
    totalAmount: null,
    currency: "BRL",
    contractNumber: "CCB-2024-01234",
    contractDate: "2024-02-28",
    dueDate: "2024-08-28",
    defaultDate: "2024-09-10",
    correctionIndex: "inpc" as const,
    interestRate: "0.0100",
    penaltyRate: "0.02",
    calculationBaseDate: null,
    assignedLawyerId: DEMO_USER_ID,
    assignedInternId: null,
    createdBy: DEMO_USER_ID,
    receivedAt: new Date(now.getTime() - 5 * day),
    analysisStartedAt: new Date(now.getTime() - 4 * day),
    extractionCompletedAt: new Date(now.getTime() - 3 * day),
    validationCompletedAt: null,
    calculationCompletedAt: null,
    petitionGeneratedAt: null,
    reviewedAt: null,
    filedAt: null,
    metadata: {},
    createdAt: new Date(now.getTime() - 5 * day),
    updatedAt: new Date(now.getTime() - 1 * day),
    deletedAt: null,
  },
  {
    id: demoId(108),
    orgId: DEMO_ORG_ID,
    internalReference: "COB-2026-003",
    title: "Cobranca - Banco Theta vs. Paulo Mendes",
    caseType: "collection" as const,
    status: "extraction_complete" as const,
    description: "Extracao de dados concluida, aguardando validacao",
    priority: 3,
    courtId: null,
    caseNumber: null,
    jurisdictionNotes: null,
    principalAmount: "33000.00",
    interestAmount: null,
    correctionAmount: null,
    feesAmount: null,
    totalAmount: null,
    currency: "BRL",
    contractNumber: "CONT-2024-00990",
    contractDate: "2024-05-20",
    dueDate: "2024-11-20",
    defaultDate: "2024-12-01",
    correctionIndex: "ipca" as const,
    interestRate: "0.0100",
    penaltyRate: "0.02",
    calculationBaseDate: null,
    assignedLawyerId: DEMO_USER_ID,
    assignedInternId: null,
    createdBy: DEMO_USER_ID,
    receivedAt: new Date(now.getTime() - 6 * day),
    analysisStartedAt: new Date(now.getTime() - 5 * day),
    extractionCompletedAt: new Date(now.getTime() - 4 * day),
    validationCompletedAt: null,
    calculationCompletedAt: null,
    petitionGeneratedAt: null,
    reviewedAt: null,
    filedAt: null,
    metadata: {},
    createdAt: new Date(now.getTime() - 6 * day),
    updatedAt: new Date(now.getTime() - 2 * day),
    deletedAt: null,
  },
];

// ---------------------------------------------------------------------------
// EXCEPTIONS
// ---------------------------------------------------------------------------

export const DEMO_EXCEPTIONS = [
  {
    id: demoId(201),
    orgId: DEMO_ORG_ID,
    caseId: demoId(107),
    documentId: null,
    validationId: null,
    exceptionType: "cpf_invalid" as const,
    severity: "high" as const,
    status: "open" as const,
    title: "CPF invalido - devedor principal",
    description:
      "O CPF informado no documento (123.456.789-00) nao passou na validacao de digitos verificadores. Necessario revisao manual do documento fonte.",
    affectedField: "cpf",
    suggestedAction: "Solicitar documento original e verificar CPF com a Receita Federal.",
    autoResolvable: false,
    resolvedBy: null,
    resolvedAt: null,
    resolutionNotes: null,
    resolutionAction: null,
    blocksPipeline: true,
    pipelineStep: "validation",
    metadata: {},
    createdAt: new Date(now.getTime() - 5 * day),
    updatedAt: new Date(now.getTime() - 5 * day),
  },
  {
    id: demoId(202),
    orgId: DEMO_ORG_ID,
    caseId: demoId(103),
    documentId: null,
    validationId: null,
    exceptionType: "prescription_warning" as const,
    severity: "critical" as const,
    status: "open" as const,
    title: "Prescricao proxima - prazo de 30 dias",
    description:
      "O titulo esta proximo do prazo prescricional. Data de vencimento: 25/04/2026. Priorizar protocolamento.",
    affectedField: "dueDate",
    suggestedAction: "Priorizar geracao de peticao e protocolo imediato.",
    autoResolvable: false,
    resolvedBy: null,
    resolvedAt: null,
    resolutionNotes: null,
    resolutionAction: null,
    blocksPipeline: false,
    pipelineStep: "workflow",
    metadata: {},
    createdAt: new Date(now.getTime() - 2 * day),
    updatedAt: new Date(now.getTime() - 2 * day),
  },
];

// ---------------------------------------------------------------------------
// NOTIFICATIONS
// ---------------------------------------------------------------------------

export const DEMO_NOTIFICATIONS = [
  {
    id: demoId(301),
    userId: DEMO_USER_ID,
    type: "status_change" as const,
    title: "Caso EXEC-2026-001 atualizado",
    message: "Status alterado para Peticao Gerada",
    isRead: false,
    caseId: demoId(101),
    createdAt: new Date(now.getTime() - 2 * day),
  },
  {
    id: demoId(302),
    userId: DEMO_USER_ID,
    type: "document_processed" as const,
    title: "Documento processado",
    message: "OCR e extracao concluidos para CCB #COB-2026-003",
    isRead: false,
    caseId: demoId(108),
    createdAt: new Date(now.getTime() - 3 * day),
  },
  {
    id: demoId(303),
    userId: DEMO_USER_ID,
    type: "exception_created" as const,
    title: "Nova excecao criada",
    message: "CPF invalido detectado no caso EXEC-2026-005",
    isRead: true,
    caseId: demoId(107),
    createdAt: new Date(now.getTime() - 5 * day),
  },
];

// ---------------------------------------------------------------------------
// DOCUMENTS
// ---------------------------------------------------------------------------

export const DEMO_DOCUMENTS = [
  {
    id: demoId(401),
    orgId: DEMO_ORG_ID,
    caseId: demoId(101),
    documentType: "ccb" as const,
    title: "CCB - Jose da Silva",
    description: "Cedula de Credito Bancario original",
    storageBucket: "case-documents",
    storagePath: "demo/101/ccb-jose-da-silva.pdf",
    originalFilename: "ccb-jose-da-silva.pdf",
    mimeType: "application/pdf",
    fileSizeBytes: 245780,
    fileHash: "abc123demo",
    isProcessed: true,
    processingStartedAt: new Date(now.getTime() - 14 * day),
    processingCompletedAt: new Date(now.getTime() - 14 * day + 30000),
    processingError: null,
    ocrText: "CEDULA DE CREDITO BANCARIO\nDevedor: Jose Carlos da Silva\nCPF: 123.456.789-01\nValor: R$ 150.000,00",
    aiClassification: "ccb" as const,
    aiConfidence: "0.9850",
    version: 1,
    parentDocumentId: null,
    metadata: {},
    uploadedBy: DEMO_USER_ID,
    createdAt: new Date(now.getTime() - 15 * day),
    updatedAt: new Date(now.getTime() - 14 * day),
    deletedAt: null,
  },
  {
    id: demoId(402),
    orgId: DEMO_ORG_ID,
    caseId: demoId(101),
    documentType: "procuracao" as const,
    title: "Procuracao Ad Judicia",
    description: "Procuracao com poderes especiais para representacao judicial",
    storageBucket: "case-documents",
    storagePath: "demo/101/procuracao.pdf",
    originalFilename: "procuracao.pdf",
    mimeType: "application/pdf",
    fileSizeBytes: 98450,
    fileHash: "def456demo",
    isProcessed: true,
    processingStartedAt: new Date(now.getTime() - 14 * day),
    processingCompletedAt: new Date(now.getTime() - 14 * day + 15000),
    processingError: null,
    ocrText: "PROCURACAO AD JUDICIA\nOutorgante: Banco Alpha S.A.\nOutorgado: Dr. Rafael Costa, OAB/SP 123456",
    aiClassification: "procuracao" as const,
    aiConfidence: "0.9920",
    version: 1,
    parentDocumentId: null,
    metadata: {},
    uploadedBy: DEMO_USER_ID,
    createdAt: new Date(now.getTime() - 15 * day),
    updatedAt: new Date(now.getTime() - 14 * day),
    deletedAt: null,
  },
  {
    id: demoId(403),
    orgId: DEMO_ORG_ID,
    caseId: demoId(102),
    documentType: "ccb" as const,
    title: "CCB - Maria Santos",
    description: "Cedula de Credito Bancario com garantia fidejussoria",
    storageBucket: "case-documents",
    storagePath: "demo/102/ccb-maria-santos.pdf",
    originalFilename: "ccb-maria-santos.pdf",
    mimeType: "application/pdf",
    fileSizeBytes: 312000,
    fileHash: "ghi789demo",
    isProcessed: true,
    processingStartedAt: new Date(now.getTime() - 11 * day),
    processingCompletedAt: new Date(now.getTime() - 11 * day + 45000),
    processingError: null,
    ocrText: "CEDULA DE CREDITO BANCARIO\nDevedor: Maria das Gracas Santos\nCPF: 234.567.890-12\nValor: R$ 85.000,00",
    aiClassification: "ccb" as const,
    aiConfidence: "0.9780",
    version: 1,
    parentDocumentId: null,
    metadata: {},
    uploadedBy: DEMO_USER_ID,
    createdAt: new Date(now.getTime() - 12 * day),
    updatedAt: new Date(now.getTime() - 11 * day),
    deletedAt: null,
  },
  {
    id: demoId(404),
    orgId: DEMO_ORG_ID,
    caseId: demoId(107),
    documentType: "ccb" as const,
    title: "CCB - Fernanda Souza (CPF invalido)",
    description: "CCB com pendencia de validacao de CPF",
    storageBucket: "case-documents",
    storagePath: "demo/107/ccb-fernanda-souza.pdf",
    originalFilename: "ccb-fernanda-souza.pdf",
    mimeType: "application/pdf",
    fileSizeBytes: 188000,
    fileHash: "jkl012demo",
    isProcessed: true,
    processingStartedAt: new Date(now.getTime() - 4 * day),
    processingCompletedAt: new Date(now.getTime() - 4 * day + 55000),
    processingError: null,
    ocrText: "CEDULA DE CREDITO BANCARIO\nDevedor: Fernanda Souza\nCPF: 123.456.789-00\nValor: R$ 95.000,00",
    aiClassification: "ccb" as const,
    aiConfidence: "0.8640",
    version: 1,
    parentDocumentId: null,
    metadata: {},
    uploadedBy: DEMO_USER_ID,
    createdAt: new Date(now.getTime() - 5 * day),
    updatedAt: new Date(now.getTime() - 4 * day),
    deletedAt: null,
  },
];

// ---------------------------------------------------------------------------
// PARTIES
// ---------------------------------------------------------------------------

export const DEMO_PARTIES = [
  {
    id: demoId(501),
    orgId: DEMO_ORG_ID,
    caseId: demoId(101),
    role: "defendant" as const,
    personType: "individual" as const,
    isPrimary: true,
    fullName: "Jose Carlos da Silva",
    cpf: "123.456.789-01",
    rg: "12.345.678-9",
    rgIssuer: "SSP/SP",
    birthDate: "1975-03-15",
    nationality: "brasileira",
    maritalStatus: "casado",
    profession: "Empresario",
    companyName: null,
    tradeName: null,
    cnpj: null,
    stateRegistration: null,
    legalRepresentative: null,
    email: "jose.silva@email.com",
    phone: "(11) 3456-7890",
    mobile: "(11) 98765-4321",
    addressStreet: "Rua das Flores",
    addressNumber: "123",
    addressComplement: "Apto 45",
    addressNeighborhood: "Jardim Paulista",
    addressCity: "Sao Paulo",
    addressState: "SP",
    addressZip: "01310-100",
    altAddressStreet: null,
    altAddressCity: null,
    altAddressState: null,
    altAddressZip: null,
    bankName: null,
    bankBranch: null,
    bankAccount: null,
    bankAccountType: null,
    metadata: {},
    notes: null,
    createdAt: new Date(now.getTime() - 14 * day),
    updatedAt: new Date(now.getTime() - 14 * day),
  },
  {
    id: demoId(502),
    orgId: DEMO_ORG_ID,
    caseId: demoId(101),
    role: "creditor" as const,
    personType: "legal_entity" as const,
    isPrimary: true,
    fullName: "Banco Alpha S.A.",
    cpf: null,
    rg: null,
    rgIssuer: null,
    birthDate: null,
    nationality: "brasileira",
    maritalStatus: null,
    profession: null,
    companyName: "Banco Alpha S.A.",
    tradeName: "Banco Alpha",
    cnpj: "00.000.000/0001-91",
    stateRegistration: null,
    legalRepresentative: "Dr. Rafael Costa - OAB/SP 123456",
    email: "juridico@bancoalpha.com.br",
    phone: "(11) 3000-0000",
    mobile: null,
    addressStreet: "Avenida Paulista",
    addressNumber: "1000",
    addressComplement: "1 Andar",
    addressNeighborhood: "Bela Vista",
    addressCity: "Sao Paulo",
    addressState: "SP",
    addressZip: "01310-100",
    altAddressStreet: null,
    altAddressCity: null,
    altAddressState: null,
    altAddressZip: null,
    bankName: null,
    bankBranch: null,
    bankAccount: null,
    bankAccountType: null,
    metadata: {},
    notes: null,
    createdAt: new Date(now.getTime() - 14 * day),
    updatedAt: new Date(now.getTime() - 14 * day),
  },
  {
    id: demoId(503),
    orgId: DEMO_ORG_ID,
    caseId: demoId(102),
    role: "defendant" as const,
    personType: "individual" as const,
    isPrimary: true,
    fullName: "Maria das Gracas Santos",
    cpf: "234.567.890-12",
    rg: "23.456.789-0",
    rgIssuer: "SSP/SP",
    birthDate: "1982-07-22",
    nationality: "brasileira",
    maritalStatus: "solteira",
    profession: "Gerente Comercial",
    companyName: null,
    tradeName: null,
    cnpj: null,
    stateRegistration: null,
    legalRepresentative: null,
    email: "maria.santos@email.com",
    phone: null,
    mobile: "(11) 97654-3210",
    addressStreet: "Alameda Santos",
    addressNumber: "456",
    addressComplement: null,
    addressNeighborhood: "Cerqueira Cesar",
    addressCity: "Sao Paulo",
    addressState: "SP",
    addressZip: "01419-000",
    altAddressStreet: null,
    altAddressCity: null,
    altAddressState: null,
    altAddressZip: null,
    bankName: null,
    bankBranch: null,
    bankAccount: null,
    bankAccountType: null,
    metadata: {},
    notes: null,
    createdAt: new Date(now.getTime() - 11 * day),
    updatedAt: new Date(now.getTime() - 11 * day),
  },
];

// ---------------------------------------------------------------------------
// CALCULATIONS
// ---------------------------------------------------------------------------

export const DEMO_CALCULATIONS = [
  {
    id: demoId(601),
    orgId: DEMO_ORG_ID,
    caseId: demoId(101),
    principalAmount: "150000.00",
    contractDate: "2024-01-15",
    defaultDate: "2024-08-01",
    calculationDate: "2026-03-26",
    correctionIndex: "inpc" as const,
    interestRateMonthly: "0.010000",
    penaltyRate: "0.0200",
    attorneyFeesRate: "0.1000",
    correctedAmount: "158500.00",
    interestAmount: "12300.00",
    penaltyAmount: "3000.00",
    attorneyFeesAmount: "17080.00",
    courtCosts: "1500.00",
    otherCharges: "0.00",
    totalAmount: "192380.00",
    monthlyBreakdown: [
      { month: "2024-08", indexRate: 0.0041, cumulativeFactor: 1.0041, correctedBalance: 150615, correctionInMonth: 615 },
      { month: "2024-09", indexRate: 0.0044, cumulativeFactor: 1.0085, correctedBalance: 151277.5, correctionInMonth: 662.5 },
      { month: "2024-10", indexRate: 0.0056, cumulativeFactor: 1.0142, correctedBalance: 152130, correctionInMonth: 852.5 },
      { month: "2024-11", indexRate: 0.0039, cumulativeFactor: 1.0182, correctedBalance: 152730, correctionInMonth: 600 },
      { month: "2024-12", indexRate: 0.0052, cumulativeFactor: 1.0235, correctedBalance: 153525, correctionInMonth: 795 },
      { month: "2025-01", indexRate: 0.0048, cumulativeFactor: 1.0284, correctedBalance: 154260, correctionInMonth: 735 },
      { month: "2025-02", indexRate: 0.0043, cumulativeFactor: 1.0328, correctedBalance: 154920, correctionInMonth: 660 },
      { month: "2025-03", indexRate: 0.0060, cumulativeFactor: 1.0390, correctedBalance: 155850, correctionInMonth: 930 },
    ],
    indexValues: { INPC_2024_08: 0.41, INPC_2024_09: 0.44 },
    isCurrent: true,
    version: 2,
    supersededBy: null,
    isValidated: true,
    validatedBy: DEMO_USER_ID,
    validatedAt: new Date(now.getTime() - 8 * day),
    validationNotes: "Calculo validado e aprovado para geracao de peticao.",
    calculatedBy: DEMO_USER_ID,
    calculationMethod: "automated",
    createdAt: new Date(now.getTime() - 10 * day),
    updatedAt: new Date(now.getTime() - 8 * day),
  },
  {
    id: demoId(602),
    orgId: DEMO_ORG_ID,
    caseId: demoId(102),
    principalAmount: "85000.00",
    contractDate: "2024-03-20",
    defaultDate: "2024-10-05",
    calculationDate: "2026-03-26",
    correctionIndex: "igpm" as const,
    interestRateMonthly: "0.008500",
    penaltyRate: "0.0200",
    attorneyFeesRate: "0.1000",
    correctedAmount: "89100.00",
    interestAmount: "6200.00",
    penaltyAmount: "1700.00",
    attorneyFeesAmount: "9701.00",
    courtCosts: "900.00",
    otherCharges: "0.00",
    totalAmount: "107601.00",
    monthlyBreakdown: [
      { month: "2024-10", indexRate: 0.0048, cumulativeFactor: 1.0048, correctedBalance: 85408, correctionInMonth: 408 },
      { month: "2024-11", indexRate: 0.0051, cumulativeFactor: 1.0100, correctedBalance: 85850, correctionInMonth: 442 },
      { month: "2024-12", indexRate: 0.0063, cumulativeFactor: 1.0164, correctedBalance: 86394, correctionInMonth: 544 },
    ],
    indexValues: { IGPM_2024_10: 0.48, IGPM_2024_11: 0.51 },
    isCurrent: true,
    version: 1,
    supersededBy: null,
    isValidated: false,
    validatedBy: null,
    validatedAt: null,
    validationNotes: null,
    calculatedBy: DEMO_USER_ID,
    calculationMethod: "automated",
    createdAt: new Date(now.getTime() - 7 * day),
    updatedAt: new Date(now.getTime() - 7 * day),
  },
];

// ---------------------------------------------------------------------------
// PETITIONS
// ---------------------------------------------------------------------------

export const DEMO_PETITIONS = [
  {
    id: demoId(701),
    orgId: DEMO_ORG_ID,
    caseId: demoId(101),
    templateId: null,
    calculationId: demoId(601),
    courtId: null,
    title: "Peticao Inicial - Execucao de Titulo Extrajudicial (CCB)",
    petitionType: "execution",
    version: 2,
    contentHtml: `<h1>EXCELENTISSIMO SENHOR DOUTOR JUIZ DE DIREITO DA VARA CIVEL DA COMARCA DE SAO PAULO/SP</h1>
<p><strong>BANCO ALPHA S.A.</strong>, pessoa juridica de direito privado, inscrita no CNPJ n.º 00.000.000/0001-91, com sede na Av. Paulista, 1000, vem propor</p>
<h2>ACAO DE EXECUCAO DE TITULO EXTRAJUDICIAL</h2>
<p>em face de <strong>JOSE CARLOS DA SILVA</strong>, CPF n.o 123.456.789-01, domiciliado na Rua das Flores, 123, Apto 45, Jardim Paulista, Sao Paulo/SP.</p>
<h3>I - DOS FATOS</h3>
<p>O Exequente e credor do Executado em razao de Cedula de Credito Bancario (CCB) n.o CCB-2024-00123, firmada em 15/01/2024, no valor original de R$ 150.000,00, com vencimento em 15/07/2024.</p>
<p>O debito atualizado ate a presente data totaliza <strong>R$ 192.380,00</strong>, conforme planilha de calculo em anexo.</p>
<h3>II - DO DIREITO</h3>
<p>A CCB constitui titulo executivo extrajudicial (art. 784, I, CPC). O credito e liquido, certo e exigivel.</p>
<h3>III - DOS PEDIDOS</h3>
<ol>
<li>Citacao do Executado para pagar R$ 192.380,00 em 3 dias;</li>
<li>Penhora de bens via SISBAJUD em caso de nao pagamento;</li>
<li>Honorarios advocaticios de 10% sobre o valor da execucao.</li>
</ol>
<p>Valor da causa: R$ 192.380,00</p>
<p>Sao Paulo, 26 de marco de 2026.</p>
<p><strong>Dr. Rafael Costa</strong> — OAB/SP 123456</p>`,
    contentText: "Peticao Inicial — Execucao de Titulo Extrajudicial (CCB) — Banco Alpha vs. Jose da Silva",
    variablesUsed: {
      "creditor.name": "Banco Alpha S.A.",
      "defendant.name": "Jose Carlos da Silva",
      "debt.total": "R$ 192.380,00",
    },
    storageBucket: "petitions",
    storagePath: "demo/101/peticao-v2.pdf",
    fileSizeBytes: 145000,
    status: "approved" as const,
    generatedBy: "ai",
    aiModel: "gpt-4o",
    generationPromptHash: "demo-hash-001",
    reviewedBy: DEMO_USER_ID,
    reviewedAt: new Date(now.getTime() - 7 * day),
    reviewNotes: "Peticao revisada e aprovada.",
    changesMade: ["Atualizado valor total", "Corrigido endereco do devedor"],
    filedBy: null,
    filedAt: null,
    filingNumber: null,
    filingCourtId: null,
    filingReceiptPath: null,
    createdBy: DEMO_USER_ID,
    createdAt: new Date(now.getTime() - 8 * day),
    updatedAt: new Date(now.getTime() - 7 * day),
  },
];

// ---------------------------------------------------------------------------
// QUEUE ITEMS
// ---------------------------------------------------------------------------

export const DEMO_QUEUE_ITEMS = [
  {
    id: demoId(401),
    title: "CCB - Jose da Silva",
    originalFilename: "ccb-jose-da-silva.pdf",
    mimeType: "application/pdf",
    fileSizeBytes: 245780,
    documentType: "ccb",
    isProcessed: true,
    processingStartedAt: new Date(now.getTime() - 14 * day),
    processingCompletedAt: new Date(now.getTime() - 14 * day + 30000),
    processingError: null,
    createdAt: new Date(now.getTime() - 15 * day),
    caseId: demoId(101),
    caseReference: "EXEC-2026-001",
  },
  {
    id: demoId(402),
    title: "Procuracao Ad Judicia",
    originalFilename: "procuracao.pdf",
    mimeType: "application/pdf",
    fileSizeBytes: 98450,
    documentType: "procuracao",
    isProcessed: true,
    processingStartedAt: new Date(now.getTime() - 14 * day),
    processingCompletedAt: new Date(now.getTime() - 14 * day + 15000),
    processingError: null,
    createdAt: new Date(now.getTime() - 15 * day),
    caseId: demoId(101),
    caseReference: "EXEC-2026-001",
  },
  {
    id: demoId(403),
    title: "CCB - Maria Santos",
    originalFilename: "ccb-maria-santos.pdf",
    mimeType: "application/pdf",
    fileSizeBytes: 312000,
    documentType: "ccb",
    isProcessed: true,
    processingStartedAt: new Date(now.getTime() - 11 * day),
    processingCompletedAt: new Date(now.getTime() - 11 * day + 45000),
    processingError: null,
    createdAt: new Date(now.getTime() - 12 * day),
    caseId: demoId(102),
    caseReference: "EXEC-2026-002",
  },
  {
    id: demoId(404),
    title: "CCB - Fernanda Souza",
    originalFilename: "ccb-fernanda-souza.pdf",
    mimeType: "application/pdf",
    fileSizeBytes: 188000,
    documentType: "ccb",
    isProcessed: true,
    processingStartedAt: new Date(now.getTime() - 4 * day),
    processingCompletedAt: new Date(now.getTime() - 4 * day + 55000),
    processingError: null,
    createdAt: new Date(now.getTime() - 5 * day),
    caseId: demoId(107),
    caseReference: "EXEC-2026-005",
  },
  {
    id: demoId(405),
    title: "CCB - Carlos Oliveira (processando)",
    originalFilename: "ccb-carlos-oliveira.pdf",
    mimeType: "application/pdf",
    fileSizeBytes: 274000,
    documentType: "ccb",
    isProcessed: false,
    processingStartedAt: new Date(now.getTime() - 3600000),
    processingCompletedAt: null,
    processingError: null,
    createdAt: new Date(now.getTime() - 7 * day),
    caseId: demoId(104),
    caseReference: "EXEC-2026-003",
  },
  {
    id: demoId(406),
    title: "Contrato - Ana Costa ME",
    originalFilename: "contrato-anacosta.pdf",
    mimeType: "application/pdf",
    fileSizeBytes: 156000,
    documentType: "contract",
    isProcessed: false,
    processingStartedAt: null,
    processingCompletedAt: null,
    processingError: null,
    createdAt: new Date(now.getTime() - 3 * day),
    caseId: demoId(105),
    caseReference: "COB-2026-002",
  },
  {
    id: demoId(407),
    title: "CCB - Paulo Mendes (erro OCR)",
    originalFilename: "ccb-paulo-mendes.pdf",
    mimeType: "application/pdf",
    fileSizeBytes: 89000,
    documentType: "ccb",
    isProcessed: false,
    processingStartedAt: new Date(now.getTime() - 6 * day),
    processingCompletedAt: null,
    processingError: "OCR falhou: documento danificado ou ilegivel. Tente reprocessar com ajuste de orientacao.",
    createdAt: new Date(now.getTime() - 6 * day),
    caseId: demoId(108),
    caseReference: "COB-2026-003",
  },
];

// ---------------------------------------------------------------------------
// TEAM MEMBERS
// ---------------------------------------------------------------------------

export const DEMO_TEAM_MEMBERS = [
  {
    id: demoId(801),
    userId: DEMO_USER_ID,
    orgId: DEMO_ORG_ID,
    fullName: "Dr. Rafael Costa",
    email: "rafael.costa@escritorio.adv.br",
    role: "admin" as const,
    oabNumber: "123456",
    oabState: "SP",
    phone: "(11) 3000-1001",
    isActive: true,
    joinedAt: new Date(now.getTime() - 365 * day),
    avatarUrl: null,
  },
  {
    id: demoId(802),
    userId: demoId(802),
    orgId: DEMO_ORG_ID,
    fullName: "Dra. Camila Ferreira",
    email: "camila.ferreira@escritorio.adv.br",
    role: "lawyer" as const,
    oabNumber: "234567",
    oabState: "SP",
    phone: "(11) 3000-1002",
    isActive: true,
    joinedAt: new Date(now.getTime() - 180 * day),
    avatarUrl: null,
  },
  {
    id: demoId(803),
    userId: demoId(803),
    orgId: DEMO_ORG_ID,
    fullName: "Lucas Oliveira",
    email: "lucas.oliveira@escritorio.adv.br",
    role: "intern" as const,
    oabNumber: null,
    oabState: null,
    phone: "(11) 3000-1003",
    isActive: true,
    joinedAt: new Date(now.getTime() - 90 * day),
    avatarUrl: null,
  },
  {
    id: demoId(804),
    userId: demoId(804),
    orgId: DEMO_ORG_ID,
    fullName: "Sandra Mendes",
    email: "sandra.mendes@escritorio.adv.br",
    role: "coordinator" as const,
    oabNumber: "345678",
    oabState: "SP",
    phone: "(11) 3000-1004",
    isActive: true,
    joinedAt: new Date(now.getTime() - 240 * day),
    avatarUrl: null,
  },
  {
    id: demoId(805),
    userId: demoId(805),
    orgId: DEMO_ORG_ID,
    fullName: "Ana Paula Ribeiro",
    email: "ana.ribeiro@escritorio.adv.br",
    role: "lawyer" as const,
    oabNumber: "456789",
    oabState: "SP",
    phone: "(11) 3000-1005",
    isActive: false,
    joinedAt: new Date(now.getTime() - 300 * day),
    avatarUrl: null,
  },
];

// ---------------------------------------------------------------------------
// STATUS HISTORY
// ---------------------------------------------------------------------------

export const DEMO_STATUS_HISTORY = [
  {
    id: demoId(901),
    orgId: DEMO_ORG_ID,
    caseId: demoId(101),
    previousStatus: "received",
    newStatus: "analyzing",
    changedBy: DEMO_USER_ID,
    reason: "Documentos recebidos e enviados para OCR",
    metadata: {},
    changedAt: new Date(now.getTime() - 14 * day),
  },
  {
    id: demoId(902),
    orgId: DEMO_ORG_ID,
    caseId: demoId(101),
    previousStatus: "analyzing",
    newStatus: "extraction_complete",
    changedBy: DEMO_USER_ID,
    reason: "Extracao de dados concluida com 98.5% de confianca",
    metadata: {},
    changedAt: new Date(now.getTime() - 13 * day),
  },
  {
    id: demoId(903),
    orgId: DEMO_ORG_ID,
    caseId: demoId(101),
    previousStatus: "extraction_complete",
    newStatus: "validated",
    changedBy: DEMO_USER_ID,
    reason: "Validacao aprovada: todos os campos obrigatorios presentes",
    metadata: {},
    changedAt: new Date(now.getTime() - 12 * day),
  },
  {
    id: demoId(904),
    orgId: DEMO_ORG_ID,
    caseId: demoId(101),
    previousStatus: "validated",
    newStatus: "calculated",
    changedBy: DEMO_USER_ID,
    reason: "Calculo atualizado de debito realizado com indice INPC",
    metadata: {},
    changedAt: new Date(now.getTime() - 10 * day),
  },
  {
    id: demoId(905),
    orgId: DEMO_ORG_ID,
    caseId: demoId(101),
    previousStatus: "calculated",
    newStatus: "petition_generated",
    changedBy: DEMO_USER_ID,
    reason: "Peticao gerada automaticamente via GPT-4o",
    metadata: {},
    changedAt: new Date(now.getTime() - 8 * day),
  },
];

// ---------------------------------------------------------------------------
// HELPER FUNCTIONS
// ---------------------------------------------------------------------------

export function getDemoMetrics() {
  const statusBreakdown = [
    { status: "received", count: 1 },
    { status: "analyzing", count: 1 },
    { status: "extraction_complete", count: 1 },
    { status: "validated", count: 1 },
    { status: "calculated", count: 1 },
    { status: "petition_generated", count: 1 },
    { status: "filed", count: 1 },
    { status: "exception", count: 1 },
  ];

  return {
    total: DEMO_CASES.length,
    statusBreakdown,
    myCases: DEMO_CASES.slice(0, 10),
    recent: DEMO_CASES.slice(0, 5),
    openExceptions: DEMO_EXCEPTIONS,
  };
}

export function getDemoCasesList(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  caseType?: string;
}) {
  let filtered = [...DEMO_CASES];

  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.internalReference.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q)
    );
  }
  if (params.status) {
    filtered = filtered.filter((c) => c.status === params.status);
  }
  if (params.caseType) {
    filtered = filtered.filter((c) => c.caseType === params.caseType);
  }

  const total = filtered.length;
  const start = (params.page - 1) * params.pageSize;
  const items = filtered.slice(start, start + params.pageSize);

  return { items, page: params.page, pageSize: params.pageSize, total };
}

export function getDemoQueueItems(params: {
  page: number;
  pageSize: number;
  status: "all" | "pending" | "processing" | "completed" | "error";
  sortOrder: "asc" | "desc";
}) {
  let filtered = [...DEMO_QUEUE_ITEMS];

  if (params.status !== "all") {
    filtered = filtered.filter((item) => {
      switch (params.status) {
        case "completed": return item.isProcessed && !item.processingError;
        case "error": return !!item.processingError;
        case "processing": return !item.isProcessed && !!item.processingStartedAt && !item.processingError;
        case "pending": return !item.isProcessed && !item.processingStartedAt && !item.processingError;
        default: return true;
      }
    });
  }

  if (params.sortOrder === "asc") {
    filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  } else {
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  const total = filtered.length;
  const start = (params.page - 1) * params.pageSize;
  const items = filtered.slice(start, start + params.pageSize);

  return { items, total, page: params.page, pageSize: params.pageSize, totalPages: Math.ceil(total / params.pageSize) };
}

export function getDemoQueueSummary() {
  const total = DEMO_QUEUE_ITEMS.length;
  const completed = DEMO_QUEUE_ITEMS.filter((i) => i.isProcessed && !i.processingError).length;
  const errors = DEMO_QUEUE_ITEMS.filter((i) => !!i.processingError).length;
  const processing = DEMO_QUEUE_ITEMS.filter((i) => !i.isProcessed && !!i.processingStartedAt && !i.processingError).length;
  const pending = DEMO_QUEUE_ITEMS.filter((i) => !i.isProcessed && !i.processingStartedAt && !i.processingError).length;
  return { total, pending, processing, completed, errors };
}

export function getDemoCaseById(id: string) {
  return DEMO_CASES.find((c) => c.id === id) ?? null;
}

export function getDemoCaseDocuments(caseId: string) {
  return DEMO_DOCUMENTS.filter((d) => d.caseId === caseId);
}

export function getDemoCaseParties(caseId: string) {
  return DEMO_PARTIES.filter((p) => p.caseId === caseId);
}

export function getDemoCaseCalculation(caseId: string) {
  return DEMO_CALCULATIONS.find((c) => c.caseId === caseId) ?? null;
}

export function getDemoCaseCalculationHistory(caseId: string) {
  return DEMO_CALCULATIONS.filter((c) => c.caseId === caseId);
}

export function getDemoCasePetition(caseId: string) {
  return DEMO_PETITIONS.find((p) => p.caseId === caseId) ?? null;
}

export function getDemoCasePetitionHistory(caseId: string) {
  return DEMO_PETITIONS.filter((p) => p.caseId === caseId);
}

export function getDemoCaseStatusHistory(caseId: string) {
  return DEMO_STATUS_HISTORY.filter((h) => h.caseId === caseId);
}

export function getDemoTeamMembers() {
  return DEMO_TEAM_MEMBERS;
}
