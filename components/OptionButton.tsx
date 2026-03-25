"use client";

import Checkbox from "./Checkbox";
import { COLORS, FONT_MONO } from "@/lib/constants";

export default function OptionButton({
  on,
  label,
  sub,
  val,
  onTap,
  color,
}: {
  on: boolean;
  label: string;
  sub?: string;
  val: string;
  onTap: () => void;
  color?: string;
}) {
  const c = color || COLORS.lime;
  return (
    <button
      onClick={onTap}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        padding: "12px 14px",
        borderRadius: 10,
        cursor: "pointer",
        textAlign: "left",
        color: COLORS.tx,
        marginBottom: 4,
        background: on ? "linear-gradient(135deg," + c + "15," + COLORS.cd + ")" : COLORS.bg,
        border: on ? "1px solid " + c + "44" : "1px solid " + COLORS.bd,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Checkbox on={on} color={c} />
        <span style={{ fontSize: 14, fontWeight: 600 }}>
          {sub && (
            <span style={{ color: COLORS.mt, fontFamily: FONT_MONO, fontSize: 11 }}>{sub} </span>
          )}
          {label}
        </span>
      </div>
      <span style={{ fontSize: 14, fontFamily: FONT_MONO, fontWeight: 700, color: on ? c : COLORS.dm }}>{val}</span>
    </button>
  );
}
