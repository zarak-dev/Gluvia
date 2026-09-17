"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import type { SugarReading } from "@/types";

export interface UseSugarReadingsOptions {
  limit?: number;
}

export interface UseSugarReadingsReturn {
  readings: SugarReading[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSugarReadings(
  options: UseSugarReadingsOptions = {}
): UseSugarReadingsReturn {
  const { limit = 30 } = options;

  const readings = useAppStore((state) => state.readings);
  const setReadings = useAppStore((state) => state.setReadings);

  const [isLoading, setIsLoading] = useState<boolean>(readings.length === 0);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  const fetchReadings = useCallback(async (): Promise<void> => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setIsLoading(false);
        isFetchingRef.current = false;
        return;
      }

      const { data, error: readingsError } = await supabase
        .from("sugar_readings")
        .select("*")
        .eq("user_id", user.id)
        .order("reading_date", { ascending: false })
        .limit(limit);

      if (readingsError) {
        setError(readingsError.message);
      } else if (data) {
        setReadings(data as SugarReading[]);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load sugar readings";
      setError(message);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [limit, setReadings]);

  useEffect(() => {
    void fetchReadings();
  }, [fetchReadings]);

  return {
    readings,
    isLoading,
    error,
    refetch: fetchReadings,
  };
}
