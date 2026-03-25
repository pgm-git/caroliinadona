import { db } from "@/server/db/client";
import { cases as casesTable } from "@/server/db/schema";
import { eq, and, count, sql } from "drizzle-orm";

export interface CaseData {
  id: string;
  internalReference: string;
  title: string;
  caseType: string;
  status: string;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  description?: string | null;
}

export interface CasesReportOptions {
  orgId: string;
  status?: string;
  caseType?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CaseSummary {
  id: string;
  internalReference: string;
  title: string;
  description?: string | null;
  caseType: string;
  status: string;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  caseNumber?: string | null;
  courtId?: string | null;
}

/**
 * Service for generating reports
 */
export const reportsService = {
  /**
   * Generate CSV content from cases
   */
  async generateCasesCSV(options: CasesReportOptions): Promise<string> {
    // Fetch all cases first, then filter in memory to avoid type issues
    const allCases = await db
      .select()
      .from(casesTable)
      .where(eq(casesTable.orgId, options.orgId));

    // Filter in memory
    const cases = allCases.filter((c) => {
      if (options.status && c.status !== options.status) {
        return false;
      }
      if (options.caseType && c.caseType !== options.caseType) {
        return false;
      }
      return true;
    });

    // Generate CSV header
    const headers = [
      "ID Interno",
      "Título",
      "Tipo",
      "Status",
      "Prioridade",
      "Data Criação",
      "Data Atualização",
    ];

    // Generate CSV rows
    const rows = cases.map((c) => [
      c.internalReference || "",
      `"${c.title.replace(/"/g, '""')}"`, // Escape quotes in CSV
      c.caseType || "",
      c.status || "",
      c.priority.toString(),
      c.createdAt.toLocaleDateString("pt-BR"),
      c.updatedAt.toLocaleDateString("pt-BR"),
    ]);

    // Combine header and rows
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    return csv;
  },

  /**
   * Get case summary for PDF generation
   */
  async getCaseSummary(caseId: string, orgId: string) {
    const [caseData] = await db
      .select()
      .from(casesTable)
      .where(and(eq(casesTable.id, caseId), eq(casesTable.orgId, orgId)));

    if (!caseData) {
      return null;
    }

    return {
      id: caseData.id,
      internalReference: caseData.internalReference,
      title: caseData.title,
      description: caseData.description,
      caseType: caseData.caseType,
      status: caseData.status,
      priority: caseData.priority,
      createdAt: caseData.createdAt,
      updatedAt: caseData.updatedAt,
      caseNumber: caseData.caseNumber,
      courtId: caseData.courtId,
    };
  },

  /**
   * Generate HTML for case summary PDF
   */
  generateCaseSummaryHTML(caseData: CaseSummary | null): string {
    if (!caseData) {
      return "<html><body>Case not found</body></html>";
    }

    const statusColor: Record<string, string> = {
      received: "#6B7280",
      analyzing: "#3B82F6",
      extraction_complete: "#10B981",
      validation_pending: "#F59E0B",
      validated: "#10B981",
      calculated: "#10B981",
      petition_generated: "#A78BFA",
      filed: "#10B981",
      exception: "#EF4444",
    };

    const color = statusColor[caseData.status] || "#6B7280";

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: "Times New Roman", Times, serif;
            line-height: 1.5;
            margin: 3cm;
            color: #333;
          }
          .header {
            border-bottom: 2px solid #333;
            padding-bottom: 1.5cm;
            margin-bottom: 1.5cm;
          }
          h1 {
            margin: 0;
            font-size: 24px;
          }
          .subtitle {
            color: #666;
            font-size: 14px;
            margin-top: 0.5cm;
          }
          .metadata {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1cm;
            margin: 1.5cm 0;
          }
          .metadata-item {
            background: #f5f5f5;
            padding: 0.5cm;
            border-radius: 4px;
          }
          .metadata-label {
            font-weight: bold;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
          }
          .metadata-value {
            font-size: 14px;
            margin-top: 0.25cm;
          }
          .status-badge {
            display: inline-block;
            background-color: ${color};
            color: white;
            padding: 0.25cm 0.5cm;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .description {
            margin: 1.5cm 0;
            padding: 1cm;
            background: #fafafa;
            border-left: 3px solid ${color};
          }
          .section-title {
            font-weight: bold;
            font-size: 16px;
            margin-top: 1.5cm;
            margin-bottom: 0.5cm;
            border-bottom: 1px solid #ddd;
            padding-bottom: 0.25cm;
          }
          .footer {
            margin-top: 2cm;
            border-top: 1px solid #ddd;
            padding-top: 1cm;
            font-size: 12px;
            color: #999;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${caseData.title}</h1>
          <p class="subtitle">Ref: ${caseData.internalReference}</p>
        </div>

        <div class="metadata">
          <div class="metadata-item">
            <div class="metadata-label">Tipo de Ação</div>
            <div class="metadata-value">
              ${caseData.caseType === "execution" ? "Execução" : "Cobrança"}
            </div>
          </div>
          <div class="metadata-item">
            <div class="metadata-label">Status</div>
            <div class="metadata-value">
              <span class="status-badge">${caseData.status.replace(/_/g, " ")}</span>
            </div>
          </div>
          <div class="metadata-item">
            <div class="metadata-label">Prioridade</div>
            <div class="metadata-value">${caseData.priority}/5</div>
          </div>
          <div class="metadata-item">
            <div class="metadata-label">Número do Processo</div>
            <div class="metadata-value">${caseData.caseNumber || "—"}</div>
          </div>
          <div class="metadata-item">
            <div class="metadata-label">Data de Abertura</div>
            <div class="metadata-value">
              ${caseData.createdAt.toLocaleDateString("pt-BR")}
            </div>
          </div>
          <div class="metadata-item">
            <div class="metadata-label">Última Atualização</div>
            <div class="metadata-value">
              ${caseData.updatedAt.toLocaleDateString("pt-BR")}
            </div>
          </div>
        </div>

        ${
          caseData.description
            ? `
          <div class="section-title">Descrição</div>
          <div class="description">
            ${caseData.description}
          </div>
        `
            : ""
        }

        <div class="footer">
          <p>
            Documento gerado automaticamente por Carolina em
            ${new Date().toLocaleString("pt-BR")}
          </p>
        </div>
      </body>
    </html>
    `;
  },

  /**
   * Generate basic statistics report
   */
  async generateStatisticsReport(orgId: string) {
    // Get total count
    const [totalCount] = await db
      .select({ value: count() })
      .from(casesTable)
      .where(eq(casesTable.orgId, orgId));

    // Get status breakdown (simplified - would need proper count() with groupBy)
    const casesByStatus = await db
      .select()
      .from(casesTable)
      .where(eq(casesTable.orgId, orgId));

    // Group manually
    const statusMap: Record<string, number> = {};
    casesByStatus.forEach((c) => {
      statusMap[c.status] = (statusMap[c.status] || 0) + 1;
    });

    return {
      totalCases: totalCount?.value || 0,
      statusBreakdown: Object.entries(statusMap).map(([status, count]) => ({
        status,
        count,
      })),
      generatedAt: new Date(),
    };
  },
};
