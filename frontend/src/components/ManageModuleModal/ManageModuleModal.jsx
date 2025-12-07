import { useEffect, useState } from "react";
import styles from "./ManageModuleModal.module.css";
import api from "../../api/axios";
import { X, Users, Share2, FileText, Image } from "lucide-react";
import { toast } from "react-toastify";

const imageOptions = Array.from({ length: 10 }, (_, i) => `c${i + 1}.jpg`);
const coverImages = imageOptions;

const ManageModuleModal = ({
  isOpen,
  onClose,
  moduleId,
  moduleTitle,
  onUpdate,
  onRefresh,
  onStatsRefresh,
  moduleCoverImage,
}) => {
  const [title, setTitle] = useState(moduleTitle || "");
  const [isCompleted, setIsCompleted] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [collaborators, setCollaborators] = useState([]);
  const [selectedCoverImage, setSelectedCoverImage] = useState(
    moduleCoverImage || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (moduleId && isOpen) {
      fetchCollaborators();
      fetchCompletionStatus();
    }
  }, [moduleId, isOpen]);

  const fetchCollaborators = async () => {
    try {
      const res = await api.get(`modules/${moduleId}/collaborators`);
      setCollaborators(res.data || []);
    } catch (err) {
      console.error("Failed to load collaborators:", err);
    }
  };

  const fetchCompletionStatus = async () => {
    try {
      const res = await api.get(`files/modules/${moduleId}/iscompleted`);
      setIsCompleted(res.data.completed || false);
    } catch (err) {
      console.error("Failed to load completion status:", err);
    }
  };

  const handleToggleCompletion = async () => {
    try {
      const newState = !isCompleted;
      setIsCompleted(newState);

      await api.put(`files/modules/${moduleId}/iscompleted`, {
        completed: newState,
      });

      toast.success(
        newState
          ? "✅ Module marked as completed"
          : "⏳ Module marked as in progress"
      );

      if (onStatsRefresh) onStatsRefresh();
    } catch (err) {
      console.error("Failed to update completion status:", err);
      setIsCompleted(!isCompleted);
      toast.error("❌ Failed to update completion status");
    }
  };

  const handleUpdateTitle = async () => {
    if (!title.trim()) {
      setError("Module title cannot be empty");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.put(`files/modules/${moduleId}/title`, {
        moduleName: title.trim(),
      });

      toast.success("✅ Module title updated");
      if (onUpdate) onUpdate(res.data);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to update module title:", err);
      setError("Failed to update module title");
      toast.error("❌ Failed to update module title");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!email.trim()) {
      setError("Email cannot be empty");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post(`modules/${moduleId}/collaborators`, {
        email: email.trim(),
        role,
      });

      toast.success("✅ Collaborator added");
      setCollaborators((prev) => [...prev, res.data]);
      setEmail("");
      setRole("editor");
    } catch (err) {
      console.error("Failed to add collaborator:", err);
      setError(
        err.response?.data?.error || "Failed to add collaborator (check email)"
      );
      toast.error("❌ Failed to add collaborator");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collabId) => {
    setLoading(true);
    setError("");

    try {
      await api.delete(`modules/${moduleId}/collaborators/${collabId}`);
      toast.success("✅ Collaborator removed");
      setCollaborators((prev) => prev.filter((c) => c.id !== collabId));
    } catch (err) {
      console.error("Failed to remove collaborator:", err);
      setError("Failed to remove collaborator");
      toast.error("❌ Failed to remove collaborator");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCoverImage = async () => {
    if (!selectedCoverImage) {
      setError("Please select a cover image first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.put(`files/modules/${moduleId}/cover-image`, {
        moduleCoverImage: selectedCoverImage,
      });

      toast.success("✅ Cover image updated");
      if (onUpdate) onUpdate(res.data);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to update cover image:", err);
      setError(err.response?.data?.error || "Failed to update cover image");
      toast.error("❌ Failed to update cover image");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <FileText size={24} className={styles.icon} />
            <div>
              <h2>Manage Module</h2>
              <p>Manage title, cover image, completion status & collaborators</p>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FileText size={20} className={styles.sectionIcon} />
              <h3>Module Title</h3>
            </div>

            <div className={styles.formGroup}>
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.input}
                disabled={loading}
              />
            </div>

            <div className={styles.actionsRow}>
              <button
                className={styles.primaryBtn}
                onClick={handleUpdateTitle}
                disabled={loading || !title.trim()}
              >
                {loading ? "Saving..." : "Save Title"}
              </button>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Image size={20} className={styles.sectionIcon} />
              <h3>Module Cover Image</h3>
            </div>

            <div className={styles.imagePickerSection}>
              <div className={styles.imageGrid}>
                {coverImages.map((img, idx) => (
                  <div
                    key={img || idx}
                    onClick={() => setSelectedCoverImage(img)}
                    className={
                      selectedCoverImage === img
                        ? styles.imageSelected
                        : undefined
                    }
                  >
                    {img && (
                      <img
                        src={img}
                        alt={`cover-${idx + 1}`}
                        loading="lazy"
                      />
                    )}
                  </div>
                ))}
              </div>

              <button
                className={styles.primaryBtn}
                onClick={handleUpdateCoverImage}
                disabled={loading || !selectedCoverImage}
              >
                {loading ? "Saving..." : "Update Cover Image"}
              </button>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Completion Status</h3>
            </div>

            <label className={styles.switchRow}>
              <span>Mark as Completed</span>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={handleToggleCompletion}
                  disabled={loading}
                />
                <span className={styles.slider} />
              </label>
            </label>
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Share2 size={20} className={styles.sectionIcon} />
              <h3>Add Collaborator</h3>
            </div>

            <div className={styles.formGroup}>
              <label>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={styles.select}
                disabled={loading}
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div className={styles.actionsRow}>
              <button
                className={styles.primaryBtn}
                onClick={handleAddCollaborator}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Collaborator"}
              </button>
            </div>

            {collaborators.length > 0 && (
              <div className={styles.collaboratorsSection}>
                <div className={styles.sectionHeader}>
                  <Users size={20} className={styles.sectionIcon} />
                  <h3>Current Collaborators</h3>
                </div>

                <div className={styles.collaboratorsList}>
                  {collaborators.map((collab) => (
                    <div key={collab.id} className={styles.collaboratorItem}>
                      <div>
                        <p>{collab.email}</p>
                        <span className={styles.roleTag}>{collab.role}</span>
                      </div>
                      <button
                        className={styles.iconButton}
                        onClick={() => handleRemoveCollaborator(collab.id)}
                        disabled={loading}
                        title="Remove collaborator"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageModuleModal;
