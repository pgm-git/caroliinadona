/**
 * Template renderer para petições.
 * Faz merge de variáveis em templates HTML com placeholders {{variable}}.
 */

export interface TemplateVariable {
  name: string;
  description?: string;
  required: boolean;
}

export interface RenderResult {
  html: string;
  missingVariables: string[];
}

/**
 * Renderiza template HTML substituindo placeholders {{variable}} pelos valores fornecidos.
 *
 * @param templateHtml - HTML com placeholders {{variable}}
 * @param variables - Objeto com valores das variáveis
 * @param requiredVariables - Array de nomes das variáveis obrigatórias
 * @returns Objeto com HTML renderizado e lista de variáveis faltantes
 */
export function renderTemplate(
  templateHtml: string,
  variables: Record<string, unknown>,
  requiredVariables: string[] = []
): RenderResult {
  let html = templateHtml;
  const missingVariables: string[] = [];

  // Encontra todos os placeholders {{variable}} no template
  const placeholderRegex = /\{\{(\w+)\}\}/g;
  const placeholders = new Set<string>();
  let match;

  while ((match = placeholderRegex.exec(templateHtml)) !== null) {
    placeholders.add(match[1]);
  }

  // Substitui cada placeholder pelos valores correspondentes
  for (const placeholder of placeholders) {
    const value = variables[placeholder];

    if (value === undefined || value === null) {
      if (requiredVariables.includes(placeholder)) {
        missingVariables.push(placeholder);
      }
      // Se não obrigatória, deixa placeholder como está (será deletado depois)
      continue;
    }

    // Converte valor para string de forma segura
    const stringValue = formatVariableValue(value);
    html = html.replace(new RegExp(`\\{\\{${placeholder}\\}\\}`, "g"), stringValue);
  }

  // Remove placeholders não utilizados (de variáveis não obrigatórias)
  html = html.replace(/\{\{(\w+)\}\}/g, "");

  return {
    html,
    missingVariables,
  };
}

/**
 * Formata valor de variável para string, tratando diferentes tipos.
 */
function formatVariableValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return value.toString();
  }
  if (typeof value === "boolean") {
    return value ? "Sim" : "Não";
  }
  if (value instanceof Date) {
    return value.toLocaleDateString("pt-BR");
  }
  if (Array.isArray(value)) {
    return value.map((v) => formatVariableValue(v)).join(", ");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * Valida se todas as variáveis obrigatórias estão presentes no objeto de variáveis.
 *
 * @param variables - Objeto com valores das variáveis
 * @param requiredVariables - Array de nomes das variáveis obrigatórias
 * @returns Array de variáveis faltantes
 */
export function validateVariables(
  variables: Record<string, unknown>,
  requiredVariables: string[]
): string[] {
  const missing: string[] = [];

  for (const varName of requiredVariables) {
    const value = variables[varName];
    if (value === undefined || value === null || value === "") {
      missing.push(varName);
    }
  }

  return missing;
}

/**
 * Extrai lista de placeholders {{variable}} de um template HTML.
 */
export function extractPlaceholders(templateHtml: string): string[] {
  const placeholderRegex = /\{\{(\w+)\}\}/g;
  const placeholders: string[] = [];
  let match;

  while ((match = placeholderRegex.exec(templateHtml)) !== null) {
    if (!placeholders.includes(match[1])) {
      placeholders.push(match[1]);
    }
  }

  return placeholders;
}
