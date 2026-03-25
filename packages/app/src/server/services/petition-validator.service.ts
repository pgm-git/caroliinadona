/**
 * Petition Validation Service
 * Validates petitions before export
 */

export interface ValidationResult {
  isValid: boolean;
  passedChecks: number;
  totalChecks: number;
  warnings: ValidationWarning[];
  canExport: boolean;
}

export interface ValidationWarning {
  id: string;
  level: "warning" | "error" | "info";
  message: string;
  field?: string;
}

export const petitionValidatorService = {
  /**
   * Validate petition content
   */
  validatePetition(contentHtml: string, contentText: string): ValidationResult {
    const checks: ValidationWarning[] = [];
    let passedChecks = 0;
    const totalChecks = 10;

    // Check 1: HTML content present
    if (contentHtml && contentHtml.length > 100) {
      passedChecks++;
    } else {
      checks.push({
        id: "content_missing",
        level: "error",
        message: "Conteúdo da petição muito curto",
        field: "contentHtml",
      });
    }

    // Check 2: Text content present
    if (contentText && contentText.length > 200) {
      passedChecks++;
    } else {
      checks.push({
        id: "text_too_short",
        level: "error",
        message: "Texto da petição muito curto (mínimo 200 caracteres)",
        field: "contentText",
      });
    }

    // Check 3: Basic formatting (headers)
    if (contentHtml.includes("<h1") || contentHtml.includes("<h2")) {
      passedChecks++;
    } else {
      checks.push({
        id: "no_headers",
        level: "warning",
        message: "Petição não possui títulos ou seções",
        field: "contentHtml",
      });
    }

    // Check 4: Required sections (common legal sections)
    const requiredSections = [
      "parte",
      "fato",
      "direito",
      "pedido",
      "conclusão",
    ];
    const textLower = contentText.toLowerCase();
    const foundSections = requiredSections.filter((section) =>
      textLower.includes(section)
    ).length;

    if (foundSections >= 3) {
      passedChecks++;
    } else {
      checks.push({
        id: "missing_sections",
        level: "warning",
        message: `Apenas ${foundSections} de ${requiredSections.length} seções padrão encontradas`,
        field: "contentText",
      });
    }

    // Check 5: Paragraph count
    const paragraphCount = (contentHtml.match(/<p/g) || []).length;
    if (paragraphCount >= 5) {
      passedChecks++;
    } else {
      checks.push({
        id: "few_paragraphs",
        level: "warning",
        message: `Poucos parágrafos (${paragraphCount}), recomendado mínimo 5`,
      });
    }

    // Check 6: Formatting (bold, emphasis)
    if (contentHtml.includes("<strong") || contentHtml.includes("<b")) {
      passedChecks++;
    } else {
      checks.push({
        id: "no_emphasis",
        level: "info",
        message: "Nenhuma ênfase (bold/italic) detectada",
      });
    }

    // Check 7: No incomplete HTML tags
    const openTags = (contentHtml.match(/<[a-z]+/gi) || []).length;
    const closeTags = (contentHtml.match(/<\/[a-z]+>/gi) || []).length;
    if (Math.abs(openTags - closeTags) <= 2) {
      // Allow some tolerance
      passedChecks++;
    } else {
      checks.push({
        id: "malformed_html",
        level: "error",
        message: "HTML contém tags não fechadas",
        field: "contentHtml",
      });
    }

    // Check 8: No obvious placeholder text
    if (
      !contentText.includes("{{") &&
      !contentText.includes("}}") &&
      !contentText.includes("[PLACEHOLDER")
    ) {
      passedChecks++;
    } else {
      checks.push({
        id: "placeholder_text",
        level: "error",
        message: "Petição contém placeholders não preenchidos",
        field: "contentText",
      });
    }

    // Check 9: Reasonable length (not too long)
    if (contentText.length < 20000) {
      passedChecks++;
    } else {
      checks.push({
        id: "too_long",
        level: "warning",
        message: "Petição é muito longa (>20K caracteres)",
      });
    }

    // Check 10: Contains dates
    const datePattern = /\d{1,2}[/.-]\d{1,2}[/.-]\d{4}/;
    if (datePattern.test(contentText)) {
      passedChecks++;
    } else {
      checks.push({
        id: "no_dates",
        level: "info",
        message: "Nenhuma data detectada na petição",
      });
    }

    const isValid = passedChecks >= 8; // 80% pass rate
    const canExport =
      checks.filter((c) => c.level === "error").length === 0 &&
      passedChecks >= 7; // No critical errors + 70% pass

    return {
      isValid,
      passedChecks,
      totalChecks,
      warnings: checks,
      canExport,
    };
  },

  /**
   * Get validation summary
   */
  getValidationSummary(result: ValidationResult): {
    score: number;
    status: "approved" | "concerns" | "blocked";
    message: string;
  } {
    const score = Math.round((result.passedChecks / result.totalChecks) * 100);

    if (result.canExport) {
      return {
        score,
        status: "approved",
        message: "Petição pronta para exportação",
      };
    }

    if (result.passedChecks >= 6) {
      return {
        score,
        status: "concerns",
        message: "Petição tem algumas advertências, revise antes de exportar",
      };
    }

    return {
      score,
      status: "blocked",
      message: "Petição não atende aos critérios mínimos de qualidade",
    };
  },
};
