"use client";

import { COLORS, FONT_SANS, FONT_MONO } from "@/lib/constants";
import { daysBetween, getToday } from "@/lib/helpers";
import type { Cut } from "@/lib/types";

interface CutCardProps {
  cut: Cut;
  isActive?: boolean;
  onClick?: () => void;
}

export default function CutCard({ cut, isActive, onClick }: CutCardProps) {
  const today = getToday();
  const totalDays = daysBetween(cut.start_date, cut.end_date);
  const daysElapsed = Math.max(0, daysBetween(cut.start_date, today));
  const daysRemaining = Math.max(0, daysBetween(today, cut.end_date));
  const totalWeightLoss = cut.start_weight - cut.target_weight;
  const progressPercent =
    totalWeightLoss > 0
      ? Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100))
      : 0;

  const statusColor =
    cut.status === "active"
      ? COLORS.lime
      : cut.status === "completed"
      ? COLORS.mt
      : COLORS.red;

  const statusLabel =
    cut.status === "active"
      ? "ACTIVE"
      : cut.status === "completed"
      ? "COMPLETED"
      : "ABANDONED";

  return (
    <div
      onClick={onClick}
      style={{
        background: COLORS.cd,
        borderRadius: 16,
        border:
          isActive
            ? "1px solid " + COLORS.lime + "44"
            : "1px solid " + COLORS.bd,
        padding: "16px 18px",
        marginBottom: 10,
        cursor: onClick ? "pointer" : "default",
        fontFamily: FONT_SANS,
        transition: "border-color 0.2s",
      }}
    >
      {/* Top row: name + status badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: COLORS.tx,
          }}
        >
          {cut.name}
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: statusColor,
            background: statusColor + "18",
            border: "1px solid " + statusColor + "33",
            borderRadius: 6,
            padding: "3px 8px",
            fontFamily: FONT_MONO,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Date range */}
      <div
        style={{
          fontSize: 12,
          color: COLORS.mt,
          fontFamily: FONT_MONO,
          marginBottom: 8,
        }}
      >
        {cut.start_date} &rarr; {cut.end_date}
        <span style={{ color: COLORS.dm, marginLeft: 8 }}>
          ({totalDays}d)
        </span>
      </div>

      {/* Weight */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: COLORS.tx,
          marginBottom: 10,
        }}
      >
        <span style={{ fontFamily: FONT_MONO }}>{cut.start_weight}</span>
        <span style={{ color: COLORS.dm, margin: "0 6px" }}>kg</span>
        <span style={{ color: COLORS.lime }}>&rarr;</span>
        <span style={{ fontFamily: FONT_MONO, marginLeft: 6 }}>
          {cut.target_weight}
        </span>
        <span style={{ color: COLORS.dm, marginLeft: 4 }}>kg</span>
        <span
          style={{
            color: COLORS.red,
            fontSize: 12,
            fontFamily: FONT_MONO,
            marginLeft: 10,
          }}
        >
          (-{totalWeightLoss}kg)
        </span>
      </div>

      {/* Days remaining (active only) */}
      {isActive && cut.status === "active" && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: COLORS.org,
            fontFamily: FONT_MONO,
            marginBottom: 8,
          }}
        >
          {daysRemaining}d remaining
        </div>
      )}

      {/* Progress bar */}
      <div
        style={{
          width: "100%",
          height: 6,
          borderRadius: 3,
          background: COLORS.bd,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: progressPercent + "%",
            height: "100%",
            borderRadius: 3,
            background:
              cut.status === "active"
                ? COLORS.lime
                : cut.status === "completed"
                ? COLORS.mt
                : COLORS.red,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
