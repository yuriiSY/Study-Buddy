import styles from "./ModuleCard.module.css";
import { useNavigate } from "react-router-dom";
import { Archive, ArchiveRestore, Trash2, Settings, Play } from "lucide-react";

const ModuleCard = ({
  id,
  title,
  date,
  archived,
  onArchive,
  onDelete,
  onManage,
  coverImage,
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

  console.log(coverImage);

  return (
    <div className={styles.card}>
      {/* ✅ Image section */}
      <div
        className={`${styles.cardHeader} ${coverImage ? styles.withImage : ""}`}
        style={
          coverImage
            ? {
                backgroundImage: `url(${coverImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      >
        <div className={styles.headerOverlay}>
          <div className={styles.cardHeaderTop}>
            <p className={styles.date}>{date}</p>
            <div className={styles.actions}>
              <button
                className={`${styles.iconButton} ${styles.deleteButton}`}
                onClick={handleDelete}
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
              <button
                className={`${styles.iconButton} ${styles.archiveButton}`}
                onClick={handleArchive}
                title={archived ? "Unarchive" : "Archive"}
              >
                {archived ? (
                  <ArchiveRestore size={18} />
                ) : (
                  <Archive size={18} />
                )}
              </button>
              <button
                className={`${styles.iconButton} ${styles.manageButton}`}
                onClick={handleManage}
                title="Manage"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>

          {/* <p className={styles.title}>{title}</p> */}

          {/* ✅ Floating play button on image */}
          <button className={styles.playButton} onClick={handleClick}>
            <Play size={32} />
          </button>
        </div>
      </div>

      {/* ✅ White footer */}
      <div className={styles.cardFooter}>
        {" "}
        <p className={styles.title}>{title}</p>
      </div>
    </div>
  );
};

export default ModuleCard;
