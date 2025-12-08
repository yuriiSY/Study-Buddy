import styles from "./ModuleCard.module.css";
import { useNavigate } from "react-router-dom";
import { Archive, ArchiveRestore, Trash2, Settings, Play } from "lucide-react";
import api from "../../api/axios";
import { useState, useEffect, useRef } from "react";

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowImage(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "50px" }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, []);

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

  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http") || image.startsWith("/")) {
      return image;
    }
    if (image.match(/^c\d+\.jpg$/)) {
      return `/${image}`;
    }
    return `/assets/${image}`;
  };

  return (
    <div className={styles.card}>
      {/* ✅ Image section with lazy loading */}
      <div
        ref={imageRef}
        className={`${styles.cardHeader} ${coverImage ? styles.withImage : ""} ${
          imageLoaded ? styles.imageLoaded : styles.imagePlaceholder
        }`}
        style={
          coverImage && showImage
            ? {
                backgroundImage: `url(${getImageUrl(coverImage)})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      >
        {coverImage && showImage && !imageLoaded && (
          <div className={styles.imageSkeleton}></div>
        )}
        <img
          src={coverImage && showImage ? getImageUrl(coverImage) : ""}
          alt="module-cover"
          style={{ display: "none" }}
          onLoad={() => setImageLoaded(true)}
        />
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
