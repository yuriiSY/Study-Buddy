import { useEffect, useState } from "react";
import styles from "./ManageModuleModal.module.css";
import api from "../../api/axios";
import { X, Users, Share2, FileText } from "lucide-react";

const ManageModuleModal = ({
  isOpen,
  onClose,
  moduleId,
  moduleTitle,
  onUpdate,
  onRefresh,
  onStatsRefresh,
}) => {
  const [title, setTitle] = useState(moduleTitle || "");
  const [isCompleted, setIsCompleted] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [collaborators, setCollaborators] = useState([]);
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
      const res = await api.get(`/files/modules/${moduleId}/collaborators`);
      setCollaborators(res.data.collaborators || []);
    } catch (err) {
      console.error("Failed to fetch collaborators:", err);
      setError("Failed to load collaborators");
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

      if (newState) {
        await api.post(`files/modules/${moduleId}/complete`);
      } else {
        await api.delete(`files/modules/${moduleId}/complete`);
      }

      if (onRefresh) {
        onRefresh();
      }

      if (onStatsRefresh) {
        onStatsRefresh();
      }
    } catch (err) {
      console.error("Failed to update completion:", err);
    }
  };

  const handleUpdateTitle = async () => {
    if (!title.trim()) {
      setError("Title cannot be empty");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await api.put(`/files/modules/${moduleId}/title`, { title });
      onUpdate(res.data.module);
      onClose();
    } catch (err) {
      console.error("Failed to update title:", err);
      setError(err.response?.data?.error || "Failed to update title");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!email.trim()) {
      setError("Email cannot be empty");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await api.post(`/files/modules/${moduleId}/collaborators`, {
        collaboratorEmail: email,
        role,
      });
      setEmail("");
      fetchCollaborators();
    } catch (err) {
      console.error("Failed to add collaborator:", err);
      setError(err.response?.data?.error || "Failed to add collaborator");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    try {
      setLoading(true);
      setError("");
      await api.delete(
        `/files/modules/${moduleId}/collaborators/${collaboratorId}`
      );
      fetchCollaborators();
    } catch (err) {
      console.error("Failed to remove collaborator:", err);
      setError("Failed to remove collaborator");
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
            <h2 className={styles.title}>Module Settings</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Close">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <p>{error}</p>
          </div>
        )}

        <div className={styles.sectionContainer}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FileText size={20} className={styles.sectionIcon} />
              <h3>Module Title</h3>
            </div>
            <div className={styles.formRow}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter module title"
                className={styles.input}
                disabled={loading}
              />
              <button
                className={styles.primaryBtn}
                onClick={handleUpdateTitle}
                disabled={loading}
              >
                {loading ? "Saving..." : "Update"}
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
                />
                <span className={styles.slider}></span>
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
              <div className={styles.formRow}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter collaborator email"
                  className={styles.input}
                  disabled={loading}
                />
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
              <button
                className={styles.primaryBtn}
                onClick={handleAddCollaborator}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Collaborator"}
              </button>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Users size={20} className={styles.sectionIcon} />
              <h3>Collaborators ({collaborators.length})</h3>
            </div>
            {collaborators.length === 0 ? (
              <div className={styles.emptyState}>
                <Users size={32} className={styles.emptyIcon} />
                <p>No collaborators yet</p>
              </div>
            ) : (
              <div className={styles.collaboratorsList}>
                {collaborators.map((c) => (
                  <div key={c.user.id} className={styles.collaboratorItem}>
                    <div className={styles.collaboratorInfo}>
                      <p className={styles.collaboratorName}>
                        {c.user.name || c.user.email}
                      </p>
                      <span className={`${styles.badge} ${styles[c.role]}`}>
                        {c.role}
                      </span>
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemoveCollaborator(c.user.id)}
                      disabled={loading}
                      title="Remove collaborator"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageModuleModal;
