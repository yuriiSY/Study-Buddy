import { useEffect, useState } from "react";
import styles from "./ManageModuleModal.module.css";
import api from "../../api/axios";

const ManageModuleModal = ({
  isOpen,
  onClose,
  moduleId,
  moduleTitle,
  onUpdate,
}) => {
  const [title, setTitle] = useState(moduleTitle || "");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [collaborators, setCollaborators] = useState([]);

  useEffect(() => {
    if (moduleId && isOpen) {
      fetchCollaborators();
    }
  }, [moduleId, isOpen]);

  const fetchCollaborators = async () => {
    try {
      const res = await api.get(`/files/modules/${moduleId}/collaborators`);
      setCollaborators(res.data.collaborators || []);
    } catch (err) {
      console.error("Failed to fetch collaborators:", err);
    }
  };

  const handleUpdateTitle = async () => {
    try {
      const res = await api.put(`/files/modules/${moduleId}/title`, { title });
      onUpdate(res.data.module);
      onClose();
    } catch (err) {
      console.error("Failed to update title:", err);
    }
  };

  const handleAddCollaborator = async () => {
    try {
      await api.post(`/files/modules/${moduleId}/collaborators`, {
        collaboratorEmail: email,
        role,
      });
      setEmail("");
      fetchCollaborators();
    } catch (err) {
      console.error("Failed to add collaborator:", err);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    try {
      await api.delete(
        `/files/modules/${moduleId}/collaborators/${collaboratorId}`
      );
      fetchCollaborators();
    } catch (err) {
      console.error("Failed to remove collaborator:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeIcon} onClick={onClose}>
          &times;
        </button>

        <h2>Manage Module</h2>

        <div className={styles.section}>
          <h4>Update Module Title</h4>
          <div className={styles.formRow}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New title"
            />
            <button className={styles.button} onClick={handleUpdateTitle}>
              Save
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <h4>Add Collaborator</h4>
          <div className={styles.formRow}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Collaborator email"
            />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <button className={styles.button} onClick={handleAddCollaborator}>
              Add
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <h4>Current Collaborators</h4>
          {collaborators.length === 0 ? (
            <p>No collaborators yet</p>
          ) : (
            <ul>
              {collaborators.map((c) => (
                <li key={c.user.id}>
                  <span>{c.user.name || c.user.email}</span>
                  <span className={styles.role}>{c.role}</span>
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemoveCollaborator(c.user.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageModuleModal;
