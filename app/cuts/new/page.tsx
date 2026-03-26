"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCut } from "@/hooks/useCut";
import CutWizard from "@/components/CutWizard";
import { COLORS, FONT_SANS, FONT_MONO } from "@/lib/constants";
import type { Cut } from "@/lib/types";

export default function NewCutPage() {
  const { user, loading: authLoading } = useAuth();
  const { cut, loading: cutLoading, hasCut, createCut } = useCut(user?.id);
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const allLoading = authLoading || cutLoading;

  // Redirect to / if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  async function handleComplete(cutData: Omit<Cut, "id" | "user_id" | "created_at" | "updated_at">) {
    setCreating(true);
    try {
      await createCut(cutData);
      router.replace("/tracker");
    } finally {
      setCreating(false);
    }
  }

  function handleCancel() {
    router.push("/cuts");
  }

  if (allLoading || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: COLORS.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            background: COLORS.lime,
            boxShadow: "0 0 20px " + COLORS.lime + "88",
          }}
          className="animate-pulse"
        />
      </div>
    );
  }

  // Warning if active cut exists
  if (hasCut && cut) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: COLORS.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          fontFamily: FONT_SANS,
        }}
      >
        <div
          style={{
            maxWidth: 420,
            width: "100%",
            background: COLORS.cd,
            borderRadius: 16,
            border: "1px solid " + COLORS.bd,
            padding: 32,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              background: COLORS.org + "22",
              border: "2px solid " + COLORS.org + "44",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 22,
            }}
          >
            !
          </div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: COLORS.tx,
              marginBottom: 10,
            }}
          >
            Active Cut Exists
          </h2>
          <p
            style={{
              fontSize: 13,
              color: COLORS.mt,
              fontFamily: FONT_MONO,
              marginBottom: 8,
              lineHeight: 1.6,
            }}
          >
            You have an active cut. End it first before starting a new one.
          </p>
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.org,
              fontFamily: FONT_MONO,
              marginBottom: 24,
            }}
          >
            {cut.name}
          </p>
          <button
            onClick={() => router.push("/cuts")}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 12,
              border: "none",
              background: COLORS.lime,
              color: "#080808",
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: FONT_SANS,
            }}
          >
            Go to My Cuts
          </button>
        </div>
      </div>
    );
  }

  if (creating) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: COLORS.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            background: COLORS.lime,
            boxShadow: "0 0 20px " + COLORS.lime + "88",
            marginBottom: 12,
          }}
          className="animate-pulse"
        />
        <span
          style={{
            color: COLORS.mt,
            fontSize: 13,
            fontFamily: FONT_MONO,
          }}
        >
          Creating your cut...
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        padding: "20px 16px 40px",
        fontFamily: FONT_SANS,
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: COLORS.lime,
              boxShadow: "0 0 10px " + COLORS.lime + "88",
            }}
          />
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: COLORS.lime,
              letterSpacing: 1.5,
            }}
          >
            NEW CUT
          </span>
        </div>

        <CutWizard onComplete={handleComplete} onCancel={handleCancel} />
      </div>
    </div>
  );
}
