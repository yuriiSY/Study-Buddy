import { useState } from "react";
import styles from "./Onboarding.module.css";
import { Plus, Upload, Zap } from "lucide-react";

const Onboarding = ({ onClick }) => {
  const [activeStep, setActiveStep] = useState(-1);

  const steps = [
    {
      number: 1,
      title: "Create Module",
      description: "Give your study module a name",
      icon: Plus,
    },
    {
      number: 2,
      title: "Upload Files",
      description: "Add your notes, slides, and resources",
      icon: Upload,
    },
    {
      number: 3,
      title: "Start Learning",
      description: "Organize and study your materials",
      icon: Zap,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.stepsWrapper}>
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={index}
              className={`${styles.stepCard} ${
                activeStep === index ? styles.active : ""
              }`}
              onClick={() => setActiveStep(index)}
            >
              <div className={styles.stepNumber}>{step.number}</div>
              <div className={styles.stepContent}>
                <Icon size={24} className={styles.stepIcon} />
                <h3>{step.title}</h3>
                <p>{step.description}</p>
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
