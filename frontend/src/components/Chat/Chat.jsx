import React, { useState } from "react";
import styles from "./Chat.module.css";
import Message from "../Message/Message";

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      sender: "user",
      text: "Hi, can you explain definition of Integration in a simple way?",
    },
    {
      sender: "bot",
      text: `Integration is the opposite of differentiation. 
If differentiation breaks something into smaller parts (like finding rate of change), integration puts it back together — like finding total area, distance, or quantity.`,
    },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");
  };

  return (
    <div className={styles.wrapper}>
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
            placeholder='Ask about: "∫ f(x) dx = F(x) + C"'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.sendBtn}>
            ➤
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
