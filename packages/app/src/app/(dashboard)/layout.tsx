"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import type { Role } from "@/lib/auth/roles";

function getInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("sidebar-collapsed") === "true";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);

  function handleToggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  }

  // TODO: Obter dados reais do usuário via hook/context
  const userRole: Role = "admin";
  const userName = "Usuário";
  const userEmail = "usuario@exemplo.com";
  const orgName = "Escritório";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={userRole} collapsed={collapsed} onToggle={handleToggle} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
          orgName={orgName}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
