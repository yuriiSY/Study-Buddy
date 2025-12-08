import React from "react";
import styles from "./Onboarding.module.css";
import { Plus, Upload, Zap } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Create Module",
    description: "Give your study module a name and choose a cover image.",
    icon: Plus,
  },
  {
    number: 2,
    title: "Upload Files",
    description: "Add your notes, slides, and resources for the module.",
    icon: Upload,
  },
  {
    number: 3,
    title: "Start Learning",
    description: "Organize and study your materials with Study Buddy.",
    icon: Zap,
  },
];

const Onboarding = ({ onClick }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Get started in 3 simple steps</h1>
        <p className={styles.subtitle}>
          Follow this flow to go from an empty dashboard to a fully prepared
          study module that’s ready for practice.
        </p>
      </div>

      <div className={styles.stepsWrapper}>
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className={styles.step}>
              <div className={styles.stepTop}>
                <div className={styles.stepNumber}>{step.number}</div>
                {index < steps.length - 1 && (
                  <div className={styles.connector}>
                    <span className={styles.connectorLine} />
                  </div>
                )}
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepHeader}>
                  <div className={styles.iconBubble}>
                    <Icon size={20} />
                  </div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                </div>
                <p className={styles.stepText}>{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <button className={styles.actionBtn} onClick={onClick}>
        <Plus size={20} />
        Create Your First Module
      </button>
    </div>
  );
};

export default Onboarding;
