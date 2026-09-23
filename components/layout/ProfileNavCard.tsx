"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { useNavigationProgress } from "@/lib/navigationProgress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { UserProfile } from "@/types";

export interface ProfileNavCardProps {
  user: UserProfile | null;
  onClick?: () => void;
  className?: string;
}

export function ProfileNavCard({
  user,
  onClick,
  className,
}: ProfileNavCardProps): React.ReactElement {
  const pathname = usePathname();
  const { isNavigating, pendingHref } = useNavigationProgress();

  const isActive = pathname === "/profile" || pathname.startsWith("/profile/");
  const isPending = isNavigating && pendingHref === "/profile" && !isActive;

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "GL";

  return (
    <Link
      href="/profile"
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      aria-busy={isPending ? "true" : undefined}
      className={cn(
        "flex items-center justify-between rounded-xl p-2 transition-all group",
        isActive
          ? "bg-[#E6F7F0] dark:bg-[#20B486]/15"
          : isPending
            ? "bg-[#E6F7F0]/60 dark:bg-[#20B486]/10"
            : "hover:bg-slate-100/80 dark:hover:bg-muted/50",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar
          className={cn(
            "h-10 w-10 border transition-all",
            isActive
              ? "border-[#20B486] ring-2 ring-[#20B486]/30"
              : isPending
                ? "border-[#20B486] animate-pulse"
                : "border-[#E8EEF2] dark:border-border"
          )}
        >
          <AvatarFallback className="bg-[#7190AB] text-white font-semibold text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span
            className={cn(
              "truncate text-sm font-semibold transition-colors",
              isActive || isPending
                ? "text-[#20B486] dark:text-[#3DD5A3]"
                : "text-[#17324D] dark:text-foreground group-hover:text-primary"
            )}
          >
            {user?.username ?? "Patient Profile"}
          </span>
          <span className="text-[11px] text-[#718096] dark:text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3 text-[#20B486]" />
            Manage profile
          </span>
        </div>
      </div>

      {isPending ? (
        <span
          className="flex h-2 w-2 relative shrink-0 mr-1"
          aria-label="Loading profile..."
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20B486] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#20B486]" />
        </span>
      ) : (
        <ChevronRight className="h-4 w-4 text-[#718096] dark:text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
      )}
    </Link>
  );
}
