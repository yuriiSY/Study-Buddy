import React, { useState, useEffect } from "react";
import Chat from "../Chat/Chat";
import styles from "./TutorTabs.module.css";
import api from "../../api/axios";

const TutorTabs = ({ externalId, userId, fileid }) => {
  const [activeTab, setActiveTab] = useState("tutor");
  const [notes, setNotes] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!externalId) return;

    const loadNotes = async () => {
      try {
        const res = await api.get("/notes", {
          params: { userId, fileId: fileid },
        });

        setNotes(res.data?.content || "");
      } catch (err) {
        console.error("Failed to load notes", err);
      }
    };

    loadNotes();
  }, [externalId, userId, fileid]);

  const handleSaveNotes = async () => {
    console.log("Saving notes for fileId:", fileid, "notes:", notes);
    try {
      await api.post("/notes", {
        userId,
        fileId: fileid,
        content: notes,
      });

      setEditing(false);
    } catch (err) {
      console.error("Failed to save notes", err);
    }
  };

  const handleAddNote = async (text) => {
    try {
      const res = await api.post("/notes/append", {
        userId,
        fileId: fileid,
        text,
      });

      setNotes(res.data.content);
      setActiveTab("notes");
    } catch (err) {
      console.error("Failed to append note", err);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "tutor" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("tutor")}
        >
          AI Tutor
        </button>

        <button
          className={`${styles.tab} ${
            activeTab === "notes" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("notes")}
        >
          Notes
        </button>
      </div>

      {/* AI Tutor Tab */}
      {activeTab === "tutor" && (
        <Chat externalId={externalId} onAddNote={handleAddNote} />
      )}

      {/* Notes Tab */}
      {activeTab === "notes" && (
        <div className={styles.notesPanel}>
          {!editing ? (
            <>
              <div className={styles.notesDisplay}>{notes}</div>
              <button
                className={styles.editBtn}
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
            </>
          ) : (
            <>
              <textarea
                className={styles.textArea}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <button className={styles.saveBtn} onClick={handleSaveNotes}>
                Save
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TutorTabs;
