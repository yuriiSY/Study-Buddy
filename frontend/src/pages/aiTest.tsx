import { useState } from "react";
import { askAI } from "../lib/aiClient";

export default function AITestPad() {
  const [q, setQ] = useState("");
  const [a, setA] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  async function onAsk(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(""); setA("");
    try {
      const answer = await askAI(q);
      setA(answer);
    } catch (e: any) {
      setErr(e?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "2rem auto", padding: 16 }}>
      <h2>AI Test Pad</h2>
      <form onSubmit={onAsk} style={{ display: "flex", gap: 8 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask me anything…"
          style={{ flex: 1, padding: 8 }}
        />
        <button disabled={!q.trim() || loading}>{loading ? "Thinking…" : "Ask"}</button>
      </form>
      {err && <p style={{ color: "crimson" }}>Error: {err}</p>}
      {a && (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 16, background: "#f6f6f6", padding: 12 }}>
          {a}
        </pre>
      )}
    </div>
  );
}