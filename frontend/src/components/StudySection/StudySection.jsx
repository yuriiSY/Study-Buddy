// src/components/StudySection/StudySection.jsx
import React from "react";
import styles from "./StudySection.module.css";
import { useNavigate } from "react-router-dom";

const StudySection = ({
  title,
  description,
  buttonText,
  image,
  reverse = false,
}) => {
  const navigate = useNavigate();
  const goToAuth = () => navigate("/login");

  return (
    <section
      className={`${styles.section} ${reverse ? styles.reverse : ""}`}
    >
      <div className={styles.imageWrapper}>
        <img src={image} alt={title} className={styles.image} />
      </div>

      <div className={styles.textContent}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
        <button className={styles.button} onClick={goToAuth}>
          {buttonText}
        </button>
      </div>
    </section>
  );
};

export default StudySection;
