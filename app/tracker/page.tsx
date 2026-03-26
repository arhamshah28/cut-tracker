"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDailyLog } from "@/hooks/useDailyLog";
import Tracker from "@/components/Tracker";

function LoadingSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "#070710", maxWidth: 480, margin: "0 auto", padding: 16 }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: 20 }}>
        <div className="skeleton" style={{ width: 140, height: 20, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 200, height: 14 }} />
      </div>
      {/* Date nav skeleton */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="skeleton" style={{ flex: 1, height: 48 }} />
        ))}
      </div>
      {/* Stats skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 20 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton" style={{ height: 70 }} />
        ))}
      </div>
      {/* Cards skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton" style={{ height: 120, marginBottom: 10 }} />
      ))}
    </div>
  );
}

export default function TrackerPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { data, loading: dataLoading, updateDay, toast, exportData } = useDailyLog(user?.id);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return <LoadingSkeleton />;
  }

  if (dataLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Tracker
      data={data}
      updateDay={updateDay}
      toast={toast}
      onSignOut={async () => {
        await signOut();
        router.push("/");
      }}
      exportData={exportData}
    />
  );
}
