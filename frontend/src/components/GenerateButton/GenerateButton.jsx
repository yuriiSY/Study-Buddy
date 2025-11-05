import React from "react";
import styles from "./GenerateButton.module.css";

export default function GenerateButton({ onClick }) {
  return (
    <button className={styles.button} onClick={onClick}>
      ⚙️ Generate AI Study Plan
    </button>
  );
}
