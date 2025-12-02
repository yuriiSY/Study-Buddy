import React, { useState, useEffect, useRef } from "react";
import styles from "./PomodoroTimer.module.css";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [isBreak, setIsBreak] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef(null);
  const audioRef = useRef(new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj=="));

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          playAlarm();
          
          if (!isBreak) {
            setSessionsCompleted((s) => s + 1);
            setIsBreak(true);
            setTimeLeft(5 * 60);
            setIsRunning(true);
          } else {
            setIsBreak(false);
            setTimeLeft(20 * 60);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, isBreak]);

  const playAlarm = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTogglePause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(20 * 60);
  };

  const handleTakeBreak = () => {
    setIsRunning(false);
    setIsBreak(true);
    setTimeLeft(5 * 60);
    setIsRunning(true);
  };

  return (
    <div className={styles.timerContainer}>
      <button
        className={styles.timerToggle}
        onClick={() => setIsExpanded(!isExpanded)}
        title="Pomodoro Timer"
      >
        <Clock size={20} />
        <span className={styles.timeDisplay}>{formatTime(timeLeft)}</span>
      </button>

      {isExpanded && (
        <div className={styles.timerPanel}>
          <div className={styles.timerHeader}>
            <h3>Pomodoro Timer</h3>
            <button
              className={styles.closeBtn}
              onClick={() => setIsExpanded(false)}
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className={styles.timerContent}>
            <div className={`${styles.timerCircle} ${isBreak ? styles.breakMode : ""}`}>
              <div className={styles.timerDisplay}>{formatTime(timeLeft)}</div>
              <div className={styles.modeLabel}>
                {isBreak ? "Break Time ☕" : "Study Time 📚"}
              </div>
            </div>

            <div className={styles.stats}>
              <p>Sessions completed: <strong>{sessionsCompleted}</strong></p>
            </div>

            <div className={styles.controls}>
              <button
                className={`${styles.btn} ${styles.playPauseBtn}`}
                onClick={handleTogglePause}
                title={isRunning ? "Pause" : "Play"}
              >
                {isRunning ? <Pause size={18} /> : <Play size={18} />}
                {isRunning ? "Pause" : "Resume"}
              </button>

              <button
                className={`${styles.btn} ${styles.breakBtn}`}
                onClick={handleTakeBreak}
                disabled={isBreak}
                title="Start break now"
              >
                Take Break
              </button>

              <button
                className={`${styles.btn} ${styles.resetBtn}`}
                onClick={handleReset}
                title="Reset timer"
              >
                <RotateCcw size={18} />
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;
