// frontend/src/components/StudyCard/StudyCard.jsx
import React from "react";
import styles from "./StudyCard.module.css";

const StudyCard = ({ title, color, image }) => {
  return (
    <article className={styles.card} style={{ backgroundColor: color }}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.imageWrapper}>
        <img src={image} alt={title} className={styles.image} />
      </div>
    </article>
  );
};

export default StudyCard;
