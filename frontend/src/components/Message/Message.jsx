import React from "react";
import Markdown from "../../lib/Markdown";

export default function Message({ sender, text }) {
  const isUser = sender === "user";
  return (
    <div style={{ textAlign: isUser ? "right" : "left", margin: "8px 0" }}>
      <div
        style={{
          display: "inline-block",
          padding: "8px 12px",
          borderRadius: 12,
          background: isUser ? "#eef6ff" : "#f6f6f6",
          maxWidth: 720,
          whiteSpace: "pre-wrap",
        }}
      >
        <Markdown>{text}</Markdown>
      </div>
    </div>
  );
}