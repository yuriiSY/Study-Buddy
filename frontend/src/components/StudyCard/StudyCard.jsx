import React from "react";
import styles from "./StudyCard.module.css";

const StudyCard = ({ title, color, image, text }) => {
  return (
    <div className={styles.card} style={{ backgroundColor: color }}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.content}>
        <img src={image} alt={title} className={styles.image} />
        {text && <p className={styles.text}>{text}</p>}
      </div>
    </div>
  );
};

export default StudyCard;
