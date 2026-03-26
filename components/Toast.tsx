"use client";

export default function Toast({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 80,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#1a2a10",
        color: "#d4ff3a",
        padding: "8px 20px",
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "'JetBrains Mono', monospace",
        border: "1px solid #2a3a1a",
        zIndex: 9999,
        animation: "fadeInUp 0.3s ease",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      }}
    >
      ✓ Saved
    </div>
  );
}
