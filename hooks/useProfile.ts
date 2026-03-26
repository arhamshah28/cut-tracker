"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { UserProfile } from "@/lib/types";

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    async function fetchProfile() {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (!error && data) {
        setProfile({
          user_id: data.user_id,
          height_cm: data.height_cm,
          age: data.age,
          gender: data.gender,
        });
      }
      setLoading(false);
    }

    fetchProfile();
  }, [userId]);

  const hasProfile = profile !== null;

  const updateProfile = useCallback(
    async (updates: Partial<Omit<UserProfile, "user_id">>) => {
      if (!userId) return;

      const updated = { ...profile, ...updates, user_id: userId };

      // Optimistic update
      setProfile(updated as UserProfile);

      await supabase
        .from("user_profiles")
        .upsert(updated, { onConflict: "user_id" });
    },
    [userId, profile]
  );

  return { profile, loading, hasProfile, updateProfile };
}
