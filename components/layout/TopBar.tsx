"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Activity,
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  CheckCheck,
  Clock,
  Trash2,
  Sparkles,
  HeartPulse,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import type { UserProfile } from "@/types";

export interface TopBarProps {
  user: UserProfile | null;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: "glucose" | "diet" | "reminder";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Post-Dinner Reading Due",
    message: "Remember to log your 2-hour post-prandial blood sugar reading.",
    time: "15m ago",
    unread: true,
    type: "glucose",
  },
  {
    id: "2",
    title: "South Asian Meal Plan",
    message: "Your AI personalized glycemic diet plan has been generated.",
    time: "2h ago",
    unread: true,
    type: "diet",
  },
  {
    id: "3",
    title: "Weekly Glycemic In-Range",
    message: "Great job! 85% of your glucose readings this week were in target range.",
    time: "1d ago",
    unread: false,
    type: "reminder",
  },
];

export function TopBar({ user }: TopBarProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDark, setIsDark] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const notificationRef = useRef<HTMLDivElement>(null);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "ZK";

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("gluvia-theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const shouldBeDark = savedTheme ? savedTheme === "dark" : prefersDark;
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  // Close notifications dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const toggleTheme = (): void => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("gluvia-theme", "dark");
      toast.success("Night mode enabled");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("gluvia-theme", "light");
      toast.success("Day mode enabled");
    }
  };

  const markAllAsRead = (): void => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success("All notifications marked as read");
  };

  const deleteNotification = (id: string): void => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <>
      {/* Unified TopBar: Desktop & Mobile */}
      <header className="sticky top-0 z-20 flex h-16 md:h-20 w-full items-center justify-between border-b border-[#E8EEF2]/80 dark:border-border bg-[#F7FBFC]/90 dark:bg-background/90 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
        {/* Mobile Left: Drawer Menu & Brand */}
        <div className="flex md:hidden items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation menu"
            className="h-10 w-10 text-[#17324D] dark:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-[#17324D] dark:text-foreground"
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#718096] dark:text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything..."
              className="h-11 w-full rounded-2xl bg-white dark:bg-card border border-[#E8EEF2] dark:border-border pl-11 pr-4 text-sm text-[#17324D] dark:text-foreground placeholder:text-[#718096] dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#20B486]/30 transition-all shadow-[0_2px_8px_rgba(23,50,77,0.02)]"
            />
          </div>
        </div>

        {/* Right Controls: Notification & Settings / Avatar */}
        <div className="flex items-center gap-3">
          {/* Notification Bell with Red Badge & Popover */}
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-card border border-[#E8EEF2] dark:border-border text-[#5A6A80] dark:text-muted-foreground hover:text-[#17324D] dark:hover:text-foreground transition-all shadow-2xs cursor-pointer active:scale-95"
              aria-label="Notifications"
              aria-expanded={showNotifications}
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-card" />
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#E8EEF2] dark:border-border bg-white dark:bg-card shadow-xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-[#E8EEF2] dark:border-border px-4 py-3 bg-[#F7FBFC]/60 dark:bg-muted/40">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#17324D] dark:text-foreground">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 text-xs text-[#20B486] hover:text-[#178a66] font-medium transition-colors cursor-pointer"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#E8EEF2]/60 dark:divide-border/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                      No notifications at this time
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`group p-3.5 flex items-start gap-3 transition-colors hover:bg-slate-50/80 dark:hover:bg-muted/30 ${
                          item.unread
                            ? "bg-[#20B486]/5 dark:bg-[#20B486]/10"
                            : ""
                        }`}
                      >
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#20B486]/10 text-[#20B486]">
                          {item.type === "glucose" ? (
                            <HeartPulse className="h-4 w-4" />
                          ) : item.type === "diet" ? (
                            <Sparkles className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-semibold text-[#17324D] dark:text-foreground truncate">
                              {item.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {item.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                            {item.message}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteNotification(item.id)}
                          className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-muted-foreground hover:text-rose-500 transition-opacity p-1 cursor-pointer"
                          aria-label="Delete notification"
                          title="Delete notification"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme / Night Mode Sun & Moon Icon */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-card border border-[#E8EEF2] dark:border-border text-[#5A6A80] dark:text-muted-foreground hover:text-[#17324D] dark:hover:text-foreground transition-all shadow-2xs cursor-pointer active:scale-95"
            aria-label={isDark ? "Switch to Day Mode" : "Switch to Night Mode"}
            title={isDark ? "Switch to Day Mode" : "Switch to Night Mode"}
          >
            {isDark ? (
              <Sun className="h-4.5 w-4.5 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-[#5A6A80] transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* Mobile User Avatar */}
          <div className="md:hidden">
            <Avatar className="h-9 w-9 border border-[#E8EEF2] dark:border-border">
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
