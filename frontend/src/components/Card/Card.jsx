import styles from "./Card.module.css";
import { Link } from "react-router-dom";

const Card = ({ title, description, imageUrl, linkUrl }) => {
  return (
    <div className={styles.card}>
      <Link to={linkUrl} className={styles.cardLink}>
        <div className={styles.cardTitle}>
        {imageUrl && (
          <img src={imageUrl} alt={description || "card image"} />
        )}
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.description}>
          <p className={styles.text}>{description}</p>
        </div>
      </Link>
    </div>
  );
};

export default Card;
