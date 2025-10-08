import styles from "./Card.module.css";

const Card = ({ title, description, imageUrl, linkUrl }) => {
  return (
    <div className={styles.card}>
      <a href={linkUrl} className={styles.cardLink}>
        <div className={styles.cardTitle}>
          <img src={imageUrl} alt={description} />
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.description}>
          <p className={styles.text}>{description}</p>
        </div>
      </a>
    </div>
  );
};

export default Card;
