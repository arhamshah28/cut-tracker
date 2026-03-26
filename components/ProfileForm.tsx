"use client";

import { useState } from "react";
import { COLORS, FONT_SANS, FONT_MONO, INPUT_STYLE } from "@/lib/constants";
import type { UserProfile } from "@/lib/types";

interface ProfileFormProps {
  profile: UserProfile | null;
  onSave: (profile: Partial<UserProfile>) => void;
  submitLabel?: string;
}

export default function ProfileForm({ profile, onSave, submitLabel }: ProfileFormProps) {
  const [heightCm, setHeightCm] = useState(profile?.height_cm || 0);
  const [age, setAge] = useState(profile?.age || 0);
  const [gender, setGender] = useState<"male" | "female">(profile?.gender || "male");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ height_cm: heightCm, age, gender });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: "100%",
        maxWidth: 480,
        fontFamily: FONT_SANS,
      }}
    >
      {/* Height */}
      <div style={{ marginBottom: 18 }}>
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 700,
            color: COLORS.mt,
            fontFamily: FONT_MONO,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Height (cm)
        </label>
        <input
          type="number"
          min={100}
          max={250}
          value={heightCm || ""}
          onChange={(e) => setHeightCm(Number(e.target.value))}
          required
          placeholder="e.g. 175"
          style={INPUT_STYLE}
        />
      </div>

      {/* Age */}
      <div style={{ marginBottom: 18 }}>
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 700,
            color: COLORS.mt,
            fontFamily: FONT_MONO,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Age
        </label>
        <input
          type="number"
          min={14}
          max={80}
          value={age || ""}
          onChange={(e) => setAge(Number(e.target.value))}
          required
          placeholder="e.g. 25"
          style={INPUT_STYLE}
        />
      </div>

      {/* Gender Toggle */}
      <div style={{ marginBottom: 24 }}>
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 700,
            color: COLORS.mt,
            fontFamily: FONT_MONO,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Gender
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => setGender("male")}
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 10,
              border:
                gender === "male"
                  ? "1px solid " + COLORS.lime + "44"
                  : "1px solid " + COLORS.bd,
              background:
                gender === "male"
                  ? "linear-gradient(135deg," + COLORS.lime + "15," + COLORS.cd + ")"
                  : COLORS.bg,
              color: gender === "male" ? COLORS.lime : COLORS.mt,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT_SANS,
            }}
          >
            Male
          </button>
          <button
            type="button"
            onClick={() => setGender("female")}
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 10,
              border:
                gender === "female"
                  ? "1px solid " + COLORS.lime + "44"
                  : "1px solid " + COLORS.bd,
              background:
                gender === "female"
                  ? "linear-gradient(135deg," + COLORS.lime + "15," + COLORS.cd + ")"
                  : COLORS.bg,
              color: gender === "female" ? COLORS.lime : COLORS.mt,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT_SANS,
            }}
          >
            Female
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={saving || !heightCm || !age}
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 12,
          border: "none",
          background: COLORS.lime,
          color: "#080808",
          fontSize: 15,
          fontWeight: 800,
          cursor: saving ? "wait" : "pointer",
          opacity: saving || !heightCm || !age ? 0.7 : 1,
          fontFamily: FONT_SANS,
        }}
      >
        {saving ? "..." : submitLabel || "Save Profile"}
      </button>
    </form>
  );
}
