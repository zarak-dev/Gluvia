import Link from "next/link";
import { Droplet, ChevronRight } from "lucide-react";

import { NAV_LINKS } from "@/lib/constants";
import { NavLink } from "@/components/layout/NavLink";
import { logoutAction } from "@/app/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { UserProfile } from "@/types";

export interface SidebarProps {
  user: UserProfile | null;
  className?: string;
}

export function Sidebar({ user, className }: SidebarProps): React.ReactElement {
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "ZK";

  return (
    <aside
      className={`hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 border-r border-[#E8EEF2] bg-white ${
        className ?? ""
      }`}
    >
      {/* Brand Header with Green Droplet */}
      <div className="flex h-20 shrink-0 items-center gap-3 px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 font-bold tracking-tight transition-opacity hover:opacity-90"
          aria-label="Gluvia Dashboard"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#20B486] to-[#3DD5A3] text-white shadow-xs">
            <Droplet className="h-5 w-5 fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#17324D]">
            Gluvia
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-1 flex-col justify-between overflow-y-auto px-4 pb-6">
        <nav className="space-y-2" aria-label="Main Navigation">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>

        {/* User Profile & Logout Section (Screenshot Match) */}
        <div className="border-t border-[#E8EEF2] pt-4 px-1">
          <div className="flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-slate-50/80">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-10 w-10 border border-[#E8EEF2]">
                <AvatarFallback className="bg-[#7190AB] text-white font-semibold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="truncate text-sm font-semibold text-[#17324D]">
                  {user?.username ?? "Zarak Khan"}
                </span>
                <form action={logoutAction} className="inline">
                  <button
                    type="submit"
                    className="text-xs text-[#718096] hover:text-destructive hover:underline text-left cursor-pointer"
                  >
                    Logout
                  </button>
                </form>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[#718096] shrink-0" />
          </div>
        </div>
      </div>
    </aside>
  );
}
