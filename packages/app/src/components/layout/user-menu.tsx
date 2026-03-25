"use client";

import { useRouter } from "next/navigation";
import { User, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  userName: string;
  userEmail: string;
  userRole: string;
  orgName: string;
}

export function UserMenu({ userName, userEmail, userRole, orgName }: UserMenuProps) {
  const router = useRouter();
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleSignOut() {
    // Check if in demo mode
    if (document.cookie.includes("demo-session=true")) {
      window.location.href = "/api/demo-logout";
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors outline-none">
        <div className="h-8 w-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">{userName}</p>
          <p className="text-xs text-gray-500">{orgName}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-xs text-gray-500">{userEmail}</p>
          <p className="text-xs text-gray-400 capitalize">{userRole}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
          <User className="mr-2 h-4 w-4" />
          Meu Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
