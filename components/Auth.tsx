"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { COLORS, FONT_MONO, FONT_SANS, INPUT_STYLE } from "@/lib/constants";

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: FONT_SANS,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: COLORS.cd,
          borderRadius: 20,
          border: "1px solid " + COLORS.bd,
          padding: 32,
        }}
      >
        {/* Branding */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                background: COLORS.lime,
                boxShadow: "0 0 12px " + COLORS.lime + "88",
              }}
            />
            <span style={{ fontSize: 20, fontWeight: 800, color: COLORS.lime, letterSpacing: 1.5 }}>
              CUT TRACKER
            </span>
          </div>
          <p style={{ fontSize: 13, color: COLORS.mt, fontFamily: FONT_MONO, marginTop: 8 }}>
            Customizable Weight Cut Tracker
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={INPUT_STYLE}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={INPUT_STYLE}
            />
          </div>

          {error && (
            <div
              style={{
                fontSize: 13,
                color: COLORS.red,
                marginBottom: 14,
                padding: "8px 12px",
                borderRadius: 8,
                background: COLORS.red + "15",
                border: "1px solid " + COLORS.red + "33",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 12,
              border: "none",
              background: COLORS.lime,
              color: "#080808",
              fontSize: 15,
              fontWeight: 800,
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.7 : 1,
              fontFamily: FONT_SANS,
              marginBottom: 10,
            }}
          >
            {loading ? "..." : isSignUp ? "Create Account" : "Sign In"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 12,
              border: "1px solid " + COLORS.bd,
              background: "transparent",
              color: COLORS.mt,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: FONT_MONO,
              fontWeight: 600,
            }}
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
