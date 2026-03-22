export const ROLES = ["admin", "coordinator", "lawyer", "intern"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  coordinator: "Coordenador",
  lawyer: "Advogado",
  intern: "Estagiário",
};
