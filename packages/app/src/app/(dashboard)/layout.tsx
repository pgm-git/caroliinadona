"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import type { Role } from "@/lib/auth/roles";

function getInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("sidebar-collapsed") === "true";
}

function isDemoMode(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("demo-session=true");
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);
  const demo = isDemoMode();

  function handleToggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  }

  const userRole: Role = "admin";
  const userName = demo ? "Usuario Demo" : "Usuario";
  const userEmail = demo ? "demo@carolina.app" : "usuario@exemplo.com";
  const orgName = demo ? "Escritorio Demo" : "Escritorio";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={userRole} collapsed={collapsed} onToggle={handleToggle} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {demo && (
          <div className="bg-blue-600 text-white text-center text-sm py-1.5 px-4 flex items-center justify-center gap-3">
            <span>Modo Demonstracao — dados fictcios para teste</span>
            <a
              href="/api/demo-logout"
              className="underline font-medium hover:text-blue-100"
            >
              Sair do demo
            </a>
          </div>
        )}
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
