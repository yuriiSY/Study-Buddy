import React, { useState, useEffect } from "react";
import styles from "./FocusHeader.module.css";
import { ArrowLeft, Pause, Play, RotateCcw } from "lucide-react";

const FocusHeader = ({ sessionName = "Session 1" }) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const toggleTimer = () => setIsRunning((prev) => !prev);
  const resetTimer = () => setTime(0);

  const formatTime = (s) => {
    const min = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  return (
    <div className={styles.header}>
      {/* <div className={styles.left}>
        <button className={styles.backBtn}>
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </button>
      </div> */}

      <div className={styles.center}>
        <span className={styles.timer}>{formatTime(time)}</span>
        <button className={styles.iconBtn} onClick={toggleTimer}>
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button className={styles.iconBtn} onClick={resetTimer}>
          <RotateCcw size={18} />
        </button>
      </div>

      {/* <div className={styles.right}>
        <span className={styles.focusEmoji}>📚</span>
        <div className={styles.focusText}>
          <strong>Focus Time</strong>
          <small>{sessionName}</small>
        </div>
      </div> */}
    </div>
  );
};

export default FocusHeader;
