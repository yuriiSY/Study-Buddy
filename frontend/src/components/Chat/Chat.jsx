import React, { useState } from "react";
import styles from "./Chat.module.css";
import Message from "../Message/Message";
import apiPY from "../../api/axiosPython";

const Chat = ({ externalId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiPY.post("/ask", {
        question: input,
        file_ids: [externalId],
      });

      const botMessage = {
        sender: "bot",
        text: res.data?.answer || "No answer returned.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat request failed:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.chatContainer}>
        <h2 className={styles.title}>
          AI Tutor{" "}
          {externalId ? <span className={styles.sub}>– linked</span> : ""}
        </h2>

        <div className={styles.chatBox}>
          {messages.map((msg, idx) => (
            <Message key={idx} sender={msg.sender} text={msg.text} />
          ))}
          {loading && <Message sender="bot" text="Thinking..." />}
        </div>

        <form onSubmit={sendMessage} className={styles.inputArea}>
          <input
            type="text"
            placeholder="Ask about your uploaded notes..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={styles.input}
            disabled={loading}
          />
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={loading || !externalId}
            title={!externalId ? "Select a file first" : "Send message"}
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
