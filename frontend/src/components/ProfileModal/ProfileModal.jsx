import { useState, useEffect } from "react";
import styles from "./ProfileModal.module.css";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, fetchProfile } from "../../store/auth/authSlice";

const specializations = [
  { value: "Math", label: "Math" },
  { value: "Physics", label: "Physics" },
  { value: "Chemistry", label: "Chemistry" },
  { value: "Biology", label: "Biology" },
  { value: "ComputerScience", label: "Computer Science" },
];

const ProfileModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const {
    user,
    token,
    loading: authLoading,
  } = useSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (token) {
        await dispatch(fetchProfile());
      }
      setLoading(false);
    };
    loadProfile();
  }, [dispatch, token]);

  useEffect(() => {
    if (user) {
      setName(user.username || user.name || "");
      setEmail(user.email || "");
      setSpecialization(user.specialization || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateProfile({ name, email, specialization }));
    await dispatch(fetchProfile());
    onClose();
  };

  if (loading || authLoading) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeIcon} onClick={onClose}>
          ✕
        </button>
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
          />

          <label htmlFor="specialization">Specialization</label>
          <select
            id="specialization"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            required
          >
            <option value="">Select specialization</option>
            {specializations.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancel}>
              Cancel
            </button>
            <button type="submit" className={styles.save}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
