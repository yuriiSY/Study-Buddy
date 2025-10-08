import styles from './ModuleCard.module.css';

 const ModuleCard = () => {
  return (
    <div className={styles.card}>
        <div className={styles.cardDate}>
            <p className={styles.date}>20/08/2001</p>
        </div>
        <div className={styles.cardTitle}>
            <p className={styles.title}>Mathematics</p>
            <button className={styles.button}>Keep learning</button>
        </div>
    </div>
  );
}

export default ModuleCard;