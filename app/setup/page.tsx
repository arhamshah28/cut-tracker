"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useCut } from "@/hooks/useCut";
import ProfileForm from "@/components/ProfileForm";
import CutWizard from "@/components/CutWizard";
import { COLORS, FONT_SANS, FONT_MONO } from "@/lib/constants";
import type { Cut } from "@/lib/types";

export default function SetupPage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, hasProfile, updateProfile } = useProfile(user?.id);
  const { cut, loading: cutLoading, hasCut, createCut } = useCut(user?.id);
  const router = useRouter();
  const [setupStep, setSetupStep] = useState(0);
  const [creating, setCreating] = useState(false);

  const allLoading = authLoading || profileLoading || cutLoading;

  // Redirect to / if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  // Redirect to /tracker if already has profile AND active cut
  useEffect(() => {
    if (!allLoading && hasProfile && hasCut) {
      router.replace("/tracker");
    }
  }, [allLoading, hasProfile, hasCut, router]);

  // If profile already exists, skip to step 2
  useEffect(() => {
    if (!allLoading && hasProfile && !hasCut) {
      setSetupStep(1);
    }
  }, [allLoading, hasProfile, hasCut]);

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

  async function handleProfileSave(data: Parameters<typeof updateProfile>[0]) {
    await updateProfile(data);
    setSetupStep(1);
  }

  async function handleCutComplete(cutData: Omit<Cut, "id" | "user_id" | "created_at" | "updated_at">) {
    setCreating(true);
    try {
      await createCut(cutData);
      router.replace("/tracker");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        padding: "40px 20px",
        fontFamily: FONT_SANS,
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        {/* Branding */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                background: COLORS.lime,
                boxShadow: "0 0 12px " + COLORS.lime + "88",
              }}
            />
            <span
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: COLORS.lime,
                letterSpacing: 1.5,
              }}
            >
              CUT TRACKER
            </span>
          </div>
        </div>

        {/* Step indicator */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {["Profile", "First Cut"].map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 800,
                  fontFamily: FONT_MONO,
                  background: i === setupStep ? COLORS.lime : i < setupStep ? COLORS.lime + "33" : COLORS.bd,
                  color: i === setupStep ? "#080808" : i < setupStep ? COLORS.lime : COLORS.dm,
                  border: i === setupStep ? "2px solid " + COLORS.lime : i < setupStep ? "2px solid " + COLORS.lime + "55" : "2px solid " + COLORS.bd,
                }}
              >
                {i + 1}
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: FONT_MONO,
                  color: i === setupStep ? COLORS.lime : COLORS.dm,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {label}
              </span>
              {i < 1 && (
                <div
                  style={{
                    width: 30,
                    height: 2,
                    background: i < setupStep ? COLORS.lime + "55" : COLORS.bd,
                    marginLeft: 4,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Profile */}
        {setupStep === 0 && (
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: COLORS.tx,
                marginBottom: 6,
                textAlign: "center",
              }}
            >
              Welcome to Cut Tracker
            </h1>
            <p
              style={{
                fontSize: 13,
                color: COLORS.mt,
                fontFamily: FONT_MONO,
                marginBottom: 28,
                textAlign: "center",
              }}
            >
              Set up your profile to get started
            </p>
            <div
              style={{
                background: COLORS.cd,
                borderRadius: 16,
                border: "1px solid " + COLORS.bd,
                padding: 24,
              }}
            >
              <ProfileForm
                profile={profile}
                onSave={handleProfileSave}
                submitLabel="Continue"
              />
            </div>
          </div>
        )}

        {/* Step 1: Create first cut */}
        {setupStep === 1 && (
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: COLORS.tx,
                marginBottom: 6,
                textAlign: "center",
              }}
            >
              Create Your First Cut
            </h1>
            <p
              style={{
                fontSize: 13,
                color: COLORS.mt,
                fontFamily: FONT_MONO,
                marginBottom: 28,
                textAlign: "center",
              }}
            >
              Set up your cut plan
            </p>
            {creating ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    background: COLORS.lime,
                    boxShadow: "0 0 20px " + COLORS.lime + "88",
                    margin: "0 auto 12px",
                  }}
                  className="animate-pulse"
                />
                <span style={{ color: COLORS.mt, fontSize: 13, fontFamily: FONT_MONO }}>
                  Creating your cut...
                </span>
              </div>
            ) : (
              <CutWizard onComplete={handleCutComplete} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
