import React from "react";
import styles from "./StudySection.module.css";

const StudySection = ({
  title,
  description,
  buttonText,
  image,
  reverse = false,
  bgColor = "#f5f7fb",
}) => {
  return (
    <section
      className={`${styles.section} ${reverse ? styles.reverse : ""}`}
      style={{ backgroundColor: bgColor }}
    >
      <div className={styles.imageWrapper}>
        <img src={image} alt={title} className={styles.image} />
      </div>

      <div className={styles.textContent}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
        <button className={styles.button}>{buttonText}</button>
      </div>
    </section>
  );
};

export default StudySection;
