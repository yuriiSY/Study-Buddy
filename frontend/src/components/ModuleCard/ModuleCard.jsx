import styles from "./ModuleCard.module.css";
import { useNavigate } from "react-router-dom";
import { Archive, ArchiveRestore, Trash2, Settings } from "lucide-react";

const ModuleCard = ({
  id,
  title,
  date,
  archived,
  onArchive,
  onDelete,
  onManage,
}) => {
  const navigate = useNavigate();

  const handleClick = () => navigate(`/modules/${id}`);
  const handleArchive = (e) => {
    e.stopPropagation();
    onArchive(id, archived);
  };
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(id);
  };
  const handleManage = (e) => {
    e.stopPropagation();
    onManage(id, title);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <p className={styles.date}>{date}</p>
        <div className={styles.actions}>
          <button
            className={`${styles.iconButton}`}
            onClick={handleManage}
            title="Manage"
          >
            <Settings size={18} />
          </button>
          <button
            className={`${styles.iconButton} ${styles.archiveButton}`}
            onClick={handleArchive}
            title={archived ? "Unarchive" : "Archive"}
          >
            {archived ? <ArchiveRestore size={18} /> : <Archive size={18} />}
          </button>
          <button
            className={`${styles.iconButton} ${styles.deleteButton}`}
            onClick={handleDelete}
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className={styles.cardBody}>
        <p className={styles.title}>{title}</p>
        <button className={styles.learnButton} onClick={handleClick}>
          Keep learning
        </button>
      </div>
    </div>
  );
};

export default ModuleCard;
