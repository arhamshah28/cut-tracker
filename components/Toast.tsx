"use client";

import { COLORS, FONT_MONO } from "@/lib/constants";

export default function Toast({ message, visible }: { message: string | null; visible: boolean }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 80,
        left: "50%",
        transform: visible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(20px)",
        opacity: visible ? 1 : 0,
        background: COLORS.cd,
        border: "1px solid " + COLORS.bd,
        borderRadius: 12,
        padding: "10px 24px",
        fontFamily: FONT_MONO,
        fontSize: 13,
        fontWeight: 700,
        color: COLORS.lime,
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        transition: "all 0.3s ease",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      {message || ""}
    </div>
  );
}
