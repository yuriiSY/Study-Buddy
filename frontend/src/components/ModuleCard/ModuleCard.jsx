import styles from "./ModuleCard.module.css";
import { useNavigate } from "react-router-dom";
import { Archive, ArchiveRestore, Trash2, Settings, Play } from "lucide-react";
import api from "../../api/axios";

const ModuleCard = ({
  id,
  title,
  date,
  archived,
  onArchive,
  onDelete,
  onManage,
  coverImage,
  isOwner,
}) => {
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      await api.post("/streak/study", {
        date: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      console.error("Failed to track study activity", err);
    }

    navigate(`/modules/${id}`);
  };

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
    onManage(id, title, coverImage);
  };

  const handleLeave = async (e) => {
    e.stopPropagation();
    try {
      const res = await api.get(`/modules/${id}/leave`);
      alert(res.data.message);

      if (onDelete) onDelete(id);
    } catch (err) {
      console.error("Failed to leave module", err);
      alert(err.response?.data?.error || "Failed to leave module");
    }
  };

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
          <p className={styles.dateOnImage}>{date}</p>

          {/* Study Overlay on Hover */}
          <div className={styles.studyOverlay} onClick={handleClick}>
            <div className={styles.overlayContent}>
              <Play size={28} className={styles.overlayIcon} />
              <span className={styles.overlayText}>Continue Studying</span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Enhanced footer with title and actions */}
      <div className={styles.cardFooter}>
        <div className={styles.footerContent}>
          <div className={styles.titleSection}>
            <p className={styles.title}>{title}</p>
          </div>
          
          <div className={styles.actions}>
            {isOwner ? (
              <>
                {/* Owner buttons */}
                <button
                  className={`${styles.iconButton} ${styles.manageButton}`}
                  onClick={handleManage}
                  title="Manage"
                >
                  <Settings size={16} />
                </button>

                <button
                  className={`${styles.iconButton} ${styles.archiveButton}`}
                  onClick={handleArchive}
                  title={archived ? "Unarchive" : "Archive"}
                >
                  {archived ? (
                    <ArchiveRestore size={16} />
                  ) : (
                    <Archive size={16} />
                  )}
                </button>

                <button
                  className={`${styles.iconButton} ${styles.deleteButton}`}
                  onClick={handleDelete}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </>
            ) : (
              <>
                <span className={styles.collabLabel}>Collaborator</span>

                {/* Leave module button */}
                <button
                  className={`${styles.iconButton} ${styles.leaveButton}`}
                  onClick={handleLeave}
                  title="Leave Module"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;
