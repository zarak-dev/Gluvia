import Image from "next/image";
import { Sparkles } from "lucide-react";

export interface DashboardHeroProps {
  username: string;
}

export function DashboardHero({
  username,
}: DashboardHeroProps): React.ReactElement {
  // Personalized friendly greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#E8EEF2] dark:border-border bg-gradient-to-r from-[#EBF8F5] via-[#E4F5FA] to-[#EFF8FD] dark:from-[#11202D] dark:via-[#0F1B26] dark:to-[#122230] shadow-[0_2px_12px_rgba(23,50,77,0.03)] p-6 sm:p-8 lg:p-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
        {/* Left Text Content */}
        <div className="lg:col-span-7 z-10 space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#17324D] dark:text-foreground">
              {greeting}, {username}!
            </h1>
            <p className="text-sm sm:text-base text-[#5A6A80] dark:text-muted-foreground font-normal leading-relaxed max-w-lg">
              Your health journey matters. Keep tracking, stay consistent.
            </p>
          </div>

          {/* Small steps pill badge (Screenshot Match) */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/95 dark:bg-card/90 px-4 py-1.5 text-xs font-medium text-[#17324D] dark:text-foreground shadow-2xs border border-[#E8EEF2]/60 dark:border-border backdrop-blur-xs">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#DDF7ED] dark:bg-[#20B486]/20 text-[#20B486]">
                <Sparkles className="h-3 w-3" />
              </span>
              <span>Small steps today, better tomorrow.</span>
            </div>
          </div>
        </div>

        {/* Right Visual Section (Glucose Meter & Healthy Food) */}
        <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
          <div className="relative w-full max-w-[340px] sm:max-w-[400px] h-[190px] sm:h-[220px] rounded-2xl overflow-hidden shadow-xs border border-white/60 dark:border-border/60">
            <Image
              src="/images/dashboard-hero.png"
              alt="Person holding a 98 mg/dL blood glucose meter with healthy salad"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 400px"
              className="object-cover object-center"
              quality={90}
            />
            {/* Soft edge blend gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent pointer-events-none" />

            {/* Motivational Tag Overlay (Screenshot Match) */}
            <div className="absolute top-3 right-3 rounded-xl bg-white/90 dark:bg-card/90 backdrop-blur-xs px-3 py-1 text-right shadow-2xs border border-white/80 dark:border-border">
              <p className="text-[11px] font-bold text-[#17324D] dark:text-foreground leading-tight">
                Better Choices
              </p>
              <p className="text-[10px] font-semibold text-[#20B486] leading-tight flex items-center justify-end gap-1">
                Healthier You <span className="text-[9px]">💚</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
