import styles from "./LoadingAnimation.module.css";
import { Upload, Zap, Sparkles, CheckCircle } from "lucide-react";

const LoadingAnimation = ({ stage }) => {
  const stages = [
    { id: "uploading", icon: Upload, label: "Uploading files...", message: "Getting your files ready" },
    { id: "processing", icon: Zap, label: "Processing with AI...", message: "Teaching the AI about your content" },
    { id: "creating", icon: Sparkles, label: "Creating module...", message: "Putting it all together" },
    { id: "complete", icon: CheckCircle, label: "Done!", message: "Your module is ready!" },
  ];

  const currentStage = stages.find((s) => s.id === stage) || stages[0];
  const Icon = currentStage.icon;

  return (
    <div className={styles.container}>
      <div className={styles.animationWrapper}>
        <div className={styles.iconContainer}>
          <div className={styles.orbitContainer}>
            <div className={styles.orbit}></div>
            <div className={styles.orbit} style={{ animationDelay: "0.5s" }}></div>
            <div className={styles.orbit} style={{ animationDelay: "1s" }}></div>
          </div>
          <div className={styles.iconWrapper}>
            <Icon size={48} />
          </div>
        </div>

        <h3 className={styles.label}>{currentStage.label}</h3>
        <p className={styles.message}>{currentStage.message}</p>

        <div className={styles.stagesIndicator}>
          {stages.slice(0, 3).map((s, idx) => (
            <div
              key={s.id}
              className={`${styles.stageDot} ${
                stage === s.id ? styles.active : stages.indexOf(stages.find((st) => st.id === stage)) > idx ? styles.completed : ""
              }`}
            ></div>
          ))}
        </div>

        <div className={styles.loadingBar}>
          <div
            className={styles.progress}
            style={{
              width: stage === "uploading" ? "33%" : stage === "processing" ? "66%" : "100%",
            }}
          ></div>
        </div>

        <div className={styles.tips}>
          <p className={styles.tipText}>🍵 Grab a cup of tea, this might take a moment!</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
