import React from "react";
import { ArrowRight } from "lucide-react";
import styles from "./StudyOptions.module.css";

const steps = [
  {
    number: 1,
    title: "Create Module",
    description:
      "Give your study module a clear name and choose a cover image so it’s easy to recognize later.",
  },
  {
    number: 2,
    title: "Upload Files",
    description:
      "Add PDFs, slides, notes, and images. Study Buddy will process them and prepare everything for you.",
  },
  {
    number: 3,
    title: "Start Learning",
    description:
      "Open the module to generate questions, summaries, and practice activities tailored to your content.",
  },
];

const StudyOptions = () => {
  return (
    <section className={styles.head}>
      <div className={styles.container}>
        <h2 className={styles.title}>Get started in 3 simple steps</h2>
        <p className={styles.subtitle}>
          Follow this flow to go from a blank dashboard to a fully-prepared
          study module that’s ready for practice.
        </p>
      </div>

      <div className={styles.flowchart}>
        {steps.map((step, index) => (
          <div key={step.number} className={styles.step}>
            <div className={styles.stepTop}>
              <div className={styles.stepNumber}>{step.number}</div>

              {index < steps.length - 1 && (
                <div className={styles.stepConnector}>
                  <span className={styles.connectorLine} />
                  <ArrowRight
                    size={18}
                    className={styles.connectorArrow}
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>

            <div className={styles.stepCard}>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StudyOptions;
