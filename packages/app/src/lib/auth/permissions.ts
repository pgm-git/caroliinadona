import type { Role } from "./roles";

export type Action = "create" | "read" | "update" | "delete";
export type Resource =
  | "cases"
  | "documents"
  | "petitions"
  | "templates"
  | "settings"
  | "users";

type PermissionMap = Record<Role, Partial<Record<Resource, Action[]>>>;

export const PERMISSIONS: PermissionMap = {
  admin: {
    cases: ["create", "read", "update", "delete"],
    documents: ["create", "read", "update", "delete"],
    petitions: ["create", "read", "update", "delete"],
    templates: ["create", "read", "update", "delete"],
    settings: ["create", "read", "update", "delete"],
    users: ["create", "read", "update", "delete"],
  },
  coordinator: {
    cases: ["create", "read", "update", "delete"],
    documents: ["create", "read", "update", "delete"],
    petitions: ["create", "read", "update", "delete"],
    templates: ["read"],
    settings: ["read"],
    users: ["read"],
  },
  lawyer: {
    cases: ["create", "read", "update"],
    documents: ["create", "read", "update"],
    petitions: ["read"],
  },
  intern: {
    cases: ["read"],
    documents: ["create", "read"],
  },
};
