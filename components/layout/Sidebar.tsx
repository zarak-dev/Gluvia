import Link from "next/link";
import { Activity, LogOut } from "lucide-react";

import { NAV_LINKS } from "@/lib/constants";
import { NavLink } from "@/components/layout/NavLink";
import { ProfileNavCard } from "@/components/layout/ProfileNavCard";
import { logoutAction } from "@/app/actions/auth";
import type { UserProfile } from "@/types";

export interface SidebarProps {
  user: UserProfile | null;
  className?: string;
}

export function Sidebar({ user, className }: SidebarProps): React.ReactElement {
  return (
    <aside
      className={`hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 border-r border-[#E8EEF2] dark:border-border bg-white dark:bg-card ${
        className ?? ""
      }`}
    >
      {/* Brand Header with Activity Pulse */}
      <div className="flex h-20 shrink-0 items-center gap-3 px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 font-bold tracking-tight transition-opacity hover:opacity-90"
          aria-label="Gluvia Dashboard"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#20B486] to-[#3DD5A3] text-white shadow-xs">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#17324D] dark:text-foreground">
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

        {/* User Profile & Logout Section */}
        <div className="border-t border-[#E8EEF2] dark:border-border pt-4 px-1">
          {/* Profile Card Link with Pending Feedback */}
          <ProfileNavCard user={user} />

          {/* Decent Sign Out Button */}
          <form action={logoutAction} className="mt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#718096] dark:text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-card hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-[#E8EEF2] dark:border-border hover:border-rose-200 dark:hover:border-rose-900/50 shadow-2xs transition-all cursor-pointer active:scale-98"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </button>
          </form>

          {/* Creator Attribution */}
          <div className="mt-3 pt-2 pb-1 text-center">
            <p className="text-[10px] text-[#718096] dark:text-muted-foreground/80 tracking-tight">
              Designed & Engineered by{" "}
              <span className="font-semibold text-[#17324D] dark:text-foreground">
                Zarak K.
              </span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
