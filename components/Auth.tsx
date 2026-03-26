"use client";
import { useState } from "react";
import { bg, cd, bd, mt, dm, lime, FONT_SANS, FONT_MONO, inputStyle } from "@/lib/constants";

export default function Auth({
  onSignIn,
  onSignUp,
}: {
  onSignIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  onSignUp: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (isSignUp) {
      const { error } = await onSignUp(email, password);
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Check your email for the confirmation link!");
      }
    } else {
      const { error } = await onSignIn(email, password);
      if (error) {
        setError(error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_SANS,
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: cd,
          borderRadius: 20,
          border: "1px solid " + bd,
          padding: 32,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                background: lime,
                boxShadow: "0 0 12px " + lime + "88",
              }}
            />
            <span style={{ fontSize: 20, fontWeight: 800, color: lime, letterSpacing: 1 }}>CUT TRACKER</span>
          </div>
          <p style={{ fontSize: 13, color: mt, fontFamily: FONT_MONO }}>38-day weight cut system</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: dm, fontFamily: FONT_MONO, fontWeight: 700, letterSpacing: 1, marginBottom: 6, display: "block" }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: dm, fontFamily: FONT_MONO, fontWeight: 700, letterSpacing: 1, marginBottom: 6, display: "block" }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={inputStyle}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                background: "#2a0a0a",
                border: "1px solid #4a1515",
                color: "#ff5c6c",
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                background: "#0a2a0a",
                border: "1px solid #154a15",
                color: lime,
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              {success}
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
              background: lime,
              color: "#080808",
              fontSize: 15,
              fontWeight: 800,
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.6 : 1,
              fontFamily: FONT_SANS,
              letterSpacing: 0.5,
            }}
          >
            {loading ? "..." : isSignUp ? "CREATE ACCOUNT" : "SIGN IN"}
          </button>
        </form>

        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
            setSuccess("");
          }}
          style={{
            width: "100%",
            padding: 12,
            marginTop: 12,
            background: "transparent",
            border: "1px solid " + bd,
            borderRadius: 10,
            color: mt,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: FONT_SANS,
          }}
        >
          {isSignUp ? "Already have an account? Sign in" : "New here? Create account"}
        </button>
      </div>
    </div>
  );
}
