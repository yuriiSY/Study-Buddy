import React, { useState } from "react";
import styles from "./MCQTest.module.css";

const MCQTest = ({ questions = [], onSubmit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const currentQuestion = questions[currentIndex];

  const handleSelect = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit?.(answers);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.tag}>{currentQuestion.topic}</span>
          <span className={styles.tag}>{currentQuestion.difficulty}</span>
          <span className={styles.mode}>🧠 MCQ</span>
        </div>

        <h2 className={styles.question}>{currentQuestion.question}</h2>

        <div className={styles.options}>
          {currentQuestion.options.map((opt, idx) => (
            <label
              key={idx}
              className={`${styles.option} ${
                answers[currentQuestion.id] === opt ? styles.selected : ""
              }`}
            >
              <input
                type="radio"
                name={currentQuestion.id}
                value={opt}
                checked={answers[currentQuestion.id] === opt}
                onChange={() => handleSelect(currentQuestion.id, opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            onClick={handlePrevious}
            className={`${styles.button} ${styles.prev}`}
            disabled={currentIndex === 0}
          >
            Previous
          </button>

          {currentIndex === questions.length - 1 ? (
            <button className={styles.button} onClick={handleSubmit}>
              Submit
            </button>
          ) : (
            <button className={styles.button} onClick={handleNext}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCQTest;
