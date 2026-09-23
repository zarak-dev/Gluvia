"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  TrendingUp,
  Utensils,
  Apple,
  FileText,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useNavigationProgress } from "@/lib/navigationProgress";

const NAV_ICONS: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/log": PlusCircle,
  "/trends": TrendingUp,
  "/diet": Utensils,
  "/foods": Apple,
  "/report": FileText,
};

export interface NavLinkProps {
  href: string;
  label: string;
  onClick?: () => void;
  className?: string;
}

export function NavLink({
  href,
  label,
  onClick,
  className,
}: NavLinkProps): React.ReactElement {
  const pathname = usePathname();
  const { isNavigating, pendingHref } = useNavigationProgress();

  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  const isPending = isNavigating && pendingHref === href && !isActive;
  const Icon = NAV_ICONS[href] ?? HelpCircle;

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      aria-busy={isPending ? "true" : undefined}
      className={cn(
        "flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-[#E6F7F0] text-[#20B486] font-semibold dark:bg-[#20B486]/15 dark:text-[#3DD5A3]"
          : isPending
            ? "bg-[#E6F7F0]/60 text-[#20B486] font-medium dark:bg-[#20B486]/10 dark:text-[#3DD5A3]"
            : "text-[#5A6A80] dark:text-muted-foreground hover:bg-[#F7FBFC] hover:text-[#17324D] dark:hover:bg-muted/50 dark:hover:text-foreground",
        className
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isActive
            ? "text-[#20B486] dark:text-[#3DD5A3]"
            : isPending
              ? "text-[#20B486] dark:text-[#3DD5A3] animate-pulse"
              : "text-[#718096] dark:text-muted-foreground"
        )}
        aria-hidden="true"
      />
      <span className="truncate">{label}</span>

      {/* Subtle pending beacon indicator on clicked navigation item */}
      {isPending && (
        <span
          className="ml-auto flex h-2 w-2 relative shrink-0"
          aria-label="Loading..."
          title="Loading..."
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20B486] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#20B486]" />
        </span>
      )}
    </Link>
  );
}
