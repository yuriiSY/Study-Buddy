import styles from "./FeatureHeader.module.css";
import createStudySpaceImg from "../../assets/create_study_space.png";
import { Link } from "react-router-dom";

const FeatureHeader = () => {
  return (
    <div className={styles.featureHeader}>
      <Link to="/" className={styles.backLink}>
        ← Back to Dashboard
      </Link>
      <div className={styles.titleSection}>
        <div className={styles.icon}>
          <img src={createStudySpaceImg} />
        </div>
        <h1>Create New Study Space</h1>
      </div>
    </div>
  );
};

export default FeatureHeader;
