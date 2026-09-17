"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import type { UserProfile } from "@/types";

export interface TopBarProps {
  user: UserProfile | null;
}

export function TopBar({ user }: TopBarProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "GL";

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation menu"
            className="h-10 w-10"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-foreground"
            aria-label="Gluvia Dashboard"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-lg">Gluvia</span>
          </Link>
        </div>

        <Avatar className="h-8 w-8 border">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      </header>

      <MobileSidebar user={user} isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
