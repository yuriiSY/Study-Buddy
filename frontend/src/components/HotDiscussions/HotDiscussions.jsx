import React from "react";
import styles from "./HotDiscussions.module.css";

const discussions = [
  {
    votes: 89,
    title: "Memory Palace Technique for Complex Formulas",
    author: "Rumaysa Babulkhair",
    subject: "Mathematics",
    tags: ["Study Tips", "technique"],
  },
  {
    votes: 89,
    title: "Memory Palace Technique for Complex Formulas",
    author: "Anika Siddique",
    subject: "Mathematics",
    tags: ["Study Tips", "technique"],
  },
  {
    votes: 89,
    title: "Memory Palace Technique for Complex Formulas",
    author: "Anika Siddique",
    subject: "Mathematics",
    tags: ["Study Tips", "technique"],
  },
  {
    votes: 89,
    title: "Memory Palace Technique for Complex Formulas",
    author: "Anika Siddique",
    subject: "Mathematics",
    tags: ["Study Tips", "technique"],
  },
];

const HotDiscussions = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.icon}>🔥</span>
        <h2 className={styles.title}>Hot Discussions</h2>
      </div>
      <p className={styles.subtitle}>
        Trending study tips & community insights
      </p>

      {discussions.map((item, index) => (
        <div key={index} className={styles.card}>
          <div className={styles.votes}>
            <span className={styles.thumb}>👍</span>
            <p className={styles.voteText}>{item.votes} votes</p>
          </div>

          <div className={styles.details}>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.meta}>
              {item.author} | {item.subject}
            </p>

            <div className={styles.tags}>
              {item.tags.map((tag, i) => (
                <span
                  key={i}
                  className={`${styles.tag} ${
                    tag === "Study Tips" ? styles.blueTag : styles.grayTag
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}

      <button className={styles.joinBtn}>👥 Join Community Discussions</button>
    </div>
  );
};

export default HotDiscussions;
