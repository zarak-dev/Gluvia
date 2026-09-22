"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  ArrowRight,
  Activity,
  Apple,
  FileText,
  Sparkles,
  Calendar,
  Moon,
  Sun,
  Utensils,
  TrendingUp,
  Plus,
  Compass,
} from "lucide-react";

import { useAppStore } from "@/store/useAppStore";
import { useSugarReadings } from "@/hooks/useSugarReadings";
import { getSugarLevel } from "@/lib/utils";
import { MEAL_TAG_LABELS } from "@/lib/constants";
import type { SugarReading } from "@/types";

interface SearchCategoryItem {
  id: string;
  category: "page" | "reading" | "food" | "action";
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  href?: string;
  action?: () => void;
}

// Curated South Asian diabetic food database for instant search
const FOOD_DATABASE = [
  {
    name: "1 Bran Roti + Masoor Daal + Cucumber",
    tags: "roti daal lentils bread breakfast lunch",
    details: "42g carbs • 9g fiber • 280 kcal • Low GI",
  },
  {
    name: "Bhindi (Okra) Sabzi + Multigrain Phulka",
    tags: "bhindi okra vegetable roti lunch dinner",
    details: "38g carbs • 8g fiber • 260 kcal • Low GI",
  },
  {
    name: "Brown Rice Khichdi + Moong Daal",
    tags: "khichdi rice brown rice moong lentils dinner",
    details: "46g carbs • 7g fiber • 310 kcal • Moderate GI",
  },
  {
    name: "Karela (Bitter Gourd) Curry + Barley Roti",
    tags: "karela bitter gourd vegetable barley roti dinner",
    details: "35g carbs • 10g fiber • 240 kcal • Very Low GI",
  },
  {
    name: "Palak Paneer + 1 Missi Roti",
    tags: "palak spinach paneer cheese missi roti lunch dinner",
    details: "32g carbs • 18g protein • 340 kcal • Low GI",
  },
  {
    name: "Grilled Chicken / Fish Tikka + Mint Salad",
    tags: "chicken fish tikka protein kebab dinner",
    details: "8g carbs • 32g protein • 290 kcal • Minimal GI",
  },
  {
    name: "Methi (Fenugreek) Thepla + Low-fat Curd",
    tags: "methi fenugreek thepla yogurt curd breakfast",
    details: "30g carbs • 7g fiber • 220 kcal • Low GI",
  },
  {
    name: "Sprouted Moong Chaat + Lemon & Mint",
    tags: "chaat moong sprouts snack legumes",
    details: "22g carbs • 8g fiber • 180 kcal • Low GI",
  },
  {
    name: "Roasted Makhana (Fox Nuts)",
    tags: "makhana fox nuts lotus seeds snack roasted",
    details: "18g carbs • 4g fiber • 120 kcal • Low GI",
  },
  {
    name: "Chana Daal + Saag + 1 Bajra Roti",
    tags: "chana daal saag mustard greens bajra roti lunch",
    details: "44g carbs • 11g fiber • 330 kcal • Low GI",
  },
  {
    name: "Boiled Egg Whites + Whole Wheat Toast",
    tags: "eggs toast whole wheat breakfast protein",
    details: "24g carbs • 16g protein • 210 kcal • Low GI",
  },
  {
    name: "Cinnamon Green Tea + Walnuts & Almonds",
    tags: "chai tea green tea cinnamon nuts snack almonds",
    details: "6g carbs • 5g protein • 160 kcal • Low GI",
  },
];

// App pages and navigation targets
const APP_PAGES = [
  {
    title: "Dashboard Overview",
    subtitle: "Latest glucose reading, 7-day average, glycemic stats",
    href: "/dashboard",
    icon: Compass,
    keywords: "home overview stats main recent average",
  },
  {
    title: "Log Blood Sugar",
    subtitle: "Record fasting, post-prandial, or bedtime glucose",
    href: "/log",
    icon: Plus,
    keywords: "add new record entry glucose fasting meal reading",
  },
  {
    title: "Trends & Analytics",
    subtitle: "7, 30, 90-day trajectories and in-range percentages",
    href: "/trends",
    icon: TrendingUp,
    keywords: "chart graph history analysis analytics trajectory",
  },
  {
    title: "AI Diet Plan",
    subtitle: "Personalized South Asian diabetic meal suggestions",
    href: "/diet",
    icon: Utensils,
    keywords: "food diet nutrition meal recipe calories south asian",
  },
  {
    title: "Food Suggestions",
    subtitle: "Glycemic-friendly pairings, carb swaps, and GI values",
    href: "/foods",
    icon: Apple,
    keywords: "food roti rice daal carbs swaps low gi recipes",
  },
  {
    title: "Doctor Report",
    subtitle: "Generate clinical summary & export PDF for consultation",
    href: "/report",
    icon: FileText,
    keywords: "doctor report pdf clinical print export physician",
  },
];

export function GlobalSearch(): React.ReactElement {
  const router = useRouter();
  const [query, setQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Ensure readings are loaded from Supabase into Zustand store
  useSugarReadings({ limit: 50 });
  const readings = useAppStore((state) => state.readings);

  // Global Ctrl+K / Cmd+K listener to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered search items
  const results = useMemo<SearchCategoryItem[]>(() => {
    const cleanQuery = query.trim().toLowerCase();
    const items: SearchCategoryItem[] = [];

    // Helper to open AI Assistant
    const openAiAssistant = (initialText?: string) => {
      window.dispatchEvent(
        new CustomEvent("open-ai-chat", {
          detail: { query: initialText || cleanQuery },
        })
      );
      setIsOpen(false);
      setQuery("");
    };

    // Helper to toggle theme
    const toggleTheme = () => {
      const isDark = document.documentElement.classList.toggle("dark");
      localStorage.setItem("gluvia-theme", isDark ? "dark" : "light");
      setIsOpen(false);
      setQuery("");
    };

    if (!cleanQuery) {
      // Default Suggested items when input is empty but focused
      APP_PAGES.forEach((page) => {
        items.push({
          id: `page-${page.href}`,
          category: "page",
          title: page.title,
          subtitle: page.subtitle,
          icon: page.icon,
          badge: "Page",
          badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
          href: page.href,
        });
      });

      items.push({
        id: "action-log",
        category: "action",
        title: "Quick Log Reading",
        subtitle: "Add a new blood glucose entry",
        icon: Plus,
        badge: "Action",
        badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
        href: "/log",
      });

      items.push({
        id: "action-ai",
        category: "action",
        title: "Ask Gluvia Assistant",
        subtitle: "Powered by Aimmyy AI • South Asian diabetes companion",
        icon: Sparkles,
        badge: "Aimmyy AI",
        badgeColor: "bg-teal-50 text-[#20B486] dark:bg-teal-950/60 dark:text-[#3DD5A3]",
        action: () => openAiAssistant("Hello Gluvia Assistant!"),
      });

      return items;
    }

    // 1. Match Pages
    APP_PAGES.forEach((page) => {
      const match =
        page.title.toLowerCase().includes(cleanQuery) ||
        page.subtitle.toLowerCase().includes(cleanQuery) ||
        page.keywords.toLowerCase().includes(cleanQuery);
      if (match) {
        items.push({
          id: `page-${page.href}`,
          category: "page",
          title: page.title,
          subtitle: page.subtitle,
          icon: page.icon,
          badge: "Page",
          badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
          href: page.href,
        });
      }
    });

    // 2. Match Logged Readings
    readings.forEach((reading: SugarReading) => {
      const level = getSugarLevel(reading.sugar_mg_dl);
      const mealLabel = reading.meal_tag ? MEAL_TAG_LABELS[reading.meal_tag] : "";
      const food = reading.food_eaten || "";
      const notes = reading.notes || "";
      const dateStr = new Date(reading.reading_date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });

      const match =
        reading.sugar_mg_dl.toString().includes(cleanQuery) ||
        level.toLowerCase().includes(cleanQuery) ||
        mealLabel.toLowerCase().includes(cleanQuery) ||
        food.toLowerCase().includes(cleanQuery) ||
        notes.toLowerCase().includes(cleanQuery);

      if (match && items.length < 20) {
        let badgeColor = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300";
        if (level === "high") {
          badgeColor = "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300";
        } else if (level === "elevated") {
          badgeColor = "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300";
        } else if (level === "low") {
          badgeColor = "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300";
        }

        items.push({
          id: `reading-${reading.id}`,
          category: "reading",
          title: `${reading.sugar_mg_dl} mg/dL • ${mealLabel || "Reading"}`,
          subtitle: [food ? `Food: ${food}` : null, notes ? `Notes: ${notes}` : null, dateStr]
            .filter(Boolean)
            .join(" | "),
          icon: Activity,
          badge: level.toUpperCase(),
          badgeColor,
          href: "/dashboard",
        });
      }
    });

    // 3. Match Food Database
    FOOD_DATABASE.forEach((food, idx) => {
      const match =
        food.name.toLowerCase().includes(cleanQuery) ||
        food.tags.toLowerCase().includes(cleanQuery) ||
        food.details.toLowerCase().includes(cleanQuery);

      if (match && items.length < 25) {
        items.push({
          id: `food-${idx}`,
          category: "food",
          title: food.name,
          subtitle: food.details,
          icon: Apple,
          badge: "Food Guide",
          badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
          href: "/foods",
        });
      }
    });

    // 4. Match Actions
    if ("dark mode light mode theme toggle".includes(cleanQuery)) {
      items.push({
        id: "action-theme",
        category: "action",
        title: "Toggle Dark / Light Mode",
        subtitle: "Switch appearance theme",
        icon: Moon,
        badge: "Theme",
        badgeColor: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
        action: toggleTheme,
      });
    }

    if ("report doctor pdf export print summary".includes(cleanQuery)) {
      items.push({
        id: "action-report",
        category: "action",
        title: "Export Doctor Consultation Report",
        subtitle: "Generate clinical PDF summary",
        icon: FileText,
        badge: "Export",
        badgeColor: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
        href: "/report",
      });
    }

    // Always offer to ask Gluvia Assistant for arbitrary questions
    items.push({
      id: "action-ai-query",
      category: "action",
      title: `Ask Gluvia Assistant: "${query}"`,
      subtitle: "Powered by Aimmyy AI • South Asian diabetes assistant",
      icon: Sparkles,
      badge: "Aimmyy AI",
      badgeColor: "bg-teal-50 text-[#20B486] dark:bg-teal-950/60 dark:text-[#3DD5A3]",
      action: () => openAiAssistant(query),
    });

    return items;
  }, [query, readings]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleSelect = useCallback(
    (item: SearchCategoryItem) => {
      if (item.action) {
        item.action();
      } else if (item.href) {
        router.push(item.href);
      }
      setIsOpen(false);
      setQuery("");
    },
    [router]
  );

  // Keyboard navigation within the dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-32 sm:w-56 md:w-64 lg:w-72" ref={containerRef}>
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#718096] dark:text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search... (Ctrl+K)"
          className="h-10 w-full rounded-xl bg-white dark:bg-card border border-[#E8EEF2] dark:border-border pl-10 pr-8 text-xs sm:text-sm text-[#17324D] dark:text-foreground placeholder:text-[#718096] dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#20B486]/30 transition-all shadow-[0_2px_8px_rgba(23,50,77,0.02)]"
          aria-label="Global application search"
          aria-expanded={isOpen}
          aria-controls="global-search-results"
          role="combobox"
          aria-autocomplete="list"
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#718096] dark:text-muted-foreground hover:text-[#17324D] dark:hover:text-foreground rounded-md transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="hidden lg:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none items-center gap-0.5 rounded border border-[#E8EEF2] dark:border-border bg-[#F7FBFC] dark:bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-[#718096] dark:text-muted-foreground">
            ⌘K
          </kbd>
        )}
      </div>

      {/* Global Search Results Dropdown */}
      {isOpen && (
        <div
          id="global-search-results"
          ref={resultsContainerRef}
          className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-[480px] md:w-[540px] rounded-2xl border border-[#E8EEF2] dark:border-border bg-white dark:bg-card shadow-2xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#F7FBFC]/80 dark:bg-muted/40 border-b border-[#E8EEF2] dark:border-border text-xs text-[#718096] dark:text-muted-foreground">
            <span className="font-semibold text-[#17324D] dark:text-foreground">
              {query ? `Search results for "${query}"` : "Quick Navigation & Suggestions"}
            </span>
            <span className="text-[11px]">
              Use <kbd className="px-1 py-0.5 rounded bg-white dark:bg-card border text-[10px]">↑</kbd>{" "}
              <kbd className="px-1 py-0.5 rounded bg-white dark:bg-card border text-[10px]">↓</kbd> to navigate
            </span>
          </div>

          {/* List of Results */}
          <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
            {results.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">No matching results</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try searching for &quot;fasting&quot;, &quot;roti&quot;, &quot;trends&quot;, or &quot;report&quot;
                </p>
              </div>
            ) : (
              results.map((item, index) => {
                const IconComponent = item.icon;
                const isSelected = index === selectedIndex;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#20B486]/10 dark:bg-[#20B486]/15 text-[#17324D] dark:text-foreground"
                        : "hover:bg-muted/50 text-[#17324D] dark:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isSelected
                            ? "bg-[#20B486] text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-medium truncate">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor}`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.subtitle && (
                          <p className="text-[11px] text-[#718096] dark:text-muted-foreground truncate">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <ArrowRight
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        isSelected
                          ? "text-[#20B486] translate-x-0.5"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="px-4 py-2 border-t border-[#E8EEF2] dark:border-border bg-[#F7FBFC]/50 dark:bg-muted/20 flex items-center justify-between text-[11px] text-[#718096] dark:text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-[#20B486]" />
              AI Assistant powered by Aimmyy AI
            </span>
            <span>Esc to close</span>
          </div>
        </div>
      )}
    </div>
  );
}
