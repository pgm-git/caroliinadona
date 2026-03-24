"use client";

import { Badge } from "@/components/ui/badge";
import { User, Building } from "lucide-react";

interface PartyCardProps {
  role: string;
  personType: string;
  fullName: string;
  cpf: string | null;
  cnpj: string | null;
  isPrimary: boolean;
  addressStreet: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  CREDOR: "Credor",
  DEVEDOR: "Devedor",
  AVALISTA: "Avalista",
  FIADOR: "Fiador",
  CODEVEDORA: "Codevedora",
  REPRESENTANTE_LEGAL: "Representante Legal",
};

export function PartyCard({
  role,
  personType,
  fullName,
  cpf,
  cnpj,
  isPrimary,
  addressStreet,
}: PartyCardProps) {
  const Icon = personType === "PJ" ? Building : User;
  const docLabel = personType === "PJ" ? "CNPJ" : "CPF";
  const docValue = personType === "PJ" ? cnpj : cpf;

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-500">
            {ROLE_LABELS[role] ?? role}
          </span>
        </div>
        {isPrimary && (
          <Badge variant="default" className="text-[10px]">
            Principal
          </Badge>
        )}
      </div>
      <p className="mt-1 text-sm font-medium">{fullName}</p>
      {docValue && (
        <p className="mt-0.5 text-xs text-gray-500">
          {docLabel}: {docValue}
        </p>
      )}
      {addressStreet && (
        <p className="mt-0.5 text-xs text-gray-400 truncate">
          {addressStreet}
        </p>
      )}
    </div>
  );
}
