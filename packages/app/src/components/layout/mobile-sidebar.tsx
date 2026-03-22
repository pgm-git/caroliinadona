"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getNavItemsForRole } from "@/lib/navigation";
import type { Role } from "@/lib/auth/roles";
import { SidebarItem } from "./sidebar-item";

interface MobileSidebarProps {
  role: Role;
}

export function MobileSidebar({ role }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const items = getNavItemsForRole(role);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
        aria-label="Abrir menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#1E3A5F] text-white transform transition-transform duration-200 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-sm font-bold">
              C
            </div>
            <span className="text-lg font-semibold">Carolina</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-white/70 hover:text-white"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {items.map((item) => (
            <div key={item.href} onClick={() => setOpen(false)}>
              <SidebarItem item={item} collapsed={false} />
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
