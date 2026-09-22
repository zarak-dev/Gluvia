"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, Menu, Search, Bell, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import type { UserProfile } from "@/types";

export interface TopBarProps {
  user: UserProfile | null;
}

export function TopBar({ user }: TopBarProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "ZK";

  return (
    <>
      {/* Unified TopBar: Desktop & Mobile */}
      <header className="sticky top-0 z-20 flex h-16 md:h-20 w-full items-center justify-between border-b border-[#E8EEF2]/80 bg-[#F7FBFC]/90 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
        {/* Mobile Left: Drawer Menu & Brand */}
        <div className="flex md:hidden items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation menu"
            className="h-10 w-10 text-[#17324D]"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-[#17324D]"
            aria-label="Gluvia Dashboard"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#20B486] to-[#3DD5A3] text-white shadow-xs">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold">Gluvia</span>
          </Link>
        </div>

        {/* Desktop Search Bar (Screenshot Match) */}
        <div className="hidden md:flex items-center flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#718096]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything..."
              className="h-11 w-full rounded-2xl bg-white border border-[#E8EEF2] pl-11 pr-4 text-sm text-[#17324D] placeholder:text-[#718096] focus:outline-none focus:ring-2 focus:ring-[#20B486]/30 transition-all shadow-[0_2px_8px_rgba(23,50,77,0.02)]"
            />
          </div>
        </div>

        {/* Right Controls: Notification & Settings / Avatar */}
        <div className="flex items-center gap-3">
          {/* Notification Bell with Red Badge */}
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#E8EEF2] text-[#5A6A80] hover:text-[#17324D] transition-colors shadow-2xs cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* Theme / Settings Sun Icon */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#E8EEF2] text-[#5A6A80] hover:text-[#17324D] transition-colors shadow-2xs cursor-pointer"
            aria-label="Toggle settings"
          >
            <Sun className="h-4.5 w-4.5" />
          </button>

          {/* Mobile User Avatar */}
          <div className="md:hidden">
            <Avatar className="h-9 w-9 border border-[#E8EEF2]">
              <AvatarFallback className="bg-[#7190AB] text-white font-semibold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <MobileSidebar user={user} isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
