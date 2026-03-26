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

export function useDailyLog(
  userId: string | undefined,
  cutId: string | undefined,
  onSaveSuccess?: () => void,
  onSaveError?: (msg: string) => void
) {
  const [data, setData] = useState<Record<string, DayEntry>>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const saveInFlight = useRef(false);
  const userIdRef = useRef(userId);
  const cutIdRef = useRef(cutId);
  userIdRef.current = userId;
  cutIdRef.current = cutId;

  const OFFLINE_KEY = `cuttracker_offline_${cutId || "default"}`;

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
      } else if (error) {
        console.error("Fetch error:", error);
        onSaveError?.("Failed to load data");
      }

      // Replay offline queue
      await syncQueue(userId!, cutId!);
      setLoading(false);
    }

    fetchLogs();
  }, [userId, cutId]);

  // Listen for online event to sync offline queue
  useEffect(() => {
    if (!userId || !cutId) return;
    const handler = () => syncQueue(userId, cutId);
    window.addEventListener("online", handler);
    return () => window.removeEventListener("online", handler);
  }, [userId, cutId]);

  // Save immediately — no debounce
  async function saveNow(date: string, entry: DayEntry) {
    const uid = userIdRef.current;
    const cid = cutIdRef.current;
    if (!uid || !cid) {
      console.error("Save skipped: no userId or cutId", { uid: !!uid, cid: !!cid });
      onSaveError?.("Not logged in");
      return;
    }

    if (!navigator.onLine) {
      enqueueOffline(date, entry);
      onSaveError?.("Offline — saved locally");
      return;
    }

    try {
      const row = entryToRow(uid, date, cid, entry);
      const { error } = await supabase
        .from("daily_logs")
        .upsert(row, { onConflict: "user_id,date,cut_id" });

      if (error) {
        console.error("Supabase save error:", error.message, error.details, error.hint);
        enqueueOffline(date, entry);
        onSaveError?.("Save failed: " + error.message);
      } else {
        onSaveSuccess?.();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      console.error("Save exception:", msg);
      enqueueOffline(date, entry);
      onSaveError?.("Save error: " + msg);
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

  const updateDay = useCallback(
    (date: string, partial: Partial<DayEntry>) => {
      setData((prev) => {
        const current = { ...EMPTY_DAY, ...prev[date] };
        const updated = { ...current, ...partial };
        const next = { ...prev, [date]: updated };
        return next;
      });
      // Save immediately OUTSIDE the state updater
      setData((current) => {
        const entry = { ...EMPTY_DAY, ...current[date] };
        saveNow(date, entry);
        return current; // don't change state, just read it
      });
    },
    [userId, cutId]
  );

  const toggleArrayField = useCallback(
    (date: string, field: keyof DayEntry, id: string) => {
      let updatedEntry: DayEntry | null = null;
      setData((prev) => {
        const current = { ...EMPTY_DAY, ...prev[date] };
        const arr = (current[field] as string[]) || [];
        const updated = {
          ...current,
          [field]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id],
        };
        updatedEntry = updated;
        return { ...prev, [date]: updated };
      });
      // Save immediately after state update
      setTimeout(() => {
        if (updatedEntry) saveNow(date, updatedEntry);
      }, 0);
    },
    [userId, cutId]
  );

  return { data, loading, updateDay, toggleArrayField };
}
