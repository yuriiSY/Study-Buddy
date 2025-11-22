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
    onArchive && onArchive(id, archived);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete && onDelete(id);
  };

  const handleManage = (e) => {
    e.stopPropagation();
    onManage && onManage(id, title);
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
      {/* Image / header section */}
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
              {isOwner ? (
                <>
                  {/* Owner: archive, settings, delete */}
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
                    title="Settings"
                  >
                    <Settings size={18} />
                  </button>

                  <button
                    className={`${styles.iconButton} ${styles.deleteButton}`}
                    onClick={handleDelete}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              ) : (
                <>
                  {/* Collaborator: only a 'leave module' button, no label */}
                  <button
                    className={`${styles.iconButton} ${styles.leaveButton}`}
                    onClick={handleLeave}
                    title="Leave module"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Floating play button on the image */}
          <button
            className={styles.playButton}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <Play size={32} />
          </button>
        </div>
      </div>

      {/* White footer with title */}
      <div className={styles.cardFooter}>
        <p className={styles.title}>{title}</p>
      </div>
    </div>
  );
};

export default ModuleCard;
