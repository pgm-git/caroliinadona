"use client";

/**
 * Settings → Team Page
 * Shows team members with roles, status and invite UI (invite disabled in demo)
 */

import { Button } from "@/components/ui/button";
import { UserPlus, Shield, Scale, BookOpen, Users, CheckCircle, XCircle } from "lucide-react";
import { getDemoTeamMembers } from "@/lib/demo-data";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  lawyer: "Advogado",
  coordinator: "Coordenador",
  intern: "Estagiário",
  viewer: "Visualizador",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800",
  lawyer: "bg-blue-100 text-blue-800",
  coordinator: "bg-amber-100 text-amber-800",
  intern: "bg-cyan-100 text-cyan-800",
  viewer: "bg-gray-100 text-gray-800",
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  admin: <Shield className="w-4 h-4" />,
  lawyer: <Scale className="w-4 h-4" />,
  coordinator: <Users className="w-4 h-4" />,
  intern: <BookOpen className="w-4 h-4" />,
  viewer: <Users className="w-4 h-4" />,
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter((_, i, arr) => i === 0 || i === arr.length - 1)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-amber-500",
  "bg-red-500",
];

export default function TeamPage() {
  const members = getDemoTeamMembers();
  const active = members.filter((m) => m.isActive);
  const inactive = members.filter((m) => !m.isActive);

  function handleInvite() {
    toast.info("Convite de membros disponível na versão completa.");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Equipe</h2>
          <p className="text-gray-500 text-sm mt-1">
            {active.length} membro{active.length !== 1 ? "s" : ""} ativo{active.length !== 1 ? "s" : ""}
            {inactive.length > 0 && ` · ${inactive.length} inativo${inactive.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={handleInvite}>
          <UserPlus className="w-4 h-4 mr-2" />
          Convidar Membro
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(
          active.reduce((acc, m) => {
            acc[m.role] = (acc[m.role] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([role, count]) => (
          <div key={role} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${ROLE_COLORS[role]}`}>
              {ROLE_ICONS[role]}
            </div>
            <div>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-gray-500">{ROLE_LABELS[role] || role}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active Members */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Membros Ativos</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {active.map((member, idx) => (
            <div key={member.id} className="px-6 py-4 flex items-center gap-4">
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}
              >
                {getInitials(member.fullName)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 truncate">{member.fullName}</p>
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                </div>
                <p className="text-sm text-gray-500 truncate">{member.email}</p>
                {member.oabNumber && (
                  <p className="text-xs text-gray-400">OAB/{member.oabState} {member.oabNumber}</p>
                )}
              </div>

              {/* Role */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[member.role] || "bg-gray-100 text-gray-800"}`}
                >
                  {ROLE_ICONS[member.role]}
                  {ROLE_LABELS[member.role] || member.role}
                </span>
              </div>

              {/* Joined */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400">
                  desde {new Date(member.joinedAt).toLocaleDateString("pt-BR")}
                </p>
                {member.phone && (
                  <p className="text-xs text-gray-400">{member.phone}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inactive Members */}
      {inactive.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-500">Membros Inativos</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {inactive.map((member, idx) => (
              <div key={member.id} className="px-6 py-4 flex items-center gap-4 opacity-60">
                <div
                  className={`w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}
                >
                  {getInitials(member.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-700 truncate">{member.fullName}</p>
                    <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  </div>
                  <p className="text-sm text-gray-400 truncate">{member.email}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[member.role] || "bg-gray-100 text-gray-800"}`}>
                  {ROLE_LABELS[member.role] || member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demo notice */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
        <strong>Modo Demo:</strong> Gestão real de equipe (convites, remoção, permissões avançadas) estará disponível na versão completa.
      </div>
    </div>
  );
}
