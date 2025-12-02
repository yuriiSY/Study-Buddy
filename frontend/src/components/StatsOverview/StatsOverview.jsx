import React from "react";
import styles from "./StatsOverview.module.css";
import { TrendingUp, BookOpen, Clock, BarChart3 } from "lucide-react";

export const StatsOverview = () => {
  const stats = [
    {
      id: 1,
      label: "Overall Progress",
      value: "65%",
      icon: TrendingUp,
      color: "blue",
      sublabel: "+5% this week",
    },
    {
      id: 2,
      label: "Modules Completed",
      value: "4 / 6",
      icon: BookOpen,
      color: "cyan",
      sublabel: "67% done",
    },
    {
      id: 3,
      label: "Hours Studied",
      value: "52",
      icon: Clock,
      color: "amber",
      sublabel: "+8 this week",
    },
    {
      id: 4,
      label: "Average Test Score",
      value: "84%",
      icon: BarChart3,
      color: "green",
      sublabel: "Best: 92%",
    },
  ];

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
            <div key={stat.id} className={`${styles.statCard} ${getColorClass(stat.color)}`}>
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
