import React, { useState, useEffect, useRef } from "react";
import styles from "./PomodoroTimer.module.css";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";
import api from "../../api/axios";

const PomodoroTimer = () => {
  // ----------- USER SETTINGS -----------
  const [customStudy, setCustomStudy] = useState(20);
  const [customBreak, setCustomBreak] = useState(5);

  const STUDY_DURATION = customStudy * 60;
  const BREAK_DURATION = customBreak * 60;

  // ----------- TIMER STATE -----------
  const [timeLeft, setTimeLeft] = useState(STUDY_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [sessionId, setSessionId] = useState(null);

  const intervalRef = useRef(null);

  // ------------------------------
  // FETCH DAILY COMPLETED SESSIONS FROM BACKEND
  // ------------------------------
  const fetchDailySessions = async () => {
    try {
      const res = await api.get("/pomodoro/user/sessions");

      const today = new Date().toISOString().slice(0, 10);

      const completedToday = res.data.filter((session) => {
        if (!session.completed) return false;
        if (session.type !== "STUDY") return false;

        const endDate = session.endTime?.slice(0, 10);
        return endDate === today;
      }).length;

      setSessionsCompleted(completedToday);
    } catch (err) {
      console.error("Failed to load daily sessions:", err);
    }
  };

  // Load session count on mount
  useEffect(() => {
    fetchDailySessions();
  }, []);

  // ------------------------------
  // API ACTIONS
  // ------------------------------
  const startSession = async (durationSec, breakSec, type) => {
    try {
      const res = await api.post("/pomodoro/start", {
        durationSec,
        breakSec,
        type,
      });

      setSessionId(res.data.id);
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  };

  const completeSession = async () => {
    if (!sessionId) return;
    try {
      await api.post(`/pomodoro/complete/${sessionId}`);
    } catch (err) {
      console.error("Failed to complete session:", err);
    }
  };

  // ------------------------------
  // TIMER LOGIC
  // ------------------------------
  const handleStart = async () => {
    if (!sessionId) {
      await startSession(STUDY_DURATION, BREAK_DURATION, "STUDY");
    }
    setIsRunning(true);
  };

  const handleSessionTransition = async () => {
    setIsRunning(false);
    playAlarm();
    await completeSession();

    // update daily stats
    await fetchDailySessions();

    if (!isBreak) {
      setIsBreak(true);
      setTimeLeft(BREAK_DURATION);

      await startSession(BREAK_DURATION, 0, "BREAK");
    } else {
      setIsBreak(false);
      setTimeLeft(STUDY_DURATION);

      await startSession(STUDY_DURATION, BREAK_DURATION, "STUDY");
    }

    setIsRunning(true);
  };

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSessionTransition();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, isBreak, sessionId]);

  // ------------------------------
  // SOUND ALERT
  // ------------------------------
  const playAlarm = () => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  // ------------------------------
  // BUTTON ACTIONS
  // ------------------------------
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleTogglePause = () => setIsRunning(!isRunning);

  const handleReset = async () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(STUDY_DURATION);

    setSessionId(null);

    await startSession(STUDY_DURATION, BREAK_DURATION, "STUDY");

    await fetchDailySessions();
  };

  const handleTakeBreak = async () => {
    if (isBreak) return;

    setIsRunning(false);
    await completeSession();

    setIsBreak(true);
    setTimeLeft(BREAK_DURATION);

    await startSession(BREAK_DURATION, 0, "BREAK");

    await fetchDailySessions();

    setIsRunning(true);
  };

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <div className={styles.timerContainer}>
      <button
        className={styles.timerToggle}
        onClick={() => setIsExpanded(!isExpanded)}
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
            >
              ✕
            </button>
          </div>

          <div className={styles.timerContent}>
            <div
              className={`${styles.timerCircle} ${
                isBreak ? styles.breakMode : ""
              }`}
            >
              <div className={styles.timerDisplay}>{formatTime(timeLeft)}</div>
              <div className={styles.modeLabel}>
                {isBreak ? "Break Time ☕" : "Study Time 📚"}
              </div>
            </div>

            {/* Daily stats */}
            <div className={styles.stats}>
              <p>
                Today's sessions: <strong>{sessionsCompleted}</strong>
              </p>
            </div>

            {/* Settings */}
            <div className={styles.settingsBox}>
              <h4>Timer Settings</h4>

              <div className={styles.settingRow}>
                <label>Work (minutes)</label>
                <input
                  type="number"
                  min={1}
                  value={customStudy}
                  onChange={(e) => setCustomStudy(Number(e.target.value))}
                />
              </div>

              <div className={styles.settingRow}>
                <label>Break (minutes)</label>
                <input
                  type="number"
                  min={1}
                  value={customBreak}
                  onChange={(e) => setCustomBreak(Number(e.target.value))}
                />
              </div>

              <button
                className={styles.saveBtn}
                onClick={() => {
                  setIsRunning(false);
                  setIsBreak(false);
                  setTimeLeft(customStudy * 60);
                }}
              >
                Save Changes
              </button>
            </div>

            {/* Controls */}
            <div className={styles.controls}>
              <button
                className={`${styles.btn} ${styles.playPauseBtn}`}
                onClick={() => {
                  if (!isRunning && !sessionId) handleStart();
                  else handleTogglePause();
                }}
              >
                {!sessionId && !isRunning ? (
                  <>
                    <Play size={18} /> Start
                  </>
                ) : isRunning ? (
                  <>
                    <Pause size={18} /> Pause
                  </>
                ) : (
                  <>
                    <Play size={18} /> Resume
                  </>
                )}
              </button>

              <button
                className={`${styles.btn} ${styles.breakBtn}`}
                onClick={handleTakeBreak}
                disabled={isBreak}
              >
                Take Break
              </button>

              <button
                className={`${styles.btn} ${styles.resetBtn}`}
                onClick={handleReset}
              >
                <RotateCcw size={18} /> Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;
