import React, { useRef, useState, useEffect } from "react";
import styles from "./NotesEditor.module.css";
import NotesDisplay from "../NotesDisplay/NotesDisplay";
import { Highlighter, Underline, CheckSquare2, Eye, EyeOff } from "lucide-react";

const NotesEditor = ({ notes, setNotes, onSave, isSaving }) => {
  const textAreaRef = useRef(null);
  const scrollPosRef = useRef(0);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    const textarea = textAreaRef.current;
    if (textarea && scrollPosRef.current > 0) {
      textarea.scrollTop = scrollPosRef.current;
    }
  }, [notes]);

  const handleTextChange = (e) => {
    scrollPosRef.current = textAreaRef.current.scrollTop;
    setNotes(e.target.value);
  };

  const insertMarkdown = (before, after = "") => {
    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notes.substring(start, end) || "text";
    const newText =
      notes.substring(0, start) +
      before +
      selectedText +
      after +
      notes.substring(end);
    scrollPosRef.current = textarea.scrollTop;
    setNotes(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const applyHighlight = () => insertMarkdown("<highlight>", "</highlight>");
  const applyUnderline = () => insertMarkdown("<u>", "</u>");

  const addCheckbox = () => {
    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    
    let insertText = "\n- [ ] ";
    if (start === 0 || notes[start - 1] === "\n") {
      insertText = "- [ ] ";
    }
    
    insertMarkdown(insertText, "");
  };

  return (
    <div className={styles.editorContainer}>
      <div className={styles.toolbar}>
        <div className={styles.toolGroup}>
          <button
            className={styles.toolBtn}
            onClick={applyHighlight}
            title="Highlight"
            aria-label="Highlight text"
          >
            <Highlighter size={18} />
          </button>
          <button
            className={styles.toolBtn}
            onClick={applyUnderline}
            title="Underline"
            aria-label="Underline text"
          >
            <Underline size={18} />
          </button>

          <div className={styles.separator} />

          <button
            className={styles.toolBtn}
            onClick={addCheckbox}
            title="Add checkbox (for todo)"
            aria-label="Add todo checkbox"
          >
            <CheckSquare2 size={18} />
          </button>
        </div>

        <div className={styles.spacer} />

        <button
          className={`${styles.toolBtn} ${styles.previewToggle}`}
          onClick={() => setShowPreview(!showPreview)}
          title={showPreview ? "Hide preview" : "Show preview"}
          aria-label="Toggle preview"
        >
          {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        <button
          className={styles.saveBtn}
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className={styles.editorWrapper}>
        <div className={`${styles.editorPane} ${showPreview ? styles.halfWidth : styles.fullWidth}`}>
          <div className={styles.paneLabel}>Edit</div>
          <textarea
            ref={textAreaRef}
            className={styles.editor}
            value={notes}
            onChange={handleTextChange}
            placeholder="Write your notes here... Use the toolbar above to format text."
            spellCheck="true"
          />
        </div>

        {showPreview && (
          <div className={styles.previewPane}>
            <div className={styles.paneLabel}>Preview</div>
            <div className={styles.preview}>
              <NotesDisplay content={notes} isEditable={true} onCheckboxChange={setNotes} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesEditor;
