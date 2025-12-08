import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import styles from "./StatsOverview.module.css";
import { TrendingUp, BookOpen, Clock, BarChart3 } from "lucide-react";

export const StatsOverview = ({ refresh }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get("/dashboard");
        console.log("Dashboard stats response:", 2);

        const data = res.data;

        setStats([
          {
            id: 1,
            label: "Overall Progress",
            value: `${data.overallProgress}%`,
            icon: TrendingUp,
            color: "blue",
            sublabel: "",
          },
          {
            id: 2,
            label: "Modules Completed",
            value: `${data.totalCompleted} / ${data.totalModules}`,
            icon: BookOpen,
            color: "cyan",
            sublabel: `${(
              (data.totalCompleted / data.totalModules) *
              100
            ).toFixed(0)}% done`,
          },
          {
            id: 3,
            label: "Days in a Row",
            value: data.totalDaysInRow,
            icon: Clock,
            color: "amber",
            sublabel: `${
              data.totalDaysInRow > 1 ? "🔥 Keep going!" : "Start strong!"
            }`,
          },
          {
            id: 4,
            label: "Average Test Score",
            value: `${data.averageTestScore}%`,
            icon: BarChart3,
            color: "green",
            sublabel: "",
          },
        ]);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [refresh]);

  if (loading) return <div>Loading stats...</div>;
  if (!stats) return <div>Failed to load stats.</div>;

  const getColorClass = (color) => {
    const colorMap = {
      blue: styles.colorBlue,
      cyan: styles.colorCyan,
      amber: styles.colorAmber,
      green: styles.colorGreen,
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className={styles.statsOverview}>
      <div className={styles.statsGrid}>
        {stats.map((stat) => {
          const IconComponent = stat.icon;

          return (
            <div
              key={stat.id}
              className={`${styles.statCard} ${getColorClass(stat.color)}`}
            >
              <div className={styles.iconWrapper}>
                <IconComponent size={24} />
              </div>
              <div className={styles.content}>
                <p className={styles.label}>{stat.label}</p>
                <h3 className={styles.value}>{stat.value}</h3>
                <p className={styles.sublabel}>{stat.sublabel}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsOverview;
