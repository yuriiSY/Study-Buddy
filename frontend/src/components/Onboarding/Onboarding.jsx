import React, { useState } from "react";
import styles from "./Onboarding.module.css";
import ModuleModal from "../../components/ModuleModal/ModuleModal";

const Onboarding = () => {
  const [showModal, setShowModal] = useState(false);

  const handleStart = (data) => {
    console.log("New module created:", data);
  };

  return (
    <div className={styles.container}>
      <div className={styles.icon}>📖</div>

      <h1 className={styles.title}>
        Welcome to Study Buddy! <span>👋</span>
      </h1>

      <p className={styles.subtitle}>
        Get started by creating your first study module. You can add notes,
        videos, slides, or text later to build your personalized learning space.
      </p>

      <div className={styles.card}>
        <h3>How to get started:</h3>
        <ul>
          <li>
            <span>1</span> Create a Study Module
          </li>
          <li>
            <span>2</span> Add notes, slides, or resources
          </li>
          <li>
            <span>3</span> Start Learning!
          </li>
        </ul>
      </div>

      <button
        className={styles.actionBtn}
        onClick={() => {
          console.log(showModal);
          setShowModal(true);
        }}
      >
        + Create Your First Module
      </button>

      {showModal && (
        <ModuleModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onStart={handleStart}
        />
      )}
    </div>
  );
};

export default Onboarding;
