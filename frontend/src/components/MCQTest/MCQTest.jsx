import React, { useState } from "react";
import styles from "./MCQTest.module.css";

const MCQTest = ({ questions = [], onSubmit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];

  const handleSelect = (questionIndex, option) => {
    const letter = option.trim().charAt(0);
    setAnswers((prev) => ({ ...prev, [questionIndex]: letter }));
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
    let tempScore = 0;

    questions.forEach((q, index) => {
      console.log("Question:", q);
      const userLetter = answers[index] || "";
      const correctLetter = (q.correctAnswer || "").trim();
      console.log("Comparing:", userLetter);
      console.log("Comparing:", correctLetter);
      if (userLetter === correctLetter) {
        tempScore++;
      }
    });

    setScore(tempScore);
    setShowResult(true);

    onSubmit?.(answers);
  };

  if (showResult) {
    return (
      <div className={styles.resultContainer}>
        <h2>Your Score</h2>
        <p className={styles.score}>
          {score} / {questions.length}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.mode}>🧠 MCQ</span>
        </div>

        <h2 className={styles.question}>{currentQuestion.question}</h2>

        <div className={styles.options}>
          {currentQuestion.options.map((opt, idx) => {
            const letter = opt.trim().charAt(0);

            return (
              <label
                key={idx}
                className={`${styles.option} ${
                  answers[currentIndex] === letter ? styles.selected : ""
                }`}
              >
                <input
                  type="radio"
                  name={`q-${currentIndex}`}
                  value={opt}
                  checked={answers[currentIndex] === letter}
                  onChange={() => handleSelect(currentIndex, opt)}
                />
                <span>{opt}</span>
              </label>
            );
          })}
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
