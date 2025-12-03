import React from "react";
import styles from "./NotesDisplay.module.css";

const NotesDisplay = ({ content, isEditable = false, onCheckboxChange = null }) => {
  const handleCheckboxChange = (index, checked) => {
    if (!isEditable || !onCheckboxChange) return;

    const lines = content.split("\n");
    const checkboxRegex = /^- \[([ x])\]/;

    let currentCheckboxIndex = 0;
    const updatedLines = lines.map((line) => {
      const match = line.match(checkboxRegex);
      if (match) {
        if (currentCheckboxIndex === index) {
          currentCheckboxIndex++;
          return line.replace(checkboxRegex, `- [${checked ? "x" : " "}]`);
        }
        currentCheckboxIndex++;
      }
      return line;
    });

    onCheckboxChange(updatedLines.join("\n"));
  };

  const renderContent = () => {
    if (!content) return null;

    const lines = content.split("\n");
    let checkboxIndex = 0;
    const result = [];

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];

      if (line.startsWith("# ")) {
        result.push(
          <h1 key={idx} className={styles.heading1}>
            {renderInlineMarkdown(line.substring(2))}
          </h1>
        );
      } else if (line.startsWith("#### ")) {
        result.push(
          <h4 key={idx} className={styles.heading4}>
            {renderInlineMarkdown(line.substring(5))}
          </h4>
        );
      } else if (line.startsWith("### ")) {
        result.push(
          <h3 key={idx} className={styles.heading3}>
            {renderInlineMarkdown(line.substring(4))}
          </h3>
        );
      } else if (line.startsWith("## ")) {
        result.push(
          <h2 key={idx} className={styles.heading2}>
            {renderInlineMarkdown(line.substring(3))}
          </h2>
        );
      } else if (line.match(/^- \[([ x])\]/)) {
        const isChecked = line.includes("[x]");
        const text = line.replace(/^- \[([ x])\] /, "");
        const currentIdx = checkboxIndex;
        checkboxIndex++;

        result.push(
          <label key={idx} className={styles.checkbox}>
            <input
              type="checkbox"
              checked={isChecked}
              disabled={!isEditable}
              onChange={(e) => handleCheckboxChange(currentIdx, e.target.checked)}
              className={styles.checkboxInput}
            />
            <span className={isChecked ? styles.checkedText : ""}>
              {renderInlineMarkdown(text)}
            </span>
          </label>
        );
      } else if (line.trim() === "") {
        result.push(<div key={idx} className={styles.spacer} />);
      } else {
        result.push(
          <p key={idx} className={styles.paragraph}>
            {renderInlineMarkdown(line)}
          </p>
        );
      }
    }

    return result;
  };

  const renderInlineMarkdown = (text) => {
    const parts = [];

    const patterns = [
      { regex: /<highlight>(.+?)<\/highlight>/g, type: "highlight", isContainer: true },
      { regex: /<u>(.+?)<\/u>/g, type: "underline", isContainer: true },
      { regex: /<small>(.+?)<\/small>/g, type: "small", isContainer: true },
      { regex: /<large>(.+?)<\/large>/g, type: "large", isContainer: true },
      { regex: /\*\*(.+?)\*\*/g, type: "bold" },
      { regex: /__(.+?)__/g, type: "italic" },
    ];

    const matches = [];
    patterns.forEach((pattern) => {
      let m;
      const regexCopy = new RegExp(pattern.regex.source, pattern.regex.flags);
      while ((m = regexCopy.exec(text)) !== null) {
        matches.push({
          index: m.index,
          length: m[0].length,
          type: pattern.type,
          content: m[1],
          isContainer: pattern.isContainer,
        });
      }
    });

    if (matches.length === 0) {
      return text;
    }

    matches.sort((a, b) => a.index - b.index);

    const filteredMatches = [];
    matches.forEach((match) => {
      const isNested = filteredMatches.some((existing) => {
        return (
          existing.isContainer &&
          match.index >= existing.index &&
          match.index + match.length <= existing.index + existing.length
        );
      });
      if (!isNested) {
        filteredMatches.push(match);
      }
    });

    let pos = 0;
    filteredMatches.forEach((match) => {
      if (match.index > pos) {
        parts.push(text.substring(pos, match.index));
      }

      switch (match.type) {
        case "highlight":
          parts.push(
            <mark key={parts.length} className={styles.highlight}>
              {renderInlineMarkdown(match.content)}
            </mark>
          );
          break;
        case "underline":
          parts.push(
            <u key={parts.length} className={styles.underline}>
              {renderInlineMarkdown(match.content)}
            </u>
          );
          break;
        case "bold":
          parts.push(
            <strong key={parts.length} className={styles.bold}>
              {match.content}
            </strong>
          );
          break;
        case "italic":
          parts.push(
            <em key={parts.length} className={styles.italic}>
              {match.content}
            </em>
          );
          break;
        case "small":
          parts.push(
            <small key={parts.length} className={styles.smallText}>
              {renderInlineMarkdown(match.content)}
            </small>
          );
          break;
        case "large":
          parts.push(
            <span key={parts.length} className={styles.largeText}>
              {renderInlineMarkdown(match.content)}
            </span>
          );
          break;
        default:
          break;
      }

      pos = match.index + match.length;
    });

    if (pos < text.length) {
      parts.push(text.substring(pos));
    }

    return parts;
  };

  return <div className={styles.notesDisplay}>{renderContent()}</div>;
};

export default NotesDisplay;
