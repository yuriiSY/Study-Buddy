import styles from "./ModuleCard.module.css";
import { useNavigate } from "react-router-dom";

const ModuleCard = ({ title, date, id }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/modules/${id}`);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardDate}>
        <p className={styles.date}>{date}</p>
      </div>
      <div className={styles.cardTitle}>
        <p className={styles.title}>{title}</p>
        <button className={styles.button} onClick={handleClick}>
          Keep learning
        </button>
      </div>
    </div>
  );
};

export default ModuleCard;
