"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Auth from "@/components/Auth";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/tracker");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#070710", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 12, height: 12, borderRadius: 6, background: "#d4ff3a", boxShadow: "0 0 20px #d4ff3a88" }} className="animate-pulse" />
      </div>
    );
  }

  if (user) return null;

  return <Auth />;
}
