import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        let msg = "Registration failed.";
        try { const j = await res.json(); msg = j?.error || j?.message || msg; } catch {}
        throw new Error(msg);
      }
      navigate("/login", { replace: true });
    } catch (e) { setErr(e.message || "Something went wrong."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth: 480, margin: "6rem auto", padding: 24, background: "#fff",
      border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}>
      <h1>Create your account</h1>
      {err && (
        <div role="alert" style={{ background: "#FEF2F2", color: "#991B1B", padding: "0.75rem 1rem",
          borderRadius: 8, marginBottom: 12, border: "1px solid #FCA5A5" }}>
          {err}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Name</label>
        <input name="name" value={form.name} onChange={onChange} required placeholder="Your name" style={inputStyle} />
        <label style={{ display: "block", fontWeight: 600, marginTop: 12, marginBottom: 6 }}>Email</label>
        <input name="email" type="email" value={form.email} onChange={onChange} required placeholder="you@example.com" style={inputStyle} />
        <label style={{ display: "block", fontWeight: 600, marginTop: 12, marginBottom: 6 }}>Password</label>
        <input name="password" type="password" value={form.password} onChange={onChange} required placeholder="Choose a password" style={inputStyle} />
        <button type="submit" disabled={loading}
          style={{ width: "100%", marginTop: 16, padding: "0.75rem 1rem", borderRadius: 10,
          border: "1px solid transparent", background: loading ? "#9CA3AF" : "#111827",
          color: "#fff", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p style={{ marginTop: 14, fontSize: 14, color: "#6b7280" }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "0.65rem 0.9rem", borderRadius: 10, border: "1px solid #e5e7eb", outline: "none" };

export default RegisterPage;