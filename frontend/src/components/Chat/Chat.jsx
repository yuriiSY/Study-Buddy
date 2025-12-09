import React, { useState, useEffect, useRef } from "react";
import styles from "./Chat.module.css";
import Message from "../Message/Message";
import apiPY from "../../api/axiosPython";
import { Send, BookMarked, Lightbulb, FileText, Brain, Target, Check, Copy } from "lucide-react";

const Chat = ({ 
  externalId, 
  onAddNote,
  onGenerateFlashcards,
  onGenerateQuiz,
  testsExist,
  flashcardsExist
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [addedNotes, setAddedNotes] = useState(new Set());
  const [copiedMessageIdx, setCopiedMessageIdx] = useState(null);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (!externalId) return;

    setIsLoadingHistory(true);
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
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [externalId]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

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

  const sendPresetPrompt = async (displayText, prompt) => {
    const userMessage = { sender: "user", text: displayText };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await apiPY.post("/ask", {
        question: prompt,
        file_ids: [externalId],
      });

      const botMessage = {
        sender: "bot",
        text: res.data?.answer || "No answer returned.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Preset prompt request failed:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (text, idx) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageIdx(idx);
      setTimeout(() => setCopiedMessageIdx(null), 2000);
    }).catch((err) => {
      console.error("Failed to copy:", err);
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.chatContainer}>
        {/* <h2 className={styles.title}>AI Tutor</h2> */}

        <div className={styles.chatBox} ref={chatBoxRef}>
          {isLoadingHistory ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSkeleton}>
                <div className={styles.skeletonLine}></div>
                <div className={styles.skeletonLine} style={{ width: "90%" }}></div>
              </div>
              <div className={styles.loadingSkeleton} style={{ marginTop: "16px", alignSelf: "flex-end" }}>
                <div className={styles.skeletonLine}></div>
                <div className={styles.skeletonLine} style={{ width: "70%" }}></div>
              </div>
              <div className={styles.loadingSkeleton} style={{ marginTop: "16px" }}>
                <div className={styles.skeletonLine}></div>
                <div className={styles.skeletonLine} style={{ width: "85%" }}></div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyContent}>
                <Lightbulb size={48} />
                <h3>No conversation yet</h3>
                <p>Start by asking a question about your notes or the document.</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className={styles.messageWrapper}>
                  {msg.sender === "bot" ? (
                    <div className={styles.messageContentWrapper}>
                      <Message sender={msg.sender} text={msg.text} />
                      <button
                        className={`${styles.copyIconBtn} ${copiedMessageIdx === idx ? styles.copied : ''}`}
                        onClick={() => handleCopyMessage(msg.text, idx)}
                        title={copiedMessageIdx === idx ? "Copied!" : "Copy"}
                      >
                        <Copy size={14} />
                        {copiedMessageIdx === idx && <span>Copied</span>}
                      </button>
                    </div>
                  ) : (
                    <Message sender={msg.sender} text={msg.text} />
                  )}

                  {msg.sender === "bot" && (
                    <button
                      className={`${styles.addToNotesBtn} ${addedNotes.has(idx) ? styles.addedToNotes : ''}`}
                      onClick={async () => {
                        if (!addedNotes.has(idx)) {
                          await onAddNote(msg.text);
                          setAddedNotes(prev => new Set(prev).add(idx));
                        }
                      }}
                      disabled={addedNotes.has(idx)}
                      title={addedNotes.has(idx) ? "Added to notes" : "Add this response to notes"}
                    >
                      {addedNotes.has(idx) ? (
                        <>
                          <Check size={14} />
                          Added to Notes
                        </>
                      ) : (
                        <>
                          <BookMarked size={14} />
                          Add to Notes
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
              {loading && <Message sender="bot" text="Thinking..." />}
            </>
          )}
        </div>

        <form onSubmit={sendMessage} className={styles.inputArea}>
          <input
            type="text"
            placeholder="Ask a question about your notes..."
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
            <Send size={18} />
          </button>
        </form>

        <div className={styles.actionButtons}>
          <button
            className={styles.actionBtn}
            onClick={() => sendPresetPrompt("Summarise", "Summarise the document")}
            disabled={!externalId || loading}
            title={!externalId ? "Select a file first" : "Generate summary"}
          >
            <FileText size={16} />
            Summarise
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => sendPresetPrompt("Generate Analogy", "generate analogy for this document in a very simple and easy way to understand")}
            disabled={!externalId || loading}
            title={!externalId ? "Select a file first" : "Generate analogy"}
          >
            <Brain size={16} />
            Generate Analogy
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => sendPresetPrompt("Detect Knowledge Gap", "Analyze these study notes and identify their biggest knowledge gaps. For each gap, generate additional notes that provide the missing depth, context, and practical applications needed for true mastery.")}
            disabled={!externalId || loading}
            title={!externalId ? "Select a file first" : "Detect knowledge gaps"}
          >
            <Target size={16} />
            Detect Knowledge Gap
          </button>
          {!flashcardsExist && (
            <button
              className={styles.actionBtn}
              onClick={() => onGenerateFlashcards()}
              disabled={!externalId}
              title={!externalId ? "Select a file first" : "Generate recap cards"}
            >
              <BookMarked size={16} />
              Generate Recap Cards
            </button>
          )}
          {!testsExist && (
            <button
              className={styles.actionBtn}
              onClick={() => onGenerateQuiz()}
              disabled={!externalId}
              title={!externalId ? "Select a file first" : "Generate quiz"}
            >
              <Lightbulb size={16} />
              Generate Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
