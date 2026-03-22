"use client";

import { PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNavItemsForRole } from "@/lib/navigation";
import type { Role } from "@/lib/auth/roles";
import { SidebarItem } from "./sidebar-item";

interface SidebarProps {
  role: Role;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ role, collapsed, onToggle }: SidebarProps) {
  const items = getNavItemsForRole(role);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-[#1E3A5F] text-white transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-16 border-b border-white/10 px-4",
          collapsed ? "justify-center" : "gap-3"
        )}
      >
        <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-sm font-bold shrink-0">
          C
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold">Carolina</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item) => (
          <SidebarItem key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <>
              <PanelLeftClose className="h-5 w-5" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
