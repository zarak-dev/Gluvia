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
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}
