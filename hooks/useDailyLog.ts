"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { EMPTY_DAY } from "@/lib/constants";
import type { DayEntry } from "@/lib/constants";

interface QueuedWrite {
  date: string;
  entry: DayEntry;
  timestamp: number;
}

const OFFLINE_KEY = "cuttracker_offline_queue";

function entryToRow(userId: string, date: string, entry: DayEntry) {
  return {
    user_id: userId,
    date,
    meals: entry.meals,
    dinner: entry.dinner,
    workout: entry.workout,
    walks: entry.walks,
    weight: entry.weight,
    water: entry.water,
    supplements: entry.supplements,
    sleep: entry.sleep,
    custom_meals: entry.custom,
    notes: entry.notes,
  };
}

function rowToEntry(row: Record<string, unknown>): DayEntry {
  return {
    meals: (row.meals as string[]) ?? [],
    dinner: (row.dinner as number) ?? null,
    workout: (row.workout as string) ?? null,
    walks: (row.walks as string[]) ?? [],
    weight: (row.weight as number) ?? null,
    water: (row.water as number) ?? 0,
    supplements: (row.supplements as string[]) ?? [],
    sleep: (row.sleep as number) ?? null,
    custom: (row.custom_meals as DayEntry["custom"]) ?? [],
    notes: (row.notes as string) ?? "",
  };
}

export function useDailyLog(userId: string | undefined, onSaveSuccess?: () => void) {
  const [data, setData] = useState<Record<string, DayEntry>>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const debounceTimers = useRef(new Map<string, NodeJS.Timeout>());
  const dataRef = useRef(data);
  dataRef.current = data;

  // Fetch all logs on mount
  useEffect(() => {
    if (!userId) return;

    async function fetchLogs() {
      const { data: rows, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId);

      if (!error && rows) {
        const mapped: Record<string, DayEntry> = {};
        for (const row of rows) {
          mapped[row.date] = rowToEntry(row);
        }
        setData(mapped);
      }

      // Replay offline queue
      await syncQueue(userId!);
      setLoading(false);
    }

    fetchLogs();
  }, [userId]);

  // Listen for online event
  useEffect(() => {
    if (!userId) return;
    const handler = () => syncQueue(userId);
    window.addEventListener("online", handler);
    return () => window.removeEventListener("online", handler);
  }, [userId]);

  async function upsertToSupabase(date: string, entry: DayEntry) {
    if (!userId) return;

    if (!navigator.onLine) {
      enqueueOffline(date, entry);
      return;
    }

    const { error } = await supabase
      .from("daily_logs")
      .upsert(entryToRow(userId, date, entry), { onConflict: "user_id,date" });

    if (error) {
      enqueueOffline(date, entry);
    } else {
      onSaveSuccess?.();
    }
  }

  function enqueueOffline(date: string, entry: DayEntry) {
    try {
      const queue: QueuedWrite[] = JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]");
      const filtered = queue.filter((q) => q.date !== date);
      filtered.push({ date, entry, timestamp: Date.now() });
      localStorage.setItem(OFFLINE_KEY, JSON.stringify(filtered));
    } catch {}
  }

  async function syncQueue(uid: string) {
    try {
      const queue: QueuedWrite[] = JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]");
      if (queue.length === 0) return;

      const remaining: QueuedWrite[] = [];
      for (const q of queue) {
        const { error } = await supabase
          .from("daily_logs")
          .upsert(entryToRow(uid, q.date, q.entry), { onConflict: "user_id,date" });
        if (error) remaining.push(q);
      }
      localStorage.setItem(OFFLINE_KEY, JSON.stringify(remaining));
      if (remaining.length < queue.length) onSaveSuccess?.();
    } catch {}
  }

  function scheduleUpsert(date: string, entry: DayEntry) {
    const existing = debounceTimers.current.get(date);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      upsertToSupabase(date, entry);
      debounceTimers.current.delete(date);
    }, 1000);

    debounceTimers.current.set(date, timer);
  }

  const updateDay = useCallback(
    (date: string, partial: Partial<DayEntry>) => {
      setData((prev) => {
        const current = { ...EMPTY_DAY, ...prev[date] };
        const updated = { ...current, ...partial };
        const next = { ...prev, [date]: updated };

        // Schedule debounced upsert
        scheduleUpsert(date, updated);

        return next;
      });
    },
    [userId]
  );

  const toggleArrayField = useCallback(
    (date: string, field: keyof DayEntry, id: string) => {
      setData((prev) => {
        const current = { ...EMPTY_DAY, ...prev[date] };
        const arr = (current[field] as string[]) || [];
        const updated = {
          ...current,
          [field]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id],
        };
        const next = { ...prev, [date]: updated };

        scheduleUpsert(date, updated);

        return next;
      });
    },
    [userId]
  );

  return { data, loading, updateDay, toggleArrayField };
}
