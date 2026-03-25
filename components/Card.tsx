"use client";

import { COLORS, FONT_MONO } from "@/lib/constants";

export default function Card({
  title,
  accent,
  children,
}: {
  title: string;
  accent?: string;
  children: React.ReactNode;
}) {
  const ac = accent || "#222240";
  return (
    <div
      style={{
        background: COLORS.cd,
        borderRadius: 16,
        border: "1px solid " + COLORS.bd,
        marginBottom: 10,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 16px 6px",
          borderBottom: "1px solid " + COLORS.bd,
          background: "linear-gradient(135deg," + ac + "22," + COLORS.cd + ")",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: COLORS.mt,
            fontFamily: FONT_MONO,
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ padding: "6px 16px 14px" }}>{children}</div>
    </div>
  );
}
