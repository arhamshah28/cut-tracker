"use client";
import CB from "./Checkbox";
import { tx, dm, lime, bd, FONT_MONO } from "@/lib/constants";
import type { Meal } from "@/lib/constants";

export default function MI({
  meal,
  on,
  onTap,
}: {
  meal: Meal;
  on: boolean;
  onTap: () => void;
}) {
  return (
    <button
      onClick={onTap}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        padding: "10px 0",
        cursor: "pointer",
        background: "transparent",
        border: "none",
        borderBottom: "1px solid " + bd,
        color: tx,
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <CB on={on} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, opacity: on ? 1 : 0.45 }}>{meal.n}</div>
          <div style={{ fontSize: 11, color: dm, fontFamily: FONT_MONO }}>{meal.t}</div>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 15, fontFamily: FONT_MONO, fontWeight: 700, color: on ? lime : dm }}>{meal.c}</div>
        <div style={{ fontSize: 10, color: dm, fontFamily: FONT_MONO }}>{meal.p}g</div>
      </div>
    </button>
  );
}
