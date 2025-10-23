import React from "react";
import styles from "./MaterialItem.module.css";

export default function MaterialItem({ material, onClick, isSelected }) {
  return (
    <div
      className={`${styles.item} ${isSelected ? styles.selected : ""}`}
      onClick={onClick}
    >
      <div className={styles.header}>
        <span className={styles.title}>{material.filename}</span>
      </div>
      <div className={styles.meta}>
        <span className={styles.badge}>File</span>
        <span className={styles.pages}>
          {new Date(material.uploadedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
