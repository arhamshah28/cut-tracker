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

function entryToRow(userId: string, date: string, cutId: string, entry: DayEntry) {
  return {
    user_id: userId,
    date,
    cut_id: cutId,
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

export function useDailyLog(userId: string | undefined, cutId: string | undefined, onSaveSuccess?: () => void) {
  const [data, setData] = useState<Record<string, DayEntry>>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const debounceTimers = useRef(new Map<string, NodeJS.Timeout>());
  const dataRef = useRef(data);
  dataRef.current = data;

  const OFFLINE_KEY = `cuttracker_offline_${cutId || 'default'}`;

  // Fetch all logs on mount
  useEffect(() => {
    if (!userId || !cutId) return;

    async function fetchLogs() {
      const { data: rows, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId)
        .eq("cut_id", cutId);

      if (!error && rows) {
        const mapped: Record<string, DayEntry> = {};
        for (const row of rows) {
          mapped[row.date] = rowToEntry(row);
        }
        setData(mapped);
      }

      // Replay offline queue
      await syncQueue(userId!, cutId!);
      setLoading(false);
    }

    fetchLogs();
  }, [userId, cutId]);

  // Listen for online event
  useEffect(() => {
    if (!userId || !cutId) return;
    const handler = () => syncQueue(userId, cutId);
    window.addEventListener("online", handler);
    return () => window.removeEventListener("online", handler);
  }, [userId, cutId]);

  async function upsertToSupabase(date: string, entry: DayEntry) {
    if (!userId || !cutId) return;

    if (!navigator.onLine) {
      enqueueOffline(date, entry);
      return;
    }

    const { error } = await supabase
      .from("daily_logs")
      .upsert(entryToRow(userId, date, cutId, entry), { onConflict: "user_id,date,cut_id" });

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

  async function syncQueue(uid: string, cid: string) {
    try {
      const queue: QueuedWrite[] = JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]");
      if (queue.length === 0) return;

      const remaining: QueuedWrite[] = [];
      for (const q of queue) {
        const { error } = await supabase
          .from("daily_logs")
          .upsert(entryToRow(uid, q.date, cid, q.entry), { onConflict: "user_id,date,cut_id" });
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
    [userId, cutId]
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
    [userId, cutId]
  );

  return { data, loading, updateDay, toggleArrayField };
}
