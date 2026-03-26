"use client";
import { lime } from "@/lib/constants";

function Chk() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function CB({ on, color }: { on: boolean; color?: string }) {
  const c = color || lime;
  return (
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: 7,
        flexShrink: 0,
        border: on ? "none" : "2px solid #333348",
        background: on ? c : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#080808",
        transition: "all .2s",
      }}
    >
      {on && <Chk />}
    </div>
  );
}
