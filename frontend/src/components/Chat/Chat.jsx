import React, { useState, useEffect } from "react";
import styles from "./Chat.module.css";
import Message from "../Message/Message";
import apiPY from "../../api/axiosPython";

const Chat = ({ externalId, onAddNote }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!externalId) return;

    const fetchHistory = async () => {
      try {
        const res = await apiPY.get("/chat-history", {
          params: {
            "file_ids[]": externalId,
            limit: 50,
          },
        });

        const history = res.data.chat_history || [];

        const parsedMessages = history
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .flatMap((item) => [
            { sender: "user", text: item.question },
            { sender: "bot", text: item.answer },
          ]);

        setMessages(parsedMessages);
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };

    fetchHistory();
  }, [externalId]);

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
        {/* <h2 className={styles.title}>AI Tutor</h2> */}

        <div className={styles.chatBox}>
          {messages.map((msg, idx) => (
            <div key={idx} className={styles.messageWrapper}>
              <Message sender={msg.sender} text={msg.text} />

              {/* Show button only for AI messages */}
              {msg.sender === "bot" && (
                <button
                  className={styles.addToNotesBtn}
                  onClick={() => onAddNote(msg.text)}
                >
                  ➕ Add to Notes
                </button>
              )}
            </div>
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
