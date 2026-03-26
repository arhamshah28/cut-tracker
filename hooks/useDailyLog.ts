"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { EMPTY_DAY } from "@/lib/constants";
import type { DayData } from "@/lib/constants";

const QUEUE_KEY = "cut_tracker_offline_queue";

interface QueuedWrite {
  date: string;
  data: DayData;
  timestamp: number;
}

function getOfflineQueue(): QueuedWrite[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setOfflineQueue(queue: QueuedWrite[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function useDailyLog(userId: string | undefined) {
  const [data, setData] = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(false);
  const debounceRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Fetch all logs on mount
  useEffect(() => {
    if (!userId) return;

    async function fetchLogs() {
      const { data: logs, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Fetch error:", error);
        // Try loading from localStorage cache
        try {
          const cached = localStorage.getItem("cut_tracker_cache_" + userId);
          if (cached) setData(JSON.parse(cached));
        } catch {}
        setLoading(false);
        return;
      }

      const mapped: Record<string, DayData> = {};
      for (const log of logs || []) {
        mapped[log.date] = {
          meals: log.meals || [],
          dinner: log.dinner,
          workout: log.workout,
          walks: log.walks || [],
          weight: log.weight ? parseFloat(log.weight) : null,
          water: log.water || 0,
          supplements: log.supplements || [],
          sleep: log.sleep ? parseFloat(log.sleep as string) : null,
          custom: log.custom_meals || [],
          notes: log.notes || "",
        };
      }
      setData(mapped);
      // Cache locally
      try {
        localStorage.setItem("cut_tracker_cache_" + userId, JSON.stringify(mapped));
      } catch {}
      setLoading(false);

      // Flush offline queue
      flushQueue();
    }

    fetchLogs();
  }, [userId]);

  // Flush offline queue
  const flushQueue = useCallback(async () => {
    if (!userId) return;
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    const remaining: QueuedWrite[] = [];
    for (const item of queue) {
      const { error } = await supabase.from("daily_logs").upsert(
        {
          user_id: userId,
          date: item.date,
          meals: item.data.meals,
          dinner: item.data.dinner,
          workout: item.data.workout,
          walks: item.data.walks,
          weight: item.data.weight,
          water: item.data.water,
          supplements: item.data.supplements,
          sleep: item.data.sleep,
          custom_meals: item.data.custom,
          notes: item.data.notes,
        },
        { onConflict: "user_id,date" }
      );
      if (error) remaining.push(item);
    }
    setOfflineQueue(remaining);
  }, [userId]);

  // Save to supabase with debounce
  const saveToSupabase = useCallback(
    (date: string, dayData: DayData) => {
      if (!userId) return;

      if (debounceRef.current[date]) {
        clearTimeout(debounceRef.current[date]);
      }

      debounceRef.current[date] = setTimeout(async () => {
        const { error } = await supabase.from("daily_logs").upsert(
          {
            user_id: userId,
            date: date,
            meals: dayData.meals,
            dinner: dayData.dinner,
            workout: dayData.workout,
            walks: dayData.walks,
            weight: dayData.weight,
            water: dayData.water,
            supplements: dayData.supplements,
            sleep: dayData.sleep,
            custom_meals: dayData.custom,
            notes: dayData.notes,
          },
          { onConflict: "user_id,date" }
        );

        if (error) {
          console.error("Save error:", error);
          // Queue for offline retry
          const queue = getOfflineQueue();
          queue.push({ date, data: dayData, timestamp: Date.now() });
          setOfflineQueue(queue);
        } else {
          setToast(true);
          setTimeout(() => setToast(false), 1500);
        }
      }, 1000);
    },
    [userId]
  );

  // Update a day's data (optimistic + debounced save)
  const updateDay = useCallback(
    (date: string, patch: Partial<DayData>) => {
      setData((prev) => {
        const current = { ...EMPTY_DAY, ...prev[date] };
        const updated = { ...current, ...patch };
        const newData = { ...prev, [date]: updated };

        // Cache locally
        if (userId) {
          try {
            localStorage.setItem("cut_tracker_cache_" + userId, JSON.stringify(newData));
          } catch {}
        }

        // Save to supabase
        saveToSupabase(date, updated);

        return newData;
      });
    },
    [saveToSupabase, userId]
  );

  // Export all data as JSON
  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cut-tracker-export-" + new Date().toISOString().split("T")[0] + ".json";
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  return { data, loading, updateDay, toast, exportData };
}
