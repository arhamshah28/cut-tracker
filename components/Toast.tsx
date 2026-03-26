"use client";

import { COLORS, FONT_MONO } from "@/lib/constants";

export default function Toast({ message, visible }: { message: string | null; visible: boolean }) {
  const isError = message?.startsWith("⚠");
  return (
    <div
      style={{
        position: "fixed",
        bottom: "calc(80px + env(safe-area-inset-bottom, 0px))",
        left: "50%",
        transform: visible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(20px)",
        opacity: visible ? 1 : 0,
        background: isError ? "#2a1010" : COLORS.cd,
        border: "1px solid " + (isError ? "#ff4444" : COLORS.bd),
        borderRadius: 12,
        padding: "10px 24px",
        fontFamily: FONT_MONO,
        fontSize: 13,
        fontWeight: 700,
        color: isError ? "#ff6666" : COLORS.lime,
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        transition: "all 0.3s ease",
        pointerEvents: "none",
        zIndex: 1000,
        maxWidth: "90vw",
        textAlign: "center",
      }}
    >
      {message || ""}
    </div>
  );
}
