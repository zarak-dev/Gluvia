"use client";

import Link from "next/link";
import { Activity, LogOut } from "lucide-react";

import { NAV_LINKS } from "@/lib/constants";
import { NavLink } from "@/components/layout/NavLink";
import { ProfileNavCard } from "@/components/layout/ProfileNavCard";
import { logoutAction } from "@/app/actions/auth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { UserProfile } from "@/types";

export interface MobileSidebarProps {
  user: UserProfile | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({
  user,
  isOpen,
  onOpenChange,
}: MobileSidebarProps): React.ReactElement {
  const handleLinkClick = (): void => {
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex flex-col p-0 w-72">
        {/* Brand Header */}
        <SheetHeader className="border-b border-[#E8EEF2] px-6 py-4 text-left">
          <SheetTitle asChild>
            <Link
              href="/dashboard"
              onClick={handleLinkClick}
              className="flex items-center gap-3 font-bold tracking-tight"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#20B486] to-[#3DD5A3] text-white shadow-xs">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#17324D]">
                Gluvia
              </span>
            </Link>
          </SheetTitle>
        </SheetHeader>

        {/* Navigation Links */}
        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-4 pb-6">
          <nav className="space-y-2" aria-label="Mobile Navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                onClick={handleLinkClick}
              />
            ))}
          </nav>

          {/* User Profile & Logout Section */}
          <div className="border-t border-[#E8EEF2] dark:border-border pt-4 px-1">
            {/* Profile Card Link with Pending Feedback */}
            <ProfileNavCard user={user} onClick={handleLinkClick} />

            {/* Decent Sign Out Button */}
            <form action={logoutAction} className="mt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#718096] dark:text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-card hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-[#E8EEF2] dark:border-border hover:border-rose-200 dark:hover:border-rose-900/50 shadow-2xs transition-all cursor-pointer active:scale-98"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </button>
            </form>

            {/* Creator Attribution */}
            <div className="mt-3 pt-2 pb-1 text-center">
              <p className="text-[10px] text-[#718096] tracking-tight">
                Designed & Engineered by{" "}
                <span className="font-semibold text-[#17324D]">
                  Zarak K.
                </span>
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
