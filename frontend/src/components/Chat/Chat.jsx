import React, { useState } from "react";
import styles from "./Chat.module.css";
import Message from "../Message/Message";
import { askAI } from "../../lib/aiClient";

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! Ask me anything about your study material." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(e) {
    e.preventDefault();
    const q = input.trim();
    if (!q || busy) return;

    setError("");
    setInput("");

    // add user msg + a temporary “thinking” bubble
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: q },
      { sender: "bot", text: "…thinking" },
    ]);

    setBusy(true);
    try {
      const answer = await askAI(q);

      // replace the last “thinking” bubble with the real answer
      setMessages((prev) => {
        const next = [...prev];
        const idx = next.findLastIndex((m) => m.sender === "bot" && m.text === "…thinking");
        if (idx !== -1) next.splice(idx, 1, { sender: "bot", text: answer });
        else next.push({ sender: "bot", text: answer });
        return next;
      });
    } catch (err) {
      setError(err?.message || "AI request failed");
      setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ Error contacting AI." }]);
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // submit the form
      e.currentTarget.form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }
  }

  return (
    <div className={styles.chatContainer}>
      <h2 className={styles.title}>AI Tutor</h2>

      <div className={styles.chatBox}>
        {messages.map((msg, idx) => (
          <Message key={idx} sender={msg.sender} text={msg.text} />
        ))}
      </div>

      <form onSubmit={sendMessage} className={styles.inputArea}>
        <input
          type="text"
          className={styles.input}
          placeholder='Ask about: "∫ f(x) dx = F(x) + C"'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={busy}
        />
        <button className={styles.sendBtn} type="submit" disabled={!input.trim() || busy}>
          {busy ? "…" : "➤"}
        </button>
      </form>

      {error && <div style={{ color: "crimson", padding: "8px 12px" }}>Error: {error}</div>}
    </div>
  );
}