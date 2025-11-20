import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import styles from "./StreakTracker.module.css";
import WeeklyPieChart from "../WeeklyPieChart/WeeklyPieChart";

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StreakTracker() {
  const [weekData, setWeekData] = useState([]);
  const [streak, setStreak] = useState(0);
  const [forgivenessUsed, setForgivenessUsed] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);

    const token = localStorage.getItem("token");

    const week = await api.get(`/streak/week`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const streakRes = await api.get(`/streak/streak`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setWeekData(week.data.weekData);
    setForgivenessUsed(week.data.forgivenessUsed);
    setStreak(streakRes.data.streak);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleForgive = async () => {
    const missed = weekData.find((d) => !d.studied);
    if (!missed) {
      alert("No missed days to forgive.");
      return;
    }

    const token = localStorage.getItem("token");

    await api.post(
      `/streak/forgive`,
      { date: missed.date },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    await loadData();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.imageContainer}>
        <WeeklyPieChart weekData={weekData} />
      </div>
      <div className={styles.trackerBox}>
        <div className={styles.weekRow}>
          {weekData.map((day, idx) => (
            <div key={idx} className={styles.dayColumn}>
              <span className={styles.dayLabel}>{dayLabels[idx]}</span>
              <div
                className={`${styles.circle} ${
                  day.studied ? styles.circleActive : ""
                }`}
              />
            </div>
          ))}
        </div>

        <p className={styles.description}>
          You have the option to mark a class as missed if you won’t be studying
          that day. It will help you keep track of your progress.
        </p>

        <button
          className={`${styles.button} ${
            forgivenessUsed ? styles.buttonDisabled : ""
          }`}
          disabled={forgivenessUsed}
          onClick={handleForgive}
        >
          Do not count the missed class.
        </button>
      </div>
      <div className={styles.streakBox}>
        <h1 className={styles.streakNumber}>{streak}</h1>
        <p className={styles.streakLabel}>days in a row</p>
      </div>
    </div>
  );
}
