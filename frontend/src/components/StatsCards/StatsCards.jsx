import { Clock, Target, Flame } from "lucide-react";
import styles from "./StatsCards.module.css";

const stats = [
  {
    id: 1,
    icon: <Clock size={32} color="#2563eb" />,
    value: 24,
    label: "Study Sessions",
    subtext: "Last 24 hours",
    color: "#e0ecff",
    accent: "#2563eb",
  },
  {
    id: 2,
    icon: <Target size={32} color="#16a34a" />,
    value: "89%",
    label: "Average Score",
    subtext: "Last 10 tests",
    color: "#e6f8ed",
    accent: "#16a34a",
  },
  {
    id: 3,
    icon: <Flame size={32} color="#ea580c" />,
    value: 7,
    label: "Day Streak",
    subtext: "Keep it up! 🔥",
    color: "#fff1e6",
    accent: "#ea580c",
  },
];

const StatsCards = () => {
  return (
    <div className={styles.container}>
      {stats.map((stat) => (
        <div
          key={stat.id}
          className={styles.card}
          style={{ backgroundColor: stat.color }}
        >
          <div className={styles.icon}>{stat.icon}</div>
          <h2 className={styles.value} style={{ color: stat.accent }}>
            {stat.value}
          </h2>
          <h3 className={styles.label}>{stat.label}</h3>
          <p className={styles.subtext}>{stat.subtext}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
