"use client";

import { Breadcrumb } from "./breadcrumb";
import { UserMenu } from "./user-menu";
import { MobileSidebar } from "./mobile-sidebar";
import { NotificationBell } from "@/components/notifications/notification-bell";
import type { Role } from "@/lib/auth/roles";

interface HeaderProps {
  userName: string;
  userEmail: string;
  userRole: Role;
  orgName: string;
}

export function Header({ userName, userEmail, userRole, orgName }: HeaderProps) {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <MobileSidebar role={userRole} />
        <Breadcrumb />
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
        <UserMenu
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
          orgName={orgName}
        />
      </div>
    </header>
  );
}
