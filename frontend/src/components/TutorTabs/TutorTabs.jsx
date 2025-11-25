import React, { useState } from "react";
import Chat from "../Chat/Chat";
import styles from "./TutorTabs.module.css";

const TutorTabs = ({ externalId }) => {
  const [activeTab, setActiveTab] = useState("tutor");
  const [notes, setNotes] = useState("Your notes here...");
  const [editing, setEditing] = useState(false);

  const addToNotes = (text) => {
    setNotes((prev) => prev + "\n\n" + text);
    setActiveTab("notes"); // optional: switch automatically
  };

  return (
    <div className={styles.wrapper}>
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

      {activeTab === "tutor" && (
        <Chat externalId={externalId} onAddNote={addToNotes} />
      )}

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
              <button
                className={styles.saveBtn}
                onClick={() => setEditing(false)}
              >
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
