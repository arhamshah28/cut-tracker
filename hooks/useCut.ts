"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { Cut } from "@/lib/types";

function rowToCut(row: Record<string, unknown>): Cut {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    name: row.name as string,
    status: row.status as Cut['status'],
    start_date: row.start_date as string,
    end_date: row.end_date as string,
    start_weight: Number(row.start_weight),
    target_weight: Number(row.target_weight),
    phases: (row.phases as Cut['phases']) || [],
    milestones: (row.milestones as Cut['milestones']) || [],
    water_cut_days: (row.water_cut_days as Cut['water_cut_days']) || {},
    meal_groups: (row.meal_groups as Cut['meal_groups']) || {},
    dinner_recipes: (row.dinner_recipes as Cut['dinner_recipes']) || [],
    workouts: (row.workouts as Cut['workouts']) || [],
    activities: (row.activities as Cut['activities']) || [],
    supplements: (row.supplements as Cut['supplements']) || [],
    schedule: (row.schedule as Cut['schedule']) || [],
    rules: (row.rules as Cut['rules']) || [],
    grocery: (row.grocery as Cut['grocery']) || [],
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export function useCut(userId: string | undefined) {
  const [cut, setCut] = useState<Cut | null>(null);
  const [allCuts, setAllCuts] = useState<Cut[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    async function fetchCuts() {
      // Fetch active cut
      const { data: activeData } = await supabase
        .from("cuts")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

      if (activeData) {
        setCut(rowToCut(activeData));
      }

      // Fetch all cuts for history
      const { data: allData } = await supabase
        .from("cuts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (allData) {
        setAllCuts(allData.map(rowToCut));
      }

      setLoading(false);
    }

    fetchCuts();
  }, [userId]);

  const hasCut = cut !== null;

  const createCut = useCallback(
    async (cutData: Omit<Cut, "id" | "user_id" | "created_at" | "updated_at">) => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("cuts")
        .insert({ ...cutData, user_id: userId })
        .select()
        .single();

      if (!error && data) {
        const newCut = rowToCut(data);
        setCut(newCut);
        setAllCuts((prev) => [newCut, ...prev]);
        return newCut;
      }
      return null;
    },
    [userId]
  );

  const updateCut = useCallback(
    async (updates: Partial<Cut>) => {
      if (!userId || !cut) return;

      const updated = { ...cut, ...updates };
      setCut(updated); // optimistic

      await supabase
        .from("cuts")
        .update(updates)
        .eq("id", cut.id);
    },
    [userId, cut]
  );

  const endCut = useCallback(
    async (status: "completed" | "abandoned") => {
      if (!userId || !cut) return;

      await supabase
        .from("cuts")
        .update({ status })
        .eq("id", cut.id);

      const ended = { ...cut, status };
      setCut(null);
      setAllCuts((prev) =>
        prev.map((c) => (c.id === cut.id ? ended : c))
      );
    },
    [userId, cut]
  );

  return { cut, allCuts, loading, hasCut, createCut, updateCut, endCut };
}
