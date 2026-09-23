"use client";

import { useSyncExternalStore } from "react";

export interface NavigationProgressState {
  isNavigating: boolean;
  pendingHref: string | null;
  progress: number;
  isVisible: boolean;
}

let currentState: NavigationProgressState = {
  isNavigating: false,
  pendingHref: null,
  progress: 0,
  isVisible: false,
};

const listeners = new Set<() => void>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

let trickleIntervalId: ReturnType<typeof setInterval> | null = null;
let safetyTimeoutId: ReturnType<typeof setTimeout> | null = null;
let resetTimeoutId: ReturnType<typeof setTimeout> | null = null;

function clearAllTimers(): void {
  if (trickleIntervalId !== null) {
    clearInterval(trickleIntervalId);
    trickleIntervalId = null;
  }
  if (safetyTimeoutId !== null) {
    clearTimeout(safetyTimeoutId);
    safetyTimeoutId = null;
  }
  if (resetTimeoutId !== null) {
    clearTimeout(resetTimeoutId);
    resetTimeoutId = null;
  }
}

export const navigationProgress = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot(): NavigationProgressState {
    return currentState;
  },

  start(href?: string): void {
    clearAllTimers();

    currentState = {
      isNavigating: true,
      pendingHref: href ?? null,
      progress: 18,
      isVisible: true,
    };
    notifyListeners();

    // Smooth asymptotic trickle toward ~78%
    trickleIntervalId = setInterval(() => {
      if (currentState.progress < 76) {
        const delta = Math.max(0.8, (78 - currentState.progress) * 0.12);
        currentState = {
          ...currentState,
          progress: Math.min(78, currentState.progress + delta),
        };
        notifyListeners();
      }
    }, 180);

    // Abort safety timeout: clear after 8 seconds if navigation never completes
    safetyTimeoutId = setTimeout(() => {
      navigationProgress.done();
    }, 8000);
  },

  done(): void {
    if (trickleIntervalId !== null) {
      clearInterval(trickleIntervalId);
      trickleIntervalId = null;
    }
    if (safetyTimeoutId !== null) {
      clearTimeout(safetyTimeoutId);
      safetyTimeoutId = null;
    }

    if (!currentState.isVisible) {
      return;
    }

    // Immediately snap to 100% completion
    currentState = {
      ...currentState,
      isNavigating: false,
      pendingHref: null,
      progress: 100,
    };
    notifyListeners();

    // After completion animation (250ms), fade out and reset
    resetTimeoutId = setTimeout(() => {
      currentState = {
        isNavigating: false,
        pendingHref: null,
        progress: 0,
        isVisible: false,
      };
      notifyListeners();
      resetTimeoutId = null;
    }, 250);
  },
};

const SSR_SNAPSHOT: NavigationProgressState = {
  isNavigating: false,
  pendingHref: null,
  progress: 0,
  isVisible: false,
};

export function useNavigationProgress(): NavigationProgressState {
  return useSyncExternalStore(
    navigationProgress.subscribe,
    navigationProgress.getSnapshot,
    () => SSR_SNAPSHOT
  );
}
