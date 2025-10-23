import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
//import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Non-2xx -> surface API error text if present
      if (!res.ok) {
        let apiError = "Login failed. Check your credentials.";
        try {
          const errJson = await res.json();
          if (errJson?.error) apiError = errJson.error;
          if (errJson?.message) apiError = errJson.message;
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(apiError);
      }

      // Expecting { token, user } but we handle flexible shapes
      const data = await res.json();
      const token = data?.token || data?.accessToken || data?.jwt;
      if (!token) throw new Error("Server did not return a token.");

      // Persist token for later authenticated requests
      localStorage.setItem("token", token);
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Go to dashboard (adjust path to match your app)
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "6rem auto",
        padding: "2rem",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        background: "#fff",
      }}
    >
      <h1 style={{ margin: 0, marginBottom: "1rem" }}>Welcome back</h1>
      <p style={{ marginTop: 0, color: "#4b5563" }}>
        Sign in to continue to Study Buddy.
      </p>

      {errorMsg ? (
        <div
          role="alert"
          style={{
            background: "#FEF2F2",
            color: "#991B1B",
            padding: "0.75rem 1rem",
            borderRadius: 8,
            marginBottom: "1rem",
            border: "1px solid #FCA5A5",
          }}
        >
          {errorMsg}
        </div>
      ) : null}

      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          style={inputStyle}
        />

        <label
          style={{
            display: "block",
            fontWeight: 600,
            marginTop: 14,
            marginBottom: 6,
          }}
        >
          Password
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Your password"
            style={{ ...inputStyle, paddingRight: 88 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            style={ghostBtn}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            marginTop: 18,
            padding: "0.75rem 1rem",
            borderRadius: 10,
            border: "1px solid transparent",
            background: loading ? "#9CA3AF" : "#111827",
            color: "#fff",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p style={{ marginTop: 18, fontSize: 14, color: "#6b7280" }}>
        Don’t have an account? <Link to="/register">Create one</Link>
      </p>
    </div>
  );
}

// Inline styles for simplicity (replace with your CSS classes if you prefer)
const inputStyle = {
  width: "100%",
  padding: "0.65rem 0.9rem",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  outline: "none",
};

const ghostBtn = {
  position: "absolute",
  right: 8,
  top: 8,
  padding: "0.4rem 0.6rem",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  background: "#F9FAFB",
  cursor: "pointer",
};