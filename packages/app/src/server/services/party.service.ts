import { db } from "@/server/db/client";
import { parties } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import type { ExtractedParty } from "@/server/config/extraction-schemas";

interface IdentifiedParty {
  role: "CREDOR" | "DEVEDOR" | "AVALISTA" | "FIADOR" | "CODEVEDORA" | "REPRESENTANTE_LEGAL";
  isPrimary: boolean;
  data: ExtractedParty;
}

function isCnpj(doc: string | null): boolean {
  if (!doc) return false;
  const digits = doc.replace(/\D/g, "");
  return digits.length === 14;
}

function cleanCpfCnpj(value: string | number | null): string | null {
  if (value === null || value === undefined) return null;
  return String(value).replace(/\D/g, "") || null;
}

export class PartyService {
  /**
   * Identify and persist parties from extracted fields.
   */
  async identifyParties(
    extractedFields: Record<string, unknown>,
    caseId: string,
    orgId: string
  ): Promise<number> {
    const identified: IdentifiedParty[] = [];
    const fields = extractedFields as Record<string, unknown>;

    // Extract devedor
    if (fields.devedor && typeof fields.devedor === "object") {
      identified.push({
        role: "DEVEDOR",
        isPrimary: true,
        data: fields.devedor as ExtractedParty,
      });
    }

    // Extract avalista
    if (fields.avalista && typeof fields.avalista === "object") {
      const avalista = fields.avalista as ExtractedParty;
      if (avalista.nome?.value) {
        identified.push({
          role: "AVALISTA",
          isPrimary: false,
          data: avalista,
        });
      }
    }

    // Extract credor
    if (fields.credor && typeof fields.credor === "object") {
      identified.push({
        role: "CREDOR",
        isPrimary: false,
        data: fields.credor as ExtractedParty,
      });
    }

    // Extract emitente (nota promissória)
    if (fields.emitente && typeof fields.emitente === "object") {
      identified.push({
        role: "DEVEDOR",
        isPrimary: true,
        data: fields.emitente as ExtractedParty,
      });
    }

    // Extract beneficiario (nota promissória)
    if (fields.beneficiario && typeof fields.beneficiario === "object") {
      identified.push({
        role: "CREDOR",
        isPrimary: false,
        data: fields.beneficiario as ExtractedParty,
      });
    }

    let count = 0;
    for (const party of identified) {
      await this.upsertParty(party, caseId, orgId);
      count++;
    }

    console.log(
      `[party] Identified ${count} parties for case ${caseId}`
    );
    return count;
  }

  /**
   * Upsert a party — deduplicate by CPF/CNPJ within the case.
   */
  private async upsertParty(
    party: IdentifiedParty,
    caseId: string,
    orgId: string
  ): Promise<void> {
    const cpfCnpj = cleanCpfCnpj(party.data.cpfCnpj?.value ?? null);
    const fullName = String(party.data.nome?.value ?? "Desconhecido");
    const address = String(party.data.endereco?.value ?? "");
    const personType = isCnpj(cpfCnpj) ? "PJ" : "PF";

    // Check for existing party with same CPF/CNPJ in this case
    if (cpfCnpj) {
      const field = personType === "PJ" ? parties.cnpj : parties.cpf;
      const [existing] = await db
        .select({ id: parties.id })
        .from(parties)
        .where(
          and(
            eq(parties.caseId, caseId),
            eq(parties.orgId, orgId),
            eq(field, cpfCnpj)
          )
        )
        .limit(1);

      if (existing) {
        // Update existing party
        await db
          .update(parties)
          .set({
            fullName,
            role: party.role as typeof parties.$inferInsert.role,
            isPrimary: party.isPrimary,
            addressStreet: address || undefined,
            updatedAt: new Date(),
          })
          .where(eq(parties.id, existing.id));
        return;
      }
    }

    // Insert new party
    await db.insert(parties).values({
      orgId,
      caseId,
      role: party.role as typeof parties.$inferInsert.role,
      personType: personType as typeof parties.$inferInsert.personType,
      isPrimary: party.isPrimary,
      fullName,
      cpf: personType === "PF" ? cpfCnpj : null,
      cnpj: personType === "PJ" ? cpfCnpj : null,
      addressStreet: address || null,
      metadata: {},
    });
  }
}

export const partyService = new PartyService();
