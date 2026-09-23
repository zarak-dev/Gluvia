import { create } from "zustand";
import type { ChatMessage, SugarReading, UserProfile } from "@/types";

export interface AppState {
  user: UserProfile | null;
  readings: SugarReading[];
  chatMessages: ChatMessage[];
  setUser: (user: UserProfile | null) => void;
  setReadings: (readings: SugarReading[]) => void;
  addReading: (reading: SugarReading) => void;
  removeReading: (id: string) => void;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  readings: [],
  chatMessages: [],

  setUser: (user: UserProfile | null): void => set({ user }),

  setReadings: (readings: SugarReading[]): void => set({ readings }),

  addReading: (reading: SugarReading): void =>
    set((state) => ({
      readings: [
        reading,
        ...state.readings.filter((item) => item.id !== reading.id),
      ],
    })),

  removeReading: (id: string): void =>
    set((state) => ({
      readings: state.readings.filter((item) => item.id !== id),
    })),

  addMessage: (message: ChatMessage): void =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),

  clearMessages: (): void => set({ chatMessages: [] }),
}));
