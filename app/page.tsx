"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Auth from "@/components/Auth";

export default function Home() {
  const { user, loading, signIn, signUp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/tracker");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#070710", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#d4ff3a", margin: "0 auto 12px", boxShadow: "0 0 12px #d4ff3a88" }} />
          <span style={{ color: "#8888a8", fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>Loading...</span>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div style={{ minHeight: "100vh", background: "#070710", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#8888a8", fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>Redirecting...</span>
      </div>
    );
  }

  return <Auth onSignIn={signIn} onSignUp={signUp} />;
}
