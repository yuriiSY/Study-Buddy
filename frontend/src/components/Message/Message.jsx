import React from "react";
import styles from "./Message.module.css";

const Message = ({ sender, text }) => {
  const isUser = sender === "user";
  return (
    <div
      className={`${styles.message} ${isUser ? styles.userMsg : styles.botMsg}`}
    >
      <div className={styles.avatar}>{isUser ? "👤" : "🤖"}</div>
      <div className={styles.text}>{text}</div>
    </div>
  );
};

export default Message;
