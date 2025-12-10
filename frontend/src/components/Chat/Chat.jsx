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
  const [messageIdCounter, setMessageIdCounter] = useState(0);

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
          .flatMap((item, idx) => [
            { id: `history-user-${idx}`, sender: "user", text: item.question },
            { id: `history-bot-${idx}`, sender: "bot", text: item.answer },
          ]);

        setMessages(parsedMessages);
        setMessageIdCounter(parsedMessages.length);
      } catch (error) {
        console.error("Failed to load chat history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [externalId]);

  useEffect(() => {
    const scrollToBottom = () => {
      if (chatBoxRef.current) {
        setTimeout(() => {
          chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }, 0);
      }
    };
    
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessageText = input;
    const userId = `msg-user-${messageIdCounter}`;
    const botId = `msg-bot-${messageIdCounter + 1}`;
    
    const userMessage = { id: userId, sender: "user", text: userMessageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setMessageIdCounter((prev) => prev + 2);

    try {
      const res = await apiPY.post("/ask", {
        question: userMessageText,
        file_ids: [externalId],
      });

      const botMessage = {
        id: botId,
        sender: "bot",
        text: res.data?.answer || "No answer returned.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat request failed:", error);
      setMessages((prev) => [
        ...prev,
        { id: botId, sender: "bot", text: "⚠️ Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendPresetPrompt = async (displayText, prompt) => {
    const userId = `msg-user-${messageIdCounter}`;
    const botId = `msg-bot-${messageIdCounter + 1}`;
    
    const userMessage = { id: userId, sender: "user", text: displayText };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setMessageIdCounter((prev) => prev + 2);

    try {
      const res = await apiPY.post("/ask", {
        question: prompt,
        file_ids: [externalId],
      });

      const botMessage = {
        id: botId,
        sender: "bot",
        text: res.data?.answer || "No answer returned.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Preset prompt request failed:", error);
      setMessages((prev) => [
        ...prev,
        { id: botId, sender: "bot", text: "⚠️ Sorry, something went wrong." },
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
              {messages.map((msg) => (
                <div key={msg.id} className={styles.messageWrapper}>
                  {msg.sender === "bot" ? (
                    <div className={styles.messageContentWrapper}>
                      <Message sender={msg.sender} text={msg.text} />
                      <button
                        className={`${styles.copyIconBtn} ${copiedMessageIdx === msg.id ? styles.copied : ''}`}
                        onClick={() => handleCopyMessage(msg.text, msg.id)}
                        title={copiedMessageIdx === msg.id ? "Copied!" : "Copy"}
                      >
                        <Copy size={14} />
                        {copiedMessageIdx === msg.id && <span>Copied</span>}
                      </button>
                    </div>
                  ) : (
                    <Message sender={msg.sender} text={msg.text} />
                  )}

                  {msg.sender === "bot" && (
                    <button
                      className={`${styles.addToNotesBtn} ${addedNotes.has(msg.id) ? styles.addedToNotes : ''}`}
                      onClick={async () => {
                        if (!addedNotes.has(msg.id)) {
                          await onAddNote(msg.text);
                          setAddedNotes(prev => new Set(prev).add(msg.id));
                        }
                      }}
                      disabled={addedNotes.has(msg.id)}
                      title={addedNotes.has(msg.id) ? "Added to notes" : "Add this response to notes"}
                    >
                      {addedNotes.has(msg.id) ? (
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
              {loading && <div key="loading-indicator"><Message sender="bot" text="Thinking..." /></div>}
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
