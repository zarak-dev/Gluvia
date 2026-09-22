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
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  const Icon = NAV_ICONS[href] ?? HelpCircle;

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-[#E6F7F0] text-[#20B486] font-semibold"
          : "text-[#5A6A80] hover:bg-[#F7FBFC] hover:text-[#17324D]",
        className
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isActive ? "text-[#20B486]" : "text-[#718096]"
        )}
        aria-hidden="true"
      />
      <span>{label}</span>
    </Link>
  );
}
