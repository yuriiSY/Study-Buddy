// src/pages/LoginPage/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// Our auth helpers: real login + token persistence + fetch wrapper if needed
import { login, setToken, setUser } from "../../lib/auth";

/**
 * LoginPage
 *
 * - Renders email/password fields.
 * - Calls your backend POST /api/auth/login via login({...}).
 * - On success, stores the token and navigates to /study (or the originally requested page).
 * - Shows helpful error messages on failure.
 *
 * Backend contract (customize as needed):
 *   POST { email, password } -> 200 { token, user? } | 4xx { error }
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/study";

  // Form state
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");

  // UI state
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState("");
  const [showPass, setShowPass] = useState(false);

  function isValidEmail(v) {
    return /\S+@\S+\.\S+/.test(v);
  }

  async function onSubmit(e) {
    e.preventDefault();                // prevent full page reload
    setErr("");

    if (!email || !pass) {
      setErr("Please enter both email and password.");
      return;
    }
    if (!isValidEmail(email)) {
      setErr("Please enter a valid email address.");
      return;
    }

    setBusy(true);
    try {
      // Call real backend (defined in lib/auth.js)
      const { token, user } = await login({ email, password: pass });

      // Optional: setToken/setUser already done in login(); these are here if you keep them separate
      setToken(token);
      if (user) setUser(user);

      // Navigate to the intended page (from RequireAuth) or /study
      navigate(redirectTo, { replace: true });
    } catch (e) {
      setErr(e?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        width: 360,
        padding: 24,
        border: "1px solid #e6e6e6",
        borderRadius: 12,
        background: "#fff",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 16 }}>Sign in</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Email</span>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Password</span>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
              required
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1px solid #ddd",
                flex: 1,
              }}
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              style={{
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: "#fafafa",
                cursor: "pointer",
              }}
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
        </label>

        <button
          type="submit"
          disabled={busy}
          style={{
            marginTop: 8,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: busy ? "#eaeaea" : "#000",
            color: busy ? "#777" : "#fff",
            cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>

        {err ? (
          <div style={{ color: "crimson", fontSize: 14 }}>{err}</div>
        ) : (
          <div style={{ color: "#666", fontSize: 12 }}>
            This page calls <code>POST /api/auth/login</code> and redirects to{" "}
            <code>{redirectTo}</code> on success.
          </div>
        )}
      </form>
    </div>
  );
}