"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  navigationProgress,
  useNavigationProgress,
} from "@/lib/navigationProgress";

export function NavigationProgressBar(): React.ReactElement | null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { progress, isVisible } = useNavigationProgress();

  const prevPathnameRef = useRef<string>(pathname);
  const prevSearchRef = useRef<string>(searchParams?.toString() ?? "");

  // Detect completion when pathname or searchParams change
  useEffect(() => {
    const currentSearch = searchParams?.toString() ?? "";
    const hasPathChanged = prevPathnameRef.current !== pathname;
    const hasSearchChanged = prevSearchRef.current !== currentSearch;

    if (hasPathChanged || hasSearchChanged) {
      prevPathnameRef.current = pathname;
      prevSearchRef.current = currentSearch;
      navigationProgress.done();
    }
  }, [pathname, searchParams]);

  // Global click & browser history listeners
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent): void => {
      // Ignore if event was prevented or not standard left-click
      if (e.defaultPrevented || e.button !== 0) return;

      // Ignore modifier keys (opens in new tab/window)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      // Ignore target="_blank", downloads, or external links
      if (target.getAttribute("target") === "_blank") return;
      if (target.hasAttribute("download")) return;
      if (target.getAttribute("rel")?.includes("external")) return;

      const href = target.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      try {
        const targetUrl = new URL(href, window.location.origin);
        if (targetUrl.origin !== window.location.origin) return;

        const currentUrl = new URL(window.location.href);
        // Do not trigger if already on the exact same pathname and query
        if (
          targetUrl.pathname === currentUrl.pathname &&
          targetUrl.search === currentUrl.search
        ) {
          return;
        }

        // Trigger immediate visual progress feedback
        navigationProgress.start(targetUrl.pathname);
      } catch {
        // Silently ignore invalid URLs
      }
    };

    const handlePopState = (): void => {
      navigationProgress.start(window.location.pathname);
    };

    // Capture phase listener ensures immediate response before React event dispatch
    document.addEventListener("click", handleAnchorClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleAnchorClick, {
        capture: true,
      });
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (!isVisible && progress === 0) {
    return null;
  }

  return (
    <div
      role="progressbar"
      aria-hidden={!isVisible}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      className="pointer-events-none fixed top-0 left-0 right-0 z-[99999] h-[2.5px] w-full overflow-hidden transition-opacity duration-200 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div
        className="h-full bg-gradient-to-r from-[#20B486] via-[#2DD4BF] to-[#3DD5A3] shadow-[0_0_10px_rgba(32,180,134,0.7),0_0_4px_rgba(32,180,134,0.4)] transition-[width] duration-200 ease-out will-change-[width] motion-reduce:transition-none"
        style={{
          width: `${progress}%`,
        }}
      >
        {/* Subtle leading-edge highlight */}
        <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-r from-transparent to-white/30" />
      </div>
    </div>
  );
}
