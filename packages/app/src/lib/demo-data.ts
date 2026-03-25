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
    createdBy: DEMO_USER_ID,
    createdAt: new Date(now.getTime() - 15 * day),
    updatedAt: new Date(now.getTime() - 2 * day),
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
    createdBy: DEMO_USER_ID,
    createdAt: new Date(now.getTime() - 12 * day),
    updatedAt: new Date(now.getTime() - 3 * day),
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
    createdBy: DEMO_USER_ID,
    createdAt: new Date(now.getTime() - 10 * day),
    updatedAt: new Date(now.getTime() - 4 * day),
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
    createdBy: DEMO_USER_ID,
    createdAt: new Date(now.getTime() - 7 * day),
    updatedAt: new Date(now.getTime() - 5 * day),
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
    createdBy: DEMO_USER_ID,
    createdAt: new Date(now.getTime() - 3 * day),
    updatedAt: new Date(now.getTime() - 1 * day),
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
    createdBy: DEMO_USER_ID,
    createdAt: new Date(now.getTime() - 30 * day),
    updatedAt: new Date(now.getTime() - 1 * day),
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
    createdBy: DEMO_USER_ID,
    createdAt: new Date(now.getTime() - 5 * day),
    updatedAt: new Date(now.getTime() - 1 * day),
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
    createdBy: DEMO_USER_ID,
    createdAt: new Date(now.getTime() - 6 * day),
    updatedAt: new Date(now.getTime() - 2 * day),
  },
];

export const DEMO_EXCEPTIONS = [
  {
    id: demoId(201),
    orgId: DEMO_ORG_ID,
    caseId: demoId(107),
    title: "CPF invalido - devedor principal",
    description:
      "O CPF informado no documento (123.456.789-00) nao passou na validacao de digitos verificadores. Necessario revisao manual do documento fonte.",
    exceptionType: "cpf_invalid" as const,
    severity: "high" as const,
    status: "open" as const,
    createdBy: DEMO_USER_ID,
    resolvedBy: null,
    resolvedAt: null,
    resolution: null,
    createdAt: new Date(now.getTime() - 5 * day),
    updatedAt: new Date(now.getTime() - 5 * day),
  },
  {
    id: demoId(202),
    orgId: DEMO_ORG_ID,
    caseId: demoId(103),
    title: "Prescricao proxima - prazo de 30 dias",
    description:
      "O titulo esta proximo do prazo prescricional. Data de vencimento: 25/04/2026. Priorizar protocolamento.",
    exceptionType: "prescription_warning" as const,
    severity: "critical" as const,
    status: "open" as const,
    createdBy: DEMO_USER_ID,
    resolvedBy: null,
    resolvedAt: null,
    resolution: null,
    createdAt: new Date(now.getTime() - 2 * day),
    updatedAt: new Date(now.getTime() - 2 * day),
  },
];

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

  return {
    items,
    page: params.page,
    pageSize: params.pageSize,
    total,
  };
}
