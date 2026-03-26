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

  // Store ALL mutable values in refs to avoid stale closures
  const userIdRef = useRef(userId);
  const cutIdRef = useRef(cutId);
  const onSaveSuccessRef = useRef(onSaveSuccess);
  const onSaveErrorRef = useRef(onSaveError);
  const dataRef = useRef(data);

  // Keep refs current on every render
  userIdRef.current = userId;
  cutIdRef.current = cutId;
  onSaveSuccessRef.current = onSaveSuccess;
  onSaveErrorRef.current = onSaveError;
  dataRef.current = data;

  const offlineKeyRef = useRef(`cuttracker_offline_${cutId || "default"}`);
  offlineKeyRef.current = `cuttracker_offline_${cutId || "default"}`;

  // Fetch all logs on mount
  useEffect(() => {
    if (!userId || !cutId) return;

    async function fetchLogs() {
      try {
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
          onSaveErrorRef.current?.("Failed to load data");
        }
      } catch (e) {
        console.error("Fetch exception:", e);
      }

      // Replay offline queue
      await syncQueue();
      setLoading(false);
    }

    fetchLogs();
  }, [userId, cutId]);

  // Listen for online event to sync offline queue
  useEffect(() => {
    if (!userId || !cutId) return;
    const handler = () => syncQueue();
    window.addEventListener("online", handler);
    return () => window.removeEventListener("online", handler);
  }, [userId, cutId]);

  // Core save function — reads everything from refs, never stale
  async function saveToSupabase(date: string, entry: DayEntry) {
    const uid = userIdRef.current;
    const cid = cutIdRef.current;
    if (!uid || !cid) {
      console.error("Save skipped: no userId or cutId", { uid: !!uid, cid: !!cid });
      onSaveErrorRef.current?.("Not logged in");
      return;
    }

    if (!navigator.onLine) {
      enqueueOffline(date, entry);
      onSaveErrorRef.current?.("Offline — saved locally");
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
        onSaveErrorRef.current?.("Save failed: " + error.message);
      } else {
        onSaveSuccessRef.current?.();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      console.error("Save exception:", msg);
      enqueueOffline(date, entry);
      onSaveErrorRef.current?.("Save error: " + msg);
    }
  }

  function enqueueOffline(date: string, entry: DayEntry) {
    try {
      const key = offlineKeyRef.current;
      const queue: QueuedWrite[] = JSON.parse(localStorage.getItem(key) || "[]");
      const filtered = queue.filter((q) => q.date !== date);
      filtered.push({ date, entry, timestamp: Date.now() });
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch (e) {
      console.error("Offline queue error:", e);
    }
  }

  async function syncQueue() {
    const uid = userIdRef.current;
    const cid = cutIdRef.current;
    if (!uid || !cid) return;

    try {
      const key = offlineKeyRef.current;
      const queue: QueuedWrite[] = JSON.parse(localStorage.getItem(key) || "[]");
      if (queue.length === 0) return;

      const remaining: QueuedWrite[] = [];
      for (const q of queue) {
        const { error } = await supabase
          .from("daily_logs")
          .upsert(entryToRow(uid, q.date, cid, q.entry), { onConflict: "user_id,date,cut_id" });
        if (error) remaining.push(q);
      }
      localStorage.setItem(key, JSON.stringify(remaining));
      if (remaining.length < queue.length) onSaveSuccessRef.current?.();
    } catch (e) {
      console.error("Sync queue error:", e);
    }
  }

  // Stable save ref — never stale, always calls current saveToSupabase
  const saveRef = useRef(saveToSupabase);
  saveRef.current = saveToSupabase;

  const updateDay = useCallback(
    (date: string, partial: Partial<DayEntry>) => {
      setData((prev) => {
        const current = { ...EMPTY_DAY, ...prev[date] };
        const updated = { ...current, ...partial };
        // Fire save OUTSIDE the updater via microtask
        Promise.resolve().then(() => saveRef.current(date, updated));
        return { ...prev, [date]: updated };
      });
    },
    [] // no deps — saveRef is always current
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
        // Fire save OUTSIDE the updater via microtask
        Promise.resolve().then(() => saveRef.current(date, updated));
        return { ...prev, [date]: updated };
      });
    },
    [] // no deps — saveRef is always current
  );

  return { data, loading, updateDay, toggleArrayField };
}
