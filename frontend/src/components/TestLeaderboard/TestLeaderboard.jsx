import { useEffect, useState } from "react";
import styles from "./TestLeaderboard.module.css";
import api from "../../api/axios";

function TestLeaderboard({ testId, moduleId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/test/leaderboard", {
          params: { testId, moduleId },
        });

        setLeaderboard(response.data);
      } catch (err) {
        console.error("Failed to load leaderboard", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [testId, moduleId]);

  if (loading) return <p className={styles.loading}>Loading leaderboard…</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Leaderboard</h2>

      {leaderboard.length === 0 && (
        <p className={styles.empty}>No results yet.</p>
      )}

      <div className={styles.list}>
        {leaderboard.map((row, index) => (
          <div key={row.id} className={styles.item}>
            <div className={styles.rank}>{index + 1}</div>

            <div className={styles.userInfo}>
              <p className={styles.name}>{row.user?.name || "Unknown User"}</p>
              <p className={styles.score}>Score: {row.score}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestLeaderboard;
