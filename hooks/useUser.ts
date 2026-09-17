"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import type { UserProfile } from "@/types";

export interface UseUserReturn {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);

  const [isLoading, setIsLoading] = useState<boolean>(!user);
  const [error, setError] = useState<string | null>(null);
  const fetchedUserIdRef = useRef<string | null>(null);

  const fetchProfile = useCallback(
    async (userId: string): Promise<void> => {
      if (fetchedUserIdRef.current === userId && user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const supabase = createClient();
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        setError(profileError.message);
        setUser(null);
      } else if (data) {
        fetchedUserIdRef.current = userId;
        setUser(data as UserProfile);
      }
      setIsLoading(false);
    },
    [setUser, user]
  );

  const refetch = useCallback(async (): Promise<void> => {
    const supabase = createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser) {
      fetchedUserIdRef.current = null;
      await fetchProfile(authUser.id);
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [fetchProfile, setUser]);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function initUser(): Promise<void> {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (authError || !authUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      await fetchProfile(authUser.id);
    }

    void initUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          void fetchProfile(session.user.id);
        } else {
          fetchedUserIdRef.current = null;
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, setUser]);

  return {
    user,
    isLoading,
    error,
    refetch,
  };
}
