"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCut } from "@/hooks/useCut";
import CutCard from "@/components/CutCard";
import { COLORS, FONT_SANS, FONT_MONO } from "@/lib/constants";

export default function CutsPage() {
  const { user, loading: authLoading } = useAuth();
  const { cut, allCuts, loading: cutLoading, endCut } = useCut(user?.id);
  const router = useRouter();
  const [showEndMenu, setShowEndMenu] = useState(false);
  const [ending, setEnding] = useState(false);

  const allLoading = authLoading || cutLoading;

  // Redirect to / if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  async function handleEndCut(status: "completed" | "abandoned") {
    setEnding(true);
    setShowEndMenu(false);
    try {
      await endCut(status);
    } finally {
      setEnding(false);
    }
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

  const pastCuts = allCuts.filter((c) => c.status !== "active");

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
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
              MY CUTS
            </span>
          </div>
          {cut && (
            <button
              onClick={() => router.push("/tracker")}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid " + COLORS.bd,
                background: "transparent",
                color: COLORS.mt,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: FONT_MONO,
              }}
            >
              Back to Tracker
            </button>
          )}
        </div>

        {/* Active cut section */}
        {cut && (
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.mt,
                fontFamily: FONT_MONO,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Active Cut
            </div>
            <CutCard cut={cut} isActive />

            {/* End Cut dropdown */}
            <div style={{ position: "relative", marginTop: 8 }}>
              <button
                onClick={() => setShowEndMenu(!showEndMenu)}
                disabled={ending}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid " + COLORS.red + "44",
                  background: COLORS.red + "15",
                  color: COLORS.red,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: ending ? "wait" : "pointer",
                  fontFamily: FONT_SANS,
                  opacity: ending ? 0.6 : 1,
                }}
              >
                {ending ? "Ending..." : "End Cut"}
              </button>
              {showEndMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    marginTop: 4,
                    background: COLORS.cd,
                    border: "1px solid " + COLORS.bd,
                    borderRadius: 12,
                    overflow: "hidden",
                    zIndex: 10,
                  }}
                >
                  <button
                    onClick={() => handleEndCut("completed")}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      border: "none",
                      borderBottom: "1px solid " + COLORS.bd,
                      background: "transparent",
                      color: COLORS.lime,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: FONT_SANS,
                      textAlign: "left",
                    }}
                  >
                    Mark as Completed
                  </button>
                  <button
                    onClick={() => handleEndCut("abandoned")}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      border: "none",
                      background: "transparent",
                      color: COLORS.red,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: FONT_SANS,
                      textAlign: "left",
                    }}
                  >
                    Mark as Abandoned
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Start New Cut button */}
        <button
          onClick={() => router.push("/cuts/new")}
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
            marginBottom: 28,
          }}
        >
          Start New Cut
        </button>

        {/* Past cuts list */}
        {pastCuts.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.mt,
                fontFamily: FONT_MONO,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Past Cuts
            </div>
            {pastCuts.map((c) => (
              <CutCard key={c.id} cut={c} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {allCuts.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: COLORS.dm,
              fontSize: 14,
              fontFamily: FONT_MONO,
            }}
          >
            No cuts yet. Start your first one above.
          </div>
        )}
      </div>

      {/* Click outside to close end menu */}
      {showEndMenu && (
        <div
          onClick={() => setShowEndMenu(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 5,
          }}
        />
      )}
    </div>
  );
}
