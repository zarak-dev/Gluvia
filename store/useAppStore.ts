import { create } from "zustand";
import type { SugarReading, UserProfile } from "@/types";

interface AppState {
  user: UserProfile | null;
  readings: SugarReading[];
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setReadings: (readings: SugarReading[]) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  readings: [],
  isLoading: false,
  setUser: (user: UserProfile | null): void => set({ user }),
  setReadings: (readings: SugarReading[]): void => set({ readings }),
  setIsLoading: (isLoading: boolean): void => set({ isLoading }),
}));
