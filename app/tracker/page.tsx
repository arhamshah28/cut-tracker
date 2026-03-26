"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useCut } from "@/hooks/useCut";
import Tracker from "@/components/Tracker";
import { COLORS, FONT_SANS } from "@/lib/constants";

export default function TrackerPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, hasProfile } = useProfile(user?.id);
  const { cut, loading: cutLoading, hasCut } = useCut(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading && !profileLoading && user && !hasProfile) {
      router.replace("/setup");
    }
  }, [user, authLoading, profileLoading, hasProfile, router]);

  useEffect(() => {
    if (!authLoading && !profileLoading && !cutLoading && user && hasProfile && !hasCut) {
      router.replace("/cuts");
    }
  }, [user, authLoading, profileLoading, cutLoading, hasProfile, hasCut, router]);

  const isLoading = authLoading || profileLoading || cutLoading || !user || !profile || !cut;

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, maxWidth: 480, margin: "0 auto", padding: 16, fontFamily: FONT_SANS }}>
        <div style={{ height: 20, width: 140, background: COLORS.bd, borderRadius: 8, marginBottom: 8 }} className="animate-pulse" />
        <div style={{ height: 14, width: 200, background: COLORS.bd, borderRadius: 6, marginBottom: 16 }} className="animate-pulse" />
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {Array(7).fill(0).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 50, background: COLORS.bd, borderRadius: 10 }} className="animate-pulse" />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 16 }}>
          {Array(4).fill(0).map((_, i) => (
            <div key={i} style={{ height: 64, background: COLORS.cd, borderRadius: 12 }} className="animate-pulse" />
          ))}
        </div>
        {Array(3).fill(0).map((_, i) => (
          <div key={i} style={{ height: 120, background: COLORS.cd, borderRadius: 16, marginBottom: 10 }} className="animate-pulse" />
        ))}
      </div>
    );
  }

  return <Tracker cut={cut} profile={profile} />;
}
