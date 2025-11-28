import React from "react";
import styles from "./TopDiscussions.module.css";
import { MessageCircle, TrendingUp } from "lucide-react";

export const TopDiscussions = () => {
  const discussions = [
    {
      id: 1,
      title: "How to approach integration by parts problems?",
      replies: 12,
      module: "Calculus I",
      views: 234,
    },
    {
      id: 2,
      title: "Best study techniques for memorizing historical dates",
      replies: 8,
      module: "World History",
      views: 187,
    },
    {
      id: 3,
      title: "Understanding classical conditioning vs operant",
      replies: 15,
      module: "Psychology",
      views: 342,
    },
    {
      id: 4,
      title: "Tips for Biology lab report structure",
      replies: 6,
      module: "Biology 101",
      views: 156,
    },
    {
      id: 5,
      title: "Common mistakes in derivatives calculations",
      replies: 19,
      module: "Calculus I",
      views: 428,
    },
  ];

  return (
    <div className={styles.discussionsContainer}>
      <div className={styles.header}>
        <TrendingUp size={20} />
        <h3>Top Discussions</h3>
      </div>

      <div className={styles.discussionsList}>
        {discussions.map((discussion) => (
          <div key={discussion.id} className={styles.discussionItem}>
            <div className={styles.discussionContent}>
              <h4>{discussion.title}</h4>
              <div className={styles.meta}>
                <span className={styles.module}>{discussion.module}</span>
                <span className={styles.separator}>•</span>
                <span className={styles.stats}>{discussion.views} views</span>
              </div>
            </div>
            <div className={styles.replies}>
              <MessageCircle size={16} />
              <span>{discussion.replies}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopDiscussions;
