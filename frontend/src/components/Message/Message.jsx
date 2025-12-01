import React from "react";
import ReactMarkdown from "react-markdown";
import styles from "./Message.module.css";
import { User, Bot } from "lucide-react";

const Message = ({ sender, text }) => {
  const isUser = sender === "user";
  return (
    <div
      className={`${styles.message} ${isUser ? styles.userMsg : styles.botMsg}`}
    >
      <div className={styles.avatar}>
        {isUser ? <User size={20} /> : <Bot size={20} />}
      </div>
      <div className={styles.text}>
        {isUser ? (
          text
        ) : (
          <ReactMarkdown
            components={{
              p: (props) => <p {...props} />,
              strong: (props) => <strong {...props} />,
              em: (props) => <em {...props} />,
              code: ({inline, ...props}) => 
                inline ? (
                  <code className={styles.inlineCode} {...props} />
                ) : (
                  <pre className={styles.codeBlock}><code {...props} /></pre>
                ),
              ul: (props) => <ul className={styles.list} {...props} />,
              ol: (props) => <ol className={styles.list} {...props} />,
              li: (props) => <li {...props} />,
              h1: (props) => <h2 {...props} />,
              h2: (props) => <h3 {...props} />,
              h3: (props) => <h4 {...props} />,
              blockquote: (props) => <blockquote className={styles.blockquote} {...props} />,
            }}
          >
            {text}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default Message;
